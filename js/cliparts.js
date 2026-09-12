/* ==========================================================================
   JZo Design Studio – Clipart-Sammlung
   Einfache Vektor-Formen (SVG-Pfade), die frei eingefärbt und skaliert
   werden können. "kind" bestimmt, wie das Objekt gebaut wird.
   ========================================================================== */

const CLIPART_CATEGORIES = [
  { key: "formen", label: "Formen" },
  { key: "sterne", label: "Sterne & Symbole" },
  { key: "rahmen", label: "Rahmen & Linien" },
  { key: "sprech", label: "Sprechblasen & Pfeile" }
];

const CLIPARTS = [
  // ---------- Formen ----------
  {
    id: "triangle", category: "formen", label: "Dreieck", kind: "path",
    viewBox: [100, 100], path: "M50 8 L92 88 L8 88 Z"
  },
  {
    id: "hexagon", category: "formen", label: "Sechseck", kind: "path",
    viewBox: [100, 100], path: "M95 50 L72.5 89 L27.5 89 L5 50 L27.5 11 L72.5 11 Z"
  },
  {
    id: "diamond", category: "formen", label: "Raute", kind: "path",
    viewBox: [100, 100], path: "M50 5 L95 50 L50 95 L5 50 Z"
  },

  // ---------- Sterne & Symbole ----------
  {
    id: "star", category: "sterne", label: "Stern", kind: "path",
    viewBox: [100, 100], path: "M50 5 L61 39 L98 39 L68 60 L79 95 L50 74 L21 95 L32 60 L2 39 L39 39 Z"
  },
  {
    id: "heart", category: "sterne", label: "Herz", kind: "path",
    viewBox: [100, 100], path: "M50 88 C50 88 10 60 10 35 C10 20 22 10 35 10 C42 10 48 14 50 20 C52 14 58 10 65 10 C78 10 90 20 90 35 C90 60 50 88 50 88 Z"
  },
  {
    id: "bolt", category: "sterne", label: "Blitz", kind: "path",
    viewBox: [100, 100], path: "M55 2 L18 55 L45 55 L38 98 L85 42 L55 42 Z"
  },
  {
    id: "check", category: "sterne", label: "Häkchen", kind: "path", strokeOnly: true,
    viewBox: [100, 100], path: "M20 55 L42 78 L82 25"
  },
  {
    id: "cross", category: "sterne", label: "Kreuz", kind: "path", strokeOnly: true,
    viewBox: [100, 100], path: "M20 20 L80 80 M80 20 L20 80"
  },

  // ---------- Rahmen & Linien ----------
  { id: "ring", category: "rahmen", label: "Kreis-Rahmen", kind: "ring" },
  { id: "frame", category: "rahmen", label: "Gestrichelter Rahmen", kind: "frame" },
  { id: "dots", category: "rahmen", label: "Punkte-Reihe", kind: "dots" },

  // ---------- Sprechblasen & Pfeile ----------
  {
    id: "speech", category: "sprech", label: "Sprechblase", kind: "path",
    viewBox: [100, 80], path: "M15 8 H85 A8 8 0 0 1 93 16 V48 A8 8 0 0 1 85 56 H40 L22 74 V56 H15 A8 8 0 0 1 7 48 V16 A8 8 0 0 1 15 8 Z"
  },
  {
    id: "arrow", category: "sprech", label: "Pfeil", kind: "path",
    viewBox: [120, 80], path: "M5 30 H70 V10 L115 40 L70 70 V50 H5 Z"
  },
  {
    id: "ribbon", category: "sprech", label: "Banner", kind: "path",
    viewBox: [140, 60], path: "M15 10 L5 30 L15 50 H125 L135 30 L125 10 Z"
  }
];
