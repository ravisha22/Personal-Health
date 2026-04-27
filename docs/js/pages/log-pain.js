App.register('log/pain', {
    render(sub) {
        // Get categorized body parts with gout-common joints first
        const bodyPartsHtml = this.renderBodyParts();
        
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Log Pain</h1>
                    <p class="page-subtitle">Record pain levels and details</p>
                </div>

                <form id="painForm" class="card">
                    <div class="form-group">
                        <label class="form-label">Date & Time</label>
                        <input type="datetime-local" id="painDate" class="form-input" value="${new Date().toISOString().slice(0, 16)}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Body Part</label>
                        <select id="bodyPart" class="form-select" required>
                            <option value="">Select body part...</option>
                            ${bodyPartsHtml}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Pain Level</label>
                        <div class="pain-slider">
                            <input type="range" id="painLevel" class="form-input" min="0" max="10" value="5" step="1">
                            <div class="pain-value" id="painValue">5</div>
                            <div class="pain-label" id="painLabel">Moderate</div>
                        </div>
                        <div class="flex justify-between text-sm text-muted mt-2">
                            <span>No Pain</span>
                            <span>Worst Possible</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Pain Type</label>
                        <select id="painType" class="form-select">
                            <option value="">Select type...</option>
                            ${PainReference.painTypes.map(type => 
                                `<option value="${type.id}">${type.label}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Context</label>
                        <select id="context" class="form-select">
                            <option value="">Select context...</option>
                            ${PainReference.contexts.map(context => 
                                `<option value="${context.id}">${context.label}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Visible Signs</label>
                        <div id="visibleSigns" class="form-check">
                            ${PainReference.visibleSigns.map(sign => `
                                <label class="form-check">
                                    <input type="checkbox" value="${sign.id}"> ${sign.label}
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Function Effect</label>
                        <select id="functionEffect" class="form-select">
                            <option value="">Select effect...</option>
                            ${PainReference.functionEffects.map(effect => 
                                `<option value="${effect.id}">${effect.label}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea id="notes" class="form-textarea" placeholder="Describe the pain, triggers, what helps..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Save Pain Log</button>
                </form>

                <div id="alerts" class="mt-4"></div>
            </div>
        `;
    },

    renderBodyParts() {
        let html = '';
        
        // First add gout-common joints with warning marker
        const goutJoints = BodyParts.goutJoints();
        if (goutJoints.length > 0) {
            html += '<optgroup label="⚠️ Gout-Common Joints">';
            goutJoints.forEach(joint => {
                html += `<option value="${joint.id}">⚠️ ${joint.label}</option>`;
            });
            html += '</optgroup>';
        }

        // Then add all categories
        BodyParts.categories.forEach(category => {
            html += `<optgroup label="${category.name}">`;
            category.parts.forEach(part => {
                if (!part.goutCommon) { // Don't duplicate gout joints
                    html += `<option value="${part.id}">${part.label}</option>`;
                }
            });
            html += '</optgroup>';
        });

        return html;
    },

    afterRender(sub) {
        this.setupPainSlider();
        
        document.getElementById('painForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.savePain();
        });
    },

    setupPainSlider() {
        const slider = document.getElementById('painLevel');
        const valueDisplay = document.getElementById('painValue');
        const labelDisplay = document.getElementById('painLabel');

        const updatePainDisplay = (value) => {
            const numValue = parseInt(value);
            valueDisplay.textContent = numValue;
            labelDisplay.textContent = Utils.painZone(numValue);
            
            // Remove existing color classes
            valueDisplay.classList.remove('green', 'yellow', 'red');
            // Add appropriate color class
            valueDisplay.classList.add(Utils.painColor(numValue));
        };

        slider.addEventListener('input', (e) => {
            updatePainDisplay(e.target.value);
        });

        // Initialize display
        updatePainDisplay(slider.value);
    },

    async savePain() {
        const formData = this.gatherFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            // Save pain entry
            await Store.addPain(formData);

            // Check for red flags
            const redFlags = Safety.checkPainRedFlags(formData);
            const goutIndicators = Safety.checkGoutIndicators(formData);

            this.displayAlerts(redFlags, goutIndicators);

            Utils.toast('Pain log saved successfully!', 'success');

            // Offer navigation to flare log if gout indicators
            if (goutIndicators.length > 0) {
                setTimeout(() => {
                    if (confirm('Gout indicators detected. Would you like to log this as a gout flare?')) {
                        window.location.hash = '#log/flare';
                        return;
                    }
                }, 2000);
            }

            // Reset form and navigate back
            this.resetForm();
            setTimeout(() => {
                window.location.hash = '#log';
            }, goutIndicators.length > 0 ? 4000 : 1500);

        } catch (error) {
            console.error('Error saving pain log:', error);
            Utils.toast('Error saving pain log. Please try again.', 'error');
        }
    },

    gatherFormData() {
        return {
            id: Utils.uid(),
            date: new Date(document.getElementById('painDate').value).toISOString(),
            bodyPart: document.getElementById('bodyPart').value,
            painLevel: parseInt(document.getElementById('painLevel').value),
            painType: document.getElementById('painType').value || null,
            context: document.getElementById('context').value || null,
            visibleSigns: Array.from(document.querySelectorAll('#visibleSigns input:checked'))
                .map(cb => cb.value),
            functionEffect: document.getElementById('functionEffect').value || null,
            notes: document.getElementById('notes').value || null
        };
    },

    validateForm(data) {
        if (!data.bodyPart) {
            Utils.toast('Please select a body part', 'error');
            return false;
        }
        return true;
    },

    displayAlerts(redFlags, goutIndicators) {
        const alertsDiv = document.getElementById('alerts');
        alertsDiv.innerHTML = '';

        [...redFlags, ...goutIndicators].forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert ${alert.severity === 'high' ? 'alert-danger' : 'alert-warning'}`;
            alertDiv.innerHTML = Safety.renderAlert(alert);
            alertsDiv.appendChild(alertDiv);
        });
    },

    resetForm() {
        document.getElementById('painForm').reset();
        document.getElementById('painDate').value = new Date().toISOString().slice(0, 16);
        document.getElementById('painLevel').value = '5';
        this.setupPainSlider();
    }
});