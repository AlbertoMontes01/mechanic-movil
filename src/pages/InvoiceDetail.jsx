import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { money, fmtDate } from "@/lib/format";
import { generateInvoicePDF } from "@/lib/pdf";
import { PageHeader, Loader, EmptyState, Card, StatusBadge } from "@/components/shared";
import { Edit, Download, Trash2, Share2, CheckCircle2, RotateCcw } from "lucide-react";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useShopSettings();
  const [confirmDel, setConfirmDel] = useState(false);

  const { data, loading, reload } = useAsync(() =>
    Promise.all([
      api.entities.Invoice.get(id),
      api.entities.Client.list(),
      api.entities.Vehicle.list(),
    ])
  , [id]);

  if (loading) return <Loader />;
  if (!data?.[0]) return <EmptyState title="Invoice not found" />;
  const [inv, clients, vehicles] = data;
  const client = clients.find((c) => c.id === inv.client_id);
  const vehicle = vehicles.find((v) => v.id === inv.vehicle_id);

  const togglePaid = async () => {
    await api.entities.Invoice.update(id, { status: inv.status === "paid" ? "pending" : "paid" });
    reload();
  };

  const doDelete = async () => {
    await api.entities.Invoice.delete(id);
    navigate("/invoices");
  };

  return (
    <div>
      <PageHeader
        title={inv.invoice_number || "Invoice"}
        subtitle={fmtDate(inv.date)}
        back="/invoices"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => generateInvoicePDF(inv, client, vehicle, settings)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><Share2 className="h-4 w-4" /> PDF</button>
            <button onClick={togglePaid} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm ${inv.status === "paid" ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300" : "bg-primary text-primary-foreground"}`}>
              {inv.status === "paid" ? <><RotateCcw className="h-4 w-4" /> Mark Pending</> : <><CheckCircle2 className="h-4 w-4" /> Mark Paid</>}
            </button>
            <Link to={`/invoices/${id}`} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><Edit className="h-4 w-4" /> Edit</Link>
            <button onClick={() => (confirmDel ? doDelete() : setConfirmDel(true))} onBlur={() => setConfirmDel(false)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm ${confirmDel ? "bg-red-500 text-white" : "border border-white/10 text-red-300 hover:bg-red-500/10"}`}><Trash2 className="h-4 w-4" /> {confirmDel ? "Confirm?" : "Delete"}</button>
          </div>
        }
      />

      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={inv.status} kind="inv" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="field-label">Client</p>
            <p className="font-semibold text-foreground">{client?.name || "—"}</p>
            <p className="text-sm text-muted-foreground">{client?.phone}</p>
            <p className="text-xs text-muted-foreground">{[client?.address, client?.city, client?.state, client?.zip].filter(Boolean).join(", ")}</p>
          </div>
          <div>
            <p className="field-label">Vehicle</p>
            <p className="font-semibold text-foreground">{vehicle ? `${vehicle.year ? vehicle.year + " " : ""}${vehicle.make} ${vehicle.model}` : "—"}</p>
            <p className="text-sm text-muted-foreground mono">{vehicle?.plate ? `Plate ${vehicle.plate}` : ""} {vehicle?.vin ? `· VIN ${vehicle.vin}` : ""}</p>
          </div>
        </div>
      </Card>

      <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-3">Line Items</h2>
      <Card className="overflow-hidden mb-5">
        <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-4 py-2 bg-white/5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Description</span><span className="text-center">Qty</span><span className="text-right">Price</span><span className="text-right">Total</span>
        </div>
        {(inv.lines || []).length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No line items.</p>
        ) : (
          inv.lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-4 py-3 border-t border-white/5 text-sm">
              <span className="text-foreground">{l.description || "—"}</span>
              <span className="text-center text-muted-foreground">{l.quantity}</span>
              <span className="text-right mono text-muted-foreground">{money(l.unit_price)}</span>
              <span className="text-right mono text-foreground">{money(l.total)}</span>
            </div>
          ))
        )}
      </Card>

      <Card className="p-4 ml-auto max-w-xs w-full">
        <div className="flex justify-between py-1 text-sm"><span className="text-muted-foreground">Subtotal</span><span>{money(inv.subtotal)}</span></div>
        <div className="flex justify-between py-1 text-sm"><span className="text-muted-foreground">Tax</span><span>{money(inv.tax)}</span></div>
        <div className="mt-2 border-t border-white/10 pt-2 flex justify-between items-center">
          <span className="font-display text-lg font-bold uppercase">Total</span>
          <span className="font-display text-2xl font-bold text-primary">{money(inv.total)}</span>
        </div>
      </Card>
    </div>
  );
}
