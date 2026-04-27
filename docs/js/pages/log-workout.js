// log-workout.js — Workout logging with RPE + pain tracking
App.register('log/workout', {
  render() {
    const today = Utils.dateStr();
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">🏋️ Log Workout</h1>
          <p class="page-subtitle">Track exercise with pain awareness</p>
        </div>

        <div class="card mb-4">
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-input" id="wo-date" value="${today}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-select" id="wo-type">
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="mobility">Mobility</option>
                <option value="walking">Walking</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Duration (min)</label>
              <input type="number" class="form-input" id="wo-duration" inputmode="numeric" placeholder="45" min="1" max="300">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">RPE (Rate of Perceived Exertion) — <span id="wo-rpe-val">5</span>/10</label>
            <input type="range" class="form-range" id="wo-rpe" min="1" max="10" value="5">
            <div class="form-hint">1 = Very easy, 10 = Maximum effort</div>
          </div>

          <div class="divider"></div>
          <h3 class="font-semibold mb-4">Pain Check</h3>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Pain BEFORE <span id="wo-pain-before-val" class="pain-value green">0</span></label>
              <input type="range" class="form-range" id="wo-pain-before" min="0" max="10" value="0">
              <div class="form-hint" id="wo-pain-before-zone">🟢 Safe</div>
            </div>
            <div class="form-group">
              <label class="form-label">Pain AFTER <span id="wo-pain-after-val" class="pain-value green">0</span></label>
              <input type="range" class="form-range" id="wo-pain-after" min="0" max="10" value="0">
              <div class="form-hint" id="wo-pain-after-zone">🟢 Safe</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-check">
              <input type="checkbox" id="wo-flare-active">
              <span>🔥 Gout flare currently active</span>
            </label>
          </div>
          <div class="alert alert-warning mb-4" id="wo-flare-warning" style="display:none;">
            ⚠️ During an active flare, consider modified activity: upper-body exercises, swimming, or seated resistance. Avoid loading the affected joint.
          </div>

          <div class="divider"></div>
          <h3 class="font-semibold mb-4">Exercises</h3>
          <div id="wo-exercises"></div>
          <button class="btn btn-secondary btn-sm mt-2" id="wo-add-exercise">+ Add Exercise</button>

          <div class="divider"></div>

          <div class="form-group">
            <label class="form-label">Adherence</label>
            <select class="form-select" id="wo-adherence">
              <option value="completed">✅ Completed full plan</option>
              <option value="partial">⚠️ Partial — modified or cut short</option>
              <option value="skipped">❌ Skipped planned workout</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea class="form-textarea" id="wo-notes" placeholder="How did it feel? Any observations..."></textarea>
          </div>

          <button class="btn btn-primary btn-block btn-lg" id="wo-save">Save Workout</button>
        </div>

        ${Safety.renderDisclaimer()}
      </div>`;
  },

  afterRender() {
    let exerciseCount = 0;

    // RPE slider
    const rpeSlider = document.getElementById('wo-rpe');
    const rpeVal = document.getElementById('wo-rpe-val');
    rpeSlider.addEventListener('input', () => { rpeVal.textContent = rpeSlider.value; });

    // Pain sliders with traffic light
    const setupPainSlider = (sliderId, valId, zoneId) => {
      const slider = document.getElementById(sliderId);
      const val = document.getElementById(valId);
      const zone = document.getElementById(zoneId);
      slider.addEventListener('input', () => {
        const level = parseInt(slider.value);
        val.textContent = level;
        val.className = 'pain-value ' + Utils.painColor(level);
        zone.textContent = Utils.painZone(level);
      });
    };
    setupPainSlider('wo-pain-before', 'wo-pain-before-val', 'wo-pain-before-zone');
    setupPainSlider('wo-pain-after', 'wo-pain-after-val', 'wo-pain-after-zone');

    // Flare active toggle
    document.getElementById('wo-flare-active').addEventListener('change', (e) => {
      document.getElementById('wo-flare-warning').style.display = e.target.checked ? 'flex' : 'none';
    });

    // Add exercise row
    const addExercise = () => {
      exerciseCount++;
      const container = document.getElementById('wo-exercises');
      const row = document.createElement('div');
      row.className = 'card mb-2';
      row.style.padding = 'var(--space-3)';
      row.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold">Exercise ${exerciseCount}</span>
          <button class="btn btn-ghost btn-sm ex-remove" data-idx="${exerciseCount}">✕</button>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-2)">
          <input type="text" class="form-input ex-name" placeholder="Exercise name" data-idx="${exerciseCount}">
        </div>
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0">
            <input type="number" class="form-input ex-sets" placeholder="Sets" inputmode="numeric" min="1" data-idx="${exerciseCount}">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <input type="text" class="form-input ex-reps" placeholder="Reps" data-idx="${exerciseCount}">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <input type="text" class="form-input ex-weight" placeholder="Weight" data-idx="${exerciseCount}">
          </div>
        </div>`;
      container.appendChild(row);

      row.querySelector('.ex-remove').addEventListener('click', () => row.remove());
    };

    document.getElementById('wo-add-exercise').addEventListener('click', addExercise);
    addExercise(); // Start with one row

    // Save
    document.getElementById('wo-save').addEventListener('click', async () => {
      const duration = parseInt(document.getElementById('wo-duration').value);
      if (!duration) {
        Utils.toast('Please enter workout duration', 'warning');
        return;
      }

      // Gather exercises
      const exercises = [];
      document.querySelectorAll('.ex-name').forEach((el) => {
        const idx = el.dataset.idx;
        const name = el.value.trim();
        if (name) {
          exercises.push({
            name,
            sets: document.querySelector(`.ex-sets[data-idx="${idx}"]`)?.value || '',
            reps: document.querySelector(`.ex-reps[data-idx="${idx}"]`)?.value || '',
            weight: document.querySelector(`.ex-weight[data-idx="${idx}"]`)?.value || ''
          });
        }
      });

      const painAfter = parseInt(document.getElementById('wo-pain-after').value);
      const entry = {
        date: document.getElementById('wo-date').value,
        type: document.getElementById('wo-type').value,
        durationMin: duration,
        rpe: parseInt(document.getElementById('wo-rpe').value),
        painBefore: parseInt(document.getElementById('wo-pain-before').value),
        painAfter: painAfter,
        flareActive: document.getElementById('wo-flare-active').checked,
        exercises,
        adherence: document.getElementById('wo-adherence').value,
        notes: document.getElementById('wo-notes').value.trim()
      };

      try {
        await Store.add('workouts', entry);

        // Warn if pain after is in red zone
        if (painAfter >= 5) {
          Utils.toast('🔴 High post-workout pain — consider reducing intensity next time', 'warning', 5000);
        } else {
          Utils.toast('Workout saved! 💪', 'success');
        }
        App.go('log');
      } catch (err) {
        Utils.toast('Error saving workout', 'danger');
      }
    });
  }
});
