// safety.js — Disclaimers, red-flag checks, reference warnings

const Safety = {
  DISCLAIMER: {
    short: 'Personal tracking tool — not medical advice.',
    long: 'This is a personal tracking companion, not a medical device or diagnostic tool. Always consult your GP, rheumatologist, and cardiologist before making changes to medications, diet, or exercise routines.',
    emergency: 'If experiencing severe pain, chest pain, or difficulty breathing, call emergency services immediately.',
    onboarding: '⚕️ Important: This app helps you track and organize your health data. It does not diagnose conditions or prescribe treatments. The Health Council provides AI-generated suggestions that supplement — never replace — guidance from your doctors and specialists.'
  },

  // Check for red flags in a pain entry and return warnings
  checkPainRedFlags(painLevel, visibleSigns, context) {
    const warnings = [];

    if (painLevel >= 8) {
      warnings.push({
        type: 'danger',
        message: `You logged severe pain (${painLevel}/10). Consider contacting your doctor.`
      });
    }

    if (painLevel >= 5 && context === 'during-exercise') {
      warnings.push({
        type: 'danger',
        message: '🔴 Pain 5+ during exercise — STOP the activity. Rest and assess.'
      });
    }

    if (visibleSigns && (visibleSigns.includes('redness') || visibleSigns.includes('warmth') || visibleSigns.includes('swelling'))) {
      warnings.push({
        type: 'warning',
        message: 'Visible redness, warmth, or swelling noted. This could indicate a gout flare — monitor closely and contact your specialist if it worsens.'
      });
    }

    return warnings;
  },

  // Check BP for red flags
  checkBPRedFlags(systolic, diastolic) {
    const warnings = [];

    if (systolic >= 180 || diastolic >= 120) {
      warnings.push({
        type: 'danger',
        message: `⚠️ Very high BP reading (${systolic}/${diastolic}). If experiencing symptoms, seek medical attention.`
      });
    } else if (systolic >= 140 || diastolic >= 90) {
      warnings.push({
        type: 'warning',
        message: `BP reading ${systolic}/${diastolic} is above target (<130/80). Discuss with your GP if this persists.`
      });
    }

    if (systolic < 100 || diastolic < 60) {
      warnings.push({
        type: 'warning',
        message: `Low BP reading (${systolic}/${diastolic}). If you feel dizzy or lightheaded, discuss with your doctor.`
      });
    }

    return warnings;
  },

  // Check for potential gout flare indicators
  checkGoutIndicators(entry) {
    const indicators = [];
    if (entry.visibleSigns?.includes('redness')) indicators.push('redness');
    if (entry.visibleSigns?.includes('warmth')) indicators.push('warmth');
    if (entry.visibleSigns?.includes('swelling')) indicators.push('swelling');
    if (entry.painType === 'throbbing' || entry.painType === 'sharp') indicators.push('acute-pain-type');
    if (entry.context === 'at-rest' && entry.painLevel >= 5) indicators.push('severe-at-rest');

    // Check if big toe — lower threshold (pathognomonic)
    const isBigToe = entry.bodyPart?.includes('big-toe');
    const isLikelyGout = isBigToe ? indicators.length >= 1 : indicators.length >= 3;

    return {
      indicators,
      isLikelyGout,
      message: isLikelyGout
        ? '⚠️ This may be a gout flare based on the symptoms you described. Consider logging it as a flare and following your specialist\'s flare protocol.'
        : null
    };
  },

  // NSAID warning for hypertension patients
  nsaidWarning() {
    return '⚠️ NSAIDs (ibuprofen, naproxen) may raise blood pressure. Discuss alternatives like colchicine with your rheumatologist.';
  },

  // Render disclaimer footer
  renderDisclaimer() {
    return `<div class="disclaimer"><strong>⚕️ Disclaimer:</strong> ${this.DISCLAIMER.short}</div>`;
  },

  // Render alert banner
  renderAlert(type, message) {
    return `<div class="alert alert-${type}">${Utils.escapeHtml(message)}</div>`;
  }
};
