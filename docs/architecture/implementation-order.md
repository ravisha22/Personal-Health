# Implementation Order — Build Priority Ranking

> Ranked by **maximum value delivered soonest** for someone actively managing
> gout + high cholesterol + hypertension while pursuing weight loss and fitness.

---

## Priority Framework

Each feature scored on:
- **Daily Use Frequency** — Will you use this every day? (3 = daily, 2 = weekly, 1 = occasional)
- **Condition Impact** — Does this directly influence condition management? (3 = critical, 2 = important, 1 = nice-to-have)
- **Data Foundation** — Does other functionality depend on this data existing? (3 = many dependents, 2 = some, 1 = standalone)

---

## Phase 1: Foundation (Week 1-2) — "I can use this today"

| Rank | Feature | Score | Rationale |
|------|---------|-------|-----------|
| **1** | **db.js + Dexie schema** | — | Everything depends on this. No data layer = no app. |
| **2** | **Profile page** | — | One-time setup. Conditions, preferences, units. Unlocks condition-aware logic everywhere. |
| **3** | **Medications page + adherence** | 9/9 | Used DAILY. Medication adherence is the #1 controllable factor for all three conditions. Missing a statin or allopurinol dose has direct consequences. This is the highest-value daily action. |
| **4** | **Vitals page (BP + weight)** | 8/9 | Used DAILY. BP tracking is the primary self-monitoring tool for hypertension. Weight tracking drives the weight loss goal. These two numbers are the pulse of the app. |
| **5** | **Daily check-in** | 7/9 | Used DAILY. Takes 30 seconds. Sleep/stress/pain data becomes the connective tissue for all future insights. Start collecting immediately — the value compounds over time. |

**Phase 1 Deliverable:** A usable app where you wake up, log BP + weight, mark meds taken, do a 30-second check-in. That alone is valuable.

---

## Phase 2: Condition Management (Week 3-4) — "I can manage my conditions"

| Rank | Feature | Score | Rationale |
|------|---------|-------|-----------|
| **6** | **Hydration tracker** | 7/9 | Used DAILY. Critical for gout (uric acid dilution). Simple UI — just tap to add water. High frequency, low effort, high gout impact. |
| **7** | **Meal log** | 7/9 | Used DAILY. Purine tracking directly manages gout risk. Sat fat awareness supports cholesterol. Sodium awareness supports BP. This is where diet meets all three conditions. |
| **8** | **Gout flare log** | 6/9 | Used AS NEEDED (hopefully rarely). But when a flare happens, capturing it immediately with trigger analysis is invaluable. The 48-hour lookback correlation requires meals + hydration + checkins to already exist. |
| **9** | **Goals page** | 6/9 | Sets targets that make all other tracking meaningful. "My BP is 132/84" means nothing without "My target is < 130/80." |

**Phase 2 Deliverable:** Full daily workflow. Log everything condition-relevant. Flares get captured with context.

---

## Phase 3: Activity & Medical (Week 5-6) — "I can optimize"

| Rank | Feature | Score | Rationale |
|------|---------|-------|-----------|
| **10** | **Workouts page** | 5/9 | Used 3-5x/week. Important for weight loss, cardiovascular health, BP reduction. Joint-stress tracking feeds gout awareness. Depends on check-in and hydration data for safety signals. |
| **11** | **Labs page** | 4/9 | Used every 1-3 months. But when lab results come in, this is where you see if everything is working. Lipid panel trends, uric acid trends — the scorecard for all your daily effort. |
| **12** | **Doctor notes** | 4/9 | Used per visit (quarterly-ish). Captures specialist directives, medication changes, next appointment reminders. Ensures nothing falls through the cracks between visits. |

**Phase 3 Deliverable:** Complete health management app. All data inputs covered.

---

## Phase 4: Intelligence (Week 7-8) — "The app tells me things I didn't know"

| Rank | Feature | Score | Rationale |
|------|---------|-------|-----------|
| **13** | **Dashboard** (full version) | — | The dashboard is built incrementally — a basic version ships in Phase 1 showing whatever data exists. The full version with all cards, alerts, and trends requires all data sources. |
| **14** | **Insights & Trends page** | — | Cross-data correlations: purine intake vs flares, sodium vs BP, exercise consistency vs weight, sleep quality vs next-day BP, medication adherence vs lab improvements. This is the payoff for all the daily logging. |

**Phase 4 Deliverable:** The app becomes a health intelligence tool, not just a logger.

---

## Build Dependency Graph

```
db.js (schema)
  ├── profile
  │     └── (unlocks condition-aware logic everywhere)
  ├── medications + med_adherence
  │     └── goals (adherence streaks as goal metric)
  ├── vitals
  │     ├── goals (weight target, BP target)
  │     └── dashboard (BP card, weight card)
  ├── checkins
  │     ├── flares (48h lookback: stress, sleep)
  │     └── insights (sleep↔BP, stress↔flares)
  ├── hydration
  │     ├── flares (48h lookback: dehydration)
  │     └── goals (daily hydration target)
  ├── meals
  │     ├── flares (48h lookback: purine, alcohol)
  │     └── insights (purine↔flares, sodium↔BP)
  ├── flares (depends on: meals, hydration, checkins, workouts)
  ├── workouts
  │     ├── goals (weekly cardio minutes)
  │     └── flares (48h lookback: exercise intensity)
  ├── labs
  │     ├── goals (LDL target, uric acid target)
  │     └── insights (trend lines, med effectiveness)
  ├── doctor_notes
  │     └── dashboard (upcoming appointments, labs due)
  └── insights (depends on: ALL of the above)
```

---

## Sprint Summary

| Phase | Duration | Daily User Actions Added | Condition Coverage |
|-------|----------|-------------------------|--------------------|
| **1** | Week 1-2 | BP, weight, meds, check-in | Hypertension ✓, All (meds) ✓ |
| **2** | Week 3-4 | + water, meals, flares, goals | + Gout ✓, Cholesterol ✓ |
| **3** | Week 5-6 | + workouts, labs, doctor notes | + Fitness ✓, Full medical ✓ |
| **4** | Week 7-8 | — (intelligence layer) | All conditions: insights + correlations |

---

## What to Build First Tomorrow

If you have 2 hours, build in this exact order:

1. `src/db.js` — Dexie schema (copy from blueprint, done in 10 min)
2. `ProfilePage.vue` — Simple form, save to IndexedDB
3. `MedicationsPage.vue` — Add meds, daily adherence checkbox
4. `VitalsPage.vue` — BP + weight entry form with today's readings displayed

That gives you a functional health app in one sitting.
