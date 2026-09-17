import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { PageHeader, EmptyState, Loader, Card } from "@/components/shared";
import VehicleForm from "@/components/VehicleForm";
import { exportToCSV } from "@/lib/csv";
import { Plus, Search, Car, Download } from "lucide-react";

const VEHICLE_COLUMNS = [
  { key: "client_name", label: "Client" },
  { key: "vehicle_type", label: "Type" },
  { key: "year", label: "Year" },
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "unit_number", label: "Unit #" },
  { key: "plate", label: "Plate" },
  { key: "vin", label: "VIN" },
  { key: "odometer", label: "Odometer" },
  { key: "engine_hours", label: "Engine Hours" },
];

export default function Vehicles() {
  const [q, setQ] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const { data, loading, reload } = useAsync(() =>
    Promise.all([api.entities.Vehicle.list(), api.entities.Client.list()])
  );

  const [clients, setClients] = useState([]);
  useEffect(() => {
    if (data) setClients(data[1]);
  }, [data]);

  if (loading) return <Loader />;
  const [vehicles] = data;
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  const ql = q.toLowerCase();
  const filtered = vehicles.filter((v) => {
    if (clientFilter !== "all" && v.client_id !== clientFilter) return false;
    if (!q) return true;
    const client = clientMap[v.client_id];
    return (
      v.make?.toLowerCase().includes(ql) ||
      v.model?.toLowerCase().includes(ql) ||
      v.plate?.toLowerCase().includes(ql) ||
      v.vin?.toLowerCase().includes(ql) ||
      v.unit_number?.toLowerCase().includes(ql) ||
      client?.name?.toLowerCase().includes(ql)
    );
  });

  const exportVehicles = () => {
    const rows = filtered.map((v) => ({ ...v, client_name: clientMap[v.client_id]?.name || "" }));
    const suffix = clientFilter === "all" ? "all-clients" : (clientMap[clientFilter]?.name || "client").toLowerCase().replace(/\s+/g, "-");
    exportToCSV(`vehicles-${suffix}.csv`, VEHICLE_COLUMNS, rows);
  };

  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle={`${vehicles.length} total`}
        actions={
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> New
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Search make, model, plate, VIN, client…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input-base sm:w-56" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
          <option value="all">All clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button
          type="button"
          onClick={exportVehicles}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title={vehicles.length === 0 ? "No vehicles yet" : "No matches"}
          hint={vehicles.length === 0 ? "Add your first vehicle with the + New button." : "Try a different search."}
          action={vehicles.length === 0 ? (
            <button onClick={() => setOpen(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">+ New Vehicle</button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((v) => {
            const client = clientMap[v.client_id];
            return (
              <Link key={v.id} to={`/vehicles/${v.id}`}>
                <Card className="p-4 h-full hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{v.vehicle_type}</span>
                    {v.plate && <span className="mono text-xs bg-white/5 rounded px-1.5 py-0.5">{v.plate}</span>}
                  </div>
                  <p className="font-semibold text-foreground truncate">{v.year ? v.year + " " : ""}{v.make} {v.model}</p>
                  {v.vin && <p className="mono text-[11px] text-muted-foreground truncate mt-1">VIN {v.vin}</p>}
                  <p className="text-xs text-primary truncate mt-2">{client?.name || "Unknown client"}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <VehicleForm
        open={open}
        onOpenChange={setOpen}
        onSaved={reload}
        clients={clients}
        onClientCreated={(c) => setClients((prev) => [c, ...prev])}
      />
    </div>
  );
}
