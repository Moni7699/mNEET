// ==========================================
// mNEET QUIZ SYSTEM
// Firebase Structure:
// courses/course/chapters/chapter/topics/topic/quiz/quiz-01/questions
// ==========================================


let courseId = null;
let chapterId = null;
let topicId = null;
let quizId = null;

let quizData = null;
let questions = [];

let currentQuestion = 0;

let selectedAnswer = null;

let answerSubmitted = false;

let questionTimer = null;
let totalTimer = null;

let questionTimeLeft = 60;
let totalTimeLeft = 0;

let answers = {};

let quizFinished = false;


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
                        "quizCourse"
                    );

                chapterId =
                    localStorage.getItem(
                        "quizChapter"
                    );

                topicId =
                    localStorage.getItem(
                        "quizTopic"
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

    const quizRef =
        db.collection("courses")
            .doc(courseId)
            .collection("chapters")
            .doc(chapterId)
            .collection("topics")
            .doc(topicId)
            .collection("quiz");


    quizRef
        .where(
            "published",
            "==",
            true
        )
        .limit(1)
        .get()

        .then(function (snapshot) {

            if (snapshot.empty) {

                showLoadError(
                    "No published quiz is available for this topic."
                );

                return;
            }


            const doc =
                snapshot.docs[0];


            quizId =
                doc.id;


            quizData =
                doc.data();


            document.getElementById(
                "quizTitle"
            ).textContent =
                quizData.title ||
                "Practice Quiz";


            loadQuestions();

        })

        .catch(function (error) {

            console.error(
                "Quiz loading error:",
                error
            );


            showLoadError(
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


                    question.id =
                        doc.id;


                    questions.push(
                        question
                    );

                }
            );


            questions.sort(
                function (a, b) {

                    return (
                        Number(a.order || 0) -
                        Number(b.order || 0)
                    );

                }
            );


            if (
                questions.length === 0
            ) {

                showLoadError(
                    "No published questions found."
                );

                return;
            }


            startQuiz();

        })

        .catch(function (error) {

            console.error(
                "Question loading error:",
                error
            );


            showLoadError(
                "Unable to load questions."
            );

        });

}


// ==========================================
// START QUIZ
// ==========================================

function startQuiz() {

    const timePerQuestion =
        Number(
            quizData.timePerQuestion
        ) || 60;


    questionTimeLeft =
        timePerQuestion;


    totalTimeLeft =
        questions.length *
        timePerQuestion;


    currentQuestion = 0;

    answers = {};

    quizFinished = false;


    document.getElementById(
        "totalQuestions"
    ).textContent =
        questions.length;


    startTotalTimer();

    renderQuestion();

}


// ==========================================
// RENDER QUESTION
// ==========================================

function renderQuestion() {

    clearQuestionTimer();


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


    const question =
        questions[currentQuestion];


    selectedAnswer =
        answers[currentQuestion]
            ? answers[currentQuestion].selected
            : null;


    answerSubmitted =
        answers[currentQuestion]
            ? answers[currentQuestion].submitted
            : false;


    questionTimeLeft =
        Number(
            quizData.timePerQuestion
        ) || 60;


    document.getElementById(
        "currentNumber"
    ).textContent =
        currentQuestion + 1;


    document.getElementById(
        "questionNumber"
    ).textContent =
        String(
            currentQuestion + 1
        ).padStart(2, "0");


    document.getElementById(
        "questionText"
    ).textContent =
        question.questionText ||
        question.question ||
        "Question";


    renderQuestionImage(
        question
    );


    renderOptions(
        question
    );


    renderSolution(
        question
    );


    updateProgress();

    updateNavigation();

    updateQuestionTimerDisplay();


    if (!answerSubmitted) {

        startQuestionTimer();

    }

}


// ==========================================
// QUESTION IMAGE
// ==========================================

