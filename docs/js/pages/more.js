App.register('more', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">More</h1>
          <p class="page-subtitle">Additional tools and settings</p>
        </div>

        <!-- Health Management -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Health Management</h3>
          </div>
          <div class="card-body">
            <div class="section-list">
              <a href="#medications" class="section-list-item">
                <div class="section-list-icon">💊</div>
                <div class="section-list-label">
                  <div class="font-semibold">Medications</div>
                  <div class="text-sm text-muted">Manage medications and track adherence</div>
                </div>
                <div class="section-list-chevron">›</div>
              </a>
              
              <a href="#labs" class="section-list-item">
                <div class="section-list-icon">🔬</div>
                <div class="section-list-label">
                  <div class="font-semibold">Lab Results</div>
                  <div class="text-sm text-muted">Track lab values and trends</div>
                </div>
                <div class="section-list-chevron">›</div>
              </a>
            </div>
          </div>
        </div>

        <!-- Information & Export -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Information & Export</h3>
          </div>
          <div class="card-body">
            <div class="section-list">
              <a href="#reference" class="section-list-item">
                <div class="section-list-icon">📚</div>
                <div class="section-list-label">
                  <div class="font-semibold">Reference Guide</div>
                  <div class="text-sm text-muted">Purine guide, drug interactions, pain scales</div>
                </div>
                <div class="section-list-chevron">›</div>
              </a>
              
              <a href="#doctor-export" class="section-list-item">
                <div class="section-list-icon">📋</div>
                <div class="section-list-label">
                  <div class="font-semibold">Doctor Export</div>
                  <div class="text-sm text-muted">Generate visit summary for healthcare provider</div>
                </div>
                <div class="section-list-chevron">›</div>
              </a>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Data Management</h3>
          </div>
          <div class="card-body">
            <div class="section-list">
              <a href="#export-import" class="section-list-item">
                <div class="section-list-icon">💾</div>
                <div class="section-list-label">
                  <div class="font-semibold">Export/Import Data</div>
                  <div class="text-sm text-muted">Backup and restore your health data</div>
                </div>
                <div class="section-list-chevron">›</div>
              </a>
              
              <a href="#settings" class="section-list-item">
                <div class="section-list-icon">⚙️</div>
                <div class="section-list-label">
                  <div class="font-semibold">Settings</div>
                  <div class="text-sm text-muted">App preferences and configuration</div>
                </div>
                <div class="section-list-chevron">›</div>
              </a>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-2 gap-3">
              <button id="quick-pain-log" class="btn btn-ghost text-left">
                <div>🩹 Log Pain</div>
                <div class="text-xs text-muted mt-1">Quick pain entry</div>
              </button>
              
              <button id="quick-weight-log" class="btn btn-ghost text-left">
                <div>⚖️ Log Weight</div>
                <div class="text-xs text-muted mt-1">Record weight</div>
              </button>
              
              <button id="quick-bp-log" class="btn btn-ghost text-left">
                <div>🩺 Log BP</div>
                <div class="text-xs text-muted mt-1">Blood pressure entry</div>
              </button>
              
              <button id="quick-hydration-log" class="btn btn-ghost text-left">
                <div>💧 Log Hydration</div>
                <div class="text-xs text-muted mt-1">Water intake</div>
              </button>
            </div>
          </div>
        </div>
        
        <!-- App Info -->
        <div class="card">
          <div class="card-body">
            <div class="text-center text-muted">
              <div class="text-sm">Personal Health Tracker</div>
              <div class="text-xs mt-1">Version 1.0.0 • Made for personal health management</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    this.bindEvents();
  },

  bindEvents() {
    // Quick action buttons
    document.getElementById('quick-pain-log').addEventListener('click', () => {
      window.location.hash = '#pain';
      // Focus on pain severity input when arriving at pain page
      setTimeout(() => {
        const severityInput = document.getElementById('pain-severity');
        if (severityInput) severityInput.focus();
      }, 100);
    });

    document.getElementById('quick-weight-log').addEventListener('click', () => {
      window.location.hash = '#weight';
      setTimeout(() => {
        const weightInput = document.getElementById('weight-value');
        if (weightInput) weightInput.focus();
      }, 100);
    });

    document.getElementById('quick-bp-log').addEventListener('click', () => {
      window.location.hash = '#bp';
      setTimeout(() => {
        const systolicInput = document.getElementById('bp-systolic');
        if (systolicInput) systolicInput.focus();
      }, 100);
    });

    document.getElementById('quick-hydration-log').addEventListener('click', () => {
      window.location.hash = '#hydration';
      setTimeout(() => {
        const amountInput = document.getElementById('hydration-amount');
        if (amountInput) amountInput.focus();
      }, 100);
    });

    // Navigation links - these work automatically via hash routing
    // No additional JavaScript needed for the section-list-item links
  }
});