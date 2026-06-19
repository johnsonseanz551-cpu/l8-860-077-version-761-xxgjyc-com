(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalise(value) {
    return String(value || "").toLowerCase().trim();
  }

  function imageFallbacks() {
    document.querySelectorAll("img[data-fallback-image]").forEach(function (image) {
      image.addEventListener("error", function () {
        var holder = image.parentElement;
        if (holder) {
          holder.classList.add("image-missing");
        }
        image.remove();
      }, { once: true });
    });
  }

  function bindMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function bindCategoryFilter() {
    var area = document.querySelector("[data-filter-area]");
    if (!area) {
      return;
    }
    var input = area.querySelector(".js-category-filter");
    var sort = area.querySelector(".js-category-sort");
    var list = area.querySelector("[data-card-list]");
    var empty = area.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));

    function apply() {
      var query = normalise(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalise([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(" "));
        var matched = !query || haystack.indexOf(query) >= 0;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (sort && list) {
        var value = sort.value;
        cards.sort(function (left, right) {
          if (value === "title") {
            return String(left.dataset.title).localeCompare(String(right.dataset.title), "zh-Hans-CN");
          }
          if (value === "year") {
            return Number(right.dataset.year.replace(/\D/g, "") || 0) - Number(left.dataset.year.replace(/\D/g, "") || 0);
          }
          return Number(right.dataset.score || 0) - Number(left.dataset.score || 0);
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.link) + "\">",
      "  <span class=\"poster-wrap\">",
      "    <img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" data-fallback-image>",
      "    <span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>",
      "    <span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
      "  </span>",
      "  <span class=\"movie-card-body\">",
      "    <strong>" + escapeHtml(movie.title) + "</strong>",
      "    <em>" + escapeHtml(movie.oneLine) + "</em>",
      "    <span class=\"meta-line\">" + escapeHtml(movie.region + " · " + movie.year + " · " + movie.genre) + "</span>",
      "    <span class=\"tag-row\">" + tags + "</span>",
      "  </span>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function bindSearchPage() {
    var data = window.MOVIE_INDEX;
    var results = document.querySelector("[data-search-results]");
    if (!data || !results) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-search-category]");
    var sort = document.querySelector("[data-search-sort]");
    var empty = document.querySelector("[data-search-empty]");
    var parameters = new URLSearchParams(window.location.search);
    if (input && parameters.get("q")) {
      input.value = parameters.get("q");
    }

    function apply() {
      var query = normalise(input ? input.value : "");
      var selectedCategory = category ? category.value : "";
      var selectedSort = sort ? sort.value : "score";
      var filtered = data.filter(function (movie) {
        var haystack = normalise([
          movie.title,
          movie.oneLine,
          movie.region,
          movie.genre,
          movie.year,
          (movie.tags || []).join(" ")
        ].join(" "));
        return (!query || haystack.indexOf(query) >= 0) && (!selectedCategory || movie.categorySlug === selectedCategory);
      });

      filtered.sort(function (left, right) {
        if (selectedSort === "title") {
          return String(left.title).localeCompare(String(right.title), "zh-Hans-CN");
        }
        if (selectedSort === "year") {
          return Number(String(right.year).replace(/\D/g, "") || 0) - Number(String(left.year).replace(/\D/g, "") || 0);
        }
        return Number(right.score || 0) - Number(left.score || 0);
      });

      results.innerHTML = filtered.slice(0, 240).map(movieCardTemplate).join("");
      imageFallbacks();
      if (empty) {
        empty.hidden = filtered.length !== 0;
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }
    [input, category, sort].forEach(function (element) {
      if (element) {
        element.addEventListener(element.tagName === "INPUT" ? "input" : "change", apply);
      }
    });
    apply();
  }

  ready(function () {
    bindMobileNav();
    bindHero();
    bindCategoryFilter();
    bindSearchPage();
    imageFallbacks();
  });
})();
