/* Catalog and collection pages: search, group and category filters, product grid. */
(function () {
  "use strict";
  var root = document.getElementById("catalog");
  if (!root) return;
  var ALL = (window.DECOJOLLY_PRODUCTS || []).filter(function (p) { return !p.hidden; });
  var CATS = window.DJ_CATS || {};
  var GROUPS = window.DJ_GROUPS || [];
  var PAGE = 48;
  var params = new URLSearchParams(location.search);
  var fixed = root.hasAttribute("data-collection") ? params.get("collection") : null;
  var state = { q: params.get("q") || "", group: params.get("group") || "", category: params.get("category") || "", season: "", shown: PAGE };
  var ORDER = Object.keys(CATS);

  var grid = document.getElementById("grid");
  var count = document.getElementById("count");
  var more = document.getElementById("more");
  var empty = document.getElementById("empty");
  var search = document.getElementById("search");
  var groupBar = document.getElementById("groups");
  var catBar = document.getElementById("cats");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function info(p) { return CATS[p.category] || { label: p.category, group: "", id: "" }; }
  function catById(id) { for (var k in CATS) if (CATS[k].id === id) return k; return ""; }

  /* Default order: take one from each category in turn so the first screen shows the range. */
  function mixed(list) {
    var buckets = {}, order = [];
    list.forEach(function (p) {
      if (!buckets[p.category]) { buckets[p.category] = []; order.push(p.category); }
      buckets[p.category].push(p);
    });
    order.sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
    var out = [], i = 0, left = true;
    while (left) {
      left = false;
      order.forEach(function (c) { if (buckets[c][i]) { out.push(buckets[c][i]); left = true; } });
      i += 1;
    }
    return out;
  }

  if (fixed) {
    var catName = catById(fixed);
    var c = CATS[catName];
    if (catName && c) {
      state.category = catName;
      var h = document.getElementById("col-title");
      var intro = document.getElementById("col-intro");
      if (h) h.textContent = c.label;
      if (intro) intro.textContent = c.intro;
      document.title = c.label + " | DecoJolly Wholesale Catalog";
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute("content", c.intro);
    }
  }

  function matches(p) {
    if (state.category && p.category !== state.category) return false;
    if (state.group && info(p).group !== state.group) return false;
    if (!state.group && !state.category && !state.q && info(p).group === "custom") return false;
    if (state.season && p.season !== state.season) return false;
    if (state.q) {
      var hay = (p.name + " " + p.category + " " + (p.tags || []).join(" ") + " " + (p.material || "")).toLowerCase();
      var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) === -1) return false;
    }
    return true;
  }

  function card(p) {
    var img = window.DJ_IMG(p);
    var cut = p.cutout ? " is-cut" : "";
    var spec = [p.material, p.size].filter(Boolean).join(", ");
    return '<li class="card">' +
      '<a class="card-link" href="./product.html?id=' + encodeURIComponent(p.id) + '">' +
      '<span class="card-pic' + cut + '"><img src="' + esc(img) + '" alt="" loading="lazy"></span>' +
      '<span class="card-cat">' + esc(info(p).label) + '</span>' +
      '<span class="card-name">' + esc(p.name) + '</span></a>' +
      '<button type="button" class="card-add" data-quote-add="' + esc(p.id) + '" data-name="' + esc(p.name) + '" data-image="' + esc(img) + '" data-spec="' + esc(spec) + '" data-label="Add to quote" aria-pressed="false">Add to quote</button>' +
      '</li>';
  }

  function chips() {
    if (groupBar) {
      groupBar.innerHTML = [{ id: "", label: "All" }].concat(GROUPS.filter(function (g) { return g.id !== "custom"; })).map(function (g) {
        return '<button type="button" class="chip" data-group="' + g.id + '" aria-pressed="' + (state.group === g.id && !state.category ? "true" : "false") + '">' + esc(g.label) + "</button>";
      }).join("");
    }
    if (catBar) {
      var g = state.group || (state.category ? info({ category: state.category }).group : "");
      var cats = Object.keys(CATS).filter(function (k) { return CATS[k].group === g && ALL.some(function (p) { return p.category === k; }); });
      catBar.hidden = !g || cats.length < 2;
      catBar.innerHTML = cats.map(function (k) {
        return '<button type="button" class="chip chip-sm" data-cat="' + esc(k) + '" aria-pressed="' + (state.category === k ? "true" : "false") + '">' + esc(CATS[k].label) + "</button>";
      }).join("");
    }
  }

  function syncUrl() {
    if (fixed || !history.replaceState) return;
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.group) p.set("group", state.group);
    if (state.category) p.set("category", CATS[state.category] ? CATS[state.category].id : state.category);
    var s = p.toString();
    try { history.replaceState(null, "", location.pathname + (s ? "?" + s : "")); } catch (e) { /* preview frames */ }
  }

  function render() {
    var list = ALL.filter(matches);
    if (!state.q && !state.category) list = mixed(list);
    var page = list.slice(0, state.shown);
    grid.innerHTML = page.map(card).join("");
    count.textContent = page.length >= list.length ? list.length.toLocaleString("en-US") + (list.length === 1 ? " product" : " products") : "Showing " + page.length.toLocaleString("en-US") + " of " + list.length.toLocaleString("en-US");
    empty.hidden = list.length > 0;
    more.hidden = page.length >= list.length;
    chips();
    if (window.DecoJolly) window.DecoJolly.repaint();
  }

  if (!fixed && params.get("category")) state.category = catById(params.get("category")) || params.get("category");
  if (!fixed && params.get("season")) {
    var s = params.get("season").toLowerCase();
    state.group = s === "christmas" ? "" : "seasonal";
    if (s === "christmas") state.season = "Christmas";
    if (s === "easter") state.category = "Easter & Spring";
    if (s === "halloween") state.category = "Halloween Collection";
  }
  if (search) {
    search.value = state.q;
    var t;
    search.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = search.value.trim(); state.shown = PAGE; syncUrl(); render(); }, 160);
    });
  }
  root.addEventListener("click", function (e) {
    var g = e.target.closest("[data-group]");
    if (g) { state.group = g.getAttribute("data-group"); state.category = ""; state.season = ""; state.shown = PAGE; syncUrl(); render(); return; }
    var c = e.target.closest("[data-cat]");
    if (c) {
      var k = c.getAttribute("data-cat");
      state.category = state.category === k ? "" : k;
      state.group = info({ category: k }).group;
      state.shown = PAGE; syncUrl(); render();
    }
  });
  if (more) more.addEventListener("click", function () { state.shown += PAGE; render(); });
  var reset = document.getElementById("reset");
  if (reset) reset.addEventListener("click", function () { state = { q: "", group: "", category: fixed ? state.category : "", season: "", shown: PAGE }; if (search) search.value = ""; syncUrl(); render(); });
  render();
})();
