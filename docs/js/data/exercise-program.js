/* =====================================================================
 * exercise-program.js
 * Personal Trainer / Health Council
 * 4-week progressive program (Weeks 4 – 7) with daily cardio,
 * gout-aware modifications, and curated YouTube form tutorials.
 *
 * Loadable in a browser via <script src="exercise-program.js"></script>.
 * Uses `var` for maximum compatibility.
 * =====================================================================
 *
 * NOTE on YouTube IDs:
 *   IDs are the part of a URL after "v=" (e.g. youtube.com/watch?v=XXXX).
 *   Where a confidently-correct, well-known tutorial could be identified
 *   it is referenced directly. Where uncertainty exists, the field is
 *   set to 'dQw4w9WgXcQ' and `placeholder: true` is added so the front-
 *   end can flag it for manual verification.
 * ===================================================================== */

/* ---------------------------------------------------------------------
 * 1. EXERCISE LIBRARY
 * ------------------------------------------------------------------- */
var ExerciseLibrary = {

  /* ---------- CARDIO / WARM-UP MACHINES ---------- */
  'bike-warmup': {
    name: 'Stationary Bike – Warm-up',
    targetMuscles: ['Quadriceps', 'Hamstrings', 'Calves', 'Cardiovascular'],
    why: 'Raises core temperature and lubricates knee/ankle joints with zero impact.',
    formCues: [
      'Saddle height: slight bend in knee at bottom of stroke',
      'Light resistance, smooth circular pedalling',
      'Relaxed grip, upright torso'
    ],
    youtubeId: 'dQw4w9WgXcQ',
    placeholder: true,
    goutModification: 'Excellent during flare — non-weight-bearing.'
  },
  'treadmill-walk': {
    name: 'Treadmill Walk (Steady State)',
    targetMuscles: ['Cardiovascular', 'Calves', 'Glutes'],
    why: 'Zone-2 cardio for cardiovascular health, fat oxidation and uric-acid clearance via improved circulation.',
    formCues: [
      'Upright posture, eyes forward',
      'Natural arm swing — DO NOT hold the rails',
      'Heel-strike to toe-off, full foot contact'
    ],
    youtubeId: 'dQw4w9WgXcQ',
    placeholder: true,
    goutModification: 'Reduce speed to 3.5 km/hr or substitute bike during flare.'
  },
  'treadmill-cooldown': {
    name: 'Treadmill Walk – Cool-down',
    targetMuscles: ['Cardiovascular'],
    why: 'Gradually returns heart rate to baseline and prevents blood pooling.',
    formCues: ['Slow, conversational pace', 'Deep nasal breathing'],
    youtubeId: 'dQw4w9WgXcQ',
    placeholder: true,
    goutModification: 'No change.'
  },

  /* ---------- WARM-UP MOBILITY ---------- */
  'cat-cow': {
    name: 'Cat-Cow',
    targetMuscles: ['Spinal Erectors', 'Abdominals'],
    why: 'Mobilises the thoracic and lumbar spine before loaded work.',
    formCues: [
      'Hands under shoulders, knees under hips',
      'Move from the spine, not the arms',
      'Inhale to extend (cow), exhale to flex (cat)'
    ],
    youtubeId: 'kqnua4rHVVA',
    goutModification: 'No change — non-weight-bearing on feet.'
  },
  'world-greatest-stretch': {
    name: 'World\'s Greatest Stretch',
    targetMuscles: ['Hip Flexors', 'Thoracic Spine', 'Hamstrings', 'Adductors'],
    why: 'Full-body dynamic mobility hitting every major movement plane.',
    formCues: [
      'Long lunge, back knee off the floor',
      'Plant opposite hand, rotate other hand to ceiling',
      '2 reps per side, controlled'
    ],
    youtubeId: 'ccSskxueWWk',
    goutModification: 'Skip if big toe MTP joint is painful — substitute seated thoracic rotations.'
  },
  'band-pull-apart': {
    name: 'Band Pull-Apart',
    targetMuscles: ['Rear Deltoid', 'Rhomboids', 'Mid-Trapezius'],
    why: 'Activates the upper-back stabilisers before any pressing or pulling.',
    formCues: [
      'Arms straight, band at chest height',
      'Squeeze shoulder blades together',
      'Slow eccentric, no shrugging'
    ],
    youtubeId: 'gPAv95uvN0c',
    placeholder: true,
    goutModification: 'No change.'
  },
  'glute-bridge-warmup': {
    name: 'Glute Bridge (Warm-up)',
    targetMuscles: ['Gluteus Maximus', 'Hamstrings'],
    why: 'Wakes up the glutes — critical because weak glutes overload the knees and feet.',
    formCues: [
      'Feet flat, knees ~90°',
      'Drive through heels, squeeze glutes at top',
      'Ribs down, no lumbar over-arch'
    ],
    youtubeId: 'wPM8icPu6H8',
    placeholder: true,
    goutModification: 'No change — supine.'
  },
  'scapular-wall-slide': {
    name: 'Scapular Wall Slide',
    targetMuscles: ['Lower Trapezius', 'Serratus Anterior'],
    why: 'Grooves overhead shoulder mechanics for pressing days.',
    formCues: [
      'Lower back, head and forearms touch the wall',
      'Slide arms up keeping contact',
      'Stop at the point you lose contact'
    ],
    youtubeId: 'dQw4w9WgXcQ',
    placeholder: true,
    goutModification: 'No change.'
  },

  /* ---------- UPPER BODY: PUSH ---------- */
  'chest-press-machine': {
    name: 'Chest Press Machine',
    targetMuscles: ['Pectorals', 'Anterior Deltoid', 'Triceps'],
    why: 'Builds chest and pushing strength. Seated = zero load on ankle/knee.',
    formCues: [
      'Shoulder blades pinned to pad',
      'Elbows ~45° from torso, not flared',
      'Don\'t lock elbows at top'
    ],
    youtubeId: 'xUm0BiZfWrI',
    placeholder: true,
    goutModification: 'No change — fully seated.'
  },
  'seated-shoulder-press-machine': {
    name: 'Seated Shoulder Press Machine',
    targetMuscles: ['Deltoids', 'Triceps', 'Upper Trapezius'],
    why: 'Vertical pressing pattern; machine path is safe for shoulder learners.',
    formCues: [
      'Adjust seat so handles align with mid-shoulder',
      'Press in a straight line, no shoulder shrug',
      'Control the eccentric (2 sec down)'
    ],
    youtubeId: 'Wqq43dKW1TU',
    placeholder: true,
    goutModification: 'No change — seated.'
  },
  'cable-tricep-pushdown': {
    name: 'Cable Tricep Pushdown',
    targetMuscles: ['Triceps'],
    why: 'Isolates the triceps to round out the push day.',
    formCues: [
      'Elbows pinned to ribs',
      'Only the forearms move',
      'Full lock-out, slow return'
    ],
    youtubeId: '2-LAMcpzODU',
    placeholder: true,
    goutModification: 'Perform seated on a bench if standing aggravates the foot.'
  },
  'db-lateral-raise': {
    name: 'Dumbbell Lateral Raise',
    targetMuscles: ['Lateral Deltoid'],
    why: 'Builds shoulder width and stability of the glenohumeral joint.',
    formCues: [
      'Slight forward lean, soft elbow bend',
      'Lead with the elbow, not the hand',
      'Stop at shoulder height — no higher'
    ],
    youtubeId: 'OuG1smZTsQQ',
    placeholder: true,
    goutModification: 'Perform seated on a bench during flare.'
  },

  /* ---------- UPPER BODY: PULL ---------- */
  'lat-pulldown': {
    name: 'Lat Pulldown',
    targetMuscles: ['Latissimus Dorsi', 'Biceps', 'Rear Deltoid'],
    why: 'Vertical pull — main back-width builder, fully seated.',
    formCues: [
      'Thighs locked under the pad',
      'Drive elbows down and back, chest up',
      'Bar to upper chest, not behind the neck'
    ],
    youtubeId: 'CAwf7n6Luuc',
    placeholder: true,
    goutModification: 'No change — seated.'
  },
  'seated-cable-row': {
    name: 'Seated Cable Row',
    targetMuscles: ['Mid-Trapezius', 'Rhomboids', 'Latissimus Dorsi', 'Biceps'],
    why: 'Horizontal pull — corrects rounded posture from desk work.',
    formCues: [
      'Tall torso, slight hinge from hips',
      'Pull handle to lower ribs',
      'Squeeze blades together at end-range'
    ],
    youtubeId: 'GZbfZ033f74',
    placeholder: true,
    goutModification: 'No change — seated.'
  },
  'machine-rear-delt-fly': {
    name: 'Machine Rear-Delt Fly',
    targetMuscles: ['Rear Deltoid', 'Rhomboids'],
    why: 'Targets the often-neglected rear delts for shoulder health and posture.',
    formCues: [
      'Chest pinned to pad',
      'Slight elbow bend, lead with the elbow',
      'Squeeze blades at end of motion'
    ],
    youtubeId: 'GbjQbiHQOPg',
    placeholder: true,
    goutModification: 'No change — seated.'
  },
  'db-bicep-curl': {
    name: 'Dumbbell Bicep Curl',
    targetMuscles: ['Biceps Brachii', 'Brachialis'],
    why: 'Direct biceps work, completes the pull day.',
    formCues: [
      'Elbows stay at sides',
      'Supinate (turn palm up) on the way up',
      'Slow 2-sec eccentric'
    ],
    youtubeId: 'av7-8igSXTs',
    placeholder: true,
    goutModification: 'Perform seated during flare.'
  },
  'face-pull': {
    name: 'Cable Face Pull',
    targetMuscles: ['Rear Deltoid', 'External Rotators', 'Mid-Trap'],
    why: 'Best single exercise for shoulder health and posture.',
    formCues: [
      'Rope at eye level',
      'Pull to forehead, elbows high',
      'External rotation at the end — \"draw the bow\"'
    ],
    youtubeId: 'rep-qVOkqgk',
    placeholder: true,
    goutModification: 'No change.'
  },

  /* ---------- LOWER BODY (gout-friendly: machine-based, no impact) ---------- */
  'leg-press': {
    name: 'Leg Press',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    why: 'Heavy lower-body strength with the spine supported and feet braced — much kinder to a gouty toe than barbell squats.',
    formCues: [
      'Feet shoulder-width, mid-foot on platform',
      'Lower under control until knees ~90°',
      'Do NOT lock the knees at the top'
    ],
    youtubeId: 'IZxyjW7MPJQ',
    placeholder: true,
    goutModification: 'Place feet HIGHER on the platform to reduce ankle dorsiflexion and big-toe load.'
  },
  'leg-extension': {
    name: 'Leg Extension',
    targetMuscles: ['Quadriceps'],
    why: 'Isolates the quads — important for knee stability without loading the foot.',
    formCues: [
      'Align knee axis with the machine pivot',
      'Full extension, 1-sec squeeze at top',
      'Slow 2-sec eccentric'
    ],
    youtubeId: 'YyvSfVjQeL0',
    placeholder: true,
    goutModification: 'No change — seated, foot only contacts a pad.'
  },
  'lying-leg-curl': {
    name: 'Lying Leg Curl',
    targetMuscles: ['Hamstrings'],
    why: 'Direct hamstring work, balances the quad-dominant program.',
    formCues: [
      'Hips stay pressed into the pad',
      'Pad sits just above the heels',
      'Full curl, controlled return'
    ],
    youtubeId: '1Tq3QdYUuHs',
    placeholder: true,
    goutModification: 'No change — prone.'
  },
  'hip-abduction-machine': {
    name: 'Hip Abduction Machine',
    targetMuscles: ['Gluteus Medius', 'Gluteus Minimus'],
    why: 'Strengthens lateral hip stabilisers — improves gait and offloads the knee/ankle.',
    formCues: [
      'Sit tall, no leaning back',
      'Push knees outward, pause 1 sec',
      'Slow return'
    ],
    youtubeId: 'k-fH8HmfOmk',
    placeholder: true,
    goutModification: 'No change — seated.'
  },
  'standing-calf-raise': {
    name: 'Standing Calf Raise (Machine)',
    targetMuscles: ['Gastrocnemius', 'Soleus'],
    why: 'Calf strength supports the foot/ankle complex; weight is on the shoulders, ball of foot on platform.',
    formCues: [
      'Full stretch at the bottom',
      '1-sec pause at top, full plantarflexion',
      'No bouncing'
    ],
    youtubeId: 'YMmgqO8Jo-k',
    placeholder: true,
    goutModification: 'SKIP entirely during flare — directly loads the big toe.'
  },
  'seated-calf-raise': {
    name: 'Seated Calf Raise',
    targetMuscles: ['Soleus'],
    why: 'Soleus emphasis with a deep stretch; load is on the knees, not the spine.',
    formCues: [
      'Knees at 90°, pad on lower thigh',
      'Full stretch, full contraction',
      'Slow tempo'
    ],
    youtubeId: 'JbyjNymZOt0',
    placeholder: true,
    goutModification: 'Skip during big-toe flare.'
  },
  'romanian-deadlift-db': {
    name: 'Dumbbell Romanian Deadlift',
    targetMuscles: ['Hamstrings', 'Glutes', 'Spinal Erectors'],
    why: 'Posterior-chain hinge pattern — protects the lower back and builds glute/ham strength.',
    formCues: [
      'Soft knees, push hips back',
      'Bar/dumbbells stay close to legs',
      'Stop when you feel hamstring stretch — neutral spine'
    ],
    youtubeId: 'FQ-6acDhBoo',
    placeholder: true,
    goutModification: 'Use lighter load and higher reps if foot is sensitive — load goes through mid-foot.'
  },

  /* ---------- CORE ---------- */
  'dead-bug': {
    name: 'Dead Bug',
    targetMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
    why: 'Teaches anti-extension core control without spinal flexion — gentle on the back.',
    formCues: [
      'Low back GLUED to floor',
      'Opposite arm + leg, slow tempo',
      'Exhale as limbs extend'
    ],
    youtubeId: 'g_BYB0R-4Ws',
    placeholder: true,
    goutModification: 'No change — supine.'
  },
  'bird-dog': {
    name: 'Bird-Dog',
    targetMuscles: ['Spinal Erectors', 'Glutes', 'Core'],
    why: 'Anti-rotation and spinal stability — one of the safest core drills for any back.',
    formCues: [
      'Hips and shoulders square to floor',
      'Reach long, don\'t just lift',
      '2-sec hold at extension'
    ],
    youtubeId: 'wiFNA3sqjCA',
    placeholder: true,
    goutModification: 'No change — quadruped, no foot load.'
  },
  'side-plank': {
    name: 'Side Plank',
    targetMuscles: ['Obliques', 'Quadratus Lumborum', 'Glute Medius'],
    why: 'Lateral core and hip stability in one move.',
    formCues: [
      'Stack shoulders, hips, ankles in a line',
      'Push the floor away',
      'Breathe — don\'t hold breath'
    ],
    youtubeId: 'K2VljzCC16g',
    placeholder: true,
    goutModification: 'Drop to bottom knee during flare — bottom foot off the floor.'
  },
  'pallof-press': {
    name: 'Cable Pallof Press',
    targetMuscles: ['Obliques', 'Transverse Abdominis'],
    why: 'Anti-rotation core — translates directly to real-world stability.',
    formCues: [
      'Cable at chest height, perpendicular to body',
      'Press straight out, resist rotation',
      '2-sec hold at full extension'
    ],
    youtubeId: 'AH_QZLm_0-s',
    placeholder: true,
    goutModification: 'Perform half-kneeling with the affected foot back/unloaded.'
  },
  'cable-woodchop': {
    name: 'Cable Wood-Chop (High to Low)',
    targetMuscles: ['Obliques', 'Core', 'Lats'],
    why: 'Rotational core power, fully standing.',
    formCues: [
      'Pivot the back foot, hips lead the rotation',
      'Arms stay straight',
      'Control the return'
    ],
    youtubeId: 'iD_QvyXqCO0',
    placeholder: true,
    goutModification: 'Replace with seated Russian twists during flare.'
  },

  /* ---------- COOL-DOWN STRETCHES ---------- */
  'doorway-pec-stretch': {
    name: 'Doorway Pec Stretch',
    targetMuscles: ['Pectorals'],
    why: 'Opens the chest — counters the closed posture from pressing and desk work.',
    formCues: [
      'Forearm on doorframe, elbow at 90°',
      'Step gently forward',
      '30-sec hold per side'
    ],
    youtubeId: 'SI8-84tGhRM',
    placeholder: true,
    goutModification: 'No change.'
  },
  'child-pose': {
    name: 'Child\'s Pose',
    targetMuscles: ['Lats', 'Spinal Erectors', 'Hips'],
    why: 'Decompresses the spine and stretches the lats.',
    formCues: [
      'Knees wide, big toes touching',
      'Sit hips back to heels',
      'Reach arms long, forehead to floor'
    ],
    youtubeId: 'kH7TGXMXhg8',
    placeholder: true,
    goutModification: 'Place a pillow under the ankles if dorsiflexion is painful.'
  },
  'figure-4-stretch': {
    name: 'Supine Figure-4 Stretch',
    targetMuscles: ['Glutes', 'Piriformis'],
    why: 'Releases the glutes and external rotators after lower-body work.',
    formCues: [
      'Lie supine, ankle on opposite knee',
      'Pull the supporting thigh towards chest',
      '30-sec hold per side'
    ],
    youtubeId: 'GxgnyL10Q08',
    placeholder: true,
    goutModification: 'No change — supine, no foot load.'
  },
  'standing-quad-stretch': {
    name: 'Standing Quad Stretch',
    targetMuscles: ['Quadriceps', 'Hip Flexors'],
    why: 'Lengthens the quads and hip flexors after leg day.',
    formCues: [
      'Hold a wall for balance',
      'Knees together, heel to glute',
      'Tuck the pelvis to deepen'
    ],
    youtubeId: 'LSO0HSdkBfQ',
    placeholder: true,
    goutModification: 'Perform LYING on side during flare — no standing on bad foot.'
  },
  'hamstring-stretch-strap': {
    name: 'Supine Hamstring Stretch (Strap)',
    targetMuscles: ['Hamstrings', 'Calves'],
    why: 'Hamstring length improves hip mechanics and reduces lumbar strain.',
    formCues: [
      'Lie supine, strap over mid-foot',
      'Leg as straight as comfortable',
      '30-sec hold per side'
    ],
    youtubeId: 'oh9DfKxKTjk',
    placeholder: true,
    goutModification: 'Place strap on mid-foot, NOT toes, during flare.'
  },
  'thoracic-foam-roll': {
    name: 'Thoracic Foam Roll',
    targetMuscles: ['Thoracic Spine'],
    why: 'Restores upper-back extension lost from sitting.',
    formCues: [
      'Roller across upper back, hands behind head',
      'Small extensions, exhale at end-range',
      '60–90 sec total'
    ],
    youtubeId: 'X9NyqEXNhrY',
    placeholder: true,
    goutModification: 'No change.'
  }
};


