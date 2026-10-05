// ==========================================
// mNEET - QUIZ ENGINE
// ==========================================

let courseId = "";
let chapterId = "";
let topicId = "";

let questions = [];
let currentQuestion = 0;

let selectedAnswer = null;
let answerSubmitted = false;

let questionTimeLeft = 60;
let totalSeconds = 0;

let questionTimer = null;
let totalTimer = null;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (
        typeof firebase === "undefined" ||
        typeof auth === "undefined" ||
        typeof db === "undefined"
    ) {
        showError("Firebase load হয়নি।");
        return;
    }


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
                "Quiz information পাওয়া যায়নি।"
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


    const topicRef =
        db.collection("courses")
            .doc(courseId)
            .collection("chapters")
            .doc(chapterId)
            .collection("topics")
            .doc(topicId);


    // প্রথমে topic information load
    topicRef.get()

        .then(function (topicDoc) {

            if (topicDoc.exists) {

                const topic =
                    topicDoc.data();

                document.getElementById(
                    "quizTitle"
                ).textContent =
                    topic.name ||
                    topic.title ||
                    "Practice Quiz";
            }


            // তারপর questions
            return topicRef
                .collection("quiz")
                .get();

        })

        .then(function (snapshot) {

            questions = [];


            if (snapshot.empty) {

                showError(
                    "এই Topic-এর মধ্যে কোনো Quiz পাওয়া যায়নি।"
                );

                return;
            }


            snapshot.forEach(function (doc) {

                const data = doc.data();


                questions.push({
                    id: doc.id,
                    data: data
                });

            });


            // order থাকলে sort
            questions.sort(function (a, b) {

                const orderA =
                    Number(
                        a.data.order || 999999
                    );

                const orderB =
                    Number(
                        b.data.order || 999999
                    );

                return orderA - orderB;

            });


            if (questions.length === 0) {

                showError(
                    "কোনো প্রশ্ন পাওয়া যায়নি।"
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


            showError(
                "Quiz load করা যায়নি: " +
                error.message
            );

        });

}


// ==========================================
// START QUIZ
// ==========================================

function startQuiz() {

    currentQuestion = 0;

    totalSeconds = 0;


    startTotalTimer();

    showQuestion();

}


// ==========================================
// SHOW QUESTION
// ==========================================

function showQuestion() {

    clearInterval(questionTimer);


    if (
        currentQuestion < 0 ||
        currentQuestion >= questions.length
    ) {
        return;
    }


    selectedAnswer = null;

    answerSubmitted = false;


    questionTimeLeft = 60;


    const item =
        questions[currentQuestion];


    const data =
        item.data;


    const container =
        document.getElementById(
            "quizContainer"
        );


    // Question text
    const questionText =
        data.question ||
        data.questionText ||
        data.text ||
        data.title ||
        "Question";


    // Options
    const options = [
        data.option1 ||
        data.optionA ||
        data.a ||
        "",

        data.option2 ||
        data.optionB ||
        data.b ||
        "",

        data.option3 ||
        data.optionC ||
        data.c ||
        "",

        data.option4 ||
        data.optionD ||
        data.d ||
        ""
    ];


    // Question image
    const imageUrl =
        data.imageUrl ||
        data.questionImage ||
        data.image ||
        "";


    let imageHTML = "";


    if (imageUrl) {

        imageHTML = `
            <img
                src="${escapeHTML(imageUrl)}"
                class="question-image"
                alt="Question image"
            >
        `;

    }


    container.innerHTML = `

        <div class="question-card">

            <p class="question-text">

                ${escapeHTML(questionText)}

            </p>


            ${imageHTML}


            <div class="options">

                ${createOption(
                    1,
                    options[0]
                )}

                ${createOption(
                    2,
                    options[1]
                )}

                ${createOption(
                    3,
                    options[2]
                )}

                ${createOption(
                    4,
                    options[3]
                )}

            </div>


            <div
                id="answerStatus"
                class="answer-status"
            ></div>


            <div
                id="solutionBox"
                class="solution-box"
            ></div>


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
                    Next →
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


    updateQuestionInfo();


    startQuestionTimer();

}


// ==========================================
// CREATE OPTION
// ==========================================

function createOption(number, text) {

    const letters = [
        "A",
        "B",
        "C",
        "D"
    ];


    return `

        <button
            type="button"
            id="option${number}"
            class="option"
            onclick="selectOption(${number})"
        >

            <span class="option-letter">

                ${letters[number - 1]}

            </span>


            <span class="option-text">

                ${escapeHTML(
                    text || "Option " + number
                )}

            </span>

        </button>

    `;

}


// ==========================================
// SELECT OPTION
// ==========================================

function selectOption(number) {

    if (answerSubmitted) {
        return;
    }


    selectedAnswer = number;


    document
        .querySelectorAll(".option")
        .forEach(function (button) {

            button.classList.remove(
                "selected"
            );

        });


    const selected =
        document.getElementById(
            "option" + number
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );

    }

}


// ==========================================
// SUBMIT ANSWER
// ==========================================

function submitAnswer() {

    if (answerSubmitted) {
        return;
    }


    if (!selectedAnswer) {

        alert(
            "Please select an answer first."
        );

        return;
    }


    answerSubmitted = true;


    clearInterval(questionTimer);


    const data =
        questions[currentQuestion].data;


    const correctAnswer =
        normalizeCorrectAnswer(
            data.correctOption ||
            data.correctAnswer ||
            data.answer ||
            data.correct
        );


    const selectedButton =
        document.getElementById(
            "option" + selectedAnswer
        );


    const correctButton =
        document.getElementById(
            "option" + correctAnswer
        );


    if (correctButton) {

        correctButton.classList.add(
            "correct"
        );

    }


    const status =
        document.getElementById(
            "answerStatus"
        );


    if (
        selectedAnswer ===
        correctAnswer
    ) {

        if (selectedButton) {

            selectedButton.classList.add(
                "correct"
            );

        }


        status.className =
            "answer-status show correct-status";


        status.innerHTML =
            "✓ Correct Answer";

    }

    else {

        if (selectedButton) {

            selectedButton.classList.add(
                "wrong"
            );

        }


        status.className =
            "answer-status show wrong-status";


        status.innerHTML =
            "✗ Incorrect Answer";

    }


    // Solution
    showSolution(data);


    // Disable options
    document
        .querySelectorAll(".option")
        .forEach(function (button) {

            button.classList.add(
                "disabled"
            );

        });


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
// SOLUTION
// ==========================================

function showSolution(data) {

    const solution =
        data.solution ||
        data.explanation ||
        data.answerExplanation ||
        "";


    const reference =
        data.reference ||
        data.ncertReference ||
        data.ncert ||
        "";


    if (!solution && !reference) {
        return;
    }


    const box =
        document.getElementById(
            "solutionBox"
        );


    if (!box) {
        return;
    }


    let html = "";


    if (solution) {

        html += `

            <div class="solution-title">
                Solution
            </div>

            <div class="solution-text">

                ${escapeHTML(solution)}

            </div>

        `;

    }


    if (reference) {

        html += `

            <div class="reference-text">

                📖 NCERT Reference:
                ${escapeHTML(reference)}

            </div>

        `;

    }


    box.innerHTML = html;

    box.classList.add("show");

}


// ==========================================
// QUESTION TIMER
// ==========================================

function startQuestionTimer() {

    clearInterval(questionTimer);


    updateQuestionTimer();


    questionTimer =
        setInterval(function () {

            questionTimeLeft--;


            updateQuestionTimer();


            if (questionTimeLeft <= 0) {

                clearInterval(
                    questionTimer
                );


                if (!answerSubmitted) {

                    if (selectedAnswer) {

                        submitAnswer();

                    }

                    else {

                        nextQuestion();

                    }

                }

            }

        }, 1000);

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
        questionTimeLeft;


    if (questionTimeLeft <= 10) {

        element.classList.add(
            "timer-danger"
        );

    }

    else {

        element.classList.remove(
            "timer-danger"
        );

    }

}


// ==========================================
// TOTAL TIMER
// ==========================================

function startTotalTimer() {

    clearInterval(totalTimer);


    totalSeconds = 0;


    updateTotalTimer();


    totalTimer =
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
// QUESTION INFO
// ==========================================

function updateQuestionInfo() {

    const counter =
        document.getElementById(
            "questionCounter"
        );


    if (counter) {

        counter.textContent =
            (currentQuestion + 1) +
            " / " +
            questions.length;

    }


    const progress =
        document.getElementById(
            "progressFill"
        );


    if (progress) {

        const percent =
            (
                (currentQuestion + 1) /
                questions.length
            ) * 100;


        progress.style.width =
            percent + "%";

    }

}


// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    if (
        currentQuestion <
        questions.length - 1
    ) {

        currentQuestion++;

        showQuestion();

    }

    else {

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

    showQuestion();

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

function submitQuiz() {

    clearInterval(questionTimer);

    clearInterval(totalTimer);


    alert(
        "Quiz submitted."
    );


    // পরে এখানে result system যুক্ত হবে

}


// ==========================================
// BACK TO TOPIC
// ==========================================

function goBackToTopic() {

    clearInterval(questionTimer);

    clearInterval(totalTimer);


    window.location.href =
        "topic.html";

}


// ==========================================
// NORMALIZE ANSWER
// ==========================================

function normalizeCorrectAnswer(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return 0;

    }


    const answer =
        String(value)
            .trim()
            .toUpperCase();


    if (answer === "A") return 1;
    if (answer === "B") return 2;
    if (answer === "C") return 3;
    if (answer === "D") return 4;


    const number =
        parseInt(answer, 10);


    if (
        number >= 1 &&
        number <= 4
    ) {

        return number;

    }


    return 0;

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

            ${escapeHTML(message)}

            <br><br>

            <button
                onclick="goBackToTopic()"
                style="
                    border:none;
                    background:#ffc107;
                    color:#111;
                    padding:12px 22px;
                    border-radius:10px;
                    font-weight:900;
                "
            >
                ← Back to Topic
            </button>

        </div>

    `;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)

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
