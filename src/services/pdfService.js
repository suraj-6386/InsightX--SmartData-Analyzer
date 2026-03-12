import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = async (data, chartImages, analysisStats) => {
  try {
    const doc = new jsPDF();
    const primaryRed = [153, 27, 27]; 

    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text('InsightX Analytics Report', 20, 50);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Professional Intelligence Data Insights', 20, 65);

    doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.setLineWidth(1.5);
    doc.line(20, 75, 190, 75);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 95);
    doc.text(`Dataset Scale: ${data.length.toLocaleString()} rows × ${Object.keys(data[0]).length} columns`, 20, 105);

    doc.addPage();
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text('📊 Dataset Overview', 20, 30);
    doc.setTextColor(0, 0, 0);

    let yPos = 50;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics:', 20, yPos);
    yPos += 12;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records: ${data.length.toLocaleString()}`, 30, yPos);
    yPos += 10;
    doc.text(`Total Dimensions: ${Object.keys(data[0]).length}`, 30, yPos);
    yPos += 10;

    const approxMemory = (data.length * Object.keys(data[0]).length * 8) / 1024;
    doc.text(`Estimated Memory Footprint: ~${approxMemory.toFixed(1)} KB`, 30, yPos);
    yPos += 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Column Taxonomy:', 20, yPos);
    yPos += 12;

    const columns = Object.keys(data[0]);
    const columnInfo = columns.map(col => {
      let dataType = 'string';
      const sampleValues = data.slice(0, Math.min(100, data.length)).map(row => row[col]);
      const numericValues = sampleValues.filter(val => !isNaN(Number(val)) && val !== '');
      if (numericValues.length > sampleValues.length * 0.8) dataType = 'numeric';
      
      const missingCount = data.filter(row => {
        const val = row[col];
        return val === null || val === undefined || val === '' || val === 'null' || val === 'NULL';
      }).length;

      return [col, dataType, missingCount, ((missingCount / data.length) * 100).toFixed(1) + '%'];
    });

    doc.autoTable({
      head: [['Column Name', 'Type', 'Null Count', '% Null']],
      body: columnInfo,
      startY: yPos,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: primaryRed, textColor: 255 },
      alternateRowStyles: { fillColor: [250, 240, 240] },
      margin: { left: 20, right: 20 },
    });

    if (analysisStats) {
      doc.addPage();
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
      doc.text('🎭 Tone & Style Analysis', 20, 30);
      doc.setTextColor(0, 0, 0);
      yPos = 50;

      const toneData = Object.entries(analysisStats).map(([col, s]) => [
        col,
        s.skewnessLabel || 'N/A',
        s.kurtosisLabel || 'N/A',
        s.skewness?.toFixed(3) || '0.000',
        s.kurtosis?.toFixed(3) || '0.000'
      ]);

      doc.autoTable({
        head: [['Dimension', 'Distribution Tone', 'Tail Style', 'Skewness', 'Kurtosis']],
        body: toneData,
        startY: yPos,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: primaryRed, textColor: 255 },
        alternateRowStyles: { fillColor: [250, 240, 240] },
      });
    }

    if (chartImages && chartImages.length > 0) {
      chartImages.forEach((imgData, idx) => {
        doc.addPage();
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
        doc.text(`📉 Visual Intelligence — Chart ${idx + 1}`, 20, 30);
        
        try {
          doc.addImage(imgData, 'PNG', 15, 50, 180, 100, undefined, 'FAST');
        } catch (e) {
          console.error('Error adding image to PDF:', e);
        }
      });
    }

    doc.addPage();
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text('📋 Data Exploration Preview', 20, 30);
    doc.setTextColor(0, 0, 0);

    doc.autoTable({
      head: [columns],
      body: data.slice(0, 25).map(row => columns.map(col => String(row[col] || ''))),
      startY: 50,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: primaryRed, textColor: 255 },
      alternateRowStyles: { fillColor: [250, 240, 240] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('InsightX Intelligence - Data Analysis Platform', 20, doc.internal.pageSize.height - 15);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 15);
    }

    doc.save(`insightx-pro-report-${new Date().getTime()}.pdf`);

  } catch (error) {
    console.error('PDF Generation Engine Failure:', error);
    throw error;
  }
};
