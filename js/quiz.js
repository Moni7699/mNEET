// ======================================================
// mNEET - QUIZ SYSTEM
// Firestore Structure:
//
// courses/{courseId}
//   /chapters/{chapterId}
//   /topics/{topicId}
//   /quiz/{quizId}
//   /questions/{questionId}
// ======================================================


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let currentUser = null;

let courseId = null;
let chapterId = null;
let topicId = null;
let quizId = null;

let questions = [];
let currentQuestion = 0;

let selectedOption = null;

let answers = {};

let questionTimer = 60;
let totalSeconds = 0;

let questionTimerInterval = null;
let totalTimerInterval = null;

let answerSubmitted = false;

let quizFinished = false;


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    if (
        typeof firebase === "undefined" ||
        typeof auth === "undefined" ||
        typeof db === "undefined"
    ) {

        showQuizError(
            "Firebase library load হয়নি।"
        );

        return;
    }


    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href = "index.html";

            return;
        }


        currentUser = user;


        // ----------------------------------------------
        // GET SAVED IDs
        // ----------------------------------------------

        courseId =
            localStorage.getItem("quizCourse") ||
            localStorage.getItem("activeCourse");


        chapterId =
            localStorage.getItem("quizChapter") ||
            localStorage.getItem("activeChapter");


        topicId =
            localStorage.getItem("quizTopic") ||
            localStorage.getItem("activeTopic");


        // ----------------------------------------------
        // CHECK IDs
        // ----------------------------------------------

        if (
            !courseId ||
            !chapterId ||
            !topicId
        ) {

            showQuizError(
                "Quiz information পাওয়া যায়নি।"
            );

            return;
        }


        // ----------------------------------------------
        // START
        // ----------------------------------------------

        loadQuiz();

    });

});


// ======================================================
// LOAD QUIZ
// ======================================================

function loadQuiz() {

    setQuizTitle("Loading Quiz...");

    setLoading();


    const topicRef =
        db.collection("courses")
            .doc(courseId)
            .collection("chapters")
            .doc(chapterId)
            .collection("topics")
            .doc(topicId);


    // --------------------------------------------------
    // STEP 1
    // Find quiz collection
    // --------------------------------------------------

    topicRef
        .collection("quiz")
        .get()

        .then(function (quizSnapshot) {

            if (quizSnapshot.empty) {

                showQuizError(
                    "এই topic-এর মধ্যে কোনো quiz পাওয়া যায়নি।"
                );

                return;
            }


            // --------------------------------------------------
            // Select published quiz
            // --------------------------------------------------

            let selectedQuizDoc = null;


            quizSnapshot.forEach(function (doc) {

                const data = doc.data();


                if (
                    selectedQuizDoc === null &&
                    data.published !== false
                ) {

                    selectedQuizDoc = doc;

                }

            });


            // If no published quiz exists,
            // use first quiz document

            if (!selectedQuizDoc) {

                selectedQuizDoc =
                    quizSnapshot.docs[0];

            }


            quizId =
                selectedQuizDoc.id;


            const quizData =
                selectedQuizDoc.data();


            setQuizTitle(
                quizData.title ||
                quizData.name ||
                "Practice Quiz"
            );


            // --------------------------------------------------
            // STEP 2
            // Load Questions
            // --------------------------------------------------

            return selectedQuizDoc.ref
                .collection("questions")
                .get();

        })

        .then(function (questionSnapshot) {

            if (!questionSnapshot) {

                return;

            }


            if (questionSnapshot.empty) {

                showQuizError(
                    "এই quiz-এর মধ্যে কোনো question পাওয়া যায়নি।"
                );

                return;

            }


            questions = [];


            questionSnapshot.forEach(function (doc) {

                const data =
                    doc.data();


                // Only published questions
                if (data.published === false) {

                    return;

                }


                questions.push({

                    id: doc.id,

                    questionText:
                        data.questionText ||
                        data.question ||
                        "",

                    imageUrl:
                        data.imageUrl ||
                        data.questionImageUrl ||
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

                    correctOption:
                        Number(
                            data.correctOption
                        ),

                    solution:
                        data.solution ||
                        "",

                    reference:
                        data.reference ||
                        data.ncertReference ||
                        "",

                    order:
                        Number(
                            data.order || 999999
                        )

                });

            });


            // --------------------------------------------------
            // SORT BY ORDER
            // --------------------------------------------------

            questions.sort(function (a, b) {

                return a.order - b.order;

            });


            if (questions.length === 0) {

                showQuizError(
                    "কোনো published question পাওয়া যায়নি।"
                );

                return;

            }


            // --------------------------------------------------
            // START QUIZ
            // --------------------------------------------------

            currentQuestion = 0;

            answers = {};

            quizFinished = false;


            startTotalTimer();


            renderQuestion();

        })

        .catch(function (error) {

            console.error(
                "QUIZ FIRESTORE ERROR:",
                error
            );


            showQuizError(
                "Quiz load করতে সমস্যা হয়েছে।"
            );

        });

}


