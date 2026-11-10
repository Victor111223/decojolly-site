/* Product page: one item, its specs, and more from the same collection. */
(function () {
  "use strict";
  var root = document.getElementById("product");
  if (!root) return;
  var ALL = (window.DECOJOLLY_PRODUCTS || []).filter(function (p) { return !p.hidden; });
  var CATS = window.DJ_CATS || {};
  var id = new URLSearchParams(location.search).get("id");
  var p = ALL.find(function (x) { return x.id === id; });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  if (!p) {
    root.innerHTML = '<div class="wrap page-head"><h1>We can’t find that product</h1><p class="lead">It may have been renamed or removed. Try the catalog search.</p><p><a class="tag" href="./products.html">Go to the catalog</a></p></div>';
    return;
  }
  var c = CATS[p.category] || { label: p.category, id: "" };
  var img = window.DJ_IMG(p);
  var spec = [p.material, p.size].filter(Boolean).join(", ");
  var BASE = "https://www.decojolly.com/";

  document.title = p.name + " | DecoJolly Wholesale";
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", p.name + ". " + p.description);
  var canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute("href", BASE + "product.html?id=" + encodeURIComponent(p.id));

  var facts = [
    ["Item number", p.id],
    ["Material", p.material],
    ["Size", p.size],
    ["Finish", p.finish],
    ["Packaging", p.packaging],
    ["Can be changed", (p.customization || []).join(", ")]
  ].filter(function (r) { return r[1]; });

  var related = ALL.filter(function (x) { return x.category === p.category && x.id !== p.id; });
  var start = Math.max(0, related.findIndex(function (x) { return x.id > p.id; }));
  related = related.slice(start, start + 8).concat(related.slice(0, Math.max(0, 8 - (related.length - start)))).slice(0, 8);

  root.innerHTML =
    '<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="./products.html">Catalog</a><span aria-hidden="true">/</span>' +
    (c.id ? '<a href="./collection.html?collection=' + esc(c.id) + '">' + esc(c.label) + "</a>" : esc(c.label)) + "</nav>" +
    '<div class="wrap pd">' +
      '<div class="pd-pic' + (p.cutout ? " is-cut" : "") + '"><img src="' + esc(img) + '" alt="' + esc(p.name) + '"></div>' +
      '<div class="pd-info">' +
        "<h1>" + esc(p.name) + "</h1>" +
        '<p class="pd-desc">' + esc(p.description) + "</p>" +
        '<div class="pd-act"><button type="button" class="tag tag-pop-ink" data-quote-add="' + esc(p.id) + '" data-name="' + esc(p.name) + '" data-image="' + esc(img) + '" data-spec="' + esc(spec) + '" data-label="Add to quote list" aria-pressed="false">Add to quote list</button>' +
        '<button type="button" class="link" data-quote-open>View quote list</button></div>' +
        '<dl class="facts">' + facts.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" +
        '<p class="pd-note">Pricing by quote. Minimums are agreed at the start of each order. Samples take 15–21 days. <a href="./how-to-order.html">How ordering works</a></p>' +
      "</div>" +
    "</div>" +
    (related.length ? '<section class="wrap more-from" aria-labelledby="more-h"><div class="shop-head"><h2 id="more-h">More ' + esc(c.label.toLowerCase()) + '</h2>' +
      (c.id ? '<a class="link" href="./collection.html?collection=' + esc(c.id) + '">See all</a>' : "") + '</div><ul class="cards">' +
      related.map(function (x) {
        var i2 = window.DJ_IMG(x);
        return '<li class="card"><a class="card-link" href="./product.html?id=' + encodeURIComponent(x.id) + '"><span class="card-pic' + (x.cutout ? " is-cut" : "") + '"><img src="' + esc(i2) + '" alt="" loading="lazy"></span><span class="card-name">' + esc(x.name) + "</span></a></li>";
      }).join("") + "</ul></section>" : "");

  var ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.id, image: [BASE + img.replace(/^\.\//, "")], description: p.description, category: c.label, material: p.material, brand: { "@type": "Brand", name: "DecoJolly" }, url: BASE + "product.html?id=" + encodeURIComponent(p.id) });
  document.head.appendChild(ld);
  if (window.DecoJolly) window.DecoJolly.repaint();
})();
