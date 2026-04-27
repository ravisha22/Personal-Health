# Schema: Flares (Gout-Specific)

> Log gout flare events with trigger analysis and treatment tracking.

```yaml
---
schema: flares
version: 1
---
id: auto
date: "YYYY-MM-DD"
time_onset: "HH:MM"

# ── Location & Severity ──
joint: "big_toe|ankle|knee|wrist|finger|elbow|midfoot|other"
side: "left|right|bilateral"
severity: 7                     # 1-10 scale
swelling: "none|mild|moderate|severe"
redness: "none|mild|moderate|severe"

# ── Duration ──
duration_hours: null            # filled when resolved
resolved: false
resolved_date: null

# ── Trigger Analysis ──
suspected_triggers:
  - "diet"                      # high-purine meal in last 48h
  - "alcohol"                   # especially beer
  - "dehydration"               # low water intake
  - "exercise"                  # intense workout
  - "stress"                    # high stress period
  - "weather"                   # barometric pressure change
  - "medication_change"         # dose adjustment
  - "unknown"

# ── 48-Hour Lookback (auto-populated from other tables) ──
preceding_48h:
  high_purine_meals: 2          # count from meals table
  alcohol_servings: 3           # sum from meals table
  avg_hydration_oz: 45          # avg daily oz from hydration table
  exercise_intensity: "vigorous" # max intensity from workouts table
  sleep_avg_hours: 5.5          # from checkins table
  stress_avg: 4                 # from checkins table

# ── Treatment ──
treatment_used: "rest|ice|nsaid|colchicine|prednisone|other"
treatment_details: ""
pain_at_treatment_start: 7      # severity when treatment began
pain_after_24h: 4               # severity 24h after treatment

notes: ""
created_at: "ISO-8601"
```

## Flare Pattern Analysis (computed in useInsights.js)

```
flare_frequency_90d = COUNT(flares) WHERE date >= today - 90
avg_severity = AVG(severity) over last N flares
most_common_joint = MODE(joint) over all flares
most_common_trigger = MODE(suspected_triggers[]) over all flares
avg_resolution_hours = AVG(duration_hours) WHERE resolved = true

// Correlation: high-purine meals → flare within 48h
purine_flare_correlation = flares with preceding_48h.high_purine_meals > 0 / total_flares
```
