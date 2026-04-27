# Schema: Goals

> Goals should reflect controllable actions and the shared wins that benefit gout, cholesterol, and hypertension together.

```yaml
---
schema: goals
version: 2
---
id: auto
category: "weight|bp|lipids|uric_acid|med_adherence|flare_free|nutrition|exercise|custom"
title: "Maintain BP in target range"
description: ""
metric: "bp_in_range_pct_30d"
target_value: 80
target_operator: ">="
current_value: 62
baseline_value: 45
target_date: "YYYY-MM-DD"
status: "active|achieved|paused|abandoned"
milestones:
  - value: 60
    label: "Getting consistent"
    achieved: true
  - value: 80
    label: "Target reached"
    achieved: false
notes: ""
created_at: "ISO-8601"
updated_at: "ISO-8601"
```

## Recommended Default Goals

| Category | Example Goal | Metric |
|----------|--------------|--------|
| Weight | Lose weight at sustainable pace | `rolling_weight_avg_7d` |
| BP | Keep 80% of days in range | `bp_in_range_pct_30d` |
| Lipids | Bring LDL below target | `latest_ldl` |
| Uric acid | Keep uric acid below goal | `latest_uric_acid` |
| Medication adherence | Hit 90%+ adherence | `all_active_med_adherence_7d` |
| Flare free | Extend days since flare | `days_since_last_flare` |
| Nutrition | Achieve Mediterranean score average | `weekly_mediterranean_score` |
| Exercise | Meet cardio + strength targets | `weekly_cardio_min` + `weekly_strength_sessions` |

## Streak-Friendly Principle

Use goal cards to show:
- current streak
- best streak
- what broke the streak last time
- smallest next action to restart momentum
