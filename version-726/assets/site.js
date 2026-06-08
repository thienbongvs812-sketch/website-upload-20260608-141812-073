(() => {
  const mobileButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const activate = (nextIndex) => {
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

    const start = () => {
      stop();
      timer = window.setInterval(() => activate(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    prev?.addEventListener('click', () => {
      activate(index - 1);
      start();
    });

    next?.addEventListener('click', () => {
      activate(index + 1);
      start();
    });

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        activate(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  const forms = Array.from(document.querySelectorAll('[data-filter-form]'));

  forms.forEach((form) => {
    const scope = form.closest('main')?.querySelector('[data-filter-scope]');
    const items = scope ? Array.from(scope.children) : [];
    const search = form.querySelector('[data-search-input]');
    const selects = Array.from(form.querySelectorAll('[data-filter-field]'));
    const empty = form.querySelector('[data-filter-empty]');

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const apply = () => {
      const keyword = normalize(search?.value);
      let visible = 0;

      items.forEach((item) => {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.year,
          item.dataset.region,
          item.dataset.type,
          item.dataset.genre,
          item.dataset.tags,
          item.dataset.category,
        ].join(' '));

        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchSelects = selects.every((select) => {
          const selected = normalize(select.value);
          if (!selected) {
            return true;
          }

          const field = select.dataset.filterField;
          return normalize(item.dataset[field]).includes(selected);
        });

        const show = matchKeyword && matchSelects;
        item.hidden = !show;

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    search?.addEventListener('input', apply);
    selects.forEach((select) => select.addEventListener('change', apply));
    apply();
  });

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    const source = video?.querySelector('source');
    const sourceUrl = source?.getAttribute('src') || '';
    let hlsInstance = null;
    let loaded = false;

    const loadSource = () => {
      if (!video || !sourceUrl || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      loaded = true;
    };

    const play = async () => {
      if (!video) {
        return;
      }

      loadSource();
      shell.classList.add('is-playing');

      try {
        await video.play();
      } catch (error) {
        shell.classList.remove('is-playing');
      }
    };

    button?.addEventListener('click', play);
    video?.addEventListener('click', loadSource, { once: true });
    video?.addEventListener('play', () => shell.classList.add('is-playing'));
    video?.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