/* ---------------------------------------------------------------------
 * 2. SHARED ROUTINES (warm-up & cool-down — identical every day)
 * ------------------------------------------------------------------- */
var WarmupRoutine = [
  { exerciseId: 'bike-warmup',         duration: '5 min',  notes: 'RPE 3-4, light spin to raise core temp' },
  { exerciseId: 'cat-cow',             duration: '60 sec', notes: 'Slow, ~2 sec each direction' },
  { exerciseId: 'glute-bridge-warmup', duration: '10 reps',notes: '2-sec squeeze at top' },
  { exerciseId: 'scapular-wall-slide', duration: '10 reps',notes: 'Keep contact with the wall' },
  { exerciseId: 'band-pull-apart',     duration: '15 reps',notes: 'Light band, slow tempo' },
  { exerciseId: 'world-greatest-stretch', duration: '2/side', notes: 'Hold each rotation 2 sec' }
];

var CooldownRoutine = [
  { exerciseId: 'treadmill-cooldown',   duration: '2 min', notes: '3 km/hr, easy walk' },
  { exerciseId: 'doorway-pec-stretch',  duration: '30s/side', notes: 'Chest open, no shoulder shrug' },
  { exerciseId: 'child-pose',           duration: '60 sec',   notes: 'Deep nasal breathing' },
  { exerciseId: 'figure-4-stretch',     duration: '30s/side', notes: 'Pull supporting thigh in' },
  { exerciseId: 'standing-quad-stretch',duration: '30s/side', notes: 'Tuck pelvis to deepen' },
  { exerciseId: 'hamstring-stretch-strap', duration: '30s/side', notes: 'Strap on mid-foot' },
  { exerciseId: 'thoracic-foam-roll',   duration: '90 sec',   notes: 'Small extensions, exhale at end-range' }
];


