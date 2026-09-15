import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAsync } from "@/lib/useAsync";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { money, todayISO } from "@/lib/format";
import { PageHeader, Loader, Field, Card } from "@/components/shared";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";

export default function InvoiceForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const woId = params.get("wo");
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { settings } = useShopSettings();

  const { data, loading } = useAsync(() =>
    Promise.all([
      base44.entities.Client.list(),
      base44.entities.Vehicle.list(),
      base44.entities.InventoryItem.list(),
      isEdit ? base44.entities.Invoice.get(id) : Promise.resolve(null),
      woId ? base44.entities.WorkOrder.get(woId) : Promise.resolve(null),
    ])
  , [id, woId]);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const [clients, vehicles, items, inv, wo] = data;
    if (inv) {
      setForm(inv);
    } else {
      const baseForm = {
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        date: todayISO(),
        client_id: "",
        vehicle_id: "",
        work_order_id: "",
        lines: [{ description: "", quantity: 1, unit_price: 0 }],
        status: "pending",
      };
      if (wo) {
        baseForm.client_id = wo.client_id;
        baseForm.vehicle_id = wo.vehicle_id;
        baseForm.work_order_id = wo.id;
        const lines = [];
        (wo.subjects || []).forEach((s) => {
          if (s.description) lines.push({ description: s.description, quantity: 1, unit_price: 0 });
          (s.parts_used || []).forEach((p) => {
            const match = items.find((it) => (it.part_number && it.part_number === p.part_number) || (it.name && it.name === p.name));
            lines.push({ description: p.name || p.part_number || "Part", quantity: Number(p.quantity) || 1, unit_price: match ? Number(match.cost) || 0 : 0 });
          });
        });
        baseForm.lines = lines.length ? lines : [{ description: "", quantity: 1, unit_price: 0 }];
      }
      setForm(baseForm);
    }
  }, [data]);

  if (loading || !form) return <Loader />;
  const [clients, vehicles] = data;
  const clientVehicles = vehicles.filter((v) => v.client_id === form.client_id);
  const taxRate = Number(settings?.tax_rate || 0);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setLine = (idx, key, val) => setForm((f) => ({ ...f, lines: f.lines.map((l, i) => (i === idx ? { ...l, [key]: val } : l)) }));
  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, { description: "", quantity: 1, unit_price: 0 }] }));
  const removeLine = (idx) => setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  const computed = form.lines.map((l) => ({ ...l, total: (Number(l.quantity) || 0) * (Number(l.unit_price) || 0) }));
  const subtotal = computed.reduce((s, l) => s + l.total, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        lines: computed,
        subtotal,
        tax,
        total,
      };
      let saved;
      if (isEdit) saved = await base44.entities.Invoice.update(id, payload);
      else saved = await base44.entities.Invoice.create(payload);
      // If created from a work order, mark it invoiced
      if (!isEdit && saved.work_order_id) {
        try { await base44.entities.WorkOrder.update(saved.work_order_id, { status: "Invoiced" }); } catch (e) {}
      }
      navigate(`/invoices/${saved.id}/view`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Invoice" : "New Invoice"} back={isEdit ? `/invoices/${id}/view` : "/invoices"} />
      <form onSubmit={submit} className="space-y-5">
        <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Invoice #"><input className="input-base mono" value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} /></Field>
          <Field label="Date"><input className="input-base" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
          <Field label="Client *">
            <Select required value={form.client_id} onValueChange={(v) => { set("client_id", v); set("vehicle_id", ""); }}>
              <SelectTrigger className="input-base h-[42px]"><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Vehicle *">
            <Select required value={form.vehicle_id} onValueChange={(v) => set("vehicle_id", v)} disabled={!form.client_id}>
              <SelectTrigger className="input-base h-[42px]"><SelectValue placeholder={form.client_id ? "Select vehicle" : "Pick client first"} /></SelectTrigger>
              <SelectContent>{clientVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.year ? v.year + " " : ""}{v.make} {v.model} {v.plate ? `· ${v.plate}` : ""}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="input-base h-[42px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
            </Select>
          </Field>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">Line Items</h2>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"><Plus className="h-4 w-4" /> Add Line</button>
          </div>
          <div className="space-y-2">
            {form.lines.map((l, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_64px_90px_90px_auto] gap-2 items-center">
                <input className="input-base" placeholder="Description (product or service)" value={l.description} onChange={(e) => setLine(idx, "description", e.target.value)} />
                <input className="input-base text-center" type="number" min="1" placeholder="Qty" value={l.quantity} onChange={(e) => setLine(idx, "quantity", Number(e.target.value))} />
                <input className="input-base mono" type="number" step="0.01" placeholder="Price" value={l.unit_price} onChange={(e) => setLine(idx, "unit_price", Number(e.target.value))} />
                <span className="mono text-sm text-foreground text-right">{money((Number(l.quantity) || 0) * (Number(l.unit_price) || 0))}</span>
                <button type="button" onClick={() => removeLine(idx)} className="grid h-[42px] w-10 place-items-center rounded-md border border-white/10 text-red-300 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        <Card className="p-4 ml-auto max-w-xs w-full">
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label={`Tax (${taxRate}%)`} value={money(tax)} />
          <div className="mt-2 border-t border-white/10 pt-2 flex items-center justify-between">
            <span className="font-display text-lg font-bold uppercase">Total</span>
            <span className="font-display text-2xl font-bold text-primary">{money(total)}</span>
          </div>
        </Card>

        <div className="flex justify-end gap-2 pb-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Invoice"}</Button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
