# Maria Neves · Design de Interiores

Site de portfólio de Maria Eduarda das Neves, pensado como uma extensão imersiva do portfólio em PDF. Cada projeto reúne renders, planta baixa, elevações, vistas isométricas, detalhamento de marcenaria e especificação de materiais. Projetos com modelo 3D podem ser explorados direto no navegador.

**Site:** https://dugonski.github.io/architecture-portfolio/

## Projetos

| #   | Projeto         | Tipologia     | Conteúdo                                                            |
| --- | --------------- | ------------- | ------------------------------------------------------------------- |
| 01  | Studio compacto | Residencial   | **Modelo 3D**, renders, plantas, isométricas, 8 pranchas, materiais |
| 02  | Brinquedoteca   | Institucional | **Modelo 3D**, renders, plantas, isométricas, materiais             |
| 03  | Cozinha Marinho | Residencial   | **Modelo 3D**, renders, plantas, isométricas, 5 pranchas, materiais |
| 04  | Livraria        | Comercial     | **Modelo 3D**, renders, plantas, isométricas, materiais             |

## Funcionalidades

- **Identidade visual do PDF**: papel claro, tinta verde-grafite, nomes em serifa itálica (Cormorant Garamond) e títulos em maiúsculas com linha fina (Tenor Sans).
- **Início**: capa inspirada no PDF e um painel por projeto, alternando os lados. As miniaturas permitem folhear os renders sem abrir o projeto.
- **Página de projeto**: abertura com descrição e ferramentas, renders, planta baixa e elevações, vistas isométricas, pranchas de marcenaria e tabela de materiais. Todas as imagens ampliam ao clicar e dá para navegar entre elas pelo teclado.
- **Visualizador 3D** (Three.js / React Three Fiber):
  - seleção de ambientes pela lista ou clicando no modelo (`Esc` volta ao projeto completo);
  - destacar ou isolar o ambiente selecionado e ocultar paredes;
  - cortes horizontal, longitudinal e transversal, com preenchimento nas superfícies cortadas;
  - vistas de planta e perspectiva, enquadramento e tela cheia.
- **Sobre e contato**: perfil, experiência, formação e formulário que abre o e-mail do visitante.
- **Bilíngue** (português e inglês), com a preferência salva no navegador.
- **Responsivo** para desktop e celular.

## Tecnologias

React 19, TypeScript, Vite, React Router, Three.js, @react-three/fiber, @react-three/drei e glTF-Transform.

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
```

```bash
npm run dev
```

| Script                 | Descrição                                    |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                  |
| `npm run build`        | Verificação de tipos e build de produção     |
| `npm run preview`      | Serve o build de produção localmente         |
| `npm run typecheck`    | Verificação de tipos (TypeScript)            |
| `npm run lint`         | ESLint                                       |
| `npm run format`       | Formata o código com Prettier                |
| `npm run format:check` | Confere a formatação sem alterar os arquivos |

## Estrutura

```
public/
  models/                  Modelos .glb otimizados
  projects/<slug>/         Renders, plantas, pranchas e amostras de cada projeto
scripts/
  optimize-model.mjs       Otimização de modelos 3D exportados
src/
  components/              Layout, painéis de projeto, figuras e lightbox
  components/viewer/       Visualizador 3D (seleção, isolamento, cortes)
  data/projects.ts         Conteúdo dos projetos e ambientes dos modelos 3D
  data/site.ts             Perfil, contatos, experiência e formação
  i18n/                    Traduções da interface
  pages/                   Início, projeto, sobre, contato e 404
  styles/global.css        Identidade visual
