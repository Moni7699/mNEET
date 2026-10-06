/* =========================================================
   mNEET QUIZ ENGINE
   Firebase Firestore Compatible
   IMAGE QUESTION + TEXT QUESTION

   FEATURES
   ---------------------------------------------------------
   • Topic Quiz
   • Type Practice
   • Text Question
   • Image Question
   • 4 Options
   • Submit Answer
   • Correct / Wrong
   • Solution
   • NCERT Reference
   • Per Question Timer
   • Total Quiz Timer
   • Auto Submit on Timeout
   • Previous / Next
   • Finish Quiz
   • +4 / -1 Marking
   • Accuracy
   • Skipped
   • Resume After Refresh
   • LocalStorage Attempt
   • Result Page
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

    let quizMode = "topic";

    let currentIds = null;


    /* =====================================================
       FIREBASE
       ===================================================== */

    function getFirestore() {

        try {

            if (
                typeof firebase ===
                "undefined"
            ) {

                return null;
            }


            if (
                !firebase.apps ||
                !firebase.apps.length
            ) {

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


            return (
                params.get(name) ||
                ""
            );

        } catch (error) {

            return "";

        }
    }


    /* =====================================================
       STORAGE
       ===================================================== */

    function getStorage() {

        const keys =
            Array.from(
                arguments
            );


        for (
            const key of keys
        ) {

            const localValue =
                localStorage.getItem(
                    key
                );


            if (
                localValue !== null &&
                localValue !== ""
            ) {

                return localValue;

            }


            const sessionValue =
                sessionStorage.getItem(
                    key
                );


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


        return String(
            value
        ).trim();

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
                cleanValue(
                    courseId
                ),

            chapterId:
                cleanValue(
                    chapterId
                ),

            topicId:
                cleanValue(
                    topicId
                ),

            quizId:
                cleanValue(
                    quizId
                ),

            typeId:
                cleanValue(
                    typeId
                )

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


        if (
            ids.typeId
        ) {

            localStorage.setItem(
                "activeType",
                ids.typeId
            );

        }

    }


    /* =====================================================
       GET ATTEMPT KEY
       ===================================================== */

    function getAttemptKey() {

        const ids =
            currentIds ||
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
       LOAD QUIZ DOCUMENT
       ===================================================== */

    async function loadQuizDocument(
        ids
    ) {

        /*
          ---------------------------------------------------
          TOPIC QUIZ
          ---------------------------------------------------
        */

        const topicBase =
            db.collection(
                "courses"
            )
                .doc(
                    ids.courseId
                )
                .collection(
                    "chapters"
                )
                .doc(
                    ids.chapterId
                )
                .collection(
                    "topics"
                )
                .doc(
                    ids.topicId
                );


        /*
          First try:
          quiz
        */

        const normalRef =
            topicBase
                .collection(
                    "quiz"
                )
                .doc(
                    ids.quizId
                );


        let snap =
            await normalRef.get();


        if (
            snap.exists
        ) {

            quizPath =
                "courses/" +
                ids.courseId +
                "/chapters/" +
                ids.chapterId +
                "/topics/" +
                ids.topicId +
                "/quiz/" +
                ids.quizId;


            quizMode =
                "topic";


            return {

                ref:
                    normalRef,

                data:
                    snap.data() ||
                    {},

                mode:
                    "topic"

            };

        }


        /*
          Compatibility:
          quizzes
        */

        const pluralRef =
            topicBase
                .collection(
                    "quizzes"
                )
                .doc(
                    ids.quizId
                );


        const pluralSnap =
            await pluralRef.get();


        if (
            pluralSnap.exists
        ) {

            quizPath =
                "courses/" +
                ids.courseId +
                "/chapters/" +
                ids.chapterId +
                "/topics/" +
                ids.topicId +
                "/quizzes/" +
                ids.quizId;


            quizMode =
                "topic";


            return {

                ref:
                    pluralRef,

                data:
                    pluralSnap.data() ||
                    {},

                mode:
                    "topic"

            };

        }


        /*
          ---------------------------------------------------
          TYPE PRACTICE
          ---------------------------------------------------
        */

        if (
            ids.typeId
        ) {

            const typeRef =
                db.collection(
                    "courses"
                )
                    .doc(
                        ids.courseId
                    )
                    .collection(
                        "chapters"
                    )
                    .doc(
                        ids.chapterId
                    )
                    .collection(
                        "typePractice"
                    )
                    .doc(
                        ids.typeId
                    );


            const typeSnap =
                await typeRef.get();


            if (
                typeSnap.exists
            ) {

                quizPath =
                    "courses/" +
                    ids.courseId +
                    "/chapters/" +
                    ids.chapterId +
                    "/typePractice/" +
                    ids.typeId;


                quizMode =
                    "type";


                return {

                    ref:
                        typeRef,

                    data:
                        typeSnap.data() ||
                        {},

                    mode:
                        "type",

                    typeRef:
                        typeRef

                };

            }

        }


        /*
          Nothing found
        */

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

        let questionRef;


        if (
            quizInfo.mode ===
            "topic"
        ) {

            questionRef =
                quizInfo.ref
                    .collection(
                        "questions"
                    );

        } else {

            questionRef =
                quizInfo.typeRef
                    .collection(
                        "questions"
                    );

        }


        let snap;


        /*
          ---------------------------------------------------
          FIRST QUERY
          published + order
          ---------------------------------------------------
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
              SECOND QUERY
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
                  THIRD QUERY
                */

                snap =
                    await questionRef.get();

            }

        }


        const list = [];


        snap.forEach(
            function (doc) {

                const data =
                    doc.data() ||
                    {};


                /*
                  If explicitly unpublished,
                  skip it.
                */

                if (
                    data.published !==
                        undefined &&
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
          Sort locally also.
        */

        list.sort(
            function (
                a,
                b
            ) {

                const aOrder =
                    Number(
                        a.order ||
                        0
                    );


                const bOrder =
                    Number(
                        b.order ||
                        0
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


        currentIds =
            getIds();


        saveIds(
            currentIds
        );


        console.log(
            "Quiz IDs:",
            currentIds
        );


        try {

            /*
              Load quiz document
            */

            const quizInfo =
                await loadQuizDocument(
                    currentIds
                );


            quizData =
                quizInfo.data ||
                {};


            console.log(
                "Quiz data:",
                quizData
            );


            /*
              ------------------------------------------------
              MARKING
              ------------------------------------------------
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

                positiveMark =
                    4;

            }


            if (
                !Number.isFinite(
                    negativeMark
                )
            ) {

                negativeMark =
                    1;

            }


            /*
              ------------------------------------------------
              TIME
              ------------------------------------------------
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

                perQuestionTime =
                    60;

            }


            /*
              ------------------------------------------------
              QUESTIONS
              ------------------------------------------------
            */

            questions =
                await loadQuestions(
                    quizInfo
                );


            console.log(
                "Questions loaded:",
                questions.length,
                questions
            );


            if (
                !questions.length
            ) {

                showError(
                    "এই quiz-এ কোনো question পাওয়া যায়নি।<br><br>" +
                    "Firestore path:<br>" +
                    "<b>" +
                    escapeHTML(
                        quizPath
                    ) +
                    "/questions</b>"
                );

                return;

            }


            /*
              Reset total
            */

            totalSeconds =
                0;


            /*
              Restore previous attempt
            */

            restoreAttempt();


            quizFinished =
                false;


            /*
              Header
            */

            updateQuizHeader();


            /*
              First render
            */

            renderQuestion();


            /*
              Total timer
            */

            startTotalTimer();


            /*
              Question timer
            */

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
       QUIZ HEADER
       ===================================================== */

    function updateQuizHeader() {

        const title =
            quizData.title ||
            quizData.name ||
            quizData.quizTitle ||
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

        updateTotalTimer();

        updateQuestionTimer(
            questionTimeLeft
        );

    }


    /* =====================================================
       QUESTION COUNTER
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
                        (
                            currentIndex +
                            1
                        ) +
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
                    (
                        currentIndex +
                        1
                    ) /
                    questions.length
                ) *
                100;


            fill.style.width =
                percent + "%";

        }

    }


    /* =====================================================
       GET QUESTION TEXT
       ===================================================== */

    function getQuestionText(
        q
    ) {

        return (
            q.questionText ||
            q.question ||
            q.text ||
            q.questionTitle ||
            q.title ||
            ""
        );

    }


    /* =====================================================
       GET QUESTION IMAGE
       ===================================================== */

    function getQuestionImage(
        q
    ) {

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
       GET OPTION
       ===================================================== */

    function getOptionText(
        q,
        index
    ) {

        const keys = [

            "option" + index,

            "option_" + index,

            "opt" + index,

            "choice" + index

        ];


        for (
            const key of keys
        ) {

            if (
                q[key] !==
                    undefined &&
                q[key] !==
                    null &&
                String(
                    q[key]
                ).trim() !== ""
            ) {

                return String(
                    q[key]
                );

            }

        }


        /*
          Support options array
        */

        if (
            Array.isArray(
                q.options
            )
        ) {

            const value =
                q.options[
                    index - 1
                ];


            if (
                value !==
                    undefined &&
                value !==
                    null
            ) {

                /*
                  If object
                */

                if (
                    typeof value ===
                    "object"
                ) {

                    return (
                        value.text ||
                        value.label ||
                        value.value ||
                        ""
                    );

                }


                return String(
                    value
                );

            }

        }


        return "";

    }


    /* =====================================================
       GET CORRECT OPTION
       ===================================================== */

    function getCorrectOption(
        q
    ) {

        let value =
            q.correctOption ??
            q.answer ??
            q.correctAnswer ??
            q.correct ??
            q.answerIndex;


        /*
          Support A/B/C/D
        */

        if (
            typeof value ===
            "string"
        ) {

            const clean =
                value
                    .trim()
                    .toUpperCase();


            if (
                [
                    "A",
                    "B",
                    "C",
                    "D"
                ].includes(
                    clean
                )
            ) {

                return (
                    "ABCD"
                        .indexOf(
                            clean
                        ) +
                    1
                );

            }


            /*
              Numeric string
            */

            const numeric =
                Number(
                    clean
                );


            if (
                Number.isFinite(
                    numeric
                )
            ) {

                return numeric;

            }

        }


        const numeric =
            Number(
                value || 0
            );


        return Number.isFinite(
            numeric
        )
            ? numeric
            : 0;

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
            questions[
                currentIndex
            ];


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
            selectedAnswers[
                q.id
            ];


        const submitted =
            !!submittedAnswers[
                q.id
            ];


        const correctOption =
            getCorrectOption(
                q
            );


        const questionText =
            getQuestionText(
                q
            );


        const imageUrl =
            getQuestionImage(
                q
            );


        let html =
            "";


        html += `
            <div class="question-card">
        `;


        /* =================================================
           QUESTION TEXT
           ================================================= */

        if (
            questionText
        ) {

            html += `
                <p class="question-text">
                    ${escapeHTML(
                        questionText
                    )}
                </p>
            `;

        } else if (
            !imageUrl
        ) {

            html += `
                <p class="question-text">
                    Question not available
                </p>
            `;

        }


        /* =================================================
           QUESTION IMAGE
           ================================================= */

        if (
            imageUrl
        ) {

            html += `
                <div
                    class="question-image-wrapper"
                    style="
                        width:100%;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        margin:15px 0;
                        overflow:hidden;
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
                getOptionText(
                    q,
                    i
                );


            /*
              Empty option skip
            */

            if (
                !optionText
            ) {

                continue;

            }


            let classes =
                "option";


            /*
              SELECTED
            */

            if (
                Number(
                    selected
                ) === i &&
                !submitted
            ) {

                classes +=
                    " selected";

            }


            /*
              SUBMITTED
            */

            if (
                submitted
            ) {

                /*
                  Correct option
                */

                if (
                    i ===
                    correctOption
                ) {

                    classes +=
                        " correct";

                }


                /*
                  Wrong selected option
                */

                if (
                    Number(
                        selected
                    ) === i &&
                    Number(
                        selected
                    ) !==
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

        if (
            submitted
        ) {

            const isCorrect =
                Number(
                    selected
                ) ===
                correctOption;


            /*
              Correct
            */

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

            }

            /*
              Wrong
            */

            else if (
                selected
            ) {

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

            }

            /*
              Skipped
            */

            else {

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


            /* =================================================
               SOLUTION
               ================================================= */

            const solution =
                q.solution ||
                q.explanation ||
                q.answerExplanation ||
                "";


            const reference =
                q.reference ||
                q.ncertReference ||
                q.ncertPage ||
                q.ncert ||
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
           SUBMIT ANSWER BUTTON
           ================================================= */

        if (
            !submitted
        ) {

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
                        currentIndex ===
                        0
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


        /*
          Submit Quiz button appears
          after current answer is submitted.
        */

        if (
            submitted
        ) {

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


        /*
          Update header
        */

        updateCounter();


        /*
          Timer
        */

        if (
            submitted
        ) {

            stopQuestionTimer();

        } else {

            startQuestionTimer();

        }


        /*
          Save attempt
        */

        saveAttempt();

    }


    /* =====================================================
       SELECT OPTION
       ===================================================== */

    window.selectOption =
        function (
            option
        ) {

            if (
                quizFinished
            ) {

                return;

            }


            const q =
                questions[
                    currentIndex
                ];


            if (!q) {
                return;
            }


            /*
              Already submitted
            */

            if (
                submittedAnswers[
                    q.id
                ]
            ) {

                return;

            }


            const optionNumber =
                Number(
                    option
                );


            if (
                optionNumber < 1 ||
                optionNumber > 4
            ) {

                return;

            }


            selectedAnswers[
                q.id
            ] =
                optionNumber;


            renderQuestion();


            saveAttempt();

        };


    /* =====================================================
       SUBMIT ANSWER
       ===================================================== */

    window.submitAnswer =
        function () {

            if (
                quizFinished
            ) {

                return;

            }


            const q =
                questions[
                    currentIndex
                ];


            if (!q) {
                return;
            }


            const selected =
                selectedAnswers[
                    q.id
                ];


            /*
              No answer selected
            */

            if (
                !selected
            ) {

                alert(
                    "Please select an answer first."
                );

                return;

            }


            submittedAnswers[
                q.id
            ] =
                true;


            /*
              Stop timer immediately
            */

            stopQuestionTimer();


            /*
              Render answer result
            */

            renderQuestion();


            /*
              Save
            */

            saveAttempt();

        };


    /* =====================================================
       PREVIOUS QUESTION
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
                questions[
                    currentIndex
                ];


            if (
                q &&
                submittedAnswers[
                    q.id
                ]
            ) {

                questionTimeLeft =
                    0;

            } else {

                /*
                  New question gets
                  full time.
                */

                questionTimeLeft =
                    perQuestionTime;

            }


            renderQuestion();


            saveAttempt();

        };


    /* =====================================================
       NEXT QUESTION
       ===================================================== */

    window.nextQuestion =
        function () {

            /*
              Last question
            */

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
                questions[
                    currentIndex
                ];


            if (
                q &&
                submittedAnswers[
                    q.id
                ]
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
            questions[
                currentIndex
            ];


        if (!q) {
            return;
        }


        /*
          Already submitted
        */

        if (
            submittedAnswers[
                q.id
            ]
        ) {

            questionTimeLeft =
                0;


            updateQuestionTimer(
                0
            );


            return;

        }


        /*
          Restore timer if valid
        */

        if (
            !Number.isFinite(
                questionTimeLeft
            ) ||
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

                    if (
                        quizFinished
                    ) {

                        stopQuestionTimer();

                        return;

                    }


                    const activeQuestion =
                        questions[
                            currentIndex
                        ];


                    if (!activeQuestion) {

                        stopQuestionTimer();

                        return;

                    }


                    if (
                        submittedAnswers[
                            activeQuestion.id
                        ]
                    ) {

                        stopQuestionTimer();

                        return;

                    }


                    questionTimeLeft--;


                    updateQuestionTimer(
                        questionTimeLeft
                    );


                    saveAttempt();


                    /*
                      Time over
                    */

                    if (
                        questionTimeLeft <=
                        0
                    ) {

                        stopQuestionTimer();


                        autoSubmitOnTimeout();

                    }

                },
                1000
            );

    }


    /* =====================================================
       STOP QUESTION TIMER
       ===================================================== */

    function stopQuestionTimer() {

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
                Number(
                    seconds
                ) || 0
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
       AUTO SUBMIT ON TIMEOUT
       ===================================================== */

    function autoSubmitOnTimeout() {

        const q =
            questions[
                currentIndex
            ];


        if (!q) {
            return;
        }


        if (
            submittedAnswers[
                q.id
            ]
        ) {

            return;

        }


        /*
          If no option selected:
          mark as submitted/skipped.
        */

        submittedAnswers[
            q.id
        ] =
            true;


        /*
          Show answer
        */

        renderQuestion();


        /*
          Save
        */

        saveAttempt();

    }


    /* =====================================================
       TOTAL TIMER
       ===================================================== */

    function startTotalTimer() {

        /*
          Clear old timer
        */

        if (
            totalTimer
        ) {

            clearInterval(
                totalTimer
            );

        }


        updateTotalTimer();


        totalTimer =
            setInterval(
                function () {

                    if (
                        quizFinished
                    ) {

                        clearInterval(
                            totalTimer
                        );


                        totalTimer =
                            null;


                        return;

                    }


                    totalSeconds++;


                    updateTotalTimer();


                    /*
                      Save every second.
                      This keeps refresh resume
                      more accurate.
                    */

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


        const safeSeconds =
            Math.max(
                0,
                Number(
                    totalSeconds
                ) || 0
            );


        const minutes =
            Math.floor(
                safeSeconds /
                60
            );


        const seconds =
                safeSeconds %
                60;


        el.textContent =
            String(
                minutes
            )
                .padStart(
                    2,
                    "0"
                )
            +
            ":"
            +
            String(
                seconds
            )
                .padStart(
                    2,
                    "0"
                );

    }


    /* =====================================================
       FINISH QUIZ
       ===================================================== */

    window.finishQuiz =
        function () {

            if (
                quizFinished
            ) {

                return;

            }


            /*
              Find unanswered questions
            */

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


            /*
              Ask before final submit
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


                if (
                    !proceed
                ) {

                    return;

                }


                /*
                  Mark all remaining
                  questions as submitted.
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
                            ] =
                                true;

                        }

                    }
                );

            }


            /*
              Finish state
            */

            quizFinished =
                true;


            /*
              Stop timers
            */

            stopQuestionTimer();


            if (
                totalTimer
            ) {

                clearInterval(
                    totalTimer
                );


                totalTimer =
                    null;

            }


            /*
              Calculate
            */

            calculateResult();


            /*
              Clear active attempt
            */

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


        /*
          Check every question
        */

        questions.forEach(
            function (q) {

                const selected =
                    Number(
                        selectedAnswers[
                            q.id
                        ] || 0
                    );


                const correctAnswer =
                    getCorrectOption(
                        q
                    );


                /*
                  No selected answer
                */

                if (
                    !selected
                ) {

                    skipped++;

                    return;

                }


                /*
                  Correct
                */

                if (
                    selected ===
                    correctAnswer
                ) {

                    correct++;


                    score +=
                        positiveMark;


                } else {

                    /*
                      Wrong
                    */

                    incorrect++;


                    score -=
                        negativeMark;

                }

            }
        );


        const attempted =
            correct +
            incorrect;


        /*
          Accuracy based on
          attempted questions.
        */

        const accuracy =
            attempted > 0
                ? Math.round(
                    (
                        correct /
                        attempted
                    ) *
                    100
                )
                : 0;


        /*
          IDs
        */

        const ids =
            currentIds ||
            getIds();


        /*
          Result object
        */

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
                quizData.quizTitle ||
                "Practice Quiz",

            courseId:
                ids.courseId,

            chapterId:
                ids.chapterId,

            topicId:
                ids.topicId,

            quizId:
                ids.quizId,

            typeId:
                ids.typeId || "",

            quizMode:
                quizMode,

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


        /*
          Save result
        */

        try {

            localStorage.setItem(
                "quizResult",
                JSON.stringify(
                    result
                )
            );


            sessionStorage.setItem(
                "quizResult",
                JSON.stringify(
                    result
                )
            );

        } catch (error) {

            console.error(
                "Result storage error:",
                error
            );

        }


        /*
          Local history
        */

        let history = [];


        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "quizHistory"
                    )
                ) || [];


            if (
                !Array.isArray(
                    history
                )
            ) {

                history = [];

            }

        } catch (error) {

            history = [];

        }


        /*
          Add newest result
        */

        history.unshift(
            result
        );


        /*
          Keep latest 20
        */

        history =
            history.slice(
                0,
                20
            );


        try {

            localStorage.setItem(
                "quizHistory",
                JSON.stringify(
                    history
                )
            );

        } catch (error) {

            console.error(
                "Quiz history storage error:",
                error
            );

        }


        /*
          Redirect result page
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
                JSON.stringify(
                    attempt
                )
            );

        } catch (error) {

            console.error(
                "Attempt save error:",
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


            /*
              No previous attempt
            */

            if (!raw) {

                currentIndex =
                    0;

                selectedAnswers =
                    {};

                submittedAnswers =
                    {};

                questionTimeLeft =
                    perQuestionTime;

                totalSeconds =
                    0;

                return;

            }


            const attempt =
                JSON.parse(
                    raw
                );


            /*
              Attempt expiry:
              6 hours
            */

            if (
                !attempt.savedAt ||
                (
                    Date.now() -
                    attempt.savedAt
                ) >
                6 * 60 * 60 * 1000
            ) {

                clearAttempt();


                currentIndex =
                    0;

                selectedAnswers =
                    {};

                submittedAnswers =
                    {};

                questionTimeLeft =
                    perQuestionTime;

                totalSeconds =
                    0;

                return;

            }


            /*
              Current question
            */

            currentIndex =
                Number(
                    attempt.currentIndex ||
                    0
                );


            if (
                currentIndex < 0 ||
                currentIndex >=
                questions.length
            ) {

                currentIndex =
                    0;

            }


            /*
              Answers
            */

            selectedAnswers =
                (
                    attempt.selectedAnswers &&
                    typeof attempt.selectedAnswers ===
                    "object"
                )
                    ? attempt.selectedAnswers
                    : {};


            submittedAnswers =
                (
                    attempt.submittedAnswers &&
                    typeof attempt.submittedAnswers ===
                    "object"
                )
                    ? attempt.submittedAnswers
                    : {};


            /*
              Question timer
            */

            questionTimeLeft =
                Number(
                    attempt.questionTimeLeft
                );


            if (
                !Number.isFinite(
                    questionTimeLeft
                ) ||
                questionTimeLeft < 0
            ) {

                questionTimeLeft =
                    perQuestionTime;

            }


            /*
              Total timer
            */

            totalSeconds =
                Number(
                    attempt.totalSeconds
                );


            if (
                !Number.isFinite(
                    totalSeconds
                ) ||
                totalSeconds < 0
            ) {

                totalSeconds =
                    0;

            }


            /*
              If current question is
              already submitted,
              don't restart its timer.
            */

            const currentQuestion =
                questions[
                    currentIndex
                ];


            if (
                currentQuestion &&
                submittedAnswers[
                    currentQuestion.id
                ]
            ) {

                questionTimeLeft =
                    0;

            }


            console.log(
                "Quiz attempt restored:",
                attempt
            );

        } catch (error) {

            console.warn(
                "Restore attempt failed:",
                error
            );


            currentIndex =
                0;

            selectedAnswers =
                {};

            submittedAnswers =
                {};

            questionTimeLeft =
                perQuestionTime;

            totalSeconds =
                0;

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

            console.error(
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
                currentIds ||
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

    function escapeHTML(
        value
    ) {

        return String(
            value
        )

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

        return escapeHTML(
            value
        );

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


    /* =====================================================
       PAGE CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            /*
              Save latest attempt
              before page leaves.
            */

            if (
                !quizFinished &&
                questions.length
            ) {

                saveAttempt();

            }

        }
    );


})();