/* ---------------------------------------------------------------------
 * 3. PROGRAM SCHEDULE  (Weeks 4 → 7, progressive overload)
 * -------------------------------------------------------------------
 * Progression rule of thumb:
 *   Week 4  – establish form & RPE baseline
 *   Week 5  – +2.5 kg on compounds OR +1 rep across the board
 *   Week 6  – +2.5 kg again (or +2 reps), cardio +5 min
 *   Week 7  – deload-ish on compounds (-5%) but +1 set on accessories
 *             (consolidation week before re-test)
 * ------------------------------------------------------------------- */

/* helper: build a day quickly so we don't repeat the warm/cool blocks */
function _day(dayNumber, label, estMin, cardio, main, core) {
  return {
    dayNumber: dayNumber,
    label: label,
    estimatedMinutes: estMin,
    warmup: WarmupRoutine,
    cardio: cardio,
    mainWorkout: main,
    coreBlock: core,
    cooldown: CooldownRoutine
  };
}

/* ----- standard cardio blocks reused across weeks ----- */
function _walkCardio(min, kmh, placement) {
  return {
    exerciseId: 'treadmill-walk',
    duration:  min + ' min',
    intensity: 'RPE 4-5, ' + kmh + ' km/hr, 0% incline',
    placement: placement,
    notes: 'Upright posture, no holding rails, nasal breathing if possible'
  };
}
function _bikeCardio(min, placement) {
  return {
    exerciseId: 'bike-warmup',
    duration:  min + ' min',
    intensity: 'RPE 5-6, moderate resistance',
    placement: placement,
    notes: 'Steady cadence ~70 rpm'
  };
}


