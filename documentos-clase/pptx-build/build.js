const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const Fa = require("react-icons/fa");

// ---------- Palette (CodeAtlas brand violet #7c3aed) ----------
const VIOLET = "7C3AED";
const VIOLET_LT = "9B6CFF";
const VIOLET_DEEP = "5B21B6";
const INK = "171029";
const INK2 = "241738";
const LILAC = "C4B5FD";
const LILAC_BG = "EDE9FE";
const PAPER = "F7F5FC";
const WHITE = "FFFFFF";
const TEXT = "211A33";
const MUTED = "6E6688";
const AMBER = "F59E0B";
const TEAL = "14B8A6";
const CODE_BG = "1C1430";
const CODE_TEXT = "D9CEF7";
const CODE_KEY = "B79CFF";
const CODE_VAL = "7DD3C0";
const CODE_COMMENT = "8A7DB3";
const CODE_AMBER = "F5B544";

// ---------- Fonts ----------
const HEAD = "Trebuchet MS";
const BODY = "Calibri";
const MONO = "Consolas";

// ---------- Canvas (LAYOUT_WIDE = 13.333 x 7.5) ----------
const W = 13.333, H = 7.5, M = 0.6;

const pres = new pptxgen();
pres.defineLayout({ name: "WIDE", width: W, height: H });
pres.layout = "WIDE";
pres.author = "Izan Mendoza";
pres.title = "CodeAtlas — Proyecto de Síntesis DAW";

const shadow = () => ({ type: "outer", color: "1A1033", blur: 9, offset: 3, angle: 90, opacity: 0.16 });

// ---------- Icon rasterizer ----------
const iconCache = {};
async function icon(name, color) {
  const key = name + color;
  if (iconCache[key]) return iconCache[key];
  const Comp = Fa[name];
  if (!Comp) throw new Error("Missing icon: " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color: "#" + color, size: "256" })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const data = "image/png;base64," + png.toString("base64");
  iconCache[key] = data;
  return data;
}

let LOGO; // base64 of logo mark

// ---------- Helpers ----------
function bg(s, color) { s.background = { color }; }

function pageNum(s, n) {
  s.addImage({ data: LOGO, x: W - 1.0, y: H - 0.52, w: 0.24, h: 0.24 });
  s.addText("CodeAtlas", { x: W - 0.72, y: H - 0.53, w: 0.9, h: 0.26, fontFace: HEAD, fontSize: 8, color: MUTED, valign: "middle" });
  s.addText(String(n), { x: M, y: H - 0.53, w: 1, h: 0.26, fontFace: BODY, fontSize: 9, color: MUTED, valign: "middle" });
}

// Content slide header: kicker chip + big title
function header(s, kicker, title) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 0.5, w: 0.16, h: 0.16, fill: { color: VIOLET }, rectRadius: 0.04, line: { type: "none" } });
  s.addText(kicker.toUpperCase(), { x: M + 0.28, y: 0.43, w: 9, h: 0.3, fontFace: HEAD, fontSize: 12, bold: true, color: VIOLET, charSpacing: 2, valign: "middle", margin: 0 });
  s.addText(title, { x: M, y: 0.78, w: W - 2 * M, h: 0.85, fontFace: HEAD, fontSize: 30, bold: true, color: TEXT, margin: 0 });
}

async function iconChip(s, x, y, d, name, fg, bgc) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, fill: { color: bgc }, rectRadius: d * 0.26, line: { type: "none" }, shadow: shadow() });
  const ip = d * 0.26;
  s.addImage({ data: await icon(name, fg), x: x + ip, y: y + ip, w: d - 2 * ip, h: d - 2 * ip });
}

function card(s, x, y, w, h, fill = WHITE) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, rectRadius: 0.1, line: { type: "none" }, shadow: shadow() });
}

// Database table card with ALL fields. Returns its height.
function tableCard(s, x, y, w, title, fields) {
  const fh = 0.175, h = 0.55 + fields.length * fh;
  card(s, x, y, w, h, WHITE);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.4, fill: { color: VIOLET }, line: { type: "none" } });
  s.addText(title, { x: x + 0.18, y: y + 0.02, w: w - 0.36, h: 0.36, valign: "middle", fontFace: MONO, fontSize: 12, bold: true, color: WHITE, margin: 0 });
  const maxName = Math.max(...fields.map(f => f[0].length));
  const runs = [];
  fields.forEach((f, i) => {
    const br = i < fields.length - 1, hasTag = !!f[2];
    runs.push({ text: f[0].padEnd(maxName + 1), options: { color: TEXT } });
    runs.push({ text: f[1].padEnd(hasTag ? 9 : 0), options: { color: "8A82A6", breakLine: !hasTag && br } });
    if (hasTag) runs.push({ text: f[2], options: { color: VIOLET, bold: true, breakLine: br } });
  });
  s.addText(runs, { x: x + 0.18, y: y + 0.47, w: w - 0.28, h: h - 0.53, fontFace: MONO, fontSize: 10, color: TEXT, valign: "top", margin: 0, lineSpacingMultiple: 1.15 });
  return h;
}

// Code panel with light syntax tinting
function codePanel(s, x, y, w, h, lines, fs = 11) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: CODE_BG }, rectRadius: 0.08, line: { type: "none" }, shadow: shadow() });
  // window dots
  s.addShape(pres.shapes.OVAL, { x: x + 0.18, y: y + 0.16, w: 0.1, h: 0.1, fill: { color: "FF5F56" }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: x + 0.34, y: y + 0.16, w: 0.1, h: 0.1, fill: { color: "FFBD2E" }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: x + 0.50, y: y + 0.16, w: 0.1, h: 0.1, fill: { color: "27C93F" }, line: { type: "none" } });
  const runs = [];
  lines.forEach((ln, i) => {
    const br = i < lines.length - 1;
    const seg = colorLine(ln);
    seg.forEach((p, j) => {
      runs.push({ text: p.text, options: { color: p.color, bold: p.bold || false, breakLine: (j === seg.length - 1) && br } });
    });
    if (seg.length === 0) runs.push({ text: " ", options: { breakLine: br } });
  });
  s.addText(runs, { x: x + 0.22, y: y + 0.42, w: w - 0.44, h: h - 0.6, fontFace: MONO, fontSize: fs, color: CODE_TEXT, valign: "top", margin: 0, lineSpacingMultiple: 1.08 });
}

