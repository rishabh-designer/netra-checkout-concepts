# Quote Page Audit: Cases A, B and C

**Page:** `/directors-and-officers-insurance/{case-a|case-b|case-c}/quotes`
**Build:** local dev, 11 Oct 2026 (third pass)
**Method:** expert review in the browser, at desktop (≈1490px) and mobile (375px) widths, plus a read of the page copy in `src/mocks/quotesPage.ts`. I did not run sessions with real users. The usability section is a task walkthrough by an expert reviewer, and it ends with a plan for real testing.

**The three cases**

| | Business | Records | Score tab | Gold Quote |
|---|---|---|---|---|
| **A** | Pepe Jeans Innerfashion Pvt Ltd | Verified | You're Upgraded! · View Report · 82.4/100 | Generali, priced, Immediate Purchase |
| **B** | Sabyasachi Calcutta LLP | Partly verified | Ready to Upgrade? → We're Upgrading You! · Notify Me · 80*/100 | "Your Personalised Gold Quote" · Unlock Quote, no insurer or price yet (deliberate) |
| **C** | Studio Two Rupees LLP | None found | Want a Sharper Price? · Schedule A Call (no score) | None |

**Severity scale:** 4 = blocks the task or misleads · 3 = major friction · 2 = noticeable, worth fixing · 1 = polish.

**Out of scope on purpose:**
- Case B's Gold Quote having no price or insurer before the popup (design decision).
- Orange marking BimaNetra features (design decision).
- The heading count changing as the Gold card arrives, e.g. 6 → 7 (design decision).
- Screen-reader support (not a priority for this prototype).

---

## Changes since the first audit

| Area | Was | Now | Status |
|---|---|---|---|
| Case C banner CTA | Notify Me, with nothing to be notified about (Sev 4) | **Schedule A Call**, matching "Our experts can help you find the right cover" | ✅ Fixed |
| Case A banner | Title only | **View Report** beside the title (opens the Risk Report in a new tab; alert for now) | ✅ Added |
| Title-row button | Centred on a two-line title | Bottom-aligned to the title's last line (A, B, C) | ✅ Fixed |
| Gold Quote naming | Gold Quote · special quote · Your Personalised Insurance Quote · Personalised Quote | **Gold Quote** everywhere (Case B banner, compare tray); Case B's card title is the one exception: **"Your Personalised Gold Quote"** | ✅ Fixed |
| Case B Gold CTA | "Request Quote", the same words as the offline insurers' button | **Unlock Quote** | ✅ Fixed |
| Case B banner copy | "…preparing a special quote for you. We'll inform you when it's ready." | "…preparing a Gold Quote for you. We'll let you know when it's ready." | ✅ Fixed |
| Business Health scale | "82.4" with "out of 100" only in the tooltip | **82.4/100** and **80*/100** on the badge | ✅ Fixed |
| Claim Settlement Ratio | One decimal (98.6%) | Whole numbers, no ties (99%, 98%, 96%, 95%, 94%, 93%) | ✅ Changed |
| Filter & Sort fields | Grey, placeholder-looking text on white: read as unset | **Filled state**: brand ink, lavender fill, brand underline. The feed is always filtered and sorted, and now looks it | ✅ Fixed |
| Expert naming | "IRDAI-certified Bima experts" (card) · "IRDAI-certified experts" (chat, Gold inquiry) | **IRDAI-certified Bima Experts** everywhere: Need Help card, chat, Gold inquiry page, alerts | ✅ Fixed |
| Sort by Claim Settlement Ratio | Shown on every card but not sortable | New sort option **"Claim Settlement: High to Low"** (Gold Quote stays pinned first) | ✅ Added |
| Heading count change | Listed as a status issue | Withdrawn: intentional | ➖ Withdrawn |
| Screen-reader findings | Animated titles, price button name, tick/cross alternatives | Withdrawn: out of scope | ➖ Withdrawn |

---

## Summary: top 9 to fix

