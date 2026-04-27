# Schema: Medications

> Medication adherence is a top-tier behavior for gout, cholesterol, and hypertension management.

## Medication Definition

```yaml
---
schema: medications
version: 2
---
id: auto
name: "Allopurinol"
condition: "gout|cholesterol|hypertension|other"
purpose: "urate_lowering|flare_rescue|statin|bp_control|other"
dosage: "300mg"
frequency: "once_daily|twice_daily|as_needed|weekly"
scheduled_windows:
  - "am"
requires_food: false
prescribing_doctor: ""
pharmacy: ""
start_date: "YYYY-MM-DD"
end_date: null
active: true
refill_date: "YYYY-MM-DD"
adherence_target_pct: 90
side_effects_noted: ""
notes: ""
created_at: "ISO-8601"
updated_at: "ISO-8601"
```

## Daily Adherence Record

```yaml
---
schema: med_adherence
version: 2
---
id: auto
date: "YYYY-MM-DD"
medication_id: 1
scheduled_window: "am|pm|bedtime|with_meal"
status: "taken|missed|late|held"
time_taken: "08:15"
late_by_min: 0
skipped_reason: "forgot|side_effects|ran_out|doctor_advised|other"
notes: ""
created_at: "ISO-8601"
```

## Condition-Specific Use

- **Gout prevention meds**: long-term adherence matters more than symptom-only logging.
- **Flare meds**: should be easy to log during a flare event.
- **Statin meds**: pair adherence with LDL trend review.
- **BP meds**: pair adherence with AM/PM reading trends.

## Computed Metrics

```text
all_active_med_adherence_7d = taken windows / scheduled windows
condition_adherence_pct(condition) = adherence across active meds for that condition
current_full_adherence_streak = consecutive days with all scheduled meds taken
missed_bp_meds_last_7d = count(missed antihypertensive windows in last 7 days)
```
