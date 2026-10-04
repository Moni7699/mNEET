// ==========================================
// mNEET - Quiz Engine
// ==========================================

let currentUser = null;

let courseId = null;
let chapterId = null;
let topicId = null;

let quizId = "quiz-01";

let quizData = null;
let questions = [];

let currentIndex = 0;

let selectedOption = null;

let answered = false;

let questionTimeLeft = 60;
let perQuestionTime = 60;

let questionTimer = null;
let totalTimer = null;

let totalSeconds = 0;

let answers = {};


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


                currentUser = user;


                courseId =
                    localStorage.getItem(
                        "quizCourse"
                    ) ||
                    localStorage.getItem(
                        "activeCourse"
                    );


                chapterId =
                    localStorage.getItem(
                        "quizChapter"
                    ) ||
                    localStorage.getItem(
                        "activeChapter"
                    );


                topicId =
                    localStorage.getItem(
                        "quizTopic"
                    ) ||
                    localStorage.getItem(
                        "activeTopic"
                    );


                if (
                    !courseId ||
                    !chapterId ||
                    !topicId
                ) {

                    alert(
                        "Quiz information is missing."
                    );

                    window.location.href =
                        "student.html";

                    return;
                }


                loadQuiz();

            }
        );

    }
);


// ==========================================
// LOAD QUIZ
// ==========================================

function loadQuiz() {

    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("quiz")
        .doc(quizId)
        .get()

        .then(function (quizDoc) {

            if (!quizDoc.exists) {

                showQuizError(
                    "Quiz not found."
                );

                return;
            }


            quizData =
                quizDoc.data();


            if (
                quizData.published === false
            ) {

                showQuizError(
                    "This quiz is not available yet."
                );

                return;
            }


            document.getElementById(
                "quizTitle"
            ).textContent =
                quizData.title ||
                "NEET Practice Quiz";


            perQuestionTime =
                Number(
                    quizData.timePerQuestion ||
                    60
                );


            questionTimeLeft =
                perQuestionTime;


            loadQuestions();

        })

        .catch(function (error) {

            console.error(
                "Quiz loading error:",
                error
            );


            showQuizError(
                "Unable to load quiz."
            );

        });

}


// ==========================================
// LOAD QUESTIONS
// ==========================================

function loadQuestions() {

    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("quiz")
        .doc(quizId)
        .collection("questions")
        .orderBy("order", "asc")
        .get()

        .then(function (snapshot) {

            questions = [];


            snapshot.forEach(
                function (doc) {

                    const question =
                        doc.data();


                    if (
                        question.published === false
                    ) {

                        return;
                    }


                    questions.push({

                        id: doc.id,

                        ...question

                    });

                }
            );


            if (questions.length === 0) {

                showQuizError(
                    "No questions are available yet."
                );

                return;
            }


            document.getElementById(
                "totalQuestions"
            ).textContent =
                questions.length;


            startQuiz();

        })

        .catch(function (error) {

            console.error(
                "Question loading error:",
                error
            );


            showQuizError(
                "Unable to load questions."
            );

        });

}


// ==========================================
// START QUIZ
// ==========================================

function startQuiz() {

    currentIndex = 0;

    totalSeconds = 0;

    answers = {};

    answered = false;

    startTotalTimer();

    renderQuestion();

}


// ==========================================
// RENDER QUESTION
// ==========================================

