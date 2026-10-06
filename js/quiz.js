/* =========================================================
   mNEET QUIZ ENGINE
   FINAL FIXED VERSION
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

            if (!firebase.apps || firebase.apps.length === 0) {
                return null;
            }

            return firebase.firestore();

        } catch (error) {

            console.error(
                "Firestore error:",
                error
            );

            return null;
        }
    }


    /* =====================================================
       URL PARAMETER
    ===================================================== */

    function getParam(name) {

        try {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            return params.get(name) || "";

        } catch (error) {

            return "";
        }
    }


    /* =====================================================
       STORAGE
    ===================================================== */

    function getStorage(...keys) {

        for (const key of keys) {

            const localValue =
                localStorage.getItem(key);

            if (
                localValue !== null &&
                localValue !== ""
            ) {

                return localValue;
            }


            const sessionValue =
                sessionStorage.getItem(key);

            if (
                sessionValue !== null &&
                sessionValue !== ""
            ) {

                return sessionValue;
            }
        }

        return "";
    }


    /* =====================================================
       CLEAN VALUE
    ===================================================== */

    function cleanValue(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }

        return String(value).trim();
    }


    /* =====================================================
       GET IDS
    ===================================================== */

    function getIds() {

        const courseId =
            getParam("courseId") ||
            getParam("course") ||
            getStorage(
                "activeCourse",
                "quizCourse",
                "courseId"
            ) ||
            "course-01";


        const chapterId =
            getParam("chapterId") ||
            getParam("chapter") ||
            getStorage(
                "activeChapter",
                "quizChapter",
                "chapterId"
            ) ||
            "chapter-01";


        const topicId =
            getParam("topicId") ||
            getParam("topic") ||
            getStorage(
                "activeTopic",
                "quizTopic",
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

            courseId:
                cleanValue(courseId),

            chapterId:
                cleanValue(chapterId),

            topicId:
                cleanValue(topicId),

            quizId:
                cleanValue(quizId),

            typeId:
                cleanValue(typeId)

        };
    }


    /* =====================================================
       SAVE IDS
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

        /*
          Keep quiz-specific IDs too.
        */

        localStorage.setItem(
            "quizCourse",
            ids.courseId
        );

        localStorage.setItem(
            "quizChapter",
            ids.chapterId
        );

        localStorage.setItem(
            "quizTopic",
            ids.topicId
        );

        if (ids.typeId) {

            localStorage.setItem(
                "activeType",
                ids.typeId
            );
        }
    }


    /* =====================================================
       LOAD QUIZ DOCUMENT
    ===================================================== */

    async function loadQuizDocument(ids) {

        /*
          MAIN TOPIC QUIZ PATH

          courses
            / courseId
              / chapters
                / chapterId
                  / topics
                    / topicId
                      / quiz
                        / quizId
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


        const normalSnap =
            await normalRef.get();


        if (normalSnap.exists) {

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

                ref:
                    normalRef,

                data:
                    normalSnap.data() || {},

                mode:
                    "topic"

            };
        }


        /*
          TYPE PRACTICE BACKUP
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

                    ref:
                        typeRef,

                    data:
                        typeSnap.data() || {},

                    mode:
                        "type",

                    typeRef:
                        typeRef

                };
            }
        }


        /*
          Return main reference so the error
          can show the correct expected path.
        */

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

            ref:
                normalRef,

            data:
                {},

            mode:
                "topic"

        };
    }


    /* =====================================================
       LOAD QUESTIONS
    ===================================================== */

    async function loadQuestions(
        quizInfo
    ) {

        let questionRef = null;


        if (
            quizInfo.mode === "type" &&
            quizInfo.typeRef
        ) {

            questionRef =
                quizInfo.typeRef
                    .collection("questions");

        } else {

            questionRef =
                quizInfo.ref
                    .collection("questions");
        }


        let snap = null;


        /*
          FIRST:
          published true + order
        */

        try {

            snap =
                await questionRef
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

        } catch (error) {

            console.warn(
                "Published/order query failed:",
                error
            );


            /*
              SECOND:
              order only
            */

            try {

                snap =
                    await questionRef
                        .orderBy(
                            "order",
                            "asc"
                        )
                        .get();

            } catch (error2) {

                console.warn(
                    "Order query failed:",
                    error2
                );


                /*
                  THIRD:
                  all questions
                */

                snap =
                    await questionRef.get();
            }
        }


        const list = [];


        snap.forEach(
            function (doc) {

                const data =
                    doc.data() || {};


                /*
                  If published exists and false,
                  don't show it.
                */

                if (
                    data.published !== undefined &&
                    data.published === false
                ) {

                    return;
                }


                list.push({

                    id:
                        doc.id,

                    ...data

                });

            }
        );


        /*
          Manual order sorting.
        */

        list.sort(
            function (a, b) {

                const aOrder =
                    Number(
                        a.order || 0
                    );

                const bOrder =
                    Number(
                        b.order || 0
                    );


                return (
                    aOrder -
                    bOrder
                );
            }
        );


        return list;
    }


    /* =====================================================
       GET QUESTION TEXT
    ===================================================== */

    function getQuestionText(q) {

        if (!q) {
            return "Question not available";
        }


        /*
          Your current Firestore format:
          question:
        */

        const fields = [

            q.question,

            q.questionText,

            q.questionTitle,

            q.text,

            q.title

        ];


        for (
            const value of fields
        ) {

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {

                /*
                  Normal text
                */

                if (
                    typeof value === "string" ||
                    typeof value === "number"
                ) {

                    return String(value);
                }


                /*
                  Object fallback
                */

                if (
                    typeof value === "object"
                ) {

                    if (
                        value.text !== undefined
                    ) {

                        return String(
                            value.text
                        );
                    }


                    if (
                        value.question !== undefined
                    ) {

                        return String(
                            value.question
                        );
                    }


                    if (
                        value.value !== undefined
                    ) {

                        return String(
                            value.value
                        );
                    }
                }
            }
        }


        return "Question not available";
    }


    /* =====================================================
       GET CORRECT OPTION
    ===================================================== */

    function getCorrectOption(q) {

        if (!q) {
            return 0;
        }


        /*
          Your Firestore:
          answer:
        */

        const value =
            q.correctOption ??
            q.answer ??
            q.correctAnswer ??
            q.correct ??
            0;


        /*
          Number:
          1 / 2 / 3 / 4
        */

        const number =
            Number(value);


        if (
            Number.isFinite(number) &&
            number >= 1 &&
            number <= 4
        ) {

            return number;
        }


        /*
          Letter:
          A / B / C / D
        */

        const text =
            String(value)
                .trim()
                .toUpperCase();


        const map = {

            A: 1,

            B: 2,

            C: 3,

            D: 4

        };


        return map[text] || 0;
    }


    /* =====================================================
       GET OPTION TEXT
    ===================================================== */

    function getOptionText(
        q,
        number
    ) {

        if (!q) {
            return "";
        }


        const value =
            q["option" + number];


        if (
            value === undefined ||
            value === null
        ) {

            return "";
        }


        return String(value);
    }


    /* =====================================================
       LOAD QUIZ
    ===================================================== */

    async function loadQuiz() {

        showLoading(
            "Loading questions..."
        );


        db =
            getFirestore();


        if (!db) {

            showError(
                "Firebase load হয়নি।<br><br>" +
                "Please check js/firebase.js"
            );

            return;
        }


        const ids =
            getIds();


        saveIds(ids);


        console.log(
            "mNEET Quiz IDs:",
            ids
        );


        try {

            /*
              Get quiz
            */

            const quizInfo =
                await loadQuizDocument(
                    ids
                );


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


            if (
                !Number.isFinite(
                    positiveMark
                )
            ) {

                positiveMark = 4;
            }


            if (
                !Number.isFinite(
                    negativeMark
                )
            ) {

                negativeMark = 1;
            }


            /*
              TIME
            */

            perQuestionTime =
                Number(
                    quizData.timePerQuestion ??
                    quizData.timePerQuestionSeconds ??
                    quizData.questionTime ??
                    60
                );


            if (
                !Number.isFinite(
                    perQuestionTime
                ) ||
                perQuestionTime <= 0
            ) {

                perQuestionTime = 60;
            }


            /*
              LOAD QUESTIONS
            */

            questions =
                await loadQuestions(
                    quizInfo
                );


            console.log(
                "Questions loaded:",
                questions.length
            );


            console.log(
                "Question data:",
                questions
            );


            if (
                !questions.length
            ) {

                showError(
                    "এই quiz-এ কোনো question পাওয়া যায়নি।<br><br>" +

                    "Expected Firestore path:<br>" +

                    "<b>" +
                    quizPath +
                    "/questions</b><br><br>" +

                    "Check করুন যে questions collection-এর ভিতরে question documents আছে।"
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
              RESTORE
            */

            restoreAttempt();


            quizFinished =
                false;


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
                escapeHTML(
                    error.message ||
                    String(error)
                )
            );
        }
    }


    /* =====================================================
       HEADER
    ===================================================== */

    function updateQuizHeader() {

        const title =
            quizData.title ||
            quizData.name ||
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


    /* =====================================================
       UPDATE COUNTER
    ===================================================== */

    function updateCounter() {

        const counter =
            document.getElementById(
                "questionCounter"
            );


        if (counter) {

            counter.textContent =
                questions.length
                    ? (
                        (currentIndex + 1) +
                        " / " +
                        questions.length
                    )
                    : "0 / 0";
        }


        const fill =
            document.getElementById(
                "progressFill"
            );


        if (
            fill &&
            questions.length
        ) {

            const percent =
                (
                    (currentIndex + 1) /
                    questions.length
                ) * 100;


            fill.style.width =
                percent + "%";
        }
    }


    /* =====================================================
       RENDER QUESTION
    ===================================================== */

    function renderQuestion() {

        if (
            !questions.length
        ) {

            return;
        }


        const q =
            questions[currentIndex];


        if (!q) {
            return;
        }


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
            getCorrectOption(q);


        let html = "";


        /* =================================================
           QUESTION CARD
        ================================================= */

        html += `
            <div class="question-card">

                <p class="question-text">
                    ${escapeHTML(
                        getQuestionText(q)
                    )}
                </p>
        `;


        /* =================================================
           QUESTION IMAGE
        ================================================= */

        const imageUrl =
            q.questionImageUrl ||
            q.imageUrl ||
            q.imageURL ||
            q.questionImage ||
            "";


        if (imageUrl) {

            html += `
                <img
                    src="${escapeAttribute(
                        imageUrl
                    )}"
                    class="question-image"
                    alt="Question Image"
                    onerror="this.style.display='none'"
                >
            `;
        }


        /* =================================================
           OPTIONS
        ================================================= */

        html += `
            <div class="options">
        `;


        for (
            let i = 1;
            i <= 4;
            i++
        ) {

            const optionText =
                getOptionText(
                    q,
                    i
                );


            /*
              Don't render completely
              empty options.
            */

            if (
                optionText === ""
            ) {

                continue;
            }


            let classes =
                "option";


            /*
              Selected
            */

            if (
                Number(selected) === i &&
                !submitted
            ) {

                classes +=
                    " selected";
            }


            /*
              After submit
            */

            if (submitted) {

                /*
                  Correct answer green
                */

                if (
                    i === correctOption
                ) {

                    classes +=
                        " correct";
                }


                /*
                  Selected wrong answer red
                */

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
                            optionText
                        )}
                    </span>

                </button>
            `;
        }


        html += `
            </div>
        `;


        /* =================================================
           ANSWER STATUS
        ================================================= */

        if (submitted) {

            const isCorrect =
                Number(selected) ===
                Number(correctOption);


            if (
                isCorrect &&
                selected
            ) {

                html += `
                    <div class="answer-status show correct-status">

                        ✅ Correct Answer

                    </div>
                `;

            } else if (
                selected &&
                !isCorrect
            ) {

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


            /* =============================================
               SOLUTION
            ============================================= */

            const solution =
                q.solution ||
                q.explanation ||
                q.explain ||
                "";


            const reference =
                q.reference ||
                q.ncertReference ||
                q.ncert ||
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

                        ${
                            solution
                                ? `
                                    <div class="solution-text">
                                        ${escapeHTML(
                                            solution
                                        )}
                                    </div>
                                  `
                                : ""
                        }

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


        /* =================================================
           SUBMIT ANSWER
        ================================================= */

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


        /* =================================================
           NAVIGATION
        ================================================= */

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


        /* =================================================
           SUBMIT QUIZ
        ================================================= */

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
          Timer
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
                Number(
                    selectedAnswers[q.id] ||
                    0
                );


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

            if (
                currentIndex <= 0
            ) {

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

                /*
                  Last question:
                  Finish
                */

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


        /*
          Already submitted
        */

        if (
            submittedAnswers[q.id]
        ) {

            updateQuestionTimer(0);

            return;
        }


        /*
          If no valid remaining time,
          start fresh.
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
                      Answer submitted
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

                        questionTimeLeft =
                            0;


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


    /* =====================================================
       STOP QUESTION TIMER
    ===================================================== */

    function stopQuestionTimer() {

        if (questionTimer) {

            clearInterval(
                questionTimer
            );

            questionTimer = null;
        }
    }


    /* =====================================================
       UPDATE QUESTION TIMER
    ===================================================== */

    function updateQuestionTimer(
        seconds
    ) {

        const el =
            document.getElementById(
                "questionTimer"
            );


        if (!el) {
            return;
        }


        const value =
            Math.max(
                0,
                Number(seconds) || 0
            );


        el.textContent =
            value;


        if (
            value <= 10
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
       AUTO SUBMIT TIMEOUT
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
          Whether selected or not,
          mark the question as submitted.

          If no selected answer,
          result will count it as skipped.
        */

        submittedAnswers[q.id] =
            true;


        renderQuestion();


        saveAttempt();
    }


    /* =====================================================
       TOTAL TIMER
    ===================================================== */

    function startTotalTimer() {

        if (totalTimer) {

            clearInterval(
                totalTimer
            );
        }


        updateTotalTimer();


        totalTimer =
            setInterval(
                function () {

                    if (quizFinished) {

                        clearInterval(
                            totalTimer
                        );

                        totalTimer = null;

                        return;
                    }


                    totalSeconds++;


                    updateTotalTimer();


                    saveAttempt();

                },
                1000
            );
    }


    /* =====================================================
       UPDATE TOTAL TIMER
    ===================================================== */

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
                    function (q) {

                        return !submittedAnswers[
                            q.id
                        ];

                    }
                ).length;


            /*
              Ask confirmation if unanswered.
            */

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
                  Mark all remaining as submitted.
                */

                questions.forEach(
                    function (q) {

                        if (
                            !submittedAnswers[
                                q.id
                            ]
                        ) {

                            submittedAnswers[
                                q.id
                            ] = true;
                        }

                    }
                );
            }


            quizFinished =
                true;


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
                        selectedAnswers[
                            q.id
                        ] || 0
                    );


                const correctAnswer =
                    getCorrectOption(q);


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


        const total =
            questions.length;


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


        /*
          FINAL RESULT OBJECT

          IMPORTANT:
          Both old and new property names
          are saved so result.js can read it.
        */

        const result = {

            /*
              Score
            */

            score:
                score,


            /*
              Counts
            */

            correct:
                correct,

            incorrect:
                incorrect,

            skipped:
                skipped,


            /*
              Total
            */

            total:
                total,

            totalQuestions:
                total,


            /*
              Attempted
            */

            attempted:
                attempted,


            /*
              Accuracy
            */

            accuracy:
                accuracy,


            /*
              Time
            */

            time:
                totalSeconds,

            totalTime:
                totalSeconds,


            /*
              Marking
            */

            positiveMark:
                positiveMark,

            negativeMark:
                negativeMark,


            /*
              Quiz
            */

            quizTitle:
                quizData.title ||
                quizData.name ||
                "Practice Quiz",


            /*
              IDs
            */

            courseId:
                getIds().courseId,

            chapterId:
                getIds().chapterId,

            topicId:
                getIds().topicId,

            quizId:
                getIds().quizId,


            /*
              Question IDs
            */

            questionIds:
                questions.map(
                    function (q) {
                        return q.id;
                    }
                ),


            /*
              Answers
            */

            selectedAnswers:
                selectedAnswers,

            submittedAnswers:
                submittedAnswers,


            /*
              Completion
            */

            completed:
                true,


            completedAt:
                Date.now()

        };


        console.log(
            "FINAL QUIZ RESULT:",
            result
        );


        /*
          MOST IMPORTANT:
          Save result before redirect.
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
          History
        */

        let history = [];


        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "quizHistory"
                    )
                ) || [];

        } catch (error) {

            history = [];
        }


        history.unshift(result);


        history =
            history.slice(
                0,
                20
            );


        localStorage.setItem(
            "quizHistory",
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
       ATTEMPT KEY
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


    /* =====================================================
       SAVE ATTEMPT
    ===================================================== */

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


        try {

            localStorage.setItem(
                getAttemptKey(),
                JSON.stringify(attempt)
            );

        } catch (error) {

            console.warn(
                "Could not save attempt:",
                error
            );
        }
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
              Only restore within 6 hours.
            */

            if (
                !attempt.savedAt ||
                Date.now() -
                attempt.savedAt >
                6 * 60 * 60 * 1000
            ) {

                clearAttempt();

                currentIndex = 0;

                selectedAnswers = {};

                submittedAnswers = {};

                questionTimeLeft =
                    perQuestionTime;

                totalSeconds = 0;

                return;
            }


            currentIndex =
                Number(
                    attempt.currentIndex || 0
                );


            if (
                currentIndex < 0 ||
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


            /*
              If current question was already
              submitted, don't restore old timer.
            */

            const q =
                questions[currentIndex];


            if (
                q &&
                submittedAnswers[q.id]
            ) {

                questionTimeLeft = 0;
            }

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

        try {

            localStorage.removeItem(
                getAttemptKey()
            );

        } catch (error) {

            console.warn(
                "Clear attempt error:",
                error
            );
        }
    }


    /* =====================================================
       BACK TO TOPIC
    ===================================================== */

    window.goBackToTopic =
        function () {

            const ids =
                getIds();


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

    function showLoading(
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

    function showError(
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

                ${message}

                <br><br>

                <button
                    type="button"
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
       ESCAPE HTML
    ===================================================== */

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


    /* =====================================================
       ESCAPE ATTRIBUTE
    ===================================================== */

    function escapeAttribute(
        value
    ) {

        return escapeHTML(value);
    }


    /* =====================================================
       START
    ===================================================== */

    function start() {

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


    /* =====================================================
       DOM READY
    ===================================================== */

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
