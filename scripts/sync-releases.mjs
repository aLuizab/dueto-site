// Lê o CHANGELOG.md do Dueto e gera data/releases.js (window.DUETO_RELEASES).
// Uso: node scripts/sync-releases.mjs [caminho/do/CHANGELOG.md]
// Padrão: ../dueto/CHANGELOG.md (projeto irmão).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const changelogPath = resolve(process.argv[2] ?? resolve(root, "../dueto/CHANGELOG.md"));
const md = readFileSync(changelogPath, "utf8");

const releases = [];
let release = null;
let section = null;

for (const raw of md.split(/\r?\n/)) {
  const line = raw.trimEnd();
  const head = line.match(/^## \[([^\]]+)\]\s*[—–-]\s*(\d{4}-\d{2}-\d{2})/);
  if (head) {
    release = { version: head[1], date: head[2], sections: [] };
    releases.push(release);
    section = null;
    continue;
  }
  if (!release) continue;
  const sub = line.match(/^### (.+)/);
  if (sub) {
    section = { title: sub[1].trim(), items: [] };
    release.sections.push(section);
    continue;
  }
  const item = line.match(/^- (.+)/);
  if (item && section) {
    section.items.push(item[1].trim());
    continue;
  }
  // continuação de um item quebrado em várias linhas
  if (line.startsWith("  ") && section?.items.length) {
    section.items[section.items.length - 1] += " " + line.trim();
  }
}

if (!releases.length) {
  console.error(`Nenhuma versão encontrada em ${changelogPath}`);
  process.exit(1);
}

const out = resolve(root, "data/releases.js");
writeFileSync(
  out,
  "// Gerado por scripts/sync-releases.mjs a partir do CHANGELOG.md do Dueto. Não edite à mão.\n" +
    `window.DUETO_RELEASES = ${JSON.stringify(releases, null, 2)};\n`,
);
console.log(`${releases.length} versões → ${out} (mais recente: ${releases[0].version})`);
