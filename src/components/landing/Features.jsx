import { Users, ClipboardList, Package, FileText, Smartphone, Lock } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Clients & vehicles", desc: "A database of your clients and their vehicles, with full service history per vehicle." },
  { icon: ClipboardList, title: "Work orders", desc: "Create digital work orders: what was done, which parts were used, and technician notes. Everything gets recorded." },
  { icon: Package, title: "Inventory with alerts", desc: "Track your parts and get alerts when stock runs low. Never run out of what you need." },
  { icon: FileText, title: "PDF invoices", desc: "Generate itemized, QuickBooks-style invoices and send them as PDFs to your clients right from your phone." },
  { icon: Smartphone, title: "Built for your phone", desc: "Designed for someone on the move, not sitting at a desk. Works wherever you are." },
  { icon: Lock, title: "Private, isolated account", desc: "Your data is yours. Each mechanic has a private account — never mixed with another user's." },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center font-display text-3xl font-bold uppercase tracking-tight">Everything you need, in one app</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">From the first call to the final invoice, PitStop covers your entire shop workflow.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-lg border border-white/10 bg-card/50 p-5 transition-colors hover:border-primary/40">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/15">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
