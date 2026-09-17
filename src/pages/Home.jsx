import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { money, fmtDate, todayISO } from "@/lib/format";
import { SectionTitle, StatusBadge, EmptyState, Loader, Card } from "@/components/shared";
import { ClipboardList, FileText, AlertTriangle, Plus, DollarSign, Package } from "lucide-react";

const FILTERS = ["Draft", "In Progress", "Ready to Invoice"];

export default function Home() {
  const [tab, setTab] = useState("In Progress");
  const { data, loading } = useAsync(() =>
    Promise.all([
      api.entities.WorkOrder.list("-date", 100),
      api.entities.Invoice.list("-date", 100),
      api.entities.InventoryItem.list(),
      api.entities.Client.list(),
      api.entities.Vehicle.list(),
    ])
  );

  if (loading || !data) return <Loader />;
  const [workOrders, invoices, items, clients, vehicles] = data;
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));

  const today = todayISO();
  const todaysEarnings = invoices.filter((i) => i.date === today).reduce((s, i) => s + Number(i.total || 0), 0);
  const outstanding = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + Number(i.total || 0), 0);
  const active = workOrders.filter((w) => w.status !== "Invoiced");
  const board = active.filter((w) => w.status === tab);
  const lowStock = items.filter((i) => i.track_stock && Number(i.stock || 0) <= 3);

  const vLabel = (wid) => {
    const v = vehicleMap[wid];
    return v ? `${v.year ? v.year + " " : ""}${v.make} ${v.model}` : "—";
  };
  const vPlate = (wid) => vehicleMap[wid]?.plate;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-5">
      {/* Primary feed */}
      <div>
        <SectionTitle action={
          <Link to="/work-orders" className="text-xs text-primary hover:underline">View all →</Link>
        }>Active Jobs</SectionTitle>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setTab(f)}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${tab === f ? "border-primary bg-primary text-primary-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>
              {f} <span className="ml-1 opacity-70">{active.filter((w) => w.status === f).length}</span>
            </button>
          ))}
        </div>

        {board.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No jobs in this stage" hint="Use the + button to create a work order." />
        ) : (
          <div className="flex lg:grid lg:grid-cols-2 gap-3 overflow-x-auto lg:overflow-visible no-scrollbar pb-2">
            {board.map((w) => (
              <Link key={w.id} to={`/work-orders/${w.id}/view`} className="min-w-[260px] lg:min-w-0">
                <Card className="p-4 h-full hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={w.status} />
                    <span className="text-xs text-muted-foreground">{fmtDate(w.date)}</span>
                  </div>
                  <p className="font-semibold text-foreground truncate">{clientMap[w.client_id]?.name || "—"}</p>
                  <p className="text-sm text-muted-foreground truncate">{vLabel(w.vehicle_id)} {vPlate(w.vehicle_id) && <span className="mono">· {vPlate(w.vehicle_id)}</span>}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {w.subjects?.length || 0} labor item{(w.subjects?.length || 0) === 1 ? "" : "s"}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right rail */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide font-semibold">
            <DollarSign className="h-4 w-4 text-[#10B981]" /> Today's Earnings
          </div>
          <p className="font-display text-3xl font-bold text-foreground mt-1">{money(todaysEarnings)}</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Outstanding</span>
            <span className="font-semibold text-amber-300">{money(outstanding)}</span>
          </div>
        </Card>

        <Link to="/work-orders/new">
          <Card className="p-4 flex items-center justify-center gap-2 border-primary/40 hover:bg-primary/10 transition-colors">
            <Plus className="h-5 w-5 text-primary" />
            <span className="font-display uppercase tracking-wide font-bold text-primary">New Work Order</span>
          </Card>
        </Link>

        <div>
          <SectionTitle action={<Link to="/inventory" className="text-xs text-primary hover:underline">Manage →</Link>}>Low Inventory</SectionTitle>
          {lowStock.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1">All parts above threshold.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.slice(0, 6).map((i) => (
                <Link key={i.id} to="/inventory" className="block">
                  <div className="flex items-center justify-between rounded-md border border-white/10 bg-card/60 px-3 py-2 hover:border-amber-500/40">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{i.name}</p>
                      {i.part_number && <p className="mono text-[11px] text-muted-foreground">{i.part_number}</p>}
                    </div>
                    <span className={`mono text-xs font-bold px-2 py-0.5 rounded ${Number(i.stock) <= 0 ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>
                      {i.stock} left
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
