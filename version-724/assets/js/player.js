(function() {
    function init(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function start() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.src !== source) {
                    video.src = source;
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                }
            } else if (video.src !== source) {
                video.src = source;
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });
    }

    window.SitePlayer = {
        init: init
    };
})();
