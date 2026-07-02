/* ==========================================================================
   Template Manager — editor logic
   Reads/writes the `templates` row in Supabase via the REST API and renders
   a live preview. The preview uses an <iframe srcdoc> so that any <script>
   inside the saved template actually executes (embeds, widgets, etc.).
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.NEXORA_SUPABASE;
  var $ = function (s) { return document.querySelector(s); };

  var els = {
    form:      $('#template-form'),
    ta:        $('#message'),
    count:     $('#char-count'),
    status:    $('#status'),
    iframe:    $('#preview'),
    empty:     $('#preview-empty'),
    btnSave:   $('#btn-save'),
    btnLoad:   $('#btn-load'),
    btnPreview:$('#btn-preview'),
    btnClear:  $('#btn-clear'),
    metaTime:  $('#meta-time'),
    metaSize:  $('#meta-size'),
    metaId:    $('#meta-id'),
    rowBadge:  $('#row-badge'),
  };

  var endpoint = cfg.url + '/rest/v1/' + cfg.table + '?id=eq.' + cfg.id;
  var baseHeaders = { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key };

  els.metaId.textContent = els.rowBadge.textContent = '#' + cfg.id;

  var ICON_OK   = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_ERR  = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v6M12 16.4v.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_SPIN = '<svg class="spin" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-2.6-6.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // ---------- helpers ----------
  function setStatus(type, html) {
    els.status.className = 'status show ' + type;
    els.status.innerHTML = html;
  }
  function clearStatus() { els.status.className = 'status'; els.status.innerHTML = ''; }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function humanBytes(str) {
    var n = new Blob([str || '']).size;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }

  function updateCount() {
    var v = els.ta.value;
    els.count.textContent = v.length.toLocaleString();
    els.metaSize.textContent = humanBytes(v);
  }

  function stamp() { els.metaTime.textContent = new Date().toLocaleTimeString(); }

  // ---------- preview (iframe srcdoc executes <script>) ----------
  function wrapDoc(html) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<base target="_blank">' +
      '<style>html,body{margin:0}body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:20px;color:#111;background:#fff}</style>' +
      '</head><body>' + (html || '') + '</body></html>';
  }

  function renderPreview(html) {
    if (!html || !html.trim()) {
      els.iframe.hidden = true;
      els.empty.style.display = 'grid';
      return;
    }
    els.empty.style.display = 'none';
    els.iframe.hidden = false;
    els.iframe.srcdoc = wrapDoc(html);
  }

  // ---------- API ----------
  function apiLoad() {
    return fetch(endpoint + '&select=html,created_at', { headers: baseHeaders, cache: 'no-store' })
      .then(function (res) {
        return res.text().then(function (body) {
          if (!res.ok) throw new Error('GET ' + res.status + ' — ' + body);
          var rows = JSON.parse(body || '[]');
          if (!rows.length) throw new Error('Row id=' + cfg.id + ' not found in "' + cfg.table + '".');
          return rows[0];
        });
      });
  }

  function apiSave(html) {
    return fetch(endpoint, {
      method: 'PATCH',
      headers: {
        apikey: cfg.key,
        Authorization: 'Bearer ' + cfg.key,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ html: html })
    }).then(function (res) {
      return res.text().then(function (body) {
        if (!res.ok) throw new Error('PATCH ' + res.status + ' — ' + body);
        var rows = JSON.parse(body || '[]');
        if (!rows.length) throw new Error('Update returned no row. Check that id=' + cfg.id + ' exists and RLS allows UPDATE.');
        return rows[0];
      });
    });
  }

  // ---------- actions ----------
  function load() {
    setStatus('info', ICON_SPIN + '<span>Loading current template…</span>');
    els.btnLoad.disabled = true;
    apiLoad().then(function (row) {
      els.ta.value = row.html || '';
      updateCount();
      renderPreview(row.html);
      stamp();
      setStatus('ok', ICON_OK + '<span>Loaded current template from Supabase.</span>');
    }).catch(function (err) {
      setStatus('err', ICON_ERR + '<span>' + escapeHtml(err.message) + '</span>');
    }).finally(function () {
      els.btnLoad.disabled = false;
    });
  }

  function save() {
    var html = els.ta.value;
    if (!html.trim()) {
      setStatus('err', ICON_ERR + '<span>Template is empty — nothing to publish.</span>');
      els.ta.focus();
      return;
    }
    var original = els.btnSave.innerHTML;
    els.btnSave.disabled = true;
    els.btnSave.innerHTML = ICON_SPIN + ' Publishing…';
    setStatus('info', ICON_SPIN + '<span>Saving to Supabase…</span>');

    apiSave(html).then(function (row) {
      renderPreview(row.html);
      updateCount();
      stamp();
      setStatus('ok', ICON_OK + '<span>Published! The <a href="preview.html" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">display screen</a> now shows this template.</span>');
    }).catch(function (err) {
      setStatus('err', ICON_ERR + '<span><b>Save failed.</b> ' + escapeHtml(err.message) + '</span>');
    }).finally(function () {
      els.btnSave.disabled = false;
      els.btnSave.innerHTML = original;
    });
  }

  // ---------- wire up ----------
  els.ta.addEventListener('input', updateCount);
  els.form.addEventListener('submit', function (e) { e.preventDefault(); save(); });
  els.btnLoad.addEventListener('click', load);
  els.btnPreview.addEventListener('click', function () { renderPreview(els.ta.value); clearStatus(); });
  els.btnClear.addEventListener('click', function () {
    els.ta.value = ''; updateCount(); renderPreview(''); clearStatus(); els.ta.focus();
  });

  // Ctrl/Cmd + S to publish
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
  });

  // boot
  updateCount();
  load();
})();
