(function () {
  var products = window.DECOJOLLY_PRODUCTS || [];
  var grid = document.getElementById("catalogGrid");
  if (!grid) return;

  var search = document.getElementById("catalogSearch");
  var season = document.getElementById("filterSeason");
  var category = document.getElementById("filterCategory");
  var material = document.getElementById("filterMaterial");
  var sortSel = document.getElementById("catalogSort");
  var count = document.getElementById("catalogCount");
  var empty = document.getElementById("catalogEmpty");
  var reset = document.getElementById("catalogReset");
  var chips = document.getElementById("catalogChips");
  var moreBtn = document.getElementById("catalogMore");
  var sentinel = document.getElementById("catalogSentinel");

  var PAGE_SIZE = 48;
  var filtered = [];
  var rendered = 0;

  function unique(values) {
    return values.filter(Boolean).filter(function (value, index, list) {
      return list.indexOf(value) === index;
    }).sort();
  }

  // Normalize verbose per-product material text into a clean, filterable group.
  // The full descriptive text still shows on the product card; this only drives
  // the Material dropdown and matching so buyers see tidy, non-overlapping options.
  function materialGroup(raw) {
    var t = (raw || "").toLowerCase();
    if (t.indexOf("foam") !== -1 && t.indexOf("glass") === -1 && t.indexOf("resin") === -1 && t.indexOf("plastic") === -1) return "Foam";
    if (t.indexOf("paper") !== -1 || t.indexOf("pet") !== -1 || t.indexOf("card") !== -1 || t.indexOf("box") !== -1) return "Paper & Packaging";
    var mats = ["glass", "resin", "plastic", "foam"].filter(function (m) { return t.indexOf(m) !== -1; });
    if (mats.length > 1 || t.indexOf("mixed") !== -1) return "Mixed / Multi-material";
    if (t.indexOf("glass") !== -1) return "Glass";
    if (t.indexOf("resin") !== -1) return "Resin";
    if (t.indexOf("plastic") !== -1) return "Plastic";
    return raw;
  }

  function fillSelect(select, values, label) {
    if (!select) return;
    select.innerHTML = '<option value="">' + label + "</option>";
    unique(values).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function esc(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;"); }

  function productText(product) {
    return [
      product.name, product.category, product.collection,
      product.season, product.material, product.packaging,
      (product.tags || []).join(" ")
    ].join(" ").toLowerCase();
  }

  function card(product) {
    var href = "./product.html?id=" + encodeURIComponent(product.id);
    return [
      '<article class="product-card">',
      '<a class="product-card-media" href="' + href + '">',
      '<img src="' + product.image + '" loading="lazy" decoding="async" alt="' + esc(product.name) + '">',
      '<button class="quote-mini" type="button" data-quote-add="' + product.id + '" data-default-label="+ Quote" aria-label="Add ' + esc(product.name) + ' to quote">+ Quote</button>',
      "</a>",
      '<a class="product-card-body" href="' + href + '">',
      '<div class="product-kicker">' + product.season + " · " + product.material + "</div>",
      '<h3>' + product.name + "</h3>",
      "</a>",
      "</article>"
    ].join("");
  }

  function currentState() {
    return {
      q: (search && search.value ? search.value : "").trim(),
      s: season ? season.value : "",
      c: category ? category.value : "",
      m: material ? material.value : "",
      sort: sortSel ? sortSel.value : "default"
    };
  }

  function sortList(arr, sort) {
    var out = arr.slice();
    if (sort === "name-asc") out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else if (sort === "name-desc") out.sort(function (a, b) { return b.name.localeCompare(a.name); });
    else if (sort === "season") out.sort(function (a, b) { return (a.season + a.name).localeCompare(b.season + b.name); });
    else if (sort === "category") out.sort(function (a, b) { return (a.category + a.name).localeCompare(b.category + b.name); });
    return out;
  }

  function syncURL(st) {
    if (!window.history || !window.history.replaceState) return;
    var p = new URLSearchParams();
    if (st.q) p.set("q", st.q);
    if (st.s) p.set("season", st.s);
    if (st.c) p.set("category", st.c);
    if (st.m) p.set("material", st.m);
    if (st.sort && st.sort !== "default") p.set("sort", st.sort);
    var qs = p.toString();
    window.history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  function renderChips(st) {
    if (!chips) return;
    var parts = [];
    if (st.q) parts.push(["q", 'Search: "' + esc(st.q) + '"']);
    if (st.s) parts.push(["season", st.s]);
    if (st.c) parts.push(["category", st.c]);
    if (st.m) parts.push(["material", st.m]);
    if (st.sort && st.sort !== "default") {
      var labels = { "name-asc": "Name A–Z", "name-desc": "Name Z–A", "season": "Sorted by season", "category": "Sorted by category" };
      parts.push(["sort", labels[st.sort] || st.sort]);
    }
    chips.innerHTML = parts.map(function (pair) {
      return '<button type="button" class="catalog-chip" data-clear="' + pair[0] + '">' + pair[1] + ' <span aria-hidden="true">×</span></button>';
    }).join("");
    if (parts.length > 1) {
      chips.innerHTML += '<button type="button" class="catalog-chip catalog-chip-all" data-clear="all">Clear all</button>';
    }
  }

  function renderNextBatch() {
    var next = filtered.slice(rendered, rendered + PAGE_SIZE);
    if (next.length) grid.insertAdjacentHTML("beforeend", next.map(card).join(""));
    rendered += next.length;
    if (moreBtn) {
      var remaining = filtered.length - rendered;
      moreBtn.hidden = remaining <= 0;
      moreBtn.textContent = remaining > 0
        ? "Load more (" + remaining + " more)"
        : "Load more products";
    }
  }

  function apply() {
    var st = currentState();
    var q = st.q.toLowerCase();
    filtered = products.filter(function (product) {
      return (!q || productText(product).indexOf(q) !== -1) &&
        (!st.s || product.season === st.s) &&
        (!st.c || product.category === st.c) &&
        (!st.m || materialGroup(product.material) === st.m);
    });
    filtered = sortList(filtered, st.sort);
    rendered = 0;
    grid.innerHTML = "";
    renderNextBatch();
    if (count) count.textContent = filtered.length + (filtered.length === 1 ? " product" : " products") + " found";
    if (empty) empty.hidden = filtered.length !== 0;
    renderChips(st);
    syncURL(st);
  }

  // debounce the search box so typing over a large catalog stays smooth
  function debounce(fn, wait) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, wait); };
  }
  var applyDebounced = debounce(apply, 180);

  // populate filter dropdowns
  fillSelect(season, products.map(function (p) { return p.season; }), "All seasons");
  fillSelect(category, products.map(function (p) { return p.category; }), "All categories");
  fillSelect(material, products.map(function (p) { return materialGroup(p.material); }), "All materials");

  // initialize state from URL (shareable filtered links)
  (function initFromURL() {
    var p = new URLSearchParams(location.search);
    if (search && p.get("q")) search.value = p.get("q");
    if (season && p.get("season")) season.value = p.get("season");
    if (category && p.get("category")) category.value = p.get("category");
    if (material && p.get("material")) material.value = p.get("material");
    if (sortSel && p.get("sort")) sortSel.value = p.get("sort");
  })();

  if (search) search.addEventListener("input", applyDebounced);
  [season, category, material, sortSel].forEach(function (control) {
    if (control) control.addEventListener("change", apply);
  });

  if (reset) {
    reset.addEventListener("click", function () {
      if (search) search.value = "";
      if (season) season.value = "";
      if (category) category.value = "";
      if (material) material.value = "";
      if (sortSel) sortSel.value = "default";
      apply();
    });
  }

  if (chips) {
    chips.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-clear]");
      if (!btn) return;
      var which = btn.getAttribute("data-clear");
      if (which === "all") {
        if (search) search.value = "";
        if (season) season.value = "";
        if (category) category.value = "";
        if (material) material.value = "";
        if (sortSel) sortSel.value = "default";
      } else if (which === "q" && search) search.value = "";
      else if (which === "season" && season) season.value = "";
      else if (which === "category" && category) category.value = "";
      else if (which === "material" && material) material.value = "";
      else if (which === "sort" && sortSel) sortSel.value = "default";
      apply();
    });
  }

  if (moreBtn) moreBtn.addEventListener("click", renderNextBatch);

  // infinite scroll: auto-load the next batch when the sentinel scrolls into view
  if (sentinel && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && rendered < filtered.length) renderNextBatch();
    }, { rootMargin: "600px" });
    io.observe(sentinel);
  }

  apply();
})();
