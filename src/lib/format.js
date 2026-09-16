export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—");
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid = () => Math.random().toString(36).slice(2, 9);

// A vehicle's unit number (fleet #) is more useful than its plate for
// day-to-day work-order identification when it has one -- plate stays the
// fallback for vehicles that were never assigned one.
export const vehicleIdValue = (v) => (v?.unit_number ? v.unit_number : v?.plate || null);
export const vehicleIdLabel = (v) => {
  if (v?.unit_number) return `Unit ${v.unit_number}`;
  if (v?.plate) return `Plate ${v.plate}`;
  return "";
};

// Suggested selling price from a cost + markup percentage, e.g. cost $10 at
// a 30% markup suggests $13. Purely a UI hint -- never persisted itself.
export const suggestedPrice = (cost, markupPct) => {
  const c = Number(cost);
  const m = Number(markupPct);
  if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(m)) return null;
  return c * (1 + m / 100);
};