function renderQuestionImage(
    question
) {

    const box =
        document.getElementById(
            "questionImageBox"
        );

    const image =
        document.getElementById(
            "questionImage"
        );


    const imageUrl =
        question.imageUrl ||
        question.questionImageUrl ||
        "";


    if (imageUrl) {

        image.src =
            imageUrl;

        box.style.display =
            "block";

    } else {

        image.src = "";

        box.style.display =
            "none";

    }

}


// ==========================================
// RENDER OPTIONS
// ==========================================

function renderOptions(
    question
) {

    const container =
        document.getElementById(
            "optionsContainer"
        );


    container.innerHTML = "";


    const optionNames = [
        "option1",
        "option2",
        "option3",
        "option4"
    ];


    optionNames.forEach(
        function (field, index) {

            const optionText =
                question[field] || "";


            const option =
                document.createElement(
                    "div"
                );


            option.className =
                "option";


            const optionNumber =
                index + 1;


            option.innerHTML = `

                <div class="option-number">
                    ${optionNumber}
                </div>

                <div class="option-text">
                    ${escapeHTML(optionText)}
                </div>

            `;


            if (
                selectedAnswer ===
                optionNumber
            ) {

                option.classList.add(
                    "selected"
                );

            }


            if (
                answerSubmitted
            ) {

                const correct =
                    Number(
                        question.correctOption
                    );


                if (
                    optionNumber ===
                    correct
                ) {

                    option.classList.add(
                        "correct"
                    );

                }


                if (
                    selectedAnswer ===
                    optionNumber &&
                    optionNumber !==
                    correct
                ) {

                    option.classList.add(
                        "wrong"
                    );

                }

            }


            option.onclick =
                function () {

                    selectOption(
                        optionNumber
                    );

                };


            container.appendChild(
                option
            );

        }
    );

}


// ==========================================
// SELECT OPTION
// ==========================================

function selectOption(
    optionNumber
) {

    if (answerSubmitted) {

        return;
    }


    selectedAnswer =
        optionNumber;


    if (
        !answers[currentQuestion]
    ) {

        answers[currentQuestion] =
            {};

    }


    answers[currentQuestion]
        .selected =
        optionNumber;


    answers[currentQuestion]
        .submitted =
        false;


    renderOptions(
        questions[currentQuestion]
    );

}


// ==========================================
// SUBMIT ANSWER
// ==========================================

function submitAnswer() {

    if (answerSubmitted) {

        return;

    }


    if (
        selectedAnswer === null
    ) {

        alert(
            "Please select an answer first."
        );

        return;
    }


    const question =
        questions[currentQuestion];


    const correct =
        Number(
            question.correctOption
        );


    const isCorrect =
        selectedAnswer === correct;


    answers[currentQuestion] = {

        selected:
            selectedAnswer,

        submitted:
            true,

        correct:
            isCorrect

    };


    answerSubmitted = true;


    clearQuestionTimer();


    renderOptions(
        question
    );


    showAnswerResult(
        isCorrect
    );


    renderSolution(
        question
    );


    updateNavigation();

}


// ==========================================
// SHOW ANSWER RESULT
// ==========================================

function showAnswerResult(
    isCorrect
) {

    const status =
        document.getElementById(
            "answerStatus"
        );


    if (isCorrect) {

        status.textContent =
            "✓ Correct Answer";


        status.className =
            "answer-status correct";

    } else {

        const correct =
            Number(
                questions[currentQuestion]
                    .correctOption
            );


        status.textContent =
            "✗ Incorrect. Correct answer: " +
            correct;


        status.className =
            "answer-status wrong";

    }

}


// ==========================================
// SOLUTION
// ==========================================

function renderSolution(
    question
) {

    const box =
        document.getElementById(
            "solutionBox"
        );


    const solution =
        document.getElementById(
            "solutionText"
        );


    const reference =
        document.getElementById(
            "referenceText"
        );


    if (!answerSubmitted) {

        box.style.display =
            "none";

        return;
    }


    solution.textContent =
        question.solution ||
        "Solution is not available.";


    if (
        question.reference
    ) {

        reference.textContent =
            "📖 NCERT Reference: " +
            question.reference;

    } else {

        reference.textContent =
            "";

    }


    box.style.display =
        "block";

}


