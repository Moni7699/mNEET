// ==========================================
// mNEET - QUIZ SYSTEM
// ==========================================

let currentUser = null;

let courseId = null;
let chapterId = null;
let topicId = null;

let questions = [];
let currentQuestion = 0;

let selectedAnswers = {};
let submittedAnswers = {};

let questionTimer = null;
let totalTimer = null;

let questionTimeLeft = 60;
let totalSeconds = 0;

let quizStarted = false;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (typeof auth === "undefined") {

        console.error("Firebase Auth not loaded");

        showQuizError(
            "Firebase Auth load হয়নি।"
        );

        return;
    }


    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        currentUser = user;


        courseId =
            localStorage.getItem("quizCourse") ||
            localStorage.getItem("activeCourse");


        chapterId =
            localStorage.getItem("quizChapter") ||
            localStorage.getItem("activeChapter");


        topicId =
            localStorage.getItem("quizTopic") ||
            localStorage.getItem("activeTopic");


        console.log("QUIZ IDS:", {
            courseId,
            chapterId,
            topicId
        });


        if (
            !courseId ||
            !chapterId ||
            !topicId
        ) {

            showQuizError(
                "Quiz information missing. Topic থেকে আবার Quiz খুলুন।"
            );

            return;
        }


        loadQuestions();

    });

});


// ==========================================
// LOAD QUESTIONS
// ==========================================

function loadQuestions() {

    const container =
        document.getElementById(
            "quizContainer"
        );


    if (container) {

        container.innerHTML = `
            <div class="quiz-loading">
                Loading questions...
            </div>
        `;

    }


    /*
     * Main Firestore structure:
     *
     * courses
     *   courseId
     *     chapters
     *       chapterId
     *         topics
     *           topicId
     *             quizzes
     *               question documents
     */


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("quizzes")
        .get()

        .then(function (snapshot) {

            console.log(
                "Quiz documents:",
                snapshot.size
            );


            questions = [];


            snapshot.forEach(function (doc) {

                const data =
                    doc.data();


                questions.push({

                    id: doc.id,

                    question:
                        data.question ||
                        data.questionText ||
                        "",

                    option1:
                        data.option1 ||
                        "",

                    option2:
                        data.option2 ||
                        "",

                    option3:
                        data.option3 ||
                        "",

                    option4:
                        data.option4 ||
                        "",

                    answer:
                        data.answer,

                    solution:
                        data.solution ||
                        "",

                    reference:
                        data.reference ||
                        data.ncertReference ||
                        ""

                });

            });


            /*
             * যদি quizzes collection-এ question না থাকে,
             * তাহলে singular "quiz" collection try করবে।
             */

            if (questions.length === 0) {

                return loadSingularQuiz();

            }


            startQuiz();

        })

        .catch(function (error) {

            console.error(
                "Quiz collection error:",
                error
            );


            /*
             * প্রথম path fail করলে singular quiz try করবে।
             */

            loadSingularQuiz();

        });

}


// ==========================================
// FALLBACK: quiz COLLECTION
// ==========================================

function loadSingularQuiz() {

    console.log(
        "Trying singular quiz collection..."
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
                "Singular quiz documents:",
                snapshot.size
            );


            questions = [];


            snapshot.forEach(function (doc) {

                const data =
                    doc.data();


                questions.push({

                    id: doc.id,

                    question:
                        data.question ||
                        data.questionText ||
                        "",

                    option1:
                        data.option1 ||
                        "",

                    option2:
                        data.option2 ||
                        "",

                    option3:
                        data.option3 ||
                        "",

                    option4:
                        data.option4 ||
                        "",

                    answer:
                        data.answer,

                    solution:
                        data.solution ||
                        "",

                    reference:
                        data.reference ||
                        data.ncertReference ||
                        ""

                });

            });


            if (questions.length === 0) {

                showQuizError(
                    "এই topic-এর মধ্যে কোনো question পাওয়া যায়নি।"
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
                "Question load করা যাচ্ছে না। Firestore path/check করুন।"
            );

        });

}


// ==========================================
// START QUIZ
// ==========================================

function startQuiz() {

    currentQuestion = 0;

    selectedAnswers = {};

    submittedAnswers = {};

    totalSeconds = 0;

    quizStarted = true;


    const title =
        document.getElementById(
            "quizTitle"
        );


    if (title) {

        title.textContent =
            "NEET Biology Quiz";

    }


    updateTotalTimer();

    startTotalTimer();

    showQuestion();

}


