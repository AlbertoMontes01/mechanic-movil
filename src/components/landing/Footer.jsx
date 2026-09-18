import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary"><Wrench className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-display text-lg font-bold uppercase">PitStop</span>
          </div>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/login" className="hover:text-foreground">Log in</Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} PitStop. Made for independent mechanics.</p>
      </div>
    </footer>
  );
}
