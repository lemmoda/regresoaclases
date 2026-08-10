/* ============================================
   LEM MODA | NUEVO CICLO 2026-2027
   Selección múltiple + Contador dinámico
   ============================================ */

'use strict';

const CONFIG = {
  WHATSAPP_NUMBER: '593984909967',
  CAMPAIGN_NAME:   'NUEVO CICLO - Regreso a Clases 2026-2027',
  BRAND_NAME:      'LEM MODA',
};

// ---- LOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }
  }, 1800);
});

// ---- SCROLL ANIMATIONS ----
const observeElements = () => {
  const elements = document.querySelectorAll(
    '.step, .profile-card, .product-card, .testimonial-card, .section-header, .quiz-card, .philosophy__grid, .service-card, .benefits__banner'
  );
  elements.forEach(el => el.classList.add('animate-on-scroll'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  elements.forEach(el => observer.observe(el));
};

// ---- OPCIONES DEL QUIZ ----
const initQuizOptions = () => {
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(option => {
    const input = option.querySelector('input[type="radio"], input[type="checkbox"]');
    if (!input) return;

    option.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      e.preventDefault();
      handleOptionClick(option, input);
    });

    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOptionClick(option, input);
      }
    });

    option.setAttribute('tabindex', '0');
    option.setAttribute('role', input.type === 'checkbox' ? 'checkbox' : 'radio');
  });
};

const handleOptionClick = (option, input) => {
  if (input.type === 'checkbox') {
    // MULTI-SELECT
    input.checked = !input.checked;
    option.classList.toggle('selected', input.checked);
    option.setAttribute('aria-checked', input.checked);
  } else {
    // SINGLE-SELECT (radio)
    const groupName = input.name;
    document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
      radio.closest('.quiz-option')?.classList.remove('selected');
      radio.closest('.quiz-option')?.setAttribute('aria-checked', 'false');
    });
    input.checked = true;
    option.classList.add('selected');
    option.setAttribute('aria-checked', 'true');
  }

  const errorEl = document.getElementById(`${input.name}-error`);
  if (errorEl) errorEl.textContent = '';
  
  // Actualizar contador si es multi-select de "busca"
  if (input.name === 'busca') {
    updateProductsCounter();
  }
  
  updateMessagePreview();
};

// ---- CONTADOR DE PRODUCTOS SELECCIONADOS ----
const updateProductsCounter = () => {
  const counter     = document.getElementById('buscaCounter');
  const counterNum  = document.getElementById('buscaCounterNum');
  const counterText = document.getElementById('buscaCounterText');
  if (!counter || !counterNum || !counterText) return;

  const count = getSelectedProducts().length;

  // Actualizar número
  const previousCount = parseInt(counterNum.textContent, 10) || 0;
  counterNum.textContent = count;

  // Actualizar texto (singular/plural)
  counterText.textContent = count === 1 ? 'producto' : 'productos';

  // Mostrar/ocultar
  counter.classList.toggle('is-active', count > 0);

  // Estilo especial cuando hay 3 o más
  counter.classList.toggle('is-many', count >= 3);

  // Animación pop cuando cambia el número
  if (count !== previousCount && count > 0) {
    counter.classList.remove('is-pop');
    void counter.offsetWidth; // reflow para reiniciar animación
    counter.classList.add('is-pop');
  }
};

// ---- TARJETAS DE PERFIL CLICKEABLES ----
const initProfileCards = () => {
  const cards = document.querySelectorAll('.profile-card[data-profile]');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const profileValue = card.dataset.profile;
      const radio = document.querySelector(`input[name="perfil"][value="${profileValue}"]`);
      if (radio) {
        const option = radio.closest('.quiz-option');
        handleOptionClick(option, radio);

        card.classList.add('pulse-selected');
        setTimeout(() => card.classList.remove('pulse-selected'), 600);

        setTimeout(() => {
          const cuestionario = document.getElementById('cuestionario');
          if (cuestionario) {
            cuestionario.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 400);
      }
    });
  });
};

// ---- OBTENER PRODUCTOS SELECCIONADOS (MULTI) ----
const getSelectedProducts = () => {
  const checked = document.querySelectorAll('input[name="busca"]:checked');
  return Array.from(checked).map(input => input.value);
};

// ---- FORMATEAR LISTA DE PRODUCTOS ----
const formatProductsList = (products) => {
  if (products.length === 0) return '___';
  if (products.length === 1) return products[0];
  if (products.length === 2) return `${products[0]} y ${products[1]}`;
  return '\n' + products.map(p => `   ‣ ${p}`).join('\n');
};

