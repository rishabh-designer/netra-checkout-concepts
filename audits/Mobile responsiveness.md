# Mobile Responsiveness Audit

**Journey:** product page → onboarding sheet → `/{case}/quotes` (popups, dock, sheets, compare) → Gold inquiry / Quote inquiry → `/{case}/checkout/{billing|verification|review}` → `/{case}/checkout/success`
**Build:** local dev, 15 Oct 2026
**Cases:** A (Pepe Jeans, verified), B (Sabyasachi, partly verified), C (any new company, no records). All three were run end to end.
**Viewports:** 375×812 (most iPhones), 320×640 (small phones), 812×375 (landscape). Emulated in the in-app browser (Chromium) with a mobile user agent and touch points.
**Method:** I tapped through every screen and popup per case, and ran a script on each screen to measure horizontal overflow, targets under 32px, text under 12px, truncated text and how much of the screen the sticky bars take. I read the code wherever behaviour needed explaining.

**Lenses:** the five from the journey audit (heuristic, usability, IA, visual, copy), plus two for mobile:
- **Touch:** targets, gestures, hover and tooltips.
- **Layout:** overflow, the fold, sticky bars.

**Severity:** same as the journey audit.
- 4 = blocks or misleads
- 3 = major friction
- 2 = noticeable, worth fixing
- 1 = polish

**Out of scope on purpose:** screen readers. Also excluded are the items the journey audit lists as out of scope:
- Sum Insured only changes via Edit Details.
- The buy button is a price and an arrow.
- The welcome popup shows on every load.
- Case B's Gold Quote stays a mystery.
- Orange marks BimaNetra features.
- The quote count changes as Gold arrives.
- "Key Features" counts exclusions.
- The public-source prefill and the "Secured"/"Insured" labels.

Popups that are popups by design (Checkout Edit, Know More, Gold gate, Risk Held) are judged as popups, not as candidate sheets. The Next.js dev badge (bottom-left "N") overlaps sticky bars in dev only, so I ignored it.

---

## Mobile score

| Stage | Score | Was | In one line |
|---|---|---|---|
| Product page + onboarding | 8 / 10 | 7 | Tips and truncated lines open on a tap, and whole fields take a tap. The company field sits below the fold, and Case C's "Enter a new company?" is cut off. |
| Quote page | 7 / 10 | 6 | The dock opens in a lightbox, the popup's medal is smaller (the CTA is now ~64px below) and the Key Features sheet's buttons no longer collide with its tabs. Its tabs still scroll sideways with no cue, and the targets are tiny. |
| Gold / Quote inquiry | 8 / 10 | 8 | Clean at every size. The carousel gives no sign there's more. |
| Checkout | 7 / 10 | 6 | Disabled buttons give their reason on a tap, whole fields take a tap, and the footer is 29% at 375. Still: the "Read from…" notes and the "or" in the uploads banner. |
| Success | 9 / 10 | 8.5 | A one-line stepper, a shorter hero and the asked-for order. Only the pills' 9.5px at 320 remains. |
| **Overall** | **7.8 / 10** | 7.1 | Nothing scrolls sideways, tips work on touch and whole fields take a tap. What's left: Case C's cut-off action (M8), the checkout footer's height (M27) and small targets (M4). |

---

## Fixed so far

| # | Issue | Fix | Verified |
|---|---|---|---|
| M0 | **Success scrolled sideways on phones** (page 396px wide at 375). The new Next Action / After 7 Working Days grid used `minmax(380px, 1fr)`. | `SuccessTimeline.module.css`: `minmax(min(380px, 100%), 1fr)`. One column on phones, side by side when wide. | ✅ 375 → 375 and 320 → 320. Not committed yet. |
| M1 | **Tooltips never opened on touch.** | `Tooltip.tsx`: a tap opens the tip at once when the tip is the element's whole job (a tag, pill, icon, truncated text, a disabled control's reason, an info (i) button). A second tap closes it, and it fades after a read. Ordinary buttons, and tips that only repeat a control's name, stay quiet. | ✅ Tap, re-tap and tap-away tested with touch events. |
| M36 | **The Success stepper wrapped.** | Below 1000px the pills scale with the row (container units) and always share one line. | ✅ 11.3px at 375, 9.5px at 320. |
| M37 | **A long Success hero.** | Changes to the hero:<br>• headline "{first name}, Your Policy Booking is Confirmed!";<br>• the greeting sentence and the "Up Next:" label removed;<br>• three stats (16px values), then the Up Next copy, under the headline;<br>• the inner ikkat rule dropped;<br>• on phones, the badge (56px) leads above the headline.<br>On phones the order is stepper, greeting card, Purchase Summary, RM card, then Next Action / After 7 Working Days. Also removed: the step copy, the RM's line and the paid summary's tags. | ✅ 375 and 320. |
| M14 | **The welcome popup's CTA sat far below.** (Partly fixed.) | The medal is 160px on phones. "Show Quotes" moves from 977px to 844px at 375×812, about 100px of scrolling instead of 230px. | ⚠️ Still a short scroll. |
| M27 | **The checkout footer took the screen.** (Partly fixed.) | The mobile footer's consent text is 12px for both ticks (mandate and Review). Verification's footer goes from 264px to 233px at 375. | ⚠️ Still 29% of the screen. |
| - | **The open dock didn't separate from the page.** | The dock's Score, Chat and Profile tabs on phones now open in a lightbox: the page blurs under the drawers' scrim, scrolling locks, and a tap on the scrim or Escape closes it. | ✅ |

