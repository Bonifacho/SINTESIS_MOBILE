// src/utils/pdfExport.ts
// Generador de reportes PDF usando expo-print + expo-sharing (Rúbrica §6)
// Genera un HTML estilizado, lo convierte a PDF y lo comparte via sheet nativo.

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors } from '@/src/theme/colors';

interface MetricRow {
  label: string;
  value: string | number;
  color?: string;
}

interface AttemptRow {
  examId: number;
  studentName?: string;
  score: number;
  passed: boolean;
  date: string;
  correct: number;
  total: number;
}

interface PDFReportData {
  title: string;
  subtitle: string;
  generatedBy: string;
  metrics: MetricRow[];
  attempts: AttemptRow[];
}

function buildHTML(data: PDFReportData): string {
  const metricsHtml = data.metrics
    .map(
      (m) => `
      <div class="metric-item">
        <div class="metric-value" style="color: ${m.color || Colors.dark}">${m.value}</div>
        <div class="metric-label">${m.label}</div>
      </div>`
    )
    .join('');

  const attemptsHtml = data.attempts
    .map(
      (a) => `
      <tr>
        ${a.studentName ? `<td>${a.studentName}</td>` : ''}
        <td>Examen #${a.examId}</td>
        <td style="color: ${a.passed ? Colors.success : Colors.error}; font-weight: 700">${a.score}/100</td>
        <td>${a.correct}/${a.total}</td>
        <td>${a.passed ? '✅ Aprobado' : '❌ Reprobado'}</td>
        <td>${a.date}</td>
      </tr>`
    )
    .join('');

  const hasStudentCol = data.attempts.some((a) => a.studentName);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: ${Colors.dark}; padding: 32px; background: #fff; }
    .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid ${Colors.primary}; padding-bottom: 16px; }
    .header h1 { font-size: 24px; color: ${Colors.primary}; margin-bottom: 4px; }
    .header p { font-size: 13px; color: ${Colors.gray}; }
    .metrics-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
    .metric-item { flex: 1 1 30%; background: ${Colors.background}; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid ${Colors.window}; }
    .metric-value { font-size: 28px; font-weight: 800; }
    .metric-label { font-size: 11px; color: ${Colors.gray}; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    h2 { font-size: 16px; margin-bottom: 12px; color: ${Colors.dark}; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: ${Colors.primary}; color: #fff; padding: 10px 8px; text-align: left; font-weight: 600; }
    td { padding: 8px; border-bottom: 1px solid ${Colors.window}; }
    tr:nth-child(even) td { background: ${Colors.background}; }
    .footer { margin-top: 32px; text-align: center; font-size: 10px; color: ${Colors.gray}; border-top: 1px solid ${Colors.window}; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <p>${data.subtitle}</p>
    <p>Generado por: ${data.generatedBy} · ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="metrics-grid">${metricsHtml}</div>

  ${data.attempts.length > 0 ? `
  <h2>Detalle de Evaluaciones</h2>
  <table>
    <thead>
      <tr>
        ${hasStudentCol ? '<th>Estudiante</th>' : ''}
        <th>Examen</th>
        <th>Nota</th>
        <th>Aciertos</th>
        <th>Estado</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>${attemptsHtml}</tbody>
  </table>
  ` : ''}

  <div class="footer">SÍNTESIS · Plataforma de Aprendizaje</div>
</body>
</html>`;
}

export async function generateAndSharePDF(data: PDFReportData): Promise<void> {
  const html = buildHTML(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Reporte - ${data.title}`,
      UTI: 'com.adobe.pdf',
    });
  } else {
    throw new Error('El dispositivo no soporta compartir archivos.');
  }
}

export type { PDFReportData, MetricRow, AttemptRow };
