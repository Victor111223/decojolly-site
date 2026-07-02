(function () {
  var products = window.DECOJOLLY_PRODUCTS || [];
  var collections = window.DECOJOLLY_COLLECTIONS || [];

  function countProducts(collection) {
    return products.filter(function (product) {
      return product.category === collection.category;
    }).length;
  }

  function productCard(product) {
    var href = "./product.html?id=" + encodeURIComponent(product.id);
    var safe = product.name.replace(/"/g, "&quot;");
    return [
      '<article class="product-card">',
      '<a class="product-card-media" href="' + href + '">',
      '<img src="' + product.image + '" loading="lazy" alt="' + safe + '">',
      '<button class="quote-mini" type="button" data-quote-add="' + product.id + '" data-default-label="+ Quote" aria-label="Add ' + safe + ' to quote">+ Quote</button>',
      "</a>",
      '<a class="product-card-body" href="' + href + '">',
      '<div class="product-kicker">' + product.season + " · " + product.material + "</div>",
      '<h3>' + product.name + "</h3>",
      "</a>",
      "</article>"
    ].join("");
  }

  function renderCollectionCards() {
    var grid = document.getElementById("collectionGrid");
    if (!grid) return;
    grid.innerHTML = collections.map(function (collection) {
      return [
        '<a class="collection-card" href="./collection.html?collection=' + encodeURIComponent(collection.id) + '">',
        '<div class="collection-media"><img src="' + collection.image + '" loading="lazy" alt="' + collection.title.replace(/"/g, "&quot;") + '"></div>',
        '<div class="collection-body">',
        '<span>' + collection.season + " · " + countProducts(collection) + " items</span>",
        '<h3>' + collection.title + "</h3>",
        '<p>' + collection.intro + "</p>",
        '<b>View collection</b>',
        "</div>",
        "</a>"
      ].join("");
    }).join("");
  }

  function renderCollectionPage() {
    var root = document.getElementById("collectionDetail");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("collection");
    var collection = collections.find(function (item) { return item.id === id; }) || collections[0];

    if (!collection) {
      root.innerHTML = '<section><div class="container"><div class="panel"><h1>Collection not found</h1><p>Please return to the product catalog and choose another collection.</p><div class="hero-cta"><a class="btn btn-primary" href="./products.html">Back to catalog</a></div></div></div></section>';
      return;
    }

    var collectionProducts = products.filter(function (product) {
      return product.category === collection.category;
    });

    document.title = collection.title + " | DecoJolly Product Collection";
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", collection.intro);

    root.innerHTML = [
      '<section class="collection-hero">',
      '<div class="container">',
      '<a class="back-link" href="./products.html">Back to catalog</a>',
      '<div class="split">',
      '<div>',
      '<span class="eyebrow">Product collection</span>',
      '<h1>' + collection.title + "</h1>",
      '<p>' + collection.intro + "</p>",
      '<div class="hero-cta">',
      '<a class="btn btn-primary" href="./contact.html">Request line sheets</a>',
      '<a class="btn btn-ghost" href="#collection-products">' + collectionProducts.length + " products</a>",
      "</div>",
      '<p class="hero-note"><b>Pricing by quote</b> · <b>Flexible MOQ by program</b> · <b>Packaging support available</b></p>',
      "</div>",
      '<div class="split-media"><img src="' + collection.image + '" alt="' + collection.title.replace(/"/g, "&quot;") + '"></div>',
      "</div>",
      "</div>",
      "</section>",
      '<section class="sec-cream">',
      '<div class="container">',
      '<div class="collection-info-grid">',
      '<div class="panel"><span class="eyebrow">Buyer fit</span><h2>Where this collection works</h2><p>' + collection.buyerFit + "</p></div>",
      '<div class="panel"><span class="eyebrow">Specs & options</span><h2>What buyers can ask for</h2><ul class="checklist">' + collection.specs.map(function (item) { return "<li>" + item + "</li>"; }).join("") + "</ul></div>",
      "</div>",
      "</div>",
      "</section>",
      '<section id="collection-products">',
      '<div class="container">',
      '<div class="catalog-toolbar">',
      '<div><span class="eyebrow">Products</span><h2>' + collection.title + "</h2></div>",
      '<div class="catalog-count">' + collectionProducts.length + " products shown</div>",
      "</div>",
      '<div class="product-grid" id="collectionProductGrid"></div>',
      '<div class="catalog-more"><button class="btn btn-ghost" id="collectionMore" type="button" hidden>Load more products</button></div>',
      "</div>",
      "</section>",
      '<section class="cta-band">',
      '<div class="container">',
      '<div class="cta-wrap">',
      '<span class="eyebrow">Custom request</span>',
      '<h2>Need a different theme or package?</h2>',
      '<p>Use this collection as a starting point. Send your logo, sketch, reference, target quantity, or packaging direction and we can help develop the right product program.</p>',
      '<div class="cta-actions"><a class="btn btn-primary" href="./contact.html">Send us your idea</a><a class="btn btn-ghost" href="./products.html">All products</a></div>',
      "</div>",
      "</div>",
      "</section>"
    ].join("");

    // batch-render products so large collections (hundreds of items) stay fast
    var cg = document.getElementById("collectionProductGrid");
    var cmore = document.getElementById("collectionMore");
    var crendered = 0, CPAGE = 48;
    function crenderNext() {
      if (!cg) return;
      var nx = collectionProducts.slice(crendered, crendered + CPAGE);
      if (nx.length) cg.insertAdjacentHTML("beforeend", nx.map(productCard).join(""));
      crendered += nx.length;
      if (cmore) {
        var rem = collectionProducts.length - crendered;
        cmore.hidden = rem <= 0;
        cmore.textContent = rem > 0 ? "Load more (" + rem + " more)" : "Load more products";
      }
    }
    if (cmore) cmore.addEventListener("click", crenderNext);
    crenderNext();
  }

  renderCollectionCards();
  renderCollectionPage();
})();
