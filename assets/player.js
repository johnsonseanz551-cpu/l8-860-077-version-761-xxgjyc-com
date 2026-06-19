(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".player-card"));

    cards.forEach(function (card) {
      var video = card.querySelector("video");
      var overlay = card.querySelector(".player-overlay");
      var hlsInstance = null;

      if (!video || !overlay) {
        return;
      }

      function bindSource() {
        if (card.getAttribute("data-ready") === "true") {
          return;
        }

        var source = video.getAttribute("data-hls") || "";

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        card.setAttribute("data-ready", "true");
      }

      function startPlayback() {
        bindSource();
        overlay.classList.add("is-hidden");
        video.controls = true;

        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", startPlayback);

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
