(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initialisePlayer(wrapper) {
    var video = wrapper.querySelector("video[data-hls-src]");
    var button = wrapper.querySelector(".player-start");
    var errorBox = wrapper.querySelector("[data-player-error]");
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function showError() {
      if (errorBox) {
        errorBox.hidden = false;
      }
    }

    function attachSource() {
      if (video.dataset.sourceReady === "true") {
        return;
      }

      var source = video.dataset.hlsSrc;
      if (!source) {
        showError();
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.dataset.sourceReady = "true";
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        video.dataset.sourceReady = "true";
        return;
      }

      showError();
    }

    function startPlayback() {
      attachSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          wrapper.classList.remove("is-playing");
        });
      }
      wrapper.classList.add("is-playing");
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    wrapper.addEventListener("click", function (event) {
      if (event.target.closest("a") || event.target.closest("button")) {
        return;
      }
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      wrapper.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        wrapper.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(initialisePlayer);
  });
})();
