import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Gallery } from '../components/Gallery';
import { findProject } from '../data/projects';
import { useI18n } from '../i18n/context';
import NotFoundPage from './NotFoundPage';

const ModelViewer = lazy(() => import('../components/viewer/ModelViewer'));

export default function ProjectPage() {
  const { slug } = useParams();
  const { t, l, lang } = useI18n();
  const project = findProject(slug);

  if (!project) return <NotFoundPage />;

  const number = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en');
  const images = project.gallery.filter((image) => image.kind !== 'plan');
  const plans = project.gallery.filter((image) => image.kind === 'plan');

  return (
    <article className="container">
      <header className="project-hero">
        <Link to="/" className="back-link">
          ← {t('project.back')}
        </Link>
        <p className="eyebrow">{t(`category.${project.category}`)}</p>
        <h1 className="project-hero__title">{l(project.title)}</h1>
        <dl className="project-facts">
          <div>
            <dt>{t('project.location')}</dt>
            <dd>{l(project.location)}</dd>
          </div>
          <div>
            <dt>{t('project.year')}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>{t('project.area')}</dt>
            <dd>{number.format(project.area)} m²</dd>
          </div>
          <div>
            <dt>{t('project.status')}</dt>
            <dd>{l(project.status)}</dd>
          </div>
        </dl>
      </header>

      {project.model && (
        <section className="project-section" aria-label={t('project.model')}>
          <Suspense fallback={<div className="viewer" />}>
            <ModelViewer model={project.model} projectArea={project.area} />
          </Suspense>
        </section>
      )}

      <section className="project-section project-about">
        <h2>{t('project.about')}</h2>
        <div>
          {project.description.map((paragraph, index) => (
            <p key={index}>{l(paragraph)}</p>
          ))}
        </div>
      </section>

      {images.length > 0 && (
        <section className="project-section">
          <h2>{t('project.gallery')}</h2>
          <Gallery images={images} />
        </section>
      )}

      {plans.length > 0 && (
        <section className="project-section">
          <h2>{t('project.plans')}</h2>
          <Gallery images={plans} />
        </section>
      )}
    </article>
  );
}
