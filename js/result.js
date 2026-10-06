// ==========================================
// mNEET - RESULT SYSTEM
// ==========================================

let resultData = {};


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (typeof auth === "undefined") {
        console.error("Firebase Auth not loaded");
        return;
    }

    auth.onAuthStateChanged(function (user) {

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        loadResult();

    });

});


// ==========================================
// LOAD RESULT
// ==========================================

function loadResult() {

    const raw =
        localStorage.getItem("quizResult");

    if (!raw) {

        console.error("quizResult not found");

        window.location.href = "student.html";

        return;
    }

    try {

        resultData = JSON.parse(raw);

    } catch (error) {

        console.error(
            "Cannot read quizResult:",
            error
        );

        window.location.href = "student.html";

        return;
    }


    console.log(
        "RESULT DATA:",
        resultData
    );


    displayResult();

    saveProgress();

}


// ==========================================
// DISPLAY RESULT
// ==========================================

function displayResult() {

    const total =
        getNumber(resultData.total);

    const correct =
        getNumber(resultData.correct);

    const incorrect =
        getNumber(resultData.incorrect);

    const skipped =
        getNumber(resultData.skipped);


    let score =
        getNumber(resultData.score);


    let accuracy =
        getNumber(resultData.accuracy);


    const time =
        getNumber(
            resultData.time ||
            resultData.totalTime
        );


    /*
     * IMPORTANT
     * যদি quiz.js score/accuracy না পাঠায়,
     * এখানেই আবার calculate হবে।
     */

    if (
        score === 0 &&
        (
            correct > 0 ||
            incorrect > 0
        )
    ) {

        score =
            (correct * 4) -
            (incorrect * 1);

    }


    if (total > 0) {

        accuracy =
            Math.round(
                (correct / total) * 100
            );

    }


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


    document.getElementById(
        "accuracyFill"
    ).style.width =
        Math.min(
            100,
            Math.max(
                0,
                accuracy
            )
        ) + "%";


    setText(
        "time",
        formatTime(time)
    );


    if (resultData.title) {

        setText(
            "resultTitle",
            resultData.title
        );

    }


    updateMessage(
        accuracy,
        correct,
        total
    );

}


// ==========================================
// NUMBER HELPER
// ==========================================

function getNumber(value) {

    const number =
        Number(value);

    if (
        Number.isFinite(number)
    ) {

        return number;

    }

    return 0;

}


// ==========================================
// TEXT HELPER
// ==========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        String(value);

}


// ==========================================
// MESSAGE
// ==========================================

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


// ==========================================
// SAVE PROGRESS
// ==========================================

function saveProgress() {

    const user =
        firebase.auth().currentUser;


    if (
        !user ||
        !resultData.courseId ||
        !resultData.chapterId ||
        !resultData.topicId
    ) {

        console.log(
            "Progress not saved: missing IDs"
        );

        return;
    }


    const total =
        getNumber(
            resultData.total
        );

    const correct =
        getNumber(
            resultData.correct
        );

    const score =
        getNumber(
            resultData.score
        );


    const percent =
        total > 0
            ? Math.round(
                (correct / total) * 100
            )
            : 0;


    const progressId =
        resultData.courseId +
        "_" +
        resultData.chapterId +
        "_" +
        resultData.topicId;


    const ref =
        db.collection("users")
            .doc(user.uid)
            .collection("progress")
            .doc(progressId);


    ref.get()

        .then(function (doc) {

            let oldAttempts = 0;
            let oldBestScore = 0;


            if (doc.exists) {

                const old =
                    doc.data();

                oldAttempts =
                    getNumber(
                        old.attempts
                    );

                oldBestScore =
                    getNumber(
                        old.bestScore
                    );

            }


            const bestScore =
                Math.max(
                    oldBestScore,
                    score
                );


            return ref.set({

                courseId:
                    resultData.courseId,

                chapterId:
                    resultData.chapterId,

                topicId:
                    resultData.topicId,

                attempts:
                    oldAttempts + 1,

                percent:
                    percent,

                bestScore:
                    bestScore,

                lastScore:
                    score,

                lastAccuracy:
                    getNumber(
                        resultData.accuracy
                    ),

                lastAttemptAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {
                merge: true
            });

        })

        .then(function () {

            console.log(
                "Progress saved successfully"
            );

        })

        .catch(function (error) {

            console.error(
                "Progress save error:",
                error
            );

        });

}


// ==========================================
// REATTEMPT
// ==========================================

function reattemptQuiz() {

    const courseId =
        resultData.courseId ||
        localStorage.getItem(
            "quizCourse"
        ) ||
        localStorage.getItem(
            "activeCourse"
        );


    const chapterId =
        resultData.chapterId ||
        localStorage.getItem(
            "quizChapter"
        ) ||
        localStorage.getItem(
            "activeChapter"
        );


    const topicId =
        resultData.topicId ||
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

        return;
    }


    localStorage.setItem(
        "quizCourse",
        courseId
    );

    localStorage.setItem(
        "quizChapter",
        chapterId
    );

    localStorage.setItem(
        "quizTopic",
        topicId
    );


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
        "quiz.html";

}


// ==========================================
// BACK TO TOPIC
// ==========================================

function goToTopic() {

    const courseId =
        resultData.courseId ||
        localStorage.getItem(
            "quizCourse"
        ) ||
        localStorage.getItem(
            "activeCourse"
        );


    const chapterId =
        resultData.chapterId ||
        localStorage.getItem(
            "quizChapter"
        ) ||
        localStorage.getItem(
            "activeChapter"
        );


    const topicId =
        resultData.topicId ||
        localStorage.getItem(
            "quizTopic"
        ) ||
        localStorage.getItem(
            "activeTopic"
        );


    if (!courseId || !chapterId) {

        window.location.href =
            "student.html";

        return;
    }


    localStorage.setItem(
        "activeCourse",
        courseId
    );

    localStorage.setItem(
        "activeChapter",
        chapterId
    );


    if (topicId) {

        localStorage.setItem(
            "activeTopic",
            topicId
        );

    }


    window.location.href =
        "topic.html";

}


// ==========================================
// BACK TO CHAPTER
// ==========================================

function goToChapter() {

    const courseId =
        resultData.courseId ||
        localStorage.getItem(
            "quizCourse"
        ) ||
        localStorage.getItem(
            "activeCourse"
        );


    const chapterId =
        resultData.chapterId ||
        localStorage.getItem(
            "quizChapter"
        ) ||
        localStorage.getItem(
            "activeChapter"
        );


    if (
        !courseId ||
        !chapterId
    ) {

        window.location.href =
            "student.html";

        return;
    }


    localStorage.setItem(
        "activeCourse",
        courseId
    );

    localStorage.setItem(
        "activeChapter",
        chapterId
    );


    window.location.href =
        "chapter.html";

}


// ==========================================
// DASHBOARD
// ==========================================

function goToStudent() {

    window.location.href =
        "student.html";

}


// ==========================================
// TIME FORMAT
// ==========================================

function formatTime(seconds) {

    seconds =
        getNumber(seconds);


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        Math.floor(
            seconds % 60
        );


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":" +
        String(remaining)
            .padStart(2, "0")
    );

}
