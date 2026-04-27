App.register('log/meal', {
    render(sub) {
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Log Meal</h1>
                    <p class="page-subtitle">Record your food intake and gout triggers</p>
                </div>

                <form id="mealForm" class="card">
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" id="mealDate" class="form-input" value="${Utils.dateStr(new Date())}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Meal Type</label>
                        <select id="mealType" class="form-select" required>
                            <option value="">Select meal type...</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Food Items</label>
                        <textarea id="foodItems" class="form-textarea" placeholder="List the foods you ate..." required></textarea>
                        <p class="form-hint">Be as detailed as possible for better tracking</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Estimated Calories</label>
                        <input type="number" id="calories" class="form-input" placeholder="Estimated calories" min="0" step="10">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Estimated Protein (grams)</label>
                        <input type="number" id="protein" class="form-input" placeholder="Protein in grams" min="0" step="0.5">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Gout Triggers Present</label>
                        <div id="goutTriggers" class="form-check">
                            ${PurineGuide.triggers.map(trigger => {
                                const riskClass = `tag-${trigger.risk === 'high' ? 'red' : trigger.risk === 'moderate' ? 'yellow' : 'green'}`;
                                return `
                                    <label class="form-check">
                                        <input type="checkbox" value="${trigger.id}">
                                        <span class="tag ${riskClass}">${trigger.label}</span>
                                        <span class="text-sm text-muted">(${trigger.risk} risk)</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                        <p class="form-hint">Check any high-purine foods or known triggers you consumed</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Diet Adherence</label>
                        <select id="adherence" class="form-select">
                            <option value="on-plan">On Plan</option>
                            <option value="mostly-on-plan">Mostly On Plan</option>
                            <option value="off-plan">Off Plan</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea id="notes" class="form-textarea" placeholder="How did you feel after eating? Any reactions..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Save Meal</button>
                </form>

                <div id="triggerWarnings" class="mt-4"></div>
            </div>
        `;
    },

    afterRender(sub) {
        this.setupTriggerWarnings();
        
        document.getElementById('mealForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveMeal();
        });
    },

    setupTriggerWarnings() {
        const triggerCheckboxes = document.querySelectorAll('#goutTriggers input[type="checkbox"]');
        const warningsDiv = document.getElementById('triggerWarnings');

        triggerCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateTriggerWarnings();
            });
        });
    },

    updateTriggerWarnings() {
        const checkedTriggers = Array.from(document.querySelectorAll('#goutTriggers input:checked'))
            .map(cb => cb.value);
        
        const warningsDiv = document.getElementById('triggerWarnings');
        warningsDiv.innerHTML = '';

        if (checkedTriggers.length === 0) return;

        const highRiskTriggers = checkedTriggers.filter(triggerId => {
            const trigger = PurineGuide.triggers.find(t => t.id === triggerId);
            return trigger && trigger.risk === 'high';
        });

        const moderateRiskTriggers = checkedTriggers.filter(triggerId => {
            const trigger = PurineGuide.triggers.find(t => t.id === triggerId);
            return trigger && trigger.risk === 'moderate';
        });

        if (highRiskTriggers.length > 0) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.innerHTML = `
                <strong>⚠️ High-Risk Triggers Detected</strong>
                <p>You've consumed high-purine foods that may increase gout flare risk. Consider:</p>
                <ul>
                    <li>Increasing water intake</li>
                    <li>Monitoring for flare symptoms over the next 24-48 hours</li>
                    <li>Taking preventive medication if prescribed</li>
                </ul>
            `;
            warningsDiv.appendChild(alertDiv);
        } else if (moderateRiskTriggers.length > 0) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning';
            alertDiv.innerHTML = `
                <strong>⚠️ Moderate-Risk Triggers</strong>
                <p>Monitor portion sizes and consider balancing with low-purine foods.</p>
            `;
            warningsDiv.appendChild(alertDiv);
        }
    },

    async saveMeal() {
        const formData = this.gatherFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            await Store.add('meals', formData);
            Utils.toast('Meal logged successfully!', 'success');
            
            this.resetForm();
            setTimeout(() => {
                window.location.hash = '#log';
            }, 1500);

        } catch (error) {
            console.error('Error saving meal:', error);
            Utils.toast('Error saving meal. Please try again.', 'error');
        }
    },

    gatherFormData() {
        return {
            id: Utils.uid(),
            date: new Date(document.getElementById('mealDate').value).toISOString(),
            type: document.getElementById('mealType').value,
            foodItems: document.getElementById('foodItems').value.trim(),
            calories: document.getElementById('calories').value ? parseInt(document.getElementById('calories').value) : null,
            protein: document.getElementById('protein').value ? parseFloat(document.getElementById('protein').value) : null,
            goutTriggers: Array.from(document.querySelectorAll('#goutTriggers input:checked'))
                .map(cb => cb.value),
            adherence: document.getElementById('adherence').value,
            notes: document.getElementById('notes').value || null
        };
    },

    validateForm(data) {
        if (!data.type) {
            Utils.toast('Please select a meal type', 'error');
            return false;
        }
        if (!data.foodItems) {
            Utils.toast('Please enter the food items', 'error');
            return false;
        }
        return true;
    },

    resetForm() {
        document.getElementById('mealForm').reset();
        document.getElementById('mealDate').value = Utils.dateStr(new Date());
        document.getElementById('triggerWarnings').innerHTML = '';
    }
});