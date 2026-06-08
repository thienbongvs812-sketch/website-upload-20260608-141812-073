(function () {
  function initMoviePlayer(source) {
    const video = document.querySelector('.video-player');
    const overlay = document.querySelector('.player-overlay');
    let ready = false;

    if (!video || !source) {
      return;
    }

    function load() {
      if (ready) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        play();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
