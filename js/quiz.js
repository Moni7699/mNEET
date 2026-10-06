// ==========================================
// mNEET - QUIZ SYSTEM
// ==========================================

let quizQuestions = [];
let currentQuestion = 0;

let selectedAnswer = null;
let answerSubmitted = false;

let questionTimer = 60;
let totalSeconds = 0;

let questionTimerInterval = null;
let totalTimerInterval = null;

let quizStarted = false;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    auth.onAuthStateChanged(function (user) {

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        loadQuiz();

    });

});


// ==========================================
// LOAD QUIZ
// ==========================================

function loadQuiz() {

    const courseId =
        localStorage.getItem("quizCourse") ||
        localStorage.getItem("activeCourse");

    const chapterId =
        localStorage.getItem("quizChapter") ||
        localStorage.getItem("activeChapter");

    const topicId =
        localStorage.getItem("quizTopic") ||
        localStorage.getItem("activeTopic");


    if (!courseId || !chapterId || !topicId) {

        showQuizError("Quiz information is missing.");

        return;
    }


    localStorage.setItem("quizCourse", courseId);
    localStorage.setItem("quizChapter", chapterId);
    localStorage.setItem("quizTopic", topicId);


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("quizzes")
        .get()

        .then(function (snapshot) {

            quizQuestions = [];

            snapshot.forEach(function (doc) {

                const data = doc.data();

                quizQuestions.push({
                    id: doc.id,
                    ...data
                });

            });


            // যদি quizzes না থাকে, singular quiz check করবে
            if (quizQuestions.length === 0) {

                return db.collection("courses")
                    .doc(courseId)
                    .collection("chapters")
                    .doc(chapterId)
                    .collection("topics")
                    .doc(topicId)
                    .collection("quiz")
                    .get();

            }


            return null;

        })

        .then(function (secondSnapshot) {

            if (
                quizQuestions.length === 0 &&
                secondSnapshot
            ) {

                secondSnapshot.forEach(function (doc) {

                    const data = doc.data();

                    quizQuestions.push({
                        id: doc.id,
                        ...data
                    });

                });

            }


            if (quizQuestions.length === 0) {

                showQuizError(
                    "No quiz questions found for this topic."
                );

                return;
            }


            startQuiz();

        })

        .catch(function (error) {

            console.error(
                "Quiz loading error:",
                error
            );

            showQuizError(
                "Unable to load quiz. Please check Firebase data."
            );

        });

}


// ==========================================
// START QUIZ
// ==========================================

function startQuiz() {

    quizStarted = true;

    currentQuestion = 0;

    totalSeconds = 0;


    clearAllTimers();


    startTotalTimer();

    renderQuestion();

}


// ==========================================
// RENDER QUESTION
// ==========================================

