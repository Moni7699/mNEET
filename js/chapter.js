// =====================================================
// mNEET - CHAPTER PAGE
// Firebase Firestore
// Topic Wise + Chapter Wise Question Types
// =====================================================

"use strict";


/* =====================================================
   GLOBAL
===================================================== */

let courseId = "";
let chapterId = "";

let chapterData = {};

let topics = [];

let questionTypes = [];


/* =====================================================
   DEFAULT QUESTION TYPES
===================================================== */

const DEFAULT_TYPES = [

    {
        id: "assertion-reason",
        title: "Assertion & Reason",
        icon: "🧠"
    },

    {
        id: "statement-based",
        title: "Statement Based",
        icon: "📋"
    },

    {
        id: "match-the-following",
        title: "Match the Following",
        icon: "🔗"
    },

    {
        id: "diagram-based",
        title: "Diagram Based",
        icon: "🧬"
    },

    {
        id: "pyq",
        title: "PYQ",
        icon: "🎯"
    },

    {
        id: "rapid-revision",
        title: "Rapid Revision",
        icon: "⚡"
    }

];


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        waitForFirebase();

    }
);


/* =====================================================
   WAIT FIREBASE
===================================================== */

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


    auth.onAuthStateChanged(
        function (user) {

            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }


            getIds();

            loadChapter();

        }
    );

}


/* =====================================================
   GET IDS
===================================================== */

function getIds() {

    courseId =
        localStorage.getItem(
            "activeCourse"
        ) ||
        localStorage.getItem(
            "courseId"
        ) ||
        "";


    chapterId =
        localStorage.getItem(
            "activeChapter"
        ) ||
        localStorage.getItem(
            "chapterId"
        ) ||
        "";


    return {
        courseId,
        chapterId
    };
}


/* =====================================================
   LOAD CHAPTER
===================================================== */

async function loadChapter() {

    if (
        !courseId ||
        !chapterId
    ) {

        showPageError(
            "Chapter information পাওয়া যায়নি।"
        );

        return;
    }


    showChapterLoading();


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

            showPageError(
                "Chapter পাওয়া যায়নি।"
            );

            return;
        }


        chapterData =
            chapterSnap.data() || {};


        renderChapterInfo();


        await Promise.all([
            loadTopics(chapterRef),
            loadQuestionTypes(chapterRef)
        ]);

    }

    catch (error) {

        console.error(
            "Chapter loading error:",
            error
        );


        showPageError(
            "Chapter load করতে সমস্যা হয়েছে।"
        );

    }

}


/* =====================================================
   CHAPTER INFO
===================================================== */

function renderChapterInfo() {

    const title =
        chapterData.name ||
        chapterData.title ||
        "Biology Chapter";


    const description =
        chapterData.description ||
        "";


    const titleElement =
        document.getElementById(
            "chapterTitle"
        );


    const descriptionElement =
        document.getElementById(
            "chapterDescription"
        );


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            description;

    }

}


/* =====================================================
   LOAD TOPICS
===================================================== */

async function loadTopics(chapterRef) {

    const container =
        document.getElementById(
            "topicList"
        );


    if (container) {

        container.innerHTML = `

            <div class="chapter-loading">

                Loading topics...

            </div>

        `;

    }


    try {

        const snap =
            await chapterRef
                .collection("topics")
                .get();


        topics = [];


        snap.forEach(
            function (doc) {

                const data =
                    doc.data() || {};


                topics.push({

                    id: doc.id,

                    ...data

                });

            }
        );


        topics.sort(
            function (a, b) {

                const aOrder =
                    Number(
                        a.order ??
                        a.serial ??
                        999999
                    );


                const bOrder =
                    Number(
                        b.order ??
                        b.serial ??
                        999999
                    );


                return aOrder - bOrder;

            }
        );


        renderTopics();

    }

    catch (error) {

        console.error(
            "Topic loading error:",
            error
        );


        renderTopicError();

    }

}


/* =====================================================
   RENDER TOPICS
===================================================== */

