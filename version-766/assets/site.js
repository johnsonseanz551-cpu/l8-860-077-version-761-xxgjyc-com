(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    if (!inputs.length) {
      return;
    }

    function apply(input) {
      var scope = input.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card, .rank-item"));
      var status = scope.querySelector("[data-filter-status]");
      var term = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search") || card.textContent);
        var ok = !term || text.indexOf(term) !== -1;
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = term ? "找到 " + visible + " 部影片" : "";
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        apply(input);
      });
      var scope = input.closest("section") || document;
      Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]")).forEach(function (chip) {
        chip.addEventListener("click", function () {
          input.value = chip.getAttribute("data-filter-chip") || "";
          Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]")).forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply(input);
        });
      });
    });
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("movieVideo");
    var layer = document.getElementById("playLayer");
    if (!video || !url) {
      return;
    }

    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attach();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    attach();

    if (layer) {
      layer.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
