// ==========================================
// mNEET - Chapter Wise Type Quiz
// ==========================================

let courseId = null;
let chapterId = null;
let typeId = null;

let questions = [];
let currentIndex = 0;

let selectedOption = null;
let answerSubmitted = false;

let questionTimer = 60;
let totalSeconds = 0;

let questionInterval = null;
let totalInterval = null;

let answers = [];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        auth.onAuthStateChanged(
            function (user) {

                if (!user) {

                    window.location.href =
                        "index.html";

                    return;
                }


                courseId =
                    localStorage.getItem(
                        "practiceCourse"
                    );


                chapterId =
                    localStorage.getItem(
                        "practiceChapter"
                    );


                typeId =
                    localStorage.getItem(
                        "practiceType"
                    );


                if (
                    !courseId ||
                    !chapterId ||
                    !typeId
                ) {

                    alert(
                        "Practice information is missing."
                    );

                    window.location.href =
                        "student.html";

                    return;
                }


                loadQuestions();

            }
        );

    }
);


// ==========================================
// LOAD QUESTIONS
// ==========================================

function loadQuestions() {

    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("typePractice")
        .doc(typeId)
        .get()

        .then(function (typeDoc) {

            if (typeDoc.exists) {

                const typeData =
                    typeDoc.data();


                document.getElementById(
                    "typeTitle"
                ).textContent =
                    typeData.title ||
                    getTypeTitle(typeId);


                questionTimer =
                    Number(
                        typeData.timePerQuestion
                    ) || 60;

            } else {

                document.getElementById(
                    "typeTitle"
                ).textContent =
                    getTypeTitle(typeId);

            }


            return db.collection("courses")
                .doc(courseId)
                .collection("chapters")
                .doc(chapterId)
                .collection("typePractice")
                .doc(typeId)
                .collection("questions")
                .where(
                    "published",
                    "==",
                    true
                )
                .orderBy(
                    "order",
                    "asc"
                )
                .get();

        })

        .then(function (snapshot) {

            questions = [];


            snapshot.forEach(
                function (doc) {

                    questions.push({
                        id: doc.id,
                        ...doc.data()
                    });

                }
            );


            if (questions.length === 0) {

                showError(
                    "No questions are available yet."
                );

                return;
            }


            document.getElementById(
                "totalQuestions"
            ).textContent =
                questions.length;


            answers =
                new Array(
                    questions.length
                ).fill(null);


            startTotalTimer();

            showQuestion();

        })

        .catch(function (error) {

            console.error(
                "Question loading error:",
                error
            );


            showError(
                "Unable to load questions. Please check Firebase data."
            );

        });

}


// ==========================================
// SHOW QUESTION
// ==========================================

function showQuestion() {

    clearQuestionTimer();


    const question =
        questions[currentIndex];


    selectedOption =
        answers[currentIndex]
            ? answers[currentIndex].selected
            : null;


    answerSubmitted =
        answers[currentIndex]
            ? answers[currentIndex].submitted
            : false;


    document.getElementById(
        "currentQuestion"
    ).textContent =
        currentIndex + 1;


    questionTimer =
        Number(
            question.time ||
            question.timePerQuestion ||
            questionTimer
        );


    if (
        !questionTimer ||
        questionTimer < 1
    ) {

        questionTimer = 60;

    }


    renderQuestion(question);

    startQuestionTimer();

}


// ==========================================
// RENDER QUESTION
// ==========================================

