import { Edges, useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { BackSide, Color, Material, MeshBasicMaterial, MeshStandardMaterial, type Plane } from 'three';
import type { ModelZone } from '../../types';
import { splitByZones, type ModelPart, type SplitModel } from './splitByZones';
import type { DisplayMode } from './types';

interface ZonedModelProps {
  url: string;
  zones: ModelZone[];
  selected: string | null;
  hovered: string | null;
  mode: DisplayMode;
  showWalls: boolean;
  clipPlane: Plane | null;
  onHover: (zoneId: string | null) => void;
  onSelect: (zoneId: string) => void;
  onReady: (model: SplitModel) => void;
}

type PartState = 'normal' | 'hover' | 'ghost' | 'ghostHover' | 'hidden';

/** Helper meshes that must never intercept pointer events. */
const noRaycast = () => null;

const HOVER_TINT = new Color('#c2672f');

const ghostMaterial = new MeshBasicMaterial({
  color: '#8f969c',
  transparent: true,
  opacity: 0.08,
  depthWrite: false,
});

const ghostHoverMaterial = new MeshBasicMaterial({
  color: '#c2672f',
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
});

/**
 * Back faces exposed by a section cut are drawn dark, which reads as the
 * solid fill (poché) of an architectural section.
 */
const pocheMaterial = new MeshBasicMaterial({ color: '#2b2a28', side: BackSide });

/** Mostly-opaque surfaces are made solid so they sort and read correctly. */
function normalizeMaterial(material: Material) {
  if (material.transparent && material.opacity >= 0.75) {
    material.transparent = false;
    material.opacity = 1;
    material.needsUpdate = true;
  }
}

function createHoverMaterial(material: Material): Material {
  const hover = material.clone();
  if (hover instanceof MeshStandardMaterial) {
    hover.emissive = HOVER_TINT;
    hover.emissiveIntensity = 0.35;
  } else if ('color' in hover && hover.color instanceof Color) {
    hover.color.lerp(HOVER_TINT, 0.35);
  }
  return hover;
}

function partState(
  part: ModelPart,
  { selected, hovered, mode, showWalls }: Pick<ZonedModelProps, 'selected' | 'hovered' | 'mode' | 'showWalls'>,
): PartState {
  const isolating = selected !== null && mode === 'isolate';

  if (part.group === 'shell') {
    if (!showWalls || isolating) return 'hidden';
    return selected ? 'ghost' : 'normal';
  }
  if (part.group === 'floor') return isolating ? 'ghost' : 'normal';

  const isHovered = hovered === part.zoneId;
  if (selected && selected !== part.zoneId) {
    if (isolating) return 'hidden';
    return isHovered ? 'ghostHover' : 'ghost';
  }
  return isHovered && selected !== part.zoneId ? 'hover' : 'normal';
}

export function ZonedModel(props: ZonedModelProps) {
  const { url, zones, clipPlane, onHover, onSelect, onReady } = props;
  const gltf = useGLTF(url);

  const model = useMemo(() => {
    gltf.scene.traverse((object) => {
      const material = (object as { material?: Material | Material[] }).material;
      if (material) (Array.isArray(material) ? material : [material]).forEach(normalizeMaterial);
    });
    return splitByZones(gltf.scene, zones);
  }, [gltf, zones]);

  const hoverMaterials = useMemo(() => {
    const map = new Map<Material, Material>();
    for (const part of model.parts) {
      if (part.zoneId && !map.has(part.material)) map.set(part.material, createHoverMaterial(part.material));
    }
    return map;
  }, [model]);

  useEffect(() => onReady(model), [model, onReady]);

  useEffect(
    () => () => {
      hoverMaterials.forEach((material) => material.dispose());
      model.parts.forEach((part) => part.geometry.dispose());
    },
    [model, hoverMaterials],
  );

  /** Ignores hits on geometry that the section plane has cut away. */
  const isVisibleHit = (event: ThreeEvent<PointerEvent | MouseEvent>) =>
    !clipPlane || clipPlane.distanceToPoint(event.point) >= 0;

  return (
    <group>
      {model.parts.map((part) => {
        const state = partState(part, props);
        if (state === 'hidden') return null;

        const material =
          state === 'ghost'
            ? ghostMaterial
            : state === 'ghostHover'
              ? ghostHoverMaterial
              : state === 'hover'
                ? (hoverMaterials.get(part.material) ?? part.material)
                : part.material;

        const zoneId = part.zoneId;
        const interactive = zoneId !== null;

        const solid = state === 'normal' || state === 'hover';

        return (
          <group key={part.key}>
            {clipPlane && solid && <mesh geometry={part.geometry} material={pocheMaterial} raycast={noRaycast} />}
            <mesh
              geometry={part.geometry}
              material={material}
              renderOrder={state.startsWith('ghost') ? 1 : 0}
              onPointerMove={
                interactive
                  ? (event) => {
                      if (!isVisibleHit(event)) return;
                      event.stopPropagation();
                      onHover(zoneId);
                    }
                  : undefined
              }
              onPointerOut={interactive ? () => onHover(null) : undefined}
              onClick={
                interactive
                  ? (event) => {
                      if (!isVisibleHit(event)) return;
                      event.stopPropagation();
                      onSelect(zoneId);
                    }
                  : undefined
              }
            >
              {zoneId !== null && zoneId === props.selected && <Edges threshold={25} color="#b5532a" />}
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
