# Personal Health Dashboard — Technical Blueprint v2.0

> **Conditions managed:** Gout · High Cholesterol · Hypertension
> **Goals:** Weight loss · Fitness · Prevention & optimization
> **All conditions medication-managed and stable — this is optimization, not crisis.**

---

## 1. Page Structure — Every Page & Its Purpose

| #  | Route                | Page Name             | Purpose |
|----|----------------------|-----------------------|---------|
| 1  | `/`                  | **Dashboard**         | At-a-glance: today's BP, weight trend, last uric acid, medication adherence streak, hydration %, upcoming appointments. Condition-aware alerts (e.g., "Lipid panel due in 2 weeks"). |
| 2  | `/vitals`            | **Vitals Tracker**    | Log & visualize weight, blood pressure (systolic/diastolic), resting heart rate. Chart trends over 7d/30d/90d/1y. Highlight when BP enters elevated range. |
| 3  | `/labs`              | **Lab Results**       | Enter lab work: lipid panel (total cholesterol, LDL, HDL, triglycerides), uric acid, basic metabolic panel (BUN, creatinine, glucose, eGFR). Track values against target ranges set by specialists. |
| 4  | `/meals`             | **Meal Log**          | Log meals with purine-level tagging (low/medium/high), saturated fat awareness, sodium estimate. Daily macro summary. Flag meals that are high-risk for gout or cholesterol. |
| 5  | `/hydration`         | **Hydration**         | Track daily water intake (oz/mL). Show progress toward personalized goal. Hydration is critical for uric acid management — gout-aware reminders. |
| 6  | `/workouts`          | **Workouts**          | Log exercises: type, duration, intensity, heart rate zone. Track weekly cardio minutes (target: 150+ moderate). Flag high-intensity sessions that could trigger gout flares. |
| 7  | `/medications`       | **Medications**       | Medication list with dosage, frequency, time-of-day. Daily adherence check-in. Streak tracking. Covers: allopurinol/febuxostat (gout), statin (cholesterol), antihypertensive (BP). |
| 8  | `/flares`            | **Gout Flare Log**    | Log flare events: joint affected, severity 1-10, duration, suspected trigger, treatment used. Correlate with diet/hydration/exercise preceding 48hrs. |
| 9  | `/checkins`          | **Daily Check-in**    | Quick daily survey: sleep hours + quality, energy 1-5, stress 1-5, mood 1-5, pain 1-5. Surfaces patterns (e.g., poor sleep → higher BP next day). |
| 10 | `/goals`             | **Goals & Progress**  | Set and track targets: weight goal, BP target range, LDL target, uric acid target, weekly workout minutes, daily water intake. Visual progress bars + trend lines. |
| 11 | `/doctor-notes`      | **Doctor Notes**      | Log specialist guidance from: rheumatologist (gout), cardiologist/internist (cholesterol + BP), PCP. Medication changes, lab order schedules, lifestyle directives. Tag by condition. |
| 12 | `/profile`           | **Profile & Settings**| Personal info, condition list, medication allergies, emergency contacts, unit preferences (lbs/kg, °F/°C), notification preferences, data export. |
| 13 | `/insights`          | **Insights & Trends** | Cross-data correlations: meal purine levels vs flare frequency, sodium intake vs BP readings, exercise consistency vs weight trend, medication adherence vs lab improvements. |

**Removed:** Kidney-specific pages (nephrology dashboard, renal function tracker, kidney diet planner). Kidney metrics (eGFR, creatinine) are retained in labs as part of standard metabolic panel only — no dedicated kidney UX.

---

## 2. Project Folder Structure

