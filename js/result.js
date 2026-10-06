// ==========================================================
// mNEET - RESULT + PROGRESS SYSTEM
// Firebase Firestore Compatible
// ==========================================================

"use strict";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let resultData = null;

let currentUser = null;

let resultSaveStarted = false;

let resultSaveCompleted = false;


// ==========================================================
// PAGE START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        waitForFirebase();

    }
);


// ==========================================================
// WAIT FOR FIREBASE
// ==========================================================

function waitForFirebase() {

    if (
        typeof firebase === "undefined" ||
        typeof firebase.auth !== "function"
    ) {

        setTimeout(
            waitForFirebase,
            300
        );

        return;
    }


    firebase.auth().onAuthStateChanged(
        function (user) {

            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }


            currentUser =
                user;


            loadResult();

        }
    );

}


// ==========================================================
// LOAD RESULT
// ==========================================================

function loadResult() {

    let savedResult =
        localStorage.getItem(
            "quizResult"
        );


    /*
      Backup:
      sessionStorage
    */

    if (!savedResult) {

        savedResult =
            sessionStorage.getItem(
                "quizResult"
            );

    }


    /*
      No result
    */

    if (!savedResult) {

        showNoResult();

        return;
    }


    /*
      Parse result
    */

    try {

        resultData =
            JSON.parse(
                savedResult
            );

    } catch (error) {

        console.error(
            "Result JSON error:",
            error
        );


        showNoResult();

        return;
    }


    /*
      Validate object
    */

    if (
        !resultData ||
        typeof resultData !== "object"
    ) {

        showNoResult();

        return;
    }


    /*
      Display immediately
    */

    displayResult();


    /*
      Save progress
    */

    saveProgress();

}


// ==========================================================
// DISPLAY RESULT
// ==========================================================

function displayResult() {

    if (!resultData) {
        return;
    }


    const total =
        getNumber(
            resultData.totalQuestions,
            resultData.total,
            0
        );


    const correct =
        getNumber(
            resultData.correct,
            0
        );


    const incorrect =
        getNumber(
            resultData.incorrect,
            0
        );


    const skipped =
        getNumber(
            resultData.skipped,
            0
        );


    const score =
        getNumber(
            resultData.score,
            0
        );


    /*
      Accuracy:
      Prefer saved accuracy.
      If missing, calculate it.
    */

    let accuracy =
        getNumber(
            resultData.accuracy,
            -1
        );


    if (
        accuracy < 0
    ) {

        const attempted =
            correct +
            incorrect;


        accuracy =
            attempted > 0
                ? Math.round(
                    (
                        correct /
                        attempted
                    ) * 100
                )
                : 0;

    }


    /*
      Total time
    */

    const time =
        getNumber(
            resultData.totalTime,
            resultData.time,
            0
        );


    /*
      Display
    */

    setText(
        "score",
        score
    );


    setText(
        "correct",
        correct
    );


    setText(
        "incorrect",
        incorrect
    );


    setText(
        "skipped",
        skipped
    );


    setText(
        "accuracy",
        accuracy + "%"
    );


    setText(
        "time",
        formatTime(time)
    );


    /*
      Accuracy bar
    */

    const accuracyFill =
        document.getElementById(
            "accuracyFill"
        );


    if (accuracyFill) {

        const safeAccuracy =
            Math.max(
                0,
                Math.min(
                    100,
                    accuracy
                )
            );


        accuracyFill.style.width =
            safeAccuracy + "%";

    }


    /*
      Quiz title
    */

    const title =
        resultData.quizTitle ||
        resultData.title ||
        "Practice Quiz";


    setText(
        "resultTitle",
        title
    );


    /*
      Result message
    */

    updateMessage(
        accuracy,
        correct,
        total
    );

}


// ==========================================================
// NUMBER HELPER
// ==========================================================

function getNumber() {

    const values =
        Array.from(arguments);


    for (
        let i = 0;
        i < values.length;
        i++
    ) {

        const value =
            Number(
                values[i]
            );


        if (
            Number.isFinite(value)
        ) {

            return value;

        }

    }


    return 0;

}


