import { useState } from 'react';
import { Vector3, type Box3 } from 'three';
import { useI18n } from '../../i18n/context';
import type { ModelZone } from '../../types';
import type { DisplayMode, SectionAxis, ViewPreset } from './types';

interface ViewerPanelProps {
  zones: ModelZone[];
  zoneBounds?: Map<string, Box3>;
  bounds?: Box3;
  projectArea?: number;
  projectTitle: string;
  selected: string | null;
  hovered: string | null;
  mode: DisplayMode;
  showWalls: boolean;
  sectionAxis: SectionAxis;
  sectionRatio: number;
  onSelect: (zoneId: string | null) => void;
  onHover: (zoneId: string | null) => void;
  onModeChange: (mode: DisplayMode) => void;
  onShowWallsChange: (show: boolean) => void;
  onSectionAxisChange: (axis: SectionAxis) => void;
  onSectionRatioChange: (ratio: number) => void;
  onView: (preset: ViewPreset) => void;
  onFullscreen: () => void;
}

const SECTION_AXES: SectionAxis[] = ['none', 'y', 'x', 'z'];

const icons = {
  fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  top: 'M4 4h16v16H4zM4 12h9M13 4v16',
  perspective: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
  fullscreen: 'M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
};

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ViewerPanel(props: ViewerPanelProps) {
  const { t, l, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const {
    zones,
    zoneBounds,
    bounds,
    projectArea,
    projectTitle,
    selected,
    hovered,
    mode,
    showWalls,
    sectionAxis,
    sectionRatio,
  } = props;

  // On small screens the panel is a drawer: close it once a zone is chosen.
  const selectZone = (zoneId: string | null) => {
    props.onSelect(zoneId);
    setOpen(false);
  };

  const number = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en', { maximumFractionDigits: 2 });
  const selectedZone = zones.find((zone) => zone.id === selected) ?? null;
  const box = selectedZone ? zoneBounds?.get(selectedZone.id) : bounds;
  const size = box ? box.getSize(new Vector3()) : null;

  return (
    <>
      <div className="viewer-toolbar" role="toolbar" aria-label={t('viewer.controls')}>
        <button
          type="button"
          className="icon-button"
          onClick={() => props.onView('fit')}
          title={t('viewer.view.reset')}
        >
          <Icon path={icons.fit} />
          <span className="visually-hidden">{t('viewer.view.reset')}</span>
        </button>
        <button type="button" className="icon-button" onClick={() => props.onView('top')} title={t('viewer.view.top')}>
          <Icon path={icons.top} />
          <span className="visually-hidden">{t('viewer.view.top')}</span>
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => props.onView('perspective')}
          title={t('viewer.view.perspective')}
        >
          <Icon path={icons.perspective} />
          <span className="visually-hidden">{t('viewer.view.perspective')}</span>
        </button>
        <button type="button" className="icon-button" onClick={props.onFullscreen} title={t('viewer.fullscreen')}>
          <Icon path={icons.fullscreen} />
          <span className="visually-hidden">{t('viewer.fullscreen')}</span>
        </button>
      </div>

      <button
        type="button"
        className="viewer-panel-toggle"
        aria-expanded={open}
        aria-controls="viewer-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon path={icons.sliders} />
        {t('viewer.controls')}
      </button>

      <aside id="viewer-panel" className="viewer-panel" data-open={open ? '' : undefined}>
        <section>
          <h3 className="viewer-panel__title">{t('viewer.parts')}</h3>
          <ul className="zone-list">
            <li>
              <button
                type="button"
                className="zone-list__item"
                aria-pressed={selected === null}
                onClick={() => selectZone(null)}
              >
                {t('viewer.whole')}
              </button>
            </li>
            {zones.map((zone) => (
              <li key={zone.id}>
                <button
                  type="button"
                  className="zone-list__item"
                  aria-pressed={selected === zone.id}
                  data-hovered={hovered === zone.id ? '' : undefined}
                  onClick={() => selectZone(zone.id)}
                  onMouseEnter={() => props.onHover(zone.id)}
                  onMouseLeave={() => props.onHover(null)}
                >
                  {l(zone.name)}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="viewer-panel__title">{t('viewer.mode')}</h3>
          <div className="segmented">
            {(['highlight', 'isolate'] as const).map((value) => (
              <button key={value} type="button" aria-pressed={mode === value} onClick={() => props.onModeChange(value)}>
                {t(`viewer.mode.${value}`)}
              </button>
            ))}
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={showWalls}
              onChange={(event) => props.onShowWallsChange(event.target.checked)}
            />
            <span>{t('viewer.walls')}</span>
          </label>
        </section>

        <section>
          <h3 className="viewer-panel__title">{t('viewer.section')}</h3>
          <div className="segmented segmented--wrap">
            {SECTION_AXES.map((axis) => (
              <button
                key={axis}
                type="button"
                aria-pressed={sectionAxis === axis}
                onClick={() => props.onSectionAxisChange(axis)}
              >
                {t(`viewer.section.${axis}`)}
              </button>
            ))}
          </div>
          {sectionAxis !== 'none' && (
            <label className="range">
              <span className="visually-hidden">{t('viewer.section.position')}</span>
              <input
                type="range"
                min={0.02}
                max={1}
                step={0.01}
                value={sectionRatio}
                onChange={(event) => props.onSectionRatioChange(Number(event.target.value))}
              />
            </label>
          )}
        </section>
      </aside>

      <div className="viewer-info" aria-live="polite">
        <p className="viewer-info__eyebrow">{selectedZone ? t('viewer.parts') : t('viewer.whole')}</p>
        <h3 className="viewer-info__title">
          {selectedZone ? l(selectedZone.name) : projectArea ? `${number.format(projectArea)} m²` : projectTitle}
        </h3>
        {selectedZone && <p className="viewer-info__text">{l(selectedZone.description)}</p>}
        {size && (
          <p className="viewer-info__meta">
            {number.format(size.x)} × {number.format(size.z)} × {number.format(size.y)} m
            {selectedZone?.area ? ` · ${t('viewer.area')}: ${number.format(selectedZone.area)} m²` : ''}
          </p>
        )}
      </div>
    </>
  );
}
