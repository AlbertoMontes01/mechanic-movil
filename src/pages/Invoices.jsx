import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAsync } from "@/lib/useAsync";
import { money, fmtDate } from "@/lib/format";
import { PageHeader, Loader, EmptyState, StatusBadge, Card } from "@/components/shared";
import { FileText, Plus, Search } from "lucide-react";

const FILTERS = ["All", "pending", "paid"];

export default function Invoices() {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");

  const { data, loading } = useAsync(() =>
    Promise.all([
      base44.entities.Invoice.list("-date", 200),
      base44.entities.Client.list(),
      base44.entities.Vehicle.list(),
    ])
  );

  if (loading) return <Loader />;
  const [invoices, clients, vehicles] = data;
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));

  const ql = q.toLowerCase();
  const filtered = invoices.filter((inv) => {
    if (tab !== "All" && inv.status !== tab) return false;
    if (!q) return true;
    const v = vehicleMap[inv.vehicle_id];
    return clientMap[inv.client_id]?.name?.toLowerCase().includes(ql) || v?.plate?.toLowerCase().includes(ql) || inv.invoice_number?.toLowerCase().includes(ql);
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total || 0), 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + Number(i.total || 0), 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total`}
        actions={<Link to="/invoices/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> New</Link>}
      />

      <div className="grid grid-cols-2 gap-3 mb-4 max-w-md">
        <Card className="p-3"><p className="field-label">Paid</p><p className="font-display text-xl font-bold text-emerald-300">{money(totalPaid)}</p></Card>
        <Card className="p-3"><p className="field-label">Pending</p><p className="font-display text-xl font-bold text-amber-300">{money(totalPending)}</p></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Search client, plate, invoice #…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setTab(f)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide capitalize ${tab === f ? "border-primary bg-primary text-primary-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices" hint="Create one from a work order or standalone." />
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => {
            const v = vehicleMap[inv.vehicle_id];
            return (
              <Link key={inv.id} to={`/invoices/${inv.id}/view`}>
                <Card className="p-3 flex items-center justify-between hover:border-primary/40 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{inv.invoice_number || "Invoice"}</p>
                    <p className="text-sm text-muted-foreground truncate">{clientMap[inv.client_id]?.name || "—"} · {v ? `${v.make} ${v.model}` : ""}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(inv.date)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-display text-lg font-bold text-foreground">{money(inv.total)}</span>
                    <StatusBadge status={inv.status} kind="inv" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
