// ==========================================
// mNEET - TOPIC PAGE
// Firebase Firestore Version
// ==========================================

"use strict";

let courseId = "";
let chapterId = "";
let topicId = "";


// ==========================================
// PAGE START
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    waitForFirebase();

});


// ==========================================
// WAIT FOR FIREBASE
// ==========================================

function waitForFirebase() {

    if (
        typeof firebase === "undefined" ||
        typeof db === "undefined" ||
        typeof auth === "undefined"
    ) {

        setTimeout(
            waitForFirebase,
            300
        );

        return;
    }


    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        loadActiveIds();

    });

}


// ==========================================
// LOAD ACTIVE IDS
// ==========================================

function loadActiveIds() {

    courseId =
        getValue(
            "activeCourse",
            "courseId"
        );


    chapterId =
        getValue(
            "activeChapter",
            "chapterId"
        );


    topicId =
        getValue(
            "activeTopic",
            "topicId"
        );


    if (
        !courseId ||
        !chapterId ||
        !topicId
    ) {

        showPageError(
            "Topic information পাওয়া যায়নি।"
        );

        return;
    }


    // Save again to keep everything synchronized

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


    loadTopic();

}


// ==========================================
// GET VALUE
// ==========================================

function getValue(primaryKey, secondaryKey) {

    return (
        localStorage.getItem(primaryKey) ||
        sessionStorage.getItem(primaryKey) ||
        localStorage.getItem(secondaryKey) ||
        sessionStorage.getItem(secondaryKey) ||
        ""
    ).trim();

}


// ==========================================
// LOAD TOPIC
// ==========================================

function loadTopic() {

    setLoading();


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                showPageError(
                    "Topic পাওয়া যায়নি।"
                );

                return;
            }


            const topic =
                doc.data() || {};


            const title =
                topic.name ||
                topic.title ||
                "Biology Topic";


            const description =
                topic.description ||
                "Practice questions and study notes for this topic.";


            const titleElement =
                document.getElementById(
                    "topicTitle"
                );


            const descriptionElement =
                document.getElementById(
                    "topicDescription"
                );


            if (titleElement) {

                titleElement.textContent =
                    title;

            }


            if (descriptionElement) {

                descriptionElement.textContent =
                    description;

            }


            renderPracticeCards();

        })

        .catch(function (error) {

            console.error(
                "Topic Firestore Error:",
                error
            );


            showPageError(
                "Topic load করা যায়নি।"
            );

        });

}


// ==========================================
// LOADING
// ==========================================

function setLoading() {

    const title =
        document.getElementById(
            "topicTitle"
        );


    const description =
        document.getElementById(
            "topicDescription"
        );


    const grid =
        document.getElementById(
            "practiceGrid"
        );


    if (title) {

        title.textContent =
            "Loading...";

    }


    if (description) {

        description.textContent =
            "Please wait...";

    }


    if (grid) {

        grid.innerHTML = `

            <div class="loading">

                Loading topic...

            </div>

        `;

    }

}


// ==========================================
// PRACTICE CARDS
// ==========================================

function renderPracticeCards() {

    const container =
        document.getElementById(
            "practiceGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <!-- QUIZ CARD -->

        <div class="practice-card">

            <div class="practice-icon">
                📝
            </div>


            <div class="practice-title">
                Practice Quiz
            </div>


            <div class="practice-description">

                Attempt NEET Biology
                questions from this topic.

                Timer, answer submit,
                score and solutions
                will be available.

            </div>


            <button
                type="button"
                class="practice-button"
                onclick="openQuiz()"
            >

                Start Quiz

            </button>

        </div>


        <!-- NOTES CARD -->

        <div class="practice-card">

            <div class="practice-icon">
                📖
            </div>


            <div class="practice-title">
                Topic Notes
            </div>


            <div class="practice-description">

                Read the topic notes
                and revise important
                NCERT concepts.

            </div>


            <button
                type="button"
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

    if (
        !courseId ||
        !chapterId ||
        !topicId
    ) {

        alert(
            "Quiz information পাওয়া যায়নি।"
        );

        return;
    }


    /*
      IMPORTANT

      quiz.js expects:

      activeCourse
      activeChapter
      activeTopic
      activeQuiz

      So all four are saved here.
    */


    const quizId =
        "quiz-01";


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
      Old keys are also kept
      for compatibility.
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
      Open quiz page
    */

    window.location.href =
        "quiz.html";

}


// ==========================================
// OPEN NOTES
// ==========================================

function openNotes() {

    if (
        !courseId ||
        !chapterId ||
        !topicId
    ) {

        alert(
            "Notes information পাওয়া যায়নি।"
        );

        return;
    }


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

    window.location.href =
        "chapter.html";

}


// ==========================================
// ERROR
// ==========================================

function showPageError(message) {

    const title =
        document.getElementById(
            "topicTitle"
        );


    const description =
        document.getElementById(
            "topicDescription"
        );


    const container =
        document.getElementById(
            "practiceGrid"
        );


    if (title) {

        title.textContent =
            "Topic Loading Error";

    }


    if (description) {

        description.textContent =
            message;

    }


    if (container) {

        container.innerHTML = `

            <div
                class="loading"
                style="
                    padding:30px 15px;
                    text-align:center;
                "
            >

                <div
                    style="
                        font-size:38px;
                        margin-bottom:15px;
                    "
                >
                    ⚠️
                </div>


                <div
                    style="
                        color:#9ba8ba;
                        margin-bottom:20px;
                    "
                >

                    ${escapeHTML(message)}

                </div>


                <button
                    type="button"
                    onclick="goBack()"
                    style="
                        border:none;
                        background:#ffc107;
                        color:#111;
                        padding:13px 24px;
                        border-radius:10px;
                        font-weight:900;
                        cursor:pointer;
                    "
                >

                    ← Back to Chapters

                </button>

            </div>

        `;

    }

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
