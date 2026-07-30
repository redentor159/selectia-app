import type { MetadataRoute } from "next";

/**
 * Sitemap dinámico — Next.js lo sirve en /sitemap.xml automáticamente.
 * PRD implícito: SEO para indexación en buscadores.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://selectia.vercel.app";
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#recomendador`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#tabla`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#calculadora`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#comparador`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
}
