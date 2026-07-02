(function () {
  var products = window.DECOJOLLY_PRODUCTS || [];
  var root = document.getElementById("productDetail");
  if (!root) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  var product = products.find(function (item) { return item.id === id; }) || products[0];

  if (!product) {
    root.innerHTML = '<div class="container"><div class="panel"><h1>Product not found</h1><p>Please return to the catalog and choose another product.</p><div class="hero-cta"><a class="btn btn-primary" href="./products.html">Back to catalog</a></div></div></div>';
    return;
  }

  document.title = product.name + " | DecoJolly Product Catalog";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", product.description);

  // Inject Product + Breadcrumb structured data for SEO / rich results.
  (function injectJsonLd() {
    var BASE = "https://www.decojolly.com";
    var abs = function (p) { return BASE + "/" + String(p || "").replace(/^\.\//, ""); };
    var pageUrl = BASE + "/product.html?id=" + encodeURIComponent(product.id);
    var data = [
      {
        "@context": "https://schema.org", "@type": "Product",
        "name": product.name,
        "image": (product.images && product.images.length ? product.images : [product.image]).map(abs),
        "description": product.description,
        "category": product.category,
        "material": product.material,
        "brand": { "@type": "Brand", "name": "DecoJolly" },
        "url": pageUrl
      },
      {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/" },
          { "@type": "ListItem", "position": 2, "name": "Products", "item": BASE + "/products.html" },
          { "@type": "ListItem", "position": 3, "name": product.category, "item": pageUrl },
          { "@type": "ListItem", "position": 4, "name": product.name, "item": pageUrl }
        ]
      }
    ];
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  })();

  function list(items) {
    return (items || []).map(function (item) { return "<li>" + item + "</li>"; }).join("");
  }

  function related() {
    return products.filter(function (item) {
      return item.id !== product.id && (item.category === product.category || item.season === product.season);
    }).slice(0, 3);
  }

  var images = (product.images && product.images.length ? product.images : [product.image]).slice(0, 4);
  var relatedProducts = related();

  root.innerHTML = [
    '<section class="product-detail-hero">',
    '<div class="container">',
    '<a class="back-link" href="./products.html">Back to catalog</a>',
    '<div class="product-detail-grid">',
    '<div class="product-media-stack">',
    '<div class="product-main-image"><img src="' + images[0] + '" alt="' + product.name.replace(/"/g, "&quot;") + '"></div>',
    '<div class="product-thumbs">' + images.map(function (img) { return '<img src="' + img + '" alt="' + product.name.replace(/"/g, "&quot;") + ' detail">'; }).join("") + "</div>",
    "</div>",
    '<div class="product-info">',
    '<span class="eyebrow">' + product.category + "</span>",
    "<h1>" + product.name + "</h1>",
    '<p class="lede">' + product.description + "</p>",
    '<div class="hero-cta">',
    '<a class="btn btn-primary" href="./contact.html?product=' + encodeURIComponent(product.id) + '">Request quote for this item</a>',
    '<button class="btn btn-ghost" type="button" data-quote-add="' + product.id + '" data-default-label="Add to Quote">Add to Quote</button>',
    '<a class="btn btn-ghost" href="./products.html">Browse more</a>',
    "</div>",
    '<p class="hero-note"><b>Pricing by quote</b> · <b>Flexible MOQ by program</b> · <b>Custom packaging available</b></p>',
    '<ul class="speclist product-spec-list">',
    "<li><b>Collection</b><span>" + product.collection + "</span></li>",
    "<li><b>Season</b><span>" + product.season + "</span></li>",
    "<li><b>Material</b><span>" + product.material + "</span></li>",
    "<li><b>Size</b><span>" + product.size + "</span></li>",
    "<li><b>Packaging</b><span>" + product.packaging + "</span></li>",
    "<li><b>Finish</b><span>" + product.finish + "</span></li>",
    "</ul>",
    "</div>",
    "</div>",
    "</div>",
    "</section>",
    '<section class="sec-cream">',
    '<div class="container">',
    '<div class="product-detail-panels">',
    '<div class="panel"><span class="eyebrow">Customization</span><h2>Options buyers can request</h2><ul class="checklist">' + list(product.customization) + "</ul></div>",
    '<div class="panel"><span class="eyebrow">Buyer fit</span><h2>Common use cases</h2><ul class="checklist">' + list(product.buyerUseCases) + "</ul></div>",
    "</div>",
    "</div>",
    "</section>",
    '<section>',
    '<div class="container">',
    '<div class="head"><span class="eyebrow">Related products</span><h2>More in this direction</h2><p>Use these as a starting point. If you need a different theme, logo, destination, or package, send us the idea and we can help develop it.</p></div>',
    '<div class="product-grid compact">' + relatedProducts.map(function (item) {
      var rhref = "./product.html?id=" + encodeURIComponent(item.id);
      return '<article class="product-card"><a class="product-card-media" href="' + rhref + '"><img src="' + item.image + '" loading="lazy" alt="' + item.name.replace(/"/g, "&quot;") + '"></a><a class="product-card-body" href="' + rhref + '"><div class="product-kicker">' + item.season + " · " + item.material + '</div><h3>' + item.name + '</h3></a></article>';
    }).join("") + "</div>",
    "</div>",
    "</section>"
  ].join("");

  root.querySelectorAll(".product-thumbs img").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var main = root.querySelector(".product-main-image img");
      if (main) main.src = thumb.src;
    });
  });
})();
