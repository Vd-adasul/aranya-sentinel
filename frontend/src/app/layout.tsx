import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Aranya Sentinel — Editorial Field Intelligence & Forest Conservation",
  description:
    "Archival survey atlas meets contemporary geospatial operations software. Sentinel-2 multispectral surveillance, Google Dynamic World 10m probabilities, and zero-shot drone computer vision for legal forest defense.",
  keywords: [
    "Aranya Sentinel",
    "Forest Intelligence",
    "Sentinel-2",
    "Dynamic World",
    "Grounding DINO",
    "SAM 2",
    "Field Atlas",
    "Cadastral Enforcement",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-canvas text-ink-900 selection:bg-signal selection:text-bone-50">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
