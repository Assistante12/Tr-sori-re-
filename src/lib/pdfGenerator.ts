import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PurchaseSheet, Settings, ReportSummary } from '../types';
import { formatAriary, formatDateFR } from './utils';

export function generatePurchaseSheetPDF(
  sheet: PurchaseSheet,
  settings: Settings,
  action: 'save' | 'print' | 'blob' = 'save'
): jsPDF | string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);

  const sessionLabel = sheet.session === 'MATIN' ? 'MATINA MATIN' : 'HARIVA (APRÈS-MIDI)';

  // 1. Organization & System Header
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(settings.organization_name || 'ONG F4', margin, 10);

  // 2. Main Title (Centered)
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const mainTitle = `FICHE D'ACHATS — ${sessionLabel}`;
  doc.text(mainTitle, pageWidth / 2, 17, { align: 'center' });

  // 3. Document Metadata (Left: N° Fiche, Right: Daty)
  const metaY = 24;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  // N° Fiche with clean dotted style
  doc.text(`N° Fiche : ${sheet.sheet_number}`, margin, metaY);

  // Daty with clean dotted style
  const formattedDate = formatDateFR(sheet.date);
  doc.text(`Daty : ${formattedDate}`, pageWidth - margin, metaY, { align: 'right' });

  // 4. Build Table Rows (up to 20 numbered rows just like the physical sheet)
  const items = sheet.items || [];
  const maxRows = Math.max(20, items.length);
  const tableBody: any[][] = [];

  for (let i = 0; i < maxRows; i++) {
    if (i < items.length) {
      const it = items[i];
      const isanyText = it.unit && it.unit !== 'pièce' && it.unit !== '-'
        ? `${it.quantity} ${it.unit}`
        : `${it.quantity}`;

      tableBody.push([
        (i + 1).toString(),
        it.designation,
        isanyText,
        formatAriary(it.unit_price, true),
        formatAriary(it.total, true),
      ]);
    } else {
      // Empty lined ledger row matching the paper layout
      tableBody.push([
        (i + 1).toString(),
        '',
        '',
        '',
        '',
      ]);
    }
  }

  // 5. Append Bottom Summary Rows directly into the Table structure (Exact match with the paper photo)
  tableBody.push([
    {
      content: 'VOLA TEO AM-PELATANANA :',
      colSpan: 3,
      styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, fillColor: [248, 250, 252], textColor: [15, 23, 42] },
    },
    {
      content: formatAriary(sheet.cash_received),
      colSpan: 2,
      styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5, fillColor: [248, 250, 252], textColor: [15, 23, 42] },
    },
  ]);

  tableBody.push([
    {
      content: 'TOTAL VOLA MIVOAKA :',
      colSpan: 3,
      styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, fillColor: [254, 242, 242], textColor: [185, 28, 28] },
    },
    {
      content: formatAriary(sheet.total_expenses),
      colSpan: 2,
      styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5, fillColor: [254, 242, 242], textColor: [185, 28, 28] },
    },
  ]);

  tableBody.push([
    {
      content: 'RESTE :',
      colSpan: 3,
      styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5, fillColor: [240, 253, 244], textColor: [21, 128, 61] },
    },
    {
      content: formatAriary(sheet.balance),
      colSpan: 2,
      styles: { halign: 'right', fontStyle: 'bold', fontSize: 10, fillColor: [240, 253, 244], textColor: [21, 128, 61] },
    },
  ]);

  // 6. Draw Table
  autoTable(doc, {
    startY: metaY + 4,
    head: [[
      'N°',
      "Anaran'ny zavatra vidiana rehetra (Désignation)",
      'Isany',
      'Vidiny',
      'Totaly',
    ]],
    body: tableBody,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.25,
      lineColor: [51, 65, 85],
    },
    styles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 1.8,
      lineWidth: 0.2,
      lineColor: [100, 116, 139],
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10, fontStyle: 'bold' },
      1: { halign: 'left', fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 26 },
      3: { halign: 'right', cellWidth: 30, fontStyle: 'normal' },
      4: { halign: 'right', cellWidth: 34, fontStyle: 'bold' },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTableY = (doc as any).lastAutoTable?.finalY || 240;

  // 7. Signatures Area
  const sigY = Math.min(lastTableY + 8, pageHeight - 32);
  const colWidth = (contentWidth - 20) / 2;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  // Trésorière Header
  doc.text('Signature Trésorière :', margin, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`(${settings.treasurer_name || 'La Trésorière'})`, margin, sigY + 4);

  // Embed Trésorière Signature if present
  if (sheet.signature_treasurer) {
    try {
      doc.addImage(sheet.signature_treasurer, 'PNG', margin + 4, sigY + 5, 35, 14);
    } catch (e) {
      console.warn('Could not embed treasurer signature into PDF', e);
    }
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, sigY + 20, margin + colWidth, sigY + 20);

  // Responsable Header
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Signature Responsable :', margin + colWidth + 20, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`(${settings.manager_name || 'Le Responsable'})`, margin + colWidth + 20, sigY + 4);

  // Embed Responsable Signature if present
  if (sheet.signature_manager) {
    try {
      doc.addImage(sheet.signature_manager, 'PNG', margin + colWidth + 24, sigY + 5, 35, 14);
    } catch (e) {
      console.warn('Could not embed manager signature into PDF', e);
    }
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + colWidth + 20, sigY + 20, pageWidth - margin, sigY + 20);

  // 8. Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Application Trésorerie · Fiche N° ${sheet.sheet_number} · ${formatDateFR(sheet.date)}`, margin, pageHeight - 4);

  if (action === 'save') {
    const filename = `Fiche_Achats_${sheet.sheet_number.replace(/\//g, '-')}_${sheet.session}.pdf`;
    doc.save(filename);
  } else if (action === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }

  return doc;
}

