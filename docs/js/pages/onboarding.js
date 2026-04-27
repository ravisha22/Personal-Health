// Onboarding page - 3-screen progressive setup
(function() {
    let currentScreen = 1;
    let formData = {
        name: '',
        conditions: [],
        primaryGoal: '',
        units: 'metric',
        medications: [],
        exerciseLimitations: '',
        doctorClearance: false,
        preferredExerciseTime: '',
        currentWeight: '',
        height: '',
        systolic: '',
        diastolic: '',
        checkinFrequency: 'daily',
        pastChallenges: ''
    };

    // Collect current form values before re-render
    function collectCurrentFormData() {
        if (currentScreen === 1) {
            const nameEl = document.getElementById('name');
            if (nameEl) formData.name = nameEl.value;

            formData.conditions = [];
            document.querySelectorAll('#conditions-group input[type="checkbox"]:checked').forEach(cb => {
                formData.conditions.push(cb.value);
            });

            const goalEl = document.querySelector('input[name="goal"]:checked');
            if (goalEl) formData.primaryGoal = goalEl.value;

            const unitEl = document.querySelector('input[name="units"]:checked');
            if (unitEl) formData.units = unitEl.value;

        } else if (currentScreen === 2) {
            // Collect medications from form
            const medRows = document.querySelectorAll('.medication-row');
            formData.medications = [];
            medRows.forEach(row => {
                const nameInput = row.querySelector('.med-name');
                const doseInput = row.querySelector('.med-dose');
                const condSelect = row.querySelector('.med-condition');
                if (nameInput) {
                    formData.medications.push({
                        name: nameInput.value,
                        dose: doseInput ? doseInput.value : '',
                        condition: condSelect ? condSelect.value : ''
                    });
                }
            });

            const limEl = document.getElementById('exercise-limitations');
            if (limEl) formData.exerciseLimitations = limEl.value;

            const clrEl = document.getElementById('doctor-clearance');
            if (clrEl) formData.doctorClearance = clrEl.checked;

            const timeEl = document.querySelector('input[name="exercise-time"]:checked');
            if (timeEl) formData.preferredExerciseTime = timeEl.value;

        } else if (currentScreen === 3) {
            const wEl = document.getElementById('current-weight');
            if (wEl) formData.currentWeight = wEl.value;

            const hEl = document.getElementById('height');
            if (hEl) formData.height = hEl.value;

            const sEl = document.getElementById('systolic');
            if (sEl) formData.systolic = sEl.value;

            const dEl = document.getElementById('diastolic');
            if (dEl) formData.diastolic = dEl.value;

            const freqEl = document.querySelector('input[name="checkin"]:checked');
            if (freqEl) formData.checkinFrequency = freqEl.value;

            const pcEl = document.getElementById('past-challenges');
            if (pcEl) formData.pastChallenges = pcEl.value;
        }
    }

    function reRender() {
        collectCurrentFormData();
        const app = document.getElementById('app');
        app.innerHTML = render();
        afterRender();
    }

    function render() {
        return `
            <div class="page onboarding">
                <div class="onboarding-progress">
                    <div class="onboarding-dot ${currentScreen >= 1 ? (currentScreen > 1 ? 'complete' : 'active') : ''}"></div>
                    <div class="onboarding-dot ${currentScreen >= 2 ? (currentScreen > 2 ? 'complete' : 'active') : ''}"></div>
                    <div class="onboarding-dot ${currentScreen >= 3 ? 'active' : ''}"></div>
                </div>

                <div class="onboarding-content">
                    ${renderCurrentScreen()}
                </div>

                <div class="onboarding-footer">
                    ${currentScreen > 1 ? '<button type="button" class="btn btn-secondary" id="back-btn">Back</button>' : '<div></div>'}
                    <button type="button" class="btn btn-primary" id="next-btn">
                        ${currentScreen < 3 ? 'Next →' : '✅ Complete Setup'}
                    </button>
                </div>
            </div>
        `;
    }

    function renderCurrentScreen() {
        switch(currentScreen) {
            case 1: return renderWelcomeScreen();
            case 2: return renderCurrentStateScreen();
            case 3: return renderBaselineScreen();
            default: return '';
        }
    }

    function renderWelcomeScreen() {
        return `
            <h1 class="onboarding-title">🏛️ Welcome to Health Council</h1>
            <p class="onboarding-subtitle">Let's personalize your health tracking experience</p>

            <div class="alert alert-info mb-4">
                ${Safety.DISCLAIMER.onboarding}
            </div>

            <div class="form-group">
                <label class="form-label">What should we call you?</label>
                <input type="text" class="form-input" id="name" placeholder="Your name" value="${Utils.escapeHtml(formData.name)}">
            </div>

            <div class="form-group" id="conditions-group">
                <label class="form-label">Health Conditions (check all that apply)</label>
                <div class="form-check">
                    <input type="checkbox" id="cond-gout" value="Gout" ${formData.conditions.includes('Gout') ? 'checked' : ''}>
                    <label for="cond-gout">🦴 Gout</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="cond-chol" value="High Cholesterol" ${formData.conditions.includes('High Cholesterol') ? 'checked' : ''}>
                    <label for="cond-chol">❤️ High Cholesterol</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="cond-hyp" value="Hypertension" ${formData.conditions.includes('Hypertension') ? 'checked' : ''}>
                    <label for="cond-hyp">🫀 Hypertension</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="cond-diab" value="Diabetes" ${formData.conditions.includes('Diabetes') ? 'checked' : ''}>
                    <label for="cond-diab">Diabetes</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="cond-apnea" value="Sleep Apnea" ${formData.conditions.includes('Sleep Apnea') ? 'checked' : ''}>
                    <label for="cond-apnea">Sleep Apnea</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="cond-other" value="Other" ${formData.conditions.includes('Other') ? 'checked' : ''}>
                    <label for="cond-other">Other</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Primary Health Goal</label>
                <div class="form-check">
                    <input type="radio" name="goal" id="goal-wl" value="Sustainable Weight Loss" ${formData.primaryGoal === 'Sustainable Weight Loss' ? 'checked' : ''}>
                    <label for="goal-wl">🎯 Sustainable Weight Loss</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="goal-cc" value="Condition Control" ${formData.primaryGoal === 'Condition Control' ? 'checked' : ''}>
                    <label for="goal-cc">🩺 Condition Control</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="goal-pm" value="Pain Management" ${formData.primaryGoal === 'Pain Management' ? 'checked' : ''}>
                    <label for="goal-pm">🩹 Pain Management</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="goal-ha" value="Healthy Aging" ${formData.primaryGoal === 'Healthy Aging' ? 'checked' : ''}>
                    <label for="goal-ha">🌿 Healthy Aging</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="goal-rm" value="Reduce Medication Reliance" ${formData.primaryGoal === 'Reduce Medication Reliance' ? 'checked' : ''}>
                    <label for="goal-rm">💊 Reduce Medication Reliance</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Measurement Units</label>
                <div class="form-row">
                    <div class="form-check">
                        <input type="radio" name="units" id="unit-metric" value="metric" ${formData.units === 'metric' ? 'checked' : ''}>
                        <label for="unit-metric">Metric (kg, cm)</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" name="units" id="unit-imperial" value="imperial" ${formData.units === 'imperial' ? 'checked' : ''}>
                        <label for="unit-imperial">Imperial (lbs, ft/in)</label>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCurrentStateScreen() {
        const medsHtml = formData.medications.map((med, i) => `
            <div class="card mb-2 medication-row" style="padding:var(--space-3)">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold">Medication ${i + 1}</span>
                    <button type="button" class="btn btn-ghost btn-sm remove-med" data-idx="${i}">✕</button>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-2)">
                    <input type="text" class="form-input med-name" placeholder="Medication name" value="${Utils.escapeHtml(med.name)}">
                </div>
                <div class="form-row">
                    <div class="form-group" style="margin-bottom:0">
                        <input type="text" class="form-input med-dose" placeholder="Dose" value="${Utils.escapeHtml(med.dose)}">
                    </div>
                    <div class="form-group" style="margin-bottom:0">
                        <select class="form-select med-condition">
                            <option value="">Condition...</option>
                            <option value="Gout" ${med.condition === 'Gout' ? 'selected' : ''}>Gout</option>
                            <option value="High Cholesterol" ${med.condition === 'High Cholesterol' ? 'selected' : ''}>Cholesterol</option>
                            <option value="Hypertension" ${med.condition === 'Hypertension' ? 'selected' : ''}>Hypertension</option>
                            <option value="Other" ${med.condition === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <h1 class="onboarding-title">💊 Current Health Status</h1>
            <p class="onboarding-subtitle">Tell us about your medications and limitations</p>

            <div class="form-group">
                <label class="form-label">Current Medications</label>
                <div id="medications-list">${medsHtml}</div>
                <button type="button" class="btn btn-secondary btn-sm mt-2" id="add-medication">+ Add Medication</button>
            </div>

            <div class="form-group">
                <label class="form-label">Exercise Limitations</label>
                <textarea class="form-textarea" id="exercise-limitations" placeholder="Any injuries, joint issues, physical restrictions...">${Utils.escapeHtml(formData.exerciseLimitations)}</textarea>
            </div>

            <div class="form-group">
                <label class="form-check">
                    <input type="checkbox" id="doctor-clearance" ${formData.doctorClearance ? 'checked' : ''}>
                    <span>✅ My doctor has cleared me for exercise and dietary changes</span>
                </label>
            </div>

            <div class="form-group">
                <label class="form-label">Preferred Exercise Time</label>
                <div class="form-row" style="flex-wrap:wrap">
                    <div class="form-check"><input type="radio" name="exercise-time" id="et-morning" value="Morning" ${formData.preferredExerciseTime === 'Morning' ? 'checked' : ''}><label for="et-morning">🌅 Morning</label></div>
                    <div class="form-check"><input type="radio" name="exercise-time" id="et-lunch" value="Lunch" ${formData.preferredExerciseTime === 'Lunch' ? 'checked' : ''}><label for="et-lunch">☀️ Lunch</label></div>
                    <div class="form-check"><input type="radio" name="exercise-time" id="et-evening" value="Evening" ${formData.preferredExerciseTime === 'Evening' ? 'checked' : ''}><label for="et-evening">🌙 Evening</label></div>
                    <div class="form-check"><input type="radio" name="exercise-time" id="et-flex" value="Flexible" ${formData.preferredExerciseTime === 'Flexible' ? 'checked' : ''}><label for="et-flex">🔄 Flexible</label></div>
                </div>
            </div>
        `;
    }

    function renderBaselineScreen() {
        const units = formData.units;
        const weightUnit = units === 'metric' ? 'kg' : 'lbs';
        const heightLabel = units === 'metric' ? 'Height (cm)' : 'Height';
        const heightPlaceholder = units === 'metric' ? 'e.g., 175' : 'e.g., 5\'10" or 70 inches';

        return `
            <h1 class="onboarding-title">📊 Baseline Measurements</h1>
            <p class="onboarding-subtitle">Let's establish your starting point</p>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Weight (${weightUnit})</label>
                    <input type="number" class="form-input" id="current-weight" inputmode="decimal" placeholder="Enter weight" value="${formData.currentWeight}" step="0.1" min="20" max="500">
                </div>
                <div class="form-group">
                    <label class="form-label">${heightLabel}</label>
                    <input type="text" class="form-input" id="height" placeholder="${heightPlaceholder}" value="${Utils.escapeHtml(formData.height)}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Last Blood Pressure Reading (optional)</label>
                <div class="form-row" style="align-items:center">
                    <input type="number" class="form-input" id="systolic" inputmode="numeric" placeholder="Systolic" value="${formData.systolic}" min="70" max="250">
                    <span style="font-size:var(--text-xl);color:var(--color-text-muted)">/</span>
                    <input type="number" class="form-input" id="diastolic" inputmode="numeric" placeholder="Diastolic" value="${formData.diastolic}" min="40" max="150">
                    <span class="text-sm text-muted">mmHg</span>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">How often do you want to check in?</label>
                <div class="form-row">
                    <div class="form-check"><input type="radio" name="checkin" id="freq-daily" value="daily" ${formData.checkinFrequency === 'daily' ? 'checked' : ''}><label for="freq-daily">📅 Daily</label></div>
                    <div class="form-check"><input type="radio" name="checkin" id="freq-weekly" value="weekly" ${formData.checkinFrequency === 'weekly' ? 'checked' : ''}><label for="freq-weekly">📆 Weekly</label></div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">What's derailed your health goals in the past?</label>
                <textarea class="form-textarea" id="past-challenges" placeholder="Understanding this helps us support you better...">${Utils.escapeHtml(formData.pastChallenges)}</textarea>
                <div class="form-hint">This is gold for your behavioral coach — be honest!</div>
            </div>
        `;
    }

    function afterRender() {
        const backBtn = document.getElementById('back-btn');
        if (backBtn) backBtn.addEventListener('click', goBack);

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.addEventListener('click', goNext);

        // Screen 2: medication management
        if (currentScreen === 2) {
            const addBtn = document.getElementById('add-medication');
            if (addBtn) addBtn.addEventListener('click', () => {
                collectCurrentFormData();
                formData.medications.push({ name: '', dose: '', condition: '' });
                reRender();
            });

            document.querySelectorAll('.remove-med').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectCurrentFormData();
                    formData.medications.splice(parseInt(btn.dataset.idx), 1);
                    reRender();
                });
            });
        }
    }

    function goBack() {
        collectCurrentFormData();
        currentScreen--;
        reRender();
    }

    function goNext() {
        collectCurrentFormData();
        if (!validateCurrentScreen()) return;

        if (currentScreen < 3) {
            currentScreen++;
            reRender();
        } else {
            completeOnboarding();
        }
    }

    function validateCurrentScreen() {
        if (currentScreen === 1) {
            if (!formData.name.trim()) { Utils.toast('Please enter your name', 'warning'); return false; }
            if (!formData.primaryGoal) { Utils.toast('Please select a primary health goal', 'warning'); return false; }
        }
        if (currentScreen === 3) {
            if (!formData.currentWeight) { Utils.toast('Please enter your current weight', 'warning'); return false; }
            if (!formData.height) { Utils.toast('Please enter your height', 'warning'); return false; }
        }
        return true;
    }

    async function completeOnboarding() {
        try {
            // Save profile
            await Store.saveProfile({
                name: formData.name,
                conditions: formData.conditions,
                primaryGoal: formData.primaryGoal,
                units: formData.units,
                exerciseLimitations: formData.exerciseLimitations,
                doctorClearance: formData.doctorClearance,
                preferredExerciseTime: formData.preferredExerciseTime,
                currentWeight: parseFloat(formData.currentWeight),
                height: formData.height,
                checkinFrequency: formData.checkinFrequency,
                pastChallenges: formData.pastChallenges
            });

            // Save medications
            for (const med of formData.medications) {
                if (med.name.trim()) {
                    await Store.add('medications', {
                        name: med.name,
                        dose: med.dose,
                        condition: med.condition,
                        schedule: 'daily',
                        active: 1,
                        doseHistory: [{ date: Utils.dateStr(), dose: med.dose, reason: 'Initial' }]
                    });
                }
            }

            // Save initial weight as a vital
            if (formData.currentWeight) {
                const weightKg = formData.units === 'imperial'
                    ? Utils.lbsToKg(parseFloat(formData.currentWeight))
                    : parseFloat(formData.currentWeight);
                await Store.addVital({
                    type: 'weight',
                    value: weightKg,
                    displayValue: parseFloat(formData.currentWeight),
                    displayUnit: formData.units === 'metric' ? 'kg' : 'lbs',
                    date: Utils.dateStr()
                });
            }

            // Save initial BP
            if (formData.systolic && formData.diastolic) {
                await Store.addVital({
                    type: 'bp',
                    systolic: parseInt(formData.systolic),
                    diastolic: parseInt(formData.diastolic),
                    date: Utils.dateStr()
                });
            }

            Utils.setSetting('units', formData.units);
            Utils.setSetting('onboarded', true);
            Utils.toast('Welcome! Your health journey starts now. 🏛️', 'success');
            window.location.hash = '#/dashboard';
        } catch (error) {
            console.error('Onboarding error:', error);
            Utils.toast('Error saving — please try again.', 'danger');
        }
    }

    App.register('onboarding', { render, afterRender });
})();