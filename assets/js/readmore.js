document.addEventListener("DOMContentLoaded", () => {
    // --- Global Variables and DOM Elements ---
    const moduleTitleElem = document.getElementById("module-title");
    const moduleDescriptionElem = document.getElementById("module-description");
    const moduleContentSectionsContainer = document.getElementById("module-content-sections");
    const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
    const quizSectionTitleElem = document.getElementById("quiz-section-title");
    const currentQuestionNumElem = document.getElementById("current-question-num");
    const totalQuestionsNumElem = document.getElementById("total-questions-num");
    const quizOverallProgressBar = document.getElementById("quiz-overall-progress");
    const quizQuestionContainer = document.getElementById("quiz-question-container");
    const quizFeedbackElem = document.getElementById("quiz-feedback");
    const quizScoreElem = document.getElementById("quiz-score");
    const nextQuestionBtn = document.getElementById("nextQuestionBtn");
    const continueLearningBtn = document.getElementById("continueLearningBtn");
    const closeQuizModalBtn = document.getElementById("closeQuizModalBtn");

    let currentModule = null;
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let correctAnswersCount = 0;
    let quizTotalScore = 0; // Max 100 for the entire quiz
    let quizQuestionsAttempted = 0; // To track progress for overall quiz bar

    // --- Data Structure for Learning Modules and Quizzes ---
    // This is the core data that drives the content and quizzes.
    // In a real application, this might be fetched from a JSON file or a backend API.
    const learningModulesData = [
        {
            id: "uranium-geology",
            title: "Uranium Geology: Formation & Deposits",
            description: "Dive deep into how uranium is naturally formed, where it's found in Namibia, and the geological processes involved.",
            sections: [
                {
                    title: "What is Uranium?",
                    type: "text",
                    content: `Uranium is a naturally occurring radioactive element, a heavy metal that can be used as an abundant source of concentrated energy. It's found in small amounts in most rocks, soil, and water. Its most common isotope, Uranium-238, is not fissile but can be converted into plutonium-239, which is fissile. Uranium-235 is the only naturally occurring fissile isotope, meaning it can sustain a nuclear chain reaction.`
                },
                {
                    title: "Formation of Uranium Deposits",
                    type: "text",
                    content: `Uranium deposits form through various geological processes. The most common types are unconformity-related, sandstone-hosted, and vein-type deposits. These formations often involve the movement of uranium-rich fluids through permeable rock, where uranium precipitates out due to changes in chemical conditions (e.g., redox fronts).`
                },
                {
                    title: "Uranium in Namibia: Key Geological Settings",
                    type: "image",
                    content: "assets/img/uranium_rock.jpg", // Placeholder image
                    caption: "Typical uranium-bearing rock sample from Namibia."
                },
                {
                    title: "Major Deposit Types in Namibia",
                    type: "text",
                    content: `Namibia is renowned for its large uranium deposits, primarily found in the Central Namib Desert. The two most significant types are alaskite-hosted deposits (like Rössing) and surficial calcrete deposits (like Langer Heinrich). Alaskite-hosted deposits are associated with granitic intrusions, while calcrete deposits form in arid environments through groundwater processes.`
                },
                {
                    title: "Understanding Uranium's Role",
                    type: "video",
                    content: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video (Rick Astley)
                    caption: "A brief introduction to uranium's role in energy production."
                }
            ],
            quiz: [
                {
                    type: "mcq",
                    question: "Which isotope of uranium is naturally occurring and fissile?",
                    options: [
                        { text: "Uranium-238", isCorrect: false },
                        { text: "Uranium-235", isCorrect: true },
                        { text: "Plutonium-239", isCorrect: false }
                    ]
                },
                {
                    type: "timed-mcq",
                    question: "Click the correct type of deposit primarily found in the Central Namib Desert.",
                    options: [
                        { text: "Volcanic-hosted", isCorrect: false },
                        { text: "Alaskite-hosted", isCorrect: true },
                        { text: "Sediment-hosted", isCorrect: false }
                    ],
                    correctAnswer: "Alaskite-hosted" // Redundant but useful for canvas logic
                },
                {
                    type: "drag-drop",
                    question: "Complete the sentence: Uranium deposits often form through the movement of uranium-rich ___ through permeable rock.",
                    sentenceParts: [
                        { type: "text", value: "Uranium deposits often form through the movement of uranium-rich " },
                        { type: "slot", value: "fluids" },
                        { type: "text", value: " through permeable rock." }
                    ],
                    draggableWords: ["gases", "solids", "fluids", "minerals"],
                    correctOrder: ["fluids"] // Order of words for slots
                }
            ]
        },
        {
            id: "mining-techniques",
            title: "Uranium Mining Techniques",
            description: "Explore the primary methods used to extract uranium from the earth, including open-pit and in-situ leaching.",
            sections: [
                {
                    title: "Open-Pit Mining",
                    type: "text",
                    content: `Open-pit mining is a surface mining technique used to extract minerals from an open pit or borrow. It's typically used when deposits are relatively shallow and widespread. Large amounts of overburden (waste rock) must be removed to access the ore body. Rössing Uranium Mine in Namibia is a prime example of a large open-pit operation.`
                },
                {
                    title: "How Open-Pit Mining Works",
                    type: "image",
                    content: "assets/img/mining_methods.gif", // Placeholder image
                    caption: "Simplified diagram of an open-pit mining operation."
                },
                {
                    title: "In-Situ Leaching (ISL)",
                    type: "text",
                    content: `In-Situ Leaching (ISL), also known as In-Situ Recovery (ISR), is a mining process used to recover minerals such as uranium through boreholes drilled into the ore body. A lixiviant (a chemical solution, often oxygenated water with bicarbonate or carbonate) is pumped into the ore body to dissolve the uranium, which is then pumped to the surface. This method minimizes surface disturbance.`
                },
                {
                    title: "Advantages and Disadvantages of ISL",
                    type: "text",
                    content: `ISL offers advantages like reduced surface disturbance, lower capital costs, and less waste rock generation. However, it requires permeable ore bodies and careful management of groundwater to prevent contamination. It's often considered more environmentally friendly than open-pit mining, but careful monitoring is essential.`
                },
                {
                    title: "Comparing Mining Methods",
                    type: "video",
                    content: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
                    caption: "A comparison of open-pit and in-situ leaching methods."
                }
            ],
            quiz: [
                {
                    type: "mcq",
                    question: "Which mining method minimizes surface disturbance?",
                    options: [
                        { text: "Open-pit mining", isCorrect: false },
                        { text: "Underground mining", isCorrect: false },
                        { text: "In-Situ Leaching (ISL)", isCorrect: true }
                    ]
                },
                {
                    type: "timed-mcq",
                    question: "Click the example of a large open-pit mine in Namibia.",
                    options: [
                        { text: "Langer Heinrich", isCorrect: false },
                        { text: "Rössing Uranium Mine", isCorrect: true },
                        { text: "Husab Mine", isCorrect: false }
                    ],
                    correctAnswer: "Rössing Uranium Mine"
                },
                {
                    type: "drag-drop",
                    question: "Complete the sentence: In-Situ Leaching uses a chemical solution called a ___ to dissolve uranium.",
                    sentenceParts: [
                        { type: "text", value: "In-Situ Leaching uses a chemical solution called a " },
                        { type: "slot", value: "lixiviant" },
                        { type: "text", value: " to dissolve uranium." }
                    ],
                    draggableWords: ["solvent", "acid", "lixiviant", "catalyst"],
                    correctOrder: ["lixiviant"]
                }
            ]
        },
        {
            id: "environmental-impact",
            title: "Environmental Impact of Uranium Mining",
            description: "Understand the ecological and social implications of uranium extraction and strategies for mitigation and rehabilitation.",
            sections: [
                {
                    title: "Radiation Exposure",
                    type: "text",
                    content: `Uranium mining involves handling radioactive materials, which can pose risks of radiation exposure to workers and nearby communities if not properly managed. Strict safety protocols and monitoring are essential to minimize these risks.`
                },
                {
                    title: "Water Contamination",
                    type: "text",
                    content: `Mining operations can impact water resources through the discharge of contaminated water, acid mine drainage, and the potential for groundwater contamination, especially with methods like ISL if not carefully controlled. Water treatment and management are critical.`
                },
                {
                    title: "Land Disturbance and Rehabilitation",
                    type: "image",
                    content: "assets/img/environmental_concerns.jpg", // Placeholder image
                    caption: "Rehabilitated land after mining operations."
                },
                {
                    title: "Biodiversity and Ecosystem Impact",
                    type: "text",
                    content: `Large-scale mining operations can lead to habitat destruction, fragmentation, and disruption of local ecosystems. Effective environmental impact assessments and biodiversity offset programs are crucial for mitigating these effects.`
                },
                {
                    title: "Mitigation Strategies",
                    type: "text",
                    content: `Mitigation strategies include advanced water treatment, dust suppression, progressive rehabilitation of mined areas, and strict adherence to environmental regulations. Post-mining land use planning is also important to ensure long-term ecological recovery.`
                }
            ],
            quiz: [
                {
                    type: "mcq",
                    question: "Which of these is a primary environmental concern in uranium mining?",
                    options: [
                        { text: "Air pollution from vehicles", isCorrect: false },
                        { text: "Water contamination", isCorrect: true },
                        { text: "Noise pollution", isCorrect: false }
                    ]
                },
                {
                    type: "timed-mcq",
                    question: "Click the term for the process of restoring mined land.",
                    options: [
                        { text: "Excavation", isCorrect: false },
                        { text: "Rehabilitation", isCorrect: true },
                        { text: "Extraction", isCorrect: false }
                    ],
                    correctAnswer: "Rehabilitation"
                },
                {
                    type: "drag-drop",
                    question: "Complete the sentence: Strict safety protocols and ___ are essential to minimize radiation risks.",
                    sentenceParts: [
                        { type: "text", value: "Strict safety protocols and " },
                        { type: "slot", value: "monitoring" },
                        { type: "text", value: " are essential to minimize radiation risks." }
                    ],
                    draggableWords: ["inspection", "monitoring", "training", "audits"],
                    correctOrder: ["monitoring"]
                }
            ]
        }
    ];

    // --- Utility Functions ---

    /**
     * Parses the module ID from the URL query parameters.
     * @returns {string|null} The module ID or null if not found.
     */
    function getModuleIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("module");
    }

    /**
     * Finds a module by its ID from the learningModulesData.
     * @param {string} id - The ID of the module to find.
     * @returns {object|null} The module object or null if not found.
     */
    function findModuleById(id) {
        return learningModulesData.find(module => module.id === id);
    }

    /**
     * Renders the content of the selected learning module.
     * @param {object} module - The module object to render.
     */
    function renderModuleContent(module) {
        moduleTitleElem.textContent = module.title;
        moduleDescriptionElem.textContent = module.description;
        moduleContentSectionsContainer.innerHTML = ''; // Clear previous content

        module.sections.forEach((section, index) => {
            const sectionElem = document.createElement("section");
            sectionElem.className = "module-section container";
            sectionElem.id = `section-${index}`; // Unique ID for IntersectionObserver

            let contentHtml = `<h2>${section.title}</h2>`;
            if (section.type === "text") {
                contentHtml += `<p>${section.content}</p>`;
            } else if (section.type === "image") {
                contentHtml += `<div class="text-center"><img src="${section.content}" alt="${section.caption || section.title}" class="img-fluid">`;
                if (section.caption) {
                    contentHtml += `<p class="text-muted mt-2">${section.caption}</p></div>`;
                }
            } else if (section.type === "video") {
                // For YouTube embeds, use iframe with allowfullscreen
                contentHtml += `<div class="ratio ratio-16x9 mx-auto" style="max-width: 800px;">
                                    <iframe src="${section.content}" title="${section.caption || section.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>`;
                if (section.caption) {
                    contentHtml += `<p class="text-muted mt-2">${section.caption}</p>`;
                }
            }
            sectionElem.innerHTML = contentHtml;
            moduleContentSectionsContainer.appendChild(sectionElem);
        });

        // Initialize IntersectionObserver for scroll-triggered animations and quizzes
        setupIntersectionObserver(module.sections.length);
    }

    // --- Quiz Logic ---

    /**
     * Sets up the Intersection Observer to trigger quizzes after each section.
     * @param {number} totalSections - Total number of content sections.
     */
    function setupIntersectionObserver(totalSections) {
        const sections = document.querySelectorAll(".module-section");
        let lastVisibleSectionIndex = -1;
        let quizTriggeredForSection = new Array(totalSections).fill(false); // Track if quiz was triggered for a section

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionIndex = parseInt(entry.target.id.split('-')[1]);
                if (entry.isIntersecting && entry.intersectionRatio >= 0.8) { // When 80% of section is visible
                    entry.target.classList.add("is-visible");
                    if (sectionIndex > lastVisibleSectionIndex) {
                        lastVisibleSectionIndex = sectionIndex;
                    }
                } else {
                    entry.target.classList.remove("is-visible");
                }
            });

            // Check if the last visible section has a quiz that hasn't been triggered
            if (lastVisibleSectionIndex !== -1 && currentModule.quiz && currentModule.quiz.length > 0) {
                // Trigger quiz after the last content section IF there are quizzes left
                // and if the quiz for this section hasn't been triggered yet.
                if (lastVisibleSectionIndex === totalSections - 1 && !quizTriggeredForSection[lastVisibleSectionIndex]) {
                    if (currentQuestionIndex < currentModule.quiz.length) {
                        quizTriggeredForSection[lastVisibleSectionIndex] = true;
                        startQuiz(currentModule.quiz);
                    }
                }
            }
        }, {
            threshold: 0.8 // Trigger when 80% of the section is visible
        });

        sections.forEach(section => observer.observe(section));
    }

    /**
     * Starts the quiz for the current module.
     * @param {Array} quizQuestions - Array of quiz questions for the module.
     */
    function startQuiz(quizQuestions) {
        currentQuiz = quizQuestions;
        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        quizTotalScore = 0;
        quizQuestionsAttempted = 0;

        quizSectionTitleElem.textContent = currentModule.title; // Set modal title to module title
        totalQuestionsNumElem.textContent = currentQuiz.length;
        updateQuizProgress(); // Initialize progress bar

        renderQuestion();
        quizModal.show();
        // Hide the default close button initially for quizzes
        closeQuizModalBtn.classList.add('d-none');
    }

    /**
     * Renders the current quiz question based on its type.
     */
    function renderQuestion() {
        quizFeedbackElem.classList.add('d-none');
        quizScoreElem.classList.add('d-none');
        nextQuestionBtn.classList.add('d-none');
        continueLearningBtn.classList.add('d-none');
        quizQuestionContainer.innerHTML = ''; // Clear previous question

        if (currentQuestionIndex >= currentQuiz.length) {
            // All questions answered, show final score
            showFinalScore();
            return;
        }

        const question = currentQuiz[currentQuestionIndex];
        currentQuestionNumElem.textContent = currentQuestionIndex + 1;

        const questionHtml = document.createElement('h5');
        questionHtml.className = 'mb-4 fw-bold';
        questionHtml.textContent = question.question;
        quizQuestionContainer.appendChild(questionHtml);

        if (question.type === "mcq") {
            renderMCQ(question);
        } else if (question.type === "timed-mcq") {
            renderTimedMCQ(question);
        } else if (question.type === "drag-drop") {
            renderDragDrop(question);
        }
    }

    /**
     * Renders a Multiple Choice Question.
     * @param {object} question - The MCQ question object.
     */
    function renderMCQ(question) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'mcq-options';

        question.options.forEach(option => {
            const optionCard = document.createElement('div');
            optionCard.className = 'mcq-option-card';
            optionCard.textContent = option.text;
            optionCard.addEventListener('click', () => checkMCQAnswer(optionCard, option.isCorrect));
            optionsContainer.appendChild(optionCard);
        });
        quizQuestionContainer.appendChild(optionsContainer);
    }

    /**
     * Checks the answer for an MCQ question and provides feedback.
     * @param {HTMLElement} selectedOptionCard - The clicked option card.
     * @param {boolean} isCorrect - Whether the selected option is correct.
     */
    function checkMCQAnswer(selectedOptionCard, isCorrect) {
        // Disable all options after selection
        document.querySelectorAll('.mcq-option-card').forEach(card => {
            card.style.pointerEvents = 'none'; // Disable clicks
            if (card !== selectedOptionCard) {
                card.style.opacity = '0.6'; // Dim unselected
            }
        });

        if (isCorrect) {
            selectedOptionCard.classList.add('correct');
            quizFeedbackElem.textContent = "Correct! Well done!";
            quizFeedbackElem.style.color = "#28a745";
            correctAnswersCount++;
        } else {
            selectedOptionCard.classList.add('incorrect');
            quizFeedbackElem.textContent = "Incorrect. Keep learning!";
            quizFeedbackElem.style.color = "#dc3545";
            // Highlight the correct answer if incorrect
            const correctAnswer = currentQuiz[currentQuestionIndex].options.find(opt => opt.isCorrect);
            if (correctAnswer) {
                document.querySelectorAll('.mcq-option-card').forEach(card => {
                    if (card.textContent === correctAnswer.text) {
                        card.classList.add('correct'); // Show correct answer
                    }
                });
            }
        }
        quizFeedbackElem.classList.remove('d-none');
        nextQuestionBtn.classList.remove('d-none');
        quizQuestionsAttempted++;
        updateQuizProgress();
    }

    // --- Timed Multiple Choice (Floating Balls) Logic ---
    let canvas, ctx;
    let balls = [];
    let animationFrameId;
    let timerInterval;
    const TIME_LIMIT = 10; // seconds
    let timeLeft = TIME_LIMIT;
    let timerBar;
    let gameActive = false;

    /**
     * Renders a Timed Multiple Choice question with floating balls on a canvas.
     * @param {object} question - The Timed MCQ question object.
     */
    function renderTimedMCQ(question) {
        quizQuestionContainer.innerHTML = `
            <canvas id="timed-mcq-canvas" width="600" height="300"></canvas>
            <div class="timer-bar-container">
                <div id="timer-bar"></div>
            </div>
        `;
        canvas = document.getElementById('timed-mcq-canvas');
        ctx = canvas.getContext('2d');
        timerBar = document.getElementById('timer-bar');

        // Adjust canvas size for responsiveness (optional, but good practice)
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // Re-initialize balls or adjust positions if resized during game
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas); // Listen for window resize

        initBalls(question.options, question.correctAnswer);
        gameActive = true;
        startTimer();
        animateBalls();

        canvas.addEventListener('click', handleBallClick);
    }

    /**
     * Initializes the floating balls for the timed MCQ.
     * @param {Array} options - Array of answer options.
     * @param {string} correctAnswerText - The text of the correct answer.
     */
    function initBalls(options, correctAnswerText) {
        balls = [];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98']; // Attractive colors
        const minRadius = 40;
        const maxRadius = 60;

        options.forEach((option, index) => {
            let x, y, radius, vx, vy;
            let overlapping;

            // Ensure balls don't overlap initially
            do {
                overlapping = false;
                radius = Math.random() * (maxRadius - minRadius) + minRadius;
                x = Math.random() * (canvas.width - 2 * radius) + radius;
                y = Math.random() * (canvas.height - 2 * radius) + radius;

                for (let i = 0; i < balls.length; i++) {
                    const otherBall = balls[i];
                    const dx = x - otherBall.x;
                    const dy = y - otherBall.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < radius + otherBall.radius + 10) { // Add padding
                        overlapping = true;
                        break;
                    }
                }
            } while (overlapping);

            vx = (Math.random() - 0.5) * 4; // Random velocity
            vy = (Math.random() - 0.5) * 4;

            balls.push({
                x, y, radius, vx, vy,
                color: colors[index % colors.length],
                text: option.text,
                isCorrect: option.text === correctAnswerText
            });
        });
    }

    /**
     * Draws a single ball on the canvas.
     * @param {object} ball - The ball object.
     */
    function drawBall(ball) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = `${ball.radius * 0.4}px Arial`; // Adjust font size based on radius
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.text, ball.x, ball.y);
    }

    /**
     * Updates ball positions and handles collisions.
     */
    function updateBalls() {
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];

            // Update position
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Wall collision
            if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
                ball.vx *= -1;
            }
            if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
                ball.vy *= -1;
            }

            // Ball-to-ball collision (simple elastic collision)
            for (let j = i + 1; j < balls.length; j++) {
                const otherBall = balls[j];
                const dx = otherBall.x - ball.x;
                const dy = otherBall.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < ball.radius + otherBall.radius) {
                    // Collision detected, reverse velocities
                    const normalX = dx / distance;
                    const normalY = dy / distance;

                    const tangentX = -normalY;
                    const tangentY = normalX;

                    const dpNormal1 = ball.vx * normalX + ball.vy * normalY;
                    const dpTangent1 = ball.vx * tangentX + ball.vy * tangentY;
                    const dpNormal2 = otherBall.vx * normalX + otherBall.vy * normalY;
                    const dpTangent2 = otherBall.vx * tangentX + otherBall.vy * tangentY;

                    // For perfectly elastic collision, swap normal velocities
                    ball.vx = dpNormal2 * normalX + dpTangent1 * tangentX;
                    ball.vy = dpNormal2 * normalY + dpTangent1 * tangentY;
                    otherBall.vx = dpNormal1 * normalX + dpTangent2 * tangentX;
                    otherBall.vy = dpNormal1 * normalY + dpTangent2 * tangentY;

                    // Separate balls to prevent sticking
                    const overlap = (ball.radius + otherBall.radius) - distance;
                    ball.x -= overlap * normalX * 0.5;
                    ball.y -= overlap * normalY * 0.5;
                    otherBall.x += overlap * normalX * 0.5;
                    otherBall.y += overlap * normalY * 0.5;
                }
            }
        }
    }

    /**
     * Animation loop for the floating balls.
     */
    function animateBalls() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        updateBalls();
        balls.forEach(drawBall);
        if (gameActive) {
            animationFrameId = requestAnimationFrame(animateBalls);
        }
    }

    /**
     * Starts the countdown timer for the timed MCQ.
     */
    function startTimer() {
        timeLeft = TIME_LIMIT;
        timerBar.style.width = '100%';
        timerBar.style.transition = `width ${TIME_LIMIT}s linear`; // Smooth transition for the entire duration

        // Trigger the width change after a small delay to ensure transition applies
        setTimeout(() => {
            timerBar.style.width = '0%';
        }, 50);

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                gameActive = false;
                cancelAnimationFrame(animationFrameId);
                checkTimedMCQAnswer(null); // Time's up, no selection
            }
        }, 1000);
    }

    /**
     * Handles click events on the canvas for timed MCQ.
     * @param {MouseEvent} event - The click event.
     */
    function handleBallClick(event) {
        if (!gameActive) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        let selectedBall = null;
        for (const ball of balls) {
            const dx = mouseX - ball.x;
            const dy = mouseY - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < ball.radius) {
                selectedBall = ball;
                break;
            }
        }
        if (selectedBall) {
            clearInterval(timerInterval);
            gameActive = false;
            cancelAnimationFrame(animationFrameId);
            checkTimedMCQAnswer(selectedBall);
        }
    }

    /**
     * Checks the answer for a Timed MCQ question and provides feedback.
     * @param {object|null} selectedBall - The selected ball object, or null if time ran out.
     */
    function checkTimedMCQAnswer(selectedBall) {
        // Stop all interactivity
        gameActive = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        canvas.style.pointerEvents = 'none';

        let isCorrect = false;
        if (selectedBall) {
            isCorrect = selectedBall.isCorrect;
            // Highlight selected ball
            selectedBall.color = isCorrect ? '#28a745' : '#dc3545'; // Green/Red
        } else {
            quizFeedbackElem.textContent = "Time's up! No answer selected.";
            quizFeedbackElem.style.color = "#dc3545";
        }

        // Highlight all balls to show correct/incorrect
        balls.forEach(ball => {
            if (ball.isCorrect && !isCorrect) { // If user was incorrect, show the correct one
                ball.color = '#28a745'; // Green
            } else if (!ball.isCorrect && selectedBall && ball !== selectedBall) {
                ball.color = '#777'; // Dim incorrect unselected
            }
        });
        drawAllBalls(); // Redraw with new colors

        if (isCorrect) {
            quizFeedbackElem.textContent = "Correct! Amazing timing!";
            quizFeedbackElem.style.color = "#28a745";
            correctAnswersCount++;
        } else if (selectedBall) {
            quizFeedbackElem.textContent = "Incorrect. Better luck next time!";
            quizFeedbackElem.style.color = "#dc3545";
        }
        quizFeedbackElem.classList.remove('d-none');
        nextQuestionBtn.classList.remove('d-none');
        quizQuestionsAttempted++;
        updateQuizProgress();
    }

    /**
     * Redraws all balls on the canvas.
     */
    function drawAllBalls() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        balls.forEach(drawBall);
    }

    // --- Sentence Matching (Drag and Drop) Logic ---
    let draggedItem = null;

    /**
     * Renders a Drag and Drop sentence matching question.
     * @param {object} question - The Drag and Drop question object.
     */
    function renderDragDrop(question) {
        const container = document.createElement('div');
        container.className = 'sentence-match-container';

        // Render sentence parts with droppable slots
        question.sentenceParts.forEach(part => {
            if (part.type === 'text') {
                const span = document.createElement('span');
                span.className = 'sentence-part';
                span.textContent = part.value;
                container.appendChild(span);
            } else if (part.type === 'slot') {
                const slot = document.createElement('div');
                slot.className = 'droppable-slot';
                slot.dataset.correctValue = part.value; // Store correct answer
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('dragleave', handleDragLeave);
                slot.addEventListener('drop', handleDrop);
                container.appendChild(slot);
            }
        });
        quizQuestionContainer.appendChild(container);

        // Render draggable words
        const draggableWordsContainer = document.createElement('div');
        draggableWordsContainer.className = 'd-flex flex-wrap justify-content-center gap-3 mt-4';
        question.draggableWords.forEach(word => {
            const draggable = document.createElement('div');
            draggable.className = 'draggable-word';
            draggable.textContent = word;
            draggable.setAttribute('draggable', 'true');
            draggable.addEventListener('dragstart', handleDragStart);
            draggableWordsContainer.appendChild(draggable);
        });
        quizQuestionContainer.appendChild(draggableWordsContainer);
    }

    /**
     * Handles the start of a drag operation.
     * @param {DragEvent} event - The dragstart event.
     */
    function handleDragStart(event) {
        draggedItem = event.target;
        event.dataTransfer.setData('text/plain', event.target.textContent); // Set data for transfer
        setTimeout(() => event.target.classList.add('d-none'), 0); // Hide dragged item
    }

    /**
     * Handles the dragover event for droppable slots.
     * @param {DragEvent} event - The dragover event.
     */
    function handleDragOver(event) {
        event.preventDefault(); // Allow drop
        event.target.classList.add('drag-over');
    }

    /**
     * Handles the dragleave event for droppable slots.
     * @param {DragEvent} event - The dragleave event.
     */
    function handleDragLeave(event) {
        event.target.classList.remove('drag-over');
    }

    /**
     * Handles the drop event for droppable slots.
     * @param {DragEvent} event - The drop event.
     */
    function handleDrop(event) {
        event.preventDefault();
        event.target.classList.remove('drag-over');

        if (event.target.classList.contains('droppable-slot')) {
            const droppedWord = event.dataTransfer.getData('text/plain');
            const correctValue = event.target.dataset.correctValue;

            // Only allow dropping if the slot is empty
            if (event.target.children.length === 0) {
                event.target.textContent = droppedWord;
                draggedItem.remove(); // Remove the original draggable item

                // Check if the dropped word is correct
                if (droppedWord === correctValue) {
                    event.target.classList.add('correct-drop');
                    event.target.style.pointerEvents = 'none'; // Lock correct slot
                } else {
                    event.target.classList.add('incorrect-drop');
                    // Optionally, allow user to try again or remove the incorrect word
                }
            }
        }
        checkDragDropCompletion();
    }

    /**
     * Checks if all drag-and-drop slots are filled and provides feedback.
     */
    function checkDragDropCompletion() {
        const slots = document.querySelectorAll('.droppable-slot');
        let allFilled = true;
        let allCorrect = true;

        slots.forEach(slot => {
            if (slot.textContent.trim() === '') {
                allFilled = false;
            } else {
                if (slot.textContent.trim() !== slot.dataset.correctValue) {
                    allCorrect = false;
                }
            }
        });

        if (allFilled) {
            // Disable all drag/drop functionality
            document.querySelectorAll('.draggable-word').forEach(el => el.setAttribute('draggable', 'false'));
            slots.forEach(slot => {
                slot.removeEventListener('dragover', handleDragOver);
                slot.removeEventListener('dragleave', handleDragLeave);
                slot.removeEventListener('drop', handleDrop);
                slot.style.pointerEvents = 'none'; // Disable dropping
            });

            if (allCorrect) {
                quizFeedbackElem.textContent = "Perfect! Sentence completed correctly!";
                quizFeedbackElem.style.color = "#28a745";
                correctAnswersCount++;
            } else {
                quizFeedbackElem.textContent = "Not quite right. Review the sentence!";
                quizFeedbackElem.style.color = "#dc3545";
                // Optionally show correct answers
                slots.forEach(slot => {
                    if (slot.textContent.trim() !== slot.dataset.correctValue) {
                        slot.textContent = slot.dataset.correctValue; // Show correct answer
                        slot.classList.remove('incorrect-drop');
                        slot.classList.add('correct-drop');
                    }
                });
            }
            quizFeedbackElem.classList.remove('d-none');
            nextQuestionBtn.classList.remove('d-none');
            quizQuestionsAttempted++;
            updateQuizProgress();
        }
    }

    // --- Quiz Progression and Scoring ---

    /**
     * Updates the overall quiz progress bar.
     */
    function updateQuizProgress() {
        const progress = (quizQuestionsAttempted / currentQuiz.length) * 100;
        quizOverallProgressBar.style.width = `${progress}%`;
        quizOverallProgressBar.setAttribute('aria-valuenow', progress);
    }

    /**
     * Shows the final score after all questions are answered.
     */
    function showFinalScore() {
        const scorePercentage = Math.round((correctAnswersCount / currentQuiz.length) * 100);
        quizScoreElem.textContent = `You scored ${scorePercentage}%!`;
        quizScoreElem.style.color = scorePercentage >= 70 ? "#28a745" : "#dc3545"; // Green for good score, red for low
        quizScoreElem.classList.remove('d-none');
        continueLearningBtn.classList.remove('d-none');
        // Re-enable the default close button
        closeQuizModalBtn.classList.remove('d-none');
    }

    // --- Event Listeners for Quiz Navigation ---
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        renderQuestion();
    });

    continueLearningBtn.addEventListener('click', () => {
        quizModal.hide();
        // Reset quiz state (optional, but good for next time)
        currentQuiz = null;
        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        quizTotalScore = 0;
        quizQuestionsAttempted = 0;
        // Optionally scroll to the next section or enable more content
    });

    closeQuizModalBtn.addEventListener('click', () => {
        // If the user closes the modal prematurely, stop any ongoing quiz timers/animations
        if (gameActive) {
            clearInterval(timerInterval);
            cancelAnimationFrame(animationFrameId);
            gameActive = false;
        }
        quizModal.hide();
    });


    // --- Initialization ---
    // Get the module ID from the URL and render the content.
    const moduleId = getModuleIdFromUrl();
    if (moduleId) {
        currentModule = findModuleById(moduleId);
        if (currentModule) {
            renderModuleContent(currentModule);
        } else {
            moduleContentSectionsContainer.innerHTML = `<p class="text-center text-danger">Module not found!</p>`;
            moduleTitleElem.textContent = "Error";
            moduleDescriptionElem.textContent = "The requested learning module could not be found.";
        }
    } else {
        moduleContentSectionsContainer.innerHTML = `<p class="text-center text-info">Please select a module from the <a href="learn.html">Learn</a> page.</p>`;
        moduleTitleElem.textContent = "Welcome to Learn More";
        moduleDescriptionElem.textContent = "Select a topic to begin your journey.";
    }
});