// ==========================================================
// SAFE TEXT
// ==========================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            String(value);

    }

}


// ==========================================================
// SAVE PROGRESS
// ==========================================================

async function saveProgress() {

    /*
      Prevent accidental duplicate
      save calls during same page.
    */

    if (
        resultSaveStarted
    ) {

        return;

    }


    if (
        !currentUser ||
        !resultData
    ) {

        return;

    }


    resultSaveStarted =
        true;


    /*
      Firestore
    */

    let firestore;


    try {

        firestore =
            firebase.firestore();

    } catch (error) {

        console.error(
            "Firestore unavailable:",
            error
        );

        resultSaveStarted =
            false;

        return;
    }


    /*
      IDs
    */

    const courseId =
        String(
            resultData.courseId || ""
        ).trim();


    const chapterId =
        String(
            resultData.chapterId || ""
        ).trim();


    const topicId =
        String(
            resultData.topicId || ""
        ).trim();


    const quizId =
        String(
            resultData.quizId || ""
        ).trim();


    /*
      Required IDs
    */

    if (
        !courseId ||
        !chapterId ||
        !topicId
    ) {

        console.error(
            "Progress IDs missing:",
            resultData
        );


        resultSaveStarted =
            false;

        return;
    }


    /*
      Result values
    */

    const total =
        getNumber(
            resultData.totalQuestions,
            resultData.total,
            0
        );


    const correct =
        getNumber(
            resultData.correct,
            0
        );


    const incorrect =
        getNumber(
            resultData.incorrect,
            0
        );


    const skipped =
        getNumber(
            resultData.skipped,
            0
        );


    const score =
        getNumber(
            resultData.score,
            0
        );


    let accuracy =
        getNumber(
            resultData.accuracy,
            -1
        );


    if (
        accuracy < 0
    ) {

        const attempted =
            correct +
            incorrect;


        accuracy =
            attempted > 0
                ? Math.round(
                    (
                        correct /
                        attempted
                    ) * 100
                )
                : 0;

    }


    /*
      Topic percentage

      Example:

      8 correct
      10 total
      = 80%
    */

    const topicPercent =
        total > 0
            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )
            : 0;


    /*
      Progress document ID
    */

    const progressId =
        [
            courseId,
            chapterId,
            topicId
        ].join("_");


    const progressRef =
        firestore
            .collection("users")
            .doc(
                currentUser.uid
            )
            .collection("progress")
            .doc(
                progressId
            );


    try {

        /*
          Read old progress
        */

        const oldDoc =
            await progressRef.get();


        let oldData =
            {};


        if (
            oldDoc.exists
        ) {

            oldData =
                oldDoc.data() || {};

        }


        /*
          Old values
        */

        const oldAttempts =
            Number(
                oldData.attempts || 0
            );


        const oldBestScore =
            Number(
                oldData.bestScore || 0
            );


        const oldBestAccuracy =
            Number(
                oldData.bestAccuracy || 0
            );


        /*
          Best score
        */

        const bestScore =
            Math.max(
                oldBestScore,
                score
            );


        /*
          Best accuracy
        */

        const bestAccuracy =
            Math.max(
                oldBestAccuracy,
                accuracy
            );


        /*
          Progress data
        */

        const progressData = {

            userId:
                currentUser.uid,

            courseId:
                courseId,

            chapterId:
                chapterId,

            topicId:
                topicId,

            quizId:
                quizId,

            attempts:
                oldAttempts + 1,

            totalQuestions:
                total,

            correct:
                correct,

            incorrect:
                incorrect,

            skipped:
                skipped,

            percent:
                topicPercent,

            lastScore:
                score,

            bestScore:
                bestScore,

            lastAccuracy:
                accuracy,

            bestAccuracy:
                bestAccuracy,

            lastAttemptAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /*
          Save main progress
        */

        await progressRef.set(
            progressData,
            {
                merge: true
            }
        );


        console.log(
            "Progress saved successfully:",
            progressData
        );


        /*
          Save attempt history
        */

        await saveAttemptHistory(
            firestore,
            courseId,
            chapterId,
            topicId,
            quizId
        );


        resultSaveCompleted =
            true;


        console.log(
            "Result progress system completed."
        );


    } catch (error) {

        console.error(
            "Progress save error:",
            error
        );


        /*
          Allow retry if Firestore
          temporarily failed.
        */

        resultSaveStarted =
            false;

    }

}


