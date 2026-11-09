import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  const { t, lang, setLang } = useI18n();

  return (
    <>
      <ScrollToTop />
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="site-header__brand">
            <span className="brand-full">{site.name}</span>
            <span className="brand-short">{site.shortName}</span>
          </Link>
          <nav className="site-nav" aria-label="Principal">
            <NavLink to="/" end>
              {t('nav.projects')}
            </NavLink>
            <NavLink to="/sobre">{t('nav.about')}</NavLink>
            <NavLink to="/contato">{t('nav.contact')}</NavLink>
            <button
              type="button"
              className="lang-switch"
              onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              aria-label={t('lang.switchLabel')}
            >
              {lang === 'pt' ? 'EN' : 'PT'}
            </button>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>
            © {new Date().getFullYear()} {site.name}. {t('footer.rights')}
          </span>
          <div className="site-footer__links">
            {site.social.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
