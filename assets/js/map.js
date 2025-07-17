document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map");
  if (!mapContainer)
    return console.error("Map container div with ID 'map' not found.");

  const map = L.map("map", {
    scrollWheelZoom: false
  }).setView([-22.5, 17.0], 6);

  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur', function () { map.scrollWheelZoom.disable(); });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  window.activeHighlight = null;
  let productionData = {}; // Global variable to store parsed production data

  // --- START Production Data Loading ---
  fetch("assets/data/Production.csv") // Assuming your CSV is named production.csv
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase()); // Normalize headers

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        let mineNameFromCSV = row.mine.trim();
        let normalizedMineName;

        // Use a direct mapping for CSV names to GeoJSON names to ensure consistency
        switch (mineNameFromCSV.toLowerCase()) {
            case "rössing":
            case "rossing":
                normalizedMineName = "Rössing Uranium Mine";
                break;
            case "langer heinrich":
                normalizedMineName = "Langer Heinrich Uranium Mine";
                break;
            case "husab":
                normalizedMineName = "Husab Uranium Mine";
                break;
            case "trekkopje":
                normalizedMineName = "Trekkopje Mine"; // CORRECTED: Based on your trekkopje.geojson screenshot!
                break;
            case "valencia":
                normalizedMineName = "Valencia";
                break;
            default:
                normalizedMineName = mineNameFromCSV;
                console.warn(`Unexpected or unmapped mine name in CSV: "${mineNameFromCSV}". Using as-is. Please check GeoJSON name.`);
        }

        // Exclude 'Total' data (and any other non-mine rows) from individual mine charts
        if (normalizedMineName.toLowerCase() === "total" || normalizedMineName === "") {
            continue;
        }

        if (!productionData[normalizedMineName]) {
          productionData[normalizedMineName] = [];
        }
        productionData[normalizedMineName].push(row);
      }
      console.log("Production Data Loaded (Normalized):", productionData);
    })
    .catch(error => console.error("Error loading production.csv:", error));
  // --- END Production Data Loading ---


  const geojsonFiles = [
    "assets/data/rossing.geojson",
    "assets/data/heinrich.geojson",
    "assets/data/husab.geojson",
    "assets/data/trekkopje.geojson",
    "assets/data/valencia.geojson"
  ];

  const operatingMines = L.featureGroup();
  const careMaintenanceMines = L.featureGroup();
  const developmentMines = L.featureGroup();
  const allMines = L.featureGroup();

  const baseLayers = {
    "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  };

  const overlayLayers = {
    "All Mines": allMines,
    "Operating Mines": operatingMines,
    "Care & Maintenance": careMaintenanceMines,
    "Exploration/Development": developmentMines
  };

  baseLayers["OpenStreetMap"].addTo(map);
  allMines.addTo(map);
  L.control.layers(baseLayers, overlayLayers, { collapsed: false }).addTo(map);


  geojsonFiles.forEach((filePath) => {
    fetch(filePath)
      .then((response) => response.json())
      .then((geojson) => {
        const feature = geojson.features[0];
        const coords = feature.geometry.coordinates[0];
        const latLng = [coords[0][1], coords[0][0]];

        const props = feature.properties || {};
        const name = props.name || "Unnamed Mine"; // This is the GeoJSON name
        const operator = props.operator || "Unknown";
        const status = (props.status || "operating").toLowerCase();

        const resource = props.resource || "Not Specified";
        const startDate = props.start_date || "Not Specified";
        const landuse = props.landuse || "Not Specified";
        const miningMethodRaw = props.man_made || "Not Specified";
        const miningMethod = miningMethodRaw.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const imageUrl = props.image || ''; // Main image for basic popup

        // NEW: Properties for expanded panel
        const mineImages = props.images || []; // Array of {url: string, caption: string}
        const detailedMiningMethod = props.detailed_mining_method || 'Information on mining method not available.';
        const typesOfOres = props.types_of_ores || 'Information on types of ores not available.';


        const color =
          status.includes("maintenance") ? "orange" :
          status.includes("development") ? "blue" : "green";

        let iconClass = 'fas fa-map-marker-alt';
        if (status.includes("operating")) {
            iconClass = 'fas fa-industry';
        } else if (status.includes("maintenance")) {
            iconClass = 'fas fa-tools';
        } else if (status.includes("development") || status.includes("exploration")) {
            iconClass = 'fas fa-flask';
        }

        const icon = L.divIcon({
          className: 'custom-label-icon',
          html: `
            <div class="marker-label-container">
              <i class="${iconClass}" style="color: ${color}; font-size: 24px;"></i><br>
              <div class="marker-label-text">${name}</div>
            </div>
          `,
          iconSize: [100, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        });

        const marker = L.marker(latLng, { icon });

        if (status.includes("operating")) {
            operatingMines.addLayer(marker);
        } else if (status.includes("maintenance")) {
            careMaintenanceMines.addLayer(marker);
        } else if (status.includes("development") || status.includes("exploration")) {
            developmentMines.addLayer(marker);
        }
        allMines.addLayer(marker);

        // --- SIMPLIFIED popupContent (NO internal expanded div) ---
        let popupContent = `
          <div class="mine-popup">
            <h5>${name}</h5>
            ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="img-fluid mb-2 rounded" style="max-width: 150px; height: auto;">` : ''}
            <p><strong>Status:</strong> ${props.status || "Unknown"}</p>
            <p><strong>Operator:</strong> ${operator}</p>
            <p><strong>Resource:</strong> ${resource}</p>
            <p><strong>Start Date:</strong> ${startDate}</p>
            <p><strong>Land Use:</strong> ${landuse}</p>
            <p><strong>Mining Method:</strong> ${miningMethod}</p>
            <div class="chart-container">
              <canvas id="mineChart_${name.replace(/\s+/g, '_').replace(/[\(\)]/g, '')}"></canvas>
            </div>
            <div class="popup-btn-container d-flex justify-content-between align-items-center mt-2" style="gap: 0.5rem;">
              <a href="learn.html" class="btn btn-sm btn-info flex-fill">Learn More</a>
              <button class="btn btn-sm btn-primary expand-details-btn flex-fill" data-mine-name="${name}">Explore Details</button>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, {
            maxWidth: 300, // Keep basic popup smaller
            minWidth: 150
        });

        // Store mine data directly on the marker for easy access in Offcanvas
        marker.mineData = {
            name: name,
            operator: operator,
            status: props.status || "Unknown",
            resource: resource,
            startDate: startDate,
            landuse: landuse,
            miningMethod: miningMethod,
            imageUrl: imageUrl,
            mineImages: mineImages, // Array of {url, caption}
            detailedMiningMethod: detailedMiningMethod,
            typesOfOres: typesOfOres,
            productionData: productionData[name] // Pass relevant production data
        };


        // --- Handle popup opening for interactions ---
        marker.on('popupopen', function (e) {
            const currentMarker = this; // 'this' refers to the marker
            const currentMineData = currentMarker.mineData;
            const popupElement = e.popup.getElement(); // This is the .leaflet-popup-content-wrapper
            
            const expandButton = popupElement.querySelector('.expand-details-btn');
            
            expandButton.onclick = function() {
                // Close the Leaflet popup
                currentMarker.closePopup();

                // Get Bootstrap Offcanvas instance
                const offcanvasElement = document.getElementById('mineOffcanvas');
                // Check if the offcanvas instance already exists
                let offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (!offcanvas) {
                    offcanvas = new bootstrap.Offcanvas(offcanvasElement);
                }
                
                // Populate Offcanvas with current mine data
                const offcanvasTitle = offcanvasElement.querySelector('.offcanvas-title');
                const offcanvasContentWrapper = offcanvasElement.querySelector('.offcanvas-content-wrapper');
                const imageGalleryView = offcanvasContentWrapper.querySelector('.image-gallery-view');
                const detailedInfoView = offcanvasContentWrapper.querySelector('.detailed-info-view');
                const toggleInfoButton = offcanvasElement.querySelector('.toggle-offcanvas-view');

                offcanvasTitle.textContent = `${currentMineData.name} Details`;

                // Populate image gallery
                imageGalleryView.innerHTML = currentMineData.mineImages.length > 0 ? 
                    currentMineData.mineImages.map(img => `
                        <img src="${img.url}" alt="${img.caption}" class="img-fluid mb-2 rounded">
                        ${img.caption ? `<p class="image-caption">${img.caption}</p>` : ''}
                    `).join('')
                    : '<p>No additional images available for this mine.</p>';
                
                // Populate detailed info
                detailedInfoView.innerHTML = `
                    <p><strong>Detailed Mining Method:</strong> ${currentMineData.detailedMiningMethod}</p>
                    <p><strong>Types of Ores Extracted:</strong> ${currentMineData.typesOfOres}</p>
                    <p>Reminder Prince to add "detailed_mining_method", "types_of_ores", and "images" properties to your GeoJSON files for comprehensive information.</p>
                `;

                // Reset view to image gallery
                imageGalleryView.style.display = 'block';
                detailedInfoView.style.display = 'none';
                toggleInfoButton.innerHTML = '<i class="fas fa-info-circle"></i> View Info';

                // Toggle info button logic for Offcanvas
                toggleInfoButton.onclick = function() {
                    if (imageGalleryView.style.display === 'none') {
                        imageGalleryView.style.display = 'block';
                        detailedInfoView.style.display = 'none';
                        this.innerHTML = '<i class="fas fa-info-circle"></i> View Info';
                    } else {
                        imageGalleryView.style.display = 'none';
                        detailedInfoView.style.display = 'block';
                        this.innerHTML = '<i class="fas fa-image"></i> View Images';
                    }
                };

                // Show the Offcanvas
                offcanvas.show();
            };

            // --- Chart.js rendering on popupopen (with setTimeout fix) ---
            const mineNameForLookup = currentMineData.name;
            const mineProductionData = currentMineData.productionData; // Use the stored production data
            
            if (mineProductionData && mineProductionData.length > 0) {
              setTimeout(() => {
                  const canvasId = `mineChart_${mineNameForLookup.replace(/\s+/g, '_').replace(/[\(\)]/g, '')}`;
                  const ctx = document.getElementById(canvasId);

                  if (ctx) {
                      // Destroy existing chart if it exists to prevent multiple charts on same canvas
                      if (window.myMineCharts && window.myMineCharts[canvasId]) {
                          window.myMineCharts[canvasId].destroy();
                      }
                      const years = mineProductionData.map(d => parseInt(d.year));
                      const production = mineProductionData.map(d => parseFloat(d.tonnes_u));

                      window.myMineCharts = window.myMineCharts || {};
                      window.myMineCharts[canvasId] = new Chart(ctx, {
                          type: 'bar',
                          data: {
                              labels: years,
                              datasets: [{
                                  label: 'Uranium Production (Tonnes U)',
                                  data: production,
                                  backgroundColor: 'rgba(179, 92, 39, 0.7)',
                                  borderColor: 'rgba(179, 92, 39, 1)',
                                  borderWidth: 1
                              }]
                          },
                          options: {
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                  title: {
                                      display: true,
                                      text: 'Annual Uranium Production'
                                  },
                                  legend: {
                                      display: false
                                  }
                              },
                              scales: {
                                  y: {
                                      beginAtZero: true,
                                      title: {
                                          display: true,
                                          text: 'Tonnes U'
                                      }
                                  },
                                  x: {
                                      title: {
                                          display: true,
                                          text: 'Year'
                                  }
                              }
                          }
                      }
                  });
              } else {
                  console.error(`Error: Canvas element '${canvasId}' not found in the DOM for ${mineNameForLookup}.`);
              }
          }, 50); // 50ms delay
        } else {
          console.warn(`No production data found for mine: ${mineNameForLookup}. Chart will not be displayed.`);
        }
      });
      // --- END OF popupopen handler ---
      

        marker.on("click", () => {
          if (window.activeHighlight) {
            map.removeLayer(window.activeHighlight);
          }

          const polygon = L.geoJSON(feature.geometry, {
            style: {
              color: color,
              weight: 2,
              fillOpacity: 0.3,
              className: "flash-highlight"
            }
          }).addTo(map);

          map.flyToBounds(polygon.getBounds(), {
            padding: [20, 20],
            duration: 1.5
          });

          const el = polygon.getLayers()[0]?.getElement?.();
          if (el) {
            el.classList.add("highlight-animate");
            setTimeout(() => el.classList.remove("highlight-animate"), 1000);
          }

          window.activeHighlight = polygon;
        });
      })
      .catch((err) => console.error(`Failed to load ${filePath}:`, err));
  });

  // Reset button
  const resetBtn = L.control({ position: "topright" });
  resetBtn.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
    div.innerHTML = '<button id="reset-map" title="Reset View">🔄</button>';
    div.style.backgroundColor = "white";
    div.style.padding = "4px";
    div.style.cursor = "pointer";
    return div;
  };
  resetBtn.addTo(map);

  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "reset-map") {
      map.setView([-22.5, 17.0], 6);
      if (window.activeHighlight) {
        map.removeLayer(window.activeHighlight);
        window.activeHighlight = null;
      }
    }
  });

  // Legend
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.innerHTML += "<h6>Mine Status</h6>";
    div.innerHTML += '<i class="fas fa-industry" style="color: green;"></i> Operating<br>';
    div.innerHTML += '<i class="fas fa-tools" style="color: orange;"></i> Care & Maintenance<br>';
    div.innerHTML += '<i class="fas fa-flask" style="color: blue;"></i> Exploration/Development<br>';
    return div;
  };
  legend.addTo(map);
});