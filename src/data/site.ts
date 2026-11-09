import type { Localized } from '../types';

export interface TimelineEntry {
  title: Localized;
  place: string | Localized;
  period: Localized;
  location?: string;
  details?: Localized[];
}

/** Personal information shown in the header, footer and about/contact pages. */
export const site = {
  name: 'Maria Eduarda das Neves',
  /** Signature used in the PDF portfolio. */
  brand: 'Maria Neves',
  shortName: 'Maria Neves',
  role: { pt: 'Design de Interiores', en: 'Interior Design' } satisfies Localized,
  email: 'duda.dduddaneveswork@gmail.com',
  phone: '(43) 98863-5268',
  city: { pt: 'Curitiba - PR', en: 'Curitiba, Brazil' } satisfies Localized,
  social: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/maria-eduarda-das-neves-arquitetura-e-interiores',
    },
    { label: 'Canva', href: 'https://canva.link/s13ashc05z0liwt' },
  ],
  bio: [
    {
      pt: 'Sou profissional de modelagem 3D e visualização arquitetônica, com atuação em design de interiores e projetos residenciais e comerciais. Transformo plantas e conceitos em modelos 3D executáveis e renders que orientam a obra e reduzem incertezas.',
      en: 'I work in 3D modeling and architectural visualization, focusing on interior design and residential and commercial projects. I turn plans and concepts into buildable 3D models and renders that guide construction and reduce uncertainty.',
    },
    {
      pt: 'Já usei AutoCAD, SketchUp, Revit e SolidWorks em projetos que vão da implantação industrial a soluções para espaços compactos, com experiência em leitura de desenho técnico, levantamento métrico, detalhamento de marcenaria e implantação de mezanino, sempre com foco em viabilidade de fabricação e eficiência de montagem.',
      en: 'I have used AutoCAD, SketchUp, Revit and SolidWorks on projects ranging from industrial layouts to solutions for compact spaces, with experience in technical drawing, site measurement, joinery detailing and mezzanine installation, always focused on manufacturability and efficient assembly.',
    },
    {
      pt: 'Vamos avaliar como posso apoiar seu projeto com modelagens precisas, detalhamento executivo e entregas técnicas orientadas à execução.',
      en: "Let's talk about how I can support your project with precise models, construction detailing and technical deliverables built for execution.",
    },
  ] satisfies Localized[],
  skills: [
    { pt: 'Modelagem 3D', en: '3D modeling' },
    { pt: 'Renderização e visualização arquitetônica', en: 'Rendering and architectural visualization' },
    { pt: 'Detalhamento de marcenaria', en: 'Joinery detailing' },
    { pt: 'Levantamento métrico', en: 'Site measurement' },
    { pt: 'Leitura de desenho técnico', en: 'Technical drawing interpretation' },
    { pt: 'Controle dimensional', en: 'Dimensional control' },
  ] satisfies Localized[],
  tools: ['AutoCAD', 'SketchUp', 'Revit', 'SolidWorks', 'Trimble Connect', 'TOTVS', 'UpMobb', 'Canva', 'Excel'],
  languages: [{ pt: 'Inglês — profissional', en: 'English — professional working' }] satisfies Localized[],
  experience: [
    {
      title: { pt: 'Assistente Orçamentista', en: 'Budget Assistant' },
      place: 'Grupo ODK',
      period: { pt: 'set. 2026 — atual', en: 'Sep 2026 — present' },
      location: 'São José dos Pinhais, PR',
    },
    {
      title: { pt: 'Design de Interiores', en: 'Interior Design' },
      place: { pt: 'Projetos pessoais', en: 'Personal projects' },
      period: { pt: 'mar. 2026 — atual', en: 'Mar 2026 — present' },
      location: 'Curitiba, PR',
      details: [
        {
          pt: 'Projetos conceituais residenciais e comerciais em arquitetura, design de interiores e modelagem 3D.',
          en: 'Conceptual residential and commercial projects in architecture, interior design and 3D modeling.',
        },
        {
          pt: 'Layouts, modelagens 3D e detalhamentos executivos de marcenaria, com foco em funcionalidade, ergonomia e viabilidade construtiva.',
          en: 'Layouts, 3D models and joinery construction details, focused on function, ergonomics and buildability.',
        },
        {
          pt: 'Estudos de acabamentos, revestimentos, mobiliário e otimização dos ambientes.',
          en: 'Studies of finishes, cladding, furniture and space optimization.',
        },
      ],
    },
    {
      title: { pt: 'Aprendiz', en: 'Apprentice' },
      place: 'Volvo Group',
      period: { pt: 'jul. 2024 — jul. 2026', en: 'Jul 2024 — Jul 2026' },
      location: 'Curitiba, PR',
      details: [
        {
          pt: 'Leitura e interpretação de desenhos técnicos para ajustes e inspeções dimensionais em peças de ferramentaria.',
          en: 'Read and interpreted technical drawings to support adjustments and dimensional inspections of tooling parts.',
        },
        {
          pt: 'Desenhos técnicos em CAD e detalhamento de interfaces entre engenharia e manufatura.',
          en: 'Produced CAD drawings and detailed interfaces between engineering and manufacturing.',
        },
        {
          pt: 'Modelagem 3D do mezanino da ferramentaria, antecipando ajustes estruturais e otimizando a implantação na planta industrial.',
          en: 'Modeled the toolroom mezzanine in 3D, anticipating structural adjustments and optimizing its installation in the plant.',
        },
      ],
    },
    {
      title: { pt: 'Aprendiz e Assistente de Produção', en: 'Apprentice and Production Assistant' },
      place: 'Pro Tork',
      period: { pt: 'set. 2022 — out. 2023', en: 'Sep 2022 — Oct 2023' },
      location: 'Siqueira Campos, PR',
    },
  ] satisfies TimelineEntry[],
  education: [
    {
      title: { pt: 'Bacharelado em Arquitetura e Urbanismo', en: 'Bachelor of Architecture and Urbanism' },
      place: 'Universidade Positivo',
      period: { pt: '2025 — 2030', en: '2025 — 2030' },
    },
    {
      title: { pt: 'Técnico em Manufatura Industrial', en: 'Technical Degree in Industrial Manufacturing' },
      place: 'Senai PR',
      period: { pt: '2024 — 2026', en: '2024 — 2026' },
    },
    {
      title: { pt: 'Design de Interiores', en: 'Interior Design' },
      place: 'Universidade Positivo',
      period: { pt: '2024 — 2025', en: '2024 — 2025' },
    },
  ] satisfies TimelineEntry[],
};
