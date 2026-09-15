import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Field } from "@/components/shared";

const TYPES = ["Truck", "Car", "SUV", "Van", "Motorcycle", "Other"];

export default function VehicleForm({ open, onOpenChange, onSaved, vehicle, clientId }) {
  const [form, setForm] = useState({ vehicle_type: "Truck", vin: "", vin_last8: "", year: "", make: "", model: "", unit_number: "", plate: "", odometer: "", engine_hours: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(vehicle ? { ...vehicle, odometer: vehicle.odometer ?? "", engine_hours: vehicle.engine_hours ?? "", year: vehicle.year ?? "" } : { vehicle_type: "Truck", vin: "", vin_last8: "", year: "", make: "", model: "", unit_number: "", plate: "", odometer: "", engine_hours: "" });
    }
  }, [open, vehicle]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        client_id: clientId || form.client_id,
        year: form.year ? Number(form.year) : null,
        odometer: form.odometer !== "" ? Number(form.odometer) : null,
        engine_hours: form.engine_hours !== "" ? Number(form.engine_hours) : null,
        vin_last8: form.vin ? form.vin.slice(-8) : form.vin_last8,
      };
      if (vehicle?.id) await base44.entities.Vehicle.update(vehicle.id, payload);
      else await base44.entities.Vehicle.create(payload);
      onSaved?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wide">{vehicle ? "Edit Vehicle" : "New Vehicle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={form.vehicle_type} onValueChange={(v) => set("vehicle_type", v)}>
              <SelectTrigger className="input-base h-[42px]"><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Year"><input className="input-base" type="number" value={form.year} onChange={(e) => set("year", e.target.value)} /></Field>
          <Field label="Make *"><input className="input-base" required value={form.make} onChange={(e) => set("make", e.target.value)} /></Field>
          <Field label="Model *"><input className="input-base" required value={form.model} onChange={(e) => set("model", e.target.value)} /></Field>
          <div className="col-span-2"><Field label="VIN (full)" hint="Last 8 auto-filled"><input className="input-base mono" value={form.vin} onChange={(e) => set("vin", e.target.value.toUpperCase())} /></Field></div>
          <Field label="Unit #"><input className="input-base" value={form.unit_number} onChange={(e) => set("unit_number", e.target.value)} /></Field>
          <Field label="Plate"><input className="input-base mono" value={form.plate} onChange={(e) => set("plate", e.target.value.toUpperCase())} /></Field>
          <Field label="Odometer (mi)"><input className="input-base" type="number" value={form.odometer} onChange={(e) => set("odometer", e.target.value)} /></Field>
          <Field label="Engine Hours"><input className="input-base" type="number" value={form.engine_hours} onChange={(e) => set("engine_hours", e.target.value)} /></Field>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Vehicle"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
