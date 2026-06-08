(function () {
  window.setupMoviePlayer = function (videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;

    if (!video || !button || !url) {
      return;
    }

    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== url) {
          video.src = url;
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        }
        return;
      }

      if (video.src !== url) {
        video.src = url;
      }
    }

    function play() {
      attach();
      button.classList.add('is-hidden');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
