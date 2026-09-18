import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/api/client";
import { Field } from "@/components/shared";
import ClientPicker from "@/components/ClientPicker";
import { showError, showSuccess } from "@/lib/errorToast";

const TYPES = ["Truck", "Car", "SUV", "Van", "Motorcycle", "Other"];

// clientId: pass this when the vehicle's owner is already known (e.g. from
// ClientDetail's "Add Vehicle") — no client picker is shown. Omit it (and
// pass clients/onClientCreated instead) to let the user pick or quick-add
// the client right here, e.g. from the standalone Vehicles list page.
export default function VehicleForm({ open, onOpenChange, onSaved, vehicle, clientId, clients, onClientCreated }) {
  const [form, setForm] = useState({ vehicle_type: "Truck", vin: "", vin_last8: "", year: "", make: "", model: "", unit_number: "", plate: "", odometer: "", engine_hours: "" });
  const [saving, setSaving] = useState(false);
  const [pickedClientId, setPickedClientId] = useState("");

  useEffect(() => {
    if (open) {
      setForm(vehicle ? { ...vehicle, odometer: vehicle.odometer ?? "", engine_hours: vehicle.engine_hours ?? "", year: vehicle.year ?? "" } : { vehicle_type: "Truck", vin: "", vin_last8: "", year: "", make: "", model: "", unit_number: "", plate: "", odometer: "", engine_hours: "" });
      setPickedClientId(vehicle?.client_id || "");
    }
  }, [open, vehicle]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    // See ClientForm.jsx's submit — Radix Dialog portals the DOM but React
    // still bubbles the submit through the component tree to an outer form.
    e.stopPropagation();
    setSaving(true);
    try {
      const payload = {
        ...form,
        client_id: clientId || pickedClientId,
        year: form.year ? Number(form.year) : null,
        odometer: form.odometer !== "" ? Number(form.odometer) : null,
        engine_hours: form.engine_hours !== "" ? Number(form.engine_hours) : null,
        vin_last8: form.vin ? form.vin.slice(-8) : form.vin_last8,
      };
      const saved = vehicle?.id ? await api.entities.Vehicle.update(vehicle.id, payload) : await api.entities.Vehicle.create(payload);
      onSaved?.(saved);
      onOpenChange(false);
      showSuccess(vehicle?.id ? "Vehicle updated" : "Vehicle added");
    } catch (err) {
      showError(err, "Could not save this vehicle.");
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
          {!clientId && (
            <div className="col-span-2">
              <Field label="Client *">
                <ClientPicker
                  clients={clients || []}
                  value={pickedClientId}
                  onSelect={(c) => setPickedClientId(c.id)}
                  onClientCreated={onClientCreated}
                />
              </Field>
            </div>
          )}
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
            <Button type="submit" disabled={saving || (!clientId && !pickedClientId)}>{saving ? "Saving…" : "Save Vehicle"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
