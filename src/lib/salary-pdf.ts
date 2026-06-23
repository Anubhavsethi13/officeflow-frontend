import type { EmployeeRecord, SalarySlip } from "./hr-store";

const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatMoney = (value: number) => `INR ${numberFormat.format(Math.round(value))}`;
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

const rows = (items: Array<[string, number]>) => items.filter(([, amount]) => amount > 0);

export function downloadSalarySlipPdf({
  employee,
  slip,
  showStructure,
}: {
  employee: EmployeeRecord;
  slip: SalarySlip;
  showStructure: boolean;
}) {
  const earnings = rows([
    ["Basic Pay", slip.basic],
  ]);
  const deductions = rows([
    ["Professional Tax", slip.tax],
    ["Advance Recovered", slip.advanceRecovered],
  ]);
  const totalDeductions = slip.deductions + slip.tax + slip.advanceRecovered;
  
  // Colors
  const brandBlue = "0.0 0.46 0.78"; // Approx #0077c8
  const brandGreen = "0.49 0.75 0.18"; // Approx #7dc02e
  const textDark = "0.1 0.1 0.15";
  const textMuted = "0.4 0.4 0.45";
  const bgLight = "0.95 0.96 0.98";

  let content = "";
  let y = 842;
  
  // Header Banner
  content += rect(0, 750, 595, 92, bgLight);
  
  y = 800;
  // Company Name
  content += text("AARKAY TECHNO CONSULTANTS PVT. LTD.", 40, y, 16, "F2", brandBlue);
  y -= 16;
  content += text("Registered Office / Payroll Department", 40, y, 10, "F1", textMuted);
  
  // Salary Slip Title
  content += rect(390, 785, 165, 30, brandBlue);
  content += text("SALARY SLIP", 423, 795, 16, "F2", "1 1 1");
  content += text(`Month: ${slip.month}`, 440, 770, 11, "F2", textDark);

  y = 720;
  // Employee Details Section
  content += rect(40, y - 80, 515, 95, "1 1 1", "0.8 0.8 0.85");
  content += rect(40, y, 515, 15, bgLight);
  content += text("EMPLOYEE DETAILS", 45, y + 4, 9, "F2", textMuted);

  y -= 20;
  content += text("Employee Name:", 50, y, 10, "F2", textDark);
  content += text(employee.name, 150, y, 10, "F1", textDark);
  content += text("Employee Code:", 300, y, 10, "F2", textDark);
  content += text(employee.employeeCode, 400, y, 10, "F1", textDark);

  y -= 20;
  content += text("Designation:", 50, y, 10, "F2", textDark);
  content += text(employee.designation, 150, y, 10, "F1", textDark);
  content += text("Date of Joining:", 300, y, 10, "F2", textDark);
  content += text(employee.joiningDate ?? "N/A", 400, y, 10, "F1", textDark);

  y -= 20;
  content += text("Bank Name:", 50, y, 10, "F2", textDark);
  content += text("Not specified", 150, y, 10, "F1", textDark);
  content += text("Bank A/C No:", 300, y, 10, "F2", textDark);
  content += text("Not specified", 400, y, 10, "F1", textDark);

  y -= 40;

  if (showStructure) {
    // Earnings & Deductions Tables
    
    // Earnings Table (Left)
    content += rect(40, y - 180, 250, 195, "1 1 1", "0.8 0.8 0.85");
    content += rect(40, y, 250, 15, bgLight, "0.8 0.8 0.85");
    content += text("EARNINGS", 45, y + 4, 9, "F2", textMuted);
    content += text("AMOUNT", 230, y + 4, 9, "F2", textMuted);

    let ey = y - 20;
    earnings.forEach(([label, amount]) => {
      content += text(label, 45, ey, 10, "F1", textDark);
      content += text(formatMoney(amount), 220, ey, 10, "F1", textDark);
      ey -= 20;
    });

    // Deductions Table (Right)
    content += rect(305, y - 180, 250, 195, "1 1 1", "0.8 0.8 0.85");
    content += rect(305, y, 250, 15, bgLight, "0.8 0.8 0.85");
    content += text("DEDUCTIONS", 310, y + 4, 9, "F2", textMuted);
    content += text("AMOUNT", 495, y + 4, 9, "F2", textMuted);

    let dy = y - 20;
    deductions.forEach(([label, amount]) => {
      content += text(label, 310, dy, 10, "F1", textDark);
      content += text(formatMoney(amount), 490, dy, 10, "F1", textDark);
      dy -= 20;
    });

    y -= 180;
    
    // Totals
    content += rect(40, y, 250, 25, "1 1 1", "0.8 0.8 0.85");
    content += text("Gross Earnings", 45, y + 8, 10, "F2", textDark);
    content += text(formatMoney(slip.gross), 220, y + 8, 10, "F2", brandGreen);

    content += rect(305, y, 250, 25, "1 1 1", "0.8 0.8 0.85");
    content += text("Total Deductions", 310, y + 8, 10, "F2", textDark);
    content += text(formatMoney(totalDeductions), 490, y + 8, 10, "F2", "0.8 0.1 0.1");
    
    y -= 15;
  }

  y -= 30;
  // Net Pay Highlight
  content += rect(40, y - 40, 515, 55, bgLight, brandBlue);
  content += text("NET PAY", 55, y - 15, 14, "F2", textMuted);
  content += text(formatMoney(slip.netPay), 415, y - 20, 20, "F2", brandBlue);
  content += text("Amount transferred to employee's registered bank account.", 55, y - 30, 9, "F1", textMuted);

  y -= 80;
  content += text("This is a system generated salary slip and does not require a physical signature.", 40, y, 9, "F1", textMuted);
  content += text(`Generated on: ${slip.generatedAt}`, 40, y - 12, 9, "F1", textMuted);

  const blob = new Blob([buildPdf(content)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${employee.employeeCode}-${slip.month}-salary-slip.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