// ======================================================
// RENDER QUESTION
// ======================================================

function renderQuestion() {

    if (
        currentQuestion < 0 ||
        currentQuestion >= questions.length
    ) {

        return;

    }


    const question =
        questions[currentQuestion];


    selectedOption =
        answers[question.id] ?
        answers[question.id].selected :
        null;


    answerSubmitted =
        answers[question.id] ?
        answers[question.id].submitted :
        false;


    // --------------------------------------------------
    // QUESTION TIMER
    // --------------------------------------------------

    startQuestionTimer();


    // --------------------------------------------------
    // COUNTER
    // --------------------------------------------------

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


    // --------------------------------------------------
    // PROGRESS
    // --------------------------------------------------

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


    // --------------------------------------------------
    // CONTAINER
    // --------------------------------------------------

    const container =
        document.getElementById(
            "quizContainer"
        );


    if (!container) {

        return;

    }


    // --------------------------------------------------
    // IMAGE
    // --------------------------------------------------

    let imageHTML = "";


    if (question.imageUrl) {

        imageHTML = `

            <img
                class="question-image"
                src="${escapeHTML(question.imageUrl)}"
                alt="Question Image"
                onerror="this.style.display='none'"
            >

        `;

    }


    // --------------------------------------------------
    // OPTIONS
    // --------------------------------------------------

    const optionData = [

        {
            number: 1,
            text: question.option1
        },

        {
            number: 2,
            text: question.option2
        },

        {
            number: 3,
            text: question.option3
        },

        {
            number: 4,
            text: question.option4
        }

    ];


    let optionsHTML = "";


    optionData.forEach(function (option) {

        if (!option.text) {

            return;

        }


        let classes =
            "option";


        // Selected before submit
        if (
            selectedOption === option.number &&
            !answerSubmitted
        ) {

            classes +=
                " selected";

        }


        // After submit
        if (answerSubmitted) {

            if (
                option.number ===
                question.correctOption
            ) {

                classes +=
                    " correct";

            }


            if (
                selectedOption === option.number &&
                option.number !==
                question.correctOption
            ) {

                classes +=
                    " wrong";

            }


            classes +=
                " disabled";

        }


        optionsHTML += `

            <button
                type="button"
                class="${classes}"
                onclick="selectOption(${option.number})"
            >

                <span class="option-letter">
                    ${option.number}
                </span>

                <span class="option-text">
                    ${escapeHTML(option.text)}
                </span>

            </button>

        `;

    });


    // --------------------------------------------------
    // ANSWER STATUS
    // --------------------------------------------------

    let statusHTML = "";


    if (answerSubmitted) {

        const correct =
            selectedOption ===
            question.correctOption;


        if (correct) {

            statusHTML = `

                <div
                    class="answer-status
                    show
                    correct-status"
                >
                    ✅ Correct Answer
                </div>

            `;

        } else {

            statusHTML = `

                <div
                    class="answer-status
                    show
                    wrong-status"
                >
                    ❌ Wrong Answer.
                    Correct answer:
                    Option ${question.correctOption}
                </div>

            `;

        }

    }


    // --------------------------------------------------
    // SOLUTION
    // --------------------------------------------------

    let solutionHTML = "";


    if (
        answerSubmitted &&
        (
            question.solution ||
            question.reference
        )
    ) {

        solutionHTML = `

            <div class="solution-box show">

                <div class="solution-title">
                    📖 Solution
                </div>

                <div class="solution-text">
                    ${escapeHTML(
                        question.solution ||
                        "Solution available."
                    )}
                </div>

                ${
                    question.reference
                    ?
                    `
                    <div class="reference-text">
                        📚 NCERT Reference:
                        ${escapeHTML(
                            question.reference
                        )}
                    </div>
                    `
                    :
                    ""
                }

            </div>

        `;

    }


    // --------------------------------------------------
    // SUBMIT BUTTON
    // --------------------------------------------------

    let submitButtonHTML = "";


    if (!answerSubmitted) {

        submitButtonHTML = `

            <button
                id="submitAnswerButton"
                class="submit-answer-button"
                onclick="submitAnswer()"
                ${selectedOption === null ? "disabled" : ""}
            >
                Submit Answer
            </button>

        `;

    }


    // --------------------------------------------------
    // NAVIGATION
    // --------------------------------------------------

    const previousDisabled =
        currentQuestion === 0
            ? "disabled"
            : "";


    const nextText =
        currentQuestion ===
        questions.length - 1
            ? "Finish Quiz"
            : "Next →";


    container.innerHTML = `

        <div class="question-card">

            ${
                question.questionText
                ?
                `
                <p class="question-text">
                    ${escapeHTML(
                        question.questionText
                    )}
                </p>
                `
                :
                ""
            }

            ${imageHTML}

            <div class="options">

                ${optionsHTML}

            </div>

            ${statusHTML}

            ${solutionHTML}

            ${submitButtonHTML}

        </div>


        <div class="quiz-actions">

            <button
                class="quiz-button previous-button"
                onclick="previousQuestion()"
                ${previousDisabled}
            >
                ← Previous
            </button>


            <button
                class="quiz-button next-button"
                onclick="nextQuestion()"
            >
                ${nextText}
            </button>

        </div>


        <button
            class="submit-quiz-button"
            onclick="finishQuiz()"
        >
            Submit Quiz
        </button>

    `;

}