/* =====================================================================
 *   WEEK 4
 * ===================================================================== */
var _week4 = {
  weekNumber: 4,
  notes: 'Baseline week — own the form, log every weight & RPE.',
  days: [

    /* --- Day 1: Upper Push + Core --- */
    _day(1, 'Upper Body Push + Core', 80,
      _walkCardio(20, 4.5, 'after-warmup'),
      [
        { exerciseId: 'chest-press-machine',         sets: 3, reps: 12, weight: '22.5 kg', restSeconds: 90, rpe: '6-7', notes: 'Last 2 reps challenging, form intact' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 3, reps: 10, weight: '15 kg',   restSeconds: 90, rpe: '6-7', notes: 'Smooth lock-out, no shrug' },
        { exerciseId: 'cable-tricep-pushdown',       sets: 3, reps: 12, weight: '15 kg',   restSeconds: 60, rpe: '7',   notes: 'Elbows pinned' },
        { exerciseId: 'db-lateral-raise',            sets: 3, reps: 12, weight: '4 kg',    restSeconds: 60, rpe: '7',   notes: 'Lead with elbow' }
      ],
      [
        { exerciseId: 'dead-bug',     sets: 2, reps: '8/side', restSeconds: 45, rpe: '5', notes: 'Low back GLUED to floor' },
        { exerciseId: 'pallof-press', sets: 2, reps: '10/side', restSeconds: 45, rpe: '6', notes: 'Resist rotation, 2-sec hold' }
      ]
    ),

    /* --- Day 2: Lower Body --- */
    _day(2, 'Lower Body (machine-based)', 80,
      _walkCardio(20, 4.5, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',           sets: 3, reps: 12, weight: '60 kg',  restSeconds: 120, rpe: '6-7', notes: 'Feet HIGH on platform' },
        { exerciseId: 'lying-leg-curl',      sets: 3, reps: 12, weight: '20 kg',  restSeconds: 90,  rpe: '7',   notes: 'Hips stay down' },
        { exerciseId: 'leg-extension',       sets: 3, reps: 12, weight: '20 kg',  restSeconds: 90,  rpe: '7',   notes: '1-sec squeeze at top' },
        { exerciseId: 'hip-abduction-machine', sets: 3, reps: 15, weight: '25 kg', restSeconds: 60, rpe: '7',   notes: 'Sit tall, no leaning' },
        { exerciseId: 'seated-calf-raise',   sets: 3, reps: 15, weight: '15 kg',  restSeconds: 60,  rpe: '7',   notes: 'SKIP if MTP joint sore' }
      ],
      [
        { exerciseId: 'bird-dog', sets: 2, reps: '8/side', restSeconds: 45, rpe: '5', notes: '2-sec hold at extension' }
      ]
    ),

    /* --- Day 3: Upper Pull + Core --- */
    _day(3, 'Upper Body Pull + Core', 80,
      _walkCardio(20, 4.5, 'after-warmup'),
      [
        { exerciseId: 'lat-pulldown',          sets: 3, reps: 12, weight: '32.5 kg', restSeconds: 90, rpe: '6-7', notes: 'Drive elbows down/back' },
        { exerciseId: 'seated-cable-row',      sets: 3, reps: 12, weight: '30 kg',   restSeconds: 90, rpe: '6-7', notes: 'Pull to lower ribs' },
        { exerciseId: 'machine-rear-delt-fly', sets: 3, reps: 15, weight: '15 kg',   restSeconds: 60, rpe: '7',   notes: 'Lead with the elbow' },
        { exerciseId: 'db-bicep-curl',         sets: 3, reps: 12, weight: '6 kg',    restSeconds: 60, rpe: '7',   notes: 'Slow eccentric' },
        { exerciseId: 'face-pull',             sets: 3, reps: 15, weight: '15 kg',   restSeconds: 60, rpe: '6',   notes: '"Draw the bow"' }
      ],
      [
        { exerciseId: 'side-plank',     sets: 2, reps: '20-sec/side', restSeconds: 45, rpe: '6', notes: 'Drop to knee if needed' },
        { exerciseId: 'cable-woodchop', sets: 2, reps: '10/side',     restSeconds: 60, rpe: '6', notes: 'Hips lead the rotation' }
      ]
    ),

    /* --- Day 4: Cardio + Posterior Chain --- */
    _day(4, 'Cardio Focus + Posterior Chain', 70,
      _bikeCardio(25, 'after-warmup'),
      [
        { exerciseId: 'romanian-deadlift-db',  sets: 3, reps: 10, weight: '12 kg DBs', restSeconds: 90, rpe: '6-7', notes: 'Hinge, neutral spine' },
        { exerciseId: 'hip-abduction-machine', sets: 3, reps: 15, weight: '25 kg',     restSeconds: 60, rpe: '7',   notes: 'Push knees out' },
        { exerciseId: 'lat-pulldown',          sets: 3, reps: 12, weight: '30 kg',     restSeconds: 75, rpe: '6',   notes: 'Lighter, technique focus' }
      ],
      [
        { exerciseId: 'dead-bug',  sets: 2, reps: '8/side', restSeconds: 45, rpe: '5', notes: 'Slow & controlled' },
        { exerciseId: 'bird-dog',  sets: 2, reps: '8/side', restSeconds: 45, rpe: '5', notes: 'Square hips' }
      ]
    ),

    /* --- Day 5: Full-Body Circuit + Cardio --- */
    _day(5, 'Full-Body Light + Cardio', 75,
      _walkCardio(25, 4.5, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',                   sets: 2, reps: 15, weight: '50 kg',   restSeconds: 75, rpe: '6', notes: 'Lighter, higher reps' },
        { exerciseId: 'chest-press-machine',         sets: 2, reps: 15, weight: '17.5 kg', restSeconds: 75, rpe: '6', notes: 'Tempo: 2-1-2' },
        { exerciseId: 'seated-cable-row',            sets: 2, reps: 15, weight: '25 kg',   restSeconds: 75, rpe: '6', notes: 'Squeeze blades' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 2, reps: 12, weight: '12.5 kg', restSeconds: 75, rpe: '6', notes: 'Smooth path' }
      ],
      [
        { exerciseId: 'pallof-press', sets: 2, reps: '10/side',     restSeconds: 45, rpe: '6', notes: 'Resist rotation' },
        { exerciseId: 'side-plank',   sets: 2, reps: '20-sec/side', restSeconds: 45, rpe: '6', notes: 'Stack joints' }
      ]
    )
  ]
};


