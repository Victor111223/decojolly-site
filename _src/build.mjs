// Builds the site's HTML from _src/pages + _src/partials into the repo root.
// Run: node _src/build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(here, p), "utf8");
const home = JSON.parse(read("home-data.json"));
const metaFile = path.join(root, "assets/images/cutouts/_meta.json");
const cuts = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, "utf8")) : {};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function baubles() {
  return home.hero.map((b, i) => {
    const m = cuts[b.id] || { w: 300, h: 500, cap: 0.5 };
    const eager = i < 5 ? 'fetchpriority="high"' : 'loading="lazy"';
    return `<li class="bauble" style="--x:${b.x};--xm:${b.xm ?? "-99"};--drop:${b.drop};--dropm:${b.dropm ?? 0};--w:${b.w};--wm:${b.wm ?? 0};--cap:${m.cap}"${b.xm == null ? ' data-desktop' : ""}>
        <a href="./product.html?id=${b.id}" aria-label="${esc(b.label)}"><span class="string"></span><img src="./assets/images/cutouts/${b.id}.webp" width="${m.w}" height="${m.h}" alt="" ${eager}></a>
      </li>`;
  }).join("\n      ");
}

function tiles() {
  return home.tiles.map((t) => {
    const m = cuts[t.id] || { w: 300, h: 500 };
    return `<li><a href="${t.href}"><span class="tile-pic"><img src="./assets/images/cutouts/${t.id}.webp" width="${m.w}" height="${m.h}" alt="" loading="lazy"></span><span class="tile-name">${t.name}</span><span class="tile-n">${t.n}</span></a></li>`;
  }).join("\n      ");
}

function page(file) {
  let src = read("pages/" + file);
  const m = src.match(/^<!--meta\n([\s\S]*?)-->\n/);
  const meta = Object.fromEntries(m[1].trim().split("\n").map((l) => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  src = src.slice(m[0].length).replace("<!--#baubles-->", baubles).replace("<!--#tiles-->", tiles);
  const url = "https://www.decojolly.com/" + (file === "index.html" ? "" : file);
  const scripts = (meta.scripts || "").split(",").map((s) => s.trim()).filter(Boolean).map((s) => s.startsWith("data:") ? `<script src="./assets/data/${s.slice(5)}.js"></script>` : `<script src="./assets/app/${s}.js"></script>`).join("\n");
  const head = `<title>${meta.title}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="DecoJolly">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://www.decojolly.com/assets/images/brand/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="./assets/images/brand/favicon.png">
<link rel="preload" href="./assets/app/fonts/schibsted-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="./assets/app/fonts/young-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="./assets/app/app.css">`;
  const header = read("partials/header.html").replace(`data-nav="${meta.page}"`, `data-nav="${meta.page}" aria-current="page"`);
  const body = `${header}\n${src}\n${read("partials/footer.html")}\n<script src="./assets/app/app.js"></script>\n${scripts}`;
  const html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body data-page="${meta.page}">\n${body}\n</body>\n</html>\n`;
  fs.writeFileSync(path.join(root, file), file === "404.html" ? html.replace(/(href|src)="\.\//g, '$1="/') : html);
  return file;
}

const REDIRECTS = { "buyers.html": "how-to-order.html", "capabilities.html": "how-to-order.html", "gallery.html": "products.html", "suppliers.html": "index.html" };
function redirect(from, to) {
  const url = "https://www.decojolly.com/" + to;
  fs.writeFileSync(path.join(root, from), `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Moved | DecoJolly</title>\n<meta name="robots" content="noindex">\n<link rel="canonical" href="${url}">\n<meta http-equiv="refresh" content="0; url=./${to}">\n</head>\n<body>\n<p>This page moved to <a href="./${to}">${to}</a>.</p>\n</body>\n</html>\n`);
  return from + " -> " + to;
}

const list = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(here, "pages")).filter((f) => f.endsWith(".html"));
list.forEach((f) => console.log("built", page(f)));
if (!process.argv.slice(2).length) Object.entries(REDIRECTS).forEach(([a, b]) => console.log("redirect", redirect(a, b)));
