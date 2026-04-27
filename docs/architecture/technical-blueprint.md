# Personal Health Dashboard — Technical Blueprint v2.1

> **Conditions managed:** Gout · High Cholesterol · Hypertension  
> **Shared priorities:** Weight loss · Medication adherence · Joint-safe exercise · Better food choices  
> **Clinical posture:** Under specialist control; the app supports day-to-day self-management between visits.

---

## Context Map

### Files to Modify
| File | Purpose | Changes Needed |
|------|---------|----------------|
| `docs/architecture/technical-blueprint.md` | Canonical app architecture + Dexie model | Refocus the product around gout, cholesterol, hypertension, weight, exercise, medications, dashboard UX, and gamification |
| `docs/schemas/profile.md` | User-level defaults and goals | Add condition targets plus nutrition and reminder preferences that drive the dashboard |
| `docs/schemas/vitals.md` | Weight/BP tracking | Add AM/PM blood pressure context and weight trend metrics |
| `docs/schemas/labs.md` | Lab result model | Keep emphasis on uric acid + lipid panel, de-emphasize kidney-only thinking |
| `docs/schemas/meals.md` | Diet logging model | Add purine, sodium, saturated fat, fiber, and Mediterranean diet scoring |
| `docs/schemas/medications.md` | Medication definitions and adherence | Make adherence more actionable for gout, statin, and BP medication workflows |
| `docs/schemas/flares.md` | Gout flare model | Strengthen joint, trigger, treatment, and lookback analysis |
| `docs/schemas/workouts.md` | Exercise model | Make cardio, strength, and joint-safe exercise explicit |
| `docs/schemas/checkins.md` | Stress/sleep/wellness model | Improve BP-stress and flare-warning correlation inputs |
| `docs/schemas/goals.md` | Goal engine | Add cross-condition goals and streak-friendly targets |

### Dependencies (may need updates)
| File | Relationship |
|------|--------------|
| `docs/architecture/implementation-order.md` | References dashboard, flares, labs, meals, workouts, and insights flows described here |
| `docs/schemas/*.md` | The blueprint links to these schema files as canonical field references |

### Test Files
| Test | Coverage |
|------|----------|
| None present | Repository currently contains architecture/schema docs only |

### Reference Patterns
| File | Pattern |
|------|---------|
| `docs/schemas/flares.md` | Example of condition-specific schema with computed insights |
| `docs/schemas/medications.md` | Example of definition table + daily tracking table split |
| `docs/architecture/implementation-order.md` | Existing roadmap language for dashboard and insights pages |

### Risk Assessment
- [x] Breaking changes to public API
- [x] Database migrations needed
- [ ] Configuration changes required

**Interpretation:** there is no shipped runtime here yet, but if the future app already uses the earlier Dexie model, these schema changes imply a Dexie version bump and migration.

---

## 1. Revised Product Focus

| Condition | Primary things to track | Why it matters in this app |
|-----------|-------------------------|----------------------------|
| **Gout** | Uric acid, flare logs, purine exposure, hydration, acute treatment response | Prevent flares and identify repeat triggers |
| **High Cholesterol** | Lipid panel, saturated fat, fiber, Mediterranean-style eating, statin adherence | Improve LDL/triglycerides and long-term heart risk |
| **Hypertension** | AM/PM BP, sodium exposure, stress, exercise, antihypertensive adherence | Detect patterns and keep home readings in range |
| **Weight** | Daily/weekly trend, waist-friendly progress, momentum | Weight loss improves all three conditions |
| **Exercise** | Cardio minutes, strength sessions, low-impact options, flare-safe substitutions | Supports BP, lipids, and weight without provoking gout |
| **Medications** | Daily adherence and missed-dose patterns | Most direct controllable lever across all three conditions |

### Product Rules

1. **No kidney-patient framing.** Kidney markers may remain inside general labs, but the UX should not feel renal-centered.
2. **Weight is a shared metric.** Weight change should appear on nearly every review screen because it influences gout, cholesterol, and BP.
3. **BP must be contextual.** AM vs PM, before vs after medication, and stress context matter more than isolated readings.
4. **Meals must serve all three conditions at once.** Each meal should capture purine load, sodium awareness, saturated fat, fiber, and a simple Mediterranean score.
5. **Exercise must be heart-healthy and joint-safe.** Encourage walking, cycling, swimming, mobility work, and sensible strength training.

---

## 2. Dashboard Design for These Conditions

### Hero Metrics (top row)

1. **Today’s blood pressure card**
   - Latest AM reading
   - Latest PM reading
   - 7-day average
   - In-range / elevated / stage label
2. **Weight trend card**
   - Current weight
   - 7-day rolling average
   - 30-day change
