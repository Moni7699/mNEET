/* =========================================================
   mNEET QUIZ SYSTEM
   Firebase Firestore
   Path:
   courses/{courseId}/chapters/{chapterId}/topics/{topicId}/quiz
   quiz/{quizId}/questions/{questionId}
========================================================= */

let db = null;

let questions = [];
let currentQuestion = 0;

let selectedAnswers = {};
let submittedAnswers = {};

let questionTimeLeft = 60;
let perQuestionTime = 60;

let totalSeconds = 0;

let questionTimerInterval = null;
let totalTimerInterval = null;

let quizFinished = false;


/* =========================================================
   FIREBASE CHECK
========================================================= */

function firebaseReady() {

    if (typeof firebase === "undefined") {
        return false;
    }

    if (!firebase.apps || firebase.apps.length === 0) {
        return false;
    }

    try {
        db = firebase.firestore();
        return true;
    } catch (error) {
        console.error("Firestore error:", error);
        return false;
    }
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getStorageValue(keys) {

    for (const key of keys) {

        const value = localStorage.getItem(key);

        if (value !== null && value !== "") {
            return value;
        }
    }

    return null;
}


function getCourseId() {

    return getStorageValue([
        "activeCourse",
        "courseId",
        "selectedCourse"
    ]);
}


function getChapterId() {

    return getStorageValue([
        "activeChapter",
        "chapterId",
        "selectedChapter"
    ]);
}


function getTopicId() {

    return getStorageValue([
        "activeTopic",
        "topicId",
        "selectedTopic"
    ]);
}


function getQuizId() {

    return getStorageValue([
        "activeQuiz",
        "quizId",
        "selectedQuiz"
    ]) || "quiz-01";
}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    startQuizPage();

});


async function startQuizPage() {

    showLoading("Loading questions...");

    if (!firebaseReady()) {

        showError(
            "Firebase library load হয়নি।<br><br>" +
            "Please check firebase.js"
        );

        return;
    }

    const courseId = getCourseId();
    const chapterId = getChapterId();
    const topicId = getTopicId();
    const quizId = getQuizId();

    console.log("Course:", courseId);
    console.log("Chapter:", chapterId);
    console.log("Topic:", topicId);
    console.log("Quiz:", quizId);

    if (!courseId || !chapterId || !topicId) {

        showError(
            "Quiz information পাওয়া যায়নি।<br><br>" +
            "Please go back and open the quiz again."
        );

        return;
    }

    try {

        await loadQuiz(
            courseId,
            chapterId,
            topicId,
            quizId
        );

    } catch (error) {

        console.error("Quiz loading error:", error);

        showError(
            "Quiz load করা যায়নি।<br><br>" +
            error.message
        );
    }
}


/* =========================================================
   LOAD QUIZ
========================================================= */

