# Schema: Meals

> Each meal should explain gout risk, cholesterol quality, and hypertension impact at the same time.

```yaml
---
schema: meals
version: 2
---
id: auto
date: "YYYY-MM-DD"
time: "HH:MM"
meal_type: "breakfast|lunch|dinner|snack"
description: ""
items:
  - name: "grilled chicken"
    portion: "5 oz"

purine_level: "low|medium|high"
purine_points: 0
sodium_est_mg: null
saturated_fat_g: null
unsaturated_fat_g: null
fiber_g: null
high_fructose_flag: false
alcohol: false
alcohol_type: "beer|wine|spirits|none"
alcohol_servings: 0
mediterranean_score: 0
calories_est: null
protein_g: null
carbs_g: null
fat_g: null
notes: ""
created_at: "ISO-8601"
```

## Practical Scoring Rules

### Purine tracking
- `low` = preferred baseline meal
- `medium` = okay in moderation
- `high` = gout-risk meal worth surfacing in weekly review

### Mediterranean score (0-5 simple meal score)
Add 1 point each for:
- vegetables or legumes present
- fruit present
- whole grains present
- olive oil / nuts / unsaturated fat emphasis
- lean or plant-forward protein choice

Subtract 1 practical point in dashboard warnings when:
- sodium is very high
- saturated fat is high
- beer or sugar-sweetened beverage is present

## Weekly Nutrition Metrics

```text
weekly_high_purine_count = count(meals where purine_level = 'high')
weekly_avg_sodium = average(sodium_est_mg by day)
weekly_avg_sat_fat = average(saturated_fat_g by day)
weekly_avg_fiber = average(fiber_g by day)
weekly_mediterranean_score = average(mediterranean_score)
```
