// profile.js — My Health Profile: editable personal info, conditions, physicals, doctors
(function() {
    'use strict';

    var profileData = null;
    var latestWeight = null;
    var latestBP = null;
    var activeMeds = [];
    var activeGoals = [];
    var editing = null; // which section is being edited

    function esc(s) { return Utils.escapeHtml(s || ''); }

    async function loadData() {
        profileData = await Store.getProfile() || {};
        latestWeight = await Store.getLatestWeight();
        latestBP = await Store.getLatestBP();
        activeMeds = await Store.getActiveMeds();
        activeGoals = await Store.getActiveGoals();
    }

    function paint() {
        var app = document.getElementById('app');
        loadData().then(function() {
            app.innerHTML = buildPage();
            bind();
        });
    }

    function buildPage() {
        var h = '';
        h += '<div class="page">';
        h += '<div class="page-header"><h1 class="page-title">👤 My Health Profile</h1>';
        h += '<p class="page-subtitle">View and update your health information</p></div>';

        h += buildPersonalInfo();
        h += buildConditions();
        h += buildCurrentPhysicals();
        h += buildMedications();
        h += buildDoctors();
        h += buildGoalsSummary();

        h += '<div class="disclaimer"><strong>⚕️ Disclaimer:</strong> This is a personal tracking companion, not medical advice.</div>';
        h += '</div>';
        return h;
    }

    // ===== Personal Info =====
    function buildPersonalInfo() {
        var p = profileData;
        var h = '<div class="card mb-4">';
        h += '<div class="card-header"><h3 class="card-title">📋 Personal Information</h3>';
        if (editing !== 'personal') h += '<button class="btn btn-ghost btn-sm" data-edit="personal">Edit</button>';
        h += '</div>';

        if (editing === 'personal') {
            h += '<div class="form-group"><label class="form-label">Name</label>';
            h += '<input type="text" class="form-input" id="pf-name" value="' + esc(p.name) + '"></div>';
            h += '<div class="form-group"><label class="form-label">Date of Birth</label>';
            h += '<input type="date" class="form-input" id="pf-dob" value="' + esc(p.dob) + '"></div>';
            h += '<div class="form-row"><div class="form-group"><label class="form-label">Height</label>';
            h += '<input type="text" class="form-input" id="pf-height" value="' + esc(p.height) + '" placeholder="' + (p.units === 'imperial' ? "5'10" : '178 cm') + '"></div>';
            h += '<div class="form-group"><label class="form-label">Gender</label>';
            h += '<select class="form-select" id="pf-gender">';
            h += '<option value="">Prefer not to say</option>';
            h += '<option value="male"' + (p.gender === 'male' ? ' selected' : '') + '>Male</option>';
            h += '<option value="female"' + (p.gender === 'female' ? ' selected' : '') + '>Female</option>';
            h += '<option value="other"' + (p.gender === 'other' ? ' selected' : '') + '>Other</option>';
            h += '</select></div></div>';
            h += '<div class="form-group"><label class="form-label">Units</label><div class="form-row">';
            h += '<div class="form-check"><input type="radio" name="pf-units" id="pf-um" value="metric"' + (p.units !== 'imperial' ? ' checked' : '') + '><label for="pf-um">Metric</label></div>';
            h += '<div class="form-check"><input type="radio" name="pf-units" id="pf-ui" value="imperial"' + (p.units === 'imperial' ? ' checked' : '') + '><label for="pf-ui">Imperial</label></div>';
            h += '</div></div>';
            h += '<div class="flex gap-2"><button class="btn btn-primary btn-sm" id="pf-save-personal">Save</button>';
            h += '<button class="btn btn-ghost btn-sm" id="pf-cancel-personal">Cancel</button></div>';
        } else {
            h += '<div class="section-list">';
            h += infoRow('Name', p.name || '—');
            h += infoRow('Date of Birth', p.dob ? Utils.displayDate(p.dob) : '—');
            h += infoRow('Height', p.height || '—');
            h += infoRow('Gender', capitalize(p.gender) || '—');
            h += infoRow('Units', capitalize(p.units) || 'Metric');
            h += infoRow('Primary Goal', p.primaryGoal || '—');
            h += infoRow('Check-in Frequency', capitalize(p.checkinFrequency) || 'Daily');
            h += '</div>';
        }
        h += '</div>';
        return h;
    }

    // ===== Conditions =====
    function buildConditions() {
        var conds = profileData.conditions || [];
        var allConditions = ['Gout', 'High Cholesterol', 'Hypertension', 'Diabetes', 'Sleep Apnea', 'Other'];

        var h = '<div class="card mb-4">';
        h += '<div class="card-header"><h3 class="card-title">🩺 Health Conditions</h3>';
        if (editing !== 'conditions') h += '<button class="btn btn-ghost btn-sm" data-edit="conditions">Edit</button>';
        h += '</div>';

        if (editing === 'conditions') {
            for (var i = 0; i < allConditions.length; i++) {
                var c = allConditions[i];
                var checked = conds.indexOf(c) >= 0 ? ' checked' : '';
                h += '<div class="form-check"><input type="checkbox" class="pf-condition" value="' + c + '"' + checked + '>';
                h += '<label>' + c + '</label></div>';
            }
            h += '<div class="form-group mt-4"><label class="form-label">Other conditions (comma-separated)</label>';
            var custom = conds.filter(function(c) { return allConditions.indexOf(c) < 0; }).join(', ');
            h += '<input type="text" class="form-input" id="pf-custom-conditions" value="' + esc(custom) + '" placeholder="e.g., Arthritis, Asthma"></div>';
            h += '<div class="flex gap-2"><button class="btn btn-primary btn-sm" id="pf-save-conditions">Save</button>';
            h += '<button class="btn btn-ghost btn-sm" id="pf-cancel-conditions">Cancel</button></div>';
        } else {
            if (conds.length === 0) {
                h += '<p class="text-sm text-muted">No conditions recorded</p>';
            } else {
                h += '<div class="flex flex-wrap gap-2">';
                for (var i = 0; i < conds.length; i++) {
                    h += '<span class="tag tag-blue">' + esc(conds[i]) + '</span>';
                }
                h += '</div>';
            }
        }
        h += '</div>';
        return h;
    }

    // ===== Current Physicals =====
    function buildCurrentPhysicals() {
        var h = '<div class="card mb-4">';
        h += '<div class="card-header"><h3 class="card-title">📊 Current Physicals</h3></div>';
        h += '<div class="grid grid-2 gap-3">';

        // Weight
        var wVal = '—';
        var wDate = '';
        if (latestWeight) {
            var dv = latestWeight.displayValue || latestWeight.value;
            var du = latestWeight.displayUnit || (profileData.units === 'imperial' ? 'lbs' : 'kg');
            wVal = dv + ' ' + du;
            wDate = latestWeight.date ? Utils.relativeDate(latestWeight.date) : '';
        }
        h += metricCard('⚖️ Weight', wVal, wDate, '#/log/vitals');

        // BP
        var bpVal = '—';
        var bpDate = '';
        if (latestBP) {
            bpVal = latestBP.systolic + '/' + latestBP.diastolic + ' mmHg';
            bpDate = latestBP.date ? Utils.relativeDate(latestBP.date) : '';
        }
        h += metricCard('🩺 Blood Pressure', bpVal, bpDate, '#/log/vitals');

        // Starting weight from profile
        var sw = profileData.currentWeight;
        if (sw) {
            var su = profileData.units === 'imperial' ? 'lbs' : 'kg';
            h += metricCard('📌 Starting Weight', sw + ' ' + su, 'From onboarding', null);
        }

        // BMI
        if (latestWeight && profileData.height) {
            var kg = latestWeight.value || latestWeight.displayValue;
            var cm = parseFloat(profileData.height);
            if (kg && cm && cm > 0) {
                var bmi = Utils.bmi(kg, cm);
                if (bmi) h += metricCard('📏 BMI', bmi.toString(), bmiCategory(bmi), null);
            }
        }

        h += '</div>';
        h += '<div class="mt-4"><a href="#/log/vitals" class="btn btn-secondary btn-sm btn-block">+ Log New Measurement</a></div>';
        h += '</div>';
        return h;
    }

    // ===== Medications =====
    function buildMedications() {
        var h = '<div class="card mb-4">';
        h += '<div class="card-header"><h3 class="card-title">💊 Medications</h3></div>';

        if (activeMeds.length === 0) {
            h += '<p class="text-sm text-muted">No medications recorded</p>';
        } else {
            h += '<div class="section-list">';
            for (var i = 0; i < activeMeds.length; i++) {
                var m = activeMeds[i];
                h += '<div class="log-entry">';
                h += '<div class="log-entry-header">';
                h += '<span class="font-semibold">' + esc(m.name) + '</span>';
                if (m.condition) h += '<span class="tag tag-blue">' + esc(m.condition) + '</span>';
                h += '</div>';
                if (m.dose) h += '<span class="text-sm text-muted">' + esc(m.dose) + ' • ' + esc(m.schedule || 'daily') + '</span>';
                h += '</div>';
            }
            h += '</div>';
        }
        h += '<div class="mt-4"><a href="#/medications" class="btn btn-secondary btn-sm btn-block">Manage Medications</a></div>';
        h += '</div>';
        return h;
    }

    // ===== Doctor Info =====
    function buildDoctors() {
        var docs = profileData.doctors || [];
        var h = '<div class="card mb-4">';
        h += '<div class="card-header"><h3 class="card-title">🏥 My Doctors & Specialists</h3>';
        if (editing !== 'doctors') h += '<button class="btn btn-ghost btn-sm" data-edit="doctors">Edit</button>';
        h += '</div>';

        if (editing === 'doctors') {
            for (var i = 0; i < docs.length; i++) {
                var d = docs[i];
                h += '<div class="card mb-2 pf-doc-row" style="padding:12px">';
                h += '<div class="flex items-center justify-between mb-2"><span class="text-sm font-semibold">Doctor ' + (i+1) + '</span>';
                h += '<button type="button" class="btn btn-ghost btn-sm pf-rm-doc" data-i="' + i + '">✕</button></div>';
                h += '<div class="form-row"><div class="form-group" style="margin-bottom:8px">';
                h += '<input type="text" class="form-input pf-doc-name" placeholder="Doctor name" value="' + esc(d.name) + '"></div>';
                h += '<div class="form-group" style="margin-bottom:8px">';
                h += '<select class="form-select pf-doc-specialty"><option value="">Specialty...</option>';
                var specs = ['GP', 'Rheumatologist', 'Cardiologist', 'Endocrinologist', 'Nephrologist', 'Other'];
                for (var s = 0; s < specs.length; s++) {
                    h += '<option value="' + specs[s] + '"' + (d.specialty === specs[s] ? ' selected' : '') + '>' + specs[s] + '</option>';
                }
                h += '</select></div></div>';
                h += '<div class="form-group" style="margin-bottom:0"><input type="date" class="form-input pf-doc-next" value="' + esc(d.nextAppt) + '">';
                h += '<div class="form-hint">Next appointment</div></div></div>';
            }
            h += '<button type="button" class="btn btn-secondary btn-sm mb-4" id="pf-add-doc">+ Add Doctor</button>';
            h += '<div class="flex gap-2"><button class="btn btn-primary btn-sm" id="pf-save-doctors">Save</button>';
            h += '<button class="btn btn-ghost btn-sm" id="pf-cancel-doctors">Cancel</button></div>';
        } else {
            if (docs.length === 0) {
                h += '<p class="text-sm text-muted">No doctors recorded yet. Add your GP and specialists.</p>';
            } else {
                h += '<div class="section-list">';
                for (var i = 0; i < docs.length; i++) {
                    var d = docs[i];
                    h += '<div class="log-entry">';
                    h += '<div class="log-entry-header">';
                    h += '<span class="font-semibold">' + esc(d.name) + '</span>';
                    if (d.specialty) h += '<span class="tag">' + esc(d.specialty) + '</span>';
                    h += '</div>';
                    if (d.nextAppt) h += '<span class="text-sm text-muted">Next: ' + Utils.displayDate(d.nextAppt) + '</span>';
                    h += '</div>';
                }
                h += '</div>';
            }
        }
        h += '</div>';
        return h;
    }

    // ===== Goals Summary =====
    function buildGoalsSummary() {
        var h = '<div class="card mb-4">';
        h += '<div class="card-header"><h3 class="card-title">🎯 Active Goals</h3></div>';
        if (activeGoals.length === 0) {
            h += '<p class="text-sm text-muted">No active goals yet</p>';
        } else {
            for (var i = 0; i < activeGoals.length; i++) {
                var g = activeGoals[i];
                h += '<div class="log-entry"><span class="font-semibold">' + esc(g.title || g.category) + '</span></div>';
            }
        }
        h += '<div class="mt-4"><a href="#/goals" class="btn btn-secondary btn-sm btn-block">Manage Goals</a></div>';
        h += '</div>';
        return h;
    }

    // ===== Helpers =====
    function infoRow(label, value) {
        return '<div class="log-entry"><div class="log-entry-header"><span class="text-sm text-muted">' + label + '</span><span class="font-semibold">' + esc(value) + '</span></div></div>';
    }

    function metricCard(icon, value, sub, link) {
        var h = '<div class="metric-card card">';
        h += '<div class="card-label">' + icon + '</div>';
        h += '<div class="card-value" style="font-size:var(--text-xl)">' + esc(value) + '</div>';
        if (sub) h += '<div class="text-xs text-muted">' + esc(sub) + '</div>';
        if (link) h += '<a href="' + link + '" class="text-xs" style="color:var(--color-primary)">Update →</a>';
        h += '</div>';
        return h;
    }

    function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

    function bmiCategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    // ===== BIND events =====
    function bind() {
        // Edit buttons
        var editBtns = document.querySelectorAll('[data-edit]');
        for (var i = 0; i < editBtns.length; i++) {
            (function(btn) {
                btn.onclick = function() {
                    editing = btn.getAttribute('data-edit');
                    paint();
                };
            })(editBtns[i]);
        }

        // Cancel buttons
        var cancelIds = ['pf-cancel-personal', 'pf-cancel-conditions', 'pf-cancel-doctors'];
        for (var i = 0; i < cancelIds.length; i++) {
            var el = document.getElementById(cancelIds[i]);
            if (el) el.onclick = function() { editing = null; paint(); };
        }

        // Save personal
        var savePersonal = document.getElementById('pf-save-personal');
        if (savePersonal) savePersonal.onclick = function() {
            var unitEl = document.querySelector('input[name="pf-units"]:checked');
            Store.saveProfile({
                name: document.getElementById('pf-name').value.trim(),
                dob: document.getElementById('pf-dob').value,
                height: document.getElementById('pf-height').value.trim(),
                gender: document.getElementById('pf-gender').value,
                units: unitEl ? unitEl.value : profileData.units
            }).then(function() {
                if (unitEl) Utils.setSetting('units', unitEl.value);
                editing = null;
                Utils.toast('Profile updated', 'success');
                paint();
            });
        };

        // Save conditions
        var saveConds = document.getElementById('pf-save-conditions');
        if (saveConds) saveConds.onclick = function() {
            var checked = document.querySelectorAll('.pf-condition:checked');
            var conditions = [];
            for (var i = 0; i < checked.length; i++) conditions.push(checked[i].value);
            var custom = (document.getElementById('pf-custom-conditions').value || '').split(',');
            for (var i = 0; i < custom.length; i++) {
                var c = custom[i].trim();
                if (c && conditions.indexOf(c) < 0) conditions.push(c);
            }
            Store.saveProfile({ conditions: conditions }).then(function() {
                editing = null;
                Utils.toast('Conditions updated', 'success');
                paint();
            });
        };

        // Save doctors
        var saveDocs = document.getElementById('pf-save-doctors');
        if (saveDocs) saveDocs.onclick = function() {
            var rows = document.querySelectorAll('.pf-doc-row');
            var doctors = [];
            for (var i = 0; i < rows.length; i++) {
                var nm = rows[i].querySelector('.pf-doc-name');
                var sp = rows[i].querySelector('.pf-doc-specialty');
                var nx = rows[i].querySelector('.pf-doc-next');
                doctors.push({
                    name: nm ? nm.value.trim() : '',
                    specialty: sp ? sp.value : '',
                    nextAppt: nx ? nx.value : ''
                });
            }
            doctors = doctors.filter(function(d) { return d.name; });
            Store.saveProfile({ doctors: doctors }).then(function() {
                editing = null;
                Utils.toast('Doctors updated', 'success');
                paint();
            });
        };

        // Add doctor
        var addDoc = document.getElementById('pf-add-doc');
        if (addDoc) addDoc.onclick = function() {
            if (!profileData.doctors) profileData.doctors = [];
            // Collect current form values first
            var rows = document.querySelectorAll('.pf-doc-row');
            profileData.doctors = [];
            for (var i = 0; i < rows.length; i++) {
                var nm = rows[i].querySelector('.pf-doc-name');
                var sp = rows[i].querySelector('.pf-doc-specialty');
                var nx = rows[i].querySelector('.pf-doc-next');
                profileData.doctors.push({
                    name: nm ? nm.value.trim() : '',
                    specialty: sp ? sp.value : '',
                    nextAppt: nx ? nx.value : ''
                });
            }
            profileData.doctors.push({ name: '', specialty: '', nextAppt: '' });
            paint();
        };

        // Remove doctor
        var rmBtns = document.querySelectorAll('.pf-rm-doc');
        for (var i = 0; i < rmBtns.length; i++) {
            (function(btn) {
                btn.onclick = function() {
                    var rows = document.querySelectorAll('.pf-doc-row');
                    profileData.doctors = [];
                    for (var j = 0; j < rows.length; j++) {
                        var nm = rows[j].querySelector('.pf-doc-name');
                        var sp = rows[j].querySelector('.pf-doc-specialty');
                        var nx = rows[j].querySelector('.pf-doc-next');
                        profileData.doctors.push({
                            name: nm ? nm.value.trim() : '',
                            specialty: sp ? sp.value : '',
                            nextAppt: nx ? nx.value : ''
                        });
                    }
                    profileData.doctors.splice(parseInt(btn.getAttribute('data-i')), 1);
                    paint();
                };
            })(rmBtns[i]);
        }
    }

    App.register('profile', {
        render: function() { paint(); return undefined; },
        afterRender: function() {}
    });
})();