// ==========================================================
// SAVE ATTEMPT HISTORY
// ==========================================================

async function saveAttemptHistory(
    firestore,
    courseId,
    chapterId,
    topicId,
    quizId
) {

    if (
        !currentUser ||
        !resultData
    ) {

        return;

    }


    try {

        const historyRef =
            firestore
                .collection("users")
                .doc(
                    currentUser.uid
                )
                .collection("quizAttempts")
                .doc();


        const total =
            getNumber(
                resultData.totalQuestions,
                resultData.total,
                0
            );


        const correct =
            getNumber(
                resultData.correct,
                0
            );


        const incorrect =
            getNumber(
                resultData.incorrect,
                0
            );


        const skipped =
            getNumber(
                resultData.skipped,
                0
            );


        const score =
            getNumber(
                resultData.score,
                0
            );


        let accuracy =
            getNumber(
                resultData.accuracy,
                -1
            );


        if (
            accuracy < 0
        ) {

            const attempted =
                correct +
                incorrect;


            accuracy =
                attempted > 0
                    ? Math.round(
                        (
                            correct /
                            attempted
                        ) * 100
                    )
                    : 0;

        }


        const totalTime =
            getNumber(
                resultData.totalTime,
                resultData.time,
                0
            );


        await historyRef.set({

            userId:
                currentUser.uid,

            courseId:
                courseId,

            chapterId:
                chapterId,

            topicId:
                topicId,

            quizId:
                quizId,

            quizTitle:
                resultData.quizTitle ||
                resultData.title ||
                "Practice Quiz",

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

            totalQuestions:
                total,

            attempted:
                correct +
                incorrect,

            totalTime:
                totalTime,

            positiveMark:
                getNumber(
                    resultData.positiveMark,
                    4
                ),

            negativeMark:
                getNumber(
                    resultData.negativeMark,
                    1
                ),

            completedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


        console.log(
            "Quiz attempt history saved."
        );


    } catch (error) {

        /*
          History fail করলে
          main progress নষ্ট হবে না.
        */

        console.error(
            "Attempt history error:",
            error
        );

    }

}


// ==========================================================
// RESULT MESSAGE
// ==========================================================

function updateMessage(
    accuracy,
    correct,
    total
) {

    const element =
        document.getElementById(
            "resultMessage"
        );


    if (!element) {
        return;
    }


    if (
        total <= 0
    ) {

        element.textContent =
            "No questions were attempted.";

        return;
    }


    if (
        accuracy >= 90
    ) {

        element.textContent =
            "Excellent performance! Keep this level of preparation for NEET.";

    } else if (
        accuracy >= 75
    ) {

        element.textContent =
            "Great work! A little more practice can make your performance even stronger.";

    } else if (
        accuracy >= 50
    ) {

        element.textContent =
            "Good attempt. Review the incorrect questions and try again.";

    } else {

        element.textContent =
            "Keep practicing. Read the NCERT concepts carefully and reattempt the quiz.";

    }

}


// ==========================================================
// REATTEMPT QUIZ
// ==========================================================

function reattemptQuiz() {

    if (!resultData) {
        return;
    }


    /*
      IDs
    */

    const courseId =
        String(
            resultData.courseId || ""
        ).trim();


    const chapterId =
        String(
            resultData.chapterId || ""
        ).trim();


    const topicId =
        String(
            resultData.topicId || ""
        ).trim();


    const quizId =
        String(
            resultData.quizId || ""
        ).trim();


    /*
      Save IDs
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


    localStorage.setItem(
        "activeQuiz",
        quizId
    );


    /*
      Preserve active type if
      result contains it.
    */

    if (
        resultData.typeId
    ) {

        localStorage.setItem(
            "activeType",
            String(
                resultData.typeId
            )
        );

    }


    /*
      Attempt key
    */

    const attemptKey =
        [
            "mneet_attempt",
            courseId,
            chapterId,
            topicId,
            quizId
        ].join("_");


    /*
      Delete previous attempt
    */

    localStorage.removeItem(
        attemptKey
    );


    /*
      Clear result
    */

    localStorage.removeItem(
        "quizResult"
    );


    sessionStorage.removeItem(
        "quizResult"
    );


    /*
      Build quiz URL
    */

    let url =
        "quiz.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        ) +
        "&chapterId=" +
        encodeURIComponent(
            chapterId
        ) +
        "&topicId=" +
        encodeURIComponent(
            topicId
        ) +
        "&quizId=" +
        encodeURIComponent(
            quizId
        );


    /*
      Type practice compatibility
    */

    if (
        resultData.typeId
    ) {

        url +=
            "&typeId=" +
            encodeURIComponent(
                String(
                    resultData.typeId
                )
            );

    }


    window.location.href =
        url;

}


// ==========================================================
// BACK TO TOPIC
// ==========================================================

function goToTopic() {

    if (!resultData) {

        window.location.href =
            "student.html";

        return;
    }


    const courseId =
        String(
            resultData.courseId || ""
        ).trim();


    const chapterId =
        String(
            resultData.chapterId || ""
        ).trim();


    const topicId =
        String(
            resultData.topicId || ""
        ).trim();


    /*
      Save IDs
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


    /*
      Topic URL
    */

    window.location.href =
        "topic.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        ) +
        "&chapterId=" +
        encodeURIComponent(
            chapterId
        ) +
        "&topicId=" +
        encodeURIComponent(
            topicId
        );

}


// ==========================================================
// BACK TO CHAPTER
// ==========================================================

function goToChapter() {

    if (!resultData) {

        window.location.href =
            "student.html";

        return;
    }


    const courseId =
        String(
            resultData.courseId || ""
        ).trim();


    const chapterId =
        String(
            resultData.chapterId || ""
        ).trim();


    /*
      Save IDs
    */

    localStorage.setItem(
        "activeCourse",
        courseId
    );


    localStorage.setItem(
        "activeChapter",
        chapterId
    );


    /*
      Chapter URL
    */

    window.location.href =
        "chapter.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        ) +
        "&chapterId=" +
        encodeURIComponent(
            chapterId
        );

}


// ==========================================================
// DASHBOARD
// ==========================================================

function goToStudent() {

    window.location.href =
        "student.html";

}


// ==========================================================
// NO RESULT
// ==========================================================

function showNoResult() {

    /*
      Reset visible values
    */

    setText(
        "score",
        "0"
    );


    setText(
        "correct",
        "0"
    );


    setText(
        "incorrect",
        "0"
    );


    setText(
        "skipped",
        "0"
    );


    setText(
        "accuracy",
        "0%"
    );


    setText(
        "time",
        "00:00"
    );


    setText(
        "resultTitle",
        "Result Not Found"
    );


    const accuracyFill =
        document.getElementById(
            "accuracyFill"
        );


    if (accuracyFill) {

        accuracyFill.style.width =
            "0%";

    }


    const message =
        document.getElementById(
            "resultMessage"
        );


    if (message) {

        message.textContent =
            "Quiz result পাওয়া যায়নি। Please attempt the quiz again.";

    }

}


// ==========================================================
// FORMAT TIME
// ==========================================================

function formatTime(seconds) {

    seconds =
        Number(
            seconds || 0
        );


    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {

        seconds = 0;

    }


    seconds =
        Math.floor(
            seconds
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes)
            .padStart(
                2,
                "0"
            )
        +
        ":"
        +
        String(
            remainingSeconds
        )
            .padStart(
                2,
                "0"
            )
    );

}


// ==========================================================
// PAGE EXIT CLEANUP
// ==========================================================

window.addEventListener(
    "beforeunload",
    function () {

        /*
          No active timer exists
          on result page.

          This section is intentionally
          kept lightweight.
        */

    }
);
