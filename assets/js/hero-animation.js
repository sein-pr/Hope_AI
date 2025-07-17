document.addEventListener("DOMContentLoaded", function() {
    const slogans = [
        "Explore Namibia's uranium geology, mining methods, and data in one interactive platform.",
        "Uncover the depths of Namibia's rich uranium landscape.",
        "Simulate mining decisions and understand their environmental impact.",
        "Visualize key trends in uranium production and export.",
        "Bridging the knowledge gap in Namibia's uranium sector."
    ];

    const sloganElement = document.getElementById("heroSlogan");
    const heroTitleElement = document.getElementById("heroTitle");
    let currentSloganIndex = 0;

    function updateSlogan() {
        sloganElement.classList.add("fade-out");
        setTimeout(() => {
            currentSloganIndex = (currentSloganIndex + 1) % slogans.length;
            sloganElement.textContent = slogans[currentSloganIndex];
            sloganElement.classList.remove("fade-out");
            sloganElement.classList.add("fade-in");
            setTimeout(() => {
                sloganElement.classList.remove("fade-in");
            }, 500); // Duration of fade-in
        }, 500); // Duration of fade-out
    }

    // Initial load animation for title and slogan
    if (heroTitleElement) {
        heroTitleElement.classList.add("fade-in-up");
    }
    if (sloganElement) {
        sloganElement.classList.add("fade-in");
        setTimeout(() => {
            sloganElement.classList.remove("fade-in");
        }, 1000); // Duration of initial fade-in
    }

    // Cycle slogans every 7 seconds
    setInterval(updateSlogan, 7000);
});