import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { todayISO, fmtDate, uid } from "@/lib/format";
import { PageHeader, Loader, Field, Card } from "@/components/shared";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";

const STATUSES = ["Draft", "In Progress", "Ready to Invoice", "Invoiced"];

export default function WorkOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data, loading } = useAsync(() =>
    Promise.all([
      api.entities.Client.list(),
      api.entities.Vehicle.list(),
      api.auth.me(),
      isEdit ? api.entities.WorkOrder.get(id) : Promise.resolve(null),
    ])
  , [id]);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const [clients, vehicles, me, wo] = data;
    if (wo) {
      setForm({
        ...wo,
        technician_name: wo.technician_name || me?.full_name || me?.email || "",
      });
    } else {
      setForm({
        technician_name: me?.full_name || me?.email || "",
        client_id: "",
        vehicle_id: "",
        status: "Draft",
        date: todayISO(),
        subjects: [{ description: "", note: "", parts_used: [] }],
        general_notes: "",
      });
    }
  }, [data]);

  if (loading || !form) return <Loader />;
  const [clients, vehicles] = data;

  const clientVehicles = vehicles.filter((v) => v.client_id === form.client_id);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setSubject = (idx, key, val) => setForm((f) => ({
    ...f,
    subjects: f.subjects.map((s, i) => (i === idx ? { ...s, [key]: val } : s)),
  }));

  const addSubject = () => setForm((f) => ({ ...f, subjects: [...f.subjects, { description: "", note: "", parts_used: [] }] }));
  const removeSubject = (idx) => setForm((f) => ({ ...f, subjects: f.subjects.filter((_, i) => i !== idx) }));

  const setPart = (sIdx, pIdx, key, val) => setForm((f) => ({
    ...f,
    subjects: f.subjects.map((s, i) => i === sIdx ? { ...s, parts_used: s.parts_used.map((p, j) => j === pIdx ? { ...p, [key]: val } : p) } : s),
  }));
  const addPart = (sIdx) => setForm((f) => ({ ...f, subjects: f.subjects.map((s, i) => i === sIdx ? { ...s, parts_used: [...s.parts_used, { part_number: "", name: "", quantity: 1 }] } : s) }));
  const removePart = (sIdx, pIdx) => setForm((f) => ({ ...f, subjects: f.subjects.map((s, i) => i === sIdx ? { ...s, parts_used: s.parts_used.filter((_, j) => j !== pIdx) } : s) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, subjects: form.subjects.filter((s) => s.description || s.note || s.parts_used.length) };
      let saved;
      if (isEdit) saved = await api.entities.WorkOrder.update(id, payload);
      else saved = await api.entities.WorkOrder.create(payload);
      navigate(`/work-orders/${saved.id}/view`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Work Order" : "New Work Order"} back={isEdit ? `/work-orders/${id}/view` : "/work-orders"} />
      <form onSubmit={submit} className="space-y-5">
        <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <Field label="Technician"><input className="input-base" value={form.technician_name} onChange={(e) => set("technician_name", e.target.value)} /></Field>
          <Field label="Date"><input className="input-base" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="input-base h-[42px]"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </Card>

        {/* Subjects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">Subjects</h2>
            <button type="button" onClick={addSubject} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"><Plus className="h-4 w-4" /> Add Subject</button>
          </div>
          <div className="space-y-4">
            {form.subjects.map((s, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject {idx + 1}</span>
                  {form.subjects.length > 1 && (
                    <button type="button" onClick={() => removeSubject(idx)} className="text-red-300 hover:bg-red-500/10 grid h-7 w-7 place-items-center rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
                <Field label="Labor Description"><textarea className="input-base min-h-[70px]" value={s.description} onChange={(e) => setSubject(idx, "description", e.target.value)} placeholder="Customer complaint / labor performed…" /></Field>
                <div className="mt-3"><Field label="Note"><input className="input-base" value={s.note} onChange={(e) => setSubject(idx, "note", e.target.value)} placeholder="Optional note" /></Field></div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="field-label">Parts Used</span>
                    <button type="button" onClick={() => addPart(idx)} className="text-xs text-primary hover:underline inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Add part</button>
                  </div>
                  {s.parts_used.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No parts logged for this subject.</p>
                  ) : (
                    <div className="space-y-2">
                      {s.parts_used.map((p, pIdx) => (
                        <div key={pIdx} className="grid grid-cols-[1fr_1fr_70px_auto] gap-2">
                          <input className="input-base mono" placeholder="Part #" value={p.part_number} onChange={(e) => setPart(idx, pIdx, "part_number", e.target.value)} />
                          <input className="input-base" placeholder="Part name" value={p.name} onChange={(e) => setPart(idx, pIdx, "name", e.target.value)} />
                          <input className="input-base" type="number" min="1" placeholder="Qty" value={p.quantity} onChange={(e) => setPart(idx, pIdx, "quantity", Number(e.target.value))} />
                          <button type="button" onClick={() => removePart(idx, pIdx)} className="grid h-[42px] w-10 place-items-center rounded-md border border-white/10 text-red-300 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4">
          <Field label="General Notes"><textarea className="input-base min-h-[80px]" value={form.general_notes} onChange={(e) => set("general_notes", e.target.value)} placeholder="Overall notes for this work order…" /></Field>
        </Card>

        <div className="flex justify-end gap-2 pb-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Work Order"}</Button>
        </div>
      </form>
    </div>
  );
}