function renderQuestion() {

    clearQuestionTimer();


    selectedOption =
        answers[currentIndex]
            ? answers[currentIndex].selected
            : null;


    answered =
        answers[currentIndex]
            ? answers[currentIndex].answered
            : false;


    const question =
        questions[currentIndex];


    if (!question) {

        return;
    }


    document.getElementById(
        "currentQuestion"
    ).textContent =
        currentIndex + 1;


    questionTimeLeft =
        perQuestionTime;


    const container =
        document.getElementById(
            "quizContainer"
        );


    let imageHTML = "";


    if (
        question.imageUrl &&
        question.imageUrl !==
            "YOUR_IMAGE_URL"
    ) {

        imageHTML = `

            <img
                src="${escapeHTML(
                    question.imageUrl
                )}"
                alt="Question"
                onerror="
                    this.style.display='none';
                    document.getElementById(
                        'imagePlaceholder'
                    ).style.display='block';
                "
            >

            <div
                id="imagePlaceholder"
                class="question-image-placeholder"
                style="display:none;"
            >
                Question image could not be loaded.
            </div>

        `;

    } else {

        imageHTML = `

            <div class="question-image-placeholder">

                Question image will appear here.

                <br>

                Upload the question JPEG
                and add its URL in Firebase.

            </div>

        `;

    }


    container.innerHTML = `

        <div class="question-top">

            <div class="question-number">
                QUESTION ${currentIndex + 1}
            </div>

            <div class="question-status">
                ${
                    answered
                        ? "Answered"
                        : "Not Answered"
                }
            </div>

        </div>


        <div class="question-image-box">

            ${imageHTML}

        </div>


        <div class="options">

            ${createOption(
                1,
                question.option1,
                question
            )}

            ${createOption(
                2,
                question.option2,
                question
            )}

            ${createOption(
                3,
                question.option3,
                question
            )}

            ${createOption(
                4,
                question.option4,
                question
            )}

        </div>


        <div
            id="solutionBox"
            class="solution-box ${
                answered
                    ? "show"
                    : ""
            }"
        >

            <div class="solution-title">
                Solution
            </div>

            <div class="solution-text">

                ${
                    escapeHTML(
                        question.solution ||
                        "Solution not available."
                    )
                }

                ${
                    question.ncertReference
                        ? `
                            <br><br>
                            <strong>
                                NCERT Reference:
                            </strong>
                            ${escapeHTML(
                                question.ncertReference
                            )}
                          `
                        : ""
                }

            </div>

        </div>


        <div class="quiz-actions">

            <button
                class="quiz-action"
                onclick="previousQuestion()"
                ${
                    currentIndex === 0
                        ? "disabled"
                        : ""
                }
            >
                Previous
            </button>


            <button
                class="quiz-action submit-answer"
                onclick="submitAnswer()"
                ${
                    answered
                        ? "disabled"
                        : ""
                }
            >
                ${
                    answered
                        ? "Answer Submitted"
                        : "Answer Submit"
                }
            </button>


            <button
                class="quiz-action"
                onclick="nextQuestion()"
                ${
                    currentIndex ===
                    questions.length - 1
                        ? "disabled"
                        : ""
                }
            >
                Next
            </button>


            <button
                class="quiz-action submit-quiz"
                onclick="submitQuiz()"
            >
                Submit Quiz
            </button>

        </div>

    `;


    applyAnswerState(question);


    startQuestionTimer();

}


// ==========================================
// CREATE OPTION
// ==========================================

function createOption(
    number,
    text,
    question
) {

    let className =
        "option";


    if (
        selectedOption === number &&
        !answered
    ) {

        className +=
            " selected";

    }


    if (answered) {

        if (
            number ===
            Number(question.correctOption)
        ) {

            className +=
                " correct";

        }


        if (
            selectedOption === number &&
            number !==
            Number(question.correctOption)
        ) {

            className +=
                " wrong";

        }

    }


    return `

        <button
            type="button"
            class="${className}"
            onclick="
                selectOption(${number})
            "
            ${
                answered
                    ? "disabled"
                    : ""
            }
        >

            <span class="option-number">
                ${number}
            </span>

            <span class="option-text">
                ${escapeHTML(
                    text || ""
                )}
            </span>

        </button>

    `;

}


// ==========================================
// SELECT OPTION
// ==========================================

function selectOption(number) {

    if (answered) {

        return;
    }


    selectedOption =
        number;


    if (!answers[currentIndex]) {

        answers[currentIndex] = {};

    }


    answers[currentIndex].selected =
        number;


    const question =
        questions[currentIndex];


    const options =
        document.querySelectorAll(
            ".option"
        );


    options.forEach(
        function (option, index) {

            option.classList.remove(
                "selected"
            );


            if (
                index + 1 === number
            ) {

                option.classList.add(
                    "selected"
                );

            }

        }
    );

}


// ==========================================
// SUBMIT ANSWER
// ==========================================

function submitAnswer() {

    if (answered) {

        return;
    }


    if (!selectedOption) {

        alert(
            "Please select an answer first."
        );

        return;
    }


    answered = true;


    if (!answers[currentIndex]) {

        answers[currentIndex] = {};

    }


    answers[currentIndex].selected =
        selectedOption;


    answers[currentIndex].answered =
        true;


    clearQuestionTimer();


    renderQuestion();

}


