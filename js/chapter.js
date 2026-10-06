// ==========================================================
// mNEET - CHAPTER PAGE
// Firebase Firestore Version
// ==========================================================


// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let courseId = "";
let chapterId = "";


// ==========================================================
// QUESTION TYPES
// ==========================================================

const QUESTION_TYPES = [

    {
        id: "assertion-reason",
        title: "Assertion Reason",
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


// ==========================================================
// PAGE START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ------------------------------------------
        // Firebase check
        // ------------------------------------------

        if (
            typeof firebase === "undefined" ||
            typeof db === "undefined" ||
            typeof auth === "undefined"
        ) {

            showChapterError(
                "Firebase properly load হয়নি।"
            );

            return;

        }


        // ------------------------------------------
        // Login check
        // ------------------------------------------

        auth.onAuthStateChanged(
            function (user) {

                if (!user) {

                    window.location.href =
                        "index.html";

                    return;

                }


                // ----------------------------------
                // Get active IDs
                // ----------------------------------

                courseId =
                    localStorage.getItem(
                        "activeCourse"
                    );


                chapterId =
                    localStorage.getItem(
                        "activeChapter"
                    );


                // ----------------------------------
                // Check IDs
                // ----------------------------------

                if (
                    !courseId ||
                    !chapterId
                ) {

                    showChapterError(
                        "Course বা Chapter information পাওয়া যায়নি।"
                    );

                    return;

                }


                // ----------------------------------
                // Start loading
                // ----------------------------------

                loadChapter();

            }
        );

    }
);


// ==========================================================
// LOAD CHAPTER
// ==========================================================

function loadChapter() {

    showChapterLoading();


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .get()

        .then(
            function (doc) {

                if (!doc.exists) {

                    showChapterError(
                        "Chapter পাওয়া যায়নি।"
                    );

                    return;

                }


                const chapter =
                    doc.data();


                // ----------------------------------
                // Chapter title
                // ----------------------------------

                const title =
                    chapter.name ||
                    chapter.title ||
                    "Biology Chapter";


                // ----------------------------------
                // Chapter description
                // ----------------------------------

                const description =
                    chapter.description ||
                    "Practice this chapter for NEET Biology.";


                // ----------------------------------
                // Display chapter
                // ----------------------------------

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


                // ----------------------------------
                // Save active chapter again
                // ----------------------------------

                localStorage.setItem(
                    "activeCourse",
                    courseId
                );


                localStorage.setItem(
                    "activeChapter",
                    chapterId
                );


                // ----------------------------------
                // Load topics
                // ----------------------------------

                loadTopics();


                // ----------------------------------
                // Render question types
                // ----------------------------------

                renderQuestionTypes();

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Chapter Firestore Error:",
                    error
                );


                showChapterError(
                    "Chapter load করা যায়নি।"
                );

            }
        );

}


// ==========================================================
// LOAD TOPICS
// ==========================================================

function loadTopics() {

    const topicList =
        document.getElementById(
            "topicList"
        );


    if (!topicList) {

        return;

    }


    topicList.innerHTML = `

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

        .then(
            function (snapshot) {

                // ----------------------------------
                // No topics
                // ----------------------------------

                if (
                    snapshot.empty
                ) {

                    topicList.innerHTML = `

                        <div class="empty-state">

                            <div class="empty-icon">
                                📚
                            </div>

                            <h3>
                                No Topics Available
                            </h3>

                            <p>
                                এই chapter-এর জন্য এখনো
                                কোনো topic যোগ করা হয়নি।
                            </p>

                        </div>

                    `;


                    updateTopicCount(0);

                    return;

                }


                // ----------------------------------
                // Convert documents to array
                // ----------------------------------

                const topics = [];


                snapshot.forEach(
                    function (doc) {

                        topics.push({

                            id: doc.id,

                            data: doc.data()

                        });

                    }
                );


                // ----------------------------------
                // Optional order sorting
                // ----------------------------------

                topics.sort(
                    function (a, b) {

                        const orderA =
                            Number(
                                a.data.order ||
                                a.data.serial ||
                                999999
                            );


                        const orderB =
                            Number(
                                b.data.order ||
                                b.data.serial ||
                                999999
                            );


                        return orderA - orderB;

                    }
                );


                // ----------------------------------
                // Topic count
                // ----------------------------------

                updateTopicCount(
                    topics.length
                );


                // ----------------------------------
                // Render topics
                // ----------------------------------

                topicList.innerHTML = "";


                topics.forEach(
                    function (topic, index) {

                        const card =
                            createTopicCard(
                                topic.id,
                                topic.data,
                                index + 1
                            );


                        topicList.appendChild(
                            card
                        );

                    }
                );

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Topics Firestore Error:",
                    error
                );


                topicList.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Topics Load Error
                        </h3>

                        <p>
                            Topics load করা যায়নি।
                        </p>

                    </div>

                `;


                updateTopicCount(0);

            }
        );

}


// ==========================================================
// CREATE TOPIC CARD
// ==========================================================

function createTopicCard(
    id,
    data,
    number
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "topic-card";


    // ------------------------------------------
    // Topic name
    // ------------------------------------------

    const topicName =
        data.name ||
        data.title ||
        "Biology Topic";


    // ------------------------------------------
    // Card HTML
    // ------------------------------------------

    card.innerHTML = `

        <div class="topic-number">

            ${number}

        </div>


        <div class="topic-card-content">

            <div class="topic-badge">

                TOPIC

            </div>


            <div class="topic-card-title">

                ${escapeHTML(topicName)}

            </div>


            <div class="topic-card-description">

                ${escapeHTML(
                    data.description || ""
                )}

            </div>

        </div>


        <div class="topic-open-label">

            OPEN →

        </div>

    `;


    // ------------------------------------------
    // Click event
    // ------------------------------------------

    card.addEventListener(
        "click",
        function () {

            openTopic(id);

        }
    );


    return card;

}


