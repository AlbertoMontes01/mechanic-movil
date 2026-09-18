import { useEffect, useState } from "react";
import { Users, Car } from "lucide-react";
import { api } from "@/api/client";

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.stats.getPublic().then(setStats).catch(() => {});
  }, []);

  // Fails silently and renders nothing rather than a broken "0 / 0" if the
  // request errors -- a missing trust signal is better than a wrong one.
  if (!stats) return null;

  // A stat sitting at zero undermines trust rather than building it -- hide
  // that one card instead of showing "0 Vehicles tracked". It reappears on
  // its own the moment it's non-zero, no code change needed later.
  const items = [
    { icon: Users, value: stats.mechanics, label: "Independent mechanics" },
    { icon: Car, value: stats.vehicles, label: "Vehicles tracked" },
  ].filter((s) => s.value > 0);

  if (items.length === 0) return null;

  return (
    <section className="border-y border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-primary">
          Already trusted by mechanics like you
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
          {items.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/15">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="text-left">
        <p className="font-display text-4xl font-bold leading-none sm:text-5xl">{value.toLocaleString()}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