async function loadQuiz(
    courseId,
    chapterId,
    topicId,
    quizId
) {

    const quizRef = db
        .collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("quiz")
        .doc(quizId);

    const quizSnap = await quizRef.get();

    if (!quizSnap.exists) {

        throw new Error(
            "Quiz document পাওয়া যায়নি: " + quizId
        );
    }

    const quizData = quizSnap.data();

    console.log("Quiz data:", quizData);

    const title =
        quizData.title ||
        "Topic Quiz";

    document.getElementById("quizTitle").textContent =
        title;


    /* -----------------------------------------------------
       TIMER SETTINGS
    ----------------------------------------------------- */

    perQuestionTime =
        Number(quizData.timePerQuestion) || 60;

    questionTimeLeft = perQuestionTime;


    /* -----------------------------------------------------
       QUESTIONS
    ----------------------------------------------------- */

    const questionSnap = await quizRef
        .collection("questions")
        .where("published", "==", true)
        .get();


    questions = [];

    questionSnap.forEach(function (doc) {

        const data = doc.data();

        questions.push({
            id: doc.id,
            ...data
        });

    });


    /*
       যদি published field না থাকার কারণে
       উপরের query-তে কিছু না আসে,
       তাহলে সব question load করবে।
    */

    if (questions.length === 0) {

        const allQuestions =
            await quizRef
                .collection("questions")
                .get();

        allQuestions.forEach(function (doc) {

            const data = doc.data();

            /*
              published false হলে বাদ
            */

            if (data.published === false) {
                return;
            }

            questions.push({
                id: doc.id,
                ...data
            });

        });
    }


    /* -----------------------------------------------------
       SORT BY ORDER
    ----------------------------------------------------- */

    questions.sort(function (a, b) {

        return (
            Number(a.order || 0) -
            Number(b.order || 0)
        );

    });


    if (questions.length === 0) {

        showError(
            "এই quiz-এর মধ্যে কোনো question পাওয়া যায়নি।"
        );

        return;
    }


    /* -----------------------------------------------------
       TOTAL TIMER
    ----------------------------------------------------- */

    totalSeconds =
        questions.length * perQuestionTime;


    /*
       Existing quiz resume data
    */

    loadSavedProgress();


    updateQuizHeader();

    renderQuestion();

    startTimers();

}


/* =========================================================
   RENDER QUESTION
========================================================= */

function renderQuestion() {

    if (!questions.length) {
        return;
    }

    const q = questions[currentQuestion];

    if (!q) {
        return;
    }


    const container =
        document.getElementById("quizContainer");


    const optionTexts = [

        q.option1 || "",
        q.option2 || "",
        q.option3 || "",
        q.option4 || ""

    ];


    const letters = [
        "1",
        "2",
        "3",
        "4"
    ];


    let html = "";


    html += `
        <div class="question-card">

            <p class="question-text">
                ${escapeHTML(
                    q.questionText ||
                    "Question text পাওয়া যায়নি."
                )}
            </p>
    `;


    /* -----------------------------------------------------
       QUESTION IMAGE
    ----------------------------------------------------- */

    if (q.questionImageUrl || q.imageUrl) {

        const imageUrl =
            q.questionImageUrl ||
            q.imageUrl;

        html += `
            <img
                class="question-image"
                src="${escapeAttribute(imageUrl)}"
                alt="Question Image"
                onerror="this.style.display='none'"
            >
        `;
    }


    /* -----------------------------------------------------
       OPTIONS
    ----------------------------------------------------- */

    html += `
        <div class="options">
    `;


    optionTexts.forEach(function (text, index) {

        const optionNumber = index + 1;

        let classes = "option";

        const selected =
            selectedAnswers[currentQuestion];

        const submitted =
            submittedAnswers[currentQuestion];


        if (
            selected === optionNumber &&
            !submitted
        ) {
            classes += " selected";
        }


        if (submitted) {

            const correct =
                Number(q.correctOption);


            if (optionNumber === correct) {

                classes += " correct";

            } else if (
                optionNumber === selected &&
                selected !== correct
            ) {

                classes += " wrong";

            }

            classes += " disabled";
        }


        html += `
            <button
                type="button"
                class="${classes}"
                onclick="selectOption(${optionNumber})"
            >

                <span class="option-letter">
                    ${letters[index]}
                </span>

                <span class="option-text">
                    ${escapeHTML(text)}
                </span>

            </button>
        `;

    });


    html += `
        </div>
    `;


    /* -----------------------------------------------------
       ANSWER STATUS
    ----------------------------------------------------- */

    const submitted =
        submittedAnswers[currentQuestion];


    if (submitted) {

        const selected =
            selectedAnswers[currentQuestion];

        const correct =
            Number(q.correctOption);


        if (selected === correct) {

            html += `
                <div class="answer-status show correct-status">
                    ✓ Correct Answer
                </div>
            `;

        } else {

            html += `
                <div class="answer-status show wrong-status">
                    ✕ Wrong Answer<br>
                    Correct answer:
                    ${correct}
                </div>
            `;

        }


        /* -------------------------------------------------
           SOLUTION
        ------------------------------------------------- */

        if (
            q.solution ||
            q.reference ||
            q.ncertReference
        ) {

            html += `
                <div class="solution-box show">

                    <div class="solution-title">
                        💡 Solution
                    </div>

                    <div class="solution-text">
                        ${escapeHTML(
                            q.solution || ""
                        )}
                    </div>

                    ${
                        q.reference ||
                        q.ncertReference
                        ? `
                            <div class="reference-text">
                                📖 NCERT Reference:
                                ${escapeHTML(
                                    q.reference ||
                                    q.ncertReference ||
                                    ""
                                )}
                            </div>
                        `
                        : ""
                    }

                </div>
            `;
        }

    }


    /* -----------------------------------------------------
       ANSWER BUTTON
    ----------------------------------------------------- */

    if (!submitted) {

        html += `
            <button
                id="submitAnswerButton"
                class="submit-answer-button"
                onclick="submitAnswer()"
                ${
                    selectedAnswers[currentQuestion]
                    ? ""
                    : "disabled"
                }
            >
                Submit Answer
            </button>
        `;

    }


    /* -----------------------------------------------------
       NAVIGATION
    ----------------------------------------------------- */

    html += `
        <div class="quiz-actions">

            <button
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
    `;


    /* -----------------------------------------------------
       FINAL SUBMIT
    ----------------------------------------------------- */

    html += `
        <button
            class="submit-quiz-button"
            onclick="submitQuiz()"
        >
            Submit Quiz
        </button>
    `;


    html += `
        </div>
    `;


    container.innerHTML = html;


    updateQuizHeader();

}


