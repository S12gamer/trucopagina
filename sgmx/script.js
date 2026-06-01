/* ================================================
   SPEED GARAGE — script.js
   ================================================ */

/* ————————————————————————————
   1. NAVBAR: clase "scrolled" al hacer scroll
———————————————————————————— */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });


/* ————————————————————————————
   2. MENÚ HAMBURGUESA / MÓVIL
———————————————————————————— */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

function openMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

// Cerrar al hacer clic en cualquier enlace del menú móvil
mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Cerrar con tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    closeMenu();
    hamburger.focus();
  }
});


/* ————————————————————————————
   3. SCROLL REVEAL
———————————————————————————— */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Pequeño delay escalonado para elementos hermanos
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const index = siblings.indexOf(entry.target);
      const delay = Math.min(index * 80, 400);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


/* ————————————————————————————
   4. SMOOTH SCROLL para anclas internas
———————————————————————————— */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--navbar-h')) || 72;

    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ————————————————————————————
   5. FORMULARIO DE CONTACTO + TOAST
———————————————————————————— */
const contactForm = document.getElementById('contactForm');
const toast       = document.getElementById('toast');
let toastTimer    = null;

function showToast() {
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validación básica
    const name    = contactForm.querySelector('#name');
    const email   = contactForm.querySelector('#email');
    const message = contactForm.querySelector('#message');
    let valid = true;

    [name, email, message].forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'var(--accent)';
        valid = false;
      }
    });

    if (!valid) return;

    // Simulación de envío
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando…';

    setTimeout(() => {
      contactForm.reset();
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      showToast();
    }, 1200);
  });
}


/* ————————————————————————————
   6. ACTIVE NAV LINK al hacer scroll
———————————————————————————— */
const sections  = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    }
  });
}, {
  rootMargin: `-${72 + 20}px 0px -55% 0px`,
  threshold: 0
});

sections.forEach(section => sectionObserver.observe(section));
