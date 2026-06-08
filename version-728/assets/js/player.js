import { H as Hls } from "./hls.js";

function attachSource(video, source) {
  if (!video || !source || video.dataset.ready === "true") {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  } else if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video.hlsInstance = hls;
  } else {
    video.src = source;
  }

  video.dataset.ready = "true";
}

export function createPlayer(options) {
  var video = options.video;
  var button = options.button;
  var cover = options.cover;
  var source = options.source;

  function start(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    attachSource(video, source);

    if (cover) {
      cover.classList.add("is-hidden");
    }

    if (video) {
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.dataset.ready !== "true") {
        start();
      }
    });
  }
}
