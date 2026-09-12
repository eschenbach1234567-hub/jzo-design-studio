/* ==========================================================================
   JZo Design Studio – App-Logik
   ========================================================================== */

const LOGO_PATH = "assets/logo-transparent.png";
const STORAGE_KEY = "jzo_design_projects";
const MAX_HISTORY = 60;

let canvas = null;
let currentTemplate = null;   // Vorlagen-Metadaten der gerade offenen Zeichnung
let currentProjectId = null;  // gesetzt sobald einmal gespeichert
let currentProjectName = "";
let history = [];
let historyIndex = -1;
let historyLock = false;
let dirty = false;
let activeCategoryFilter = "all";

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2));
}

function safeFilename(name) {
  return (name || "design").trim().replace(/[^a-zA-Z0-9äöüÄÖÜß _-]/g, "").replace(/\s+/g, "-") || "design";
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

/* ---------------------------------------------------------------------
   Modal-Helfer
   --------------------------------------------------------------------- */

function openModal(title, bodyHTML, buttons) {
  const root = $("#modal-root");
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box">
        <h3>${title}</h3>
        <div class="modal-body">${bodyHTML}</div>
        <div class="modal-actions"></div>
      </div>
    </div>`;
  const actions = $(".modal-actions", root);
  buttons.forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "btn " + (b.className || "btn-outline");
    btn.textContent = b.label;
    btn.addEventListener("click", () => b.onClick(closeModal));
    actions.appendChild(btn);
  });
  $(".modal-backdrop", root).addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) closeModal();
  });
  return closeModal;
}
function closeModal() { $("#modal-root").innerHTML = ""; }

/* ---------------------------------------------------------------------
   Storage: Projekte in localStorage (nur in diesem Browser!)
   --------------------------------------------------------------------- */

function loadProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { return []; }
}
function saveProjects(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* ---------------------------------------------------------------------
   Fabric-Objekte aus Vorlagen-Definitionen bauen
   --------------------------------------------------------------------- */

function makeFill(spec) {
  if (typeof spec === "string") return spec;
  if (spec && spec.type === "linear") {
    const rad = ((spec.angle || 0) * Math.PI) / 180;
    const x = Math.cos(rad), y = Math.sin(rad);
    return new fabric.Gradient({
      type: "linear",
      coords: { x1: 0.5 - x / 2, y1: 0.5 - y / 2, x2: 0.5 + x / 2, y2: 0.5 + y / 2 },
      colorStops: spec.colorStops
    });
  }
  if (spec && spec.type === "radial") {
    return new fabric.Gradient({
      type: "radial",
      coords: { x1: 0.5, y1: 0.35, r1: 0, x2: 0.5, y2: 0.35, r2: 0.7 },
      colorStops: spec.colorStops
    });
  }
  return "#000000";
}

// fabric.Gradient braucht Prozent-Koordinaten relativ zum Objekt; das oben
// gebaute Gradient nutzt daher gradientUnits "percentage".
function applyPercentageGradient(fabricObj) {
  if (fabricObj.fill instanceof fabric.Gradient) {
    fabricObj.fill.gradientUnits = "percentage";
  }
}

function loadImg(src) {
  return new Promise((resolve) => fabric.Image.fromURL(src, resolve, { crossOrigin: "anonymous" }));
}

async function addLogoObject(def) {
  const img = await loadImg(LOGO_PATH);
  const scale = def.width / img.width;
  img.set({
    left: def.left, top: def.top,
    scaleX: scale, scaleY: scale,
    selectable: true
  });
  return img;
}

function makePlaceholderGroup(def) {
  const rect = new fabric.Rect({
    left: 0, top: 0, width: def.width, height: def.height,
    fill: "rgba(255,255,255,0.03)",
    stroke: BRAND.border, strokeWidth: 2, strokeDashArray: [10, 8],
    rx: 6, ry: 6
  });
  const label = new fabric.Textbox(def.label || "+ Bild einfügen", {
    left: 0, top: def.height / 2 - 14, width: def.width,
    fontSize: 18, fontFamily: BRAND.font, fill: BRAND.textMuted,
    textAlign: "center", selectable: false, evented: false
  });
  const group = new fabric.Group([rect, label], {
    left: def.left, top: def.top
  });
  group.isImagePlaceholder = true;
  group.placeholderW = def.width;
  group.placeholderH = def.height;
  return group;
}

async function objectFromDef(def) {
  switch (def.type) {
    case "logo":
      return addLogoObject(def);
    case "image-placeholder":
      return makePlaceholderGroup(def);
    case "rect": {
      const o = new fabric.Rect({
        left: def.left, top: def.top, width: def.width, height: def.height,
        rx: def.rx || 0, ry: def.ry || 0,
        fill: makeFill(def.fill), stroke: def.stroke || null, strokeWidth: def.strokeWidth || 0
      });
      applyPercentageGradient(o);
      return o;
    }
    case "circle":
      return new fabric.Circle({
        left: def.left, top: def.top, radius: def.radius || 40,
        fill: makeFill(def.fill)
      });
    case "text": {
      const o = new fabric.Textbox(def.text, {
        left: def.left, top: def.top, width: def.width,
        fontSize: def.fontSize || 20, fontWeight: def.fontWeight || 400,
        fontStyle: def.fontStyle || "normal",
        fontFamily: BRAND.font, fill: def.fill || BRAND.text,
        textAlign: def.textAlign || "left",
        lineHeight: def.lineHeight || 1.3
      });
      return o;
    }
    default:
      return null;
  }
}

async function buildTemplateOnCanvas(targetCanvas, template) {
  targetCanvas.clear();
  targetCanvas.backgroundColor = template.background || "#000000";
  for (const def of template.objects) {
    const obj = await objectFromDef(def);
    if (obj) targetCanvas.add(obj);
  }
  targetCanvas.renderAll();
}

/* ---------------------------------------------------------------------
   Vorschaubilder (Thumbnails) für Galerie
   --------------------------------------------------------------------- */

const thumbCache = {};

async function getTemplateThumbnail(template) {
  if (thumbCache[template.id]) return thumbCache[template.id];
  const off = new fabric.StaticCanvas(null, { width: template.width, height: template.height });
  await buildTemplateOnCanvas(off, template);
  const mult = 320 / template.width;
  const url = off.toDataURL({ format: "jpeg", quality: 0.8, multiplier: mult });
  off.dispose();
  thumbCache[template.id] = url;
  return url;
}

/* ---------------------------------------------------------------------
   Galerie (Start-Ansicht)
   --------------------------------------------------------------------- */

function renderCategoryTabs() {
  const wrap = $("#category-tabs");
  const all = [{ key: "all", label: "Alle" }, ...CATEGORIES];
  wrap.innerHTML = all.map((c) =>
    `<button data-cat="${c.key}" class="${c.key === activeCategoryFilter ? "active" : ""}">${c.label}</button>`
  ).join("");
  $$("button", wrap).forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategoryFilter = btn.dataset.cat;
      renderGallery();
    });
  });
}

async function renderTemplateGrid() {
  const grid = $("#template-grid");
  const list = TEMPLATES.filter((t) => activeCategoryFilter === "all" || t.category === activeCategoryFilter);
  grid.innerHTML = list.map((t) => `
    <div class="tpl-card" data-id="${t.id}">
      <div class="tpl-thumb"><img alt="${t.name}" data-thumb="${t.id}"></div>
      <div class="tpl-info">
        <h4>${t.name}</h4>
        <span>${t.unit === "mm" ? t.widthMM + " × " + t.heightMM + " mm" : t.width + " × " + t.height + " px"}</span>
      </div>
    </div>`).join("");
  $$(".tpl-card", grid).forEach((card) => {
    card.addEventListener("click", () => openTemplate(card.dataset.id));
  });
  for (const t of list) {
    const url = await getTemplateThumbnail(t);
    const img = grid.querySelector(`img[data-thumb="${t.id}"]`);
    if (img) img.src = url;
  }
}

function renderProjectGrid() {
  const grid = $("#project-grid");
  const empty = $("#project-empty");
  const projects = loadProjects().sort((a, b) => b.updatedAt - a.updatedAt);
  if (!projects.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  grid.innerHTML = projects.map((p) => `
    <div class="proj-card" data-id="${p.id}">
      <div class="proj-actions">
        <button data-act="rename" title="Umbenennen">✎</button>
        <button data-act="duplicate" title="Duplizieren">⧉</button>
        <button data-act="export" title="Als Datei sichern">⬇</button>
        <button data-act="delete" title="Löschen">✕</button>
      </div>
      <div class="proj-thumb"><img src="${p.thumbnail}" alt="${p.name}"></div>
      <div class="proj-info">
        <h4>${p.name}</h4>
        <span>${new Date(p.updatedAt).toLocaleDateString("de-DE")}</span>
      </div>
    </div>`).join("");
  $$(".proj-card", grid).forEach((card) => {
    const id = card.dataset.id;
    card.addEventListener("click", (e) => {
      if (e.target.closest(".proj-actions")) return;
      openProject(id);
    });
    card.querySelector('[data-act="rename"]').addEventListener("click", () => renameProject(id));
    card.querySelector('[data-act="duplicate"]').addEventListener("click", () => duplicateProject(id));
    card.querySelector('[data-act="export"]').addEventListener("click", () => exportProjectFile(id));
    card.querySelector('[data-act="delete"]').addEventListener("click", () => deleteProject(id));
  });
}

function renameProject(id) {
  const projects = loadProjects();
  const p = projects.find((x) => x.id === id);
  if (!p) return;
  openModal("Projekt umbenennen", `<input type="text" id="rename-input" value="${p.name.replace(/"/g, "&quot;")}">`, [
    { label: "Abbrechen", className: "btn-outline", onClick: (close) => close() },
    { label: "Speichern", className: "btn-primary", onClick: (close) => {
      const val = $("#rename-input").value.trim();
      if (val) { p.name = val; saveProjects(projects); renderProjectGrid(); }
      close();
    }}
  ]);
  setTimeout(() => $("#rename-input")?.focus(), 30);
}

