# Schema: Vitals

> Weight is the shared metric. Blood pressure is the hypertension metric. Both need better context than a single raw number.

```yaml
---
schema: vitals
version: 2
---
id: auto
date: "YYYY-MM-DD"
time: "HH:MM"
type: "weight|bp|heart_rate"

# Shared values
value_primary: null
value_secondary: null
unit: "lbs|mmHg|bpm"
notes: ""
created_at: "ISO-8601"

# Weight context
fasting: false
weigh_in_reason: "routine|post_flare|doctor_visit|other"

# BP context
reading_window: "am|pm|other"
before_medication: true
rested_min: 5
position: "seated|standing|lying"
cuff_arm: "left|right"
symptoms:
  - "headache"
  - "dizziness"
```

## Computed Metrics That Matter

```text
avg_am_bp_7d = average(bp where reading_window = 'am' over last 7 days)
avg_pm_bp_7d = average(bp where reading_window = 'pm' over last 7 days)
bp_in_range_pct_30d = days with avg BP <= target / logged days
weight_change_30d = latest_weight - weight_30_days_ago
rolling_weight_avg_7d = average(weight over last 7 days)
```

## Dashboard Use

- Show **AM vs PM BP split**, not one blended number only.
- Show **7-day weight average** to reduce reaction to day-to-day swings.
- Flag **BP drifting higher after high-stress or high-sodium days**.