3. **Medication adherence card**
   - Today: meds due / taken / missed
   - 7-day adherence %
   - Current streak
4. **Gout status card**
   - Days since last flare
   - Last uric acid value + date
   - High-risk trigger exposure this week
5. **Heart health card**
   - Latest LDL and triglycerides
   - Weekly cardio minutes
   - Mediterranean diet score this week

### Condition-Specific Alerts / Flags

- **Gout**
  - Uric acid above personal goal
  - High-purine streak ≥ 2 days
  - Alcohol + low hydration same day
  - Flare recorded without rescue-treatment note
- **Cholesterol**
  - Lipid panel overdue
  - Saturated fat average above goal this week
  - Fiber average below goal this week
  - Statin adherence below 90%
- **Hypertension**
  - AM or PM average above personal target for 3+ days
  - Repeated PM readings significantly higher than AM
  - Sodium-heavy day followed by elevated BP
  - Missed BP meds in last 7 days
- **Cross-cutting**
  - Weight trend rising 2+ consecutive weeks
  - No exercise logged for 4+ days
  - Stress high for 3 straight days with BP worsening

### Charts That Matter Most

1. **Weight trend** — daily values + 7-day moving average
2. **AM/PM BP chart** — split systolic/diastolic by time of day
3. **Uric acid + flare timeline** — uric acid points with flare markers
4. **LDL / HDL / triglyceride trend** — lab-to-lab comparison
5. **Weekly lifestyle correlation chart**
   - sodium vs next-day BP
   - purine exposure vs flare occurrence
   - cardio minutes vs weight/BP improvement

### Weekly Review Focus

- BP in range days
- Weight change this week
- High-purine meals and flare-risk days
- Saturated fat / sodium / fiber averages
- Medication adherence by condition
- Cardio minutes and strength sessions completed

### Monthly Review Focus

- Weight trend versus target pace
- Best / worst BP week of the month
- Flare count, severity, and top trigger patterns
- Lipid panel due status or lab trend changes
- Which habits most strongly aligned with better BP, lower flare risk, and steady weight loss

---

## 3. Page Structure — Every Page & Its Purpose

| # | Route | Page Name | Purpose |
|---|-------|-----------|---------|
| 1 | `/` | **Dashboard** | Action-oriented summary for BP, weight, gout, meds, labs due, weekly diet quality, and exercise consistency |
| 2 | `/vitals` | **Vitals Tracker** | Weight plus AM/PM blood pressure logging with medication/stress context |
| 3 | `/labs` | **Lab Results** | Uric acid and lipid panel trends with target comparisons |
| 4 | `/meals` | **Meal Log** | Purine, saturated fat, sodium, fiber, alcohol, and Mediterranean score tracking |
| 5 | `/hydration` | **Hydration** | Water progress for gout protection and exercise recovery |
| 6 | `/workouts` | **Workouts** | Cardio, strength, mobility, and recovery sessions with joint-safety tags |
| 7 | `/medications` | **Medications** | Medication list, refill planning, and daily adherence logging for all three conditions |
| 8 | `/flares` | **Gout Flare Log** | Capture flare details, triggers, treatment, and lookback data |
| 9 | `/checkins` | **Daily Check-in** | Stress, sleep, symptoms, and early warning signals that affect BP and flares |
| 10 | `/goals` | **Goals & Progress** | Shared and condition-specific goals, streaks, milestones, and behavior targets |
| 11 | `/doctor-notes` | **Doctor Notes** | Specialist advice, med changes, labs due, and follow-up dates |
| 12 | `/profile` | **Profile & Settings** | Targets, preferences, reminder schedule, and nutrition defaults |
| 13 | `/insights` | **Insights & Trends** | Cross-condition pattern analysis and practical habit correlations |

---

## 4. Project Folder Structure

```
Personal-Health/
├── docs/
│   ├── architecture/
│   │   ├── technical-blueprint.md
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
├── src/
│   ├── db.js
│   ├── pages/
│   ├── components/
│   ├── composables/
│   └── utils/
├── package.json
└── vite.config.js
```

---

## 5. Revised IndexedDB Schema — Dexie.js Table Definitions

```js
// src/db.js
import Dexie from 'dexie';

const db = new Dexie('PersonalHealthDB');

db.version(2).stores({
  profile: 'id',
  vitals: '++id, date, type, reading_window, created_at',
  labs: '++id, date, panel_type, created_at',
  meals: '++id, date, meal_type, purine_level, mediterranean_score, created_at',
  hydration: '++id, date, created_at',
  workouts: '++id, date, session_focus, joint_safe, created_at',
  medications: '++id, name, condition, active',
  med_adherence: '++id, date, medication_id, scheduled_window, [date+medication_id+scheduled_window]',
  flares: '++id, date, severity, primary_joint, created_at',
  checkins: '++id, &date',
  goals: '++id, category, status, created_at',
  doctor_notes: '++id, date, doctor_name, condition, created_at',
  achievement_progress: '&id, category, condition, status, updated_at',
});
```