| # | Issue | Cases | Audit | Sev |
|---|---|---|---|---|
| 1 | On mobile, **the score is folded away**. The panel opens shut to its tab strip, so Business Health and the 11 key lines are hidden, and each card's "x/11 Match" has nothing visible to refer to | A, B | IA, Usability | 3 |
| 2 | **x/11 Match** sits beside a Claim Settlement Ratio, an Immediate Purchase tag, a territory tag and a price. Five signals per card with no hierarchy, and Match is the one explained least | A, B | Visual, Usability | 3 |
| 3 | Case B's Gold card has no logo and no CSR tag, so its **name sits 32px higher** than the Generali card beside it, and the rows below shift with it | B | Visual | 2 |
| 4 | **Three ways to get help** compete: the Chat tab, the Need Help card and the Mail Quotes header CTA. Mail Quotes is the loudest button on the page and isn't a help action | All | IA | 2 |
| 5 | Filtering lives in **three places**: the Filter dropdown, its filter icon and the Immediate Purchase toggle (Sort & Filter on mobile) | All | IA, Heuristic | 2 |
| 6 | **Changing Sum Insured takes three steps** (Profile tab → Edit Details → Risk step), and it's the most likely edit after seeing prices | All | Usability, IA | 2 |
| 7 | **"80*"**: the asterisk is explained only in a tooltip, which doesn't exist on touch | B | Heuristic, Copy | 2 |
| 8 | Profile reads like a form: **"Enter Company Type"** is a field prompt used as a read-only label | All | Copy | 2 |
| 9 | **"11/11 Match"** doesn't say what it's matched against until the popup opens | A, B | Heuristic, Copy | 2 |

---

## 1. Heuristic evaluation (Nielsen's 10)

### H1 · Visibility of system status

- ✅ Case B's verification is well staged: percent, a stalling progress bar and time-left steps, then a clear state change to "We're Upgrading You!" with a provisional score.
- ✅ Loading uses a skeleton that matches the final layout.
- ✅ Filter and Sort now show their current values as filled fields, so the feed's state (all insurers, cheapest first) is visible at a glance.
- ⚠️ Case B's "80*/100" relies on a tooltip to explain the asterisk. *B · Sev 2*

### H2 · Match between the system and the real world

- ✅ Plain-English policy copy throughout.
- ✅ Business Health now carries its scale (82.4/100), so the number reads without the tooltip.
- ⚠️ **"11/11 Match"**: what it matches against only becomes clear in the popup. *A, B · Sev 2*

### H3 · User control and freedom

- ✅ Edit Details reopens the pre-filled flow; the compare tray removes items individually.
- ⚠️ Edit Details sits inside the **Profile** tab. See Usability, Task 4. *All · Sev 2*

### H4 · Consistency and standards

- ✅ One name for the Gold Quote across the card, banner and compare tray.
- ✅ One name for the experts: "IRDAI-certified Bima Experts" on the card, in chat and on the Gold inquiry page.
- ⚠️ Tab order changes per case (A, B: Score, Chat, Profile; C: Chat, Profile, Score). Intentional for C. *Sev 1*
- ⚠️ Apostrophes mix curly and straight in the same panel ("We’ve verified" vs "We're verifying"). *Sev 1*
- ⚠️ "Schedule A Call" (C banner) vs "Schedule a Call" (its alert, the Gold gate, the Gold inquiry page). *Sev 1*

### H5 · Error prevention

- ✅ Compare caps at 3 with a clear tooltip; offline quotes show "Unavailable" rather than failing.
- ✅ Filter and Sort can't be left in an unset state.
- ✅ Case B's Gold card says **Unlock Quote**, so "Request Quote" now only ever means asking an offline insurer for a price.

### H6 · Recognition rather than recall

- ✅ On desktop the Score list keeps the 11 key lines on screen while users scan cards.
- ⚠️ On mobile those lines are folded away. *A, B · Sev 3*

### H7 · Flexibility and efficiency

- ✅ Chat suggestions are good accelerators, and opening C on Chat puts them first.
- ✅ Claim Settlement Ratio can now be sorted by: "Claim Settlement: High to Low" in Sort Quotes.

### H8 · Aesthetic and minimalist design

- ⚠️ Cards carry up to **five badge-like elements**. See V2. *Sev 3*

### H9 · Help users recognise, diagnose and recover from errors

