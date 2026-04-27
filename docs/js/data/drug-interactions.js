// drug-interactions.js — Known interaction reference (NOT diagnostic)
const DrugInteractions = {
  disclaimer: 'This is general reference information, not personalized medical advice. Always consult your doctor or pharmacist about your specific medications.',

  interactions: [
    {
      category: 'Diuretics & Gout',
      drugs: ['Hydrochlorothiazide (HCTZ)', 'Furosemide', 'Chlorthalidone'],
      condition: 'gout',
      risk: 'high',
      warning: 'Thiazide and loop diuretics may increase uric acid levels, potentially worsening gout.',
      suggestion: 'Discuss with your doctor whether losartan (an ARB that lowers uric acid) or amlodipine (uric acid-neutral) might be alternatives.'
    },
    {
      category: 'NSAIDs & Blood Pressure',
      drugs: ['Ibuprofen', 'Naproxen', 'Indomethacin', 'Diclofenac'],
      condition: 'hypertension',
      risk: 'high',
      warning: 'NSAIDs can raise blood pressure and reduce the effectiveness of BP medications. They may also affect kidney function.',
      suggestion: 'For gout flares, discuss with your rheumatologist about using colchicine or a short steroid course as alternatives.'
    },
    {
      category: 'Statin Muscle Effects',
      drugs: ['Simvastatin', 'Atorvastatin', 'Rosuvastatin', 'Pravastatin'],
      condition: 'cholesterol',
      risk: 'moderate',
      warning: 'Statins can rarely cause muscle pain (myopathy) that might be confused with gout or exercise soreness.',
      suggestion: 'Gout = single hot joint. Statin myopathy = diffuse, symmetric muscle aching. Report new muscle pain to your doctor.'
    },
    {
      category: 'Grapefruit Interactions',
      drugs: ['Simvastatin', 'Atorvastatin', 'Amlodipine', 'Felodipine'],
      condition: 'cholesterol',
      risk: 'moderate',
      warning: 'Grapefruit can increase blood levels of certain statins and calcium channel blockers.',
      suggestion: 'Avoid grapefruit and grapefruit juice. Ask your pharmacist about your specific medications.'
    },
    {
      category: 'Losartan & Gout (Positive)',
      drugs: ['Losartan'],
      condition: 'gout',
      risk: 'beneficial',
      warning: 'Losartan (an ARB for blood pressure) has a mild uric acid-lowering effect.',
      suggestion: 'If you need a BP medication, losartan may provide a dual benefit for both blood pressure and gout management.'
    },
    {
      category: 'Low-dose Aspirin & Uric Acid',
      drugs: ['Aspirin (low-dose/cardioprotective)'],
      condition: 'gout',
      risk: 'low',
      warning: 'Low-dose aspirin can slightly raise uric acid levels.',
      suggestion: 'This is generally not a reason to stop cardioprotective aspirin. Discuss with your doctor.'
    },
    {
      category: 'Allopurinol & ACE Inhibitors',
      drugs: ['Allopurinol + Captopril', 'Allopurinol + Enalapril'],
      condition: 'gout',
      risk: 'low',
      warning: 'Rare hypersensitivity reactions have been reported with this combination.',
      suggestion: 'Be aware of this interaction but it is rarely a reason to avoid the combination. Report any new rash or skin reaction.'
    }
  ],

  // Check user's medications against known interactions
  checkMedications(medNames) {
    const results = [];
    const normalizedMeds = medNames.map(m => m.toLowerCase());

    for (const interaction of this.interactions) {
      for (const drug of interaction.drugs) {
        if (normalizedMeds.some(m => drug.toLowerCase().includes(m) || m.includes(drug.toLowerCase().split(' ')[0]))) {
          results.push(interaction);
          break;
        }
      }
    }
    return results;
  }
};