function renderQuestion(question) {

    const container =
        document.getElementById(
            "quizContainer"
        );


    let imageHTML = "";


    if (
        question.questionImageUrl &&
        question.questionImageUrl !==
        "YOUR_IMAGE_URL"
    ) {

        imageHTML = `

            <div class="question-image-box">

                <img
                    src="${escapeAttribute(
                        question.questionImageUrl
                    )}"
                    alt="Question"
                >

            </div>

        `;

    }


    let textHTML = "";


    if (question.questionText) {

        textHTML = `

            <div class="question-text">

                ${escapeHTML(
                    question.questionText
                )}

            </div>

        `;

    }


    const options = [

        question.option1 || "",

        question.option2 || "",

        question.option3 || "",

        question.option4 || ""

    ];


    let optionsHTML = "";


    options.forEach(
        function (option, index) {

            const number =
                index + 1;


            let className =
                "option";


            if (
                selectedOption === number &&
                !answerSubmitted
            ) {

                className +=
                    " selected";

            }


            if (answerSubmitted) {

                const correct =
                    Number(
                        question.correctOption
                    );


                if (number === correct) {

                    className +=
                        " correct";

                }


                if (
                    number === selectedOption &&
                    number !== correct
                ) {

                    className +=
                        " wrong";

                }

            }


            optionsHTML += `

                <button
                    class="${className}"
                    onclick="selectOption(${number})"
                    ${answerSubmitted
                        ? "disabled"
                        : ""}
                >

                    <span class="option-number">

                        ${number}

                    </span>

                    <span class="option-text">

                        ${escapeHTML(option)}

                    </span>

                </button>

            `;

        }
    );


    const solution =
        answerSubmitted
            ? (

                question.solution ||
                "Solution is not available yet."

            )
            : "";


    const ncert =
        answerSubmitted &&
        question.ncertReference
            ? `

                <div style="
                    margin-top:8px;
                    color:#ffc107;
                ">

                    NCERT:
                    ${escapeHTML(
                        question.ncertReference
                    )}

                </div>

            `
            : "";


    container.innerHTML = `

        <div class="question-top">

            <div class="question-number">

                QUESTION ${currentIndex + 1}

            </div>

            <div class="question-status">

                ${
                    answerSubmitted
                        ? "Answer Submitted"
                        : "Not Answered"
                }

            </div>

        </div>


        <div class="question-content">

            ${imageHTML}

            ${textHTML}


            <div class="options">

                ${optionsHTML}

            </div>


            <div
                id="solutionBox"
                class="
                    solution-box
                    ${answerSubmitted
                        ? "show"
                        : ""}
                "
            >

                <div class="solution-title">

                    💡 Solution

                </div>

                <div class="solution-text">

                    ${escapeHTML(solution)}

                    ${ncert}

                </div>

            </div>


            <div class="actions">

                <button
                    class="action-btn"
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
                    class="
                        action-btn
                        answer-btn
                    "
                    onclick="submitAnswer()"
                    ${
                        answerSubmitted
                            ? "disabled"
                            : ""
                    }
                >
                    ${
                        answerSubmitted
                            ? "Submitted ✓"
                            : "Submit Answer"
                    }
                </button>


                ${
                    currentIndex ===
                    questions.length - 1

                        ? `

                            <button
                                class="
                                    action-btn
                                    submit-btn
                                "
                                onclick="submitQuiz()"
                            >
                                Submit Quiz
                            </button>

                        `

                        : `

                            <button
                                class="action-btn"
                                onclick="nextQuestion()"
                            >
                                Next →
                            </button>

                        `
                }

            </div>

        </div>

    `;

}


// ==========================================
// SELECT OPTION
// ==========================================

function selectOption(number) {

    if (answerSubmitted) {
        return;
    }


    selectedOption = number;


    answers[currentIndex] = {

        selected:
            selectedOption,

        submitted:
            false

    };


    renderQuestion(
        questions[currentIndex]
    );

}


// ==========================================
// SUBMIT ANSWER
// ==========================================

function submitAnswer() {

    if (answerSubmitted) {
        return;
    }


    if (!selectedOption) {

        alert(
            "Please select an answer first."
        );

        return;
    }


    answerSubmitted = true;


    answers[currentIndex] = {

        selected:
            selectedOption,

        submitted:
            true

    };


    clearQuestionTimer();


    renderQuestion(
        questions[currentIndex]
    );

}


// ==========================================
// NEXT
// ==========================================

function nextQuestion() {

    saveCurrentAnswer();


    if (
        currentIndex <
        questions.length - 1
    ) {

        currentIndex++;

        showQuestion();

    }

}


// ==========================================
// PREVIOUS
// ==========================================

function previousQuestion() {

    saveCurrentAnswer();


    if (currentIndex > 0) {

        currentIndex--;

        showQuestion();

    }

}