function duplicateProject(id) {
  const projects = loadProjects();
  const p = projects.find((x) => x.id === id);
  if (!p) return;
  const copy = { ...p, id: uid(), name: p.name + " (Kopie)", updatedAt: Date.now() };
  projects.push(copy);
  saveProjects(projects);
  renderProjectGrid();
  showToast("Projekt dupliziert.");
}

function deleteProject(id) {
  openModal("Projekt löschen?", "<p>Das kann nicht rückgängig gemacht werden.</p>", [
    { label: "Abbrechen", className: "btn-outline", onClick: (close) => close() },
    { label: "Löschen", className: "btn-primary", onClick: (close) => {
      const projects = loadProjects().filter((x) => x.id !== id);
      saveProjects(projects);
      renderProjectGrid();
      close();
      showToast("Projekt gelöscht.");
    }}
  ]);
}

function exportProjectFile(id) {
  const p = loadProjects().find((x) => x.id === id);
  if (!p) return;
  downloadText(JSON.stringify(p, null, 2), safeFilename(p.name) + ".json", "application/json");
}

function downloadText(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function importProjectFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const p = JSON.parse(reader.result);
      if (!p.json || !p.width || !p.height) throw new Error("invalid");
      p.id = uid();
      p.updatedAt = Date.now();
      const projects = loadProjects();
      projects.push(p);
      saveProjects(projects);
      renderProjectGrid();
      showToast("Projekt importiert.");
    } catch (e) {
      showToast("Diese Datei konnte nicht gelesen werden.");
    }
  };
  reader.readAsText(file);
}

