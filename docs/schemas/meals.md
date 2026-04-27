# Schema: Meals

> Meal logging with gout + cholesterol awareness built in.

```yaml
---
schema: meals
version: 1
---
id: auto
date: "YYYY-MM-DD"
time: "HH:MM"
meal_type: "breakfast|lunch|dinner|snack"

description: ""                 # free-text meal description
items:                          # optional itemized breakdown
  - name: "grilled salmon"
    portion: "6 oz"

# ── Condition-Aware Fields ──
purine_level: "low|medium|high"
#   low:    most vegetables, fruits, dairy, eggs, bread
#   medium: chicken, beans, mushrooms, oats
#   high:   organ meats, shellfish, red meat, sardines, beer

sat_fat_flag: false             # true if notably high in saturated fat
sodium_est_mg: null             # estimated sodium (mg) — hypertension awareness
alcohol: false
alcohol_type: ""                # beer|wine|spirits — beer is worst for gout
alcohol_servings: 0

# ── Macros (estimated) ──
calories_est: null
protein_g: null
carbs_g: null
fat_g: null
fiber_g: null

notes: ""
created_at: "ISO-8601"
```

## Purine Reference Guide (embedded in app as constants)

| Category | Foods | Purine Content |
|----------|-------|----------------|
| **HIGH** (avoid/limit) | Organ meats, shellfish, sardines, anchovies, red meat, beer, high-fructose drinks | > 200 mg/100g |
| **MEDIUM** (moderate) | Chicken, turkey, pork, beans, lentils, mushrooms, spinach, oatmeal | 100-200 mg/100g |
| **LOW** (preferred) | Dairy, eggs, most fruits, most vegetables, whole grains, nuts, coffee, water | < 100 mg/100g |

## Sat Fat Flag Logic

Flag `sat_fat_flag: true` when a meal contains:
- Fried foods
- Full-fat cheese > 2 oz
- Red meat > 4 oz
- Processed meats (bacon, sausage)
- Cream-based sauces
- Baked goods with butter
