(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('mainNav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initSearch() {
    var inputs = document.querySelectorAll('.site-search-input');
    var panel = document.querySelector('[data-search-results]');
    var data = Array.isArray(window.SITE_SEARCH_INDEX) ? window.SITE_SEARCH_INDEX : [];
    if (!inputs.length || !panel || !data.length) {
      return;
    }
    function render(query) {
      var value = query.trim().toLowerCase();
      if (!value) {
        panel.hidden = true;
        panel.innerHTML = '';
        return;
      }
      var words = value.split(/\s+/).filter(Boolean);
      var matches = data.filter(function (item) {
        var haystack = String(item.text || '').toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 18);
      if (!matches.length) {
        panel.hidden = false;
        panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        return;
      }
      panel.hidden = false;
      panel.innerHTML = matches.map(function (item) {
        return '<a class="search-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>' +
          '</a>';
      }).join('');
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
      input.addEventListener('focus', function () {
        render(input.value);
      });
    });
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && !event.target.classList.contains('site-search-input')) {
        panel.hidden = true;
      }
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCatalogFilters() {
    var grid = document.querySelector('[data-catalog-grid]');
    if (!grid) {
      return;
    }
    var keyword = document.querySelector('[data-catalog-keyword]');
    var year = document.querySelector('[data-catalog-year]');
    var type = document.querySelector('[data-catalog-type]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    function apply() {
      var key = keyword ? keyword.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      grid.classList.add('is-filtering');
      cards.forEach(function (card) {
        var text = String(card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var visible = true;
        if (key && text.indexOf(key) === -1) {
          visible = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          visible = false;
        }
        if (selectedType && cardType !== selectedType) {
          visible = false;
        }
        card.hidden = !visible;
      });
    }
    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initPlayer() {
    var shell = document.querySelector('[data-stream]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-button]');
    var stream = shell.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;
    function prepare() {
      if (prepared || !video || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      prepared = true;
    }
    function start() {
      prepare();
      shell.classList.add('is-playing');
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  function initBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  ready(function () {
    initMenu();
    initSearch();
    initHero();
    initCatalogFilters();
    initPlayer();
    initBackTop();
  });
})();
