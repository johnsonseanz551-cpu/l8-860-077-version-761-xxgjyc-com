(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-nav]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        function show(nextIndex) {
            slides[index].classList.remove('active');
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add('active');
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        window.setInterval(function () {
            show(index + 1);
        }, 6200);
    }

    function setupLocalFilter() {
        var input = qs('[data-local-filter]');
        if (!input) {
            return;
        }
        var cards = qsa('[data-card]');
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
            });
        });
    }

    function setupPlayer() {
        var shell = qs('[data-player]');
        if (!shell) {
            return;
        }
        var video = qs('video', shell);
        var button = qs('.play-cover', shell);
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute('data-play-url');
        var ready = false;
        function load() {
            if (!stream) {
                return;
            }
            button.classList.add('is-hidden');
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', stream);
                }
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!ready) {
                    var hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    ready = true;
                }
                video.play().catch(function () {});
                return;
            }
            if (!video.getAttribute('src')) {
                video.setAttribute('src', stream);
            }
            video.play().catch(function () {});
        }
        button.addEventListener('click', load);
        video.addEventListener('click', function () {
            if (video.paused) {
                load();
            }
        });
    }

    function cardTemplate(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card" data-card>' +
            '<a class="poster-link" href="./' + item.file + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="play-dot">▶</span>' +
            '</a>' +
            '<div class="card-body">' +
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
                '<div class="card-foot"><span>' + escapeHtml(item.duration) + '</span><span>' + escapeHtml(item.category) + '</span></div>' +
            '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupSearchPage() {
        var input = qs('#site-search-input');
        var button = qs('#site-search-button');
        var results = qs('#site-search-results');
        if (!input || !button || !results || typeof siteSearchItems === 'undefined') {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function render() {
            var keyword = input.value.trim().toLowerCase();
            var list = siteSearchItems.filter(function (item) {
                var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.category].join(' ').toLowerCase();
                return !keyword || text.indexOf(keyword) !== -1;
            }).slice(0, 120);
            if (!list.length) {
                results.innerHTML = '<div class="is-empty">没有找到匹配内容</div>';
                return;
            }
            results.innerHTML = list.map(cardTemplate).join('');
        }
        button.addEventListener('click', render);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                render();
            }
        });
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupPlayer();
        setupSearchPage();
    });
}());
