App.register('log/hydration', {
    render(sub) {
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Log Water Intake</h1>
                    <p class="page-subtitle">Quick and easy hydration tracking</p>
                </div>

                <div class="card">
                    <div id="todayProgress" class="mb-4">
                        <h3>Today's Progress</h3>
                        <div class="progress-ring-container" style="text-align: center; margin: 20px 0;">
                            <div id="progressRing" class="progress-ring">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                                    <circle id="progressCircle" cx="60" cy="60" r="50" fill="none" stroke="#4CAF50" 
                                            stroke-width="8" stroke-dasharray="314" stroke-dashoffset="314" 
                                            transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 0.3s ease;"/>
                                </svg>
                                <div id="progressText" class="progress-text">0ml</div>
                            </div>
                        </div>
                        <p class="text-center text-sm text-muted">Target: 2,500ml (10 cups)</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Quick Add</label>
                        <div class="grid grid-2 gap-2">
                            <button type="button" class="btn btn-secondary quick-add" data-amount="250">
                                💧 250ml<br><span class="text-sm">Glass</span>
                            </button>
                            <button type="button" class="btn btn-secondary quick-add" data-amount="500">
                                🥤 500ml<br><span class="text-sm">Bottle</span>
                            </button>
                            <button type="button" class="btn btn-secondary quick-add" data-amount="750">
                                🍶 750ml<br><span class="text-sm">Large Bottle</span>
                            </button>
                            <button type="button" class="btn btn-secondary quick-add" data-amount="1000">
                                🧊 1L<br><span class="text-sm">Liter</span>
                            </button>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="form-group">
                        <label class="form-label">Custom Amount</label>
                        <div class="flex gap-2">
                            <input type="number" id="customAmount" class="form-input" placeholder="Amount in ml" min="1" max="2000" step="50">
                            <button type="button" id="addCustom" class="btn btn-primary">Add</button>
                        </div>
                    </div>
                </div>

                <div id="todayEntries" class="card mt-4">
                    <h3>Today's Entries</h3>
                    <div id="entriesList"></div>
                </div>
            </div>
        `;
    },

    async afterRender(sub) {
        await this.loadTodayData();
        this.setupEventListeners();
    },

    async loadTodayData() {
        try {
            const totalToday = await Store.getTodayHydration();
            this.updateProgress(totalToday);
            await this.loadTodayEntries();
        } catch (error) {
            console.error('Error loading hydration data:', error);
            this.updateProgress(0);
        }
    },

    async loadTodayEntries() {
        try {
            const today = Utils.dateStr(new Date());
            const entries = await Store.getByDate('hydration', today);
            
            const entriesHtml = entries.length > 0 ? 
                entries.map(entry => {
                    const time = Utils.timeStr(new Date(entry.date));
                    return `
                        <div class="flex justify-between items-center mb-2">
                            <span>${entry.amount}ml</span>
                            <span class="text-sm text-muted">${time}</span>
                        </div>
                    `;
                }).join('') : 
                '<p class="text-muted">No water logged today yet</p>';

            document.getElementById('entriesList').innerHTML = entriesHtml;
        } catch (error) {
            console.error('Error loading today\'s entries:', error);
            document.getElementById('entriesList').innerHTML = '<p class="text-muted">Error loading entries</p>';
        }
    },

    updateProgress(totalMl) {
        const target = 2500; // 2.5L target
        const percentage = Math.min((totalMl / target) * 100, 100);
        const circumference = 314; // 2 * π * 50
        const offset = circumference - (percentage / 100) * circumference;

        const progressCircle = document.getElementById('progressCircle');
        const progressText = document.getElementById('progressText');

        if (progressCircle && progressText) {
            progressCircle.style.strokeDashoffset = offset;
            progressText.textContent = `${totalMl}ml`;

            // Change color based on progress
            if (percentage >= 100) {
                progressCircle.style.stroke = '#4CAF50'; // Green
            } else if (percentage >= 60) {
                progressCircle.style.stroke = '#FF9800'; // Orange
            } else {
                progressCircle.style.stroke = '#2196F3'; // Blue
            }
        }
    },

    setupEventListeners() {
        // Quick add buttons
        document.querySelectorAll('.quick-add').forEach(button => {
            button.addEventListener('click', async (e) => {
                const amount = parseInt(e.currentTarget.dataset.amount);
                await this.addWater(amount);
            });
        });

        // Custom amount
        document.getElementById('addCustom').addEventListener('click', async () => {
            const amount = document.getElementById('customAmount').value;
            if (amount && parseInt(amount) > 0) {
                await this.addWater(parseInt(amount));
                document.getElementById('customAmount').value = '';
            } else {
                Utils.toast('Please enter a valid amount', 'error');
            }
        });

        // Enter key for custom amount
        document.getElementById('customAmount').addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addCustom').click();
            }
        });
    },

    async addWater(amount) {
        try {
            const entry = {
                id: Utils.uid(),
                date: new Date().toISOString(),
                amount: amount
            };

            await Store.add('hydration', entry);
            
            // Update UI
            const newTotal = await Store.getTodayHydration();
            this.updateProgress(newTotal);
            await this.loadTodayEntries();

            // Show celebration for milestones
            this.checkMilestones(newTotal);

            Utils.toast(`Added ${amount}ml water! 💧`, 'success');

        } catch (error) {
            console.error('Error adding water:', error);
            Utils.toast('Error logging water. Please try again.', 'error');
        }
    },

    checkMilestones(totalMl) {
        const milestones = [
            { amount: 500, message: 'Great start! Keep going! 🌟' },
            { amount: 1000, message: 'You\'re doing well! 💪' },
            { amount: 1500, message: 'Over halfway there! 🎯' },
            { amount: 2000, message: 'Almost at your goal! 🏆' },
            { amount: 2500, message: 'Hydration goal achieved! 🎉' },
            { amount: 3000, message: 'Excellent hydration! 💎' }
        ];

        // Check if we just hit a milestone (within the last drink)
        const milestone = milestones.find(m => 
            totalMl >= m.amount && (totalMl - 1000) < m.amount // Rough check for new milestone
        );

        if (milestone && totalMl >= milestone.amount) {
            setTimeout(() => {
                Utils.toast(milestone.message, 'success');
            }, 500);
        }
    }
});