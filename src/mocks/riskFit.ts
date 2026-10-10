import type { RiskFitByInsurer } from "@/types/quotesPage";

/*
 * Which of a scored business's key lines each insurer's quote meets, in the
 * insurer's own wording. The key lines are the Gold Quote's first six
 * coverages and its five exclusions (Score tab). A quote meets a key
 * coverage when its policy includes it, and a key exclusion when it carves
 * it out just as narrowly as the business needs (no wider). Matched lines
 * join that insurer's policy for this case only; `replaces` drops the
 * insurer's broader standard line the match stands in for.
 */

/* Case A, Pepe Jeans Innerfashion (retail, a distributor payment dispute,
   fast outlet growth). Key lines: Distributor Dispute Defence, Regulatory
   Investigations, Personal Asset Protection, Defence Costs Advance,
   Consumer Class Action Defence, Supplier Contract Claims | Fraud &
   Dishonesty, Product Defects, Known Disputes, Personal Profit, Unpaid Rent. */
const CASE_A: RiskFitByInsurer = {
  "Generali Central Insurance": {
    coverages: [
      { title: "Regulatory Investigations", body: "Legal help when SEBI, the MCA or a consumer forum calls a director in for questioning." },
      { title: "Personal Asset Protection", body: "Defence costs to lift a court order freezing or attaching a director's personal property." },
      { title: "Defence Costs Advance", body: "Generali pays your lawyers' bills within 30 days of receiving them, before the case ends." },
      { title: "Supplier Contract Claims", body: "Covers directors sued personally by a supplier over a purchase contract they approved." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud, once a final court ruling finds it. Defence costs are paid until then." },
      { title: "Product Defects", body: "The cost of faulty products themselves. Claims about how the board handled them are covered." },
      { title: "Known Disputes", body: "Disputes you knew about before the cover started, including the distributor payment claim.", replaces: "Earlier Claims" },
      { title: "Personal Profit", body: "Money or perks a director wasn't legally entitled to, once proven in court." },
    ],
  },
  "HDFC ERGO General Insurance": {
    coverages: [
      { title: "Regulatory Investigations", body: "Legal costs when a regulator or the police questions a director about the company's affairs." },
      { title: "Defence Costs Advance", body: "Legal fees are paid as the bills come in." },
      { title: "Consumer Class Action Defence", body: "Defends directors when a group of customers sues over pricing, refunds or product claims." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Product Defects", body: "Replacing or repairing defective goods. The board's decisions about them are still covered." },
      { title: "Known Disputes", body: "Complaints or claims known before the cover started.", replaces: "Earlier Claims" },
      { title: "Personal Profit", body: "Any gain a director wasn't entitled to, such as an unapproved bonus." },
    ],
  },
  "Royal Sundaram General Insurance": {
    coverages: [
      { title: "Personal Asset Protection", body: "Legal costs to challenge the freezing of a director's bank accounts or property." },
      { title: "Defence Costs Advance", body: "Defence costs are advanced on approval, with no wait for the case to close." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Personal Profit", body: "Any money or advantage you were not legally entitled to." },
      { title: "Product Defects", body: "Losses from defective products. Claims about board oversight of them are covered.", replaces: "Property Damage" },
      { title: "Known Disputes", body: "Any claim or circumstance known to a director before the policy began." },
    ],
  },
  "Bajaj General Insurance": {
    coverages: [
      { title: "Personal Asset Protection", body: "Defence costs when a lender or regulator moves to attach a director's personal assets." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Personal Profit", body: "Personal gain a director had no legal right to." },
    ],
  },
  "SBI General Insurance": {
    coverages: [
      { title: "Defence Costs Advance", body: "Legal costs are reimbursed monthly while a claim is defended." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Product Defects", body: "Recalls and repairs of faulty products. Directors' defence costs are still covered." },
      { title: "Known Disputes", body: "Disputes or notices known before the cover started.", replaces: "Earlier Claims" },
    ],
  },
  "ICICI Lombard General Insurance": {
    coverages: [
      { title: "Regulatory Investigations", body: "Legal help when SEBI, the CCI or the MCA investigates a director." },
      { title: "Supplier Contract Claims", body: "Covers directors named in a supplier's claim over a contract they signed off." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Personal Profit", body: "Profits or perks a director wasn't legally entitled to." },
      { title: "Known Disputes", body: "Claims or disputes known before the policy started." },
    ],
  },
};

/* Case B, Sabyasachi Calcutta LLP (an LLP-run design house). Key lines:
   Designated Partner Cover, GST & Tax Investigations, Brand & IP Defence,
   Crisis Management Costs, Karigar & Vendor Disputes, Defence Costs
   Advance | Fraud & Dishonesty, Tax Dues Themselves, Counterfeit Goods,
   Partner vs Partner, Unverified Entities. */
const CASE_B: RiskFitByInsurer = {
  "Generali Central Insurance": {
    coverages: [
      { title: "GST & Tax Investigations", body: "Legal costs when the GST or income tax department questions a partner over the LLP's returns." },
      { title: "Defence Costs Advance", body: "Generali pays your lawyers' bills within 30 days of receiving them." },
      { title: "Crisis Management Costs", body: "PR and crisis advisers when a claim puts the label in the news." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud, once a final court ruling finds it. Defence costs are paid until then." },
      { title: "Tax Dues Themselves", body: "The tax or interest owed. The cost of defending the investigation is covered." },
      { title: "Partner vs Partner", body: "Disputes between partners over profit shares or the LLP agreement." },
      { title: "Unverified Entities", body: "Firms using a similar name that aren't part of your LLP." },
    ],
  },
  "HDFC ERGO General Insurance": {
    coverages: [
      { title: "Designated Partner Cover", body: "Extends director cover to the LLP's designated partners, word for word." },
      { title: "Crisis Management Costs", body: "Crisis advisers when an employee or vendor dispute reaches the press." },
      { title: "Karigar & Vendor Disputes", body: "Covers partners named in payment or credit disputes with workshops and artisans." },
      { title: "Defence Costs Advance", body: "Legal fees are paid as the bills come in." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Tax Dues Themselves", body: "Taxes, interest or penalties owed. Investigation costs are covered." },
      { title: "Counterfeit Goods", body: "Claims about goods the LLP knowingly copied or sold." },
      { title: "Partner vs Partner", body: "Claims one partner brings against another over the LLP agreement." },
    ],
  },
  "Royal Sundaram General Insurance": {
    coverages: [
      { title: "Designated Partner Cover", body: "Designated partners are covered as if they were directors." },
      { title: "Defence Costs Advance", body: "Defence costs are advanced on approval, with no wait for the case to close." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Partner vs Partner", body: "Disputes among partners over profits, capital or exit terms." },
      { title: "Unverified Entities", body: "Businesses that share your name but aren't part of the LLP." },
    ],
  },
  "Bajaj General Insurance": {
    coverages: [
      { title: "GST & Tax Investigations", body: "Defends partners in GST or income tax proceedings over the LLP's filings." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Tax Dues Themselves", body: "The tax owed. Legal costs of the investigation are covered." },
      { title: "Partner vs Partner", body: "Disputes between partners under the LLP agreement." },
      { title: "Unverified Entities", body: "Entities outside the LLP, even with a similar name." },
    ],
  },
  "SBI General Insurance": {
    coverages: [
      { title: "Defence Costs Advance", body: "Legal costs are reimbursed monthly while a claim is defended." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Tax Dues Themselves", body: "Tax, interest and penalties. Only legal costs are covered." },
    ],
  },
  "ICICI Lombard General Insurance": {
    coverages: [
      { title: "Brand & IP Defence", body: "Defence costs when partners are named in a trademark or design dispute." },
    ],
    exclusions: [
      { title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law, once a court rules against you." },
      { title: "Counterfeit Goods", body: "Claims over goods the LLP knowingly copied." },
      { title: "Unverified Entities", body: "Companies outside the LLP that share its name." },
    ],
  },
};

export const RISK_FIT_BY_CASE = { A: CASE_A, B: CASE_B };
