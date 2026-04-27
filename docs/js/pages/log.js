App.register('log', {
    render(sub) {
        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Health Log</h1>
                    <p class="page-subtitle">Track your health data</p>
                </div>

                <div id="todayStats" class="card mb-4">
                    <h3>Today's Activity</h3>
                    <div id="statsContent">Loading...</div>
                </div>

                <div class="grid grid-2 gap-3">
                    <div class="card log-card" data-route="log/vitals">
                        <div class="log-icon">⚖️</div>
                        <h3>Vitals</h3>
                        <p class="text-muted">Weight, blood pressure, heart rate</p>
                        <div class="log-count" id="vitalsCount">0 today</div>
                    </div>

                    <div class="card log-card" data-route="log/pain">
                        <div class="log-icon">🩹</div>
                        <h3>Pain Log</h3>
                        <p class="text-muted">Track pain levels and locations</p>
                        <div class="log-count" id="painCount">0 today</div>
                    </div>

                    <div class="card log-card" data-route="log/flare">
                        <div class="log-icon">🔥</div>
                        <h3>Gout Flare</h3>
                        <p class="text-muted">Record flare episodes and triggers</p>
                        <div class="log-count" id="flareCount">0 today</div>
                    </div>

                    <div class="card log-card" data-route="log/workout">
                        <div class="log-icon">🏋️</div>
                        <h3>Workout</h3>
                        <p class="text-muted">Exercise sessions and activity</p>
                        <div class="log-count" id="workoutCount">0 today</div>
                    </div>

                    <div class="card log-card" data-route="log/meal">
                        <div class="log-icon">🍽️</div>
                        <h3>Meals</h3>
                        <p class="text-muted">Food intake and gout triggers</p>
                        <div class="log-count" id="mealCount">0 today</div>
                    </div>

                    <div class="card log-card" data-route="log/hydration">
                        <div class="log-icon">💧</div>
                        <h3>Water</h3>
                        <p class="text-muted">Track daily hydration</p>
                        <div class="log-count" id="hydrationCount">0ml today</div>
                    </div>

                    <div class="card log-card" data-route="log/checkin">
                        <div class="log-icon">📋</div>
                        <h3>Daily Check-in</h3>
                        <p class="text-muted">Mood, energy, sleep quality</p>
                        <div class="log-count" id="checkinCount">Not done</div>
                    </div>

                    <div class="card log-card" data-route="log/medications">
                        <div class="log-icon">💊</div>
                        <h3>Medications</h3>
                        <p class="text-muted">Medication tracking (coming soon)</p>
                        <div class="log-count" id="medCount">Coming soon</div>
                    </div>
                </div>

                <div class="disclaimer mt-4">
                    ${Safety.renderDisclaimer('general')}
                </div>
            </div>
        `;
    },

    async afterRender(sub) {
        await this.loadTodayCounts();
        this.setupCardNavigation();
    },

    async loadTodayCounts() {
        const today = Utils.dateStr(new Date());
        const statsContent = document.getElementById('statsContent');
        
        try {
            // Get today's counts for each category
            const counts = await this.getTodayCounts(today);
            
            // Update individual counters
            this.updateCounter('vitalsCount', counts.vitals, 'today');
            this.updateCounter('painCount', counts.pain, 'today');
            this.updateCounter('flareCount', counts.flares, 'today');
            this.updateCounter('workoutCount', counts.workouts, 'today');
            this.updateCounter('mealCount', counts.meals, 'today');
            this.updateCounter('hydrationCount', `${counts.hydration}ml`, 'today');
            this.updateCounter('checkinCount', counts.checkins > 0 ? 'Complete' : 'Not done', '');

            // Update summary stats
            this.updateSummaryStats(counts, statsContent);

        } catch (error) {
            console.error('Error loading today\'s counts:', error);
            statsContent.innerHTML = '<p class="text-muted">Error loading today\'s data</p>';
        }
    },

    async getTodayCounts(today) {
        const [
            vitals,
            pain,
            flares,
            workouts,
            meals,
            hydrationTotal,
            checkins
        ] = await Promise.all([
            this.countTodayEntries('vitals_weight', today).catch(() => 0),
            this.countTodayEntries('pain', today).catch(() => 0),
            this.countTodayEntries('flares', today).catch(() => 0),
            this.countTodayEntries('workouts', today).catch(() => 0),
            this.countTodayEntries('meals', today).catch(() => 0),
            Store.getTodayHydration().catch(() => 0),
            this.countTodayEntries('checkins', today).catch(() => 0)
        ]);

        return {
            vitals,
            pain,
            flares,
            workouts,
            meals,
            hydration: hydrationTotal,
            checkins
        };
    },

    async countTodayEntries(tableName, today) {
        try {
            const entries = await Store.getByDate(tableName, today);
            return entries ? entries.length : 0;
        } catch {
            return 0;
        }
    },

    updateCounter(elementId, count, suffix) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `${count}${suffix ? ' ' + suffix : ''}`;
            
            // Add visual indication for completed items
            if ((elementId === 'checkinCount' && count === 'Complete') ||
                (elementId !== 'checkinCount' && parseInt(count) > 0)) {
                element.classList.add('tag-green');
            } else {
                element.classList.add('text-muted');
            }
        }
    },

    updateSummaryStats(counts, container) {
        const totalEntries = counts.vitals + counts.pain + counts.flares + 
                           counts.workouts + counts.meals + (counts.checkins > 0 ? 1 : 0);
        
        const hydrationProgress = Math.min((counts.hydration / 2500) * 100, 100).toFixed(0);
        
        const summaryHtml = `
            <div class="grid grid-2 gap-3">
                <div>
                    <div class="text-sm text-muted">Total Entries</div>
                    <div class="text-lg">${totalEntries}</div>
                </div>
                <div>
                    <div class="text-sm text-muted">Hydration Progress</div>
                    <div class="text-lg">${hydrationProgress}%</div>
                </div>
                <div>
                    <div class="text-sm text-muted">Meals Logged</div>
                    <div class="text-lg">${counts.meals}/3</div>
                </div>
                <div>
                    <div class="text-sm text-muted">Check-in Status</div>
                    <div class="text-lg ${counts.checkins > 0 ? 'tag tag-green' : 'tag tag-yellow'}">
                        ${counts.checkins > 0 ? '✓ Done' : 'Pending'}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = summaryHtml;
    },

    setupCardNavigation() {
        const logCards = document.querySelectorAll('.log-card');
        
        logCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const route = card.dataset.route;
                if (route && route !== 'log/medications') { // Skip disabled medications card
                    window.location.hash = `#${route}`;
                }
            });

            // Add hover effect
            card.style.cursor = 'pointer';
            card.addEventListener('mouseenter', () => {
                if (card.dataset.route !== 'log/medications') {
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });

            // Disable medications card
            if (card.dataset.route === 'log/medications') {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
            }
        });
    }
});