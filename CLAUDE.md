@AGENTS.md

# BimaNetra Web — Project Conventions

Ground rules live in `../Context/frontend-component-guidelines.md`. Summary:

1. React + Next.js (App Router, TypeScript) only. Dev server: `npm run dev` → http://localhost:9000/directors-and-officers-insurance/
2. **No hardcoded copy/data in components** — all content flows from `src/lib/api/*` (backed by `src/mocks/*`). Swap the internals of one api file when a real backend exists.
3. **No Tailwind.** Styling = design tokens in `src/styles/globals.css` (CSS custom properties mapped from Figma variables) + CSS Modules per component. No raw hex/px magic values in components.
4. **Typography mandate:** only two typefaces exist — Anek (full multiscript chain, `--font-body`) and Instrument Serif (`--font-display`). Never introduce another font. The BIMAKAVACH logotype is flat SVG artwork, not text.
5. Ikkat diamond marks/rules are color-through-mask (`.ikkat-mark`, `.ikkat-line` in globals.css) per `../Context/ikkat-divider.md` — recolor with `--ikkat-color`, never edit the SVG.
5b. **Squircle corners are global** (`corner-shape: var(--corner-smoothing)` in globals.css, ≈ Figma 60% smoothing). Every rounded rect gets it automatically. **A complete circle (`border-radius: 50%`) must add `corner-shape: round`** to stay round.
6. One component per folder with `index.ts` barrel + `*.module.css`; typed `Props` interface; usage comment at top of each component file; ~150-line soft limit.

## Structure

```
src/
  app/                      # routes (page at /directors-and-officers-insurance)
  components/
    ui/                     # generic presentational (TagPill, CtaButton, IkkatMark, …)
    layout/                 # Navbar
    features/product-hero/  # page-specific compositions
    icons/                  # CompassIcon (design-owner-supplied, verbatim)
  lib/api/                  # mock API seam — ONLY data source for components
  mocks/                    # fixtures
  styles/globals.css        # design tokens + ikkat masks + shimmer
  types/                    # shared interfaces
public/figma/               # assets exported from Figma (logos, icons, masks)
public/media/               # local D&O media (video, dithered still, rings logo)
```

## Figma source
Page: node `179:65816` in the BimaNetra file (`setdRkBn3f8DdFXRw8qZBl`); navbar: node `179:68320`.
