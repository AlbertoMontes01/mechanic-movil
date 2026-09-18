import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const INCLUDED = [
  "Unlimited clients & vehicles",
  "Digital work orders",
  "Inventory tracking with alerts",
  "Professional PDF invoices",
  "Access from your phone",
  "Private, isolated account",
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-y border-white/10 bg-card/30">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-bold uppercase tracking-tight">Simple pricing, no surprises</h2>
        <p className="mt-3 text-center text-muted-foreground">30 days free with a card on file. Then $10/month. No contracts, cancel anytime before your trial ends and you won't be charged.</p>
        <div className="mt-8 rounded-2xl border border-primary/40 bg-background p-8 text-center shadow-xl">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Full plan</p>
          <div className="mt-3 flex items-end justify-center gap-1">
            <span className="font-display text-6xl font-bold">$10</span>
            <span className="mb-2 text-muted-foreground">/mo</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">30-day free trial included</p>
          <Link to="/register" className="mt-6 inline-block rounded-md bg-primary px-8 py-3 font-semibold text-primary-foreground">Start free</Link>
          <div className="mt-8 grid gap-2 text-left sm:grid-cols-2">
            {INCLUDED.map((i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" /> {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
