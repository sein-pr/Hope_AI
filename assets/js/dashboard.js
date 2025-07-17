// Main Dashboard Controller
class NamibiaUraniumDashboard {
  constructor() {
    this.data = null;
    this.charts = {};
    this.init();
  }

  async init() {
    try {
      // Set current year
      document.getElementById('current-year').textContent = new Date().getFullYear();
      
      // Load data
      await this.loadData();
      
      // Initialize components
      this.initMetrics();
      this.initFilters();
      this.initCharts();
      this.initMineMap();
      this.initNews();
      this.initUI();
      this.initBenchmarking();
      this.initDataPolling();
      this.initPDFExport();
      this.initViewToggles();
      this.initUserPreferences();
      this.initDataStories();
      
      // Enhance accessibility
      this.enhanceAccessibility();
      
    } catch (error) {
     
    }
  }

  async loadData() {
    const response = await fetch('assets/data/charts.json');
    if (!response.ok) throw new Error('Failed to load data');
    this.data = await response.json();
    
    // Add mine coordinates if not present
    this.data.mines.forEach(mine => {
      if (!mine.coordinates) {
        mine.coordinates = this.getDefaultCoordinates(mine.id);
      }
    });
  }

  getDefaultCoordinates(mineId) {
    // Default coordinates for Namibia's major uranium mines
    const locations = {
      'rossing': { lat: -22.4833, lng: 14.5333 },
      'husab': { lat: -22.5833, lng: 14.9667 },
      'langer': { lat: -23.5, lng: 15.0 },
      'trekkopje': { lat: -22.3667, lng: 15.0333 }
    };
    return locations[mineId] || { lat: -22.0, lng: 17.0 };
  }

