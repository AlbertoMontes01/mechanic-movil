import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportToCSV, parseCSV, rowsToObjects } from "@/lib/csv";
import { Download, Upload } from "lucide-react";

// Generic bulk-import flow reused by Inventory/Clients/Vehicles: download a
// template (built from the exact same `columns` the page's own export
// uses, plus a couple of example rows), fill it in, upload it back.
//
// `onImportRows(rows)` gets one plain object per data row (keyed by
// `columns[].key`) and must return `{ created, errors: [{ row, message }] }`
// -- `row` is 1-indexed against the file including the header, so "Row 2"
// is the first data row, matching what someone sees if they open the CSV
// in a spreadsheet app.
export default function ImportCSVDialog({ open, onOpenChange, title, templateFilename, columns, exampleRows, onImportRows }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const downloadTemplate = () => exportToCSV(templateFilename, columns, exampleRows);

  const handleInputChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (importing) return;
    processFile(e.dataTransfer.files?.[0]);
  };

  const processFile = async (file) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type && file.type !== "text/csv") {
      setResult({ created: 0, errors: [{ row: 0, message: `"${file.name}" doesn't look like a .csv file. Export your spreadsheet as CSV first (not .xlsx).` }] });
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        setResult({ created: 0, errors: [{ row: 0, message: "This file has no data rows below the header (or is empty)." }] });
        return;
      }
      const missingColumns = columns.filter((c) => !parsed[0].some((h) => h.trim().toLowerCase() === c.label.toLowerCase()));
      // Every column is optional in principle, but if NONE of them matched
      // the header row this almost certainly isn't the right template --
      // say so plainly instead of silently importing a file of blanks.
      if (missingColumns.length === columns.length) {
        setResult({
          created: 0,
          errors: [{ row: 1, message: `None of the expected columns (${columns.map((c) => c.label).join(", ")}) were found in the header row. Download the template below and use it as a starting point.` }],
        });
        return;
      }
      const rows = rowsToObjects(parsed, columns);
      const summary = await onImportRows(rows);
      setResult(summary);
    } catch (err) {
      setResult({ created: 0, errors: [{ row: 0, message: err.message || "Could not read this file. Make sure it's a real CSV (comma-separated), not an .xlsx." }] });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-display uppercase tracking-wide">{title}</DialogTitle></DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Not sure of the format? Download the template, fill in your rows, and upload it back here.
          </p>
          <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
            <Download className="h-4 w-4" /> Download template
          </button>

          <label
            onDragOver={(e) => { e.preventDefault(); if (!importing) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-1 rounded-md border border-dashed px-3 py-6 text-sm text-foreground cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/10" : "border-white/20 hover:bg-white/5"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>{importing ? "Importing…" : dragOver ? "Drop it here" : "Drag & drop a CSV file, or click to choose"}</span>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleInputChange} disabled={importing} />
          </label>

          {result && (
            <div className="rounded-md border border-white/10 p-3 max-h-52 overflow-auto text-sm">
              <p className="font-semibold text-foreground">
                {result.created} row{result.created === 1 ? "" : "s"} imported
                {result.errors.length ? `, ${result.errors.length} skipped` : ""}.
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-red-300">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e.row ? `Row ${e.row}: ` : ""}{e.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
