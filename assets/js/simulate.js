document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("simulation-form");
  const resultsContainer = document.getElementById("results-container");
  const costEl = document.getElementById("cost");
  const impactEl = document.getElementById("impact");
  const scoreEl = document.getElementById("score");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const site = document.getElementById("site").value;
    const method = document.getElementById("method").value;

    if (!site || !method) return;

    const data = getSimulationResults(site, method);

    costEl.textContent = data.cost;
    impactEl.textContent = data.impact;
    scoreEl.textContent = `${data.score} / 100`;

    // Reveal results with animation
    resultsContainer.classList.remove("d-none");

    // Scroll to results smoothly
    resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });

    // Render Chart
    renderComparisonChart();
  });

  function getSimulationResults(site, method) {
    // In the future, you can customize based on site too
    switch (method) {
      case "open-pit":
        return {
          cost: "$120 million",
          impact: "High – Land disruption, water usage",
          score: 65,
        };
      case "in-situ":
        return {
          cost: "$85 million",
          impact: "Low – Minimal surface disruption",
          score: 78,
        };
      case "heap-leach":
        return {
          cost: "$95 million",
          impact: "Medium – Requires chemical handling",
          score: 72,
        };
      default:
        return {
          cost: "N/A",
          impact: "Unknown",
          score: 0,
        };
    }
  }

  function renderComparisonChart() {
    const ctx = document.getElementById("comparisonChart").getContext("2d");

    if (window.simChart) {
      window.simChart.destroy();
    }

    window.simChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Open-Pit", "In-Situ", "Heap Leaching"],
        datasets: [
          {
            label: "Estimated Cost (Million USD)",
            data: [120, 85, 95],
            backgroundColor: "#6C63FF",
          },
          {
            label: "Environmental Impact Score (Lower is Better)",
            data: [80, 30, 60],
            backgroundColor: "#FFB830",
          },
          {
            label: "Suitability Score (out of 100)",
            data: [65, 78, 72],
            backgroundColor: "#43AA8B",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
              precision: 0,
            },
          },
        },
      },
    });
  }
});