// ======================================================
// SELECT OPTION
// ======================================================

function selectOption(optionNumber) {

    if (answerSubmitted) {

        return;

    }


    selectedOption =
        Number(optionNumber);


    const question =
        questions[currentQuestion];


    if (!question) {

        return;

    }


    answers[question.id] = {

        selected:
            selectedOption,

        submitted:
            false

    };


    renderQuestion();

}


// ======================================================
// SUBMIT ANSWER
// ======================================================

function submitAnswer() {

    if (answerSubmitted) {

        return;

    }


    if (selectedOption === null) {

        alert(
            "প্রথমে একটি answer select করো।"
        );

        return;

    }


    const question =
        questions[currentQuestion];


    if (!question) {

        return;

    }


    answers[question.id] = {

        selected:
            selectedOption,

        submitted:
            true

    };


    answerSubmitted = true;


    // Stop question timer
    stopQuestionTimer();


    renderQuestion();

}


// ======================================================
// PREVIOUS QUESTION
// ======================================================

function previousQuestion() {

    if (currentQuestion <= 0) {

        return;

    }


    currentQuestion--;


    renderQuestion();

}


// ======================================================
// NEXT QUESTION
// ======================================================

function nextQuestion() {

    if (
        currentQuestion >=
        questions.length - 1
    ) {

        finishQuiz();

        return;

    }


    currentQuestion++;


    renderQuestion();

}


// ======================================================
// QUESTION TIMER
// ======================================================

function startQuestionTimer() {

    stopQuestionTimer();


    questionTimer = 60;


    updateQuestionTimer();


    questionTimerInterval =
        setInterval(function () {

            if (quizFinished) {

                stopQuestionTimer();

                return;

            }


            if (answerSubmitted) {

                stopQuestionTimer();

                return;

            }


            questionTimer--;


            updateQuestionTimer();


            if (questionTimer <= 0) {

                stopQuestionTimer();


                autoSubmitCurrentAnswer();

            }

        }, 1000);

}


// ======================================================
// STOP QUESTION TIMER
// ======================================================

function stopQuestionTimer() {

    if (questionTimerInterval) {

        clearInterval(
            questionTimerInterval
        );

        questionTimerInterval = null;

    }

}


// ======================================================
// UPDATE QUESTION TIMER
// ======================================================

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


// ======================================================
// AUTO SUBMIT
// ======================================================

function autoSubmitCurrentAnswer() {

    const question =
        questions[currentQuestion];


    if (!question) {

        return;

    }


    // If nothing selected,
    // mark as skipped

    if (selectedOption === null) {

        answers[question.id] = {

            selected:
                null,

            submitted:
                true,

            skipped:
                true

        };

    } else {

        answers[question.id] = {

            selected:
                selectedOption,

            submitted:
                true

        };

    }


    answerSubmitted = true;


    renderQuestion();

}


