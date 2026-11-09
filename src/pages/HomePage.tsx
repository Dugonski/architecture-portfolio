import { useMemo, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { projects } from '../data/projects';
import { useI18n } from '../i18n/context';
import type { ProjectCategory } from '../types';

export default function HomePage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<ProjectCategory | 'all'>('all');

  const categories = useMemo(() => [...new Set(projects.map((project) => project.category))], []);
  const visible = filter === 'all' ? projects : projects.filter((project) => project.category === filter);

  return (
    <>
      <section className="hero container">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 className="hero__title">{t('home.title')}</h1>
        <p className="hero__lead">{t('home.lead')}</p>
        <a href="#projetos" className="button">
          {t('home.cta')}
        </a>
      </section>

      <section id="projetos" className="container">
        <div className="section-heading">
          <h2>{t('home.projects')}</h2>
          {categories.length > 1 && (
            <div className="filters" role="group">
              <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
                {t('home.filter.all')}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={filter === category}
                  onClick={() => setFilter(category)}
                >
                  {t(`category.${category}`)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="project-grid">
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </>
  );
}
