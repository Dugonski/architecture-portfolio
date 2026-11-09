import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';

/** Scrolls to the top on navigation, or to the element named in the URL hash. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  const { t, l, lang, setLang } = useI18n();

  return (
    <>
      <ScrollToTop />
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="site-header__brand">
            {site.brand}
          </Link>
          <nav className="site-nav" aria-label={t('nav.projects')}>
            <NavLink to="/" end className="site-nav__projects">
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

      <footer className="site-footer container">
        <p className="site-footer__rule">{l(site.role)}</p>
        <div className="site-footer__meta">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <div className="site-footer__links">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            {site.social.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
