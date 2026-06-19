import { H as Hls } from './hls-vendor.js';

var startPlayer = function (shell) {
    var video = shell.querySelector('video[data-hls]');
    var button = shell.querySelector('[data-play]');
    var state = shell.querySelector('[data-player-state]');
    if (!video || !button) {
        return;
    }
    var source = video.getAttribute('data-hls');
    var ready = false;
    var hls = null;
    var prepare = function () {
        if (ready) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.load();
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (state) {
            state.textContent = '播放暂时不可用';
        }
        ready = true;
    };
    var play = function () {
        prepare();
        var promise = video.play();
        button.classList.add('hidden');
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                button.classList.remove('hidden');
            });
        }
    };
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('hidden');
        }
    });
    video.addEventListener('ended', function () {
        button.classList.remove('hidden');
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
};

Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(startPlayer);
