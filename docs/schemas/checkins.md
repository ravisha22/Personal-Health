# Schema: Daily Check-ins

> One per day. Quick wellness snapshot: sleep, energy, mood, stress, pain.

```yaml
---
schema: checkins
version: 1
---
id: auto
date: "YYYY-MM-DD"              # UNIQUE — one check-in per day

# ── Sleep ──
sleep_hours: 7.5                # decimal hours
sleep_quality: 4                # 1 (terrible) to 5 (excellent)
bed_time: "23:00"               # optional
wake_time: "06:30"              # optional

# ── Wellness Scores ──
energy: 3                       # 1 (exhausted) to 5 (highly energized)
stress: 2                       # 1 (calm) to 5 (extremely stressed)
mood: 4                         # 1 (very low) to 5 (excellent)
pain: 1                         # 1 (none) to 5 (severe)
pain_location: ""               # free text if pain > 1

notes: ""
created_at: "ISO-8601"
```

## Score Definitions

| Score | Energy | Stress | Mood | Pain |
|-------|--------|--------|------|------|
| 1 | Exhausted, can barely function | Completely calm | Very low, depressed | No pain |
| 2 | Low energy, dragging | Slight tension | Below average | Mild discomfort |
| 3 | Average, functional | Moderate, manageable | Neutral, okay | Moderate, noticeable |
| 4 | Good energy, productive | Elevated but coping | Good, positive | Significant, limiting |
| 5 | Highly energized | Overwhelmed, can't focus | Excellent, thriving | Severe, debilitating |

## Cross-Condition Correlation Value

Check-ins feed into insights:
- **Sleep quality vs BP next morning** → hypertension management
- **Stress level vs gout flare onset** → gout trigger identification
- **Pain trending upward** → early flare detection
- **Energy + mood decline** → medication side-effect signal
