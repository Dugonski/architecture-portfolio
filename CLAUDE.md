# CLAUDE.md

Portfolio website for **Maria Eduarda das Neves** (signature "Maria Neves", Design de Interiores, Curitiba - PR). The site is an immersive extension of her PDF portfolio: it keeps the PDF's look and content, and adds things the PDF can't do, like interactive 3D models.

Talk to the user in **Brazilian Portuguese**. Code, comments and commit messages are in English.

## Commits and Git

- **Short commits:** one subject line in Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `style:`), with no body.
- **No Claude attribution:** no `Co-Authored-By`, session links or "Generated with" lines in commits or PRs, and no AI model names anywhere in the repo.
- **Author:** `Dugonski <guidugonski1@gmail.com>` (set `git config user.name/user.email` if the environment uses something else).
- **Branches:** `main` deploys automatically to GitHub Pages. Experiments go on a separate branch (e.g. `feat/...`) and are only merged when the user approves.

## Commands

```bash
npm run dev          # development server
npm run build        # type check + production build
npm run lint         # ESLint
npm run format       # Prettier
```

Before committing: `npx prettier --check .`, `npm run lint` and `npm run build`. Prettier: single quotes, 120 columns.

## Structure

- `src/data/projects.ts`: projects, in the PDF's order (Studio compacto, Brinquedoteca, Cozinha Marinho, Livraria). Each has renders, plans, isometric views, joinery sheets (`details`), materials, and optionally a `model` (3D).
- `src/data/site.ts`: profile, contact details, experience and education.
- `src/i18n/translations.ts`: interface strings in PT and EN. **All content must have both languages** (`{ pt, en }`).
- `src/components/viewer/`: 3D viewer (zone selection, highlight/isolate, sections). Zones are defined by node name or by boxes in meters.
- `src/components/hero/`: furniture that falls into the hero, modeled in code (`pieces.tsx`), with colors from the projects' materials (`palette.ts`).
- `public/projects/<slug>/`: images cropped from the PDF (`render-01.jpg`, `planta.jpg`, `elevacao-1.jpg`, `isometrica.jpg`, `prancha-01.jpg`, `material-1.jpg`…).
- `public/models/`: optimized `.glb` files. Raw exports go in `models-src/` (not versioned) and go through `scripts/optimize-model.mjs` (see README).

## Visual identity (follows the PDF)

- Paper `#f9f8f4`, green-charcoal ink `#2a332c`, sage accent `#5f7358`. Colors live as variables in `src/styles/global.css`.
- Names and titles in italic **Cormorant Garamond** (`.display` class). Labels in spaced uppercase **Tenor Sans**.
- Section titles use `RuleHeading`: uppercase text followed by a thin line, as on the PDF pages.
- Square corners, thin lines, lots of white space. Avoid saturated colors and heavy shadows.
- The site should be a faithful adaptation, not a copy of the PDF: the user rejected a contents list identical to the PDF's, and prefers distinctive experiences (alternating project panels, render thumbnails, falling 3D furniture).

## Lessons learned

- **Effects must not return values:** `useEffect(() => window.scrollTo(0, 0))` crashed navigation, because `scrollTo` returns a Promise in recent Chrome. Always use a function body.
- **Measuring the layout:** components that read refs from parent or sibling elements must do it in `useEffect`, not `useLayoutEffect`. When a lazy component is already cached, it mounts before those refs are attached.
- **GitHub Pages:** the site lives under `/architecture-portfolio/`. Use `import.meta.env.BASE_URL` for public files. The workflow copies `index.html` to `404.html` so direct links work.
- **Optimizing models:** SketchUp exports are heavily instanced and often carry hidden-layer junk (scale figures, annotation markers) and ceilings that hide the interior; check the result visually from above before wiring zones. Compressed models use quantized attributes and `EXT_meshopt_compression`, so viewer code must not write world coordinates back into the loaded attributes.
- **Testing:** to check visually, use Playwright (Chromium) with the build served by route interception. Google Fonts can be blocked in the cloud environment, so abort those requests and use `waitUntil: 'domcontentloaded'`.

## Pending (confirm with the user)

- **Phone:** the PDF says (43) 98863-5268 (the one currently on the site), LinkedIn says (43) 9 9863-5268.
- **Project years:** missing for Brinquedoteca and Livraria.
- **3D models:** all four projects have one (SketchUp `.glb` exports, already in meters, with textures but meaningless node names, so zones use `boxes`). The exact optimize commands are in the README. Exports with named rooms would allow `nodes` zones.
