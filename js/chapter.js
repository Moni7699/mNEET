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

        auth.onAuthStateChanged(function (user) {

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

                window.location.href =
                    "student.html";

                return;
            }


            loadChapter();

        });

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

        .then(function (doc) {

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

        })

        .catch(function (error) {

            console.error(
                "Chapter loading error:",
                error
            );

            alert(
                "Unable to load chapter."
            );

        });

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
        <div class="course-loading">
            Loading topics...
        </div>
    `;


    db.collection("courses")
        .doc(activeCourseId)
        .collection("chapters")
        .doc(activeChapterId)
        .collection("topics")
        .orderBy("order", "asc")
        .get()

        .then(function (snapshot) {

            topicList.innerHTML = "";


            if (snapshot.empty) {

                topicList.innerHTML = `
                    <div class="empty-state">

                        <div class="empty-icon">
                            📚
                        </div>

                        <h3>
                            No topics available
                        </h3>

                        <p>
                            Topics will appear here
                            when they are added.
                        </p>

                    </div>
                `;


                updateTopicCount(0);

                return;
            }


            let topicNumber = 0;


            snapshot.forEach(function (doc) {

                const topic =
                    doc.data();


                if (
                    topic.published === false
                ) {

                    return;
                }


                topicNumber++;


                createTopicCard(
                    doc.id,
                    topic,
                    topicNumber,
                    topicList
                );

            });


            updateTopicCount(
                topicNumber
            );


            if (topicNumber === 0) {

                topicList.innerHTML = `
                    <div class="empty-state">

                        <div class="empty-icon">
                            🔒
                        </div>

                        <h3>
                            No published topics
                        </h3>

                        <p>
                            Please check again later.
                        </p>

                    </div>
                `;

            }

        })

        .catch(function (error) {

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
                        Please check your
                        internet connection.
                    </p>

                </div>
            `;

        });

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
        "Practice questions and notes";


    const card =
        document.createElement("div");


    card.className =
        "course-card";


    card.innerHTML = `

        <div class="course-image">

            <div
                style="
                    font-size:52px;
                    font-weight:900;
                    color:#ffc107;
                "
            >
                ${topicNumber}
            </div>

        </div>


        <div class="course-content">

            <div class="course-badge">
                TOPIC ${topicNumber}
            </div>


            <h3 class="course-title">
                ${escapeHTML(title)}
            </h3>


            <p class="course-description">
                ${escapeHTML(description)}
            </p>


            <div class="course-bottom">

                <div class="course-price">
                    Quiz + Notes
                </div>


                <button
                    class="course-button"
                    onclick="
                        openTopic('${topicId}')
                    "
                >
                    Open
                </button>

            </div>

        </div>

    `;


    container.appendChild(card);

}


// ==========================================
// OPEN TOPIC
// ==========================================

function openTopic(topicId) {

    if (!topicId) {

        return;
    }


    localStorage.setItem(
        "activeTopic",
        topicId
    );


    localStorage.setItem(
        "activeCourse",
        activeCourseId
    );


    localStorage.setItem(
        "activeChapter",
        activeChapterId
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
