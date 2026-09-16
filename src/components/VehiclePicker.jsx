import React, { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import VehicleForm from "@/components/VehicleForm";
import { vehicleIdValue } from "@/lib/format";
import { CarFront } from "lucide-react";

// Same pattern as ClientPicker, scoped to the vehicles belonging to the
// currently selected client — reuses the real VehicleForm dialog for the
// quick-create so every field is available.
export default function VehiclePicker({ vehicles, clientId, value, onSelect, onVehicleCreated, className = "input-base h-[42px]" }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const selected = value ? vehicles.find((v) => v.id === value) : null;
  const label = (v) => {
    const id = vehicleIdValue(v);
    return `${v.year ? v.year + " " : ""}${v.make} ${v.model}${id ? ` · ${id}` : ""}`;
  };

  const handleValueChange = (v) => {
    if (!v) return;
    if (v === "__add_new__") setQuickAddOpen(true);
    else onSelect(vehicles.find((x) => x.id === v));
  };

  const handleSaved = (newVehicle) => {
    onVehicleCreated(newVehicle);
    onSelect(newVehicle);
    setQuickAddOpen(false);
  };

  if (!clientId) {
    return (
      <Select disabled>
        <SelectTrigger className={className}><SelectValue placeholder="Pick client first" /></SelectTrigger>
        <SelectContent />
      </Select>
    );
  }

  return (
    <div>
      {vehicles.length === 0 ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200">
          <span>Este cliente no tiene vehículos — agrega uno primero</span>
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 font-semibold text-amber-100 hover:bg-amber-500/30"
          >
            <CarFront className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
      ) : (
        <Select value={value || undefined} onValueChange={handleValueChange}>
          <SelectTrigger className={className}>
            <SelectValue placeholder="Select vehicle">{selected ? label(selected) : null}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__add_new__" className="text-primary font-semibold">
              + Add new vehicle
            </SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>{label(v)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <VehicleForm open={quickAddOpen} onOpenChange={setQuickAddOpen} onSaved={handleSaved} clientId={clientId} />
    </div>
  );
}
