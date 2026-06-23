import type { Customer, SalesInvoice } from "./wms-data";

const numberFormat = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (value: number) => `INR ${numberFormat.format(value)}`;
const pdfEscape = (value: string) => value.replace(/[\\()]/g, "\\$&");

const text = (value: string, x: number, y: number, size = 10, font = "F1", color = "0 0 0") =>
  `q ${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET Q\n`;

const rect = (x: number, y: number, w: number, h: number, fillRgb?: string, strokeRgb?: string) => {
  let cmd = `q ${x} ${y} ${w} ${h} re `;
  if (fillRgb && strokeRgb) cmd += `${fillRgb} rg ${strokeRgb} RG B`;
  else if (fillRgb) cmd += `${fillRgb} rg f`;
  else if (strokeRgb) cmd += `${strokeRgb} RG S`;
  else cmd += "S";
  return `${cmd} Q\n`;
};

const line = (x1: number, y1: number, x2: number, y2: number, color = "0.82 0.86 0.9 RG") =>
  `q ${color} 1 w ${x1} ${y1} m ${x2} ${y2} l S Q\n`;

const buildPdf = (content: string) => {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  ];
  const offsets: number[] = [0];
  let pdf = "%PDF-1.4\n";

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
};

const fit = (value: string, max = 38) => (value.length > max ? `${value.slice(0, max - 3)}...` : value);

