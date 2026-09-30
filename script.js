/* ============================================================
   Mandy · personal site — interactions
   Kept dependency-free and small on purpose.
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    document.addEventListener("click", function (e) {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
  }

  /* ---------- 2. sticky header shadow + reading progress + back-to-top ---------- */
  const header = document.getElementById("siteHeader");
  const progressFill = document.getElementById("progressFill");
  const toTop = document.getElementById("toTop");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;

    if (header) header.classList.toggle("is-stuck", y > 8);

    if (progressFill) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (y / docHeight) * 100) : 0;
      progressFill.style.width = pct + "%";
    }

    if (toTop) {
      if (y > 600) {
        toTop.hidden = false;
        toTop.style.opacity = "1";
      } else {
        toTop.style.opacity = "0";
      }
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    // keep it out of the tab order while invisible
    const observer = new MutationObserver(function () {});
    observer.observe(toTop, { attributes: true, attributeFilter: ["hidden"] });
  }

  /* ---------- 3. reveal on scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          // gentle stagger for siblings
          const siblings = Array.from(el.parentElement ? el.parentElement.children : []);
          const idx = siblings.filter(function (s) { return s.classList.contains("reveal"); }).indexOf(el);
          el.style.transitionDelay = Math.min(idx, 5) * 70 + "ms";
          el.classList.add("is-in");
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 4. music log tabs (keyboard accessible) ---------- */
  const tabs = Array.from(document.querySelectorAll(".tab"));

  function activateTab(tab) {
    tabs.forEach(function (t) {
      const selected = t === tab;
      t.classList.toggle("is-active", selected);
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;

      const panel = document.getElementById(t.dataset.target);
      if (!panel) return;
      panel.classList.toggle("is-active", selected);
      if (selected) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab); });

    tab.addEventListener("keydown", function (e) {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();

      let next = i;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;

      tabs[next].focus();
      activateTab(tabs[next]);
    });
  });

  /* ---------- 5. highlight the section you are reading ---------- */
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navAnchors.forEach(function (a) {
            a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 6. interactive practice meter on skill cards ---------- */
  const meters = document.querySelectorAll(".meter span");
  if (meters.length) {
    meters.forEach(function (m) {
      const target = m.style.getPropertyValue("--w") || "50%";
      if (reduceMotion) { m.style.width = target; return; }
      m.style.width = "0%";
      m.style.transition = "width 1.1s cubic-bezier(.22,.8,.3,1)";
      setTimeout(function () { m.style.width = target; }, 250);
    });
  }

  /* ---------- 7. footer year ---------- */
  const yearEl = document.querySelector(".footer-note");
  if (yearEl) {
    const y = new Date().getFullYear();
    yearEl.textContent = "© " + y + " · Built with AI assistance, reviewed by me.";
  }
})();