/* =========================================================
   SELECT OPTION
========================================================= */

function selectOption(optionNumber) {

    if (submittedAnswers[currentQuestion]) {
        return;
    }

    selectedAnswers[currentQuestion] =
        optionNumber;

    saveProgress();

    renderQuestion();

}


/* =========================================================
   SUBMIT ANSWER
========================================================= */

function submitAnswer() {

    if (submittedAnswers[currentQuestion]) {
        return;
    }


    const selected =
        selectedAnswers[currentQuestion];


    if (!selected) {

        alert("Please select an answer first.");

        return;
    }


    submittedAnswers[currentQuestion] = true;


    saveProgress();


    /*
       Answer submit হলে question timer stop/reset
    */

    stopQuestionTimer();


    renderQuestion();

}


/* =========================================================
   NEXT QUESTION
========================================================= */

function nextQuestion() {

    if (
        currentQuestion <
        questions.length - 1
    ) {

        currentQuestion++;

        resetQuestionTimer();

        saveProgress();

        renderQuestion();

    } else {

        submitQuiz();

    }

}


/* =========================================================
   PREVIOUS QUESTION
========================================================= */

function previousQuestion() {

    if (currentQuestion <= 0) {
        return;
    }

    currentQuestion--;

    resetQuestionTimer();

    saveProgress();

    renderQuestion();

}


/* =========================================================
   QUESTION TIMER
========================================================= */

function startQuestionTimer() {

    stopQuestionTimer();


    questionTimerInterval =
        setInterval(function () {

            if (quizFinished) {
                return;
            }


            /*
              Answer already submitted
            */

            if (
                submittedAnswers[currentQuestion]
            ) {

                stopQuestionTimer();

                return;
            }


            questionTimeLeft--;


            updateTimerDisplay();


            if (questionTimeLeft <= 0) {

                questionTimeExpired();

            }

        }, 1000);

}


/* =========================================================
   QUESTION TIMER EXPIRED
========================================================= */

