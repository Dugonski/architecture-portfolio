import { CameraControls, useProgress } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box3, MathUtils, Plane, Vector3, type PerspectiveCamera } from 'three';
import { useI18n } from '../../i18n/context';
import type { ProjectModel } from '../../types';
import type { SplitModel } from './splitByZones';
import type { DisplayMode, SectionAxis, ViewPreset } from './types';
import { ViewerPanel } from './ViewerPanel';
import { ZonedModel } from './ZonedModel';
import './viewer.css';

interface ModelViewerProps {
  model: ProjectModel;
  /** Area of the whole project in m², shown when nothing is selected. */
  projectArea: number;
}

const PERSPECTIVE = { azimuth: 0.55, polar: 0.95 };
const TOP = { azimuth: 0, polar: 0.0001 };
const AXIS_NORMALS: Record<Exclude<SectionAxis, 'none'>, Vector3> = {
  x: new Vector3(-1, 0, 0),
  y: new Vector3(0, -1, 0),
  z: new Vector3(0, 0, -1),
};

/**
 * Frames a box while keeping (or setting) the viewing angle.
 * camera-controls' own fitToBox snaps the rotation to the nearest axis.
 *
 * @param leftInset Fraction of the canvas width covered by the side panel;
 *                  the framed box is shifted to stay centered in the free area.
 */
function fitBox(
  controls: CameraControls,
  box: Box3,
  options: { angles?: { azimuth: number; polar: number } | null; leftInset?: number; animate: boolean },
) {
  const { angles, leftInset = 0, animate } = options;
  const center = box.getCenter(new Vector3());
  const radius = box.getSize(new Vector3()).length() / 2;
  const free = 1 - leftInset;
  // Sphere fits are loose; tighten them a little and widen for the side panel.
  const distance = (controls.getDistanceToFitSphere(radius) * 0.72) / Math.max(free, 0.5);

  const camera = controls.camera as PerspectiveCamera;
  const visibleWidth = 2 * distance * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  const offsetX = -(leftInset / 2) * visibleWidth;

  return Promise.all([
    angles ? controls.rotateTo(angles.azimuth, angles.polar, animate) : Promise.resolve(),
    controls.moveTo(center.x, center.y, center.z, animate),
    controls.dollyTo(distance, animate),
    controls.setFocalOffset(offsetX, 0, 0, animate),
  ]);
}

/** Applies the section plane to the whole renderer. */
function SectionPlane({ plane }: { plane: Plane | null }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    gl.clippingPlanes = plane ? [plane] : [];
    return () => {
      gl.clippingPlanes = [];
    };
  }, [gl, plane]);
  return null;
}

function LoadingOverlay() {
  const { t } = useI18n();
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="viewer-loading" role="status">
      <span className="viewer-loading__bar" style={{ transform: `scaleX(${progress / 100})` }} />
      <span>
        {t('viewer.loading')} · {Math.round(progress)}%
      </span>
    </div>
  );
}

export default function ModelViewer({ model, projectArea }: ModelViewerProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<CameraControls>(null);

  const [split, setSplit] = useState<SplitModel | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode, setMode] = useState<DisplayMode>('highlight');
  const [showWalls, setShowWalls] = useState(true);
  const [sectionAxis, setSectionAxis] = useState<SectionAxis>('none');
  const [sectionRatio, setSectionRatio] = useState(0.45);

  const clipPlane = useMemo(() => {
    if (sectionAxis === 'none' || !split) return null;
    const { min, max } = split.bounds;
    const position = min[sectionAxis] + (max[sectionAxis] - min[sectionAxis]) * sectionRatio;
    return new Plane(AXIS_NORMALS[sectionAxis].clone(), position);
  }, [sectionAxis, sectionRatio, split]);

  const targetBox = useCallback(
    (zoneId: string | null): Box3 | null => {
      if (!split) return null;
      return (zoneId && split.zoneBounds.get(zoneId)) || split.bounds;
    },
    [split],
  );

  /** Share of the canvas hidden behind the side panel (0 when it floats closed on mobile). */
  const panelInset = useCallback(() => {
    const container = containerRef.current;
    const panel = container?.querySelector<HTMLElement>('.viewer-panel');
    if (!container || !panel || panel.offsetParent === null) return 0;
    return (panel.offsetLeft + panel.offsetWidth) / container.clientWidth;
  }, []);

  const frame = useCallback(
    async (preset: ViewPreset, zoneId: string | null) => {
      const controls = controlsRef.current;
      const box = targetBox(zoneId);
      if (!controls || !box) return;
      const angles = preset === 'top' ? TOP : preset === 'perspective' ? PERSPECTIVE : null;
      await fitBox(controls, box, { angles, leftInset: panelInset(), animate: true });
    },
    [targetBox, panelInset],
  );

  const handleReady = useCallback(
    (model: SplitModel) => {
      setSplit(model);
      const controls = controlsRef.current;
      if (controls)
        void fitBox(controls, model.bounds, { angles: PERSPECTIVE, leftInset: panelInset(), animate: false });
    },
    [panelInset],
  );

  const select = useCallback(
    (zoneId: string | null) => {
      setSelected(zoneId);
      void frame('fit', zoneId);
    },
    [frame],
  );

  // Keyboard shortcut: Escape returns to the whole project.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selected) select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select, selected]);

  const toggleFullscreen = () => {
    const element = containerRef.current;
    if (!element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void element.requestFullscreen?.();
  };

  return (
    <div className="viewer" ref={containerRef} data-hovering={hovered ? '' : undefined}>
      <Canvas
        className="viewer__canvas"
        dpr={[1, 2]}
        camera={{ fov: 40, near: 0.05, far: 200, position: [8, 7, 9] }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#efede6']} />
        <hemisphereLight args={['#ffffff', '#b9b1a5', 1.25]} />
        <directionalLight position={[6, 10, 7]} intensity={1.9} />
        <directionalLight position={[-8, 6, -4]} intensity={0.6} />
        <SectionPlane plane={clipPlane} />
        <Suspense fallback={null}>
          <ZonedModel
            url={model.url}
            zones={model.zones}
            selected={selected}
            hovered={hovered}
            mode={mode}
            showWalls={showWalls}
            clipPlane={clipPlane}
            onHover={setHovered}
            onSelect={select}
            onReady={handleReady}
          />
        </Suspense>
        <CameraControls
          ref={controlsRef}
          makeDefault
          minDistance={0.5}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2 - 0.02}
          dollyToCursor
          smoothTime={0.35}
        />
      </Canvas>

      <LoadingOverlay />

      <ViewerPanel
        zones={model.zones}
        zoneBounds={split?.zoneBounds}
        bounds={split?.bounds}
        projectArea={projectArea}
        selected={selected}
        hovered={hovered}
        mode={mode}
        showWalls={showWalls}
        sectionAxis={sectionAxis}
        sectionRatio={sectionRatio}
        onSelect={select}
        onHover={setHovered}
        onModeChange={setMode}
        onShowWallsChange={setShowWalls}
        onSectionAxisChange={setSectionAxis}
        onSectionRatioChange={setSectionRatio}
        onView={(preset) => void frame(preset, selected)}
        onFullscreen={toggleFullscreen}
      />

      {!selected && <p className="viewer__hint">{t('viewer.hint')}</p>}
    </div>
  );
}
