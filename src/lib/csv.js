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
