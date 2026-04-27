# Schema: Hydration

> Track fluid intake. Critical for uric acid management in gout.

```yaml
---
schema: hydration
version: 1
---
id: auto
date: "YYYY-MM-DD"
time: "HH:MM"
amount_oz: 8                    # fluid ounces — UI converts mL ↔ oz
beverage_type: "water|tea|coffee|electrolyte|juice|other"
notes: ""
created_at: "ISO-8601"
```

## Daily Totals (computed, not stored)

```
daily_total_oz = SUM(amount_oz) WHERE date = target_date
daily_goal_oz = profile.preferences.hydration_goal_oz ?? 100
progress_pct = (daily_total_oz / daily_goal_oz) * 100
```

## Gout-Specific Hydration Guidance

- **Minimum target:** 80-100 oz/day (2.4-3.0 L) for uric acid dilution
- **Preferred:** Plain water, herbal tea
- **Caution:** Coffee in moderation (mild diuretic), avoid sugary drinks (fructose raises uric acid)
- **Alert trigger:** If daily total < 50 oz by 6 PM → push notification
