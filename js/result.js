// ==========================================================
// mNEET - RESULT + PROGRESS SYSTEM
// Firebase Firestore Compatible
// ==========================================================

"use strict";

let resultData = null;
let currentUser = null;


// ==========================================================
// PAGE START
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    waitForFirebase();

});


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


            currentUser = user;

            loadResult();

        }
    );

}


// ==========================================================
// LOAD RESULT
// ==========================================================

function loadResult() {

    let savedResult =
        localStorage.getItem("quizResult");


    /*
      Backup: sessionStorage
    */

    if (!savedResult) {

        savedResult =
            sessionStorage.getItem("quizResult");

    }


    if (!savedResult) {

        showNoResult();

        return;
    }


    try {

        resultData =
            JSON.parse(savedResult);

    } catch (error) {

        console.error(
            "Result JSON error:",
            error
        );

        showNoResult();

        return;
    }


    /*
      Display result first
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

    const total =
        Number(
            resultData.totalQuestions ??
            resultData.total ??
            0
        );


    const correct =
        Number(
            resultData.correct ?? 0
        );


    const incorrect =
        Number(
            resultData.incorrect ?? 0
        );


    const skipped =
        Number(
            resultData.skipped ?? 0
        );


    const score =
        Number(
            resultData.score ?? 0
        );


    const accuracy =
        Number(
            resultData.accuracy ?? 0
        );


    /*
      Result JS and quiz.js compatibility
    */

    const time =
        Number(
            resultData.totalTime ??
            resultData.time ??
            0
        );


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
      Accuracy progress bar
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
      Message
    */

    updateMessage(
        accuracy,
        correct,
        total
    );

}


// ==========================================================
// SAFE TEXT
// ==========================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================================
// SAVE PROGRESS
// ==========================================================

async function saveProgress() {

    if (
        !currentUser ||
        !resultData
    ) {

        return;
    }


    /*
      Firebase Firestore
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


    if (
        !courseId ||
        !chapterId ||
        !topicId
    ) {

        console.error(
            "Progress IDs missing:",
            resultData
        );

        return;
    }


    /*
      Result values
    */

    const total =
        Number(
            resultData.totalQuestions ??
            resultData.total ??
            0
        );


    const correct =
        Number(
            resultData.correct ?? 0
        );


    const incorrect =
        Number(
            resultData.incorrect ?? 0
        );


    const skipped =
        Number(
            resultData.skipped ?? 0
        );


    const score =
        Number(
            resultData.score ?? 0
        );


    const accuracy =
        Number(
            resultData.accuracy ?? 0
        );


    /*
      Topic percentage

      Example:
      8 correct out of 10
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

      course_chapter_topic
    */

    const progressId =
        courseId +
        "_" +
        chapterId +
        "_" +
        topicId;


    const progressRef =
        firestore
            .collection("users")
            .doc(currentUser.uid)
            .collection("progress")
            .doc(progressId);


    try {

        /*
          Read old progress
        */

        const oldDoc =
            await progressRef.get();


        let oldData = {};


        if (oldDoc.exists) {

            oldData =
                oldDoc.data() || {};

        }


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
          New progress data
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
          Save
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
          Also save a separate
          attempt history document.
        */

        await saveAttemptHistory(
            firestore,
            courseId,
            chapterId,
            topicId,
            quizId
        );


    } catch (error) {

        console.error(
            "Progress save error:",
            error
        );

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

    if (!currentUser) {
        return;
    }


    try {

        const historyRef =
            firestore
                .collection("users")
                .doc(currentUser.uid)
                .collection("quizAttempts")
                .doc();


        await historyRef.set({

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
                "Practice Quiz",

            score:
                Number(
                    resultData.score || 0
                ),

            correct:
                Number(
                    resultData.correct || 0
                ),

            incorrect:
                Number(
                    resultData.incorrect || 0
                ),

            skipped:
                Number(
                    resultData.skipped || 0
                ),

            accuracy:
                Number(
                    resultData.accuracy || 0
                ),

            totalQuestions:
                Number(
                    resultData.totalQuestions ??
                    resultData.total ??
                    0
                ),

            totalTime:
                Number(
                    resultData.totalTime ??
                    resultData.time ??
                    0
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


    if (total <= 0) {

        element.textContent =
            "No questions were attempted.";

        return;
    }


    if (accuracy >= 90) {

        element.textContent =
            "Excellent performance! Keep this level of preparation for NEET.";

    } else if (accuracy >= 75) {

        element.textContent =
            "Great work! A little more practice can make your performance even stronger.";

    } else if (accuracy >= 50) {

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


    const courseId =
        resultData.courseId || "";


    const chapterId =
        resultData.chapterId || "";


    const topicId =
        resultData.topicId || "";


    const quizId =
        resultData.quizId || "";


    /*
      Save all IDs
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
      IMPORTANT:
      Delete previous attempt
      so reattempt starts fresh.
    */

    const attemptKey =
        [
            "mneet_attempt",
            courseId,
            chapterId,
            topicId,
            quizId
        ].join("_");


    localStorage.removeItem(
        attemptKey
    );


    /*
      Clear old quiz result
    */

    localStorage.removeItem(
        "quizResult"
    );


    sessionStorage.removeItem(
        "quizResult"
    );


    /*
      Open quiz with IDs
    */

    const url =
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
        resultData.courseId || "";


    const chapterId =
        resultData.chapterId || "";


    const topicId =
        resultData.topicId || "";


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
        resultData.courseId || "";


    const chapterId =
        resultData.chapterId || "";


    localStorage.setItem(
        "activeCourse",
        courseId
    );


    localStorage.setItem(
        "activeChapter",
        chapterId
    );


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

    const title =
        document.getElementById(
            "resultTitle"
        );


    const message =
        document.getElementById(
            "resultMessage"
        );


    if (title) {

        title.textContent =
            "Result Not Found";

    }


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
        Number(seconds || 0);


    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {

        seconds = 0;

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":" +
        String(remainingSeconds)
            .padStart(2, "0")
    );

}
