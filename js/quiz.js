// ==========================================
// mNEET - QUIZ.JS
// ==========================================

let courseId = null;
let chapterId = null;
let topicId = null;

let questions = [];
let currentIndex = 0;

let selectedAnswers = {};
let submittedAnswers = {};

let questionTimer = null;
let totalTimer = null;

let questionTimeLeft = 60;
let totalSeconds = 0;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href = "index.html";
            return;

        }


        courseId =
            localStorage.getItem("quizCourse") ||
            localStorage.getItem("activeCourse");

        chapterId =
            localStorage.getItem("quizChapter") ||
            localStorage.getItem("activeChapter");

        topicId =
            localStorage.getItem("quizTopic") ||
            localStorage.getItem("activeTopic");


        if (!courseId || !chapterId || !topicId) {

            showError(
                "Quiz information missing. Please open the quiz again."
            );

            return;

        }


        loadQuiz();

    });

});


// ==========================================
// LOAD QUIZ
// ==========================================

function loadQuiz() {

    const container =
        document.getElementById("quizContainer");


    container.innerHTML = `
        <div class="quiz-loading">
            Loading questions...
        </div>
    `;


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("quiz")
        .get()

        .then(function (snapshot) {

            questions = [];


            snapshot.forEach(function (doc) {

                const data = doc.data();


                questions.push({

                    id: doc.id,

                    question:
                        data.question || "",

                    option1:
                        data.option1 || "",

                    option2:
                        data.option2 || "",

                    option3:
                        data.option3 || "",

                    option4:
                        data.option4 || "",

                    answer:
                        data.answer || "",

                    solution:
                        data.solution || ""

                });

            });


            if (questions.length === 0) {

                showError(
                    "No questions found in this topic."
                );

                return;

            }


            currentIndex = 0;

            selectedAnswers = {};

            submittedAnswers = {};

            totalSeconds = 0;


            const title =
                document.getElementById("quizTitle");


            if (title) {

                title.textContent =
                    "NEET Biology Quiz";

            }


            startTotalTimer();

            renderQuestion();

        })

        .catch(function (error) {

            console.error(
                "Quiz loading error:",
                error
            );


            showError(
                "Unable to load questions.<br><br>" +
                escapeHTML(error.message)
            );

        });

}


// ==========================================
// RENDER QUESTION
// ==========================================

function renderQuestion() {

    stopQuestionTimer();


    const q =
        questions[currentIndex];


    if (!q) {

        return;

    }


    const container =
        document.getElementById("quizContainer");


    const selected =
        selectedAnswers[currentIndex];


    const submitted =
        submittedAnswers[currentIndex];


    let html = `

        <div class="question-card">

            <p class="question-text">
                ${escapeHTML(q.question)}
            </p>


            <div class="options">

    `;


    const options = [

        q.option1,
        q.option2,
        q.option3,
        q.option4

    ];


    options.forEach(function (option, index) {

        const number =
            index + 1;


        let className =
            "option";


        if (
            String(selected) ===
            String(number)
        ) {

            className += " selected";

        }


        if (submitted) {

            const correct =
                normalizeAnswer(q.answer);


            if (
                String(number) ===
                String(correct)
            ) {

                className += " correct";

            }


            if (
                String(selected) ===
                String(number) &&
                String(selected) !==
                String(correct)
            ) {

                className += " wrong";

            }


            className += " disabled";

        }


        html += `

            <button
                type="button"
                class="${className}"
                onclick="selectAnswer(${number})"
            >

                <span class="option-letter">
                    ${number}
                </span>

                <span class="option-text">
                    ${escapeHTML(option)}
                </span>

            </button>

        `;

    });


    html += `

            </div>

    `;


    // ======================================
    // SUBMIT ANSWER
    // ======================================

    if (!submitted) {

        html += `

            <button
                type="button"
                class="submit-answer-button"
                onclick="submitAnswer()"
                ${
                    selected
                        ? ""
                        : "disabled"
                }
            >
                Submit Answer
            </button>

        `;

    }


    // ======================================
    // ANSWER RESULT
    // ======================================

    if (submitted) {

        const correct =
            normalizeAnswer(q.answer);


        const isCorrect =
            String(selected) ===
            String(correct);


        html += `

            <div class="
                answer-status
                show
                ${
                    isCorrect
                        ? "correct-status"
                        : "wrong-status"
                }
            ">

                ${
                    isCorrect
                        ? "✅ Correct Answer"
                        : "❌ Incorrect Answer"
                }

            </div>

        `;


        if (q.solution) {

            html += `

                <div class="solution-box show">

                    <div class="solution-title">
                        💡 Solution
                    </div>

                    <div class="solution-text">
                        ${escapeHTML(q.solution)}
                    </div>

                </div>

            `;

        }

    }


    // ======================================
    // NAVIGATION
    // ======================================

    html += `

        <div class="quiz-actions">

            <button
                type="button"
                class="quiz-button previous-button"
                onclick="previousQuestion()"
                ${
                    currentIndex === 0
                        ? "disabled"
                        : ""
                }
            >
                ← Previous
            </button>


            <button
                type="button"
                class="quiz-button next-button"
                onclick="nextQuestion()"
            >

                ${
                    currentIndex ===
                    questions.length - 1
                        ? "Finish"
                        : "Next →"
                }

            </button>

        </div>


        <button
            type="button"
            class="submit-quiz-button"
            onclick="submitQuiz()"
        >
            Submit Quiz
        </button>

    `;


    container.innerHTML = html;


    updateCounter();

    updateProgress();


    questionTimeLeft = 60;

    updateQuestionTimer();

    startQuestionTimer();

}