/* =====================================================================
 *   WEEK 5  — +2.5 kg on compounds, cardio identical
 * ===================================================================== */
var _week5 = {
  weekNumber: 5,
  notes: 'First progression — +2.5 kg on chest press, shoulder press, lat pulldown, row, leg press.',
  days: [
    _day(1, 'Upper Body Push + Core', 80,
      _walkCardio(20, 4.8, 'after-warmup'),
      [
        { exerciseId: 'chest-press-machine',         sets: 3, reps: 12, weight: '25 kg',   restSeconds: 90, rpe: '7',   notes: '+2.5 kg from week 4' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 3, reps: 10, weight: '17.5 kg', restSeconds: 90, rpe: '7', notes: '+2.5 kg' },
        { exerciseId: 'cable-tricep-pushdown',       sets: 3, reps: 12, weight: '17.5 kg', restSeconds: 60, rpe: '7',   notes: '+2.5 kg' },
        { exerciseId: 'db-lateral-raise',            sets: 3, reps: 12, weight: '5 kg',    restSeconds: 60, rpe: '7',   notes: '+1 kg per hand' }
      ],
      [
        { exerciseId: 'dead-bug',     sets: 3, reps: '8/side',  restSeconds: 45, rpe: '6', notes: '+1 set' },
        { exerciseId: 'pallof-press', sets: 2, reps: '12/side', restSeconds: 45, rpe: '6', notes: '+2 reps' }
      ]
    ),

    _day(2, 'Lower Body (machine-based)', 80,
      _walkCardio(20, 4.8, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',           sets: 3, reps: 12, weight: '70 kg',   restSeconds: 120, rpe: '7', notes: '+10 kg' },
        { exerciseId: 'lying-leg-curl',      sets: 3, reps: 12, weight: '22.5 kg', restSeconds: 90,  rpe: '7', notes: '+2.5 kg' },
        { exerciseId: 'leg-extension',       sets: 3, reps: 12, weight: '22.5 kg', restSeconds: 90,  rpe: '7', notes: '+2.5 kg' },
        { exerciseId: 'hip-abduction-machine', sets: 3, reps: 15, weight: '30 kg', restSeconds: 60,  rpe: '7', notes: '+5 kg' },
        { exerciseId: 'seated-calf-raise',   sets: 3, reps: 15, weight: '20 kg',   restSeconds: 60,  rpe: '7', notes: '+5 kg' }
      ],
      [
        { exerciseId: 'bird-dog', sets: 3, reps: '8/side', restSeconds: 45, rpe: '6', notes: '+1 set' }
      ]
    ),

    _day(3, 'Upper Body Pull + Core', 80,
      _walkCardio(20, 4.8, 'after-warmup'),
      [
        { exerciseId: 'lat-pulldown',          sets: 3, reps: 12, weight: '35 kg',   restSeconds: 90, rpe: '7', notes: '+2.5 kg' },
        { exerciseId: 'seated-cable-row',      sets: 3, reps: 12, weight: '32.5 kg', restSeconds: 90, rpe: '7', notes: '+2.5 kg' },
        { exerciseId: 'machine-rear-delt-fly', sets: 3, reps: 15, weight: '17.5 kg', restSeconds: 60, rpe: '7', notes: '+2.5 kg' },
        { exerciseId: 'db-bicep-curl',         sets: 3, reps: 12, weight: '7 kg',    restSeconds: 60, rpe: '7', notes: '+1 kg per hand' },
        { exerciseId: 'face-pull',             sets: 3, reps: 15, weight: '17.5 kg', restSeconds: 60, rpe: '6', notes: '+2.5 kg' }
      ],
      [
        { exerciseId: 'side-plank',     sets: 2, reps: '25-sec/side', restSeconds: 45, rpe: '6', notes: '+5 sec hold' },
        { exerciseId: 'cable-woodchop', sets: 2, reps: '10/side',     restSeconds: 60, rpe: '6', notes: 'Same' }
      ]
    ),

    _day(4, 'Cardio Focus + Posterior Chain', 75,
      _bikeCardio(25, 'after-warmup'),
      [
        { exerciseId: 'romanian-deadlift-db',  sets: 3, reps: 10, weight: '14 kg DBs', restSeconds: 90, rpe: '7', notes: '+2 kg per hand' },
        { exerciseId: 'hip-abduction-machine', sets: 3, reps: 15, weight: '30 kg',     restSeconds: 60, rpe: '7', notes: '+5 kg' },
        { exerciseId: 'lat-pulldown',          sets: 3, reps: 12, weight: '32.5 kg',   restSeconds: 75, rpe: '6', notes: '+2.5 kg, technique focus' }
      ],
      [
        { exerciseId: 'dead-bug',  sets: 2, reps: '10/side', restSeconds: 45, rpe: '6', notes: '+2 reps' },
        { exerciseId: 'bird-dog',  sets: 2, reps: '10/side', restSeconds: 45, rpe: '6', notes: '+2 reps' }
      ]
    ),

    _day(5, 'Full-Body Light + Cardio', 80,
      _walkCardio(25, 4.8, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',                   sets: 2, reps: 15, weight: '55 kg',   restSeconds: 75, rpe: '6', notes: '+5 kg' },
        { exerciseId: 'chest-press-machine',         sets: 2, reps: 15, weight: '20 kg',   restSeconds: 75, rpe: '6', notes: '+2.5 kg' },
        { exerciseId: 'seated-cable-row',            sets: 2, reps: 15, weight: '27.5 kg', restSeconds: 75, rpe: '6', notes: '+2.5 kg' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 2, reps: 12, weight: '15 kg', restSeconds: 75, rpe: '6', notes: '+2.5 kg' }
      ],
      [
        { exerciseId: 'pallof-press', sets: 2, reps: '12/side',     restSeconds: 45, rpe: '6', notes: '+2 reps' },
        { exerciseId: 'side-plank',   sets: 2, reps: '25-sec/side', restSeconds: 45, rpe: '6', notes: '+5 sec' }
      ]
    )
  ]
};