async function renderGallery() {
  renderCategoryTabs();
  await renderTemplateGrid();
  renderProjectGrid();
}

/* ---------------------------------------------------------------------
   Ansichten wechseln
   --------------------------------------------------------------------- */

function showView(name) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#view-" + name).classList.add("active");
  $$(".topbar-nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  if (name === "gallery") { checkUnsavedThenRefresh(); }
  if (name === "editor") { requestAnimationFrame(() => requestAnimationFrame(fitCanvasToScreen)); }
}

function checkUnsavedThenRefresh() {
  renderGallery();
}

/* ---------------------------------------------------------------------
   Editor: Canvas anlegen, Vorlage/Projekt laden
   --------------------------------------------------------------------- */

function disposeCanvas() {
  if (canvas) { canvas.dispose(); canvas = null; }
}

function setupCanvasEvents() {
  canvas.on("selection:created", renderPropertiesPanel);
  canvas.on("selection:updated", renderPropertiesPanel);
  canvas.on("selection:cleared", renderPropertiesPanel);
  canvas.on("object:modified", () => { pushHistory(); markDirty(); });
  canvas.on("object:added", () => { markDirty(); });
  canvas.on("object:removed", () => { markDirty(); });
  canvas.on("mouse:dblclick", (opt) => {
    if (opt.target && opt.target.isImagePlaceholder) triggerImageReplace(opt.target);
  });
}

function markDirty() {
  if (historyLock) return;
  dirty = true;
}

async function openTemplate(templateId) {
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return;
  disposeCanvas();
  currentTemplate = tpl;
  currentProjectId = null;
  currentProjectName = tpl.name;
  canvas = new fabric.Canvas("fabric-canvas", { width: tpl.width, height: tpl.height, preserveObjectStacking: true });
  await buildTemplateOnCanvas(canvas, tpl);
  setupCanvasEvents();
  history = []; historyIndex = -1;
  pushHistory();
  dirty = false;
  $("#current-project-name").textContent = currentProjectName;
  showView("editor");
  renderPropertiesPanel();
}

const BLANK_FORMATS = [
  { key: "a4-portrait", label: "A4 Hochformat (210×297 mm)", unit: "mm", widthMM: 210, heightMM: 297 },
  { key: "a4-landscape", label: "A4 Querformat (297×210 mm)", unit: "mm", widthMM: 297, heightMM: 210 },
  { key: "a5-portrait", label: "A5 Hochformat (148×210 mm)", unit: "mm", widthMM: 148, heightMM: 210 },
  { key: "a5-landscape", label: "A5 Querformat (210×148 mm)", unit: "mm", widthMM: 210, heightMM: 148 },
  { key: "a3-poster", label: "A3 Poster (297×420 mm)", unit: "mm", widthMM: 297, heightMM: 420 },
  { key: "card", label: "Visitenkarte (85×55 mm)", unit: "mm", widthMM: 85, heightMM: 55 },
  { key: "square-social", label: "Quadratisch – Social Media (1080×1080 px)", unit: "px", width: 1080, height: 1080 },
  { key: "story", label: "Story – Instagram/Facebook (1080×1920 px)", unit: "px", width: 1080, height: 1920 },
  { key: "fb-post", label: "Facebook-Post (1200×630 px)", unit: "px", width: 1200, height: 630 },
  { key: "custom", label: "Eigene Größe …", unit: "custom" }
];

let blankBgColor = "#ffffff";

function openBlankDesignModal() {
  blankBgColor = "#ffffff";
  const options = BLANK_FORMATS.map((f) => `<option value="${f.key}">${f.label}</option>`).join("");
  const bgSwatches = ["#ffffff", "#f2f2f0", BRAND.bg, BRAND.bgSoft, BRAND.gold1];
  openModal("Leeres Dokument erstellen", `
    <div class="prop-row">
      <label>Format</label>
      <select id="blank-format">${options}</select>
    </div>
    <div class="prop-row" id="blank-custom-row" style="display:none;">
      <label>Eigene Größe</label>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="number" id="blank-width" min="10" max="10000" value="1000" style="flex:1;">
        <span style="color:var(--text-muted);">×</span>
        <input type="number" id="blank-height" min="10" max="10000" value="1000" style="flex:1;">
        <select id="blank-unit" style="flex:1;">
          <option value="mm">mm</option>
          <option value="px">px</option>
        </select>
      </div>
    </div>
    <div class="prop-row">
      <label>Hintergrund</label>
      <div class="swatch-row" id="blank-bg-swatches" style="margin-bottom:8px;">
        ${bgSwatches.map((c) => `<span class="swatch" style="background:${c}" data-bgcolor="${c}"></span>`).join("")}
      </div>
      <input type="color" id="blank-bg-color" value="#ffffff">
    </div>
  `, [
    { label: "Abbrechen", className: "btn-outline", onClick: (close) => close() },
    { label: "Erstellen", className: "btn-primary", onClick: (close) => {
      const formatKey = $("#blank-format").value;
      const format = BLANK_FORMATS.find((f) => f.key === formatKey);
      let cfg;
      if (format.unit === "custom") {
        const unit = $("#blank-unit").value;
        const w = Math.max(10, +$("#blank-width").value || 1000);
        const h = Math.max(10, +$("#blank-height").value || 1000);
        cfg = unit === "mm"
          ? { unit: "mm", width: mm(w), height: mm(h), widthMM: w, heightMM: h }
          : { unit: "px", width: Math.round(w), height: Math.round(h) };
      } else if (format.unit === "mm") {
        cfg = { unit: "mm", width: mm(format.widthMM), height: mm(format.heightMM), widthMM: format.widthMM, heightMM: format.heightMM };
      } else {
        cfg = { unit: "px", width: format.width, height: format.height };
      }
      cfg.name = "Leeres Dokument";
      cfg.background = blankBgColor;
      openBlankCanvas(cfg);
      close();
    }}
  ]);
  $("#blank-format").addEventListener("change", (e) => {
    $("#blank-custom-row").style.display = e.target.value === "custom" ? "block" : "none";
  });
  $$('#blank-bg-swatches .swatch').forEach((s) => s.addEventListener("click", () => {
    blankBgColor = s.dataset.bgcolor;
    $("#blank-bg-color").value = /^#([0-9a-f]{6})$/i.test(blankBgColor) ? blankBgColor : "#ffffff";
  }));
  $("#blank-bg-color").addEventListener("input", (e) => { blankBgColor = e.target.value; });
}

