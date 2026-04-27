App.register('log/flare', {
    render(sub) {
        const goutJoints = BodyParts.goutJoints();
        const triggers = this.getAllTriggers();
        
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Log Gout Flare</h1>
                    <p class="page-subtitle">Record gout flare details and triggers</p>
                </div>

                <form id="flareForm" class="card">
                    <div class="form-group">
                        <label class="form-label">Date & Time</label>
                        <input type="datetime-local" id="flareDate" class="form-input" value="${new Date().toISOString().slice(0, 16)}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Severity</label>
                        <div class="pain-slider">
                            <input type="range" id="severity" class="form-input" min="0" max="10" value="5" step="1">
                            <div class="pain-value" id="severityValue">5</div>
                            <div class="pain-label" id="severityLabel">Moderate</div>
                        </div>
                        <div class="flex justify-between text-sm text-muted mt-2">
                            <span>Mild Discomfort</span>
                            <span>Excruciating</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Affected Joints</label>
                        <div id="affectedJoints" class="form-check">
                            ${goutJoints.map(joint => `
                                <label class="form-check">
                                    <input type="checkbox" value="${joint.id}"> ${joint.label}
                                </label>
                            `).join('')}
                        </div>
                        <p class="form-hint">Select all joints experiencing symptoms</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Suspected Triggers</label>
                        <div id="suspectedTriggers" class="form-check">
                            ${triggers.map(trigger => `
                                <label class="form-check">
                                    <input type="checkbox" value="${trigger.id}"> 
                                    <span class="${trigger.riskClass || ''}">${trigger.label}</span>
                                </label>
                            `).join('')}
                        </div>
                        <p class="form-hint">What might have triggered this flare?</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Treatment</label>
                        <div id="treatment" class="form-check">
                            <label class="form-check">
                                <input type="checkbox" value="colchicine"> Colchicine
                            </label>
                            <label class="form-check">
                                <input type="checkbox" value="nsaids"> NSAIDs
                            </label>
                            <label class="form-check">
                                <input type="checkbox" value="prednisone"> Prednisone/Steroids
                            </label>
                            <label class="form-check">
                                <input type="checkbox" value="ice"> Ice Application
                            </label>
                            <label class="form-check">
                                <input type="checkbox" value="elevation"> Elevation
                            </label>
                            <label class="form-check">
                                <input type="checkbox" value="rest"> Rest
                            </label>
                            <label class="form-check">
                                <input type="checkbox" value="other"> Other
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea id="notes" class="form-textarea" placeholder="Additional details about the flare, symptoms, timeline..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Save Flare Log</button>
                </form>

                <div id="nsaidWarning" class="mt-4" style="display: none;"></div>
                <div id="foodLookback" class="mt-4" style="display: none;"></div>
                <div class="mt-4">${Safety.renderDisclaimer('flare')}</div>
            </div>
        `;
    },

    getAllTriggers() {
        // Combine PurineGuide triggers with additional common triggers
        const purineTriggersWithRisk = PurineGuide.triggers.map(trigger => ({
            ...trigger,
            riskClass: `tag-${trigger.risk === 'high' ? 'red' : trigger.risk === 'moderate' ? 'yellow' : 'green'}`
        }));

        const additionalTriggers = [
            { id: 'dehydration', label: 'Dehydration' },
            { id: 'stress', label: 'Physical/Emotional Stress' },
            { id: 'injury', label: 'Joint Injury' },
            { id: 'fasting', label: 'Fasting/Crash Diet' },
            { id: 'unknown', label: 'Unknown' }
        ];

        return [...purineTriggersWithRisk, ...additionalTriggers];
    },

    afterRender(sub) {
        this.setupSeveritySlider();
        this.setupTreatmentWarnings();
        
        document.getElementById('flareForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveFlare();
        });
    },

    setupSeveritySlider() {
        const slider = document.getElementById('severity');
        const valueDisplay = document.getElementById('severityValue');
        const labelDisplay = document.getElementById('severityLabel');

        const updateSeverityDisplay = (value) => {
            const numValue = parseInt(value);
            valueDisplay.textContent = numValue;
            labelDisplay.textContent = Utils.painZone(numValue);
            
            // Remove existing color classes
            valueDisplay.classList.remove('green', 'yellow', 'red');
            // Add appropriate color class
            valueDisplay.classList.add(Utils.painColor(numValue));
        };

        slider.addEventListener('input', (e) => {
            updateSeverityDisplay(e.target.value);
        });

        // Initialize display
        updateSeverityDisplay(slider.value);
    },

    setupTreatmentWarnings() {
        const nsaidCheckbox = document.querySelector('#treatment input[value="nsaids"]');
        const warningDiv = document.getElementById('nsaidWarning');

        nsaidCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                warningDiv.innerHTML = Safety.nsaidWarning();
                warningDiv.style.display = 'block';
            } else {
                warningDiv.style.display = 'none';
            }
        });
    },

    async saveFlare() {
        const formData = this.gatherFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            // Get food lookback before saving
            const flareDate = new Date(formData.date);
            const meals = await Store.getMealsForTriggerLookback(flareDate);
            
            // Save flare entry
            const savedFlare = await Store.addFlare(formData);

            // Display food lookback
            this.displayFoodLookback(meals, flareDate);

            Utils.toast('Flare log saved successfully!', 'success');

            // Show severe flare warning if applicable
            if (formData.severity >= 8) {
                setTimeout(() => {
                    alert('Severe flare detected. Consider seeking immediate medical attention if symptoms worsen or if this is your first flare.');
                }, 1000);
            }

            this.resetForm();
            
        } catch (error) {
            console.error('Error saving flare log:', error);
            Utils.toast('Error saving flare log. Please try again.', 'error');
        }
    },

    gatherFormData() {
        return {
            id: Utils.uid(),
            date: new Date(document.getElementById('flareDate').value).toISOString(),
            severity: parseInt(document.getElementById('severity').value),
            joints: Array.from(document.querySelectorAll('#affectedJoints input:checked'))
                .map(cb => cb.value),
            suspectedTriggers: Array.from(document.querySelectorAll('#suspectedTriggers input:checked'))
                .map(cb => cb.value),
            treatment: Array.from(document.querySelectorAll('#treatment input:checked'))
                .map(cb => cb.value),
            notes: document.getElementById('notes').value || null
        };
    },

    validateForm(data) {
        if (data.joints.length === 0) {
            Utils.toast('Please select at least one affected joint', 'error');
            return false;
        }
        return true;
    },

    displayFoodLookback(meals, flareDate) {
        const lookbackDiv = document.getElementById('foodLookback');
        
        if (meals.length === 0) {
            lookbackDiv.innerHTML = `
                <div class="card">
                    <h4>48-Hour Food Lookback</h4>
                    <p class="text-muted">No meals recorded in the 48 hours before this flare.</p>
                </div>
            `;
        } else {
            const mealsHtml = meals.map(meal => {
                const mealDate = new Date(meal.date);
                const hoursAgo = Math.round((flareDate - mealDate) / (1000 * 60 * 60));
                
                return `
                    <div class="card mb-2">
                        <div class="flex justify-between items-center mb-2">
                            <strong>${meal.type}</strong>
                            <span class="text-sm text-muted">${hoursAgo}h ago</span>
                        </div>
                        <p>${Utils.escapeHtml(meal.foodItems || 'No details recorded')}</p>
                        ${meal.goutTriggers && meal.goutTriggers.length > 0 ? `
                            <div class="gap-2">
                                ${meal.goutTriggers.map(trigger => {
                                    const triggerInfo = PurineGuide.triggers.find(t => t.id === trigger);
                                    const riskClass = triggerInfo ? `tag-${triggerInfo.risk === 'high' ? 'red' : triggerInfo.risk === 'moderate' ? 'yellow' : 'green'}` : '';
                                    return `<span class="tag ${riskClass}">${triggerInfo ? triggerInfo.label : trigger}</span>`;
                                }).join(' ')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            lookbackDiv.innerHTML = `
                <div class="card">
                    <h4>48-Hour Food Lookback</h4>
                    <p class="text-muted mb-4">Meals consumed in the 48 hours before this flare:</p>
                    ${mealsHtml}
                </div>
            `;
        }
        
        lookbackDiv.style.display = 'block';
    },

    resetForm() {
        document.getElementById('flareForm').reset();
        document.getElementById('flareDate').value = new Date().toISOString().slice(0, 16);
        document.getElementById('severity').value = '5';
        document.getElementById('nsaidWarning').style.display = 'none';
        this.setupSeveritySlider();
    }
});