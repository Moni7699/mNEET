/* =========================================================
   mNEET QUIZ ENGINE
   Firebase Firestore Compatible
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let db = null;

    let questions = [];
    let quizData = {};

    let currentIndex = 0;

    let selectedAnswers = {};
    let submittedAnswers = {};

    let questionTimer = null;
    let totalTimer = null;

    let questionTimeLeft = 60;
    let totalSeconds = 0;

    let quizFinished = false;

    let positiveMark = 4;
    let negativeMark = 1;

    let perQuestionTime = 60;

    let quizPath = "";

    /* =====================================================
       FIREBASE
    ===================================================== */

    function getFirestore() {

        try {

            if (typeof firebase === "undefined") {
                return null;
            }

            if (firebase.apps.length === 0) {
                return null;
            }

            return firebase.firestore();

        } catch (error) {

            console.error("Firestore error:", error);

            return null;
        }
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function getParam(name) {

        const params = new URLSearchParams(window.location.search);

        return params.get(name);
    }


    function getStorage(...keys) {

        for (const key of keys) {

            const value =
                localStorage.getItem(key) ||
                sessionStorage.getItem(key);

            if (value) {
                return value;
            }
        }

        return "";
    }


    function cleanValue(value) {

        if (!value) return "";

        return String(value).trim();
    }


    function getIds() {

        const courseId =
            getParam("courseId") ||
            getParam("course") ||
            getStorage(
                "activeCourse",
                "courseId"
            ) ||
            "course-01";


        const chapterId =
            getParam("chapterId") ||
            getParam("chapter") ||
            getStorage(
                "activeChapter",
                "chapterId"
            ) ||
            "chapter-01";


        const topicId =
            getParam("topicId") ||
            getParam("topic") ||
            getStorage(
                "activeTopic",
                "topicId"
            ) ||
            "topic-01";


        const quizId =
            getParam("quizId") ||
            getParam("quiz") ||
            getStorage(
                "activeQuiz",
                "quizId"
            ) ||
            "quiz-01";


        const typeId =
            getParam("typeId") ||
            getParam("type") ||
            getStorage(
                "activeType",
                "activeTypePractice",
                "typePractice"
            );


        return {
            courseId: cleanValue(courseId),
            chapterId: cleanValue(chapterId),
            topicId: cleanValue(topicId),
            quizId: cleanValue(quizId),
            typeId: cleanValue(typeId)
        };
    }


    /* =====================================================
       SAVE ACTIVE IDS
    ===================================================== */

    function saveIds(ids) {

        localStorage.setItem(
            "activeCourse",
            ids.courseId
        );

        localStorage.setItem(
            "activeChapter",
            ids.chapterId
        );

        localStorage.setItem(
            "activeTopic",
            ids.topicId
        );

        localStorage.setItem(
            "activeQuiz",
            ids.quizId
        );

        if (ids.typeId) {

            localStorage.setItem(
                "activeType",
                ids.typeId
            );

        }
    }


    /* =====================================================
       FIND QUIZ PATH
    ===================================================== */

    async function loadQuizDocument(ids) {

        /*
          NORMAL TOPIC:

          courses
            /courseId
              /chapters
                /chapterId
                  /topics
                    /topicId
                      /quiz
                        /quizId
        */

        const normalRef =
            db.collection("courses")
              .doc(ids.courseId)
              .collection("chapters")
              .doc(ids.chapterId)
              .collection("topics")
              .doc(ids.topicId)
              .collection("quiz")
              .doc(ids.quizId);


        let snap = await normalRef.get();


        if (snap.exists) {

            quizPath =
                "courses/" +
                ids.courseId +
                "/chapters/" +
                ids.chapterId +
                "/topics/" +
                ids.topicId +
                "/quiz/" +
                ids.quizId;

            return {
                ref: normalRef,
                data: snap.data(),
                mode: "topic"
            };
        }


        /*
          TYPE PRACTICE:

          courses
            /courseId
              /chapters
                /chapterId
                  /typePractice
                    /typeId
                      /questions
        */

        if (ids.typeId) {

            const typeRef =
                db.collection("courses")
                  .doc(ids.courseId)
                  .collection("chapters")
                  .doc(ids.chapterId)
                  .collection("typePractice")
                  .doc(ids.typeId);


            const typeSnap =
                await typeRef.get();


            if (typeSnap.exists) {

                quizPath =
                    "courses/" +
                    ids.courseId +
                    "/chapters/" +
                    ids.chapterId +
                    "/typePractice/" +
                    ids.typeId;

                return {
                    ref: typeRef,
                    data: typeSnap.data(),
                    mode: "type",
                    typeRef: typeRef
                };
            }
        }


        /*
          BACKUP:
          Some projects may have quiz document
          directly with questions subcollection.
        */

        const backupRef =
            db.collection("courses")
              .doc(ids.courseId)
              .collection("chapters")
              .doc(ids.chapterId)
              .collection("topics")
              .doc(ids.topicId)
              .collection("quiz")
              .doc(ids.quizId);


        return {
            ref: backupRef,
            data: {},
            mode: "topic"
        };
    }


    /* =====================================================
       LOAD QUESTIONS
    ===================================================== */

    async function loadQuestions(quizInfo, ids) {

        let questionRef = null;

        if (quizInfo.mode === "topic") {

            questionRef =
                quizInfo.ref.collection("questions");

        } else {

            questionRef =
                quizInfo.typeRef.collection("questions");

        }


        let snap;


        /*
          FIRST TRY:
          published == true + order
        */

        try {

            snap =
                await questionRef
                    .where("published", "==", true)
                    .orderBy("order", "asc")
                    .get();

        } catch (error) {

            console.warn(
                "Published/order query failed. Trying simple query.",
                error
            );

            try {

                snap =
                    await questionRef
                        .orderBy("order", "asc")
                        .get();

            } catch (error2) {

                console.warn(
                    "Order query failed. Loading all questions.",
                    error2
                );

                snap =
                    await questionRef.get();
            }
        }


        let list = [];


        snap.forEach(function (doc) {

            const data = doc.data() || {};

            /*
              If published field exists and is false,
              do not show it.
            */

            if (
                data.published !== undefined &&
                data.published === false
            ) {
                return;
            }


            list.push({
                id: doc.id,
                ...data
            });

        });


        /*
          Manual sorting fallback
        */

        list.sort(function (a, b) {

            const aOrder =
                Number(a.order || 0);

            const bOrder =
                Number(b.order || 0);

            return aOrder - bOrder;
        });


        return list;
    }


    /* =====================================================
       LOAD QUIZ
    ===================================================== */

    async function loadQuiz() {

        showLoading(
            "Loading questions..."
        );


        db = getFirestore();


        if (!db) {

            showError(
                "Firebase load হয়নি।<br><br>" +
                "Please check js/firebase.js"
            );

            return;
        }


        const ids = getIds();

        saveIds(ids);


        console.log(
            "Quiz IDs:",
            ids
        );


        try {

            const quizInfo =
                await loadQuizDocument(ids);


            quizData =
                quizInfo.data || {};


            console.log(
                "Quiz data:",
                quizData
            );


            /*
              MARKING
            */

            positiveMark =
                Number(
                    quizData.positiveMark ??
                    quizData.positiveMarks ??
                    4
                );


            negativeMark =
                Number(
                    quizData.negativeMark ??
                    quizData.negativeMarks ??
                    1
                );


            /*
              QUESTION TIME

              Firestore screenshot:
              timePerQuestion
            */

            perQuestionTime =
                Number(
                    quizData.timePerQuestion ??
                    quizData.timePerQuestionSeconds ??
                    60
                );


            if (
                !Number.isFinite(perQuestionTime) ||
                perQuestionTime <= 0
            ) {

                perQuestionTime = 60;
            }


            questions =
                await loadQuestions(
                    quizInfo,
                    ids
                );


            console.log(
                "Questions loaded:",
                questions.length,
                questions
            );


            if (!questions.length) {

                showError(
                    "এই quiz-এ কোনো published question পাওয়া যায়নি।<br><br>" +
                    "Firestore path:<br>" +
                    "<b>" + quizPath + "/questions</b>"
                );

                return;
            }


            /*
              TOTAL TIME
            */

            totalSeconds =
                questions.length *
                perQuestionTime;


            /*
              RESTORE ATTEMPT
            */

            restoreAttempt();


            quizFinished = false;


            updateQuizHeader();


            renderQuestion();


            startTotalTimer();


            startQuestionTimer();

        } catch (error) {

            console.error(
                "Quiz loading error:",
                error
            );


            showError(
                "Quiz load করতে সমস্যা হয়েছে।<br><br>" +
                error.message
            );
        }
    }


    /* =====================================================
       HEADER
    ===================================================== */

    function updateQuizHeader() {

        const title =
            quizData.title ||
            "Practice Quiz";


        const titleEl =
            document.getElementById(
                "quizTitle"
            );


        if (titleEl) {

            titleEl.textContent =
                title;
        }


        updateCounter();
    }


    function updateCounter() {

        const counter =
            document.getElementById(
                "questionCounter"
            );


        if (counter) {

            counter.textContent =
                questions.length
                    ? `${currentIndex + 1} / ${questions.length}`
                    : "0 / 0";
        }


        const fill =
            document.getElementById(
                "progressFill"
            );


        if (fill && questions.length) {

            const percent =
                ((currentIndex + 1) /
                questions.length) *
                100;


            fill.style.width =
                percent + "%";
        }
    }


    /* =====================================================
       RENDER QUESTION
    ===================================================== */

    function renderQuestion() {

        if (!questions.length) {
            return;
        }


        const q =
            questions[currentIndex];


        const container =
            document.getElementById(
                "quizContainer"
            );


        if (!container) {
            return;
        }


        const selected =
            selectedAnswers[q.id];


        const submitted =
            submittedAnswers[q.id];


        const correctOption =
            Number(
                q.correctOption
            );


        let html = "";


        html += `
            <div class="question-card">

                <p class="question-text">
                    ${escapeHTML(
                        q.questionText ||
                        q.question ||
                        "Question"
                    )}
                </p>
        `;


        /*
          IMAGE
        */

        const imageUrl =
            q.questionImageUrl ||
            q.imageUrl ||
            q.imageURL ||
            "";


        if (imageUrl) {

            html += `
                <img
                    src="${escapeAttribute(imageUrl)}"
                    class="question-image"
                    alt="Question Image"
                    onerror="this.style.display='none'"
                >
            `;
        }


        /*
          OPTIONS
        */

        html += `
            <div class="options">
        `;


        for (
            let i = 1;
            i <= 4;
            i++
        ) {

            const optionText =
                q["option" + i] ?? "";


            if (
                optionText === "" &&
                optionText !== 0
            ) {
                continue;
            }


            let classes =
                "option";


            if (
                Number(selected) === i &&
                !submitted
            ) {

                classes +=
                    " selected";
            }


            if (submitted) {

                if (i === correctOption) {

                    classes +=
                        " correct";
                }


                if (
                    Number(selected) === i &&
                    Number(selected) !==
                    correctOption
                ) {

                    classes +=
                        " wrong";
                }


                classes +=
                    " disabled";
            }


            html += `
                <button
                    type="button"
                    class="${classes}"
                    data-option="${i}"
                    onclick="selectOption(${i})"
                    ${submitted ? "disabled" : ""}
                >

                    <span class="option-letter">
                        ${i}
                    </span>

                    <span class="option-text">
                        ${escapeHTML(
                            String(optionText)
                        )}
                    </span>

                </button>
            `;
        }


        html += `
            </div>
        `;


        /*
          ANSWER STATUS
        */

        if (submitted) {

            const isCorrect =
                Number(selected) ===
                correctOption;


            if (isCorrect) {

                html += `
                    <div class="answer-status show correct-status">

                        ✅ Correct Answer

                    </div>
                `;

            } else if (selected) {

                html += `
                    <div class="answer-status show wrong-status">

                        ❌ Wrong Answer

                        <br>

                        Correct option:
                        <b>${correctOption}</b>

                    </div>
                `;

            } else {

                html += `
                    <div class="answer-status show wrong-status">

                        ⏭️ Skipped

                        <br>

                        Correct option:
                        <b>${correctOption}</b>

                    </div>
                `;
            }


            /*
              SOLUTION
            */

            const solution =
                q.solution || "";


            const reference =
                q.reference ||
                q.ncertReference ||
                "";


            if (
                solution ||
                reference
            ) {

                html += `
                    <div class="solution-box show">

                        <div class="solution-title">
                            📖 Solution
                        </div>

                        <div class="solution-text">
                            ${escapeHTML(
                                solution ||
                                "Solution not available."
                            )}
                        </div>

                        ${
                            reference
                                ? `
                                    <div class="reference-text">
                                        📚 NCERT Reference:
                                        ${escapeHTML(
                                            reference
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
          ANSWER SUBMIT
        */

        if (!submitted) {

            html += `
                <button
                    type="button"
                    id="submitAnswerButton"
                    class="submit-answer-button"
                    onclick="submitAnswer()"
                    ${selected ? "" : "disabled"}
                >
                    ✓ Submit Answer
                </button>
            `;
        }


        /*
          NAVIGATION
        */

        html += `
            <div class="quiz-actions">

                <button
                    type="button"
                    class="quiz-button previous-button"
                    onclick="previousQuestion()"
                    ${currentIndex === 0 ? "disabled" : ""}
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
        `;


        /*
          SUBMIT QUIZ
        */

        if (submitted) {

            html += `
                <button
                    type="button"
                    class="submit-quiz-button"
                    onclick="finishQuiz()"
                >
                    Submit Quiz
                </button>
            `;
        }


        html += `
            </div>
        `;


        container.innerHTML =
            html;


        updateCounter();


        /*
          Restore timer
        */

        if (submitted) {

            stopQuestionTimer();

        } else {

            startQuestionTimer();
        }


        saveAttempt();
    }


    /* =====================================================
       SELECT OPTION
    ===================================================== */

    window.selectOption =
        function (option) {

            if (quizFinished) {
                return;
            }


            const q =
                questions[currentIndex];


            if (!q) {
                return;
            }


            if (
                submittedAnswers[q.id]
            ) {
                return;
            }


            selectedAnswers[q.id] =
                Number(option);


            renderQuestion();

            saveAttempt();
        };


    /* =====================================================
       SUBMIT ANSWER
    ===================================================== */

    window.submitAnswer =
        function () {

            if (quizFinished) {
                return;
            }


            const q =
                questions[currentIndex];


            if (!q) {
                return;
            }


            const selected =
                selectedAnswers[q.id];


            if (!selected) {

                alert(
                    "Please select an answer first."
                );

                return;
            }


            submittedAnswers[q.id] =
                true;


            stopQuestionTimer();


            renderQuestion();


            saveAttempt();
        };


    /* =====================================================
       PREVIOUS
    ===================================================== */

    window.previousQuestion =
        function () {

            if (currentIndex <= 0) {
                return;
            }


            stopQuestionTimer();


            currentIndex--;


            const q =
                questions[currentIndex];


            if (
                submittedAnswers[q.id]
            ) {

                questionTimeLeft =
                    0;

            } else {

                questionTimeLeft =
                    perQuestionTime;
            }


            renderQuestion();


            saveAttempt();
        };


    /* =====================================================
       NEXT
    ===================================================== */

    window.nextQuestion =
        function () {

            if (
                currentIndex >=
                questions.length - 1
            ) {

                finishQuiz();

                return;
            }


            stopQuestionTimer();


            currentIndex++;


            const q =
                questions[currentIndex];


            if (
                submittedAnswers[q.id]
            ) {

                questionTimeLeft =
                    0;

            } else {

                questionTimeLeft =
                    perQuestionTime;
            }


            renderQuestion();


            saveAttempt();
        };


    /* =====================================================
       QUESTION TIMER
    ===================================================== */

    function startQuestionTimer() {

        stopQuestionTimer();


        const q =
            questions[currentIndex];


        if (!q) {
            return;
        }


        if (
            submittedAnswers[q.id]
        ) {

            updateQuestionTimer(
                0
            );

            return;
        }


        /*
          Fresh question
        */

        if (
            !questionTimeLeft ||
            questionTimeLeft <= 0
        ) {

            questionTimeLeft =
                perQuestionTime;
        }


        updateQuestionTimer(
            questionTimeLeft
        );


        questionTimer =
            setInterval(
                function () {

                    if (quizFinished) {

                        stopQuestionTimer();

                        return;
                    }


                    /*
                      If answer already submitted
                    */

                    if (
                        submittedAnswers[q.id]
                    ) {

                        stopQuestionTimer();

                        return;
                    }


                    questionTimeLeft--;


                    if (
                        questionTimeLeft <= 0
                    ) {

                        questionTimeLeft = 0;


                        updateQuestionTimer(
                            0
                        );


                        stopQuestionTimer();


                        autoSubmitOnTimeout();


                        return;
                    }


                    updateQuestionTimer(
                        questionTimeLeft
                    );

                },
                1000
            );
    }


    function stopQuestionTimer() {

        if (questionTimer) {

            clearInterval(
                questionTimer
            );

            questionTimer = null;
        }
    }


    function updateQuestionTimer(seconds) {

        const el =
            document.getElementById(
                "questionTimer"
            );


        if (!el) {
            return;
        }


        el.textContent =
            Math.max(
                0,
                Number(seconds)
            );


        if (
            Number(seconds) <= 10
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


    /* =====================================================
       AUTO SUBMIT WHEN QUESTION TIME ENDS
    ===================================================== */

    function autoSubmitOnTimeout() {

        const q =
            questions[currentIndex];


        if (!q) {
            return;
        }


        if (
            submittedAnswers[q.id]
        ) {
            return;
        }


        /*
          If user selected answer,
          automatically submit it.
        */

        if (
            selectedAnswers[q.id]
        ) {

            submittedAnswers[q.id] =
                true;

        } else {

            /*
              Mark as submitted but skipped
            */

            submittedAnswers[q.id] =
                true;
        }


        renderQuestion();


        saveAttempt();
    }


    /* =====================================================
       TOTAL TIMER
    ===================================================== */

    function startTotalTimer() {

        if (totalTimer) {
            clearInterval(totalTimer);
        }


        updateTotalTimer();


        totalTimer =
            setInterval(
                function () {

                    if (quizFinished) {

                        clearInterval(
                            totalTimer
                        );

                        return;
                    }


                    totalSeconds++;


                    updateTotalTimer();


                    saveAttempt();

                },
                1000
            );
    }


    function updateTotalTimer() {

        const el =
            document.getElementById(
                "totalTimer"
            );


        if (!el) {
            return;
        }


        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const seconds =
                totalSeconds % 60;


        el.textContent =
            String(minutes)
                .padStart(2, "0")
            +
            ":" +
            String(seconds)
                .padStart(2, "0");
    }


    /* =====================================================
       FINISH QUIZ
    ===================================================== */

    window.finishQuiz =
        function () {

            if (quizFinished) {
                return;
            }


            const unanswered =
                questions.filter(
                    q =>
                        !submittedAnswers[q.id]
                ).length;


            if (
                unanswered > 0
            ) {

                const proceed =
                    confirm(
                        unanswered +
                        " question(s) are not submitted.\n\n" +
                        "Do you want to submit the quiz?"
                    );


                if (!proceed) {
                    return;
                }


                /*
                  Mark remaining as submitted
                  so result can calculate skipped.
                */

                questions.forEach(
                    function (q) {

                        if (
                            !submittedAnswers[q.id]
                        ) {

                            submittedAnswers[q.id] =
                                true;
                        }

                    }
                );
            }


            quizFinished = true;


            stopQuestionTimer();


            if (totalTimer) {

                clearInterval(
                    totalTimer
                );

                totalTimer = null;
            }


            calculateResult();


            clearAttempt();
        };


    /* =====================================================
       CALCULATE RESULT
    ===================================================== */

    function calculateResult() {

        let correct = 0;

        let incorrect = 0;

        let skipped = 0;

        let score = 0;


        questions.forEach(
            function (q) {

                const selected =
                    Number(
                        selectedAnswers[q.id] ||
                        0
                    );


                const correctAnswer =
                    Number(
                        q.correctOption ||
                        0
                    );


                /*
                  SKIPPED
                */

                if (!selected) {

                    skipped++;

                    return;
                }


                /*
                  CORRECT
                */

                if (
                    selected ===
                    correctAnswer
                ) {

                    correct++;

                    score +=
                        positiveMark;

                } else {

                    incorrect++;

                    score -=
                        negativeMark;
                }

            }
        );


        const attempted =
            correct +
            incorrect;


        const accuracy =
            attempted > 0
                ? Math.round(
                    (
                        correct /
                        attempted
                    ) * 100
                )
                : 0;


        const result = {

            score: score,

            correct: correct,

            incorrect: incorrect,

            skipped: skipped,

            accuracy: accuracy,

            totalQuestions:
                questions.length,

            attempted: attempted,

            totalTime:
                totalSeconds,

            positiveMark:
                positiveMark,

            negativeMark:
                negativeMark,

            quizTitle:
                quizData.title ||
                "Practice Quiz",

            courseId:
                getIds().courseId,

            chapterId:
                getIds().chapterId,

            topicId:
                getIds().topicId,

            quizId:
                getIds().quizId,

            questionIds:
                questions.map(
                    q => q.id
                ),

            selectedAnswers:
                selectedAnswers,

            submittedAnswers:
                submittedAnswers,

            completedAt:
                Date.now()
        };


        /*
          MOST IMPORTANT:
          Result page will read this.
        */

        localStorage.setItem(
            "quizResult",
            JSON.stringify(result)
        );


        sessionStorage.setItem(
            "quizResult",
            JSON.stringify(result)
        );


        /*
          Keep separate result history
        */

        const historyKey =
            "quizHistory";


        let history = [];


        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        historyKey
                    )
                ) || [];

        } catch (e) {

            history = [];
        }


        history.unshift(result);


        /*
          Keep latest 20 attempts
        */

        history =
            history.slice(
                0,
                20
            );


        localStorage.setItem(
            historyKey,
            JSON.stringify(history)
        );


        /*
          Redirect
        */

        setTimeout(
            function () {

                window.location.href =
                    "result.html";

            },
            100
        );
    }


    /* =====================================================
       SAVE ATTEMPT
    ===================================================== */

    function getAttemptKey() {

        const ids =
            getIds();


        return [
            "mneet_attempt",
            ids.courseId,
            ids.chapterId,
            ids.topicId,
            ids.quizId
        ].join("_");
    }


    function saveAttempt() {

        if (
            !questions.length ||
            quizFinished
        ) {
            return;
        }


        const attempt = {

            currentIndex:
                currentIndex,

            selectedAnswers:
                selectedAnswers,

            submittedAnswers:
                submittedAnswers,

            questionTimeLeft:
                questionTimeLeft,

            totalSeconds:
                totalSeconds,

            savedAt:
                Date.now()
        };


        localStorage.setItem(
            getAttemptKey(),
            JSON.stringify(attempt)
        );
    }


    /* =====================================================
       RESTORE ATTEMPT
    ===================================================== */

    function restoreAttempt() {

        try {

            const raw =
                localStorage.getItem(
                    getAttemptKey()
                );


            if (!raw) {

                currentIndex = 0;

                selectedAnswers = {};

                submittedAnswers = {};

                questionTimeLeft =
                    perQuestionTime;

                totalSeconds = 0;

                return;
            }


            const attempt =
                JSON.parse(raw);


            /*
              Only restore recent attempt
              within 6 hours.
            */

            if (
                !attempt.savedAt ||
                Date.now() -
                attempt.savedAt >
                6 * 60 * 60 * 1000
            ) {

                clearAttempt();

                return;
            }


            currentIndex =
                Number(
                    attempt.currentIndex ||
                    0
                );


            if (
                currentIndex >=
                questions.length
            ) {

                currentIndex = 0;
            }


            selectedAnswers =
                attempt.selectedAnswers ||
                {};


            submittedAnswers =
                attempt.submittedAnswers ||
                {};


            questionTimeLeft =
                Number(
                    attempt.questionTimeLeft ||
                    perQuestionTime
                );


            totalSeconds =
                Number(
                    attempt.totalSeconds ||
                    0
                );

        } catch (error) {

            console.warn(
                "Restore attempt failed:",
                error
            );


            currentIndex = 0;

            selectedAnswers = {};

            submittedAnswers = {};

            questionTimeLeft =
                perQuestionTime;

            totalSeconds = 0;
        }
    }


    /* =====================================================
       CLEAR ATTEMPT
    ===================================================== */

    function clearAttempt() {

        localStorage.removeItem(
            getAttemptKey()
        );
    }


    /* =====================================================
       BACK TO TOPIC
    ===================================================== */

    window.goBackToTopic =
        function () {

            const ids =
                getIds();


            /*
              Try topic page first.
            */

            window.location.href =
                "topic.html?courseId=" +
                encodeURIComponent(
                    ids.courseId
                ) +
                "&chapterId=" +
                encodeURIComponent(
                    ids.chapterId
                ) +
                "&topicId=" +
                encodeURIComponent(
                    ids.topicId
                );
        };


    /* =====================================================
       LOADING
    ===================================================== */

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
                ${escapeHTML(
                    message ||
                    "Loading questions..."
                )}
            </div>
        `;
    }


    /* =====================================================
       ERROR
    ===================================================== */

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
                        padding:12px 18px;
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


    /* =====================================================
       SECURITY / HTML ESCAPE
    ===================================================== */

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


    function escapeAttribute(value) {

        return escapeHTML(value);
    }


    /* =====================================================
       START
    ===================================================== */

    function start() {

        /*
          Wait for Firebase scripts.
        */

        if (
            typeof firebase ===
            "undefined"
        ) {

            setTimeout(
                start,
                300
            );

            return;
        }


        loadQuiz();
    }


    /*
      DOM READY
    */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();
    }


})();
