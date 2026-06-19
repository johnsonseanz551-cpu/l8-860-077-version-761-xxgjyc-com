(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          if (timer) {
            window.clearInterval(timer);
          }
          timer = window.setInterval(function () {
            show(index + 1);
          }, 5000);
        });
      });
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    filterInputs.forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-filter-input"));
      var empty = document.querySelector(input.getAttribute("data-empty-target") || "");
      var apply = function () {
        if (!target) {
          return;
        }
        var q = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
          var match = !q || haystack.indexOf(q) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      input.addEventListener("input", apply);
      apply();
    });

    var searchInput = document.querySelector("[data-search-page-input]");
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      searchInput.value = q;
      searchInput.dispatchEvent(new Event("input"));
    }
  });
})();

function initMoviePlayer(videoId, streamUrl, buttonId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !streamUrl) {
    return;
  }
  var start = function () {
    if (button) {
      button.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsReady) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsReady = true;
        video.hlsObject = hls;
      }
      video.play().catch(function () {});
      return;
    }
    video.src = streamUrl;
    video.play().catch(function () {});
  };
  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
