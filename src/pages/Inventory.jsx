import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { money } from "@/lib/format";
import { PageHeader, Loader, EmptyState, Card, Field } from "@/components/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CostPriceMarkupFields from "@/components/CostPriceMarkupFields";
import ImportCSVDialog from "@/components/ImportCSVDialog";
import { exportToCSV } from "@/lib/csv";
import { showError, showSuccess } from "@/lib/errorToast";
import { Plus, Edit, Trash2, Package, Tag, Search, Download, Upload } from "lucide-react";

const INVENTORY_COLUMNS = [
  { key: "part_number", label: "Part #" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "stock", label: "Stock" },
  { key: "track_stock", label: "Tracked" },
  { key: "cost", label: "Cost" },
  { key: "price", label: "Price" },
];

const INVENTORY_TEMPLATE_ROWS = [
  { part_number: "BR-1234", name: "Brake Pad Set", category: "Brakes", stock: 5, track_stock: "Yes", cost: 20, price: 35 },
  { part_number: "", name: "Shop Rag (bulk)", category: "Supplies", stock: 0, track_stock: "No", cost: 0.5, price: 1 },
];

export default function Inventory() {
  const [itemOpen, setItemOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [catOpen, setCatOpen] = useState(false);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [confirmDelId, setConfirmDelId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

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

  const removeItem = async (id) => {
    try {
      await api.entities.InventoryItem.delete(id);
      reload();
      showSuccess("Part deleted");
    } catch (err) {
      showError(err, "Could not delete this part.");
    } finally {
      setConfirmDelId(null);
    }
  };

  // Exports exactly what's on screen -- the category filter already reads
  // "All categories" or one specific category, so there's no separate
  // export-scope picker to keep in sync with it.
  const exportInventory = () => {
    const rows = items.map((i) => ({ ...i, track_stock: i.track_stock ? "Yes" : "No" }));
    const suffix = catFilter === "all" ? "all-categories" : catFilter.toLowerCase().replace(/\s+/g, "-");
    exportToCSV(`inventory-${suffix}.csv`, INVENTORY_COLUMNS, rows);
  };

  // Always creates new parts -- it doesn't try to match a row against an
  // existing part by name/part # and update it, since that guessing game
  // is more likely to silently overwrite the wrong part than help. A
  // dedicated "update existing" mode can be added later if that's needed.
  const importInventory = async (rows) => {
    let created = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNum = i + 2;
      if (!r.name) {
        errors.push({ row: rowNum, message: "Missing required ‘Name’ -- row skipped." });
        continue;
      }
      try {
        await api.entities.InventoryItem.create({
          part_number: r.part_number || undefined,
          name: r.name,
          category: r.category || undefined,
          stock: Number(r.stock) || 0,
          track_stock: r.track_stock ? !/^no$/i.test(r.track_stock) : true,
          cost: Number(r.cost) || 0,
          price: Number(r.price) || 0,
        });
        created++;
      } catch (err) {
        errors.push({ row: rowNum, message: err.message || "Could not create this part." });
      }
    }
    reload();
    return { created, errors };
  };

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
        <button
          type="button"
          onClick={exportInventory}
          disabled={items.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
        <button type="button" onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
          <Upload className="h-4 w-4" /> Import CSV
        </button>
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => openEdit(it)} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                  <button
                    onClick={() => (confirmDelId === it.id ? removeItem(it.id) : setConfirmDelId(it.id))}
                    onBlur={() => setConfirmDelId(null)}
                    className={`grid h-8 place-items-center rounded-md px-2 text-xs font-semibold ${confirmDelId === it.id ? "bg-red-500 text-white" : "border border-white/10 text-red-300 hover:bg-red-500/10"}`}
                  >
                    {confirmDelId === it.id ? "Confirm?" : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {it.track_stock ? (
                  <span className={`mono text-sm font-bold px-2 py-0.5 rounded ${Number(it.stock) <= 0 ? "bg-red-500/20 text-red-300" : Number(it.stock) <= 3 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                    {it.stock} in stock
                  </span>
                ) : (
                  <span className="mono text-sm px-2 py-0.5 rounded bg-white/5 text-muted-foreground" title="Stock alerts are off for this part">
                    Not tracked
                  </span>
                )}
                <span className="text-sm text-muted-foreground">Cost {money(it.cost)} · Price {money(it.price)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ItemForm open={itemOpen} onOpenChange={setItemOpen} onSaved={reload} item={editing} categories={categories} />
      <ImportCSVDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Parts"
        templateFilename="inventory-template.csv"
        columns={INVENTORY_COLUMNS}
        exampleRows={INVENTORY_TEMPLATE_ROWS}
        onImportRows={importInventory}
      />
      <CategoryManager open={catOpen} onOpenChange={setCatOpen} categories={categories} onSaved={reload} />
    </div>
  );
}

const EMPTY_ITEM_FORM = { part_number: "", name: "", stock: "", cost: "", price: "", track_stock: true, category: "" };

function ItemForm({ open, onOpenChange, onSaved, item, categories }) {
  const [form, setForm] = useState(EMPTY_ITEM_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? { ...item, stock: item.stock ?? "", cost: item.cost ?? "", price: item.price ?? "", track_stock: item.track_stock ?? true }
          : EMPTY_ITEM_FORM
      );
    }
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
      showSuccess(item?.id ? "Part updated" : "Part created");
    } catch (err) {
      showError(err, "Could not save this part.");
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
          <label className="col-span-2 flex items-start gap-3 rounded-md border border-white/10 px-3 py-3 cursor-pointer hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 accent-primary"
              checked={form.track_stock}
              onChange={(e) => set("track_stock", e.target.checked)}
            />
            <span>
              <span className="block text-sm font-medium text-foreground">Track stock &amp; alert when low</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Shows this part's stock badge and includes it in the dashboard's Low Inventory list. Turn off for parts you don't count exactly.
              </span>
            </span>
          </label>
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
      showSuccess("Category added");
    } catch (err) {
      showError(err, "Could not add this category.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.entities.InventoryCategory.delete(id);
      onSaved?.();
      showSuccess("Category deleted");
    } catch (err) {
      showError(err, "Could not delete this category.");
    }
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
