// Conta os downloads de cada versão do Dueto pela API do GitHub Releases.
// Uso: node scripts/downloads.mjs
// Repositório privado: GH_TOKEN=$(gh auth token) node scripts/downloads.mjs
const REPO = process.env.DUETO_REPO ?? "aLuizab/dueto";
const headers = { Accept: "application/vnd.github+json", "User-Agent": "dueto-site" };
if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;

const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, { headers });
if (!res.ok) {
  console.error(`GitHub respondeu ${res.status} para ${REPO}.`);
  if (res.status === 404) console.error("O repositório não existe ou é privado. Para privado, defina GH_TOKEN.");
  process.exit(1);
}

const releases = await res.json();
let total = 0;
const rows = [];
for (const r of releases) {
  for (const a of r.assets.filter((a) => a.name.endsWith(".exe"))) {
    rows.push({ versão: r.tag_name, publicada: r.published_at?.slice(0, 10), arquivo: a.name, downloads: a.download_count });
    total += a.download_count;
  }
}

if (!rows.length) console.log("Nenhum .exe publicado nas Releases ainda.");
else console.table(rows);
console.log(`Total: ${total} downloads`);
