import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { PageHeader, Loader, EmptyState, Card } from "@/components/shared";
import ClientForm from "@/components/ClientForm";
import VehicleForm from "@/components/VehicleForm";
import { showError, showSuccess } from "@/lib/errorToast";
import { Edit, Plus, Trash2, Car, Phone, Mail, MapPin } from "lucide-react";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editClient, setEditClient] = useState(false);
  const [addVehicle, setAddVehicle] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const { data, loading, reload } = useAsync(() =>
    Promise.all([
      api.entities.Client.get(id),
      api.entities.Vehicle.filter({ client_id: id }),
    ])
  , [id]);

  if (loading) return <Loader />;
  if (!data) return <EmptyState title="Client not found" />;
  const [client, vehicles] = data;

  const doDelete = async () => {
    try {
      await api.entities.Client.delete(id);
      showSuccess("Client deleted");
      navigate("/clients");
    } catch (err) {
      showError(err, "Could not delete this client.");
    }
  };

  return (
    <div>
      <PageHeader
        title={client.name}
        subtitle={`${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"}`}
        back="/clients"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setEditClient(true)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm text-foreground hover:bg-white/5">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <Info icon={Phone} label="Phone" value={client.phone} />
          <Info icon={Mail} label="Email" value={client.email} />
          <Info icon={MapPin} label="Address" value={[client.address, client.city, client.state, client.zip].filter(Boolean).join(", ")} />
        </div>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide">Vehicles</h2>
        <button onClick={() => setAddVehicle(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles for this client" hint="Add a vehicle to start tracking work." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vehicles.map((v) => (
            <Link key={v.id} to={`/vehicles/${v.id}`}>
              <Card className="p-4 h-full hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{v.vehicle_type}</span>
                  {v.plate && <span className="mono text-xs bg-white/5 rounded px-1.5 py-0.5">{v.plate}</span>}
                </div>
                <p className="font-semibold text-foreground">{v.year ? v.year + " " : ""}{v.make} {v.model}</p>
                {v.vin && <p className="mono text-[11px] text-muted-foreground truncate mt-1">VIN {v.vin}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ClientForm open={editClient} onOpenChange={setEditClient} onSaved={reload} client={client} />
      <VehicleForm open={addVehicle} onOpenChange={setAddVehicle} onSaved={reload} clientId={id} />
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="field-label">{label}</p>
        <p className="text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}