```
Personal-Health/
├── docs/
│   ├── architecture/
│   │   ├── technical-blueprint.md          ← this file
│   │   └── implementation-order.md
│   └── schemas/
│       ├── profile.md
│       ├── vitals.md
│       ├── labs.md
│       ├── meals.md
│       ├── hydration.md
│       ├── workouts.md
│       ├── medications.md
│       ├── flares.md
│       ├── checkins.md
│       ├── goals.md
│       └── doctor-notes.md
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── main.js                             ← app entry, router setup
│   ├── db.js                               ← Dexie.js schema + helpers
│   ├── router.js                           ← route definitions
│   ├── pages/
│   │   ├── DashboardPage.vue
│   │   ├── VitalsPage.vue
│   │   ├── LabsPage.vue
│   │   ├── MealsPage.vue
│   │   ├── HydrationPage.vue
│   │   ├── WorkoutsPage.vue
│   │   ├── MedicationsPage.vue
│   │   ├── FlaresPage.vue
│   │   ├── CheckinsPage.vue
│   │   ├── GoalsPage.vue
│   │   ├── DoctorNotesPage.vue
│   │   ├── ProfilePage.vue
│   │   └── InsightsPage.vue
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.vue                ← nav bar, bottom tabs, layout
│   │   │   └── PageHeader.vue
│   │   ├── charts/
│   │   │   ├── TrendLineChart.vue          ← reusable line chart (weight, BP, labs)
│   │   │   ├── BarChart.vue                ← hydration, workout minutes
│   │   │   └── ProgressRing.vue            ← goal completion rings
│   │   ├── forms/
│   │   │   ├── VitalEntryForm.vue
│   │   │   ├── MealEntryForm.vue
│   │   │   ├── WorkoutEntryForm.vue
│   │   │   ├── FlareEntryForm.vue
│   │   │   ├── CheckinForm.vue
│   │   │   ├── LabEntryForm.vue
│   │   │   └── MedAdherenceForm.vue
│   │   ├── cards/
│   │   │   ├── DashboardCard.vue           ← reusable summary card
│   │   │   ├── MedicationCard.vue
│   │   │   └── AlertCard.vue               ← condition-aware alerts
│   │   └── shared/
│   │       ├── DatePicker.vue
│   │       ├── RatingScale.vue             ← 1-5 / 1-10 input
│   │       └── UnitToggle.vue              ← lbs/kg, oz/mL
│   ├── composables/
│   │   ├── useVitals.js                    ← CRUD + trend queries for vitals
│   │   ├── useLabs.js
│   │   ├── useMeals.js
│   │   ├── useHydration.js
│   │   ├── useWorkouts.js
│   │   ├── useMedications.js
│   │   ├── useFlares.js
│   │   ├── useCheckins.js
│   │   ├── useGoals.js
│   │   ├── useDoctorNotes.js
│   │   └── useInsights.js                  ← cross-table correlation queries
│   ├── utils/
│   │   ├── constants.js                    ← purine levels, BP ranges, target ranges
│   │   ├── formatters.js                   ← date, unit, number formatting
│   │   └── validators.js                   ← form validation rules
│   └── assets/
│       └── styles/
│           └── main.css
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. IndexedDB Schema — Dexie.js Table Definitions

```js
// src/db.js
import Dexie from 'dexie';

const db = new Dexie('PersonalHealthDB');

