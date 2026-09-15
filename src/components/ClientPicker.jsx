import React, { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ClientForm from "@/components/ClientForm";
import { UserPlus } from "lucide-react";

// Client picker with an explicit "no clients yet" empty state and an inline
// "+ Add new client" quick-create (reuses the real ClientForm dialog, so
// every field is available — not a stripped-down duplicate).
export default function ClientPicker({ clients, value, onSelect, onClientCreated, className = "input-base h-[42px]" }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const selected = value ? clients.find((c) => c.id === value) : null;

  const handleValueChange = (v) => {
    if (!v) return;
    if (v === "__add_new__") setQuickAddOpen(true);
    else onSelect(clients.find((c) => c.id === v));
  };

  const handleSaved = (newClient) => {
    onClientCreated(newClient);
    onSelect(newClient);
    setQuickAddOpen(false);
  };

  return (
    <div>
      {clients.length === 0 ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200">
          <span>No tienes clientes todavía — agrega uno primero</span>
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 font-semibold text-amber-100 hover:bg-amber-500/30"
          >
            <UserPlus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
      ) : (
        <Select value={value || undefined} onValueChange={handleValueChange}>
          <SelectTrigger className={className}>
            <SelectValue placeholder="Select client">{selected ? selected.name : null}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__add_new__" className="text-primary font-semibold">
              + Add new client
            </SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <ClientForm open={quickAddOpen} onOpenChange={setQuickAddOpen} onSaved={handleSaved} />
    </div>
  );
}
