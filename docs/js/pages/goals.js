App.register('goals', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Goals</h1>
          <p class="page-subtitle">Track your health goals and milestones</p>
        </div>

        <div id="goals-container">
          <div id="active-goals"></div>
          
          <button id="add-goal-btn" class="btn btn-primary btn-block mt-4">
            Add New Goal
          </button>
        </div>

        <!-- Add Goal Modal -->
        <div id="goal-modal" class="modal" style="display: none;">
          <div class="modal-content">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Add New Goal</h3>
              </div>
              <div class="card-body">
                <form id="goal-form">
                  <div class="form-group">
                    <label class="form-label">Goal Title *</label>
                    <input type="text" id="goal-title" class="form-input" required>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select id="goal-category" class="form-select" required>
                      <option value="">Select category...</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="BP Control">BP Control</option>
                      <option value="Uric Acid">Uric Acid</option>
                      <option value="Lipids">Lipids</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Medication Reduction">Medication Reduction</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Baseline Value</label>
                      <input type="number" id="goal-baseline" class="form-input" step="0.1">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Target Value</label>
                      <input type="number" id="goal-target" class="form-input" step="0.1">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Unit</label>
                      <input type="text" id="goal-unit" class="form-input" placeholder="kg, mmHg, etc.">
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Target Date</label>
                    <input type="date" id="goal-date" class="form-input">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Strategy/Notes</label>
                    <textarea id="goal-notes" class="form-textarea" rows="3"></textarea>
                  </div>

                  <div class="form-row mt-4">
                    <button type="button" id="cancel-goal" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Goal</button>
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
    await this.loadGoals();
    this.bindEvents();
  },

  async loadGoals() {
    const goals = await Store.getActiveGoals();
    const container = document.getElementById('active-goals');
    
    if (goals.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <div class="empty-state-text">No goals yet</div>
          <div class="empty-state-hint">Set your first health goal to start tracking progress</div>
        </div>
      `;
      return;
    }

    container.innerHTML = goals.map(goal => this.renderGoalCard(goal)).join('');
  },

  renderGoalCard(goal) {
    const progress = this.calculateProgress(goal);
    const progressColor = progress >= 75 ? 'success' : progress >= 50 ? 'warning' : 'danger';
    const status = goal.status || 'active';
    const statusTag = status === 'complete' ? 'tag-green' : status === 'archived' ? 'tag-red' : 'tag-blue';

    return `
      <div class="card mb-4" data-goal-id="${goal.id}">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h3 class="card-title">${Utils.escapeHtml(goal.title)}</h3>
            <span class="tag ${statusTag}">${status.toUpperCase()}</span>
          </div>
          <div class="text-sm text-muted">${goal.category}</div>
        </div>
        
        <div class="card-body">
          ${goal.baseline && goal.target ? `
            <div class="mb-3">
              <div class="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>${progress}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill progress-${progressColor}" style="width: ${Math.min(progress, 100)}%"></div>
              </div>
              <div class="flex justify-between text-xs text-muted mt-1">
                <span>${goal.baseline} ${goal.unit || ''}</span>
                <span>${goal.target} ${goal.unit || ''}</span>
              </div>
            </div>
          ` : ''}

          ${goal.targetDate ? `
            <div class="text-sm mb-2">
              <span class="text-muted">Target Date:</span> ${Utils.displayDate(goal.targetDate)}
            </div>
          ` : ''}

          ${goal.notes ? `
            <div class="text-sm text-muted">${Utils.escapeHtml(goal.notes)}</div>
          ` : ''}
        </div>

        <div class="card-footer">
          <div class="flex gap-2">
            ${status === 'active' ? `
              <button class="btn btn-sm btn-ghost complete-goal" data-id="${goal.id}">
                Mark Complete
              </button>
            ` : ''}
            <button class="btn btn-sm btn-ghost edit-goal" data-id="${goal.id}">
              Edit
            </button>
            <button class="btn btn-sm btn-danger archive-goal" data-id="${goal.id}">
              ${status === 'active' ? 'Archive' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  calculateProgress(goal) {
    if (!goal.baseline || !goal.target) return 0;
    
    // For now, return a mock progress. In real app, this would calculate based on current values
    const mockCurrent = goal.baseline + (goal.target - goal.baseline) * 0.4; // 40% progress
    const totalDistance = Math.abs(goal.target - goal.baseline);
    const currentDistance = Math.abs(mockCurrent - goal.baseline);
    return Math.round((currentDistance / totalDistance) * 100);
  },

  bindEvents() {
    // Add goal button
    document.getElementById('add-goal-btn').addEventListener('click', () => {
      this.showGoalModal();
    });

    // Cancel button
    document.getElementById('cancel-goal').addEventListener('click', () => {
      this.hideGoalModal();
    });

    // Form submission
    document.getElementById('goal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveGoal();
    });

    // Goal actions
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('complete-goal')) {
        const goalId = e.target.dataset.id;
        await Store.update('goals', goalId, { status: 'complete', completedAt: new Date().toISOString() });
        Utils.toast('Goal marked as complete!');
        this.loadGoals();
      }

      if (e.target.classList.contains('archive-goal')) {
        const goalId = e.target.dataset.id;
        if (confirm('Are you sure you want to archive this goal?')) {
          await Store.update('goals', goalId, { status: 'archived' });
          Utils.toast('Goal archived');
          this.loadGoals();
        }
      }

      if (e.target.classList.contains('edit-goal')) {
        const goalId = e.target.dataset.id;
        // For MVP, just show toast. Full edit functionality would pre-populate modal
        Utils.toast('Edit functionality coming soon!');
      }
    });

    // Modal click outside to close
    document.getElementById('goal-modal').addEventListener('click', (e) => {
      if (e.target.id === 'goal-modal') {
        this.hideGoalModal();
      }
    });
  },

  showGoalModal() {
    document.getElementById('goal-modal').style.display = 'block';
    document.getElementById('goal-title').focus();
  },

  hideGoalModal() {
    document.getElementById('goal-modal').style.display = 'none';
    document.getElementById('goal-form').reset();
  },

  async saveGoal() {
    const goalData = {
      id: Utils.uid(),
      title: document.getElementById('goal-title').value,
      category: document.getElementById('goal-category').value,
      baseline: parseFloat(document.getElementById('goal-baseline').value) || null,
      target: parseFloat(document.getElementById('goal-target').value) || null,
      unit: document.getElementById('goal-unit').value,
      targetDate: document.getElementById('goal-date').value || null,
      notes: document.getElementById('goal-notes').value,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await Store.add('goals', goalData);
    Utils.toast('Goal added successfully!');
    this.hideGoalModal();
    this.loadGoals();
  }
});