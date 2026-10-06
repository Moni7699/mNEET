// ==========================================================
// mNEET - CHAPTER PAGE
// Chapter Wise Type Practice
// Firebase Firestore
// ==========================================================

"use strict";

let courseId = "";
let chapterId = "";

let chapterData = {};
let topics = [];
let typePractices = [];


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        waitForFirebase();

    }
);


// ==========================================================
// WAIT FIREBASE
// ==========================================================

function waitForFirebase() {

    if (
        typeof firebase === "undefined" ||
        typeof firebase.auth !== "function" ||
        typeof firebase.firestore !== "function"
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


            courseId =
                getValue(
                    "courseId",
                    "activeCourse"
                );


            chapterId =
                getValue(
                    "chapterId",
                    "activeChapter"
                );


            if (
                !courseId ||
                !chapterId
            ) {

                showError(
                    "Course অথবা Chapter information পাওয়া যায়নি।"
                );

                return;
            }


            loadChapter();

        }
    );

}


// ==========================================================
// GET VALUE
// ==========================================================

function getValue(
    parameter,
    storage
) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get(parameter) ||
        localStorage.getItem(storage) ||
        ""
    );

}


// ==========================================================
// LOAD CHAPTER
// ==========================================================

async function loadChapter() {

    showLoading();


    const db =
        firebase.firestore();


    try {

        const chapterRef =
            db
                .collection("courses")
                .doc(courseId)
                .collection("chapters")
                .doc(chapterId);


        const chapterSnap =
            await chapterRef.get();


        if (!chapterSnap.exists) {

            showError(
                "Chapter পাওয়া যায়নি।"
            );

            return;
        }


        chapterData =
            chapterSnap.data() || {};


        renderChapterHeader();


        await loadTopics(
            chapterRef
        );


        await loadTypePractices(
            chapterRef
        );


        renderPage();


    } catch (error) {

        console.error(
            "Chapter load error:",
            error
        );


        showError(
            "Chapter load করতে সমস্যা হয়েছে.<br><br>" +
            escapeHTML(
                error.message
            )
        );

    }

}


// ==========================================================
// CHAPTER HEADER
// ==========================================================

function renderChapterHeader() {

    const title =
        chapterData.name ||
        chapterData.title ||
        "Biology Chapter";


    const description =
        chapterData.description ||
        "Practice questions and revise important NEET Biology concepts.";


    setText(
        "chapterTitle",
        title
    );


    setText(
        "chapterDescription",
        description
    );

}


// ==========================================================
// LOAD TOPICS
// ==========================================================

async function loadTopics(
    chapterRef
) {

    topics = [];


    const snap =
        await chapterRef
            .collection("topics")
            .get();


    snap.forEach(
        function (doc) {

            const data =
                doc.data() || {};


            topics.push({

                id:
                    doc.id,

                ...data

            });

        }
    );


    topics.sort(
        function (a, b) {

            return (
                Number(a.order || 0) -
                Number(b.order || 0)
            );

        }
    );

}


// ==========================================================
// LOAD TYPE PRACTICES
// ==========================================================

async function loadTypePractices(
    chapterRef
) {

    typePractices = [];


    try {

        const snap =
            await chapterRef
                .collection(
                    "typePractice"
                )
                .get();


        snap.forEach(
            function (doc) {

                const data =
                    doc.data() || {};


                typePractices.push({

                    id:
                        doc.id,

                    ...data

                });

            }
        );


    } catch (error) {

        console.warn(
            "Type practice load error:",
            error
        );

    }


    /*
      If Firestore has no typePractice
      documents, create the six
      standard types for UI.
    */

    if (!typePractices.length) {

        typePractices = [

            {
                id:
                    "assertion-reason",

                name:
                    "Assertion & Reason",

                title:
                    "Assertion & Reason",

                icon:
                    "🧠",

                description:
                    "Practice NEET Assertion and Reason questions."

            },

            {
                id:
                    "statement-based",

                name:
                    "Statement Based",

                title:
                    "Statement Based",

                icon:
                    "📋",

                description:
                    "Practice statement-based Biology questions."

            },

            {
                id:
                    "match-following",

                name:
                    "Match the Following",

                title:
                    "Match the Following",

                icon:
                    "🔗",

                description:
                    "Practice matching questions."

            },

            {
                id:
                    "diagram-based",

                name:
                    "Diagram Based",

                title:
                    "Diagram Based",

                icon:
                    "🧬",

                description:
                    "Practice Biology diagram-based questions."

            },

            {
                id:
                    "pyq",

                name:
                    "PYQ",

                title:
                    "Previous Year Questions",

                icon:
                    "📚",

                description:
                    "Practice NEET previous year questions."

            },

            {
                id:
                    "rapid-revision",

                name:
                    "Rapid Revision",

                title:
                    "Rapid Revision",

                icon:
                    "⚡",

                description:
                    "Quick revision questions for fast practice."

            }

        ];

    }

}


