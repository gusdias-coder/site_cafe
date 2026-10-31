/* TORRA NOBRE — interações e efeitos de rolagem */
(() => {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#site-nav");
  const year = document.querySelector("[data-current-year]");
  const progressFill = document.querySelector("[data-hero-progress]");
  const hero = document.querySelector("[data-scene='hero']");
  const scrollVideo = document.querySelector("[data-scroll-video]");

  if (year) year.textContent = String(new Date().getFullYear());

  // Header state is updated through one shared scroll handler.
  let ticking = false;
  const updateScrollUI = () => {
    const scrollY = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", scrollY > 30);

    if (hero && progressFill) {
      const rect = hero.getBoundingClientRect();
      const total = Math.max(1, hero.offsetHeight - window.innerHeight);
      const progressed = Math.min(1, Math.max(0, -rect.top / total));
      progressFill.style.width = `${progressed * 100}%`;
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }, { passive: true });
  updateScrollUI();

  // Mobile navigation with Escape support and focus return.
  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      navigation.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (open) {
        const firstLink = navigation.querySelector("a");
        if (firstLink && window.matchMedia("(max-width: 700px)").matches) firstLink.focus();
      }
    });

    navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
        closeMenu();
        if (wasOpen) menuButton.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 701px)").matches) closeMenu();
    });
  }

  // Reveal effects: one observer serves every marked element.
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Entra na tela: revela. Sai (para cima ou para baixo): esconde de novo.
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll("[data-reveal]").forEach(element => revealObserver.observe(element));
  } else {
    document.querySelectorAll("[data-reveal]").forEach(element => element.classList.add("is-visible"));
  }

  const motionOK = !reducedMotion.matches;
  const clamp01 = v => Math.min(1, Math.max(0, v));

  // Divide textos em palavras (preserva <em>, <span> e <br>).
  const splitWords = (root, cls, startIndex = 0) => {
    let n = startIndex;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const w = document.createElement("span");
            w.className = cls;
            if (cls === "w") { const inner = document.createElement("span"); inner.textContent = part; w.append(inner); }
            else w.textContent = part;
            w.style.setProperty("--i", n++);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") walk(child);
      });
    };
    walk(root);
  };

  if (motionOK) {
    document.querySelectorAll("[data-split], .display-title, .interlude blockquote").forEach(el => {
      el.setAttribute("data-split", "");
      el.classList.add("split");
      splitWords(el, "w");
    });
    document.querySelectorAll(".manifesto-title").forEach(el => el.removeAttribute("data-reveal"));
  }
  const scrubWords = [];
  if (motionOK) {
    const t = document.querySelector(".manifesto-title");
    if (t) { splitWords(t, "sw"); scrubWords.push(t); }
  }
  // Os títulos divididos só precisam do observer para entrar em cena.
  if (motionOK && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      e.target.classList.toggle("is-visible", e.isIntersecting);
    }), { threshold: 0.2 });
    document.querySelectorAll("[data-split]:not([data-reveal])").forEach(el => io.observe(el));
  }
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-loaded")));

  // Barra de progresso da página.
  const pageBar = document.createElement("div");
  pageBar.className = "scroll-progress";
  pageBar.setAttribute("aria-hidden", "true");
  document.body.append(pageBar);

  // Parallax das imagens.
  const parallax = motionOK ? [...document.querySelectorAll(".interlude > img, .roast-feature > img, .origin-photo img, .ritual-photo img")] : [];
  parallax.forEach(img => img.setAttribute("data-parallax", ""));
  const speed = img => (img.closest(".interlude, .roast-feature") ? 0.08 : 0.06);

  // Vídeo da hero controlado pela rolagem, com suavização.
  const video = scrollVideo && hero && motionOK && scrollVideo.dataset.videoSrc?.trim() ? scrollVideo : null;
  let videoReady = false, current = 0, target = 0;
  if (video) {
    video.src = video.dataset.videoSrc.trim();
    video.load();
    video.addEventListener("loadedmetadata", () => { videoReady = true; video.pause(); video.classList.add("is-active"); }, { once: true });
    video.addEventListener("error", () => video.classList.remove("is-active"));
  }

  const loop = () => {
    const vh = window.innerHeight;

    if (hero) {
      const travel = Math.max(1, hero.offsetHeight - vh);
      const p = clamp01(-hero.getBoundingClientRect().top / travel);
      hero.style.setProperty("--p", p.toFixed(4));
      target = p;
    }
    if (videoReady) {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0005) current = target;
      const time = Math.min(video.duration - 0.05, current * video.duration);
      if (Math.abs(video.currentTime - time) > 0.02) { try { video.currentTime = time; } catch (_) {} }
    }

    const doc = document.documentElement;
    pageBar.style.transform = `scaleX(${clamp01(window.scrollY / Math.max(1, doc.scrollHeight - vh))})`;

    parallax.forEach(img => {
      const box = (img.closest(".image-panel, .interlude, .roast-feature") || img).getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      const offset = (box.top + box.height / 2 - vh / 2) * -speed(img);
      img.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });

    scrubWords.forEach(el => {
      const r = el.getBoundingClientRect();
      const prog = clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const words = el.querySelectorAll(".sw");
      const upto = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < upto));
    });

    requestAnimationFrame(loop);
  };
  if (motionOK) requestAnimationFrame(loop);

  // Botões "magnéticos" (apenas com mouse).
  if (motionOK && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".button").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y - 2}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }
})();
