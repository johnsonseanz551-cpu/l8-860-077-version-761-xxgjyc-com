(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const sideItems = Array.from(hero.querySelectorAll("[data-hero-side]"));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
      sideItems.forEach(function (item, itemIndex) {
        item.classList.toggle("is-active", itemIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    sideItems.forEach(function (item, index) {
      item.addEventListener("mouseenter", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const localSearch = document.querySelector("[data-local-search]");
  const sortSelect = document.querySelector("[data-sort-select]");
  const sortGrid = document.querySelector("[data-sort-grid]");

  if (sortGrid) {
    const cards = Array.from(sortGrid.querySelectorAll("[data-movie-card]"));

    const applyLocalFilter = function () {
      const value = localSearch ? localSearch.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        card.style.display = !value || keywords.indexOf(value) !== -1 ? "" : "none";
      });
    };

    const sortCards = function () {
      const mode = sortSelect ? sortSelect.value : "default";
      const sorted = cards.slice();
      if (mode === "year") {
        sorted.sort(function (a, b) {
          return (b.getAttribute("data-keywords") || "").localeCompare(a.getAttribute("data-keywords") || "", "zh-Hans-CN");
        });
      }
      if (mode === "views") {
        sorted.reverse();
      }
      sorted.forEach(function (card) {
        sortGrid.appendChild(card);
      });
      applyLocalFilter();
    };

    if (localSearch) {
      localSearch.addEventListener("input", applyLocalFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }
  }

  const searchInput = document.querySelector("[data-search-page-input]");
  const searchGrid = document.querySelector("[data-search-grid]");
  const resultText = document.querySelector("[data-search-result-text]");
  const emptyResult = document.querySelector("[data-empty-result]");

  if (searchInput && searchGrid) {
    const cards = Array.from(searchGrid.querySelectorAll("[data-movie-card]"));
    const params = new URLSearchParams(window.location.search);
    searchInput.value = params.get("q") || "";

    const applySearch = function () {
      const value = searchInput.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        const matched = !value || keywords.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (resultText) {
        resultText.textContent = value ? "已按关键词筛选匹配内容。" : "为你展示匹配内容。";
      }
      if (emptyResult) {
        emptyResult.classList.toggle("is-visible", visible === 0);
      }
    };

    searchInput.addEventListener("input", applySearch);
    applySearch();
  }

  const video = document.querySelector("[data-player]");
  const playOverlay = document.querySelector("[data-play-overlay]");

  if (video && typeof playerConfig !== "undefined" && playerConfig.source) {
    let loaded = false;
    let hlsPlayer = null;

    const loadPlayer = function () {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && Hls.isSupported()) {
        hlsPlayer = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsPlayer.loadSource(playerConfig.source);
        hlsPlayer.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playerConfig.source;
      }
    };

    const startPlayer = function () {
      loadPlayer();
      if (playOverlay) {
        playOverlay.classList.add("is-hidden");
      }
      const action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    };

    if (playOverlay) {
      playOverlay.addEventListener("click", startPlayer);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayer();
      }
    });

    video.addEventListener("play", function () {
      if (playOverlay) {
        playOverlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  }
})();
