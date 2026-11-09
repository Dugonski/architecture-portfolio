import { site } from '../data/site';
import { useI18n } from '../i18n/context';

export default function AboutPage() {
  const { t, l } = useI18n();

  return (
    <section className="page container">
      <p className="eyebrow">{site.name}</p>
      <h1 className="page__title">{t('about.title')}</h1>
      <div className="about">
        <div>
          {site.bio.map((paragraph, index) => (
            <p key={index}>{l(paragraph)}</p>
          ))}
        </div>
        <ul>
          {site.services.map((service, index) => (
            <li key={index}>{l(service)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
