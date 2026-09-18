import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";
import { Field } from "@/components/shared";
import { showError, showSuccess } from "@/lib/errorToast";

export default function ClientForm({ open, onOpenChange, onSaved, client }) {
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(client ? { ...client } : { name: "", address: "", city: "", state: "", zip: "", phone: "", email: "" });
  }, [open, client]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    // Radix Dialog portals this form's DOM outside the page's own <form>,
    // but React still bubbles the submit through the *component* tree — so
    // without this, saving a client quick-added from inside another form
    // (WorkOrderForm, InvoiceForm) also fires that outer form's onSubmit.
    e.stopPropagation();
    setSaving(true);
    try {
      const saved = client?.id ? await api.entities.Client.update(client.id, form) : await api.entities.Client.create(form);
      onSaved?.(saved);
      onOpenChange(false);
      showSuccess(client?.id ? "Client updated" : "Client created");
    } catch (err) {
      showError(err, "Could not save this client.");
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
