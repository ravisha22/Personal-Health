# Schema: Profile

> Single record per user. id is always `me`.

```yaml
---
schema: profile
version: 1
---
id: "me"
name: ""
dob: "YYYY-MM-DD"
height_in: 70                  # inches — convert to cm in UI if needed
sex: "male|female|other"
conditions:
  - gout
  - high_cholesterol
  - hypertension
allergies: []
emergency_contacts:
  - name: ""
    phone: ""
    relationship: ""
preferences:
  weight_unit: "lbs"           # lbs | kg
  fluid_unit: "oz"             # oz | mL
  temp_unit: "F"               # F | C
  bp_format: "mmHg"
  notifications: true
  reminder_times:
    morning: "08:00"
    evening: "20:00"
created_at: "ISO-8601"
updated_at: "ISO-8601"
```
