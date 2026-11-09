import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';
import type { Localized } from '../types';

export interface LightboxImage {
  src: string;
  caption: Localized;
}

/** Full-screen image viewer with keyboard navigation. */
export function useLightbox(images: LightboxImage[]) {
  const { t, l } = useI18n();
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (delta: number) => setActive((index) => (index === null ? null : (index + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close, step]);

  const current = active === null ? null : images[active];

  const element = current && (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={l(current.caption)} onClick={close}>
      <img src={current.src} alt={l(current.caption)} onClick={(event) => event.stopPropagation()} />
      <p className="lightbox__caption">{l(current.caption)}</p>
      <button
        type="button"
        className="lightbox__button lightbox__close"
        onClick={close}
        aria-label={t('gallery.close')}
      >
        ×
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox__button lightbox__prev"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            aria-label={t('gallery.prev')}
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox__button lightbox__next"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            aria-label={t('gallery.next')}
          >
            ›
          </button>
        </>
      )}
    </div>
  );

  return { open: setActive, element };
}
