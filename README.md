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

No ar em **https://dueto.aluiza.tech**, hospedado no Railway (projeto `dueto-site`).

- O Railway faz o deploy automático a cada push na `main`. O `Dockerfile` serve os arquivos com Caddy na porta `$PORT`; os cabeçalhos e o cache estão no `Caddyfile`.
- `.github/workflows/sync-releases.yml` roda todo dia (ou à mão: `gh workflow run sync-releases.yml`). Ele lê o `CHANGELOG.md` da `main` do `aLuizab/dueto` e, se houver versão nova, faz commit de `data/releases.js`, o que dispara o deploy.
- DNS (Hostinger): `dueto` é um CNAME para o alvo que o Railway mostra em *Settings → Networking*, mais o TXT de verificação que ele pedir.

Testar a imagem localmente:

```bash
docker build -t dueto-site . && docker run --rm -p 8080:8080 -e PORT=8080 dueto-site
```

## Estrutura

```
index.html              página
assets/styles.css       estilo (claro/escuro automático)
assets/app.js           preenche downloads, versões, números do repositório e comunidade
data/releases.js        gerado do CHANGELOG — não editar à mão
scripts/sync-releases.mjs
scripts/downloads.mjs   downloads por versão (API do GitHub)
Dockerfile, Caddyfile, railway.json   deploy no Railway
```

A prévia do app no topo é HTML com valores fictícios. Não use screenshots com dados reais.