/* =====================================================================
 *   WEEK 6  — second progression + cardio bumped to 25 min
 * ===================================================================== */
var _week6 = {
  weekNumber: 6,
  notes: 'Second progression — another +2.5 kg, cardio extended to 25 min on push/pull days.',
  days: [
    _day(1, 'Upper Body Push + Core', 85,
      _walkCardio(25, 5.0, 'after-warmup'),
      [
        { exerciseId: 'chest-press-machine',         sets: 4, reps: 10, weight: '27.5 kg', restSeconds: 90, rpe: '7-8', notes: '+1 set, +2.5 kg' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 3, reps: 10, weight: '20 kg', restSeconds: 90, rpe: '7-8', notes: '+2.5 kg' },
        { exerciseId: 'cable-tricep-pushdown',       sets: 3, reps: 12, weight: '20 kg',   restSeconds: 60, rpe: '7-8', notes: '+2.5 kg' },
        { exerciseId: 'db-lateral-raise',            sets: 3, reps: 15, weight: '5 kg',    restSeconds: 60, rpe: '8',   notes: '+3 reps' }
      ],
      [
        { exerciseId: 'dead-bug',     sets: 3, reps: '10/side', restSeconds: 45, rpe: '6', notes: '+2 reps' },
        { exerciseId: 'pallof-press', sets: 3, reps: '12/side', restSeconds: 45, rpe: '7', notes: '+1 set' }
      ]
    ),

    _day(2, 'Lower Body (machine-based)', 85,
      _walkCardio(25, 5.0, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',           sets: 4, reps: 10, weight: '80 kg',   restSeconds: 120, rpe: '7-8', notes: '+1 set, +10 kg' },
        { exerciseId: 'lying-leg-curl',      sets: 3, reps: 12, weight: '25 kg',   restSeconds: 90,  rpe: '7-8', notes: '+2.5 kg' },
        { exerciseId: 'leg-extension',       sets: 3, reps: 12, weight: '25 kg',   restSeconds: 90,  rpe: '7-8', notes: '+2.5 kg' },
        { exerciseId: 'hip-abduction-machine', sets: 3, reps: 15, weight: '35 kg', restSeconds: 60,  rpe: '7-8', notes: '+5 kg' },
        { exerciseId: 'seated-calf-raise',   sets: 3, reps: 15, weight: '25 kg',   restSeconds: 60,  rpe: '7-8', notes: '+5 kg' }
      ],
      [
        { exerciseId: 'bird-dog',   sets: 3, reps: '10/side', restSeconds: 45, rpe: '6', notes: '+2 reps' },
        { exerciseId: 'side-plank', sets: 2, reps: '30-sec/side', restSeconds: 45, rpe: '7', notes: 'Add a 2nd core movement' }
      ]
    ),

    _day(3, 'Upper Body Pull + Core', 85,
      _walkCardio(25, 5.0, 'after-warmup'),
      [
        { exerciseId: 'lat-pulldown',          sets: 4, reps: 10, weight: '37.5 kg', restSeconds: 90, rpe: '7-8', notes: '+1 set, +2.5 kg' },
        { exerciseId: 'seated-cable-row',      sets: 3, reps: 12, weight: '35 kg',   restSeconds: 90, rpe: '7-8', notes: '+2.5 kg' },
        { exerciseId: 'machine-rear-delt-fly', sets: 3, reps: 15, weight: '20 kg',   restSeconds: 60, rpe: '7-8', notes: '+2.5 kg' },
        { exerciseId: 'db-bicep-curl',         sets: 3, reps: 12, weight: '8 kg',    restSeconds: 60, rpe: '7-8', notes: '+1 kg per hand' },
        { exerciseId: 'face-pull',             sets: 3, reps: 15, weight: '20 kg',   restSeconds: 60, rpe: '7',   notes: '+2.5 kg' }
      ],
      [
        { exerciseId: 'side-plank',     sets: 3, reps: '25-sec/side', restSeconds: 45, rpe: '7', notes: '+1 set' },
        { exerciseId: 'cable-woodchop', sets: 3, reps: '10/side',     restSeconds: 60, rpe: '7', notes: '+1 set' }
      ]
    ),

    _day(4, 'Cardio Focus + Posterior Chain', 80,
      _bikeCardio(30, 'after-warmup'),
      [
        { exerciseId: 'romanian-deadlift-db',  sets: 3, reps: 10, weight: '16 kg DBs', restSeconds: 90, rpe: '7-8', notes: '+2 kg per hand' },
        { exerciseId: 'hip-abduction-machine', sets: 3, reps: 15, weight: '35 kg',     restSeconds: 60, rpe: '7-8', notes: '+5 kg' },
        { exerciseId: 'lat-pulldown',          sets: 3, reps: 12, weight: '35 kg',     restSeconds: 75, rpe: '7',   notes: '+2.5 kg' }
      ],
      [
        { exerciseId: 'dead-bug',  sets: 3, reps: '10/side', restSeconds: 45, rpe: '6', notes: '+1 set' },
        { exerciseId: 'bird-dog',  sets: 3, reps: '10/side', restSeconds: 45, rpe: '6', notes: '+1 set' }
      ]
    ),

    _day(5, 'Full-Body Light + Cardio', 85,
      _walkCardio(30, 5.0, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',                   sets: 3, reps: 12, weight: '60 kg',   restSeconds: 75, rpe: '6-7', notes: '+1 set, +5 kg' },
        { exerciseId: 'chest-press-machine',         sets: 3, reps: 12, weight: '22.5 kg', restSeconds: 75, rpe: '6-7', notes: '+1 set, +2.5 kg' },
        { exerciseId: 'seated-cable-row',            sets: 3, reps: 12, weight: '30 kg',   restSeconds: 75, rpe: '6-7', notes: '+1 set, +2.5 kg' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 3, reps: 10, weight: '17.5 kg', restSeconds: 75, rpe: '6-7', notes: '+1 set, +2.5 kg' }
      ],
      [
        { exerciseId: 'pallof-press', sets: 3, reps: '12/side',     restSeconds: 45, rpe: '7', notes: '+1 set' },
        { exerciseId: 'side-plank',   sets: 3, reps: '25-sec/side', restSeconds: 45, rpe: '7', notes: '+1 set' }
      ]
    )
  ]
};


