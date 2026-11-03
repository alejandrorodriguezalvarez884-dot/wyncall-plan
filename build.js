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
  "Semana 8": "caso de éxito y clientes",
  "Semana 10": "agencias y páginas por especialidad",
  "Semana 11": "campaña «enero sin huecos vacíos»",
  "Semana 12": "cierres y alta en autoservicio",
  "Semana 13": "retención y primer partner",
};

// Week titles from the plan that need public wording.
const PUBLIC_TITLES = { "Semana 3": "probar caminos para darnos a conocer" };

// The page is public: tasks written for the founder (internal names, commands, providers) are
// said in plain words, and "you" becomes "I".
const PUBLIC = [
  [/^Pedir un número español \+34 en Twilio.*$/, "Pedir el número de teléfono español para las llamadas."],
  [/^Si Twilio ha aprobado el expediente.*$/, "Activar el número de teléfono español en el agente, si ya está aprobado."],
  [/^Bloque A, punto 1: .*$/, "Guiones del agente para clínicas: sin preguntas de salud y con las dudas médicas a recepción."],
  [/^Bloque A, punto 2: .*$/, "Prueba gratis que se abre con la especialidad de la clínica ya elegida."],
  [/^Bloque A, punto 3: .*$/, "Vídeo corto de demo: una llamada de una clínica inventada, «Clínica Dental Sonrisa»."],
  [/^Bloque A, punto 4: .*$/, "Empezar la página para clínicas: titular, casos de uso y botón de prueba."],
  [/^Bloque A, puntos 4 y 5: .*$/, "Terminar la página (calculadora de ausencias y preguntas frecuentes) y probar el agente con 3 clínicas reales."],
  [/^Desplegar \(make deploy.*$/, "Publicar los cambios y probar los agentes de clínica con llamadas reales a mi móvil."],
  [/^Cierres y suscripciones en Stripe.$/, "Cierres y cobro de las suscripciones."],
  [/^Bloque B: (.*)$/, (_, rest) => rest[0].toUpperCase() + rest.slice(1)],
  [/^Preparar condiciones del piloto y contrato .*$/, "Preparar las condiciones del piloto y el contrato de protección de datos."],
  [/ y repasar las «reglas propias» del principio con cada piloto\./, "."],
  [/^Darse de alta como autónomo.*$/, "Darme de alta como autónomo para poder firmar y facturar los pilotos."],
  [/^Que el pago del piloto \(enlace de Stripe\) abra/, "Que al pagar el piloto se abra"],
  [/ con el checklist de docs\/CLIENT_DEPLOYMENT\.md:/, " con la lista de pasos de cada clínica:"],
  [/ \(ver docs\/CLIENT_DEPLOYMENT\.md\)/, ""],
  [/\btu ciudad\b/g, "mi ciudad"],
  [/\btu móvil\b/g, "mi móvil"],
  [/quién eres/g, "quién soy"],
  [/^Vídeo del día: enseña /, "Vídeo del día: enseño "],
  // No money in public: no prices, income or margins.
  [/, 290 €,/, ","],
  [/ Si se cumple, se descuenta del primer mes de Growth\./, " Si se cumple, se descuenta del primer mes."],
  [/^Firmar pilotos y cobrar los 290 € \(enlace de pago de Stripe\)\./, "Firmar y cobrar los pilotos."],
  [/^Redactar la oferta de piloto gratis: 30 días sin coste ni compromiso, con/, "Redactar la oferta de piloto: 30 días con"],
  [/ Sin precios: al final se repasan .*$/, " Al final se repasan los resultados con la clínica."],
  [/^Firmar los pilotos gratis: (.*) Sin cobro\.$/, (_, rest) => "Firmar los pilotos: " + rest],
  [/^¿5 pilotos gratis firmados y en marcha\?/, "¿5 pilotos firmados y en marcha?"],
  [/Proponer el paso a Growth \(449 €\) al acabar\./, "Proponer el paso a la cuota mensual al acabar."],
  [/ y precio para clínicas en la web \(Growth con el piloto descontado\)/, " para clínicas en la web"],
  [/clientes, ingresos al mes, conversión de piloto a cuota, bajas y margen/, "clientes, conversión de piloto a cuota y bajas"],
  [/ \(15 clientes, ~5\.000 €\/mes\)/, " (15 clientes)"],
  // Since 3 Nov 2026 (founder): no «de pago», «gratis», «cuota» or anything about money; no ads,
  // paid promotion or their cost; no clinic names; no internal jargon (utm); and the lead audit
  // stays a neutral «prueba con 5 clínicas» until each clinic has its result (Tue 10 Nov).
  [/^Prueba gratis que se abre/, "Prueba que se abre"],
  [/: primero las que anuncian y tienen email./, ": primero las que tienen email."],
  [/, qué software de agenda usan, cuánto cuesta su recepción./, ", y qué software de agenda usan."],
  [/cuánto cuesta un hueco vacío/, "cuánto se pierde con un hueco vacío"],
  [/Pedir entrar desde tu cuenta./, "Pedir entrar desde mi cuenta."],
  [/en los que te hayan aceptado/, "en los que me hayan aceptado"],
  [/^Crear la hoja de seguimiento \(Google Sheets o HubSpot gratis\): .*$/, "Crear la hoja de seguimiento: clínica, quién decide, contacto, web, Instagram, estado y próximo paso."],
  [/ Marcar las que anuncian en Meta .*$/, ""],
  [/: dolor, precio que aceptarían, /, ": dolor, "],
  [/ y de 32Dental \(del vie 30 oct\)\./, " y de un mensaje de Instagram."],
  [/^Medir de dónde viene cada clínica: .*$/, "Saber por qué camino llega cada clínica: la demo de la web apunta de dónde viene cada visita, y una hoja para comparar los caminos."],
  [/ Puede servir también de anuncio\./, ""],
  [/^Instagram, anuncio: .*$/, "Instagram: que la pieza que mejor haya funcionado llegue a más clínicas, con el enlace a la demo de wyncall.com/es/clinicas."],
  [/ y del email del 30 oct a Clínica Ibiza\./, " y de una clínica más a la que escribí el 30 oct."],
  [/^Google Ads, búsqueda: .*$/, "Buscadores: que quien ya busca una solución («recordatorio de citas clínica», «pacientes que no vienen a la cita»…) llegue a la demo de wyncall.com/es/clinicas."],
  [/^Auditoría: elegir 5 clínicas .*$/, "Preparar una prueba con 5 clínicas de la lista."],
  [/^Auditoría, por la mañana: .*$/, "La prueba con 5 clínicas: empieza."],
  [/^Auditoría: apuntar quién llama .*$/, "La prueba con 5 clínicas: apuntar resultados."],
  [/^Auditoría: apuntar las llamadas del lunes .*$/, "Cerrar la prueba con 5 clínicas."],
  [/^Mirar los números del anuncio de Instagram: .*$/, "Mirar cómo va Instagram: si casi nadie llega a la demo, cambiar la pieza o el texto para el fin de semana."],
  [/^Revisión semanal: por canal, gasto, .*Decidir a qué canal va el dinero de la semana 4 y (.*)$/, (_, rest) => "Revisión semanal: por camino, visitas a la demo, demos pedidas y clínicas interesadas, y cómo va la prueba con 5 clínicas. Decidir en qué caminos seguir en la semana 4 y " + rest],
  [/^Darme de alta como autónomo para poder firmar y facturar los pilotos\./, "Darme de alta como autónomo para poder firmar los pilotos."],
  [/agencias de marketing que llevan los anuncios de Meta y Google de clínicas/, "agencias de marketing que trabajan con clínicas"],
  [/^Enviar a cada una de las 5 clínicas de la auditoría su resultado .*$/, "Enviar a cada una de las 5 clínicas de la prueba su resultado, con la oferta de piloto para llamar a sus leads."],
  [/^Que al pagar el piloto se abra/, "Que al firmar el piloto se abra"],
  [/ Proponer el paso a la cuota mensual al acabar\./, " Proponer seguir al acabar."],
  [/ y propuesta de cuota\./, " y propuesta para seguir."],
  [/^Cierres y cobro de las suscripciones\./, "Cierres con las clínicas que siguen."],
  [/^¿3 o más pilotos pasan a cuota\? Si no, entender por qué \(resultados, precio, producto\)/, "¿3 o más pilotos se quedan como clientes? Si no, entender por qué (resultados, producto)"],
  [/, para no facturar el exceso a mano\./, "."],
  [/conversión de piloto a cuota/, "conversión de piloto a cliente"],
];
const forPublic = (task) => PUBLIC.reduce((t, [re, to]) => t.replace(re, to), task.replace(/`/g, ""));

// Last check before writing: anything still about money, ads, the audit, clinic names or jargon
// stops the build, so a new plan line gets its own rule above instead of going public.
const NOT_PUBLIC = /€|cuesta|\beuros?\b|precio|gratis|cuota|coste|cobr|de pago|\bpag(o|ar)\b|factur|stripe|growth|\bads\b|anunci|promocion|presupuesto|auditor|utm|\bgate\b|ingres|margen|descuent|dinero|gasto|ibiza|people ?dent|32dental|vandermed|microcapilar/i;

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
    week = { label: wk[1], title: PUBLIC_TITLES[wk[1]] || wk[2] || TITLES[wk[1]] || "", phase, days: [] };
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
const leaks = [];
for (const w of out) {
  if (NOT_PUBLIC.test(w.title)) leaks.push(`${w.label}: ${w.title}`);
  for (const d of w.days) for (const s of [d.tag, ...d.tasks]) if (NOT_PUBLIC.test(s)) leaks.push(`${d.iso}: ${s}`);
}
if (leaks.length) throw new Error(`Not for the public page (add a rule to PUBLIC):\n- ${leaks.join("\n- ")}`);
fs.writeFileSync(OUT, JSON.stringify({ source: "PLAN_90_DIAS.md", weeks: out }, null, 1));
console.log(`site/plan.json: ${out.length} weeks, ${days} days`);
