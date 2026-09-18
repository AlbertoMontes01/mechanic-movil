import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Start today.</h2>
        <p className="mt-3 text-muted-foreground">Create your account in 2 minutes.</p>
        <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 font-semibold text-primary-foreground">
          <Wrench className="h-4 w-4" /> Create my account
        </Link>
      </div>
    </section>
  );
}
