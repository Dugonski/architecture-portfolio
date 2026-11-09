import type { FormEvent } from 'react';
import { RuleHeading } from '../components/RuleHeading';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';

export default function ContactPage() {
  const { t, l } = useI18n();

  // Without a backend, the form opens the visitor's e-mail client pre-filled.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `${site.brand} — ${data.get('name')}`;
    const body = `${data.get('message')}\n\n${data.get('name')} <${data.get('email')}>`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="page container">
      <RuleHeading as="p">{t('contact.title')}</RuleHeading>
      <h1 className="page__title display">{t('contact.lead')}</h1>
      <div className="contact">
        <div className="contact__details">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={`tel:+55${site.phone.replace(/\D/g, '')}`}>{site.phone}</a>
          <span>{l(site.city)}</span>
          {site.social.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            {t('contact.name')}
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            {t('contact.email')}
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            {t('contact.message')}
            <textarea name="message" required />
          </label>
          <button type="submit" className="button">
            {t('contact.send')}
          </button>
        </form>
      </div>

      <p className="thanks display">{t('contact.thanks')}</p>
    </section>
  );
}
