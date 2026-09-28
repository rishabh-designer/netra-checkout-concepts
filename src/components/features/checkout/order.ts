/** The paid order: its number and when it was paid. Written when Pay is
 *  pressed on Review, read back by the success page (and kept on reload). */
export interface PaidOrder {
  id: string;
  paidAt: number;
}

const KEY = "bimanetra.order";
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

const makeId = () => Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

/** Start a new order (Review's Pay). */
export function writeOrder(): PaidOrder {
  const order = { id: makeId(), paidAt: Date.now() };
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* storage unavailable: the success page makes its own */
  }
  return order;
}

/** The last paid order, or a fresh one (a direct visit to the success page). */
export function readOrder(): PaidOrder {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as PaidOrder;
  } catch {
    /* fall through */
  }
  return writeOrder();
}
