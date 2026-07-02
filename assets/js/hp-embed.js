/* ==========================================================================
   HP Embed Loader
   --------------------------------------------------------------------------
   Replaces a hard-coded 3rd-party <script> embed with a runtime-loaded one.
   Instead of baking a partner's script into the page and re-deploying every
   time it changes, we fetch the HTML they publish (via the admin form) from
   Supabase and inject it into the page — executing any <script> inside it
   EXACTLY as if it had been hard-coded in the HTML source.

   Usage on any page:
     1) Put a marker where the embed should appear:
          <div data-hp-embed></div>
     2) Include this file once, before </body>:
          <script src="assets/js/hp-embed.js" defer></script>

   Why not innerHTML? Setting innerHTML does NOT execute <script> tags.
   We therefore re-create every <script> node via document.createElement so
   the browser fetches/runs it — same behaviour as a static embed.
   ========================================================================== */
(function () {
  'use strict';

  // --- Supabase source (publishable key is safe to expose; guarded by RLS) ---
  var SUPABASE_URL = 'https://lbgremrhdrfomdoknhdu.supabase.co';
  var SUPABASE_KEY = 'sb_publishable__xmwEP_ZOaxR3bM94NTkKA_ptXTpVDv';
  var TABLE = 'templates';
  var ROW_ID = 1;

  var ENDPOINT = SUPABASE_URL + '/rest/v1/' + TABLE + '?id=eq.' + ROW_ID + '&select=html';

  /**
   * Inject an HTML string into `target`, executing any contained <script>.
   * Non-script markup is inserted as-is; each <script> is re-created so it
   * runs like a natively-parsed embed (supports src, async, type, id, ...).
   */
  function injectAndRun(target, html) {
    target.innerHTML = html || '';

    var oldScripts = target.querySelectorAll('script');
    for (var i = 0; i < oldScripts.length; i++) {
      var old = oldScripts[i];
      var fresh = document.createElement('script');

      // copy every attribute (src, async, defer, charset, type, id, data-*, ...)
      for (var j = 0; j < old.attributes.length; j++) {
        var attr = old.attributes[j];
        fresh.setAttribute(attr.name, attr.value);
      }
      // copy inline code, if any
      if (old.textContent) fresh.textContent = old.textContent;

      // replaceChild on a connected parent inserts the new (createElement'd)
      // script into the live document → the browser executes it.
      old.parentNode.replaceChild(fresh, old);
    }

    target.setAttribute('data-hp-embed-state', 'loaded');
    target.dispatchEvent(new CustomEvent('hp-embed:loaded', { bubbles: true }));
  }

  function fail(target, err) {
    target.setAttribute('data-hp-embed-state', 'error');
    if (window.console && console.error) console.error('[hp-embed] load failed:', err);
    target.dispatchEvent(new CustomEvent('hp-embed:error', { bubbles: true, detail: err }));
  }

  function load() {
    var slots = document.querySelectorAll('[data-hp-embed]');
    if (!slots.length) return;

    for (var i = 0; i < slots.length; i++) slots[i].setAttribute('data-hp-embed-state', 'loading');

    fetch(ENDPOINT, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
      cache: 'no-store'
    })
      .then(function (res) {
        return res.text().then(function (body) {
          if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + body);
          return JSON.parse(body || '[]');
        });
      })
      .then(function (rows) {
        var html = (rows && rows[0] && rows[0].html) || '';
        var els = document.querySelectorAll('[data-hp-embed]');
        for (var k = 0; k < els.length; k++) injectAndRun(els[k], html);
      })
      .catch(function (err) {
        var els = document.querySelectorAll('[data-hp-embed]');
        for (var k = 0; k < els.length; k++) fail(els[k], err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