- ✅ Case C explains why there's no score and offers a clear next step (Schedule A Call).

### H10 · Help and documentation

- ✅ Tooltips on every tag; the policy popup explains each coverage.
- ⚠️ Tooltips are the only explanation for Match, CSR and the asterisk, and **tooltips don't exist on touch**. *All · Sev 2*

---

## 2. Usability audit (expert task walkthrough)

### Task 1 · "Which quote should I look at first?"

| Case | Outcome | Friction |
|---|---|---|
| A | ✅ Easy. The Gold card leads with the glow, the offer (₹7,800 → ₹6,600 at ₹5 Cr) and 11/11 Match. | None significant. |
| B | ✅ Mostly. "Your Personalised Gold Quote" leads with **Unlock Quote**, which says what happens next and sets it apart from the priced card beside it. | The mystery is deliberate. *Sev 1* |
| C | ✅ Guided by Chat, which opens first with suggestions. | *Sev 1* |

### Task 2 · "What does 7/11 Match mean, and is that bad?"

- ⚠️ A, B: the chip opens the policy popup, which shows all 11 lines. Clear once opened, but nothing on the card says what the 11 are, and on mobile the Score tab is folded. *Sev 3*
- **Suggestion:** a one-line explainer by the heading ("Matched against your 11 key coverages and exclusions") or a first-visit hint on the first Match chip.

### Task 3 · "Buy a quote right now"

- ✅ A: one click on the Gold price; the offer is clear.
- ✅ All: the Immediate Purchase toggle filters quickly.
- ⚠️ The buy action is the price with an arrow ("₹7,800 →") and never says "Buy". *Sev 2*

### Task 4 · "Change my Sum Insured"

- ⚠️ All: Profile tab → Edit Details → find Sum Insured on the Risk step. Three steps and a tab switch for the most common adjustment. A quick switcher on the card or above the feed would make it one step. *Sev 2*

### Task 5 · "Compare two quotes"

- ✅ Add to Compare → tray → Compare Now works; the Gold Quote is named consistently in the tray.
- ⚠️ The three offline insurers can't be compared at all, which users only learn when they try. *Sev 1*

### Task 6 · "Get help"

- ✅ C: "Our experts can help…" is paired with **Schedule A Call**.
- ⚠️ C on phones: a call is usually quicker than booking one. The mocks already hold "Speak to an Expert" with a `tel:` link; consider it on mobile. *Sev 1*
- ⚠️ All: help is spread across Chat, Need Help and Mail Quotes (see IA2). *Sev 2*

### Task 7 · "Is this score about me or the policy?"

- ⚠️ A, B: the Score tab shows Business Health (about the business) and then "11 Key Coverages & Exclusions" (about the Gold policy) together. Users may read the 11 lines as their business's risks. *Sev 2*

### Task 8 · "See what you verified about me" (new, A)

- ✅ View Report sits right beside "You're Upgraded!", which is where the question arises. It currently shows an alert; once built it opens in a new tab, which keeps the quotes in place. Good.

### Proposed real-user test plan

- **Who:** 5 to 6 SME founders or finance heads per case (15 to 18 total), split across mobile and desktop.
- **Tasks:** Tasks 1 to 8 above, think-aloud.
- **Measure:** success rate, time to first priced click, Match comprehension (ask "what does 7/11 mean?"), SUS.
- **Hypotheses:**
  1. Users understand x/11 Match without opening the popup.
  2. Case C users reach an expert in under 30 seconds.
  3. Mobile users find the score.

---

## 3. Information architecture audit

### Current structure

```
Header ─ Logo · Mail Quotes
Left panel (tabs; C reorders to Chat, Profile, Score)
├─ Score    → banner (title + View Report / Notify Me / Schedule A Call, body) · Business Health x/100 · 11 key lines
├─ Chat     → Ask BimaNetra (suggestions, input)
└─ Profile  → Legal Company Name ✓ · 7 detail rows · Edit Details
Feed
├─ Breadcrumb · "N Directors & Officers Insurance Quotes" · Need Help card
├─ Filter (filled: All Insurers) + icon · Sort (filled: Price: Low to High | Price: High to Low | Claim Settlement: High to Low) · Immediate Purchase Only
└─ Cards ─ tags · logo · CSR · name · Sum Insured · price/CTA · Match · Compare
    └─ Popup ─ key lines · Overview · Territory · Exclusions · Coverages · Deductibles
```