export function generateReportPDF(
  summary: ReportSummary,
  settings: Settings,
  action: 'save' | 'print' = 'save'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.organization_name || 'ONG F4', margin, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('RAPPORT FINANCIER DES ACHATS ET DÉPENSES', margin, 18);
  doc.text(`Période : ${summary.periodLabel}`, margin, 23);

  // Summary Metrics Banner
  const metricY = 34;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, metricY, pageWidth - (margin * 2), 20, 2, 2, 'FD');

  const colW = (pageWidth - (margin * 2)) / 3;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);

  // Metric 1: Cash Received
  doc.text('TOTAL VOLA NOMENA', margin + 6, metricY + 7);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatAriary(summary.totalCashReceived), margin + 6, metricY + 14);

  // Metric 2: Expenses
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DÉPENSES', margin + colW + 6, metricY + 7);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(formatAriary(summary.totalExpenses), margin + colW + 6, metricY + 14);

  // Metric 3: Reste
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL RESTE', margin + (colW * 2) + 6, metricY + 7);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  if (summary.totalBalance >= 0) {
    doc.setTextColor(21, 128, 61);
  } else {
    doc.setTextColor(185, 28, 28);
  }
  doc.text(formatAriary(summary.totalBalance), margin + (colW * 2) + 6, metricY + 14);

  // Table Data
  const tableData = summary.breakdown.map((row) => [
    formatDateFR(row.date),
    row.matinExpense > 0 ? formatAriary(row.matinExpense) : '-',
    row.apresMidiExpense > 0 ? formatAriary(row.apresMidiExpense) : '-',
    formatAriary(row.totalExpense),
    formatAriary(row.totalCash),
    formatAriary(row.balance),
  ]);

  autoTable(doc, {
    startY: metricY + 26,
    head: [['Date', 'Achats Matin', 'Achats Après-midi', 'Total Dépenses', 'Vola Nomena', 'Reste']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const footerText = `Rapport Trésorerie · Généré le ${new Date().toLocaleDateString('fr-FR')} · ${settings.organization_name}`;
  doc.text(footerText, margin, pageHeight - 6);

  if (action === 'save') {
    doc.save(`Rapport_Tresorerie_${summary.periodLabel.replace(/\s+/g, '_')}.pdf`);
  } else if (action === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }

  return doc;
}
