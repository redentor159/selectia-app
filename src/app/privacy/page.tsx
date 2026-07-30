export const metadata = {
  title: "Privacy Policy — SelectIA",
  description: "Política de privacidad de SelectIA",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
        <p><strong>Última actualización:</strong> Julio 2026</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Datos que recolectamos</h2>
        <p>SelectIA NO requiere registro de usuarios. NO recolectamos datos personales (nombre, email, teléfono). No usamos cookies de tracking.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Datos en el navegador</h2>
        <p>Las siguientes preferencias se guardan en tu navegador (localStorage) y NUNCA se envían a un servidor:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Perfil seleccionado (A-F)</li>
          <li>Moneda seleccionada (PEN, USD, BRL, etc.)</li>
          <li>Tipo de cambio personalizado (si lo configuras)</li>
          <li>Modo de operación (MYPE, Calidad, Equilibrado)</li>
          <li>Tema (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro)</li>
          <li>Filtros guardados en la Tabla Maestra</li>
        </ul>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. APIs de terceros</h2>
        <p>SelectIA consume datos de 13 APIs públicas en el servidor (no en tu navegador):</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Artificial Analysis (métricas de modelos)</li>
          <li>LiteLLM (precios)</li>
          <li>Arena AI (ratings Elo)</li>
          <li>BenchLM (scores por categoría)</li>
          <li>ZeroEval (métricas de producción)</li>
          <li>HuggingFace Hub (datos de repositorios)</li>
          <li>Open ER-API (tipos de cambio)</li>
          <li>Otras 6 fuentes (Groq, OpenRouter, etc.)</li>
        </ul>
        <p>Tu navegador NO se conecta directamente a estas APIs. Todo se procesa en el servidor.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Analytics</h2>
        <p>SelectIA NO usa Google Analytics, Facebook Pixel, ni ningún otro tracker. No sabemos quién eres ni qué haces.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">5. Datos de modelos</h2>
        <p>Los datos de modelos de IA (precios, métricas, benchmarks) se actualizan diariamente mediante un cron job. Estos datos son públicos y no contienen información personal.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">6. Contacto</h2>
        <p>Para preguntas sobre privacidad, abre un issue en GitHub.</p>
        <p className="pt-4"><a href="/" className="text-[var(--brand-primary)] underline">← Volver a SelectIA</a></p>
      </div>
    </main>
  );
}
