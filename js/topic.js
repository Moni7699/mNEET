// ==========================================
// mNEET - Topic Page
// ==========================================

let currentUser = null;

let activeCourseId = null;

let activeChapterId = null;

let activeTopicId = null;


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


                activeCourseId =
                    localStorage.getItem(
                        "activeCourse"
                    );


                activeChapterId =
                    localStorage.getItem(
                        "activeChapter"
                    );


                activeTopicId =
                    localStorage.getItem(
                        "activeTopic"
                    );


                if (
                    !activeCourseId ||
                    !activeChapterId ||
                    !activeTopicId
                ) {

                    window.location.href =
                        "student.html";

                    return;
                }


                loadTopic();

            }
        );

    }
);


// ==========================================
// LOAD TOPIC
// ==========================================

function loadTopic() {

    db.collection("courses")
        .doc(activeCourseId)
        .collection("chapters")
        .doc(activeChapterId)
        .collection("topics")
        .doc(activeTopicId)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                alert(
                    "Topic not found."
                );

                goBackToChapter();

                return;
            }


            const topic =
                doc.data();


            document.getElementById(
                "topicTitle"
            ).textContent =
                topic.name ||
                topic.title ||
                "Biology Topic";


            document.getElementById(
                "topicDescription"
            ).textContent =
                topic.description ||
                "Practice this topic for NEET.";


            loadProgress();

        })

        .catch(function (error) {

            console.error(
                "Topic loading error:",
                error
            );

        });

}


// ==========================================
// LOAD USER PROGRESS
// ==========================================

function loadProgress() {

    const progressRef =
        db.collection("users")
            .doc(currentUser.uid)
            .collection("progress")
            .doc(
                activeCourseId +
                "_" +
                activeChapterId +
                "_" +
                activeTopicId
            );


    progressRef.get()

        .then(function (doc) {

            if (!doc.exists) {

                updateProgress(0, 0);

                return;
            }


            const data =
                doc.data();


            const percent =
                Number(
                    data.percent || 0
                );


            const attempts =
                Number(
                    data.attempts || 0
                );


            updateProgress(
                percent,
                attempts
            );

        })

        .catch(function (error) {

            console.error(
                "Progress error:",
                error
            );

        });

}


// ==========================================
// UPDATE PROGRESS UI
// ==========================================

function updateProgress(
    percent,
    attempts
) {

    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    const percentText =
        document.getElementById(
            "topicProgressPercent"
        );


    const circle =
        document.getElementById(
            "topicProgressCircle"
        );


    const bar =
        document.getElementById(
            "topicProgressBar"
        );


    const attemptText =
        document.getElementById(
            "attemptCount"
        );


    if (percentText) {

        percentText.textContent =
            percent + "%";

    }


    if (circle) {

        circle.textContent =
            percent + "%";

    }


    if (bar) {

        bar.style.width =
            percent + "%";

    }


    if (attemptText) {

        attemptText.textContent =
            attempts;

    }

}


// ==========================================
// OPEN QUIZ
// ==========================================

function openTopicQuiz() {

    localStorage.setItem(
        "quizCourse",
        activeCourseId
    );


    localStorage.setItem(
        "quizChapter",
        activeChapterId
    );


    localStorage.setItem(
        "quizTopic",
        activeTopicId
    );


    window.location.href =
        "quiz.html";

}


// ==========================================
// OPEN NOTES
// ==========================================

function openTopicNotes() {

    localStorage.setItem(
        "notesCourse",
        activeCourseId
    );


    localStorage.setItem(
        "notesChapter",
        activeChapterId
    );


    localStorage.setItem(
        "notesTopic",
        activeTopicId
    );


    window.location.href =
        "notes.html";

}


// ==========================================
// BACK TO CHAPTER
// ==========================================

function goBackToChapter() {

    window.location.href =
        "chapter.html";

}


// ==========================================
// BACK TO STUDENT
// ==========================================

function goBackToStudent() {

    window.location.href =
        "student.html";

               }
