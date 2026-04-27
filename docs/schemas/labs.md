# Schema: Labs

> Lab results by panel. One record per panel per date.

```yaml
---
schema: labs
version: 1
---
id: auto
date: "YYYY-MM-DD"
panel_type: "lipid|uric_acid|metabolic|cbc|other"

results:
  # ── Lipid Panel ──
  total_cholesterol: null       # mg/dL — target: < 200
  ldl: null                     # mg/dL — target: < 100 (< 70 if high risk)
  hdl: null                     # mg/dL — target: > 40 (men), > 50 (women)
  triglycerides: null           # mg/dL — target: < 150
  vldl: null                    # mg/dL

  # ── Uric Acid ──
  uric_acid: null               # mg/dL — target: < 6.0 (gout management)

  # ── Basic Metabolic Panel ──
  glucose: null                 # mg/dL — fasting target: 70-100
  bun: null                     # mg/dL — reference: 7-20
  creatinine: null              # mg/dL — reference: 0.7-1.3
  egfr: null                    # mL/min — reference: > 60 (retained as standard metabolic marker, NOT kidney focus)
  sodium: null                  # mEq/L — reference: 136-145
  potassium: null               # mEq/L — reference: 3.5-5.0
  calcium: null                 # mg/dL
  co2: null                     # mEq/L

  # ── Custom ──
  custom:
    - name: ""
      value: null
      unit: ""
      reference_range: ""

ordered_by: ""                  # doctor who ordered
lab_name: ""                    # Quest, LabCorp, hospital lab
fasting: false
notes: ""
created_at: "ISO-8601"
```

## Condition-Relevant Target Ranges

| Marker | Target | Why |
|--------|--------|-----|
| LDL | < 100 mg/dL | Cholesterol management — statin goal |
| HDL | > 40 mg/dL | Cardioprotective |
| Triglycerides | < 150 mg/dL | Cardiovascular risk |
| Uric Acid | < 6.0 mg/dL | Gout — prevent crystal formation |
| Glucose (fasting) | 70-100 mg/dL | Metabolic health |
| eGFR | > 60 mL/min | General metabolic baseline |