function renderTopics() {

    const container =
        document.getElementById(
            "topicList"
        );


    const count =
        document.getElementById(
            "topicCount"
        );


    if (count) {

        count.textContent =
            topics.length +
            (
                topics.length === 1
                    ? " Topic"
                    : " Topics"
            );

    }


    if (!container) {
        return;
    }


    if (!topics.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No Topics Available
                </h3>

                <p>
                    Topics will appear here.
                </p>

            </div>

        `;

        return;
    }


    let html = "";


    topics.forEach(
        function (topic, index) {

            const title =
                topic.name ||
                topic.title ||
                "Topic " +
                (index + 1);


            html += `

                <div
                    class="topic-card"
                    onclick="openTopic('${escapeJS(topic.id)}')"
                >

                    <div class="topic-number">

                        ${index + 1}

                    </div>


                    <div class="topic-card-content">

                        <h3 class="topic-card-title">

                            ${escapeHTML(title)}

                        </h3>

                    </div>


                    <div class="topic-open-label">

                        OPEN →

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* =====================================================
   OPEN TOPIC
===================================================== */

window.openTopic =
    function (topicId) {

        if (!topicId) {
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
            "activeTopic",
            topicId
        );


        window.location.href =
            "topic.html";

    };


/* =====================================================
   LOAD QUESTION TYPES
===================================================== */

async function loadQuestionTypes(chapterRef) {

    const container =
        document.getElementById(
            "typePracticeGrid"
        );


    if (container) {

        container.innerHTML = `

            <div class="chapter-loading">

                Loading question types...

            </div>

        `;

    }


    /*
       First try Firestore collection:

       chapters/{chapterId}/typePractice
    */

    try {

        const snap =
            await chapterRef
                .collection("typePractice")
                .get();


        if (!snap.empty) {

            questionTypes = [];


            snap.forEach(
                function (doc) {

                    const data =
                        doc.data() || {};


                    questionTypes.push({

                        id: doc.id,

                        ...data

                    });

                }
            );


            questionTypes.sort(
                function (a, b) {

                    return Number(
                        a.order ??
                        999999
                    )
                    -
                    Number(
                        b.order ??
                        999999
                    );

                }
            );


            renderQuestionTypes();

            return;
        }

    }

    catch (error) {

        console.warn(
            "typePractice collection not available:",
            error
        );

    }


    /*
       If Firestore collection is empty,
       use the six required types.
    */

    questionTypes =
        DEFAULT_TYPES.map(
            function (item) {

                return {
                    ...item
                };

            }
        );


    renderQuestionTypes();

}


/* =====================================================
   RENDER QUESTION TYPES
===================================================== */

function renderQuestionTypes() {

    const container =
        document.getElementById(
            "typePracticeGrid"
        );


    if (!container) {
        return;
    }


    if (!questionTypes.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    No Question Types
                </h3>

                <p>
                    Question types will appear here.
                </p>

            </div>

        `;

        return;
    }


    let html = "";


    questionTypes.forEach(
        function (type, index) {

            const title =
                type.name ||
                type.title ||
                DEFAULT_TYPES[index]?.title ||
                "Question Type";


            const icon =
                type.icon ||
                DEFAULT_TYPES[index]?.icon ||
                "📝";


            html += `

                <div
                    class="type-card"
                    onclick="openTypePractice('${escapeJS(type.id)}')"
                >

                    <div class="type-icon">

                        ${escapeHTML(icon)}

                    </div>


                    <div class="type-content">

                        <h3 class="type-title">

                            ${escapeHTML(title)}

                        </h3>

                    </div>


                    <button
                        type="button"
                        class="type-button"
                        onclick="event.stopPropagation(); openTypePractice('${escapeJS(type.id)}')"
                    >

                        OPEN

                    </button>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* =====================================================
   OPEN TYPE PRACTICE
===================================================== */

window.openTypePractice =
    function (typeId) {

        if (!typeId) {
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
           quiz.js reads activeType.
           typeId is also passed in URL.
        */

        window.location.href =
            "quiz.html?courseId=" +
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

    };


/* =====================================================
   BACK TO COURSE
===================================================== */

window.goBackToCourse =
    function () {

        window.location.href =
            "course.html";

    };


/* =====================================================
   BACK TO STUDENT
===================================================== */

window.goBackToStudent =
    function () {

        window.location.href =
            "student.html";

    };


/* =====================================================
   NCERT
===================================================== */

window.openNCERT =
    function () {

        window.location.href =
            "ncert.html";

    };


/* =====================================================
   VIDEOS
===================================================== */

window.openVideos =
    function () {

        window.location.href =
            "videos.html";

    };


/* =====================================================
   LOADING
===================================================== */

function showChapterLoading() {

    const title =
        document.getElementById(
            "chapterTitle"
        );


    const topicList =
        document.getElementById(
            "topicList"
        );


    const typeList =
        document.getElementById(
            "typePracticeGrid"
        );


    if (title) {

        title.textContent =
            "Loading Chapter...";

    }


    if (topicList) {

        topicList.innerHTML = `

            <div class="chapter-loading">

                Loading topics...

            </div>

        `;

    }


    if (typeList) {

        typeList.innerHTML = `

            <div class="chapter-loading">

                Loading question types...

            </div>

        `;

    }

}


/* =====================================================
   TOPIC ERROR
===================================================== */

function renderTopicError() {

    const container =
        document.getElementById(
            "topicList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Topics could not load
            </h3>

            <p>
                Please try again.
            </p>

        </div>

    `;

}


/* =====================================================
   PAGE ERROR
===================================================== */

function showPageError(message) {

    const title =
        document.getElementById(
            "chapterTitle"
        );


    const topicList =
        document.getElementById(
            "topicList"
        );


    const typeList =
        document.getElementById(
            "typePracticeGrid"
        );


    if (title) {

        title.textContent =
            "Chapter Error";

    }


    if (topicList) {

        topicList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    ${escapeHTML(message)}
                </h3>

                <p>
                    Please go back and try again.
                </p>

            </div>

        `;

    }


    if (typeList) {

        typeList.innerHTML = "";

    }

}


/* =====================================================
   HTML ESCAPE
===================================================== */

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


/* =====================================================
   JAVASCRIPT ESCAPE
===================================================== */

function escapeJS(value) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        );

}
