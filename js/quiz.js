// ==========================================
// mNEET QUIZ - FINAL
// Firestore:
// courses/{course}/chapters/{chapter}/topics/{topic}/quiz/{question}
// ==========================================

let courseId = "";
let chapterId = "";
let topicId = "";

let questions = [];
let currentQuestion = 0;

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
            localStorage.getItem("activeCourse") ||
            "";

        chapterId =
            localStorage.getItem("quizChapter") ||
            localStorage.getItem("activeChapter") ||
            "";

        topicId =
            localStorage.getItem("quizTopic") ||
            localStorage.getItem("activeTopic") ||
            "";


        console.log("QUIZ COURSE =", courseId);
        console.log("QUIZ CHAPTER =", chapterId);
        console.log("QUIZ TOPIC =", topicId);


        if (!courseId || !chapterId || !topicId) {

            showError(
                "Quiz ID missing. Topic থেকে আবার Start Quiz চাপুন."
            );

            return;
        }


        loadQuizQuestions();

    });

});


// ==========================================
// LOAD QUESTIONS
// ==========================================

function loadQuizQuestions() {

    const box =
        document.getElementById("quizContainer");


    box.innerHTML = `
        <div class="quiz-loading">
            Loading questions...
        </div>
    `;


    console.log(
        "Loading Firestore quiz:",
        courseId,
        chapterId,
        topicId
    );


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("quiz")
        .get()

        .then(function (snapshot) {

            console.log(
                "QUIZ SNAPSHOT SIZE =",
                snapshot.size
            );


            questions = [];


            snapshot.forEach(function (doc) {

                const data = doc.data();


                console.log(
                    "QUESTION:",
                    doc.id,
                    data
                );


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
                    "Quiz collection পাওয়া গেছে, কিন্তু এর ভিতরে কোনো question document নেই."
                );

                return;
            }


            startQuiz();

        })

        .catch(function (error) {

            console.error(
                "QUIZ FIRESTORE ERROR:",
                error
            );


            showError(
                "Question load হয়নি.<br><br>" +
                "Firestore Error: " +
                escapeHTML(error.message)
            );

        });

}


// ==========================================
// START
// ==========================================

function startQuiz() {

    currentQuestion = 0;

    selectedAnswers = {};

    submittedAnswers = {};

    totalSeconds = 0;


    const title =
        document.getElementById("quizTitle");


    if (title) {
        title.textContent = "NEET Biology Quiz";
    }


    startTotalTimer();

    renderQuestion();

}


// ==========================================
// RENDER
// ==========================================

