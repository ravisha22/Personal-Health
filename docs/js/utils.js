// utils.js — Date formatting, validation, calculations
const Utils = {
  // Format date as YYYY-MM-DD
  dateStr(d) {
    if (!d) return new Date().toISOString().split('T')[0];
    if (typeof d === 'string') return d.split('T')[0];
    return d.toISOString().split('T')[0];
  },

  // Format date for display
  displayDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  },

  // Format time HH:MM
  timeStr(d = new Date()) {
    return d.toTimeString().slice(0, 5);
  },

  // Days ago
  daysAgo(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor((now - d) / 86400000);
  },

  // Relative time display
  relativeDate(dateStr) {
    const days = this.daysAgo(dateStr);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return this.displayDate(dateStr);
  },

  // Generate unique ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  // BMI calculation
  bmi(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    return +(weightKg / (heightM * heightM)).toFixed(1);
  },

  // Weight conversion
  lbsToKg(lbs) { return +(lbs * 0.453592).toFixed(1); },
  kgToLbs(kg) { return +(kg * 2.20462).toFixed(1); },

  // Height conversion
  cmToFtIn(cm) {
    const inches = cm / 2.54;
    return { ft: Math.floor(inches / 12), in: Math.round(inches % 12) };
  },
  ftInToCm(ft, inches) { return +((ft * 12 + inches) * 2.54).toFixed(1); },

  // Pain color based on level
  painColor(level) {
    if (level <= 2) return 'green';
    if (level <= 4) return 'yellow';
    return 'red';
  },

  // Pain zone label
  painZone(level) {
    if (level <= 2) return '🟢 Safe';
    if (level <= 4) return '🟡 Caution';
    return '🔴 Stop';
  },

  // Clamp number
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  // Simple average
  average(arr) {
    if (!arr.length) return 0;
    return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  },

  // Get settings from localStorage
  getSetting(key, defaultVal) {
    try {
      const v = localStorage.getItem('ht_' + key);
      return v !== null ? JSON.parse(v) : defaultVal;
    } catch { return defaultVal; }
  },

  // Set setting in localStorage
  setSetting(key, val) {
    localStorage.setItem('ht_' + key, JSON.stringify(val));
  },

  // Check if onboarded
  isOnboarded() {
    return this.getSetting('onboarded', false);
  },

  // Get units preference
  getUnits() {
    return this.getSetting('units', 'metric');
  },

  // Format weight with units
  formatWeight(kg) {
    if (this.getUnits() === 'imperial') {
      return this.kgToLbs(kg) + ' lbs';
    }
    return kg + ' kg';
  },

  // Show toast notification
  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast alert-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Escape HTML
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Debounce
  debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }
};
