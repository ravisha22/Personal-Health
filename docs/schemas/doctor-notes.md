# Schema: Doctor Notes

> Specialist guidance, medication changes, and appointment tracking.

```yaml
---
schema: doctor_notes
version: 1
---
id: auto
date: "YYYY-MM-DD"

# ── Doctor Info ──
doctor_name: ""
specialty: "rheumatology|cardiology|internal_medicine|pcp|endocrinology|other"
condition: "gout|cholesterol|hypertension|general|multiple"
visit_type: "routine|follow_up|urgent|lab_review|telehealth"

# ── Visit Content ──
summary: ""                     # what was discussed / concluded
directives:                     # action items from doctor
  - "Increase water intake to 100 oz/day"
  - "Reduce red meat to once per week"
  - "Recheck lipid panel in 3 months"

# ── Medication Changes ──
med_changes:
  - action: "add|remove|adjust"
    med_name: "Allopurinol"
    details: "Increase from 200mg to 300mg daily"

# ── Follow-up ──
next_appointment: "YYYY-MM-DD"
labs_ordered:
  - "lipid panel"
  - "uric acid"
  - "cmp"
labs_due_by: "YYYY-MM-DD"

# ── Vitals at Visit ──
visit_bp: "128/82"
visit_weight: 198
visit_heart_rate: 74

notes: ""
created_at: "ISO-8601"
```

## Specialist Map

| Specialist | Manages | Key Actions |
|------------|---------|-------------|
| **Rheumatologist** | Gout | Uric acid targets, allopurinol dosing, flare management protocol |
| **Cardiologist / Internist** | Cholesterol + Hypertension | Statin dosing, BP medication, lipid targets, cardiovascular risk |
| **PCP** | General / Coordination | Weight management, lifestyle, referrals, annual physical |

## Reminders Logic (computed)

```
upcoming_appointments = SELECT * FROM doctor_notes
  WHERE next_appointment >= today
  ORDER BY next_appointment ASC

labs_due_soon = SELECT * FROM doctor_notes
  WHERE labs_due_by >= today AND labs_due_by <= today + 14
```
