import type { Localized } from '../types';

/**
 * Studio information shown in the header, footer and about/contact pages.
 * Replace the placeholder values with your own.
 */
export const site = {
  name: 'Dugonski Arquitetura',
  shortName: 'Dugonski',
  email: 'contato@exemplo.com',
  phone: '+55 00 00000-0000',
  city: { pt: 'Brasil', en: 'Brazil' } satisfies Localized,
  social: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
  ],
  bio: [
    {
      pt: 'Escritório dedicado a projetos de arquitetura e interiores que unem funcionalidade, conforto e identidade. Cada projeto nasce da escuta atenta de quem vai viver o espaço.',
      en: 'A studio dedicated to architecture and interior design that brings together function, comfort and identity. Every project starts by listening closely to the people who will live in the space.',
    },
    {
      pt: 'Os projetos são desenvolvidos em modelos tridimensionais desde as primeiras etapas, o que permite explorar cada ambiente em detalhe antes da obra.',
      en: 'Projects are developed as three-dimensional models from the earliest stages, making it possible to explore every room in detail before construction.',
    },
  ] satisfies Localized[],
  services: [
    { pt: 'Projetos residenciais', en: 'Residential design' },
    { pt: 'Arquitetura de interiores', en: 'Interior architecture' },
    { pt: 'Espaços comerciais e institucionais', en: 'Commercial and institutional spaces' },
    { pt: 'Modelagem e visualização 3D', en: '3D modeling and visualization' },
  ] satisfies Localized[],
};
