// Builds site/plan.json from the 92-day plan in wyncall-agent (docs/PLAN_90_DIAS.md).
// Run it whenever the plan changes:  node build.js
const fs = require("fs");
const path = require("path");

const SOURCE = path.join(__dirname, "..", "wyncall-agent", "docs", "PLAN_90_DIAS.md");
const OUT = path.join(__dirname, "site", "plan.json");
const MONTHS = { oct: [2026, 10], nov: [2026, 11], dic: [2026, 12], ene: [2027, 1] };
// Titles for the weeks the plan leaves untitled.
const TITLES = {
  "Semana 7": "cifras y pilotos 6 a 10",
  "Semana 8": "caso de éxito y paso a cuota",
  "Semana 10": "agencias y páginas por especialidad",
  "Semana 11": "campaña «enero sin huecos vacíos»",
  "Semana 12": "cierres y alta en autoservicio",
  "Semana 13": "retención y primer partner",
};

// The page is public: tasks written for the founder (internal names, commands, providers) are
// said in plain words, and "you" becomes "I".
const PUBLIC = [
  [/^Pedir un número español \+34 en Twilio.*$/, "Pedir el número de teléfono español para las llamadas."],
  [/^Si Twilio ha aprobado el expediente.*$/, "Activar el número de teléfono español en el agente, si ya está aprobado."],
  [/^Bloque A, punto 1: .*$/, "Guiones del agente para clínicas: sin preguntas de salud y con las dudas médicas a recepción."],
  [/^Bloque A, puntos 2 y 3: .*$/, "Prueba gratis por especialidad y agente de demo «Clínica Dental Sonrisa»."],
  [/^Bloque A, punto 4: .*$/, "Empezar la página para clínicas: titular, casos de uso y botón de prueba."],
  [/^Bloque A, puntos 4 y 5: .*$/, "Terminar la página (calculadora de ausencias y preguntas frecuentes) y probar el agente con 3 clínicas reales."],
  [/^Desplegar \(make deploy.*$/, "Publicar los cambios y probar los agentes de clínica con llamadas reales a mi móvil."],
  [/^Bloque B: (.*)$/, (_, rest) => rest[0].toUpperCase() + rest.slice(1)],
  [/^Preparar condiciones del piloto y contrato .*$/, "Preparar las condiciones del piloto y el contrato de protección de datos."],
  [/ y repasar las «reglas propias» del principio con cada piloto\./, "."],
  [/\btu ciudad\b/g, "mi ciudad"],
  [/\btu móvil\b/g, "mi móvil"],
  [/quién eres/g, "quién soy"],
  [/^Vídeo del día: enseña /, "Vídeo del día: enseño "],
  // No money in public: no prices, income or margins.
  [/, 290 €,/, ","],
  [/ Si se cumple, se descuenta del primer mes de Growth\./, " Si se cumple, se descuenta del primer mes."],
  [/^Firmar pilotos y cobrar los 290 € \(enlace de pago de Stripe\)\./, "Firmar y cobrar los pilotos."],
  [/Proponer el paso a Growth \(449 €\) al acabar\./, "Proponer el paso a la cuota mensual al acabar."],
  [/ y precio para clínicas en la web \(Growth con el piloto descontado\)/, " para clínicas en la web"],
  [/clientes, ingresos al mes, conversión de piloto a cuota, bajas y margen/, "clientes, conversión de piloto a cuota y bajas"],
  [/ \(15 clientes, ~5\.000 €\/mes\)/, " (15 clientes)"],
];
const forPublic = (task) => PUBLIC.reduce((t, [re, to]) => t.replace(re, to), task.replace(/`/g, ""));

const md = fs.readFileSync(SOURCE, "utf8").replace(/\r\n/g, "\n");
const weeks = [];
let phase = "";
let week = null;
let day = null;
let inPhases = false;

for (const line of md.split("\n")) {
  const ph = line.match(/^## (Fase \d): ([^(]+)\(/);
  if (ph) {
    phase = `${ph[1]} · ${ph[2].trim()}`;
    inPhases = true;
    week = { label: ph[1], title: ph[2].trim() === "Pilotos" ? "arranque de los pilotos" : "repaso de los pilotos", phase, days: [] };
    weeks.push(week);
    continue;
  }
  if (/^## /.test(line)) {
    inPhases = false;
    continue;
  }
  if (!inPhases) continue;
  const wk = line.match(/^### (Semana \d+)(?:: (.*))?$/);
  if (wk) {
    week = { label: wk[1], title: wk[2] || TITLES[wk[1]] || "", phase, days: [] };
    weeks.push(week);
    continue;
  }
  const d = line.match(/^\*\*(\S+) (\d+) (oct|nov|dic|ene)(?:: ([^*]+))?\*\*/);
  if (d) {
    const [y, m] = MONTHS[d[3]];
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(+d[2]).padStart(2, "0")}`;
    day = { dow: d[1], date: `${d[2]} ${d[3]}`, iso, tag: (d[4] || "").trim(), tasks: [] };
    week.days.push(day);
    continue;
  }
  const t = line.match(/^- \[[ x]\] (.*)$/);
  if (t && day) day.tasks.push(forPublic(t[1]));
}

const out = weeks.filter((w) => w.days.length);
const days = out.reduce((n, w) => n + w.days.length, 0);
if (days !== 92) throw new Error(`Expected 92 days in the plan, found ${days}`);
fs.writeFileSync(OUT, JSON.stringify({ source: "PLAN_90_DIAS.md", weeks: out }, null, 1));
console.log(`site/plan.json: ${out.length} weeks, ${days} days`);