db.version(1).stores({

  // ─── Profile ───────────────────────────────────────────────
  // Single-row table. id is always 'me'.
  profile: 'id',
  // Fields: id, name, dob, height_in, weight_unit, fluid_unit,
  //         temp_unit, conditions[], allergies[], emergency_contacts[],
  //         created_at, updated_at

  // ─── Vitals ────────────────────────────────────────────────
  // Weight, blood pressure, heart rate. Multiple entries per day allowed.
  vitals: '++id, date, type, created_at',
  // Fields: id (auto), date (YYYY-MM-DD), time (HH:MM),
  //         type (weight|bp|heart_rate),
  //         value_primary (weight in lbs, systolic, bpm),
  //         value_secondary (null, diastolic, null),
  //         unit, notes, created_at
  // Indexes: date → range queries, type → filter by vital type

  // ─── Labs ──────────────────────────────────────────────────
  // Lab results grouped by panel date.
  labs: '++id, date, panel_type, created_at',
  // Fields: id (auto), date (YYYY-MM-DD),
  //         panel_type (lipid|uric_acid|metabolic|other),
  //         results: {
  //           // lipid panel:
  //           total_cholesterol, ldl, hdl, triglycerides,
  //           // uric acid:
  //           uric_acid,
  //           // basic metabolic panel:
  //           glucose, bun, creatinine, egfr, sodium, potassium,
  //           // custom:
  //           custom_name, custom_value, custom_unit
  //         },
  //         ordered_by (doctor name), lab_name, notes, created_at

  // ─── Workouts ──────────────────────────────────────────────
  workouts: '++id, date, type, created_at',
  // Fields: id (auto), date (YYYY-MM-DD), time (HH:MM),
  //         type (cardio|strength|flexibility|walking|swimming|cycling|other),
  //         name (e.g., "Morning jog"), duration_min,
  //         intensity (low|moderate|vigorous),
  //         avg_heart_rate, calories_est,
  //         joints_stressed[] (for gout awareness — e.g., ["ankle","knee"]),
  //         notes, created_at

  // ─── Meals ─────────────────────────────────────────────────
  meals: '++id, date, meal_type, purine_level, created_at',
  // Fields: id (auto), date (YYYY-MM-DD), time (HH:MM),
  //         meal_type (breakfast|lunch|dinner|snack),
  //         description, items[],
  //         purine_level (low|medium|high),
  //         sat_fat_flag (boolean — was this notably high in sat fat?),
  //         sodium_est_mg (estimated sodium in mg),
  //         calories_est, protein_g, carbs_g, fat_g,
  //         alcohol (boolean), alcohol_type, alcohol_servings,
  //         notes, created_at
  // Indexes: purine_level → gout correlation queries

  // ─── Flares (Gout-Specific) ────────────────────────────────
  flares: '++id, date, severity, joint, created_at',
  // Fields: id (auto), date (YYYY-MM-DD), time_onset (HH:MM),
  //         joint (big_toe|ankle|knee|wrist|finger|elbow|other),
  //         severity (1-10), duration_hours,
  //         suspected_triggers[] (diet|alcohol|dehydration|exercise|stress|weather|unknown),
  //         treatment_used (rest|ice|nsaid|colchicine|prednisone|other),
  //         treatment_details,
  //         resolved (boolean), resolved_date,
  //         notes, created_at

  // ─── Hydration ─────────────────────────────────────────────
  hydration: '++id, date, created_at',
  // Fields: id (auto), date (YYYY-MM-DD), time (HH:MM),
  //         amount_oz (fluid ounces — convert from mL in UI),
  //         beverage_type (water|tea|coffee|electrolyte|other),
  //         notes, created_at
  // Note: daily total is computed by summing entries for a date

  // ─── Medications ───────────────────────────────────────────
  medications: '++id, name, condition, active',
  // Fields: id (auto), name (e.g., "Allopurinol"),
  //         condition (gout|cholesterol|hypertension|other),
  //         dosage (e.g., "300mg"), frequency (e.g., "once_daily"),
  //         time_of_day (morning|evening|both|with_meals),
  //         prescribing_doctor, pharmacy,
  //         start_date, end_date,
  //         active (1|0),
  //         side_effects_noted, notes, created_at, updated_at

  // ─── Medication Adherence (separate for daily tracking) ────
  med_adherence: '++id, date, medication_id, [date+medication_id]',
  // Fields: id (auto), date (YYYY-MM-DD), medication_id (FK → medications.id),
  //         taken (boolean), time_taken (HH:MM),
  //         skipped_reason, notes, created_at
  // Compound index: [date+medication_id] → one entry per med per day

  // ─── Goals ─────────────────────────────────────────────────
  goals: '++id, category, status, created_at',
  // Fields: id (auto),
  //         category (weight|bp|cholesterol|uric_acid|fitness|hydration|diet|custom),
  //         title (e.g., "Reach 185 lbs"),
  //         metric (e.g., "weight_lbs"),
  //         target_value, current_value,
  //         target_date (YYYY-MM-DD),
  //         status (active|achieved|paused|abandoned),
  //         notes, created_at, updated_at

  // ─── Daily Check-ins ───────────────────────────────────────
  checkins: '++id, &date',
  // Fields: id (auto), date (YYYY-MM-DD — unique, one per day),
  //         sleep_hours (decimal), sleep_quality (1-5),
  //         energy (1-5), stress (1-5), mood (1-5), pain (1-5),
  //         pain_location,
  //         notes, created_at
  // Unique index on date: exactly one check-in per day

  // ─── Doctor Notes ──────────────────────────────────────────
  doctor_notes: '++id, date, doctor_name, condition, created_at',
  // Fields: id (auto), date (YYYY-MM-DD),
  //         doctor_name, specialty (rheumatology|cardiology|internal_med|pcp|other),
  //         condition (gout|cholesterol|hypertension|general),
  //         visit_type (routine|follow_up|urgent|lab_review|telehealth),
  //         summary, directives[],
  //         med_changes[] (array of {action: add|remove|adjust, med_name, details}),
  //         next_appointment (YYYY-MM-DD),
  //         labs_ordered[], notes, created_at

});

