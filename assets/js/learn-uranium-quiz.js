document.addEventListener('DOMContentLoaded', () => {
    const correctAnswers = {
        question1: 'B', // Atomic number of Uranium, corresponding to data-value="B" in HTML
        question2: 'Erongo', // Region with uranium deposits
        question3: 'steam' // Word for drag-and-drop question
    };

    const questionContainers = [
        document.getElementById('question1'),
        document.getElementById('question2'),
        document.getElementById('question3')
    ].filter(Boolean);

    let currentQuestionIndex = 0;
    let score = 0;
    let q2TimerInterval; // Declare outside to manage consistently

    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const closeQuizOffcanvasBtn = document.getElementById('closeQuizOffcanvas');
    const quizResultsDiv = document.getElementById('quizResults');
    const scoreDisplaySpan = document.getElementById('scoreDisplay');
    const quizOffcanvas = document.getElementById('quizOffcanvas');

    // Helper to display feedback
    function showFeedback(questionElement, isCorrect, message) {
        const feedbackDiv = questionElement.querySelector('.feedback');
        if (feedbackDiv) {
            feedbackDiv.textContent = message;
            feedbackDiv.style.color = isCorrect ? 'green' : 'red';
        }
    }

    // --- Event Handlers (defined at a consistent scope) ---

    // Handler for Question 1 (Clickable Cards)
    function handleOptionClick(event) {
        const clickedOption = event.currentTarget;
        const currentContainer = clickedOption.closest('.quiz-question');
        const options = currentContainer.querySelectorAll('.quiz-option-card');

        options.forEach(opt => opt.classList.remove('selected'));
        clickedOption.classList.add('selected');
        currentContainer.dataset.selectedValue = clickedOption.dataset.value; // Store selected value
    }

    // Handler for Question 2 (Timed Bubbles)
    function handleBubbleClick(event) {
        const clickedBubble = event.currentTarget;
        const currentContainer = clickedBubble.closest('.quiz-question');
        const bubbles = currentContainer.querySelectorAll('.bubble');
        const timerDisplay = currentContainer.querySelector('#q2_timer');

        if (timerDisplay && parseInt(timerDisplay.textContent) > 0) { // Only allow selection if timer is running
            bubbles.forEach(b => b.classList.remove('selected'));
            clickedBubble.classList.add('selected');
            clearInterval(q2TimerInterval); // Stop timer on selection
            checkAnswer(currentContainer.id); // Check answer immediately
        }
    }

    // Handlers for Question 3 (Drag and Drop)
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.word);
        e.target.classList.add('dragging');
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); // Allow drop
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const dropTarget = e.currentTarget;
        const currentContainer = dropTarget.closest('.quiz-question');
        dropTarget.classList.remove('drag-over');
        const data = e.dataTransfer.getData('text/plain');

        const draggables = currentContainer.querySelectorAll('.draggable-word');
        const droppedDraggable = Array.from(draggables).find(d => d.dataset.word === data);

        if (droppedDraggable) {
            dropTarget.textContent = droppedDraggable.dataset.word;
            droppedDraggable.style.display = 'none'; // Hide the draggable once dropped
            dropTarget.dataset.droppedValue = droppedDraggable.dataset.word; // Store for checking
            checkAnswer(currentContainer.id); // Check answer immediately after drop
        }
    }

    // Handler for "Check Answer" buttons
    function handleCheckAnswerClick(event) {
        const questionId = event.target.closest('.quiz-question').id;
        checkAnswer(questionId);
    }

    // Handler for "Next Question" button
    function handleNextQuestionClick() {
        const currentContainer = questionContainers[currentQuestionIndex];
        const currentCheckBtn = currentContainer.querySelector('.check-answer-btn');
        if (currentCheckBtn) {
            currentCheckBtn.style.display = 'none';
        }
        showFeedback(currentContainer, false, ''); // Clear feedback on current question

        currentQuestionIndex++;

        if (currentQuestionIndex < questionContainers.length) {
            currentContainer.style.display = 'none';
            const nextContainer = questionContainers[currentQuestionIndex];
            nextContainer.style.display = 'block';

            // Re-initialize setup for the next question
            initializeQuestion(nextContainer);

            const nextCheckBtn = nextContainer.querySelector('.check-answer-btn');
            if (nextCheckBtn) {
                nextCheckBtn.style.display = 'inline-block';
            } else {
                if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
            }
        } else {
            // Show completion message
            questionContainers.forEach(container => {
                if (container) container.style.display = 'none';
            });
            if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
            if (quizResultsDiv && scoreDisplaySpan) {
                quizResultsDiv.style.display = 'block';
                scoreDisplaySpan.textContent = `${score} / ${questionContainers.length}`;
            }
        }
    }

    // Handler for "Close Quiz" button
    function handleCloseQuizClick() {
        // Reset quiz state to initial for a fresh start next time it's opened
        currentQuestionIndex = 0;
        score = 0;
        clearInterval(q2TimerInterval); // Clear any running timer for Q2

        if (quizResultsDiv) {
            quizResultsDiv.style.display = 'none';
        }

        questionContainers.forEach((container, index) => {
            if (container) {
                container.style.display = (index === 0) ? 'block' : 'none'; // Show only the first question
                showFeedback(container, false, ''); // Clear all feedback
                initializeQuestion(container); // Re-initialize each question to reset its state
            }
        });

        // Ensure next button is hidden for the first question initially
        if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
        // Ensure check answer button is visible for the first question
        const firstCheckBtn = questionContainers[0].querySelector('.check-answer-btn');
        if (firstCheckBtn) {
            firstCheckBtn.style.display = 'inline-block';
        }
    }

    // --- Quiz Setup Functions ---

    function setupClickableCards(container) {
        const options = container.querySelectorAll('.quiz-option-card');
        options.forEach(option => {
            option.removeEventListener('click', handleOptionClick); // Clean up old listeners
            option.classList.remove('selected', 'correct', 'incorrect');
            option.style.pointerEvents = 'auto'; // Re-enable clicks
            option.addEventListener('click', handleOptionClick);
        });
        delete container.dataset.selectedValue; // Clear previous selection
    }

    function setupTimedBubbleQuiz(container) {
        const bubbles = container.querySelectorAll('.bubble');
        const timerDisplay = container.querySelector('#q2_timer');
        let timeLeft = 10;

        clearInterval(q2TimerInterval); // Clear any existing timer
        if (timerDisplay) {
            timerDisplay.textContent = timeLeft;
        }

        bubbles.forEach(bubble => {
            bubble.removeEventListener('click', handleBubbleClick);
            bubble.classList.remove('selected', 'correct', 'incorrect');
            bubble.style.pointerEvents = 'auto';
            bubble.addEventListener('click', handleBubbleClick);
        });

        q2TimerInterval = setInterval(() => {
            timeLeft--;
            if (timerDisplay) {
                timerDisplay.textContent = timeLeft;
            }
            if (timeLeft <= 0) {
                clearInterval(q2TimerInterval);
                bubbles.forEach(bubble => bubble.style.pointerEvents = 'none'); // Disable clicks
                checkAnswer(container.id); // Auto-check if time runs out
            }
        }, 1000);
    }

    function setupDragAndDrop(container) {
        const draggables = container.querySelectorAll('.draggable-word');
        const dropTarget = container.querySelector('.drop-target');

        if (dropTarget) {
            dropTarget.removeEventListener('dragover', handleDragOver);
            dropTarget.removeEventListener('dragleave', handleDragLeave);
            dropTarget.removeEventListener('drop', handleDrop);

            dropTarget.textContent = 'Drop word here';
            dropTarget.classList.remove('correct', 'incorrect');
            dropTarget.style.pointerEvents = 'auto';
            delete dropTarget.dataset.droppedValue;

            dropTarget.addEventListener('dragover', handleDragOver);
            dropTarget.addEventListener('dragleave', handleDragLeave);
            dropTarget.addEventListener('drop', handleDrop);
        }

        draggables.forEach(draggable => {
            draggable.removeEventListener('dragstart', handleDragStart);
            draggable.removeEventListener('dragend', handleDragEnd);

            draggable.style.display = 'block'; // Show all draggables
            draggable.setAttribute('draggable', 'true');
            draggable.classList.remove('dragged', 'correct', 'incorrect');

            draggable.addEventListener('dragstart', handleDragStart);
            draggable.addEventListener('dragend', handleDragEnd);
        });
    }

    // --- General Answer Checking and Initialization ---

    function checkAnswer(questionId) {
        const currentContainer = document.getElementById(questionId);
        const correctAnswer = correctAnswers[questionId];
        let userAnswer = null;
        let isCorrect = false;

        showFeedback(currentContainer, false, ''); // Clear previous feedback

        if (questionId === 'question1') {
            userAnswer = currentContainer.dataset.selectedValue;
            if (!userAnswer) {
                showFeedback(currentContainer, false, 'Please select an answer.');
                return;
            }
            isCorrect = (userAnswer === correctAnswer);
            const selectedOption = currentContainer.querySelector('.quiz-option-card.selected');
            if (selectedOption) {
                selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');
                currentContainer.querySelectorAll('.quiz-option-card').forEach(opt => opt.style.pointerEvents = 'none');
            }
        } else if (questionId === 'question2') {
            const selectedBubble = currentContainer.querySelector('.bubble.selected');
            if (selectedBubble) {
                userAnswer = selectedBubble.dataset.value;
                isCorrect = (userAnswer === correctAnswer);
                clearInterval(q2TimerInterval);
                selectedBubble.classList.add(isCorrect ? 'correct' : 'incorrect');
                currentContainer.querySelectorAll('.bubble').forEach(bubble => bubble.style.pointerEvents = 'none');
            } else {
                showFeedback(currentContainer, false, 'Time ran out! No answer selected.');
                isCorrect = false;
                currentContainer.querySelectorAll('.bubble').forEach(bubble => bubble.style.pointerEvents = 'none');
            }
            // Highlight the correct answer if incorrect or time ran out
            if (!isCorrect) {
                const correctBubble = Array.from(currentContainer.querySelectorAll('.bubble')).find(b => b.dataset.value === correctAnswer);
                if (correctBubble) {
                    correctBubble.classList.add('correct');
                }
            }
        } else if (questionId === 'question3') {
            const dropTarget = currentContainer.querySelector('.drop-target');
            userAnswer = dropTarget.dataset.droppedValue;
            if (!userAnswer) {
                showFeedback(currentContainer, false, 'Please drop a word into the drop zone.');
                return;
            }
            isCorrect = (userAnswer === correctAnswer);
            dropTarget.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (!isCorrect) {
                const correctDraggable = Array.from(currentContainer.querySelectorAll('.draggable-word')).find(d => d.dataset.word === correctAnswer);
                if (correctDraggable) {
                    correctDraggable.style.display = 'block';
                    correctDraggable.classList.add('correct');
                }
            }
            currentContainer.querySelectorAll('.draggable-word').forEach(d => d.setAttribute('draggable', 'false'));
            dropTarget.style.pointerEvents = 'none';
        }

        if (isCorrect) {
            score++;
            showFeedback(currentContainer, true, 'Correct! 🎉');
            if (questionId !== 'question2') { // Q2 auto-advances
                if (nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
                const checkBtn = currentContainer.querySelector('.check-answer-btn');
                if (checkBtn) checkBtn.style.display = 'none';
            } else { // For Q2, always show next button after check, even if incorrect
                 if (nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
            }
        } else {
            showFeedback(currentContainer, false, 'Incorrect. Please review the material and try again. 🧠');
            // For Q1 and Q3, allow retries until correct. Q2 moves on after timer or selection.
            if (questionId === 'question2') {
                 if (nextQuestionBtn) nextQuestionBtn.style.display = 'inline-block';
            }
        }
    }

    // Function to initialize (or re-initialize) a specific question
    function initializeQuestion(container) {
        if (!container) return; // Guard clause

        showFeedback(container, false, ''); // Clear feedback

        if (container.id === 'question1') {
            setupClickableCards(container);
            const checkBtn = container.querySelector('.check-answer-btn');
            if (checkBtn) checkBtn.style.display = 'inline-block'; // Ensure check button visible
        } else if (container.id === 'question2') {
            setupTimedBubbleQuiz(container);
            // Q2 has no direct check answer button, relies on timer/click
            if (nextQuestionBtn) nextQuestionBtn.style.display = 'none'; // Hide next until answered
        } else if (container.id === 'question3') {
            setupDragAndDrop(container);
            const checkBtn = container.querySelector('.check-answer-btn');
            if (checkBtn) checkBtn.style.display = 'inline-block'; // Ensure check button visible
        }
    }

    // --- Initial Setup and Event Listener Attachments ---

    // Hide all questions except the first one initially
    questionContainers.forEach((container, index) => {
        if (container) {
            container.style.display = (index === 0) ? 'block' : 'none';
        }
    });

    // Attach click handlers to individual 'Check Answer' buttons using event delegation or direct selection
    document.querySelectorAll('.check-answer-btn').forEach(button => {
        button.addEventListener('click', handleCheckAnswerClick);
    });

    // Attach handlers for global buttons
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', handleNextQuestionClick);
        nextQuestionBtn.style.display = 'none'; // Initially hide next button
    }
    if (closeQuizOffcanvasBtn) {
        closeQuizOffcanvasBtn.addEventListener('click', handleCloseQuizClick);
    }

    // When the offcanvas is shown, initialize the current question (first one on first open)
    quizOffcanvas.addEventListener('shown.bs.offcanvas', () => {
        initializeQuestion(questionContainers[currentQuestionIndex]);
    });

    // Initial setup for the first question when the page loads
    if (questionContainers[0]) {
        initializeQuestion(questionContainers[0]);
    }
});