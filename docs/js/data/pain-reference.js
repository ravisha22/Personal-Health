// pain-reference.js — Pain differentiation reference card (NOT diagnostic)
const PainReference = {
  scale: [
    { level: 0, label: 'No pain', description: 'Completely pain-free' },
    { level: 1, label: 'Barely noticeable', description: 'Very mild, easily forgotten' },
    { level: 2, label: 'Mild', description: 'Easy to ignore, minor awareness' },
    { level: 3, label: 'Noticeable', description: 'Manageable, no movement compensation' },
    { level: 4, label: 'Moderate', description: 'Distracting, slight compensation' },
    { level: 5, label: 'Moderate-strong', description: 'Changes how you move' },
    { level: 6, label: 'Strong', description: 'Hard to continue normally' },
    { level: 7, label: 'Very strong', description: 'Cannot ignore, limits activity' },
    { level: 8, label: 'Severe', description: 'Activity very limited' },
    { level: 9, label: 'Near-unbearable', description: 'Unable to do most activities' },
    { level: 10, label: 'Worst imaginable', description: 'Emergency-level pain' }
  ],

  trafficLight: {
    green: {
      range: '0-2',
      label: 'Continue',
      description: 'Safe. Mild stiffness that warms up. No swelling or redness.',
      action: 'Proceed with planned activity.'
    },
    yellow: {
      range: '3-4',
      label: 'Modify',
      description: 'Noticeable but not worsening set-to-set. No sharp pain.',
      action: 'Reduce load 10-30%, shorten session, swap to low-impact. Must return to baseline by next morning.'
    },
    red: {
      range: '5+',
      label: 'STOP',
      description: 'Sharp, sudden, or worsening pain. Swelling, warmth, redness, limping.',
      action: 'Stop activity. Log symptoms. Consider contacting your doctor.'
    }
  },

  // Reference only — NOT diagnostic
  differentiation: [
    {
      type: 'Gout Flare',
      onset: 'Sudden, often overnight',
      location: 'Joints (big toe, ankle, knee)',
      character: 'Hot, swollen, red, exquisitely tender',
      atRest: 'Severe even at rest',
      duration: 'Days (3-14 typically)',
      note: 'If this is your first episode or you have a fever, seek medical care immediately.'
    },
    {
      type: 'Exercise Soreness (DOMS)',
      onset: '12-48 hours post-exercise',
      location: 'Muscles, usually bilateral/symmetric',
      character: 'Aching, tight, stiff',
      atRest: 'Improves with light movement',
      duration: '1-3 days',
      note: 'Normal response to new or intense exercise. Improves as fitness builds.'
    },
    {
      type: 'Injury / Overload',
      onset: 'During or immediately after a specific movement',
      location: 'Localized to one structure',
      character: 'Sharp, reproducible with specific motion',
      atRest: 'May worsen with trigger movement',
      duration: 'Variable — if lasting >1 week, see a clinician',
      note: 'If associated with instability, inability to bear weight, or significant swelling, seek care.'
    }
  ],

  painTypes: [
    { id: 'sharp', label: 'Sharp' },
    { id: 'dull', label: 'Dull' },
    { id: 'aching', label: 'Aching' },
    { id: 'burning', label: 'Burning' },
    { id: 'stiffness', label: 'Stiffness' },
    { id: 'swelling', label: 'Swelling' },
    { id: 'throbbing', label: 'Throbbing' },
    { id: 'tingling', label: 'Tingling' }
  ],

  contexts: [
    { id: 'during-exercise', label: 'During exercise' },
    { id: 'post-workout', label: 'After workout' },
    { id: 'at-rest', label: 'At rest' },
    { id: 'morning', label: 'Morning / waking up' },
    { id: 'night', label: 'Night time' },
    { id: 'walking', label: 'While walking' }
  ],

  visibleSigns: [
    { id: 'swelling', label: 'Swelling' },
    { id: 'redness', label: 'Redness' },
    { id: 'warmth', label: 'Warmth to touch' },
    { id: 'none', label: 'None visible' }
  ],

  functionEffects: [
    { id: 'none', label: 'No effect on function' },
    { id: 'altered', label: 'Altered movement / compensating' },
    { id: 'stopped', label: 'Had to stop activity' },
    { id: 'disturbed-sleep', label: 'Disturbed sleep' }
  ]
};
