# dueto-site

Landing page do [Dueto](../dueto): download do app e histórico de versões.

Site estático, sem build: `index.html` + `assets/` + `data/releases.js`. Abre direto no navegador (inclusive via `file://`).

## Versões

O histórico vem do `CHANGELOG.md` do app. Depois de lançar uma versão nova do Dueto:

```bash
node scripts/sync-releases.mjs            # lê ../dueto/CHANGELOG.md
node scripts/sync-releases.mjs caminho/CHANGELOG.md
```

Isso regenera `data/releases.js`. A versão mais recente define os links de download:

- `https://github.com/aLuizab/dueto/releases/download/v<versão>/Dueto-Setup-<versão>.exe`
- `https://github.com/aLuizab/dueto/releases/download/v<versão>/Dueto-portable.exe`

Esses são os nomes que o `electron-builder.yml` e a Action de release do app já produzem. A tag no GitHub precisa existir (`v0.2.0` etc.) com os binários anexados.

## Downloads

```bash
node scripts/downloads.mjs                         # repositório público
GH_TOKEN=$(gh auth token) node scripts/downloads.mjs   # repositório privado
```

Lista os downloads de cada `.exe` por versão (contador do GitHub Releases).

## Comunidade

A aba *Recomendar* abre uma issue pré-preenchida com o modelo `.github/ISSUE_TEMPLATE/sugestao.yml` do app (campos `area`, `problema`, `solucao`, etiqueta `sugestão`). A aba *Contribuir* aponta para fork, PR e `CONTRIBUTING.md` do repositório do app.

## Ver localmente

```bash
npx serve .        # ou simplesmente abra index.html
```

## Publicar

`.github/workflows/pages.yml` publica no GitHub Pages a cada push na `main` e, antes, tenta ressincronizar as versões com o CHANGELOG do repositório `aLuizab/dueto` (se ele for privado, usa o `data/releases.js` versionado). Ative em *Settings → Pages → Source: GitHub Actions*.

## Estrutura

```
index.html              página
assets/styles.css       estilo (claro/escuro automático)
assets/app.js           preenche downloads e versões
data/releases.js        gerado do CHANGELOG — não editar à mão
scripts/sync-releases.mjs
```

A prévia do app no topo é HTML com valores fictícios. Não use screenshots com dados reais.
