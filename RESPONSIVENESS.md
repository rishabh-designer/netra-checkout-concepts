# Responsiveness

How BimaNetra adapts to a phone. Distilled from the September 2026 mobile pass, which took every screen from the landing page to the success page through a 375 × 812 review. Read this before building or changing a mobile layout, and add to it when you learn something new.

---

## 1. Ground rules

1. **Mobile changes are mobile-only.** A size, padding, gap or radius change made during a mobile review goes in the component's below-web media block. Web values stay exactly as they are. If a change has to touch web too, say so before making it.
2. **Design at 375 × 812** (the Figma phone frame). Sanity-check 320 and 430.
3. **Never scroll sideways.** The page is exactly as wide as the screen. Check with `document.documentElement.scrollWidth === innerWidth`.
4. **Content never truncates or scrolls inside itself.** Multi-line entries grow to fit their text, rows wrap or stack, and names show in full where there's any way to fit them.
5. **House rules hold at every size:**
   - Fonts are Anek and Instrument Serif only. Anek below 18px is weight 500.
   - Letter-spacing is `var(--track-{weight})`.
   - Buttons are one radius step up from Figma, and a button's icon matches its label size.
   - Copy is British English, with Title Case labels and no em dashes.
   - IRDAI: never "best" or "recommended". Orange means BimaNetra.

---

## 2. Breakpoints

As they stand in the code (`@media (max-width: …)`):

| Width | What switches there |
|---|---|
| **1100** | Layouts stack into one column: Quotes page, Your Details accordion, Checkout (and its pinned footer), Success, Quote Requested. The JS hook is `useCheckoutMobile`. |
| **999** | The general "mobile" block: landing (hero, lead form, proof row, pills), checkout fields and banners, header bar, drawer titles, purchase summary, success extras. |
| **900** | Modals become bottom sheets: Quote form (`QuoteModal`), policy details (`FeaturesModal`), `CompareView`. |
| **760 / 767** | Quotes feed controls become one bar, plus the compare sheet, quotes feed, step form, coverage chips and upgrade banner. |
| **700** | `SideDrawer` phone padding, Success stats and greeting stack. |
| **600 / 560** | Quote Requested padding, HelpDesk, Risk Held modal. |
| 640, 1200, 1440 | Navbar; web-only tightening. |

**Observation:** there are too many one-off breakpoints. The intent is really three tiers:

- **≤1100 "stacked":** anything two-column goes to one column.
- **≤999 "mobile":** sizes and spacing.
- **≤900 "sheet":** popups become sheets.

Reuse those three and don't add new ones. Fold the stragglers in when you next touch them.