// ==========================================
// QUESTION TIMER
// ==========================================

function startQuestionTimer() {

    clearQuestionTimer();


    questionTimer =
        setInterval(
            function () {

                if (
                    answerSubmitted ||
                    quizFinished
                ) {

                    clearQuestionTimer();

                    return;
                }


                questionTimeLeft--;


                updateQuestionTimerDisplay();


                if (
                    questionTimeLeft <= 0
                ) {

                    clearQuestionTimer();


                    autoSubmitAnswer();

                }

            },
            1000
        );

}


// ==========================================
// AUTO SUBMIT
// ==========================================

function autoSubmitAnswer() {

    if (answerSubmitted) {

        return;

    }


    if (
        selectedAnswer === null
    ) {

        answers[currentQuestion] = {

            selected:
                null,

            submitted:
                true,

            correct:
                false,

            skipped:
                true

        };


        answerSubmitted = true;


        renderSolution(
            questions[currentQuestion]
        );


        document.getElementById(
            "answerStatus"
        ).textContent =
            "⏱ Time over — question skipped";


        document.getElementById(
            "answerStatus"
        ).className =
            "answer-status wrong";


        updateNavigation();


        return;
    }


    submitAnswer();

}


// ==========================================
// CLEAR QUESTION TIMER
// ==========================================

function clearQuestionTimer() {

    if (
        questionTimer
    ) {

        clearInterval(
            questionTimer
        );

        questionTimer =
            null;

    }

}


// ==========================================
// QUESTION TIMER DISPLAY
// ==========================================

function updateQuestionTimerDisplay() {

    document.getElementById(
        "questionTimer"
    ).textContent =
        questionTimeLeft;

}


// ==========================================
// TOTAL TIMER
// ==========================================

function startTotalTimer() {

    if (totalTimer) {

        clearInterval(
            totalTimer
        );

    }


    updateTotalTimerDisplay();


    totalTimer =
        setInterval(
            function () {

                if (quizFinished) {

                    clearInterval(
                        totalTimer
                    );

                    return;
                }


                totalTimeLeft--;


                updateTotalTimerDisplay();


                if (
                    totalTimeLeft <= 0
                ) {

                    clearInterval(
                        totalTimer
                    );


                    finishQuiz();

                }

            },
            1000
        );

}


// ==========================================
// TOTAL TIMER DISPLAY
// ==========================================

function updateTotalTimerDisplay() {

    let minutes =
        Math.floor(
            totalTimeLeft / 60
        );


    let seconds =
        totalTimeLeft % 60;


    document.getElementById(
        "totalTimer"
    ).textContent =

        String(minutes)
            .padStart(2, "0")

        +

        ":" +

        String(seconds)
            .padStart(2, "0");

}


// ==========================================
// NEXT
// ==========================================

function nextQuestion() {

    if (!answerSubmitted) {

        alert(
            "Please submit your answer first."
        );

        return;
    }


    if (
        currentQuestion <
        questions.length - 1
    ) {

        currentQuestion++;

        renderQuestion();

    } else {

        finishQuiz();

    }

}


// ==========================================
// PREVIOUS
// ==========================================

function previousQuestion() {

    if (
        currentQuestion <= 0
    ) {

        return;

    }


    currentQuestion--;

    renderQuestion();

}


// ==========================================
// NAVIGATION
// ==========================================

function updateNavigation() {

    const previous =
        document.getElementById(
            "previousButton"
        );


    const next =
        document.getElementById(
            "nextButton"
        );


    const answer =
        document.getElementById(
            "answerButton"
        );


    previous.disabled =
        currentQuestion === 0;


    if (answerSubmitted) {

        answer.textContent =
            "✓ Answer Submitted";

        answer.disabled =
            true;

    } else {

        answer.textContent =
            "Submit Answer";

        answer.disabled =
            false;

    }


    if (
        currentQuestion ===
        questions.length - 1
    ) {

        next.textContent =
            "Finish →";

    } else {

        next.textContent =
            "Next →";

    }

}


