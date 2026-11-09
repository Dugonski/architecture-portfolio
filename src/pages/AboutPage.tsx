import { site, type TimelineEntry } from '../data/site';
import { useI18n } from '../i18n/context';

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { l } = useI18n();

  return (
    <ol className="timeline">
      {entries.map((entry) => (
        <li key={entry.title.pt + entry.period.pt} className="timeline__item">
          <p className="timeline__period">{l(entry.period)}</p>
          <div>
            <h3 className="timeline__title">{l(entry.title)}</h3>
            <p className="timeline__place">
              {typeof entry.place === 'string' ? entry.place : l(entry.place)}
              {entry.location ? ` · ${entry.location}` : ''}
            </p>
            {entry.details && (
              <ul className="timeline__details">
                {entry.details.map((detail) => (
                  <li key={detail.pt}>{l(detail)}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function AboutPage() {
  const { t, l } = useI18n();

  return (
    <section className="page container">
      <p className="eyebrow">{l(site.role)}</p>
      <h1 className="page__title">{site.name}</h1>

      <div className="about">
        <div>
          {site.bio.map((paragraph) => (
            <p key={paragraph.pt}>{l(paragraph)}</p>
          ))}
        </div>
        <aside className="about__aside">
          <h2 className="about__label">{t('about.skills')}</h2>
          <ul className="about__list">
            {site.skills.map((skill) => (
              <li key={skill.pt}>{l(skill)}</li>
            ))}
          </ul>
          <h2 className="about__label">{t('about.tools')}</h2>
          <ul className="tags">
            {site.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          <h2 className="about__label">{t('about.languages')}</h2>
          <ul className="about__list">
            {site.languages.map((language) => (
              <li key={language.pt}>{l(language)}</li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="project-section">
        <h2>{t('about.experience')}</h2>
        <Timeline entries={site.experience} />
      </section>

      <section className="project-section">
        <h2>{t('about.education')}</h2>
        <Timeline entries={site.education} />
      </section>
    </section>
  );
}