### Findings

| # | Finding | Cases | Sev |
|---|---|---|---|
| IA1 | **The Score tab holds two different things**: a fact about the business (Business Health) and the Gold policy's key lines, which are really the yardstick for the feed. Consider titling the list for its job ("What we matched quotes against"). | A, B | 2 |
| IA2 | **Help is split three ways:** Chat (tab), Need Help (feed header) and Mail Quotes (header CTA). Mail Quotes is the primary header button, yet it's a send-to-self action. | All | 2 |
| IA3 | **Filter controls in three places** (dropdown, separate icon, toggle). Immediate Purchase is a filter; fold it into one control on desktop too (mobile already has Sort & Filter). | All | 2 |
| IA4 | **Mobile buries the panel.** It opens folded, so the score and key lines are hidden by default. Consider opening it on first visit, or a one-line score summary in the folded strip ("82.4/100 · 11 key lines"). | A, B | 3 |
| IA5 | **Popup tabs overlap.** "Overview" lists coverages and "Coverages/Extensions" lists them again. | All | 1 |
| IA6 | **Edit Details is buried** in Profile, the main way to re-price. | All | 2 |
| IA7 | **Three labels for one place:** breadcrumb "Live Quotes", heading "Directors & Officers Insurance Quotes", tab title "Directors & Officers Insurance". | All | 1 |

### Labels inventory (same thing, different names)

