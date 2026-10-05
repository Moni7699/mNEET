// ==========================================
// mNEET - TOPIC PAGE
// ==========================================

let courseId = "";
let chapterId = "";
let topicId = "";


// ==========================================
// PAGE START
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("mNEET topic.js loaded");

    if (typeof firebase === "undefined") {
        showError("Firebase library load হয়নি.");
        return;
    }

    if (typeof auth === "undefined") {
        showError("Firebase Auth পাওয়া যাচ্ছে না.");
        return;
    }

    if (typeof db === "undefined") {
        showError("Firestore database পাওয়া যাচ্ছে না.");
        return;
    }


    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href = "index.html";
            return;
        }


        courseId =
            localStorage.getItem("activeCourse");

        chapterId =
            localStorage.getItem("activeChapter");

        topicId =
            localStorage.getItem("activeTopic");


        console.log("Course:", courseId);
        console.log("Chapter:", chapterId);
        console.log("Topic:", topicId);


        if (!courseId || !chapterId || !topicId) {

            showError(
                "Topic information missing. Please go back and open the topic again."
            );

            return;
        }


        loadTopic();

    });

});


// ==========================================
// LOAD TOPIC
// ==========================================

function loadTopic() {

    console.log("Loading Firestore topic...");


    db.collection("courses")
        .doc(courseId)

        .collection("chapters")
        .doc(chapterId)

        .collection("topics")
        .doc(topicId)

        .get()

        .then(function (doc) {

            console.log("Firestore response:", doc);


            if (!doc.exists) {

                showError(
                    "Topic document পাওয়া যায়নি: " + topicId
                );

                return;
            }


            const data = doc.data();

            console.log("Topic data:", data);


            // TITLE
            const title =
                data.name ||
                data.title ||
                "Biology Topic";


            document.getElementById(
                "topicTitle"
            ).textContent = title;


            // DESCRIPTION
            document.getElementById(
                "topicDescription"
            ).textContent =
                data.description ||
                "Practice questions and study notes for this topic.";


            // PRACTICE CARDS
            renderPracticeCards();


        })

        .catch(function (error) {

            console.error(
                "Firestore Topic Error:",
                error
            );


            showError(
                "Topic load error: " +
                error.message
            );

        });

}


// ==========================================
// PRACTICE CARDS
// ==========================================

function renderPracticeCards() {

    const container =
        document.getElementById("practiceGrid");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="practice-card">

            <div class="practice-icon">
                📝
            </div>

            <div class="practice-title">
                Practice Quiz
            </div>

            <div class="practice-description">
                Solve NEET-style questions with
                timer, answer submission,
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
                Read topic-wise study notes and
                revise important NCERT concepts.
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


    window.location.href = "quiz.html";

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


    window.location.href = "notes.html";

}


// ==========================================
// BACK
// ==========================================

function goBack() {

    window.location.href = "chapter.html";

}


// ==========================================
// ERROR DISPLAY
// ==========================================

function showError(message) {

    console.error(message);


    const title =
        document.getElementById("topicTitle");

    const description =
        document.getElementById("topicDescription");

    const grid =
        document.getElementById("practiceGrid");


    if (title) {

        title.textContent =
            "Topic Loading Error";

    }


    if (description) {

        description.textContent =
            message;

    }


    if (grid) {

        grid.innerHTML = `

            <div class="loading">

                ⚠️ ${escapeHTML(message)}

                <br><br>

                <button
                    class="practice-button"
                    onclick="goBack()"
                    style="max-width:220px;"
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

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
