App.register('labs', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Lab Results</h1>
          <p class="page-subtitle">Track your lab values and trends</p>
        </div>

        <!-- Recent Labs Overview -->
        <div class="card mb-4">
          <div class="card-header">
            <div class="flex justify-between items-center">
              <h3 class="card-title">Recent Results</h3>
              <button id="add-lab-btn" class="btn btn-primary btn-sm">Add Lab Result</button>
            </div>
          </div>
          <div class="card-body">
            <div id="recent-labs">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Lab History -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Lab History</h3>
          </div>
          <div class="card-body">
            <div id="lab-history">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Add Lab Modal -->
        <div id="lab-modal" class="modal" style="display: none;">
          <div class="modal-content">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Add Lab Result</h3>
              </div>
              <div class="card-body">
                <form id="lab-form">
                  <div class="form-group">
                    <label for="lab-date" class="form-label">Date *</label>
                    <input type="date" id="lab-date" class="form-input" required>
                  </div>

                  <div class="form-group">
                    <label for="lab-panel" class="form-label">Panel Type *</label>
                    <select id="lab-panel" class="form-select" required>
                      <option value="">Select panel type...</option>
                      <option value="Lipid Panel">Lipid Panel</option>
                      <option value="Basic Metabolic">Basic Metabolic Panel</option>
                      <option value="Comprehensive Metabolic">Comprehensive Metabolic Panel</option>
                      <option value="Uric Acid">Uric Acid</option>
                      <option value="Thyroid">Thyroid Panel</option>
                      <option value="Liver Function">Liver Function</option>
                      <option value="Kidney Function">Kidney Function</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <!-- Dynamic fields based on panel type -->
                  <div id="lab-fields">
                    <!-- Populated by JavaScript -->
                  </div>

                  <div class="form-group">
                    <label for="lab-notes" class="form-label">Notes</label>
                    <textarea id="lab-notes" class="form-textarea" rows="2" 
                              placeholder="Doctor comments, reference ranges, etc."></textarea>
                  </div>

                  <div class="form-row mt-4">
                    <button type="button" id="cancel-lab" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Lab Result</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    await this.loadRecentLabs();
    await this.loadLabHistory();
    this.bindEvents();
    
    // Set default date to today
    document.getElementById('lab-date').value = Utils.dateStr(new Date());
  },

  async loadRecentLabs() {
    const recentLabs = await Store.getLatest('labs', 5);
    const container = document.getElementById('recent-labs');

    if (recentLabs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔬</div>
          <div class="empty-state-text">No lab results yet</div>
          <div class="empty-state-hint">Add your first lab result to start tracking</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="grid gap-3">
        ${recentLabs.map(lab => this.renderLabCard(lab, true)).join('')}
      </div>
    `;
  },

  async loadLabHistory() {
    const allLabs = await Store.getAll('labs');
    const labsByDate = allLabs.sort((a, b) => new Date(b.date) - new Date(a.date));
    const container = document.getElementById('lab-history');

    if (labsByDate.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted">
          <div>No lab results in history</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-3">
        ${labsByDate.map(lab => this.renderLabCard(lab, false)).join('')}
      </div>
    `;
  },

  renderLabCard(lab, isRecent = false) {
    const values = this.formatLabValues(lab);
    const flags = this.checkAbnormalValues(lab);

    return `
      <div class="border rounded p-4 ${isRecent ? 'bg-blue-50' : ''}">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-semibold">${lab.panelType}</h4>
            <div class="text-sm text-muted">${Utils.displayDate(lab.date)}</div>
          </div>
          <div class="flex gap-2">
            ${flags.length > 0 ? `<span class="tag tag-red">${flags.length} abnormal</span>` : ''}
            <button class="btn btn-sm btn-ghost view-details" data-lab-id="${lab.id}">
              Details
            </button>
          </div>
        </div>

        <div class="space-y-2">
          ${values.map(value => `
            <div class="flex justify-between text-sm">
              <span class="text-muted">${value.name}:</span>
              <span class="${value.flag ? 'font-semibold ' + value.flagColor : ''}">${value.display}</span>
            </div>
          `).join('')}
        </div>

        ${lab.notes ? `
          <div class="mt-3 pt-3 border-t">
            <div class="text-sm text-muted">${Utils.escapeHtml(lab.notes)}</div>
          </div>
        ` : ''}
      </div>
    `;
  },

  formatLabValues(lab) {
    const values = [];
    const referenceRanges = this.getReferenceRanges();

    // Lipid Panel
    if (lab.totalCholesterol) {
      values.push({
        name: 'Total Cholesterol',
        value: lab.totalCholesterol,
        display: `${lab.totalCholesterol} mg/dL`,
        flag: lab.totalCholesterol > 200,
        flagColor: lab.totalCholesterol > 240 ? 'text-danger' : lab.totalCholesterol > 200 ? 'text-warning' : 'text-success'
      });
    }

    if (lab.ldl) {
      values.push({
        name: 'LDL',
        value: lab.ldl,
        display: `${lab.ldl} mg/dL`,
        flag: lab.ldl > 100,
        flagColor: lab.ldl > 160 ? 'text-danger' : lab.ldl > 130 ? 'text-warning' : 'text-success'
      });
    }

    if (lab.hdl) {
      values.push({
        name: 'HDL',
        value: lab.hdl,
        display: `${lab.hdl} mg/dL`,
        flag: lab.hdl < 40,
        flagColor: lab.hdl < 35 ? 'text-danger' : lab.hdl < 40 ? 'text-warning' : 'text-success'
      });
    }

    if (lab.triglycerides) {
      values.push({
        name: 'Triglycerides',
        value: lab.triglycerides,
        display: `${lab.triglycerides} mg/dL`,
        flag: lab.triglycerides > 150,
        flagColor: lab.triglycerides > 500 ? 'text-danger' : lab.triglycerides > 200 ? 'text-warning' : 'text-success'
      });
    }

    // Uric Acid
    if (lab.uricAcid) {
      values.push({
        name: 'Uric Acid',
        value: lab.uricAcid,
        display: `${lab.uricAcid} mg/dL`,
        flag: lab.uricAcid > 6.0,
        flagColor: lab.uricAcid > 8.0 ? 'text-danger' : lab.uricAcid > 6.0 ? 'text-warning' : 'text-success'
      });
    }

    // Basic Metabolic
    if (lab.glucose) {
      values.push({
        name: 'Glucose',
        value: lab.glucose,
        display: `${lab.glucose} mg/dL`,
        flag: lab.glucose > 100 || lab.glucose < 70,
        flagColor: lab.glucose > 126 || lab.glucose < 60 ? 'text-danger' : 'text-warning'
      });
    }

    if (lab.creatinine) {
      values.push({
        name: 'Creatinine',
        value: lab.creatinine,
        display: `${lab.creatinine} mg/dL`,
        flag: lab.creatinine > 1.2,
        flagColor: lab.creatinine > 1.5 ? 'text-danger' : 'text-warning'
      });
    }

    if (lab.egfr) {
      values.push({
        name: 'eGFR',
        value: lab.egfr,
        display: `${lab.egfr} mL/min`,
        flag: lab.egfr < 60,
        flagColor: lab.egfr < 30 ? 'text-danger' : 'text-warning'
      });
    }

    if (lab.bun) {
      values.push({
        name: 'BUN',
        value: lab.bun,
        display: `${lab.bun} mg/dL`,
        flag: lab.bun > 20,
        flagColor: lab.bun > 40 ? 'text-danger' : 'text-warning'
      });
    }

    return values;
  },

  checkAbnormalValues(lab) {
    const flags = [];
    
    if (lab.totalCholesterol > 200) flags.push('Total Cholesterol');
    if (lab.ldl > 130) flags.push('LDL');
    if (lab.hdl < 40) flags.push('HDL');
    if (lab.triglycerides > 150) flags.push('Triglycerides');
    if (lab.uricAcid > 6.0) flags.push('Uric Acid');
    if (lab.glucose > 100 || lab.glucose < 70) flags.push('Glucose');
    if (lab.creatinine > 1.2) flags.push('Creatinine');
    if (lab.egfr < 60) flags.push('eGFR');
    if (lab.bun > 20) flags.push('BUN');
    
    return flags;
  },

  getReferenceRanges() {
    return {
      totalCholesterol: { normal: '< 200', borderline: '200-239', high: '≥ 240' },
      ldl: { optimal: '< 100', near: '100-129', borderline: '130-159', high: '160-189', veryHigh: '≥ 190' },
      hdl: { low: '< 40', normal: '≥ 40' },
      triglycerides: { normal: '< 150', borderline: '150-199', high: '200-499', veryHigh: '≥ 500' },
      uricAcid: { normal: '< 6.0', high: '≥ 6.0' },
      glucose: { normal: '70-100', impaired: '100-126', diabetes: '≥ 126' },
      creatinine: { normal: '0.6-1.2', elevated: '> 1.2' },
      egfr: { normal: '≥ 60', reduced: '< 60' },
      bun: { normal: '7-20', elevated: '> 20' }
    };
  },

  generateLabFields(panelType) {
    const fields = document.getElementById('lab-fields');
    let html = '';

    switch (panelType) {
      case 'Lipid Panel':
        html = `
          <div class="form-row">
            <div class="form-group">
              <label for="total-cholesterol" class="form-label">Total Cholesterol</label>
              <div class="form-row">
                <input type="number" id="total-cholesterol" class="form-input" step="1" placeholder="mg/dL">
                <span class="form-input-addon">mg/dL</span>
              </div>
              <div class="form-hint">Normal: < 200 mg/dL</div>
            </div>
            <div class="form-group">
              <label for="ldl" class="form-label">LDL</label>
              <div class="form-row">
                <input type="number" id="ldl" class="form-input" step="1" placeholder="mg/dL">
                <span class="form-input-addon">mg/dL</span>
              </div>
              <div class="form-hint">Optimal: < 100 mg/dL</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="hdl" class="form-label">HDL</label>
              <div class="form-row">
                <input type="number" id="hdl" class="form-input" step="1" placeholder="mg/dL">
                <span class="form-input-addon">mg/dL</span>
              </div>
              <div class="form-hint">Good: ≥ 40 mg/dL</div>
            </div>
            <div class="form-group">
              <label for="triglycerides" class="form-label">Triglycerides</label>
              <div class="form-row">
                <input type="number" id="triglycerides" class="form-input" step="1" placeholder="mg/dL">
                <span class="form-input-addon">mg/dL</span>
              </div>
              <div class="form-hint">Normal: < 150 mg/dL</div>
            </div>
          </div>
        `;
        break;

      case 'Uric Acid':
        html = `
          <div class="form-group">
            <label for="uric-acid" class="form-label">Uric Acid Level</label>
            <div class="form-row">
              <input type="number" id="uric-acid" class="form-input" step="0.1" placeholder="mg/dL">
              <span class="form-input-addon">mg/dL</span>
            </div>
            <div class="form-hint">Gout target: < 6.0 mg/dL</div>
          </div>
        `;
        break;

      case 'Basic Metabolic':
      case 'Comprehensive Metabolic':
        html = `
          <div class="form-row">
            <div class="form-group">
              <label for="glucose" class="form-label">Glucose</label>
              <div class="form-row">
                <input type="number" id="glucose" class="form-input" step="1" placeholder="mg/dL">
                <span class="form-input-addon">mg/dL</span>
              </div>
              <div class="form-hint">Normal: 70-100 mg/dL</div>
            </div>
            <div class="form-group">
              <label for="creatinine" class="form-label">Creatinine</label>
              <div class="form-row">
                <input type="number" id="creatinine" class="form-input" step="0.1" placeholder="mg/dL">
                <span class="form-input-addon">mg/dL</span>
              </div>
              <div class="form-hint">Normal: 0.6-1.2 mg/dL</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="egfr" class="form-label">eGFR</label>
              <div class="form-row">
                <input type="number" id="egfr" class="form-input" step="1" placeholder="mL/min">
                <span class="form-input-addon">mL/min</span>
              </div>
              <div class="form-hint">Normal: ≥ 60 mL/min</div>
            </div>
            <div class="form-group">
              <label for="bun" class="form-label">BUN</label>
              <div class="form-row">
                <input type="number" id="bun" class="form-input" step="1" placeholder="mg/dL">
                <span class="form-input-addon">mg/dL</span>
              </div>
              <div class="form-hint">Normal: 7-20 mg/dL</div>
            </div>
          </div>
        `;
        break;

      default:
        html = `
          <div class="form-group">
            <label for="custom-values" class="form-label">Lab Values</label>
            <textarea id="custom-values" class="form-textarea" rows="4" 
                      placeholder="Enter lab values and results here..."></textarea>
          </div>
        `;
        break;
    }

    fields.innerHTML = html;
  },

  bindEvents() {
    // Add lab button
    document.getElementById('add-lab-btn').addEventListener('click', () => {
      this.showLabModal();
    });

    // Modal controls
    document.getElementById('cancel-lab').addEventListener('click', () => {
      this.hideLabModal();
    });

    // Panel type change
    document.getElementById('lab-panel').addEventListener('change', (e) => {
      this.generateLabFields(e.target.value);
    });

    // Form submission
    document.getElementById('lab-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveLab();
    });

    // View details buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-details')) {
        const labId = e.target.dataset.labId;
        this.showLabDetails(labId);
      }
    });

    // Modal click outside to close
    document.getElementById('lab-modal').addEventListener('click', (e) => {
      if (e.target.id === 'lab-modal') {
        this.hideLabModal();
      }
    });
  },

  showLabModal() {
    document.getElementById('lab-modal').style.display = 'block';
    document.getElementById('lab-date').focus();
  },

  hideLabModal() {
    document.getElementById('lab-modal').style.display = 'none';
    document.getElementById('lab-form').reset();
    document.getElementById('lab-fields').innerHTML = '';
    document.getElementById('lab-date').value = Utils.dateStr(new Date());
  },

  async saveLab() {
    const panelType = document.getElementById('lab-panel').value;
    
    const labData = {
      id: Utils.uid(),
      date: document.getElementById('lab-date').value,
      panelType: panelType,
      notes: document.getElementById('lab-notes').value,
      createdAt: new Date().toISOString()
    };

    // Add specific values based on panel type
    const getValue = (id) => {
      const element = document.getElementById(id);
      return element ? parseFloat(element.value) || null : null;
    };

    switch (panelType) {
      case 'Lipid Panel':
        labData.totalCholesterol = getValue('total-cholesterol');
        labData.ldl = getValue('ldl');
        labData.hdl = getValue('hdl');
        labData.triglycerides = getValue('triglycerides');
        break;

      case 'Uric Acid':
        labData.uricAcid = getValue('uric-acid');
        break;

      case 'Basic Metabolic':
      case 'Comprehensive Metabolic':
        labData.glucose = getValue('glucose');
        labData.creatinine = getValue('creatinine');
        labData.egfr = getValue('egfr');
        labData.bun = getValue('bun');
        break;

      default:
        const customValues = document.getElementById('custom-values');
        if (customValues) {
          labData.customValues = customValues.value;
        }
        break;
    }

    await Store.add('labs', labData);
    Utils.toast('Lab result saved successfully!');
    this.hideLabModal();
    this.loadRecentLabs();
    this.loadLabHistory();
  },

  async showLabDetails(labId) {
    const labs = await Store.getAll('labs');
    const lab = labs.find(l => l.id === labId);
    
    if (!lab) return;

    const values = this.formatLabValues(lab);
    const ranges = this.getReferenceRanges();
    
    // For now, just show an alert with lab details
    // In a full implementation, this would show a detailed modal
    const details = values.map(v => `${v.name}: ${v.display}`).join('\n');
    alert(`Lab Details:\n\nDate: ${Utils.displayDate(lab.date)}\nPanel: ${lab.panelType}\n\n${details}\n\nNotes: ${lab.notes || 'None'}`);
  }
});