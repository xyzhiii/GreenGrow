/**
 * GreenGrow Admin — Shared Sidebar
 * Include this script in every admin page.
 * It injects the sidebar, handles active state, auth guard, and logout.
 *
 * Usage in each page:
 *   <script src="../assets/js/sidebar.js"></script>
 */

(function () {

  // ── 1. Inject sidebar HTML before page content ──────────────────────────
  const currentPage = location.pathname.split('/').pop();

  function navLink(page, icon, label) {
    const isActive = currentPage === page ? 'active' : '';
    return `
      <a class="nav-link ${isActive}" href="${page}">
        <i data-lucide="${icon}" class="nav-icon"></i> ${label}
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
        ${navLink('overview.html',         'layout-dashboard', 'Dashboard')}
        ${navLink('user-management.html',  'users',            'User Management')}
        ${navLink('listings.html',         'sprout',           'Listing Management')}

        <div class="nav-section-label">Reports</div>
        ${navLink('appeals.html',          'shield-alert',     'Account Appeals')}
        ${navLink('analytics.html',        'bar-chart-2',      'Analytics & Reports')}
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" id="gg-logout-btn">
          <i data-lucide="log-out" class="nav-icon"></i> Log out
        </button>
      </div>

    </aside>`;

  // Wrap existing body content in .shell, prepend sidebar
  document.addEventListener('DOMContentLoaded', () => {

    // Create shell wrapper
    const shell = document.createElement('div');
    shell.className = 'shell';

    // Move all existing body children into a content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'page-frame';
    contentWrapper.style.cssText = 'flex:1;overflow-y:auto;height:100vh;display:flex;flex-direction:column;';

    while (document.body.firstChild) {
      contentWrapper.appendChild(document.body.firstChild);
    }

    // Inject sidebar + content into shell
    shell.innerHTML = sidebarHTML;
    shell.appendChild(contentWrapper);
    document.body.appendChild(shell);

    // Init Lucide icons
    if (window.lucide) lucide.createIcons();

    // Logout handler
    document.getElementById('gg-logout-btn').addEventListener('click', async () => {
      if (window.firebase && firebase.auth) {
        await firebase.auth().signOut();
      }
      window.location.href = 'index.html';
    });

  });


  // ── 2. Auth guard ────────────────────────────────────────────────────────
  // Runs after Firebase is ready. Each page still initializes Firebase itself,
  // but the auth redirect is handled here centrally.
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