async function openBlankCanvas(cfg) {
  disposeCanvas();
  currentTemplate = {
    id: "blank", category: "blank", name: cfg.name,
    unit: cfg.unit, width: cfg.width, height: cfg.height,
    widthMM: cfg.widthMM, heightMM: cfg.heightMM
  };
  currentProjectId = null;
  currentProjectName = cfg.name;
  canvas = new fabric.Canvas("fabric-canvas", { width: cfg.width, height: cfg.height, preserveObjectStacking: true });
  canvas.backgroundColor = cfg.background || "#ffffff";
  canvas.renderAll();
  setupCanvasEvents();
  history = []; historyIndex = -1;
  pushHistory();
  dirty = false;
  $("#current-project-name").textContent = currentProjectName;
  showView("editor");
  renderPropertiesPanel();
}

async function openProject(projectId) {
  const p = loadProjects().find((x) => x.id === projectId);
  if (!p) return;
  disposeCanvas();
  currentTemplate = { id: p.templateId, category: p.category, unit: p.unit, width: p.width, height: p.height, widthMM: p.widthMM, heightMM: p.heightMM, name: p.name };
  currentProjectId = p.id;
  currentProjectName = p.name;
  canvas = new fabric.Canvas("fabric-canvas", { width: p.width, height: p.height, preserveObjectStacking: true });
  historyLock = true;
  await new Promise((resolve) => canvas.loadFromJSON(p.json, resolve));
  canvas.renderAll();
  historyLock = false;
  setupCanvasEvents();
  history = []; historyIndex = -1;
  pushHistory();
  dirty = false;
  $("#current-project-name").textContent = currentProjectName;
  showView("editor");
  renderPropertiesPanel();
}

function fitCanvasToScreen() {
  if (!canvas) return;
  const wrap = $(".canvas-wrap");
  const availW = wrap.clientWidth - 40;
  const availH = wrap.clientHeight - 40;
  if (availW <= 0 || availH <= 0) { requestAnimationFrame(fitCanvasToScreen); return; }
  const scale = Math.min(availW / canvas.width, availH / canvas.height, 1);
  if (!isFinite(scale) || scale <= 0) return;
  manualZoom = scale;
  canvas.setDimensions({ width: (canvas.width * scale) + "px", height: (canvas.height * scale) + "px" }, { cssOnly: true });
  const el = canvas.upperCanvasEl.parentNode;
  el.classList.add("canvas-shadow");
}

window.addEventListener("resize", () => { if (canvas) fitCanvasToScreen(); });

/* ---------------------------------------------------------------------
   Verlauf (Undo/Redo)
   --------------------------------------------------------------------- */

function pushHistory() {
  if (historyLock || !canvas) return;
  const json = JSON.stringify(canvas.toJSON(["isImagePlaceholder", "placeholderW", "placeholderH"]));
  history = history.slice(0, historyIndex + 1);
  history.push(json);
  if (history.length > MAX_HISTORY) history.shift();
  historyIndex = history.length - 1;
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  $("#btn-undo").disabled = historyIndex <= 0;
  $("#btn-redo").disabled = historyIndex >= history.length - 1;
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex--;
  restoreHistory();
}
function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  restoreHistory();
}
function restoreHistory() {
  historyLock = true;
  canvas.loadFromJSON(history[historyIndex], () => {
    canvas.renderAll();
    historyLock = false;
    updateUndoRedoButtons();
    renderPropertiesPanel();
  });
}

/* ---------------------------------------------------------------------
   Werkzeugleiste: Objekte hinzufügen
   --------------------------------------------------------------------- */

function centerPoint() {
  return { left: canvas.width / 2 - 100, top: canvas.height / 2 - 20 };
}

function addTextPreset(kind) {
  const c = centerPoint();
  const presets = {
    heading: { text: "Überschrift", fontSize: 48, fontWeight: 800, fill: BRAND.silver1, width: 500 },
    subheading: { text: "Unterüberschrift", fontSize: 26, fontWeight: 600, fill: BRAND.gold1, width: 400 },
    body: { text: "Dein Text hier. Einfach anklicken und bearbeiten.", fontSize: 18, fontWeight: 400, fill: BRAND.textMuted, width: 400 }
  };
  const p = presets[kind];
  const t = new fabric.Textbox(p.text, {
    left: c.left, top: c.top, width: p.width, fontSize: p.fontSize,
    fontWeight: p.fontWeight, fill: p.fill, fontFamily: BRAND.font
  });
  canvas.add(t); canvas.setActiveObject(t); canvas.renderAll();
  pushHistory();
}