**When layout needs JS**, read the width with a `matchMedia` hook on `useSyncExternalStore`: `useCheckoutMobile` (1100), `FeaturesModal` (900), `QuoteModal` (`SHEET_QUERY`, 900), `DetailsPanel` (1100). Screens that only render on the client (behind the quote flow's `hydrated` flag) can read `matchMedia` straight in a `useState` initialiser, so the very first paint is already right. Don't set it in an effect, which flashes the web state first.

---

## 3. Space

| Thing | Mobile value |
|---|---|
| Page gutter | **16** each side (quotes, checkout, landing, success, Quote Requested) |
| Header bar | **12** each side |
| Sections with no chrome (checkout form sections, Other Quotes) | **0** side padding of their own: they run to the page's 16 gutter |
| Cards with chrome | tighter: **12** (sheet surfaces, compact summary card, Quote Requested card), engine strip **8/12**, policy sheet **12/16/16** |
| Your Details panel | **0** padding, **r16** |
| Promo banner | **8/12**, **r12** |
| Drawers and bottom sheets | **4** from each side edge (the scrim shows either side); **12** inner padding (quote sheet). A floating drawer (checkout Edit) keeps 16 above and below; centred popups keep **16** all round. On web, drawers float **32** from the edges with r32. |
| Stats row | **12** gap, equal widths |

**Don't double the gutters.** A card with 24px padding inside a 16px page wastes 40px a side, which is over a fifth of a 375px screen. On a phone either the card's padding drops to 12 or the section loses its chrome.

---

## 4. Type (mobile sizes)

| Element | Web | Mobile |
|---|---|---|
| Checkout title (serif) | 48 | **34** |
| Drawer / sheet titles (serif) | 32 | **28** |
| Quote Requested title (serif) | 32 | **28** |
| "Your Quote Request" / "You're Upgraded!" (serif) | 28 | **24** |
| Paid amount (serif) | 40 | **32** |
| Final price in footers (serif) | n/a | **28** |
| Product / section names | 16–20 | **14–20** as specified |
| Field values | 18 | **16**. Never below 16 in an input, or iOS zooms on focus. |
| Notice banners | 14 | **12** |
| Manager note, suggestion names | 16 | **14** |

- A label that wraps gets `line-height: 1.2`.
- In a row of labels, if one wraps they all take the same height and the values stay level (subgrid or JS; see `ProofRow`).
- Serif letter-spacing is set in `em` (for example `-0.01em`) so it scales with the size. Don't carry a fixed `px` value down from web.

---

## 5. Layout patterns

### 5.1 Stack, don't squeeze
When a row doesn't fit, stack it:
- a section title over its switch;
- the promo banner: badge top-left with Know More top-right, the label across the full width under both;
- the success greeting: badge over the text.

Four stats become a **2 × 2** grid. Chips wrap, and so do breadcrumbs.

### 5.2 Fit whole items
- **Carousels** show only what fits, with no repeats: the insurer logos show 6 on web and 4 on a phone (`InsurerLogoShowcase` folds by measured width).
- **Stat rows** use equal-width stats with uniform two-line labels.
- **Swipe rows** show one full card at a time.

### 5.3 Progressive disclosure
- Your Details is a closed accordion on mobile: header only, with its underline and the gap under it removed.
- Task dropdowns start closed.
- The Purchase Summary lives in the checkout footer and opens on demand.
- The feed controls fold into one bar (the Immediate switch plus "Sort & Filter"), which opens a sheet.

### 5.4 Pinned header, one scroll, pinned footer
A sheet or page with a primary action never has two scroll areas. The header and footer are pinned and only the content scrolls. The engine strip sizes to its content and never scrolls.

### 5.5 Status and action in the thumb zone
A pinned footer pairs the system's status with the CTA it gates:
- **Checkout:** "Preparing Checkout" (tap it to open the summary), the price, the step CTA and any consent.
- **Quote sheet:** the engine strip right above Continue.
- **Success:** "Sign Mandate Letter" moves from the crowded header to a pinned footer.

CTA copy can shorten when the price sits beside it: "Pay ₹10,000" becomes "Pay Now".

If the primary CTA is already visible on arrival and nothing below gates it, leave it inline.

### 5.6 Popups become bottom sheets
- **Shape:** full width, rounded 24 on top, anchored to the screen's foot, rising from the bottom.
- **Height:** content height up to 85% (`SideDrawer placement="bottom"`), or full height for long reads (policy details: sticky top bar with pager and close, footer pinned behind a white mask).
- **Quote form:** a full sheet with **40** of scrim above. Edit Details (its form-only mode) is the same sheet on phones, without the engine strip, title 28. On web it stays the left drawer.
- **Scrim:** `SCRIM` from `SideDrawer` (A9ACB1 at 80% with a 6px blur). A tap outside or Escape closes the sheet.
- **How:** `SideDrawer` takes `sheetOnMobile` to turn a right-hand drawer into a sheet on phones.

### 5.7 Keep the header light
One CTA in the header. A second one moves to the footer (Success).

### 5.8 Hide secondary chrome on a phone
- timers: `hideTime`, as on web (the clock still counts);
- ikkat marks between stats;
- in the folded engine strip: the request bubble and message, and the done and upcoming tasks;
- the ikkat bead rule above a CTA, replaced by a plain hairline.

### 5.9 Scale illustrations whole
A fixed-size illustration scales as one piece to fit its box: measure the box, then `transform: scale()` (the Risk Held letter). Never clip it.

### 5.10 Repeating ornaments
The CSS mask line (`IkkatLine`) repeats a two-mark tile with `mask-repeat: space`. When only two tiles fit, the spare room becomes one big hole in the middle. On phones use `IkkatDivider`, which counts the marks and spaces them evenly.

### 5.11 Touch
- A small visual control keeps its look but gets a **44px** hit area (`::after { inset: -12px }`), for example the 20px Disclaimer chevron.
- Inputs use 16px text.

### 5.12 Multi-line entry grows
A textarea is always as tall as its text: set `height: auto` then `scrollHeight` on every change, with no inner scroll and no resize handle (`InteractiveInput`).

---

## 6. Motion

- **Sheets slide on `transform`:** `y: 100% → 0` over 450–550ms, ease `[0.16, 1, 0.3, 1]`. The exit is quicker (about 280ms, ease-in).
- **Tween height only where the design needs growth.**
  - Measure the folded height into a CSS variable (`--engine-from`) and keyframe from it, anchored to the bottom so it grows upwards.
  - The checkout footer's summary also tweens height. It's fine on desktop, but watch it on low-end phones.
- **Closing is the opening reversed.** Never snap.
  - The old task drawer flashed a tall panel on close: its body's 200ms fade outlived the overlay.
  - The fix: hold the overlay while it plays out, then remove the body instantly.
- **Soothing waits:** the engine card opens and closes over 600ms on `cubic-bezier(1, 0, 0, 1)`.
- **Choreograph the waiting (quote form):**
  - The Profile intro arrives open and settles 900ms after BimaNetra's reply has typed.
  - On researched steps (Cases A and B) the card rises about 450ms after the step moves, then closes 900ms after the verdict, onto fields that are already filled.
  - Revisited steps, Case C's research and reduced motion stay still.
- **Hand-offs never show the previous page.** Keep the destination's skeleton up until the route swaps, as "Get Instant Quotes" does. Closing the modal must not take the backdrop with it.
- **Measured smooth:** at 120fps with no dropped frames, the Sort & Filter sheet, the policy sheet, the compare sheet and the task drawer's open.
- **Reduced motion:** everything above becomes instant.

---

## 7. Skeletons

- **Mirror the mobile layout, not the web one:**
  - the closed accordion header, and the one-line controls bar instead of the fields row;
  - full-width cards, and heading bars that stay within the screen;
  - the stacked greeting and 2 × 2 stats;
  - the accordion timeline, with only the active step open.
- **Per-breakpoint sizes go in CSS.** `Skeleton` sets `width`/`height` inline, and inline styles win over the stylesheet, so any size that differs per breakpoint must come from a class.
- **Target:** every block within about **3px** of the real page on both layouts. Measure it, don't eyeball it: compare `getBoundingClientRect()` of the skeleton at 300ms with the real page after it loads.
- **Backdrop skeletons** (the Quotes skeleton behind the quote form) follow the same mobile state, with Your Details shut.

---

## 8. Techniques

- **State on the container:** set `data-*` on the parent (`data-engine`, `data-open`, `data-collapsed`) and style descendants from it. Use `:has()` sparingly.
- **`display: contents`** lets a wrapper's children join the parent's grid or flex, so pieces can be reordered across wrappers. Used by the quote sheet's rows and the promo banner.
- **Grid layering:** when items share rows, give each one an explicit `grid-column`. Otherwise auto-placement pushes the overlapping item into a new column, which once squashed the quote sheet's header to 0 width.
- **Specificity:**
  - Double a class (`.a.a`) to beat another module's rule.
  - Stylesheet order between CSS modules isn't guaranteed, so never rely on source order across modules. Add specificity instead (`.wrap .phoneOnly`).
- **ResizeObserver on its own box:** react only to width changes, not to the box's own height change, or you get "ResizeObserver loop" warnings.
- **Sticky footer:** `position: sticky; bottom: 0` as the last child of the page flow (the checkout footer).
- **Scrims:** render a fixed scrim as a sibling, never a child, of a z-indexed element.
- **Strict Mode runs effects twice on mount (dev).** An effect that mutates a ref must be idempotent. The quote form's intro was skipped on first open until "seen" was marked only after it actually played.

---

## 9. Testing

- **Use a separate tab.** The user's tab holds their flow in `sessionStorage`, while a fresh tab starts clean. If a tab keeps redirecting, for example to the success page after an order, open a new one.
- **Set the phone size** with `resize_window` (375 × 812). The app clears it whenever the pane changes width, so set it again.
- **Throttling:** a background or unfocused tab throttles `requestAnimationFrame` and timers (1–2s per frame) and freezes screenshots.
  - Bring the tab to the front, and nudge a scroll before capturing.
  - Prefer DOM measurements (`getBoundingClientRect`), `MutationObserver` state logs and `getAnimations()` over screenshots and `setTimeout` sampling.
- **Stale CSS:** after hot reload or a server restart it can linger, so reload.
- **Checklist for every mobile change:**
  - no sideways overflow;
  - skeleton against real page, block by block;
  - animation frames at 16.7ms or less, with no reversals;
  - the state before, during and after.
- **Compare against the last push:** check it out into a `git worktree` and run it on another port. Clone `node_modules` with `cp -cR` (APFS copy-on-write); Turbopack rejects a `node_modules` symlink that points outside the project.

---

## 10. Screen by screen

- **Landing:**
  - The promo banner stacks: badge top-left with Know More top-right, the label across the full width.
  - The company field is 16px and its placeholder fits.
  - Insurer logos fold to what fits, and the proof stats are equal and centred with uniform labels and no ikkat marks.
  - "Policy Provided by" is centred, the pills are 4/6, and the breadcrumb ornament uses counted marks.
- **Quote form:**
  - A bottom sheet with a pinned header, fields that scroll over a hairline, and the engine strip plus Continue pinned at the bottom.
  - The engine card choreography (section 6).
  - "Get Instant Quotes" keeps the Quotes skeleton up through the hand-off.
- **Quotes page:**
  - Your Details is a closed accordion: 0 padding, r16.
  - The feed controls are one bar plus the Sort & Filter sheet.
  - The compare sheet has a top-right hint, three equal slots and a full-width CTA.
  - The Upgraded title is 24, and the HelpDesk phone button is 10/12.
- **Policy details:**
  - A full-height sheet with a sticky top bar (pager and close) and a masked footer.
  - Type steps down, and the 32px product icon sits beside the name.
- **Checkout:**
  - The summary moves into a pinned footer: status, final price and CTA, with the consent above them and a blurred scrim when open.
  - The compact summary card (r16, 12 padding, the beam at r16) shows when the footer is open.
  - Form sections have no side padding, the title stacks over its switch, fields are 16px, the address grows with its text, and the Disclaimer chevron is 20px with a 44px hit area.
- **Success:**
  - Sign Mandate Letter is pinned in a footer.
  - The Risk Held letter scales to fit, the paid amount is 32, and the manager note and suggestion names are 14.
  - The skeleton matches the accordion timeline.
- **Quote Requested:** see below.

### Quote Requested (`GoldInquiryView`, both variants)
Applied and checked at 375 (Case A priced request, Case B Gold inquiry), with web confirmed unchanged at 1512:

- **No sideways scroll:** breadcrumbs wrap on mobile (`BreadcrumbTrail`).
- **Gutters:** the page is 16, the thank-you card's padding drops from 24 to 12 (no doubled gutter), Other Quotes has no side padding of its own, and the top gap under the header shrinks from 47 to 16.
- **Type:** the title goes from 32 to 28 and "Your Quote Request" / "Your Gold Quote Inquiry" from 28 to 24.
- **Stats** in a 2 × 2 grid.
- **Other Quotes** swipes one full card at a time (no fade over the card), and its pager chevrons get 44px hit areas.
- **Rate Your Experience:** the Bad / Fine / Good chips share the row equally, 12 apart (web keeps them spread apart at their own widths).
- **"Request a Quote" drawer** becomes a bottom sheet on phones (`sheetOnMobile`), and its chat input goes from 14 to 16 so iOS doesn't zoom on focus. The Ask BimaNetra chat shares that input (`QuotesChat`).
- **CTA stays inline:** "Request Payment Link" / "Speak to an Expert" is visible on arrival, so it isn't pinned (5.5).

---

## 11. Open items

- Consolidate the breakpoints into the three tiers (section 2).
- Single-line inputs still end long values in "…" (company name in some fields). Wrap them?
- The landing page's Know More and the Case B Gold gate are still centred popups on phones. Make them sheets (5.6)?
- The checkout footer's summary opens with a height tween. Check it on a real low-end phone.
- Case C still gets the quote form's Profile intro. Confirm that's wanted.
- The linter flags `react-hooks/refs` for the quote sheet's engine handlers. It's a false positive of the same kind already in that file.
