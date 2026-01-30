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

    // — Event Accordion —
    document.querySelectorAll('.event-accordion').forEach(accordion => {
        const header = accordion.querySelector('.event-header');
        header.addEventListener('click', () => {
            const isOpen = accordion.classList.contains('open');
            // Close all
            document.querySelectorAll('.event-accordion.open').forEach(a => {
                a.classList.remove('open');
                a.querySelector('.event-header').setAttribute('aria-expanded', 'false');
            });
            // Open clicked if it was closed
            if (!isOpen) {
                accordion.classList.add('open');
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });
});
