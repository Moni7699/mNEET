// ==========================================
// mNEET - Chapter Page
// ==========================================

let currentUser = null;
let activeCourseId = null;
let activeChapterId = null;


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


                if (
                    !activeCourseId ||
                    !activeChapterId
                ) {

                    alert(
                        "Chapter information is missing."
                    );

                    window.location.href =
                        "student.html";

                    return;
                }


                loadChapter();

            }
        );

    }
);


// ==========================================
// LOAD CHAPTER
// ==========================================

function loadChapter() {

    db.collection("courses")
        .doc(activeCourseId)
        .collection("chapters")
        .doc(activeChapterId)
        .get()

        .then(
            function (doc) {

                if (!doc.exists) {

                    alert(
                        "Chapter not found."
                    );

                    goBackToCourse();

                    return;
                }


                const chapter =
                    doc.data();


                document.getElementById(
                    "chapterTitle"
                ).textContent =
                    chapter.name ||
                    chapter.title ||
                    "Biology Chapter";


                document.getElementById(
                    "chapterDescription"
                ).textContent =
                    chapter.description ||
                    "Select a topic to start learning.";


                loadTopics();

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Chapter loading error:",
                    error
                );


                showError(
                    "Unable to load chapter."
                );

            }
        );

}


// ==========================================
// LOAD TOPICS
// ==========================================

function loadTopics() {

    const topicList =
        document.getElementById(
            "topicList"
        );


    topicList.innerHTML = `

        <div class="chapter-loading">

            Loading topics...

        </div>

    `;


    db.collection("courses")
        .doc(activeCourseId)
        .collection("chapters")
        .doc(activeChapterId)
        .collection("topics")
        .get()

        .then(
            function (snapshot) {

                topicList.innerHTML = "";


                if (snapshot.empty) {

                    showEmpty(
                        "📚",
                        "No topics available",
                        "Topics will appear here when they are added."
                    );

                    updateTopicCount(0);

                    return;
                }


                const topicDocs = [];


                snapshot.forEach(
                    function (doc) {

                        const topic =
                            doc.data();


                        if (
                            topic.published === false
                        ) {

                            return;
                        }


                        topicDocs.push({
                            id: doc.id,
                            data: topic
                        });

                    }
                );


                // Sort by order if available

                topicDocs.sort(
                    function (a, b) {

                        const orderA =
                            Number(
                                a.data.order
                            ) || 999999;


                        const orderB =
                            Number(
                                b.data.order
                            ) || 999999;


                        return orderA - orderB;

                    }
                );


                updateTopicCount(
                    topicDocs.length
                );


                if (
                    topicDocs.length === 0
                ) {

                    showEmpty(
                        "🔒",
                        "No published topics",
                        "Please check again later."
                    );

                    return;
                }


                topicDocs.forEach(
                    function (item, index) {

                        createTopicCard(
                            item.id,
                            item.data,
                            index + 1,
                            topicList
                        );

                    }
                );

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Topic loading error:",
                    error
                );


                topicList.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Unable to load topics
                        </h3>

                        <p>
                            ${escapeHTML(
                                error.message ||
                                "Please check your Firebase setup."
                            )}
                        </p>

                    </div>

                `;

            }
        );

}


// ==========================================
// CREATE TOPIC CARD
// ==========================================

function createTopicCard(
    topicId,
    topic,
    topicNumber,
    container
) {

    const title =
        topic.name ||
        topic.title ||
        "Topic " + topicNumber;


    const description =
        topic.description ||
        "Practice questions and study notes.";


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "topic-card";


    card.innerHTML = `

        <div class="topic-number">

            ${topicNumber}

        </div>


        <div class="topic-card-content">

            <div class="topic-badge">

                TOPIC ${topicNumber}

            </div>


            <h3 class="topic-card-title">

                ${escapeHTML(title)}

            </h3>


            <p class="topic-card-description">

                ${escapeHTML(description)}

            </p>


            <div class="topic-open-label">

                Open Topic →

            </div>

        </div>

    `;


    card.addEventListener(
        "click",
        function () {

            openTopic(topicId);

        }
    );


    container.appendChild(
        card
    );

}


// ==========================================
// OPEN TOPIC
// ==========================================

function openTopic(topicId) {

    if (!topicId) {

        alert(
            "Topic ID is missing."
        );

        return;
    }


    /*
     * Save all three IDs.
     * This makes Topic → Quiz → Notes
     * navigation reliable.
     */

    localStorage.setItem(
        "activeCourse",
        activeCourseId
    );


    localStorage.setItem(
        "activeChapter",
        activeChapterId
    );


    localStorage.setItem(
        "activeTopic",
        topicId
    );


    window.location.href =
        "topic.html";

}


// ==========================================
// TOPIC COUNT
// ==========================================

function updateTopicCount(count) {

    const element =
        document.getElementById(
            "topicCount"
        );


    if (!element) {

        return;
    }


    element.textContent =
        count +
        (
            count === 1
                ? " Topic"
                : " Topics"
        );

}


// ==========================================
// EMPTY STATE
// ==========================================

function showEmpty(
    icon,
    title,
    description
) {

    const topicList =
        document.getElementById(
            "topicList"
        );


    topicList.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">

                ${icon}

            </div>

            <h3>

                ${escapeHTML(title)}

            </h3>

            <p>

                ${escapeHTML(description)}

            </p>

        </div>

    `;

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    const topicList =
        document.getElementById(
            "topicList"
        );


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


// ==========================================
// BACK TO COURSE
// ==========================================

function goBackToCourse() {

    window.location.href =
        "course.html";

}


// ==========================================
// BACK TO STUDENT
// ==========================================

function goBackToStudent() {

    window.location.href =
        "student.html";

}


// ==========================================
// NCERT
// ==========================================

function openNCERT() {

    window.location.href =
        "ncert.html";

}


// ==========================================
// VIDEOS
// ==========================================

function openVideos() {

    window.location.href =
        "video.html";

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