---

## Top 10 for mobile

| # | Issue | Screens | Cases | Sev |
|---|---|---|---|---|
| 1 | ✅ **Fixed:** tooltips now open on a tap (M1) | All | All | ~~3~~ |
| 2 | **The checkout footer takes a third to half the screen** once the mandate tick moves into it (M27) | Verification, Review | All | 3 |
| 3 | ✅ **Fixed:** a finger tap anywhere in a field's box focuses it, or opens its list (M2) | Product page, onboarding, checkout | All | ~~3~~ |
| 4 | ✅ **Fixed:** the Key Features popup's ‹ › × bar now has the sheet's fill and 12px below it, so the tabs scroll away under it (M16) | Quotes | All | ~~3~~ |
| 5 | **"Enter a new company?" is cut off by an ellipsis.** It's the only action for a new company, and the open dropdown covers the CTA (M8) | Product page | C | 3 |
| 6 | **Disabled Save & Continue with every visible field green.** The missing PAN upload is off-screen, and the reason is a tooltip (M28) | Verification | All (seen in C) | 2 |
| 7 | **"Show Quotes" sits 200–430px below the popup's visible area** (M14) | Quotes | A, B | 2 |
| 8 | **NetraBot's Continue closes the popup without opening Chat** (M20) | Quotes | C | 2 |
| 9 | ~~The compare table is 910px wide~~ **Withdrawn:** a side-by-side comparison can't be made to fit a phone; sideways scrolling is accepted (M18) | Compare | A, B, C | - |
| 10 | **"Read from your PAN card" relabels every field after the PAN upload**, including the GST Number and the address (M30) | Verification | All | 2 |

---

## What works on mobile

- **No sideways scroll anywhere** at 375 or 320, on any case (after M0).
- **Viewport handling is right:**
  - shells use `100dvh` with a `100vh` fallback;
  - `viewport-fit=cover`;
  - sheets, docks and footers pad for `env(safe-area-inset-bottom)`;
  - on mobile the quotes page scrolls as a whole, with no nested scroll trap.
- **Inputs behave well:**
  - text is 16px, so iOS won't zoom;
  - phone and email get `inputmode` keyboards;
  - the date field opens the number pad and inserts its own slashes, so the missing "/" key doesn't matter;
  - PAN is uppercased as you type.
- **Chat sheets fit nicely:** Case B's Additional Details and Case C's Request a Quote.
- **Bottom sheets fit:** the Sort & Filter sheet, the Chat / Profile / Score dock and the Purchase Summary sheet (with a scrim).
- **These popups fit at 375 and 320:** Gold gate, Risk Held, Mandate Letter, NetraBot intro.
- **The Yes/No answers in onboarding are big targets** (about 165×42). Dropdowns open, scroll and close cleanly, including the long Sum Insured menu.
- **The checkout mandate tick is easy to hit:** the checkbox is 12px, but the whole sentence toggles it.
- **The Gold and Quote inquiry pages:**
  - collapse the breadcrumb to "…";
  - turn alternatives into a swipeable carousel that snaps;
  - Case C pins "Speak to an Expert" to the foot of the screen.

---

## Across every screen

| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| M1 | **Tooltips are hover-only.** `Tooltip.tsx` ignores `pointerType === "touch"` and otherwise only opens on `:focus-visible`, which a tap doesn't trigger. On a phone none of these open:<br>• the field (i) icons ("Your company's registered name, as on MCA records");<br>• the CSR and offer pills;<br>• the `data-tooltip-overflow` text for truncated names;<br>• the only reasons given for disabled buttons ("Fill in the required fields first", "Finish the earlier steps first", "Billing details are locked once saved").<br>A greyed button just sits there. This builds on the journey audit's H10 and Quotes #5, and it's systemic, not one icon. **Fix:** open on tap for touch (toggle on `pointerup`, close on an outside tap or scroll). For disabled CTAs, also show the reason as a line above the button on <1000px. | Touch, Heuristic (H1, H10) | All | 3 |
| M2 | ✅ **Fixed.** Only the 18px text line inside each 43px field box took a tap. Now, in the shared `InteractiveInput`, a finger tap anywhere in the box focuses the input, or opens a select's list. Clear and info keep their own taps, and mouse clicks are unchanged. Tested edge taps on Billing and on a select in Edit Details. | Touch | All | ~~3~~ |
| M3 | **Clear sits next to info.** In every filled field, × (14×14) is 8px from (i) (14×14). A thumb aiming for (i), which does nothing on touch (M1), can wipe the field. **Fix (mobile):** show × only while the field is focused, and give each icon a 32px hit area through padding. | Touch | All | 2 |
| M4 | **Small targets** (aim for 44px; at least 32px through padding):<br>• Immediate Purchase and Buy in Another Person's Name switches: 32×16, and their labels don't toggle them (tested);<br>• Add to Compare: 97×12;<br>• "View N Key Features" chip and Sort & Filter: 21px tall;<br>• compare remove, carousel ‹ ›, Purchase Summary chevron and Disclaimer chevron: 18×18;<br>• popup and sheet ×: 24×24;<br>• Up Next links (Dashboard, Risk Held Letter): 21px tall;<br>• header buttons: 29px tall;<br>• breadcrumb "…": 6×10. | Touch | All | 2 |
| M5 | **Hover tints stick after a tap.** 34 stylesheets use `:hover`; only one component checks `(hover: hover)`. On a phone the last-tapped spot keeps its tint. In the chat sheets, the next answer chip under your finger looks pre-selected. **Fix:** wrap hover rules in `@media (hover: hover)`. | Touch, Visual | All | 1 |
| M6 | **No autofill hints.** Name, phone and email have empty `autocomplete`, so phones can't offer saved details. Add `name`, `tel-national` and `email`, and `autocapitalize="characters"` on PAN and GST. | Usability | All | 1 |
| M7 | **Ellipses hide content you can't reach on touch:**<br>• "Pepe Jeans Innerfashion Private Limited" in the locked Billing field (320px) and the onboarding sheet;<br>• Case B's helper line "Fetched from publicly available sources. BimaNetra can make…", where the cut-off words are the disclaimer.<br>**Fix (mobile):** let these wrap instead of truncating. | Layout, Copy | A, B | 2 |
| M26 | **The navbar at 320px:** "Speak to an Expert" wraps to two lines and crowds the logotype (checkout, success, inquiry pages). **Fix:** below 360px use "Expert" or the headset icon alone. | Layout | All | 1 |

---

## 1. Product page and onboarding

| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| M8 | **Case C's way forward is cut off.** Typing a new company gives "No result for "Kettle Lane Foods LLP". …". The action, "Enter a new company?", is a button at the end of that line, placed at x 294–447 on a 375px screen and hidden by the ellipsis. The open dropdown also covers Get My Quote. **Fix (mobile):** put "Enter a new company?" on its own line, or make the whole row the button. | Touch, Usability | C | 3 |
| M9 | **"No result" above the match.** "No result for "Pepe Jeans"" (A) and "No result for "Sabyasachi"" (B) appear above the MCA match, so it reads as a failure before the success. **Fix:** show the "No result" row only when the MCA list is empty. | Copy, Heuristic (H1) | A, B | 2 |
| M10 | **The CTA sits below the fold.** The company field and Get My Quote start below the first screen: the CTA's top edge is at 728px on a 640px phone and is also below the fold at 812px. The video, price and bullet fill the first screen. **Fix (mobile):** move the field and CTA above the video, or pin a "Get My Quote" bar until the field scrolls into view. | Layout, Usability | All | 2 |
| M11 | **The breadcrumb and ticker are 10px.** The breadcrumb's links are 10px tall. On phones, hide the breadcrumb or raise it to 12px. | Visual, Touch | All | 1 |
| M12 | **"Business Assessed" with nothing assessed.** Case C's Business step shows "Business Assessed. Waiting for Confirmation" above three empty dropdowns. Suggested: "We couldn't find public records. Fill these in and we'll do the rest." (Applies on desktop too.) | Copy, Heuristic (H1) | C | 2 |

