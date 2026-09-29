(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {}
    return null;
  }

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    nav.classList.toggle("is-open", open);
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      var target = id.length > 1 ? document.querySelector(id) : null;
      var behavior = reduceMotion ? "auto" : "smooth";
      if (id === "#top") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: behavior });
      } else if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: behavior, block: "start" });
        history.pushState(null, "", id);
      }
      setNav(false);
    });
  });

  // FAQ accordion (one open at a time)
  var questions = document.querySelectorAll(".faq__question");
  function setItem(button, open) {
    var answer = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(open));
    button.closest(".faq__item").classList.toggle("is-open", open);
    answer.hidden = !open;
  }
  questions.forEach(function (button) {
    button.addEventListener("click", function () {
      var willOpen = button.getAttribute("aria-expanded") !== "true";
      questions.forEach(function (other) { setItem(other, false); });
      setItem(button, willOpen);
    });
  });

  // Theme switcher
  var themeButtons = document.querySelectorAll("[data-theme-set]");
  function setTheme(name, save) {
    root.setAttribute("data-theme", name);
    themeButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set") === name));
    });
    if (save) store("dh-theme", name);
  }
  themeButtons.forEach(function (b) {
    b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme-set"), true); });
  });
  setTheme(root.getAttribute("data-theme") || "dunkel", false);

  // Cookie settings
  var dialog = document.getElementById("cookie-dialog");
  if (dialog) {
    var analytics = document.getElementById("cookie-analytics");
    var saved = null;
    try { saved = JSON.parse(store("dh-consent")); } catch (e) {}
    if (saved) analytics.checked = !!saved.analytics;

    var openCookies = function () { if (!dialog.open) dialog.show(); };
    if (!saved || location.hash === "#cookies") openCookies();

    document.querySelectorAll("[data-open-cookies]").forEach(function (b) {
      b.addEventListener("click", openCookies);
    });
    dialog.querySelectorAll("[data-cookie]").forEach(function (b) {
      b.addEventListener("click", function () {
        var choice = b.getAttribute("data-cookie");
        var allowed = choice === "all" ? true : choice === "necessary" ? false : analytics.checked;
        analytics.checked = allowed;
        store("dh-consent", JSON.stringify({ necessary: true, analytics: allowed, ts: Date.now() }));
        dialog.close();
        if (location.hash === "#cookies") history.replaceState(null, "", location.pathname + location.search);
      });
    });
  }

  // Contact form
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var submit = form.querySelector('[type="submit"]');
    var say = function (msg, ok) {
      status.textContent = msg;
      status.className = "form__status " + (ok ? "is-ok" : "is-error");
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var endpoint = form.getAttribute("data-endpoint");
      if (endpoint) {
        submit.disabled = true;
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error("send failed");
            form.reset();
            say("Vielen Dank! Wir melden uns in Kürze persönlich bei Ihnen.", true);
          })
          .catch(function () {
            say("Das Senden hat leider nicht geklappt. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.", false);
          })
          .then(function () { submit.disabled = false; });
      } else {
        var body = "Name/Firma: " + data.get("name") + "\nE-Mail: " + data.get("email") +
          "\nTelefon: " + (data.get("phone") || "-") + "\n\n" + data.get("message");
        window.location.href = "mailto:" + form.getAttribute("data-mail") +
          "?subject=" + encodeURIComponent("Anfrage über die Website") + "&body=" + encodeURIComponent(body);
        say("Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die vorbereitete Nachricht dort ab.", true);
      }
    });
  }
})();
