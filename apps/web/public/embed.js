(function () {
  'use strict';

  var ORIGIN = (function () {
    var scripts = document.querySelectorAll('script[data-slug]');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1) {
        var url = new URL(scripts[i].src);
        return url.origin;
      }
    }
    return '';
  })();

  function findScript() {
    var scripts = document.querySelectorAll('script[data-slug]');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1) {
        return scripts[i];
      }
    }
    return null;
  }

  var script = findScript();
  if (!script) return;

  var slug = script.getAttribute('data-slug');
  if (!slug) return;

  var mode = script.getAttribute('data-mode') || 'inline';
  var buttonText = script.getAttribute('data-button-text') || 'Reservar turno';
  var buttonColor = script.getAttribute('data-button-color') || '#3F8697';
  var position = script.getAttribute('data-position') || 'bottom-right';
  var width = script.getAttribute('data-width') || '100%';
  var height = script.getAttribute('data-height') || '600px';
  var embedUrl = ORIGIN + '/embed/' + encodeURIComponent(slug) + '?mode=' + encodeURIComponent(mode);

  // ─── Utility ───

  function createEl(tag, attrs, styles) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'textContent') el.textContent = attrs[k];
        else el.setAttribute(k, attrs[k]);
      }
    }
    if (styles) {
      for (var s in styles) el.style[s] = styles[s];
    }
    return el;
  }

  function createIframe(w, h) {
    return createEl('iframe', {
      src: embedUrl,
      frameborder: '0',
      allow: 'payment',
      title: 'TurnoLink - Reservar turno'
    }, {
      width: w,
      height: h,
      border: 'none',
      display: 'block',
      maxWidth: '100%',
      colorScheme: 'normal'
    });
  }

  // ─── Event Relay ───

  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data.type !== 'string' || e.data.type.indexOf('turnolink:') !== 0) return;

    // Resize for inline
    if (e.data.type === 'turnolink:resize' && inlineIframe) {
      inlineIframe.style.height = e.data.payload.height + 'px';
    }

    // Resize for modal
    if (e.data.type === 'turnolink:resize' && modalIframe) {
      modalIframe.style.height = Math.min(e.data.payload.height, window.innerHeight * 0.85) + 'px';
    }

    // Re-dispatch as CustomEvent on parent document
    var ce = new CustomEvent(e.data.type, { detail: e.data.payload });
    document.dispatchEvent(ce);
  });

  // ─── Inline Mode ───

  var inlineIframe = null;

  if (mode === 'inline') {
    var container = createEl('div', null, {
      width: width,
      maxWidth: '100%'
    });
    inlineIframe = createIframe(width, height);
    container.appendChild(inlineIframe);
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  // ─── Modal Infrastructure (shared by modal + floating-button) ───

  var overlay = null;
  var modalContent = null;
  var modalIframe = null;
  var isOpen = false;

  function injectModalCSS() {
    if (document.getElementById('turnolink-modal-css')) return;
    var style = createEl('style', { id: 'turnolink-modal-css' });
    style.textContent = [
      '.tl-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s ease;backdrop-filter:blur(4px);}',
      '.tl-overlay.tl-open{opacity:1;}',
      '.tl-modal{background:#fff;border-radius:16px;width:95vw;max-width:520px;max-height:90vh;overflow:hidden;position:relative;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);transform:translateY(20px);transition:transform .3s ease;display:flex;flex-direction:column;}',
      '.tl-open .tl-modal{transform:translateY(0);}',
      '.tl-close{position:absolute;top:12px;right:12px;z-index:10;width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;color:#666;transition:background .15s;}',
      '.tl-close:hover{background:rgba(0,0,0,0.12);}',
      '.tl-fab{position:fixed;z-index:999998;border:none;color:#fff;font-weight:600;font-size:15px;padding:14px 24px;border-radius:50px;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.18);transition:transform .15s,box-shadow .15s;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
      '.tl-fab:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.25);}',
      '@media(max-width:640px){.tl-modal{width:100vw;max-width:100vw;height:100vh;max-height:100vh;border-radius:0;}.tl-fab{left:16px!important;right:16px!important;text-align:center;}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function buildModal() {
    if (overlay) return;
    injectModalCSS();

    overlay = createEl('div', { class: 'tl-overlay' });
    modalContent = createEl('div', { class: 'tl-modal' });

    var closeBtn = createEl('button', { class: 'tl-close', 'aria-label': 'Cerrar' });
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeModal);

    modalIframe = createIframe('100%', '600px');
    modalIframe.style.flex = '1';
    modalIframe.style.minHeight = '400px';

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(modalIframe);
    overlay.appendChild(modalContent);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeModal();
    });

    document.body.appendChild(overlay);
  }

  function openModal() {
    buildModal();
    isOpen = true;
    document.body.style.overflow = 'hidden';
    // Force reflow then add open class
    overlay.offsetHeight;
    overlay.classList.add('tl-open');
  }

  function closeModal() {
    if (!overlay) return;
    isOpen = false;
    overlay.classList.remove('tl-open');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      overlay = null;
      modalContent = null;
      modalIframe = null;
    }, 200);
  }

  // ─── Modal Mode ───

  if (mode === 'modal') {
    // Expose TurnoLink.open() for manual triggering
  }

  // ─── Floating Button Mode ───

  if (mode === 'floating-button') {
    injectModalCSS();
    var fab = createEl('button', {
      class: 'tl-fab',
      textContent: buttonText
    }, {
      background: buttonColor
    });

    if (position === 'bottom-left') {
      fab.style.bottom = '24px';
      fab.style.left = '24px';
    } else {
      fab.style.bottom = '24px';
      fab.style.right = '24px';
    }

    fab.addEventListener('click', openModal);
    document.body.appendChild(fab);
  }

  // ─── Global API ───

  window.TurnoLink = {
    open: openModal,
    close: closeModal
  };
})();
