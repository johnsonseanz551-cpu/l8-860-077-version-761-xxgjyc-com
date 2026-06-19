(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector(".back-top");

    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 420) {
          backTop.classList.add("is-visible");
        } else {
          backTop.classList.remove("is-visible");
        }
      });

      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
        });
      });

      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    var searchInput = document.getElementById("searchInput");
    var searchGrid = document.getElementById("searchGrid");

    if (searchInput && searchGrid) {
      var cards = Array.prototype.slice.call(searchGrid.querySelectorAll(".search-card, .movie-card"));
      var categoryFilter = document.getElementById("categoryFilter");
      var yearFilter = document.getElementById("yearFilter");
      var typeFilter = document.getElementById("typeFilter");
      var regionFilter = document.getElementById("regionFilter");
      var resultCount = document.getElementById("resultCount");
      var emptyState = document.getElementById("emptyState");
      var clearFilters = document.getElementById("clearFilters");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      searchInput.value = initialQuery;

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var query = normalize(searchInput.value);
        var category = categoryFilter ? categoryFilter.value : "";
        var year = yearFilter ? yearFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var region = regionFilter ? regionFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }

          if (category && card.getAttribute("data-category") !== category) {
            matched = false;
          }

          if (year && card.getAttribute("data-year") !== year) {
            matched = false;
          }

          if (type && card.getAttribute("data-type") !== type) {
            matched = false;
          }

          if (region && card.getAttribute("data-region") !== region) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (resultCount) {
          resultCount.textContent = "找到 " + visible + " 个结果";
        }

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [searchInput, categoryFilter, yearFilter, typeFilter, regionFilter].forEach(function (control) {
        if (!control) {
          return;
        }

        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      });

      if (clearFilters) {
        clearFilters.addEventListener("click", function () {
          searchInput.value = "";

          [categoryFilter, yearFilter, typeFilter, regionFilter].forEach(function (control) {
            if (control) {
              control.value = "";
            }
          });

          applyFilters();
        });
      }

      applyFilters();
    }
  });
})();
