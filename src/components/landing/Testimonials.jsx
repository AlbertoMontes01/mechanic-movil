import { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/api/client";

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const scrollerRef = useRef(null);

  useEffect(() => {
    api.testimonials.getPublic().then(setItems).catch(() => {});
  }, []);

  // No fake placeholder reviews -- hide the whole section until there are
  // real ones instead of showing an empty carousel.
  if (items.length === 0) return null;

  const scroll = (dir) => scrollerRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight">What mechanics are saying</h2>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="mt-8 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t) => (
          <div key={t.id} className="w-[280px] shrink-0 snap-start rounded-lg border border-white/10 bg-card/50 p-5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={i < t.rating ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground/30"}
                  fill={i < t.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-foreground/90">&ldquo;{t.comment}&rdquo;</p>
            <p className="mt-4 text-xs font-semibold text-muted-foreground">{t.author_name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
