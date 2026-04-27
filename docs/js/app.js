// app.js — Router, initialization, page registry

const App = {
  currentRoute: null,
  pages: {},

  // Register a page
  register(route, page) {
    this.pages[route] = page;
  },

  // Initialize the app
  init() {
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
      // Close FAB menu when an item is clicked
      fabMenu.addEventListener('click', () => {
        fabMenu.style.display = 'none';
      });
    }

    // Initial navigation
    if (!Utils.isOnboarded()) {
      window.location.hash = '#/onboarding';
    } else if (!window.location.hash || window.location.hash === '#/') {
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
      // Default to dashboard if onboarded, else onboarding
      if (Utils.isOnboarded()) {
        window.location.hash = '#/dashboard';
        return;
      } else {
        window.location.hash = '#/onboarding';
        return;
      }
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
      const content = await page.render(subRoute);
      if (typeof content === 'string') {
        app.innerHTML = content;
      }
      // Bind events after render
      if (page.afterRender) {
        requestAnimationFrame(() => page.afterRender(subRoute));
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

// Initialize when called (not on DOMContentLoaded — security gate handles timing)
App.start = function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
};
