/* ============================================
   LEM MODA | NUEVO CICLO
   JavaScript Principal
   ============================================ */

'use strict';

// ---- CONFIGURACIÓN ----
const CONFIG = {
  // ⚠️ REEMPLAZA con tu número real (código de país + número)
  WHATSAPP_NUMBER: '593999999999',
  CAMPAIGN_NAME: 'NUEVO CICLO',
  BRAND_NAME: 'LEM MODA',
};

// ---- LOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }
  }, 1600);
});

// ---- SCROLL ANIMATIONS ----
const observeElements = () => {
  const elements = document.querySelectorAll(
    '.step, .profile-card, .testimonial-card, .section-header, .quiz-card'
  );
  elements.forEach(el => el.classList.add('animate-on-scroll'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  elements.forEach(el => observer.observe(el));
};

// ---- FORMULARIO: SELECCIÓN DE OPCIONES ----
const initQuizOptions = () => {
  const options = document.querySelectorAll('.quiz-option');

  options.forEach(option => {
    const input = option.querySelector('input[type="radio"]');

    option.addEventListener('click', () => {
      // Deseleccionar opciones del mismo grupo
      const groupName = input.name;
      document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
        radio.closest('.quiz-option')?.classList.remove('selected');
      });

      // Seleccionar actual
      input.checked = true;
      option.classList.add('selected');

      // Limpiar error
      const errorEl = document.getElementById(`${groupName}-error`);
      if (errorEl) errorEl.textContent = '';

      // Actualizar preview
      updateMessagePreview();
    });

    // Soporte de teclado
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

// ---- PREVIEW DEL MENSAJE ----
const updateMessagePreview = () => {
  const perfilRadio = document.querySelector('input[name="perfil"]:checked');
  const buscaRadio  = document.querySelector('input[name="busca"]:checked');
  const tallaInput  = document.getElementById('talla');
  const previewEl   = document.getElementById('previewText');

  if (!previewEl) return;

  const perfil = perfilRadio?.value || '___';
  const busca  = buscaRadio?.value  || '___';
  const talla  = tallaInput?.value?.trim() || '___';

  const hasAnyData = perfilRadio || buscaRadio || (tallaInput?.value?.trim());

  if (!hasAnyData) {
    previewEl.innerHTML = '<em>Completa las preguntas para ver tu mensaje personalizado...</em>';
    return;
  }

  const message = buildMessage(perfil, busca, talla);

  previewEl.innerHTML = message
    .replace(/\n/g, '<br>')
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
};

// ---- CONSTRUIR MENSAJE ----
const buildMessage = (perfil, busca, talla) => {
  return `Hola, equipo de ${CONFIG.BRAND_NAME} 👋

Vengo por la campaña *${CONFIG.CAMPAIGN_NAME}* y me interesa elevar mi estilo.

📋 Mis datos:
1. Perfil: *${perfil}*
2. Busco: *${busca}*
3. Talla / Complexión: *${talla}*

Quedo atento(a) a su respuesta. ¡Gracias!`;
};

// ---- GENERAR ENLACE WHATSAPP ----
const generateWhatsAppLink = (message) => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encoded}`;
};

// ---- VALIDACIÓN DEL FORMULARIO ----
const validateForm = () => {
  let isValid = true;

  // Validar perfil
  const perfilRadio = document.querySelector('input[name="perfil"]:checked');
  const perfilError = document.getElementById('perfil-error');
  if (!perfilRadio) {
    if (perfilError) perfilError.textContent = '⚠️ Por favor selecciona tu perfil.';
    isValid = false;
  } else {
    if (perfilError) perfilError.textContent = '';
  }

  // Validar búsqueda
  const buscaRadio = document.querySelector('input[name="busca"]:checked');
  const buscaError = document.getElementById('busca-error');
  if (!buscaRadio) {
    if (buscaError) buscaError.textContent = '⚠️ Por favor indica qué estás buscando.';
    isValid = false;
  } else {
    if (buscaError) buscaError.textContent = '';
  }

  // Validar talla
  const tallaInput = document.getElementById('talla');
  const tallaError = document.getElementById('talla-error');
  if (!tallaInput?.value?.trim()) {
    if (tallaError) tallaError.textContent = '⚠️ Por favor ingresa tu talla o complexión.';
    tallaInput?.classList.add('error');
    isValid = false;
  } else {
    if (tallaError) tallaError.textContent = '';
    tallaInput?.classList.remove('error');
  }

  return isValid;
};

// ---- SUBMIT DEL FORMULARIO ----
const initForm = () => {
  const form = document.getElementById('quizForm');
  const tallaInput = document.getElementById('talla');

  if (!form) return;

  // Actualizar preview en tiempo real (talla)
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
      // Scroll al primer error
      const firstError = form.querySelector('.quiz-field__error:not(:empty)');
      firstError?.closest('.quiz-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const perfilRadio = document.querySelector('input[name="perfil"]:checked');
    const buscaRadio  = document.querySelector('input[name="busca"]:checked');
    const talla       = tallaInput?.value?.trim();

    const message = buildMessage(perfilRadio.value, buscaRadio.value, talla);
    const link    = generateWhatsAppLink(message);

    // Feedback visual
    const btn = document.getElementById('whatsappBtn');
    if (btn) {
      btn.textContent = '✅ ¡Abriendo WhatsApp...';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = `
          <svg class="btn__wa-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Abrir WhatsApp con mi mensaje listo
        `;
        btn.disabled = false;
      }, 2000);
    }

    // Abrir WhatsApp
    window.open(link, '_blank', 'noopener,noreferrer');
  });
};

// ---- FAB: ACTUALIZAR HREF ----
const updateFabLink = () => {
  const fab = document.querySelector('.fab-whatsapp');
  // El FAB ya lleva a #cuestionario (scroll interno), no necesita cambio dinámico
};

// ---- HEADER: SCROLL EFFECT ----
const initHeaderScroll = () => {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '12px 40px';
      header.style.boxShadow = '0 4px 32px rgba(0,0,0,0.3)';
    } else {
      header.style.padding = '20px 40px';
      header.style.boxShadow = 'none';
    }
  }, { passive: true });
};

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  observeElements();
  initQuizOptions();
  initForm();
  initHeaderScroll();
  updateMessagePreview();

  console.log(`
  ╔══════════════════════════════════╗
  ║   LEM MODA | NUEVO CICLO 2025   ║
  ║   ⚡ Página cargada              ║
  ║   🔑 Config: Actualiza el número ║
  ╚══════════════════════════════════╝
  `);
});
