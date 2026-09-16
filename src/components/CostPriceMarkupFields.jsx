import React, { useState } from "react";
import { Field } from "@/components/shared";
import { suggestedPrice, suggestedMarkupPct, suggestedMarkupRange } from "@/lib/format";

// Cost and price are independent, always-editable fields -- markup is only
// a calculator to suggest a price from a cost, never stored itself. The
// suggested price is offered as a placeholder, not auto-filled, so it never
// silently overrides a price the user already typed or already had saved.
//
// The suggested markup % itself is tiered by cost (cheap parts get a much
// higher percentage than expensive ones -- a $5 part marked up 10% isn't
// worth stocking) rather than one flat default; see suggestedMarkupPct.
export default function CostPriceMarkupFields({ cost, price, onCostChange, onPriceChange }) {
  const [markup, setMarkup] = useState("");
  const tierMarkup = suggestedMarkupPct(cost);
  const tierRange = suggestedMarkupRange(cost);
  const effectiveMarkup = markup === "" ? tierMarkup : markup;
  const suggestion = suggestedPrice(cost, effectiveMarkup);

  return (
    <>
      <Field label="Cost ($)" hint="Lo que te costó a ti esta parte">
        <input className="input-base" type="number" step="0.01" value={cost} onChange={(e) => onCostChange(e.target.value)} />
      </Field>
      <Field
        label="Markup (%)"
        hint={
          suggestion
            ? `Rango sugerido ${tierRange} — ej: $${Number(cost).toFixed(2)} + ${effectiveMarkup}% = $${suggestion.toFixed(2)}`
            : "Margen sugerido según el costo"
        }
      >
        <input
          className="input-base"
          type="number"
          step="1"
          placeholder={tierMarkup != null ? String(tierMarkup) : "—"}
          value={markup}
          onChange={(e) => setMarkup(e.target.value)}
        />
      </Field>
      <Field label="Price ($)" hint="Lo que le cobras al cliente — esto es lo que se usa en las facturas">
        <input
          className="input-base"
          type="number"
          step="0.01"
          placeholder={suggestion ? suggestion.toFixed(2) : "0.00"}
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
        />
      </Field>
    </>
  );
}
