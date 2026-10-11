# Journey Audit: Onboarding → Quotes → Checkout → Success

**Journey:** `/directors-and-officers-insurance` → `/{case}/quotes` → `/{case}/checkout/{billing|verification|review}` → `/{case}/checkout/success`
**Build:** local dev, 12 Oct 2026 (commit `b6264ee`)
**Method:** expert review in the browser at desktop (≈1400–1500px) and mobile (375px), plus a read of every mock that feeds the journey (`productPage.ts`, `quotesPage.ts`, `policies.ts`, `checkout.ts`) and the chat logic (`quotes-chat.ts`). No sessions with real users; the usability parts are expert task walkthroughs, with a test plan at the end.

**Lenses per stage:** heuristic evaluation (Nielsen's 10), usability walkthrough, information architecture, visual design, content & copy. The Quote Page keeps its full five-part audit; the other stages report the same lenses, findings-first.

**The three cases**

| | Business | Records | Onboarding | Quotes | Checkout | Success |
|---|---|---|---|---|---|---|
| **A** | Pepe Jeans Innerfashion Pvt Ltd | Verified | Fields filled and green; Risk auto-personalised | Welcome popup → Score tab · 82.4/100 · Gold: Generali with an offer | Documents fetched from MCA; E-Sign | Risk Held Letter, Visit Dashboard |
| **B** | Sabyasachi Calcutta LLP | Partly verified | PAN green, type/business orange guesses, turnover blank | Welcome popup → Score tab · 80*/100 · Gold: "Your Personalised Gold Quote", Unlock Quote | Address a guess to check; E-Sign | Same as A |
| **C** | Studio Two Rupees LLP | None found | Everything by hand | Chat tab · no score · Schedule A Call | Everything by hand; E-Sign | Same as A |

**Severity:** 4 = blocks or misleads · 3 = major friction or a misleading claim · 2 = noticeable, worth fixing · 1 = polish.

**Out of scope on purpose:** Case B's Gold Quote showing no price or insurer before the popup; orange marking BimaNetra features; the quote count changing as the Gold card arrives; screen-reader support; the "Filtering:" prefix in the filter field; the hidden demo shortcuts (title clicks, the info-icon cycle).

---

## The three questions about the Success screen

| Question | Verdict | Why |
|---|---|---|
| **Can the user tell what happens next?** | ⚠️ Partly | "Up Next" says the policy will be issued and the Policy Issuance row is open, so the next event is visible. But nothing says whether the user has to do anything (they don't), and for B and C the Checkout row says "we'll double-check the rest" without saying what that check is, whether anyone will call, or whether the price can change (S7). |
| **Can they tell when the policy arrives?** | ⚠️ Partly | "7 working days" appears once, as a duration, inside the greeting card. The Policy Issuance row itself has no time and no date, and nothing says how it arrives (email, WhatsApp, the vault) (S3). Four names are used for where it will live (S4). |
| **Do they understand the Risk Held Letter stands in for the policy until it arrives?** | ✅ Now, yes (was ❌) | Fixed: Up Next and the modal both open with "You're covered from today" and call the letter the proof of cover until the policy arrives. *Before:* The page offers the letter only as a download. The modal explains it in dictionary language with three names for one document, and the one line that matters ("temporary, binding insurance coverage is active") sits mid-sentence (S1). The plainest statement, "Your cover is held from the date of payment", lives in the Disclaimer, which is folded shut (S2). A second, similarly named document (Risk Report) sits one row up (S5). |

**What's shipped:** Up Next and the Risk Held modal now both open with *"You're covered from today."* and call the letter the proof of cover until the policy arrives; Up Next and Policy Issuance say the policy will be emailed and will be on the Dashboard. **Still open:** a date instead of "7 working days" (S3) and the unspoken checks for B and C (S7).

---

## Journey summary: top 15 to fix

| # | Issue | Stage | Cases | Sev |
|---|---|---|---|---|
| 1 | ✅ **Fixed:** the Risk Held Letter is now framed as proof of cover (S1) | Success | All | ~~3~~ |
| 2 | ✅ **Fixed:** "You're covered from today" now leads Up Next and the Risk Held modal (S2) | Success | All | ~~3~~ |
| 3 | ✅ **Fixed:** users can now read the Mandate Letter before signing, and it has one name (K1) | Checkout | All | ~~3~~ |
| 4 | ~~Declarations pre-answered "No"~~ **Withdrawn:** the answers come from public sources, and Confirm and Continue is the customer's confirmation (O1) | Onboarding | A, B | - |
| 5 | ~~"Business Secured", "Risk Insured" claim cover too early~~ **Withdrawn:** by design, these say BimaNetra is securing the business and insuring the risk in real time from public sources, as an expert would on a call (O2) | Onboarding | All | - |
| 6 | **Quotes confirmed by an expert also get a Risk Held Letter** and the 7-day promise, while their row says an expert still has to confirm with the insurer | Success | All (non-immediate quotes) | 3 |
| 7 | ~~No path when the buyer isn't the Aadhaar signatory~~ **Withdrawn:** Billing's "Buy in Another Person's Name" covers this before Verification (K2) | Checkout | All | - |
| 8 | **Cards carry five signals each** in three visual styles, with no clear order | Quotes | All | 3 |
| 9 | **The issue date is a duration, not a date**, and only in the greeting card | Success | All | 2 |
| 10 | **Four names for where the policy lives:** Dashboard, Document Vault, Policies folder, BimaKendra | Success | All | 2 |
| 11 | **"Profile" means two different things:** contact details in onboarding, company details on the quotes page | Onboarding, Quotes | All | 2 |
| 12 | **The welcome popup now returns on every load**, including coming back from Edit Details or Checkout | Quotes | A, B | 2 |
| 13 | **Case B's research panel says "tick the box to confirm"** but there is no box | Onboarding | B | 2 |
| 14 | **"Upload Signature via E-Aadhaar"**: nothing is uploaded; it's a sign-with-OTP flow | Checkout | All | 2 |
| 15 | **The payment consent says the broker "is not responsible for policy creation errors"**, at the moment of paying | Checkout | All | 2 |

---

## Journey map

```
Onboarding (product page + quote modal)
  Hero ─ "Get ₹10 Cr Cover at ₹10,000/Year." · legal-name search · Get My Quote in 2 Minutes
  Modal ─ Profile (name, phone, email) → Business (type, business, turnover, PAN) → Risk (2 Yes/No + Sum Insured)
          left panel: BimaNetra runs 3 tasks (sources hit/partial/miss, news)
          CTA: Confirm and Continue → Get Instant Quotes
Quotes
  Welcome popup (A, B, every load) → feed with Gold Quote reveal → Details panel (Score/Chat/Profile)
  Buy (price button) → Checkout   ·   Request Quote → quote inquiry   ·   Unlock Quote (B Gold) → Gold gate
Checkout
  Billing (contact, locked company name) → Verification (KYC uploads + numbers, Company Registration, KYC Verification e-sign) → Review (consent) → Pay ₹X
Success
  Greeting card (headline, greeting, stats, badge, Up Next) · Risk Held modal opens itself after 4s
  Timeline: Profiling ✓ · Quotes ✓ · Checkout ✓ (Download Risk Held Letter) · Policy Issuance (pending, View Policy Copy disabled)
  BimaNetra Suggests · Purchase Summary (paid) · Relationship Manager · Disclaimer (folded)
```

---

## 1. Onboarding (product page + quote modal)

### What's working
- **The hero is one ask:** a single legal-name field with a clear promise ("Get My Quote in 2 Minutes"), with the privacy reason right beside it ("We use your company name to look up public records…").
- **Know More** explains BimaNetra in three plain points before anyone types.
- **The research is visible.** The left panel names its sources and their result (hit / partial / miss), shows what it found, and says "BimaNetra can make mistakes" under guessed fields. This is the strongest trust device in the journey.
- **Case C is handled kindly:** "That's normal for newer businesses - fill in the details below to continue."
- **The Sum Insured menu** separates Immediate Purchase (up to ₹10 Cr) from Other Options, setting the right expectation before the quotes.
- **Status colours carry meaning:** green confirmed, orange guessed, empty for manual, and a pick (even of the guessed option) confirms it.

### Findings
| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| O1 | ~~Declarations pre-answered.~~ **Withdrawn.** The Yes/No answers are filled from public sources, and Confirm and Continue is the customer's confirmation of them. | Heuristic (H5), Content | A, B | - |
| O2 | ~~Done labels claim cover.~~ **Withdrawn.** "Business Secured" and "Risk Insured" are intentional: BimaNetra secures the business and insures the risk in real time from public sources, the same work an expert does on a call. | Content, Heuristic (H2) | All | - |
| O3 | **Contact details come first.** Step 1 asks for name, phone and email before the user sees any research or price. The engine works in the background, but the user feels a lead form. Consider moving Profile last ("Where should we send your quotes?"), or showing the research panel's first finding while they type. | Usability | All | 2 |
| O4 | **"Profile" collides.** Here it means *your contact details*; on the quotes page the Profile tab means *the company's details*. Suggested: "You" / "Contact" here, keep "Profile" on the quotes page (or "Business Details" there). | IA | All | 2 |
| O5 | **A confirm box that doesn't exist.** Case B's footer: "Review each field, then tick the box to confirm before continuing." Confirm and Continue is the confirmation; there's no tick box. Suggested: "Review each field, then Confirm and Continue." | Content, Heuristic (H4) | B | 2 |
| O6 | **Unverified bad press about your own company.** Case B's Risk panel shows "linked to a GST notice (entity not corroborated)" to the business owner. Even labelled unconfirmed, it's alarming and may be about someone else. Show the count and the caveat ("3 low-confidence mentions, possibly another business") and keep headlines for verified matches. | Usability, Content | B | 2 |
| O7 | **Form prompts as labels:** "Enter Company Name", "Enter Company Type" stay as labels once filled (and travel to the quotes Profile tab and the Billing step). Suggested: "Company Name", "Company Type". | Content | All | 1 |
| O8 | **Three CTA promises:** "Get My Quote in 2 Minutes" → "Get Instant Quotes" → toast "Preparing your quotes". "Instant" and "2 minutes" pull in different directions. Pick one: "Get My Quotes". | Content | All | 1 |
| O9 | **Turnover blank in B** while type and business are guessed. Fine as a choice, but it's the one field without a hint; a range from MCA filings, if available, would keep B consistent. | Usability | B | 1 |
| O10 | **"Company PAN" uses the data key `cin`.** Invisible to users, but the same mismatch appears in the quotes Profile tab. | Content | All | 1 |

---

## 2. Quote Page

### What changed since the last pass
| Area | Now |
|---|---|
| **Arrival** | The welcome popup shows right after the skeleton on **every load** (A, B), and the Gold Quote reveal waits until it's dismissed. The info line now sits above Show All. |
| **Details panel** | Back to the earlier order: **A and B open on Score** (Score · Chat · Profile); **C opens on Chat** (Chat · Profile · Score). |
| **Everything else** | Unchanged since the 12 Oct re-run: card layout (Figma 827:20909), "N Key Coverages & Exclusions" chip, score out of 100, Gold Quote naming, filled Filter & Sort with Claim Settlement sorts, grouped Sum Insured menu, chat starter questions, 32/16 side padding. |

**Resolved by these changes:** the previous #2 ("after the welcome popup, the score lives in the last tab"), IA1 and Task 8 are closed. A and B land on the Score tab, so the score is one glance away after the popup.

### Summary: top 10 for this page
| # | Issue | Cases | Audit | Sev |
|---|---|---|---|---|
| 1 | **Cards carry five signals each** (territory tag, Immediate Purchase/Secured tag, CSR pill, key-lines chip, price) in three visual styles | All | Visual, Usability | 3 |
| 2 | **The welcome popup returns on every load**, so returning from Edit Details, Checkout or a refresh repeats the same explainer and delays the Gold reveal | A, B | Usability | 2 |
| 3 | **Three ways to get help** compete: the Chat tab, the Need Help card and Mail Quotes (the loudest header button, and not a help action) | All | IA | 2 |
| 4 | **Changing Sum Insured takes three steps** (Profile → Edit Details → Risk step) | All | Usability, IA | 2 |
| 5 | **"80*"**: the asterisk is explained only by a tooltip, which doesn't exist on touch | B | Heuristic, Copy | 2 |
| 6 | **Profile reads like a form:** "Enter Company Type" as a read-only label | All | Copy | 2 |
| 7 | **The sort field changes width** between price and claim-settlement sorts, shifting the filter beside it | All | Visual | 2 |
| 8 | **"Show All"** under a list of coverages can read as "show all coverages" | A, B | Copy, Usability | 2 |
| 9 | **The buy button never says "Buy"**: it's the price and an arrow | All | Usability, Copy | 2 |
| 10 | **Small grey text** (12px tertiary) likely below AA contrast | All | Visual | 2 |

### 2.1 Heuristic evaluation
- **H1 Visibility of status** ✅ The popup tells A and B what happened, what it means and what it changed. ✅ Filter and Sort show the feed's state. ⚠️ "80*/100" is provisional only in a tooltip. *B · 2*
- **H2 Real-world match** ✅ "82.4/100" shows its scale; the chip says what it counts. ⚠️ "Claim Settlement" (sort) vs "Claim Settlement Ratio" (cards). *All · 1*
- **H3 Control and freedom** ✅ The popup closes with ×, Show All, Esc or outside click; compare items remove one by one. ⚠️ The popup can't be turned off for the visit; it comes back on every load (Q2). *A, B · 2* ⚠️ Edit Details is inside Profile. *All · 2*
- **H4 Consistency** ✅ One name for the Gold Quote and the experts. ✅ A and B share one tab order; C's differs by design. ⚠️ "Schedule A Call" (Case C button) vs "Schedule a Call" (its alert, the Gold gate, the Gold inquiry page). *1* ⚠️ Curly and straight apostrophes mixed. *1* ⚠️ NetraBot keeps its colour in the Chat tab when unselected. *1*
- **H5 Error prevention** ✅ Compare caps at 3; offline quotes show "Unavailable"; Request Quote only means asking an offline insurer.
- **H6 Recognition over recall** ✅ The chip names what it counts. ✅ The key lines are on the Score tab A and B land on.
- **H7 Flexibility** ✅ Chat starter questions go straight to the key lines; Claim Settlement sorts both ways. ⚠️ With Score first, Chat's starter questions are one tap further for A and B. *1*
- **H8 Minimalist design** ⚠️ Five badge-like signals per card (V1). *3*
- **H9 Error recovery** ✅ Case C explains why there's no score and offers Schedule A Call; Chat explains there are no key lines yet.
- **H10 Help** ✅ The popup explains the score and key lines. ⚠️ Tooltips are the only explanation for the CSR, the offer price and the asterisk, and don't exist on touch. *All · 2*

### 2.2 Usability walkthrough
| Task | Outcome | Friction |
|---|---|---|
| 1 · What happened, and which quote first? | ✅ A: popup → Show All → Gold card with 11 key lines and the offer. ✅ B: popup → Gold card leads with Unlock Quote. ✅ C: Chat opens with general questions. | B's asterisk. *2* |
| 2 · What do the key lines mean for this quote? | ✅ Chip count; popup ticks and crosses; Chat answers by name. | Nothing says the lines are *the business's own*. "11 Key Coverages & Exclusions" can read as the policy's highlights. *A, B · 2* |
| 3 · Buy now | ✅ One click on a priced card; Immediate Purchase toggle filters fast. | The button never says "Buy". *2* |
| 4 · Change Sum Insured | ⚠️ Profile → Edit Details → Risk step, and coming back replays the welcome popup. | *2* |
| 5 · Compare two quotes | ✅ Add → tray → Compare Now; NetraBot stands in for B's Gold logo. | Offline insurers can't be compared; users learn by trying. *1* |
| 6 · What does 80* mean? | ⚠️ Hover the info icon. No answer on touch. | *B · 2* |
| 7 · Get help | ✅ C: "Our experts can help…" + Schedule A Call. | C on phones: a `tel:` call beats a booking. *1*. All: Chat, Need Help and Mail Quotes split the job. *2* |
| 8 · Come back to the page | ⚠️ A, B: the popup and the skeleton-to-reveal sequence replay on every return. | *2* |

### 2.3 Information architecture
```
Header ─ Logo · Mail Quotes
Welcome popup (A, B, every load) ─ upgrade copy + Business Health | key lines · info line · Show All
Left panel ─ segmented tabs (A, B: Score · Chat · Profile; C: Chat · Profile · Score)
├─ Score    → banner (title + View Report / Notify Me / Schedule A Call) · Business Health x/100 · key lines
├─ Chat     → Ask BimaNetra (A/B: Gold Quote + key-line questions; C: general)
└─ Profile  → Legal Company Name ✓ · 7 rows · Edit Details
   (phones: a floating dock; the open tab shows ×)
Feed ─ breadcrumb · "N Directors & Officers Insurance Quotes" · Need Help
     ─ Filtering · Sorting · Immediate Purchase Only (right-aligned)
     ─ cards ─ tags · logo | CSR · name · key-lines chip | Compare · rule · Sum Insured | price
        └─ popup ─ key lines · Overview · Territory · Exclusions · Coverages · Deductibles
```
| # | Finding | Cases | Sev |
|---|---|---|---|
| IA1 | **Help is split three ways:** Chat, Need Help, Mail Quotes (a send-to-self action styled as the main header CTA). Group help; make Mail Quotes secondary. | All | 2 |
| IA2 | **Edit Details is buried** in Profile, the main way to re-price. A Sum Insured control in the feed header would cover the commonest edit. | All | 2 |
| IA3 | **Filter controls:** the filter field carries its own icon plus a chevron, and Immediate Purchase is a separate switch. | All | 1 |
| IA4 | **Popup tabs overlap:** Overview lists coverages; Coverages/Extensions lists them again. | All | 1 |
| IA5 | **Three labels for one place:** breadcrumb "Live Quotes", heading "Directors & Officers Insurance Quotes", tab title "Directors & Officers Insurance". | All | 1 |

### 2.4 Visual design
**Working:** the two-face type system; the calmer card layout with every card in a row lining up (B's Gold included); the segmented tabs with a clear white pill; the welcome popup close to Figma on both widths; the full-size "82.4/100"; consistent 32/16 padding.

| # | Finding | Cases | Sev |
|---|---|---|---|
| V1 | **Badge overload on cards.** Up to five pill-like elements in three styles. Suggested order: price and CTA, then the key-lines chip, then Immediate Purchase; CSR and territory as quieter text. | All | 3 |
| V2 | **The sort field's width changes** with its value (≈247px price, ≈320px claim settlement). Fix it at the longest option. | All | 2 |
| V3 | **The CSR pill's style is new to the system** (neutral hairline, 12px grey). | All | 1 |
| V4 | **Two-line insurer names** at 18px SemiBold take height in compact cards. | All | 1 |
| V5 | **Popup backdrop** uses the site scrim, not Figma's 54% black. | A, B | 1 |
| V6 | **NetraBot stays full colour** in an unselected Chat tab. | All | 1 |
| V7 | **Small grey text** (12px tertiary) likely below AA contrast. | All | 2 |
| V8 | **Filled filter fields** are as loud as inputs, near the purple price buttons. | All | 1 |
| V9 | **The mobile Gold reveal** (dither burst) now replays after every popup dismissal. | A | 1 |

### 2.5 Content & copy
| # | Copy now | Issue | Suggested | Cases | Sev |
|---|---|---|---|---|---|
| C1 | Popup button "Show All" | Can read as "show all coverages" | "See My Quotes" | A, B | 2 |
| C2 | Chip "7 Key Coverages & Exclusions" | Doesn't say they're the business's own | "7 of Your Key Lines", or "Yours" in the popup header | A, B | 2 |
| C3 | Profile "Enter Company Type" | Form prompt as a label | "Company Type" | All | 2 |
| C4 | "80*/100" | Tooltip only | Caption: "Provisional until your report is ready" | B | 2 |
| C5 | "₹7,800 →" | Never says what it does | "Buy · ₹7,800" | All | 1 |
| C6 | "Claim Settlement" vs "Claim Settlement Ratio" | Two names | Accept, or "Settlement Ratio" in the sort | All | 1 |
| C7 | "Arriving Soon", "Arriving Soon", "Almost There" | Two identical steps | "A few minutes left" → "About a minute" → "Almost there" | B | 1 |
| C8 | "Schedule A Call" vs "Schedule a Call" | Casing | Pick one | C | 1 |
| C9 | "We’ve" / "We're" | Mixed apostrophes | Curly everywhere | All | 1 |
| C10 | "Want a Sharper Price?" | Implies blunt prices | Optional: "Want a Price That Fits Better?" | C | 1 |
| C11 | "Down from ₹7,800 with BimaNetra" | Tooltip only | Visible on the card | A | 1 |

Chat's key-line answers stay factual and never pick an insurer. ✅ IRDAI-safe.

---

## 3. Checkout (Billing → Verification → Review)

### What's working
- **Three steps, clearly named**, with a stepper that blocks skipping ahead ("Finish the earlier steps first") and a progress bar.
- **Upload once, fill everything:** uploading the GST certificate or PAN card reads it ("Reading your document…") and fills the numbers and address, each marked "Read from your GST certificate".
- **Case A's documents arrive already fetched from MCA**, with Upload New as an escape hatch.
- **The e-sign modal is honest about privacy:** consent is a separate tick, and "we never see or store your Aadhaar number". Clear errors ("Enter a 12-digit Aadhaar or a 16-digit Virtual ID").
- **The signature gates Save & Continue**, and Review shows "E-Aadhaar · Signed", so nothing is missed.
- **Review → Pay ₹X** names the amount on the button.
- **The IRDAI reason for KYC is stated up front** in the Verification banner.

### Findings
| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| K1 | ✅ **Fixed.** "View Mandate Letter" now sits at the end of the e-sign field's label row and after the NSDL popup's intro, so users can read what they sign. The popup says "Sign your Mandate Letter with your Aadhaar" (was "proposal"). In the prototype the link shows a "next" notice. | Heuristic (H1, H4), Usability | All | ~~3~~ |
| K2 | ~~No path for a buyer who isn't the signatory.~~ **Withdrawn:** Billing offers "Buy in Another Person's Name" before the user reaches Verification, so the signatory can be set up front. | Usability | All | - |
| K3 | **"Upload Signature via E-Aadhaar"**: nothing is uploaded; it's a sign-with-OTP flow, and the zone below already says "Sign…". Suggested label: "E-Sign with Aadhaar". | Content | All | 2 |
| K4 | **Two KYC sections on one step:** "KYC Details" (uploads and numbers) at the top and "KYC Verification" (e-sign) at the bottom, with Company Registration Details between them. The hardest task comes last and its title repeats the first. Suggested: rename it "Mandate Letter" or "E-Sign", or move it under KYC Details. | IA | All | 2 |
| K5 | **The payment consent lowers trust at the worst moment:** "I understand the broker is not responsible for policy creation errors, as this depends on the insurance company." If legal requires it, soften: "The insurer issues the policy from the details above, so please check them carefully." | Content | All | 2 |
| K6 | **"Final" and "may revise it" in one line:** the checkout disclaimer reads "The price shown is final for the details you've entered. If any of them turn out to be wrong, the insurer may revise it." Fine legally, but it's the only place the condition appears, and B/C later read "we'll double-check" (S7). Say it once, plainly, on Review: "Your price is fixed unless a detail turns out to be wrong." | Content, Heuristic (H1) | All | 2 |
| K7 | **Verification is the longest step by far:** 2 uploads, 2 numbers, 3 address fields and the e-sign with two OTP stages, behind one Save & Continue. For C (all by hand) it's the heaviest screen in the journey. Consider making the e-sign its own step, or showing per-section ticks. | Usability | C (mostly) | 2 |
| K8 | **"Premium" means two things:** in the Purchase Summary it's the pre-GST figure; on Success "Policy Premium" is the total including GST. | Content | All | 1 |
| K9 | **Form prompts as labels:** Billing's locked field is "Enter Company Name"; upload labels are long ("Upload a PDF or an Image of Your Company GST Certificate"). Suggested: "Company Name"; "GST Certificate (PDF or image)". | Content | All | 1 |
| K10 | **Ampersands in body copy:** "shown on your policy & used for communication". Use "and". | Content | All | 1 |
| K11 | **E-sign naming:** E-Aadhaar, NSDL E-Sign, NSDL e-Gov, Aadhaar eSign. Pick "Aadhaar E-Sign" for the feature and "NSDL" for the provider. | Content | All | 1 |

---

## 4. Success

### What's working
- **The greeting card answers "did it work?"** at once: a confirmed headline, the order number, start and end dates, the amount and the period, with the green badge.
- **The timeline tells the story** of the whole journey (profiled in 45s, quote chosen, checkout done), which makes the speed tangible.
- **Policy Issuance is open by default** and its View Policy Copy button is visibly waiting ("Ready once the insurer issues your policy").
- **The Risk Held Letter comes to the user:** its modal opens a beat after the page lands, with Download Now and Send to WhatsApp.
- **A named human:** the Relationship Manager card with a phone number.
- **No signing left to do:** the mandate was signed at checkout, so there's no Due Diligence step and the header leads with Visit Dashboard.

### Findings
| # | Finding | Lens | Cases | Sev |
|---|---|---|---|---|
| S1 | ✅ **Fixed.** The modal now opens with **"You're covered from today."** and reads: *"Your insurer is issuing your policy. Until it arrives, this letter is your proof of cover. Share it with anyone who asks, such as your board, a lender or an investor."* (Was a third-person definition with three names for one document.) | Content, Heuristic (H2) | All | ~~3~~ |
| S2 | ✅ **Fixed.** Up Next now opens with **"You're covered from today."** and says the Risk Held Letter is the proof of cover until the policy arrives. The Disclaimer line stays as the legal version. | Heuristic (H1), IA | All | ~~3~~ |
| S3 | **When, as a date.** "7 working days" is still a duration, not a date. ✅ *How* is fixed: Up Next and the Policy Issuance row now say the policy will be emailed and will be on the user's Dashboard. Remaining suggestion: "Expected by 21 Oct 2026". | Heuristic (H1), Usability | All | 2 |
| S4 | **Four names for one place:** "your Dashboard" (Up Next, header), "the Policies folder of your Document Vault" (Policy Issuance), "BimaKendra's Document Vault" (download toast), "BimaKendra Tasks" (the old mandate copy). Pick one destination name and use it everywhere. | IA, Content | All | 2 |
| S5 | **Two documents, near-identical names:** "Download Risk Report" (Profiling row, the BimaNetra assessment), "Risk Held Letter" (proof of cover), and the preview's back page reads "Risk Assessment Report"; the modal body says "Risk Held Report". Rename the first "BimaNetra Report" (as the Gold row's status already says) and keep "Risk Held Letter" as the only "Risk Held". | Content, IA | All | 2 |
| S6 | ✅ **Fixed.** The modal's first button now reads "View" (was "Download Now", which didn't download; it opens the user's documents). | Heuristic (H2), Usability | All | ~~2~~ |
| S7 | **Unspoken checks for B and C.** Their Checkout row (marked done) says "we'll double-check the rest" (B) or "We'll check them before your policy is issued" (C), but no step shows that check, and nothing says what happens if it fails (a call? a price change? cover?). Either add it to the Policy Issuance row ("We're checking your details with the insurer; we'll call only if something needs you") or drop the line. | Heuristic (H1), Usability | B, C | 2 |
| S8 | **Expert-confirmed quotes get the same promise.** A priced quote without Immediate Purchase (e.g. Royal Sundaram) can be paid; its Checkout row reads "Next Up: Expert Review… An expert confirms your details with the insurer before the policy is issued", yet the page still offers a Risk Held Letter and "issued in 7 working days". If cover isn't bound until the insurer accepts, the letter overstates it. Give this path its own Up Next ("Your expert confirms with the insurer within a working day; your cover starts once they accept") or confirm cover is held. | Content, Heuristic (H2) | All (non-immediate) | 3 |
| S9 | **"Booking" is travel language.** "Your Policy Booking is Confirmed!" sits next to "You have successfully paid for your… policy" and "Your policy will be issued". Suggested headline: **"You're Covered!"** or "Payment Received, Cover Started". | Content | All | 2 |
| S10 | **The Risk Held modal opens itself after 4s**, over the greeting, before the user has read it. Good instinct; consider 6–8s, or opening it only after the timeline has drawn. | Usability | All | 1 |
| S11 | **US date format:** "Oct 12, 2026", "Paid successfully on October 12, 2026". British: "12 Oct 2026", "12 October 2026". | Content | All | 1 |
| S12 | **"It took you just 12m 25s to pay"**: "just" reads oddly once the clock passes a few minutes. Drop "just" above ~3 minutes. | Content | A | 1 |
| S13 | **"An excellent choice!"** after choosing the Gold Quote praises the pick. Post-sale it isn't advice, but it sits close to IRDAI's "best" line. Optional: "Your Gold Quote is built around your business." | Content | A, B (Gold) | 1 |
| S14 | **Two help routes in view:** "Speak to an Expert" (header) and the RM card's phone. They are the same job; point the header to the RM. | IA | All | 1 |
| S15 | **"Policy Premium" is the GST-inclusive total** (see K8). | Content | All | 1 |

### Live copy (after the fixes)
**Up Next**
> **You're covered from today.** Your policy will be issued in 7 working days. We'll email it to you, and you'll find it on your Dashboard. Until then, your Risk Held Letter is your proof of cover. Thank you for securing your business with BimaKavach!

**Risk Held modal**
> **You're covered from today.** Your insurer is issuing your policy. Until it arrives, this letter is your proof of cover. Share it with anyone who asks, such as your board, a lender or an investor.
> Buttons: View · Send to WhatsApp

**Policy Issuance row**
> We'll email your policy to you as soon as it's issued, and you'll find it on your Dashboard.

**Next step (S3):** swap "in 7 working days" for a date, e.g. "expected by 21 Oct 2026".

---

## 5. Across the journey

### Labels inventory
| Concept | Names in use | Suggested |
|---|---|---|
| The Gold Quote | ✅ Gold Quote (B card: Your Personalised Gold Quote; tag: Secured with BimaNetra) | Keep |
| Experts | ✅ IRDAI-certified Bima Experts · Speak to an Expert · Relationship Manager | Keep; route Speak to an Expert to the RM after purchase |
| Contact details vs company details | Profile (onboarding: contact) · Profile (quotes: company) · Your Details (panel label) | Contact (onboarding), Profile (quotes) |
| Where documents live | Dashboard · Document Vault · Policies folder · BimaKendra | One name |
| The BimaNetra assessment | Risk Report · BimaNetra Report · Risk Assessment Report · View Report | BimaNetra Report |
| Proof of cover | Risk Held Letter · Risk Held Report · Held Cover Letter | Risk Held Letter |
| The signed document | ✅ Mandate Letter | Keep |
| Signing | E-Aadhaar · NSDL E-Sign · NSDL e-Gov · Upload Signature | Aadhaar E-Sign (via NSDL) |
| Premium | Premium (pre-GST) · Policy Premium (incl. GST) · Total Cost | Premium / Total Cost |
| Booking a call | Schedule A Call · Schedule a Call | One casing |
| Field labels | "Enter Company Name", "Enter Company Type" as labels | Drop "Enter" |

### Cover-promise ladder (how strongly each stage claims cover)
| Stage | Copy | Claim | OK? |
|---|---|---|---|
| Onboarding | "Business Secured", "Risk Insured" | Real-time securing from public sources | ✅ By design |
| Quotes | "Immediate Purchase: buy your policy right now, completely online" | Buyable now | ✅ |
| Checkout | "The price shown is final… the insurer may revise it" | Conditional price | ⚠️ Say it on Review (K6) |
| Success | "You're covered from today" (Up Next, Risk Held modal) · Risk Held Letter as proof of cover | Covered now | ✅ Said where it counts; still overstated for expert quotes (S8) |

### House-rule checks
| Rule | Result |
|---|---|
| British English | ⚠️ Spelling ✅; dates are US format on Success (S11) |
| No em dashes in UI copy | ✅ |
| No "best" / "recommended" (IRDAI) | ✅ (S13 is borderline, optional) |
| Title Case on headings and CTAs | ✅ Mostly; see C8 |
| Plain, conversational tone | ✅ Mostly; the Risk Held modal (S1) and the payment consent (K5) are the exceptions |

---

## 6. Proposed real-user test plan
- **Who:** 5–6 SME founders or finance heads per case (15–18 total), mixed mobile and desktop.
- **Tasks:**
  1. From the product page, get a quote for your company.
  2. Tell us what BimaNetra found and whether it's right (O6).
  3. Pick and buy a quote; change your Sum Insured once on the way.
  4. Sign the mandate. *Ask: what did you just sign?* (K1)
  5. On Success, without clicking: *"Are you covered right now? When does your policy arrive? What would you show your bank tomorrow?"* (S1–S3)
- **Measure:** task success, time to first quote, time to pay, comprehension of the key-lines chip, correct answers to the three Success questions, SUS.
- **Hypotheses:** (1) fewer than half can say they're covered today from the Success screen as it is; (2) most open View Mandate Letter before signing.

---

*Test notes:* Sum Insured was ₹5 Cr in all three cases (kept from earlier testing). The browser session also held earlier checkout state, so the Case B Success check showed Case A's Generali Gold Quote at ₹8,500 and Case C's fallback name; copy and structure were verified, not per-case values. The Success texts above were read from the rendered page (Case B) and from `mocks/checkout.ts`. The expert-quote path (S8) was traced in code (`CheckoutView.tsx`, `SuccessView.tsx`), not clicked through.
