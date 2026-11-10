/* DecoJolly site: menu, quote list, quote submission. */
(function () {
  "use strict";

  /* Paste the Web3Forms access key here. Requests go to sales@decojolly.com through it. */
  var FORM_KEY = "7b716a38-aed2-41ac-864c-faab91aa362b";
  var FORM_URL = "https://api.web3forms.com/submit";
  var STORE = "decojolly.quote.v2";
  var EMAIL = "sales@decojolly.com";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---- menu ---- */
  var menuBtn = $("[data-menu-open]");
  var sheet = $("#sheet");
  if (menuBtn && sheet) {
    menuBtn.addEventListener("click", function () {
      sheet.hidden = !sheet.hidden;
      menuBtn.setAttribute("aria-expanded", String(!sheet.hidden));
    });
  }
  $$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---- quote list storage ---- */
  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(STORE) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  var memory = read();
  function write(v) {
    memory = v;
    try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) { /* private window: the list lasts for this page */ }
    paint();
  }
  function has(id) { return memory.some(function (i) { return i.id === id; }); }
  function add(item) {
    if (!has(item.id)) write(memory.concat([{ id: item.id, name: item.name, image: item.image, spec: item.spec || "", qty: "" }]));
    toast(item.name + " added to your quote list");
  }
  function remove(id) { write(memory.filter(function (i) { return i.id !== id; })); }

  /* ---- paint ---- */
  var list = $("#q-items");
  var empty = $("#q-empty");
  var form = $("#q-form");
  var drawer = $("#quote");
  function paint() {
    $$("[data-quote-count]").forEach(function (n) { n.textContent = memory.length; });
    $$("[data-quote-add]").forEach(function (b) {
      var on = has(b.getAttribute("data-quote-add"));
      b.setAttribute("aria-pressed", String(on));
      if (b.hasAttribute("data-label")) b.textContent = on ? "On your list" : b.getAttribute("data-label");
    });
    if (!list) return;
    list.innerHTML = memory.map(function (i) {
      return '<li><img src="' + esc(i.image) + '" alt=""><div><b>' + esc(i.name) + '</b><button type="button" class="rm" data-rm="' + esc(i.id) + '">Remove</button></div>' +
        '<label class="q-qty">Quantity<input inputmode="numeric" data-qty="' + esc(i.id) + '" value="' + esc(i.qty) + '" placeholder="Rough is fine"></label></li>';
    }).join("");
    empty.hidden = memory.length > 0;
    list.hidden = memory.length === 0;
    form.hidden = memory.length === 0;
  }

  var toastTimer;
  function toast(text) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

  /* ---- drawer ---- */
  function view(name) {
    $$("[data-quote-view]").forEach(function (v) { v.hidden = v.getAttribute("data-quote-view") !== name; });
  }
  function openDrawer() {
    if (!drawer) return;
    view("list");
    paint();
    if (drawer.showModal) drawer.showModal(); else drawer.setAttribute("open", "");
  }
  function closeDrawer() { if (drawer.close) drawer.close(); else drawer.removeAttribute("open"); }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-quote-add]");
    if (a) {
      e.preventDefault();
      var id = a.getAttribute("data-quote-add");
      if (has(id)) { openDrawer(); return; }
      add({ id: id, name: a.getAttribute("data-name"), image: a.getAttribute("data-image"), spec: a.getAttribute("data-spec") });
      return;
    }
    if (e.target.closest("[data-quote-open]")) { openDrawer(); return; }
    if (e.target.closest("[data-quote-close]")) { closeDrawer(); return; }
    var rm = e.target.closest("[data-rm]");
    if (rm) { remove(rm.getAttribute("data-rm")); return; }
    if (e.target === drawer) closeDrawer();
  });
  document.addEventListener("input", function (e) {
    var q = e.target.getAttribute && e.target.getAttribute("data-qty");
    if (!q) return;
    memory.forEach(function (i) { if (i.id === q) i.qty = e.target.value; });
    try { localStorage.setItem(STORE, JSON.stringify(memory)); } catch (err) { /* keep in memory */ }
  });

  /* ---- send ---- */
  function fail(msg, field) {
    var box = $("#q-error");
    box.textContent = msg;
    box.hidden = false;
    if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
  }
  function reference() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return "DJ-" + p(d.getMonth() + 1) + p(d.getDate()) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  function itemsText(base) {
    return memory.map(function (i, n) {
      return (n + 1) + ". " + i.name + "\n   Item: " + i.id + "\n   Quantity: " + (i.qty || "not given") + (i.spec ? "\n   " + i.spec : "") + "\n   " + base + "product.html?id=" + i.id;
    }).join("\n\n");
  }
  function done(ref, email) {
    $("#q-done-text").textContent = "We got your list of " + memory.length + (memory.length === 1 ? " design" : " designs") + " and will reply to " + email + " during U.S. business hours.";
    $("#q-ref").textContent = ref;
    view("done");
    write([]);
    form.reset();
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      $$("[aria-invalid]", form).forEach(function (n) { n.removeAttribute("aria-invalid"); });
      $("#q-error").hidden = true;
      var d = form.elements;
      if (!d.name.value.trim()) return fail("Enter your name.", d.name);
      if (!d.company.value.trim()) return fail("Enter your company or store name.", d.company);
      if (!/^\S+@\S+\.\S+$/.test(d.email.value.trim())) return fail("Enter a valid email address so we can reply.", d.email);
      if (d.botcheck.value) return;
      var ref = reference();
      var email = d.email.value.trim();
      if (!FORM_KEY) {
        return fail("Preview only: this form isn't connected yet, so nothing was sent.");
      }
      var btn = $("#q-send");
      btn.disabled = true;
      btn.textContent = "Sending…";
      var base = location.origin + location.pathname.replace(/[^/]*$/, "");
      var body = {
        access_key: FORM_KEY,
        subject: "Quote request " + ref + " from " + d.company.value.trim() + " (" + memory.length + " items)",
        from_name: "DecoJolly website",
        replyto: email,
        name: d.name.value.trim(),
        company: d.company.value.trim(),
        email: email,
        phone: d.phone.value.trim(),
        business_type: d.type.value,
        needed_by: d.when.value.trim(),
        notes: d.note.value.trim(),
        reference: ref,
        items: itemsText(base)
      };
      fetch(FORM_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (!r.success) throw new Error(r.message || "rejected");
          done(ref, email);
        })
        .catch(function () {
          fail("Your request didn't go through. Check your connection and try again, or email your list to " + EMAIL + ".");
        })
        .then(function () { btn.disabled = false; btn.textContent = "Send quote request"; });
    });
  }

  /* ---- price check ---- */
  var price = $("#price");
  var pform = $("#p-form");
  var nudge = $("#nudge");
  var NUDGE = "decojolly.nudge.v1";
  function pview(name) {
    $$("[data-price-view]").forEach(function (v) { v.hidden = v.getAttribute("data-price-view") !== name; });
  }
  function openPrice() {
    if (!price) return;
    hideNudge(true);
    pview("form");
    if (price.showModal) price.showModal(); else price.setAttribute("open", "");
    var first = $("#p-item");
    if (first) first.focus();
  }
  function closePrice() { if (price.close) price.close(); else price.removeAttribute("open"); }
  function hideNudge(remember) {
    if (nudge) nudge.hidden = true;
    if (remember) { try { localStorage.setItem(NUDGE, "1"); } catch (e) { /* fine */ } }
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-price-open]")) { e.preventDefault(); openPrice(); return; }
    if (e.target.closest("[data-price-close]")) { closePrice(); return; }
    if (e.target.closest("[data-nudge-close]")) { hideNudge(true); return; }
    if (e.target === price) closePrice();
  });
  if (nudge && matchMedia("(min-width: 901px)").matches) {
    var seen = false;
    try { seen = localStorage.getItem(NUDGE) === "1"; } catch (e) { seen = false; }
    if (!seen) {
      setTimeout(function () {
        var busy = (drawer && drawer.open) || (price && price.open);
        if (!busy) nudge.hidden = false;
      }, 12000);
    }
  }
  function pfail(msg, field) {
    var box = $("#p-error");
    box.textContent = msg;
    box.hidden = false;
    if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
  }
  if (pform) {
    pform.addEventListener("submit", function (e) {
      e.preventDefault();
      $$("[aria-invalid]", pform).forEach(function (n) { n.removeAttribute("aria-invalid"); });
      $("#p-error").hidden = true;
      var d = pform.elements;
      if (!d.product.value.trim()) return pfail("Tell us which product you buy today.", d.product);
      if (!d.price.value.trim()) return pfail("Enter what you pay per piece.", d.price);
      if (!/^\S+@\S+\.\S+$/.test(d.email.value.trim())) return pfail("Enter a valid email address so we can reply.", d.email);
      if (d.botcheck.value) return;
      if (!FORM_KEY) return pfail("Preview only: this form isn't connected yet, so nothing was sent.");
      var btn = $("#p-send");
      btn.disabled = true;
      btn.textContent = "Sending…";
      var email = d.email.value.trim();
      var body = {
        access_key: FORM_KEY,
        subject: "Price check: " + d.product.value.trim() + " at " + d.price.value.trim(),
        from_name: "DecoJolly website",
        replyto: email,
        product: d.product.value.trim(),
        price_paid: d.price.value.trim(),
        quantity: d.qty.value.trim(),
        link: d.link.value.trim(),
        email: email,
        company: d.company.value.trim()
      };
      fetch(FORM_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (!r.success) throw new Error(r.message || "rejected");
          $("#p-done-text").textContent = "We’ll reply to " + email + " with our delivered price during U.S. business hours.";
          pview("done");
          pform.reset();
        })
        .catch(function () {
          pfail("Your request didn't go through. Check your connection and try again, or email " + EMAIL + ".");
        })
        .then(function () { btn.disabled = false; btn.textContent = "Get my factory price"; });
    });
  }

  window.addEventListener("storage", function (e) { if (e.key === STORE) { memory = read(); paint(); } });
  paint();
  function send(body) {
    if (!FORM_KEY) return Promise.reject(new Error("preview"));
    body.access_key = FORM_KEY;
    body.from_name = body.from_name || "DecoJolly website";
    return fetch(FORM_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (!r.success) throw new Error(r.message || "rejected"); return r; });
  }
  window.DecoJolly = { add: add, has: has, open: openDrawer, repaint: paint, send: send, connected: !!FORM_KEY, email: EMAIL };
})();
