(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterGrid(grid, keyword, category, year) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var term = normalize(keyword);
    var wantedCategory = normalize(category);
    var wantedYear = normalize(year);

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (term && text.indexOf(term) === -1) {
        matched = false;
      }

      if (wantedCategory && cardCategory !== wantedCategory) {
        matched = false;
      }

      if (wantedYear && cardYear !== wantedYear) {
        matched = false;
      }

      card.hidden = !matched;
    });
  }

  function sortGrid(grid, mode) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    if (!mode || mode === 'default' || mode === 'relevance') {
      return;
    }

    cards.sort(function (a, b) {
      if (mode === 'views') {
        return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
      }

      if (mode === 'year') {
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      }

      if (mode === 'title') {
        return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
      }

      return 0;
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  var searchGrid = document.querySelector('[data-search-grid]');

  if (searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = document.getElementById('search-input');
    var filterCategory = document.getElementById('filter-category');
    var filterYear = document.getElementById('filter-year');
    var sortMode = document.getElementById('sort-mode');

    if (searchInput) {
      searchInput.value = params.get('q') || '';
    }

    function applySearch() {
      sortGrid(searchGrid, sortMode ? sortMode.value : 'relevance');
      filterGrid(
        searchGrid,
        searchInput ? searchInput.value : '',
        filterCategory ? filterCategory.value : '',
        filterYear ? filterYear.value : ''
      );
    }

    [searchInput, filterCategory, filterYear, sortMode].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applySearch);
        element.addEventListener('change', applySearch);
      }
    });

    applySearch();
  }

  var pageGrid = document.querySelector('[data-filter-grid]');

  if (pageGrid) {
    var pageSearch = document.querySelector('[data-page-search]');
    var pageYear = document.querySelector('[data-page-year]');
    var pageSort = document.querySelector('[data-page-sort]');

    function applyPageFilter() {
      sortGrid(pageGrid, pageSort ? pageSort.value : 'default');
      filterGrid(
        pageGrid,
        pageSearch ? pageSearch.value : '',
        '',
        pageYear ? pageYear.value : ''
      );
    }

    [pageSearch, pageYear, pageSort].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyPageFilter);
        element.addEventListener('change', applyPageFilter);
      }
    });
  }
})();
