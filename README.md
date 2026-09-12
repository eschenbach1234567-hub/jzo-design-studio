# JZo Design Studio

Ein eigenes kleines Design-Programm für Jan – im Stil von Microsoft
Publisher/Canva, aber im Look der jzoentertainment-Website. Läuft direkt
im Browser, keine Installation nötig.

## Was das Programm kann

- Vorlagen für **Flyer**, **Visitenkarten**, **Magazin-Seiten** und
  **Social-Media-Posts** (Instagram Post/Story, Facebook, YouTube-Thumbnail)
- Texte und eigene Fotos hinzufügen, verschieben, Farbe/Schrift ändern
- Ebenen-Reihenfolge, Rückgängig/Wiederholen, Zoom
- Eigene Entwürfe speichern und später weiterbearbeiten
- Export als **PNG**, **JPEG** oder **PDF** (inkl. Druckqualität für
  Druckereien)

## Wie du es online nutzt

1. Öffne die Adresse deiner GitHub-Pages-Seite für dieses Projekt (siehe
   unten, wie du sie einschaltest).
2. Wähl oben eine Vorlage aus (Flyer, Visitenkarte, Magazin oder Social
   Media).
3. Klick auf Text, um ihn zu bearbeiten. Klick doppelt auf ein
   gestricheltes Feld ("+ Bild einfügen"), um dein eigenes Foto
   hochzuladen.
4. Über die rechte Seitenleiste kannst du Farbe, Schriftgröße, Ebenen
   usw. anpassen.
5. Oben rechts: **Speichern** (bleibt in diesem Browser gespeichert,
   erscheint dann auf der Startseite unter "Meine Projekte") oder
   **Exportieren** (lädt die Datei als PNG/JPEG/PDF herunter).

## Wichtig zu wissen

- **Nur für dich gedacht:** Es gibt keinen Login/Passwortschutz. Die
  Adresse ist zwar nicht auf deiner Website verlinkt, aber technisch
  trotzdem für jeden mit dem Link erreichbar. Teile den Link also nicht
  öffentlich (z. B. nicht auf Instagram posten).
- **Gespeicherte Projekte liegen nur in deinem Browser** (nicht in der
  Cloud). Das heißt: Wenn du den Browser wechselst oder den
  Browser-Speicher löschst, sind die Projekte weg. Nutze deshalb bei
  wichtigen Entwürfen den Button **"Als Datei sichern"** bei "Meine
  Projekte" – das lädt eine Sicherungsdatei herunter, die du später über
  **"Projekt importieren"** wieder einspielen kannst (auch auf einem
  anderen Gerät).
- Für den professionellen Druck bei einer Druckerei: beim Export
  **PDF + Druckqualität** wählen.

## GitHub Pages einschalten (einmalig, dauert 1 Minute)

Genau wie bei deiner Hauptwebsite:

1. Geh zu `https://github.com/eschenbach1234567-hub/jzo-design-studio`
2. Oben auf **Settings** klicken.
3. Links im Menü auf **Pages** klicken.
4. Bei "Branch" **main** auswählen, Ordner **/ (root)** lassen, auf
   **Save** klicken.
5. Nach ein bis zwei Minuten erscheint oben die Adresse, unter der die
   Seite erreichbar ist (etwas wie
   `https://eschenbach1234567-hub.github.io/jzo-design-studio/`).

## Technischer Hintergrund (für später, falls Code geändert wird)

- Reines HTML/CSS/JavaScript, keine Server-Komponente, keine Build-Schritte.
- Zeichenfläche: [Fabric.js](http://fabricjs.com/) (liegt lokal unter
  `vendor/fabric.min.js`, keine Internetverbindung zu Drittanbietern
  nötig).
- PDF-Export: [jsPDF](https://github.com/parallax/jsPDF) (`vendor/jspdf.umd.min.js`).
- Vorlagen liegen in `js/templates.js`, die restliche Logik in `js/app.js`.
- Farben/Schrift sind bewusst identisch zur jzoentertainment-Website
  gehalten (`css/app.css`).
