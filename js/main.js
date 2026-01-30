/* ============================================
   LA BULLE — Bar & Enoteca
   Main JavaScript
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
                msg.textContent = 'Grazie! Ti sei iscritto alla newsletter de La Bulle.';
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

    // — Hero parallax —
    const hero = document.querySelector('.hero-content');
    if (hero) {
        window.addEventListener('scroll', () => {
            const s = window.scrollY;
            if (s < window.innerHeight) {
                hero.style.transform = 'translateY(' + (s * 0.25) + 'px)';
                hero.style.opacity = 1 - (s / window.innerHeight * 0.7);
            }
        }, { passive: true });
    }
});
