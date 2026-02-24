import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PDFExport = ({ data, analysis }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('InsightX Analytics Report', 20, 20);

    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Summary Section
    doc.setFontSize(16);
    doc.text('Dataset Summary', 20, 50);
    doc.setFontSize(12);
    let yPos = 60;
    doc.text(`Total Rows: ${analysis.totalRows}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Columns: ${analysis.numColumns}`, 20, yPos);
    yPos += 10;
    doc.text(`Numeric Columns: ${analysis.numericColumns.length}`, 20, yPos);
    yPos += 10;

    // KPIs
    if (analysis.averages && analysis.averages.length > 0) {
      doc.setFontSize(14);
      doc.text('Key Metrics', 20, yPos + 10);
      yPos += 20;
      doc.setFontSize(12);
      analysis.averages.forEach(avg => {
        doc.text(`Average ${avg.column}: ${avg.average}`, 20, yPos);
        yPos += 10;
      });
    }

    if (analysis.maxValues && analysis.maxValues.length > 0) {
      analysis.maxValues.forEach(max => {
        doc.text(`Max ${max.column}: ${max.max}`, 20, yPos);
        yPos += 10;
      });
    }

    if (analysis.minValues && analysis.minValues.length > 0) {
      analysis.minValues.forEach(min => {
        doc.text(`Min ${min.column}: ${min.min}`, 20, yPos);
        yPos += 10;
      });
    }

    // Data Table
    doc.setFontSize(16);
    doc.text('Data Preview', 20, yPos + 10);
    yPos += 20;

    const columns = Object.keys(data[0]);
    const rows = data.slice(0, 20).map(row => columns.map(col => String(row[col] || '')));

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: yPos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('insightx-report.pdf');
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Export PDF Report</h5>
      </div>
      <div className="card-body">
        <button className="btn btn-success" onClick={generatePDF}>
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default PDFExport;