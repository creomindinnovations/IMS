import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function captureElementToPdf(element, filename = 'document.pdf') {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [794, 1123] });
  pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
  const blob = pdf.output('blob');
  return { blob, pdf };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