// ==========================================
// PROGRESS
// ==========================================

function updateProgress() {

    const percentage =
        (
            (currentQuestion + 1) /
            questions.length
        ) * 100;


    document.getElementById(
        "progressBar"
    ).style.width =
        percentage + "%";

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

function submitQuiz() {

    if (quizFinished) {

        return;

    }


    const unanswered =
        questions.length -
        Object.keys(answers).length;


    if (
        unanswered > 0
    ) {

        const confirmSubmit =
            confirm(
                "You have " +
                unanswered +
                " unanswered question(s). Submit quiz?"
            );


        if (!confirmSubmit) {

            return;

        }

    }


    finishQuiz();

}


// ==========================================
// FINISH QUIZ
// ==========================================

function finishQuiz() {

    if (quizFinished) {

        return;

    }


    quizFinished = true;


    clearQuestionTimer();


    if (totalTimer) {

        clearInterval(
            totalTimer
        );

    }


    let correctCount = 0;

    let wrongCount = 0;

    let skippedCount = 0;


    questions.forEach(
        function (question, index) {

            const answer =
                answers[index];


            if (
                !answer ||
                answer.selected === null ||
                answer.skipped
            ) {

                skippedCount++;

                return;

            }


            const correct =
                Number(
                    question.correctOption
                );


            if (
                Number(
                    answer.selected
                ) === correct
            ) {

                correctCount++;

            } else {

                wrongCount++;

            }

        }
    );


    const positiveMark =
        Number(
            quizData.positiveMark
        ) || 4;


    const negativeMark =
        Number(
            quizData.negativeMark
        ) || 1;


    const score =
        (
            correctCount *
            positiveMark
        )
        -
        (
            wrongCount *
            negativeMark
        );


    const accuracy =
        questions.length > 0

            ?

            Math.round(
                (
                    correctCount /
                    questions.length
                ) * 100
            )

            :

            0;


    document.getElementById(
        "finalScore"
    ).textContent =
        score;


    document.getElementById(
        "correctCount"
    ).textContent =
        correctCount;


    document.getElementById(
        "wrongCount"
    ).textContent =
        wrongCount;


    document.getElementById(
        "skippedCount"
    ).textContent =
        skippedCount;


    document.getElementById(
        "accuracy"
    ).textContent =
        accuracy + "%";


    localStorage.setItem(
        "lastQuizResult",
        JSON.stringify({

            courseId:
                courseId,

            chapterId:
                chapterId,

            topicId:
                topicId,

            quizId:
                quizId,

            score:
                score,

            correct:
                correctCount,

            wrong:
                wrongCount,

            skipped:
                skippedCount,

            accuracy:
                accuracy,

            totalQuestions:
                questions.length,

            completedAt:
                new Date().toISOString()

        })
    );


    document.getElementById(
        "resultOverlay"
    ).style.display =
        "flex";

}


// ==========================================
// RESTART
// ==========================================

function restartQuiz() {

    document.getElementById(
        "resultOverlay"
    ).style.display =
        "none";


    currentQuestion = 0;

    selectedAnswer = null;

    answerSubmitted = false;

    answers = {};

    quizFinished = false;


    startQuiz();

}


// ==========================================
// BACK TO TOPIC
// ==========================================

function goBackToTopic() {

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


// ==========================================
// ERROR
// ==========================================

function showLoadError(
    message
) {

    document.getElementById(
        "questionText"
    ).textContent =
        message;


    document.getElementById(
        "optionsContainer"
    ).innerHTML =
        "";


    document.getElementById(
        "answerButton"
    ).disabled =
        true;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

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
