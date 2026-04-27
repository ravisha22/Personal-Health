# Schema: Goals

> Condition-specific and general health goals with progress tracking.

```yaml
---
schema: goals
version: 1
---
id: auto
category: "weight|bp|cholesterol|uric_acid|fitness|hydration|diet|custom"

title: "Reach 185 lbs"
description: ""

# ── Target Definition ──
metric: "weight_lbs"            # maps to a computed value from another table
target_value: 185
target_operator: "<="           # <= | >= | == | between
current_value: 205              # updated periodically from source data
baseline_value: 215             # value when goal was created

# ── Timeline ──
target_date: "YYYY-MM-DD"
status: "active|achieved|paused|abandoned"

# ── Progress ──
milestones:
  - value: 210
    label: "First 5 lbs"
    achieved: true
    achieved_date: "2024-01-15"
  - value: 200
    label: "Under 200"
    achieved: true
    achieved_date: "2024-03-01"
  - value: 190
    label: "10 lbs to go"
    achieved: false

notes: ""
created_at: "ISO-8601"
updated_at: "ISO-8601"
```

## Suggested Default Goals

| Category | Goal | Metric | Target |
|----------|------|--------|--------|
| **Weight** | Reach target weight | `weight_lbs` | Set by user |
| **BP** | Maintain normal BP | `avg_systolic_7d` | ≤ 130 |
| **Cholesterol** | LDL in target range | `latest_ldl` | ≤ 100 |
| **Uric Acid** | Keep uric acid below 6.0 | `latest_uric_acid` | ≤ 6.0 |
| **Fitness** | 150 min cardio/week | `weekly_cardio_min` | ≥ 150 |
| **Hydration** | 80+ oz water daily | `daily_avg_hydration_oz` | ≥ 80 |
| **Diet** | < 3 high-purine meals/week | `weekly_high_purine_count` | ≤ 3 |

## Metric-to-Source Mapping

```js
const METRIC_SOURCES = {
  weight_lbs:             () => latestVital('weight'),
  avg_systolic_7d:        () => avgVitalRange('bp', 7, 'primary'),
  latest_ldl:             () => latestLab('lipid', 'ldl'),
  latest_uric_acid:       () => latestLab('uric_acid', 'uric_acid'),
  weekly_cardio_min:      () => sumWorkoutsThisWeek('moderate', 'vigorous'),
  daily_avg_hydration_oz: () => avgHydration(7),
  weekly_high_purine_count: () => countMeals({ purine_level: 'high', days: 7 }),
};
```