export function downloadSalesInvoicePdf(invoice: SalesInvoice, customer: Customer) {
  const brandBlue = "0.0 0.46 0.78";
  const successGreen = "0.04 0.55 0.29";
  const warningRed = "0.7 0.18 0.08";
  const textDark = "0.1 0.1 0.15";
  const textMuted = "0.4 0.4 0.45";
  const bgLight = "0.95 0.96 0.98";
  const isPushedToTally = invoice.pushedToTally || invoice.status === "pushed";
  const tallyStatus = isPushedToTally
    ? `Tally Status: Pushed${invoice.tallyVoucherNumber ? ` / ${invoice.tallyVoucherNumber}` : ""}`
    : "Tally Status: Not pushed";
  const footerStatus = isPushedToTally
    ? `This invoice was pushed to Tally${invoice.tallyVoucherNumber ? ` with voucher ${invoice.tallyVoucherNumber}` : ""}.`
    : "This invoice PDF was generated locally and has not been pushed to Tally.";

  let content = "";
  let y = 842;

  content += rect(0, 752, 595, 90, bgLight);
  content += text("AARKAY TECHNO CONSULTANTS PVT. LTD.", 40, 805, 16, "F2", brandBlue);
  content += text("Sales / Warehouse Department", 40, 788, 10, "F1", textMuted);
  content += text("Seller GSTIN: 27AAACA1234A1Z5", 40, 772, 9, "F1", textMuted);
  content += rect(390, 790, 165, 30, brandBlue);
  content += text("TAX INVOICE", 421, 800, 15, "F2", "1 1 1");
  content += text(`SI No: ${invoice.number}`, 405, 772, 10, "F2", textDark);
  content += text(`Date: ${invoice.date}`, 405, 756, 10, "F1", textDark);

  y = 720;
  content += rect(40, y - 90, 250, 105, "1 1 1", "0.8 0.8 0.85");
  content += rect(40, y, 250, 15, bgLight, "0.8 0.8 0.85");
  content += text("BILL TO", 46, y + 4, 9, "F2", textMuted);
  content += text(fit(customer.company || customer.name, 34), 50, y - 18, 11, "F2", textDark);
  content += text(`Contact: ${fit(customer.contactPerson, 28)}`, 50, y - 34, 9, "F1", textDark);
  content += text(`Phone: ${customer.phone}`, 50, y - 49, 9, "F1", textDark);
  content += text(`GSTIN: ${invoice.customerGstNumber || customer.gstNumber || "Unregistered"}`, 50, y - 64, 9, "F1", textDark);
  content += text(`City: ${customer.city}`, 50, y - 79, 9, "F1", textDark);

  content += rect(305, y - 90, 250, 105, "1 1 1", "0.8 0.8 0.85");
  content += rect(305, y, 250, 15, bgLight, "0.8 0.8 0.85");
  content += text("GST DETAILS", 311, y + 4, 9, "F2", textMuted);
  content += text(`Place of Supply: ${fit(invoice.placeOfSupply, 26)}`, 315, y - 18, 9, "F1", textDark);
  content += text(`Payment Terms: ${fit(invoice.paymentTerms, 26)}`, 315, y - 34, 9, "F1", textDark);
  content += text(`Due Date: ${invoice.dueDate || "-"}`, 315, y - 49, 9, "F1", textDark);
  content += text(`E-way Bill: ${invoice.ewayBillNumber || "-"}`, 315, y - 64, 9, "F1", textDark);
  content += text(fit(tallyStatus, 48), 315, y - 79, 9, "F2", isPushedToTally ? successGreen : warningRed);

  y = 590;
  content += rect(40, y, 515, 22, brandBlue);
  content += text("Item", 48, y + 8, 8, "F2", "1 1 1");
  content += text("HSN", 220, y + 8, 8, "F2", "1 1 1");
  content += text("Qty", 270, y + 8, 8, "F2", "1 1 1");
  content += text("Rate", 315, y + 8, 8, "F2", "1 1 1");
  content += text("Taxable", 375, y + 8, 8, "F2", "1 1 1");
  content += text("GST", 455, y + 8, 8, "F2", "1 1 1");
  content += text("Total", 510, y + 8, 8, "F2", "1 1 1");

  y -= 24;
  invoice.lines.slice(0, 10).forEach((item, index) => {
    if (index % 2 === 0) content += rect(40, y - 4, 515, 22, "0.985 0.99 1");
    content += text(fit(item.description, 30), 48, y + 3, 8, "F1", textDark);
    content += text(item.hsnCode || "-", 220, y + 3, 8, "F1", textDark);
    content += text(`${item.quantity} ${item.unit}`, 270, y + 3, 8, "F1", textDark);
    content += text(formatMoney(item.rate), 315, y + 3, 8, "F1", textDark);
    content += text(formatMoney(item.taxableValue), 375, y + 3, 8, "F1", textDark);
    content += text(`${item.gstRate}%`, 455, y + 3, 8, "F1", textDark);
    content += text(formatMoney(item.total), 510, y + 3, 8, "F1", textDark);
    y -= 23;
    content += line(40, y + 18, 555, y + 18);
  });

  y = Math.min(y - 20, 320);
  content += rect(330, y - 150, 225, 165, "1 1 1", "0.8 0.8 0.85");
  const summaryRows: Array<[string, number]> = [
    ["Subtotal", invoice.subTotal],
    ["Discount", invoice.discountTotal],
    ["Taxable", invoice.taxableTotal],
    ["CGST", invoice.cgstTotal],
    ["SGST", invoice.sgstTotal],
    ["IGST", invoice.igstTotal],
    ["Grand Total", invoice.grandTotal],
  ];
  let sy = y - 5;
  summaryRows.forEach(([label, amount], index) => {
    content += text(label, 345, sy, index === summaryRows.length - 1 ? 11 : 9, "F2", textDark);
    content += text(formatMoney(amount), 450, sy, index === summaryRows.length - 1 ? 11 : 9, "F2", index === summaryRows.length - 1 ? brandBlue : textDark);
    sy -= index === summaryRows.length - 2 ? 24 : 18;
  });

  content += text("Notes:", 40, y - 5, 10, "F2", textDark);
  content += text(fit(invoice.notes || "System generated sales invoice.", 70), 40, y - 22, 9, "F1", textMuted);
  content += text("Authorized Signatory", 405, y - 205, 10, "F2", textDark);
  content += text(fit(footerStatus, 84), 40, 62, 8, "F1", textMuted);
  content += text(`Generated on: ${invoice.createdAt.slice(0, 10)}`, 40, 48, 8, "F1", textMuted);

  const blob = new Blob([buildPdf(content)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${invoice.number}-sales-invoice.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
