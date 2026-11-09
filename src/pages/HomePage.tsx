import { ProjectChapter } from '../components/ProjectChapter';
import { RuleHeading } from '../components/RuleHeading';
import { projects } from '../data/projects';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';

export default function HomePage() {
  const { t, l } = useI18n();

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

      {/* Projects, one chapter each */}
      <section id="sumario" className="contents container">
        <RuleHeading>{t('home.summary')}</RuleHeading>
        <ol className="chapters">
          {projects.map((project, index) => (
            <ProjectChapter key={project.slug} project={project} index={index} total={projects.length} />
          ))}
        </ol>
      </section>
    </>
  );
}
