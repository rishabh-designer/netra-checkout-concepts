# BimaNetra — Project State

**What:** Next.js (App Router, TS, Turbopack), React 19, motion 13. D&O Insurance product page with a lead-capture flow. Dev: `npm run dev` → `http://localhost:9000/directors-and-officers-insurance/`. Repo: `web/`, branch `main`, auto-deploys to Vercel (team `bk-design`) on push.

**Conventions:** Two typefaces only — Anek (`--font-body`, never italic), Instrument Serif (`--font-display`). No Tailwind; design tokens in `src/styles/globals.css` + CSS Modules. No hardcoded copy — content flows `src/mocks/productPage.ts` → `src/lib/api` → components. Folder-per-component (`index.ts` barrel, `*.module.css`). Squircle corners global; ikkat marks are color-through-mask (never edit the SVG).

**Flow:** Hero `LeadFormCard` → `QuoteModal` (Profile → Business → Risk → Report). Typed name routes case A (verified) / B (guessed/fuzzy) / C (not found). Left "Intelligence Engine" panel: task runner + progress meter + per-step search viz (Business=BimaNetra tab shows CIN; Risk=News tab shows a mixed press feed).

**Recent work:** Peetal DSL fields (`InteractiveInput`, `SegmentedField`, `SquareCheckbox`), `IkkatDivider`, Risk-step news copy, green personalize banner + DSL info checkbox, tab/label renames.

**Caveat:** Git commits record local identity (`rishabhbhaumik@…local`), not the BimaKavach email — set `git config --global user.email` to fix.