// ---- PREVIEW EN TIEMPO REAL ----
const updateMessagePreview = () => {
  const perfilRadio       = document.querySelector('input[name="perfil"]:checked');
  const productos         = getSelectedProducts();
  const tallaInput        = document.getElementById('talla');
  const presupuestoRadio  = document.querySelector('input[name="presupuesto"]:checked');
  const previewEl         = document.getElementById('previewText');
  if (!previewEl) return;

  const perfil       = perfilRadio?.value || '___';
  const productosFmt = formatProductsList(productos);
  const talla        = tallaInput?.value?.trim() || '___';
  const presupuesto  = presupuestoRadio?.value || '___';

  const hasAny = perfilRadio || productos.length > 0 || tallaInput?.value?.trim() || presupuestoRadio;
  if (!hasAny) {
    previewEl.innerHTML = '<em>Completa las preguntas para ver tu mensaje personalizado...</em>';
    return;
  }
  const message = buildMessage(perfil, productosFmt, talla, presupuesto, productos.length);
  previewEl.innerHTML = message.replace(/\n/g, '<br>').replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
};

// ---- CONSTRUIR MENSAJE PARA WHATSAPP ----
const buildMessage = (perfil, productosFmt, talla, presupuesto, cantidadProductos = 0) => {
  const productoLabel = cantidadProductos > 1 ? 'Productos de interés' : 'Producto de interés';
  
  return `Hola equipo *${CONFIG.BRAND_NAME}*

Vi su campaña *${CONFIG.CAMPAIGN_NAME}* y me identifiqué con la filosofía de la hormiga: constancia, esfuerzo y elegancia. Quiero ser parte de esa comunidad y renovar mi estilo para este nuevo ciclo.

Aquí mis datos para que me armen la mejor propuesta:

• *Perfil:* ${perfil}
• *${productoLabel}:* ${productosFmt}
• *Talla / Complexión:* ${talla}
• *Presupuesto:* ${presupuesto}

Confío en su asesoría personalizada. Quedo atento(a) a las opciones que me recomienden.

¡Gracias por hacer que cada prenda cuente!`;
};

const generateWhatsAppLink = (message) => {
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// ---- VALIDACIÓN ----
const validateForm = () => {
  let isValid = true;

  const perfilRadio = document.querySelector('input[name="perfil"]:checked');
  const perfilError = document.getElementById('perfil-error');
  if (!perfilRadio) { 
    if (perfilError) perfilError.textContent = 'Por favor selecciona tu perfil.'; 
    isValid = false; 
  } else if (perfilError) perfilError.textContent = '';

  const productos = getSelectedProducts();
  const buscaError = document.getElementById('busca-error');
  if (productos.length === 0) { 
    if (buscaError) buscaError.textContent = 'Por favor elige al menos un producto de interés.'; 
    isValid = false; 
  } else if (buscaError) buscaError.textContent = '';

  const tallaInput = document.getElementById('talla');
  const tallaError = document.getElementById('talla-error');
  if (!tallaInput?.value?.trim()) {
    if (tallaError) tallaError.textContent = 'Por favor ingresa tu talla o complexión.';
    tallaInput?.classList.add('error');
    isValid = false;
  } else {
    if (tallaError) tallaError.textContent = '';
    tallaInput?.classList.remove('error');
  }

  const presupuestoRadio = document.querySelector('input[name="presupuesto"]:checked');
  const presupuestoError = document.getElementById('presupuesto-error');
  if (!presupuestoRadio) { 
    if (presupuestoError) presupuestoError.textContent = 'Por favor indica tu presupuesto.'; 
    isValid = false; 
  } else if (presupuestoError) presupuestoError.textContent = '';

  return isValid;
};

// ---- FORMULARIO SUBMIT ----
const initForm = () => {
  const form = document.getElementById('quizForm');
  const tallaInput = document.getElementById('talla');
  if (!form) return;

  tallaInput?.addEventListener('input', () => {
    updateMessagePreview();
    const tallaError = document.getElementById('talla-error');
    if (tallaInput.value.trim()) {
      if (tallaError) tallaError.textContent = '';
      tallaInput.classList.remove('error');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = form.querySelector('.quiz-field__error:not(:empty)');
      firstError?.closest('.quiz-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const perfil       = document.querySelector('input[name="perfil"]:checked').value;
    const productos    = getSelectedProducts();
    const productosFmt = formatProductsList(productos);
    const talla        = tallaInput.value.trim();
    const presupuesto  = document.querySelector('input[name="presupuesto"]:checked').value;

    const link = generateWhatsAppLink(buildMessage(perfil, productosFmt, talla, presupuesto, productos.length));

    const btn = document.getElementById('whatsappBtn');
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '¡Abriendo WhatsApp...';
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2500);
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  });
};

// ---- HEADER SCROLL ----
const initHeaderScroll = () => {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '10px 40px';
      header.style.boxShadow = '0 4px 20px rgba(92,58,30,0.08)';
    } else {
      header.style.padding = '16px 40px';
      header.style.boxShadow = 'none';
    }
  }, { passive: true });
};

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  observeElements();
  initQuizOptions();
  initProfileCards();
  initForm();
  initHeaderScroll();
  updateMessagePreview();
  updateProductsCounter();

  console.log(`
  ╔════════════════════════════════════════╗
  ║   LEM MODA | NUEVO CICLO 2026-2027    ║
  ║   WhatsApp: +593 98 490 9967          ║
  ║   Multi-select: ACTIVADO ✓            ║
  ║   Contador dinámico: ACTIVO ✓         ║
  ║   Página cargada correctamente        ║
  ╚════════════════════════════════════════╝
  `);
});
