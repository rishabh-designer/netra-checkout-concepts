# Learn Mobile Design

What the Quote Requested page (`/quote-inquiry`, `GoldInquiryView`) taught us. The first mobile pass was built from `RESPONSIVENESS.md`. This file records what that pass applied, what the design review then changed and why, where the review contradicted the doc, and which principles it confirmed. Read it with `RESPONSIVENESS.md` before the next mobile screen. Where the two disagree, this file is newer.

All measurements are at 375 × 812 unless noted. "Mobile" means the ≤999 block.

---

## 1. The first pass: what came from RESPONSIVENESS.md

| Rule (RESPONSIVENESS.md) | What it did on this page |
|---|---|
| 1.3 Never scroll sideways | The breadcrumb made the page 404 wide, so it was made to wrap (404 → 375) |
| 3 Page gutter 16, card 12, don't double gutters | Gap under the header 47 → 16; thank-you card padding 24 → 12 (content 294 → 318 wide) |
| 4 Serif titles a step down | Title 32 → 28; "Your Quote Request" 28 → 24 |
| 5.1 Stack, don't squeeze | Stats in a 2 × 2 grid |
| 5.2 Fit whole items | Other Quotes: one full card per swipe, no fade over it |
| 5.6 Popups become bottom sheets | The Request a Quote drawer rises from the bottom (`sheetOnMobile`) |
| 5.11 Touch | Pager chevrons keep their 18 look with a 44 tall hit area; the chat input at 16 (no iOS zoom) |
| 5.5 CTA stays inline if visible on arrival | "Speak to an Expert" / "Request Payment Link" left in the card |

The doc was right about structure. Nothing from it was undone except 5.5. The review's changes were almost all about **density and emphasis**: how much space, how big the reading copy, and where the one action lives.

---

## 2. What the review changed

In the order it was asked. "→" is before → after.

| Area | Feedback | Change |
|---|---|---|
| Rate Your Experience | Options "Bad", "Fine", "Good" | Copy (was Excellent / Good / Bad), worst to best |
| Rate Your Experience | Full-width buttons, 12 apart | Chips `flex: 1`, gap 8 → 12 (98 each) |
| The page's action | "Use this as a permanent footer" (Figma 746:41285) | "Your Quote Request" + its CTA leave the card for a footer pinned to the screen's foot: lavender to white, r24 top, 16/12/12, serif 24, full-width orange Button. Gold inquiry unchanged |
| Title | Line break after "Quote Requested!" on narrower widths | A `<br>` shown at ≤1100: "Quote Requested!" / "Sit Back While We Call You." |
| Next steps | "Make them 14px" | Copy and tick 16 → 14 (a tick sized to its text) |
| Other Quotes | Combine the count with the heading (web and mobile) | "5 Alternative Quotes for This Policy"; the separate count label removed |
| Questions pill | Reduce padding, increase radius | 8/12 → 6/10, r12 → r16 |
| Questions pill | "12px" | Copy 16 → 12, its chevron 16 → 12 |
| Ikkat divider | Gap above and below | 40 → 16 |
| Ikkat divider | No side padding, more marks if needed | Side inset 20 → 0, edge to edge |
| Ikkat divider | Marks "24px" apart, a "16px gap" | Mark pitch 34 → 24 (8 mark + 16 gap), 9 → 14 marks |
| Intro → steps | 32 → "24px" | 24 (the head that sat between them moved to the footer) |
| Breadcrumb | Fold long trails with "…", tap to expand | Folds when it won't fit on one line: 4 crumbs keep 2 + last, 5+ keep first + 2; "…" expands the full path |
| Chevron controls | Match the label's height | Already equal (18 box, 18 line); no change |