### Core Tables & Practical Fields

#### `profile`
- `condition_targets.gout.uric_acid_max`
- `condition_targets.cholesterol.ldl_max`
- `condition_targets.hypertension.systolic_max`, `diastolic_max`
- `condition_targets.weight.target_weight`
- `preferences.hydration_goal_oz`, `sodium_goal_mg`, `fiber_goal_g`, `sat_fat_goal_g`
- `preferences.mediterranean_goal_score`

#### `vitals`
- Supports `type: weight | bp | heart_rate`
- BP-specific context:
  - `reading_window: am | pm | other`
  - `before_medication`
  - `rested_min`
  - `symptoms[]`
- Weight-specific context:
  - `fasting`
  - `weigh_in_reason: routine | post_flare | doctor_visit | other`

#### `labs`
- `panel_type: lipid | uric_acid | metabolic | other`
- Lipid panel fields:
  - `total_cholesterol`, `ldl`, `hdl`, `triglycerides`
- Gout field:
  - `uric_acid`
- Optional metabolic background:
  - `glucose`, `creatinine`, `egfr`, `sodium`, `potassium`
- Each panel can store `goal_status` notes like `at_goal`, `borderline`, `above_goal`

#### `meals`
- `purine_level`, `purine_points`
- `sodium_est_mg`
- `saturated_fat_g`, `unsaturated_fat_g`, `fiber_g`
- `high_fructose_flag`
- `alcohol_type`, `alcohol_servings`
- `mediterranean_score` (0-5 simple score)

#### `workouts`
- `session_focus: cardio | strength | mobility | recovery`
- `impact_level: low | medium | high`
- `joint_safe`
- `gout_modification_used`
- `hydration_extra_oz`

#### `medications`
- Tracks urate-lowering therapy, flare meds, statin, and antihypertensive meds
- Practical fields:
  - `requires_food`
  - `scheduled_windows[]`
  - `refill_date`
  - `adherence_target_pct`

#### `med_adherence`
- One row per med per scheduled window
- Fields:
  - `scheduled_window: am | pm | bedtime | with_meal`
  - `status: taken | missed | late | held`
  - `time_taken`, `late_by_min`, `skipped_reason`

#### `flares`
- `primary_joint`, `affected_joints[]`
- `severity`, `swelling`, `redness`, `mobility_limit`
- `suspected_triggers[]`
- `pre_flare_snapshot` with prior 48h diet, hydration, stress, medication, and workout signals
- `treatment_used[]`, `response_after_24h`

#### `checkins`
- `stress`, `sleep_hours`, `pain`, `mood`, `energy`
- `stress_source_tags[]`
- `bp_stress_flag`
- `flare_warning_signs[]`

#### `goals`
- Categories should include:
  - `weight`, `bp`, `lipids`, `uric_acid`, `med_adherence`, `flare_free`, `nutrition`, `exercise`
- Supports milestones and streak-friendly targets

#### `achievement_progress`
- Stores earned / active / locked achievements
- Useful fields:
  - `id`, `title`, `category`, `condition`, `status`
  - `current_progress`, `target_value`
  - `streak_days`, `best_streak_days`, `earned_at`

### Index Design Rationale

| Table | Key Indexes | Why |
|-------|-------------|-----|
| `vitals` | `date`, `type`, `reading_window` | Supports AM vs PM BP trend analysis |
| `labs` | `date`, `panel_type` | Fast lab-over-lab comparisons |
| `meals` | `date`, `meal_type`, `purine_level`, `mediterranean_score` | Supports gout risk review and heart-healthy meal scoring |
| `workouts` | `date`, `session_focus`, `joint_safe` | Helps surface sustainable exercise patterns |
| `flares` | `date`, `severity`, `primary_joint` | Flare frequency and joint pattern review |
| `med_adherence` | `date`, `medication_id`, `scheduled_window`, compound key | Prevents duplicate adherence entries and supports AM/PM checks |
| `achievement_progress` | `category`, `condition`, `status` | Dashboard-ready streak and badge summaries |

---

## 6. Condition-Specific Tracking Features

### Gout Features That Matter Most

- **Flare log** with date, severity, joints involved, swelling/redness, treatment, and recovery time
- **Trigger analysis** based on prior 48 hours:
  - high-purine meals
  - alcohol
  - dehydration
  - hard workouts
  - stress spikes
  - missed urate-lowering medication
