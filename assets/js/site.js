/* DecoJolly — shared header, footer, and interactions */
(function () {
  var EMAIL = "sales@decojolly.com";

  var NAV = [
    { href: "./index.html", label: "Home", key: "home" },
    { href: "./buyers.html", label: "Buyers", key: "buyers" },
    { href: "./products.html", label: "Products", key: "products" },
    { href: "./capabilities.html", label: "Capabilities", key: "capabilities" },
    { href: "./suppliers.html", label: "Suppliers", key: "suppliers" },
    { href: "./about.html", label: "About", key: "about" }
  ];

  var current = document.body.getAttribute("data-page") || "";

  function navLinks(cls) {
    return NAV.map(function (n) {
      var active = n.key === current ? " active" : "";
      return '<a class="' + cls + active + '" href="' + n.href + '">' + n.label + "</a>";
    }).join("");
  }

  var headerHTML =
    '<header><div class="container"><div class="nav">' +
      '<a class="brand" href="./index.html" aria-label="DecoJolly home">' +
        '<img src="./assets/images/brand/logo-header.png" alt="DecoJolly — since 2011" /></a>' +
      '<nav class="nav-links" aria-label="Primary">' + navLinks("") + "</nav>" +
      '<div class="nav-actions">' +
        '<a class="btn btn-primary btn-sm" href="./contact.html">Request a Quote</a>' +
        '<button class="hamburger" id="openMenu" aria-label="Open menu">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
        "</button>" +
      "</div>" +
    "</div></div></header>";

  var drawerHTML =
    '<div class="drawer" id="drawer" aria-hidden="true"><div class="drawer-panel" role="dialog" aria-label="Menu">' +
      '<div class="drawer-head"><img src="./assets/images/brand/logo-header.png" alt="DecoJolly" />' +
        '<button class="btn btn-ghost btn-sm" id="closeMenu">Close</button></div>' +
      '<div class="drawer-links">' + navLinks("drawerLink") +
        '<a class="drawerLink" href="./contact.html">Request a Quote</a>' +
      "</div>" +
    "</div></div>";

  var year = new Date().getFullYear();
  var footerHTML =
    "<footer><div class=\"container\"><div class=\"foot-grid\">" +
      '<div><div class="foot-brand">DecoJolly<span class="since">SINCE 2011</span></div>' +
        '<p style="margin-top:14px;max-width:34ch;color:rgba(255,255,255,.6);font-size:14.5px;">' +
        "U.S.-based holiday &amp; seasonal décor supply chain partner. Arizona, USA.</p></div>" +
      '<div class="foot-col"><h4>Explore</h4>' +
        '<a href="./buyers.html">Buyers</a><a href="./products.html">Products</a>' +
        '<a href="./capabilities.html">Capabilities</a><a href="./suppliers.html">Suppliers</a>' +
        '<a href="./about.html">About</a></div>' +
      '<div class="foot-col"><h4>Get started</h4>' +
        '<a href="./contact.html">Request a Quote</a>' +
        '<a href="./contact.html#buyer-access">Apply for Buyer Access</a>' +
        '<a href="./suppliers.html">Become a Supplier Partner</a>' +
        '<a href="./products.html">Product Catalog</a></div>' +
      '<div class="foot-col"><h4>Contact</h4>' +
        '<a href="mailto:' + EMAIL + '">' + EMAIL + "</a><p>Arizona, USA</p></div>" +
    "</div>" +
    '<div class="foot-bottom"><div>© ' + year + " DecoJolly. All rights reserved.</div>" +
      "<div>Holiday &amp; seasonal décor · Sourced and delivered for retail buyers</div></div>" +
    "</div></footer>";

  function mount(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  mount("site-header", headerHTML + drawerHTML);
  mount("site-footer", footerHTML);

  // Drawer behavior
  var drawer = document.getElementById("drawer");
  var open = function () { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); };
  var close = function () { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); };
  var openBtn = document.getElementById("openMenu");
  var closeBtn = document.getElementById("closeMenu");
  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (drawer) drawer.addEventListener("click", function (e) { if (e.target === drawer) close(); });
  document.querySelectorAll(".drawerLink").forEach(function (a) { a.addEventListener("click", close); });
})();
