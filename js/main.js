// ==========================================================================
// Preferencia de accesibilidad — la consultamos una sola vez arriba de todo
// ==========================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================================================
// NAVBAR: cambia de transparente a sólido al hacer scroll, y una vez pasado
// el hero se esconde solo — reaparece si pasás el mouse por la franja de arriba
// ==========================================================================
const navbar = document.getElementById('navbar');
const navbarHotzone = document.getElementById('navbar-hotzone');
const hero = document.getElementById('inicio');

if (navbar && hero) {
  let pastHero = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      navbar.classList.toggle('is-scrolled', !entry.isIntersecting);
      pastHero = !entry.isIntersecting;
      if (!pastHero) navbar.classList.remove('is-hidden'); // dentro del hero, siempre visible
    },
    { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
  );
  observer.observe(hero);

  window.addEventListener('scroll', () => {
    if (pastHero) navbar.classList.add('is-hidden');
  }, { passive: true });

  if (navbarHotzone) {
    navbarHotzone.addEventListener('mouseenter', () => {
      navbar.classList.remove('is-hidden');
    });
  }

  navbar.addEventListener('mouseleave', () => {
    if (pastHero) navbar.classList.add('is-hidden');
  });
}

// ==========================================================================
// MENÚ MOBILE: abre/cierra el nav en pantallas chicas
// ==========================================================================
const burger = document.getElementById('navbar-burger');
const nav = document.getElementById('navbar-nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Cierra el menú al tocar un link
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ==========================================================================
// FORMULARIO DE CONTACTO (placeholder — se conecta a Formspree/Netlify en Fase 5)
// ==========================================================================
const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO Fase 5: reemplazar por el envío real (Formspree o Netlify Forms)
    alert('Formulario listo para conectar — falta el envío real (Fase 5).');
  });
}

// ==========================================================================
// HERO: las 3 líneas del título siguen levemente al mouse, cada una a
// distinta profundidad (ya definido en el CSS con multiplicadores por línea)
// ==========================================================================
const heroStage = document.querySelector('.hero__stage');

if (heroStage && !prefersReducedMotion && window.matchMedia('(min-width: 64em)').matches) {
  heroStage.addEventListener('mousemove', (e) => {
    const rect = heroStage.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width - 0.5) * 24;  // rango aprox -12 a 12
    const py = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
    heroStage.style.setProperty('--px', px.toFixed(1));
    heroStage.style.setProperty('--py', py.toFixed(1));
  });

  heroStage.addEventListener('mouseleave', () => {
    heroStage.style.setProperty('--px', 0);
    heroStage.style.setProperty('--py', 0);
  });
}

// ==========================================================================
// QUIÉNES SOMOS: el título se escribe solo, letra por letra, en loop —
// escribe, espera unos segundos, borra, y vuelve a escribir. Solo corre
// mientras la sección está en pantalla (se pausa si scrolleás lejos)
// ==========================================================================
const aboutTitle = document.getElementById('about-title');

if (aboutTitle) {
  const fullText = aboutTitle.textContent;
  let loopTimer = null;
  let running = false;

  const typeIt = (onDone) => {
    aboutTitle.classList.add('is-typing');
    let i = 0;
    const interval = setInterval(() => {
      aboutTitle.textContent = fullText.slice(0, i + 1);
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        onDone();
      }
    }, 55);
  };

  const eraseIt = (onDone) => {
    let i = fullText.length;
    const interval = setInterval(() => {
      aboutTitle.textContent = fullText.slice(0, i - 1);
      i--;
      if (i <= 0) {
        clearInterval(interval);
        aboutTitle.classList.remove('is-typing');
        onDone();
      }
    }, 32); // borra un poco más rápido de lo que escribe, se siente mejor
  };

  const cycle = () => {
    if (!running) return;
    typeIt(() => {
      if (!running) return;
      loopTimer = setTimeout(() => {
        if (!running) return;
        eraseIt(() => {
          if (!running) return;
          loopTimer = setTimeout(() => { if (running) cycle(); }, 500);
        });
      }, 4000); // se queda armada 4s antes de borrarse
    });
  };

  if (prefersReducedMotion) {
    aboutTitle.textContent = fullText;
  } else {
    aboutTitle.textContent = '';
    const titleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          cycle();
        } else if (!entry.isIntersecting) {
          running = false;
          clearTimeout(loopTimer);
        }
      },
      { threshold: 0.5 }
    );
    titleObserver.observe(aboutTitle);
  }
}

