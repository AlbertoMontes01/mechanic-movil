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

// Standard tiered markup: cheaper parts get a much higher percentage
// (a $5 part marked up only 10% isn't worth the trip to go get it) while
// expensive parts get a smaller percentage (the dollar margin is already
// large). Each tier's upper bound is inclusive.
const MARKUP_TIERS = [
  { max: 10, pct: 100 },
  { max: 25, pct: 80 },
  { max: 50, pct: 70 },
  { max: 100, pct: 60 },
  { max: 200, pct: 50 },
  { max: 300, pct: 40 },
  { max: 500, pct: 35 },
  { max: 750, pct: 30 },
  { max: 1000, pct: 25 },
  { max: 1500, pct: 20 },
  { max: 2000, pct: 15 },
];
const OVER_TIER_PCT = 12.5; // $2,000+: table says "10-15%" -- split the difference

export const suggestedMarkupPct = (cost) => {
  const c = Number(cost);
  if (!Number.isFinite(c) || c <= 0) return null;
  const tier = MARKUP_TIERS.find((t) => c <= t.max);
  return tier ? tier.pct : OVER_TIER_PCT;
};
