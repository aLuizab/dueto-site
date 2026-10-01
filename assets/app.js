// Preenche downloads e histórico de versões a partir de data/releases.js.
(function () {
  const REPO = "https://github.com/aLuizab/dueto";
  const releases = window.DUETO_RELEASES || [];
  const latest = releases[0];

  const files = (v) => ({
    setup: `Dueto-Setup-${v}.exe`,
    portable: "Dueto-portable.exe",
  });
  const assetUrl = (v, name) => `${REPO}/releases/download/v${v}/${name}`;

  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const fmtDate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ${months[m - 1]} ${y}`;
  };

  const escape = (s) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Markdown mínimo do CHANGELOG: **negrito**, *itálico*, `código`, [texto](url)
  const inline = (s) => {
    const codes = [];
    return escape(s)
      .replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`) // protege `pf-*` etc.
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
  };

  const tone = (title) => {
    const t = title.toLowerCase();
    if (t.startsWith("adicion")) return "add";
    if (t.startsWith("corrig")) return "fix";
    if (t.startsWith("remov")) return "del";
    return "chg";
  };

  const LABEL = "sugestão";
  const repoLinks = {
    repo: REPO,
    releases: `${REPO}/releases`,
    fork: `${REPO}/fork`,
    pr: `${REPO}/compare`,
    contributing: `${REPO}/blob/main/CONTRIBUTING.md`,
    license: `${REPO}/blob/main/LICENSE`,
    simples: `${REPO}/blob/main/core/tax/simples.ts`,
    "good-first": `${REPO}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`,
    sugestoes: `${REPO}/issues?q=is%3Aissue+is%3Aopen+label%3A${encodeURIComponent(LABEL)}+sort%3Areactions-%2B1-desc`,
  };
  document.querySelectorAll("[data-repo-link]").forEach((a) => {
    a.href = repoLinks[a.dataset.repoLink] ?? REPO;
  });

  // Números do repositório (API pública do GitHub; some se o repo for privado ou a API falhar)
  const API = REPO.replace("https://github.com/", "https://api.github.com/repos/");
  const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")} mil` : String(n));
  const setStat = (key, n) =>
    document.querySelectorAll(`[data-stat="${key}"]`).forEach((el) => {
      el.textContent = fmtNum(n);
      el.hidden = false;
    });
  fetch(API)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((repo) => {
      setStat("stars", repo.stargazers_count);
      setStat("forks", repo.forks_count);
      setStat("issues", repo.open_issues_count);
      document.getElementById("repo-stats").hidden = false;
      // contribuidores: o total vem do número de páginas no cabeçalho Link (1 por página)
      return fetch(`${API}/contributors?per_page=1&anon=1`).then((r) => {
        if (!r.ok) return;
        const last = (r.headers.get("Link") || "").match(/[?&]page=(\d+)>; rel="last"/);
        return last ? Number(last[1]) : r.json().then((a) => a.length);
      });
    })
    .then((n) => n != null && setStat("contributors", n))
    .catch(() => {});

  // Abas da seção Comunidade
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
  if (location.hash === "#contribuir") select(document.getElementById("tab-contribuir"));

  // Sugestão → issue pré-preenchida (template .github/ISSUE_TEMPLATE/sugestao.yml do app)
  const form = document.getElementById("sugestao");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const params = new URLSearchParams({
      template: "sugestao.yml",
      labels: LABEL,
      title: `[Sugestão] ${f.get("titulo").trim()}`,
      area: f.get("area"),
      problema: f.get("problema").trim(),
      solucao: f.get("sugestao").trim(),
    });
    window.open(`${REPO}/issues/new?${params}`, "_blank", "noopener");
  });

  if (!latest) return;

  document.querySelectorAll("[data-latest-version]").forEach((el) => (el.textContent = latest.version));
  document.querySelectorAll("[data-latest-date]").forEach((el) => (el.textContent = fmtDate(latest.date)));

  const names = files(latest.version);
  document.querySelectorAll("[data-download]").forEach((a) => {
    a.href = assetUrl(latest.version, names[a.dataset.download]);
  });
  document.querySelectorAll("[data-file]").forEach((el) => (el.textContent = names[el.dataset.file]));

  const list = document.getElementById("releases");
  list.innerHTML = releases
    .map((r, i) => {
      const sections = r.sections
        .map(
          (s) => `
          <div class="rel-section">
            <h4 class="tag tag-${tone(s.title)}">${escape(s.title)}</h4>
            <ul>${s.items.map((it) => `<li>${inline(it)}</li>`).join("")}</ul>
          </div>`,
        )
        .join("");
      const count = r.sections.reduce((n, s) => n + s.items.length, 0);
      return `
        <li class="release">
          <details ${i === 0 ? "open" : ""}>
            <summary>
              <span class="rel-version">v${escape(r.version)}</span>
              ${i === 0 ? '<span class="badge">Atual</span>' : ""}
              <span class="rel-meta">${count} ${count === 1 ? "mudança" : "mudanças"}</span>
              <time datetime="${r.date}">${fmtDate(r.date)}</time>
            </summary>
            <div class="rel-body">
              ${sections}
              <p class="rel-links">
                <a href="${assetUrl(r.version, files(r.version).setup)}">Instalador ${escape(r.version)}</a>
                <a href="${REPO}/releases/tag/v${r.version}">Ver no GitHub</a>
              </p>
            </div>
          </details>
        </li>`;
    })
    .join("");
})();
