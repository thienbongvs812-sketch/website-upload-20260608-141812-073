(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    schedule();
  }

  function initGlobalSearch() {
    document.querySelectorAll(".global-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function cardHTML(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    var style = "background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 34%, rgba(0, 0, 0, 0.90) 100%), url('" + escapeHTML(movie.image) + "');";
    return "<article class=\"movie-card\" data-title=\"" + escapeHTML(movie.title) + "\" data-year=\"" + escapeHTML(movie.year) + "\" data-region=\"" + escapeHTML(movie.region) + "\" data-type=\"" + escapeHTML(movie.type) + "\" data-genre=\"" + escapeHTML(movie.genre) + "\">" +
      "<a class=\"poster-card\" href=\"" + escapeHTML(movie.url) + "\" style=\"" + style + "\">" +
      "<div class=\"poster-meta\"><span>" + escapeHTML(movie.year) + "</span><span>" + escapeHTML(movie.type) + "</span></div>" +
      "</a>" +
      "<div class=\"card-content\">" +
      "<h2><a href=\"" + escapeHTML(movie.url) + "\">" + escapeHTML(movie.title) + "</a></h2>" +
      "<p>" + escapeHTML(movie.line) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");
    var input = document.getElementById("searchInput");
    var empty = document.getElementById("searchEmpty");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.line]
        .join(" ")
        .toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 96);
    if (title) {
      title.textContent = "搜索结果：" + query;
    }
    results.innerHTML = matched.map(cardHTML).join("");
    if (empty) {
      empty.hidden = matched.length > 0;
    }
  }

  function initPageFilter() {
    var filterBar = document.querySelector("[data-filter-bar]");
    var input = document.getElementById("pageFilter");
    var grid = document.querySelector(".filter-grid");
    var empty = document.querySelector(".empty-state");
    if (!filterBar || !input || !grid) {
      return;
    }
    var selectedYear = "";
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter-year]"));

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      grid.querySelectorAll(".movie-card").forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var shouldShow = yearMatch && queryMatch;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible > 0;
      }
    }

    input.addEventListener("input", applyFilter);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedYear = button.getAttribute("data-filter-year") || "";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initSearchPage();
    initPageFilter();
  });
})();