Changes made on the way that apply beyond this page:
- **Drawers on mobile:** 4 from each side edge (not full width). Centred popups keep 16.
- **Edit Details** (the quote form's drawer) became a bottom sheet on phones; r32 on web to match the other drawers.
- **Drawer top padding:** removed to the sheet's own 12, judged "too tight", reverted. See 3.5.

---

## 3. Contradictions with RESPONSIVENESS.md

Each one becomes a rule. They are reflected back into `RESPONSIVENESS.md` where noted.

### 3.1 The one action pins, even when it's visible on arrival
- **Doc (5.5):** if the CTA is visible on arrival and nothing gates it, leave it inline.
- **Review:** pin it.
- **Why:** this is a waiting page. People arrive, read the steps, scroll to the quotes and the help card. The single next action ("call us", "pay") scrolled away the moment they read anything.
- **Rule:** when a page exists for one next action, that action is pinned on mobile whether or not it's visible on arrival. Move it out of the content; never show it twice.

### 3.2 Sheets don't touch the side edges
- **Doc (5.6):** bottom sheets are full width.
- **Review:** 4 from each side, the scrim showing either side.
- **Rule:** drawers and sheets sit 4 in from the side edges. Pinned page footers (checkout, the request footer) still run edge to edge; they are part of the page, not an overlay.

### 3.3 Fold, don't wrap
- **First pass:** the breadcrumb wraps so the page doesn't scroll sideways.
- **Review:** fold its middle into "…"; wrap only after the reader asks for the whole path.
- **Rule:** wrapping is the fallback, not the answer. A trail, list or row that doesn't fit shows its ends and hides its middle, one tap from the rest.

### 3.4 Reading copy steps down, not just headings
- **Doc (4):** headings step down; field values are 16 (the iOS zoom limit).
- **Review:** reading copy steps down too. The steps went 16 → 14; help copy went 16 → 12.
- **Rule:** 16 is the floor for **inputs**, not for text. On mobile, primary reading copy is 14 and secondary or help copy is 12. The icon beside it follows (tick 14, chevron 12).

### 3.5 There is a floor to tightening
- **First try:** no space above a drawer's title beyond the sheet's own 12.
- **Review:** too tight; revert.
- **Rule:** keep about 20 to 24 above a drawer or sheet title (the sheet's padding plus the stack's). Tighten the gaps between blocks, never the room a title opens with.

### 3.6 Ornaments go edge to edge, denser
- **Doc (5.10):** use `IkkatDivider` on phones, marks spaced evenly (it kept an 8 inset, and the page added 12).
- **Review:** no inset, marks 16 apart.
- **Rule:** a decorative rule on mobile spans the full content width with no inset. Its rhythm is set by the gap between marks (16), not by how many fit a fixed unit. `IkkatDivider` now reads `--ikkat-unit` from CSS, so a breakpoint can re-space it.

---

## 4. Principles the review confirmed

1. **Mobile changes stay mobile.** Every size and spacing change went in the ≤999 block. The two exceptions were explicit: the merged Other Quotes heading ("mobile and web") and the breadcrumb fold, which only triggers when the trail doesn't fit.
2. **Say it once.** The count merged into the heading. The request head moved to the footer, not copied there. When content repeats, combine it.
3. **The icon matches its label**, including small glyphs: the tick at 14 with 14 text, the chevron at 12 with 12 text, and the Other Quotes chevron boxes at 18 against an 18 heading line.
4. **Tighter but softer.** On mobile, padding shrinks and corners grow (the questions pill: 6/10 with r16). Space saved inside a surface is not taken from its shape.
5. **Gaps converge on a small set.** After the review, the page uses 12 (chips, footer), 16 (around ornaments, gutter), 24 (between text blocks) and 32 (between sections). A value outside that set needs a reason.
6. **Thumb zone.** The page's action lives at the foot of the screen, full width, as tall as the other primary buttons (49).
7. **Title Case and British English** in all copy, including the new heading ("for This Policy").

---

## 5. Checklist for the next mobile screen

Before showing a first pass:
- [ ] Does the page have one next action? Pin it (3.1).
- [ ] Is anything said twice (a count and a heading, a head and a footer)? Merge it (4.2).
- [ ] Reading copy at 14, help copy at 12, inputs at 16; every icon at its label's size (3.4, 4.3).
- [ ] Gaps from 12 / 16 / 24 / 32 only; 16 around ornaments, 24 between text blocks (4.5).
- [ ] Surfaces: padding a step tighter, radius a step rounder (4.4).
- [ ] Rows and trails that don't fit: fold with "…", don't wrap (3.3).
- [ ] Ornaments edge to edge, 16 between marks (3.6).
- [ ] Drawers 4 from the sides; about 24 above their title (3.2, 3.5).
- [ ] Long titles: break at the natural pause ("Quote Requested!" / …) rather than wherever the width falls.
- [ ] Web unchanged, checked at 1512.

---

## 6. How the review worked

- **Feedback is terse and numeric.** Quoting a value and replying with a number ("> 32px" then "24px") means "change that value to this". Offering "say a number if you want it tighter" got a clear answer every time.
- **Questions are questions.** "Gap?" or "icon size + label size?" asks for the current values; the change comes in the next message. Answer with measured numbers, then offer the likely change.
- **Measure before answering.** The chevron controls already matched their label (18 and 18); measuring avoided an unneeded change.
- **A hot reload can show a stale layout.** Anything laid out by JavaScript (the ikkat mark count, the breadcrumb fold) is measured on mount and resize, not when CSS changes under hot reload. Reload before judging it.
