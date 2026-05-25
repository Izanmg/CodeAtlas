const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat } = require("docx");

const cards = [
  ["Portada", [
    "Saluda y preséntate.",
    "CodeAtlas: convierte el código en un mapa visual e interactivo.",
    "Formato: 15 min de explicación + 5 min de demo.",
  ]],
  ["El problema — entender", [
    "Entender una app nueva cuesta días leyendo código.",
    "Quien entra nuevo tarda en ser productivo.",
  ]],
  ["El problema — mantener", [
    "Ya hay formatos para dibujar apps; lo difícil es mantenerlos.",
    "Se actualizan a mano y por separado → se desfasan.",
    "Están dispersos en herramientas distintas.",
    "CodeAtlas: un origen de verdad, sincronizado y centralizado.",
  ]],
  ["De dónde viene la idea", [
    "La IA traduce muy bien humano ↔ máquina.",
    "Analiza la app y la pasa a un formato que se dibuja.",
    "CodeAtlas la transforma en esquema visual.",
    "Caso estrella: onboarding en minutos, no días.",
  ]],
  ["No solo para entenderla entera", [
    "No solo ver la app completa de golpe.",
    "Día a día: antes de tocar código ves cómo funcionan los archivos que cambiarás.",
    "Sigues el patrón del proyecto, no rompes la estructura.",
  ]],
  ["La visión a futuro", [
    "Programas con un agente de IA (p. ej. Claude Code).",
    "Un skill hace que al escribir código genere/actualice la doc solo.",
    "Doc y diagrama siempre al día, sin esfuerzo extra.",
  ]],
  ["¿Qué hace CodeAtlas?", [
    "Subes carpeta .md → la interpreta → diagrama interactivo.",
    "Ves módulos, pantallas, BD y flujos conectados.",
    "No es estático: mueves nodos, filtras, ves detalles.",
  ]],
  ["Lenguajes y tecnologías", [
    "JavaScript de punta a punta (los que mejor conozco).",
    "Front: Vue 3 + Vite + Pinia + Vue Flow.",
    "Back: Node + Express, MySQL, Google Gemini.",
  ]],
  ["Arquitectura modular", [
    "Cada área = su propia carpeta.",
    "Back: routes → controller → service → repository.",
    "Front: views → components → services → stores.",
    "Fácil de entender, mantener y ampliar.",
    "Front y back separados, vía API REST.",
  ]],
  ["Base de datos", [
    "MySQL, 6 tablas relacionadas.",
    "users, user_settings, projects, diagrams, bot_sessions, bot_files.",
    "diagrams guarda el modelo y el layout en JSON.",
    "Toda consulta filtra por user_id; borrado en cascada.",
  ]],
  ["El formato .md", [
    "Lee archivos .md con un formato concreto.",
    "7 tipos de archivo; cada uno = un nodo.",
    "Frontmatter (IDs) → las flechas del diagrama.",
    "Secciones ## → el contenido del nodo.",
  ]],
  ["Anatomía de un archivo", [
    "Ejemplo: un módulo de backend.",
    "Campos con IDs (database, depends-on) → flechas.",
    "Secciones ## Purpose / ## Functions → panel de detalle.",
  ]],
  ["El mismo formato, otras piezas", [
    "Pasa rápido: índice, pantalla, módulo frontend, tabla DBML.",
    "Mismo formato aplicado a piezas distintas.",
  ]],
  ["El flujo", [
    "El más especial: una secuencia de pasos entre capas.",
    "Cada paso lleva un prefijo [capa:módulo/archivo/función].",
    "Se ilumina el recorrido: pantalla → frontend → backend → BD.",
    "Ves qué pasa cuando el usuario hace algo, sin leer código.",
  ]],
  ["El pipeline del parser", [
    "Al subir los archivos se ejecuta un pipeline lineal.",
    "Extraer → validar → construir modelo → resolver → layout.",
    "Resultado: un JSON que dibuja Vue Flow.",
    "Se guarda modelo + posiciones (reabres como lo dejaste).",
  ]],
  ["El asistente de IA", [
    "Describe la app en lenguaje natural; Gemini genera los .md.",
    "Conversa, guarda historial y valida los archivos.",
    "Los descargas en un .zip listo para usar.",
    "Eliges modelo; si se agota la cuota, ofrece cambiar. API key solo en server.",
    "Cubre el requisito de integrar IA.",
  ]],
  ["Seguridad", [
    "JWT (token firmado que caduca).",
    "Contraseñas con bcrypt, nunca en texto plano.",
    "Aislamiento: toda consulta filtra por user_id.",
    "Validación + consultas parametrizadas (anti SQL-injection).",
  ]],
  ["Desplegada en producción", [
    "Docker + Kubernetes.",
    "Servidor interno del instituto: acceso por HTTP (no HTTPS), URL interna.",
    "Cumple el requisito de despliegue (sin FTP), front/back separados.",
  ]],
  ["Próximos pasos", [
    "Analizar apps existentes desde el código (application-diagram).",
    "Generar código alineado con el diagrama.",
    "Trabajo en equipo y diagramas compartidos.",
  ]],
  ["Cierre / Demo", [
    "Recap en una frase.",
    "“Y ahora os lo enseño funcionando” → pasa a la demo.",
  ]],
  ["DEMO EN VIVO (5 min)", [
    "Login (credenciales listas).",
    "Dashboard: proyectos y diagramas recientes.",
    "Asistente IA: describe app → genera .md → descarga zip.",
    "Generar diagrama: sube .md, muestra progreso.",
    "Canvas: mover nodos, undo/redo, modo Flujos, clic en nodo, filtros.",
    "Cierre: vuelve al dashboard y di “Gracias”.",
    "Plan B: si falla la red/IA, salta al Canvas con un diagrama ya hecho.",
  ]],
];

const children = [];
cards.forEach(([title, bullets], i) => {
  children.push(new Paragraph({
    keepNext: true, keepLines: true, spacing: { after: 140 },
    children: [new TextRun({ text: `${i + 1}.  ${title}`, bold: true, size: 30 })],
  }));
  bullets.forEach((b, j) => children.push(new Paragraph({
    numbering: { reference: "bul", level: 0 },
    keepLines: true, keepNext: j < bullets.length - 1, spacing: { after: 80 },
    children: [new TextRun({ text: b, size: 24 })],
  })));
  // espacio en blanco para recortar (de extremo a extremo)
  children.push(new Paragraph({ children: [new TextRun({ text: "", size: 28 })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: "", size: 28 })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: "", size: 28 })] }));
});

const doc = new Document({
  styles: { default: { document: { run: { font: "Arial", size: 24 } } } },
  numbering: {
    config: [{
      reference: "bul",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 280 } } } }],
    }],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("C:/programacion/CodeAtlas/documentos-clase/CodeAtlas - Tarjetas exposicion.docx", buf);
  console.log("DONE");
});
