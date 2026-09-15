import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const WO_STATUS = {
  Draft: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
  "In Progress": "bg-amber-500/15 text-amber-300 border-amber-500/50",
  "Ready to Invoice": "bg-sky-500/15 text-sky-300 border-sky-500/50",
  Invoiced: "bg-emerald-500/15 text-emerald-300 border-emerald-500/50",
};

const INV_STATUS = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/50",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/50",
};

export function StatusBadge({ status, kind = "wo" }) {
  const map = kind === "inv" ? INV_STATUS : WO_STATUS;
  const cls = map[status] || "bg-zinc-500/15 text-zinc-300 border-zinc-500/40";
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-12 px-4 text-center">
      {Icon && <Icon className="h-8 w-8 text-muted-foreground/50 mb-3" />}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loader({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function PageHeader({ title, subtitle, back, actions }) {
  return (
    <div className="mb-5">
      {back && (
        <Link to={back} className="mb-2 inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ children, className = "", onClick }) {
  return (
    <div onClick={onClick} className={`glass-card rounded-lg border border-white/10 ${className}`}>
      {children}
    </div>
  );
}
