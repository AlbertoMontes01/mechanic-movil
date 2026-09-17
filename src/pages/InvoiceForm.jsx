import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { money, todayISO } from "@/lib/format";
import { PageHeader, Loader, Field, Card } from "@/components/shared";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ClientPicker from "@/components/ClientPicker";
import VehiclePicker from "@/components/VehiclePicker";
import InventoryItemPicker from "@/components/InventoryItemPicker";
import { Plus, Trash2, Save } from "lucide-react";

const emptyServiceLine = () => ({ item_type: "service", pricing_mode: "flat", inventory_item_id: "", description: "", quantity: 1, unit_price: 0 });

export default function InvoiceForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const woId = params.get("wo");
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { settings } = useShopSettings();

  const { data, loading } = useAsync(() =>
    Promise.all([
      api.entities.Client.list(),
      api.entities.Vehicle.list(),
      api.entities.InventoryItem.list(),
      api.entities.InventoryCategory.list(),
      isEdit ? api.entities.Invoice.get(id) : Promise.resolve(null),
      woId ? api.entities.WorkOrder.get(woId) : Promise.resolve(null),
    ])
  , [id, woId]);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!data) return;
    const [fetchedClients, fetchedVehicles, fetchedItems, fetchedCategories, inv, wo] = data;
    setClients(fetchedClients);
    setVehicles(fetchedVehicles);
    setItems(fetchedItems);
    setCategories(fetchedCategories);

    if (inv) {
      // Existing lines came from the backend with no item_type/pricing_mode
      // (those are UI-only) — infer them so the editor renders sensibly.
      setForm({
        ...inv,
        customer_note: inv.customer_note || "",
        lines: (inv.lines || []).map((l) => ({
          ...emptyServiceLine(),
          ...l,
          item_type: l.inventory_item_id ? "product" : "service",
          pricing_mode: l.inventory_item_id ? "quantity" : (Number(l.quantity) === 1 ? "flat" : "hourly"),
        })),
      });
    } else {
      const baseForm = {
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        date: todayISO(),
        client_id: "",
        vehicle_id: "",
        work_order_id: "",
        lines: [emptyServiceLine()],
        status: "pending",
        customer_note: "",
      };
      if (wo) {
        baseForm.client_id = wo.client_id;
        baseForm.vehicle_id = wo.vehicle_id;
        baseForm.work_order_id = wo.id;
        // The work order's own notes are usually exactly what belongs in
        // "Note to Customer" (what was diagnosed/found/done) -- carry them
        // over as a starting point rather than making the mechanic retype
        // something they already wrote.
        baseForm.customer_note = wo.general_notes || "";
        const lines = [];
        (wo.subjects || []).forEach((s) => {
          if (s.description) lines.push({ ...emptyServiceLine(), description: s.description });
          (s.parts_used || []).forEach((p) => {
            const match = fetchedItems.find((it) => it.id === p.inventory_item_id);
            lines.push({
              item_type: "product",
              pricing_mode: "quantity",
              inventory_item_id: p.inventory_item_id || "",
              description: p.name || match?.name || p.part_number || "Part",
              quantity: Number(p.quantity) || 1,
              unit_price: match ? Number(match.price) || 0 : 0,
            });
          });
        });
        baseForm.lines = lines.length ? lines : [emptyServiceLine()];
      }
      setForm(baseForm);
    }
  }, [data]);

  if (loading || !form) return <Loader />;
  const clientVehicles = vehicles.filter((v) => v.client_id === form.client_id);
  const taxRate = Number(settings?.tax_rate || 0);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setLine = (idx, patch) => setForm((f) => ({ ...f, lines: f.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));
  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, emptyServiceLine()] }));
  const removeLine = (idx) => setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  const computed = form.lines.map((l) => {
    const quantity = Number(l.quantity) || 0;
    const unit_price = Number(l.unit_price) || 0;
    return { ...l, quantity, unit_price, total: quantity * unit_price };
  });
  const subtotal = computed.reduce((s, l) => s + l.total, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        work_order_id: form.work_order_id || null,
        lines: computed.map(({ description, quantity, unit_price, total, inventory_item_id }) => ({
          description,
          quantity,
          unit_price,
          total,
          inventory_item_id: inventory_item_id || null,
        })),
        subtotal,
        tax,
        total,
      };
      let saved;
      if (isEdit) saved = await api.entities.Invoice.update(id, payload);
      else saved = await api.entities.Invoice.create(payload);
      // If created from a work order, mark it invoiced
      if (!isEdit && saved.work_order_id) {
        try { await api.entities.WorkOrder.update(saved.work_order_id, { status: "Invoiced" }); } catch (e) {}
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
            <ClientPicker
              clients={clients}
              value={form.client_id}
              onSelect={(c) => { set("client_id", c.id); set("vehicle_id", ""); }}
              onClientCreated={(c) => setClients((prev) => [c, ...prev])}
            />
          </Field>
          <Field label="Vehicle *">
            <VehiclePicker
              vehicles={clientVehicles}
              clientId={form.client_id}
              value={form.vehicle_id}
              onSelect={(v) => set("vehicle_id", v.id)}
              onVehicleCreated={(v) => setVehicles((prev) => [v, ...prev])}
            />
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
          <div className="space-y-3">
            {form.lines.map((l, idx) => (
              <InvoiceLineEditor
                key={idx}
                line={l}
                items={items}
                categories={categories}
                onChange={(patch) => setLine(idx, patch)}
                onRemove={form.lines.length > 1 ? () => removeLine(idx) : null}
                onItemCreated={(newItem) => setItems((prev) => [newItem, ...prev])}
              />
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

        <Card className="p-4">
          <Field label="Note to Customer" hint="Specific to this invoice -- what was diagnosed, done, or found. Printed below the general Invoice Terms from Settings.">
            <textarea
              className="input-base min-h-[80px]"
              placeholder="e.g. Connected vehicle using diagnostic tool and found faults..."
              value={form.customer_note}
              onChange={(e) => set("customer_note", e.target.value)}
            />
          </Field>
        </Card>

        <div className="flex justify-end gap-2 pb-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Invoice"}</Button>
        </div>
      </form>
    </div>
  );
}

function Pills({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-white/10 p-0.5 text-xs">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-2.5 py-1 font-semibold uppercase tracking-wide transition-colors ${
            value === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// One invoice line, QuickBooks-style: Product (picked from inventory, priced
// by quantity × cost) or Service (free-text, priced Hourly or Flat Rate) —
// never a single generic "qty / price" row that doesn't say which is which.
function InvoiceLineEditor({ line, items, categories, onChange, onRemove, onItemCreated }) {
  const total = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);

  const setType = (item_type) => {
    if (item_type === "product") {
      onChange({ item_type, pricing_mode: "quantity", quantity: 1 });
    } else {
      // Both Service and Fee are free-text + an amount -- Fee just skips
      // the Hourly option, since a travel fee or disposal fee is always a
      // flat one-time charge, never billed by the hour.
      onChange({ item_type, pricing_mode: "flat", inventory_item_id: "", quantity: 1 });
    }
  };

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2.5">
        <Pills
          value={line.item_type}
          onChange={setType}
          options={[{ value: "service", label: "Service" }, { value: "product", label: "Product" }, { value: "fee", label: "Fee" }]}
        />
        {onRemove && (
          <button type="button" onClick={onRemove} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-red-300 hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {line.item_type === "product" ? (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px] gap-2">
          <InventoryItemPicker
            items={items}
            categories={categories}
            value={line.inventory_item_id}
            onSelect={(item) => onChange({ inventory_item_id: item.id, description: item.name, unit_price: Number(item.price) || 0 })}
            onItemCreated={onItemCreated}
          />
          <input className="input-base text-center" type="number" min="1" placeholder="Qty" value={line.quantity} onChange={(e) => onChange({ quantity: e.target.value })} />
        </div>
      ) : (
        <input
          className="input-base mb-2"
          placeholder={line.item_type === "fee" ? "Fee description (e.g. Travel / disposal fee)" : "Service description (e.g. Oil change labor)"}
          value={line.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      )}

      {line.item_type === "service" && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Pills
            value={line.pricing_mode}
            onChange={(pricing_mode) => onChange(pricing_mode === "flat" ? { pricing_mode, quantity: 1 } : { pricing_mode })}
            options={[{ value: "flat", label: "Flat Rate" }, { value: "hourly", label: "Hourly" }]}
          />
          {line.pricing_mode === "hourly" ? (
            <div className="flex items-center gap-1.5">
              <input className="input-base mono w-24" type="number" step="0.01" placeholder="Rate/hr" value={line.unit_price} onChange={(e) => onChange({ unit_price: e.target.value })} />
              <span className="text-xs text-muted-foreground">×</span>
              <input className="input-base w-20" type="number" step="0.25" min="0" placeholder="Hours" value={line.quantity} onChange={(e) => onChange({ quantity: e.target.value })} />
            </div>
          ) : (
            <input className="input-base mono w-28" type="number" step="0.01" placeholder="Amount" value={line.unit_price} onChange={(e) => onChange({ unit_price: e.target.value })} />
          )}
        </div>
      )}

      {line.item_type === "fee" && (
        <div className="mt-2">
          <input className="input-base mono w-28" type="number" step="0.01" placeholder="Amount" value={line.unit_price} onChange={(e) => onChange({ unit_price: e.target.value })} />
        </div>
      )}

      <div className="mt-2 text-right mono text-sm font-semibold text-foreground">{money(total)}</div>
    </Card>
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
