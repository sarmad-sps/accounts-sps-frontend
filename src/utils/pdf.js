import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadPdfFromElement(el, filename = "document.pdf") {
  if (!el) throw new Error("Missing element for PDF");

  // Capture element as canvas
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#fff" });
  const imgData = canvas.toDataURL("image/png");

  // A4 size in mm
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;  // A4 width in mm
  const pageHeight = 297; // A4 height in mm

  // Image dimensions in pixels
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = imgProps.width;
  const imgHeight = imgProps.height;

  // Scale image to fit full A4 height
  const scale = pageHeight / imgHeight;
  const pdfWidth = imgWidth * scale;
  const pdfHeight = pageHeight;

  // Center horizontally
  const x = (pageWidth - pdfWidth) / 2;
  const y = 0;

  pdf.addImage(imgData, "PNG", x, y, pdfWidth, pdfHeight);
  pdf.save(filename);
}
