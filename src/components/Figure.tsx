import type { ReactNode } from 'react';
import { useI18n } from '../i18n/context';
import type { LightboxImage } from './useLightbox';

interface FigureProps {
  image: LightboxImage;
  onOpen: () => void;
  caption?: boolean;
  children?: ReactNode;
}

/** A clickable image that opens the lightbox. */
export function Figure({ image, onOpen, caption = true, children }: FigureProps) {
  const { t, l } = useI18n();
  return (
    <button
      type="button"
      className="figure-button"
      onClick={onOpen}
      aria-label={`${t('gallery.open')}: ${l(image.caption)}`}
    >
      <span className="figure-frame" style={{ display: 'block' }}>
        <img src={image.src} alt={l(image.caption)} loading="lazy" />
      </span>
      {children ?? (caption && <span className="figure-caption">{l(image.caption)}</span>)}
    </button>
  );
}