// ==========================================================================
// QUIÉNES SOMOS: las fotos se pueden arrastrar libremente, y al soltar
// vuelven solas a su lugar con un efecto elástico (definido en el CSS)
// ==========================================================================
document.querySelectorAll('.about__photo').forEach((photo) => {
  let startX = 0;
  let startY = 0;

  photo.addEventListener('pointerdown', (e) => {
    photo.classList.add('is-dragging');
    photo.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
  });

  photo.addEventListener('pointermove', (e) => {
    if (!photo.classList.contains('is-dragging')) return;
    photo.style.setProperty('--dx', e.clientX - startX);
    photo.style.setProperty('--dy', e.clientY - startY);
  });

  const releasePhoto = () => {
    photo.classList.remove('is-dragging');
    photo.style.setProperty('--dx', 0);
    photo.style.setProperty('--dy', 0);
  };

  photo.addEventListener('pointerup', releasePhoto);
  photo.addEventListener('pointercancel', releasePhoto);
});

// ==========================================================================
// PROCESO: la barra vertical se llena con el scroll, y cada número se
// enciende en rojo a medida que pasás ese paso
// ==========================================================================
const processWrap = document.querySelector('.process__list-wrap');
const processFill = document.getElementById('process-progress-fill');
const processSteps = document.querySelectorAll('.process__step');

if (processWrap && processFill && processSteps.length) {
  const updateProcessProgress = () => {
    const rect = processWrap.getBoundingClientRect();
    const viewportH = window.innerHeight;

    // 0 cuando el bloque recién entra por abajo, 1 cuando termina de salir por arriba
    const total = rect.height + viewportH * 0.5;
    const traveled = viewportH * 0.75 - rect.top;
    const progress = Math.min(1, Math.max(0, traveled / total));

    processFill.style.height = `${progress * 100}%`;

    const fillBottom = rect.top + rect.height * progress;
    processSteps.forEach((step) => {
      const stepRect = step.getBoundingClientRect();
      step.classList.toggle('is-passed', stepRect.top < fillBottom);
    });
  };

  let processTicking = false;
  window.addEventListener('scroll', () => {
    if (!processTicking) {
      requestAnimationFrame(() => { updateProcessProgress(); processTicking = false; });
      processTicking = true;
    }
  }, { passive: true });

  updateProcessProgress();
}

// ==========================================================================
// FAQ: abre/cierra cada pregunta con animación (independientes entre sí)
// ==========================================================================
document.querySelectorAll('.faq-item__trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.faq-item');
    const isOpen = item.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });
});

// ==========================================================================
// ESTRELLAS DECORATIVAS: rotan y cambian de tono con el scroll de la página
// (reemplaza el loop automático anterior — ahora responde a la acción real del usuario)
// ==========================================================================
const stars = document.querySelectorAll('.decor-star--iridescent');

if (stars.length && !prefersReducedMotion) {
  let ticking = false;

  const updateStars = () => {
    const scrollY = window.scrollY;
    const rotation = scrollY * 0.15;   // grados de giro por cada px scrolleado
    const hueShift = (scrollY * 0.12) % 360; // recorre toda la rueda de color a medida que bajás

    stars.forEach((star) => {
      star.style.transform = `rotate(${rotation}deg)`;
      star.style.filter = `hue-rotate(${hueShift}deg)`;
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateStars);
      ticking = true;
    }
  }, { passive: true });

  updateStars(); // estado inicial al cargar
}