function renderQuestion() {

    if (!quizQuestions.length) {
        return;
    }


    selectedAnswer = null;

    answerSubmitted = false;


    const question =
        quizQuestions[currentQuestion];


    questionTimer = 60;


    updateQuestionTimer();


    clearInterval(questionTimerInterval);


    questionTimerInterval =
        setInterval(function () {

            questionTimer--;

            updateQuestionTimer();


            if (questionTimer <= 0) {

                clearInterval(
                    questionTimerInterval
                );

                autoSubmitAnswer();

            }

        }, 1000);


    const counter =
        document.getElementById(
            "questionCounter"
        );


    if (counter) {

        counter.textContent =
            (currentQuestion + 1) +
            " / " +
            quizQuestions.length;

    }


    const progress =
        document.getElementById(
            "progressFill"
        );


    if (progress) {

        const percent =
            (
                (currentQuestion + 1) /
                quizQuestions.length
            ) * 100;

        progress.style.width =
            percent + "%";

    }


    const title =
        document.getElementById(
            "quizTitle"
        );


    if (title) {

        title.textContent =
            question.title ||
            question.quizTitle ||
            "NEET Biology Quiz";

    }


    const container =
        document.getElementById(
            "quizContainer"
        );


    if (!container) {
        return;
    }


    const questionText =
        question.question ||
        question.questionText ||
        question.text ||
        "";


    const questionImage =
        question.image ||
        question.questionImage ||
        question.imageUrl ||
        "";


    const options = [

        question.option1 || "",
        question.option2 || "",
        question.option3 || "",
        question.option4 || ""

    ];


    let imageHTML = "";

    if (questionImage) {

        imageHTML = `
            <img
                class="question-image"
                src="${escapeHTML(questionImage)}"
                alt="Question"
            >
        `;

    }


    let optionsHTML = "";


    options.forEach(function (option, index) {

        if (!option) {
            return;
        }


        optionsHTML += `

            <button
                type="button"
                class="option"
                data-index="${index}"
                onclick="selectAnswer(${index})"
            >

                <span class="option-letter">
                    ${index + 1}
                </span>

                <span class="option-text">
                    ${escapeHTML(option)}
                </span>

            </button>

        `;

    });


    container.innerHTML = `

        <div class="question-card">

            <p class="question-text">
                ${escapeHTML(questionText)}
            </p>

            ${imageHTML}

            <div class="options">
                ${optionsHTML}
            </div>


            <div
                id="answerStatus"
                class="answer-status"
            ></div>


            <div
                id="solutionBox"
                class="solution-box"
            >

                <div class="solution-title">
                    💡 Solution
                </div>

                <div
                    id="solutionText"
                    class="solution-text"
                ></div>

                <div
                    id="referenceText"
                    class="reference-text"
                ></div>

            </div>


            <button
                id="submitAnswerButton"
                class="submit-answer-button"
                onclick="submitAnswer()"
            >
                Submit Answer
            </button>


            <div class="quiz-actions">

                <button
                    class="quiz-button previous-button"
                    onclick="previousQuestion()"
                    ${currentQuestion === 0 ? "disabled" : ""}
                >
                    ← Previous
                </button>


                <button
                    class="quiz-button next-button"
                    onclick="nextQuestion()"
                >
                    ${
                        currentQuestion === quizQuestions.length - 1
                        ? "Finish"
                        : "Next →"
                    }
                </button>

            </div>


            <button
                class="submit-quiz-button"
                onclick="submitQuiz()"
            >
                Submit Quiz
            </button>

        </div>

    `;

}


// ==========================================
// SELECT ANSWER
// ==========================================

function selectAnswer(index) {

    if (answerSubmitted) {
        return;
    }


    selectedAnswer = index;


    const options =
        document.querySelectorAll(".option");


    options.forEach(function (button, i) {

        button.classList.remove(
            "selected"
        );


        if (i === index) {

            button.classList.add(
                "selected"
            );

        }

    });

}


// ==========================================
// SUBMIT ANSWER
// ==========================================

function submitAnswer() {

    if (answerSubmitted) {
        return;
    }


    if (selectedAnswer === null) {

        alert(
            "Please select an answer first."
        );

        return;
    }


    answerSubmitted = true;


    clearInterval(
        questionTimerInterval
    );


    const question =
        quizQuestions[currentQuestion];


    const correctIndex =
        getCorrectAnswerIndex(
            question
        );


    const options =
        document.querySelectorAll(
            ".option"
        );


    options.forEach(function (button, index) {

        button.classList.add(
            "disabled"
        );


        if (index === correctIndex) {

            button.classList.add(
                "correct"
            );

        }


        if (
            index === selectedAnswer &&
            index !== correctIndex
        ) {

            button.classList.add(
                "wrong"
            );

        }

    });


    const status =
        document.getElementById(
            "answerStatus"
        );


    if (status) {

        status.className =
            "answer-status show";


        if (
            selectedAnswer ===
            correctIndex
        ) {

            status.classList.add(
                "correct-status"
            );

            status.textContent =
                "✅ Correct answer!";

        } else {

            status.classList.add(
                "wrong-status"
            );

            status.textContent =
                "❌ Incorrect. Correct answer is option " +
                (correctIndex + 1) +
                ".";

        }

    }


    showSolution(
        question
    );


    const submitButton =
        document.getElementById(
            "submitAnswerButton"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Answer Submitted";

    }

}


// ==========================================
// AUTO SUBMIT
// ==========================================

