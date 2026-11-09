import type { Project } from '../types';

const base = import.meta.env.BASE_URL;
const asset = (path: string) => `${base}${path}`;

/**
 * Portfolio content. To add a project, append an entry to this list and put
 * its files under `public/projects/<slug>/` and `public/models/`.
 */
export const projects: Project[] = [
  {
    slug: 'brinquedoteca',
    title: { pt: 'Brinquedoteca', en: 'Playroom' },
    category: 'interiors',
    year: 2026,
    location: { pt: 'Brasil', en: 'Brazil' },
    area: 50,
    status: { pt: 'Projeto', en: 'Design' },
    summary: {
      pt: 'Uma sala de 50 m² que vira cabana, montanha e biblioteca para estimular o brincar livre.',
      en: 'A 50 m² room that becomes a cabin, a mountain range and a library to encourage free play.',
    },
    description: [
      {
        pt: 'O projeto organiza a brinquedoteca em ambientes de uso bem definidos dentro de um único espaço de 10 × 5 metros, mantendo o centro livre para correr, montar e brincar no chão.',
        en: 'The design organizes the playroom into clearly defined areas within a single 10 × 5 meter space, keeping the center free for running, building and floor play.',
      },
      {
        pt: 'Uma cabana com mezanino ocupa o canto de entrada, enquanto a parede de montanhas em tons pastel conduz o olhar até a área de leitura, delimitada por um tablado orgânico. Na parede oposta, uma lousa em arco é emoldurada por estantes e nichos que deixam tudo ao alcance das crianças.',
        en: 'A cabin with a mezzanine takes the entrance corner, while the pastel mountain wall leads the eye to the reading area, framed by an organic platform. On the opposite wall, an arched chalkboard is flanked by shelves and cubbies that keep everything within children’s reach.',
      },
    ],
    cover: asset('projects/brinquedoteca/cover.jpg'),
    gallery: [
      {
        src: asset('projects/brinquedoteca/perspectiva-01.jpg'),
        kind: 'render',
        caption: { pt: 'Vista geral da brinquedoteca', en: 'Overview of the playroom' },
      },
      {
        src: asset('projects/brinquedoteca/perspectiva-02.jpg'),
        kind: 'render',
        caption: { pt: 'Parede da lousa e nichos', en: 'Chalkboard wall and cubbies' },
      },
      {
        src: asset('projects/brinquedoteca/perspectiva-03.jpg'),
        kind: 'render',
        caption: { pt: 'Cabana com mezanino', en: 'Cabin with mezzanine' },
      },
      {
        src: asset('projects/brinquedoteca/planta.jpg'),
        kind: 'plan',
        caption: { pt: 'Planta baixa — corte a 1,20 m', en: 'Floor plan — cut at 1.20 m' },
      },
    ],
    model: {
      url: asset('models/brinquedoteca.glb'),
      zones: [
        {
          id: 'cabana',
          name: { pt: 'Cabana e mezanino', en: 'Cabin and mezzanine' },
          description: {
            pt: 'Estrutura em marcenaria com nível superior, janelas recortadas e estante de nichos integrada.',
            en: 'Joinery structure with an upper level, cut-out windows and an integrated cubby shelf.',
          },
          boxes: [{ min: [-5.02, -0.1, -2.38], max: [-2.73, 3.2, -0.6] }],
        },
        {
          id: 'montanhas',
          name: { pt: 'Parede de montanhas', en: 'Mountain wall' },
          description: {
            pt: 'Painéis triangulares em cores suaves que formam uma cordilheira ao longo da parede.',
            en: 'Soft-colored triangular panels that form a mountain range along the wall.',
          },
          boxes: [{ min: [-2.73, -0.1, -2.38], max: [4.92, 3.2, -2.02] }],
        },
        {
          id: 'leitura',
          name: { pt: 'Área de leitura', en: 'Reading area' },
          description: {
            pt: 'Tablado de contorno orgânico junto às janelas, com almofadas para leitura e descanso.',
            en: 'An organically shaped platform by the windows, with cushions for reading and resting.',
          },
          boxes: [{ min: [0.32, -0.1, -2.02], max: [4.92, 3.2, 0.09] }],
        },
        {
          id: 'lousa',
          name: { pt: 'Lousa e estantes', en: 'Chalkboard and shelves' },
          description: {
            pt: 'Lousa em arco emoldurada por estantes abertas para livros e brinquedos.',
            en: 'An arched chalkboard framed by open shelves for books and toys.',
          },
          boxes: [{ min: [-5.02, -0.1, 1.23], max: [-0.39, 3.2, 2.56] }],
        },
        {
          id: 'nichos',
          name: { pt: 'Bancada de nichos', en: 'Cubby bench' },
          description: {
            pt: 'Bancada baixa com nichos e gavetas para organizar os brinquedos.',
            en: 'A low bench with cubbies and drawers to keep toys organized.',
          },
          boxes: [{ min: [-0.39, -0.1, 1.23], max: [2.6, 3.2, 2.56] }],
        },
        {
          id: 'canto',
          name: { pt: 'Canto de brincar', en: 'Play corner' },
          description: {
            pt: 'Tapete em quarto de círculo para brincadeiras no chão, junto à iluminação natural.',
            en: 'A quarter-circle rug for floor play, next to the natural light.',
          },
          boxes: [{ min: [1.84, -0.1, 0.09], max: [4.92, 3.2, 2.56] }],
        },
      ],
    },
  },
];

export function findProject(slug: string | undefined): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
