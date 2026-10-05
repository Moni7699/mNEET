// ==========================================
// mNEET - Type Practice Result
// ==========================================

let result = null;


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

    const saved =
        sessionStorage.getItem(
            "typeQuizResult"
        );


    if (!saved) {

        showError();

        return;
    }


    try {

        result =
            JSON.parse(saved);

    }

    catch (error) {

        showError();

        return;

    }


    document.getElementById(
        "resultTitle"
    ).textContent =
        getTypeTitle(
            result.typeId
        );


    document.getElementById(
        "resultSubtitle"
    ).textContent =
        "Chapter-wise practice completed";


    document.getElementById(
        "score"
    ).textContent =
        result.score;


    document.getElementById(
        "correct"
    ).textContent =
        result.correct;


    document.getElementById(
        "incorrect"
    ).textContent =
        result.incorrect;


    document.getElementById(
        "skipped"
    ).textContent =
        result.skipped;


    document.getElementById(
        "accuracy"
    ).textContent =
        result.accuracy + "%";


    document.getElementById(
        "accuracyText"
    ).textContent =
        result.accuracy + "%";


    document.getElementById(
        "accuracyFill"
    ).style.width =
        Math.min(
            100,
            Math.max(
                0,
                result.accuracy
            )
        ) + "%";


    document.getElementById(
        "totalQuestions"
    ).textContent =
        result.total;


    document.getElementById(
        "totalTime"
    ).textContent =
        formatTime(
            result.totalSeconds
        );

}


// ==========================================
// REATTEMPT
// ==========================================

function reattempt() {

    if (!result) {
        return;
    }


    sessionStorage.removeItem(
        "typeQuizResult"
    );


    sessionStorage.removeItem(
        "typeQuizAnswers"
    );


    window.location.href =
        "type-quiz.html";

}


// ==========================================
// BACK TO PRACTICE
// ==========================================

function backToPractice() {

    window.location.href =
        "chapter-practice.html";

}


// ==========================================
// DASHBOARD
// ==========================================

function goHome() {

    window.location.href =
        "student.html";

}


// ==========================================
// TYPE TITLE
// ==========================================

function getTypeTitle(id) {

    const titles = {

        "assertion-reason":
            "Assertion & Reason",

        "statement-based":
            "Statement Based",

        "match-following":
            "Match the Following",

        "diagram-based":
            "Diagram Based",

        "pyq":
            "PYQ",

        "rapid-revision":
            "Rapid Revision"

    };


    return (
        titles[id] ||
        "Chapter Practice"
    );

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    seconds =
        Number(seconds) || 0;


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":"
        +
        String(remaining)
            .padStart(2, "0")
    );

}


// ==========================================
// ERROR
// ==========================================

function showError() {

    document.getElementById(
        "resultContent"
    ).innerHTML = `

        <div class="error">

            Result data was not found.

            <br><br>

            Please attempt the quiz again.

            <br><br>

            <button
                class="action-btn primary"
                onclick="
                    window.location.href =
                    'chapter-practice.html'
                "
            >
                Back to Practice
            </button>

        </div>

    `;

      }
