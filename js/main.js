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

    // — Menu Category Filters (menu.html) —
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuSections = document.querySelectorAll('.menu-section');
    if (filterBtns.length && menuSections.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                menuSections.forEach(sec => {
                    if (filter === 'all' || sec.getAttribute('data-category') === filter) {
                        sec.classList.remove('hidden');
                        sec.querySelectorAll('.anim:not(.visible)').forEach(el => obs.observe(el));
                    } else {
                        sec.classList.add('hidden');
                    }
                });
            });
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
