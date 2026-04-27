App.register('log/vitals', {
    render(sub) {
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Log Vitals</h1>
                    <p class="page-subtitle">Record weight, blood pressure, and heart rate</p>
                </div>

                <form id="vitalsForm" class="card">
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" id="vitalDate" class="form-input" value="${Utils.dateStr(new Date())}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Weight (${Utils.getUnits().weight})</label>
                        <input type="number" id="weight" class="form-input" step="0.1" placeholder="Enter weight">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Blood Pressure</label>
                        <div class="form-row">
                            <input type="number" id="systolic" class="form-input" placeholder="Systolic" min="70" max="250">
                            <span>/</span>
                            <input type="number" id="diastolic" class="form-input" placeholder="Diastolic" min="40" max="150">
                        </div>
                        <p class="form-hint">Enter systolic/diastolic (e.g., 120/80)</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Heart Rate (bpm)</label>
                        <input type="number" id="heartRate" class="form-input" placeholder="Enter heart rate" min="30" max="220">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea id="notes" class="form-textarea" placeholder="Any notes about these readings..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Save Vitals</button>
                </form>

                <div id="recentEntries" class="mt-4">
                    <h3>Recent Entries</h3>
                    <div class="grid grid-2 gap-3">
                        <div id="recentWeight"></div>
                        <div id="recentBP"></div>
                    </div>
                </div>
            </div>
        `;
    },

    async afterRender(sub) {
        await this.loadRecentEntries();
        
        document.getElementById('vitalsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveVitals();
        });
    },

    async loadRecentEntries() {
        // Load recent weight entries
        const recentWeights = await Store.getLatest('vitals_weight', 5);
        const weightHtml = `
            <div class="card">
                <h4>Recent Weight</h4>
                ${recentWeights.length ? recentWeights.map(entry => `
                    <div class="flex justify-between items-center">
                        <span>${Utils.formatWeight(entry.value)}</span>
                        <span class="text-sm text-muted">${Utils.dateStr(new Date(entry.date))}</span>
                    </div>
                `).join('') : '<p class="text-muted">No recent entries</p>'}
            </div>
        `;

        // Load recent BP entries
        const recentBP = await Store.getLatest('vitals_bp', 5);
        const bpHtml = `
            <div class="card">
                <h4>Recent Blood Pressure</h4>
                ${recentBP.length ? recentBP.map(entry => `
                    <div class="flex justify-between items-center">
                        <span>${entry.systolic}/${entry.diastolic}</span>
                        <span class="text-sm text-muted">${Utils.dateStr(new Date(entry.date))}</span>
                    </div>
                `).join('') : '<p class="text-muted">No recent entries</p>'}
            </div>
        `;

        document.getElementById('recentWeight').innerHTML = weightHtml;
        document.getElementById('recentBP').innerHTML = bpHtml;
    },

    async saveVitals() {
        const date = document.getElementById('vitalDate').value;
        const weight = document.getElementById('weight').value;
        const systolic = document.getElementById('systolic').value;
        const diastolic = document.getElementById('diastolic').value;
        const heartRate = document.getElementById('heartRate').value;
        const notes = document.getElementById('notes').value;

        const baseEntry = {
            date: new Date(date).toISOString(),
            notes: notes || null
        };

        try {
            // Save weight if provided
            if (weight) {
                const weightEntry = {
                    ...baseEntry,
                    type: 'weight',
                    value: parseFloat(weight)
                };
                await Store.addVital(weightEntry);
            }

            // Save BP if both values provided
            if (systolic && diastolic) {
                const bpEntry = {
                    ...baseEntry,
                    type: 'bp',
                    systolic: parseInt(systolic),
                    diastolic: parseInt(diastolic)
                };
                
                // Check for BP red flags
                const bpFlags = Safety.checkBPRedFlags(parseInt(systolic), parseInt(diastolic));
                if (bpFlags.length > 0) {
                    bpFlags.forEach(flag => {
                        const alertDiv = document.createElement('div');
                        alertDiv.className = 'alert alert-danger mt-4';
                        alertDiv.innerHTML = Safety.renderAlert(flag);
                        document.querySelector('.page').appendChild(alertDiv);
                    });
                }
                
                await Store.addVital(bpEntry);
            }

            // Save heart rate if provided
            if (heartRate) {
                const hrEntry = {
                    ...baseEntry,
                    type: 'hr',
                    value: parseInt(heartRate)
                };
                await Store.addVital(hrEntry);
            }

            Utils.toast('Vitals saved successfully!', 'success');
            
            // Reset form
            document.getElementById('vitalsForm').reset();
            document.getElementById('vitalDate').value = Utils.dateStr(new Date());
            
            // Reload recent entries
            await this.loadRecentEntries();
            
            // Navigate back after short delay
            setTimeout(() => {
                window.location.hash = '#log';
            }, 1500);

        } catch (error) {
            console.error('Error saving vitals:', error);
            Utils.toast('Error saving vitals. Please try again.', 'error');
        }
    }
});