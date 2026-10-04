// ==========================================
// mNEET - Topic Page
// ==========================================

let courseId = null;
let chapterId = null;
let topicId = null;


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
                        "activeCourse"
                    );


                chapterId =
                    localStorage.getItem(
                        "activeChapter"
                    );


                topicId =
                    localStorage.getItem(
                        "activeTopic"
                    );


                if (
                    !courseId ||
                    !chapterId ||
                    !topicId
                ) {

                    alert(
                        "Topic information is missing."
                    );

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
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                showError(
                    "Topic not found."
                );

                return;
            }


            const data =
                doc.data();


            document.getElementById(
                "topicTitle"
            ).textContent =
                data.name ||
                data.title ||
                "Biology Topic";


            document.getElementById(
                "topicDescription"
            ).textContent =
                data.description ||
                "Practice questions and study notes for this topic.";


            renderPracticeCards();

        })

        .catch(function (error) {

            console.error(
                "Topic error:",
                error
            );


            showError(
                "Unable to load topic."
            );

        });

}


// ==========================================
// PRACTICE CARDS
// ==========================================

function renderPracticeCards() {

    const container =
        document.getElementById(
            "practiceGrid"
        );


    container.innerHTML = `

        <div class="practice-card">

            <div class="practice-icon">
                📝
            </div>

            <div class="practice-title">
                Practice Quiz
            </div>

            <div class="practice-description">

                Solve NEET-style questions
                with timer, answer submission,
                solutions and scoring.

            </div>

            <button
                class="practice-button"
                onclick="openQuiz()"
            >
                Start Quiz
            </button>

        </div>



        <div class="practice-card">

            <div class="practice-icon">
                📖
            </div>

            <div class="practice-title">
                Topic Notes
            </div>

            <div class="practice-description">

                Read topic-wise study notes
                and revise important NCERT
                concepts before attempting
                the quiz.

            </div>

            <button
                class="practice-button notes"
                onclick="openNotes()"
            >
                Open Notes
            </button>

        </div>

    `;

}


// ==========================================
// OPEN QUIZ
// ==========================================

function openQuiz() {

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


    window.location.href =
        "quiz.html";

}


// ==========================================
// OPEN NOTES
// ==========================================

function openNotes() {

    localStorage.setItem(
        "notesCourse",
        courseId
    );


    localStorage.setItem(
        "notesChapter",
        chapterId
    );


    localStorage.setItem(
        "notesTopic",
        topicId
    );


    window.location.href =
        "notes.html";

}


// ==========================================
// BACK
// ==========================================

function goBack() {

    window.location.href =
        "chapter.html";

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    const container =
        document.getElementById(
            "practiceGrid"
        );


    container.innerHTML = `

        <div class="loading">

            ${escapeHTML(message)}

        </div>

    `;

}


// ==========================================
// ESCAPE
// ==========================================

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