// ==========================================
// SELECT ANSWER
// ==========================================

function selectAnswer(number) {

    if (
        submittedAnswers[currentIndex]
    ) {

        return;

    }


    selectedAnswers[currentIndex] =
        number;


    renderQuestion();

}


// ==========================================
// SUBMIT CURRENT ANSWER
// ==========================================

function submitAnswer() {

    if (
        !selectedAnswers[currentIndex]
    ) {

        alert(
            "Please select an option first."
        );

        return;

    }


    submittedAnswers[currentIndex] =
        true;


    stopQuestionTimer();


    renderQuestion();

}


// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    if (
        currentIndex <
        questions.length - 1
    ) {

        currentIndex++;

        renderQuestion();

    }

}


// ==========================================
// PREVIOUS QUESTION
// ==========================================

function previousQuestion() {

    if (currentIndex > 0) {

        currentIndex--;

        renderQuestion();

    }

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

function submitQuiz() {

    if (!questions.length) {

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to submit the quiz?"
        );


    if (!confirmed) {

        return;

    }


    stopQuestionTimer();

    stopTotalTimer();


    let correct = 0;
    let incorrect = 0;
    let skipped = 0;


    questions.forEach(function (q, index) {

        const selected =
            selectedAnswers[index];


        if (!selected) {

            skipped++;

            return;

        }


        const answer =
            normalizeAnswer(q.answer);


        if (
            String(selected) ===
            String(answer)
        ) {

            correct++;

        } else {

            incorrect++;

        }

    });


    const total =
        questions.length;


    // +4 correct / -1 wrong

    const score =
        (correct * 4) -
        incorrect;


    const accuracy =
        total > 0
            ? Math.round(
                (correct / total) * 100
            )
            : 0;


    const resultData = {

        courseId:
            courseId,

        chapterId:
            chapterId,

        topicId:
            topicId,

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
            totalSeconds

    };


    localStorage.setItem(
        "quizResult",
        JSON.stringify(resultData)
    );


    localStorage.setItem(
        "activeCourse",
        courseId
    );


    localStorage.setItem(
        "activeChapter",
        chapterId
    );


    localStorage.setItem(
        "activeTopic",
        topicId
    );


    window.location.href =
        "result.html";

}


// ==========================================
// QUESTION TIMER
// ==========================================

function startQuestionTimer() {

    stopQuestionTimer();


    questionTimer =
        setInterval(function () {

            questionTimeLeft--;


            updateQuestionTimer();


            if (
                questionTimeLeft <= 0
            ) {

                stopQuestionTimer();


                if (
                    currentIndex <
                    questions.length - 1
                ) {

                    currentIndex++;

                    renderQuestion();

                } else {

                    submitQuiz();

                }

            }

        }, 1000);

}


function stopQuestionTimer() {

    if (questionTimer) {

        clearInterval(questionTimer);

        questionTimer = null;

    }

}


// ==========================================
// TOTAL TIMER
// ==========================================

function startTotalTimer() {

    stopTotalTimer();


    totalSeconds = 0;


    updateTotalTimer();


    totalTimer =
        setInterval(function () {

            totalSeconds++;

            updateTotalTimer();

        }, 1000);

}


function stopTotalTimer() {

    if (totalTimer) {

        clearInterval(totalTimer);

        totalTimer = null;

    }

}


// ==========================================
// QUESTION TIMER UI
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
        questionTimeLeft;


    if (
        questionTimeLeft <= 10
    ) {

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
// TOTAL TIMER UI
// ==========================================

function updateTotalTimer() {

    const element =
        document.getElementById(
            "totalTimer"
        );


    if (!element) {

        return;

    }


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    element.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


// ==========================================
// QUESTION COUNTER
// ==========================================

function updateCounter() {

    const element =
        document.getElementById(
            "questionCounter"
        );


    if (!element) {

        return;

    }


    element.textContent =
        (currentIndex + 1) +
        " / " +
        questions.length;

}


// ==========================================
// PROGRESS
// ==========================================

function updateProgress() {

    const element =
        document.getElementById(
            "progressFill"
        );


    if (!element) {

        return;

    }


    const percent =
        (
            (currentIndex + 1) /
            questions.length
        ) * 100;


    element.style.width =
        percent + "%";

}


// ==========================================
// NORMALIZE ANSWER
// ==========================================

function normalizeAnswer(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    const answer =
        String(value)
            .trim()
            .toLowerCase();


    if (
        answer === "a" ||
        answer === "1" ||
        answer === "option1" ||
        answer === "option 1"
    ) {

        return "1";

    }


    if (
        answer === "b" ||
        answer === "2" ||
        answer === "option2" ||
        answer === "option 2"
    ) {

        return "2";

    }


    if (
        answer === "c" ||
        answer === "3" ||
        answer === "option3" ||
        answer === "option 3"
    ) {

        return "3";

    }


    if (
        answer === "d" ||
        answer === "4" ||
        answer === "option4" ||
        answer === "option 4"
    ) {

        return "4";

    }


    return answer;

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

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

            ${message}

        </div>

    `;

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// BACK TO TOPIC
// ==========================================

function goBackToTopic() {

    stopQuestionTimer();

    stopTotalTimer();


    localStorage.setItem(
        "activeCourse",
        courseId
    );


    localStorage.setItem(
        "activeChapter",
        chapterId
    );


    localStorage.setItem(
        "activeTopic",
        topicId
    );


    window.location.href =
        "topic.html";

}