function questionTimeExpired() {

    stopQuestionTimer();


    /*
       Automatically submit current answer
       if selected
    */

    if (
        selectedAnswers[currentQuestion] &&
        !submittedAnswers[currentQuestion]
    ) {

        submittedAnswers[currentQuestion] = true;

    }


    saveProgress();


    /*
       Move automatically
    */

    if (
        currentQuestion <
        questions.length - 1
    ) {

        currentQuestion++;

        resetQuestionTimer();

        renderQuestion();

    } else {

        submitQuiz();

    }

}


/* =========================================================
   RESET QUESTION TIMER
========================================================= */

function resetQuestionTimer() {

    stopQuestionTimer();


    questionTimeLeft =
        perQuestionTime;


    updateTimerDisplay();


    if (
        !submittedAnswers[currentQuestion] &&
        !quizFinished
    ) {

        startQuestionTimer();

    }

}


/* =========================================================
   STOP QUESTION TIMER
========================================================= */

function stopQuestionTimer() {

    if (questionTimerInterval) {

        clearInterval(
            questionTimerInterval
        );

        questionTimerInterval = null;
    }

}


/* =========================================================
   TOTAL TIMER
========================================================= */

function startTotalTimer() {

    if (totalTimerInterval) {
        return;
    }


    totalTimerInterval =
        setInterval(function () {

            if (quizFinished) {
                return;
            }

            totalSeconds++;

            updateTimerDisplay();

            saveProgress();

        }, 1000);

}


/* =========================================================
   STOP TOTAL TIMER
========================================================= */

function stopTotalTimer() {

    if (totalTimerInterval) {

        clearInterval(
            totalTimerInterval
        );

        totalTimerInterval = null;
    }

}


/* =========================================================
   START TIMERS
========================================================= */

function startTimers() {

    updateTimerDisplay();


    if (
        !submittedAnswers[currentQuestion]
    ) {

        startQuestionTimer();

    }


    startTotalTimer();

}


/* =========================================================
   UPDATE TIMER DISPLAY
========================================================= */

function updateTimerDisplay() {

    const questionTimer =
        document.getElementById(
            "questionTimer"
        );


    const totalTimer =
        document.getElementById(
            "totalTimer"
        );


    if (questionTimer) {

        questionTimer.textContent =
            questionTimeLeft;


        if (questionTimeLeft <= 10) {

            questionTimer.classList.add(
                "timer-danger"
            );

        } else {

            questionTimer.classList.remove(
                "timer-danger"
            );

        }

    }


    if (totalTimer) {

        totalTimer.textContent =
            formatTime(totalSeconds);

    }

}


/* =========================================================
   UPDATE HEADER
========================================================= */