function colorLine(ln) {
  if (ln === "") return [];
  // annotation after ← becomes amber
  let main = ln, ann = null;
  const idx = ln.indexOf("←");
  if (idx >= 0) { main = ln.slice(0, idx); ann = ln.slice(idx); }
  const parts = [];
  const trimmed = main.trimStart();
  if (trimmed.startsWith("---")) {
    parts.push({ text: main, color: CODE_COMMENT });
  } else if (trimmed.startsWith("##")) {
    parts.push({ text: main, color: CODE_KEY, bold: true });
  } else if (trimmed.startsWith("```")) {
    parts.push({ text: main, color: CODE_COMMENT });
  } else if (trimmed.startsWith("-")) {
    parts.push({ text: main, color: CODE_VAL });
  } else if (main.includes(":")) {
    const ci = main.indexOf(":");
    parts.push({ text: main.slice(0, ci + 1), color: CODE_KEY });
    parts.push({ text: main.slice(ci + 1), color: CODE_VAL });
  } else {
    parts.push({ text: main, color: CODE_TEXT });
  }
  if (ann) parts.push({ text: " " + ann, color: CODE_AMBER });
  return parts;
}

function arrow(s, x, y, w, color = VIOLET) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 2.5, endArrowType: "triangle" } });
}

// ================= BUILD =================
async function build() {
  LOGO = "image/png;base64," + (await sharp(path.join("C:/programacion/CodeAtlas/aplicacion/frontend/public/logo.svg"), { density: 400 }).resize(512, 512).png().toBuffer()).toString("base64");

  // ---------- 1. TITLE ----------
  {
    const s = pres.addSlide(); bg(s, INK);
    // subtle motif: large faint rounded squares
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.7, y: -1.4, w: 4.5, h: 4.5, fill: { color: VIOLET, transparency: 86 }, rectRadius: 1.0, line: { type: "none" }, rotate: 18 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.8, y: 4.4, w: 3.4, h: 3.4, fill: { color: VIOLET_LT, transparency: 90 }, rectRadius: 0.8, line: { type: "none" }, rotate: 12 });
    s.addImage({ data: LOGO, x: M, y: 1.5, w: 1.35, h: 1.35 });
    s.addText("CodeAtlas", { x: M, y: 2.95, w: 10, h: 1.0, fontFace: HEAD, fontSize: 60, bold: true, color: WHITE, margin: 0 });
    s.addText("Convierte el código en un mapa que cualquiera entiende", { x: M, y: 4.0, w: 10.5, h: 0.6, fontFace: BODY, fontSize: 20, color: LILAC, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: M + 0.02, y: 4.85, w: 2.2, h: 0, line: { color: VIOLET, width: 3 } });
    s.addText([
      { text: "Proyecto de Síntesis · DAW", options: { breakLine: true, color: WHITE, bold: true } },
      { text: "Izan Mendoza · 2026", options: { color: LILAC } },
    ], { x: M, y: 5.1, w: 8, h: 0.8, fontFace: BODY, fontSize: 14, margin: 0, lineSpacingMultiple: 1.2 });
  }

  // ---------- 2. PROBLEMA 1 ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "El problema", "Entender una app nueva cuesta días");
    // left big stat / visual
    card(s, M, 1.9, 5.7, 4.7, INK);
    s.addText("</>", { x: M, y: 2.3, w: 5.7, h: 1.2, fontFace: MONO, fontSize: 54, bold: true, color: VIOLET_LT, align: "center", margin: 0 });
    s.addText("miles de líneas\nrepartidas en cientos de archivos", { x: M + 0.4, y: 3.7, w: 4.9, h: 1.3, fontFace: BODY, fontSize: 20, color: WHITE, align: "center", margin: 0, lineSpacingMultiple: 1.1 });
    s.addText("Para aportar algo, primero tienes que reconstruir el mapa mental de toda la aplicación.", { x: M + 0.4, y: 5.2, w: 4.9, h: 1.0, fontFace: BODY, fontSize: 13, italic: true, color: LILAC, align: "center", margin: 0 });
    // right points
    const items = [
      ["FaUserPlus", "Un trabajador nuevo", "Se pasa los primeros días solo leyendo código para saber cómo encaja todo."],
      ["FaSearch", "Buscar antes de tocar", "Cada cambio obliga a entender primero qué hace el código de alrededor."],
      ["FaClock", "Tiempo perdido", "Horas de lectura antes de poder ser productivo de verdad."],
    ];
    let y = 2.05;
    for (const [ic, t, d] of items) {
      card(s, 6.7, y, 6.03, 1.42);
      await iconChip(s, 6.95, y + 0.31, 0.8, ic, WHITE, VIOLET);
      s.addText(t, { x: 7.95, y: y + 0.22, w: 4.6, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: TEXT, margin: 0 });
      s.addText(d, { x: 7.95, y: y + 0.62, w: 4.6, h: 0.7, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.05 });
      y += 1.6;
    }
    pageNum(s, 2);
  }

  // ---------- 3. PROBLEMA 2 ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "El problema", "Y mantener los diagramas, otra vez");
    s.addText("Ya existen formatos para dibujar una app. El problema no es dibujarla — es mantenerla al día.", { x: M, y: 1.75, w: W - 2 * M, h: 0.5, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
    const cols = [
      ["FaSyncAlt", "Se actualizan a mano", "Cada diagrama lo mantienes por separado. Es tedioso y se olvida."],
      ["FaExclamationTriangle", "Quedan desfasados", "En cuanto el código cambia, dejan de ser fiables."],
      ["FaPuzzlePiece", "Están dispersos", "BD en una herramienta, casos de uso en otra, flujos en otra."],
    ];
    let x = M;
    for (const [ic, t, d] of cols) {
      card(s, x, 2.4, 3.9, 2.5);
      await iconChip(s, x + 0.35, 2.75, 0.9, ic, WHITE, AMBER);
      s.addText(t, { x: x + 0.35, y: 3.85, w: 3.2, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: TEXT, margin: 0 });
      s.addText(d, { x: x + 0.35, y: 4.25, w: 3.3, h: 0.6, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.05 });
      x += 4.13;
    }
    // solution band
    card(s, M, 5.25, W - 2 * M, 1.45, INK);
    await iconChip(s, M + 0.35, 5.55, 0.85, "FaBullseye", WHITE, VIOLET);
    s.addText([
      { text: "La idea de CodeAtlas:  ", options: { bold: true, color: WHITE } },
      { text: "un único origen de verdad → todos los diagramas salen de ahí, siempre sincronizados y centralizados en una sola herramienta.", options: { color: LILAC } },
    ], { x: M + 1.4, y: 5.4, w: 10.6, h: 1.1, fontFace: BODY, fontSize: 15, valign: "middle", margin: 0, lineSpacingMultiple: 1.1 });
    pageNum(s, 3);
  }

  // ---------- 4. DE DÓNDE VIENE LA IDEA ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "La idea", "De dónde viene");
    // central transform: code -> AI -> diagram
    const cy = 2.55;
    card(s, 0.6, cy, 3.5, 2.0, INK);
    await iconChip(s, 1.9, cy + 0.32, 0.9, "FaFileCode", WHITE, VIOLET);
    s.addText("Tu código", { x: 0.6, y: cy + 1.35, w: 3.5, h: 0.4, align: "center", fontFace: HEAD, fontSize: 16, bold: true, color: WHITE, margin: 0 });
    arrow(s, 4.2, cy + 1.0, 0.6);
    card(s, 4.9, cy, 3.5, 2.0, VIOLET);
    await iconChip(s, 6.2, cy + 0.32, 0.9, "FaRobot", VIOLET, WHITE);
    s.addText("Inteligencia\nartificial", { x: 4.9, y: cy + 1.3, w: 3.5, h: 0.55, align: "center", fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, margin: 0, lineSpacingMultiple: 0.95 });
    arrow(s, 8.5, cy + 1.0, 0.6, VIOLET);
    card(s, 9.2, cy, 3.5, 2.0, INK);
    await iconChip(s, 10.5, cy + 0.32, 0.9, "FaProjectDiagram", WHITE, TEAL);
    s.addText("Esquema visual", { x: 9.2, y: cy + 1.35, w: 3.5, h: 0.4, align: "center", fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, margin: 0 });
    // points below
    s.addText([
      { text: "La IA es buenísima traduciendo lenguaje humano ↔ lenguaje de máquina.", options: { breakLine: true, bold: true, color: TEXT } },
      { text: "Puede analizar una app y convertirla a un formato concreto que una herramienta sepa leer y dibujar.", options: { color: MUTED } },
    ], { x: M, y: 5.05, w: 7.4, h: 1.4, fontFace: BODY, fontSize: 15, margin: 0, lineSpacingMultiple: 1.25 });
    card(s, 8.3, 5.0, 4.43, 1.55, LILAC_BG);
    await iconChip(s, 8.6, 5.32, 0.85, "FaUserPlus", WHITE, VIOLET);
    s.addText([
      { text: "Caso estrella\n", options: { bold: true, color: VIOLET_DEEP } },
      { text: "que un trabajador nuevo entienda la app en minutos, no en días.", options: { color: TEXT } },
    ], { x: 9.6, y: 5.05, w: 2.95, h: 1.45, fontFace: BODY, fontSize: 12.5, valign: "middle", margin: 0, lineSpacingMultiple: 1.05 });
    pageNum(s, 4);
  }

  // ---------- 5. NO SOLO ONBOARDING ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "La idea", "No solo para entenderla entera");
    card(s, M, 1.95, 5.9, 4.6, WHITE);
    await iconChip(s, M + 0.4, 2.35, 1.0, "FaBook", WHITE, VIOLET);
    s.addText("Visión global", { x: M + 1.6, y: 2.45, w: 4, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: TEXT, margin: 0 });
    s.addText("Ver de un vistazo cómo está montada toda la aplicación: módulos, pantallas, base de datos y flujos.", { x: M + 0.4, y: 3.55, w: 5.1, h: 1.1, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText("Ideal para incorporarse a un proyecto.", { x: M + 0.4, y: 5.6, w: 5.1, h: 0.6, fontFace: BODY, fontSize: 12.5, italic: true, color: VIOLET_DEEP, margin: 0 });

    card(s, 6.83, 1.95, 5.9, 4.6, INK);
    await iconChip(s, 7.23, 2.35, 1.0, "FaEdit", WHITE, TEAL);
    s.addText("Día a día", { x: 8.43, y: 2.45, w: 4, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: WHITE, margin: 0 });
    s.addText("Antes de tocar el código, miras en el diagrama cómo funcionan justo los archivos que vas a modificar y cómo se conectan.", { x: 7.23, y: 3.55, w: 5.1, h: 1.2, fontFace: BODY, fontSize: 14, color: LILAC, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText([
      { text: "→ sigues el mismo patrón del proyecto", options: { breakLine: true, color: WHITE } },
      { text: "→ nada de código que rompe la estructura", options: { color: WHITE } },
    ], { x: 7.23, y: 5.45, w: 5.1, h: 0.9, fontFace: BODY, fontSize: 13, bold: true, margin: 0, lineSpacingMultiple: 1.2 });
    pageNum(s, 5);
  }

  // ---------- 6. VISIÓN A FUTURO ----------
  {
    const s = pres.addSlide(); bg(s, INK);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 0.5, w: 0.16, h: 0.16, fill: { color: VIOLET_LT }, rectRadius: 0.04, line: { type: "none" } });
    s.addText("VISIÓN A FUTURO", { x: M + 0.28, y: 0.43, w: 9, h: 0.3, fontFace: HEAD, fontSize: 12, bold: true, color: VIOLET_LT, charSpacing: 2, valign: "middle", margin: 0 });
    s.addText("Programas como ahora; la documentación se actualiza sola", { x: M, y: 0.78, w: W - 2 * M, h: 0.85, fontFace: HEAD, fontSize: 28, bold: true, color: WHITE, margin: 0 });
    // flow: AI agent writes -> code + doc -> diagram
    card(s, 0.6, 2.2, 3.3, 2.2, INK2);
    await iconChip(s, 1.775, 2.5, 0.95, "FaRobot", WHITE, VIOLET);
    s.addText("Agente de IA\n(p. ej. Claude Code)", { x: 0.6, y: 3.5, w: 3.3, h: 0.7, align: "center", fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, margin: 0, lineSpacingMultiple: 0.95 });
    arrow(s, 4.0, 3.1, 0.6, VIOLET_LT);
    arrow(s, 4.0, 3.5, 0.6, VIOLET_LT);
    card(s, 4.7, 2.05, 3.4, 1.25, VIOLET);
    await iconChip(s, 4.95, 2.32, 0.7, "FaCode", VIOLET, WHITE);
    s.addText("Código", { x: 5.85, y: 2.32, w: 2.15, h: 0.7, valign: "middle", fontFace: HEAD, fontSize: 16, bold: true, color: WHITE, margin: 0 });
    card(s, 4.7, 3.45, 3.4, 1.25, TEAL);
    await iconChip(s, 4.95, 3.72, 0.7, "FaFileAlt", TEAL, WHITE);
    s.addText("Documentación", { x: 5.85, y: 3.72, w: 2.15, h: 0.7, valign: "middle", fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, margin: 0 });
    arrow(s, 8.2, 4.07, 0.7, TEAL);
    card(s, 9.0, 3.45, 3.2, 1.25, INK2);
    await iconChip(s, 9.25, 3.72, 0.7, "FaProjectDiagram", WHITE, TEAL);
    s.addText("Diagrama", { x: 10.1, y: 3.72, w: 2.0, h: 0.7, valign: "middle", fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, margin: 0 });
    // key insight
    card(s, M, 5.0, W - 2 * M, 1.7, INK2);
    await iconChip(s, M + 0.35, 5.32, 1.0, "FaMagic", WHITE, AMBER);
    s.addText([
      { text: "La clave: un ", options: { color: LILAC } },
      { text: "skill", options: { bold: true, color: WHITE } },
      { text: " que hace que cada vez que el agente escribe código, ", options: { color: LILAC } },
      { text: "genere y actualice la documentación automáticamente.", options: { bold: true, color: WHITE } },
      { text: "  El programador se olvida por completo de documentar — y el diagrama nunca se desincroniza.", options: { color: LILAC } },
    ], { x: M + 1.55, y: 5.05, w: 10.9, h: 1.6, fontFace: BODY, fontSize: 15.5, valign: "middle", margin: 0, lineSpacingMultiple: 1.2 });
  }

  // ---------- 7. QUÉ HACE ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "La herramienta", "¿Qué hace CodeAtlas?");
    // pipeline 3 steps
    const cy = 2.05;
    card(s, 0.6, cy, 3.5, 1.9, WHITE);
    await iconChip(s, 1.9, cy + 0.3, 0.95, "FaFolderOpen", WHITE, VIOLET);
    s.addText("Subes una carpeta\nde archivos .md", { x: 0.6, y: cy + 1.25, w: 3.5, h: 0.6, align: "center", fontFace: HEAD, fontSize: 14, bold: true, color: TEXT, margin: 0, lineSpacingMultiple: 0.95 });
    arrow(s, 4.2, cy + 0.95, 0.6);
    card(s, 4.9, cy, 3.5, 1.9, VIOLET);
    await iconChip(s, 6.2, cy + 0.3, 0.95, "FaCogs", VIOLET, WHITE);
    s.addText("CodeAtlas\nlas interpreta", { x: 4.9, y: cy + 1.25, w: 3.5, h: 0.6, align: "center", fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, margin: 0, lineSpacingMultiple: 0.95 });
    arrow(s, 8.5, cy + 0.95, 0.6);
    card(s, 9.2, cy, 3.5, 1.9, INK);
    await iconChip(s, 10.5, cy + 0.3, 0.95, "FaProjectDiagram", WHITE, TEAL);
    s.addText("Diagrama\ninteractivo", { x: 9.2, y: cy + 1.25, w: 3.5, h: 0.6, align: "center", fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, margin: 0, lineSpacingMultiple: 0.95 });
    // what you see
    s.addText("En el diagrama ves —y conectados entre sí—:", { x: M, y: 4.35, w: 10, h: 0.4, fontFace: BODY, fontSize: 15, bold: true, color: TEXT, margin: 0 });
    const tags = [["FaCube", "Módulos"], ["FaDesktop", "Pantallas"], ["FaDatabase", "Base de datos"], ["FaStream", "Flujos"]];
    let x = M;
    for (const [ic, t] of tags) {
      card(s, x, 4.85, 2.95, 1.35, WHITE);
      await iconChip(s, x + 0.3, 5.15, 0.75, ic, WHITE, VIOLET);
      s.addText(t, { x: x + 1.15, y: 5.15, w: 1.7, h: 0.75, valign: "middle", fontFace: HEAD, fontSize: 14.5, bold: true, color: TEXT, margin: 0 });
      x += 3.07;
    }
    pageNum(s, 7);
  }

  // ---------- 8. LENGUAJES ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "Tecnología", "Lenguajes y por qué");
    // banner
    card(s, M, 1.85, W - 2 * M, 0.95, INK);
    await iconChip(s, M + 0.3, 2.0, 0.65, "FaJs", INK, AMBER);
    s.addText([
      { text: "Un solo lenguaje de punta a punta:  ", options: { color: LILAC } },
      { text: "JavaScript", options: { bold: true, color: WHITE } },
      { text: "   —   son las tecnologías que mejor conozco.", options: { italic: true, color: LILAC } },
    ], { x: M + 1.1, y: 1.85, w: 11.4, h: 0.95, valign: "middle", fontFace: BODY, fontSize: 16, margin: 0 });
    // two columns
    card(s, M, 3.05, 5.9, 3.55, WHITE);
    await iconChip(s, M + 0.35, 3.4, 0.85, "FaVuejs", WHITE, "42B883");
    s.addText("Frontend", { x: M + 1.4, y: 3.5, w: 4, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: TEXT, margin: 0 });
    s.addText([
      { text: "Vue 3 + Vite", options: { bullet: true, breakLine: true, bold: true } },
      { text: "Pinia (estado) · Vue Router", options: { bullet: true, breakLine: true } },
      { text: "Vue Flow — el lienzo de nodos y conexiones", options: { bullet: true } },
    ], { x: M + 0.45, y: 4.5, w: 5.2, h: 1.9, fontFace: BODY, fontSize: 14, color: TEXT, margin: 0, paraSpaceAfter: 8 });

    card(s, 6.83, 3.05, 5.9, 3.55, WHITE);
    await iconChip(s, 7.18, 3.4, 0.85, "FaNodeJs", WHITE, "539E43");
    s.addText("Backend", { x: 8.23, y: 3.5, w: 4, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: TEXT, margin: 0 });
    s.addText([
      { text: "Node.js + Express — API REST modular", options: { bullet: true, breakLine: true, bold: true } },
      { text: "MySQL — base de datos relacional", options: { bullet: true, breakLine: true } },
      { text: "Google Gemini — integración de IA", options: { bullet: true } },
    ], { x: 7.28, y: 4.5, w: 5.2, h: 1.9, fontFace: BODY, fontSize: 14, color: TEXT, margin: 0, paraSpaceAfter: 8 });
    pageNum(s, 8);
  }

  // ---------- 9. ARQUITECTURA MODULAR ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "Arquitectura", "Estructura modular");
    s.addText("Cada área funcional vive en su propia carpeta — mismo patrón en todos los módulos.", { x: M, y: 1.72, w: W - 2 * M, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 });
    // backend tree
    codePanel(s, M, 2.25, 5.9, 3.05, [
      "src/modules/",
      "  auth/",
      "    auth.routes.js       // endpoints",
      "    auth.controller.js   // capa HTTP",
      "    auth.service.js      // lógica",
      "    auth.repository.js   // BD",
      "  projects/  diagrams/",
      "  parser/  settings/  bot/",
    ], 11.5);
    s.addText("BACKEND  ·  routes → controller → service → repository", { x: M + 0.1, y: 5.35, w: 5.8, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VIOLET_DEEP, margin: 0 });
    // frontend tree
    codePanel(s, 6.83, 2.25, 5.9, 3.05, [
      "src/modules/",
      "  auth/",
      "    views/        // pantallas",
      "    components/   // piezas UI",
      "    services/     // llamadas API",
      "    stores/       // estado Pinia",
      "  dashboard/  projects/",
      "  diagrams/  settings/  bot/",
    ], 11.5);
    s.addText("FRONTEND  ·  views → components → services → stores", { x: 6.93, y: 5.35, w: 5.8, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VIOLET_DEEP, margin: 0 });
    // benefit strip
    card(s, M, 5.85, W - 2 * M, 0.85, LILAC_BG);
    await iconChip(s, M + 0.28, 5.98, 0.6, "FaCubes", WHITE, VIOLET);
    s.addText("Fácil de entender, mantener y ampliar: una funcionalidad nueva = una carpeta más con el mismo molde.", { x: M + 1.05, y: 5.85, w: 11.4, h: 0.85, valign: "middle", fontFace: BODY, fontSize: 13.5, color: TEXT, margin: 0 });
    pageNum(s, 9);
  }

  // ---------- 10. BASE DE DATOS ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "Datos", "Base de datos · MySQL · 6 tablas");
    const cw = 3.84, gy = 0.18, top = 1.72;
    const xA = 0.6, xB = 4.746, xC = 8.892;
    // Column A: users + bot_sessions
    let h = tableCard(s, xA, top, cw, "users", [
      ["id", "uuid", "PK"], ["email", "varchar", "UQ"], ["name", "varchar", ""],
      ["password_hash", "varchar", ""], ["created_at", "datetime", ""],
    ]);
    tableCard(s, xA, top + h + gy, cw, "bot_sessions", [
      ["id", "uuid", "PK"], ["user_id", "uuid", "FK"], ["title", "varchar", ""],
      ["history_json", "longtext", ""], ["created_at", "datetime", ""], ["updated_at", "datetime", ""],
    ]);
    // Column B: projects + bot_files
    h = tableCard(s, xB, top, cw, "projects", [
      ["id", "uuid", "PK"], ["user_id", "uuid", "FK"], ["name", "varchar", ""],
      ["description", "text", ""], ["created_at", "datetime", ""], ["last_update", "datetime", ""],
    ]);
    tableCard(s, xB, top + h + gy, cw, "bot_files", [
      ["session_id", "uuid", "FK·PK"], ["path", "varchar", "PK"],
      ["content", "longtext", ""], ["updated_at", "datetime", ""],
    ]);
    // Column C: diagrams (12) + user_settings
    h = tableCard(s, xC, top, cw, "diagrams", [
      ["id", "uuid", "PK"], ["user_id", "uuid", "FK"], ["project_id", "uuid", "FK"],
      ["name", "varchar", ""], ["description", "text", ""], ["model_json", "longtext", ""],
      ["layout_json", "longtext", ""], ["count_modules", "smallint", ""], ["count_screens", "smallint", ""],
      ["count_tables", "smallint", ""], ["count_flows", "smallint", ""], ["created_at", "datetime", ""],
    ]);
    tableCard(s, xC, top + h + gy, cw, "user_settings", [
      ["user_id", "uuid", "PK"], ["theme", "varchar", ""],
    ]);
    // relations strip
    card(s, M, 5.72, W - 2 * M, 0.75, INK);
    await iconChip(s, M + 0.26, 5.85, 0.5, "FaKey", INK, AMBER);
    s.addText([
      { text: "Relaciones:  ", options: { bold: true, color: WHITE } },
      { text: "users 1—1 user_settings · users 1—N projects 1—N diagrams · users 1—N bot_sessions 1—N bot_files.   ", options: { color: LILAC } },
      { text: "Borrado en cascada · toda consulta filtra por user_id.", options: { bold: true, color: TEAL } },
    ], { x: M + 1.0, y: 5.72, w: 11.5, h: 0.75, valign: "middle", fontFace: BODY, fontSize: 12.5, margin: 0, lineSpacingMultiple: 1.05 });
    pageNum(s, 10);
  }

  // ---------- 11. EL FORMATO .md ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "El corazón", "El formato .md que interpreta");
    // folder tree
    codePanel(s, M, 1.95, 6.0, 4.7, [
      "app-doc/",
      "  01-modules.md       índice de módulos",
      "  modules/backend/    módulos backend",
      "  modules/frontend/   módulos frontend",
      "  screens/            pantallas",
      "  flows/              flujos",
      "  database/           tablas (DBML)",
      "  05-system-rules.md  reglas globales",
    ], 12);
    // right: explanation
    card(s, 6.85, 1.95, 5.85, 2.25, WHITE);
    s.addText("7 tipos de archivo", { x: 7.15, y: 2.15, w: 5, h: 0.45, fontFace: HEAD, fontSize: 17, bold: true, color: TEXT, margin: 0 });
    s.addText("Cada archivo describe una pieza de la app y se convierte en un nodo del diagrama.", { x: 7.15, y: 2.62, w: 5.3, h: 0.8, fontFace: BODY, fontSize: 13.5, color: "4A4460", margin: 0, lineSpacingMultiple: 1.1 });
    s.addText("Cada elemento tiene un ID único; los demás archivos lo referencian por ese ID.", { x: 7.15, y: 3.45, w: 5.3, h: 0.7, fontFace: BODY, fontSize: 13.5, color: TEXT, bold: true, margin: 0, lineSpacingMultiple: 1.1 });

    card(s, 6.85, 4.4, 2.83, 2.25, INK);
    await iconChip(s, 7.1, 4.65, 0.7, "FaHashtag", WHITE, VIOLET);
    s.addText("Frontmatter", { x: 7.1, y: 5.4, w: 2.5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, margin: 0 });
    s.addText("metadatos + referencias (IDs) → las flechas", { x: 7.1, y: 5.78, w: 2.4, h: 0.8, fontFace: BODY, fontSize: 11.5, color: "DBD1F8", margin: 0, lineSpacingMultiple: 1.05 });

    card(s, 9.88, 4.4, 2.83, 2.25, INK);
    await iconChip(s, 10.13, 4.65, 0.7, "FaAlignLeft", WHITE, TEAL);
    s.addText("Secciones ##", { x: 10.13, y: 5.4, w: 2.5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, margin: 0 });
    s.addText("el contenido que se ve al hacer clic en el nodo", { x: 10.13, y: 5.78, w: 2.4, h: 0.8, fontFace: BODY, fontSize: 11.5, color: "DBD1F8", margin: 0, lineSpacingMultiple: 1.05 });
    pageNum(s, 11);
  }

  // ---------- 12. ANATOMÍA DE UN ARCHIVO ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "El corazón", "Anatomía de un archivo");
    codePanel(s, M, 1.95, 7.2, 4.75, [
      "---",
      "type: module",
      "layer: backend",
      "id: auth-backend          ← identificador único",
      "name: Autenticación",
      "database: [users]         ← flecha hacia la tabla",
      "api: [POST /auth/login]",
      "depends-on: []            ← flechas a otros módulos",
      "---",
      "## Purpose",
      "Gestiona identidad, sesiones y acceso.",
      "## Functions",
      "- login(email, password)",
      "- validateSession(token)",
    ], 12.5);
    // right cards
    card(s, 8.05, 1.95, 4.68, 2.25, VIOLET);
    await iconChip(s, 8.32, 2.22, 0.75, "FaHashtag", VIOLET, WHITE);
    s.addText("Frontmatter = conexiones", { x: 9.25, y: 2.3, w: 3.3, h: 0.6, valign: "middle", fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, margin: 0 });
    s.addText("Los campos con IDs (database, depends-on…) le dicen al parser con qué conectar este nodo. Eso son las flechas del diagrama.", { x: 8.32, y: 3.1, w: 4.1, h: 1.0, fontFace: BODY, fontSize: 13, color: WHITE, margin: 0, lineSpacingMultiple: 1.12 });

    card(s, 8.05, 4.4, 4.68, 2.25, INK);
    await iconChip(s, 8.32, 4.67, 0.75, "FaAlignLeft", INK, TEAL);
    s.addText("Secciones = contenido", { x: 9.25, y: 4.75, w: 3.3, h: 0.6, valign: "middle", fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, margin: 0 });
    s.addText("## Purpose, ## Functions… es lo que se muestra en el panel de detalle al pulsar el nodo.", { x: 8.32, y: 5.55, w: 4.1, h: 1.0, fontFace: BODY, fontSize: 13, color: LILAC, margin: 0, lineSpacingMultiple: 1.12 });
    pageNum(s, 12);
  }

  // ---------- 13. MÁS EJEMPLOS ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "El corazón", "El mismo formato, otras piezas");
    const pw = 6.0, ph = 1.9;
    const r1 = 1.88, r2 = 4.42;
    codePanel(s, M, r1, pw, ph, [
      "--- type: modules-index",
      "backend:  [auth-backend, ...]",
      "frontend: [auth-frontend, ...] ---",
      "## Overview",
      "Módulos por responsabilidad...",
    ], 10.5);
    s.addText("Índice de módulos", { x: M + 0.1, y: r1 + ph + 0.06, w: 5, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VIOLET_DEEP, margin: 0 });

    codePanel(s, 6.83, r1, pw, ph, [
      "--- type: screen",
      "id: login",
      "module: auth-frontend  ← su módulo",
      "requires-auth: false ---",
      "## Elements  / ## Actions",
    ], 10.5);
    s.addText("Pantalla", { x: 6.93, y: r1 + ph + 0.06, w: 5, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VIOLET_DEEP, margin: 0 });

    codePanel(s, M, r2, pw, ph, [
      "--- type: module · layer: frontend",
      "id: auth-frontend",
      "screens: [login, register]  ← pantallas",
      "consumes-api: [auth-backend] ---",
      "## State  / ## Functions",
    ], 10.5);
    s.addText("Módulo de frontend", { x: M + 0.1, y: r2 + ph + 0.06, w: 5, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VIOLET_DEEP, margin: 0 });

    codePanel(s, 6.83, r2, pw, ph, [
      "--- type: entity · id: users ---",
      "## Table  ```dbml",
      "Table users { id pk, email, ... }",
      "Ref: users.id < projects.user_id",
      "```",
    ], 10.5);
    s.addText("Tabla de base de datos (DBML)", { x: 6.93, y: r2 + ph + 0.06, w: 5, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: VIOLET_DEEP, margin: 0 });
    pageNum(s, 13);
  }

  // ---------- 14. EL FLUJO ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "El corazón", "El flujo: texto que se vuelve recorrido");
    codePanel(s, M, 1.95, 7.0, 4.0, [
      "--- type: flow · id: user-login ---",
      "## Steps",
      "- [screen:login] Rellena el formulario",
      "- [frontend:auth-frontend/Login.vue]",
      "    valida y llama a POST /auth/login",
      "- [backend:auth-backend/.../login]",
      "    comprueba credenciales",
      "- [database:users] consulta el usuario",
      "- [screen:dashboard] guarda token",
    ], 11.5);
    s.addText("Cada paso lleva un prefijo  [capa:módulo/archivo/función]", { x: M + 0.1, y: 6.05, w: 7, h: 0.4, fontFace: HEAD, fontSize: 12, bold: true, color: VIOLET_DEEP, margin: 0 });
    // right: vertical path
    const chips = [["FaDesktop", "Pantalla", VIOLET], ["FaVuejs", "Frontend", "42B883"], ["FaServer", "Backend", VIOLET_DEEP], ["FaDatabase", "Base de datos", TEAL], ["FaDesktop", "Pantalla", VIOLET]];
    let y = 1.95;
    const bx = 8.4;
    for (let k = 0; k < chips.length; k++) {
      const [ic, t, col] = chips[k];
      card(s, bx, y, 4.3, 0.72, WHITE);
      await iconChip(s, bx + 0.15, y + 0.11, 0.5, ic, WHITE, col);
      s.addText(t, { x: bx + 0.8, y, w: 3.4, h: 0.72, valign: "middle", fontFace: HEAD, fontSize: 14, bold: true, color: TEXT, margin: 0 });
      if (k < chips.length - 1) s.addShape(pres.shapes.LINE, { x: bx + 0.4, y: y + 0.72, w: 0, h: 0.26, line: { color: AMBER, width: 2.5, endArrowType: "triangle" } });
      y += 0.98;
    }
    pageNum(s, 14);
  }

  // ---------- 15. PIPELINE PARSER ----------
  {
    const s = pres.addSlide(); bg(s, INK);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 0.5, w: 0.16, h: 0.16, fill: { color: VIOLET_LT }, rectRadius: 0.04, line: { type: "none" } });
    s.addText("CÓMO SE TRANSFORMA", { x: M + 0.28, y: 0.43, w: 9, h: 0.3, fontFace: HEAD, fontSize: 12, bold: true, color: VIOLET_LT, charSpacing: 2, valign: "middle", margin: 0 });
    s.addText("El pipeline del parser: de texto a diagrama", { x: M, y: 0.78, w: W - 2 * M, h: 0.85, fontFace: HEAD, fontSize: 28, bold: true, color: WHITE, margin: 0 });
    const steps = [
      ["FaFileCode", "Extraer", "frontmatter + secciones"],
      ["FaCheckCircle", "Validar", "campos obligatorios"],
      ["FaCubes", "Construir", "modelo unificado"],
      ["FaProjectDiagram", "Resolver", "referencias (IDs)"],
      ["FaThLarge", "Layout", "posición de nodos"],
    ];
    const n = steps.length, gap = 0.35;
    const sw = (W - 2 * M - gap * (n - 1)) / n;
    for (let k = 0; k < n; k++) {
      const x = M + k * (sw + gap), y = 2.4;
      card(s, x, y, sw, 2.6, INK2);
      await iconChip(s, x + sw / 2 - 0.45, y + 0.32, 0.9, steps[k][0], WHITE, VIOLET);
      s.addText(String(k + 1), { x: x + 0.18, y: y + 0.14, w: 0.5, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: VIOLET_LT, margin: 0 });
      s.addText(steps[k][1], { x: x, y: y + 1.4, w: sw, h: 0.4, align: "center", fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, margin: 0 });
      s.addText(steps[k][2], { x: x + 0.1, y: y + 1.85, w: sw - 0.2, h: 0.65, align: "center", fontFace: BODY, fontSize: 11.5, color: LILAC, margin: 0, lineSpacingMultiple: 1.0 });
      if (k < n - 1) s.addShape(pres.shapes.LINE, { x: x + sw + 0.04, y: y + 1.3, w: gap - 0.08, h: 0, line: { color: VIOLET_LT, width: 2.5, endArrowType: "triangle" } });
    }
    card(s, M, 5.35, W - 2 * M, 1.05, VIOLET);
    await iconChip(s, M + 0.3, 5.5, 0.72, "FaSave", VIOLET, WHITE);
    s.addText([
      { text: "Resultado: un JSON ", options: { bold: true, color: WHITE } },
      { text: "que el frontend dibuja con Vue Flow. Modelo y posiciones se guardan, así reabres el diagrama tal cual lo dejaste.", options: { color: LILAC } },
    ], { x: M + 1.2, y: 5.35, w: 11.3, h: 1.05, valign: "middle", fontFace: BODY, fontSize: 15, margin: 0 });
  }

  // ---------- 16. ASISTENTE IA ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "Integración de IA", "El asistente que escribe el formato por ti");
    card(s, M, 1.95, 5.9, 4.7, INK);
    await iconChip(s, M + 0.4, 2.3, 1.0, "FaComments", WHITE, VIOLET);
    s.addText("Le describes tu app\nen lenguaje natural", { x: M + 1.6, y: 2.35, w: 4.1, h: 0.9, valign: "middle", fontFace: HEAD, fontSize: 17, bold: true, color: WHITE, margin: 0, lineSpacingMultiple: 0.95 });
    s.addText([
      { text: "Conversa y mantiene historial por sesión", options: { bullet: true, breakLine: true, color: LILAC } },
      { text: "Genera los .md con el formato correcto", options: { bullet: true, breakLine: true, color: LILAC } },
      { text: "Valida cada archivo antes de guardarlo", options: { bullet: true, breakLine: true, color: LILAC } },
      { text: "Los descargas como un .zip listo para usar", options: { bullet: true, color: LILAC } },
    ], { x: M + 0.45, y: 3.6, w: 5.2, h: 2.8, fontFace: BODY, fontSize: 14, margin: 0, paraSpaceAfter: 10 });

    card(s, 6.83, 1.95, 5.9, 4.7, WHITE);
    await iconChip(s, 7.18, 2.3, 1.0, "FaRobot", WHITE, "4285F4");
    s.addText("Google Gemini", { x: 8.3, y: 2.4, w: 4, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: TEXT, margin: 0 });
    s.addText("2.5 Flash / Flash-lite", { x: 8.3, y: 2.85, w: 4, h: 0.35, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0 });
    s.addText([
      { text: "Eliges el modelo según velocidad o cuota", options: { bullet: true, breakLine: true } },
      { text: "Si se agota la cuota, te ofrece cambiar de modelo", options: { bullet: true, breakLine: true } },
      { text: "La API key vive solo en el servidor", options: { bullet: true, breakLine: true } },
      { text: "Cubre el requisito de integrar IA del ciclo", options: { bullet: true } },
    ], { x: 7.28, y: 3.55, w: 5.2, h: 2.0, fontFace: BODY, fontSize: 13.5, color: TEXT, margin: 0, paraSpaceAfter: 9 });
    s.addShape(pres.shapes.RECTANGLE, { x: 7.28, y: 5.95, w: 5.1, h: 0.02, fill: { color: LILAC }, line: { type: "none" } });
    s.addText("Cierra el círculo: la IA produce el formato → CodeAtlas lo dibuja.", { x: 7.28, y: 6.05, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 12.5, italic: true, color: VIOLET_DEEP, margin: 0 });
    pageNum(s, 16);
  }

  // ---------- 17. SEGURIDAD ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "Robustez", "Seguridad");
    const items = [
      ["FaUserLock", "JWT", "Token firmado que caduca; se envía en cada petición."],
      ["FaFingerprint", "bcrypt", "Las contraseñas nunca se guardan en texto plano."],
      ["FaUserShield", "Aislamiento", "Toda consulta filtra por user_id: nadie ve datos de otro."],
      ["FaShieldAlt", "Validación", "Entradas validadas y consultas parametrizadas (anti SQL-injection)."],
    ];
    const cw = 5.9, ch = 2.05;
    let i = 0;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const x = M + c * (cw + 0.23), y = 2.0 + r * (ch + 0.25);
      card(s, x, y, cw, ch, WHITE);
      await iconChip(s, x + 0.35, y + 0.35, 1.0, items[i][0], WHITE, VIOLET);
      s.addText(items[i][1], { x: x + 1.55, y: y + 0.32, w: 4.1, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: TEXT, margin: 0 });
      s.addText(items[i][2], { x: x + 1.55, y: y + 0.85, w: 4.1, h: 1.0, fontFace: BODY, fontSize: 13.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.12 });
      i++;
    }
    pageNum(s, 17);
  }

  // ---------- 18. PRODUCCIÓN ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "Robustez", "Desplegada en producción");
    const steps = [["FaDocker", "Docker", "App contenerizada"], ["FaServer", "Kubernetes", "Orquestada en el clúster"], ["FaNetworkWired", "HTTP", "Servidor interno del instituto"], ["FaGlobe", "URL interna", "Accesible en la red"]];
    const n = 4, gap = 0.3;
    const sw = (W - 2 * M - gap * (n - 1)) / n;
    for (let k = 0; k < n; k++) {
      const x = M + k * (sw + gap), y = 2.3;
      card(s, x, y, sw, 2.7, WHITE);
      await iconChip(s, x + sw / 2 - 0.5, y + 0.35, 1.0, steps[k][0], WHITE, VIOLET);
      s.addText(steps[k][1], { x, y: y + 1.5, w: sw, h: 0.45, align: "center", fontFace: HEAD, fontSize: 17, bold: true, color: TEXT, margin: 0 });
      s.addText(steps[k][2], { x: x + 0.1, y: y + 1.95, w: sw - 0.2, h: 0.6, align: "center", fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0 });
      if (k < n - 1) s.addShape(pres.shapes.LINE, { x: x + sw + 0.02, y: y + 1.35, w: gap - 0.04, h: 0, line: { color: VIOLET, width: 2.5, endArrowType: "triangle" } });
    }
    card(s, M, 5.4, W - 2 * M, 1.0, INK);
    await iconChip(s, M + 0.3, 5.55, 0.7, "FaCheckCircle", INK, TEAL);
    s.addText("Cumple el requisito del ciclo: app web funcional, desplegada (sin FTP) y con frontend/backend separados.", { x: M + 1.2, y: 5.4, w: 11.3, h: 1.0, valign: "middle", fontFace: BODY, fontSize: 14.5, color: LILAC, margin: 0 });
    pageNum(s, 18);
  }

  // ---------- 19. PRÓXIMOS PASOS ----------
  {
    const s = pres.addSlide(); bg(s, PAPER);
    header(s, "Hacia dónde va", "Próximos pasos");
    const items = [
      ["FaCode", "Analizar apps existentes", "Generar el diagrama directamente desde el código ya escrito (application-diagram)."],
      ["FaMagic", "Código alineado con el diagrama", "La IA escribe código y documentación sincronizados, sin esfuerzo extra."],
      ["FaUsers", "Trabajo en equipo", "Colaboración y diagramas compartidos dentro de la herramienta."],
    ];
    let y = 2.0;
    for (const [ic, t, d] of items) {
      card(s, M, y, W - 2 * M, 1.35);
      await iconChip(s, M + 0.35, y + 0.27, 0.8, ic, WHITE, VIOLET);
      s.addText(t, { x: M + 1.4, y: y + 0.22, w: 10.5, h: 0.45, fontFace: HEAD, fontSize: 17, bold: true, color: TEXT, margin: 0 });
      s.addText(d, { x: M + 1.4, y: y + 0.68, w: 10.7, h: 0.55, fontFace: BODY, fontSize: 13.5, color: MUTED, margin: 0 });
      y += 1.53;
    }
    pageNum(s, 19);
  }

  // ---------- 20. CIERRE / DEMO ----------
  {
    const s = pres.addSlide(); bg(s, INK);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.7, y: -1.4, w: 4.5, h: 4.5, fill: { color: VIOLET, transparency: 86 }, rectRadius: 1.0, line: { type: "none" }, rotate: 18 });
    s.addImage({ data: LOGO, x: M, y: 1.6, w: 1.2, h: 1.2 });
    s.addText("¿Pasamos a la demo?", { x: M, y: 3.0, w: 11, h: 1.0, fontFace: HEAD, fontSize: 48, bold: true, color: WHITE, margin: 0 });
    s.addText("Os lo enseño funcionando en tiempo real.", { x: M, y: 4.1, w: 10, h: 0.5, fontFace: BODY, fontSize: 19, color: LILAC, margin: 0 });
    await iconChip(s, M, 5.1, 0.7, "FaPlayCircle", VIOLET, WHITE);
    s.addText("CodeAtlas  ·  Izan Mendoza  ·  Gracias", { x: M + 0.95, y: 5.1, w: 10, h: 0.7, valign: "middle", fontFace: BODY, fontSize: 15, color: WHITE, margin: 0 });
  }

  await pres.writeFile({ fileName: "C:/programacion/CodeAtlas/documentos-clase/CodeAtlas - Presentacion.pptx" });
  console.log("DONE");
}

build().catch(e => { console.error(e); process.exit(1); });
