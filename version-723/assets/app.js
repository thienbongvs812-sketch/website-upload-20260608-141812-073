(function () {
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function createSuggestion(movie) {
    const item = document.createElement('a');
    item.className = 'suggest-item';
    item.href = './' + movie.url;
    item.innerHTML = '<img src="' + movie.image + '" alt="" loading="lazy" /><span><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.genre + '</span></span>';
    return item;
  }

  function setupSearchSuggest(input) {
    const form = input.closest('form');
    const box = form ? form.querySelector('.search-suggest') : null;
    if (!box) {
      return;
    }
    input.addEventListener('input', function () {
      const keyword = normalize(input.value);
      box.innerHTML = '';
      if (!keyword) {
        box.classList.remove('is-open');
        return;
      }
      const results = movies.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.genre + ' ' + movie.region + ' ' + movie.year + ' ' + movie.oneLine).includes(keyword);
      }).slice(0, 6);
      results.forEach(function (movie) {
        box.appendChild(createSuggestion(movie));
      });
      box.classList.toggle('is-open', results.length > 0);
    });
    input.addEventListener('blur', function () {
      setTimeout(function () {
        box.classList.remove('is-open');
      }, 180);
    });
  }

  function setupMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function setupHero() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    if (!slides.length || !dots.length) {
      return;
    }
    let index = 0;
    let timer = null;
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
      timer = setInterval(function () {
        show(index + 1);
      }, 5500);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    const grids = document.querySelectorAll('.category-movie-grid');
    grids.forEach(function (grid) {
      const section = grid.closest('.section-block');
      if (!section) {
        return;
      }
      const input = section.querySelector('.filter-input');
      const yearSelect = section.querySelector('.filter-year');
      const typeSelect = section.querySelector('.filter-type');
      const empty = section.querySelector('.empty-state');
      const cards = Array.from(grid.querySelectorAll('.movie-card'));
      function apply() {
        const keyword = normalize(input ? input.value : '');
        const year = yearSelect ? yearSelect.value : '';
        const type = typeSelect ? typeSelect.value : '';
        let visible = 0;
        cards.forEach(function (card) {
          const hay = normalize(card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.genre + ' ' + card.dataset.type + ' ' + card.dataset.year);
          const passKeyword = !keyword || hay.includes(keyword);
          const passYear = !year || card.dataset.year === year;
          const passType = !type || card.dataset.type === type;
          const pass = passKeyword && passYear && passType;
          card.style.display = pass ? '' : 'none';
          if (pass) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }
      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function renderSearchPage() {
    const holder = document.getElementById('searchResults');
    const title = document.getElementById('searchResultTitle');
    const input = document.getElementById('searchPageInput');
    if (!holder || !title) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    if (input) {
      input.value = query;
    }
    const keyword = normalize(query);
    const results = keyword ? movies.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.genre + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.oneLine).includes(keyword);
    }) : movies.slice(0, 36);
    title.textContent = keyword ? '搜索结果：' + query : '热门推荐';
    holder.innerHTML = '';
    results.slice(0, 120).forEach(function (movie) {
      const link = document.createElement('a');
      link.className = 'movie-card';
      link.href = './' + movie.url;
      link.innerHTML = '<span class="poster-wrap"><img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy" /><span class="poster-mask"><span class="play-dot">▶</span></span><span class="movie-tag">' + movie.genre.split(/[\/，,]/)[0] + '</span></span><span class="movie-info"><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + '</span><em>' + movie.oneLine + '</em></span>';
      holder.appendChild(link);
    });
    if (!results.length) {
      holder.innerHTML = '<div class="empty-state" style="display:block">没有找到匹配的影片</div>';
    }
  }

  document.querySelectorAll('.site-search-input').forEach(setupSearchSuggest);
  setupMobileMenu();
  setupHero();
  setupFilters();
  renderSearchPage();
})();
