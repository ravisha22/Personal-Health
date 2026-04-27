# Schema: Profile

> Single record per user. `id` is always `me`. This record stores the targets and defaults that personalize dashboard alerts.

```yaml
---
schema: profile
version: 2
---
id: "me"
name: ""
dob: "YYYY-MM-DD"
height_in: 70
sex: "male|female|other"
conditions:
  - gout
  - high_cholesterol
  - hypertension
allergies: []
emergency_contacts:
  - name: ""
    phone: ""
    relationship: ""

condition_targets:
  gout:
    uric_acid_max: 6.0
    flare_review_window_days: 90
  cholesterol:
    ldl_max: 100
    triglycerides_max: 150
    hdl_min: 40
  hypertension:
    systolic_max: 130
    diastolic_max: 80
    sodium_goal_mg: 2000
  weight:
    target_weight: null
    weekly_change_goal_lb: -1.0

preferences:
  weight_unit: "lbs"
  fluid_unit: "oz"
  temp_unit: "F"
  bp_format: "mmHg"
  hydration_goal_oz: 100
  fiber_goal_g: 30
  sat_fat_goal_g: 15
  mediterranean_goal_score: 4
  notifications: true
  reminder_times:
    am_meds: "08:00"
    pm_meds: "20:00"
    bp_am: "07:30"
    bp_pm: "19:30"
created_at: "ISO-8601"
updated_at: "ISO-8601"
```

## Why These Defaults Matter

- **Uric acid goal** drives gout alerts and flare-risk summaries.
- **LDL / triglyceride goals** drive cholesterol cards and lab flagging.
- **BP + sodium goals** power the hypertension dashboard and meal warnings.
- **Fiber / sat fat / Mediterranean defaults** support meal scoring without custom setup each day.
