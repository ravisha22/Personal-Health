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
            var flareDateStr = formData.date || Utils.dateStr();
            const meals = await Store.getMealsForTriggerLookback(flareDateStr);
            
            // Save flare entry
            const savedFlare = await Store.addFlare(formData);

            // Display food lookback
            this.displayFoodLookback(meals, flareDateStr);

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
        var dateEl = document.getElementById('flareDate');
        var dateVal = dateEl ? dateEl.value : '';
        var dateStr;
        try {
            dateStr = dateVal ? new Date(dateVal).toISOString().split('T')[0] : Utils.dateStr();
        } catch(e) {
            dateStr = Utils.dateStr();
        }
        return {
            id: Utils.uid(),
            date: dateStr,
            severity: parseInt(document.getElementById('severity').value) || 5,
            joints: Array.from(document.querySelectorAll('#affectedJoints input:checked'))
                .map(cb => cb.value),
            suspectedTriggers: Array.from(document.querySelectorAll('#suspectedTriggers input:checked'))
                .map(cb => cb.value),
            treatment: Array.from(document.querySelectorAll('#treatment input:checked'))
                .map(cb => cb.value),
            notes: document.getElementById('notes') ? document.getElementById('notes').value : ''
        };
    },

    validateForm(data) {
        if (data.joints.length === 0) {
            Utils.toast('Please select at least one affected joint', 'error');
            return false;
        }
        return true;
    },

    displayFoodLookback(meals, flareDateStr) {
        const lookbackDiv = document.getElementById('foodLookback');
        if (!lookbackDiv) return;
        
        if (!meals || meals.length === 0) {
            lookbackDiv.innerHTML = '<div class="card"><h4>48-Hour Food Lookback</h4><p class="text-muted">No meals recorded in the 48 hours before this flare.</p></div>';
        } else {
            var flareD = new Date(flareDateStr + 'T00:00:00');
            var h = '<div class="card"><h4>48-Hour Food Lookback</h4>';
            for (var i = 0; i < meals.length; i++) {
                var meal = meals[i];
                var mealD = new Date((meal.date || '') + 'T00:00:00');
                var hoursAgo = Math.max(0, Math.round((flareD - mealD) / (1000 * 60 * 60)));
                h += '<div class="log-entry">';
                h += '<div class="log-entry-header"><strong>' + Utils.escapeHtml(meal.type || meal.meal || 'Meal') + '</strong>';
                h += '<span class="text-sm text-muted">' + hoursAgo + 'h ago</span></div>';
                if (meal.items) h += '<span class="text-sm">' + Utils.escapeHtml(typeof meal.items === 'string' ? meal.items : (meal.items || []).join(', ')) + '</span>';
                h += '</div>';
            }
            h += '</div>';
            lookbackDiv.innerHTML = h;
        }
        lookbackDiv.style.display = 'block';
    },

    resetForm() {
        var form = document.getElementById('flareForm');
        if (form) form.reset();
        var dateEl = document.getElementById('flareDate');
        if (dateEl) dateEl.value = new Date().toISOString().slice(0, 16);
        var sevEl = document.getElementById('severity');
        if (sevEl) sevEl.value = '5';
        var nsaidEl = document.getElementById('nsaidWarning');
        if (nsaidEl) nsaidEl.style.display = 'none';
        if (this.setupSeveritySlider) this.setupSeveritySlider();
    }
});