function addShape(kind) {
  const c = centerPoint();
  let obj;
  if (kind === "rect") obj = new fabric.Rect({ left: c.left, top: c.top, width: 200, height: 120, fill: BRAND.gold1, rx: 10, ry: 10 });
  if (kind === "circle") obj = new fabric.Circle({ left: c.left, top: c.top, radius: 70, fill: BRAND.gold1 });
  if (kind === "line") obj = new fabric.Rect({ left: c.left, top: c.top, width: 240, height: 6, fill: BRAND.gold1, rx: 3, ry: 3 });
  canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll();
  pushHistory();
}

async function insertLogo() {
  const img = await loadImg(LOGO_PATH);
  const c = centerPoint();
  const scale = 180 / img.width;
  img.set({ left: c.left, top: c.top, scaleX: scale, scaleY: scale });
  canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
  pushHistory();
}

/* ---------------------------------------------------------------------
   Cliparts
   --------------------------------------------------------------------- */

let activeClipartCategory = CLIPART_CATEGORIES[0].key;

function clipartIconSVG(def, color) {
  if (def.kind === "ring") {
    return `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="${color}" stroke-width="3.5"/></svg>`;
  }
  if (def.kind === "frame") {
    return `<svg viewBox="0 0 40 40"><rect x="5" y="8" width="30" height="24" rx="3" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="4 3"/></svg>`;
  }
  if (def.kind === "dots") {
    return `<svg viewBox="0 0 40 12"><circle cx="4" cy="6" r="3" fill="${color}"/><circle cx="14" cy="6" r="3" fill="${color}"/><circle cx="24" cy="6" r="3" fill="${color}"/><circle cx="34" cy="6" r="3" fill="${color}"/></svg>`;
  }
  const [w, h] = def.viewBox;
  const strokeAttrs = def.strokeOnly
    ? `fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="${color}"`;
  return `<svg viewBox="0 0 ${w} ${h}"><path d="${def.path}" ${strokeAttrs}/></svg>`;
}

function renderClipartTabs() {
  const wrap = $("#clipart-tabs");
  wrap.innerHTML = CLIPART_CATEGORIES.map((c) =>
    `<button data-cat="${c.key}" class="${c.key === activeClipartCategory ? "active" : ""}">${c.label}</button>`
  ).join("");
  $$("button", wrap).forEach((btn) => {
    btn.addEventListener("click", () => { activeClipartCategory = btn.dataset.cat; renderClipartGrid(); renderClipartTabs(); });
  });
}

function renderClipartGrid() {
  const grid = $("#clipart-grid");
  const list = CLIPARTS.filter((c) => c.category === activeClipartCategory);
  grid.innerHTML = list.map((c) => `
    <button class="clipart-btn" data-id="${c.id}" title="${c.label}">
      ${clipartIconSVG(c, BRAND.gold1)}
      <span>${c.label}</span>
    </button>`).join("");
  $$(".clipart-btn", grid).forEach((btn) => btn.addEventListener("click", () => insertClipart(btn.dataset.id)));
}

function insertClipart(id) {
  const def = CLIPARTS.find((c) => c.id === id);
  if (!def || !canvas) return;
  const c = centerPoint();
  const targetSize = 160;
  let obj;
  if (def.kind === "ring") {
    obj = new fabric.Circle({ radius: 70, fill: "transparent", stroke: BRAND.gold1, strokeWidth: 10 });
  } else if (def.kind === "frame") {
    obj = new fabric.Rect({ width: 300, height: 200, fill: "transparent", stroke: BRAND.gold1, strokeWidth: 4, strokeDashArray: [14, 10], rx: 10, ry: 10 });
  } else if (def.kind === "dots") {
    const circles = [0, 1, 2, 3, 4].map((i) => new fabric.Circle({ radius: 8, left: i * 34, top: 0, fill: BRAND.gold1 }));
    obj = new fabric.Group(circles);
  } else {
    const opts = def.strokeOnly
      ? { fill: null, stroke: BRAND.gold1, strokeWidth: 9, strokeLineCap: "round", strokeLineJoin: "round" }
      : { fill: BRAND.gold1 };
    obj = new fabric.Path(def.path, opts);
    const factor = targetSize / Math.max(obj.width, obj.height);
    obj.scale(factor);
  }
  obj.set({ left: c.left + 100 - obj.getScaledWidth() / 2, top: c.top + 20 - obj.getScaledHeight() / 2 });
  canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll();
  pushHistory();
}

let pendingReplaceTarget = null;

function triggerImageReplace(target) {
  pendingReplaceTarget = target || null;
  $("#file-input-image").click();
}

function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    fabric.Image.fromURL(reader.result, (img) => {
      if (pendingReplaceTarget) {
        const t = pendingReplaceTarget;
        const w = t.placeholderW, h = t.placeholderH;
        const scale = Math.max(w / img.width, h / img.height);
        img.set({
          left: t.left, top: t.top, originX: "left", originY: "top",
          scaleX: scale, scaleY: scale,
          clipPath: new fabric.Rect({ width: w / scale, height: h / scale, left: 0, top: 0, originX: "left", originY: "top" })
        });
        const idx = canvas.getObjects().indexOf(t);
        canvas.remove(t);
        canvas.insertAt(img, idx, false);
        pendingReplaceTarget = null;
      } else {
        const c = centerPoint();
        const scale = Math.min(1, 420 / img.width);
        img.set({ left: c.left, top: c.top, scaleX: scale, scaleY: scale });
        canvas.add(img);
      }
      canvas.setActiveObject(img);
      canvas.renderAll();
      pushHistory();
    });
  };
  reader.readAsDataURL(file);
}