// ======================================================
// TOTAL TIMER
// ======================================================

function startTotalTimer() {

    stopTotalTimer();


    totalSeconds = 0;


    updateTotalTimer();


    totalTimerInterval =
        setInterval(function () {

            if (quizFinished) {

                stopTotalTimer();

                return;

            }


            totalSeconds++;


            updateTotalTimer();

        }, 1000);

}


// ======================================================
// STOP TOTAL TIMER
// ======================================================

function stopTotalTimer() {

    if (totalTimerInterval) {

        clearInterval(
            totalTimerInterval
        );

        totalTimerInterval = null;

    }

}


// ======================================================
// UPDATE TOTAL TIMER
// ======================================================

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


// ======================================================
// FINISH QUIZ
// ======================================================

function finishQuiz() {

    if (quizFinished) {

        return;

    }


    const confirmed =
        confirm(
            "Quiz submit করবে?"
        );


    if (!confirmed) {

        return;

    }


    quizFinished = true;


    stopQuestionTimer();

    stopTotalTimer();


    // --------------------------------------------------
    // CALCULATE RESULT
    // --------------------------------------------------

    let correct = 0;
    let wrong = 0;
    let skipped = 0;


    questions.forEach(function (question) {

        const answer =
            answers[question.id];


        if (
            !answer ||
            answer.selected === null ||
            answer.selected === undefined
        ) {

            skipped++;

            return;

        }


        if (
            Number(answer.selected) ===
            Number(question.correctOption)
        ) {

            correct++;

        } else {

            wrong++;

        }

    });


    const total =
        questions.length;


    const attempted =
        correct + wrong;


    const score =
        (correct * 4) -
        (wrong * 1);


    const accuracy =
        attempted > 0
            ?
            Math.round(
                (correct / attempted) * 100
            )
            :
            0;


    const completion =
        total > 0
            ?
            Math.round(
                (attempted / total) * 100
            )
            :
            0;


    // --------------------------------------------------
    // SAVE RESULT LOCALLY
    // --------------------------------------------------

    const result = {

        courseId:
            courseId,

        chapterId:
            chapterId,

        topicId:
            topicId,

        quizId:
            quizId,

        total:
            total,

        correct:
            correct,

        wrong:
            wrong,

        skipped:
            skipped,

        attempted:
            attempted,

        score:
            score,

        accuracy:
            accuracy,

        completion:
            completion,

        totalSeconds:
            totalSeconds,

        date:
            new Date().toISOString()

    };


    localStorage.setItem(
        "lastQuizResult",
        JSON.stringify(result)
    );


    // --------------------------------------------------
    // GO RESULT PAGE
    // --------------------------------------------------

    window.location.href =
        "result.html";

}


// ======================================================
// BACK TO TOPIC
// ======================================================

function goBackToTopic() {

    stopQuestionTimer();

    stopTotalTimer();


    window.location.href =
        "topic.html";

}


// ======================================================
// SET QUIZ TITLE
// ======================================================

function setQuizTitle(title) {

    const element =
        document.getElementById(
            "quizTitle"
        );


    if (element) {

        element.textContent =
            title;

    }

}


// ======================================================
// LOADING
// ======================================================

function setLoading() {

    const container =
        document.getElementById(
            "quizContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="quiz-loading">

            Loading questions...

        </div>

    `;

}


// ======================================================
// ERROR
// ======================================================

function showQuizError(message) {

    const container =
        document.getElementById(
            "quizContainer"
        );


    if (container) {

        container.innerHTML = `

            <div class="quiz-error">

                ⚠️

                <br><br>

                ${escapeHTML(message)}

                <br><br>

                <button
                    class="quiz-button next-button"
                    onclick="goBackToTopic()"
                    style="padding:12px 22px;"
                >
                    ← Back to Topic
                </button>

            </div>

        `;

    }


    setQuizTitle(
        "Quiz Loading Error"
    );


    const counter =
        document.getElementById(
            "questionCounter"
        );


    if (counter) {

        counter.textContent =
            "0 / 0";

    }


    console.error(
        "mNEET Quiz Error:",
        message
    );

}


// ======================================================
// HTML ESCAPE
// ======================================================

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
