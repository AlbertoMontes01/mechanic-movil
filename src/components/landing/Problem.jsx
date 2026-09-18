import { NotebookPen, MessageSquare, FileWarning, Boxes } from "lucide-react";

const PAINS = [
  { icon: NotebookPen, title: "Notebooks and paper", desc: "Every vehicle's history gets lost in loose notes. You don't know what you did 6 months ago." },
  { icon: MessageSquare, title: "Everything in text threads", desc: "Quotes, notes, and client info scattered across chats nobody organizes." },
  { icon: FileWarning, title: "Invoices that don't impress", desc: "A handwritten invoice doesn't look professional. Clients expect something clear." },
  { icon: Boxes, title: "Flying blind on inventory", desc: "You don't know how many parts you have left until you need one and it's gone." },
];

export default function Problem() {
  return (
    <section className="border-y border-white/10 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-bold uppercase tracking-tight">Still running your shop like this?</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">Most independent mechanics lose hours and customers by not having a system.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAINS.map((p) => (
            <div key={p.title} className="rounded-lg border border-white/10 bg-background/60 p-5">
              <p.icon className="h-7 w-7 text-red-400" />
              <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
