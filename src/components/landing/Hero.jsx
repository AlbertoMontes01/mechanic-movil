import { Link } from "react-router-dom";
import { Wrench, ClipboardList, FileText, Package } from "lucide-react";

const TONES = {
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  zinc: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
};

const ORDERS = [
  { c: "Mike's Trucking", v: "Freightliner Cascadia", s: "In Progress", t: "amber" },
  { c: "Ramirez Auto", v: "Ford F-150 2019", s: "Ready", t: "sky" },
  { c: "Lopez Logistics", v: "Kenworth T680", s: "Draft", t: "zinc" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Made by independent mobile diesel mechanics, for independent mobile diesel mechanics
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your whole shop,<br /><span className="text-primary">in your pocket.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Manage clients, vehicles, work orders, inventory, and invoices in one place — right from your phone. Ditch the paper and notebooks.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="rounded-md bg-primary px-6 py-3 text-center font-semibold text-primary-foreground">Start</Link>
              <a href="#features" className="rounded-md border border-white/15 px-6 py-3 text-center font-semibold text-foreground hover:bg-white/5">See features</a>
            </div>
            {/* <p className="mt-4 text-sm text-muted-foreground">Card required to start · nothing charged for 30 days · $10/mo after</p> */}
          </div>

          <div className="mx-auto w-full max-w-[280px]">
            <div className="rounded-[2rem] border-4 border-white/15 bg-card p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem] bg-background">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-md bg-primary"><Wrench className="h-4 w-4 text-primary-foreground" /></div>
                    <span className="font-display text-sm font-bold">PitStop</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Orders</span>
                </div>
                <div className="space-y-2 p-3">
                  {ORDERS.map((o, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-card p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{o.c}</span>
                        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${TONES[o.t]}`}>{o.s}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{o.v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-around border-t border-white/10 px-3 py-2 text-muted-foreground">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <Package className="h-4 w-4" />
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
