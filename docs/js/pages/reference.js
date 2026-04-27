App.register('reference', {
  render() {
    return `
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">Reference Guide</h1>
          <p class="page-subtitle">Health information and guidelines</p>
        </div>

        <!-- Tab Navigation -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="flex gap-2">
              <button id="tab-purine" class="btn btn-sm btn-secondary active" data-tab="purine">Purine Guide</button>
              <button id="tab-interactions" class="btn btn-sm btn-ghost" data-tab="interactions">Drug Interactions</button>
              <button id="tab-pain" class="btn btn-sm btn-ghost" data-tab="pain">Pain Guide</button>
            </div>
          </div>
        </div>

        <!-- Content Sections -->
        <div id="content-purine" class="tab-content active">
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="card-title">Purine Content Guide</h3>
              <div class="text-sm text-muted">Foods categorized by purine levels for gout management</div>
            </div>
            <div class="card-body">
              <div id="purine-content">
                <!-- Populated by JavaScript -->
              </div>
            </div>
          </div>
        </div>

        <div id="content-interactions" class="tab-content" style="display: none;">
          <div class="alert alert-warning mb-4">
            <strong>Important:</strong> ${DrugInteractions.disclaimer}
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Known Drug Interactions</h3>
              <div class="text-sm text-muted">Common interactions to be aware of</div>
            </div>
            <div class="card-body">
              <div id="interactions-content">
                <!-- Populated by JavaScript -->
              </div>
            </div>
          </div>
        </div>

        <div id="content-pain" class="tab-content" style="display: none;">
          <!-- Pain Scale Reference -->
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="card-title">Pain Scale Reference</h3>
              <div class="text-sm text-muted">Understanding pain levels and descriptions</div>
            </div>
            <div class="card-body">
              <div id="pain-scale-content">
                <!-- Populated by JavaScript -->
              </div>
            </div>
          </div>

          <!-- Pain Type Differentiation -->
          <div class="card mb-4">
            <div class="card-header">
              <h3 class="card-title">Pain Type Guide</h3>
              <div class="text-sm text-muted">Different types of pain and their characteristics</div>
            </div>
            <div class="card-body">
              <div id="pain-types-content">
                <!-- Populated by JavaScript -->
              </div>
            </div>
          </div>

          <!-- Traffic Light System -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Pain Traffic Light System</h3>
              <div class="text-sm text-muted">When to seek medical attention</div>
            </div>
            <div class="card-body">
              <div id="traffic-light-content">
                <!-- Populated by JavaScript -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    this.loadPurineGuide();
    this.loadInteractions();
    this.loadPainGuide();
    this.bindEvents();
  },

  loadPurineGuide() {
    const container = document.getElementById('purine-content');
    const foods = PurineGuide.foods;

    const categories = [
      { key: 'eatFreely', title: 'Eat Freely', color: 'tag-green', description: 'Very low purine content' },
      { key: 'eatModerately', title: 'Eat Moderately', color: 'tag-yellow', description: 'Low to moderate purine content' },
      { key: 'limit', title: 'Limit Intake', color: 'tag-red', description: 'Moderate to high purine content' },
      { key: 'avoid', title: 'Avoid During Flares', color: 'tag-red', description: 'Very high purine content' }
    ];

    container.innerHTML = categories.map(category => `
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="tag ${category.color} font-semibold">${category.title}</span>
          <span class="text-sm text-muted">${category.description}</span>
        </div>
        
        <div class="grid grid-2 gap-2">
          ${(foods[category.key] || []).map(food => `
            <div class="p-3 border rounded bg-gray-50">
              <div class="text-sm">${Utils.escapeHtml(food)}</div>
            </div>
          `).join('')}
        </div>
        
        ${category.key !== 'avoid' ? '<div class="divider mt-4"></div>' : ''}
      </div>
    `).join('');
  },

  loadInteractions() {
    const container = document.getElementById('interactions-content');
    const interactions = DrugInteractions.interactions;

    container.innerHTML = interactions.map(interaction => {
      const riskColor = interaction.severity === 'high' ? 'tag-red' : 
                       interaction.severity === 'moderate' ? 'tag-yellow' : 'tag-blue';
      
      return `
        <div class="card mb-4">
          <div class="card-header">
            <div class="flex justify-between items-center">
              <h4 class="font-semibold">${Utils.escapeHtml(interaction.drugs.join(' + '))}</h4>
              <span class="tag ${riskColor}">${interaction.severity.toUpperCase()}</span>
            </div>
          </div>
          <div class="card-body">
            <p class="text-sm mb-2">${Utils.escapeHtml(interaction.description)}</p>
            ${interaction.precautions ? `
              <div class="alert alert-info">
                <strong>Precautions:</strong> ${Utils.escapeHtml(interaction.precautions)}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  loadPainGuide() {
    // Pain Scale
    const scaleContainer = document.getElementById('pain-scale-content');
    const scale = PainReference.scale;

    scaleContainer.innerHTML = `
      <div class="space-y-3">
        ${scale.map((level, index) => `
          <div class="flex items-center gap-4 p-3 border rounded">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" 
                 style="background-color: ${Utils.painColor(index)}">
              ${index}
            </div>
            <div>
              <div class="font-semibold">${level.name}</div>
              <div class="text-sm text-muted">${level.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Pain Types
    const typesContainer = document.getElementById('pain-types-content');
    const painTypes = PainReference.painTypes;

    typesContainer.innerHTML = `
      <div class="grid gap-4">
        ${Object.entries(painTypes).map(([type, info]) => `
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">${type}</h4>
            </div>
            <div class="card-body">
              <p class="text-sm mb-2">${info.description}</p>
              <div class="text-xs text-muted">
                <strong>Examples:</strong> ${info.examples.join(', ')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Traffic Light System
    const trafficContainer = document.getElementById('traffic-light-content');
    const trafficLight = PainReference.trafficLight;

    trafficContainer.innerHTML = `
      <div class="space-y-4">
        ${trafficLight.map(level => {
          const colorClass = level.color === 'green' ? 'alert-success' : 
                           level.color === 'yellow' ? 'alert-warning' : 'alert-danger';
          
          return `
            <div class="alert ${colorClass}">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-6 h-6 rounded-full" style="background-color: ${level.color}"></div>
                <strong>${level.level}</strong>
              </div>
              <p class="mb-2">${level.description}</p>
              <div class="text-sm">
                <strong>Action:</strong> ${level.action}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  bindEvents() {
    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.dataset.tab) {
        const tabName = e.target.dataset.tab;
        
        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(btn => {
          btn.classList.remove('btn-secondary', 'active');
          btn.classList.add('btn-ghost');
        });
        e.target.classList.remove('btn-ghost');
        e.target.classList.add('btn-secondary', 'active');
        
        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
          content.style.display = 'none';
          content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`content-${tabName}`);
        if (targetContent) {
          targetContent.style.display = 'block';
          targetContent.classList.add('active');
        }
      }
    });
  }
});