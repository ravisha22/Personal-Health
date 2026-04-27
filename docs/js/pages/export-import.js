App.register('export-import', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Export/Import Data</h1>
          <p class="page-subtitle">Backup and restore your health data</p>
        </div>

        <!-- Data Overview -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Data Overview</h3>
          </div>
          <div class="card-body">
            <div id="data-overview">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Export Section -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Export Data</h3>
            <div class="text-sm text-muted">Create a backup of all your health data</div>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <div class="text-sm text-muted mb-2">
                Last export: <span id="last-export-date">Never</span>
              </div>
              <div class="text-sm text-muted">
                Estimated file size: <span id="estimated-size">Calculating...</span>
              </div>
            </div>
            
            <button id="export-data-btn" class="btn btn-primary">
              📁 Export All Data
            </button>
            
            <div class="mt-3 text-sm text-muted">
              This will download a JSON file containing all your health data. 
              Store this file securely as it contains personal health information.
            </div>
          </div>
        </div>

        <!-- Import Section -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Import Data</h3>
            <div class="text-sm text-muted">Restore data from a backup file</div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label for="import-file" class="form-label">Select backup file</label>
              <input type="file" id="import-file" class="form-input" accept=".json" />
              <div class="form-hint">Only JSON backup files from this app are supported</div>
            </div>
            
            <div class="form-group">
              <div class="form-check">
                <input type="radio" id="import-merge" name="import-mode" value="merge" class="form-check-input" checked>
                <label for="import-merge" class="form-check-label">
                  <strong>Merge with existing data</strong>
                  <div class="text-sm text-muted">Add imported data to current data (recommended)</div>
                </label>
              </div>
              
              <div class="form-check">
                <input type="radio" id="import-replace" name="import-mode" value="replace" class="form-check-input">
                <label for="import-replace" class="form-check-label">
                  <strong>Replace all data</strong>
                  <div class="text-sm text-muted text-danger">⚠️ This will delete all current data</div>
                </label>
              </div>
            </div>
            
            <button id="import-data-btn" class="btn btn-secondary" disabled>
              📥 Import Data
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title text-danger">⚠️ Danger Zone</h3>
            <div class="text-sm text-muted">Irreversible actions - proceed with caution</div>
          </div>
          <div class="card-body">
            <div class="alert alert-danger mb-4">
              <strong>Warning:</strong> The following action will permanently delete ALL your health data. 
              This cannot be undone. Make sure you have exported your data first if you want to keep it.
            </div>
            
            <button id="clear-all-btn" class="btn btn-danger">
              🗑️ Clear All Data
            </button>
            
            <div class="mt-3 text-sm text-muted">
              This will delete all health records, goals, medications, and settings. 
              You will need to set up the app again from scratch.
            </div>
          </div>
        </div>

        <!-- Import Status Modal -->
        <div id="import-status-modal" class="modal" style="display: none;">
          <div class="modal-content">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Import Status</h3>
              </div>
              <div class="card-body">
                <div id="import-status-content">
                  <!-- Populated during import -->
                </div>
                <div class="mt-4">
                  <button id="close-status-modal" class="btn btn-primary">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    await this.loadDataOverview();
    await this.updateLastExportDate();
    await this.estimateDataSize();
    this.bindEvents();
  },

  async loadDataOverview() {
    try {
      const allData = await Store.exportAll();
      const container = document.getElementById('data-overview');
      
      const tableStats = Object.entries(allData).map(([table, entries]) => ({
        table: table,
        count: Array.isArray(entries) ? entries.length : 0,
        label: this.getTableLabel(table)
      })).filter(stat => stat.count > 0);

      if (tableStats.length === 0) {
        container.innerHTML = `
          <div class="text-center text-muted">
            <div>📊 No data recorded yet</div>
            <div class="text-sm mt-1">Start using the app to build your health data</div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-2 gap-3">
          ${tableStats.map(stat => `
            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span class="text-sm">${stat.label}</span>
              <span class="font-semibold">${stat.count}</span>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      document.getElementById('data-overview').innerHTML = `
        <div class="text-danger text-sm">Error loading data overview</div>
      `;
    }
  },

  getTableLabel(tableName) {
    const labels = {
      weight: 'Weight entries',
      bloodPressure: 'BP readings',
      pain: 'Pain logs',
      hydration: 'Hydration logs',
      medications: 'Medications',
      adherence: 'Medication doses',
      goals: 'Goals',
      labs: 'Lab results',
      doseChanges: 'Dose changes',
      profile: 'Profile data',
      settings: 'App settings'
    };
    return labels[tableName] || tableName;
  },

  async updateLastExportDate() {
    const lastExport = Utils.getSetting('lastExportDate');
    const element = document.getElementById('last-export-date');
    
    if (lastExport) {
      element.textContent = Utils.displayDate(new Date(lastExport));
    } else {
      element.textContent = 'Never';
    }
  },

  async estimateDataSize() {
    try {
      const allData = await Store.exportAll();
      const jsonString = JSON.stringify(allData);
      const sizeBytes = new Blob([jsonString]).size;
      const sizeKB = Math.round(sizeBytes / 1024);
      
      document.getElementById('estimated-size').textContent = 
        sizeKB < 1 ? '< 1 KB' : `${sizeKB} KB`;
    } catch (error) {
      document.getElementById('estimated-size').textContent = 'Unknown';
    }
  },

  async exportData() {
    try {
      Utils.toast('Preparing export...');
      
      const allData = await Store.exportAll();
      const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        data: allData
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-data-backup-${Utils.dateStr(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      // Update last export date
      Utils.setSetting('lastExportDate', new Date().toISOString());
      await this.updateLastExportDate();
      
      Utils.toast('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Utils.toast('Export failed. Please try again.');
    }
  },

  async importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
      Utils.toast('Please select a file first');
      return;
    }

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid backup file format');
      }
      
      const mode = document.querySelector('input[name="import-mode"]:checked').value;
      
      this.showImportStatus('Starting import...');
      
      if (mode === 'replace') {
        this.updateImportStatus('Clearing existing data...');
        await Store.clearAll();
      }
      
      const tables = Object.keys(importData.data);
      let processed = 0;
      
      for (const table of tables) {
        const entries = importData.data[table];
        if (Array.isArray(entries) && entries.length > 0) {
          this.updateImportStatus(`Importing ${table}... (${entries.length} entries)`);
          
          for (const entry of entries) {
            try {
              if (mode === 'merge' && entry.id) {
                // Check if entry already exists
                const existing = await Store.getAll(table);
                const existingEntry = existing.find(e => e.id === entry.id);
                if (existingEntry) {
                  await Store.update(table, entry.id, entry);
                } else {
                  await Store.add(table, entry);
                }
              } else {
                await Store.add(table, entry);
              }
            } catch (entryError) {
              console.warn(`Failed to import entry in ${table}:`, entryError);
            }
          }
          processed++;
        }
      }
      
      this.updateImportStatus(`Import completed! Processed ${processed} tables.`, true);
      
      // Refresh data overview
      setTimeout(() => {
        this.loadDataOverview();
        this.estimateDataSize();
      }, 1000);
      
    } catch (error) {
      console.error('Import error:', error);
      this.updateImportStatus(`Import failed: ${error.message}`, true);
    }
  },

  showImportStatus(message) {
    document.getElementById('import-status-content').innerHTML = `
      <div class="text-center">
        <div class="mb-3">📥</div>
        <div id="status-message">${message}</div>
        <div id="status-complete" style="display: none;">
          <button onclick="window.location.reload()" class="btn btn-primary mt-3">
            Reload App
          </button>
        </div>
      </div>
    `;
    document.getElementById('import-status-modal').style.display = 'block';
  },

  updateImportStatus(message, isComplete = false) {
    document.getElementById('status-message').textContent = message;
    if (isComplete) {
      document.getElementById('status-complete').style.display = 'block';
    }
  },

  async clearAllData() {
    const confirmText = 'DELETE ALL MY DATA';
    const userInput = prompt(
      `This will permanently delete ALL your health data.\n\nTo confirm, type: ${confirmText}`
    );
    
    if (userInput !== confirmText) {
      Utils.toast('Data deletion cancelled');
      return;
    }
    
    const finalConfirm = confirm(
      'Are you absolutely sure? This cannot be undone!\n\nClick OK to permanently delete all data.'
    );
    
    if (finalConfirm) {
      try {
        await Store.clearAll();
        Utils.toast('All data has been cleared');
        
        // Reload the page to reset the app state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } catch (error) {
        console.error('Clear data error:', error);
        Utils.toast('Failed to clear data. Please try again.');
      }
    }
  },

  bindEvents() {
    // Export button
    document.getElementById('export-data-btn').addEventListener('click', () => {
      this.exportData();
    });

    // File input change
    document.getElementById('import-file').addEventListener('change', (e) => {
      const importBtn = document.getElementById('import-data-btn');
      importBtn.disabled = !e.target.files[0];
    });

    // Import button
    document.getElementById('import-data-btn').addEventListener('click', () => {
      this.importData();
    });

    // Clear all data button
    document.getElementById('clear-all-btn').addEventListener('click', () => {
      this.clearAllData();
    });

    // Modal close
    document.getElementById('close-status-modal').addEventListener('click', () => {
      document.getElementById('import-status-modal').style.display = 'none';
    });

    // Modal click outside to close
    document.getElementById('import-status-modal').addEventListener('click', (e) => {
      if (e.target.id === 'import-status-modal') {
        document.getElementById('import-status-modal').style.display = 'none';
      }
    });
  }
});