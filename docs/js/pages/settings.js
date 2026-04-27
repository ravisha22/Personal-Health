App.register('settings', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">App preferences and configuration</p>
        </div>

        <!-- Units Settings -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Units & Measurements</h3>
            <div class="text-sm text-muted">Choose your preferred measurement units</div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Unit System</label>
              <select id="unit-system" class="form-select">
                <option value="metric">Metric (kg, cm, °C)</option>
                <option value="imperial">Imperial (lb, in, °F)</option>
              </select>
              <div class="form-hint">This affects weight, height, and temperature displays</div>
            </div>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Appearance</h3>
            <div class="text-sm text-muted">Customize the app's look and feel</div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Theme</label>
              <select id="theme" class="form-select">
                <option value="system">System (Auto)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <div class="form-hint">Dark theme support coming soon</div>
            </div>
          </div>
        </div>

        <!-- Health Goals Settings -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Health Goals</h3>
            <div class="text-sm text-muted">Set your daily health targets</div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label for="hydration-target" class="form-label">Daily Hydration Target</label>
              <div class="form-row">
                <input type="number" id="hydration-target" class="form-input" 
                       min="1000" max="5000" step="100" placeholder="2500">
                <span class="form-input-addon">ml</span>
              </div>
              <div class="form-hint">Recommended: 2000-3000ml per day</div>
            </div>

            <div class="form-group">
              <label for="weight-goal" class="form-label">Weight Goal (Optional)</label>
              <div class="form-row">
                <input type="number" id="weight-goal" class="form-input" 
                       step="0.1" placeholder="Target weight">
                <span class="form-input-addon" id="weight-unit">kg</span>
              </div>
              <div class="form-hint">Set a target weight for dashboard display</div>
            </div>
          </div>
        </div>

        <!-- Notifications & Reminders -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Reminders</h3>
            <div class="text-sm text-muted">Daily check-in preferences</div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Check-in Reminder</label>
              <select id="reminder-preference" class="form-select">
                <option value="none">No reminders</option>
                <option value="daily">Daily reminder</option>
                <option value="evening">Evening reminder</option>
              </select>
              <div class="form-hint">Browser notifications (if supported)</div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input type="checkbox" id="medication-reminders" class="form-check-input">
                <label for="medication-reminders" class="form-check-label">
                  Medication adherence reminders
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Data & Privacy -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Data & Privacy</h3>
            <div class="text-sm text-muted">How your data is handled</div>
          </div>
          <div class="card-body">
            <div class="alert alert-info mb-3">
              <strong>Local Storage:</strong> All your health data is stored locally on your device. 
              No data is sent to external servers.
            </div>
            
            <div class="form-group">
              <div class="form-check">
                <input type="checkbox" id="data-analytics" class="form-check-input">
                <label for="data-analytics" class="form-check-label">
                  Share anonymous usage statistics
                </label>
              </div>
              <div class="form-hint">Help improve the app (no personal health data shared)</div>
            </div>
          </div>
        </div>

        <!-- Profile Information -->
        <div class="card mb-4">
          <div class="card-header">
            <h3 class="card-title">Profile</h3>
            <div class="text-sm text-muted">Basic information for reports</div>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label for="profile-name" class="form-label">Name (Optional)</label>
                <input type="text" id="profile-name" class="form-input" 
                       placeholder="Your name for reports">
              </div>
              <div class="form-group">
                <label for="profile-dob" class="form-label">Date of Birth (Optional)</label>
                <input type="date" id="profile-dob" class="form-input">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="profile-height" class="form-label">Height (Optional)</label>
                <div class="form-row">
                  <input type="number" id="profile-height" class="form-input" 
                         step="0.1" placeholder="Height">
                  <span class="form-input-addon" id="height-unit">cm</span>
                </div>
              </div>
              <div class="form-group">
                <label for="profile-gender" class="form-label">Gender (Optional)</label>
                <select id="profile-gender" class="form-select">
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">About</h3>
          </div>
          <div class="card-body">
            <div class="text-center">
              <h4 class="font-semibold mb-2">Personal Health Tracker</h4>
              <div class="text-sm text-muted mb-4">Version 1.0.0</div>
              
              <div class="text-sm mb-4">
                A personal health management app designed to help you track vital signs, 
                manage medications, and monitor your wellness journey.
              </div>

              <div class="disclaimer mb-4">
                <strong>Medical Disclaimer:</strong> This app is for personal health tracking only. 
                It is not intended to diagnose, treat, cure, or prevent any disease. 
                Always consult with qualified healthcare providers for medical advice.
              </div>

              <div class="text-xs text-muted">
                Built with ❤️ for personal health management<br>
                All data stored locally on your device
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-4 mb-6">
          <button id="save-settings" class="btn btn-primary btn-block">
            💾 Save Settings
          </button>
        </div>
      </div>
    `;
  },

  async afterRender() {
    await this.loadSettings();
    this.updateUnitLabels();
    this.bindEvents();
  },

  async loadSettings() {
    try {
      // Load all settings
      const unitSystem = Utils.getSetting('unitSystem', 'metric');
      const theme = Utils.getSetting('theme', 'system');
      const hydrationTarget = Utils.getSetting('hydrationTarget', '2500');
      const weightGoal = Utils.getSetting('weightGoal', '');
      const reminderPreference = Utils.getSetting('reminderPreference', 'none');
      const medicationReminders = Utils.getSetting('medicationReminders', 'false') === 'true';
      const dataAnalytics = Utils.getSetting('dataAnalytics', 'false') === 'true';

      // Load profile
      const profile = await Store.getProfile() || {};

      // Set form values
      document.getElementById('unit-system').value = unitSystem;
      document.getElementById('theme').value = theme;
      document.getElementById('hydration-target').value = hydrationTarget;
      document.getElementById('weight-goal').value = weightGoal;
      document.getElementById('reminder-preference').value = reminderPreference;
      document.getElementById('medication-reminders').checked = medicationReminders;
      document.getElementById('data-analytics').checked = dataAnalytics;

      // Set profile values
      document.getElementById('profile-name').value = profile.name || '';
      document.getElementById('profile-dob').value = profile.dob || '';
      document.getElementById('profile-height').value = profile.height || '';
      document.getElementById('profile-gender').value = profile.gender || '';

    } catch (error) {
      console.error('Error loading settings:', error);
      Utils.toast('Error loading settings');
    }
  },

  updateUnitLabels() {
    const unitSystem = document.getElementById('unit-system').value;
    const isMetric = unitSystem === 'metric';
    
    document.getElementById('weight-unit').textContent = isMetric ? 'kg' : 'lb';
    document.getElementById('height-unit').textContent = isMetric ? 'cm' : 'in';
  },

  async saveSettings() {
    try {
      // Save settings
      Utils.setSetting('unitSystem', document.getElementById('unit-system').value);
      Utils.setSetting('theme', document.getElementById('theme').value);
      Utils.setSetting('hydrationTarget', document.getElementById('hydration-target').value);
      Utils.setSetting('weightGoal', document.getElementById('weight-goal').value);
      Utils.setSetting('reminderPreference', document.getElementById('reminder-preference').value);
      Utils.setSetting('medicationReminders', document.getElementById('medication-reminders').checked.toString());
      Utils.setSetting('dataAnalytics', document.getElementById('data-analytics').checked.toString());

      // Save profile
      const profileData = {
        name: document.getElementById('profile-name').value,
        dob: document.getElementById('profile-dob').value,
        height: parseFloat(document.getElementById('profile-height').value) || null,
        gender: document.getElementById('profile-gender').value
      };

      await Store.saveProfile(profileData);

      // Request notification permission if reminders are enabled
      const reminderPreference = document.getElementById('reminder-preference').value;
      if (reminderPreference !== 'none' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      Utils.toast('Settings saved successfully!');
      
      // Update BMI calculation if height and weight goal are set
      this.updateBMIDisplay();

    } catch (error) {
      console.error('Error saving settings:', error);
      Utils.toast('Error saving settings');
    }
  },

  updateBMIDisplay() {
    const height = parseFloat(document.getElementById('profile-height').value);
    const weight = parseFloat(document.getElementById('weight-goal').value);
    
    if (height && weight) {
      const unitSystem = document.getElementById('unit-system').value;
      const bmiValue = Utils.bmi(weight, height, unitSystem);
      
      // Could display BMI somewhere in the UI if desired
      console.log('BMI calculated:', bmiValue);
    }
  },

  bindEvents() {
    // Unit system change
    document.getElementById('unit-system').addEventListener('change', () => {
      this.updateUnitLabels();
    });

    // Save settings button
    document.getElementById('save-settings').addEventListener('click', () => {
      this.saveSettings();
    });

    // Auto-save on certain field changes
    const autoSaveFields = [
      'unit-system',
      'theme', 
      'hydration-target'
    ];

    autoSaveFields.forEach(fieldId => {
      document.getElementById(fieldId).addEventListener('change', () => {
        this.saveSettings();
      });
    });

    // Hydration target validation
    document.getElementById('hydration-target').addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      if (value < 1000 || value > 5000) {
        e.target.setCustomValidity('Please enter a value between 1000 and 5000 ml');
      } else {
        e.target.setCustomValidity('');
      }
    });

    // Weight goal validation
    document.getElementById('weight-goal').addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      const unitSystem = document.getElementById('unit-system').value;
      const minWeight = unitSystem === 'metric' ? 30 : 66; // 30kg or 66lbs
      const maxWeight = unitSystem === 'metric' ? 300 : 660; // 300kg or 660lbs
      
      if (value && (value < minWeight || value > maxWeight)) {
        const unit = unitSystem === 'metric' ? 'kg' : 'lb';
        e.target.setCustomValidity(`Please enter a realistic weight between ${minWeight} and ${maxWeight} ${unit}`);
      } else {
        e.target.setCustomValidity('');
      }
    });

    // Height validation
    document.getElementById('profile-height').addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      const unitSystem = document.getElementById('unit-system').value;
      const minHeight = unitSystem === 'metric' ? 100 : 39; // 100cm or 39in
      const maxHeight = unitSystem === 'metric' ? 250 : 98; // 250cm or 98in
      
      if (value && (value < minHeight || value > maxHeight)) {
        const unit = unitSystem === 'metric' ? 'cm' : 'in';
        e.target.setCustomValidity(`Please enter a realistic height between ${minHeight} and ${maxHeight} ${unit}`);
      } else {
        e.target.setCustomValidity('');
      }
    });
  }
});