function renderQuestion() {

    stopQuestionTimer();


    const q =
        questions[currentQuestion];


    if (!q) {

        showError(
            "Question পাওয়া যাচ্ছে না."
        );

        return;
    }


    const box =
        document.getElementById(
            "quizContainer"
        );


    const selected =
        selectedAnswers[currentQuestion];


    const submitted =
        submittedAnswers[currentQuestion] === true;


    const correctAnswer =
        normalizeAnswer(q.answer);


    let html = `

        <div class="question-card">

            <p class="question-text">
                ${escapeHTML(q.question)}
            </p>

            <div class="options">

    `;


    const optionList = [
        q.option1,
        q.option2,
        q.option3,
        q.option4
    ];


    optionList.forEach(function (
        option,
        index
    ) {

        const number =
            index + 1;


        const isSelected =
            String(selected) ===
            String(number);


        const isCorrect =
            submitted &&
            correctAnswer ===
            String(number);


        const isWrong =
            submitted &&
            isSelected &&
            !isCorrect;


        let cls = "option";


        if (isSelected) {
            cls += " selected";
        }


        if (isCorrect) {
            cls += " correct";
        }


        if (isWrong) {
            cls += " wrong";
        }


        if (submitted) {
            cls += " disabled";
        }


        html += `

            <button
                type="button"
                class="${cls}"
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


    html += `</div>`;


    // Submit Answer

    if (!submitted) {

        html += `

            <button
                type="button"
                class="submit-answer-button"
                onclick="submitAnswer()"
                ${selected ? "" : "disabled"}
            >
                Submit Answer
            </button>

        `;

    }


    // Answer result

    if (submitted) {

        const correct =
            correctAnswer ===
            String(selected);


        html += `

            <div class="
                answer-status
                show
                ${
                    correct
                        ? "correct-status"
                        : "wrong-status"
                }
            ">

                ${
                    correct
                        ? "✅ Correct Answer"
                        : "❌ Wrong Answer"
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


    // Navigation

    html += `

        <div class="quiz-actions">

            <button
                type="button"
                class="quiz-button previous-button"
                onclick="previousQuestion()"
                ${
                    currentQuestion === 0
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
                    currentQuestion ===
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


    box.innerHTML = html;


    updateCounter();

    updateProgress();

    questionTimeLeft = 60;

    updateQuestionTimer();

    startQuestionTimer();

}


// ==========================================
// SELECT
// ==========================================

function selectAnswer(number) {

    if (
        submittedAnswers[currentQuestion]
    ) {
        return;
    }


    selectedAnswers[currentQuestion] =
        number;


    renderQuestion();

}


// ==========================================
// SUBMIT ANSWER
// ==========================================

function submitAnswer() {

    if (
        !selectedAnswers[currentQuestion]
    ) {

        alert(
            "Please select an option first."
        );

        return;
    }


    submittedAnswers[currentQuestion] =
        true;


    stopQuestionTimer();

    renderQuestion();

}


// ==========================================
// NEXT
// ==========================================

function nextQuestion() {

    if (
        currentQuestion <
        questions.length - 1
    ) {

        currentQuestion++;

        renderQuestion();

    }

}


// ==========================================
// PREVIOUS
// ==========================================

function previousQuestion() {

    if (currentQuestion > 0) {

        currentQuestion--;

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


    if (
        !confirm(
            "Are you sure you want to submit the quiz?"
        )
    ) {

        return;
    }


    stopQuestionTimer();
    stopTotalTimer();


    let correct = 0;
    let incorrect = 0;
    let skipped = 0;


    questions.forEach(function (
        q,
        index
    ) {

        const selected =
            selectedAnswers[index];


        if (!selected) {

            skipped++;

            return;
        }


        if (
            String(selected) ===
            normalizeAnswer(q.answer)
        ) {

            correct++;

        } else {

            incorrect++;

        }

    });


    const total =
        questions.length;


    const score =
        (correct * 4) -
        incorrect;


    const accuracy =
        total
            ? Math.round(
                (correct / total) * 100
            )
            : 0;


    const result = {

        courseId: courseId,

        chapterId: chapterId,

        topicId: topicId,

        total: total,

        correct: correct,

        incorrect: incorrect,

        skipped: skipped,

        score: score,

        accuracy: accuracy,

        time: totalSeconds

    };


    localStorage.setItem(
        "quizResult",
        JSON.stringify(result)
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


    questionTimeLeft = 60;

    updateQuestionTimer();


    questionTimer =
        setInterval(function () {

            questionTimeLeft--;

            updateQuestionTimer();


            if (
                questionTimeLeft <= 0
            ) {

                stopQuestionTimer();


                if (
                    currentQuestion <
                    questions.length - 1
                ) {

                    currentQuestion++;

                    renderQuestion();

                }

            }

        }, 1000);

}


function stopQuestionTimer() {

    if (questionTimer) {

        clearInterval(
            questionTimer
        );

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

        clearInterval(
            totalTimer
        );

        totalTimer = null;

    }

}


// ==========================================
// TIMER UI
// ==========================================

function updateQuestionTimer() {

    const el =
        document.getElementById(
            "questionTimer"
        );


    if (!el) return;


    el.textContent =
        questionTimeLeft;


    if (
        questionTimeLeft <= 10
    ) {

        el.classList.add(
            "timer-danger"
        );

    } else {

        el.classList.remove(
            "timer-danger"
        );

    }

}


function updateTotalTimer() {

    const el =
        document.getElementById(
            "totalTimer"
        );


    if (!el) return;


    const min =
        Math.floor(
            totalSeconds / 60
        );


    const sec =
        totalSeconds % 60;


    el.textContent =
        String(min).padStart(2, "0") +
        ":" +
        String(sec).padStart(2, "0");

}


// ==========================================
// COUNTER
// ==========================================

function updateCounter() {

    const el =
        document.getElementById(
            "questionCounter"
        );


    if (!el) return;


    el.textContent =
        (currentQuestion + 1) +
        " / " +
        questions.length;

}


// ==========================================
// PROGRESS
// ==========================================

function updateProgress() {

    const el =
        document.getElementById(
            "progressFill"
        );


    if (!el) return;


    const percent =
        (
            (currentQuestion + 1) /
            questions.length
        ) * 100;


    el.style.width =
        percent + "%";

}


// ==========================================
// ANSWER NORMALIZE
// ==========================================

function normalizeAnswer(answer) {

    if (
        answer === undefined ||
        answer === null
    ) {
        return "";
    }


    const value =
        String(answer)
            .trim()
            .toLowerCase();


    if (
        value === "a" ||
        value === "option1" ||
        value === "option 1" ||
        value === "1"
    ) {
        return "1";
    }


    if (
        value === "b" ||
        value === "option2" ||
        value === "option 2" ||
        value === "2"
    ) {
        return "2";
    }


    if (
        value === "c" ||
        value === "option3" ||
        value === "option 3" ||
        value === "3"
    ) {
        return "3";
    }


    if (
        value === "d" ||
        value === "option4" ||
        value === "option 4" ||
        value === "4"
    ) {
        return "4";
    }


    return value;

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    const box =
        document.getElementById(
            "quizContainer"
        );


    if (!box) return;


    box.innerHTML = `

        <div class="quiz-error">

            ⚠️

            <br><br>

            ${message}

        </div>

    `;

}


// ==========================================
// ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// BACK
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
