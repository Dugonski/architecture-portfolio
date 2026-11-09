import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <section className="not-found container">
      <h1>{t('notFound.title')}</h1>
      <Link to="/" className="button button--ghost">
        {t('notFound.back')}
      </Link>
    </section>
  );
}
