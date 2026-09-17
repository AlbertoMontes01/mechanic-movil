import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { PageHeader, EmptyState, Loader, Card } from "@/components/shared";
import VehicleForm from "@/components/VehicleForm";
import ImportCSVDialog from "@/components/ImportCSVDialog";
import { exportToCSV } from "@/lib/csv";
import { Plus, Search, Car, Download, Upload } from "lucide-react";

const VEHICLE_TYPES = ["Truck", "Car", "SUV", "Van", "Motorcycle", "Other"];

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

const VEHICLE_TEMPLATE_ROWS = [
  { client_name: "Jane's Auto Shop", vehicle_type: "Truck", year: 2019, make: "Ford", model: "F-150", unit_number: "12", plate: "ABC-1234", vin: "", odometer: 54000, engine_hours: "" },
];

export default function Vehicles() {
  const [q, setQ] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { data, loading, reload } = useAsync(() =>
    Promise.all([api.entities.Vehicle.list(), api.entities.Client.list()])
  );

  const [clients, setClients] = useState([]);
  useEffect(() => {
    if (data) setClients(data[1]);
  }, [data]);

  // Not an early `if (loading) return <Loader />` -- that would unmount the
  // whole page (including any open dialog) every time reload() runs after
  // an import, wiping out the import summary the user just got. Only the
  // list section below shows a loader; dialogs stay mounted throughout.
  const vehicles = data?.[0] || [];
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

  // "Client" in the file must match an existing client's name exactly
  // (case-insensitively) -- vehicles always belong to a client, and
  // guessing/creating one from a typo'd name would be worse than just
  // rejecting the row and saying so.
  const importVehicles = async (rows) => {
    const nameToId = {};
    for (const c of clients) {
      const key = c.name.trim().toLowerCase();
      nameToId[key] = key in nameToId ? null : c.id; // null marks an ambiguous duplicate name
    }

    let created = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNum = i + 2;
      if (!r.client_name) { errors.push({ row: rowNum, message: "Missing required ‘Client’ -- row skipped." }); continue; }
      const clientId = nameToId[r.client_name.trim().toLowerCase()];
      if (clientId === undefined) { errors.push({ row: rowNum, message: `No client named "${r.client_name}" -- add that client first, or fix the spelling.` }); continue; }
      if (clientId === null) { errors.push({ row: rowNum, message: `Multiple clients are named "${r.client_name}" -- rename one so it's unambiguous, then re-import this row.` }); continue; }
      if (!r.make) { errors.push({ row: rowNum, message: "Missing required ‘Make’ -- row skipped." }); continue; }
      if (!r.model) { errors.push({ row: rowNum, message: "Missing required ‘Model’ -- row skipped." }); continue; }
      try {
        await api.entities.Vehicle.create({
          client_id: clientId,
          vehicle_type: VEHICLE_TYPES.includes(r.vehicle_type) ? r.vehicle_type : undefined,
          year: r.year ? Number(r.year) : undefined,
          make: r.make,
          model: r.model,
          unit_number: r.unit_number || undefined,
          plate: r.plate || undefined,
          vin: r.vin || undefined,
          odometer: r.odometer ? Number(r.odometer) : undefined,
          engine_hours: r.engine_hours ? Number(r.engine_hours) : undefined,
        });
        created++;
      } catch (err) {
        errors.push({ row: rowNum, message: err.message || "Could not create this vehicle." });
      }
    }
    reload();
    return { created, errors };
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
        <button type="button" onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
          <Upload className="h-4 w-4" /> Import CSV
        </button>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
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
      <ImportCSVDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Vehicles"
        templateFilename="vehicles-template.csv"
        columns={VEHICLE_COLUMNS}
        exampleRows={VEHICLE_TEMPLATE_ROWS}
        onImportRows={importVehicles}
      />
    </div>
  );
}