// ==========================================================
// RENDER PAGE
// ==========================================================

function renderPage() {

    renderTypePractice();


    renderTopics();

}


// ==========================================================
// RENDER TYPE PRACTICE
// ==========================================================

function renderTypePractice() {

    const container =
        document.getElementById(
            "typePracticeGrid"
        );


    if (!container) {
        return;
    }


    if (!typePractices.length) {

        container.innerHTML = `

            <div class="chapter-empty">

                No type practice available.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    typePractices.forEach(
        function (type) {

            const id =
                type.id;


            const title =
                type.name ||
                type.title ||
                id;


            const icon =
                type.icon ||
                "📝";


            const description =
                type.description ||
                "Practice questions of this type.";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "type-card";


            card.innerHTML = `

                <div class="type-icon">
                    ${escapeHTML(icon)}
                </div>

                <div class="type-content">

                    <div class="type-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="type-description">
                        ${escapeHTML(description)}
                    </div>

                </div>

                <button
                    type="button"
                    class="type-button"
                >
                    Start
                </button>

            `;


            const button =
                card.querySelector(
                    ".type-button"
                );


            button.addEventListener(
                "click",
                function () {

                    openTypePractice(
                        id
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


// ==========================================================
// OPEN TYPE PRACTICE
// ==========================================================

function openTypePractice(
    typeId
) {

    if (
        !courseId ||
        !chapterId ||
        !typeId
    ) {

        alert(
            "Practice information পাওয়া যায়নি।"
        );

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


    localStorage.setItem(
        "activeType",
        typeId
    );


    localStorage.setItem(
        "activeTypePractice",
        typeId
    );


    /*
      Quiz engine already supports:

      courses
        /course
          /chapters
            /chapter
              /typePractice
                /typeId
                  /questions
    */


    window.location.href =
        "quiz.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        ) +
        "&chapterId=" +
        encodeURIComponent(
            chapterId
        ) +
        "&typeId=" +
        encodeURIComponent(
            typeId
        );

}


// ==========================================================
// RENDER TOPICS
// ==========================================================

function renderTopics() {

    const container =
        document.getElementById(
            "topicList"
        );


    if (!container) {
        return;
    }


    if (!topics.length) {

        container.innerHTML = `

            <div class="chapter-empty">

                No topics available yet.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    topics.forEach(
        function (topic) {

            const id =
                topic.id;


            const title =
                topic.name ||
                topic.title ||
                "Biology Topic";


            const description =
                topic.description ||
                "Practice this topic.";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "topic-card";


            card.innerHTML = `

                <div>

                    <div class="topic-number">
                        Topic
                    </div>

                    <div class="topic-name">
                        ${escapeHTML(title)}
                    </div>

                    <div class="topic-description">
                        ${escapeHTML(description)}
                    </div>

                </div>

                <button
                    type="button"
                    class="topic-button"
                >
                    Open
                </button>

            `;


            const button =
                card.querySelector(
                    ".topic-button"
                );


            button.addEventListener(
                "click",
                function () {

                    openTopic(
                        id
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


// ==========================================================
// OPEN TOPIC
// ==========================================================

function openTopic(
    topicId
) {

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
// BACK
// ==========================================================

function goBack() {

    window.location.href =
        "course.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        );

}


// ==========================================================
// LOADING
// ==========================================================

function showLoading() {

    setText(
        "chapterTitle",
        "Loading..."
    );


    setText(
        "chapterDescription",
        "Please wait..."
    );


    const typeContainer =
        document.getElementById(
            "typePracticeGrid"
        );


    if (typeContainer) {

        typeContainer.innerHTML = `

            <div class="chapter-empty">
                Loading practice...
            </div>

        `;

    }


    const topicContainer =
        document.getElementById(
            "topicList"
        );


    if (topicContainer) {

        topicContainer.innerHTML = `

            <div class="chapter-empty">
                Loading topics...
            </div>

        `;

    }

}


// ==========================================================
// ERROR
// ==========================================================

function showError(
    message
) {

    const title =
        document.getElementById(
            "chapterTitle"
        );


    const description =
        document.getElementById(
            "chapterDescription"
        );


    if (title) {

        title.textContent =
            "Chapter Error";

    }


    if (description) {

        description.innerHTML =
            message;

    }


    const typeContainer =
        document.getElementById(
            "typePracticeGrid"
        );


    if (typeContainer) {

        typeContainer.innerHTML = `

            <div class="chapter-empty">

                ⚠️

                <br><br>

                ${message}

                <br><br>

                <button
                    type="button"
                    onclick="goBack()"
                    class="error-button"
                >
                    ← Back
                </button>

            </div>

        `;

    }

}


// ==========================================================
// SET TEXT
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
            value;

    }

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHTML(
    value
) {

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
