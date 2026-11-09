import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import type { Project } from '../types';

export function ProjectCard({ project }: { project: Project }) {
  const { t, l } = useI18n();

  return (
    <Link to={`/projetos/${project.slug}`} className="project-card">
      <div className="project-card__media">
        <img src={project.cover} alt={l(project.title)} loading="lazy" />
        {project.model && <span className="project-card__badge">3D</span>}
      </div>
      <div className="project-card__body">
        <h3 className="project-card__title">{l(project.title)}</h3>
        <p className="project-card__meta">
          {t(`category.${project.category}`)} · {project.year}
        </p>
      </div>
      <p className="project-card__summary">{l(project.summary)}</p>
    </Link>
  );
}
