(function () {
  var index = window.MOVIE_INDEX || [];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function pagePrefix() {
    var path = String(window.location.pathname || '').replace(/\\/g, '/');
    return path.indexOf('/detail/') !== -1 || path.indexOf('/category/') !== -1 ? '../' : './';
  }

  function bindSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var results = form.parentElement.querySelector('[data-search-results]') || form.querySelector('[data-search-results]');
      if (!input || !results) {
        return;
      }

      function render() {
        var q = normalize(input.value);
        results.innerHTML = '';
        if (!q) {
          results.classList.remove('is-open');
          return;
        }
        var matched = index.filter(function (item) {
          return normalize(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.year).indexOf(q) !== -1;
        }).slice(0, 8);
        if (!matched.length) {
          results.classList.remove('is-open');
          return;
        }
        matched.forEach(function (item) {
          var link = document.createElement('a');
          link.href = pagePrefix() + item.href;
          link.innerHTML = '<strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>';
          results.appendChild(link);
        });
        results.classList.add('is-open');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      input.addEventListener('blur', function () {
        window.setTimeout(function () {
          results.classList.remove('is-open');
        }, 180);
      });
      form.addEventListener('submit', function (event) {
        var q = normalize(input.value);
        if (!q) {
          return;
        }
        var matched = index.find(function (item) {
          return normalize(item.title).indexOf(q) !== -1;
        });
        if (matched) {
          event.preventDefault();
          window.location.href = pagePrefix() + matched.href;
        }
      });
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    start();
  }

  function bindFilters() {
    var input = document.querySelector('[data-filter-input]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!cards.length) {
      return;
    }

    function applyUrlQuery() {
      if (!input) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    function filter() {
      var q = normalize(input && input.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.genre + ' ' + card.dataset.type + ' ' + card.dataset.year);
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (t && normalize(card.dataset.type).indexOf(t) === -1) {
          ok = false;
        }
        if (y && normalize(card.dataset.year) !== y) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }

    applyUrlQuery();
    if (input) {
      input.addEventListener('input', filter);
    }
    if (type) {
      type.addEventListener('change', filter);
    }
    if (year) {
      year.addEventListener('change', filter);
    }
    filter();
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMobileNav();
    bindSearchForms();
    bindHero();
    bindFilters();
  });
})();