function duplicateSelected() {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.clone((clone) => {
    clone.set({ left: obj.left + 24, top: obj.top + 24 });
    canvas.add(clone); canvas.setActiveObject(clone); canvas.renderAll();
    pushHistory();
  });
}

function deleteSelected() {
  const objs = canvas.getActiveObjects();
  if (!objs.length) return;
  objs.forEach((o) => canvas.remove(o));
  canvas.discardActiveObject(); canvas.renderAll();
  pushHistory();
}

function layerAction(action) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  if (action === "front") canvas.bringToFront(obj);
  if (action === "back") canvas.sendToBack(obj);
  if (action === "forward") canvas.bringForward(obj);
  if (action === "backward") canvas.sendBackwards(obj);
  canvas.renderAll();
  pushHistory();
}

/* ---------------------------------------------------------------------
   Eigenschaften-Panel
   --------------------------------------------------------------------- */

const SWATCHES = [BRAND.gold1, BRAND.gold2, BRAND.silver1, BRAND.silver2, BRAND.textMuted, BRAND.text, "#ffffff", "#000000", BRAND.bgSoft];

function renderPropertiesPanel() {
  const panel = $("#properties-panel");
  const obj = canvas ? canvas.getActiveObject() : null;
  if (!obj) {
    panel.innerHTML = `<div class="empty-props">Element auswählen,<br>um es zu bearbeiten.</div>` + backgroundPanelHTML();
    bindBackgroundPanel();
    return;
  }
  if (obj.isImagePlaceholder) {
    panel.innerHTML = `
      <h4>Bild-Platzhalter</h4>
      <div class="prop-row"><button class="btn btn-primary btn-small" id="prop-replace-img" style="width:100%">Bild einfügen</button></div>
      <div class="prop-row">
        <label>Deckkraft</label>
        <input type="range" id="prop-opacity" min="0" max="1" step="0.05" value="${obj.opacity}">
      </div>` + backgroundPanelHTML();
    $("#prop-replace-img").addEventListener("click", () => triggerImageReplace(obj));
    $("#prop-opacity").addEventListener("input", (e) => { obj.set("opacity", +e.target.value); canvas.renderAll(); });
    $("#prop-opacity").addEventListener("change", () => pushHistory());
    bindBackgroundPanel();
    return;
  }
  const isText = obj.type === "textbox" || obj.type === "text" || obj.type === "i-text";
  const isImage = obj.type === "image";
  let html = "";
  if (isText) {
    html += `
      <h4>Text</h4>
      <div class="prop-row"><label>Inhalt</label><textarea id="prop-text">${obj.text.replace(/</g, "&lt;")}</textarea></div>
      <div class="prop-row"><label>Schriftgröße</label><input type="number" id="prop-fontsize" min="8" max="220" value="${Math.round(obj.fontSize)}"></div>
      <div class="prop-row">
        <label>Stil</label>
        <div class="style-row">
          <button id="prop-bold" class="${obj.fontWeight >= 700 ? "active" : ""}"><b>F</b></button>
          <button id="prop-italic" class="${obj.fontStyle === "italic" ? "active" : ""}"><i>K</i></button>
          <button id="prop-underline" class="${obj.underline ? "active" : ""}"><u>U</u></button>
        </div>
      </div>
      <div class="prop-row">
        <label>Ausrichtung</label>
        <div class="align-row">
          <button data-align="left" class="${obj.textAlign === "left" ? "active" : ""}">⟵</button>
          <button data-align="center" class="${obj.textAlign === "center" ? "active" : ""}">↔</button>
          <button data-align="right" class="${obj.textAlign === "right" ? "active" : ""}">⟶</button>
        </div>
      </div>`;
  }
  if (!isImage) {
    html += `
      <h4>Farbe</h4>
      <div class="prop-row">
        <div class="swatch-row">
          ${SWATCHES.map((c) => `<span class="swatch" style="background:${c}" data-color="${c}"></span>`).join("")}
        </div>
      </div>
      <div class="prop-row"><input type="color" id="prop-color" value="${toHex(obj.fill)}"></div>`;
  }
  html += `
    <h4>Ebene</h4>
    <div class="sidebar-grid">
      <button class="sidebar-btn" id="prop-front">Ganz vorne</button>
      <button class="sidebar-btn" id="prop-back">Ganz hinten</button>
      <button class="sidebar-btn" id="prop-forward">Eine vor</button>
      <button class="sidebar-btn" id="prop-backward">Eine zurück</button>
    </div>
    <h4>Deckkraft</h4>
    <div class="prop-row"><input type="range" id="prop-opacity" min="0" max="1" step="0.05" value="${obj.opacity}"></div>
    <h4>Aktionen</h4>
    <div class="sidebar-grid">
      <button class="sidebar-btn wide" id="prop-duplicate">Duplizieren</button>
      <button class="sidebar-btn wide" id="prop-delete">Löschen</button>
    </div>`;
  panel.innerHTML = html + backgroundPanelHTML();
  bindBackgroundPanel();

  if (isText) {
    $("#prop-text").addEventListener("input", (e) => { obj.set("text", e.target.value); canvas.renderAll(); });
    $("#prop-text").addEventListener("change", () => pushHistory());
    $("#prop-fontsize").addEventListener("change", (e) => { obj.set("fontSize", +e.target.value); canvas.renderAll(); pushHistory(); });
    $("#prop-bold").addEventListener("click", () => { obj.set("fontWeight", obj.fontWeight >= 700 ? 400 : 800); canvas.renderAll(); renderPropertiesPanel(); pushHistory(); });
    $("#prop-italic").addEventListener("click", () => { obj.set("fontStyle", obj.fontStyle === "italic" ? "normal" : "italic"); canvas.renderAll(); renderPropertiesPanel(); pushHistory(); });
    $("#prop-underline").addEventListener("click", () => { obj.set("underline", !obj.underline); canvas.renderAll(); renderPropertiesPanel(); pushHistory(); });
    $$('[data-align]').forEach((b) => b.addEventListener("click", () => { obj.set("textAlign", b.dataset.align); canvas.renderAll(); renderPropertiesPanel(); pushHistory(); }));
  }
  if (!isImage) {
    $$(".swatch").forEach((s) => s.addEventListener("click", () => { obj.set("fill", s.dataset.color); canvas.renderAll(); $("#prop-color").value = s.dataset.color; pushHistory(); }));
    $("#prop-color").addEventListener("input", (e) => { obj.set("fill", e.target.value); canvas.renderAll(); });
    $("#prop-color").addEventListener("change", () => pushHistory());
  }
  $("#prop-front").addEventListener("click", () => layerAction("front"));
  $("#prop-back").addEventListener("click", () => layerAction("back"));
  $("#prop-forward").addEventListener("click", () => layerAction("forward"));
  $("#prop-backward").addEventListener("click", () => layerAction("backward"));
  $("#prop-opacity").addEventListener("input", (e) => { obj.set("opacity", +e.target.value); canvas.renderAll(); });
  $("#prop-opacity").addEventListener("change", () => pushHistory());
  $("#prop-duplicate").addEventListener("click", duplicateSelected);
  $("#prop-delete").addEventListener("click", deleteSelected);
}

