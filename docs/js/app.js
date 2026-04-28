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
  async init() {
    // Auth gate
    if (!this.checkAuth()) {
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

    // Auto-provision profile if not onboarded — must complete before navigation
    await this.ensureProfile();

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
    } else if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#' || window.location.hash === '#/dashboard') {
      window.location.hash = '#/today';
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

  // Auto-provision profile from intake data — skip onboarding entirely
  async ensureProfile() {
    if (Utils.isOnboarded()) return;

    try {
      await Store.saveProfile({
        name: 'Ravi',
        dob: '1983-12-01',
        height: '180',
        gender: 'male',
        units: 'metric',
        conditions: ['Gout', 'High Cholesterol', 'Hypertension'],
        primaryGoal: 'Sustainable Weight Loss',
        exerciseLimitations: 'Gout in left ankle and right knee — avoid twisting motions. Abundance of caution with these joints.',
        doctorClearance: true,
        preferredExerciseTime: 'Flexible',
        currentWeight: 133,
        checkinFrequency: 'daily',
        pastChallenges: 'Job stress, busy schedule, laziness, addictive eating patterns. Weekend overeating. Phone disrupting sleep.',
        doctors: [
          { name: 'GP', specialty: 'GP', nextAppt: '' },
          { name: 'Rheumatologist', specialty: 'Rheumatologist', nextAppt: '' },
          { name: 'Cardiologist', specialty: 'Cardiologist', nextAppt: '' }
        ]
      });

      // Medications
      var meds = [
        { name: 'Tazloc-AM', dose: '1 tablet', condition: 'Hypertension', schedule: 'Morning', active: 1, doseHistory: [{ date: Utils.dateStr(), dose: '1 tablet', reason: 'Initial' }] },
        { name: 'Allopurinol', dose: '600mg', condition: 'Gout', schedule: 'Morning', active: 1, doseHistory: [{ date: Utils.dateStr(), dose: '600mg', reason: 'Initial' }] },
        { name: 'Nebistar', dose: '5mg', condition: 'Hypertension', schedule: 'Night', active: 1, doseHistory: [{ date: Utils.dateStr(), dose: '5mg', reason: 'Initial' }] },
        { name: 'Lipaglyn', dose: '1 tablet', condition: 'High Cholesterol', schedule: 'Night', active: 1, doseHistory: [{ date: Utils.dateStr(), dose: '1 tablet', reason: 'Initial' }] }
      ];
      for (var i = 0; i < meds.length; i++) {
        await Store.add('medications', meds[i]);
      }

      // Initial weight vital
      await Store.addVital({ type: 'weight', value: 133, displayValue: 133, displayUnit: 'kg', date: Utils.dateStr() });

      // Initial BP
      await Store.addVital({ type: 'bp', systolic: 125, diastolic: 85, date: Utils.dateStr() });

      // Set program start date
      Utils.setSetting('program_start_date', Utils.dateStr());
      Utils.setSetting('units', 'metric');
      Utils.setSetting('onboarded', true);

    } catch(e) {
      console.error('Auto-provision error:', e);
    }
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
