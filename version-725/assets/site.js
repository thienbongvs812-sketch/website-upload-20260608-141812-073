const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
        mobileNav.classList.toggle('is-open');
    });
}

for (const form of document.querySelectorAll('[data-header-search]')) {
    form.addEventListener('submit', event => {
        const input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
            event.preventDefault();
            return;
        }
    });
}

const carousel = document.querySelector('[data-hero-carousel]');

if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;

    const showSlide = nextIndex => {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    if (prev) {
        prev.addEventListener('click', () => showSlide(index - 1));
    }

    if (next) {
        next.addEventListener('click', () => showSlide(index + 1));
    }

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => showSlide(dotIndex));
    });

    window.setInterval(() => showSlide(index + 1), 5200);
}

for (const panel of document.querySelectorAll('[data-filter-panel]')) {
    const scope = panel.parentElement;
    const list = scope ? scope.querySelector('[data-filter-list]') : null;
    const cards = list ? Array.from(list.querySelectorAll('[data-search-card]')) : [];
    const input = panel.querySelector('[data-filter-input]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const empty = scope ? scope.querySelector('[data-empty-state]') : null;

    const applyFilter = () => {
        const keyword = input ? input.value.trim().toLowerCase() : '';
        const typeValue = typeSelect ? typeSelect.value : '';
        const yearValue = yearSelect ? yearSelect.value : '';
        let visible = 0;

        cards.forEach(card => {
            const text = (card.dataset.text || '').toLowerCase();
            const type = card.dataset.type || '';
            const year = card.dataset.year || '';
            const matchesKeyword = !keyword || text.includes(keyword);
            const matchesType = !typeValue || type.includes(typeValue);
            const matchesYear = !yearValue || year.includes(yearValue);
            const matched = matchesKeyword && matchesType && matchesYear;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };

    for (const control of [input, typeSelect, yearSelect]) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    }
}

const searchPage = document.querySelector('[data-search-page]');

if (searchPage && Array.isArray(window.SEARCH_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const form = searchPage.querySelector('[data-page-search]');
    const input = form ? form.querySelector('input[name="q"]') : null;
    const results = searchPage.querySelector('[data-search-results]');
    const empty = searchPage.querySelector('[data-search-empty]');
    const initialQuery = (params.get('q') || '').trim();

    if (input) {
        input.value = initialQuery;
    }

    const renderResult = item => {
        const article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = `
            <a class="poster-link" href="${item.url}" aria-label="观看${item.title}">
                <img src="${item.cover}" alt="${item.title}">
                <span class="poster-mask">立即观看</span>
            </a>
            <div class="movie-card-body">
                <div class="movie-meta-line">
                    <span>${item.region}</span>
                    <span>${item.year}</span>
                </div>
                <h2><a href="${item.url}">${item.title}</a></h2>
                <p>${item.oneLine}</p>
                <div class="tag-row">
                    ${item.tags.slice(0, 4).map(tag => `<span>${tag}</span>`).join('')}
                </div>
            </div>
        `;
        return article;
    };

    const runSearch = value => {
        const query = value.trim().toLowerCase();
        results.innerHTML = '';

        if (!query) {
            empty.classList.add('is-visible');
            return;
        }

        const matched = window.SEARCH_INDEX.filter(item => item.text.includes(query)).slice(0, 120);
        matched.forEach(item => results.appendChild(renderResult(item)));
        empty.classList.toggle('is-visible', matched.length === 0);
    };

    if (form && input) {
        form.addEventListener('submit', event => {
            event.preventDefault();
            const query = input.value.trim();
            const url = new URL(window.location.href);
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url.toString());
            runSearch(query);
        });

        input.addEventListener('input', () => runSearch(input.value));
    }

    runSearch(initialQuery);
}
