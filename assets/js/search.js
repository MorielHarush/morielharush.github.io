/* Index filtering, faceting and sorting.
   Drives the main content (advisory table + research cards) rather than the
   sidebar, and keeps the active filter set in the URL so views are shareable. */

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active');
}

(function () {
  'use strict';

  var FACETS = ['severity', 'vendor', 'year', 'topic'];
  var NUMERIC_SORTS = { 'sev-rank': true, cvss: true, date: true };
  // Facets where one item can hold several values; ships pipe-delimited and
  // matches if the item carries ANY of the selected values.
  var MULTI_VALUE = { topic: true };

  document.addEventListener('DOMContentLoaded', function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('.filterable'));
    if (!items.length) return;

    var input = document.getElementById('search-input');
    var listEl = document.getElementById('adv-list');
    var sortBtns = Array.prototype.slice.call(document.querySelectorAll('.sort-btn'));
    var hero = document.getElementById('hero-card');
    var countEl = document.getElementById('result-count');
    var clearBtn = document.getElementById('clear-filters');
    var railClear = document.getElementById('facet-clear');
    var activeBox = document.getElementById('facet-active');
    var chipBox = document.getElementById('facet-chips');
    var facetBtns = Array.prototype.slice.call(document.querySelectorAll('.facet-btn'));
    var totalItems = items.length;
    var noun = (countEl && countEl.getAttribute('data-noun')) || 'items';

    var state = { q: '', severity: [], vendor: [], year: [], topic: [] };
    var sort = { key: 'date', dir: 'desc' };

    /* ---------- state <-> URL ---------- */

    function readUrl() {
      var params = new URLSearchParams(window.location.search);
      state.q = (params.get('q') || '').trim();
      FACETS.forEach(function (f) {
        var raw = params.get(f);
        state[f] = raw ? raw.split(',').filter(Boolean) : [];
      });
      if (input) input.value = state.q;
    }

    function writeUrl() {
      var params = new URLSearchParams();
      if (state.q) params.set('q', state.q);
      FACETS.forEach(function (f) {
        if (state[f].length) params.set(f, state[f].join(','));
      });
      var qs = params.toString();
      history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
    }

    function isFiltered() {
      return !!state.q || FACETS.some(function (f) { return state[f].length > 0; });
    }

    /* ---------- matching ---------- */

    function matches(el) {
      if (state.q) {
        var text = el.getAttribute('data-text') || '';
        var needles = state.q.toLowerCase().split(/\s+/);
        for (var i = 0; i < needles.length; i++) {
          if (text.indexOf(needles[i]) === -1) return false;
        }
      }
      for (var j = 0; j < FACETS.length; j++) {
        var facet = FACETS[j];
        var selected = state[facet];
        if (!selected.length) continue;
        var raw = el.getAttribute('data-' + facet) || '';

        if (MULTI_VALUE[facet]) {
          var owned = raw.split('|');
          var hit = false;
          for (var k = 0; k < selected.length; k++) {
            if (owned.indexOf(selected[k]) !== -1) { hit = true; break; }
          }
          if (!hit) return false;
        } else if (selected.indexOf(raw) === -1) {
          return false;
        }
      }
      return true;
    }

    /* ---------- sorting ---------- */

    function applySort() {
      if (!listEl) return;
      var rows = Array.prototype.slice.call(listEl.querySelectorAll('.adv-row'));
      var key = sort.key;
      var factor = sort.dir === 'asc' ? 1 : -1;

      rows.sort(function (a, b) {
        var av = a.getAttribute('data-' + key) || '';
        var bv = b.getAttribute('data-' + key) || '';
        var cmp;
        if (NUMERIC_SORTS[key]) {
          cmp = (parseFloat(av) || 0) - (parseFloat(bv) || 0);
        } else {
          cmp = av.localeCompare(bv);
        }
        // Ties fall back to newest-first so ordering is never arbitrary.
        if (cmp === 0) {
          cmp = (parseFloat(a.getAttribute('data-date')) || 0) -
                (parseFloat(b.getAttribute('data-date')) || 0);
          return -cmp;
        }
        return cmp * factor;
      });

      rows.forEach(function (row) { listEl.appendChild(row); });

      sortBtns.forEach(function (btn) {
        var isActive = btn.getAttribute('data-sort') === key;
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('asc', isActive && sort.dir === 'asc');
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    /* ---------- chips ---------- */

    function renderChips() {
      if (!chipBox || !activeBox) return;
      chipBox.innerHTML = '';
      var any = false;

      if (state.q) {
        any = true;
        chipBox.appendChild(makeChip('q', state.q, '"' + state.q + '"'));
      }
      FACETS.forEach(function (facet) {
        state[facet].forEach(function (value) {
          any = true;
          chipBox.appendChild(makeChip(facet, value, value));
        });
      });

      activeBox.hidden = !any;
    }

    function makeChip(facet, value, label) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.innerHTML = '<span>' + label.replace(/[<>&]/g, '') + '</span><span class="chip-x">&times;</span>';
      chip.addEventListener('click', function () {
        if (facet === 'q') {
          state.q = '';
          if (input) input.value = '';
        } else {
          state[facet] = state[facet].filter(function (v) { return v !== value; });
        }
        update();
      });
      return chip;
    }

    /* ---------- render ---------- */

    function update() {
      var visible = 0;

      items.forEach(function (el) {
        var ok = matches(el);
        el.hidden = !ok;
        if (ok) visible++;
      });

      // Sections collapse when nothing in them survives the filter.
      document.querySelectorAll('.index-section').forEach(function (section) {
        var count = section.querySelectorAll('.filterable:not([hidden])').length;
        var empty = section.querySelector('.section-empty');
        var wrap = section.querySelector('.adv-list, .post-grid');
        if (empty) empty.hidden = count > 0;
        if (wrap) wrap.hidden = count === 0;
      });

      var filtered = isFiltered();
      if (hero) hero.hidden = filtered;

      if (countEl) {
        countEl.textContent = filtered
          ? visible + ' of ' + totalItems + ' ' + noun
          : totalItems + ' ' + noun;
      }
      if (clearBtn) clearBtn.hidden = !filtered;

      facetBtns.forEach(function (btn) {
        var facet = btn.getAttribute('data-facet');
        var value = btn.getAttribute('data-value');
        btn.classList.toggle('selected', state[facet].indexOf(value) !== -1);
      });

      renderChips();
      writeUrl();
      return visible;
    }

    /* ---------- events ---------- */

    if (input) {
      input.addEventListener('input', function () {
        state.q = this.value.trim();
        update();
      });
    }

    facetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var facet = btn.getAttribute('data-facet');
        var value = btn.getAttribute('data-value');
        var at = state[facet].indexOf(value);
        if (at === -1) state[facet].push(value);
        else state[facet].splice(at, 1);
        update();
      });
    });

    function clearAll() {
      state.q = '';
      FACETS.forEach(function (f) { state[f] = []; });
      if (input) input.value = '';
      update();
    }
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (railClear) railClear.addEventListener('click', clearAll);

    sortBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-sort');
        if (sort.key === key) {
          sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          sort.key = key;
          // Numbers and dates read best highest-first; names read best A-Z.
          sort.dir = NUMERIC_SORTS[key] ? 'desc' : 'asc';
        }
        applySort();
      });
    });

    // "Show all" toggles: vendor list on /advisories/, topic list on /research/.
    var overflowLists = [
      { list: document.getElementById('vendor-facets'), more: document.getElementById('vendor-more'), facet: 'vendor' },
      { list: document.getElementById('topic-facets'),  more: document.getElementById('topic-more'),  facet: 'topic' }
    ].filter(function (o) { return o.list && o.more; });

    overflowLists.forEach(function (o) {
      o.more.addEventListener('click', function () {
        var expanded = o.list.classList.toggle('expanded');
        o.more.textContent = expanded
          ? o.more.getAttribute('data-less')
          : o.more.getAttribute('data-more');
      });
    });

    /* ---------- boot ---------- */

    readUrl();
    applySort();
    update();

    // A deep link like /advisories/?vendor=Emby should reveal the selected value
    // even when it sits below a "show all" fold.
    overflowLists.forEach(function (o) {
      if (!state[o.facet].length) return;
      var hiddenSelected = state[o.facet].some(function (v) {
        var btn = o.list.querySelector('[data-value="' + v.replace(/"/g, '\\"') + '"]');
        return btn && btn.classList.contains('facet-overflow');
      });
      if (hiddenSelected) o.more.click();
    });
  });
})();