function autoSubmitAnswer() {

    if (answerSubmitted) {
        return;
    }


    if (selectedAnswer === null) {

        selectedAnswer = -1;

    }


    answerSubmitted = true;


    const question =
        quizQuestions[currentQuestion];


    const correctIndex =
        getCorrectAnswerIndex(
            question
        );


    const options =
        document.querySelectorAll(
            ".option"
        );


    options.forEach(function (button, index) {

        button.classList.add(
            "disabled"
        );


        if (index === correctIndex) {

            button.classList.add(
                "correct"
            );

        }

    });


    const status =
        document.getElementById(
            "answerStatus"
        );


    if (status) {

        status.className =
            "answer-status show wrong-status";

        status.textContent =
            "⏰ Time finished.";

    }


    showSolution(question);

}


// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    if (
        currentQuestion <
        quizQuestions.length - 1
    ) {

        currentQuestion++;

        renderQuestion();

    } else {

        submitQuiz();

    }

}


// ==========================================
// PREVIOUS QUESTION
// ==========================================

function previousQuestion() {

    if (currentQuestion <= 0) {
        return;
    }


    currentQuestion--;

    renderQuestion();

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

function submitQuiz() {

    if (!quizQuestions.length) {
        return;
    }


    clearAllTimers();


    let correct = 0;
    let incorrect = 0;
    let skipped = 0;


    /*
       Important:
       This version calculates the final result
       from the answers selected/submitted
       during the quiz.
    */


    quizQuestions.forEach(function (question) {

        const selected =
            question._selectedAnswer;


        const submitted =
            question._answerSubmitted;


        if (!submitted) {

            skipped++;

            return;

        }


        const correctIndex =
            getCorrectAnswerIndex(
                question
            );


        if (
            selected !== null &&
            selected !== undefined &&
            selected !== -1
        ) {

            if (
                Number(selected) ===
                Number(correctIndex)
            ) {

                correct++;

            } else {

                incorrect++;

            }

        } else {

            skipped++;

        }

    });


    /*
       Current question may not have been stored
       by older state, so store it now.
    */

    const current =
        quizQuestions[currentQuestion];


    if (
        current &&
        answerSubmitted
    ) {

        current._selectedAnswer =
            selectedAnswer;

        current._answerSubmitted =
            true;

    }


    // Recalculate after current question
    correct = 0;
    incorrect = 0;
    skipped = 0;


    quizQuestions.forEach(function (question) {

        if (!question._answerSubmitted) {

            skipped++;

            return;

        }


        const selected =
            question._selectedAnswer;


        const correctIndex =
            getCorrectAnswerIndex(
                question
            );


        if (
            selected !== null &&
            selected !== undefined &&
            selected !== -1
        ) {

            if (
                Number(selected) ===
                Number(correctIndex)
            ) {

                correct++;

            } else {

                incorrect++;

            }

        } else {

            skipped++;

        }

    });


    const total =
        quizQuestions.length;


    const score =
        (correct * 4) -
        (incorrect * 1);


    const accuracy =
        total > 0
            ? Math.round(
                (correct / total) * 100
            )
            : 0;


    const result = {

        courseId:
            localStorage.getItem(
                "quizCourse"
            ),

        chapterId:
            localStorage.getItem(
                "quizChapter"
            ),

        topicId:
            localStorage.getItem(
                "quizTopic"
            ),

        total:
            total,

        correct:
            correct,

        incorrect:
            incorrect,

        skipped:
            skipped,

        score:
            score,

        accuracy:
            accuracy,

        time:
            totalSeconds,

        questions:
            quizQuestions.map(function (q) {

                return {
                    id: q.id || "",
                    selected: q._selectedAnswer,
                    correct: getCorrectAnswerIndex(q)
                };

            }),

        createdAt:
            Date.now()

    };


    localStorage.setItem(
        "quizResult",
        JSON.stringify(result)
    );


    window.location.href =
        "result.html";

}


// ==========================================
// GET CORRECT ANSWER
// ==========================================

function getCorrectAnswerIndex(question) {

    let answer =
        question.answer;


    if (
        answer === undefined ||
        answer === null
    ) {

        answer =
            question.correctAnswer;

    }


    if (
        answer === undefined ||
        answer === null
    ) {

        answer =
            question.correct;

    }


    if (
        typeof answer === "number"
    ) {

        if (
            answer >= 1 &&
            answer <= 4
        ) {

            return answer - 1;

        }

        return answer;

    }


    answer =
        String(answer || "")
            .trim()
            .toLowerCase();


    // 1 / 2 / 3 / 4
    if (
        ["1", "2", "3", "4"].includes(answer)
    ) {

        return Number(answer) - 1;

    }


    // A / B / C / D
    if (answer === "a") return 0;
    if (answer === "b") return 1;
    if (answer === "c") return 2;
    if (answer === "d") return 3;


    const questionOptions = [

        String(question.option1 || "")
            .trim()
            .toLowerCase(),

        String(question.option2 || "")
            .trim()
            .toLowerCase(),

        String(question.option3 || "")
            .trim()
            .toLowerCase(),

        String(question.option4 || "")
            .trim()
            .toLowerCase()

    ];


    const found =
        questionOptions.indexOf(answer);


    if (found >= 0) {
        return found;
    }


    return 0;

}


// ==========================================
// SOLUTION
// ==========================================

function showSolution(question) {

    const solutionBox =
        document.getElementById(
            "solutionBox"
        );


    const solutionText =
        document.getElementById(
            "solutionText"
        );


    const referenceText =
        document.getElementById(
            "referenceText"
        );


    if (!solutionBox) {
        return;
    }


    const solution =
        question.solution ||
        question.explanation ||
        "No solution has been added yet.";


    if (solutionText) {

        solutionText.textContent =
            solution;

    }


    const reference =
        question.reference ||
        question.ncertReference ||
        question.ncertPage ||
        "";


    if (referenceText) {

        referenceText.textContent =
            reference
                ? "📖 NCERT Reference: " + reference
                : "";

    }


    solutionBox.classList.add(
        "show"
    );

}


// ==========================================
// TOTAL TIMER
// ==========================================

function startTotalTimer() {

    totalTimerInterval =
        setInterval(function () {

            totalSeconds++;

            updateTotalTimer();

        }, 1000);

}


// ==========================================
// UPDATE TOTAL TIMER
// ==========================================

function updateTotalTimer() {

    const element =
        document.getElementById(
            "totalTimer"
        );


    if (!element) {
        return;
    }


    element.textContent =
        formatTime(totalSeconds);

}


// ==========================================
// UPDATE QUESTION TIMER
// ==========================================

function updateQuestionTimer() {

    const element =
        document.getElementById(
            "questionTimer"
        );


    if (!element) {
        return;
    }


    element.textContent =
        questionTimer;


    if (questionTimer <= 10) {

        element.classList.add(
            "timer-danger"
        );

    } else {

        element.classList.remove(
            "timer-danger"
        );

    }

}


// ==========================================
// CLEAR TIMERS
// ==========================================

function clearAllTimers() {

    clearInterval(
        questionTimerInterval
    );

    clearInterval(
        totalTimerInterval
    );

}


// ==========================================
// BACK TO TOPIC
// ==========================================

function goBackToTopic() {

    const courseId =
        localStorage.getItem(
            "quizCourse"
        );

    const chapterId =
        localStorage.getItem(
            "quizChapter"
        );

    const topicId =
        localStorage.getItem(
            "quizTopic"
        );


    if (courseId) {

        localStorage.setItem(
            "activeCourse",
            courseId
        );

    }


    if (chapterId) {

        localStorage.setItem(
            "activeChapter",
            chapterId
        );

    }


    if (topicId) {

        localStorage.setItem(
            "activeTopic",
            topicId
        );

    }


    window.location.href =
        "topic.html";

}


// ==========================================
// ERROR
// ==========================================

function showQuizError(message) {

    const container =
        document.getElementById(
            "quizContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="quiz-error">

            ⚠️

            <br><br>

            ${escapeHTML(message)}

        </div>

    `;

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    seconds =
        Number(seconds || 0);


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":" +
        String(remaining)
            .padStart(2, "0")
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
