App.register('doctor-export', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Doctor Export</h1>
          <p class="page-subtitle">Generate summary for healthcare provider visits</p>
        </div>

        <div class="alert alert-info mb-4">
          <strong>Note:</strong> This summary contains self-reported data for discussion with your healthcare provider. 
          It should not replace professional medical assessment.
        </div>

        <!-- Date Range Selector -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Report Period</h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Time Period</label>
                <select id="date-range" class="form-select">
                  <option value="30">Last 30 days</option>
                  <option value="60">Last 60 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
              <div class="form-group">
                <button id="generate-report" class="btn btn-primary">Generate Report</button>
              </div>
            </div>
            
            <div class="mt-3">
              <button id="print-report" class="btn btn-secondary" style="display: none;">
                🖨️ Print Report
              </button>
            </div>
          </div>
        </div>

        <!-- Generated Report -->
        <div id="report-container" style="display: none;">
          <div class="card">
            <div class="card-body">
              <div id="report-content">
                <!-- Populated by JavaScript -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    this.bindEvents();
  },

  async generateReport() {
    const days = parseInt(document.getElementById('date-range').value);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const reportData = await this.collectReportData(startDate, endDate);
    this.renderReport(reportData, startDate, endDate);
    
    document.getElementById('report-container').style.display = 'block';
    document.getElementById('print-report').style.display = 'inline-block';
  },

  async collectReportData(startDate, endDate) {
    const dateStart = Utils.dateStr(startDate);
    const dateEnd = Utils.dateStr(endDate);

    const [
      weightData,
      bpData, 
      painData,
      hydrationData,
      medicationData,
      goalsData,
      labData
    ] = await Promise.all([
      Store.getByDateRange('weight', dateStart, dateEnd),
      Store.getByDateRange('bloodPressure', dateStart, dateEnd),
      Store.getByDateRange('pain', dateStart, dateEnd),
      Store.getByDateRange('hydration', dateStart, dateEnd),
      Store.getActiveMeds(),
      Store.getActiveGoals(),
      Store.getByDateRange('labs', dateStart, dateEnd)
    ]);

    // Calculate adherence for the period
    const adherenceData = await Store.getByDateRange('adherence', dateStart, dateEnd);
    
    return {
      weight: weightData,
      bloodPressure: bpData,
      pain: painData,
      hydration: hydrationData,
      medications: medicationData,
      adherence: adherenceData,
      goals: goalsData,
      labs: labData,
      period: {
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        start: startDate,
        end: endDate
      }
    };
  },

  renderReport(data, startDate, endDate) {
    const profile = Store.getProfile() || {};
    const units = Utils.getUnits();

    const reportHtml = `
      <div class="doctor-report">
        <!-- Report Header -->
        <div class="report-header mb-6">
          <h2 class="text-xl font-bold mb-2">Health Summary Report</h2>
          <div class="text-sm text-muted mb-4">
            <div><strong>Period:</strong> ${Utils.displayDate(startDate)} - ${Utils.displayDate(endDate)} (${data.period.days} days)</div>
            <div><strong>Generated:</strong> ${Utils.displayDate(new Date())}</div>
            ${profile.name ? `<div><strong>Patient:</strong> ${Utils.escapeHtml(profile.name)}</div>` : ''}
          </div>
          <div class="disclaimer text-xs text-muted border-l-4 border-gray-300 pl-3 mb-4">
            This report contains self-reported health data for discussion purposes only. 
            All information should be verified and interpreted by qualified healthcare professionals.
          </div>
        </div>

        <!-- Vital Signs Summary -->
        <div class="report-section mb-6">
          <h3 class="text-lg font-semibold mb-3 border-b pb-2">Vital Signs Trends</h3>
          
          <!-- Weight -->
          ${this.renderWeightSummary(data.weight, units)}
          
          <!-- Blood Pressure -->
          ${this.renderBPSummary(data.bloodPressure)}
        </div>

        <!-- Symptom Management -->
        <div class="report-section mb-6">
          <h3 class="text-lg font-semibold mb-3 border-b pb-2">Symptom Management</h3>
          
          <!-- Pain Summary -->
          ${this.renderPainSummary(data.pain)}
          
          <!-- Hydration -->
          ${this.renderHydrationSummary(data.hydration)}
        </div>

        <!-- Medications -->
        <div class="report-section mb-6">
          <h3 class="text-lg font-semibold mb-3 border-b pb-2">Current Medications</h3>
          ${this.renderMedicationSummary(data.medications, data.adherence, data.period.days)}
        </div>

        <!-- Health Goals -->
        <div class="report-section mb-6">
          <h3 class="text-lg font-semibold mb-3 border-b pb-2">Health Goals Progress</h3>
          ${this.renderGoalsSummary(data.goals)}
        </div>

        <!-- Recent Lab Results -->
        ${data.labs.length > 0 ? `
          <div class="report-section mb-6">
            <h3 class="text-lg font-semibold mb-3 border-b pb-2">Recent Lab Results</h3>
            ${this.renderLabSummary(data.labs)}
          </div>
        ` : ''}

        <!-- Report Footer -->
        <div class="report-footer mt-8 pt-4 border-t">
          <div class="text-sm text-muted">
            <div class="mb-2"><strong>Data Source:</strong> Personal Health Tracker App (Self-Reported)</div>
            <div><strong>Disclaimer:</strong> This information is provided for healthcare discussion purposes. 
            Clinical decisions should be based on professional medical assessment and additional diagnostic information.</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('report-content').innerHTML = reportHtml;
  },

  renderWeightSummary(weightData, units) {
    if (!weightData.length) {
      return `
        <div class="mb-4">
          <h4 class="font-semibold mb-2">Weight</h4>
          <div class="text-sm text-muted">No weight data recorded in this period</div>
        </div>
      `;
    }

    const weights = weightData.map(w => w.weight);
    const average = Utils.average(weights);
    const first = weights[0];
    const last = weights[weights.length - 1];
    const change = last - first;

    return `
      <div class="mb-4">
        <h4 class="font-semibold mb-2">Weight</h4>
        <div class="grid grid-2 gap-4 mb-2">
          <div>
            <div class="text-sm text-muted">Average: ${Utils.formatWeight(average)} ${units.weight}</div>
            <div class="text-sm text-muted">Change: ${change > 0 ? '+' : ''}${change.toFixed(1)} ${units.weight}</div>
          </div>
          <div>
            <div class="text-sm text-muted">Entries: ${weightData.length}</div>
            <div class="text-sm text-muted">Last: ${Utils.formatWeight(last)} ${units.weight}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderBPSummary(bpData) {
    if (!bpData.length) {
      return `
        <div class="mb-4">
          <h4 class="font-semibold mb-2">Blood Pressure</h4>
          <div class="text-sm text-muted">No blood pressure data recorded in this period</div>
        </div>
      `;
    }

    const avgSystolic = Utils.average(bpData.map(bp => bp.systolic));
    const avgDiastolic = Utils.average(bpData.map(bp => bp.diastolic));
    const highReadings = bpData.filter(bp => bp.systolic >= 140 || bp.diastolic >= 90).length;

    return `
      <div class="mb-4">
        <h4 class="font-semibold mb-2">Blood Pressure</h4>
        <div class="grid grid-2 gap-4 mb-2">
          <div>
            <div class="text-sm text-muted">Average: ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg</div>
            <div class="text-sm text-muted">High readings: ${highReadings}/${bpData.length}</div>
          </div>
          <div>
            <div class="text-sm text-muted">Entries: ${bpData.length}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderPainSummary(painData) {
    if (!painData.length) {
      return `
        <div class="mb-4">
          <h4 class="font-semibold mb-2">Pain</h4>
          <div class="text-sm text-muted">No pain data recorded in this period</div>
        </div>
      `;
    }

    const avgPain = Utils.average(painData.map(p => p.severity));
    const painDays = painData.filter(p => p.severity > 0).length;
    const severePainDays = painData.filter(p => p.severity >= 7).length;
    
    // Most common locations
    const locations = {};
    painData.forEach(p => {
      if (p.location) {
        locations[p.location] = (locations[p.location] || 0) + 1;
      }
    });
    const topLocation = Object.keys(locations).length > 0 ? 
      Object.entries(locations).sort(([,a], [,b]) => b - a)[0][0] : 'Not specified';

    return `
      <div class="mb-4">
        <h4 class="font-semibold mb-2">Pain</h4>
        <div class="grid grid-2 gap-4 mb-2">
          <div>
            <div class="text-sm text-muted">Average severity: ${avgPain.toFixed(1)}/10</div>
            <div class="text-sm text-muted">Pain days: ${painDays}</div>
          </div>
          <div>
            <div class="text-sm text-muted">Severe pain days (≥7): ${severePainDays}</div>
            <div class="text-sm text-muted">Most common location: ${topLocation}</div>
          </div>
        </div>
      </div>
    `;
  },

  renderHydrationSummary(hydrationData) {
    if (!hydrationData.length) {
      return `
        <div class="mb-4">
          <h4 class="font-semibold mb-2">Hydration</h4>
          <div class="text-sm text-muted">No hydration data recorded in this period</div>
        </div>
      `;
    }

    const target = parseFloat(Utils.getSetting('hydrationTarget', 2500));
    const avgIntake = Utils.average(hydrationData.map(h => h.amount));
    const adherentDays = hydrationData.filter(h => h.amount >= target).length;

    return `
      <div class="mb-4">
        <h4 class="font-semibold mb-2">Hydration</h4>
        <div class="grid grid-2 gap-4 mb-2">
          <div>
            <div class="text-sm text-muted">Average intake: ${Math.round(avgIntake)}ml</div>
            <div class="text-sm text-muted">Target met: ${adherentDays}/${hydrationData.length} days</div>
          </div>
          <div>
            <div class="text-sm text-muted">Daily target: ${target}ml</div>
            <div class="text-sm text-muted">Adherence: ${Math.round((adherentDays / hydrationData.length) * 100)}%</div>
          </div>
        </div>
      </div>
    `;
  },

  renderMedicationSummary(medications, adherenceData, periodDays) {
    if (!medications.length) {
      return `<div class="text-sm text-muted">No active medications</div>`;
    }

    return `
      <div class="space-y-3">
        ${medications.map(med => {
          const medAdherence = adherenceData.filter(a => a.medicationId === med.id);
          const adherenceRate = periodDays > 0 ? Math.round((medAdherence.length / periodDays) * 100) : 0;
          
          return `
            <div class="border rounded p-3">
              <div class="font-semibold">${Utils.escapeHtml(med.name)}</div>
              <div class="text-sm text-muted">
                ${Utils.escapeHtml(med.dose)} • ${Utils.escapeHtml(med.frequency)}
                ${med.condition ? ` • For: ${Utils.escapeHtml(med.condition)}` : ''}
              </div>
              <div class="text-sm">
                <span class="text-muted">Adherence rate:</span> 
                <span class="${adherenceRate >= 80 ? 'text-success' : adherenceRate >= 60 ? 'text-warning' : 'text-danger'}">
                  ${adherenceRate}% (${medAdherence.length}/${periodDays} days)
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderGoalsSummary(goals) {
    if (!goals.length) {
      return `<div class="text-sm text-muted">No active goals</div>`;
    }

    return `
      <div class="space-y-3">
        ${goals.map(goal => `
          <div class="border rounded p-3">
            <div class="font-semibold">${Utils.escapeHtml(goal.title)}</div>
            <div class="text-sm text-muted">${goal.category}</div>
            ${goal.baseline && goal.target ? `
              <div class="text-sm">
                Target: ${goal.baseline} → ${goal.target} ${goal.unit || ''}
              </div>
            ` : ''}
            ${goal.targetDate ? `
              <div class="text-sm text-muted">Target date: ${Utils.displayDate(goal.targetDate)}</div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  renderLabSummary(labData) {
    const recentLabs = labData.slice(-5); // Last 5 lab results
    
    return `
      <div class="space-y-3">
        ${recentLabs.map(lab => `
          <div class="border rounded p-3">
            <div class="flex justify-between">
              <div class="font-semibold">${lab.panelType}</div>
              <div class="text-sm text-muted">${Utils.displayDate(lab.date)}</div>
            </div>
            <div class="text-sm mt-1">
              ${this.formatLabValues(lab)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  formatLabValues(lab) {
    const values = [];
    if (lab.totalCholesterol) values.push(`Total Chol: ${lab.totalCholesterol}`);
    if (lab.ldl) values.push(`LDL: ${lab.ldl}`);
    if (lab.hdl) values.push(`HDL: ${lab.hdl}`);
    if (lab.triglycerides) values.push(`Trig: ${lab.triglycerides}`);
    if (lab.uricAcid) values.push(`Uric Acid: ${lab.uricAcid}`);
    if (lab.glucose) values.push(`Glucose: ${lab.glucose}`);
    if (lab.creatinine) values.push(`Creatinine: ${lab.creatinine}`);
    
    return values.join(' • ');
  },

  bindEvents() {
    document.getElementById('generate-report').addEventListener('click', () => {
      this.generateReport();
    });

    document.getElementById('print-report').addEventListener('click', () => {
      window.print();
    });
  }
});