function updateQuizHeader() {

    const counter =
        document.getElementById(
            "questionCounter"
        );


    const progress =
        document.getElementById(
            "progressFill"
        );


    if (!questions.length) {
        return;
    }


    if (counter) {

        counter.textContent =
            `${currentQuestion + 1} / ${questions.length}`;

    }


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


/* =========================================================
   SUBMIT QUIZ
========================================================= */

function submitQuiz() {

    if (quizFinished) {
        return;
    }


    const confirmSubmit =
        confirm(
            "Are you sure you want to submit the quiz?"
        );


    if (!confirmSubmit) {
        return;
    }


    quizFinished = true;


    stopQuestionTimer();
    stopTotalTimer();


    calculateResult();

}


/* =========================================================
   RESULT
========================================================= */

function calculateResult() {

    let correct = 0;
    let wrong = 0;
    let skipped = 0;


    questions.forEach(function (q, index) {

        const selected =
            selectedAnswers[index];


        if (!selected) {

            skipped++;

            return;
        }


        if (
            Number(selected) ===
            Number(q.correctOption)
        ) {

            correct++;

        } else {

            wrong++;

        }

    });


    const total =
        questions.length;


    const positiveMark =
        4;


    const negativeMark =
        1;


    const score =
        (
            correct * positiveMark
        ) -
        (
            wrong * negativeMark
        );


    const accuracy =
        total > 0
            ? Math.round(
                (correct / total) * 100
            )
            : 0;


    localStorage.setItem(
        "quizLastResult",
        JSON.stringify({

            total: total,

            correct: correct,

            wrong: wrong,

            skipped: skipped,

            score: score,

            accuracy: accuracy,

            time: totalSeconds,

            timestamp:
                Date.now()

        })
    );


    /*
       Result page থাকলে সেখানে যাবে
       না থাকলে এখানেই result দেখাবে।
    */

    if (typeof window.showQuizResult === "function") {

        window.showQuizResult();

        return;
    }


    showResultScreen(
        total,
        correct,
        wrong,
        skipped,
        score,
        accuracy
    );

}


/* =========================================================
   RESULT SCREEN
========================================================= */

function showResultScreen(
    total,
    correct,
    wrong,
    skipped,
    score,
    accuracy
) {

    const container =
        document.getElementById(
            "quizContainer"
        );


    container.innerHTML = `

        <div class="question-card">

            <div style="
                text-align:center;
                padding:20px 5px;
            ">

                <div style="
                    font-size:46px;
                    margin-bottom:10px;
                ">
                    🎉
                </div>


                <h2 style="
                    margin:0 0 20px;
                    color:#ffc107;
                ">
                    Quiz Completed
                </h2>


                <div style="
                    display:grid;
                    grid-template-columns:
                        1fr 1fr;
                    gap:10px;
                    text-align:center;
                ">

                    <div style="
                        padding:15px;
                        background:#0d192c;
                        border-radius:12px;
                    ">
                        <div style="
                            color:#8997aa;
                            font-size:12px;
                        ">
                            SCORE
                        </div>

                        <strong style="
                            display:block;
                            font-size:25px;
                            margin-top:5px;
                        ">
                            ${score}
                        </strong>
                    </div>


                    <div style="
                        padding:15px;
                        background:#0d192c;
                        border-radius:12px;
                    ">
                        <div style="
                            color:#8997aa;
                            font-size:12px;
                        ">
                            ACCURACY
                        </div>

                        <strong style="
                            display:block;
                            font-size:25px;
                            margin-top:5px;
                        ">
                            ${accuracy}%
                        </strong>
                    </div>


                    <div style="
                        padding:15px;
                        background:#0d192c;
                        border-radius:12px;
                    ">
                        <div style="
                            color:#69e6a2;
                            font-size:12px;
                        ">
                            CORRECT
                        </div>

                        <strong style="
                            display:block;
                            font-size:22px;
                            margin-top:5px;
                        ">
                            ${correct}
                        </strong>
                    </div>


                    <div style="
                        padding:15px;
                        background:#0d192c;
                        border-radius:12px;
                    ">
                        <div style="
                            color:#ff8585;
                            font-size:12px;
                        ">
                            WRONG
                        </div>

                        <strong style="
                            display:block;
                            font-size:22px;
                            margin-top:5px;
                        ">
                            ${wrong}
                        </strong>
                    </div>


                    <div style="
                        padding:15px;
                        background:#0d192c;
                        border-radius:12px;
                    ">
                        <div style="
                            color:#8997aa;
                            font-size:12px;
                        ">
                            SKIPPED
                        </div>

                        <strong style="
                            display:block;
                            font-size:22px;
                            margin-top:5px;
                        ">
                            ${skipped}
                        </strong>
                    </div>


                    <div style="
                        padding:15px;
                        background:#0d192c;
                        border-radius:12px;
                    ">
                        <div style="
                            color:#8997aa;
                            font-size:12px;
                        ">
                            TIME
                        </div>

                        <strong style="
                            display:block;
                            font-size:22px;
                            margin-top:5px;
                        ">
                            ${formatTime(totalSeconds)}
                        </strong>
                    </div>

                </div>


                <button
                    onclick="location.reload()"
                    style="
                        width:100%;
                        margin-top:20px;
                        min-height:48px;
                        border:0;
                        border-radius:11px;
                        background:#ffc107;
                        color:#111;
                        font-weight:900;
                    "
                >
                    🔄 Reattempt Quiz
                </button>


                <button
                    onclick="goBackToTopic()"
                    style="
                        width:100%;
                        margin-top:10px;
                        min-height:48px;
                        border:0;
                        border-radius:11px;
                        background:#17263d;
                        color:white;
                        font-weight:900;
                    "
                >
                    ← Back to Topic
                </button>

            </div>

        </div>

    `;


    document.getElementById(
        "questionCounter"
    ).textContent =
        `${total} / ${total}`;


    document.getElementById(
        "progressFill"
    ).style.width = "100%";

}


/* =========================================================
   SAVE PROGRESS
========================================================= */

function saveProgress() {

    try {

        const key =
            getProgressKey();


        localStorage.setItem(
            key,
            JSON.stringify({

                currentQuestion:
                    currentQuestion,

                selectedAnswers:
                    selectedAnswers,

                submittedAnswers:
                    submittedAnswers,

                totalSeconds:
                    totalSeconds,

                savedAt:
                    Date.now()

            })
        );

    } catch (error) {

        console.warn(
            "Progress save error:",
            error
        );

    }

}


/* =========================================================
   LOAD PROGRESS
========================================================= */

function loadSavedProgress() {

    try {

        const saved =
            localStorage.getItem(
                getProgressKey()
            );


        if (!saved) {
            return;
        }


        const data =
            JSON.parse(saved);


        /*
          শুধুমাত্র recent progress restore
        */

        if (
            Date.now() -
            Number(data.savedAt || 0)
            >
            24 * 60 * 60 * 1000
        ) {

            return;
        }


        currentQuestion =
            Number(
                data.currentQuestion || 0
            );


        selectedAnswers =
            data.selectedAnswers || {};


        submittedAnswers =
            data.submittedAnswers || {};


        /*
          Total time restore
        */

        totalSeconds =
            Number(
                data.totalSeconds || 0
            );


        /*
          Safety
        */

        if (
            currentQuestion < 0 ||
            currentQuestion >= questions.length
        ) {

            currentQuestion = 0;

        }

    } catch (error) {

        console.warn(
            "Progress restore error:",
            error
        );

    }

}


/* =========================================================
   PROGRESS KEY
========================================================= */

function getProgressKey() {

    return [
        "mneet_quiz_progress",
        getCourseId() || "course",
        getChapterId() || "chapter",
        getTopicId() || "topic",
        getQuizId() || "quiz"
    ].join("_");

}


/* =========================================================
   BACK TO TOPIC
========================================================= */

function goBackToTopic() {

    /*
       topic.html তোমার topic page হলে
    */

    window.location.href =
        "topic.html";

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(message) {

    const container =
        document.getElementById(
            "quizContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="quiz-loading">

            ${escapeHTML(message)}

        </div>

    `;

}


/* =========================================================
   ERROR
========================================================= */

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

            <br><br>

            <button
                onclick="goBackToTopic()"
                style="
                    border:0;
                    border-radius:10px;
                    padding:12px 20px;
                    background:#ffc107;
                    color:#111;
                    font-weight:900;
                "
            >
                ← Back to Topic
            </button>

        </div>

    `;

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Number(seconds) || 0
        );


    const minutes =
        Math.floor(seconds / 60);


    const secs =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   PAGE EXIT
========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        saveProgress();

    }
);


/* =========================================================
   EXPOSE FUNCTIONS
========================================================= */

window.selectOption =
    selectOption;

window.submitAnswer =
    submitAnswer;

window.nextQuestion =
    nextQuestion;

window.previousQuestion =
    previousQuestion;

window.submitQuiz =
    submitQuiz;

window.goBackToTopic =
    goBackToTopic;