function toHex(fill) {
  if (typeof fill === "string" && fill.startsWith("#")) return fill;
  return "#ffb35c";
}

function backgroundPanelHTML() {
  return `
    <h4>Hintergrund der Seite</h4>
    <div class="swatch-row" id="bg-swatches">
      ${[BRAND.bg, BRAND.bgSoft, BRAND.bgCard, BRAND.gold1, "#ffffff"].map((c) => `<span class="swatch" style="background:${c}" data-bgcolor="${c}"></span>`).join("")}
    </div>
    <div class="prop-row"><input type="color" id="bg-color" value="${toHex(canvas ? canvas.backgroundColor : "#000000")}"></div>
    <div class="prop-row"><button class="sidebar-btn wide" id="bg-image-btn">Hintergrundbild wählen</button></div>`;
}

function bindBackgroundPanel() {
  $$('[data-bgcolor]').forEach((s) => s.addEventListener("click", () => {
    canvas.setBackgroundColor(s.dataset.bgcolor, () => { canvas.renderAll(); pushHistory(); });
  }));
  const bgColorInput = $("#bg-color");
  if (bgColorInput) {
    bgColorInput.addEventListener("input", (e) => canvas.setBackgroundColor(e.target.value, () => canvas.renderAll()));
    bgColorInput.addEventListener("change", () => pushHistory());
  }
  const bgBtn = $("#bg-image-btn");
  if (bgBtn) bgBtn.addEventListener("click", () => $("#file-input-bg").click());
}

function handleBackgroundImageFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    fabric.Image.fromURL(reader.result, (img) => {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      canvas.setBackgroundImage(img, () => { canvas.renderAll(); pushHistory(); }, {
        scaleX: scale, scaleY: scale,
        left: (canvas.width - img.width * scale) / 2,
        top: (canvas.height - img.height * scale) / 2
      });
    });
  };
  reader.readAsDataURL(file);
}

/* ---------------------------------------------------------------------
   Zoom (nur Anzeige, Arbeitsauflösung bleibt gleich)
   --------------------------------------------------------------------- */

let manualZoom = null;
function zoomBy(factor) {
  if (!canvas) return;
  const base = manualZoom || 1;
  manualZoom = Math.min(3, Math.max(0.1, base * factor));
  canvas.setDimensions({ width: (currentTemplate.width * manualZoom) + "px", height: (currentTemplate.height * manualZoom) + "px" }, { cssOnly: true });
}
function zoomFit() {
  manualZoom = null;
  fitCanvasToScreen();
}

/* ---------------------------------------------------------------------
   Speichern
   --------------------------------------------------------------------- */

async function saveProject() {
  const defaultName = currentProjectName || currentTemplate.name;
  openModal("Projekt speichern", `<input type="text" id="save-name-input" value="${defaultName.replace(/"/g, "&quot;")}">`, [
    { label: "Abbrechen", className: "btn-outline", onClick: (close) => close() },
    { label: "Speichern", className: "btn-primary", onClick: async (close) => {
      const name = $("#save-name-input").value.trim() || defaultName;
      await doSave(name);
      close();
    }}
  ]);
  setTimeout(() => { const el = $("#save-name-input"); if (el) { el.focus(); el.select(); } }, 30);
}

async function doSave(name) {
  const projects = loadProjects();
  const thumbnail = canvas.toDataURL({ format: "jpeg", quality: 0.75, multiplier: Math.min(1, 320 / canvas.width) });
  const json = canvas.toJSON(["isImagePlaceholder", "placeholderW", "placeholderH"]);
  currentProjectName = name;
  if (currentProjectId) {
    const p = projects.find((x) => x.id === currentProjectId);
    if (p) { p.name = name; p.json = json; p.thumbnail = thumbnail; p.updatedAt = Date.now(); }
  } else {
    currentProjectId = uid();
    projects.push({
      id: currentProjectId, name, category: currentTemplate.category, templateId: currentTemplate.id,
      unit: currentTemplate.unit, width: currentTemplate.width, height: currentTemplate.height,
      widthMM: currentTemplate.widthMM, heightMM: currentTemplate.heightMM,
      json, thumbnail, updatedAt: Date.now()
    });
  }
  saveProjects(projects);
  dirty = false;
  $("#current-project-name").textContent = currentProjectName;
  showToast("Gespeichert.");
}