/* =====================================================================
 *   WEEK 7  — Consolidation: -5% on big lifts, +1 set on accessories
 *             (gives the joints a break before re-test in week 8)
 * ===================================================================== */
var _week7 = {
  weekNumber: 7,
  notes: 'Consolidation week — slight back-off on compounds, more volume on accessories. Cardio held at week-6 levels.',
  days: [
    _day(1, 'Upper Body Push + Core', 85,
      _walkCardio(25, 5.0, 'after-warmup'),
      [
        { exerciseId: 'chest-press-machine',         sets: 3, reps: 12, weight: '25 kg',   restSeconds: 90, rpe: '6-7', notes: 'Back-off from 27.5, focus on tempo 3-1-2' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 3, reps: 12, weight: '17.5 kg', restSeconds: 90, rpe: '6-7', notes: 'Higher reps, lower weight' },
        { exerciseId: 'cable-tricep-pushdown',       sets: 4, reps: 12, weight: '20 kg',   restSeconds: 60, rpe: '7-8', notes: '+1 accessory set' },
        { exerciseId: 'db-lateral-raise',            sets: 4, reps: 12, weight: '5 kg',    restSeconds: 60, rpe: '7-8', notes: '+1 accessory set' }
      ],
      [
        { exerciseId: 'dead-bug',     sets: 3, reps: '12/side', restSeconds: 45, rpe: '7', notes: '+2 reps' },
        { exerciseId: 'pallof-press', sets: 3, reps: '15/side', restSeconds: 45, rpe: '7', notes: '+3 reps' }
      ]
    ),

    _day(2, 'Lower Body (machine-based)', 85,
      _walkCardio(25, 5.0, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',           sets: 3, reps: 12, weight: '75 kg',   restSeconds: 120, rpe: '6-7', notes: 'Back-off from 80, perfect tempo' },
        { exerciseId: 'lying-leg-curl',      sets: 4, reps: 12, weight: '22.5 kg', restSeconds: 90,  rpe: '7-8', notes: '+1 set, slight back-off' },
        { exerciseId: 'leg-extension',       sets: 4, reps: 12, weight: '22.5 kg', restSeconds: 90,  rpe: '7-8', notes: '+1 set, slight back-off' },
        { exerciseId: 'hip-abduction-machine', sets: 4, reps: 15, weight: '35 kg', restSeconds: 60,  rpe: '7-8', notes: '+1 set' },
        { exerciseId: 'seated-calf-raise',   sets: 4, reps: 15, weight: '25 kg',   restSeconds: 60,  rpe: '7-8', notes: '+1 set' }
      ],
      [
        { exerciseId: 'bird-dog',   sets: 3, reps: '12/side',     restSeconds: 45, rpe: '7', notes: '+2 reps' },
        { exerciseId: 'side-plank', sets: 3, reps: '30-sec/side', restSeconds: 45, rpe: '7', notes: '+1 set' }
      ]
    ),

    _day(3, 'Upper Body Pull + Core', 85,
      _walkCardio(25, 5.0, 'after-warmup'),
      [
        { exerciseId: 'lat-pulldown',          sets: 3, reps: 12, weight: '35 kg',   restSeconds: 90, rpe: '6-7', notes: 'Back-off from 37.5' },
        { exerciseId: 'seated-cable-row',      sets: 4, reps: 12, weight: '32.5 kg', restSeconds: 90, rpe: '7-8', notes: '+1 set, slight back-off' },
        { exerciseId: 'machine-rear-delt-fly', sets: 4, reps: 15, weight: '20 kg',   restSeconds: 60, rpe: '7-8', notes: '+1 set' },
        { exerciseId: 'db-bicep-curl',         sets: 4, reps: 12, weight: '7 kg',    restSeconds: 60, rpe: '7-8', notes: '+1 set' },
        { exerciseId: 'face-pull',             sets: 4, reps: 15, weight: '20 kg',   restSeconds: 60, rpe: '7',   notes: '+1 set' }
      ],
      [
        { exerciseId: 'side-plank',     sets: 3, reps: '30-sec/side', restSeconds: 45, rpe: '7', notes: '+5 sec' },
        { exerciseId: 'cable-woodchop', sets: 3, reps: '12/side',     restSeconds: 60, rpe: '7', notes: '+2 reps' }
      ]
    ),

    _day(4, 'Cardio Focus + Posterior Chain', 80,
      _bikeCardio(30, 'after-warmup'),
      [
        { exerciseId: 'romanian-deadlift-db',  sets: 3, reps: 12, weight: '14 kg DBs', restSeconds: 90, rpe: '6-7', notes: 'Back-off, +2 reps' },
        { exerciseId: 'hip-abduction-machine', sets: 4, reps: 15, weight: '35 kg',     restSeconds: 60, rpe: '7-8', notes: '+1 set' },
        { exerciseId: 'lat-pulldown',          sets: 3, reps: 15, weight: '32.5 kg',   restSeconds: 75, rpe: '7',   notes: 'Higher reps, technique' }
      ],
      [
        { exerciseId: 'dead-bug',  sets: 3, reps: '12/side', restSeconds: 45, rpe: '7', notes: '+2 reps' },
        { exerciseId: 'bird-dog',  sets: 3, reps: '12/side', restSeconds: 45, rpe: '7', notes: '+2 reps' }
      ]
    ),

    _day(5, 'Full-Body Light + Cardio', 90,
      _walkCardio(30, 5.0, 'before-cooldown'),
      [
        { exerciseId: 'leg-press',                   sets: 3, reps: 15, weight: '55 kg',   restSeconds: 75, rpe: '6-7', notes: 'Higher reps, lower load' },
        { exerciseId: 'chest-press-machine',         sets: 3, reps: 15, weight: '20 kg',   restSeconds: 75, rpe: '6-7', notes: 'Higher reps' },
        { exerciseId: 'seated-cable-row',            sets: 3, reps: 15, weight: '27.5 kg', restSeconds: 75, rpe: '6-7', notes: 'Higher reps' },
        { exerciseId: 'seated-shoulder-press-machine', sets: 3, reps: 12, weight: '15 kg', restSeconds: 75, rpe: '6-7', notes: 'Tempo 3-1-2' }
      ],
      [
        { exerciseId: 'pallof-press', sets: 3, reps: '15/side',     restSeconds: 45, rpe: '7', notes: '+3 reps' },
        { exerciseId: 'side-plank',   sets: 3, reps: '30-sec/side', restSeconds: 45, rpe: '7', notes: '+5 sec' }
      ]
    )
  ]
};


