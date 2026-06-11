/**
 * GoogleAdsManager - Handles Google AdSense ad placements
 * Supports multiple accounts and fixed/inline ad formats
 * Add a fixed (sticky) ad overlay
 * @param {object} options - slotId, position ('bottom'|'top'), width, height, closeable, accountIndex
 */
(function (w, d) {
  'use strict';

  // ── AdSense account config ────────────────────────────────
  // Replace ca-pub-XXXXXXXXXXXXXXXX with your actual publisher ID
  var ACCOUNTS = [
    { client: 'ca-pub-5525538810839147' }, // account 0 – primary
    // { client: 'ca-pub-YYYYYYYYYYYYYYYY' }, // account 1 – secondary
  ];

  var loaded = {};

  function loadScript(idx) {
    idx = idx || 0;
    var acct = ACCOUNTS[idx];
    if (!acct || loaded[idx]) return;
    loaded[idx] = true;
    var s = d.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + acct.client;
    d.head.appendChild(s);
  }

  function push() {
    try { (w.adsbygoogle = w.adsbygoogle || []).push({}); } catch (e) {}
  }

  /**
   * Create a fixed (sticky) ad overlay.
   * @param {object} opts  slotId, position ('bottom'|'top'), width, height, closeable, accountIndex
   */
  function createFixedAd(opts) {
    opts = opts || {};
    var pos      = opts.position     || 'bottom';
    var isMobile = w.innerWidth < 768;
    var width    = opts.width        || (isMobile ? Math.min(320, w.innerWidth) : Math.min(728, w.innerWidth));
    var height   = opts.height       || (isMobile ? 50 : 90);
    var closeable = opts.closeable !== false;
    var idx      = opts.accountIndex || 0;
    var slotId   = opts.slotId       || '';
    var acct     = ACCOUNTS[idx];

    if (!acct) return;
    if (d.getElementById('gads-fixed')) return;

    loadScript(idx);

    var wrap = d.createElement('div');
    wrap.id = 'gads-fixed';
    wrap.setAttribute('role', 'complementary');
    wrap.setAttribute('aria-label', 'Advertisement');
    wrap.style.cssText = [
      'position:fixed',
      pos === 'bottom' ? 'bottom:0' : 'top:114px',
      'left:50%',
      'transform:translateX(-50%)',
      'width:' + width + 'px',
      'max-width:100vw',
      'z-index:8500',
      'background:#fff',
      pos === 'bottom'
        ? 'border-top:1px solid #e5e7eb;border-radius:8px 8px 0 0'
        : 'border-bottom:1px solid #e5e7eb;border-radius:0 0 8px 8px',
      'box-shadow:' + (pos === 'bottom' ? '0 -4px 16px rgba(0,0,0,0.1)' : '0 4px 16px rgba(0,0,0,0.1)'),
      'padding:4px 4px 0',
      'text-align:center',
      'transition:transform 0.3s ease',
    ].join(';');

    var lbl = d.createElement('div');
    lbl.style.cssText = 'font-size:9px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;font-family:sans-serif';
    lbl.textContent = 'Advertisement';
    wrap.appendChild(lbl);

    if (closeable) {
      var btn = d.createElement('button');
      btn.innerHTML = '&times;';
      btn.title = 'Close';
      btn.style.cssText = [
        'position:absolute',
        pos === 'bottom' ? 'top:4px' : 'bottom:4px',
        'right:6px',
        'background:rgba(0,0,0,0.06)',
        'border:1px solid #e5e7eb',
        'color:#6b7280',
        'width:22px;height:22px;border-radius:50%',
        'cursor:pointer;font-size:15px;line-height:20px',
        'text-align:center;z-index:1;font-family:sans-serif;padding:0',
      ].join(';');
      btn.addEventListener('click', function () {
        var slide = pos === 'bottom' ? 'translateX(-50%) translateY(110%)' : 'translateX(-50%) translateY(-110%)';
        wrap.style.transform = slide;
        setTimeout(function () { wrap.parentNode && wrap.parentNode.removeChild(wrap); }, 350);
      });
      wrap.appendChild(btn);
    }

    var ins = d.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.cssText = 'display:block;width:' + width + 'px;height:' + height + 'px;';
    ins.setAttribute('data-ad-client', acct.client);
    if (slotId) ins.setAttribute('data-ad-slot', slotId);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    wrap.appendChild(ins);

    d.body.appendChild(wrap);
    push();
  }

  /**
   * Insert an inline ad into a container element.
   * @param {string|Element} container  CSS selector or DOM element
   * @param {object} opts  slotId, width, height, accountIndex, format
   */
  function createInlineAd(container, opts) {
    opts = opts || {};
    var idx    = opts.accountIndex || 0;
    var slotId = opts.slotId       || '';
    var width  = opts.width        || '100%';
    var height = opts.height       || 90;
    var format = opts.format       || 'auto';
    var acct   = ACCOUNTS[idx];
    if (!acct) return;

    loadScript(idx);

    var el = typeof container === 'string' ? d.querySelector(container) : container;
    if (!el) return;

    var wrap = d.createElement('div');
    wrap.style.cssText = 'text-align:center;padding:8px 0;';

    var note = d.createElement('div');
    note.style.cssText = 'font-size:9px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;font-family:sans-serif';
    note.textContent = 'Advertisement';
    wrap.appendChild(note);

    var ins = d.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.cssText = 'display:block;' + (typeof width === 'number' ? 'width:' + width + 'px' : 'width:' + width) + ';height:' + height + 'px;';
    ins.setAttribute('data-ad-client', acct.client);
    if (slotId) ins.setAttribute('data-ad-slot', slotId);
    ins.setAttribute('data-ad-format', format);
    ins.setAttribute('data-full-width-responsive', 'true');
    wrap.appendChild(ins);

    el.appendChild(wrap);
    push();
  }

  w.GoogleAdsManager = { createFixedAd: createFixedAd, createInlineAd: createInlineAd, loadScript: loadScript };

  // Auto-init sticky bottom ad
  function init() { createFixedAd({ position: 'bottom', closeable: true, accountIndex: 0 }); }
  d.readyState === 'loading' ? d.addEventListener('DOMContentLoaded', init) : init();

}(window, document));