// ==========================================
// SHOW QUESTION
// ==========================================

function showQuestion() {

    stopQuestionTimer();


    if (
        currentQuestion < 0
    ) {

        currentQuestion = 0;

    }


    if (
        currentQuestion >=
        questions.length
    ) {

        currentQuestion =
            questions.length - 1;

    }


    const q =
        questions[currentQuestion];


    if (!q) {

        showQuizError(
            "Question পাওয়া যাচ্ছে না."
        );

        return;

    }


    updateQuestionInfo();

    updateProgress();

    renderQuestion(q);

    startQuestionTimer();

}


// ==========================================
// RENDER QUESTION
// ==========================================

function renderQuestion(q) {

    const container =
        document.getElementById(
            "quizContainer"
        );


    if (!container) {

        return;

    }


    const savedAnswer =
        selectedAnswers[
            currentQuestion
        ];


    const submitted =
        submittedAnswers[
            currentQuestion
        ] === true;


    const correctAnswer =
        normalizeAnswer(
            q.answer
        );


    let html = `

        <div class="question-card">

            <p class="question-text">

                ${escapeHTML(
                    q.question ||
                    "Question not available"
                )}

            </p>


            <div class="options">

    `;


    const options = [
        q.option1,
        q.option2,
        q.option3,
        q.option4
    ];


    options.forEach(function (
        option,
        index
    ) {

        const optionNumber =
            index + 1;


        const selected =
            String(savedAnswer) ===
            String(optionNumber);


        const isCorrect =
            submitted &&
            correctAnswer ===
            String(optionNumber);


        const isWrong =
            submitted &&
            selected &&
            !isCorrect;


        let classes =
            "option";


        if (selected) {

            classes +=
                " selected";

        }


        if (isCorrect) {

            classes +=
                " correct";

        }


        if (isWrong) {

            classes +=
                " wrong";

        }


        if (submitted) {

            classes +=
                " disabled";

        }


        html += `

            <button
                type="button"
                class="${classes}"
                onclick="selectOption(${optionNumber})"
            >

                <span class="option-letter">
                    ${optionNumber}
                </span>

                <span class="option-text">
                    ${escapeHTML(
                        option || ""
                    )}
                </span>

            </button>

        `;

    });


    html += `
            </div>
    `;


    /*
     * Submit Answer
     */

    if (!submitted) {

        html += `

            <button
                type="button"
                class="submit-answer-button"
                onclick="submitAnswer()"
                ${savedAnswer ? "" : "disabled"}
            >

                Submit Answer

            </button>

        `;

    }


    /*
     * Answer status
     */

    if (submitted) {

        const correct =
            correctAnswer ===
            String(savedAnswer);


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


        /*
         * Solution
         */

        if (
            q.solution ||
            q.reference
        ) {

            html += `

                <div class="
                    solution-box
                    show
                ">

                    <div class="solution-title">
                        💡 Solution
                    </div>

                    <div class="solution-text">
                        ${escapeHTML(
                            q.solution ||
                            "Solution not available."
                        )}
                    </div>

                    ${
                        q.reference
                            ? `
                                <div class="reference-text">
                                    📖 NCERT Reference:
                                    ${escapeHTML(
                                        q.reference
                                    )}
                                </div>
                              `
                            : ""
                    }

                </div>

            `;

        }

    }


    /*
     * Navigation
     */

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
                        ? "Last"
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


    container.innerHTML =
        html;

}


// ==========================================
// SELECT OPTION
// ==========================================

function selectOption(
    optionNumber
) {

    if (
        submittedAnswers[
            currentQuestion
        ] === true
    ) {

        return;

    }


    selectedAnswers[
        currentQuestion
    ] =
        optionNumber;


    showQuestion();

}


// ==========================================
// SUBMIT ANSWER
// ==========================================

function submitAnswer() {

    const selected =
        selectedAnswers[
            currentQuestion
        ];


    if (!selected) {

        alert(
            "Please select an answer first."
        );

        return;

    }


    submittedAnswers[
        currentQuestion
    ] = true;


    stopQuestionTimer();

    showQuestion();

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

        showQuestion();

    }

}


// ==========================================
// PREVIOUS
// ==========================================

