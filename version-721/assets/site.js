(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function htmlEscape(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initMenus() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        window.location.href = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    start();
  }

  function initFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = qs('[data-filter-search]', panel);
      var year = qs('[data-filter-year]', panel);
      var type = qs('[data-filter-type]', panel);
      var cards = qsa('.catalog-card', scope);

      function apply() {
        var term = text(input && input.value);
        var yearValue = text(year && year.value);
        var typeValue = text(type && type.value);
        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var okTerm = !term || haystack.indexOf(term) !== -1;
          var okYear = !yearValue || text(card.getAttribute('data-year')) === yearValue;
          var okType = !typeValue || text(card.getAttribute('data-type')) === typeValue;
          card.style.display = okTerm && okYear && okType ? '' : 'none';
        });
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function attachStream(video, stream, callback) {
    if (!video || !stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      if (callback) {
        callback();
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hls) {
        video._hls.destroy();
      }
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      video._hls = hls;
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(stream);
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (callback) {
          callback();
        }
      });
      return;
    }
    video.src = stream;
    if (callback) {
      callback();
    }
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('video', shell);
      var overlay = qs('.play-overlay', shell);
      var stream = shell.getAttribute('data-stream');
      var loaded = false;

      function play() {
        if (!video) {
          return;
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (!loaded) {
          loaded = true;
          attachStream(video, stream, function () {
            var promise = video.play();
            if (promise && promise.catch) {
              promise.catch(function () {});
            }
          });
        } else {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          if (!loaded) {
            loaded = true;
            attachStream(video, stream);
          }
        }, { once: true });
      }
    });
  }

  function renderSearchResults() {
    var container = qs('[data-search-results]');
    var form = qs('[data-search-page-form]');
    if (!container || !form || !window.SEARCH_MOVIES) {
      return;
    }
    var input = qs('input[name="q"]', form);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + htmlEscape(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="./' + htmlEscape(movie.file) + '">',
        '<img src="' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
        '<span class="poster-year">' + htmlEscape(movie.year) + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-row"><span>' + htmlEscape(movie.region) + '</span><span>' + htmlEscape(movie.type) + '</span></div>',
        '<h3><a href="./' + htmlEscape(movie.file) + '">' + htmlEscape(movie.title) + '</a></h3>',
        '<p>' + htmlEscape(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function render() {
      var term = text(input && input.value);
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        if (!term) {
          return true;
        }
        var haystack = text([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return haystack.indexOf(term) !== -1;
      }).slice(0, 120);
      container.innerHTML = results.map(card).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    if (input) {
      input.addEventListener('input', render);
    }
    if (initial) {
      render();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenus();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
    renderSearchResults();
  });
})();
