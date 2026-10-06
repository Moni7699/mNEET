/* =========================================================
   mNEET QUIZ ENGINE
   Firebase Firestore Compatible
   IMAGE QUESTION + TEXT QUESTION
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

            if (!firebase.apps.length) {
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
       PARAMETER
    ===================================================== */

    function getParam(name) {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get(name);
    }


    /* =====================================================
       STORAGE
    ===================================================== */

    function getStorage(...keys) {

        for (const key of keys) {

            const local =
                localStorage.getItem(key);

            if (local) {
                return local;
            }


            const session =
                sessionStorage.getItem(key);

            if (session) {
                return session;
            }
        }

        return "";
    }


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

        const normalRef =
            db.collection("courses")
                .doc(ids.courseId)
                .collection("chapters")
                .doc(ids.chapterId)
                .collection("topics")
                .doc(ids.topicId)
                .collection("quiz")
                .doc(ids.quizId);


        let snap =
            await normalRef.get();


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


        /* TYPE PRACTICE */

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


        return {

            ref: normalRef,

            data: {},

            mode: "topic"

        };
    }


    /* =====================================================
       LOAD QUESTIONS
    ===================================================== */

    async function loadQuestions(
        quizInfo
    ) {

        let questionRef;


        if (
            quizInfo.mode === "topic"
        ) {

            questionRef =
                quizInfo.ref
                    .collection("questions");

        } else {

            questionRef =
                quizInfo.typeRef
                    .collection("questions");
        }


        let snap;


        /* FIRST QUERY */

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


                snap =
                    await questionRef.get();
            }
        }


        const list = [];


        snap.forEach(
            function (doc) {

                const data =
                    doc.data() || {};


                if (
                    data.published !==
                        undefined &&
                    data.published === false
                ) {

                    return;
                }


                list.push({

                    id: doc.id,

                    ...data

                });

            }
        );


        /* SORT */

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
            "Quiz IDs:",
            ids
        );


        try {

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


            /* MARKING */

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


            /* TIME */

            perQuestionTime =
                Number(
                    quizData.timePerQuestion ??
                    quizData.timePerQuestionSeconds ??
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


            /* QUESTIONS */

            questions =
                await loadQuestions(
                    quizInfo
                );


            console.log(
                "Questions loaded:",
                questions.length,
                questions
            );


            if (!questions.length) {

                showError(
                    "এই quiz-এ কোনো question পাওয়া যায়নি।<br><br>" +
                    "Firestore path:<br>" +
                    "<b>" +
                    quizPath +
                    "/questions</b>"
                );

                return;
            }


            totalSeconds = 0;


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
                escapeHTML(
                    error.message ||
                    "Unknown error"
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
       GET QUESTION TEXT
    ===================================================== */

    function getQuestionText(q) {

        return (
            q.questionText ||
            q.question ||
            q.text ||
            q.questionTitle ||
            ""
        );
    }


    /* =====================================================
       GET QUESTION IMAGE
    ===================================================== */

    function getQuestionImage(q) {

        return (
            q.questionImageUrl ||
            q.questionImageURL ||
            q.imageUrl ||
            q.imageURL ||
            q.questionImage ||
            q.image ||
            ""
        );
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
                q.correctOption ||
                q.answer ||
                q.correctAnswer ||
                0
            );


        const questionText =
            getQuestionText(q);


        const imageUrl =
            getQuestionImage(q);


        let html = "";


        html += `
            <div class="question-card">
        `;


        /* =================================================
           QUESTION TEXT
           ================================================= */

        if (questionText) {

            html += `
                <p class="question-text">
                    ${escapeHTML(
                        questionText
                    )}
                </p>
            `;

        } else if (!imageUrl) {

            html += `
                <p class="question-text">
                    Question not available
                </p>
            `;
        }


        /* =================================================
           QUESTION IMAGE
           ================================================= */

        if (imageUrl) {

            html += `
                <div
                    class="question-image-wrapper"
                    style="
                        width:100%;
                        display:flex;
                        justify-content:center;
                        margin:15px 0;
                    "
                >

                    <img
                        src="${escapeAttribute(
                            imageUrl
                        )}"
                        class="question-image"
                        alt="Question"
                        style="
                            max-width:100%;
                            width:auto;
                            height:auto;
                            max-height:500px;
                            object-fit:contain;
                            display:block;
                            border-radius:12px;
                        "
                        onerror="
                            this.style.display='none';
                        "
                    >

                </div>
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
                q[
                    "option" + i
                ];


            if (
                optionText ===
                    undefined ||
                optionText ===
                    null ||
                String(optionText)
                    .trim() === ""
            ) {

                continue;
            }


            let classes =
                "option";


            /* SELECTED */

            if (
                Number(selected) === i &&
                !submitted
            ) {

                classes +=
                    " selected";
            }


            /* SUBMITTED */

            if (submitted) {

                if (
                    i ===
                    correctOption
                ) {

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
                    ${
                        submitted
                            ? "disabled"
                            : ""
                    }
                >

                    <span class="option-letter">
                        ${i}
                    </span>

                    <span class="option-text">
                        ${escapeHTML(
                            String(
                                optionText
                            )
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
                correctOption;


            if (
                isCorrect &&
                selected
            ) {

                html += `
                    <div
                        class="
                            answer-status
                            show
                            correct-status
                        "
                    >
                        ✅ Correct Answer
                    </div>
                `;

            } else if (selected) {

                html += `
                    <div
                        class="
                            answer-status
                            show
                            wrong-status
                        "
                    >

                        ❌ Wrong Answer

                        <br>

                        Correct option:
                        <b>
                            ${correctOption}
                        </b>

                    </div>
                `;

            } else {

                html += `
                    <div
                        class="
                            answer-status
                            show
                            wrong-status
                        "
                    >

                        ⏭️ Skipped

                        <br>

                        Correct option:
                        <b>
                            ${correctOption}
                        </b>

                    </div>
                `;
            }


            /* SOLUTION */

            const solution =
                q.solution ||
                q.explanation ||
                "";


            const reference =
                q.reference ||
                q.ncertReference ||
                q.ncertPage ||
                "";


            if (
                solution ||
                reference
            ) {

                html += `
                    <div
                        class="
                            solution-box
                            show
                        "
                    >

                        <div
                            class="solution-title"
                        >
                            📖 Solution
                        </div>

                        ${
                            solution
                                ? `
                                    <div
                                        class="
                                            solution-text
                                        "
                                    >
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
                                    <div
                                        class="
                                            reference-text
                                        "
                                    >
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
                    ${
                        selected
                            ? ""
                            : "disabled"
                    }
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
                    class="
                        quiz-button
                        previous-button
                    "
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
                    type="button"
                    class="
                        quiz-button
                        next-button
                    "
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
                    class="
                        submit-quiz-button
                    "
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


        /* TIMER */

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

                questionTimeLeft = 0;

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

                questionTimeLeft = 0;

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

            updateQuestionTimer(0);

            return;
        }


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


                    if (
                        submittedAnswers[q.id]
                    ) {

                        stopQuestionTimer();

                        return;
                    }


                    questionTimeLeft--;


                    updateQuestionTimer(
                        questionTimeLeft
                    );


                    if (
                        questionTimeLeft <= 0
                    ) {

                        stopQuestionTimer();


                        autoSubmitOnTimeout();
                    }

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


        if (value <= 10) {

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
       AUTO SUBMIT
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
                    function (q) {

                        return !(
                            submittedAnswers[
                                q.id
                            ]
                        );

                    }
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
                        selectedAnswers[
                            q.id
                        ] || 0
                    );


                const correctAnswer =
                    Number(
                        q.correctOption ||
                        q.answer ||
                        q.correctAnswer ||
                        0
                    );


                if (!selected) {

                    skipped++;

                    return;
                }


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

            score:

                score,

            correct:

                correct,

            incorrect:

                incorrect,

            skipped:

                skipped,

            accuracy:

                accuracy,

            total:

                questions.length,

            totalQuestions:

                questions.length,

            attempted:

                attempted,

            time:

                totalSeconds,

            totalTime:

                totalSeconds,

            positiveMark:

                positiveMark,

            negativeMark:

                negativeMark,

            quizTitle:

                quizData.title ||
                quizData.name ||
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
                    function (q) {
                        return q.id;
                    }
                ),

            selectedAnswers:

                selectedAnswers,

            submittedAnswers:

                submittedAnswers,

            completedAt:

                Date.now()
        };


        localStorage.setItem(
            "quizResult",
            JSON.stringify(result)
        );


        sessionStorage.setItem(
            "quizResult",
            JSON.stringify(result)
        );


        /* HISTORY */

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


        /* REDIRECT */

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


            if (
                !attempt.savedAt ||
                (
                    Date.now() -
                    attempt.savedAt
                ) >
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


            window.location.href =
                "topic.html" +
                "?courseId=" +
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
                    type="button"
                    onclick="goBackToTopic()"
                    style="
                        border:0;
                        border-radius:10px;
                        padding:12px 18px;
                        background:#ffc107;
                        color:#111;
                        font-weight:900;
                        cursor:pointer;
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
