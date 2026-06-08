(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function() {
                var open = menu.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var active = 0;
            var show = function(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === active);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === active);
                });
            };
            dots.forEach(function(dot, index) {
                dot.addEventListener("click", function() {
                    show(index);
                });
            });
            window.setInterval(function() {
                show(active + 1);
            }, 5200);
        }

        var queryInput = document.querySelector("[data-search-query]");
        if (queryInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                queryInput.value = q;
            }
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var filterSelect = document.querySelector("[data-filter-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var applyFilter = function() {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var typeValue = filterSelect ? filterSelect.value.trim().toLowerCase() : "";
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type")
                ].join(" ").toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !typeValue || haystack.indexOf(typeValue) !== -1;
                card.classList.toggle("is-hidden-card", !(matchKeyword && matchType));
            });
        };
        if (filterInput || filterSelect) {
            if (filterInput) {
                filterInput.addEventListener("input", applyFilter);
            }
            if (filterSelect) {
                filterSelect.addEventListener("change", applyFilter);
            }
            applyFilter();
        }
    });
})();
