// purine-guide.js — Food purine levels (reference only)
const PurineGuide = {
  // Gout trigger checkboxes for meal logging
  triggers: [
    { id: 'beer', label: '🍺 Beer / Alcohol', risk: 'high' },
    { id: 'organ-meats', label: '🫀 Organ meats (liver, kidney)', risk: 'high' },
    { id: 'shellfish', label: '🦐 High-purine seafood (anchovies, sardines, mussels)', risk: 'high' },
    { id: 'hfcs', label: '🥤 Sugary drinks / High-fructose corn syrup', risk: 'high' },
    { id: 'processed-meat', label: '🌭 Processed / cured meats', risk: 'high' },
    { id: 'red-meat', label: '🥩 Red meat (beef, lamb, pork)', risk: 'moderate' },
    { id: 'spirits', label: '🥃 Spirits (vodka, whisky, etc.)', risk: 'moderate' },
  ],

  // Full reference guide (for the reference page)
  foods: {
    eatFreely: {
      label: '✅ Eat Freely',
      description: 'Low purine, beneficial for gout + heart health',
      items: [
        'All vegetables (plant purines don\'t trigger gout)',
        'Fruits — especially cherries (gout-protective)',
        'Whole grains, oats, brown rice',
        'Legumes (lentils, chickpeas, beans)',
        'Olive oil, nuts, avocado',
        'Low-fat dairy (gout-protective)',
        'Coffee (gout-protective, BP-neutral if habituated)',
        'Water — 2.5-3L daily (critical for gout)',
      ]
    },
    eatModerately: {
      label: '✅ Eat Moderately',
      description: 'Moderate purine — benefits outweigh risks',
      items: [
        'Salmon, trout (omega-3 benefits outweigh moderate purine)',
        'Skinless poultry (chicken, turkey)',
        'Eggs (~1/day generally fine)',
        'Wine — max 1 glass (least bad alcohol for gout)',
      ]
    },
    limit: {
      label: '⚠️ Limit Significantly',
      description: 'Higher purine or bad for BP/cholesterol',
      items: [
        'Red meat (≤1×/week, lean cuts only)',
        'High-purine seafood: anchovies, sardines, mussels, scallops',
        'Sodium: <2300 mg/day, ideally <1500 mg',
        'Saturated fat: butter, fatty cuts, full-fat cheese, fried food',
        'Added sugars and fructose (especially HFCS)',
      ]
    },
    avoid: {
      label: '🚫 Minimize / Avoid',
      description: 'Worst triggers for gout + cardiovascular health',
      items: [
        'Beer — worst gout trigger (purines + alcohol double hit)',
        'Excess spirits',
        'Organ meats (liver, kidney, sweetbreads)',
        'Processed / cured meats (sodium + purines + sat fat)',
        'Sugar-sweetened beverages (HFCS raises uric acid + triglycerides)',
      ]
    }
  }
};
