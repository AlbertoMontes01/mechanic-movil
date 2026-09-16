import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { money } from "@/lib/format";
import { PageHeader, Loader, EmptyState, Card, Field } from "@/components/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CostPriceMarkupFields from "@/components/CostPriceMarkupFields";
import { Plus, Edit, Trash2, Package, Tag, Search } from "lucide-react";

export default function Inventory() {
  const [itemOpen, setItemOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [catOpen, setCatOpen] = useState(false);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const { data, loading, reload } = useAsync(() =>
    Promise.all([
      api.entities.InventoryItem.list("-updated_date", 300),
      api.entities.InventoryCategory.list(),
    ])
  );

  const items = (data?.[0] || []).filter((i) =>
    (catFilter === "all" || i.category === catFilter) &&
    (!q || i.name?.toLowerCase().includes(q.toLowerCase()) || i.part_number?.toLowerCase().includes(q.toLowerCase()))
  );
  const categories = data?.[1] || [];

  const openNew = () => { setEditing(null); setItemOpen(true); };
  const openEdit = (it) => { setEditing(it); setItemOpen(true); };

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${(data?.[0] || []).length} parts`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setCatOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><Tag className="h-4 w-4" /> Categories</button>
            <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> New Part</button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input-base pl-9" placeholder="Search part name or #" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input-base sm:w-48" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : items.length === 0 ? (
        <EmptyState icon={Package} title="No parts found" hint="Add parts to track stock and link them to vehicles." action={
          <button onClick={openNew} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">+ New Part</button>
        } />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((it) => (
            <Card key={it.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{it.name}</p>
                  {it.part_number && <p className="mono text-[11px] text-muted-foreground">{it.part_number}</p>}
                  {it.category && <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-muted-foreground bg-white/5 rounded px-1.5 py-0.5">{it.category}</span>}
                </div>
                <button onClick={() => openEdit(it)} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`mono text-sm font-bold px-2 py-0.5 rounded ${Number(it.stock) <= 0 ? "bg-red-500/20 text-red-300" : Number(it.stock) <= 3 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                  {it.stock} in stock
                </span>
                <span className="text-sm text-muted-foreground">Cost {money(it.cost)} · Price {money(it.price)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ItemForm open={itemOpen} onOpenChange={setItemOpen} onSaved={reload} item={editing} categories={categories} />
      <CategoryManager open={catOpen} onOpenChange={setCatOpen} categories={categories} onSaved={reload} />
    </div>
  );
}

function ItemForm({ open, onOpenChange, onSaved, item, categories }) {
  const [form, setForm] = useState({ part_number: "", name: "", stock: "", cost: "", price: "", category: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(item ? { ...item, stock: item.stock ?? "", cost: item.cost ?? "", price: item.price ?? "" } : { part_number: "", name: "", stock: "", cost: "", price: "", category: "" });
  }, [open, item]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, stock: Number(form.stock) || 0, cost: Number(form.cost) || 0, price: Number(form.price) || 0 };
      if (item?.id) await api.entities.InventoryItem.update(item.id, payload);
      else await api.entities.InventoryItem.create(payload);
      onSaved?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-display uppercase tracking-wide">{item ? "Edit Part" : "New Part"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Name *"><input className="input-base" required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field></div>
          <Field label="Part #"><input className="input-base mono" value={form.part_number} onChange={(e) => set("part_number", e.target.value)} /></Field>
          <Field label="Category">
            <input className="input-base" list="cat-list" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Type or pick" />
            <datalist id="cat-list">{categories.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          </Field>
          <Field label="Stock"><input className="input-base" type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></Field>
          <CostPriceMarkupFields
            cost={form.cost}
            price={form.price}
            onCostChange={(v) => set("cost", v)}
            onPriceChange={(v) => set("price", v)}
          />
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryManager({ open, onOpenChange, categories, onSaved }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.entities.InventoryCategory.create({ name: name.trim() });
      setName("");
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await api.entities.InventoryCategory.delete(id);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-display uppercase tracking-wide">Categories</DialogTitle></DialogHeader>
        <form onSubmit={add} className="flex gap-2 mb-3">
          <input className="input-base" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" disabled={saving}><Plus className="h-4 w-4" /></Button>
        </form>
        <div className="space-y-2 max-h-60 overflow-auto">
          {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
              <span className="text-sm text-foreground">{c.name}</span>
              <button onClick={() => remove(c.id)} className="text-red-300 hover:bg-red-500/10 grid h-7 w-7 place-items-center rounded"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
