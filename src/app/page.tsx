"use client";

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Footer } from "@/components/dashboard/footer";
import { useDashboardStore } from "@/store/dashboard-store";
import { OverviewView } from "@/components/dashboard/views/overview-view";
import { RecomendadorView } from "@/components/dashboard/views/recomendador-view";
import { TablaView } from "@/components/dashboard/views/tabla-view";
import { CalculadoraView } from "@/components/dashboard/views/calculadora-view";
import { ComparadorView } from "@/components/dashboard/views/comparador-view";
import { SaludView } from "@/components/dashboard/views/salud-view";
import { AnalyticsView } from "@/components/dashboard/views/analytics-view";
import { SimuladorRoiView } from "@/components/dashboard/views/simulador-roi-view";
import { QrGeneratorView } from "@/components/dashboard/views/qr-generator-view";
import { CalculadoraHardwareView } from "@/components/dashboard/views/calculadora-hardware-view";
import { EngineAnimationView } from "@/components/dashboard/views/engine-animation-view";
import { GlossaryDialog } from "@/components/dashboard/glossary-dialog";
import { HreTopsisExplained } from "@/components/dashboard/hre-topsis-explained";

export default function Home() {
  const activeView = useDashboardStore((s) => s.activeView);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      <Header />
      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-5 lg:py-6">
            {activeView === "overview" && <OverviewView />}
            {activeView === "recomendador" && <RecomendadorView />}
            {activeView === "tabla" && <TablaView />}
            {activeView === "calculadora" && <CalculadoraView />}
            {activeView === "calculadora-hardware" && <CalculadoraHardwareView />}
            {activeView === "comparador" && <ComparadorView />}
            {activeView === "salud" && <SaludView />}
            {activeView === "analytics" && <AnalyticsView />}
            {activeView === "simulador-roi" && <SimuladorRoiView />}
            {activeView === "qr-generator" && <QrGeneratorView />}
            {activeView === "engine-animation" && <EngineAnimationView />}
          </div>
        </main>
      </div>
      <Footer />

      {/* Global modals — full-screen dynamic, single X to close */}
      <GlossaryDialog />
      <HreTopsisExplained />
    </div>
  );
}
