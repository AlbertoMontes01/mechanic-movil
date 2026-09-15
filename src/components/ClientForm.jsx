import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Field } from "@/components/shared";

export default function ClientForm({ open, onOpenChange, onSaved, client }) {
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(client ? { ...client } : { name: "", address: "", city: "", state: "", zip: "", phone: "", email: "" });
  }, [open, client]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (client?.id) await base44.entities.Client.update(client.id, form);
      else await base44.entities.Client.create(form);
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
          <DialogTitle className="font-display uppercase tracking-wide">{client ? "Edit Client" : "New Client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Full Name *"><input className="input-base" required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field></div>
          <div className="col-span-2"><Field label="Address"><input className="input-base" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field></div>
          <Field label="City"><input className="input-base" value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><input className="input-base" value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
          <Field label="ZIP"><input className="input-base" value={form.zip} onChange={(e) => set("zip", e.target.value)} /></Field>
          <Field label="Phone *"><input className="input-base" required value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <div className="col-span-2"><Field label="Email"><input className="input-base" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field></div>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Client"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
