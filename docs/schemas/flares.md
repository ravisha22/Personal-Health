# Schema: Flares (Gout-Specific)

> The flare log should help answer: what happened, where, how severe, what likely triggered it, and what helped.

```yaml
---
schema: flares
version: 2
---
id: auto
date: "YYYY-MM-DD"
time_onset: "HH:MM"
primary_joint: "big_toe|ankle|knee|midfoot|wrist|finger|elbow|other"
affected_joints:
  - "left_big_toe"
severity: 7
swelling: "none|mild|moderate|severe"
redness: "none|mild|moderate|severe"
mobility_limit: "none|mild|moderate|severe"
resolved: false
resolved_date: null
duration_hours: null
suspected_triggers:
  - "high_purine_meal"
  - "alcohol"
  - "dehydration"
  - "stress"
  - "hard_workout"
  - "missed_medication"
  - "unknown"
pre_flare_snapshot:
  high_purine_meals_48h: 0
  alcohol_servings_48h: 0
  avg_hydration_48h_oz: 0
  avg_sodium_48h_mg: 0
  vigorous_sessions_48h: 0
  avg_stress_48h: 0
  missed_urate_lowering_doses_7d: 0
treatment_used:
  - "rest"
  - "ice"
  - "colchicine"
response_after_24h: "better|same|worse"
notes: ""
created_at: "ISO-8601"
```

## Computed Review Metrics

```text
days_since_last_flare = today - latest(flare.date)
flare_frequency_90d = count(flares in last 90 days)
avg_flare_severity_90d = average(severity in last 90 days)
most_common_trigger = mode(suspected_triggers)
most_common_joint = mode(primary_joint)
```

## High-Value Dashboard Outputs

- Days since last flare
- Top trigger this quarter
- Average severity trend
- Common joint involved
- Whether missed meds or dehydration are recurring pre-flare patterns