export default db;
```

### Index Design Rationale

| Table | Key Indexes | Why |
|-------|-------------|-----|
| `vitals` | `date`, `type` | Range queries for charts ("all BP readings this month"), filter by type |
| `labs` | `date`, `panel_type` | "Show all lipid panels" or "labs from last 6 months" |
| `meals` | `date`, `meal_type`, `purine_level` | "Show all high-purine meals in last 30 days" for gout correlation |
| `flares` | `date`, `severity`, `joint` | "Flares in last 90 days", "worst flares", "flares by joint" |
| `med_adherence` | `date`, `medication_id`, `[date+medication_id]` | "Did I take allopurinol today?" — compound index prevents duplicates |
| `checkins` | `&date` (unique) | Exactly one check-in per day, fast lookup by date |
| `goals` | `category`, `status` | "Show active fitness goals" |
| `doctor_notes` | `date`, `doctor_name`, `condition` | "What did the rheumatologist say last visit?" |

---

## 4. Revised Markdown Schemas — YAML Frontmatter

These schemas define the format if we ever export data to markdown files, and serve as the canonical field reference.

Each schema is documented in its own file under `docs/schemas/`:

| Schema File | Record Type | Key Condition Relevance |
|-------------|-------------|------------------------|
| [`profile.md`](../schemas/profile.md) | User profile | Condition list, preferences |
| [`vitals.md`](../schemas/vitals.md) | Weight, BP, HR | **Hypertension** monitoring, weight loss |
| [`labs.md`](../schemas/labs.md) | Lab panels | **Cholesterol** (lipids), **Gout** (uric acid), metabolic baseline |
| [`meals.md`](../schemas/meals.md) | Meal entries | **Gout** (purine levels), **Cholesterol** (sat fat), **Hypertension** (sodium) |
| [`hydration.md`](../schemas/hydration.md) | Fluid intake | **Gout** (uric acid dilution) |
| [`workouts.md`](../schemas/workouts.md) | Exercise sessions | **Hypertension** (cardio), **Gout** (joint stress awareness) |
| [`medications.md`](../schemas/medications.md) | Med list + adherence | All three conditions — daily adherence is #1 lever |
| [`flares.md`](../schemas/flares.md) | Gout flare events | **Gout** — trigger analysis, 48h lookback correlation |
| [`checkins.md`](../schemas/checkins.md) | Daily wellness | Sleep/stress/mood → cross-condition correlation |
| [`goals.md`](../schemas/goals.md) | Health targets | All conditions — measurable targets with progress |
| [`doctor-notes.md`](../schemas/doctor-notes.md) | Specialist visits | All conditions — treatment directives, appointment tracking |

---

## 5. Implementation Order

> See full detail: [`implementation-order.md`](./implementation-order.md)

### Quick Summary — Build in This Order

| Phase | Week | What to Build | Why First |
|-------|------|---------------|-----------|
| **1** | 1-2 | db.js, Profile, Medications + Adherence, Vitals (BP + weight), Daily Check-in | Daily habit = daily value. Meds adherence is the #1 controllable lever. |
| **2** | 3-4 | Hydration, Meals (purine/sodium/sat-fat), Gout Flare Log, Goals | Covers all 3 conditions' dietary triggers + flare capture. |
| **3** | 5-6 | Workouts, Labs, Doctor Notes | Activity tracking + medical record keeping. |
| **4** | 7-8 | Full Dashboard, Insights & Trends | Cross-data correlations — the intelligence payoff. |

### First Build Session Checklist (2 hours)

```
[x] 1. src/db.js         — Dexie schema (10 min)
[ ] 2. ProfilePage.vue    — One-time setup form
[ ] 3. MedicationsPage    — Add meds + daily adherence toggle
[ ] 4. VitalsPage.vue     — BP + weight entry + today's readings
```
