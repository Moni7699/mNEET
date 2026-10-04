// ==========================================
// mNEET - Result Page
// ==========================================

let resultData = null;


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


                loadResult();

            }
        );

    }
);


// ==========================================
// LOAD RESULT
// ==========================================

function loadResult() {

    const savedResult =
        localStorage.getItem(
            "quizResult"
        );


    if (!savedResult) {

        window.location.href =
            "student.html";

        return;
    }


    try {

        resultData =
            JSON.parse(
                savedResult
            );

    } catch (error) {

        console.error(
            "Result parse error:",
            error
        );

        window.location.href =
            "student.html";

        return;
    }


    displayResult();


    saveProgress();

}


// ==========================================
// DISPLAY RESULT
// ==========================================

function displayResult() {

    const total =
        Number(
            resultData.total || 0
        );


    const correct =
        Number(
            resultData.correct || 0
        );


    const incorrect =
        Number(
            resultData.incorrect || 0
        );


    const skipped =
        Number(
            resultData.skipped || 0
        );


    const score =
        Number(
            resultData.score || 0
        );


    const accuracy =
        Number(
            resultData.accuracy || 0
        );


    const time =
        Number(
            resultData.time || 0
        );


    document.getElementById(
        "score"
    ).textContent =
        score;


    document.getElementById(
        "correct"
    ).textContent =
        correct;


    document.getElementById(
        "incorrect"
    ).textContent =
        incorrect;


    document.getElementById(
        "skipped"
    ).textContent =
        skipped;


    document.getElementById(
        "accuracy"
    ).textContent =
        accuracy + "%";


    document.getElementById(
        "time"
    ).textContent =
        formatTime(time);


    document.getElementById(
        "accuracyFill"
    ).style.width =
        accuracy + "%";


    updateMessage(
        accuracy,
        correct,
        total
    );

}


// ==========================================
// RESULT MESSAGE
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


    if (total === 0) {

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


    if (!user || !resultData) {

        return;
    }


    const total =
        Number(
            resultData.total || 0
        );


    const correct =
        Number(
            resultData.correct || 0
        );


    const percent =
        total > 0
            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )
            : 0;


    const progressId =
        resultData.courseId +
        "_" +
        resultData.chapterId +
        "_" +
        resultData.topicId;


    const progressRef =
        db.collection("users")
            .doc(user.uid)
            .collection("progress")
            .doc(progressId);


    progressRef.get()

        .then(function (doc) {

            let oldAttempts = 0;

            let oldBestScore = 0;


            if (doc.exists) {

                const old =
                    doc.data();


                oldAttempts =
                    Number(
                        old.attempts || 0
                    );


                oldBestScore =
                    Number(
                        old.bestScore || 0
                    );

            }


            const newBestScore =
                Math.max(
                    oldBestScore,
                    Number(
                        resultData.score || 0
                    )
                );


            return progressRef.set({

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
                    newBestScore,

                lastScore:
                    Number(
                        resultData.score || 0
                    ),

                lastAccuracy:
                    Number(
                        resultData.accuracy || 0
                    ),

                lastAttemptAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {
                merge: true
            });

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

    localStorage.setItem(
        "quizCourse",
        resultData.courseId
    );


    localStorage.setItem(
        "quizChapter",
        resultData.chapterId
    );


    localStorage.setItem(
        "quizTopic",
        resultData.topicId
    );


    window.location.href =
        "quiz.html";

}


// ==========================================
// TOPIC
// ==========================================

function goToTopic() {

    localStorage.setItem(
        "activeCourse",
        resultData.courseId
    );


    localStorage.setItem(
        "activeChapter",
        resultData.chapterId
    );


    localStorage.setItem(
        "activeTopic",
        resultData.topicId
    );


    window.location.href =
        "topic.html";

}


// ==========================================
// CHAPTER
// ==========================================

function goToChapter() {

    localStorage.setItem(
        "activeCourse",
        resultData.courseId
    );


    localStorage.setItem(
        "activeChapter",
        resultData.chapterId
    );


    window.location.href =
        "chapter.html";

}


// ==========================================
// STUDENT DASHBOARD
// ==========================================

function goToStudent() {

    window.location.href =
        "student.html";

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    seconds =
        Number(seconds || 0);


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":" +
        String(remainingSeconds)
            .padStart(2, "0")
    );

      }
