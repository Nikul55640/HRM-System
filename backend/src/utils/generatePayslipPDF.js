import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export const generatePayslipPDF = async (payslip) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const html = `
    <html>
    <body>
      <h2>Payslip - ${payslip.monthName} ${payslip.year}</h2>
      <p>Employee: ${payslip.employeeId.personalInfo.firstName}</p>
      <h3>Earnings</h3>
      <pre>${JSON.stringify(payslip.earnings, null, 2)}</pre>

      <h3>Deductions</h3>
      <pre>${JSON.stringify(payslip.deductions, null, 2)}</pre>

      <h1>Net Pay: ₹${payslip.netPay}</h1>
    </body>
    </html>
  `;

  await page.setContent(html);

  const filePath = path.join("uploads", `payslip-${Date.now()}.pdf`);
  await page.pdf({ path: filePath, format: "A4" });

  await browser.close();

  return filePath;
};
