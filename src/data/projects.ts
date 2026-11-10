import type { DetailSheet, Material, Project, ProjectImage, ProjectTool } from '../types';

const base = import.meta.env.BASE_URL;
const file = (slug: string, name: string) => `${base}projects/${slug}/${name}.jpg`;

const renders = (slug: string, captions: [string, string][]): ProjectImage[] =>
  captions.map(([pt, en], index) => ({
    src: file(slug, `render-${String(index + 1).padStart(2, '0')}`),
    caption: { pt, en },
  }));

const sheets = (slug: string, list: [string, string, string, string, string][]): DetailSheet[] =>
  list.map(([code, titlePt, titleEn, roomPt, roomEn], index) => ({
    code,
    title: { pt: titlePt, en: titleEn },
    room: { pt: roomPt, en: roomEn },
    src: file(slug, `prancha-${String(index + 1).padStart(2, '0')}`),
  }));

const materials = (slug: string, list: [string, string, string, string][]): Material[] =>
  list.map(([namePt, nameEn, appPt, appEn], index) => ({
    swatch: file(slug, `material-${index + 1}`),
    name: { pt: namePt, en: nameEn },
    application: { pt: appPt, en: appEn },
  }));

const sketchup = (pt: string, en: string): ProjectTool => ({ name: 'SketchUp', use: { pt, en } });
const ai = (name: string): ProjectTool => ({ name, use: { pt: 'Renderização', en: 'Rendering' } });
const floorPlanTool = sketchup('Planta baixa', 'Floor plan');
const modelingTool = sketchup('Modelagem 3D', '3D modeling');

/**
 * Portfolio content, in the same order as the PDF portfolio. To add a project,
 * append an entry and put its files under `public/projects/<slug>/`.
 */
