// app.js — Router, initialization, page registry

const App = {
  currentRoute: null,
  pages: {},

  // Register a page
  register(route, page) {
    this.pages[route] = page;
  },

  // Security gate — check auth before starting
  checkAuth() {
    const ACCESS_KEY = 'hc-r22-7x9m4q';

    // Check sessionStorage first
    if (sessionStorage.getItem('hc_auth') === 'true') return true;

    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    if (key === ACCESS_KEY) {
      sessionStorage.setItem('hc_auth', 'true');
      // Clean URL — remove key from browser history
      const cleanUrl = window.location.pathname + (window.location.hash || '');
      window.history.replaceState({}, '', cleanUrl);
      return true;
    }

    return false;
  },

  // Initialize the app
  init() {
    // Auth gate
    if (!this.checkAuth()) {
      // Leave decoy visible, don't start the app
      return;
    }

    // Authenticated — reveal the app, hide decoy
    const decoy = document.getElementById('decoy-page');
    const shell = document.getElementById('app-shell');
    if (decoy) decoy.style.display = 'none';
    if (shell) shell.style.display = 'block';
    document.title = 'Health Council';

    try {
      document.querySelector('link[rel="icon"]').href =
        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏛️</text></svg>";
    } catch(e) {}

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.navigate());

    // FAB toggle
    const fab = document.getElementById('fab');
    const fabMenu = document.getElementById('fab-menu');
    if (fab) {
      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        fabMenu.style.display = fabMenu.style.display === 'none' ? 'flex' : 'none';
      });
      document.addEventListener('click', () => {
        fabMenu.style.display = 'none';
      });
      fabMenu.addEventListener('click', () => {
        fabMenu.style.display = 'none';
      });
    }

    // Initial navigation
    if (!Utils.isOnboarded()) {
      window.location.hash = '#/onboarding';
    } else if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#') {
      window.location.hash = '#/dashboard';
    }

    this.navigate();
  },

  // Navigate to current hash route
  async navigate() {
    const hash = window.location.hash.slice(2) || 'dashboard';
    const route = hash.split('/').filter(Boolean);
    const pageName = route[0];
    const subRoute = route.slice(1).join('/');

    // Find matching page
    let fullRoute = route.join('/');
    let page = this.pages[fullRoute] || this.pages[pageName];

    if (!page) {
      if (Utils.isOnboarded()) {
        window.location.hash = '#/dashboard';
      } else {
        window.location.hash = '#/onboarding';
      }
      return;
    }

    // Update nav state
    this.updateNav(pageName);

    // Show/hide nav and FAB
    const isOnboarding = pageName === 'onboarding';
    document.getElementById('bottom-nav').style.display = isOnboarding ? 'none' : 'flex';
    document.getElementById('fab').style.display = isOnboarding ? 'none' : 'flex';

    // Render page
    const app = document.getElementById('app');
    this.currentRoute = fullRoute;

    if (page.render) {
      try {
        const content = await page.render(subRoute);
        if (typeof content === 'string') {
          app.innerHTML = content;
        }
      } catch (err) {
        console.error('Render error for', fullRoute, err);
        app.innerHTML = '<div class="page"><div class="alert alert-danger">Error loading page. Check console for details.</div></div>';
      }
      // Bind events after render
      if (page.afterRender) {
        requestAnimationFrame(() => {
          try { page.afterRender(subRoute); }
          catch (err) { console.error('afterRender error for', fullRoute, err); }
        });
      }
    }
  },

  // Update active nav item
  updateNav(route) {
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemRoute = item.dataset.route;
      item.classList.toggle('active', itemRoute === route ||
        (route && route.startsWith('log') && itemRoute === 'log'));
    });
  },

  // Navigate programmatically
  go(route) {
    window.location.hash = '#/' + route;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
