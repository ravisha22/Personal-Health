// Onboarding — rewritten from scratch. No template literals, no arrow functions.
// Pure DOM manipulation, fully tested state management.
(function() {
    'use strict';

    var screen = 1;
    var data = {
        name: '',
        conditions: [],
        primaryGoal: '',
        units: 'metric',
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

    function esc(s) { return Utils.escapeHtml(s || ''); }

    // ===== COLLECT current form values into data =====
    function collect() {
        if (screen === 1) {
            var el = document.getElementById('ob-name');
            if (el) data.name = el.value.trim();

            data.conditions = [];
            var checks = document.querySelectorAll('.ob-condition:checked');
            for (var i = 0; i < checks.length; i++) data.conditions.push(checks[i].value);

            var goal = document.querySelector('input[name="ob-goal"]:checked');
            if (goal) data.primaryGoal = goal.value;

            var unit = document.querySelector('input[name="ob-units"]:checked');
            if (unit) data.units = unit.value;
        }
        if (screen === 2) {
            data.medications = [];
            var rows = document.querySelectorAll('.ob-med-row');
            for (var i = 0; i < rows.length; i++) {
                data.medications.push({
                    name: (rows[i].querySelector('.ob-med-name') || {}).value || '',
                    dose: (rows[i].querySelector('.ob-med-dose') || {}).value || '',
                    condition: (rows[i].querySelector('.ob-med-cond') || {}).value || ''
                });
            }
            var lim = document.getElementById('ob-limitations');
            if (lim) data.exerciseLimitations = lim.value.trim();
            var clr = document.getElementById('ob-clearance');
            if (clr) data.doctorClearance = clr.checked;
            var time = document.querySelector('input[name="ob-extime"]:checked');
            if (time) data.preferredExerciseTime = time.value;
        }
        if (screen === 3) {
            var w = document.getElementById('ob-weight');
            if (w) data.currentWeight = w.value;
            var h = document.getElementById('ob-height');
            if (h) data.height = h.value.trim();
            var s = document.getElementById('ob-systolic');
            if (s) data.systolic = s.value;
            var d = document.getElementById('ob-diastolic');
            if (d) data.diastolic = d.value;
            var freq = document.querySelector('input[name="ob-freq"]:checked');
            if (freq) data.checkinFrequency = freq.value;
            var pc = document.getElementById('ob-challenges');
            if (pc) data.pastChallenges = pc.value.trim();
        }
    }

    // ===== VALIDATE =====
    function validate() {
        if (screen === 1) {
            if (!data.name) { Utils.toast('Please enter your name', 'warning'); return false; }
            if (data.conditions.length === 0) { Utils.toast('Please select at least one health condition', 'warning'); return false; }
            if (!data.primaryGoal) { Utils.toast('Please select your primary health goal', 'warning'); return false; }
        }
        if (screen === 3) {
            if (!data.currentWeight || parseFloat(data.currentWeight) <= 0) { Utils.toast('Please enter your current weight', 'warning'); return false; }
            if (!data.height) { Utils.toast('Please enter your height', 'warning'); return false; }
        }
        return true;
    }

    // ===== Checkbox helper =====
    function chk(arr, val) { return arr.indexOf(val) >= 0 ? ' checked' : ''; }
    function sel(a, b) { return a === b ? ' checked' : ''; }
    function opt(a, b) { return a === b ? ' selected' : ''; }

    // ===== PAINT =====
    function paint() {
        var h = '';
        h += '<div class="page onboarding">';

        // Progress dots
        h += '<div class="onboarding-progress">';
        h += '<div class="onboarding-dot ' + (screen > 1 ? 'complete' : 'active') + '"></div>';
        h += '<div class="onboarding-dot ' + (screen > 2 ? 'complete' : (screen === 2 ? 'active' : '')) + '"></div>';
        h += '<div class="onboarding-dot ' + (screen === 3 ? 'active' : '') + '"></div>';
        h += '</div>';

        h += '<div class="onboarding-content">';
        if (screen === 1) h += screen1();
        else if (screen === 2) h += screen2();
        else h += screen3();
        h += '</div>';

        // Footer
        h += '<div class="onboarding-footer">';
        if (screen > 1) h += '<button type="button" class="btn btn-secondary" id="ob-back">\u2190 Back</button>';
        else h += '<div></div>';
        h += '<button type="button" class="btn btn-primary btn-lg" id="ob-next">' + (screen < 3 ? 'Next \u2192' : '\u2705 Complete Setup') + '</button>';
        h += '</div></div>';

        document.getElementById('app').innerHTML = h;
        bind();
    }

    // ===== SCREEN 1 =====
    function screen1() {
        var h = '';
        h += '<h1 class="onboarding-title">\uD83C\uDFDB\uFE0F Welcome to Health Council</h1>';
        h += '<p class="onboarding-subtitle">Let\'s personalize your health tracking experience</p>';

        h += '<div class="alert alert-info mb-4">\u2695\uFE0F <strong>Important:</strong> This app helps you track and organize your health data. It does not diagnose conditions or prescribe treatments. Always consult your doctors for medical decisions.</div>';

        h += '<div class="form-group"><label class="form-label">What should we call you? *</label>';
        h += '<input type="text" class="form-input" id="ob-name" placeholder="Your name" value="' + esc(data.name) + '"></div>';

        h += '<div class="form-group"><label class="form-label">Health Conditions * (check all that apply)</label>';
        var conds = [['Gout','\uD83E\uDDB4'],['High Cholesterol','\u2764\uFE0F'],['Hypertension','\uD83E\uDEC0'],['Diabetes','\uD83E\uDE78'],['Sleep Apnea','\uD83D\uDE34'],['Other','\u2795']];
        for (var i = 0; i < conds.length; i++) {
            h += '<div class="form-check"><input type="checkbox" class="ob-condition" id="ob-c' + i + '" value="' + conds[i][0] + '"' + chk(data.conditions, conds[i][0]) + '>';
            h += '<label for="ob-c' + i + '">' + conds[i][1] + ' ' + conds[i][0] + '</label></div>';
        }
        h += '</div>';

        h += '<div class="form-group"><label class="form-label">Primary Health Goal *</label>';
        var goals = [['Sustainable Weight Loss','\uD83C\uDFAF'],['Condition Control','\uD83E\uDE7A'],['Pain Management','\uD83E\uDE79'],['Healthy Aging','\uD83C\uDF3F'],['Reduce Medication Reliance','\uD83D\uDC8A']];
        for (var i = 0; i < goals.length; i++) {
            h += '<div class="form-check"><input type="radio" name="ob-goal" id="ob-g' + i + '" value="' + goals[i][0] + '"' + sel(data.primaryGoal, goals[i][0]) + '>';
            h += '<label for="ob-g' + i + '">' + goals[i][1] + ' ' + goals[i][0] + '</label></div>';
        }
        h += '</div>';

        h += '<div class="form-group"><label class="form-label">Measurement Units</label><div class="form-row">';
        h += '<div class="form-check"><input type="radio" name="ob-units" id="ob-um" value="metric"' + sel(data.units, 'metric') + '><label for="ob-um">Metric (kg, cm)</label></div>';
        h += '<div class="form-check"><input type="radio" name="ob-units" id="ob-ui" value="imperial"' + sel(data.units, 'imperial') + '><label for="ob-ui">Imperial (lbs, ft/in)</label></div>';
        h += '</div></div>';

        return h;
    }

    // ===== SCREEN 2 =====
    function screen2() {
        var h = '';
        h += '<h1 class="onboarding-title">\uD83D\uDC8A Current Health Status</h1>';
        h += '<p class="onboarding-subtitle">Tell us about your medications and limitations</p>';

        h += '<div class="form-group"><label class="form-label">Current Medications</label>';
        if (data.medications.length === 0) {
            h += '<p class="text-sm text-muted mb-4">No medications added yet. Tap the button below to add.</p>';
        }
        for (var i = 0; i < data.medications.length; i++) {
            var m = data.medications[i];
            h += '<div class="card mb-2 ob-med-row" style="padding:12px">';
            h += '<div class="flex items-center justify-between mb-2"><span class="text-sm font-semibold">Medication ' + (i+1) + '</span>';
            h += '<button type="button" class="btn btn-ghost btn-sm ob-rm-med" data-i="' + i + '">\u2715</button></div>';
            h += '<div class="form-group" style="margin-bottom:8px"><input type="text" class="form-input ob-med-name" placeholder="e.g., Allopurinol" value="' + esc(m.name) + '"></div>';
            h += '<div class="form-row"><div class="form-group" style="margin-bottom:0"><input type="text" class="form-input ob-med-dose" placeholder="e.g., 300mg" value="' + esc(m.dose) + '"></div>';
            h += '<div class="form-group" style="margin-bottom:0"><select class="form-select ob-med-cond">';
            h += '<option value="">Condition...</option>';
            h += '<option value="Gout"' + opt(m.condition,'Gout') + '>Gout</option>';
            h += '<option value="High Cholesterol"' + opt(m.condition,'High Cholesterol') + '>Cholesterol</option>';
            h += '<option value="Hypertension"' + opt(m.condition,'Hypertension') + '>Hypertension</option>';
            h += '<option value="Other"' + opt(m.condition,'Other') + '>Other</option>';
            h += '</select></div></div></div>';
        }
        h += '<button type="button" class="btn btn-secondary btn-sm" id="ob-add-med">+ Add Medication</button></div>';

        h += '<div class="form-group"><label class="form-label">Exercise Limitations</label>';
        h += '<textarea class="form-textarea" id="ob-limitations" placeholder="Any injuries, joint issues, physical restrictions...">' + esc(data.exerciseLimitations) + '</textarea></div>';

        h += '<div class="form-group"><div class="form-check"><input type="checkbox" id="ob-clearance"' + (data.doctorClearance ? ' checked' : '') + '>';
        h += '<label for="ob-clearance">\u2705 My doctor has cleared me for exercise and dietary changes</label></div></div>';

        h += '<div class="form-group"><label class="form-label">Preferred Exercise Time</label><div class="form-row" style="flex-wrap:wrap">';
        var times = [['Morning','\uD83C\uDF05'],['Lunch','\u2600\uFE0F'],['Evening','\uD83C\uDF19'],['Flexible','\uD83D\uDD04']];
        for (var i = 0; i < times.length; i++) {
            h += '<div class="form-check"><input type="radio" name="ob-extime" id="ob-et' + i + '" value="' + times[i][0] + '"' + sel(data.preferredExerciseTime, times[i][0]) + '>';
            h += '<label for="ob-et' + i + '">' + times[i][1] + ' ' + times[i][0] + '</label></div>';
        }
        h += '</div></div>';
        return h;
    }

    // ===== SCREEN 3 =====
    function screen3() {
        var wu = data.units === 'metric' ? 'kg' : 'lbs';
        var hl = data.units === 'metric' ? 'Height (cm) *' : 'Height *';
        var hp = data.units === 'metric' ? 'e.g., 175' : "e.g., 5'10 or 70 inches";

        var h = '';
        h += '<h1 class="onboarding-title">\uD83D\uDCCA Baseline Measurements</h1>';
        h += '<p class="onboarding-subtitle">Let\'s establish your starting point</p>';

        h += '<div class="form-row"><div class="form-group"><label class="form-label">Weight (' + wu + ') *</label>';
        h += '<input type="number" class="form-input" id="ob-weight" inputmode="decimal" placeholder="Enter weight" value="' + esc(data.currentWeight) + '" step="0.1" min="20" max="500"></div>';
        h += '<div class="form-group"><label class="form-label">' + hl + '</label>';
        h += '<input type="text" class="form-input" id="ob-height" placeholder="' + hp + '" value="' + esc(data.height) + '"></div></div>';

        h += '<div class="form-group"><label class="form-label">Last Blood Pressure Reading (optional)</label>';
        h += '<div class="form-row" style="align-items:center">';
        h += '<input type="number" class="form-input" id="ob-systolic" inputmode="numeric" placeholder="Systolic" value="' + esc(data.systolic) + '" min="70" max="250">';
        h += '<span style="font-size:1.25rem;color:var(--color-text-muted)">/</span>';
        h += '<input type="number" class="form-input" id="ob-diastolic" inputmode="numeric" placeholder="Diastolic" value="' + esc(data.diastolic) + '" min="40" max="150">';
        h += '<span class="text-sm text-muted">mmHg</span></div></div>';

        h += '<div class="form-group"><label class="form-label">How often do you want to check in?</label><div class="form-row">';
        h += '<div class="form-check"><input type="radio" name="ob-freq" id="ob-fd" value="daily"' + sel(data.checkinFrequency,'daily') + '><label for="ob-fd">\uD83D\uDCC5 Daily</label></div>';
        h += '<div class="form-check"><input type="radio" name="ob-freq" id="ob-fw" value="weekly"' + sel(data.checkinFrequency,'weekly') + '><label for="ob-fw">\uD83D\uDCC6 Weekly</label></div>';
        h += '</div></div>';

        h += '<div class="form-group"><label class="form-label">What\'s derailed your health goals in the past?</label>';
        h += '<textarea class="form-textarea" id="ob-challenges" placeholder="Understanding this helps us support you better...">' + esc(data.pastChallenges) + '</textarea>';
        h += '<div class="form-hint">This is gold for your behavioral coach \u2014 be honest!</div></div>';
        return h;
    }

    // ===== BIND events =====
    function bind() {
        var back = document.getElementById('ob-back');
        if (back) back.onclick = function() { collect(); screen--; paint(); };

        var next = document.getElementById('ob-next');
        if (next) next.onclick = function() {
            collect();
            if (!validate()) return;
            if (screen < 3) { screen++; paint(); }
            else finish();
        };

        if (screen === 2) {
            var addBtn = document.getElementById('ob-add-med');
            if (addBtn) addBtn.onclick = function() {
                collect();
                data.medications.push({ name: '', dose: '', condition: '' });
                paint();
            };
            var rmBtns = document.querySelectorAll('.ob-rm-med');
            for (var i = 0; i < rmBtns.length; i++) {
                (function(btn) {
                    btn.onclick = function() {
                        collect();
                        data.medications.splice(parseInt(btn.getAttribute('data-i')), 1);
                        paint();
                    };
                })(rmBtns[i]);
            }
        }
    }

    // ===== FINISH =====
    function finish() {
        Store.saveProfile({
            name: data.name, conditions: data.conditions, primaryGoal: data.primaryGoal,
            units: data.units, exerciseLimitations: data.exerciseLimitations,
            doctorClearance: data.doctorClearance, preferredExerciseTime: data.preferredExerciseTime,
            currentWeight: parseFloat(data.currentWeight), height: data.height,
            checkinFrequency: data.checkinFrequency, pastChallenges: data.pastChallenges
        }).then(function() {
            var promises = [];
            for (var i = 0; i < data.medications.length; i++) {
                if (data.medications[i].name.trim()) {
                    promises.push(Store.add('medications', {
                        name: data.medications[i].name, dose: data.medications[i].dose,
                        condition: data.medications[i].condition, schedule: 'daily', active: 1,
                        doseHistory: [{ date: Utils.dateStr(), dose: data.medications[i].dose, reason: 'Initial' }]
                    }));
                }
            }
            return Promise.all(promises);
        }).then(function() {
            if (data.currentWeight) {
                var kg = data.units === 'imperial' ? Utils.lbsToKg(parseFloat(data.currentWeight)) : parseFloat(data.currentWeight);
                return Store.addVital({ type: 'weight', value: kg, displayValue: parseFloat(data.currentWeight), displayUnit: data.units === 'metric' ? 'kg' : 'lbs', date: Utils.dateStr() });
            }
        }).then(function() {
            if (data.systolic && data.diastolic) {
                return Store.addVital({ type: 'bp', systolic: parseInt(data.systolic), diastolic: parseInt(data.diastolic), date: Utils.dateStr() });
            }
        }).then(function() {
            Utils.setSetting('units', data.units);
            Utils.setSetting('onboarded', true);
            Utils.toast('Welcome! Your health journey starts now.', 'success');
            window.location.hash = '#/dashboard';
        }).catch(function(err) {
            console.error('Onboarding error:', err);
            Utils.toast('Error saving \u2014 please try again.', 'danger');
        });
    }

    App.register('onboarding', {
        render: function() { paint(); return undefined; },
        afterRender: function() {}
    });
})();