  initMetrics() {
    const container = document.getElementById('metrics-container');
    if (!container) return;

    container.innerHTML = this.data.metrics.map(metric => `
      <div class="col-md-3 col-6">
        <div class="card h-100 border-0 shadow-sm metric-card" 
             data-bs-toggle="tooltip" title="${metric.tooltip}">
          <div class="card-body text-center">
            <div class="metric-icon bg-${metric.color}-subtle text-${metric.color} mb-3">
              <i class="fas fa-${metric.icon} fa-2x"></i>
            </div>
            <h3 class="h5">${metric.title}</h3>
            <p class="display-6 fw-bold text-${metric.color}">${metric.value}</p>
            <small class="badge bg-${metric.color}-subtle text-${metric.color} mb-1">${metric.change}</small>
            <p class="small text-muted">${metric.description}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  initFilters() {
    const mineFilter = document.getElementById('mine-filter');
    const yearFilter = document.getElementById('year-filter');
    
    if (!mineFilter || !yearFilter) return;

    // Populate mine filter
    mineFilter.innerHTML = '<option value="all">All Mines</option>' + 
      this.data.mines.map(mine => `<option value="${mine.id}">${mine.name}</option>`).join('');

    // Populate year filter
    yearFilter.innerHTML = '<option value="all">All Years</option>' +
      this.data.production.years.map(year => `<option value="${year}">${year}</option>`).join('');

    // Set up event listeners
    const metricFilter = document.getElementById('metric-filter');
    const resetBtn = document.getElementById('reset-filters');

    if (metricFilter && resetBtn) {
      mineFilter.addEventListener('change', () => this.updateCharts());
      yearFilter.addEventListener('change', () => this.updateCharts());
      metricFilter.addEventListener('change', () => this.updateCharts());
      resetBtn.addEventListener('click', () => {
        mineFilter.value = 'all';
        yearFilter.value = 'all';
        metricFilter.value = 'production';
        this.updateCharts();
      });
    }
  }

  initCharts() {
    // Initialize charts only if their canvas elements exist
    const productionCtx = document.getElementById('productionChart')?.getContext('2d');
    const employmentCtx = document.getElementById('employmentChart')?.getContext('2d');
    const exportCtx = document.getElementById('exportChart')?.getContext('2d');
    const environmentCtx = document.getElementById('environmentChart')?.getContext('2d');

    if (productionCtx) {
      this.charts.production = new Chart(productionCtx, this.getProductionChartConfig());
    }
    if (employmentCtx) {
      this.charts.employment = new Chart(employmentCtx, this.getEmploymentChartConfig());
    }
    if (exportCtx) {
      this.charts.export = new Chart(exportCtx, this.getExportChartConfig());
    }
    if (environmentCtx) {
      this.charts.environment = new Chart(environmentCtx, this.getEnvironmentChartConfig());
    }

    // Set update dates
    const today = new Date();
    const dateEls = {
      'production-update-date': productionCtx,
      'employment-update-date': employmentCtx,
      'export-update-date': exportCtx,
      'environment-update-date': environmentCtx,
      'map-update-date': true
    };

    Object.entries(dateEls).forEach(([id, ctx]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = today.toLocaleDateString();
    });
  }

  getProductionChartConfig() {
    return {
      type: 'bar',
      data: {
        labels: this.data.production.years,
        datasets: this.data.mines.map(mine => ({
          label: mine.name,
          data: mine.production,
          backgroundColor: mine.color,
          borderColor: mine.borderColor,
          borderWidth: 1
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}t U₃O₈`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Tonnes U₃O₈' },
            ticks: { callback: value => value.toLocaleString() + 't' }
          }
        }
      }
    };
  }

  getEmploymentChartConfig() {
    return {
      type: 'line',
      data: {
        labels: this.data.employment.years,
        datasets: [{
          label: 'Total Employment',
          data: this.data.employment.total,
          fill: false,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 3,
          tension: 0.1,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgba(54, 162, 235, 1)',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHitRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: {
              size: 16,
              weight: 'bold'
            },
            bodyFont: {
              size: 14
            },
            callbacks: {
              label: (context) => {
                return ` ${context.dataset.label}: ${context.raw.toLocaleString()} employees`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Number of Employees',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        animation: {
          duration: 1000
        }
      }
    };
  }

  getExportChartConfig() {
    return {
      type: 'doughnut',
      data: {
        labels: this.data.exports.destinations.map(d => d.country),
        datasets: [{
          data: this.data.exports.destinations.map(d => d.percentage),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.raw}% of exports`
            }
          },
          datalabels: {
            formatter: (value) => `${value}%`,
            color: '#fff',
            font: { weight: 'bold' }
          }
        }
      },
      plugins: [ChartDataLabels]
    };
  }

  getEnvironmentChartConfig() {
    return {
      type: 'bar',
      data: {
        labels: ['Water Usage (million m³)', 'Carbon Footprint (kton CO₂)', 'Land Rehabilitated (hectares)'],
        datasets: [
          {
            label: 'Rössing',
            data: [
              this.data.environment.waterUsage.rossing / 1000000,
              this.data.environment.carbonFootprint.rossing / 1000,
              this.data.environment.rehabilitation.completed
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.7)'
          },
          {
            label: 'Husab',
            data: [
              this.data.environment.waterUsage.husab / 1000000,
              this.data.environment.carbonFootprint.husab / 1000,
              this.data.environment.rehabilitation.planned
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => {
                let unit = '';
                if (ctx.datasetIndex === 0) unit = ' million m³';
                if (ctx.datasetIndex === 1) unit = ' kton CO₂';
                if (ctx.datasetIndex === 2) unit = ' hectares';
                return `${ctx.dataset.label}: ${ctx.raw}${unit}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Value' }
          }
        }
      }
    };
  }

  updateCharts() {
    const mineFilter = document.getElementById('mine-filter')?.value || 'all';
    const yearFilter = document.getElementById('year-filter')?.value || 'all';
    const metricFilter = document.getElementById('metric-filter')?.value || 'production';

    // Update production chart if it exists
    if (this.charts.production) {
      const filteredData = this.data.mines.filter(mine => 
        mineFilter === 'all' || mine.id === mineFilter
      );
      
      this.charts.production.data.datasets = filteredData.map(mine => ({
        label: mine.name,
        data: yearFilter === 'all' 
          ? mine.production 
          : [mine.production[this.data.production.years.indexOf(parseInt(yearFilter))]],
        backgroundColor: mine.color,
        borderColor: mine.borderColor,
        borderWidth: 1
      }));
      
      this.charts.production.data.labels = yearFilter === 'all' 
        ? this.data.production.years 
        : [yearFilter];
      
      this.charts.production.update();
    }

    // Show/hide charts based on metric filter
    const chartContainers = {
      production: document.getElementById('productionChart')?.closest('.chart-container'),
      employment: document.getElementById('employmentChart')?.closest('.chart-container'),
      exports: document.getElementById('exportChart')?.closest('.chart-container'),
      environment: document.getElementById('environmentChart')?.closest('.chart-container')
    };

    Object.entries(chartContainers).forEach(([key, container]) => {
      if (container) {
        container.style.display = key === metricFilter ? 'block' : 'none';
      }
    });
  }

  initMineMap() {
    const mapElement = document.getElementById('mineMap');
    if (!mapElement) return;

    const map = L.map('mineMap').setView([-22.5, 17], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    this.data.mines.forEach(mine => {
      const marker = L.marker([mine.coordinates.lat, mine.coordinates.lng])
       .addTo(map)
       .bindPopup(`
         <strong>${mine.name}</strong><br>
         Current Production: ${mine.production.slice(-1)[0]}t/yr<br>
         Employees: ${this.data.employment.total.slice(-1)[0]}
       `);
       
      if (mineFilter.value === 'all' || mineFilter.value === mine.id) {
        marker.addTo(map);
      }
    });
  }

  initNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    container.innerHTML = this.data.news.map(news => `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm news-card">
          <div class="card-body">
            <span class="badge bg-primary-subtle text-primary mb-2">${news.category}</span>
            <h4 class="h5">${news.title}</h4>
            <p class="small text-muted mb-2">${news.date}</p>
            <p class="card-text">${news.summary}</p>
          </div>
          <div class="card-footer bg-transparent border-0">
            <a href="#" class="btn btn-sm btn-outline-primary">Read More</a>
          </div>
        </div>
      </div>
    `).join('');
  }

  initUI() {
    // Back to top button
    const backToTopBtn = document.querySelector('.btn-back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
      });
      
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

    // Chart export buttons
    document.querySelectorAll('.chart-export').forEach(btn => {
      btn.addEventListener('click', function() {
        const chartId = this.getAttribute('data-chart');
        const chart = this.charts[chartId];
        if (chart) {
          const url = chart.toBase64Image();
          const a = document.createElement('a');
          a.href = url;
          a.download = `${chartId}_${new Date().toISOString().slice(0,10)}.png`;
          a.click();
        }
      }.bind(this));
    });
  }

  initBenchmarking() {
    const container = document.getElementById('benchmarking-container');
    if (!container) return;

    // Compare with global averages
    const globalAvgProduction = 3200; // Example global average
    const namibiaProduction = this.data.metrics.find(m => m.title.includes('Production')).value.replace(/\D/g, '');
    
    container.innerHTML = `
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm mb-4 benchmark-card">
            <div class="card-body">
              <h3 class="h5">Global Benchmarking</h3>
              <div class="progress mb-3">
                <div class="progress-bar bg-success" role="progressbar" 
                     style="width: ${(namibiaProduction/globalAvgProduction)*100}%" 
                     aria-valuenow="${namibiaProduction}" 
                     aria-valuemin="0" 
                     aria-valuemax="${globalAvgProduction}">
                  Namibia: ${parseInt(namibiaProduction).toLocaleString()} t/yr
                </div>
                <div class="progress-bar bg-secondary" 
                     style="width: ${100-(namibiaProduction/globalAvgProduction)*100}%">
                  Global Avg: ${globalAvgProduction.toLocaleString()} t/yr
                </div>
              </div>
              <p class="small text-muted">Namibia produces ${Math.round((namibiaProduction/globalAvgProduction)*100)}% of global average uranium output</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initDataPolling() {
    setInterval(async () => {
      try {
        const response = await fetch('assets/data/charts.json?t=' + Date.now());
        const freshData = await response.json();
        this.data = freshData;
        this.updateCharts();
        this.showToast('Data refreshed successfully');
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 300000); // 5 minutes
  }

  initPDFExport() {
    document.getElementById('export-pdf')?.addEventListener('click', async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Namibia Uranium Dashboard Report', 15, 15);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 25);
      
      // Add charts
      let yPosition = 35;
      const chartIds = ['productionChart', 'employmentChart', 'exportChart', 'environmentChart'];
      
      for (const chartId of chartIds) {
        const chart = this.charts[chartId];
        if (chart) {
          const imgData = chart.toBase64Image();
          doc.addImage(imgData, 'JPEG', 15, yPosition, 180, 80);
          yPosition += 90;
        }
      }
      
      // Save the PDF
      doc.save(`Namibia_Uranium_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    });
  }

  initViewToggles() {
      const toggleButtons = document.querySelectorAll('[data-view]');
      if (!toggleButtons.length) return;
      
      toggleButtons.forEach(btn => {
          btn.addEventListener('click', () => {
              toggleButtons.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              
              if (btn.dataset.view === 'table') {
                  this.showDataTables();
              } else {
                  document.getElementById('data-table-container').classList.add('d-none');
                  document.querySelectorAll('.chart-container').forEach(c => c.classList.remove('d-none'));
              }
          });
      });
  }

  showDataTables() {
    const container = document.getElementById('data-table-container');
    container.innerHTML = '';
    container.classList.remove('d-none');
    document.querySelectorAll('.chart-container').forEach(c => c.classList.add('d-none'));
    
    // Generate tables for each data type
    const tables = {
      'Production Data': this.generateProductionTable(),
      'Employment Data': this.generateEmploymentTable(),
      'Export Data': this.generateExportTable(),
      'Environmental Data': this.generateEnvironmentTable()
    };
    
    Object.entries(tables).forEach(([title, table]) => {
      const card = document.createElement('div');
      card.className = 'card border-0 shadow-sm mb-4';
      card.innerHTML = `
        <div class="card-header bg-white">
          <h4 class="h6 mb-0">${title}</h4>
        </div>
        <div class="card-body p-0">
          ${table}
        </div>
      `;
      container.appendChild(card);
    });
  }

  generateProductionTable() {
    let table = '<table class="table table-striped data-table">';
    table += '<thead><tr><th>Year</th>';
    
    this.data.mines.forEach(mine => {
      table += `<th>${mine.name}</th>`;
    });
    
    table += '</tr></thead><tbody>';
    
    this.data.production.years.forEach((year, i) => {
      table += `<tr><td>${year}</td>`;
      this.data.mines.forEach(mine => {
        table += `<td>${mine.production[i].toLocaleString()}</td>`;
      });
      table += '</tr>';
    });
    
    table += '</tbody></table>';
    return table;
  }

  generateEmploymentTable() {
    let table = '<table class="table table-striped data-table">';
    table += '<thead><tr><th>Year</th><th>Total Employees</th></tr></thead><tbody>';
    
    this.data.employment.years.forEach((year, i) => {
      table += `<tr><td>${year}</td><td>${this.data.employment.total[i].toLocaleString()}</td></tr>`;
    });
    
    table += '</tbody></table>';
    return table;
  }

  generateExportTable() {
    let table = '<table class="table table-striped data-table">';
    table += '<thead><tr><th>Destination</th><th>Percentage</th></tr></thead><tbody>';
    
    this.data.exports.destinations.forEach(dest => {
      table += `<tr><td>${dest.country}</td><td>${dest.percentage}%</td></tr>`;
    });
    
    table += '</tbody></table>';
    return table;
  }

  generateEnvironmentTable() {
    let table = '<table class="table table-striped data-table">';
    table += '<thead><tr><th>Metric</th><th>Rössing</th><th>Husab</th></tr></thead><tbody>';
    
    // Water Usage
    table += `<tr>
      <td>Water Usage (million m³)</td>
      <td>${(this.data.environment.waterUsage.rossing / 1000000).toLocaleString()}</td>
      <td>${(this.data.environment.waterUsage.husab / 1000000).toLocaleString()}</td>
    </tr>`;
    
    // Carbon Footprint
    table += `<tr>
      <td>Carbon Footprint (kton CO₂)</td>
      <td>${(this.data.environment.carbonFootprint.rossing / 1000).toLocaleString()}</td>
      <td>${(this.data.environment.carbonFootprint.husab / 1000).toLocaleString()}</td>
    </tr>`;
    
    // Land Rehabilitation
    table += `<tr>
      <td>Land Rehabilitated (hectares)</td>
      <td>${this.data.environment.rehabilitation.completed.toLocaleString()}</td>
      <td>${this.data.environment.rehabilitation.planned.toLocaleString()}</td>
    </tr>`;
    
    table += '</tbody></table>';
    return table;
  }

  initUserPreferences() {
    // Preference toggles
    const prefContainer = document.createElement('div');
    prefContainer.className = 'position-fixed bottom-0 start-0 m-3 z-index-9999';
    prefContainer.innerHTML = `
      <div id="prefs-panel" class="card shadow-lg d-none" style="width: 250px;">
        <div class="card-header bg-dark text-white">
          <h6 class="mb-0">Dashboard Preferences</h6>
        </div>
        <div class="card-body">
          <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" id="darkModeToggle">
            <label class="form-check-label" for="darkModeToggle">Dark Mode</label>
          </div>
          <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" id="animationToggle" checked>
            <label class="form-check-label" for="animationToggle">Animations</label>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="metricUnitsToggle">
            <label class="form-check-label" for="metricUnitsToggle">Metric Units</label>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(prefContainer);

    // Toggle preferences panel
    document.getElementById('prefs-toggle').addEventListener('click', () => {
      document.getElementById('prefs-panel').classList.toggle('d-none');
    });

    // Load saved preferences
    const prefs = JSON.parse(localStorage.getItem('dashboardPrefs')) || {};
    if (prefs.darkMode) document.body.classList.add('dark-mode');
    
    // Set initial toggle states
    document.getElementById('darkModeToggle').checked = prefs.darkMode || false;
    document.getElementById('animationToggle').checked = prefs.animations !== false;
    document.getElementById('metricUnitsToggle').checked = prefs.metricUnits || false;
    
    // Save preferences
    document.querySelectorAll('#prefs-panel input').forEach(input => {
      input.addEventListener('change', () => {
        const prefs = {
          darkMode: document.getElementById('darkModeToggle').checked,
          animations: document.getElementById('animationToggle').checked,
          metricUnits: document.getElementById('metricUnitsToggle').checked
        };
        localStorage.setItem('dashboardPrefs', JSON.stringify(prefs));
        this.applyPreferences(prefs);
      });
    });
  }

  applyPreferences(prefs) {
    // Dark mode
    document.body.classList.toggle('dark-mode', prefs.darkMode);
    
    // Animations
    document.documentElement.style.setProperty(
      '--animation-speed', 
      prefs.animations ? '0.3s' : '0s'
    );
    
    // Metric units
    if (this.charts.production) {
      const unit = prefs.metricUnits ? 't' : 'lbs';
      const conversion = prefs.metricUnits ? 1 : 2204.62;
      
      this.charts.production.options.scales.y.ticks.callback = value => 
        `${(value * conversion).toLocaleString()}${unit}`;
      this.charts.production.update();
    }
  }

  initDataStories() {
    const storySteps = [
      {
        title: "Namibia's Uranium Dominance",
        content: "Namibia is the world's 2nd largest uranium producer, contributing 10% of global supply",
        highlight: "#metrics-container",
        chart: "productionChart"
      },
      {
        title: "Key Production Sites",
        content: "The country's four major mines have distinct production profiles and histories",
        highlight: "#mine-filter",
        chart: "productionChart"
      },
      {
        title: "Employment Impact",
        content: "The sector provides over 4,200 direct jobs, with 85% being Namibian citizens",
        highlight: "#employmentChart",
        chart: "employmentChart"
      },
      {
        title: "Export Markets",
        content: "China receives 42% of Namibia's uranium exports, followed by the EU (28%) and USA (20%)",
        highlight: "#exportChart",
        chart: "exportChart"
      }
    ];

    const storyContainer = document.createElement('div');
    storyContainer.className = 'position-fixed bottom-0 end-0 m-3 z-index-9999 d-none';
    storyContainer.id = 'story-container';
    storyContainer.innerHTML = `
      <div class="card shadow-lg" style="width: 300px;">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Data Story</h5>
        </div>
        <div class="card-body">
          <h6 id="story-title"></h6>
          <p id="story-content" class="small"></p>
          <div class="d-flex justify-content-between">
            <button id="prev-story" class="btn btn-sm btn-outline-primary">Previous</button>
            <button id="next-story" class="btn btn-sm btn-primary">Next</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(storyContainer);

    document.getElementById('start-tour')?.addEventListener('click', () => {
      storyContainer.classList.remove('d-none');
      this.showStoryStep(0, storySteps);
    });

    document.getElementById('prev-story')?.addEventListener('click', () => {
      const currentStep = parseInt(storyContainer.dataset.currentStep || '0');
      this.showStoryStep(Math.max(currentStep - 1, 0), storySteps);
    });

    document.getElementById('next-story')?.addEventListener('click', () => {
      const currentStep = parseInt(storyContainer.dataset.currentStep || '0');
      this.showStoryStep(Math.min(currentStep + 1, storySteps.length - 1), storySteps);
    });
  }

  showStoryStep(step, storySteps) {
    const container = document.getElementById('story-container');
    container.dataset.currentStep = step;
    
    document.getElementById('story-title').textContent = storySteps[step].title;
    document.getElementById('story-content').textContent = storySteps[step].content;
    
    // Highlight relevant elements
    document.querySelectorAll('.highlight-story').forEach(el => 
      el.classList.remove('highlight-story'));
    document.querySelector(storySteps[step].highlight)?.classList.add('highlight-story');
    
    // Bring chart into view
    if (storySteps[step].chart) {
      document.getElementById(storySteps[step].chart)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  enhanceAccessibility() {
    // Add ARIA labels to charts
    document.querySelectorAll('canvas').forEach(canvas => {
      const title = canvas.closest('.card')?.querySelector('.card-header h3')?.textContent;
      if (title) {
        canvas.setAttribute('aria-label', title);
        canvas.setAttribute('role', 'img');
      }
    });

    // Keyboard navigation for filters
    document.querySelectorAll('.form-select').forEach(select => {
      select.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          select.dispatchEvent(new Event('change'));
        }
      });
    });

    // Ensure all interactive elements have focus states
    document.querySelectorAll('button, [tabindex="0"]').forEach(el => {
      el.style.outline = 'none';
      el.addEventListener('focus', () => {
        el.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.5)';
      });
      el.addEventListener('blur', () => {
        el.style.boxShadow = '';
      });
    });
  }

  showError(message) {
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'alert alert-danger position-fixed top-0 start-0 m-3';
    errorDisplay.style.zIndex = '9999';
    errorDisplay.textContent = message;
    document.body.appendChild(errorDisplay);
    
    setTimeout(() => {
      errorDisplay.remove();
    }, 5000);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    const toastContainer = document.querySelector('.toast-container') || document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    new bootstrap.Toast(toast, { autohide: true, delay: 3000 }).show();
  }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new NamibiaUraniumDashboard();
});