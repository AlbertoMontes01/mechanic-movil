// Plain CSV, not a real .xlsx -- opens correctly in Excel, Numbers, and
// Google Sheets without pulling in a spreadsheet-writing library for
// something this simple. `columns` controls both the header row and the
// export order; `row[key]` is read directly (dot paths aren't supported).
export function exportToCSV(filename, columns, rows) {
  const escape = (val) => {
    const s = val == null ? "" : String(val);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [
    columns.map((c) => escape(c.label)).join(","),
    ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(",")),
  ];
  // Leading BOM so Excel opens the UTF-8 file with accents (client names,
  // addresses) intact instead of mangling them.
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// RFC4180-ish CSV parser: handles quoted fields, embedded commas/newlines,
// and escaped quotes ("") inside a quoted field. Returns an array of rows,
// each row an array of raw string cells (header included, row 0).
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  // A leading BOM (from Excel-saved-as-CSV, or our own export) isn't part
  // of the data.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // swallow -- \r\n is handled by the following \n; a lone \r (old
      // Mac line endings) is rare enough not to special-case
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

// Maps parsed CSV rows (with rows[0] as the header) to plain objects keyed
// by `columns[].key`, matching header cells to `columns[].label`
// case-insensitively -- column order in the file doesn't have to match
// `columns`, so a reordered or partially-filled-in template still works.
export function rowsToObjects(rows, columns) {
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => {
    const obj = {};
    for (const col of columns) {
      const idx = header.indexOf(col.label.toLowerCase());
      obj[col.key] = idx >= 0 ? (r[idx] ?? "").trim() : "";
    }
    return obj;
  });
}
