// more.js — Navigation hub with correct routes
App.register('more', {
  render: function() {
    return '<div class="page">' +
      '<div class="page-header"><h1 class="page-title">More</h1>' +
      '<p class="page-subtitle">Profile, tools and settings</p></div>' +

      // My Profile
      '<div class="card mb-4">' +
      '<div class="card-header"><h3 class="card-title">My Health</h3></div>' +
      '<div class="section-list">' +
        '<a href="#/profile" class="section-list-item">' +
          '<div class="section-list-icon">👤</div>' +
          '<div class="section-list-label"><div class="font-semibold">My Health Profile</div>' +
          '<div class="text-sm text-muted">Personal info, conditions, physicals, doctors</div></div>' +
          '<div class="section-list-chevron">\u203A</div></a>' +
        '<a href="#/medications" class="section-list-item">' +
          '<div class="section-list-icon">💊</div>' +
          '<div class="section-list-label"><div class="font-semibold">Medications</div>' +
          '<div class="text-sm text-muted">Manage medications and track adherence</div></div>' +
          '<div class="section-list-chevron">\u203A</div></a>' +
        '<a href="#/labs" class="section-list-item">' +
          '<div class="section-list-icon">🔬</div>' +
          '<div class="section-list-label"><div class="font-semibold">Lab Results</div>' +
          '<div class="text-sm text-muted">Track lab values and trends</div></div>' +
          '<div class="section-list-chevron">\u203A</div></a>' +
      '</div></div>' +

      // Information
      '<div class="card mb-4">' +
      '<div class="card-header"><h3 class="card-title">Information</h3></div>' +
      '<div class="section-list">' +
        '<a href="#/reference" class="section-list-item">' +
          '<div class="section-list-icon">📚</div>' +
          '<div class="section-list-label"><div class="font-semibold">Reference Guide</div>' +
          '<div class="text-sm text-muted">Purine guide, drug interactions, pain scales</div></div>' +
          '<div class="section-list-chevron">\u203A</div></a>' +
        '<a href="#/doctor-export" class="section-list-item">' +
          '<div class="section-list-icon">📋</div>' +
          '<div class="section-list-label"><div class="font-semibold">Doctor Export</div>' +
          '<div class="text-sm text-muted">Generate visit summary for your doctor</div></div>' +
          '<div class="section-list-chevron">\u203A</div></a>' +
      '</div></div>' +

      // Data & Settings
      '<div class="card mb-4">' +
      '<div class="card-header"><h3 class="card-title">Data & Settings</h3></div>' +
      '<div class="section-list">' +
        '<a href="#/export-import" class="section-list-item">' +
          '<div class="section-list-icon">💾</div>' +
          '<div class="section-list-label"><div class="font-semibold">Export / Import Data</div>' +
          '<div class="text-sm text-muted">Backup and restore your health data</div></div>' +
          '<div class="section-list-chevron">\u203A</div></a>' +
        '<a href="#/settings" class="section-list-item">' +
          '<div class="section-list-icon">⚙️</div>' +
          '<div class="section-list-label"><div class="font-semibold">Settings</div>' +
          '<div class="text-sm text-muted">Units, theme, preferences</div></div>' +
          '<div class="section-list-chevron">\u203A</div></a>' +
      '</div></div>' +

      '<div class="card"><div class="text-center text-muted">' +
        '<div class="text-sm">Health Council v1.0</div>' +
        '<div class="text-xs mt-2">All data stored locally on your device</div>' +
      '</div></div>' +
    '</div>';
  },
  afterRender: function() {}
});
