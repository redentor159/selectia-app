export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function exportToPDF(title: string, contentHtml: string) {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) {
    alert("Permití las ventanas emergentes para exportar a PDF.");
    return;
  }
  const ts = new Date().toLocaleString("es-PE");
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    @page { margin: 18mm 14mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif;
      color: #0b0c0e;
      background: #fff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.45;
    }
    .header {
      border-bottom: 2px solid #0b0c0e;
      padding-bottom: 8px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .header h1 { font-size: 16pt; margin: 0; letter-spacing: -0.01em; }
    .header .ts { font-size: 9pt; color: #555; }
    h2 {
      font-size: 12pt;
      margin-top: 22px;
      margin-bottom: 8px;
      letter-spacing: -0.005em;
      page-break-after: avoid;
    }
    p.meta { font-size: 9pt; color: #555; margin: 2px 0 8px; }
    .muted { color: #555; font-size: 9pt; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      page-break-inside: avoid;
      margin-bottom: 12px;
    }
    th, td {
      border: 1px solid #c8ccd2;
      padding: 5px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f4f5f7;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.04em;
    }
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
    td.best { background: #e6f4ea !important; color: #1a7a3a; font-weight: 600; }
    td.worst { background: #fce8e6 !important; color: #a50e0e; }
    .best { color: #1a7a3a; font-weight: 600; }
    .worst { color: #a50e0e; }
    tr:nth-child(even) td { background: #fafbfc; }
    .footer {
      margin-top: 28px;
      padding-top: 8px;
      border-top: 1px solid #c8ccd2;
      font-size: 8pt;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(title)}</h1>
    <span class="ts">Generado: ${ts}</span>
  </div>
  ${contentHtml}
  <div class="footer">
    SelectIA · Exportado automáticamente · ${ts}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
        setTimeout(function() { window.close(); }, 250);
      }, 200);
    };
  </script>
</body>
</html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}