/* ============================================
   LA BULLE — Bar & Enoteca
   JavaScript — Accordion, Tabs & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // — Navbar scroll —
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // — Mobile nav —
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // — Active nav link —
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        const pos = window.scrollY + 160;
        sections.forEach(sec => {
            const top = sec.offsetTop, h = sec.offsetHeight, id = sec.id;
            if (pos >= top && pos < top + h) {
                navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
            }
        });
    }, { passive: true });

    // — Back to top —
    const btt = document.getElementById('backToTop');
    window.addEventListener('scroll', () => { btt.classList.toggle('visible', window.scrollY > 500); }, { passive: true });
    btt.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    // — Scroll animations —
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.anim').forEach(el => obs.observe(el));

    // — Newsletter —
    const form = document.getElementById('newsletterForm');
    const msg = document.getElementById('newsletterMessage');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            if (!email) { msg.textContent = 'Inserisci un indirizzo email valido.'; msg.className = 'form-msg error'; return; }
            const btn = form.querySelector('.btn');
            const txt = btn.textContent;
            btn.textContent = 'Invio...'; btn.disabled = true;
            setTimeout(() => {
                msg.textContent = 'Perfetto! Sei dei nostri.';
                msg.className = 'form-msg success';
                form.reset(); btn.textContent = txt; btn.disabled = false;
                setTimeout(() => { msg.textContent = ''; msg.className = 'form-msg'; }, 5000);
            }, 1200);
        });
    }

    // — Smooth scroll —
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const t = document.querySelector(id);
            if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - navbar.offsetHeight, behavior: 'smooth' }); }
        });
    });

    // — Etichette Counter Animation —
    const counterEl = document.querySelector('.etichette-count[data-target]');
    if (counterEl) {
        const counterObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(counterEl.getAttribute('data-target'));
                    let current = 0;
                    const step = Math.ceil(target / 60);
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        counterEl.textContent = current;
                    }, 25);
                    counterObs.unobserve(counterEl);
                }
            });
        }, { threshold: 0.3 });
        counterObs.observe(counterEl);
    }

    // — Floating Bubbles —
    const bubblesBg = document.getElementById('bubblesBg');
    if (bubblesBg) {
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!isReducedMotion) {
            const createBubble = () => {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                const size = Math.random() * 80 + 20;
                bubble.style.width = size + 'px';
                bubble.style.height = size + 'px';
                bubble.style.left = Math.random() * 100 + '%';
                bubble.style.animationDuration = (Math.random() * 12 + 10) + 's';
                bubble.style.animationDelay = (Math.random() * 4) + 's';
                bubblesBg.appendChild(bubble);
                bubble.addEventListener('animationend', () => bubble.remove());
            };
            for (let i = 0; i < 6; i++) {
                setTimeout(createBubble, i * 800);
            }
            setInterval(() => {
                if (bubblesBg.children.length < 10) {
                    createBubble();
                }
            }, 2500);
        }
    }

    // — Tilt Card Effect (desktop only) —
    if (window.matchMedia('(min-width: 769px) and (hover: hover)').matches) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;
                card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // — Dynamic Menu (menu.html) —
    const menuContent = document.getElementById('menuContent');
    const menuFiltersEl = document.getElementById('menuFilters');
    const menuMainTabs = document.querySelectorAll('.menu-main-tab');
    const langBtns = document.querySelectorAll('.lang-btn');

    if (menuContent && menuFiltersEl) {
        let menuData = null;
        let currentTab = 'food';
        let currentLang = 'it';
        let currentFilter = 'all';

        function escMenu(str) {
            if (!str) return '';
            const d = document.createElement('span');
            d.textContent = str;
            return d.innerHTML;
        }

        function getField(item, field) {
            if (currentLang === 'en' && item[field + '_en']) return item[field + '_en'];
            return item[field] || '';
        }

        function buildFilters(categories) {
            const hasNovita = categories.some(c => c.novita);
            let html = '<button class="filter-btn active" data-filter="all">Tutto</button>';
            if (hasNovita) {
                html += '<button class="filter-btn filter-btn--novita" data-filter="novita">' + (currentLang === 'en' ? "What's New" : 'Novit\u00e0') + '</button>';
            }
            categories.forEach(cat => {
                if (!cat.novita) {
                    html += '<button class="filter-btn" data-filter="' + cat.id + '">' + escMenu(getField(cat, 'name')) + '</button>';
                }
            });
            menuFiltersEl.innerHTML = html;
            currentFilter = 'all';
            wireFilters();
        }

        function wireFilters() {
            menuFiltersEl.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentFilter = btn.getAttribute('data-filter');
                    menuFiltersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    applyFilter();
                });
            });
        }

        function applyFilter() {
            document.querySelectorAll('.menu-section').forEach(sec => {
                const cat = sec.getAttribute('data-category');
                const isNovita = sec.getAttribute('data-novita') === 'true';
                let show = false;
                if (currentFilter === 'all') show = true;
                else if (currentFilter === 'novita') show = isNovita;
                else show = (cat === currentFilter);
                sec.classList.toggle('hidden', !show);
                if (show) sec.querySelectorAll('.anim:not(.visible)').forEach(el => obs.observe(el));
            });
        }

        function updatePdfBar(section) {
            var pdfBar = document.getElementById('menuPdfBar');
            var pdfIt = document.getElementById('menuPdfIt');
            var pdfEn = document.getElementById('menuPdfEn');
            var pdfBottom = document.getElementById('menuPdfCtaBottom');
            var pdfBottomLink = document.getElementById('menuPdfBottomLink');
            var pdfBottomText = document.getElementById('menuPdfBottomText');
            var hasIt = section.pdf;
            var hasEn = section.pdf_en;

            if (hasIt || hasEn) {
                pdfBar.style.display = '';
                if (hasIt) { pdfIt.href = section.pdf; pdfIt.style.display = ''; }
                else { pdfIt.style.display = 'none'; }
                if (hasEn) { pdfEn.href = section.pdf_en; pdfEn.style.display = ''; }
                else { pdfEn.style.display = 'none'; }
            } else {
                pdfBar.style.display = 'none';
            }

            // Bottom CTA uses current language
            var pdfKey = currentLang === 'en' ? 'pdf_en' : 'pdf';
            if (section[pdfKey]) {
                pdfBottom.style.display = '';
                pdfBottomLink.href = section[pdfKey];
                pdfBottomText.textContent = currentLang === 'en' ? 'Download Full Menu PDF' : 'Scarica il Menu Completo PDF';
            } else {
                pdfBottom.style.display = 'none';
            }
        }

        function renderMenu() {
            if (!menuData) return;
            var section = menuData[currentTab];
            if (!section) return;
            var cats = section.categories;
            buildFilters(cats);

            var html = '';
            cats.forEach(function(cat) {
                var catName = getField(cat, 'name');
                var note = getField(cat, 'note');
                html += '<div class="menu-section" data-category="' + cat.id + '" data-novita="' + (cat.novita || false) + '">';
                html += '<h2 class="menu-cat anim">' + escMenu(catName);
                if (cat.novita) html += ' <span class="menu-novita-badge">' + (currentLang === 'en' ? 'New' : 'Novit\u00e0') + '</span>';
                html += '</h2>';
                if (note) {
                    html += '<div class="menu-note anim"><p>' + escMenu(note) + '</p></div>';
                }
                if (cat.items && cat.items.length) {
                    html += '<div class="menu-grid">';
                    cat.items.forEach(function(item) {
                        var desc = getField(item, 'desc');
                        html += '<div class="menu-item anim">' +
                            '<div class="menu-item-top">' +
                                '<span class="menu-name">' + escMenu(getField(item, 'name')) + '</span>' +
                                '<span class="menu-price">' + escMenu(item.price) + '</span>' +
                            '</div>';
                        if (desc) html += '<p class="menu-desc">' + escMenu(desc) + '</p>';
                        html += '</div>';
                    });
                    html += '</div>';
                }
                html += '</div>';
            });
            menuContent.innerHTML = html;
            menuContent.querySelectorAll('.anim').forEach(function(el) { obs.observe(el); });

            // Update PDF buttons
            updatePdfBar(section);
        }

        // Tab switching
        menuMainTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                currentTab = tab.getAttribute('data-menu');
                menuMainTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderMenu();
            });
        });

        // Language switching
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentLang = btn.getAttribute('data-lang');
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderMenu();
            });
        });

        // Load menu data
        fetch('data/menu.json')
            .then(r => r.json())
            .then(data => {
                menuData = data;
                renderMenu();
            })
            .catch(() => {
                menuContent.innerHTML = '<p style="color:var(--white-dim);text-align:center;">Errore nel caricamento del menu.</p>';
            });
    }

    // — MONTHS MAP —
    const MONTHS_FULL = {
        GEN: 'Gennaio', FEB: 'Febbraio', MAR: 'Marzo', APR: 'Aprile',
        MAG: 'Maggio', GIU: 'Giugno', LUG: 'Luglio', AGO: 'Agosto',
        SET: 'Settembre', OTT: 'Ottobre', NOV: 'Novembre', DIC: 'Dicembre'
    };

    function esc(str) {
        if (!str) return '';
        const d = document.createElement('span');
        d.textContent = str;
        return d.innerHTML;
    }

    // — Load Events from JSON —
    const eventsList = document.getElementById('eventsList');
    if (eventsList) {
        fetch('data/events.json')
            .then(r => r.json())
            .then(events => {
                const active = events.filter(e => e.active !== false);
                if (!active.length) {
                    eventsList.innerHTML = '<p style="color:var(--white-dim); text-align:center;">Nessun evento in programma.</p>';
                    return;
                }
                eventsList.innerHTML = active.map((ev, i) => {
                    const monthFull = MONTHS_FULL[ev.date_month] || ev.date_month;
                    const posterHtml = ev.image
                        ? '<div class="event-poster"><img src="' + esc(ev.image) + '" alt="' + esc(ev.title) + '" class="event-poster-img"></div>'
                        : '<div class="event-poster"><div class="event-poster-placeholder"><span>Locandina</span></div></div>';
                    return '<article class="event-accordion anim" style="transition-delay:' + (i * 0.12) + 's">' +
                        '<button class="event-header" aria-expanded="false">' +
                            '<span class="event-date">' +
                                '<span class="event-date-day">' + esc(ev.date_day) + '</span>' +
                                '<span class="event-date-month">' + esc(ev.date_month) + '</span>' +
                            '</span>' +
                            '<div class="event-header-text">' +
                                '<h3 class="event-name">' + esc(ev.title) + '</h3>' +
                                '<span class="event-when">' + esc(ev.time) + '</span>' +
                            '</div>' +
                            '<span class="event-toggle">' +
                                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
                            '</span>' +
                        '</button>' +
                        '<div class="event-body">' +
                            '<div class="event-body-inner">' +
                                '<div class="event-info">' +
                                    '<p class="event-desc">' + esc(ev.description) + '</p>' +
                                    '<div class="event-details">' +
                                        '<span class="event-detail"><strong>Quando:</strong> ' + esc(ev.date_day) + ' ' + esc(monthFull) + ' ' + esc(ev.date_year) + ', ' + esc(ev.time) + '</span>' +
                                        '<span class="event-detail"><strong>Prezzo:</strong> ' + esc(ev.price) + '</span>' +
                                        (ev.includes ? '<span class="event-detail"><strong>Include:</strong> ' + esc(ev.includes) + '</span>' : '') +
                                    '</div>' +
                                    '<a href="tel:0331570338" class="btn btn--sm">Prenota il tuo posto</a>' +
                                '</div>' +
                                posterHtml +
                            '</div>' +
                        '</div>' +
                    '</article>';
                }).join('');

                // Wire accordion
                initAccordions();
                // Observe new elements for scroll animation
                eventsList.querySelectorAll('.anim').forEach(el => obs.observe(el));
            })
            .catch(() => {
                eventsList.innerHTML = '<p style="color:var(--white-dim); text-align:center;">Errore nel caricamento degli eventi.</p>';
            });
    }

    // — Event Accordion —
    function initAccordions() {
        document.querySelectorAll('.event-accordion').forEach(accordion => {
            const header = accordion.querySelector('.event-header');
            header.addEventListener('click', () => {
                const isOpen = accordion.classList.contains('open');
                document.querySelectorAll('.event-accordion.open').forEach(a => {
                    a.classList.remove('open');
                    a.querySelector('.event-header').setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    accordion.classList.add('open');
                    header.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }
});
