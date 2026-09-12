/* ==========================================================================
   JZo Design Studio – Vorlagen
   Alle Maße in "Arbeits-Pixeln": Druck-Formate sind mit 150dpi gerechnet
   (mm * 5.905512), Social-Formate sind echte Pixel-Formate der Plattformen.
   Farben entsprechen den CSS-Variablen der jzoentertainment-Website.
   ========================================================================== */

const BRAND = {
  bg: "#000000",
  bgSoft: "#131313",
  bgCard: "#1a1a1a",
  border: "#2a2a2a",
  text: "#f2f2f0",
  textMuted: "#b3b0a8",
  silver1: "#f5f5f2",
  silver2: "#9a9a94",
  gold1: "#ffb35c",
  gold2: "#ff6a1a",
  font: "Segoe UI, Helvetica Neue, Arial, sans-serif"
};

const MM_TO_PX = 150 / 25.4; // 150dpi Arbeitsauflösung
function mm(v) { return Math.round(v * MM_TO_PX); }

const CATEGORIES = [
  { key: "flyer", label: "Flyer" },
  { key: "card", label: "Visitenkarten" },
  { key: "magazine", label: "Magazin-Seiten" },
  { key: "social", label: "Social Media Posts" },
  { key: "publisher", label: "Weitere Vorlagen" }
];

function goldFill(angle) {
  return { type: "linear", angle: angle || 90, colorStops: [
    { offset: 0, color: BRAND.gold1 },
    { offset: 1, color: BRAND.gold2 }
  ]};
}

