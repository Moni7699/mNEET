// ==========================================
// mNEET - Course Dashboard
// ==========================================


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let activeCourseId = null;

let activeCourse = null;


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


                // Get selected course

                activeCourseId =
                    localStorage.getItem(
                        "activeCourse"
                    );


                if (!activeCourseId) {

                    window.location.href =
                        "student.html";

                    return;
                }


                // Load course

                loadCourse();

            }
        );

    }
);


// ==========================================
// LOAD COURSE
// ==========================================

function loadCourse() {

    db.collection("courses")
        .doc(activeCourseId)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                alert(
                    "Course not found."
                );

                window.location.href =
                    "student.html";

                return;
            }


            activeCourse =
                doc.data();


            // Course title

            setCourseText(
                "courseTitle",
                activeCourse.name ||
                activeCourse.title ||
                "NEET Biology Course"
            );


            // Description

            setCourseText(
                "courseDescription",
                activeCourse.description ||
                "Complete NEET Biology preparation course."
            );


            // Load chapters

            loadChapters();

        })

        .catch(function (error) {

            console.error(
                "Course loading error:",
                error
            );


            alert(
                "Unable to load course."
            );

        });

}


// ==========================================
// LOAD CHAPTERS
// ==========================================

function loadChapters() {

    const chapterList =
        document.getElementById(
            "chapterList"
        );


    if (!chapterList) {

        return;
    }


    chapterList.innerHTML = `
        <div class="course-loading">
            Loading chapters...
        </div>
    `;


    db.collection("courses")
        .doc(activeCourseId)
        .collection("chapters")
        .get()

        .then(function (snapshot) {

            chapterList.innerHTML = "";


            if (snapshot.empty) {

                chapterList.innerHTML = `
                    <div class="empty-state">

                        <div class="empty-icon">
                            📚
                        </div>

                        <h3>
                            Chapters coming soon
                        </h3>

                        <p>
                            Your teacher has not
                            added chapters yet.
                        </p>

                    </div>
                `;


                updateChapterCount(0);


                return;
            }


            let chapterNumber = 0;


            snapshot.forEach(
                function (doc) {

                    chapterNumber++;


                    createChapterCard(
                        doc.id,
                        doc.data(),
                        chapterNumber,
                        chapterList
                    );

                }
            );


            updateChapterCount(
                chapterNumber
            );

        })

        .catch(function (error) {

            console.error(
                "Chapter loading error:",
                error
            );


            chapterList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load chapters
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
// CREATE CHAPTER CARD
// ==========================================

function createChapterCard(
    chapterId,
    chapter,
    chapterNumber,
    container
) {

    const title =
        chapter.name ||
        chapter.title ||
        "Chapter " + chapterNumber;


    const description =
        chapter.description ||
        "Practice questions and study materials";


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "course-card chapter-card";


    card.innerHTML = `

        <div class="course-image">

            <div
                style="
                    font-size:55px;
                    font-weight:900;
                    color:#ffc107;
                "
            >
                ${chapterNumber}
            </div>

        </div>


        <div class="course-content">

            <div class="course-badge">
                CHAPTER ${chapterNumber}
            </div>


            <h3 class="course-title">
                ${escapeHTML(title)}
            </h3>


            <p class="course-description">
                ${escapeHTML(description)}
            </p>


            <div class="course-bottom">

                <div class="course-price">
                    Biology
                </div>


                <button
                    class="course-button"
                    onclick="
                        openChapter(
                            '${chapterId}'
                        )
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
// OPEN CHAPTER
// ==========================================

function openChapter(
    chapterId
) {

    if (!chapterId) {

        return;
    }


    localStorage.setItem(
        "activeChapter",
        chapterId
    );


    localStorage.setItem(
        "activeCourse",
        activeCourseId
    );


    window.location.href =
        "chapter.html";

}


// ==========================================
// TOPIC WISE
// ==========================================

function openTopicWise() {

    localStorage.setItem(
        "practiceMode",
        "topic"
    );


    // If chapters exist,
    // user can choose one.

    scrollToChapters();

}


// ==========================================
// CHAPTER WISE
// ==========================================

function openChapterWise() {

    localStorage.setItem(
        "practiceMode",
        "chapter"
    );


    alert(
        "Chapter Wise Practice will be available after chapters are added."
    );

}


// ==========================================
// NCERT BOOKS
// ==========================================

function openNCERTBooks() {

    localStorage.setItem(
        "activeCourse",
        activeCourseId
    );


    window.location.href =
        "ncert.html";

}


// ==========================================
// COURSE VIDEOS
// ==========================================

function openCourseVideos() {

    localStorage.setItem(
        "activeCourse",
        activeCourseId
    );


    window.location.href =
        "video.html";

}


// ==========================================
// SCROLL TO CHAPTERS
// ==========================================

function scrollToChapters() {

    const chapterList =
        document.getElementById(
            "chapterList"
        );


    if (chapterList) {

        chapterList.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

}


// ==========================================
// BACK TO STUDENT
// ==========================================

function goBackToStudent() {

    window.location.href =
        "student.html";

}


// ==========================================
// UPDATE CHAPTER COUNT
// ==========================================

function updateChapterCount(
    count
) {

    const element =
        document.getElementById(
            "chapterCount"
        );


    if (!element) {

        return;
    }


    element.textContent =
        count +
        (
            count === 1
                ? " Chapter"
                : " Chapters"
        );

}


// ==========================================
// SET COURSE TEXT
// ==========================================

function setCourseText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;
    }

}


// ==========================================
// HTML ESCAPE
// ==========================================

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
