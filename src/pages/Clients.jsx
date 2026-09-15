import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAsync } from "@/lib/useAsync";
import { PageHeader, EmptyState, Loader } from "@/components/shared";
import ClientForm from "@/components/ClientForm";
import { Plus, Search, Users } from "lucide-react";

export default function Clients() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { data, loading, reload } = useAsync(() => base44.entities.Client.list("-updated_date", 200));

  const clients = (data || []).filter((c) =>
    !q || c.name?.toLowerCase().includes(q.toLowerCase()) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${(data || []).length} clients`}
        actions={
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> New
          </button>
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
    </div>
  );
}
