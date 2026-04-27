App.register('log/checkin', {
    render(sub) {
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Daily Check-In</h1>
                    <p class="page-subtitle">How are you feeling today?</p>
                </div>

                <form id="checkinForm" class="card">
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" id="checkinDate" class="form-input" value="${Utils.dateStr(new Date())}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Sleep Hours</label>
                        <input type="number" id="sleepHours" class="form-input" placeholder="Hours of sleep" 
                               min="0" max="24" step="0.5">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Sleep Quality</label>
                        <div class="pain-slider">
                            <input type="range" id="sleepQuality" class="form-input" min="1" max="10" value="5" step="1">
                            <div class="pain-value" id="sleepQualityValue">5</div>
                            <div class="pain-label" id="sleepQualityLabel">Average</div>
                        </div>
                        <div class="flex justify-between text-sm text-muted mt-2">
                            <span>Terrible</span>
                            <span>Perfect</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Mood</label>
                        <div class="pain-slider">
                            <input type="range" id="mood" class="form-input" min="1" max="10" value="5" step="1">
                            <div class="pain-value" id="moodValue">😐 5</div>
                            <div class="pain-label" id="moodLabel">Neutral</div>
                        </div>
                        <div class="flex justify-between text-sm text-muted mt-2">
                            <span>😢 Very Low</span>
                            <span>😊 Excellent</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Energy Level</label>
                        <div class="pain-slider">
                            <input type="range" id="energy" class="form-input" min="1" max="10" value="5" step="1">
                            <div class="pain-value" id="energyValue">5</div>
                            <div class="pain-label" id="energyLabel">Moderate</div>
                        </div>
                        <div class="flex justify-between text-sm text-muted mt-2">
                            <span>Exhausted</span>
                            <span>Very Energetic</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Stress Level</label>
                        <div class="pain-slider">
                            <input type="range" id="stress" class="form-input" min="1" max="10" value="5" step="1">
                            <div class="pain-value" id="stressValue">5</div>
                            <div class="pain-label" id="stressLabel">Moderate</div>
                        </div>
                        <div class="flex justify-between text-sm text-muted mt-2">
                            <span>Very Relaxed</span>
                            <span>Extremely Stressed</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Quick Pain Check</label>
                        <div class="form-check">
                            <label class="form-check">
                                <input type="radio" name="painCheck" value="no"> No pain right now
                            </label>
                            <label class="form-check">
                                <input type="radio" name="painCheck" value="yes"> Yes, I have pain
                            </label>
                        </div>
                        <div id="painPrompt" class="mt-2" style="display: none;">
                            <p class="text-sm text-muted">Consider logging detailed pain information:</p>
                            <button type="button" id="gotoPainLog" class="btn btn-secondary btn-sm">
                                Go to Pain Log
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Medication Adherence</label>
                        <div class="form-check">
                            <label class="form-check">
                                <input type="radio" name="medAdherence" value="yes"> Yes, took all medications
                            </label>
                            <label class="form-check">
                                <input type="radio" name="medAdherence" value="no"> No, missed some medications
                            </label>
                            <label class="form-check">
                                <input type="radio" name="medAdherence" value="na"> No medications prescribed
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea id="notes" class="form-textarea" placeholder="How are you feeling today? Any concerns or observations..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Save Check-In</button>
                </form>
            </div>
        `;
    },

    afterRender(sub) {
        this.setupSliders();
        this.setupPainCheck();
        
        document.getElementById('checkinForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCheckin();
        });
    },

    setupSliders() {
        // Sleep Quality Slider
        const sleepSlider = document.getElementById('sleepQuality');
        const sleepValue = document.getElementById('sleepQualityValue');
        const sleepLabel = document.getElementById('sleepQualityLabel');

        const sleepLabels = {
            1: 'Terrible', 2: 'Poor', 3: 'Bad', 4: 'Below Average',
            5: 'Average', 6: 'Good', 7: 'Very Good', 8: 'Great',
            9: 'Excellent', 10: 'Perfect'
        };

        sleepSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            sleepValue.textContent = value;
            sleepLabel.textContent = sleepLabels[value];
        });

        // Mood Slider with Emojis
        const moodSlider = document.getElementById('mood');
        const moodValue = document.getElementById('moodValue');
        const moodLabel = document.getElementById('moodLabel');

        const moodEmojis = {
            1: '😢', 2: '😞', 3: '😕', 4: '😐', 5: '😐',
            6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '😍'
        };

        const moodLabels = {
            1: 'Very Low', 2: 'Low', 3: 'Below Average', 4: 'Slightly Low',
            5: 'Neutral', 6: 'Good', 7: 'Very Good', 8: 'Great',
            9: 'Excellent', 10: 'Amazing'
        };

        moodSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            moodValue.textContent = `${moodEmojis[value]} ${value}`;
            moodLabel.textContent = moodLabels[value];
        });

        // Energy Level Slider
        const energySlider = document.getElementById('energy');
        const energyValue = document.getElementById('energyValue');
        const energyLabel = document.getElementById('energyLabel');

        const energyLabels = {
            1: 'Exhausted', 2: 'Very Tired', 3: 'Tired', 4: 'Low Energy',
            5: 'Moderate', 6: 'Good', 7: 'High Energy', 8: 'Very Energetic',
            9: 'Excellent', 10: 'Peak Energy'
        };

        energySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            energyValue.textContent = value;
            energyLabel.textContent = energyLabels[value];
        });

        // Stress Level Slider
        const stressSlider = document.getElementById('stress');
        const stressValue = document.getElementById('stressValue');
        const stressLabel = document.getElementById('stressLabel');

        const stressLabels = {
            1: 'Very Relaxed', 2: 'Relaxed', 3: 'Calm', 4: 'Slightly Stressed',
            5: 'Moderate', 6: 'Somewhat Stressed', 7: 'Stressed', 8: 'Very Stressed',
            9: 'Highly Stressed', 10: 'Extremely Stressed'
        };

        stressSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            stressValue.textContent = value;
            stressLabel.textContent = stressLabels[value];
            
            // Color coding for stress
            stressValue.classList.remove('green', 'yellow', 'red');
            if (value <= 3) {
                stressValue.classList.add('green');
            } else if (value <= 6) {
                stressValue.classList.add('yellow');
            } else {
                stressValue.classList.add('red');
            }
        });

        // Initialize all displays
        sleepSlider.dispatchEvent(new Event('input'));
        moodSlider.dispatchEvent(new Event('input'));
        energySlider.dispatchEvent(new Event('input'));
        stressSlider.dispatchEvent(new Event('input'));
    },

    setupPainCheck() {
        const painCheckRadios = document.querySelectorAll('input[name="painCheck"]');
        const painPrompt = document.getElementById('painPrompt');
        const gotoPainButton = document.getElementById('gotoPainLog');

        painCheckRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'yes') {
                    painPrompt.style.display = 'block';
                } else {
                    painPrompt.style.display = 'none';
                }
            });
        });

        gotoPainButton.addEventListener('click', () => {
            window.location.hash = '#log/pain';
        });
    },

    async saveCheckin() {
        const formData = this.gatherFormData();
        
        try {
            await Store.add('checkins', formData);
            Utils.toast('Check-in saved successfully!', 'success');
            
            this.resetForm();
            setTimeout(() => {
                window.location.hash = '#log';
            }, 1500);

        } catch (error) {
            console.error('Error saving check-in:', error);
            Utils.toast('Error saving check-in. Please try again.', 'error');
        }
    },

    gatherFormData() {
        const painCheck = document.querySelector('input[name="painCheck"]:checked');
        const medAdherence = document.querySelector('input[name="medAdherence"]:checked');

        return {
            id: Utils.uid(),
            date: new Date(document.getElementById('checkinDate').value).toISOString(),
            sleepHours: document.getElementById('sleepHours').value ? 
                parseFloat(document.getElementById('sleepHours').value) : null,
            sleepQuality: parseInt(document.getElementById('sleepQuality').value),
            mood: parseInt(document.getElementById('mood').value),
            energy: parseInt(document.getElementById('energy').value),
            stress: parseInt(document.getElementById('stress').value),
            painPresent: painCheck ? painCheck.value === 'yes' : null,
            medicationAdherence: medAdherence ? medAdherence.value : null,
            notes: document.getElementById('notes').value || null
        };
    },

    resetForm() {
        document.getElementById('checkinForm').reset();
        document.getElementById('checkinDate').value = Utils.dateStr(new Date());
        
        // Reset sliders to middle values
        document.getElementById('sleepQuality').value = '5';
        document.getElementById('mood').value = '5';
        document.getElementById('energy').value = '5';
        document.getElementById('stress').value = '5';
        
        this.setupSliders();
        document.getElementById('painPrompt').style.display = 'none';
    }
});