// ==========================================
// PREVIOUS QUESTION
// ==========================================

function previousQuestion() {

    if (currentIndex <= 0) {

        return;
    }


    currentIndex--;

    renderQuestion();

}


// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    if (
        currentIndex >=
        questions.length - 1
    ) {

        return;
    }


    currentIndex++;

    renderQuestion();

}


// ==========================================
// QUESTION TIMER
// ==========================================

function startQuestionTimer() {

    clearQuestionTimer();


    updateQuestionTimer();


    if (answered) {

        return;
    }


    questionTimer =
        setInterval(
            function () {

                questionTimeLeft--;


                updateQuestionTimer();


                if (
                    questionTimeLeft <= 0
                ) {

                    clearQuestionTimer();


                    if (!answered) {

                        autoSubmitAnswer();

                    }

                }

            },
            1000
        );

}


// ==========================================
// UPDATE QUESTION TIMER
// ==========================================

function updateQuestionTimer() {

    const timer =
        document.getElementById(
            "questionTimer"
        );


    if (!timer) {

        return;
    }


    timer.textContent =
        questionTimeLeft +
        "s";


    if (
        questionTimeLeft <= 10
    ) {

        timer.style.color =
            "#ff5c5c";

    } else {

        timer.style.color =
            "#ffc107";

    }

}


// ==========================================
// AUTO SUBMIT ANSWER
// ==========================================

function autoSubmitAnswer() {

    if (answered) {

        return;
    }


    answered = true;


    if (!answers[currentIndex]) {

        answers[currentIndex] = {};

    }


    answers[currentIndex].selected =
        selectedOption;


    answers[currentIndex].answered =
        true;


    renderQuestion();

}


// ==========================================
// TOTAL TIMER
// ==========================================

function startTotalTimer() {

    clearInterval(totalTimer);


    totalSeconds = 0;


    updateTotalTimer();


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
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0");

}


// ==========================================
// CLEAR QUESTION TIMER
// ==========================================

function clearQuestionTimer() {

    if (questionTimer) {

        clearInterval(
            questionTimer
        );

        questionTimer = null;

    }

}


// ==========================================
// APPLY ANSWER STATE
// ==========================================

function applyAnswerState(
    question
) {

    if (!answered) {

        return;
    }


    const options =
        document.querySelectorAll(
            ".option"
        );


    options.forEach(
        function (option, index) {

            const number =
                index + 1;


            if (
                number ===
                Number(
                    question.correctOption
                )
            ) {

                option.classList.add(
                    "correct"
                );

            }


            if (
                number === selectedOption &&
                number !==
                Number(
                    question.correctOption
                )
            ) {

                option.classList.add(
                    "wrong"
                );

            }

        }
    );

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

function submitQuiz() {

    const confirmed =
        confirm(
            "Are you sure you want to submit the quiz?"
        );


    if (!confirmed) {

        return;
    }


    clearQuestionTimer();

    clearInterval(totalTimer);


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


    const positiveMark =
        Number(
            quizData.positiveMark ||
            4
        );


    const negativeMark =
        Number(
            quizData.negativeMark ||
            1
        );


    const score =
        (
            correct *
            positiveMark
        ) -
        (
            incorrect *
            negativeMark
        );


    const accuracy =
        questions.length > 0
            ? Math.round(
                (
                    correct /
                    questions.length
                ) * 100
            )
            : 0;


    localStorage.setItem(
        "quizResult",
        JSON.stringify({

            courseId: courseId,

            chapterId: chapterId,

            topicId: topicId,

            quizId: quizId,

            total:
                questions.length,

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

        })
    );


    window.location.href =
        "result.html";

}


// ==========================================
// EXIT QUIZ
// ==========================================

function exitQuiz() {

    const confirmed =
        confirm(
            "Exit this quiz?"
        );


    if (!confirmed) {

        return;
    }


    clearQuestionTimer();

    clearInterval(totalTimer);


    window.location.href =
        "topic.html";

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

            <div style="
                font-size:35px;
                margin-bottom:12px;
            ">
                ⚠️
            </div>

            ${escapeHTML(message)}

        </div>

    `;

}


// ==========================================
// HTML ESCAPE
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
