import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared";
import { PackagePlus } from "lucide-react";

// Inventory-item picker with an explicit "not in your inventory yet" empty
// state and an inline "+ Add new part" quick-create flow, so the user never
// has to leave the form they're filling out to go stock a part first.
//
// `items`/`categories` are owned by the parent (shared across every picker
// instance on the page); `onItemCreated` lets the parent append the newly
// created item to that shared list.
export default function InventoryItemPicker({ items, categories, value, onSelect, onItemCreated, className = "input-base h-[42px]" }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const linked = value ? items.find((it) => it.id === value) : null;

  const handleValueChange = (v) => {
    // Radix Select's hidden native <select> mirror can emit a spurious
    // change with an empty value while re-syncing after the controlled
    // value changes externally (e.g. right after quick-add) — never a real
    // user selection, so ignore it instead of clearing the selection.
    if (!v) return;
    if (v === "__add_new__") setQuickAddOpen(true);
    else onSelect(items.find((it) => it.id === v));
  };

  const handleCreated = (newItem) => {
    onItemCreated(newItem);
    onSelect(newItem);
    setQuickAddOpen(false);
  };

  return (
    <div>
      {items.length === 0 ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200">
          <span>No tienes esta parte en tu inventario — agrégala primero</span>
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 font-semibold text-amber-100 hover:bg-amber-500/30"
          >
            <PackagePlus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
      ) : (
        <>
          <Select value={value || undefined} onValueChange={handleValueChange}>
            <SelectTrigger className={className}>
              <SelectValue placeholder="Select part…">
                {linked ? `${linked.name}${linked.part_number ? ` · ${linked.part_number}` : ""} (${linked.stock} in stock)` : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__add_new__" className="text-primary font-semibold">
                + Agregar nueva parte
              </SelectItem>
              {items.map((it) => (
                <SelectItem key={it.id} value={it.id}>
                  {it.name} {it.part_number ? `· ${it.part_number}` : ""} ({it.stock} in stock)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {linked && Number(linked.stock) <= 0 && (
            <p className="mt-1 text-[11px] text-red-300">This part has 0 in stock.</p>
          )}
        </>
      )}

      <QuickAddPartDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} categories={categories} onCreated={handleCreated} />
    </div>
  );
}

function QuickAddPartDialog({ open, onOpenChange, categories, onCreated }) {
  const [form, setForm] = useState({ name: "", part_number: "", cost: "", category: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ name: "", part_number: "", cost: "", category: "" });
  }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    // See ClientForm.jsx's submit — Radix Dialog portals the DOM but React
    // still bubbles the submit through the component tree to an outer form.
    e.stopPropagation();
    setSaving(true);
    try {
      const payload = { ...form, stock: 1, cost: Number(form.cost) || 0 };
      const item = await api.entities.InventoryItem.create(payload);
      onCreated(item);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-display uppercase tracking-wide">Add New Part</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Name *"><input className="input-base" required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field></div>
          <Field label="Part #"><input className="input-base mono" value={form.part_number} onChange={(e) => set("part_number", e.target.value)} /></Field>
          <Field label="Category">
            <input className="input-base" list="quick-add-part-cat-list" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Type or pick" />
            <datalist id="quick-add-part-cat-list">{categories.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          </Field>
          <Field label="Cost ($)"><input className="input-base" type="number" step="0.01" value={form.cost} onChange={(e) => set("cost", e.target.value)} /></Field>
          <p className="col-span-2 text-[11px] text-muted-foreground">Starting stock will be set to 1 — adjust it later from Inventory.</p>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Add & Select"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
