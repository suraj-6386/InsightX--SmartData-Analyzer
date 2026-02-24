import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = async (data, charts) => {
  try {
    const doc = new jsPDF();

    // Title Page
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('InsightX Analytics Report', 20, 50);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Professional Data Analytics Dashboard', 20, 70);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 90);
    doc.text(`Dataset: ${data.length.toLocaleString()} rows × ${Object.keys(data[0]).length} columns`, 20, 105);

    // Dataset Information Page
    doc.addPage();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('📊 Dataset Information', 20, 30);
    doc.setTextColor(0, 0, 0);

    let yPos = 50;

    // Basic info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview:', 20, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Rows: ${data.length.toLocaleString()}`, 30, yPos);
    yPos += 10;
    doc.text(`Total Columns: ${Object.keys(data[0]).length}`, 30, yPos);
    yPos += 10;

    // Approximate memory usage
    const approxMemory = (data.length * Object.keys(data[0]).length * 8) / 1024;
    doc.text(`Approximate Memory Usage: ~${approxMemory.toFixed(1)} KB`, 30, yPos);
    yPos += 20;

    // Column details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Column Details:', 20, yPos);
    yPos += 15;

    const columns = Object.keys(data[0]);
    const columnInfo = columns.map(col => {
      let dataType = 'object';
      let missingCount = 0;

      const sampleValues = data.slice(0, Math.min(100, data.length)).map(row => row[col]);
      const numericValues = sampleValues.filter(val => !isNaN(Number(val)) && val !== '');
      const dateValues = sampleValues.filter(val => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && val !== '';
      });

      if (numericValues.length > sampleValues.length * 0.8) {
        dataType = 'numeric';
      } else if (dateValues.length > sampleValues.length * 0.8) {
        dataType = 'date';
      }

      missingCount = data.filter(row => {
        const val = row[col];
        return val === null || val === undefined || val === '' || val === 'null' || val === 'NULL';
      }).length;

      return [col, dataType, missingCount, ((missingCount / data.length) * 100).toFixed(1) + '%'];
    });

    doc.autoTable({
      head: [['Column', 'Data Type', 'Missing', '% Missing']],
      body: columnInfo,
      startY: yPos,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
    });

    // Statistics Page
    doc.addPage();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('📈 Dataset Statistics', 20, 30);
    doc.setTextColor(0, 0, 0);

    yPos = 50;

    // Get numeric columns
    const numericColumns = columns.filter(col => {
      return data.every(row => {
        const val = row[col];
        return val !== null && val !== undefined && val !== '' && !isNaN(Number(val));
      });
    });

    if (numericColumns.length > 0) {
      const statistics = numericColumns.map(col => {
        const values = data.map(row => Number(row[col])).filter(val => !isNaN(val)).sort((a, b) => a - b);
        const count = values.length;

        if (count === 0) return null;

        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / count;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
        const std = Math.sqrt(variance);

        const min = Math.min(...values);
        const max = Math.max(...values);

        const getPercentile = (arr, p) => {
          const index = (p / 100) * (arr.length - 1);
          const lower = Math.floor(index);
          const upper = Math.ceil(index);
          const weight = index % 1;

          if (upper >= arr.length) return arr[arr.length - 1];
          return arr[lower] * (1 - weight) + arr[upper] * weight;
        };

        const percentile25 = getPercentile(values, 25);
        const percentile50 = getPercentile(values, 50);
        const percentile75 = getPercentile(values, 75);

        return [
          col,
          count,
          mean.toFixed(2),
          std.toFixed(2),
          min.toFixed(2),
          percentile25.toFixed(2),
          percentile50.toFixed(2),
          percentile75.toFixed(2),
          max.toFixed(2)
        ];
      }).filter(stat => stat !== null);

      doc.autoTable({
        head: [['Column', 'Count', 'Mean', 'Std', 'Min', '25%', '50%', '75%', 'Max']],
        body: statistics,
        startY: yPos,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 },
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No numeric columns found for statistical analysis.', 20, yPos);
    }

    // Data Preview Page
    doc.addPage();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('📋 Data Preview', 20, 30);
    doc.setTextColor(0, 0, 0);

    yPos = 50;

    const previewRows = data.slice(0, 20).map(row =>
      columns.map(col => String(row[col] || ''))
    );

    doc.autoTable({
      head: [columns],
      body: previewRows,
      startY: yPos,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
    });

    // Charts Page
    if (charts && charts.length > 0) {
      doc.addPage();
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('📊 Dashboard Charts', 20, 30);
      doc.setTextColor(0, 0, 0);

      yPos = 50;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Charts Created: ${charts.length}`, 20, yPos);
      yPos += 20;

      charts.forEach((chart, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${chart.title}`, 20, yPos);
        yPos += 12;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Type: ${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}`, 30, yPos);
        yPos += 8;
        doc.text(`X-Axis: ${chart.xAxis || 'Not set'}`, 30, yPos);
        yPos += 8;
        doc.text(`Y-Axis: ${chart.yAxis || 'Not set'}`, 30, yPos);
        yPos += 8;
        if (chart.legend) {
          doc.text(`Legend: ${chart.legend}`, 30, yPos);
          yPos += 8;
        }
        if (chart.aggregation && chart.aggregation !== 'sum') {
          doc.text(`Aggregation: ${chart.aggregation}`, 30, yPos);
          yPos += 8;
        }
        yPos += 10;
      });
    }

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by InsightX - Professional Data Analytics Platform', 20, doc.internal.pageSize.height - 20);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 50, doc.internal.pageSize.height - 20);
      doc.text(new Date().toLocaleString(), doc.internal.pageSize.width - 50, doc.internal.pageSize.height - 15);
    }

    // Save the PDF
    doc.save(`insightx-report-${new Date().toISOString().split('T')[0]}.pdf`);

    // Show success message
    alert('✅ PDF Report generated successfully!');

  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('❌ Error generating PDF report. Please try again.');
  }
};