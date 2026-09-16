import React, { useState } from "react";
import { Field } from "@/components/shared";
import { suggestedPrice } from "@/lib/format";

const DEFAULT_MARKUP = 30;

// Cost and price are independent, always-editable fields -- markup is only
// a calculator to suggest a price from a cost, never stored itself. The
// suggested price is offered as a placeholder, not auto-filled, so it never
// silently overrides a price the user already typed or already had saved.
export default function CostPriceMarkupFields({ cost, price, onCostChange, onPriceChange }) {
  const [markup, setMarkup] = useState("");
  const effectiveMarkup = markup === "" ? DEFAULT_MARKUP : markup;
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
            ? `Ej: $${Number(cost).toFixed(2)} + ${effectiveMarkup}% = $${suggestion.toFixed(2)} sugerido`
            : `Margen sugerido, ej. ${DEFAULT_MARKUP}%`
        }
      >
        <input className="input-base" type="number" step="1" placeholder={String(DEFAULT_MARKUP)} value={markup} onChange={(e) => setMarkup(e.target.value)} />
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
