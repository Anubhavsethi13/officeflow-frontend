const pdfEscape = (value: string) => value.replace(/[\\()]/g, "\\$&");

const text = (value: string, x: number, y: number, size = 10, font = "F1", color = "0 0 0") =>
  `q ${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET Q\n`;

const line = (x1: number, y1: number, x2: number, y2: number, color = "0 0 0 RG") => 
  `q ${color} 1 w ${x1} ${y1} m ${x2} ${y2} l S Q\n`;

const rect = (x: number, y: number, w: number, h: number, fillRgb?: string, strokeRgb?: string) => {
  let cmd = `q ${x} ${y} ${w} ${h} re `;
  if (fillRgb && strokeRgb) cmd += `${fillRgb} rg ${strokeRgb} RG B`;
  else if (fillRgb) cmd += `${fillRgb} rg f`;
  else if (strokeRgb) cmd += `${strokeRgb} RG S`;
  else cmd += `S`;
  return cmd + ` Q\n`;
};

const circle = (cx: number, cy: number, r: number) => {
  const c = r * 0.551915024494;
  return `q 0 0 0 RG 1 w ${cx} ${cy - r} m ` +
    `${cx + c} ${cy - r} ${cx + r} ${cy - c} ${cx + r} ${cy} c ` +
    `${cx + r} ${cy + c} ${cx + c} ${cy + r} ${cx} ${cy + r} c ` +
    `${cx - c} ${cy + r} ${cx - r} ${cy + c} ${cx - r} ${cy} c ` +
    `${cx - r} ${cy - c} ${cx - c} ${cy - r} ${cx} ${cy - r} c S Q\n`;
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

export function downloadOMRSheetPdf(title: string, questionCount = 50) {
  let content = "";
  let y = 842;
  
  // Header Banner
  content += rect(0, 780, 595, 62, "0.95 0.96 0.98");
  
  y = 810;
  content += text("AARKAY TECHNO CONSULTANTS PVT. LTD.", 40, y, 16, "F2", "0.0 0.46 0.78");
  y -= 16;
  content += text("OMR Answer Sheet - Examination Center", 40, y, 10, "F1", "0.4 0.4 0.45");
  
  // Title
  y -= 40;
  content += text(`Exam: ${title}`, 40, y, 14, "F2", "0.1 0.1 0.15");
  content += text(`Questions: ${questionCount}`, 430, y, 10, "F2", "0.1 0.1 0.15");

  y -= 30;
  content += rect(40, y - 50, 515, 60, "1 1 1", "0.8 0.8 0.85");
  content += text("Candidate Name:", 50, y - 15, 10, "F2");
  content += line(140, y - 15, 300, y - 15);
  content += text("Date:", 350, y - 15, 10, "F2");
  content += line(380, y - 15, 500, y - 15);

  content += text("Candidate ID:", 50, y - 35, 10, "F2");
  content += line(140, y - 35, 300, y - 35);
  content += text("Signature:", 350, y - 35, 10, "F2");
  content += line(410, y - 35, 500, y - 35);

  y -= 80;
  content += text("Instructions: Darken the circles completely. Do not use tick marks.", 40, y, 10, "F1", "0.4 0.4 0.45");

  y -= 30;
  
  // Draw OMR bubbles for the selected paper count.
  const columns = questionCount > 50 ? 3 : 2;
  const qPerCol = Math.ceil(questionCount / columns);
  const colWidth = columns === 3 ? 185 : 250;
  const rowGap = qPerCol > 22 ? 18 : 22;
  
  for (let i = 0; i < questionCount; i++) {
    const col = Math.floor(i / qPerCol);
    const row = i % qPerCol;
    
    const bx = 40 + col * colWidth;
    const by = y - row * rowGap;
    
    content += text(`${(i + 1).toString().padStart(2, '0')}.`, bx, by - 3, 10, "F2");
    
    for (let o = 0; o < 4; o++) {
      const cx = bx + 30 + o * 25;
      const cy = by;
      content += circle(cx, cy, 6);
      content += text(String.fromCharCode(65 + o), cx - 3, cy - 3, 8, "F1");
    }
  }

  const blob = new Blob([buildPdf(content)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `OMR-Sheet.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