// ==========================================
// SAVE CURRENT
// ==========================================

function saveCurrentAnswer() {

    if (
        selectedOption
    ) {

        answers[currentIndex] = {

            selected:
                selectedOption,

            submitted:
                answerSubmitted

        };

    }

}


// ==========================================
// QUESTION TIMER
// ==========================================

function startQuestionTimer() {

    clearQuestionTimer();


    updateQuestionTimer();


    questionInterval =
        setInterval(
            function () {

                questionTimer--;


                updateQuestionTimer();


                if (
                    questionTimer <= 0
                ) {

                    clearQuestionTimer();


                    autoMoveNext();

                }

            },
            1000
        );

}


// ==========================================
// QUESTION TIMER DISPLAY
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
        questionTimer + "s";

}


// ==========================================
// AUTO NEXT
// ==========================================

function autoMoveNext() {

    if (!answerSubmitted) {

        if (selectedOption) {

            answerSubmitted = true;


            answers[currentIndex] = {

                selected:
                    selectedOption,

                submitted:
                    true

            };

        } else {

            answers[currentIndex] = {

                selected:
                    null,

                submitted:
                    false

            };

        }

    }


    if (
        currentIndex <
        questions.length - 1
    ) {

        currentIndex++;

        showQuestion();

    } else {

        submitQuiz();

    }

}


// ==========================================
// CLEAR QUESTION TIMER
// ==========================================

function clearQuestionTimer() {

    if (questionInterval) {

        clearInterval(
            questionInterval
        );

        questionInterval = null;

    }

}


// ==========================================
// TOTAL TIMER
// ==========================================

function startTotalTimer() {

    totalSeconds = 0;


    updateTotalTimer();


    if (totalInterval) {

        clearInterval(
            totalInterval
        );

    }


    totalInterval =
        setInterval(
            function () {

                totalSeconds++;

                updateTotalTimer();

            },
            1000
        );

}


// ==========================================
// TOTAL TIMER DISPLAY
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
        String(minutes)
            .padStart(2, "0")
        + ":" +
        String(seconds)
            .padStart(2, "0");

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

function submitQuiz() {

    saveCurrentAnswer();


    clearQuestionTimer();


    if (totalInterval) {

        clearInterval(
            totalInterval
        );

        totalInterval = null;

    }


    let correct = 0;

    let incorrect = 0;

    let skipped = 0;


    questions.forEach(
        function (question, index) {

            const answer =
                answers[index];


            if (
                !answer ||
                !answer.selected
            ) {

                skipped++;

                return;

            }


            if (
                Number(
                    answer.selected
                ) ===
                Number(
                    question.correctOption
                )
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
        (incorrect * 1);


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

        typeId:
            typeId,

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

        totalSeconds:
            totalSeconds,

        completedAt:
            Date.now()

    };


    sessionStorage.setItem(
        "typeQuizResult",
        JSON.stringify(result)
    );


    sessionStorage.setItem(
        "typeQuizAnswers",
        JSON.stringify(answers)
    );


    window.location.href =
        "type-result.html";

}


// ==========================================
// EXIT
// ==========================================

function exitTypeQuiz() {

    const leave =
        confirm(
            "Are you sure you want to leave this quiz?"
        );


    if (leave) {

        clearQuestionTimer();


        if (totalInterval) {

            clearInterval(
                totalInterval
            );

        }


        window.location.href =
            "chapter-practice.html";

    }

}


// ==========================================
// TYPE TITLE
// ==========================================

function getTypeTitle(id) {

    const titles = {

        "assertion-reason":
            "Assertion & Reason",

        "statement-based":
            "Statement Based",

        "match-following":
            "Match the Following",

        "diagram-based":
            "Diagram Based",

        "pyq":
            "PYQ",

        "rapid-revision":
            "Rapid Revision"

    };


    return (
        titles[id] ||
        "Chapter Practice"
    );

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    document.getElementById(
        "quizContainer"
    ).innerHTML = `

        <div class="error">

            ${escapeHTML(message)}

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


// =======================
