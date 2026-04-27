// Onboarding page - 3-screen progressive setup
(function() {
    let currentScreen = 1;
    let formData = {
        name: '',
        conditions: [],
        primaryGoal: '',
        units: 'imperial',
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

    function render() {
        return `
            <div class="page onboarding">
                <div class="onboarding-progress">
                    <div class="onboarding-dot ${currentScreen >= 1 ? 'active' : ''}"></div>
                    <div class="onboarding-dot ${currentScreen >= 2 ? 'active' : ''}"></div>
                    <div class="onboarding-dot ${currentScreen >= 3 ? 'active' : ''}"></div>
                </div>

                <div class="onboarding-content">
                    ${renderCurrentScreen()}
                </div>

                <div class="onboarding-footer">
                    ${currentScreen > 1 ? '<button type="button" class="btn btn-secondary" id="back-btn">Back</button>' : ''}
                    <button type="button" class="btn btn-primary" id="next-btn">
                        ${currentScreen < 3 ? 'Next' : 'Complete Setup'}
                    </button>
                </div>
            </div>
        `;
    }

    function renderCurrentScreen() {
        switch(currentScreen) {
            case 1:
                return renderWelcomeScreen();
            case 2:
                return renderCurrentStateScreen();
            case 3:
                return renderBaselineScreen();
            default:
                return '';
        }
    }

    function renderWelcomeScreen() {
        return `
            <div class="onboarding-title">Welcome to Your Health Journey</div>
            <div class="onboarding-subtitle">Let's personalize your experience</div>

            <div class="form-group">
                <label class="form-label">What should we call you?</label>
                <input type="text" class="form-input" id="name" placeholder="Your name" value="${Utils.escapeHtml(formData.name)}">
            </div>

            <div class="form-group">
                <label class="form-label">Health Conditions (check all that apply)</label>
                <div class="form-check">
                    <input type="checkbox" id="gout" value="Gout" ${formData.conditions.includes('Gout') ? 'checked' : ''}>
                    <label for="gout">Gout</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="cholesterol" value="High Cholesterol" ${formData.conditions.includes('High Cholesterol') ? 'checked' : ''}>
                    <label for="cholesterol">High Cholesterol</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="hypertension" value="Hypertension" ${formData.conditions.includes('Hypertension') ? 'checked' : ''}>
                    <label for="hypertension">Hypertension</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="diabetes" value="Diabetes" ${formData.conditions.includes('Diabetes') ? 'checked' : ''}>
                    <label for="diabetes">Diabetes</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="sleep-apnea" value="Sleep Apnea" ${formData.conditions.includes('Sleep Apnea') ? 'checked' : ''}>
                    <label for="sleep-apnea">Sleep Apnea</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" id="other" value="Other" ${formData.conditions.includes('Other') ? 'checked' : ''}>
                    <label for="other">Other</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Primary Health Goal</label>
                <div class="form-check">
                    <input type="radio" name="goal" id="weight-loss" value="Sustainable Weight Loss" ${formData.primaryGoal === 'Sustainable Weight Loss' ? 'checked' : ''}>
                    <label for="weight-loss">Sustainable Weight Loss</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="condition-control" value="Condition Control" ${formData.primaryGoal === 'Condition Control' ? 'checked' : ''}>
                    <label for="condition-control">Condition Control</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="pain-management" value="Pain Management" ${formData.primaryGoal === 'Pain Management' ? 'checked' : ''}>
                    <label for="pain-management">Pain Management</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="healthy-aging" value="Healthy Aging" ${formData.primaryGoal === 'Healthy Aging' ? 'checked' : ''}>
                    <label for="healthy-aging">Healthy Aging</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="goal" id="reduce-meds" value="Reduce Medication Reliance" ${formData.primaryGoal === 'Reduce Medication Reliance' ? 'checked' : ''}>
                    <label for="reduce-meds">Reduce Medication Reliance</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Measurement Units</label>
                <div class="form-check">
                    <input type="radio" name="units" id="imperial" value="imperial" ${formData.units === 'imperial' ? 'checked' : ''}>
                    <label for="imperial">Imperial (lbs, ft/in)</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="units" id="metric" value="metric" ${formData.units === 'metric' ? 'checked' : ''}>
                    <label for="metric">Metric (kg, cm)</label>
                </div>
            </div>

            ${Safety.renderDisclaimer(Safety.DISCLAIMER.onboarding)}
        `;
    }

    function renderCurrentStateScreen() {
        return `
            <div class="onboarding-title">Current Health Status</div>
            <div class="onboarding-subtitle">Help us understand your current situation</div>

            <div class="form-group">
                <label class="form-label">Current Medications</label>
                <div id="medications-list">
                    ${formData.medications.map((med, index) => `
                        <div class="form-row medication-row" data-index="${index}">
                            <input type="text" class="form-input" placeholder="Medication name" value="${Utils.escapeHtml(med.name)}">
                            <input type="text" class="form-input" placeholder="Dose" value="${Utils.escapeHtml(med.dose)}">
                            <select class="form-select">
                                <option value="">For condition...</option>
                                <option value="Gout" ${med.condition === 'Gout' ? 'selected' : ''}>Gout</option>
                                <option value="High Cholesterol" ${med.condition === 'High Cholesterol' ? 'selected' : ''}>High Cholesterol</option>
                                <option value="Hypertension" ${med.condition === 'Hypertension' ? 'selected' : ''}>Hypertension</option>
                                <option value="Diabetes" ${med.condition === 'Diabetes' ? 'selected' : ''}>Diabetes</option>
                                <option value="Sleep Apnea" ${med.condition === 'Sleep Apnea' ? 'selected' : ''}>Sleep Apnea</option>
                                <option value="Other" ${med.condition === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                            <button type="button" class="btn btn-danger btn-sm remove-med">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-secondary btn-sm" id="add-medication">Add Medication</button>
            </div>

            <div class="form-group">
                <label class="form-label">Exercise Limitations</label>
                <textarea class="form-textarea" id="exercise-limitations" placeholder="Any physical limitations or restrictions...">${Utils.escapeHtml(formData.exerciseLimitations)}</textarea>
            </div>

            <div class="form-group">
                <div class="form-check">
                    <input type="checkbox" id="doctor-clearance" ${formData.doctorClearance ? 'checked' : ''}>
                    <label for="doctor-clearance">I have my doctor's clearance to exercise</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Preferred Exercise Time</label>
                <div class="form-check">
                    <input type="radio" name="exercise-time" id="morning" value="Morning" ${formData.preferredExerciseTime === 'Morning' ? 'checked' : ''}>
                    <label for="morning">Morning</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="exercise-time" id="lunch" value="Lunch" ${formData.preferredExerciseTime === 'Lunch' ? 'checked' : ''}>
                    <label for="lunch">Lunch</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="exercise-time" id="evening" value="Evening" ${formData.preferredExerciseTime === 'Evening' ? 'checked' : ''}>
                    <label for="evening">Evening</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="exercise-time" id="flexible" value="Flexible" ${formData.preferredExerciseTime === 'Flexible' ? 'checked' : ''}>
                    <label for="flexible">Flexible</label>
                </div>
            </div>
        `;
    }

    function renderBaselineScreen() {
        const units = formData.units;
        const weightUnit = units === 'metric' ? 'kg' : 'lbs';
        const heightLabel = units === 'metric' ? 'Height (cm)' : 'Height (ft\'in")';
        const heightPlaceholder = units === 'metric' ? 'e.g., 175' : 'e.g., 5\'10"';

        return `
            <div class="onboarding-title">Baseline Measurements</div>
            <div class="onboarding-subtitle">Let's establish your starting point</div>

            <div class="form-group">
                <label class="form-label">Current Weight (${weightUnit})</label>
                <input type="number" class="form-input" id="current-weight" placeholder="Enter weight" value="${formData.currentWeight}" step="0.1">
            </div>

            <div class="form-group">
                <label class="form-label">${heightLabel}</label>
                <input type="text" class="form-input" id="height" placeholder="${heightPlaceholder}" value="${Utils.escapeHtml(formData.height)}">
            </div>

            <div class="form-group">
                <label class="form-label">Last Blood Pressure Reading</label>
                <div class="form-row">
                    <input type="number" class="form-input" id="systolic" placeholder="Systolic" value="${formData.systolic}" min="70" max="250">
                    <span class="form-label">/</span>
                    <input type="number" class="form-input" id="diastolic" placeholder="Diastolic" value="${formData.diastolic}" min="40" max="150">
                    <span class="form-hint">mmHg</span>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Check-in Frequency</label>
                <div class="form-check">
                    <input type="radio" name="checkin" id="daily" value="daily" ${formData.checkinFrequency === 'daily' ? 'checked' : ''}>
                    <label for="daily">Daily</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="checkin" id="weekly" value="weekly" ${formData.checkinFrequency === 'weekly' ? 'checked' : ''}>
                    <label for="weekly">Weekly</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">What's derailed your health goals in the past?</label>
                <textarea class="form-textarea" id="past-challenges" placeholder="Understanding past challenges helps us support you better...">${Utils.escapeHtml(formData.pastChallenges)}</textarea>
            </div>
        `;
    }

    function afterRender() {
        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', goBack);
        }

        // Next button
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', goNext);
        }

        // Screen-specific event listeners
        if (currentScreen === 1) {
            setupWelcomeScreenEvents();
        } else if (currentScreen === 2) {
            setupCurrentStateScreenEvents();
        } else if (currentScreen === 3) {
            setupBaselineScreenEvents();
        }
    }

    function setupWelcomeScreenEvents() {
        // Name input
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                formData.name = e.target.value;
            });
        }

        // Condition checkboxes
        const conditionCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        conditionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateConditions);
        });

        // Goal radio buttons
        const goalRadios = document.querySelectorAll('input[name="goal"]');
        goalRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                formData.primaryGoal = e.target.value;
            });
        });

        // Units radio buttons
        const unitRadios = document.querySelectorAll('input[name="units"]');
        unitRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                formData.units = e.target.value;
            });
        });
    }

    function setupCurrentStateScreenEvents() {
        // Add medication button
        const addMedBtn = document.getElementById('add-medication');
        if (addMedBtn) {
            addMedBtn.addEventListener('click', addMedication);
        }

        // Remove medication buttons
        const removeBtns = document.querySelectorAll('.remove-med');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.medication-row').dataset.index);
                removeMedication(index);
            });
        });

        // Exercise limitations
        const exerciseLimitationsInput = document.getElementById('exercise-limitations');
        if (exerciseLimitationsInput) {
            exerciseLimitationsInput.addEventListener('input', (e) => {
                formData.exerciseLimitations = e.target.value;
            });
        }

        // Doctor clearance
        const doctorClearanceInput = document.getElementById('doctor-clearance');
        if (doctorClearanceInput) {
            doctorClearanceInput.addEventListener('change', (e) => {
                formData.doctorClearance = e.target.checked;
            });
        }

        // Exercise time
        const exerciseTimeRadios = document.querySelectorAll('input[name="exercise-time"]');
        exerciseTimeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                formData.preferredExerciseTime = e.target.value;
            });
        });

        // Update medications from current form state
        updateMedicationsFromForm();
    }

    function setupBaselineScreenEvents() {
        // Weight input
        const weightInput = document.getElementById('current-weight');
        if (weightInput) {
            weightInput.addEventListener('input', (e) => {
                formData.currentWeight = e.target.value;
            });
        }

        // Height input
        const heightInput = document.getElementById('height');
        if (heightInput) {
            heightInput.addEventListener('input', (e) => {
                formData.height = e.target.value;
            });
        }

        // BP inputs
        const systolicInput = document.getElementById('systolic');
        if (systolicInput) {
            systolicInput.addEventListener('input', (e) => {
                formData.systolic = e.target.value;
            });
        }

        const diastolicInput = document.getElementById('diastolic');
        if (diastolicInput) {
            diastolicInput.addEventListener('input', (e) => {
                formData.diastolic = e.target.value;
            });
        }

        // Check-in frequency
        const checkinRadios = document.querySelectorAll('input[name="checkin"]');
        checkinRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                formData.checkinFrequency = e.target.value;
            });
        });

        // Past challenges
        const pastChallengesInput = document.getElementById('past-challenges');
        if (pastChallengesInput) {
            pastChallengesInput.addEventListener('input', (e) => {
                formData.pastChallenges = e.target.value;
            });
        }
    }

    function updateConditions() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        formData.conditions = Array.from(checkboxes).map(cb => cb.value);
    }

    function addMedication() {
        formData.medications.push({ name: '', dose: '', condition: '' });
        App.render(); // Re-render to show new medication row
    }

    function removeMedication(index) {
        formData.medications.splice(index, 1);
        App.render(); // Re-render to remove medication row
    }

    function updateMedicationsFromForm() {
        const medRows = document.querySelectorAll('.medication-row');
        medRows.forEach((row, index) => {
            const nameInput = row.querySelector('input[placeholder="Medication name"]');
            const doseInput = row.querySelector('input[placeholder="Dose"]');
            const conditionSelect = row.querySelector('select');

            if (nameInput && doseInput && conditionSelect) {
                formData.medications[index] = {
                    name: nameInput.value,
                    dose: doseInput.value,
                    condition: conditionSelect.value
                };

                // Add event listeners for real-time updates
                nameInput.addEventListener('input', (e) => {
                    formData.medications[index].name = e.target.value;
                });
                doseInput.addEventListener('input', (e) => {
                    formData.medications[index].dose = e.target.value;
                });
                conditionSelect.addEventListener('change', (e) => {
                    formData.medications[index].condition = e.target.value;
                });
            }
        });
    }

    function goBack() {
        if (currentScreen > 1) {
            currentScreen--;
            App.render();
        }
    }

    async function goNext() {
        if (currentScreen < 3) {
            if (validateCurrentScreen()) {
                currentScreen++;
                App.render();
            }
        } else {
            // Complete onboarding
            if (validateCurrentScreen()) {
                await completeOnboarding();
            }
        }
    }

    function validateCurrentScreen() {
        switch(currentScreen) {
            case 1:
                if (!formData.name.trim()) {
                    Utils.toast('Please enter your name', 'error');
                    return false;
                }
                if (!formData.primaryGoal) {
                    Utils.toast('Please select your primary health goal', 'error');
                    return false;
                }
                return true;
            case 2:
                return true; // No required fields on screen 2
            case 3:
                if (!formData.currentWeight) {
                    Utils.toast('Please enter your current weight', 'error');
                    return false;
                }
                if (!formData.height) {
                    Utils.toast('Please enter your height', 'error');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    async function completeOnboarding() {
        try {
            // Save profile to Store
            await Store.saveProfile({
                id: Utils.uid(),
                name: formData.name,
                conditions: formData.conditions,
                primaryGoal: formData.primaryGoal,
                units: formData.units,
                medications: formData.medications,
                exerciseLimitations: formData.exerciseLimitations,
                doctorClearance: formData.doctorClearance,
                preferredExerciseTime: formData.preferredExerciseTime,
                currentWeight: parseFloat(formData.currentWeight),
                height: formData.height,
                checkinFrequency: formData.checkinFrequency,
                pastChallenges: formData.pastChallenges,
                createdAt: new Date().toISOString()
            });

            // Save initial weight if provided
            if (formData.currentWeight) {
                await Store.saveWeight({
                    id: Utils.uid(),
                    weight: parseFloat(formData.currentWeight),
                    units: formData.units,
                    date: Utils.dateStr(),
                    timestamp: new Date().toISOString()
                });
            }

            // Save initial BP if provided
            if (formData.systolic && formData.diastolic) {
                await Store.saveBP({
                    id: Utils.uid(),
                    systolic: parseInt(formData.systolic),
                    diastolic: parseInt(formData.diastolic),
                    date: Utils.dateStr(),
                    timestamp: new Date().toISOString()
                });
            }

            // Set units preference
            Utils.setSetting('units', formData.units);

            // Mark as onboarded
            Utils.setSetting('onboarded', true);

            Utils.toast('Welcome! Your health journey starts now.', 'success');

            // Navigate to dashboard
            window.location.hash = '#/dashboard';

        } catch (error) {
            console.error('Error completing onboarding:', error);
            Utils.toast('Error saving your information. Please try again.', 'error');
        }
    }

    // Register the page
    App.register('onboarding', { render, afterRender });

})();