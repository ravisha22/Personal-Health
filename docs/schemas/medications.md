# Schema: Medications

> Medication management with adherence tracking. Separate tables for medication definitions vs. daily adherence.

## Medication Definition

```yaml
---
schema: medications
version: 1
---
id: auto
name: "Allopurinol"
condition: "gout|cholesterol|hypertension|other"
dosage: "300mg"
frequency: "once_daily|twice_daily|as_needed|weekly"
time_of_day: "morning|evening|both|with_meals|bedtime"
prescribing_doctor: ""
pharmacy: ""
start_date: "YYYY-MM-DD"
end_date: null                  # null if ongoing
active: true
refill_date: "YYYY-MM-DD"      # next refill due
side_effects_noted: ""
notes: ""
created_at: "ISO-8601"
updated_at: "ISO-8601"
```

## Daily Adherence Record

```yaml
---
schema: med_adherence
version: 1
---
id: auto
date: "YYYY-MM-DD"
medication_id: 1                # FK → medications.id
taken: true
time_taken: "08:15"
skipped_reason: ""              # forgot|side_effects|ran_out|doctor_advised|other
notes: ""
created_at: "ISO-8601"
```

## Expected Medication Stack

| Condition | Typical Medication | Class | Key Monitoring |
|-----------|-------------------|-------|----------------|
| **Gout** | Allopurinol or Febuxostat | Xanthine oxidase inhibitor | Uric acid levels (target < 6.0) |
| **Cholesterol** | Atorvastatin or Rosuvastatin | Statin | LDL, liver enzymes |
| **Hypertension** | Lisinopril, Amlodipine, or Losartan | ACE-I / CCB / ARB | BP readings |
| **Gout (acute)** | Colchicine or NSAIDs | Anti-inflammatory | Flare frequency |

## Adherence Metrics (computed)

```
streak_days = consecutive days WHERE taken = true (for a given medication_id)
monthly_adherence_pct = (days_taken / days_in_month) * 100
missed_last_7d = COUNT WHERE taken = false AND date >= today - 7
```
