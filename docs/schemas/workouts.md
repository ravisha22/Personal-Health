# Schema: Workouts

> Exercise should improve BP, cholesterol, and weight while staying realistic during gout-prone periods.

```yaml
---
schema: workouts
version: 2
---
id: auto
date: "YYYY-MM-DD"
time: "HH:MM"
name: "Brisk walk"
session_focus: "cardio|strength|mobility|recovery"
type: "walking|cycling|swimming|strength|yoga|elliptical|other"
duration_min: 30
intensity: "low|moderate|vigorous"
impact_level: "low|medium|high"
joint_safe: true
gout_modification_used: false
avg_heart_rate: null
calories_est: null
hydration_extra_oz: 16
joints_stressed:
  - "ankle"
notes: ""
created_at: "ISO-8601"
```

## Weekly Fitness Scorecard

```text
weekly_cardio_min = sum(duration where session_focus = 'cardio')
weekly_strength_sessions = count(session_focus = 'strength')
weekly_joint_safe_sessions = count(joint_safe = true)
exercise_consistency_streak = consecutive weeks with target activity met
```

## Coaching Logic

- Prefer **walking, cycling, swimming, elliptical, and mobility** during gout-risk weeks.
- Count **strength sessions** separately so metabolism support is visible.
- Reward **modified sessions** during flare-prone periods instead of treating them as failures.
