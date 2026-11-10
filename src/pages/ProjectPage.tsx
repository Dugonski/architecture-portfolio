import { lazy, Suspense, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Figure } from '../components/Figure';
import { useLightbox, type LightboxImage } from '../components/useLightbox';
import { RuleHeading } from '../components/RuleHeading';
import { projects } from '../data/projects';
import { useI18n } from '../i18n/context';
import type { Project } from '../types';
import NotFoundPage from './NotFoundPage';

const ModelViewer = lazy(() => import('../components/viewer/ModelViewer'));

export default function ProjectPage() {
  const { slug } = useParams();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) return <NotFoundPage />;
  // Keyed so that lightbox state resets when moving between projects.
  return <ProjectContent key={slug} project={projects[index]} index={index} />;
}

function ProjectContent({ project, index }: { project: Project; index: number }) {
  const { t, l, lang } = useI18n();
  const number = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en');

  // One lightbox for every image on the page, in reading order.
  const sheetImages = useMemo<LightboxImage[]>(
    () =>
      project.details.map((sheet) => ({
        src: sheet.src,
        caption: {
          pt: `${sheet.code} · ${sheet.title.pt} — ${sheet.room.pt}`,
          en: `${sheet.code} · ${sheet.title.en} — ${sheet.room.en}`,
        },
      })),
    [project],
  );
  const images = useMemo(
    () => [...project.renders, ...project.plans, ...project.isometric, ...sheetImages],
    [project, sheetImages],
  );
  const lightbox = useLightbox(images);
  const offset = {
    renders: 0,
    plans: project.renders.length,
    isometric: project.renders.length + project.plans.length,
    details: project.renders.length + project.plans.length + project.isometric.length,
  };

  const [mainPlan, ...sidePlans] = project.plans;
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="container">
      <header className="project-cover">
        <div className="project-cover__header">
          <RuleHeading as="p">
            {t('project.label')} {index + 1}
          </RuleHeading>
          <Link to="/#sumario" className="back-link">
            ← {t('project.back')}
          </Link>
        </div>

        <div>
          <h1 className="project-cover__title display">{l(project.title)}</h1>
          <p className="project-cover__text">{l(project.description)}</p>
          <p className="project-meta">
            {[
              t(`category.${project.category}`),
              project.area ? `${number.format(project.area)} m²` : null,
              project.year ?? null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <img className="project-cover__image" src={project.cover} alt={l(project.renders[0].caption)} />

        <ul className="project-tools">
          {project.tools.map((tool) => (
            <li key={tool.name + tool.use.pt}>
              <strong>{tool.name}</strong>
              <span>{l(tool.use)}</span>
            </li>
          ))}
        </ul>
      </header>

      {project.model && (
        <section className="project-section" aria-labelledby="modelo">
          <RuleHeading id="modelo">{t('project.model')}</RuleHeading>
          <p className="section-lead">{t('project.modelLead')}</p>
          <Suspense fallback={<div className="viewer" />}>
            <ModelViewer model={project.model} projectArea={project.area} projectTitle={l(project.title)} />
          </Suspense>
        </section>
      )}

      <section className="project-section">
        <RuleHeading>{t('project.renders')}</RuleHeading>
        <div className="renders">
          {project.renders.map((image, i) => (
            <Figure key={image.src} image={image} caption={false} onOpen={() => lightbox.open(offset.renders + i)} />
          ))}
        </div>
      </section>

      {mainPlan && (
        <section className="project-section">
          <RuleHeading>{t('project.plans')}</RuleHeading>
          {project.planLayout === 'stacked' ? (
            <div className="plans--stacked">
              <div className="plans plans__head">
                <div className="plans__main">
                  <Figure image={mainPlan} onOpen={() => lightbox.open(offset.plans)} />
                </div>
                {sidePlans[0] && <Figure image={sidePlans[0]} onOpen={() => lightbox.open(offset.plans + 1)} />}
              </div>
              <div className="plans__rest">
                {sidePlans.slice(1).map((image, i) => (
                  <div key={image.src} className={image.wide ? 'plans__wide' : undefined}>
                    <Figure image={image} onOpen={() => lightbox.open(offset.plans + i + 2)} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="plans">
              <div className="plans__main">
                <Figure image={mainPlan} onOpen={() => lightbox.open(offset.plans)} />
              </div>
              <div className="plans__side">
                {sidePlans.map((image, i) => (
                  <Figure key={image.src} image={image} onOpen={() => lightbox.open(offset.plans + i + 1)} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {project.isometric.length > 0 && (
        <section className="project-section">
          <RuleHeading>{t('project.isometric')}</RuleHeading>
          <div className="isometric">
            {project.isometric.map((image, i) => (
              <Figure
                key={image.src}
                image={image}
                caption={false}
                onOpen={() => lightbox.open(offset.isometric + i)}
              />
            ))}
          </div>
        </section>
      )}

      {project.details.length > 0 && (
        <section className="project-section">
          <RuleHeading>{t('project.details')}</RuleHeading>
          <div className="sheets">
            {project.details.map((sheet, i) => (
              <Figure key={sheet.src} image={sheetImages[i]} onOpen={() => lightbox.open(offset.details + i)}>
                <span className="sheet-label">
                  <span>
                    {sheet.code} · {l(sheet.title)}
                  </span>
                  <span>{l(sheet.room)}</span>
                </span>
              </Figure>
            ))}
          </div>
        </section>
      )}

      {project.materials.length > 0 && (
        <section className="project-section">
          <RuleHeading>{t('project.materials')}</RuleHeading>
          <table className="materials">
            <thead>
              <tr>
                <th scope="col">{t('project.material')}</th>
                <th scope="col">{t('project.materialName')}</th>
                <th scope="col">{t('project.application')}</th>
              </tr>
            </thead>
            <tbody>
              {project.materials.map((material) => (
                <tr key={material.swatch}>
                  <td>
                    <img src={material.swatch} alt="" loading="lazy" />
                  </td>
                  <td>{l(material.name)}</td>
                  <td>{l(material.application)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {projects.length > 1 && (
        <nav className="project-pager" aria-label={t('nav.projects')}>
          <Link to={`/projetos/${previous.slug}`}>
            <small>← {t('project.previous')}</small>
            <span>{l(previous.title)}</span>
          </Link>
          <Link to={`/projetos/${next.slug}`}>
            <small>{t('project.next')} →</small>
            <span>{l(next.title)}</span>
          </Link>
        </nav>
      )}

      {lightbox.element}
    </article>
  );
}
