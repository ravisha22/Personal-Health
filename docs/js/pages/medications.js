App.register('medications', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Medications</h1>
          <p class="page-subtitle">Manage medications and track adherence</p>
        </div>

        ${Safety.renderDisclaimer()}

        <!-- Today's Adherence -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Today's Medications</h3>
            <div class="text-sm text-muted">${Utils.displayDate(new Date())}</div>
          </div>
          <div class="card-body">
            <div id="todays-adherence">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Active Medications -->
        <div class="card mb-4">
          <div class="card-header">
            <div class="flex justify-between items-center">
              <h3 class="card-title">Active Medications</h3>
              <button id="add-medication-btn" class="btn btn-primary btn-sm">Add Medication</button>
            </div>
          </div>
          <div class="card-body">
            <div id="medications-list">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Add Medication Modal -->
        <div id="medication-modal" class="modal" style="display: none;">
          <div class="modal-content">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Add Medication</h3>
              </div>
              <div class="card-body">
                <form id="medication-form">
                  <div class="form-group">
                    <label class="form-label">Medication Name *</label>
                    <input type="text" id="med-name" class="form-input" required>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Dose *</label>
                      <input type="text" id="med-dose" class="form-input" placeholder="e.g., 10mg" required>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Frequency *</label>
                      <select id="med-frequency" class="form-select" required>
                        <option value="">Select...</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="As needed">As needed</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Condition/Purpose</label>
                    <input type="text" id="med-condition" class="form-input" placeholder="e.g., High blood pressure">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Schedule</label>
                    <input type="text" id="med-schedule" class="form-input" placeholder="e.g., Morning with breakfast">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="date" id="med-start-date" class="form-input">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea id="med-notes" class="form-textarea" rows="2"></textarea>
                  </div>

                  <div class="form-row mt-4">
                    <button type="button" id="cancel-medication" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Medication</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Dose Change Modal -->
        <div id="dose-change-modal" class="modal" style="display: none;">
          <div class="modal-content">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Record Dose Change</h3>
              </div>
              <div class="card-body">
                <form id="dose-change-form">
                  <input type="hidden" id="dose-med-id">
                  
                  <div class="form-group">
                    <label class="form-label">Medication</label>
                    <div id="dose-med-name" class="form-input" style="background: #f5f5f5;" readonly></div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Previous Dose</label>
                      <div id="dose-old" class="form-input" style="background: #f5f5f5;" readonly></div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">New Dose *</label>
                      <input type="text" id="dose-new" class="form-input" required>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Date of Change</label>
                    <input type="date" id="dose-change-date" class="form-input" required>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Reason for Change</label>
                    <textarea id="dose-reason" class="form-textarea" rows="2" placeholder="e.g., Doctor recommendation, side effects"></textarea>
                  </div>

                  <div class="form-row mt-4">
                    <button type="button" id="cancel-dose-change" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Record Change</button>
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
    await this.loadTodayAdherence();
    await this.loadMedications();
    this.bindEvents();
  },

  async loadTodayAdherence() {
    const adherence = await Store.getTodayAdherence();
    const activeMeds = await Store.getActiveMeds();
    const container = document.getElementById('todays-adherence');

    if (activeMeds.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💊</div>
          <div class="empty-state-text">No medications yet</div>
          <div class="empty-state-hint">Add your medications to start tracking adherence</div>
        </div>
      `;
      return;
    }

    const today = Utils.dateStr(new Date());
    container.innerHTML = activeMeds.map(med => {
      const taken = adherence.some(a => a.medicationId === med.id && a.date === today);
      return `
        <div class="form-check mb-2">
          <input type="checkbox" id="adherence-${med.id}" class="form-check-input adherence-check" 
                 data-med-id="${med.id}" ${taken ? 'checked' : ''}>
          <label for="adherence-${med.id}" class="form-check-label">
            <div class="font-semibold">${Utils.escapeHtml(med.name)}</div>
            <div class="text-sm text-muted">${Utils.escapeHtml(med.dose)} - ${Utils.escapeHtml(med.frequency)}</div>
            ${med.schedule ? `<div class="text-xs text-muted">${Utils.escapeHtml(med.schedule)}</div>` : ''}
          </label>
        </div>
      `;
    }).join('');
  },

  async loadMedications() {
    const medications = await Store.getActiveMeds();
    const container = document.getElementById('medications-list');

    if (medications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💊</div>
          <div class="empty-state-text">No medications added</div>
          <div class="empty-state-hint">Add your first medication to start tracking</div>
        </div>
      `;
      return;
    }

    container.innerHTML = medications.map(med => this.renderMedicationCard(med)).join('');
  },

  renderMedicationCard(med) {
    return `
      <div class="section-list-item mb-3" data-med-id="${med.id}">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-semibold">${Utils.escapeHtml(med.name)}</div>
            <div class="text-sm text-muted">
              ${Utils.escapeHtml(med.dose)} • ${Utils.escapeHtml(med.frequency)}
            </div>
            ${med.condition ? `<div class="text-xs text-muted">For: ${Utils.escapeHtml(med.condition)}</div>` : ''}
            ${med.schedule ? `<div class="text-xs text-muted">${Utils.escapeHtml(med.schedule)}</div>` : ''}
          </div>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-ghost dose-change-btn" data-med-id="${med.id}">
              Dose Change
            </button>
            <button class="btn btn-sm btn-danger stop-med-btn" data-med-id="${med.id}">
              Stop
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    // Add medication button
    document.getElementById('add-medication-btn').addEventListener('click', () => {
      this.showMedicationModal();
    });

    // Modal controls
    document.getElementById('cancel-medication').addEventListener('click', () => {
      this.hideMedicationModal();
    });

    document.getElementById('cancel-dose-change').addEventListener('click', () => {
      this.hideDoseChangeModal();
    });

    // Form submissions
    document.getElementById('medication-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveMedication();
    });

    document.getElementById('dose-change-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveDoseChange();
    });

    // Adherence checkboxes
    document.addEventListener('change', async (e) => {
      if (e.target.classList.contains('adherence-check')) {
        const medId = e.target.dataset.medId;
        const taken = e.target.checked;
        const today = Utils.dateStr(new Date());

        if (taken) {
          await Store.add('adherence', {
            id: Utils.uid(),
            medicationId: medId,
            date: today,
            time: new Date().toTimeString().slice(0, 5),
            createdAt: new Date().toISOString()
          });
        } else {
          const existing = await Store.getByDate('adherence', today);
          const adherenceRecord = existing.find(a => a.medicationId === medId);
          if (adherenceRecord) {
            await Store.delete('adherence', adherenceRecord.id);
          }
        }
      }
    });

    // Medication actions
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('dose-change-btn')) {
        const medId = e.target.dataset.medId;
        this.showDoseChangeModal(medId);
      }

      if (e.target.classList.contains('stop-med-btn')) {
        const medId = e.target.dataset.medId;
        if (confirm('Are you sure you want to stop this medication? This will mark it as inactive.')) {
          await Store.update('medications', medId, { 
            status: 'inactive',
            stoppedAt: new Date().toISOString()
          });
          Utils.toast('Medication stopped');
          this.loadMedications();
          this.loadTodayAdherence();
        }
      }
    });

    // Modal click outside to close
    document.getElementById('medication-modal').addEventListener('click', (e) => {
      if (e.target.id === 'medication-modal') {
        this.hideMedicationModal();
      }
    });

    document.getElementById('dose-change-modal').addEventListener('click', (e) => {
      if (e.target.id === 'dose-change-modal') {
        this.hideDoseChangeModal();
      }
    });
  },

  showMedicationModal() {
    document.getElementById('medication-modal').style.display = 'block';
    document.getElementById('med-name').focus();
  },

  hideMedicationModal() {
    document.getElementById('medication-modal').style.display = 'none';
    document.getElementById('medication-form').reset();
  },

  async showDoseChangeModal(medId) {
    const medications = await Store.getActiveMeds();
    const med = medications.find(m => m.id === medId);
    
    if (!med) return;

    document.getElementById('dose-med-id').value = medId;
    document.getElementById('dose-med-name').textContent = med.name;
    document.getElementById('dose-old').textContent = med.dose;
    document.getElementById('dose-change-date').value = Utils.dateStr(new Date());
    
    document.getElementById('dose-change-modal').style.display = 'block';
    document.getElementById('dose-new').focus();
  },

  hideDoseChangeModal() {
    document.getElementById('dose-change-modal').style.display = 'none';
    document.getElementById('dose-change-form').reset();
  },

  async saveMedication() {
    const medData = {
      id: Utils.uid(),
      name: document.getElementById('med-name').value,
      dose: document.getElementById('med-dose').value,
      frequency: document.getElementById('med-frequency').value,
      condition: document.getElementById('med-condition').value,
      schedule: document.getElementById('med-schedule').value,
      startDate: document.getElementById('med-start-date').value || Utils.dateStr(new Date()),
      notes: document.getElementById('med-notes').value,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await Store.add('medications', medData);
    Utils.toast('Medication added successfully!');
    this.hideMedicationModal();
    this.loadMedications();
    this.loadTodayAdherence();
  },

  async saveDoseChange() {
    const medId = document.getElementById('dose-med-id').value;
    const oldDose = document.getElementById('dose-old').textContent;
    const newDose = document.getElementById('dose-new').value;
    const changeDate = document.getElementById('dose-change-date').value;
    const reason = document.getElementById('dose-reason').value;

    // Record dose change history
    await Store.add('doseChanges', {
      id: Utils.uid(),
      medicationId: medId,
      oldDose: oldDose,
      newDose: newDose,
      changeDate: changeDate,
      reason: reason,
      createdAt: new Date().toISOString()
    });

    // Update medication with new dose
    await Store.update('medications', medId, { dose: newDose });

    Utils.toast('Dose change recorded');
    this.hideDoseChangeModal();
    this.loadMedications();
    this.loadTodayAdherence();
  }
});