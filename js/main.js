/* ============================================
   LEM MODA | NUEVO CICLO 2026
   ============================================ */

'use strict';

const CONFIG = {
  WHATSAPP_NUMBER: '593984909967',
  CAMPAIGN_NAME:   'NUEVO CICLO - Regreso a Clases 2026',
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
    '.step, .profile-card, .product-card, .testimonial-card, .section-header, .quiz-card, .philosophy__grid'
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
    const input = option.querySelector('input[type="radio"]');
    option.addEventListener('click', () => selectOption(option, input));
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        option.click();
      }
    });
    option.setAttribute('tabindex', '0');
    option.setAttribute('role', 'radio');
  });
};

const selectOption = (option, input) => {
  const groupName = input.name;
  document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
    radio.closest('.quiz-option')?.classList.remove('selected');
  });
  input.checked = true;
  option.classList.add('selected');
  const errorEl = document.getElementById(`${groupName}-error`);
  if (errorEl) errorEl.textContent = '';
  updateMessagePreview();
};

// ---- TARJETAS DE PERFIL CLICKEABLES ----
const initProfileCards = () => {
  const cards = document.querySelectorAll('.profile-card[data-profile]');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const profileValue = card.dataset.profile;
      // Buscar el radio button correspondiente en el formulario
      const radio = document.querySelector(`input[name="perfil"][value="${profileValue}"]`);
      if (radio) {
        // Marcar el radio y actualizar la UI del formulario
        const option = radio.closest('.quiz-option');
        selectOption(option, radio);

        // Feedback visual en la tarjeta
        card.classList.add('pulse-selected');
        setTimeout(() => card.classList.remove('pulse-selected'), 600);

        // Scroll suave al formulario
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

// ---- PREVIEW ----
const updateMessagePreview = () => {
  const perfilRadio = document.querySelector('input[name="perfil"]:checked');
  const buscaRadio  = document.querySelector('input[name="busca"]:checked');
  const tallaInput  = document.getElementById('talla');
  const previewEl   = document.getElementById('previewText');
  if (!previewEl) return;

  const perfil = perfilRadio?.value || '___';
  const busca  = buscaRadio?.value  || '___';
  const talla  = tallaInput?.value?.trim() || '___';

  const hasAny = perfilRadio || buscaRadio || tallaInput?.value?.trim();
  if (!hasAny) {
    previewEl.innerHTML = '<em>Completa las preguntas para ver tu mensaje personalizado...</em>';
    return;
  }
  const message = buildMessage(perfil, busca, talla);
  previewEl.innerHTML = message.replace(/\n/g, '<br>').replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
};

// ---- MENSAJE ----
const buildMessage = (perfil, busca, talla) => {
  return `Hola, equipo de ${CONFIG.BRAND_NAME} 🌿

Vengo por la campaña *${CONFIG.CAMPAIGN_NAME}* y quiero prepararme para el nuevo ciclo con estilo.

📋 Mis datos:
1. Perfil: *${perfil}*
2. Producto de interés: *${busca}*
3. Talla / Complexión: *${talla}*

Quedo atento(a) a su asesoría. ¡Gracias! 🐜✨`;
};

const generateWhatsAppLink = (message) => {
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// ---- VALIDACIÓN ----
const validateForm = () => {
  let isValid = true;

  const perfilRadio = document.querySelector('input[name="perfil"]:checked');
  const perfilError = document.getElementById('perfil-error');
  if (!perfilRadio) { if (perfilError) perfilError.textContent = '⚠️ Selecciona tu perfil.'; isValid = false; }
  else if (perfilError) perfilError.textContent = '';

  const buscaRadio = document.querySelector('input[name="busca"]:checked');
  const buscaError = document.getElementById('busca-error');
  if (!buscaRadio) { if (buscaError) buscaError.textContent = '⚠️ Elige qué producto te interesa.'; isValid = false; }
  else if (buscaError) buscaError.textContent = '';

  const tallaInput = document.getElementById('talla');
  const tallaError = document.getElementById('talla-error');
  if (!tallaInput?.value?.trim()) {
    if (tallaError) tallaError.textContent = '⚠️ Ingresa tu talla o complexión.';
    tallaInput?.classList.add('error');
    isValid = false;
  } else {
    if (tallaError) tallaError.textContent = '';
    tallaInput?.classList.remove('error');
  }
  return isValid;
};

// ---- FORMULARIO ----
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
    const perfil = document.querySelector('input[name="perfil"]:checked').value;
    const busca  = document.querySelector('input[name="busca"]:checked').value;
    const talla  = tallaInput.value.trim();

    const link = generateWhatsAppLink(buildMessage(perfil, busca, talla));

    const btn = document.getElementById('whatsappBtn');
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '✅ ¡Abriendo WhatsApp...';
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

  console.log(`
  ╔════════════════════════════════════════╗
  ║  🌿 LEM MODA | NUEVO CICLO 2026 🐜    ║
  ║  ✅ WhatsApp: +593 98 490 9967        ║
  ║  🎒 Regreso a Clases 2026 activo      ║
  ║  ✨ Página cargada correctamente      ║
  ╚════════════════════════════════════════╝
  `);
});
