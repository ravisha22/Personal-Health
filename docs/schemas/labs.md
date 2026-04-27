# Schema: Labs

> Labs should focus on the values that matter most for gout and cholesterol while keeping only limited background metabolic markers.

```yaml
---
schema: labs
version: 2
---
id: auto
date: "YYYY-MM-DD"
panel_type: "lipid|uric_acid|metabolic|other"

results:
  total_cholesterol: null
  ldl: null
  hdl: null
  triglycerides: null
  non_hdl: null

  uric_acid: null

  glucose: null
  creatinine: null
  egfr: null
  sodium: null
  potassium: null

  custom: []

goal_status:
  summary: "at_goal|borderline|above_goal"
  notes: ""

ordered_by: ""
lab_name: ""
fasting: false
notes: ""
created_at: "ISO-8601"
```

## Priority Review Order

1. **Uric acid** — gout control target
2. **LDL** — primary cholesterol scorecard
3. **Triglycerides** — useful dietary response marker
4. **HDL** — supporting heart-health signal
5. **Metabolic background labs** — context only, not main dashboard focus

## Core Dashboard Flags

- Uric acid above personal target
- LDL above personal target
- Triglycerides worsening vs previous panel
- Lipid panel overdue based on last doctor note
