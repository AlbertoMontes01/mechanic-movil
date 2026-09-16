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

// Standard tiered markup: cheaper parts get a much higher percentage (a
// $2.19 fitting marked up 35% is only $0.77 more -- not worth the trip --
// so it needs closer to 100%) while expensive parts get a smaller
// percentage (the dollar margin is already large on its own). Each tier is
// itself a range rather than one flat number, since real shops quote a
// range too; the tier's upper bound is inclusive.
const MARKUP_TIERS = [
  { costMax: 10, pctMin: 75, pctMax: 100 },
  { costMax: 25, pctMin: 60, pctMax: 75 },
  { costMax: 50, pctMin: 45, pctMax: 60 },
  { costMax: 100, pctMin: 35, pctMax: 45 },
  { costMax: 250, pctMin: 30, pctMax: 35 },
  { costMax: 500, pctMin: 25, pctMax: 30 },
  { costMax: 1000, pctMin: 20, pctMax: 25 },
];
const OVER_TIER = { pctMin: 15, pctMax: 20 }; // $1,000+

function markupTierFor(cost) {
  const c = Number(cost);
  if (!Number.isFinite(c) || c <= 0) return null;
  return MARKUP_TIERS.find((t) => c <= t.costMax) || OVER_TIER;
}

// The midpoint of the tier's range -- used as the single suggested number
// (the placeholder), since the input can only show one value at a time.
export const suggestedMarkupPct = (cost) => {
  const tier = markupTierFor(cost);
  return tier ? (tier.pctMin + tier.pctMax) / 2 : null;
};

// The tier's full range as shown in the reference table, e.g. "60-75%" --
// for display alongside the single suggested number, not instead of it.
export const suggestedMarkupRange = (cost) => {
  const tier = markupTierFor(cost);
  return tier ? `${tier.pctMin}-${tier.pctMax}%` : null;
};
