// body-parts.js — Body part categories for pain logging
const BodyParts = {
  categories: [
    {
      name: 'Feet',
      icon: '🦶',
      parts: [
        { id: 'big-toe-l', label: 'Big Toe (Left)', goutCommon: true },
        { id: 'big-toe-r', label: 'Big Toe (Right)', goutCommon: true },
        { id: 'midfoot-l', label: 'Midfoot (Left)', goutCommon: true },
        { id: 'midfoot-r', label: 'Midfoot (Right)', goutCommon: true },
        { id: 'ankle-l', label: 'Ankle (Left)', goutCommon: true },
        { id: 'ankle-r', label: 'Ankle (Right)', goutCommon: true },
        { id: 'heel-l', label: 'Heel (Left)', goutCommon: false },
        { id: 'heel-r', label: 'Heel (Right)', goutCommon: false },
      ]
    },
    {
      name: 'Legs',
      icon: '🦵',
      parts: [
        { id: 'knee-l', label: 'Knee (Left)', goutCommon: true },
        { id: 'knee-r', label: 'Knee (Right)', goutCommon: true },
        { id: 'shin-l', label: 'Shin (Left)', goutCommon: false },
        { id: 'shin-r', label: 'Shin (Right)', goutCommon: false },
        { id: 'hip-l', label: 'Hip (Left)', goutCommon: false },
        { id: 'hip-r', label: 'Hip (Right)', goutCommon: false },
        { id: 'calf-l', label: 'Calf (Left)', goutCommon: false },
        { id: 'calf-r', label: 'Calf (Right)', goutCommon: false },
      ]
    },
    {
      name: 'Arms & Hands',
      icon: '💪',
      parts: [
        { id: 'wrist-l', label: 'Wrist (Left)', goutCommon: true },
        { id: 'wrist-r', label: 'Wrist (Right)', goutCommon: true },
        { id: 'elbow-l', label: 'Elbow (Left)', goutCommon: true },
        { id: 'elbow-r', label: 'Elbow (Right)', goutCommon: true },
        { id: 'fingers-l', label: 'Fingers (Left)', goutCommon: true },
        { id: 'fingers-r', label: 'Fingers (Right)', goutCommon: true },
        { id: 'shoulder-l', label: 'Shoulder (Left)', goutCommon: false },
        { id: 'shoulder-r', label: 'Shoulder (Right)', goutCommon: false },
      ]
    },
    {
      name: 'Core & Back',
      icon: '🫁',
      parts: [
        { id: 'lower-back', label: 'Lower Back', goutCommon: false },
        { id: 'upper-back', label: 'Upper Back', goutCommon: false },
        { id: 'neck', label: 'Neck', goutCommon: false },
        { id: 'abdomen', label: 'Abdomen', goutCommon: false },
        { id: 'chest', label: 'Chest', goutCommon: false },
      ]
    }
  ],

  // Get flat list of all body parts
  all() {
    return this.categories.flatMap(c => c.parts);
  },

  // Get gout-common joints
  goutJoints() {
    return this.all().filter(p => p.goutCommon);
  },

  // Find a part by ID
  find(id) {
    return this.all().find(p => p.id === id);
  },

  // Get label for a body part ID
  label(id) {
    const part = this.find(id);
    return part ? part.label : id;
  },

  // Is this a gout-common joint?
  isGoutCommon(id) {
    const part = this.find(id);
    return part ? part.goutCommon : false;
  }
};
