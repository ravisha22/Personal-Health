# Schema: Daily Check-ins

> Check-ins capture the hidden drivers behind BP variation, flare risk, and habit follow-through.

```yaml
---
schema: checkins
version: 2
---
id: auto
date: "YYYY-MM-DD"
sleep_hours: 7.5
sleep_quality: 4
energy: 3
stress: 2
mood: 4
pain: 1
pain_location: ""
stress_source_tags:
  - "work"
  - "sleep_debt"
bp_stress_flag: false
flare_warning_signs:
  - "joint_twinge"
  - "stiffness"
notes: ""
created_at: "ISO-8601"
```

## Why This Matters

- **Stress + BP** correlation is often stronger than single salty meals alone.
- **Early joint warning signs** help the user log and respond before a full flare escalates.
- **Sleep quality** can explain both BP drift and adherence slippage.