function previousQuestion() {

    if (
        currentQuestion > 0
    ) {

        currentQuestion--;

        showQuestion();

    }

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

function submitQuiz() {

    if (
        !questions.length
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Submit this quiz and see your result?"
        );


    if (!confirmed) {

        return;

    }


    stopQuestionTimer();

    stopTotalTimer();


    let correct = 0;
    let incorrect = 0;
    let skipped = 0;


    questions.forEach(
        function (
            q,
            index
        ) {

            const selected =
                selectedAnswers[index];


            if (!selected) {

                skipped++;

                return;

            }


            const correctAnswer =
                normalizeAnswer(
                    q.answer
                );


            if (
                String(selected) ===
                correctAnswer
            ) {

                correct++;

            } else {

                incorrect++;

            }

        }
    );


    const total =
        questions.length;


    const score =
        (correct * 4) -
        incorrect;


    const accuracy =
        total > 0
            ? Math.round(
                (correct / total) * 100
            )
            : 0;


    const result = {

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
            totalSeconds,

        submittedAt:
            Date.now()

    };


    console.log(
        "FINAL RESULT:",
        result
    );


    localStorage.setItem(
        "quizResult",
        JSON.stringify(result)
    );


    /*
     * Keep navigation IDs
     */

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


    questionTimeLeft =
        60;


    updateQuestionTimer();


    questionTimer =
        setInterval(
            function () {

                questionTimeLeft--;


                updateQuestionTimer();


                if (
                    questionTimeLeft <= 0
                ) {

                    stopQuestionTimer();


                    /*
                     * Time শেষ হলে answer
                     * automatically submit হবে না।
                     *
                     * User পরের question-এ যেতে পারবে।
                     */

                    if (
                        currentQuestion <
                        questions.length - 1
                    ) {

                        currentQuestion++;

                        showQuestion();

                    }

                }

            },
            1000
        );

}


// ==========================================
// STOP QUESTION TIMER
// ==========================================

function stopQuestionTimer() {

    if (questionTimer) {

        clearInterval(
            questionTimer
        );

        questionTimer = null;

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
// TOTAL TIMER
// ==========================================

function startTotalTimer() {

    stopTotalTimer();


    totalTimer =
        setInterval(
            function () {

                totalSeconds++;

                updateTotalTimer();

            },
            1000
        );

}


// ==========================================
// STOP TOTAL TIMER
// ==========================================

function stopTotalTimer() {

    if (totalTimer) {

        clearInterval(
            totalTimer
        );

        totalTimer = null;

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


    element.textContent =
        formatTime(
            totalSeconds
        );

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
            (
                currentQuestion + 1
            ) +
            " / " +
            questions.length;

    }

}


// ==========================================
// PROGRESS
// ==========================================

function updateProgress() {

    const fill =
        document.getElementById(
            "progressFill"
        );


    if (!fill) {

        return;

    }


    const percent =
        questions.length > 0
            ? (
                (
                    currentQuestion + 1
                ) /
                questions.length
            ) * 100
            : 0;


    fill.style.width =
        percent + "%";

}


// ==========================================
// ERROR
// ==========================================

function showQuizError(
    message
) {

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
// NORMALIZE ANSWER
// ==========================================

function normalizeAnswer(
    answer
) {

    if (
        answer === undefined ||
        answer === null
    ) {

        return "";

    }


    let value =
        String(answer)
            .trim()
            .toLowerCase();


    /*
     * Supports:
     *
     * 1
     * 2
     * 3
     * 4
     *
     * A
     * B
     * C
     * D
     *
     * option1
     * option2
     * option3
     * option4
     */


    if (
        value === "a" ||
        value === "option1" ||
        value === "option 1"
    ) {

        return "1";

    }


    if (
        value === "b" ||
        value === "option2" ||
        value === "option 2"
    ) {

        return "2";

    }


    if (
        value === "c" ||
        value === "option3" ||
        value === "option 3"
    ) {

        return "3";

    }


    if (
        value === "d" ||
        value === "option4" ||
        value === "option 4"
    ) {

        return "4";

    }


    return value;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

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
// FORMAT TIME
// ==========================================

function formatTime(
    seconds
) {

    seconds =
        Number(seconds || 0);


    const minutes =
        Math.floor(
            seconds / 60
        );


    const sec =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":" +
        String(sec)
            .padStart(2, "0")
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
        courseId ||
        localStorage.getItem(
            "quizCourse"
        )
    );


    localStorage.setItem(
        "activeChapter",
        chapterId ||
        localStorage.getItem(
            "quizChapter"
        )
    );


    localStorage.setItem(
        "activeTopic",
        topicId ||
        localStorage.getItem(
            "quizTopic"
        )
    );


    window.location.href =
        "topic.html";

}
