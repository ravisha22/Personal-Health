// Dashboard page - Health snapshot and quick actions
(function() {
    
    async function render() {
        const profile = await Store.getProfile();
        const latestWeight = await Store.getLatestWeight();
        const latestBP = await Store.getLatestBP();
        const todayHydration = await Store.getTodayHydration();
        const todayPainLogs = await Store.getTodayPainLogs();
        const recentActivity = await Store.getRecentActivity(5);
        const activeGoals = await Store.getActiveGoals();
        const todayMedications = await Store.getTodayMedications();

        // Check if this is first time after onboarding
        const isFirstTime = !latestWeight && !latestBP && recentActivity.length === 0;

        return `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">Good ${getTimeOfDay()}, ${profile?.name || 'there'}!</h1>
                    <p class="page-subtitle">${Utils.dateStr()} • ${isFirstTime ? "Let's start tracking your health!" : "Here's your health snapshot"}</p>
                </div>

                ${await renderSafetyAlerts(latestBP, todayPainLogs, todayMedications)}

                ${isFirstTime ? renderFirstTimeWelcome() : await renderDashboardContent(latestWeight, latestBP, todayHydration, todayPainLogs, recentActivity, activeGoals)}

                ${Safety.renderDisclaimer(Safety.DISCLAIMER.general)}
            </div>
        `;
    }

    function renderFirstTimeWelcome() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">🎉 Welcome to Your Health Journey!</h2>
                </div>
                <div style="padding: 1rem;">
                    <p>You're all set up! Here are some great ways to start:</p>
                    <ul style="margin: 1rem 0; padding-left: 2rem;">
                        <li>Log your daily weight to track progress</li>
                        <li>Record any pain or symptoms you're experiencing</li>
                        <li>Track your water intake to stay hydrated</li>
                        <li>Monitor your blood pressure regularly</li>
                    </ul>
                    <p class="text-sm text-muted">Consistent tracking leads to better insights and healthier outcomes.</p>
                </div>
            </div>

            ${renderQuickActions()}
        `;
    }

    async function renderDashboardContent(latestWeight, latestBP, todayHydration, todayPainLogs, recentActivity, activeGoals) {
        return `
            ${renderMetricsGrid(latestWeight, latestBP, todayHydration, todayPainLogs)}
            ${renderQuickActions()}
            ${renderRecentActivity(recentActivity)}
            ${await renderActiveGoals(activeGoals)}
        `;
    }

    function renderMetricsGrid(latestWeight, latestBP, todayHydration, todayPainLogs) {
        const units = Utils.getUnits();
        const hydrationPercent = Math.round((todayHydration / 2500) * 100); // 2.5L target
        const avgPain = todayPainLogs.length > 0 
            ? Math.round(todayPainLogs.reduce((sum, log) => sum + log.level, 0) / todayPainLogs.length)
            : null;

        return `
            <div class="dashboard-metrics">
                <div class="grid grid-2">
                    <div class="metric-card">
                        <div class="card-label">Latest Weight</div>
                        <div class="card-value">
                            ${latestWeight 
                                ? `${Utils.formatWeight(latestWeight.weight, units)} ${units === 'metric' ? 'kg' : 'lbs'}`
                                : 'No data'
                            }
                        </div>
                        <div class="card-footer text-sm text-muted">
                            ${latestWeight ? `${Utils.dateStr(latestWeight.date)} • ${getWeightTrend(latestWeight)}` : 'Start tracking'}
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="card-label">Blood Pressure</div>
                        <div class="card-value">
                            ${latestBP 
                                ? `${latestBP.systolic}/${latestBP.diastolic}`
                                : 'No data'
                            }
                        </div>
                        <div class="card-footer text-sm text-muted">
                            ${latestBP 
                                ? `${Utils.dateStr(latestBP.date)} • ${getBPStatus(latestBP)}`
                                : 'Add reading'
                            }
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="card-label">Hydration Today</div>
                        <div class="card-value">
                            ${hydrationPercent}%
                        </div>
                        <div class="card-footer text-sm text-muted">
                            ${todayHydration}ml of 2,500ml target
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="card-label">Pain Status</div>
                        <div class="card-value ${avgPain ? Utils.painColor(avgPain) : ''}">
                            ${avgPain ? `${avgPain}/10` : 'No pain logged'}
                        </div>
                        <div class="card-footer text-sm text-muted">
                            ${todayPainLogs.length > 0 
                                ? `${todayPainLogs.length} log${todayPainLogs.length > 1 ? 's' : ''} today`
                                : 'Track symptoms'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async function renderSafetyAlerts(latestBP, todayPainLogs, todayMedications) {
        const alerts = [];

        // Check BP red flags
        if (latestBP && Safety.checkBPRedFlags(latestBP)) {
            alerts.push({
                type: 'danger',
                title: 'Blood Pressure Alert',
                message: 'Your recent blood pressure reading requires immediate medical attention.'
            });
        }

        // Check for active flares
        const activeFlares = await Store.getActiveFlares();
        if (activeFlares.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Active Flare',
                message: `You have ${activeFlares.length} active flare${activeFlares.length > 1 ? 's' : ''} to monitor.`
            });
        }

        // Check for high pain levels
        const highPainLogs = todayPainLogs.filter(log => log.level >= 7);
        if (highPainLogs.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'High Pain Alert',
                message: 'You\'ve logged severe pain today. Consider consulting your healthcare provider.'
            });
        }

        // Medication reminder
        const profile = await Store.getProfile();
        if (profile?.medications?.length > 0 && !todayMedications?.length) {
            alerts.push({
                type: 'info',
                title: 'Medication Reminder',
                message: 'Don\'t forget to take your medications today.'
            });
        }

        if (alerts.length === 0) return '';

        return `
            <div class="dashboard-section">
                ${alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        <strong>${alert.title}:</strong> ${alert.message}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderQuickActions() {
        return `
            <div class="dashboard-section">
                <h2 class="dashboard-section-title">Quick Actions</h2>
                <div class="grid grid-2">
                    <a href="#/weight" class="btn btn-primary btn-block">📊 Log Weight</a>
                    <a href="#/pain" class="btn btn-primary btn-block">🩹 Log Pain</a>
                    <a href="#/flare" class="btn btn-secondary btn-block">🔥 Log Flare</a>
                    <a href="#/hydration" class="btn btn-secondary btn-block">💧 Log Water</a>
                </div>
            </div>
        `;
    }

    function renderRecentActivity(recentActivity) {
        if (!recentActivity || recentActivity.length === 0) {
            return `
                <div class="dashboard-section">
                    <h2 class="dashboard-section-title">Recent Activity</h2>
                    <div class="empty-state">
                        <p>No recent activity. Start logging to see your progress!</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="dashboard-section">
                <h2 class="dashboard-section-title">Recent Activity</h2>
                <div class="card">
                    ${recentActivity.map(activity => `
                        <div class="flex items-center justify-between" style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                            <div>
                                <div class="font-semibold">${formatActivityType(activity.type)}</div>
                                <div class="text-sm text-muted">${formatActivityValue(activity)}</div>
                            </div>
                            <div class="text-sm text-muted">
                                ${Utils.dateStr(activity.date)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async function renderActiveGoals(activeGoals) {
        if (!activeGoals || activeGoals.length === 0) {
            return '';
        }

        return `
            <div class="dashboard-section">
                <h2 class="dashboard-section-title">Active Goals</h2>
                <div class="grid">
                    ${activeGoals.map(goal => `
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">${goal.title}</h3>
                            </div>
                            <div style="padding: 1rem;">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-sm">${goal.current} / ${goal.target} ${goal.unit}</span>
                                    <span class="tag ${goal.progress >= 100 ? 'tag-green' : goal.progress >= 50 ? 'tag-yellow' : 'tag-red'}">
                                        ${Math.round(goal.progress)}%
                                    </span>
                                </div>
                                <div style="background: #f0f0f0; height: 8px; border-radius: 4px;">
                                    <div style="background: ${goal.progress >= 100 ? '#28a745' : goal.progress >= 50 ? '#ffc107' : '#dc3545'}; width: ${Math.min(goal.progress, 100)}%; height: 100%; border-radius: 4px; transition: width 0.3s;"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function afterRender() {
        // No specific event handlers needed for dashboard
        // Links are handled by hash routing
    }

    // Helper functions
    function getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }

    function getWeightTrend(latestWeight) {
        // This would ideally compare with previous weight
        // For now, just show when it was logged
        return 'Latest entry';
    }

    function getBPStatus(bp) {
        if (bp.systolic >= 140 || bp.diastolic >= 90) return 'High';
        if (bp.systolic >= 130 || bp.diastolic >= 80) return 'Elevated';
        return 'Normal';
    }

    function formatActivityType(type) {
        switch(type) {
            case 'weight': return 'Weight Logged';
            case 'bp': return 'Blood Pressure';
            case 'pain': return 'Pain Logged';
            case 'flare': return 'Flare Reported';
            case 'hydration': return 'Water Intake';
            case 'medication': return 'Medication';
            case 'exercise': return 'Exercise';
            default: return type;
        }
    }

    function formatActivityValue(activity) {
        const units = Utils.getUnits();
        
        switch(activity.type) {
            case 'weight':
                return `${Utils.formatWeight(activity.weight, units)} ${units === 'metric' ? 'kg' : 'lbs'}`;
            case 'bp':
                return `${activity.systolic}/${activity.diastolic} mmHg`;
            case 'pain':
                return `${activity.level}/10 ${activity.bodyPart ? `(${activity.bodyPart})` : ''}`;
            case 'flare':
                return `${activity.severity} severity ${activity.condition ? `- ${activity.condition}` : ''}`;
            case 'hydration':
                return `${activity.amount}ml`;
            case 'medication':
                return `${activity.name} ${activity.dose ? `(${activity.dose})` : ''}`;
            case 'exercise':
                return `${activity.duration}min ${activity.type || 'exercise'}`;
            default:
                return activity.value || '';
        }
    }

    // Register the page
    App.register('dashboard', { render, afterRender });

})();