```

## Adicionando um projeto

1. **Imagens**: coloque os arquivos em `public/projects/<slug>/`, seguindo os nomes usados nos projetos atuais:

   | Arquivo                           | Conteúdo                               |
   | --------------------------------- | -------------------------------------- |
   | `render-01.jpg` … `render-04.jpg` | Renders (o primeiro é a capa)          |
   | `planta.jpg`, `elevacao-1.jpg` …  | Planta baixa e elevações               |
   | `isometrica.jpg`                  | Vistas isométricas                     |
   | `prancha-01.jpg` …                | Pranchas de detalhamento de marcenaria |
   | `material-1.jpg` …                | Amostras da especificação de materiais |

2. **Conteúdo**: cadastre o projeto em `src/data/projects.ts`, com os textos em português e inglês. A ordem da lista é a ordem em que os projetos aparecem no site.
   - `planLayout: 'side'` (padrão) para plantas na vertical, com as elevações ao lado.
   - `planLayout: 'stacked'` para plantas na horizontal, com as elevações abaixo. Use `wide: true` em desenhos muito largos para ocuparem a linha inteira.

3. **Modelo 3D** (opcional): veja a seção abaixo.

## Modelos 3D

### Exportação

Exporte em `.glb` direto do programa de modelagem para manter as texturas: no SketchUp, por uma extensão de exportação glTF; ou passando pelo Blender (`.dae`/`.fbx` → _File → Export → glTF 2.0_). Conversores online costumam descartar texturas e nomes de objetos.

### Otimização

Exportadores costumam gerar milhares de objetos separados (e o SketchUp repete cada componente várias vezes), o que deixa o modelo pesado no navegador. O script aplica as transformações, junta a geometria por material, remove objetos soltos, simplifica as malhas muito densas (plantas, tecidos, enfeites), reduz as texturas para WebP de até 1024 px, comprime a geometria com meshopt e centraliza o modelo:

```bash
node scripts/optimize-model.mjs models-src/projeto.glb public/models/projeto.glb --scale 0.0254 --center
```

- `--scale`: fator de conversão para metros (`0.0254` para polegadas, padrão do SketchUp; `0.01` para centímetros; `1` se já estiver em metros).
- `--crop x0,y0,z0,x1,y1,z1`: descarta a geometria fora desta caixa (nas unidades originais).
- `--center`: centraliza o modelo e coloca o piso em `y = 0`.
- `--drop <regex>`: remove as faces com material correspondente (por exemplo, as figuras humanas de escala do SketchUp).
- `--drop-markers <a>:<b>`: remove marcações exportadas por engano (objetos com o material `<a>` e os objetos com o material `<b>` encostados neles).
- `--simplify`, `--dense`, `--dense-error`, `--texture-size`: ajustes da simplificação e das texturas (veja o cabeçalho do script).

Comandos usados nos modelos atuais (todos já exportados em metros):

```bash
node --max-old-space-size=12288 scripts/optimize-model.mjs models-src/residencial.glb public/models/studio-compacto.glb --center "--drop-markers=^\[Color A04\]:^\[Color E02\]"
node --max-old-space-size=12288 scripts/optimize-model.mjs models-src/brinquedoteca.glb public/models/brinquedoteca.glb --center --crop=5,-0.2,-11.5,15.8,2.98,-5.8
node --max-old-space-size=12288 scripts/optimize-model.mjs models-src/cozinha.glb public/models/cozinha-marinho.glb --center --crop=-1,-0.2,-10.8,9.6,3.5,1.0 "--drop=^(Ty_|Lisanne_)"
node --max-old-space-size=12288 scripts/optimize-model.mjs models-src/livraria.glb public/models/livraria.glb --center --crop=5,-0.5,8.5,12,5.64,18.5
```

Os recortes da Brinquedoteca e da Livraria ficam logo abaixo do forro, para que o modelo abra visto de cima. Valores de `--crop` que começam com `-` precisam da forma `--crop=...`.

O recorte do forro deixa as paredes ocas por cima. Para fechá-las com o preenchimento escuro de corte (como nas vistas isométricas do portfólio), rode em seguida:

```bash
node scripts/cap-walls.mjs public/models/brinquedoteca.glb public/models/brinquedoteca.glb
node scripts/cap-walls.mjs public/models/livraria.glb public/models/livraria.glb
```

O script corta o modelo 3 cm abaixo do topo (`--depth`), fecha os contornos das paredes e móveis cortados e ignora superfícies abertas, como painéis ripados e vidros.

Para remover partes exportadas junto que não fazem parte do projeto, use `remove-region.mjs` com uma área em metros (x0,z0,x1,z1, nas coordenadas do modelo otimizado). Os triângulos que cruzam a borda são recortados, então paredes longas e pisos não ficam sobrando. Na Cozinha Marinho, ele removeu os dois cômodos atrás da parede da TV:

```bash
node scripts/remove-region.mjs public/models/cozinha-marinho.glb public/models/cozinha-marinho.glb --box=0.8,-5.6,5,-3.45
```

Os arquivos originais ficam em `models-src/`, que não é versionado.

### Ambientes selecionáveis

No projeto, informe `model: { url, zones }`. Cada ambiente pode ser definido de duas formas, e a primeira regra que corresponder vence:

- **Por nome** (`nodes`): se o modelo foi exportado com objetos nomeados (por exemplo, grupos `Sala` e `Cozinha`), basta listar os nomes. É a forma mais precisa.
- **Por região** (`boxes`): caixas em metros, nas coordenadas do modelo otimizado. Toda face contida inteiramente em uma caixa pertence ao ambiente. É assim que os quatro modelos atuais, exportados sem nomes, foram divididos.

```ts
zones: [
  {
    id: 'sala',
    name: { pt: 'Sala de estar', en: 'Living room' },
    description: { pt: '…', en: '…' },
    area: 24.5, // opcional, em m²
    nodes: ['Sala'],
    // ou: boxes: [{ min: [-5, 0, -2.5], max: [0, 3, 2.5] }],
  },
];
```

As faces fora de qualquer ambiente formam a base do projeto: o piso continua visível e as paredes podem ser ocultadas pelo painel.

## Deploy

O site é publicado no GitHub Pages manualmente, pelo workflow `.github/workflows/deploy.yml`. Os pushes na `main` não publicam nada: quando quiser atualizar o site, vá em _Actions → Deploy to GitHub Pages → Run workflow_ (branch `main`).

- **Configuração (uma única vez):** em _Settings → Pages → Build and deployment_, escolha _Source: GitHub Actions_.
- **Caminho base:** o workflow usa o nome do repositório (`/architecture-portfolio/`) e copia o `index.html` para `404.html`, para que links diretos como `/projetos/brinquedoteca` funcionem.
- **Outras hospedagens** (Vercel, Netlify): rode `npm run build` e publique a pasta `dist/`, configurando o _SPA fallback_ para o `index.html`.
