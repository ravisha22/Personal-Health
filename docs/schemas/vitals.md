# Schema: Vitals

> Weight, blood pressure, resting heart rate. Multiple entries per day allowed.

```yaml
---
schema: vitals
version: 1
---
id: auto
date: "YYYY-MM-DD"
time: "HH:MM"
type: "weight|bp|heart_rate"

# Polymorphic values based on type:

# type: weight
value_primary: 195.5           # weight in preferred unit
value_secondary: null
unit: "lbs"

# type: bp
value_primary: 128             # systolic
value_secondary: 82            # diastolic
unit: "mmHg"

# type: heart_rate
value_primary: 72              # bpm
value_secondary: null
unit: "bpm"

# context
position: "seated|standing|lying"   # BP-specific
fasting: false                       # weight-specific — morning fasted weight?
notes: ""
created_at: "ISO-8601"
```

## BP Classification Reference (AHA)

| Category    | Systolic     | Diastolic   |
|-------------|-------------|-------------|
| Normal      | < 120       | < 80        |
| Elevated    | 120-129     | < 80        |
| Stage 1 HTN | 130-139    | 80-89       |
| Stage 2 HTN | ≥ 140      | ≥ 90        |
| Crisis      | > 180       | > 120       |

The app should color-code BP entries based on this table.
