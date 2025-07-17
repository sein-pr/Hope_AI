// Load the navbar and activate the current page
document.addEventListener("DOMContentLoaded", function () {
  fetch("components/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-placeholder").innerHTML = data;

      // Highlight the active page
      const page = document.body.className;
      if (page.includes("active-home")) {
        document.querySelector(".home-link")?.classList.add("active");
      } else if (page.includes("active-map")) {
        document.querySelector(".map-link")?.classList.add("active");
      } else if (page.includes("active-learn")) {
        document.querySelector(".learn-link")?.classList.add("active");
      } else if (page.includes("active-simulate")) {
        document.querySelector(".simulate-link")?.classList.add("active");
      } else if (page.includes("active-dashboard")) {
        document.querySelector(".dashboard-link")?.classList.add("active");
      } else if (page.includes("active-contact")) {
        document.querySelector(".contact-link")?.classList.add("active");
      }
    });
});
