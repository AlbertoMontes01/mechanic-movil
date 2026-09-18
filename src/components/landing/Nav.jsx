import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold uppercase tracking-wide">PitStop</span>
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-2 text-sm text-muted-foreground hover:text-foreground">Log in</Link>
        </div>
      </div>
    </header>
  );
}
