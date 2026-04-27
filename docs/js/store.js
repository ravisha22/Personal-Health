// store.js — Dexie.js IndexedDB data layer
const db = new Dexie('HealthTracker');

db.version(1).stores({
  profile:       '++id, created',
  vitals:        '++id, date, type',
  labs:          '++id, date, panel',
  workouts:      '++id, date, type',
  meals:         '++id, date, meal',
  pain_logs:     '++id, date, bodyPart',
  flares:        '++id, date, status',
  hydration:     '++id, date',
  medications:   '++id, name, active',
  med_adherence: '++id, date, medicationId',
  goals:         '++id, category, status',
  checkins:      '++id, date',
  doctor_notes:  '++id, date, specialist',
});

// Store API — CRUD for each table
const Store = {
  // ===== Profile =====
  async getProfile() {
    const all = await db.profile.toArray();
    return all[0] || null;
  },
  async saveProfile(data) {
    const existing = await this.getProfile();
    if (existing) {
      return db.profile.update(existing.id, { ...data, updated: Utils.dateStr() });
    }
    return db.profile.add({ ...data, created: Utils.dateStr(), updated: Utils.dateStr() });
  },

  // ===== Generic CRUD =====
  async add(table, entry) {
    entry.id = entry.id || Utils.uid();
    entry.created = entry.created || Utils.dateStr();
    return db[table].add(entry);
  },

  async update(table, id, changes) {
    return db[table].update(id, changes);
  },

  async delete(table, id) {
    return db[table].delete(id);
  },

  async getById(table, id) {
    return db[table].get(id);
  },

  async getAll(table) {
    return db[table].toArray();
  },

  // ===== Date-ranged queries =====
  async getByDateRange(table, startDate, endDate) {
    return db[table]
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  async getByDate(table, date) {
    return db[table].where('date').equals(date).toArray();
  },

  async getLatest(table, count = 1) {
    const all = await db[table].orderBy('date').reverse().limit(count).toArray();
    return count === 1 ? all[0] || null : all;
  },

  // ===== Vitals shortcuts =====
  async addVital(entry) {
    return this.add('vitals', { ...entry, date: entry.date || Utils.dateStr() });
  },

  async getVitalsByType(type, limit = 30) {
    return db.vitals.where('type').equals(type).reverse().limit(limit).toArray();
  },

  async getLatestWeight() {
    const weights = await db.vitals.where('type').equals('weight').reverse().limit(1).toArray();
    return weights[0] || null;
  },

  async getLatestBP() {
    const bps = await db.vitals.where('type').equals('bp').reverse().limit(1).toArray();
    return bps[0] || null;
  },

  // ===== Pain shortcuts =====
  async addPain(entry) {
    return this.add('pain_logs', { ...entry, date: entry.date || Utils.dateStr() });
  },

  async getRecentPain(days = 7) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    return db.pain_logs.where('date').above(Utils.dateStr(start)).toArray();
  },

  // ===== Flare shortcuts =====
  async addFlare(entry) {
    return this.add('flares', { ...entry, date: entry.date || Utils.dateStr(), status: 'active' });
  },

  async getActiveFlares() {
    return db.flares.where('status').equals('active').toArray();
  },

  async getMealsForTriggerLookback(date) {
    const d = new Date(date + 'T00:00:00');
    const start = new Date(d);
    start.setDate(start.getDate() - 2);
    return db.meals.where('date').between(Utils.dateStr(start), date, true, true).toArray();
  },

  // ===== Medications =====
  async getActiveMeds() {
    return db.medications.where('active').equals(1).toArray();
  },

  async getTodayAdherence() {
    const today = Utils.dateStr();
    return db.med_adherence.where('date').equals(today).toArray();
  },

  // ===== Hydration =====
  async getTodayHydration() {
    const today = Utils.dateStr();
    const entries = await db.hydration.where('date').equals(today).toArray();
    return entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  },

  // ===== Check-ins =====
  async getTodayCheckin() {
    const today = Utils.dateStr();
    const entries = await db.checkins.where('date').equals(today).toArray();
    return entries[0] || null;
  },

  // ===== Today's pain logs =====
  async getTodayPainLogs() {
    const today = Utils.dateStr();
    return db.pain_logs.where('date').equals(today).toArray();
  },

  // ===== Today's medications =====
  async getTodayMedications() {
    const meds = await this.getActiveMeds();
    const adherence = await this.getTodayAdherence();
    return meds.map(m => ({
      ...m,
      takenToday: adherence.some(a => a.medicationId === m.id)
    }));
  },

  // ===== Recent activity across all log types =====
  async getRecentActivity(count = 5) {
    const results = [];
    const tables = [
      { name: 'vitals', type: 'vital' },
      { name: 'pain_logs', type: 'pain' },
      { name: 'flares', type: 'flare' },
      { name: 'workouts', type: 'workout' },
      { name: 'meals', type: 'meal' },
      { name: 'checkins', type: 'checkin' },
    ];
    for (const t of tables) {
      try {
        const items = await db[t.name].orderBy('date').reverse().limit(3).toArray();
        items.forEach(i => results.push({ ...i, _type: t.type }));
      } catch(e) { /* skip if table empty */ }
    }
    results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return results.slice(0, count);
  },

  // ===== Goals =====
  async getActiveGoals() {
    return db.goals.where('status').equals('active').toArray();
  },

  // ===== Stats helpers =====
  async getWeightTrend(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const weights = await db.vitals
      .where('type').equals('weight')
      .filter(v => v.date >= Utils.dateStr(start))
      .toArray();
    return weights.sort((a, b) => a.date.localeCompare(b.date));
  },

  async getBPTrend(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    return db.vitals
      .where('type').equals('bp')
      .filter(v => v.date >= Utils.dateStr(start))
      .sortBy('date');
  },

  async getPainTrend(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    return db.pain_logs
      .where('date').above(Utils.dateStr(start))
      .sortBy('date');
  },

  // ===== Export all data =====
  async exportAll() {
    const data = {};
    for (const table of db.tables) {
      data[table.name] = await table.toArray();
    }
    return data;
  },

  // ===== Clear all data =====
  async clearAll() {
    for (const table of db.tables) {
      await table.clear();
    }
    localStorage.clear();
  }
};
