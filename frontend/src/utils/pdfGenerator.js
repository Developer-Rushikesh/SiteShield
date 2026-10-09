import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures an HTML element by ID and downloads it as a PDF report.
 * @param {string} elementId - The ID of the HTML element to export.
 * @param {string} filename - The name of the downloaded file.
 */
export const exportElementToPdf = async (elementId, filename = 'Monitor_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const canvasWidthMm = imgWidth * ratio;
    const canvasHeightMm = imgHeight * ratio;

    let heightLeft = canvasHeightMm;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, canvasWidthMm, canvasHeightMm);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - canvasHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, canvasWidthMm, canvasHeightMm);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Failed to generate PDF report. Please try again.');
  }
};
