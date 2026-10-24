/*!
 * asd-ads.js — клиентский виджет «свой Директ» для блога АСД.
 * Подключение: один <script src=".../asd-ads.js" data-api="https://<проект>.supabase.co" data-key="<anon-ключ>" defer></script>
 * Слот:        <div data-asd-slot="mid" data-topics="nmck,rim">…запасной контент…</div>
 * Если сервис недоступен, внутри слота остаётся запасной контент (его пишем в HTML статьи).
 * Режим предпросмотра панели: ASDAds.render(campaign) возвращает HTML-строку.
 */
(function (w, d) {
  'use strict';
  var CFG = (function () {
    var s = d.currentScript || d.querySelector('script[data-api]') || {};
    var g = function (k, def) { return (s.getAttribute && s.getAttribute(k)) || def; };
    return { api: (g('data-api', '') || '').replace(/\/$/, ''), key: g('data-key', ''), mock: g('data-mock', '') };
  })();

  // Картинки только с GetCourse (fileservice) и с нашего сайта.
  var IMG_OK = /^https:\/\/(fs\.getcourse\.ru|fs\d*\.getcourse\.ru|[a-z0-9.-]*\.getcourse\.(ru|cloud)|academia-bti\.ru)\//i;
  var LINK_OK = /^https:\/\/([a-z0-9-]+\.)?(academia-bti\.ru|asdprof\.ru)(\/|\?|$)/i;

  var CSS = '.asdads{position:relative;margin:36px 0;border-radius:12px;overflow:hidden;background:#fff;border:2px solid #14264c;display:flex;flex-wrap:wrap;font-family:Inter,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1d2540;box-sizing:border-box}' +
    '.asdads *{box-sizing:border-box}.asdads.v2{border-color:#ff2c69}' +
    '.asdads-tag{position:absolute;top:0;left:0;background:#ff2c69;color:#fff;font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;padding:6px 12px;z-index:2}' +
    '.asdads-side{flex:0 0 190px;background:linear-gradient(160deg,#14264c,#22397a);color:#fff;padding:44px 20px 24px;display:flex;flex-direction:column;justify-content:flex-end}' +
    '.asdads.v2 .asdads-side{background:linear-gradient(160deg,#c4144a,#ff2c69)}' +
    '.asdads-big{font-family:"Playfair Display",Georgia,serif;font-weight:900;font-size:46px;line-height:1;color:#ff2c69}.asdads.v2 .asdads-big{color:#fff}' +
    '.asdads-cap{font-size:13px;line-height:1.4;margin-top:8px;color:#dfe5f5}' +
    '.asdads-img{flex:0 0 190px;background-size:cover;background-position:center;min-height:160px}' +
    '.asdads-main{flex:1;min-width:240px;padding:44px 26px 24px}' +
    '.asdads-main h4{font-family:"Playfair Display",Georgia,serif;font-size:25px;line-height:1.22;color:#14264c;margin:0 0 10px;font-weight:800}' +
    '.asdads-main p{font-size:16px;line-height:1.55;margin:0 0 12px}.asdads-main ul{margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.5}' +
    '.asdads-btn{display:inline-block;background:#ff2c69;color:#fff!important;font-weight:700;font-size:16px;text-decoration:none!important;padding:13px 24px;border-radius:6px}.asdads.v2 .asdads-btn{background:#14264c}' +
    '.asdads-strip{background:#14264c;color:#fff;border-radius:10px;padding:18px 22px;margin:30px 0;display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;font-family:Inter,-apple-system,Arial,sans-serif}' +
    '.asdads-strip span{font-size:16px;line-height:1.45;flex:1;min-width:220px}.asdads-strip b{color:#fff}' +
    '.asdads-strip a{background:#ff2c69;color:#fff!important;font-weight:700;text-decoration:none!important;padding:11px 20px;border-radius:6px;font-size:15px;white-space:nowrap}' +
    '@media(max-width:640px){.asdads-side,.asdads-img{flex-basis:100%}.asdads-side{padding:38px 20px 16px}.asdads-main{padding:22px 20px}.asdads-big{font-size:38px}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function tagUrl(c, slot) {
    var u = c.url || '';
    if (!LINK_OK.test(u)) return null;
    if (/[?&]utm_source=/.test(u)) return u;
    var q = 'utm_source=' + (c.utm_source || 'zhurnal') + '&utm_medium=' + (c.utm_medium || 'blog') +
      '&utm_campaign=' + encodeURIComponent(c.slug || 'ad') + (slot ? '&utm_content=' + encodeURIComponent(slot) : '');
    return u + (u.indexOf('?') < 0 ? '?' : '&') + q;
  }

  function render(c, slot) {
    var href = tagUrl(c, slot);
    if (!href) return '';
    var btn = '<a class="asdads-btn" data-asd-click href="' + esc(href) + '">' + esc(c.btn_text || 'Подробнее') + '</a>';
    if (c.layout === 'strip') {
      return '<div class="asdads-strip" data-asd-cid="' + esc(c.id) + '"><span>' + (c.title ? '<b>' + esc(c.title) + '</b> ' : '') + esc(c.body || '') + '</span>' + btn.replace('class="asdads-btn"', '') .replace('<a ', '<a ') + '</div>';
    }
    var side = (c.image_url && IMG_OK.test(c.image_url))
      ? '<div class="asdads-img" style="background-image:url(\'' + esc(c.image_url) + '\')"></div>'
      : '<div class="asdads-side"><div class="asdads-big">' + esc(c.big || '') + '</div><div class="asdads-cap">' + esc(c.caption || '') + '</div></div>';
    var li = (c.bullets || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
    return '<aside class="asdads' + (c.variant === 2 ? ' v2' : '') + '" data-asd-cid="' + esc(c.id) + '"><span class="asdads-tag">' + esc(c.tag || 'Рекомендуем') + '</span>' + side +
      '<div class="asdads-main"><h4>' + esc(c.title) + '</h4>' + (c.body ? '<p>' + esc(c.body) + '</p>' : '') + (li ? '<ul>' + li + '</ul>' : '') + btn + '</div></aside>';
  }

  function inject() {
    if (d.getElementById('asdads-css')) return;
    var st = d.createElement('style'); st.id = 'asdads-css'; st.textContent = CSS; d.head.appendChild(st);
  }

  function pick(list, slot, topics) {
    var now = Date.now();
    var ok = list.filter(function (c) {
      if (c.status !== 'live') return false;
      if (c.start_at && Date.parse(c.start_at) > now) return false;
      if (c.end_at && Date.parse(c.end_at) < now) return false;
      return !c.slots || !c.slots.length || c.slots.indexOf(slot) >= 0;
    });
    var hit = ok.filter(function (c) { return c.topics && c.topics.some(function (t) { return topics.indexOf(t) >= 0; }); });
    var pool = hit.length ? hit : ok.filter(function (c) { return !c.topics || !c.topics.length; });
    if (!pool.length) return null;
    var sum = pool.reduce(function (a, c) { return a + Math.max(1, c.weight || 1); }, 0), r = Math.random() * sum;
    for (var i = 0; i < pool.length; i++) { r -= Math.max(1, pool[i].weight || 1); if (r <= 0) return pool[i]; }
    return pool[0];
  }

  function hdr(h) { h.apikey = CFG.key; if (!/^sb_/.test(CFG.key)) h.Authorization = 'Bearer ' + CFG.key; return h; }

  function vid() { try { var v = w.localStorage.getItem('asdads_vid'); if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); w.localStorage.setItem('asdads_vid', v); } return v; } catch (e) { return ''; } }

  function log(kind, c, slot) {
    if (!CFG.api || !CFG.key || CFG.mock) return;
    try {
      fetch(CFG.api + '/rest/v1/ad_events', { method: 'POST', keepalive: true,
        headers: hdr({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify({ campaign_id: c.id, slot: slot, kind: kind, page_path: location.pathname, vid: vid() }) });
    } catch (e) {}
  }

  function load() {
    if (CFG.mock && w.ASD_ADS_MOCK) return Promise.resolve(w.ASD_ADS_MOCK);
    if (!CFG.api || !CFG.key) return Promise.reject(new Error('no config'));
    var t = new AbortController(); setTimeout(function () { t.abort(); }, 3500);
    return fetch(CFG.api + '/rest/v1/ad_campaigns?select=*&status=eq.live', { signal: t.signal, headers: hdr({}) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function run() {
    var slots = d.querySelectorAll('[data-asd-slot]');
    if (!slots.length) return;
    inject();
    // Резервируем высоту, пока ждём ответ: data-h="220" (px), по умолчанию 0 (запасной контент уже занимает место).
    slots.forEach(function (el) { var h = el.getAttribute('data-h'); if (h) el.style.minHeight = h + 'px'; });
    load().then(function (list) {
      slots.forEach(function (el) {
        var slot = el.getAttribute('data-asd-slot');
        var topics = (el.getAttribute('data-topics') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        var c = pick(list, slot, topics);
        if (!c) return; // остаётся запасной контент
        var html = render(c, slot);
        if (!html) return;
        el.innerHTML = html; el.style.minHeight = '';
        if ('IntersectionObserver' in w) {
          var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); log('view', c, slot); } }, { threshold: .5 });
          io.observe(el);
        } else { log('view', c, slot); }
        el.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('[data-asd-click],a')) log('click', c, slot); });
      });
    }).catch(function () { /* сервис недоступен: запасной контент остаётся */ });
  }

  w.ASDAds = { render: render, pick: pick, css: CSS };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', run); else run();
})(window, document);
