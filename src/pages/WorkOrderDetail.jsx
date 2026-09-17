import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { fmtDate, vehicleIdLabel } from "@/lib/format";
import { generateWorkOrderPDF } from "@/lib/pdf";
import { PageHeader, Loader, EmptyState, Card, StatusBadge } from "@/components/shared";
import { Edit, Download, FileText, Trash2, Share2 } from "lucide-react";

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useShopSettings();
  const [confirmDel, setConfirmDel] = useState(false);

  const { data, loading } = useAsync(() =>
    Promise.all([
      api.entities.WorkOrder.get(id),
      api.entities.Client.list(),
      api.entities.Vehicle.list(),
    ])
  , [id]);

  if (loading) return <Loader />;
  if (!data?.[0]) return <EmptyState title="Work order not found" />;
  const [wo, clients, vehicles] = data;
  const client = clients.find((c) => c.id === wo.client_id);
  const vehicle = vehicles.find((v) => v.id === wo.vehicle_id);

  const doDelete = async () => {
    await api.entities.WorkOrder.delete(id);
    navigate("/work-orders");
  };

  const sharePdf = async () => {
    generateWorkOrderPDF(wo, client, vehicle, settings);
  };

  return (
    <div>
      <PageHeader
        title={`Work Order`}
        subtitle={fmtDate(wo.date)}
        back="/work-orders"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={sharePdf} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><Share2 className="h-4 w-4" /> PDF</button>
            <Link to={`/work-orders/${id}`} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><Edit className="h-4 w-4" /> Edit</Link>
            <button onClick={() => (confirmDel ? doDelete() : setConfirmDel(true))} onBlur={() => setConfirmDel(false)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm ${confirmDel ? "bg-red-500 text-white" : "border border-white/10 text-red-300 hover:bg-red-500/10"}`}><Trash2 className="h-4 w-4" /> {confirmDel ? "Confirm?" : "Delete"}</button>
          </div>
        }
      />

      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={wo.status} />
          <span className="text-sm text-muted-foreground">Tech: {wo.technician_name || "—"}</span>
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
            <p className="text-sm text-muted-foreground mono">{vehicleIdLabel(vehicle)} {vehicle?.vin ? `· VIN ${vehicle.vin}` : ""}</p>
            <p className="text-xs text-muted-foreground">{vehicle?.odometer != null ? `${Number(vehicle.odometer).toLocaleString()} mi` : ""}</p>
          </div>
        </div>
      </Card>

      <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-3">Labor</h2>
      <div className="space-y-3 mb-5">
        {(wo.subjects || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No labor logged.</p>
        ) : (
          wo.subjects.map((s, i) => (
            <Card key={i} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Labor {i + 1}</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{s.description || "—"}</p>
              {s.note && <p className="text-sm text-muted-foreground mt-2"><span className="field-label">Note: </span>{s.note}</p>}
              {s.parts_used?.length > 0 && (
                <div className="mt-3">
                  <p className="field-label mb-1">Parts Used</p>
                  <div className="rounded-md border border-white/10 overflow-hidden">
                    {s.parts_used.map((p, j) => (
                      <div key={j} className="flex items-center justify-between px-3 py-2 border-b border-white/5 last:border-0 text-sm">
                        <span className="text-foreground">{p.name || p.part_number || "—"}</span>
                        <span className="mono text-xs text-muted-foreground">{p.part_number} · qty {p.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {wo.general_notes && (
        <Card className="p-4 mb-5">
          <p className="field-label mb-1">General Notes</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{wo.general_notes}</p>
        </Card>
      )}

      <Link to={`/invoices/new?wo=${id}`} className="inline-flex items-center gap-2 rounded-md bg-emerald-500/15 border border-emerald-500/40 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25">
        <FileText className="h-4 w-4" /> Create Invoice from this Work Order
      </Link>
    </div>
  );
}
