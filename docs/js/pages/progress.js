App.register('progress', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Progress</h1>
          <p class="page-subtitle">Track your health trends and patterns</p>
        </div>

        <!-- Time Range Selector -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="flex gap-2">
              <button id="range-30" class="btn btn-sm btn-secondary active" data-days="30">30 Days</button>
              <button id="range-90" class="btn btn-sm btn-ghost" data-days="90">90 Days</button>
            </div>
          </div>
        </div>

        <!-- Weight Trend -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Weight Trend</h3>
            <div class="text-sm text-muted" id="weight-period">Last 30 days</div>
          </div>
          <div class="card-body">
            <div id="weight-trend-content">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Blood Pressure Trend -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Blood Pressure Trend</h3>
            <div class="text-sm text-muted" id="bp-period">Last 30 days</div>
          </div>
          <div class="card-body">
            <div id="bp-trend-content">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Pain Trend -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Pain Trend</h3>
            <div class="text-sm text-muted" id="pain-period">Last 30 days</div>
          </div>
          <div class="card-body">
            <div id="pain-trend-content">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>

        <!-- Hydration Adherence -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Hydration Adherence</h3>
            <div class="text-sm text-muted" id="hydration-period">Last 30 days</div>
          </div>
          <div class="card-body">
            <div id="hydration-trend-content">
              <!-- Populated by JavaScript -->
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    this.currentDays = 30;
    await this.loadAllTrends();
    this.bindEvents();
  },

  async loadAllTrends() {
    await Promise.all([
      this.loadWeightTrend(),
      this.loadBPTrend(),
      this.loadPainTrend(),
      this.loadHydrationTrend()
    ]);
    this.updatePeriodLabels();
  },

  async loadWeightTrend() {
    try {
      const weightData = await Store.getWeightTrend(this.currentDays);
      const container = document.getElementById('weight-trend-content');

      if (!weightData || weightData.length === 0) {
        container.innerHTML = this.renderEmptyState('⚖️', 'No weight data', 'Log your weight measurements to see trends');
        return;
      }

      // Show recent entries in a table
      const recentEntries = weightData.slice(-10); // Last 10 entries
      const average = Utils.average(weightData.map(w => w.weight));
      const trend = this.calculateTrend(weightData.map(w => w.weight));
      const units = Utils.getUnits();

      container.innerHTML = `
        <div class="mb-4">
          <div class="grid grid-2 gap-4">
            <div class="text-center">
              <div class="card-value">${Utils.formatWeight(average)} ${units.weight}</div>
              <div class="card-label">Average</div>
            </div>
            <div class="text-center">
              <div class="card-value ${trend.direction === 'up' ? 'text-danger' : trend.direction === 'down' ? 'text-success' : 'text-muted'}">
                ${trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} ${Math.abs(trend.change).toFixed(1)} ${units.weight}
              </div>
              <div class="card-label">Trend</div>
            </div>
          </div>
        </div>

        <div class="divider mb-4"></div>

        <h4 class="text-sm font-semibold mb-3">Recent Entries</h4>
        <div class="space-y-2">
          ${recentEntries.map(entry => `
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">${Utils.displayDate(entry.date)}</span>
              <span class="font-semibold">${Utils.formatWeight(entry.weight)} ${units.weight}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-4">
          <div class="text-xs text-muted">
            📊 Interactive charts coming in Phase 2
          </div>
        </div>
      `;
    } catch (error) {
      document.getElementById('weight-trend-content').innerHTML = 
        this.renderEmptyState('⚠️', 'Error loading data', 'Please try again later');
    }
  },

  async loadBPTrend() {
    try {
      const bpData = await Store.getBPTrend(this.currentDays);
      const container = document.getElementById('bp-trend-content');

      if (!bpData || bpData.length === 0) {
        container.innerHTML = this.renderEmptyState('🩺', 'No blood pressure data', 'Log your BP measurements to see trends');
        return;
      }

      const recentEntries = bpData.slice(-10);
      const avgSystolic = Utils.average(bpData.map(bp => bp.systolic));
      const avgDiastolic = Utils.average(bpData.map(bp => bp.diastolic));

      container.innerHTML = `
        <div class="mb-4">
          <div class="grid grid-2 gap-4">
            <div class="text-center">
              <div class="card-value">${Math.round(avgSystolic)}/${Math.round(avgDiastolic)}</div>
              <div class="card-label">Average BP</div>
            </div>
            <div class="text-center">
              <div class="card-value ${this.getBPCategory(avgSystolic, avgDiastolic).color}">
                ${this.getBPCategory(avgSystolic, avgDiastolic).category}
              </div>
              <div class="card-label">Category</div>
            </div>
          </div>
        </div>

        <div class="divider mb-4"></div>

        <h4 class="text-sm font-semibold mb-3">Recent Entries</h4>
        <div class="space-y-2">
          ${recentEntries.map(entry => `
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">${Utils.displayDate(entry.date)}</span>
              <span class="font-semibold">${entry.systolic}/${entry.diastolic} mmHg</span>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-4">
          <div class="text-xs text-muted">
            📊 Interactive charts coming in Phase 2
          </div>
        </div>
      `;
    } catch (error) {
      document.getElementById('bp-trend-content').innerHTML = 
        this.renderEmptyState('⚠️', 'Error loading data', 'Please try again later');
    }
  },

  async loadPainTrend() {
    try {
      const painData = await Store.getPainTrend(this.currentDays);
      const container = document.getElementById('pain-trend-content');

      if (!painData || painData.length === 0) {
        container.innerHTML = this.renderEmptyState('🩹', 'No pain data', 'Log your pain levels to see patterns');
        return;
      }

      const recentEntries = painData.slice(-10);
      const avgPain = Utils.average(painData.map(p => p.severity));
      const painDays = painData.filter(p => p.severity > 0).length;
      const totalDays = Math.min(this.currentDays, painData.length);

      container.innerHTML = `
        <div class="mb-4">
          <div class="grid grid-2 gap-4">
            <div class="text-center">
              <div class="card-value" style="color: ${Utils.painColor(avgPain)}">${avgPain.toFixed(1)}/10</div>
              <div class="card-label">Average Pain</div>
            </div>
            <div class="text-center">
              <div class="card-value">${painDays}/${totalDays}</div>
              <div class="card-label">Pain Days</div>
            </div>
          </div>
        </div>

        <div class="divider mb-4"></div>

        <h4 class="text-sm font-semibold mb-3">Recent Entries</h4>
        <div class="space-y-2">
          ${recentEntries.map(entry => `
            <div class="flex justify-between items-center py-2">
              <div>
                <div class="text-sm">${Utils.displayDate(entry.date)}</div>
                ${entry.location ? `<div class="text-xs text-muted">${entry.location}</div>` : ''}
              </div>
              <span class="font-semibold" style="color: ${Utils.painColor(entry.severity)}">
                ${entry.severity}/10
              </span>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-4">
          <div class="text-xs text-muted">
            📊 Interactive charts coming in Phase 2
          </div>
        </div>
      `;
    } catch (error) {
      document.getElementById('pain-trend-content').innerHTML = 
        this.renderEmptyState('⚠️', 'Error loading data', 'Please try again later');
    }
  },

  async loadHydrationTrend() {
    try {
      const hydrationData = await Store.getByDateRange('hydration', 
        this.getDateDaysAgo(this.currentDays), 
        Utils.dateStr(new Date())
      );
      const container = document.getElementById('hydration-trend-content');

      if (!hydrationData || hydrationData.length === 0) {
        container.innerHTML = this.renderEmptyState('💧', 'No hydration data', 'Track your daily water intake to see adherence');
        return;
      }

      const dailyTarget = parseFloat(Utils.getSetting('hydrationTarget', 2500));
      const recentEntries = hydrationData.slice(-10);
      
      // Calculate adherence stats
      const adherentDays = hydrationData.filter(h => h.amount >= dailyTarget).length;
      const totalDays = hydrationData.length;
      const adherenceRate = totalDays > 0 ? Math.round((adherentDays / totalDays) * 100) : 0;
      const avgIntake = totalDays > 0 ? Utils.average(hydrationData.map(h => h.amount)) : 0;

      container.innerHTML = `
        <div class="mb-4">
          <div class="grid grid-2 gap-4">
            <div class="text-center">
              <div class="card-value">${adherenceRate}%</div>
              <div class="card-label">Adherence Rate</div>
            </div>
            <div class="text-center">
              <div class="card-value">${Math.round(avgIntake)}ml</div>
              <div class="card-label">Average Intake</div>
            </div>
          </div>
        </div>

        <div class="divider mb-4"></div>

        <h4 class="text-sm font-semibold mb-3">Recent Entries</h4>
        <div class="space-y-2">
          ${recentEntries.map(entry => {
            const percentage = Math.round((entry.amount / dailyTarget) * 100);
            const isAdherent = entry.amount >= dailyTarget;
            return `
              <div class="flex justify-between items-center py-2">
                <span class="text-sm">${Utils.displayDate(entry.date)}</span>
                <div class="text-right">
                  <span class="font-semibold ${isAdherent ? 'text-success' : 'text-warning'}">
                    ${entry.amount}ml (${percentage}%)
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="mt-4">
          <div class="text-xs text-muted">
            Target: ${dailyTarget}ml daily • 📊 Interactive charts coming in Phase 2
          </div>
        </div>
      `;
    } catch (error) {
      document.getElementById('hydration-trend-content').innerHTML = 
        this.renderEmptyState('⚠️', 'Error loading data', 'Please try again later');
    }
  },

  calculateTrend(values) {
    if (values.length < 2) return { direction: 'stable', change: 0 };
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    
    if (Math.abs(change) < 0.1) return { direction: 'stable', change: 0 };
    
    return {
      direction: change > 0 ? 'up' : 'down',
      change: change
    };
  },

  getBPCategory(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) {
      return { category: 'Crisis', color: 'text-danger' };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { category: 'High', color: 'text-danger' };
    } else if (systolic >= 130 || diastolic >= 80) {
      return { category: 'Elevated', color: 'text-warning' };
    } else {
      return { category: 'Normal', color: 'text-success' };
    }
  },

  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return Utils.dateStr(date);
  },

  renderEmptyState(icon, title, description) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-text">${title}</div>
        <div class="empty-state-hint">${description}</div>
      </div>
    `;
  },

  updatePeriodLabels() {
    const suffix = this.currentDays === 30 ? '30 days' : '90 days';
    document.getElementById('weight-period').textContent = `Last ${suffix}`;
    document.getElementById('bp-period').textContent = `Last ${suffix}`;
    document.getElementById('pain-period').textContent = `Last ${suffix}`;
    document.getElementById('hydration-period').textContent = `Last ${suffix}`;
  },

  bindEvents() {
    // Time range selector
    document.addEventListener('click', async (e) => {
      if (e.target.dataset.days) {
        // Update active state
        document.querySelectorAll('[data-days]').forEach(btn => {
          btn.classList.remove('btn-secondary', 'active');
          btn.classList.add('btn-ghost');
        });
        
        e.target.classList.remove('btn-ghost');
        e.target.classList.add('btn-secondary', 'active');
        
        // Update current days and reload
        this.currentDays = parseInt(e.target.dataset.days);
        await this.loadAllTrends();
      }
    });
  }
});