export const projects: Project[] = [
  {
    slug: 'studio-compacto',
    title: { pt: 'Studio compacto', en: 'Compact studio' },
    category: 'residential',
    area: 25,
    year: 2024,
    summary: {
      pt: 'Apartamento de 25 m² com móveis planejados para uma jovem estudante.',
      en: 'A 25 m² apartment with custom furniture for a young student.',
    },
    description: {
      pt: 'Apartamento compacto de 25 m² projetado sob medida, com móveis planejados para atender as necessidades de uma jovem estudante. O projeto contempla dormitório, espaço de lazer e descanso, área de trabalho, cozinha, área de serviço e banheiro completo.',
      en: 'A made-to-measure 25 m² compact apartment with custom furniture designed around the needs of a young student. The project includes a bedroom, a living and resting area, a workspace, a kitchen, a laundry area and a full bathroom.',
    },
    tools: [floorPlanTool, modelingTool, ai('Grok AI')],
    cover: file('studio-compacto', 'render-01'),
    renders: renders('studio-compacto', [
      ['Cozinha integrada à sala', 'Kitchen open to the living area'],
      ['Banheiro', 'Bathroom'],
      ['Dormitório e área de trabalho', 'Bedroom and workspace'],
      ['Dormitório e sala de estar', 'Bedroom and living area'],
    ]),
    plans: [
      { src: file('studio-compacto', 'planta'), caption: { pt: 'Planta baixa', en: 'Floor plan' } },
      { src: file('studio-compacto', 'elevacao-1'), caption: { pt: 'Elevação 1', en: 'Elevation 1' } },
      { src: file('studio-compacto', 'elevacao-2'), caption: { pt: 'Elevação 2', en: 'Elevation 2' } },
    ],
    isometric: [
      {
        src: file('studio-compacto', 'isometrica'),
        caption: { pt: 'Vistas isométricas', en: 'Isometric views' },
      },
    ],
    details: sheets('studio-compacto', [
      ['CZ-01', 'Armário superior', 'Upper cabinet', 'Cozinha', 'Kitchen'],
      ['CZ-02', 'Armário inferior', 'Base cabinet', 'Cozinha', 'Kitchen'],
      ['SL-01', 'Rack', 'TV unit', 'Sala', 'Living room'],
      ['QT-01', 'Guarda-roupa', 'Wardrobe', 'Quarto', 'Bedroom'],
      ['QT-02', 'Nicho', 'Shelving unit', 'Quarto', 'Bedroom'],
      ['QT-03', 'Mesa', 'Desk', 'Quarto', 'Bedroom'],
      ['AS-01', 'Armário superior', 'Upper cabinet', 'Área de serviço', 'Laundry'],
      ['AS-02', 'Bancada', 'Laundry counter', 'Área de serviço', 'Laundry'],
    ]),
    materials: materials('studio-compacto', [
      ['Piso pronto maciço tauari', 'Solid tauari wood flooring', 'Área interna', 'Interior'],
      [
        'Piso retificado antiderrapante Incopisos, textura MRE',
        'Incopisos rectified non-slip tile, MRE texture',
        'Área externa',
        'Exterior',
      ],
      ['Painel ripado em MDF', 'Slatted MDF panel', 'Paredes direita e esquerda', 'Left and right walls'],
      ['Mármore branco', 'White marble', 'Banheiro', 'Bathroom'],
      ['Tinta acrílica fosca Suvinil, cor Espinafre', 'Suvinil matte acrylic paint, Espinafre', 'Paredes', 'Walls'],
      [
        'Tinta acrílica fosca Suvinil, cor Flocos de Neve',
        'Suvinil matte acrylic paint, Flocos de Neve',
        'Paredes',
        'Walls',
      ],
      [
        'Tinta acrílica fosca Suvinil, cor Algodão Egípcio',
        'Suvinil matte acrylic paint, Algodão Egípcio',
        'Paredes',
        'Walls',
      ],
      [
        'MDF laminado, cor Verde Ervas Finas',
        'Laminated MDF, Verde Ervas Finas',
        'Armários da cozinha e rack da sala',
        'Kitchen cabinets and TV unit',
      ],
    ]),
    model: {
      url: `${base}models/studio-compacto.glb`,
      zones: [
        {
          id: 'cozinha',
          name: { pt: 'Cozinha', en: 'Kitchen' },
          description: {
            pt: 'Cozinha linear com armários em verde Ervas Finas, cooktop, pia e bancada de refeições com duas banquetas.',
            en: 'A linear kitchen with Verde Ervas Finas cabinets, a cooktop, a sink and a breakfast counter with two stools.',
          },
          boxes: [
            { min: [-3.8, -0.1, -2.75], max: [0.05, 2.8, -1.4] },
            { min: [-3.8, -0.1, -1.4], max: [-1.2, 2.8, -0.95] },
          ],
        },
        {
          id: 'sala',
          name: { pt: 'Sala de estar', en: 'Living area' },
          description: {
            pt: 'Sofá, tapete redondo e rack planejado, integrados à cozinha.',
            en: 'A sofa, a round rug and a custom TV unit, open to the kitchen.',
          },
          boxes: [
            { min: [0.05, -0.1, -2.75], max: [1.65, 2.8, -1.4] },
            { min: [-0.45, -0.1, -1.4], max: [1.65, 2.8, -0.2] },
          ],
        },
        {
          id: 'banheiro',
          name: { pt: 'Banheiro', en: 'Bathroom' },
          description: {
            pt: 'Banheiro completo revestido em mármore branco.',
            en: 'A full bathroom finished in white marble.',
          },
          boxes: [{ min: [-3.8, -0.1, -0.05], max: [-2.25, 2.8, 2.75] }],
        },
        {
          id: 'dormitorio',
          name: { pt: 'Dormitório e área de trabalho', en: 'Bedroom and workspace' },
          description: {
            pt: 'Cama, guarda-roupa, nicho e mesa de estudos sob medida para a rotina de uma estudante.',
            en: 'A bed, a wardrobe, shelving and a made-to-measure study desk built around a student’s routine.',
          },
          boxes: [{ min: [-2.25, -0.1, 0.1], max: [1.65, 2.8, 2.75] }],
        },
        {
          id: 'servico',
          name: { pt: 'Área de serviço e varanda', en: 'Laundry and balcony' },
          description: {
            pt: 'Área externa com bancada de serviço, tanque e jardineira.',
            en: 'An outdoor area with a laundry counter, a utility sink and a planter.',
          },
          boxes: [{ min: [1.65, -0.1, -2.9], max: [3.95, 2.8, 2.9] }],
        },
      ],
    },
  },
  {
    slug: 'brinquedoteca',
    title: { pt: 'Brinquedoteca', en: 'Playroom' },
    category: 'institutional',
    area: 50,
    summary: {
      pt: 'Ambiente lúdico, seguro e acolhedor que estimula a criatividade e o desenvolvimento infantil.',
      en: 'A playful, safe and welcoming space that encourages creativity and child development.',
    },
    description: {
      pt: 'Brinquedoteca desenvolvida para proporcionar um ambiente lúdico, seguro e acolhedor, estimulando a criatividade, a interação e o desenvolvimento infantil. O projeto contempla áreas para brincadeiras, leitura, atividades recreativas e momentos de descanso, utilizando mobiliário funcional, cores suaves e elementos que incentivam a imaginação.',
      en: 'A playroom designed to provide a playful, safe and welcoming environment that encourages creativity, interaction and child development. The project includes areas for play, reading, recreational activities and rest, with functional furniture, soft colors and elements that spark the imagination.',
    },
    tools: [floorPlanTool, modelingTool, ai('ChatGPT AI')],
    cover: file('brinquedoteca', 'render-01'),
    renders: renders('brinquedoteca', [
      ['Canto da tenda e painel da TV', 'Teepee corner and TV wall'],
      ['Casinha com mezanino e escorregador', 'Playhouse with mezzanine and slide'],
      ['Parede de montanhas', 'Mountain wall'],
      ['Lousa e mesa de atividades', 'Blackboard and activity table'],
    ]),
    plans: [
      { src: file('brinquedoteca', 'planta'), caption: { pt: 'Planta baixa', en: 'Floor plan' } },
      {
        src: file('brinquedoteca', 'planta-casinha'),
        caption: { pt: 'Andar de baixo da casinha', en: 'Playhouse lower level' },
      },
      { src: file('brinquedoteca', 'elevacao-1'), caption: { pt: 'Elevação 1', en: 'Elevation 1' }, wide: true },
      { src: file('brinquedoteca', 'elevacao-2'), caption: { pt: 'Elevação 2', en: 'Elevation 2' }, wide: true },
    ],
    planLayout: 'stacked',
    isometric: [
      {
        src: file('brinquedoteca', 'isometrica'),
        caption: { pt: 'Vistas isométricas', en: 'Isometric views' },
      },
    ],
    details: [],
    materials: materials('brinquedoteca', [
      [
        'Piso Prime Click Eucafloor, Carvalho Maiorca',
        'Eucafloor Prime Click flooring, Carvalho Maiorca',
        'Área interna',
        'Interior',
      ],
      [
        'Tinta lousa preta (textura de quadro negro)',
        'Black chalkboard paint',
        'Fundo do móvel da parede esquerda',
        'Back of the left wall unit',
      ],
      ['Ripado em MDF, cor Carvalho Malva', 'Slatted MDF, Carvalho Malva', 'Parede norte', 'North wall'],
      ['MDF laminado, cor Carvalho Malva', 'Laminated MDF, Carvalho Malva', 'Móveis', 'Furniture'],
      ['Tinta acrílica fosca Suvinil, cor Branco Neve', 'Suvinil matte acrylic paint, Branco Neve', 'Paredes', 'Walls'],
      [
        'Tinta acrílica fosca Suvinil: Suave Lilás, Amarelo Claro, Verde Malva, Azul Etéreo e Rosa Bebê',
        'Suvinil matte acrylic paint: Suave Lilás, Amarelo Claro, Verde Malva, Azul Etéreo and Rosa Bebê',
        'Triângulos da parede direita',
        'Triangles on the right wall',
      ],
    ]),
    model: {
      url: `${base}models/brinquedoteca.glb`,
      zones: [
        {
          id: 'cabana',
          name: { pt: 'Casinha com mezanino', en: 'Playhouse with mezzanine' },
          description: {
            pt: 'Casinha em marcenaria com mezanino, janelas redondas, escada, escorregador e estantes de livros no andar de baixo.',
            en: 'Joinery playhouse with a mezzanine, round windows, a ladder, a slide and bookshelves on the lower level.',
          },
          boxes: [{ min: [-5.1, -0.1, -2.6], max: [-2.73, 3.2, -0.6] }],
        },
        {
          id: 'montanhas',
          name: { pt: 'Parede de montanhas', en: 'Mountain wall' },
          description: {
            pt: 'Triângulos em tons pastel com iluminação indireta, formando uma cordilheira com prateleiras de livros.',
            en: 'Pastel triangles with indirect lighting form a mountain range with book ledges.',
          },
          boxes: [{ min: [-2.73, -0.1, -2.6], max: [5.0, 3.2, -2.02] }],
        },
        {
          id: 'leitura',
          name: { pt: 'Tablado de brincar', en: 'Play platform' },
          description: {
            pt: 'Tablado orgânico com tapete, almofadas e blocos, para brincadeiras no chão e momentos de descanso.',
            en: 'An organic platform with a rug, cushions and blocks for floor play and quiet time.',
          },
          boxes: [{ min: [0.32, -0.1, -2.02], max: [5.0, 3.2, 0.09] }],
        },
        {
          id: 'lousa',
          name: { pt: 'Lousa e estantes', en: 'Chalkboard and shelves' },
          description: {
            pt: 'Lousa em arco com tinta de quadro negro, emoldurada por nichos e almofadas coloridas.',
            en: 'An arched blackboard-paint wall framed by cubbies and colorful floor cushions.',
          },
          boxes: [{ min: [-5.1, -0.1, 1.23], max: [-0.39, 3.2, 2.65] }],
        },
        {
          id: 'nichos',
          name: { pt: 'Painel da TV', en: 'TV wall' },
          description: {
            pt: 'Painel com TV, nicho circular de leitura e gavetas coloridas para guardar os brinquedos.',
            en: 'A TV wall with a round reading nook and colorful drawers for toy storage.',
          },
          boxes: [{ min: [-0.39, -0.1, 1.23], max: [2.6, 3.2, 2.65] }],
        },
        {
          id: 'canto',
          name: { pt: 'Canto da tenda', en: 'Teepee corner' },
          description: {
            pt: 'Tapete rosa com tenda iluminada, junto às janelas e à iluminação natural.',
            en: 'A pink rug with a lit teepee, next to the windows and natural light.',
          },
          boxes: [{ min: [1.84, -0.1, 0.09], max: [5.0, 3.2, 2.65] }],
        },
      ],
    },
  },
  {
    slug: 'cozinha-marinho',
    title: { pt: 'Cozinha Marinho', en: 'Navy Kitchen' },
    category: 'residential',
    year: 2026,
    summary: {
      pt: 'Cozinha integrada que une praticidade, conforto e convivência em um único ambiente.',
      en: 'An open kitchen that brings practicality, comfort and togetherness into a single space.',
    },
    description: {
      pt: 'Cozinha integrada desenvolvida para unir praticidade, conforto e convivência em um único ambiente. O projeto contempla cozinha, ilha funcional para refeições rápidas, sala de jantar e estar integradas, utilizando uma combinação de tons neutros e detalhes em madeira para criar um espaço moderno, acolhedor e funcional.',
      en: 'An open kitchen designed to bring practicality, comfort and togetherness into a single space. The project includes the kitchen, a functional island for quick meals, and integrated dining and living areas, combining neutral tones with wood details to create a modern, welcoming and functional space.',
    },
    tools: [floorPlanTool, modelingTool, ai('Grok AI')],
    cover: file('cozinha-marinho', 'render-01'),
    renders: renders('cozinha-marinho', [
      ['Cozinha, ilha e sala de jantar', 'Kitchen, island and dining area'],
      ['Ilha e porta de correr para a área externa', 'Island and sliding door to the outdoor area'],
      ['Ilha com nichos em madeira', 'Island with wooden cubbies'],
      ['Sala de estar integrada', 'Integrated living area'],
    ]),
    plans: [
      { src: file('cozinha-marinho', 'planta'), caption: { pt: 'Planta baixa', en: 'Floor plan' } },
      { src: file('cozinha-marinho', 'elevacao-1'), caption: { pt: 'Elevação 1', en: 'Elevation 1' } },
      { src: file('cozinha-marinho', 'elevacao-2'), caption: { pt: 'Elevação 2', en: 'Elevation 2' } },
    ],
    isometric: [
      {
        src: file('cozinha-marinho', 'isometrica'),
        caption: { pt: 'Vistas isométricas e detalhe da ilha', en: 'Isometric views and island detail' },
      },
    ],
    details: sheets('cozinha-marinho', [
      ['CZ-01', 'Ilha', 'Island', 'Cozinha', 'Kitchen'],
      ['CZ-02', 'Armário superior', 'Upper cabinet', 'Cozinha', 'Kitchen'],
      ['CZ-03', 'Nicho superior', 'Upper cubby', 'Cozinha', 'Kitchen'],
      ['CZ-04', 'Nicho aéreo', 'Floating shelf', 'Cozinha', 'Kitchen'],
      ['CZ-05', 'Armário inferior', 'Base cabinet', 'Cozinha', 'Kitchen'],
    ]),
    materials: materials('cozinha-marinho', [
      ['Piso de cimento queimado', 'Burnished cement flooring', 'Área interna', 'Interior'],
      [
        'Tinta acrílica fosca Suvinil, cor Algodão Egípcio',
        'Suvinil matte acrylic paint, Algodão Egípcio',
        'Paredes',
        'Walls',
      ],
      ['MDF laminado, cor Azul Marinho', 'Laminated MDF, Navy Blue', 'Armários', 'Cabinets'],
      ['Azulejo tijolinho branco', 'White subway tile', 'Parede da pia', 'Sink wall'],
      ['Quartzo branco', 'White quartz', 'Bancada da pia', 'Sink countertop'],
      ['MDF Duratex, Carvalho Malva', 'Duratex MDF, Carvalho Malva', 'Nichos', 'Cubbies'],
    ]),
    model: {
      url: `${base}models/cozinha-marinho.glb`,
      zones: [
        {
          id: 'cozinha',
          name: { pt: 'Cozinha e ilha', en: 'Kitchen and island' },
          description: {
            pt: 'Cozinha em L com armários azul-marinho, bancada em quartzo branco e ilha para refeições rápidas.',
            en: 'An L-shaped kitchen with navy cabinets, a white quartz countertop and an island for quick meals.',
          },
          boxes: [{ min: [-4.75, -0.1, -3.72], max: [-1.6, 3.4, -0.15] }],
        },
        {
          id: 'jantar',
          name: { pt: 'Sala de jantar', en: 'Dining area' },
          description: {
            pt: 'Mesa de jantar para seis lugares, entre a cozinha e a sala de estar.',
            en: 'A six-seat dining table between the kitchen and the living area.',
          },
          boxes: [{ min: [-1.3, -0.1, -3.15], max: [0.6, 3.4, -0.5] }],
        },
        {
          id: 'estar',
          name: { pt: 'Sala de estar', en: 'Living area' },
          description: {
            pt: 'Sofá em L, tapete geométrico e painel da TV com prateleiras em madeira.',
            en: 'An L-shaped sofa, a geometric rug and a TV wall with wooden shelves.',
          },
          boxes: [{ min: [1.7, -0.1, -2.95], max: [4.73, 3.4, 0.2] }],
        },
        {
          id: 'escada',
          name: { pt: 'Escada e canto de leitura', en: 'Staircase and reading corner' },
          description: {
            pt: 'Escada com guarda-corpo em vidro e poltrona sobre tapete redondo.',
            en: 'A staircase with a glass balustrade and an armchair on a round rug.',
          },
          boxes: [{ min: [0.8, -0.1, 1.5], max: [4.73, 3.4, 5.44] }],
        },
      ],
    },
  },
  {
    slug: 'livraria',
    title: { pt: 'Livraria', en: 'Bookshop' },
    category: 'commercial',
    summary: {
      pt: 'Livraria acolhedora com áreas de leitura no térreo e no mezanino.',
      en: 'A welcoming bookshop with reading areas on the ground floor and mezzanine.',
    },
    description: {
      pt: 'Livraria desenvolvida para oferecer um ambiente acolhedor e convidativo, incentivando a leitura, a convivência e momentos de descanso. O projeto contempla áreas para exposição de livros, espaço de atendimento, ambientes de leitura no térreo e mezanino, além de mobiliário planejado e iluminação aconchegante, proporcionando conforto e funcionalidade aos usuários.',
      en: 'A bookshop designed to offer a welcoming and inviting environment that encourages reading, socializing and moments of rest. The project includes book display areas, a service desk, reading areas on the ground floor and mezzanine, custom furniture and cozy lighting for comfort and functionality.',
    },
    tools: [floorPlanTool, modelingTool, ai('ChatGPT AI')],
    cover: file('livraria', 'render-01'),
    renders: renders('livraria', [
      ['Estantes, escada e mezanino', 'Bookcases, staircase and mezzanine'],
      ['Mesa expositora e área de leitura', 'Display table and reading area'],
      ['Sala de leitura no mezanino', 'Mezzanine reading lounge'],
      ['Entrada e estantes em mogno', 'Entrance and mahogany bookcases'],
    ]),
    plans: [
      { src: file('livraria', 'planta'), caption: { pt: 'Planta baixa', en: 'Floor plan' } },
      {
        src: file('livraria', 'planta-mezanino'),
        caption: { pt: 'Detalhe abaixo do mezanino', en: 'Detail below the mezzanine' },
      },
      { src: file('livraria', 'elevacao-1'), caption: { pt: 'Elevação 1', en: 'Elevation 1' } },
      { src: file('livraria', 'elevacao-2'), caption: { pt: 'Elevação 2', en: 'Elevation 2' } },
    ],
    planLayout: 'stacked',
    isometric: [{ src: file('livraria', 'isometrica'), caption: { pt: 'Vistas isométricas', en: 'Isometric views' } }],
    details: [],
    materials: materials('livraria', [
      ['Piso laminado Eucafloor Prime Click', 'Eucafloor Prime Click laminate flooring', 'Área interna', 'Interior'],
      ['Tinta acrílica fosca Coral, cor Bege Eterno', 'Coral matte acrylic paint, Bege Eterno', 'Paredes', 'Walls'],
      ['MDF laminado, cor Verde Musgo', 'Laminated MDF, Moss Green', 'Estantes', 'Bookcases'],
      ['Mogno com acabamento em verniz', 'Varnished mahogany', 'Estantes', 'Bookcases'],
      ['Linho branco', 'White linen', 'Estofados do sofá e das poltronas', 'Sofa and armchair upholstery'],
    ]),
    model: {
      url: `${base}models/livraria.glb`,
      zones: [
        {
          id: 'mogno',
          name: { pt: 'Estantes em mogno', en: 'Mahogany bookcases' },
          description: {
            pt: 'Estantes em mogno envernizado na entrada, ao longo das paredes laterais.',
            en: 'Varnished mahogany bookcases along the side walls by the entrance.',
          },
          boxes: [
            { min: [-2.2, -0.1, 0.5], max: [-1.5, 3.15, 4.6] },
            { min: [1.55, -0.1, 2.45], max: [2.2, 3.15, 4.6] },
          ],
        },
        {
          id: 'mesa',
          name: { pt: 'Mesa expositora', en: 'Display table' },
          description: {
            pt: 'Mesa central em madeira para exposição de lançamentos e destaques.',
            en: 'A central wooden table showcasing new releases and highlights.',
          },
          boxes: [{ min: [-0.7, -0.1, -0.1], max: [0.25, 1.8, 3.2] }],
        },
        {
          id: 'leitura',
          name: { pt: 'Área de leitura', en: 'Reading area' },
          description: {
            pt: 'Poltronas em linho branco sobre tapete redondo, junto às estantes.',
            en: 'White linen armchairs on a round rug, next to the bookcases.',
          },
          boxes: [{ min: [0.4, -0.1, -0.7], max: [2.2, 2.4, 2.45] }],
        },
        {
          id: 'verde',
          name: { pt: 'Estantes em verde musgo', en: 'Moss green bookcases' },
          description: {
            pt: 'Área sob o mezanino com estantes em MDF verde musgo e tapete.',
            en: 'The area below the mezzanine, with moss green MDF bookcases and a rug.',
          },
          boxes: [{ min: [-1.2, -0.1, -3.0], max: [2.2, 2.6, -0.8] }],
        },
        {
          id: 'atendimento',
          name: { pt: 'Atendimento', en: 'Service desk' },
          description: {
            pt: 'Balcão de atendimento com estante de livros ao fundo.',
            en: 'The service desk, with a bookcase behind it.',
          },
          boxes: [{ min: [0.25, -0.1, -4.6], max: [2.2, 3.15, -2.95] }],
        },
        {
          id: 'mezanino',
          name: { pt: 'Sala de leitura no mezanino', en: 'Mezzanine reading lounge' },
          description: {
            pt: 'Sofá e poltronas em linho branco, com vista para as estantes do térreo.',
            en: 'A white linen sofa and armchairs overlooking the ground-floor bookcases.',
          },
          boxes: [{ min: [-2.2, 3.2, -4.6], max: [2.2, 6.1, -0.85] }],
        },
      ],
    },
  },
];

export function findProject(slug: string | undefined): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