| Concept | Names in use |
|---|---|
| The Gold Quote | ✅ Gold Quote (tag: Secured with BimaNetra); Case B card title: Your Personalised Gold Quote |
| Experts | ✅ IRDAI-certified Bima Experts (Case C's banner body still says "Our experts", which reads fine in a sentence) |
| Requesting a price | ✅ Request Quote (offline insurers) · Unlock Quote (Case B Gold) |
| Business details | Your Details (panel label) · Profile (tab) |
| Booking a call | Schedule A Call (C banner) · Schedule a Call (alert, Gold gate, Gold inquiry) |

---

## 4. Visual design audit

### What's working

- A strong type system: Instrument Serif for headings, Anek for UI, and the two-face rule holds.
- The Gold card's glow and orange price are unmistakable without shouting.
- The score badge is a distinctive, ownable moment, and the small "/100" sits quietly beside the score.
- Filter and Sort now share the DSL's filled-field look, so they read as set values, not empty inputs.
- Side padding is consistent across pages (32px desktop, 16px at 999px and below).
- The title-row buttons sit on the title's baseline in every case.

### Findings

| # | Finding | Cases | Sev |
|---|---|---|---|
| V1 | **Row misalignment in Case B:** the Gold card has no logo and no CSR pill, so its name sits **32px above** the Generali card beside it, and its price and Match rows sit higher too. The logo slot already reserves 32px; the CSR row needs the same. | B | 2 |
| V2 | **Badge overload on cards.** Up to five pill-like elements in three styles (edge tabs, the CSR pill, the Match chip). Suggested hierarchy: price and CTA first; Match second; Immediate Purchase third; CSR and territory as quiet text. | All | 3 |
| V3 | **The CSR pill's style is new to the system**: a neutral hairline pill in 12px grey that matches neither the tabs above nor the chip below. | All | 1 |
| V4 | **Two-line insurer names** ("HDFC ERGO / General Insurance") at 18px SemiBold take a lot of height in compact cards. Consider dropping "General Insurance" on cards, or 16px. | All | 1 |
| V5 | **Case C's Score tab is mostly empty** below three lines of copy. A short "what you get once verified" list, or the expert faces from Need Help, would give it purpose. | C | 1 |
| V6 | **The mobile Gold reveal** (the dither burst) covers the toolbar and first card while it plays. Consider not replaying on every visit. | A | 1 |
| V7 | **Small grey text** (12px tertiary) for "Other Options", "Unavailable" and help rows is likely below AA contrast. | All | 2 |
| V8 | **Filled filter fields are now as loud as inputs** (brand ink and underline), sitting near the purple price buttons. Worth a look at whether a calmer filled state (brand ink, neutral underline) keeps the feed's CTAs ahead. | All | 1 |

---

## 5. Content & copy audit

Checked against the house rules: British English, no em dashes, plain and conversational, no "best" or "recommended" (IRDAI).

### What's working

- Policy copy is excellent: concrete, plain, with real Indian bodies named.
- The banners name the company, which builds trust.
- One name, Gold Quote, across the page, and one for the experts: IRDAI-certified Bima Experts.
- Case C's banner promises expert help and offers it in the same breath.
- No "best" or "recommended" claims; Match is framed as fit, not advice. ✅ IRDAI-safe.

### Findings

| # | Copy now | Issue | Suggested | Cases | Sev |
|---|---|---|---|---|---|
| C1 | Time steps: "Arriving Soon", "Arriving Soon", "Almost There" | Two identical steps; vague | "A few minutes left" → "About a minute" → "Almost there" | B | 1 |
| C2 | "Want a Sharper Price?" | Paired with Schedule A Call it reads as an offer, but still implies the prices are blunt | Optional: "Want a Price That Fits Better?" | C | 1 |
| C3 | Profile label: "**Enter** Company Type" | Form prompt used as a read-only label | "Company Type" | All | 2 |
| C4 | "Company PAN" row (`key: "cin"`) | Label and data key disagree (PAN vs CIN) | Match the label to the data | All | 1 |
| C5 | "80*/100" explained only in a tooltip | Hidden on touch | Visible caption: "Provisional until your report is ready" | B | 2 |
| C6 | "11/11 Match" | Unclear what's matched | Keep the chip; add an explainer by the heading: "Matched against your 11 key coverages and exclusions" | A, B | 2 |
| C7 | "We’ve" / "We're" in the same panel | Mixed curly and straight apostrophes | Curly across all mocks | All | 1 |
| C8 | Price button "₹7,800 →" | Never says what it does | "Buy · ₹7,800", or keep as is and rely on the arrow | All | 1 |
| C9 | "Schedule A Call" vs "Schedule a Call" | Casing differs between the button and everywhere else | Pick one | C | 1 |
| C10 | "Filtering: All Insurers" under the label "Filter Insurance Companies" | Now that the field reads as filled, the "Filtering:" prefix repeats its label | "All Insurers" (the label above already says what it is) | All | 1 |
| C11 | "Down from ₹7,800 with BimaNetra" (offer tooltip) | Good copy, but tooltip-only | Consider visible text on the card | A | 1 |

### House-rule checks

| Rule | Result |
|---|---|
| British English | ✅ "personalised", "customised", "defence" |
| No em dashes in UI copy | ✅ None in the quotes page, risk-fit or policy mocks |
| No "best" / "recommended" | ✅ None |
| Title Case on headings and CTAs | ✅ Mostly; see C9 |
| Plain, conversational tone | ✅ "inform you" is gone; tone is consistent |

---

## Appendix: per-case snapshot

**Case A (verified).** The strongest case: verified → 82.4/100 → Gold Quote leads → 11/11, the offer clearly below the next card (₹6,600 vs ₹7,800 at ₹5 Cr), and View Report answers "what did you find?" in place. Remaining gaps: the score's visibility on mobile (IA4) and card badge density (V2).

**Case B (partly verified).** The verification moment is well staged, the card reads "Your Personalised Gold Quote" with a clear **Unlock Quote**, and "Gold Quote" is the name everywhere else. Remaining gaps: the card's 32px misalignment (V1) and the asterisk explained only on hover (C5).

**Case C (no records).** Much improved: it opens on Chat, the empty badge is gone, and the banner's one action is Schedule A Call. Remaining gaps are minor: a call-now option on phones (Task 6), the button's casing (C9) and an emptier-than-needed Score tab (V5).

---

*Test session notes:* all three cases showed a Sum Insured of ₹5 Cr because I'd picked it earlier while testing the Sum Insured menu (stored in the browser session). Prices scale with Sum Insured, so the ₹ figures above are for ₹5 Cr.
