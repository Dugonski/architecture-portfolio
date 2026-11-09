# Portfólio de Arquitetura

Portfólio de arquitetura e interiores com modelos 3D interativos. Cada projeto pode ser explorado no navegador: é possível girar o modelo, selecionar ambientes específicos, isolá-los e fazer cortes.

## Funcionalidades

- **Modelos 3D interativos** (Three.js / React Three Fiber) carregados a partir de arquivos glTF/GLB.
- **Seleção de ambientes**: clique no modelo ou na lista lateral para focar em uma parte do projeto (ou volte ao projeto completo com `Esc`).
- **Destacar ou isolar**: os demais ambientes ficam translúcidos ou são ocultados.
- **Cortes** horizontal, longitudinal e transversal, com preenchimento escuro nas superfícies cortadas.
- **Vistas rápidas**: enquadrar, planta (vista superior) e perspectiva, além de tela cheia.
- **Galeria** de fotos/renders e **plantas** com visualização ampliada.
- **Páginas** de projetos (com filtro por tipologia), sobre e contato.
- **Bilíngue** (português e inglês), com preferência salva no navegador.
- Layout responsivo para desktop e celular.

## Tecnologias

React 19, TypeScript, Vite, Three.js, @react-three/fiber, @react-three/drei, React Router e glTF-Transform.

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
```

```bash
npm run dev
```

| Script            | Descrição                                |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento              |
| `npm run build`   | Verificação de tipos e build de produção |
| `npm run preview` | Serve o build de produção localmente     |
| `npm run lint`    | ESLint                                   |
| `npm run format`  | Formata o código com Prettier            |

## Estrutura

```
public/
  models/                 Modelos .glb otimizados
  projects/<slug>/        Capas, imagens e plantas de cada projeto
scripts/
  optimize-model.mjs      Otimização de modelos exportados
src/
  components/viewer/      Visualizador 3D (seleção, isolamento, cortes)
  data/projects.ts        Conteúdo dos projetos e definição dos ambientes
  data/site.ts            Nome, contatos e textos do escritório
  i18n/                   Traduções da interface
  pages/                  Páginas do site
```

## Adicionando um projeto

1. **Otimize o modelo.** Exportadores costumam gerar milhares de objetos separados, o que deixa o modelo pesado no navegador. O script junta a geometria por material, remove objetos soltos fora do projeto, converte unidades e centraliza o modelo:

   ```bash
   node scripts/optimize-model.mjs models-src/projeto.glb public/models/projeto.glb --scale 0.0254 --center
   ```

   - `--scale`: fator para converter em metros (`0.0254` para polegadas, padrão do SketchUp; `0.01` para centímetros; `1` se já estiver em metros).
   - `--crop x0,y0,z0,x1,y1,z1`: descarta geometria fora desta caixa (nas unidades originais).
   - `--center`: centraliza o modelo e coloca o piso em `y = 0`.

   Os arquivos originais ficam em `models-src/`, que não é versionado.

2. **Adicione as imagens** em `public/projects/<slug>/`.

3. **Cadastre o projeto** em `src/data/projects.ts`, com textos em português e inglês.

### Definindo os ambientes selecionáveis

Cada ambiente (`zones`) pode ser definido de duas formas, e a primeira regra que corresponder vence:

- **Por nome** (`nodes`): se o modelo foi exportado com objetos nomeados (por exemplo, grupos `Sala` e `Cozinha` no SketchUp, Blender ou Revit), basta listar os nomes. É a forma mais precisa.
- **Por região** (`boxes`): caixas em metros, nas coordenadas do modelo otimizado. Toda face contida inteiramente em uma caixa pertence ao ambiente. Assim dá para dividir modelos exportados sem nomes, como o da Brinquedoteca.

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

Faces fora de qualquer ambiente formam a base do projeto: o piso continua visível e as paredes podem ser ocultadas pelo painel.

## Deploy

O site é publicado no GitHub Pages automaticamente a cada push na `main`, pelo workflow `.github/workflows/deploy.yml`.

Configuração (uma única vez): em **Settings → Pages → Build and deployment**, escolha **Source: GitHub Actions**.

Endereço: `https://<usuario>.github.io/<repositorio>/`. O workflow ajusta o caminho base pelo nome do repositório e copia o `index.html` para `404.html`, para que links diretos (como `/projetos/brinquedoteca`) funcionem.

Para outras hospedagens estáticas (Vercel, Netlify), use `npm run build` e publique a pasta `dist/` com _SPA fallback_ para o `index.html`.
