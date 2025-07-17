// assets/js/pages/learn.js

document.addEventListener("DOMContentLoaded", function () {
    const moduleNav = document.getElementById('learn-module-nav');
    const moduleContent = document.getElementById('learn-module-content');

    // Function to fetch content from JSON
    async function fetchEducationalContent() {
        try {
            const response = await fetch('assets/data/educationalContent.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.modules; // Assuming the JSON has a 'modules' array
        } catch (error) {
            console.error("Could not fetch educational content:", error);
            moduleContent.innerHTML = `<div class="alert alert-danger text-center" role="alert">
                                        Failed to load learning content. Please check console for errors.
                                    </div>`;
            return [];
        }
    }

    // Function to render navigation and initial content
    async function renderLearnPage() {
        const modules = await fetchEducationalContent();
        if (modules.length === 0) {
            moduleNav.innerHTML = `<div class="p-3 text-center text-muted">No modules found.</div>`;
            return;
        }

        moduleNav.innerHTML = ''; // Clear loading message
        moduleContent.innerHTML = ''; // Clear initial alert

        modules.forEach((module, index) => {
            // Create navigation link for the sidebar
            const navLink = document.createElement('a');
            navLink.href = `#${module.id}`;
            // Set first module as active by default
            navLink.className = `list-group-item list-group-item-action ${index === 0 ? 'active' : ''}`;
            navLink.setAttribute('data-bs-toggle', 'tab'); // Bootstrap tab attribute
            navLink.setAttribute('role', 'tab');
            navLink.setAttribute('aria-controls', module.id);
            navLink.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            navLink.textContent = module.title;
            moduleNav.appendChild(navLink);

            // Create content pane for each module
            const contentPane = document.createElement('div');
            // Set first content pane as active by default
            contentPane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
            contentPane.id = module.id;
            contentPane.setAttribute('role', 'tabpanel');
            contentPane.setAttribute('aria-labelledby', `${module.id}-tab`);

            // Add module title and description
            contentPane.innerHTML = `
                <h2>${module.title}</h2>
                <p>${module.description}</p>
            `;

            // Build sub-sections using Bootstrap Accordion
            if (module.sections && module.sections.length > 0) {
                const accordionContainer = document.createElement('div');
                accordionContainer.className = 'accordion';
                accordionContainer.id = `accordion-${module.id}`; // Unique ID for each module's accordion

                module.sections.forEach((section, secIndex) => {
                    const accordionItem = document.createElement('div');
                    accordionItem.className = 'accordion-item';

                    // Determine if accordion section should be open by default
                    const isFirstSection = secIndex === 0;

                    accordionItem.innerHTML = `
                        <h3 class="accordion-header" id="heading${module.id}${secIndex}">
                            <button class="accordion-button ${isFirstSection ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${module.id}${secIndex}" aria-expanded="${isFirstSection ? 'true' : 'false'}" aria-controls="collapse${module.id}${secIndex}">
                                ${section.title}
                            </button>
                        </h3>
                        <div id="collapse${module.id}${secIndex}" class="accordion-collapse collapse ${isFirstSection ? 'show' : ''}" aria-labelledby="heading${module.id}${secIndex}" data-bs-parent="#accordion-${module.id}">
                            <div class="accordion-body">
                                ${section.content.map(p => `<p>${p}</p>`).join('')}
                                ${section.image ? `<img src="${section.image.src}" alt="${section.image.alt}" class="img-fluid my-3">` : ''}
                                ${section.video ? `
                                    <div class="video-container my-3">
                                        <iframe src="${section.video.src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                    </div>
                                ` : ''}
                                ${section.list ? `<ul>${section.list.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
                                ${section.facts ? `
                                    <div class="alert alert-info mt-3" role="alert">
                                        <strong>Quick Facts:</strong>
                                        <ul>
                                            ${section.facts.map(fact => `<li>${fact}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                ${section.learnMore ? `<a href="${section.learnMore.url}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">${section.learnMore.text} <i class="fas fa-external-link-alt ms-1"></i></a>` : ''}
                            </div>
                        </div>
                    `;
                    accordionContainer.appendChild(accordionItem);
                });
                contentPane.appendChild(accordionContainer);
            }

            moduleContent.appendChild(contentPane);
        });

        // Handle URL hash to open specific module on direct link
        if (window.location.hash) {
            const hash = window.location.hash.substring(1); // Remove '#'
            const targetNavLink = moduleNav.querySelector(`a[href="#${hash}"]`);
            if (targetNavLink) {
                new bootstrap.Tab(targetNavLink).show();
                // Optionally scroll to the top of the content pane
                document.getElementById(hash).scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
             // Activate the first tab by default if no hash is present
            const firstNavLink = moduleNav.querySelector('.list-group-item');
            if (firstNavLink) {
                new bootstrap.Tab(firstNavLink).show();
            }
        }
    }

    renderLearnPage();
});

// The following section is for including navbar/footer.
// It should ideally be in a separate utility JS file (like include-navbar.js already is)
// but duplicated here for completeness to make this learn.js runnable if dropped alone.
// Ensure these scripts are linked AFTER bootstrap.bundle.min.js in your HTML.

document.addEventListener("DOMContentLoaded", function () {
    // Load Navbar (as per include-navbar.js logic)
    fetch("components/navbar.html")
        .then(response => response.text())
        .then(data => {
            const navbarPlaceholder = document.getElementById("navbar-placeholder");
            if (navbarPlaceholder) {
                navbarPlaceholder.innerHTML = data;
                // Highlight the active page based on body class
                const pageClass = document.body.className;
                document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
                    // Check if link's href matches the current page's active class
                    if (link.href.includes('index.html') && pageClass.includes('active-home')) link.classList.add('active');
                    else if (link.href.includes('map.html') && pageClass.includes('active-map')) link.classList.add('active');
                    else if (link.href.includes('learn.html') && pageClass.includes('active-learn')) link.classList.add('active');
                    else if (link.href.includes('simulate.html') && pageClass.includes('active-simulate')) link.classList.add('active');
                    else if (link.href.includes('dashboard.html') && pageClass.includes('active-dashboard')) link.classList.add('active');
                    else if (link.href.includes('contact.html') && pageClass.includes('active-contact')) link.classList.add('active');
                });
            }
        })
        .catch(error => console.error("Error loading navbar:", error));


    // Load Footer (needs include-footer.js to be created)
    fetch("components/footer.html")
        .then(response => response.text())
        .then(data => {
            const footerPlaceholder = document.getElementById("footer-placeholder");
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
                const currentYearSpan = document.getElementById('current-year');
                if (currentYearSpan) {
                    currentYearSpan.textContent = new Date().getFullYear();
                }
            }
        })
        .catch(error => console.error("Error loading footer:", error));
});