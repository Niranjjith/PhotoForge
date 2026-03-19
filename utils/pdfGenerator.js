import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePDFBill = async (payment, user) => {
  return new Promise((resolve, reject) => {
    try {
      // Create bills directory if it doesn't exist
      const billsDir = path.join(__dirname, "..", "public", "bills");
      if (!fs.existsSync(billsDir)) {
        fs.mkdirSync(billsDir, { recursive: true });
      }

      const fileName = `bill_${payment.orderId}_${Date.now()}.pdf`;
      const filePath = path.join(billsDir, fileName);
      const relativePath = `/bills/${fileName}`; // Use absolute path from public

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });

      // Pipe to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).text("GraphyHub", 50, 50, { align: "center" });
      doc.fontSize(16).text("Premium Provider Registration Bill", 50, 80, { align: "center" });
      doc.moveDown();

      // Bill Details
      doc.fontSize(12);
      doc.text(`Bill Number: ${payment.orderId}`, 50, 130);
      doc.text(`Date: ${new Date(payment.completedAt).toLocaleDateString()}`, 50, 150);
      doc.text(`Time: ${new Date(payment.completedAt).toLocaleTimeString()}`, 50, 170);
      doc.moveDown();

      // Customer Details
      doc.fontSize(14).text("Customer Details:", 50, 210);
      doc.fontSize(12);
      doc.text(`Name: ${user.name}`, 50, 235);
      doc.text(`Email: ${user.email}`, 50, 255);
      doc.moveDown();

      // Payment Details
      doc.fontSize(14).text("Payment Details:", 50, 295);
      doc.fontSize(12);
      doc.text(`Payment ID: ${payment.paymentId}`, 50, 320);
      doc.text(`PayPal Order ID: ${payment.paypalOrderId}`, 50, 340);
      doc.text(`Amount: $${payment.amount} USD (₹10 INR)`, 50, 360);
      doc.text(`Status: ${payment.status.toUpperCase()}`, 50, 380);
      doc.moveDown();

      // Service Details
      doc.fontSize(14).text("Service Details:", 50, 420);
      doc.fontSize(12);
      doc.text("Service: Premium Provider Registration", 50, 445);
      doc.text("Description: One-time registration fee for GraphyHub creator account", 50, 465);
      doc.text("Includes: Full access to provider dashboard, portfolio management, booking system", 50, 485);
      doc.moveDown();

      // Footer
      doc.fontSize(10)
        .fillColor("gray")
        .text("Thank you for choosing GraphyHub!", 50, doc.page.height - 100, { align: "center" })
        .text("This is a computer-generated bill. No signature required.", 50, doc.page.height - 80, { align: "center" })
        .text("For support, contact: support@GraphyHub.com", 50, doc.page.height - 60, { align: "center" });

      // Finalize PDF
      doc.end();

      stream.on("finish", () => {
        resolve(relativePath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