const TEMPLATES = [
  // ---------------- FLYER ----------------
  {
    id: "flyer-a4-portrait",
    category: "flyer",
    name: "Foto & Video Flyer (A4 Hochformat)",
    unit: "mm", widthMM: 210, heightMM: 297,
    width: mm(210), height: mm(297),
    background: BRAND.bg,
    objects: [
      { type: "rect", left: 0, top: 0, width: mm(210), height: mm(220), fill: { type: "linear", angle: 90, colorStops: [
        { offset: 0, color: "rgba(255,122,26,0.16)" }, { offset: 1, color: "rgba(0,0,0,0)" } ] }, selectable: true },
      { type: "logo", left: 60, top: 46, width: 210 },
      { type: "image-placeholder", left: 0, top: 210, width: mm(210), height: 470, label: "+ Foto einfügen" },
      { type: "text", left: 70, top: 720, width: 1100, text: "IHR FOTO- & VIDEO-PROFI", fontSize: 52, fontWeight: 800, fill: BRAND.silver1 },
      { type: "text", left: 70, top: 800, width: 1100, text: "Hochzeiten · Events · Portraits · Videoschnitt", fontSize: 25, fontWeight: 600, fill: BRAND.gold1 },
      { type: "rect", left: 70, top: 862, width: 90, height: 6, rx: 3, ry: 3, fill: goldFill(0) },
      { type: "text", left: 70, top: 900, width: 1100, text: "Ich begleite Ihre Veranstaltung professionell mit Foto & Video – von der Aufnahme bis zum fertigen Ergebnis. Kontaktieren Sie mich für ein unverbindliches Angebot.", fontSize: 19, fontWeight: 400, fill: BRAND.textMuted, lineHeight: 1.5 },
      { type: "rect", left: 70, top: 1030, width: 230, height: 46, rx: 23, ry: 23, fill: "rgba(255,179,92,0.12)", stroke: "rgba(255,179,92,0.4)", strokeWidth: 1 },
      { type: "text", left: 90, top: 1044, width: 200, text: "ab 75 € / Std.", fontSize: 17, fontWeight: 700, fill: BRAND.gold1 },
      { type: "text", left: 70, top: 1600, width: 1100, text: "Jan Zoller\n0157 8 / 491 08 52\njzoentertainmet@outlook.com\n@JZoEntertainment", fontSize: 19, fontWeight: 500, fill: BRAND.textMuted, lineHeight: 1.6 },
      { type: "rect", left: 0, top: mm(297) - 14, width: mm(210), height: 14, fill: goldFill(0) }
    ]
  },
  {
    id: "flyer-a5-landscape",
    category: "flyer",
    name: "Event-Flyer (A5 Querformat)",
    unit: "mm", widthMM: 210, heightMM: 148,
    width: mm(210), height: mm(148),
    background: BRAND.bg,
    objects: [
      { type: "image-placeholder", left: 0, top: 0, width: mm(105), height: mm(148), label: "+ Foto einfügen" },
      { type: "rect", left: mm(105), top: 0, width: mm(105), height: mm(148), fill: BRAND.bgSoft },
      { type: "logo", left: mm(105) + 40, top: 36, width: 170 },
      { type: "text", left: mm(105) + 40, top: 150, width: 540, text: "EVENT-TITEL HIER", fontSize: 40, fontWeight: 800, fill: BRAND.silver1 },
      { type: "text", left: mm(105) + 40, top: 220, width: 540, text: "Datum · Uhrzeit · Ort", fontSize: 20, fontWeight: 700, fill: BRAND.gold1 },
      { type: "rect", left: mm(105) + 40, top: 264, width: 80, height: 5, rx: 2, ry: 2, fill: goldFill(0) },
      { type: "text", left: mm(105) + 40, top: 296, width: 540, text: "Kurze Beschreibung des Events – was erwartet die Gäste, worauf können sie sich freuen.", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.5 },
      { type: "rect", left: mm(105) + 40, top: 420, width: 220, height: 44, rx: 22, ry: 22, fill: goldFill(0) },
      { type: "text", left: mm(105) + 66, top: 434, width: 200, text: "Jetzt anfragen", fontSize: 16, fontWeight: 700, fill: "#1a0d02" },
      { type: "text", left: mm(105) + 40, top: mm(148) - 70, width: 540, text: "Jan Zoller · 0157 8 / 491 08 52 · @JZoEntertainment", fontSize: 13, fill: BRAND.textMuted }
    ]
  },

  // ---------------- VISITENKARTE ----------------
  {
    id: "card-classic",
    category: "card",
    name: "Visitenkarte – Klassisch",
    unit: "mm", widthMM: 85, heightMM: 55,
    width: mm(85), height: mm(55),
    background: BRAND.bg,
    objects: [
      { type: "logo", left: mm(85) / 2 - 90, top: 34, width: 180 },
      { type: "text", left: 0, top: 142, width: mm(85), text: "Jan Zoller", fontSize: 24, fontWeight: 800, fill: BRAND.silver1, textAlign: "center" },
      { type: "text", left: 0, top: 176, width: mm(85), text: "Foto & Video – JZo Entertainment", fontSize: 13, fontWeight: 500, fill: BRAND.textMuted, textAlign: "center" },
      { type: "rect", left: mm(85) / 2 - 35, top: 208, width: 70, height: 3, rx: 1.5, ry: 1.5, fill: goldFill(0) },
      { type: "text", left: 0, top: 230, width: mm(85), text: "0157 8 / 491 08 52  ·  jzoentertainmet@outlook.com", fontSize: 10.5, fill: BRAND.textMuted, textAlign: "center" },
      { type: "text", left: 0, top: 252, width: mm(85), text: "@JZoEntertainment", fontSize: 10.5, fill: BRAND.gold1, textAlign: "center" }
    ]
  },
  {
    id: "card-accent",
    category: "card",
    name: "Visitenkarte – Modern",
    unit: "mm", widthMM: 85, heightMM: 55,
    width: mm(85), height: mm(55),
    background: BRAND.bg,
    objects: [
      { type: "rect", left: 0, top: 0, width: 14, height: mm(55), fill: goldFill(90) },
      { type: "logo", left: 40, top: 28, width: 150 },
      { type: "text", left: 40, top: 138, width: 420, text: "Jan Zoller", fontSize: 21, fontWeight: 800, fill: BRAND.silver1 },
      { type: "text", left: 40, top: 168, width: 420, text: "Foto & Video – JZo Entertainment", fontSize: 11.5, fill: BRAND.textMuted },
      { type: "text", left: 40, top: 210, width: 420, text: "0157 8 / 491 08 52\njzoentertainmet@outlook.com\n@JZoEntertainment", fontSize: 11, fill: BRAND.textMuted, lineHeight: 1.7 }
    ]
  },

  // ---------------- MAGAZIN ----------------
  {
    id: "magazine-article",
    category: "magazine",
    name: "Magazin-Seite – Artikel",
    unit: "mm", widthMM: 210, heightMM: 297,
    width: mm(210), height: mm(297),
    background: BRAND.bg,
    objects: [
      { type: "logo", left: 70, top: 50, width: 130 },
      { type: "text", left: mm(210) - 340, top: 76, width: 270, text: "AUSGABE 01 · 2026", fontSize: 13, fontWeight: 700, fill: BRAND.gold1, textAlign: "right" },
      { type: "rect", left: 70, top: 150, width: mm(210) - 140, height: 1, fill: BRAND.border },
      { type: "text", left: 70, top: 190, width: 1100, text: "ÜBERSCHRIFT DES ARTIKELS", fontSize: 54, fontWeight: 800, fill: BRAND.silver1 },
      { type: "text", left: 70, top: 270, width: 1100, text: "Kurzer Teaser-Satz, der Lust macht weiterzulesen.", fontSize: 20, fill: BRAND.textMuted },
      { type: "image-placeholder", left: 70, top: 340, width: mm(210) - 140, height: 480, label: "+ Bild einfügen" },
      { type: "text", left: 70, top: 860, width: 520, text: "Hier steht der erste Absatz des Artikeltexts. Text einfach anklicken und durch den eigenen Inhalt ersetzen.", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.6 },
      { type: "text", left: 650, top: 860, width: 520, text: "Und hier der zweite Absatz, z. B. für eine zweite Spalte mit weiteren Informationen.", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.6 },
      { type: "rect", left: 70, top: 1150, width: 4, height: 140, fill: goldFill(0) },
      { type: "text", left: 100, top: 1160, width: 1050, text: "„Ein passendes Zitat oder eine starke Aussage aus dem Artikel.“", fontSize: 24, fontWeight: 600, fontStyle: "italic", fill: BRAND.silver1 },
      { type: "text", left: mm(210) - 200, top: mm(297) - 90, width: 130, text: "Seite 1", fontSize: 13, fill: BRAND.textMuted, textAlign: "right" }
    ]
  },

  // ---------------- SOCIAL MEDIA ----------------
  {
    id: "social-ig-post",
    category: "social",
    name: "Instagram Post (1080×1080)",
    unit: "px", width: 1080, height: 1080,
    background: BRAND.bg,
    objects: [
      { type: "rect", left: 0, top: 0, width: 1080, height: 1080, fill: { type: "radial", colorStops: [
        { offset: 0, color: "rgba(255,122,26,0.14)" }, { offset: 1, color: "rgba(0,0,0,0)" } ] } },
      { type: "logo", left: 440, top: 70, width: 200 },
      { type: "text", left: 90, top: 440, width: 900, text: "DEIN TEXT HIER", fontSize: 64, fontWeight: 800, fill: BRAND.silver1, textAlign: "center" },
      { type: "text", left: 90, top: 540, width: 900, text: "Kurzer Unterzeile-Text", fontSize: 28, fontWeight: 600, fill: BRAND.gold1, textAlign: "center" },
      { type: "text", left: 90, top: 970, width: 900, text: "@JZoEntertainment", fontSize: 20, fill: BRAND.textMuted, textAlign: "center" }
    ]
  },
  {
    id: "social-ig-story",
    category: "social",
    name: "Instagram Story (1080×1920)",
    unit: "px", width: 1080, height: 1920,
    background: BRAND.bg,
    objects: [
      { type: "rect", left: 0, top: 0, width: 1080, height: 10, fill: goldFill(0) },
      { type: "logo", left: 440, top: 60, width: 200 },
      { type: "image-placeholder", left: 60, top: 300, width: 960, height: 1100, label: "+ Bild einfügen" },
      { type: "text", left: 60, top: 1450, width: 960, text: "DEIN TEXT HIER", fontSize: 52, fontWeight: 800, fill: BRAND.silver1, textAlign: "center" },
      { type: "text", left: 60, top: 1530, width: 960, text: "Kurzer Unterzeile-Text", fontSize: 26, fontWeight: 600, fill: BRAND.gold1, textAlign: "center" },
      { type: "text", left: 60, top: 1830, width: 960, text: "@JZoEntertainment", fontSize: 20, fill: BRAND.textMuted, textAlign: "center" }
    ]
  },
  {
    id: "social-fb-post",
    category: "social",
    name: "Facebook Post (1200×630)",
    unit: "px", width: 1200, height: 630,
    background: BRAND.bg,
    objects: [
      { type: "image-placeholder", left: 0, top: 0, width: 600, height: 630, label: "+ Bild einfügen" },
      { type: "rect", left: 600, top: 0, width: 600, height: 630, fill: BRAND.bgSoft },
      { type: "logo", left: 640, top: 50, width: 160 },
      { type: "text", left: 640, top: 200, width: 520, text: "DEIN TEXT HIER", fontSize: 40, fontWeight: 800, fill: BRAND.silver1 },
      { type: "text", left: 640, top: 270, width: 520, text: "Kurzer Unterzeile-Text", fontSize: 20, fontWeight: 600, fill: BRAND.gold1 },
      { type: "text", left: 640, top: 540, width: 520, text: "@JZoEntertainment", fontSize: 15, fill: BRAND.textMuted }
    ]
  },
  {
    id: "social-yt-thumb",
    category: "social",
    name: "YouTube Thumbnail (1280×720)",
    unit: "px", width: 1280, height: 720,
    background: BRAND.bg,
    objects: [
      { type: "image-placeholder", left: 640, top: 0, width: 640, height: 720, label: "+ Bild einfügen" },
      { type: "text", left: 60, top: 220, width: 560, text: "GROSSER\nTITEL", fontSize: 68, fontWeight: 900, fill: BRAND.silver1, lineHeight: 1.05 },
      { type: "rect", left: 60, top: 460, width: 260, height: 10, rx: 5, ry: 5, fill: goldFill(0) },
      { type: "logo", left: 60, top: 40, width: 150 }
    ]
  },

  // ---------------- WEITERE VORLAGEN (Publisher-Stil) ----------------
  {
    id: "brochure-trifold",
    category: "publisher",
    name: "Broschüre (3 Spalten, Falzblatt)",
    unit: "mm", widthMM: 297, heightMM: 210,
    width: mm(297), height: mm(210),
    background: BRAND.bg,
    objects: (() => {
      const w = mm(297), h = mm(210), panel = w / 3;
      return [
        { type: "rect", left: panel, top: 0, width: panel, height: h, fill: BRAND.bgSoft },
        { type: "rect", left: panel - 1, top: 0, width: 2, height: h, fill: BRAND.border },
        { type: "rect", left: panel * 2 - 1, top: 0, width: 2, height: h, fill: BRAND.border },
        // Panel 1: Titel / Cover
        { type: "logo", left: 50, top: 60, width: 170 },
        { type: "text", left: 50, top: h - 420, width: panel - 100, text: "IHR TITEL HIER", fontSize: 42, fontWeight: 800, fill: BRAND.silver1 },
        { type: "text", left: 50, top: h - 320, width: panel - 100, text: "Kurzer Untertitel für die Titelseite", fontSize: 18, fontWeight: 600, fill: BRAND.gold1 },
        { type: "rect", left: 50, top: h - 260, width: 70, height: 5, rx: 2, ry: 2, fill: goldFill(0) },
        // Panel 2: Über uns
        { type: "text", left: panel + 50, top: 60, width: panel - 100, text: "ÜBER UNS", fontSize: 15, fontWeight: 700, fill: BRAND.gold1 },
        { type: "text", left: panel + 50, top: 100, width: panel - 100, text: "Kurzer Absatz über das Angebot – Text anklicken und durch eigenen Inhalt ersetzen.", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.6 },
        { type: "image-placeholder", left: panel + 50, top: 320, width: panel - 100, height: h - 400, label: "+ Bild einfügen" },
        // Panel 3: Kontakt
        { type: "text", left: panel * 2 + 50, top: 60, width: panel - 100, text: "KONTAKT", fontSize: 15, fontWeight: 700, fill: BRAND.gold1 },
        { type: "text", left: panel * 2 + 50, top: 100, width: panel - 100, text: "Jan Zoller\n0157 8 / 491 08 52\njzoentertainmet@outlook.com\n@JZoEntertainment", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.8 },
        { type: "rect", left: panel * 2 + 50, top: h - 110, width: panel - 100, height: 46, rx: 23, ry: 23, fill: goldFill(0) },
        { type: "text", left: panel * 2 + 76, top: h - 96, width: panel - 150, text: "Jetzt anfragen", fontSize: 16, fontWeight: 700, fill: "#1a0d02" }
      ];
    })()
  },
  {
    id: "newsletter",
    category: "publisher",
    name: "Newsletter (A4)",
    unit: "mm", widthMM: 210, heightMM: 297,
    width: mm(210), height: mm(297),
    background: BRAND.bg,
    objects: [
      { type: "logo", left: 70, top: 50, width: 150 },
      { type: "text", left: mm(210) - 380, top: 80, width: 310, text: "NEWSLETTER · 2026", fontSize: 14, fontWeight: 700, fill: BRAND.gold1, textAlign: "right" },
      { type: "rect", left: 70, top: 150, width: mm(210) - 140, height: 1, fill: BRAND.border },
      { type: "text", left: 70, top: 185, width: 1100, text: "Neuigkeiten von JZo Entertainment", fontSize: 38, fontWeight: 800, fill: BRAND.silver1 },
      // Block 1
      { type: "image-placeholder", left: 70, top: 280, width: 320, height: 220, label: "+ Bild" },
      { type: "text", left: 420, top: 290, width: 750, text: "Kommendes Event", fontSize: 22, fontWeight: 700, fill: BRAND.gold1 },
      { type: "text", left: 420, top: 330, width: 750, text: "Kurzer Text zum nächsten Termin – Datum, Ort und was die Gäste erwartet.", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.6 },
      { type: "rect", left: 70, top: 540, width: mm(210) - 140, height: 1, fill: BRAND.border },
      // Block 2
      { type: "image-placeholder", left: 70, top: 580, width: 320, height: 220, label: "+ Bild" },
      { type: "text", left: 420, top: 590, width: 750, text: "Neues Angebot", fontSize: 22, fontWeight: 700, fill: BRAND.gold1 },
      { type: "text", left: 420, top: 630, width: 750, text: "Beschreibung des neuen Angebots oder Pakets – Preis, Leistungen, Vorteile.", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.6 },
      { type: "rect", left: 70, top: 840, width: mm(210) - 140, height: 1, fill: BRAND.border },
      // Block 3
      { type: "image-placeholder", left: 70, top: 880, width: 320, height: 220, label: "+ Bild" },
      { type: "text", left: 420, top: 890, width: 750, text: "Aktuelles Projekt", fontSize: 22, fontWeight: 700, fill: BRAND.gold1 },
      { type: "text", left: 420, top: 930, width: 750, text: "Kurzer Rückblick auf ein aktuelles Foto-/Video-Projekt.", fontSize: 16, fill: BRAND.textMuted, lineHeight: 1.6 },
      { type: "text", left: 70, top: mm(297) - 100, width: mm(210) - 140, text: "Jan Zoller · 0157 8 / 491 08 52 · jzoentertainmet@outlook.com · @JZoEntertainment", fontSize: 13, fill: BRAND.textMuted, textAlign: "center" }
    ]
  },
  {
    id: "invitation-card",
    category: "publisher",
    name: "Einladungskarte (A6)",
    unit: "mm", widthMM: 105, heightMM: 148,
    width: mm(105), height: mm(148),
    background: BRAND.bg,
    objects: [
      { type: "logo", left: mm(105) / 2 - 85, top: 60, width: 170 },
      { type: "text", left: 0, top: 230, width: mm(105), text: "WIR LADEN HERZLICH EIN", fontSize: 14, fontWeight: 700, fill: BRAND.gold1, textAlign: "center" },
      { type: "text", left: 40, top: 270, width: mm(105) - 80, text: "Event-Titel", fontSize: 36, fontWeight: 800, fill: BRAND.silver1, textAlign: "center" },
      { type: "rect", left: mm(105) / 2 - 35, top: 360, width: 70, height: 4, rx: 2, ry: 2, fill: goldFill(0) },
      { type: "text", left: 40, top: 400, width: mm(105) - 80, text: "Datum · Uhrzeit\nOrt der Veranstaltung", fontSize: 18, fill: BRAND.textMuted, textAlign: "center", lineHeight: 1.6 },
      { type: "text", left: 40, top: mm(148) - 130, width: mm(105) - 80, text: "Über eine Rückmeldung freuen wir uns:", fontSize: 12, fill: BRAND.textMuted, textAlign: "center" },
      { type: "text", left: 40, top: mm(148) - 100, width: mm(105) - 80, text: "0157 8 / 491 08 52", fontSize: 15, fontWeight: 600, fill: BRAND.gold1, textAlign: "center" }
    ]
  },
  {
    id: "greeting-card",
    category: "publisher",
    name: "Grußkarte (quadratisch)",
    unit: "mm", widthMM: 148, heightMM: 148,
    width: mm(148), height: mm(148),
    background: BRAND.bg,
    objects: [
      { type: "image-placeholder", left: 0, top: 0, width: mm(148), height: Math.round(mm(148) * 0.62), label: "+ Bild einfügen" },
      { type: "rect", left: 0, top: Math.round(mm(148) * 0.62), width: mm(148), height: mm(148) - Math.round(mm(148) * 0.62), fill: BRAND.bgSoft },
      { type: "text", left: 40, top: Math.round(mm(148) * 0.62) + 40, width: mm(148) - 80, text: "Herzlichen Glückwunsch", fontSize: 30, fontWeight: 800, fill: BRAND.silver1, textAlign: "center" },
      { type: "logo", left: mm(148) / 2 - 60, top: mm(148) - 90, width: 120 }
    ]
  }
];
