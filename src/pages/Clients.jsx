import React, { useState } from "react";
import { api } from "@/api/client";
import { useAsync } from "@/lib/useAsync";
import { PageHeader, EmptyState, Loader } from "@/components/shared";
import ClientForm from "@/components/ClientForm";
import ImportCSVDialog from "@/components/ImportCSVDialog";
import { exportToCSV } from "@/lib/csv";
import { Plus, Search, Users, Download, Upload } from "lucide-react";

const CLIENT_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip", label: "ZIP" },
];

const CLIENT_TEMPLATE_ROWS = [
  { name: "Jane's Auto Shop", phone: "555-0100", email: "jane@example.com", address: "123 Main St", city: "Austin", state: "TX", zip: "78701" },
];

export default function Clients() {
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [q, setQ] = useState("");
  const { data, loading, reload } = useAsync(() => api.entities.Client.list("-updated_date", 200));

  const clients = (data || []).filter((c) =>
    !q || c.name?.toLowerCase().includes(q.toLowerCase()) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q.toLowerCase())
  );

  const exportClients = () => exportToCSV("clients.csv", CLIENT_COLUMNS, data || []);

  const importClients = async (rows) => {
    let created = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNum = i + 2;
      if (!r.name) { errors.push({ row: rowNum, message: "Missing required ‘Name’ -- row skipped." }); continue; }
      if (!r.phone) { errors.push({ row: rowNum, message: "Missing required ‘Phone’ -- row skipped." }); continue; }
      try {
        await api.entities.Client.create({
          name: r.name,
          phone: r.phone,
          email: r.email || undefined,
          address: r.address || undefined,
          city: r.city || undefined,
          state: r.state || undefined,
          zip: r.zip || undefined,
        });
        created++;
      } catch (err) {
        errors.push({ row: rowNum, message: err.message || "Could not create this client." });
      }
    }
    reload();
    return { created, errors };
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${(data || []).length} clients`}
        actions={
          <div className="flex gap-2">
            <button onClick={exportClients} disabled={!(data || []).length} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-40">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
              <Upload className="h-4 w-4" /> Import CSV
            </button>
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" /> New
            </button>
          </div>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input className="input-base pl-9" placeholder="Search name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? <Loader /> : clients.length === 0 ? (
        <EmptyState icon={Users} title="No clients yet" hint="Add your first client to start logging jobs." action={
          <button onClick={() => setOpen(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">+ New Client</button>
        } />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((c) => (
            <a key={c.id} href={`/clients/${c.id}`} className="glass-card rounded-lg border border-white/10 p-4 hover:border-primary/40 transition-colors block">
              <p className="font-semibold text-foreground truncate">{c.name}</p>
              <p className="text-sm text-muted-foreground truncate">{c.phone}</p>
              <p className="text-xs text-muted-foreground/70 truncate mt-1">{[c.city, c.state].filter(Boolean).join(", ")}</p>
            </a>
          ))}
        </div>
      )}

      <ClientForm open={open} onOpenChange={setOpen} onSaved={reload} />
      <ImportCSVDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Clients"
        templateFilename="clients-template.csv"
        columns={CLIENT_COLUMNS}
        exampleRows={CLIENT_TEMPLATE_ROWS}
        onImportRows={importClients}
      />
    </div>
  );
}