---

## 2. Quote page

### Welcome popup and NetraBot intro
| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| M14 | **"Show Quotes" is far below the visible area.** It sits at:<br>• 977px at 375×812 (A);<br>• 992px at 375×812 (B);<br>• 996px at 320×640, needing 430px of scrolling inside the popup;<br>• 494px in a 311px area in landscape.<br>The medal (≈293px) and the 11-line Key Features list push it down. **Fix (mobile):** pin the CTA to the popup's foot (as the Gold gate does), or cap the medal at about 220px below 1000px. | Layout | A, B | 2 |
| M15 | **Case B's "Excellent*" has no explanation on touch.** The provisional note lives only in the caption's (i) tooltip. That caption is hidden whenever the medal shows (the default), so on desktop you have to flip the badge and hover; on touch it can't be reached at all. This updates journey audit #5 and C4. **Fix:** a caption under the medal for B only, "*Provisional until your report is ready". | Heuristic (H1), Copy | B | 2 |
| M20 | **Continue doesn't lead to NetraBot.** On desktop, Case C's "Introducing NetraBot" Continue focuses the chat input. On mobile it closes the popup and leaves you on the feed with the Chat sheet shut. **Fix (<1000px):** Continue opens the dock's Chat tab and focuses the input. | Usability | C | 2 |

### Feed, dock and sheets
| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| M16 | **The Key Features popup sheet:**<br>• ✅ **Fixed:** the name and tabs scrolled under the pinned ‹ › × bar, which had no fill. The bar now takes the sheet's white, with 12px clear below the buttons;<br>• the tabs scroll sideways with no cue (Exclusions is cut; Deductibles and Territory are off-screen);<br>• a stray card border runs across the first coverage;<br>• the buttons are 24×24.<br>**Still to do (mobile):** fade the tab row's right edge, and remove the stray border. | Layout, Visual, Touch | All | 2 |
| M17 | **Compare tray plus dock ≈ 240px** (30% of an 812px screen). It covers the price on the cards you're choosing between. **Fix:** fold the tray into the dock while it holds fewer than 2 quotes, or slim it to one line. | Layout | All | 2 |
| M18 | ~~The compare view is a 910px table in a 375px screen.~~ **Withdrawn:** a side-by-side comparison can't be made to fit a phone, so sideways scrolling is accepted. | Layout, Usability | All | - |
| M19 | **The dock's medal text is unreadable.** At 149px, "BUSINESS HEALTH" renders at ≈7px. You chose the small size for the drawer; mobile-only, the Score sheet could use about 200px, where the label becomes legible. | Visual | A, B | 1 |
| M21 | **At 320×640, the header blocks take ≈470px** before the first quote: the title (two lines), Need Help, the ikkat rule and the controls. "Sort & Filter" also wraps to two lines. **Fix (small phones):** move Need Help into the dock, and keep "Sort & Filter" on one line. | Layout | All | 1 |
| M22 | **Confirm intent: control order.** Portrait phones put the Immediate Purchase switch left and Sort & Filter right (Figma 732:34288). Landscape shows the desktop order you asked for (Filter and Sort left, switch right). Pick one for phones. | IA | All | 1 |
| M23 | **Case C's chips don't say "Key Features".** They read "4 Top Coverages", "3 Top Coverages" and "View Coverages". Case C has no score, so there's no fit mapping, but your rule was "View N Key Features" for all cards. Decide whether C keeps Top Coverages or reads "View 4 Key Features". (Applies on desktop too.) | Copy, IA | C | 2 |

---

## 3. Gold inquiry (B) and Quote inquiry (C)

| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| M24 | **The carousel gives no sign there's more.** "6 Alternative Quotes" shows one full-width card, and the only hint of the other five is a pair of 18×18 arrows. **Fix:** let the next card peek (about 88% card width), or add dots. | Usability, Touch | B, C | 1 |
| M25 | **One template, two layouts.** B puts "Your Gold Quote Inquiry · Speak to an Expert" above the checklist, in the flow. C pins "Your Quote Request · Speak to an Expert" to the foot of the screen (114px). The pinned foot is the better mobile pattern; use it for both. | IA, Visual | B, C | 1 |

The Additional Details and Request a Quote sheets were clean: the date pad auto-formats, the chips are 31px+, the sheet grows with the chat and its CTA clears the home bar.

