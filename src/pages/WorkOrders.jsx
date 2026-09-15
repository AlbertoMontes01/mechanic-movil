import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAsync } from "@/lib/useAsync";
import { fmtDate } from "@/lib/format";
import { PageHeader, Loader, EmptyState, StatusBadge, Card } from "@/components/shared";
import { ClipboardList, Plus, Search } from "lucide-react";

const FILTERS = ["All", "Draft", "In Progress", "Ready to Invoice", "Invoiced"];

export default function WorkOrders() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState(params.get("q") || "");

  const { data, loading } = useAsync(() =>
    Promise.all([
      base44.entities.WorkOrder.list("-date", 200),
      base44.entities.Client.list(),
      base44.entities.Vehicle.list(),
    ])
  );

  if (loading) return <Loader />;
  const [workOrders, clients, vehicles] = data;
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));

  const ql = q.toLowerCase();
  const filtered = workOrders.filter((w) => {
    if (tab !== "All" && w.status !== tab) return false;
    if (!q) return true;
    const v = vehicleMap[w.vehicle_id];
    return (
      clientMap[w.client_id]?.name?.toLowerCase().includes(ql) ||
      v?.plate?.toLowerCase().includes(ql) ||
      v?.vin?.toLowerCase().includes(ql) ||
      (v?.make + " " + v?.model).toLowerCase().includes(ql)
    );
  });

  return (
    <div>
      <PageHeader
        title="Work Orders"
        subtitle={`${workOrders.length} total`}
        actions={<Link to="/work-orders/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> New</Link>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Search client, plate, VIN…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setTab(f)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${tab === f ? "border-primary bg-primary text-primary-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No work orders" hint="Create one with the + button." />
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => {
            const v = vehicleMap[w.vehicle_id];
            return (
              <Link key={w.id} to={`/work-orders/${w.id}/view`}>
                <Card className="p-3 flex items-center justify-between hover:border-primary/40 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{clientMap[w.client_id]?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground truncate">{v ? `${v.year ? v.year + " " : ""}${v.make} ${v.model}` : "—"} {v?.plate && <span className="mono">· {v.plate}</span>}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">{fmtDate(w.date)}</span>
                    <StatusBadge status={w.status} />
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
