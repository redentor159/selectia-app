export const metadata = {
  title: "Terms of Service — SelectIA",
  description: "Términos de servicio de SelectIA",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
        <p><strong>Última actualización:</strong> Julio 2026</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Aceptación</h2>
        <p>Al usar SelectIA, aceptas estos términos. Si no los aceptas, no uses la aplicación.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Naturaleza del servicio</h2>
        <p>SelectIA es una herramienta educativa de comparación de modelos de IA. NO es un servicio profesional de consultoría. Las recomendaciones son generadas por un algoritmo (HRE-TOPSIS) y pueden no ser óptimas para tu caso específico.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Precisión de datos</h2>
        <p>Los datos de precios, métricas y benchmarks provienen de APIs públicas de terceros. Pueden estar desactualizados o ser inexactos. SelectIA no garantiza la precisión de los datos.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Limitación de responsabilidad</h2>
        <p>SelectIA NO se responsabiliza por:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Decisiones de compra basadas en las recomendaciones</li>
          <li>Datos incorrectos o desactualizados</li>
          <li>Fallas en las APIs de terceros</li>
          <li>Pérdidas financieras por el uso de modelos recomendados</li>
          <li>Disponibilidad del servicio (puede caer sin previo aviso)</li>
        </ul>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">5. Uso comercial</h2>
        <p>SelectIA es open source bajo licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente, incluyendo uso comercial.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">6. Privacidad</h2>
        <p>Ver nuestra <a href="/privacy" className="text-[var(--brand-primary)] underline">Privacy Policy</a> para detalles sobre datos.</p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">7. Cambios</h2>
        <p>Estos términos pueden cambiar sin previo aviso. La fecha de última actualización indica la versión vigente.</p>
        <p className="pt-4"><a href="/" className="text-[var(--brand-primary)] underline">← Volver a SelectIA</a></p>
      </div>
    </main>
  );
}