- **Purine diary** with simple low / medium / high tagging and weekly exposure count
- **Flare-free streak** and "days since last flare" prominently shown
- **During-flare exercise guidance**: mobility or upper-body substitutions rather than high-impact activity

### Cholesterol Features That Matter Most

- **Lipid trend view** for total, LDL, HDL, triglycerides
- **Saturated fat tracking** at meal and weekly average level
- **Fiber intake tracking** because it is a practical food lever for LDL improvement
- **Mediterranean meal scoring** to reward consistent heart-healthy choices
- **Statin adherence + lab review pairing** so medication and labs are reviewed together

### Hypertension Features That Matter Most

- **BP logging by time of day** with AM/PM splits
- **Pre/post medication context** to spot whether timing matters
- **Sodium tracking** with daily totals and next-day BP correlation
- **Stress log** from daily check-ins tied to elevated readings
- **In-range percentage** over 7, 30, and 90 days rather than isolated single readings

### Cross-Cutting Features That Leverage Overlap

- **Weight trend** as a shared success indicator across all three conditions
- **Mediterranean diet score** because it helps cholesterol, BP, and weight while still allowing gout-aware adjustments
- **Medication adherence rollup** across all active medications
- **Exercise balance view**:
  - weekly cardio minutes
  - weekly strength sessions
  - low-impact consistency
- **Insight cards** like:
  - "Lower-sodium days were followed by lower PM BP"
  - "Weeks with more fiber correlated with lower weight"
  - "Most flares followed dehydration + high-purine exposure"

---

## 7. Gamification & Motivation

### Achievements / Streaks

| Achievement | Logic | Why it works |
|-------------|-------|--------------|
| **Medication Lock-In** | 7 / 14 / 30 day streak taking all scheduled meds | Reinforces the highest-impact habit |
| **Flare-Free Run** | Consecutive days without a gout flare | Gives gout management a visible win |
| **Pressure in Control** | 5 of 7 days with BP average in target range | Rewards consistency, not perfection |
| **Heart-Healthy Plate** | 3 / 5 / 7 consecutive meals with good Mediterranean score and sodium/sat-fat within goal | Makes diet goals tangible meal-by-meal |
| **Joint-Safe Mover** | 3 weeks hitting exercise goals with only low-impact / gout-safe sessions during risk periods | Encourages exercise without provoking flares |
| **Weight Momentum** | 2 / 4 / 8 weeks of stable downward trend or maintenance within target plan | Keeps attention on the shared metric |
| **Fiber Builder** | Average fiber goal met 5 days in a week | Connects nutrition to cholesterol and satiety |
| **Low-Sodium Week** | Daily sodium goal met 6 of 7 days | Practical hypertension reinforcement |

### Motivation Design Rules

1. **Use streaks for controllable behaviors** (meds taken, meals logged, sodium goal met), not for lab outcomes.
2. **Do not punish flare days.** If a flare occurs, shift rewards toward logging it quickly, hydrating, and following the treatment plan.
3. **Celebrate substitutions.** A short walk, swim, or mobility session during a gout-risk week should still count toward exercise consistency.
4. **Show progress ladders.** Example: 3-day, 7-day, 14-day, and 30-day adherence milestones.
5. **Tie reviews to achievements.** The weekly review should explain what unlocked a streak and what broke it.

---

## 8. Canonical Schema References

| File | Purpose | Condition Relevance |
|------|---------|---------------------|
| [`profile.md`](../schemas/profile.md) | Targets and preferences | All three conditions |
| [`vitals.md`](../schemas/vitals.md) | Weight + AM/PM BP logging | Hypertension + weight |
| [`labs.md`](../schemas/labs.md) | Uric acid + lipids | Gout + cholesterol |
| [`meals.md`](../schemas/meals.md) | Purine, sodium, sat fat, fiber, Mediterranean score | All three conditions |
| [`medications.md`](../schemas/medications.md) | Med definitions + adherence windows | All three conditions |
| [`flares.md`](../schemas/flares.md) | Flare events + trigger analysis | Gout |
| [`workouts.md`](../schemas/workouts.md) | Cardio, strength, mobility, joint safety | BP + weight + gout-safe exercise |
| [`checkins.md`](../schemas/checkins.md) | Stress, sleep, warning signs | BP + flare correlation |
| [`goals.md`](../schemas/goals.md) | Targets, milestones, streak support | All three conditions |

---

## 9. Implementation Priority Summary

1. **Foundations first:** profile, medications, vitals, meals, hydration
2. **Condition intelligence second:** flares, labs, check-ins
3. **Behavior reinforcement third:** goals, achievements, dashboard insights
4. **Cross-condition payoff last:** correlation cards and monthly review summaries
