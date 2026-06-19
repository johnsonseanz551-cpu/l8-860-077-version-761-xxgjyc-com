(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (mobileButton && mobileMenu) {
        mobileButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;
        var show = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        var play = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };
        var reset = function () {
            window.clearInterval(timer);
            play();
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                reset();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                reset();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                reset();
            });
        }
        show(0);
        play();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-movie-search]');
        var yearButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year]'));
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year-select]');
        var scope = panel.parentElement || document;
        var list = scope.querySelector('.searchable-list') || document.querySelector('.searchable-list');
        var activeYear = '';
        var apply = function () {
            if (!list) {
                return;
            }
            var query = input ? input.value.trim().toLowerCase() : '';
            var selectedType = typeSelect ? typeSelect.value : '';
            var selectedYear = yearSelect ? yearSelect.value : activeYear;
            Array.prototype.slice.call(list.querySelectorAll('.movie-card, .ranking-card')).forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesType = !selectedType || card.getAttribute('data-type') === selectedType;
                var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                card.classList.toggle('hidden', !(matchesQuery && matchesType && matchesYear));
            });
        };
        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || '';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        apply();
    });
}());
