(function () {

  // ── 1. Inject sidebar HTML ───────────────────────────────────────────────
  const currentPage = location.pathname.split('/').pop();

  function navLink(page, icon, label, dotId) {
    const isActive = currentPage === page ? 'active' : '';
    const dot      = dotId ? `<span class="nav-dot" id="${dotId}"></span>` : '';
    return `
      <a class="nav-link ${isActive}" href="${page}">
        <i data-lucide="${icon}" class="nav-icon"></i>
        <span class="nav-label">${label}</span>
        ${dot}
      </a>`;
  }

  const sidebarHTML = `
    <aside class="sidebar" id="gg-sidebar">

      <div class="sidebar-brand">
        <div class="brand-leaf"><i data-lucide="leaf"></i></div>
        <div>
          <div class="brand-text">GreenGrow</div>
          <div class="brand-tag">Admin Panel</div>
        </div>
      </div>

      <nav class="side-nav">
        <div class="nav-section-label">Main</div>
        ${navLink('overview.html',        'layout-dashboard', 'Dashboard')}
        ${navLink('user-management.html', 'users',            'User Management')}
        ${navLink('listings.html',        'sprout',           'Listing Management', 'dot-listings')}

        <div class="nav-section-label">Reports</div>
        ${navLink('appeals.html',         'shield-alert',     'Appeals',            'dot-appeals')}
        ${navLink('reports.html',         'message-square',   'Reports',            'dot-reports')}
        ${navLink('analytics.html',       'bar-chart-2',      'Analytics')}
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" id="gg-logout-btn">
          <i data-lucide="log-out" class="nav-icon"></i> Log out
        </button>
      </div>

    </aside>`;

  // ── Dot styles ───────────────────────────────────────────────────────────
  const dotStyles = `
    .nav-link { position: relative; display: flex; align-items: center; }
    .nav-label { flex: 1; }
    .nav-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #e53935;
      flex-shrink: 0;
      margin-left: 6px;
      display: none;
      box-shadow: 0 0 0 2px rgba(229,57,53,0.2);
      animation: dotPop 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .nav-dot.visible { display: block; }
    @keyframes dotPop {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
  `;

  // ── localStorage keys ────────────────────────────────────────────────────
  const SEEN_APPEALS  = 'gg_seen_appeals';
  const SEEN_REPORTS  = 'gg_seen_reports';
  const SEEN_LISTINGS = 'gg_seen_listings';

  function getSeenIds(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { return new Set(); }
  }

  function markAllSeen(key, ids) {
    try { localStorage.setItem(key, JSON.stringify([...ids])); }
    catch {}
  }

  // ── 2. DOM ready: mount sidebar ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {

    const styleEl = document.createElement('style');
    styleEl.textContent = dotStyles;
    document.head.appendChild(styleEl);

    const shell = document.createElement('div');
    shell.className = 'shell';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'page-frame';
    contentWrapper.style.cssText = 'flex:1;overflow-y:auto;height:100vh;display:flex;flex-direction:column;';

    while (document.body.firstChild) {
      contentWrapper.appendChild(document.body.firstChild);
    }

    shell.innerHTML = sidebarHTML;
    shell.appendChild(contentWrapper);
    document.body.appendChild(shell);

    if (window.lucide) lucide.createIcons();

    // Logout
    document.getElementById('gg-logout-btn').addEventListener('click', async () => {
      if (window.firebase && firebase.auth) {
        await firebase.auth().signOut();
      }
      window.location.href = 'index.html';
    });

    // Start watchers after auth confirmed
    waitForFirebase(() => {
      firebase.auth().onAuthStateChanged((user) => {
        if (!user) return;

        // If currently on a page, mark everything in that collection as seen
        if (currentPage === 'appeals.html')  clearDotOnLoad('appeals',            SEEN_APPEALS);
        if (currentPage === 'reports.html')  clearDotOnLoad('reports',            SEEN_REPORTS);
        if (currentPage === 'listings.html') clearDotOnLoad('sellerApplications', SEEN_LISTINGS);

        // Watch all three and show dot if there are unseen items
        watchDot('appeals',            SEEN_APPEALS,  'dot-appeals',  () => true);
        watchDot('reports',            SEEN_REPORTS,  'dot-reports',  () => true);
        watchDot('sellerApplications', SEEN_LISTINGS, 'dot-listings', d => {
          const s = (d.applicationStatus || '').toLowerCase().trim();
          return s === 'pending' || s === '';
        });
      });
    });
  });


  // ── 3. Clear dot on page load (mark all current docs as seen) ────────────
  function clearDotOnLoad(collection, seenKey) {
    const db = firebase.firestore();
    db.collection(collection).get().then(snap => {
      const allIds = new Set(snap.docs.map(d => d.id));
      markAllSeen(seenKey, allIds);
    }).catch(() => {});
  }


  // ── 4. Watch collection, show dot if unseen items exist ──────────────────
  function watchDot(collection, seenKey, dotId, filterFn) {
    const db = firebase.firestore();
    db.collection(collection).onSnapshot(snap => {
      const dot = document.getElementById(dotId);
      if (!dot) return;
      const seenIds = getSeenIds(seenKey);
      const hasNew  = snap.docs.some(d => !seenIds.has(d.id) && filterFn(d.data()));
      if (hasNew) {
        dot.classList.add('visible');
      } else {
        dot.classList.remove('visible');
      }
    }, err => console.error(`[GreenGrow] ${collection} watcher error:`, err));
  }


  // ── 5. Wait for Firebase ─────────────────────────────────────────────────
  function waitForFirebase(cb, attempts) {
    attempts = attempts || 0;
    if (attempts > 30) return;
    if (window.firebase && firebase.apps && firebase.apps.length > 0) {
      cb();
    } else {
      setTimeout(() => waitForFirebase(cb, attempts + 1), 100);
    }
  }


  // ── 6. Auth guard ────────────────────────────────────────────────────────
  window.__ggAuthGuard = function (auth, db) {
    auth.onAuthStateChanged(async (user) => {
      if (!user) { window.location.href = 'index.html'; return; }
      try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (!doc.exists || doc.data().role !== 'admin') {
          await auth.signOut();
          window.location.href = 'index.html';
        }
      } catch (e) {
        console.error('Auth guard error:', e);
        window.location.href = 'index.html';
      }
    });
  };

})();