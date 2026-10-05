// ==========================================
// mNEET - Topic Page
// ==========================================

let currentUser = null;

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


                currentUser = user;


                /*
                 * Read the same IDs saved
                 * by chapter.js.
                 */

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

                    showError(
                        "Topic information is missing. Please open the topic from the Chapter page."
                    );

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

        .then(
            function (doc) {

                if (!doc.exists) {

                    showError(
                        "Topic not found in Firebase."
                    );

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
                    "Practice questions and study notes for this topic.";


                renderPracticeCards();

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Topic loading error:",
                    error
                );


                showError(
                    "Unable to load topic: " +
                    (
                        error.message ||
                        "Unknown Firebase error."
                    )
                );

            }
        );

}


// ==========================================
// RENDER PRACTICE CARDS
// ==========================================

function renderPracticeCards() {

    const container =
        document.getElementById(
            "practiceGrid"
        );


    container.innerHTML = `

        <!-- QUIZ -->

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
                type="button"
                onclick="openQuiz()"
            >

                Start Quiz →

            </button>


        </div>



        <!-- NOTES -->

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
                class="
                    practice-button
                    notes
                "
                type="button"
                onclick="openNotes()"
            >

                Open Notes →

            </button>


        </div>

    `;

}


// ==========================================
// OPEN QUIZ
// ==========================================

function openQuiz() {

    /*
     * Keep separate quiz keys because
     * quiz.js may already use these.
     */

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


    /*
     * Also keep the common active IDs.
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


    /*
     * Keep common active IDs too.
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


    window.location.href =
        "notes.html";

}


// ==========================================
// BACK TO CHAPTER
// ==========================================

function goBack() {

    /*
     * IDs remain saved,
     * so chapter.js can load
     * the correct chapter.
     */

    window.location.href =
        "chapter.html";

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    const title =
        document.getElementById(
            "topicTitle"
        );


    const description =
        document.getElementById(
            "topicDescription"
        );


    if (title) {

        title.textContent =
            "Topic Error";

    }


    if (description) {

        description.textContent =
            "The topic could not be loaded.";

    }


    const container =
        document.getElementById(
            "practiceGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="error-card">

            <div class="icon">

                ⚠️

            </div>


            <h3>

                Unable to open topic

            </h3>


            <p>

                ${escapeHTML(message)}

            </p>

        </div>

    `;

}


// ==========================================
// HTML ESCAPE
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
