(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var muteButton = player.querySelector('[data-mute-button]');
    var fullButton = player.querySelector('[data-full-button]');
    var state = player.querySelector('[data-player-state]');
    var videoUrl = player.getAttribute('data-video');
    var hlsInstance = null;

    function setState(text) {
      if (state) {
        state.textContent = text;
      }
    }

    function attachVideo() {
      if (!video || !videoUrl) {
        setState('视频暂时无法播放');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState('点击播放');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState('视频加载失败');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', function () {
          setState('点击播放');
        });
        return;
      }

      setState('浏览器暂不支持该播放格式');
    }

    function togglePlay() {
      if (!video) {
        return;
      }

      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setState('点击播放');
          });
        }
      } else {
        video.pause();
      }
    }

    function updatePlayingState() {
      if (!video) {
        return;
      }

      player.classList.toggle('is-playing', !video.paused);
      setState(video.paused ? '点击播放' : '正在播放');
    }

    attachVideo();

    if (playButton) {
      playButton.addEventListener('click', togglePlay);
    }

    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', updatePlayingState);
      video.addEventListener('pause', updatePlayingState);
      video.addEventListener('ended', updatePlayingState);
    }

    if (muteButton && video) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '开启声音' : '静音';
      });
    }

    if (fullButton && video) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
