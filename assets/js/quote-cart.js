(function () {
  var key = "decojollyQuoteCart";
  var products = window.DECOJOLLY_PRODUCTS || [];

  function readIds() {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function writeIds(ids) {
    localStorage.setItem(key, JSON.stringify(ids));
    updateBadge();
    renderDrawerItems();
  }

  function getProduct(id) {
    return products.find(function (product) { return product.id === id; });
  }

  function getItems() {
    return readIds().map(getProduct).filter(Boolean);
  }

  function add(id) {
    var ids = readIds();
    if (ids.indexOf(id) === -1) ids.push(id);
    writeIds(ids);
    announce("Added to quote list");
  }

  function remove(id) {
    writeIds(readIds().filter(function (item) { return item !== id; }));
  }

  function clear() {
    writeIds([]);
  }

  function announce(text) {
    var live = document.getElementById("quoteLive");
    if (live) live.textContent = text;
  }

  function updateBadge() {
    var count = readIds().length;
    document.querySelectorAll("[data-quote-count]").forEach(function (node) {
      node.textContent = count;
    });
    document.querySelectorAll(".quote-floating").forEach(function (node) {
      node.classList.toggle("has-items", count > 0);
    });
  }

  function renderDrawerItems() {
    var target = document.getElementById("quoteDrawerItems");
    if (!target) return;
    var items = getItems();
    if (!items.length) {
      target.innerHTML = '<div class="quote-empty">No products added yet. Add products from the catalog, then request one quote.</div>';
      return;
    }
    target.innerHTML = items.map(function (product) {
      return [
        '<div class="quote-line">',
        '<img src="' + product.image + '" alt="' + product.name.replace(/"/g, "&quot;") + '">',
        '<div><b>' + product.name + '</b><span>' + product.category + '</span><small>' + product.size + '</small></div>',
        '<button type="button" class="quote-remove" data-quote-remove="' + product.id + '" aria-label="Remove ' + product.name.replace(/"/g, "&quot;") + '">Remove</button>',
        '</div>'
      ].join("");
    }).join("");
  }

  function openDrawer() {
    var drawer = document.getElementById("quoteDrawer");
    if (!drawer) return;
    renderDrawerItems();
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    var drawer = document.getElementById("quoteDrawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function installDrawer() {
    if (document.getElementById("quoteDrawer") || !products.length) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = [
      '<div class="quote-live" id="quoteLive" aria-live="polite"></div>',
      '<button class="quote-floating" type="button" id="quoteOpen">',
      '<span>Quote List</span><b data-quote-count>0</b>',
      '</button>',
      '<div class="quote-drawer" id="quoteDrawer" aria-hidden="true">',
      '<div class="quote-drawer-panel" role="dialog" aria-label="Quote list">',
      '<div class="quote-drawer-head"><div><span class="eyebrow">Quote list</span><h3>Products to quote</h3></div><button class="btn btn-ghost btn-sm" type="button" id="quoteClose">Close</button></div>',
      '<div class="quote-drawer-items" id="quoteDrawerItems"></div>',
      '<div class="quote-drawer-actions">',
      '<a class="btn btn-primary" href="./contact.html?quote=list">Request quote</a>',
      '<button class="btn btn-ghost" type="button" id="quoteClear">Clear list</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join("");
    document.body.appendChild(wrap);

    document.getElementById("quoteOpen").addEventListener("click", openDrawer);
    document.getElementById("quoteClose").addEventListener("click", closeDrawer);
    document.getElementById("quoteDrawer").addEventListener("click", function (event) {
      if (event.target.id === "quoteDrawer") closeDrawer();
    });
    document.getElementById("quoteClear").addEventListener("click", function () {
      clear();
      announce("Quote list cleared");
    });
    updateBadge();
    renderDrawerItems();
  }

  document.addEventListener("click", function (event) {
    var addButton = event.target.closest("[data-quote-add]");
    if (addButton) {
      event.preventDefault();
      add(addButton.getAttribute("data-quote-add"));
      addButton.classList.add("quote-added");
      addButton.textContent = "Added";
      window.setTimeout(function () {
        addButton.classList.remove("quote-added");
        addButton.textContent = addButton.getAttribute("data-default-label") || "Add to Quote";
      }, 1200);
      return;
    }

    var removeButton = event.target.closest("[data-quote-remove]");
    if (removeButton) {
      remove(removeButton.getAttribute("data-quote-remove"));
      announce("Removed from quote list");
    }
  });

  window.DecoJollyQuoteCart = {
    add: add,
    remove: remove,
    clear: clear,
    getItems: getItems,
    readIds: readIds
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installDrawer);
  } else {
    installDrawer();
  }
})();
