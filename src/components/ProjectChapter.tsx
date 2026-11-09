import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import type { Project } from '../types';

interface ProjectChapterProps {
  project: Project;
  index: number;
  total: number;
}

/** A large, alternating panel that previews a project on the home page. */
export function ProjectChapter({ project, index, total }: ProjectChapterProps) {
  const { t, l, lang } = useI18n();
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);

  // Reveal the panel the first time it scrolls into view.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const href = `/projetos/${project.slug}`;
  const pad = (value: number) => String(value).padStart(2, '0');
  const number = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en');
  const tags = [
    t(`category.${project.category}`),
    project.area ? `${number.format(project.area)} m²` : null,
    project.model ? t('home.has3d') : null,
    project.details.length ? `${project.details.length} ${t('home.sheets')}` : null,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <li ref={ref} className="chapter" data-visible={visible ? '' : undefined}>
      <div className="chapter__media">
        <Link to={href} className="chapter__stage" aria-label={l(project.title)}>
          {project.model && <span className="chapter__badge">{t('home.has3d')}</span>}
          {project.renders.map((render, i) => (
            <img
              key={render.src}
              src={render.src}
              alt={i === active ? l(render.caption) : ''}
              data-active={i === active ? '' : undefined}
              loading={index === 0 && i === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </Link>
        <ul className="chapter__thumbs">
          {project.renders.map((render, i) => (
            <li key={render.src}>
              <button
                type="button"
                aria-pressed={i === active}
                aria-label={l(render.caption)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <img src={render.src} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="chapter__text">
        <p className="chapter__number">
          <strong>{pad(index + 1)}</strong>/ {pad(total)}
        </p>
        <h3 className="chapter__title display">
          <Link to={href}>{l(project.title)}</Link>
        </h3>
        <p className="chapter__summary">{l(project.summary)}</p>
        <ul className="chapter__tags">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <Link to={href} className="chapter__link">
          {t('home.view')}
        </Link>
      </div>
    </li>
  );
}
