/* Contact page form. */
(function () {
  "use strict";
  var form = document.getElementById("c-form");
  if (!form) return;
  var type = new URLSearchParams(location.search).get("type");
  if (type && form.elements.topic.querySelector('option[value="' + type + '"]')) form.elements.topic.value = type;
  function fail(msg, field) {
    var box = document.getElementById("c-error");
    box.textContent = msg;
    box.hidden = false;
    if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (n) { n.removeAttribute("aria-invalid"); });
    document.getElementById("c-error").hidden = true;
    var d = form.elements;
    if (!d.name.value.trim()) return fail("Enter your name.", d.name);
    if (!/^\S+@\S+\.\S+$/.test(d.email.value.trim())) return fail("Enter a valid email address so we can reply.", d.email);
    if (!d.message.value.trim()) return fail("Write a short message.", d.message);
    if (d.botcheck.value) return;
    var DJ = window.DecoJolly;
    if (!DJ || !DJ.connected) return fail("Preview only: this form isn't connected yet, so nothing was sent.");
    var btn = document.getElementById("c-send");
    btn.disabled = true;
    btn.textContent = "Sending…";
    var email = d.email.value.trim();
    var topic = d.topic.options[d.topic.selectedIndex].text;
    DJ.send({ subject: topic + ": " + (d.company.value.trim() || d.name.value.trim()), replyto: email, topic: topic, name: d.name.value.trim(), company: d.company.value.trim(), email: email, phone: d.phone.value.trim(), message: d.message.value.trim() })
      .then(function () {
        document.getElementById("c-done-text").textContent = "We’ll reply to " + email + " during U.S. business hours.";
        document.querySelector('[data-contact-view="form"]').hidden = true;
        document.querySelector('[data-contact-view="done"]').hidden = false;
      })
      .catch(function () { fail("Your message didn't go through. Check your connection and try again, or email " + DJ.email + "."); })
      .then(function () { btn.disabled = false; btn.textContent = "Send message"; });
  });
})();
