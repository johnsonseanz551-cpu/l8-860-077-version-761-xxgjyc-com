(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function initSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q'], input[type='search']");
                var query = input ? input.value.trim() : "";
                window.location.href = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
            });
        });
    }

    function filterCards(root, query) {
        var value = (query || "").trim().toLowerCase();
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .mini-card"));
        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            card.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
        });
    }

    function initLocalFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (form) {
            var input = form.querySelector("input[type='search']");
            var area = document.querySelector("[data-filter-list]") || document;
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                filterCards(area, input ? input.value : "");
            });
            if (input) {
                input.addEventListener("input", function () {
                    filterCards(area, input.value);
                });
            }
        });

        var page = document.querySelector("[data-search-page]");
        if (page) {
            var boxForm = page.querySelector("[data-search-box]");
            var box = boxForm ? boxForm.querySelector("input[type='search']") : null;
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (box) {
                box.value = initial;
            }
            filterCards(page, initial);
            if (boxForm) {
                boxForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    filterCards(page, box ? box.value : "");
                });
            }
            if (box) {
                box.addEventListener("input", function () {
                    filterCards(page, box.value);
                });
            }
        }
    }

    function initPlayer(streamUrl) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var button = document.querySelector(".play-layer");
            var hls = null;
            var attached = false;

            if (!video || !streamUrl) {
                return;
            }

            function attachMedia() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function start() {
                attachMedia();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var playAction = video.play();
                if (playAction && typeof playAction.catch === "function") {
                    playAction.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("ended", function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initSearchForms();
        initLocalFilters();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