---

## 4. Checkout

| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| M27 | **The footer takes the screen.** It is 146px on Billing at 320×640 (23%), where the first screen shows no field at all. With the mandate paragraph, Verification's footer takes:<br>• 264px at 375×812 (33%);<br>• 284px at 320×640 (44%, leaving ≈300px for the form);<br>• 205px in landscape (55%).<br>**Fix (mobile only):** keep a one-line tick in the footer ("I authorise BimaKavach as my broker · View Mandate Letter") with the full text in the letter. Or move the tick to the end of the form and keep the footer to price + CTA. In landscape (`max-height: 500px`), let the footer scroll with the page. | Layout | All | 3 |
| M28 | **Disabled, with the reason off-screen.** In Case C's Verification, after the GST upload every field in view was green, yet Save & Continue stayed grey. The blocker was the PAN card upload, scrolled out of view above, and the only reason is a tooltip (M1). **Fix:** tapping the disabled CTA scrolls to the first missing field and highlights it. | Heuristic (H1, H9), Usability | All | 2 |
| M29 | **"or" versus both required.** The banner says "Upload your GST certificate or PAN card", but both uploads are starred and the CTA waits for both. The GSTIN already contains the PAN, so either accept one or say "and". | Copy, Heuristic (H4) | All | 2 |
| M30 | **The "Read from…" notes follow the last upload, not the source.** After the PAN upload, all five notes say "Read from your PAN card": the GST Number, PAN, Pincode, Place of Incorporation and Address (a PAN card carries no address). `readFrom` is per document, not per field. **Fix:** keep each field's own source; address, pincode and place come from the GST certificate. | Copy | All | 2 |
| M31 | **Desktop words on a phone.** The upload box says "Click to browse, or drag and drop the file here". Mobile: "Tap to upload a PDF or a photo". After a successful upload the button reads "Try Again", which sounds like an error; use "Replace File". | Copy | All | 2 |
| M32 | **The mandate tick loses its blue on mobile.** Your spec was the blue info theme. The footer variant (`StepConsent variant="footer"`, Figma 734:36135) draws every tone in plain ink, so on phones the mandate shows without the blue. **Fix:** let the footer variant keep `data-tone="info"`. | Visual | All | 2 |
| M33 | **Review's tick comes before the review.** Above the 30% footer, the first screen shows only Billing's four rows, yet "I confirm all details provided are correct" and Pay Now are already active. **Fix (mobile):** place the tick after the last section, or enable it once the details have been scrolled to the end. | Usability, Heuristic (H5) | All | 2 |
| M34 | **The footer toggle is labelled "Preparing Checkout"** (Figma 734:35259). Nothing says tapping it opens the Purchase Summary. Consider "Purchase Summary" beside the chevron. | Copy, IA | All | 1 |
| M35 | **Two names for one upload:** Review calls it "GSTIN Upload"; Verification calls it "GST Certificate". | Copy | All | 1 |

---

## 5. Success

| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| M36 | **The stepper wraps.** At 375px the four pills wrap and "Policy Issuance" sits alone on a second line. **Fix (mobile):** tighten the pills to fit one line, or let the row scroll. | Layout, Visual | All | 1 |
| M37 | **A long hero.** The check badge sits alone under the stats with empty space to its right, and the hero (title, greeting, stats, badge, Up Next) runs about 1.2 screens before "Next Action". **Fix (mobile):** put the badge beside the title. | Visual, Layout | All | 1 |

The rest works:
- Up Next, Next Action and After 7 Working Days stack clearly, with the DD/MM/YYYY date.
- The Risk Held popup stacks WhatsApp over View.
- The paid Purchase Summary opens from its single chevron.
- The RM card and BimaNetra Suggests run full width.
- Visit Dashboard stays pinned.

The DitherBurst canvas starts 71px off the left edge but doesn't widen the page.

---

## Not covered here

- **Real devices.** These checks need iOS Safari and Android Chrome on hardware: the on-screen keyboard over the pinned footers and sheets, the home-bar inset, rubber-band scrolling, and the camera/file picker (uploads here used dummy files).
- **Screen readers:** out of scope.
- **The `/netrabot` studio:** not part of the journey.

## Suggested order
1. **Touch basics:** M1, M2, M3, M4. These are shared components, so one fix reaches every screen.
2. **Screen space:** M27 and M14, mobile-only CSS in the <1000px block.
3. **Dead ends:** M8, M20 and M28.
4. **Copy pass:** M12, M29, M30, M31 and M35.