/* =====================================================================
 *   FLARE PROTOCOL
 *   Use ONE of these replacements for any day a gout flare is active.
 *   Rule: pain > 3/10 in any joint => switch to flare protocol that day.
 * ===================================================================== */
var _flareProtocol = {
  description:
    'When a gout flare occurs (typical big-toe MTP joint pain, redness, ' +
    'heat, swelling), do NOT skip training entirely — movement aids ' +
    'circulation and uric-acid clearance. Switch to the matching ' +
    'replacement below. Avoid ALL standing/weight-bearing on the affected ' +
    'foot. Stop immediately if pain spikes above 4/10.',

  replacementUpperDay: [
    { exerciseId: 'bike-warmup',                 duration: '8 min',  notes: 'Light spin, RPE 3' },
    { exerciseId: 'chest-press-machine',         sets: 3, reps: 12, weight: '-10% of current', restSeconds: 90, rpe: '6', notes: 'Seated' },
    { exerciseId: 'seated-shoulder-press-machine', sets: 3, reps: 10, weight: '-10% of current', restSeconds: 90, rpe: '6', notes: 'Seated' },
    { exerciseId: 'lat-pulldown',                sets: 3, reps: 12, weight: '-10% of current', restSeconds: 90, rpe: '6', notes: 'Seated' },
    { exerciseId: 'seated-cable-row',            sets: 3, reps: 12, weight: '-10% of current', restSeconds: 90, rpe: '6', notes: 'Seated' },
    { exerciseId: 'machine-rear-delt-fly',       sets: 2, reps: 15, weight: 'light',           restSeconds: 60, rpe: '6', notes: 'Seated' },
    { exerciseId: 'dead-bug',                    sets: 2, reps: '8/side',  restSeconds: 45, rpe: '5', notes: 'Supine' },
    { exerciseId: 'bird-dog',                    sets: 2, reps: '8/side',  restSeconds: 45, rpe: '5', notes: 'Quadruped — affected foot floats off floor' }
  ],

  replacementLowerDay: [
    { exerciseId: 'bike-warmup',           duration: '10 min', notes: 'Light, no resistance if flare in toe — push from heel' },
    { exerciseId: 'lying-leg-curl',        sets: 3, reps: 12, weight: '-10% of current', restSeconds: 90, rpe: '6', notes: 'Prone — no foot load' },
    { exerciseId: 'hip-abduction-machine', sets: 3, reps: 15, weight: '-10% of current', restSeconds: 60, rpe: '6', notes: 'Seated' },
    { exerciseId: 'machine-rear-delt-fly', sets: 3, reps: 15, weight: 'light',           restSeconds: 60, rpe: '6', notes: 'Substitute upper-body work' },
    { exerciseId: 'seated-cable-row',      sets: 3, reps: 12, weight: 'moderate',        restSeconds: 90, rpe: '6', notes: 'Seated' },
    { exerciseId: 'dead-bug',              sets: 3, reps: '8/side', restSeconds: 45, rpe: '5', notes: 'Supine' }
  ],

  replacementCardioOnly: [
    { exerciseId: 'bike-warmup',     duration: '5 min',  notes: 'Warm-up, RPE 3' },
    { exerciseId: 'bike-warmup',     duration: '20-30 min', notes: 'Steady RPE 4-5, heel-driven pedalling, no toe pressure' },
    { exerciseId: 'cat-cow',         duration: '60 sec', notes: 'Spinal mobility' },
    { exerciseId: 'dead-bug',        sets: 2, reps: '8/side',  restSeconds: 45, rpe: '5', notes: 'Supine' },
    { exerciseId: 'bird-dog',        sets: 2, reps: '8/side',  restSeconds: 45, rpe: '5', notes: 'Affected foot off floor' },
    { exerciseId: 'child-pose',      duration: '60 sec', notes: 'Pillow under ankles if needed' }
  ]
};


/* ---------------------------------------------------------------------
 * 4. PUBLIC OBJECT
 * ------------------------------------------------------------------- */
var ExerciseProgram = {
  startDate: '2026-04-28',           // Monday of Week 4
  daysPerWeek: 5,
  sharedRoutines: {
    warmup: WarmupRoutine,
    cooldown: CooldownRoutine
  },
  weeks: [_week4, _week5, _week6, _week7],
  flareProtocol: _flareProtocol
};


/* ---------------------------------------------------------------------
 * 5. EXPORTS (browser global + optional CommonJS)
 * ------------------------------------------------------------------- */
if (typeof window !== 'undefined') {
  window.ExerciseLibrary = ExerciseLibrary;
  window.ExerciseProgram = ExerciseProgram;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ExerciseLibrary: ExerciseLibrary,
    ExerciseProgram: ExerciseProgram,
    WarmupRoutine: WarmupRoutine,
    CooldownRoutine: CooldownRoutine
  };
}
