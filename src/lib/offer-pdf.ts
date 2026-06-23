import type { Offer } from "./hiring-store";
import { CANDIDATES } from "./hiring-data";

const pdfEscape = (value: string) => value.replace(/[\\()]/g, "\\$&");

const text = (value: string, x: number, y: number, size = 10, font = "F1", color = "0 0 0") =>
  `q ${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET Q\n`;

const rect = (x: number, y: number, w: number, h: number, fillRgb?: string, strokeRgb?: string) => {
  let cmd = `q ${x} ${y} ${w} ${h} re `;
  if (fillRgb && strokeRgb) cmd += `${fillRgb} rg ${strokeRgb} RG B`;
  else if (fillRgb) cmd += `${fillRgb} rg f`;
  else if (strokeRgb) cmd += `${strokeRgb} RG S`;
  else cmd += `S`;
  return cmd + ` Q\n`;
};

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

export function downloadOfferPdf(offer: Offer, candidateName: string, candidateRole: string) {
  let content = "";
  let y = 842;
  
  content += rect(0, 750, 595, 92, "0.95 0.96 0.98");
  y = 800;
  content += text("AARKAY TECHNO CONSULTANTS PVT. LTD.", 40, y, 16, "F2", "0.0 0.46 0.78");
  y -= 16;
  content += text("Registered Office / HR Department", 40, y, 10, "F1", "0.4 0.4 0.45");
  
  y -= 60;
  content += text(`Date: ${new Date().toLocaleDateString()}`, 40, y, 10, "F1");
  content += text(`Offer ID: ${offer.id}`, 400, y, 10, "F1");
  
  y -= 40;
  content += text(`Dear ${candidateName},`, 40, y, 12, "F2");
  
  y -= 30;
  content += text(`We are pleased to offer you the position of ${candidateRole} at`, 40, y, 11, "F1");
  y -= 15;
  content += text("AARKAY TECHNO CONSULTANTS PVT. LTD.", 40, y, 11, "F2");

  y -= 30;
  content += text("Your compensation details and joining schedule are as follows:", 40, y, 11, "F1");

  y -= 40;
  content += rect(40, y - 80, 515, 100, "0.98 0.98 0.98", "0.8 0.8 0.85");
  
  content += text("Annual CTC:", 50, y, 10, "F2");
  content += text(`INR ${offer.salary.toLocaleString()}`, 150, y, 10, "F1");

  content += text("Expected Joining:", 50, y - 20, 10, "F2");
  content += text(`${offer.joiningDate}`, 150, y - 20, 10, "F1");

  content += text("Location:", 50, y - 40, 10, "F2");
  content += text(`Head Office`, 150, y - 40, 10, "F1");

  y -= 120;
  content += text("Please sign and return a copy of this letter as a token of your acceptance.", 40, y, 11, "F1");

  y -= 60;
  content += text("Authorized Signatory", 40, y, 10, "F2");
  content += text("HR Department", 40, y - 15, 10, "F1");

  content += text("Accepted By:", 400, y, 10, "F2");
  content += text(candidateName, 400, y - 15, 10, "F1");

  const blob = new Blob([buildPdf(content)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Offer-Letter-${candidateName.replace(/\s+/g, '-')}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
