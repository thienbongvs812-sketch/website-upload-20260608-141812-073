(function() {
    window.activatePlayer = function(shellId, videoId, sourceUrl) {
        const shell = document.getElementById(shellId);
        const video = document.getElementById(videoId);

        if (!shell || !video || !sourceUrl) {
            return;
        }

        const Hls = window.Hls;
        const button = shell.querySelector('.play-cover');
        let hls = null;
        let ready = false;

        const markError = () => {
            const error = document.createElement('div');
            error.className = 'play-cover';
            error.innerHTML = '<span class="play-circle">!</span><span>视频加载失败，请刷新重试</span>';
            shell.appendChild(error);
        };

        const prepare = () => {
            if (ready) {
                return;
            }

            ready = true;

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    markError();
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            markError();
        };

        const play = async () => {
            prepare();
            shell.classList.add('is-playing');
            try {
                await video.play();
            } catch (error) {
                shell.classList.remove('is-playing');
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('play', () => {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', () => {
            shell.classList.remove('is-playing');
        });

        video.addEventListener('click', () => {
            if (video.paused) {
                play();
                return;
            }
            video.pause();
        });

        prepare();

        window.addEventListener('pagehide', () => {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
