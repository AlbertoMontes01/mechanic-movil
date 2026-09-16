import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { money, fmtDate } from "@/lib/format";
import { generateVehicleHistoryPDF } from "@/lib/pdf";
import { PageHeader, Loader, EmptyState, Card, StatusBadge } from "@/components/shared";
import VehicleForm from "@/components/VehicleForm";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Edit, Plus, Trash2, Download, Link2, Wrench, ClipboardList, FileText } from "lucide-react";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useShopSettings();
  const [editVehicle, setEditVehicle] = useState(false);
  const [parts, setParts] = useState([]);
  const [savingParts, setSavingParts] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const { data, loading, reload } = useAsync(() =>
    Promise.all([
      api.entities.Vehicle.get(id),
      api.entities.InventoryItem.list(),
      api.entities.WorkOrder.filter({ vehicle_id: id }),
      api.entities.Invoice.filter({ vehicle_id: id }),
    ])
  , [id]);

  useEffect(() => {
    if (data) setParts(data[0].common_parts || []);
  }, [data]);

  if (loading) return <Loader />;
  if (!data) return <EmptyState title="Vehicle not found" />;
  const [vehicle, items, workOrders, invoices] = data;

  const itemMap = Object.fromEntries(items.map((i) => [i.id, i]));

  const history = [
    ...workOrders.map((w) => ({ date: w.date, type: "Work Order", summary: (w.subjects || []).map((s) => s.description).join("; ") || w.general_notes || "—", amount: null, link: `/work-orders/${w.id}/view`, status: w.status })),
    ...invoices.map((i) => ({ date: i.date, type: "Invoice", summary: i.invoice_number || "Invoice", amount: i.total, link: `/invoices/${i.id}/view`, status: i.status })),
  ].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const updatePart = (idx, key, val) => setParts((p) => p.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));
  const addPart = () => setParts((p) => [...p, { name: "", value: "", inventory_item_id: "" }]);
  const removePart = (idx) => setParts((p) => p.filter((_, i) => i !== idx));

  const saveParts = async () => {
    setSavingParts(true);
    try {
      await api.entities.Vehicle.update(id, { common_parts: parts });
      reload();
    } finally {
      setSavingParts(false);
    }
  };

  const exportHistory = () => {
    generateVehicleHistoryPDF(vehicle, null, history.map((h) => ({ date: h.date, type: h.type, summary: h.summary, amount: h.amount })), settings);
  };

  const doDelete = async () => {
    await api.entities.Vehicle.delete(id);
    navigate(`/clients/${vehicle.client_id}`);
  };

  return (
    <div>
      <PageHeader
        title={`${vehicle.year ? vehicle.year + " " : ""}${vehicle.make} ${vehicle.model}`}
        subtitle={`${vehicle.vehicle_type} · ${vehicle.plate || "no plate"}`}
        back="/clients"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setEditVehicle(true)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm text-foreground hover:bg-white/5">
              <Edit className="h-4 w-4" /> Edit
            </button>
            <button onClick={() => (confirmDel ? doDelete() : setConfirmDel(true))} onBlur={() => setConfirmDel(false)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm ${confirmDel ? "bg-red-500 text-white" : "border border-white/10 text-red-300 hover:bg-red-500/10"}`}>
              <Trash2 className="h-4 w-4" /> {confirmDel ? "Confirm?" : "Delete"}
            </button>
          </div>
        }
      />

      <Card className="p-4 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Spec label="Type" value={vehicle.vehicle_type} />
          <Spec label="Plate" value={vehicle.plate} mono />
          <Spec label="Odometer" value={vehicle.odometer != null ? `${Number(vehicle.odometer).toLocaleString()} mi` : "—"} />
          <Spec label="Engine Hours" value={vehicle.engine_hours != null ? vehicle.engine_hours : "—"} />
          <Spec label="Unit #" value={vehicle.unit_number} />
          <Spec label="VIN" value={vehicle.vin} mono full />
        </div>
      </Card>

      {/* Common parts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">Common Parts</h2>
          <div className="flex gap-2">
            <button onClick={addPart} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"><Plus className="h-4 w-4" /> Add</button>
            <button onClick={saveParts} disabled={savingParts} className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">{savingParts ? "Saving…" : "Save"}</button>
          </div>
        </div>
        {parts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No common parts logged. Add oil type, filter part numbers, engine serial, etc.</p>
        ) : (
          <div className="space-y-2">
            {parts.map((p, idx) => {
              const linked = p.inventory_item_id ? itemMap[p.inventory_item_id] : null;
              return (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.4fr_auto] gap-2 items-end">
                  <div>
                    <span className="field-label">Part</span>
                    <input className="input-base" placeholder="e.g. Oil filter" value={p.name} onChange={(e) => updatePart(idx, "name", e.target.value)} />
                  </div>
                  <div>
                    <span className="field-label">Spec / Value</span>
                    <input className="input-base mono" placeholder="e.g. FRAM PH3614" value={p.value} onChange={(e) => updatePart(idx, "value", e.target.value)} />
                  </div>
                  <div>
                    <span className="field-label">Link to Inventory</span>
                    <Select value={p.inventory_item_id || "none"} onValueChange={(v) => updatePart(idx, "inventory_item_id", v === "none" ? "" : v)}>
                      <SelectTrigger className="input-base h-[42px]"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {items.map((it) => <SelectItem key={it.id} value={it.id}>{it.name} ({it.stock} in stock)</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    {linked && (
                      <span className={`mono text-[11px] px-2 py-1 rounded ${Number(linked.stock) <= 0 ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                        {linked.stock} in stock
                      </span>
                    )}
                    <button onClick={() => removePart(idx)} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide">Service History</h2>
        <button onClick={exportHistory} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>
      {history.length === 0 ? (
        <EmptyState icon={Wrench} title="No history yet" hint="Work orders and invoices will appear here." />
      ) : (
        <div className="space-y-2">
          {history.map((h, i) => (
            <Link key={i} to={h.link}>
              <Card className="p-3 flex items-center justify-between hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`grid h-9 w-9 place-items-center rounded-md ${h.type === "Invoice" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                    {h.type === "Invoice" ? <FileText className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{h.summary}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(h.date)} · {h.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {h.amount != null && <span className="font-semibold text-foreground">{money(h.amount)}</span>}
                  <StatusBadge status={h.status} kind={h.type === "Invoice" ? "inv" : "wo"} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <VehicleForm open={editVehicle} onOpenChange={setEditVehicle} onSaved={reload} vehicle={vehicle} />
    </div>
  );
}

function Spec({ label, value, mono, full }) {
  return (
    <div className={full ? "col-span-2 sm:col-span-4" : ""}>
      <p className="field-label">{label}</p>
      <p className={`text-foreground truncate ${mono ? "mono" : ""}`}>{value || "—"}</p>
    </div>
  );
}
