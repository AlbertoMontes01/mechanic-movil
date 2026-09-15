import { jsPDF } from "jspdf";

// Shared PDF builder for Work Orders, Invoices and Vehicle History.
// Clean white professional layout: shop header, client/vehicle block, data table.

function drawHeader(doc, settings, margin, pageW) {
  let y = margin;
  if (settings?.logo_url) {
    try {
      doc.addImage(settings.logo_url, "PNG", margin, y, 30, 30);
    } catch (e) {
      // logo may be svg or unsupported — skip silently
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(settings?.shop_name || "My Shop", margin + 36, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const contact = [settings?.phone, settings?.address].filter(Boolean).join("  •  ");
  if (contact) doc.text(contact, margin + 36, y + 20);
  return y + 34;
}

function drawClientVehicle(doc, x, y, pageW, margin, client, vehicle) {
  const blockW = pageW - margin * 2;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, blockW, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("CLIENT", x + 6, y + 6);
  doc.text("VEHICLE", x + blockW / 2 + 4, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(client?.name || "—", x + 6, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const clientLines = [
    [client?.address, client?.city, client?.state, client?.zip].filter(Boolean).join(", "),
    [client?.phone, client?.email].filter(Boolean).join("  •  "),
  ].filter(Boolean);
  clientLines.forEach((l, i) => doc.text(l, x + 6, y + 19 + i * 5));

  const vehicleLine = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(vehicleLine || "—", x + blockW / 2 + 4, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const vLines = [
    vehicle?.plate ? `Plate: ${vehicle.plate}` : "",
    vehicle?.vin ? `VIN: ${vehicle.vin}` : "",
    vehicle?.odometer != null ? `Odo: ${Number(vehicle.odometer).toLocaleString()} mi` : "",
  ].filter(Boolean);
  vLines.forEach((l, i) => doc.text(l, x + blockW / 2 + 4, y + 19 + i * 5));

  return y + 40;
}

function tableHeader(doc, x, y, cols, labels) {
  doc.setFillColor(15, 23, 42);
  doc.rect(x, y, cols.reduce((s, c) => s + c.w, 0), 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(248, 250, 252);
  let cx = x;
  cols.forEach((c, i) => {
    doc.text(labels[i], cx + 3, y + 5.5);
    cx += c.w;
  });
  return y + 8;
}

function tableRows(doc, x, y, cols, rows, pageH, margin, headerLabels) {
  let cy = y;
  rows.forEach((row, ri) => {
    const rowH = Math.max(8, 5 * Math.max(...cols.map((c, i) => doc.splitTextToSize(String(row[i] ?? ""), c.w - 6).length)) * 4.5);
    if (cy + rowH > pageH - margin - 14) {
      doc.addPage();
      cy = margin;
      cy = tableHeader(doc, x, cy, cols, headerLabels);
    }
    if (ri % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(x, cy, cols.reduce((s, c) => s + c.w, 0), rowH, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    let cx = x;
    cols.forEach((c, i) => {
      const lines = doc.splitTextToSize(String(row[i] ?? ""), c.w - 6);
      doc.text(lines, cx + 3, cy + 5);
      cx += c.w;
    });
    cy += rowH;
  });
  return cy;
}

export function generateWorkOrderPDF(wo, client, vehicle, settings) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  let y = drawHeader(doc, settings, margin, pageW);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11);
  doc.text("WORK ORDER", margin, y + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const woMeta = [wo.date, `Tech: ${wo.technician_name || "—"}`, `Status: ${wo.status}`].filter(Boolean).join("    ");
  doc.text(woMeta, pageW - margin, y + 2, { align: "right" });
  y += 8;

  y = drawClientVehicle(doc, margin, y, pageW, margin, client, vehicle);

  const cols = [{ w: 60 }, { w: 50 }, { w: pageW - margin * 2 - 60 - 50 }];
  const labels = ["LABOR DESCRIPTION", "PARTS USED", "NOTES"];
  y = tableHeader(doc, margin, y, cols, labels);

  const rows = (wo.subjects || []).map((s) => {
    const parts = (s.parts_used || []).map((p) => `${p.name || p.part_number || "—"} x${p.quantity || 1}`).join("\n");
    return [s.description || "—", parts || "—", s.note || "—"];
  });
  if (rows.length === 0) rows.push(["—", "—", "—"]);

  y = tableRows(doc, margin, y, cols, rows, pageH, margin, labels);

  if (wo.general_notes) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("GENERAL NOTES", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const noteLines = doc.splitTextToSize(wo.general_notes, pageW - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4.5;
  }

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, pageH - 8);

  doc.save(`WO-${(wo.id || "draft").slice(-6).toUpperCase()}.pdf`);
}

export function generateInvoicePDF(inv, client, vehicle, settings) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  let y = drawHeader(doc, settings, margin, pageW);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text("INVOICE", margin, y + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const invMeta = [inv.invoice_number, inv.date, `Status: ${inv.status}`].filter(Boolean).join("    ");
  doc.text(invMeta, pageW - margin, y + 2, { align: "right" });
  y += 8;

  y = drawClientVehicle(doc, margin, y, pageW, margin, client, vehicle);

  const colW = { d: pageW - margin * 2 - 18 - 22 - 26, qty: 18, price: 26, total: 22 };
  const cols = [{ w: colW.d }, { w: colW.qty }, { w: colW.price }, { w: colW.total }];
  const labels = ["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"];
  y = tableHeader(doc, margin, y, cols, labels);

  const rows = (inv.lines || []).map((l) => [
    l.description || "—",
    String(l.quantity ?? 1),
    `$${Number(l.unit_price || 0).toFixed(2)}`,
    `$${Number(l.total || 0).toFixed(2)}`,
  ]);
  if (rows.length === 0) rows.push(["—", "—", "—", "—"]);

  y = tableRows(doc, margin, y, cols, rows, pageH, margin, labels);

  // totals box
  y += 6;
  const boxW = 70;
  const boxX = pageW - margin - boxW;
  const money = (n) => `$${Number(n || 0).toFixed(2)}`;
  const totals = [
    ["Subtotal", money(inv.subtotal)],
    ["Tax", money(inv.tax)],
    ["Total", money(inv.total)],
  ];
  totals.forEach((t, i) => {
    const isTotal = i === totals.length - 1;
    if (isTotal) {
      doc.setFillColor(245, 158, 11);
      doc.rect(boxX, y, boxW, 9, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
    }
    doc.setFontSize(isTotal ? 11 : 9);
    doc.text(t[0], boxX + 3, y + (isTotal ? 6 : 5));
    doc.text(t[1], boxX + boxW - 3, y + (isTotal ? 6 : 5), { align: "right" });
    y += isTotal ? 9 : 6;
  });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, pageH - 8);

  doc.save(`${inv.invoice_number || "INVOICE"}.pdf`);
}

export function generateVehicleHistoryPDF(vehicle, client, history, settings) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  let y = drawHeader(doc, settings, margin, pageW);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11);
  doc.text("VEHICLE HISTORY", margin, y + 2);
  y += 8;

  y = drawClientVehicle(doc, margin, y, pageW, margin, client, vehicle);

  const cols = [{ w: 24 }, { w: 26 }, { w: pageW - margin * 2 - 24 - 26 - 30 }, { w: 30 }];
  const labels = ["DATE", "TYPE", "SUMMARY", "AMOUNT"];
  y = tableHeader(doc, margin, y, cols, labels);

  const rows = history.map((h) => [
    h.date || "—",
    h.type,
    h.summary,
    h.amount ? `$${Number(h.amount).toFixed(2)}` : "—",
  ]);
  if (rows.length === 0) rows.push(["—", "—", "No records yet", "—"]);

  y = tableRows(doc, margin, y, cols, rows, pageH, margin, labels);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, pageH - 8);

  doc.save(`History-${(vehicle?.make || "").replace(/\s/g, "")}-${(vehicle?.model || "").replace(/\s/g, "")}.pdf`);
}
