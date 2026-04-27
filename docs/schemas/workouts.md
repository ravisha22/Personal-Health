# Schema: Workouts

> Exercise tracking with gout joint awareness and cardio targets for hypertension.

```yaml
---
schema: workouts
version: 1
---
id: auto
date: "YYYY-MM-DD"
time: "HH:MM"
type: "cardio|strength|flexibility|walking|swimming|cycling|yoga|other"
name: ""                        # e.g., "Morning walk", "Upper body strength"
duration_min: 30
intensity: "low|moderate|vigorous"

# ── Cardiovascular ──
avg_heart_rate: null            # bpm if tracked
max_heart_rate: null
calories_est: null

# ── Gout Awareness ──
joints_stressed:                # joints bearing load — correlate with flares
  - "ankle"
  - "knee"

# ── Weekly Target Tracking (computed) ──
# AHA recommendation: 150 min moderate cardio OR 75 min vigorous per week
# weekly_cardio_min = SUM(duration_min WHERE intensity IN ('moderate','vigorous') AND date IN current_week)

notes: ""
created_at: "ISO-8601"
```

## Exercise Intensity Guide

| Intensity | Heart Rate Zone | Examples | Gout Risk |
|-----------|----------------|----------|-----------|
| **Low** | 50-60% max HR | Stretching, slow walk, yoga | Very low |
| **Moderate** | 60-70% max HR | Brisk walk, light cycling, swimming | Low |
| **Vigorous** | 70-85% max HR | Running, HIIT, heavy lifting | Moderate — can spike uric acid via dehydration and lactic acid |

## Gout-Exercise Precautions

- Sudden intense exercise can trigger flares (lactic acid competes with uric acid for excretion)
- Hydrate extra 16-24 oz for sessions > 30 min
- Avoid exercise during active flare
- Low-impact preferred: swimming, cycling, walking
