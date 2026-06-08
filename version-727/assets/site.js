document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    });

    document.querySelectorAll("[data-local-search]").forEach(function (input) {
        var scope = input.closest("main") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var empty = scope.querySelector("[data-no-results]");

        function runFilter() {
            var query = input.value.trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var visible = !query || text.indexOf(query) !== -1;
                card.classList.toggle("hidden-card", !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        input.addEventListener("input", runFilter);
        runFilter();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var cover = player.querySelector("[data-player-cover]");
        var playButtons = Array.prototype.slice.call(player.querySelectorAll("[data-play-button]"));
        var muteButton = player.querySelector("[data-mute-button]");
        var fullscreenButton = player.querySelector("[data-fullscreen-button]");
        var stream = video ? video.getAttribute("data-stream") : "";
        var hls = null;
        var attached = false;
        var waitingForManifest = false;

        if (!video || !stream) {
            return;
        }

        function setPlayingState() {
            var playing = !video.paused && !video.ended;
            player.classList.toggle("is-playing", playing);
            playButtons.forEach(function (button) {
                button.textContent = playing ? "❚❚" : "▶";
            });
        }

        function attachStream(callback) {
            if (attached) {
                if (callback) {
                    callback();
                }
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                if (callback) {
                    callback();
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                waitingForManifest = true;
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    waitingForManifest = false;
                    if (callback) {
                        callback();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        hls = null;
                        attached = false;
                    }
                });
                return;
            }

            video.src = stream;
            if (callback) {
                callback();
            }
        }

        function playVideo() {
            if (cover) {
                cover.classList.add("is-hidden");
            }

            video.setAttribute("controls", "controls");

            attachStream(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            });

            if (waitingForManifest) {
                player.classList.add("is-playing");
            }
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                playVideo();
            } else {
                video.pause();
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                togglePlay();
            });
        });

        if (cover) {
            cover.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        video.addEventListener("click", togglePlay);
        video.addEventListener("play", setPlayingState);
        video.addEventListener("pause", setPlayingState);
        video.addEventListener("ended", setPlayingState);

        if (muteButton) {
            muteButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "🔇" : "🔊";
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        setPlayingState();
    });
});
