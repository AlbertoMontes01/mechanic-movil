import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { PageHeader, EmptyState, Loader, Card } from "@/components/shared";
import { Search, Car } from "lucide-react";

export default function Vehicles() {
  const [q, setQ] = useState("");
  const { data, loading } = useAsync(() =>
    Promise.all([api.entities.Vehicle.list(), api.entities.Client.list()])
  );

  if (loading) return <Loader />;
  const [vehicles, clients] = data;
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  const ql = q.toLowerCase();
  const filtered = vehicles.filter((v) => {
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

  return (
    <div>
      <PageHeader title="Vehicles" subtitle={`${vehicles.length} total`} />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input className="input-base pl-9" placeholder="Search make, model, plate, VIN, client…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title={vehicles.length === 0 ? "No vehicles yet" : "No matches"}
          hint={vehicles.length === 0 ? "Add a vehicle from a client's page to start tracking work." : "Try a different search."}
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
    </div>
  );
}