// ==========================================================
// UPDATE TOPIC COUNT
// ==========================================================

function updateTopicCount(count) {

    const element =
        document.getElementById(
            "topicCount"
        );


    if (!element) {

        return;

    }


    if (count === 1) {

        element.textContent =
            "1 Topic";

        return;

    }


    element.textContent =
        count + " Topics";

}


// ==========================================================
// RENDER QUESTION TYPES
// ==========================================================

function renderQuestionTypes() {

    const container =
        document.getElementById(
            "typePracticeGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    QUESTION_TYPES.forEach(
        function (type) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "type-card";


            card.innerHTML = `

                <div class="type-icon">

                    ${type.icon}

                </div>


                <div class="type-content">

                    <div class="type-title">

                        ${escapeHTML(
                            type.title
                        )}

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
                function (event) {

                    event.stopPropagation();

                    openQuestionType(
                        type.id,
                        type.title
                    );

                }
            );


            card.addEventListener(
                "click",
                function () {

                    openQuestionType(
                        type.id,
                        type.title
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

function openTopic(topicId) {

    if (
        !courseId ||
        !chapterId ||
        !topicId
    ) {

        alert(
            "Topic information পাওয়া যায়নি।"
        );

        return;

    }


    // ------------------------------------------
    // Save active information
    // ------------------------------------------

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


    // ------------------------------------------
    // Open topic page
    // ------------------------------------------

    window.location.href =
        "topic.html";

}


// ==========================================================
// OPEN QUESTION TYPE
// ==========================================================

function openQuestionType(
    typeId,
    typeTitle
) {

    if (
        !courseId ||
        !chapterId
    ) {

        alert(
            "Chapter information পাওয়া যায়নি।"
        );

        return;

    }


    // ------------------------------------------
    // Save quiz information
    // ------------------------------------------

    localStorage.setItem(
        "quizCourse",
        courseId
    );


    localStorage.setItem(
        "quizChapter",
        chapterId
    );


    localStorage.setItem(
        "quizType",
        typeId
    );


    localStorage.setItem(
        "quizTypeTitle",
        typeTitle
    );


    // ------------------------------------------
    // Make sure topic quiz is not used
    // ------------------------------------------

    localStorage.removeItem(
        "quizTopic"
    );


    // ------------------------------------------
    // Open quiz
    // ------------------------------------------

    window.location.href =
        "quiz.html";

}


// ==========================================================
// BACK TO COURSE
// ==========================================================

function goBackToCourse() {

    window.location.href =
        "course.html";

}


// ==========================================================
// BACK TO STUDENT
// ==========================================================

function goBackToStudent() {

    window.location.href =
        "student.html";

}


// ==========================================================
// OPEN NCERT
// ==========================================================

function openNCERT() {

    window.location.href =
        "ncert.html";

}


// ==========================================================
// OPEN VIDEOS
// ==========================================================

function openVideos() {

    window.location.href =
        "videos.html";

}


// ==========================================================
// LOGOUT
// ==========================================================

function logoutUser() {

    if (
        typeof auth === "undefined"
    ) {

        window.location.href =
            "index.html";

        return;

    }


    auth.signOut()

        .then(
            function () {

                // ----------------------------------
                // Clear active navigation data
                // ----------------------------------

                localStorage.removeItem(
                    "activeCourse"
                );


                localStorage.removeItem(
                    "activeChapter"
                );


                localStorage.removeItem(
                    "activeTopic"
                );


                window.location.href =
                    "index.html";

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Logout করা যায়নি। আবার চেষ্টা করুন।"
                );

            }
        );

}


// ==========================================================
// LOADING STATE
// ==========================================================

function showChapterLoading() {

    const titleElement =
        document.getElementById(
            "chapterTitle"
        );


    const descriptionElement =
        document.getElementById(
            "chapterDescription"
        );


    const topicList =
        document.getElementById(
            "topicList"
        );


    const typeGrid =
        document.getElementById(
            "typePracticeGrid"
        );


    if (titleElement) {

        titleElement.textContent =
            "Loading Chapter...";

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            "Please wait...";

    }


    if (topicList) {

        topicList.innerHTML = `

            <div class="chapter-loading">

                Loading topics...

            </div>

        `;

    }


    if (typeGrid) {

        typeGrid.innerHTML = `

            <div class="chapter-loading">

                Loading question types...

            </div>

        `;

    }

}


// ==========================================================
// ERROR STATE
// ==========================================================

function showChapterError(
    message
) {

    const titleElement =
        document.getElementById(
            "chapterTitle"
        );


    const descriptionElement =
        document.getElementById(
            "chapterDescription"
        );


    const topicList =
        document.getElementById(
            "topicList"
        );


    const typeGrid =
        document.getElementById(
            "typePracticeGrid"
        );


    if (titleElement) {

        titleElement.textContent =
            "Chapter Error";

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            message;

    }


    if (topicList) {

        topicList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Something went wrong
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        `;

    }


    if (typeGrid) {

        typeGrid.innerHTML = "";

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
