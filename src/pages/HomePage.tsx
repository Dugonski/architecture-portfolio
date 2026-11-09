import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RuleHeading } from '../components/RuleHeading';
import { projects } from '../data/projects';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';

export default function HomePage() {
  const { t, l } = useI18n();
  const [active, setActive] = useState(0);

  return (
    <>
      {/* Cover, mirroring the first page of the PDF */}
      <section className="cover container">
        <div className="cover__top">
          <RuleHeading as="p">{t('home.portfolio')}</RuleHeading>
          <p className="cover__subtitle">{t('home.subtitle')}</p>
        </div>

        <div className="cover__center">
          <h1 className="cover__name display">{site.brand}</h1>
          <p className="cover__role">{l(site.role)}</p>
          <p className="cover__intro">{t('home.intro')}</p>
        </div>

        <div className="cover__contact">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span className="cover__contact-separator" aria-hidden="true">
            -
          </span>
          <a href={`tel:+55${site.phone.replace(/\D/g, '')}`}>{site.phone}</a>
          <span className="cover__contact-rule" aria-hidden="true" />
          <span>{l(site.city)}</span>
        </div>
      </section>

      {/* Contents (sumário) */}
      <section id="sumario" className="contents container">
        <RuleHeading>{t('home.summary')}</RuleHeading>
        <div className="summary">
          <ol className="summary__list">
            {projects.map((project, index) => (
              <li key={project.slug} className="summary__item">
                <Link
                  to={`/projetos/${project.slug}`}
                  className="summary__link"
                  data-active={active === index ? '' : undefined}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span>
                    <span className="summary__name">{l(project.title)}</span>
                    <span className="summary__tag">
                      {t(`category.${project.category}`)}
                      {project.model ? ` · ${t('home.has3d')}` : ''}
                    </span>
                  </span>
                  <span className="summary__leader" aria-hidden="true" />
                  <span className="summary__number">{String(index + 1).padStart(2, '0')}</span>
                </Link>
                <img className="summary__thumb" src={project.cover} alt="" loading="lazy" />
              </li>
            ))}
          </ol>

          <div className="summary__preview" aria-hidden="true">
            {projects.map((project, index) => (
              <img
                key={project.slug}
                src={project.cover}
                alt=""
                data-active={active === index ? '' : undefined}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
