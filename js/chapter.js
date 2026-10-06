// ==========================================
// mNEET - CHAPTER PAGE
// Firebase Firestore Version
// ==========================================

"use strict";

let courseId = "";
let chapterId = "";


// ==========================================
// PAGE START
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (
        typeof firebase === "undefined" ||
        typeof db === "undefined" ||
        typeof auth === "undefined"
    ) {
        showChapterError(
            "Firebase library load হয়নি।"
        );
        return;
    }


    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        loadIds();

    });

});


// ==========================================
// LOAD IDS
// ==========================================

function loadIds() {

    courseId =
        localStorage.getItem("activeCourse") ||
        localStorage.getItem("courseId") ||
        "";

    chapterId =
        localStorage.getItem("activeChapter") ||
        localStorage.getItem("chapterId") ||
        "";


    if (!courseId || !chapterId) {

        showChapterError(
            "Course বা Chapter information পাওয়া যায়নি।"
        );

        return;
    }


    loadChapter();

}


// ==========================================
// LOAD CHAPTER
// ==========================================

function loadChapter() {

    setChapterLoading();


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                showChapterError(
                    "Chapter পাওয়া যায়নি।"
                );

                return;
            }


            const chapter =
                doc.data() || {};


            const title =
                chapter.name ||
                chapter.title ||
                "Biology Chapter";


            const description =
                chapter.description ||
                "Select a topic to start your Biology practice.";


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


            loadTopics();

        })

        .catch(function (error) {

            console.error(
                "Chapter load error:",
                error
            );


            showChapterError(
                "Chapter load করা যায়নি।"
            );

        });

}


// ==========================================
// LOAD TOPICS
// ==========================================

function loadTopics() {

    const container =
        document.getElementById(
            "topicList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="chapter-loading">

            Loading topics...

        </div>

    `;


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .get()

        .then(function (snapshot) {

            if (snapshot.empty) {

                container.innerHTML = `

                    <div class="chapter-empty">

                        📚

                        <br><br>

                        এই chapter-এ এখনো কোনো topic
                        যোগ করা হয়নি।

                    </div>

                `;

                return;
            }


            let topics = [];


            snapshot.forEach(function (doc) {

                const data =
                    doc.data() || {};


                /*
                  published false হলে
                  student-কে দেখাবো না
                */

                if (
                    data.published !== undefined &&
                    data.published === false
                ) {
                    return;
                }


                topics.push({

                    id: doc.id,

                    ...data

                });

            });


            /*
              Order অনুযায়ী সাজানো
            */

            topics.sort(function (a, b) {

                const orderA =
                    Number(a.order || 0);


                const orderB =
                    Number(b.order || 0);


                return orderA - orderB;

            });


            if (!topics.length) {

                container.innerHTML = `

                    <div class="chapter-empty">

                        📚

                        <br><br>

                        কোনো published topic পাওয়া যায়নি।

                    </div>

                `;

                return;
            }


            renderTopics(topics);

        })

        .catch(function (error) {

            console.error(
                "Topics load error:",
                error
            );


            container.innerHTML = `

                <div class="chapter-empty">

                    ⚠️

                    <br><br>

                    Topics load করা যায়নি।

                </div>

            `;

        });

}


// ==========================================
// RENDER TOPICS
// ==========================================

function renderTopics(topics) {

    const container =
        document.getElementById(
            "topicList"
        );


    if (!container) {
        return;
    }


    let html = "";


    topics.forEach(function (topic, index) {

        const title =
            topic.name ||
            topic.title ||
            "Topic " + (index + 1);


        const description =
            topic.description ||
            "Practice questions and notes";


        html += `

            <div class="topic-card">

                <div class="topic-number">

                    ${index + 1}

                </div>


                <div class="topic-content">

                    <div class="topic-name">

                        ${escapeHTML(title)}

                    </div>


                    <div class="topic-description">

                        ${escapeHTML(description)}

                    </div>

                </div>


                <button
                    type="button"
                    class="topic-open"
                    onclick="openTopic('${escapeAttribute(topic.id)}')"
                >

                    Open

                </button>

            </div>

        `;

    });


    container.innerHTML =
        html;

}


// ==========================================
// OPEN TOPIC
// ==========================================

window.openTopic =
    function (topicIdValue) {

        if (!topicIdValue) {

            alert(
                "Topic information পাওয়া যায়নি।"
            );

            return;
        }


        /*
          Active IDs save
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
            topicIdValue
        );


        /*
          Old quiz keys clear
          যাতে আগের quiz accidentally
          open না হয়
        */

        localStorage.removeItem(
            "activeQuiz"
        );


        localStorage.removeItem(
            "quizCourse"
        );


        localStorage.removeItem(
            "quizChapter"
        );


        localStorage.removeItem(
            "quizTopic"
        );


        /*
          Topic page
        */

        window.location.href =
            "topic.html";

    };


// ==========================================
// BACK TO COURSE
// ==========================================

window.goBack =
    function () {

        window.location.href =
            "course.html";

    };


// ==========================================
// LOADING
// ==========================================

function setChapterLoading() {

    const title =
        document.getElementById(
            "chapterTitle"
        );


    const description =
        document.getElementById(
            "chapterDescription"
        );


    const container =
        document.getElementById(
            "topicList"
        );


    if (title) {

        title.textContent =
            "Loading...";

    }


    if (description) {

        description.textContent =
            "Please wait...";

    }


    if (container) {

        container.innerHTML = `

            <div class="chapter-loading">

                Loading topics...

            </div>

        `;

    }

}


// ==========================================
// ERROR
// ==========================================

function showChapterError(message) {

    const title =
        document.getElementById(
            "chapterTitle"
        );


    const description =
        document.getElementById(
            "chapterDescription"
        );


    const container =
        document.getElementById(
            "topicList"
        );


    if (title) {

        title.textContent =
            "Chapter Error";

    }


    if (description) {

        description.textContent =
            message;

    }


    if (container) {

        container.innerHTML = `

            <div class="chapter-empty">

                <div
                    style="
                        font-size:42px;
                        margin-bottom:15px;
                    "
                >
                    ⚠️
                </div>


                <div
                    style="
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

                    ← Back

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


function escapeAttribute(value) {

    return escapeHTML(value);

}
