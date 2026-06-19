(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', mobilePanel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var previousButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var currentSlide = 0;
  var timer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5600);
  }

  if (slides.length) {
    setSlide(0);
    startSlider();
  }

  if (previousButton) {
    previousButton.addEventListener('click', function () {
      setSlide(currentSlide - 1);
      startSlider();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      setSlide(currentSlide + 1);
      startSlider();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
      startSlider();
    });
  });

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var filterRegions = Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]'));
  var filterYears = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyMessage = document.querySelector('[data-empty-message]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var region = normalize(filterRegions.map(function (select) {
      return select.value;
    }).filter(Boolean).join(' '));
    var year = normalize(filterYears.map(function (select) {
      return select.value;
    }).filter(Boolean).join(' '));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
      var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
      var show = matchesKeyword && matchesRegion && matchesYear;

      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle('is-visible', visible === 0);
    }
  }

  filterInputs.concat(filterRegions, filterYears).forEach(function (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });
})();