/* ---------------------------------------------------------------------
   Export: PNG / JPEG / PDF
   --------------------------------------------------------------------- */

function openExportModal() {
  openModal("Exportieren", `
    <div class="export-options">
      <label><input type="radio" name="exp-format" value="png" checked> PNG <small>Transparenz möglich, gut für Web/Bearbeitung</small></label>
      <label><input type="radio" name="exp-format" value="jpeg"> JPEG <small>Kleinere Datei, gut für Fotos/Social Media</small></label>
      <label><input type="radio" name="exp-format" value="pdf"> PDF <small>Für Druckereien und zum Ausdrucken</small></label>
    </div>
    <div class="export-options">
      <label><input type="radio" name="exp-quality" value="1" checked> Web-Qualität <small>schnell, kleinere Datei</small></label>
      <label><input type="radio" name="exp-quality" value="2"> Druck-Qualität <small>hochauflösend, größere Datei</small></label>
    </div>
  `, [
    { label: "Abbrechen", className: "btn-outline", onClick: (close) => close() },
    { label: "Herunterladen", className: "btn-primary", onClick: (close) => {
      const format = $('input[name="exp-format"]:checked').value;
      const mult = +$('input[name="exp-quality"]:checked').value;
      doExport(format, mult);
      close();
    }}
  ]);
}

function doExport(format, multiplier) {
  const filename = safeFilename(currentProjectName || currentTemplate.name);
  if (format === "png" || format === "jpeg") {
    const url = canvas.toDataURL({ format: format === "jpeg" ? "jpeg" : "png", quality: 0.95, multiplier });
    const a = document.createElement("a");
    a.href = url; a.download = filename + "." + (format === "jpeg" ? "jpg" : "png");
    document.body.appendChild(a); a.click(); a.remove();
    showToast("Export gestartet.");
    return;
  }
  if (format === "pdf") {
    const url = canvas.toDataURL({ format: "jpeg", quality: 0.95, multiplier });
    let mmW, mmH;
    if (currentTemplate.unit === "mm") { mmW = currentTemplate.widthMM; mmH = currentTemplate.heightMM; }
    else { mmW = (currentTemplate.width * 25.4) / 96; mmH = (currentTemplate.height * 25.4) / 96; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: [mmW, mmH], orientation: mmW >= mmH ? "landscape" : "portrait" });
    doc.addImage(url, "JPEG", 0, 0, mmW, mmH);
    doc.save(filename + ".pdf");
    showToast("PDF wird heruntergeladen.");
  }
}

/* ---------------------------------------------------------------------
   Init
   --------------------------------------------------------------------- */

function init() {
  $$(".topbar-nav button").forEach((btn) => btn.addEventListener("click", () => showView(btn.dataset.view)));

  $("#btn-new-from-editor").addEventListener("click", () => showView("gallery"));
  $("#btn-save").addEventListener("click", saveProject);
  $("#btn-export").addEventListener("click", openExportModal);
  $("#btn-undo").addEventListener("click", undo);
  $("#btn-redo").addEventListener("click", redo);
  $("#btn-zoom-in").addEventListener("click", () => zoomBy(1.15));
  $("#btn-zoom-out").addEventListener("click", () => zoomBy(1 / 1.15));
  $("#btn-zoom-fit").addEventListener("click", zoomFit);

  $("#btn-add-heading").addEventListener("click", () => addTextPreset("heading"));
  $("#btn-add-subheading").addEventListener("click", () => addTextPreset("subheading"));
  $("#btn-add-body").addEventListener("click", () => addTextPreset("body"));
  $("#btn-add-rect").addEventListener("click", () => addShape("rect"));
  $("#btn-add-circle").addEventListener("click", () => addShape("circle"));
  $("#btn-add-line").addEventListener("click", () => addShape("line"));
  $("#btn-add-logo").addEventListener("click", insertLogo);
  $("#btn-add-image").addEventListener("click", () => { pendingReplaceTarget = null; $("#file-input-image").click(); });
  $("#btn-blank-design").addEventListener("click", openBlankDesignModal);
  renderClipartTabs();
  renderClipartGrid();

  $("#file-input-image").addEventListener("change", (e) => {
    if (e.target.files[0]) handleImageFile(e.target.files[0]);
    e.target.value = "";
  });
  $("#file-input-bg").addEventListener("change", (e) => {
    if (e.target.files[0]) handleBackgroundImageFile(e.target.files[0]);
    e.target.value = "";
  });
  $("#file-input-import").addEventListener("change", (e) => {
    if (e.target.files[0]) importProjectFile(e.target.files[0]);
    e.target.value = "";
  });
  $("#btn-import-project").addEventListener("click", () => $("#file-input-import").click());

  document.addEventListener("keydown", (e) => {
    if (!canvas || $("#view-editor").classList.contains("active") === false) return;
    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveProject(); }
    if (e.key === "Delete" || e.key === "Backspace") { deleteSelected(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") { e.preventDefault(); duplicateSelected(); }
  });

  window.addEventListener("beforeunload", (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  renderGallery();
}

document.addEventListener("DOMContentLoaded", init);
