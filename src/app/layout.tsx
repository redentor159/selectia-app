import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/query-provider";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const firaCode = Fira_Code({
  variable: "--font-fira",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SelectIA — Command Center de Modelos IA",
  description:
    "Compara 275+ modelos de IA desde 9 fuentes en tiempo real. Motor HRE-TOPSIS (8 criterios), 21 monedas, glosario de 174 términos. Open source.",
  keywords: [
    "IA",
    "modelos de IA",
    "GPT",
    "Claude",
    "Gemini",
    "comparador IA",
    "precios IA",
    "ingeniería industrial",
    "HRE-TOPSIS",
    "MYPE",
    "Perú",
  ],
  authors: [{ name: "SelectIA" }],
  icons: {
    icon: "/favicon-scale.svg",
    apple: "/favicon-scale.svg",
  },
  metadataBase: new URL("https://selectia-app.vercel.app"),
  openGraph: {
    title: "SelectIA — Command Center de Modelos IA",
    description:
      "El Consumer Reports de la IA, en español y en Soles, para la MYPE metalmecánica.",
    type: "website",
    locale: "es_PE",
    siteName: "SelectIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "SelectIA — Command Center de Modelos IA",
    description:
      "Compara 275+ modelos de IA en español y en Soles. Motor HRE-TOPSIS, multi-moneda, análisis por perfil.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Apply persisted theme before React hydration to prevent flash.
            Default theme is "light-gray" (ChatGPT-style clean light).
            Reads from localStorage (zustand persist key: ai-dashboard-store). */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var DEFAULT_THEME = 'light-gray';
            var VALID = ['dark','light','dark-gray','light-gray','blanco-puro','negro-puro'];
            try {
              var raw = localStorage.getItem('ai-dashboard-store');
              if (raw) {
                var state = JSON.parse(raw);
                var theme = state.state && state.state.theme;
                if (theme && VALID.indexOf(theme) >= 0) {
                  document.documentElement.classList.add(theme);
                } else {
                  document.documentElement.classList.add(DEFAULT_THEME);
                }
              } else {
                document.documentElement.classList.add(DEFAULT_THEME);
              }
            } catch (e) {
              document.documentElement.classList.add(DEFAULT_THEME);
            }
          })();
        ` }} />
      </head>
      <body
        className={`${inter.variable} ${firaCode.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js?token=eb20fac7-6362-4b31-a670-123b03366646"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
