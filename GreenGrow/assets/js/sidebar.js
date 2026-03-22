(function () {

  // ── 1. Inject sidebar HTML before page content ──────────────────────────
  const currentPage = location.pathname.split('/').pop();

  function navLink(page, icon, label, badgeId) {
    const isActive = currentPage === page ? 'active' : '';
    const badge    = badgeId ? `<span class="nav-badge" id="${badgeId}" style="display:none;"></span>` : '';
    return `
      <a class="nav-link ${isActive}" href="${page}">
        <i data-lucide="${icon}" class="nav-icon"></i>
        <span class="nav-label">${label}</span>
        ${badge}
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
        ${navLink('listings.html',        'sprout',           'Listing Management')}

        <div class="nav-section-label">Reports</div>
        ${navLink('appeals.html',         'shield-alert',     'Appeals', 'appeals-badge')}
        ${navLink('reports.html',        'message-square',   'Reports')}
        ${navLink('analytics.html',       'bar-chart-2',      'Analytics')}       
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" id="gg-logout-btn">
          <i data-lucide="log-out" class="nav-icon"></i> Log out
        </button>
      </div>

    </aside>

    <!-- Appeal notification toast -->
    <div id="gg-appeal-toast" style="
      position: fixed;
      top: 24px; right: 24px;
      z-index: 99999;
      background: #fff;
      border-radius: 16px;
      padding: 16px 18px 14px;
      box-shadow: 0 20px 60px rgba(10,22,14,0.16), 0 4px 16px rgba(10,22,14,0.1);
      width: 100%;
      max-width: 280px;
      text-align: center;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-12px) scale(0.97);
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    ">
      <!-- Icon -->
      <div style="
        width: 42px; height: 42px; border-radius: 50%;
        background: rgba(46,125,50,0.1);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 10px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>

      <!-- Title -->
      <div style="font-size: 0.9rem; font-weight: 700; color: #1a2e1d; margin-bottom: 6px;">
        New Message Received
      </div>

      <!-- Body -->
      <div id="gg-appeal-toast-msg" style="
        font-size: 0.78rem; color: #556b5a;
        line-height: 1.5; margin-bottom: 14px;
      "></div>

      <!-- Buttons -->
      <div style="display: flex; gap: 8px;">
        <button onclick="window.__ggDismissAppealToast()" style="
          flex: 1; padding: 7px;
          border: 1.5px solid #d4e0d6; border-radius: 9px;
          background: #fff; color: #556b5a;
          font-size: 0.78rem; font-weight: 600;
          font-family: inherit; cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        " onmouseover="this.style.background='#f5faf6';this.style.borderColor='#a0b8a4'"
           onmouseout="this.style.background='#fff';this.style.borderColor='#d4e0d6'">
          Dismiss
        </button>
        <a href="appeals.html" style="
          flex: 1; padding: 7px;
          background: #2e7d32; color: #fff;
          border-radius: 9px; border: none;
          font-size: 0.78rem; font-weight: 700;
          font-family: inherit; cursor: pointer;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, transform 0.15s;
        " onmouseover="this.style.opacity='0.88';this.style.transform='translateY(-1px)'"
           onmouseout="this.style.opacity='1';this.style.transform='translateY(0)'">
          View Messages
        </a>
      </div>
    </div>`;

  // ── Badge styles ─────────────────────────────────────────────────────────
  const badgeStyles = `
    .nav-link { position: relative; display: flex; align-items: center; }
    .nav-label { flex: 1; }
    .nav-badge {
      display: inline-flex !important;
      align-items: center; justify-content: center;
      min-width: 18px; height: 18px;
      background: #e53935; color: #fff;
      font-size: 0.68rem; font-weight: 800;
      border-radius: 9px; padding: 0 5px;
      margin-left: 8px; line-height: 1;
      animation: badgePop 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes badgePop {
      from { transform: scale(0.5); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }
  `;

  // ── 2. DOM ready: mount sidebar ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {

    const styleEl = document.createElement('style');
    styleEl.textContent = badgeStyles;
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

    // Dismiss helper
    window.__ggDismissAppealToast = function () {
      const toast = document.getElementById('gg-appeal-toast');
      if (!toast) return;
      toast.style.opacity       = '0';
      toast.style.pointerEvents = 'none';
      toast.style.transform     = 'translateY(-12px) scale(0.97)';
    };

    // Logout
    document.getElementById('gg-logout-btn').addEventListener('click', async () => {
      if (window.firebase && firebase.auth) {
        await firebase.auth().signOut();
      }
      window.location.href = 'index.html';
    });

    waitForFirebase(() => startAppealNotifications());
  });


  // ── 3. Wait for Firebase ─────────────────────────────────────────────────
  function waitForFirebase(cb, attempts) {
    attempts = attempts || 0;
    if (attempts > 30) return;
    if (window.firebase && firebase.apps && firebase.apps.length > 0) {
      cb();
    } else {
      setTimeout(() => waitForFirebase(cb, attempts + 1), 100);
    }
  }


  // ── 4. Appeals notification logic ────────────────────────────────────────
  function startAppealNotifications() {
    const db       = firebase.firestore();
    const badge    = document.getElementById('appeals-badge');
    const toast    = document.getElementById('gg-appeal-toast');
    const toastMsg = document.getElementById('gg-appeal-toast-msg');
    let toastTimer = null;
    let isFirst    = true;

    const SEEN_KEY = 'gg_seen_appeals';

    function getSeenIds() {
      try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
      catch { return new Set(); }
    }

    function markSeen(ids) {
      try { localStorage.setItem(SEEN_KEY, JSON.stringify([...ids])); }
      catch {}
    }

    function showToast(message) {
      if (!toast) return;
      toastMsg.innerHTML = message;
      toast.style.opacity       = '1';
      toast.style.pointerEvents = 'all';
      toast.style.transform     = 'translateY(0) scale(1)';

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        window.__ggDismissAppealToast();
      }, 7000);
    }

    db.collection('appeals')
      .orderBy('submittedAt', 'desc')
      .onSnapshot(snap => {

        const unresolved = snap.docs.filter(d => d.data().resolved !== true);
        const count      = unresolved.length;

        // ── Badge ──
        if (badge) {
          if (count > 0) {
            badge.textContent   = count > 99 ? '99+' : count;
            badge.style.display = '';
          } else {
            badge.style.display = 'none';
          }
        }

        const seenIds    = getSeenIds();
        const currentIds = new Set(snap.docs.map(d => d.id));

        if (isFirst) {
          isFirst = false;
          const newWhileAway = unresolved.filter(d => !seenIds.has(d.id));

          if (newWhileAway.length > 1) {
            showToast(`You have <strong>${newWhileAway.length} new messages</strong> received while you were away.`);
          } else if (newWhileAway.length === 1) {
            const data    = newWhileAway[0].data();
            const sender  = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || 'A user';
            const msg     = (data.message || '');
            const preview = msg.length > 70 ? msg.slice(0, 70) + '…' : msg;
            showToast(
              `<strong>${sender}</strong> sent a new message` +
              (preview ? `:<br><span style="color:#7a9b7e;font-style:italic;">"${preview}"</span>` : '.')
            );
          }

          markSeen(currentIds);
          return;
        }

        // ── Live: new doc added ──
        snap.docChanges().forEach(change => {
          if (change.type !== 'added') return;
          const data = change.doc.data();
          if (data.resolved === true) return;

          const sender  = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || 'A user';
          const msg     = (data.message || '');
          const preview = msg.length > 70 ? msg.slice(0, 70) + '…' : msg;

          showToast(
            `<strong>${sender}</strong> sent a new message` +
            (preview ? `:<br><span style="color:#7a9b7e;font-style:italic;">"${preview}"</span>` : '.')
          );

          seenIds.add(change.doc.id);
          markSeen(seenIds);
        });

      }, err => console.error('[GreenGrow] Appeals watcher error:', err));
  }


  // ── 5. Auth guard ────────────────────────────────────────────────────────
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