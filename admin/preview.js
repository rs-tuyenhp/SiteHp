/* ==========================================================================
   Display screen — fetches the published template from Supabase and renders
   it (executing any embedded <script>) inside a full-bleed iframe.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.NEXORA_SUPABASE;
  var stage = document.getElementById('stage');
  var statusEl = document.getElementById('disp-status');
  var dot = document.getElementById('disp-dot');
  var btn = document.getElementById('btn-refresh');

  var endpoint = cfg.url + '/rest/v1/' + cfg.table + '?id=eq.' + cfg.id + '&select=html';
  var headers = { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key };

  function wrapDoc(html) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<base target="_blank">' +
      '<style>html,body{margin:0}body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px;color:#111;background:#fff}</style>' +
      '</head><body>' + (html || '') + '</body></html>';
  }

  function setStatus(text, color) {
    statusEl.textContent = text;
    if (dot) dot.style.background = color || 'var(--accent)';
  }

  function load() {
    setStatus('Loading…', 'var(--secondary)');
    btn.disabled = true;
    fetch(endpoint, { headers: headers, cache: 'no-store' })
      .then(function (res) {
        return res.text().then(function (body) {
          if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + body);
          return JSON.parse(body || '[]');
        });
      })
      .then(function (rows) {
        var html = rows[0] && rows[0].html;
        if (!html || !html.trim()) {
          stage.srcdoc = wrapDoc('<div style="font-family:system-ui;padding:40px;color:#667">No template has been published yet. Open the editor to publish one.</div>');
          setStatus('Empty', '#f5b942');
        } else {
          stage.srcdoc = wrapDoc(html);
          setStatus('Live · ' + new Date().toLocaleTimeString(), 'var(--accent)');
        }
      })
      .catch(function (err) {
        stage.srcdoc = wrapDoc('<pre style="font-family:ui-monospace,monospace;color:#c0392b;white-space:pre-wrap;padding:24px">Failed to load template:\n\n' + String(err.message).replace(/[<>&]/g, '') + '</pre>');
        setStatus('Error', '#ff6b81');
      })
      .finally(function () { btn.disabled = false; });
  }

  btn.addEventListener('click', load);
  load();
})();
