// ==========================================================
// mNEET - STUDENT DASHBOARD
// Firebase Firestore Progress Version
// COMPLETE FRESH VERSION
// ==========================================================

"use strict";

let currentUser = null;
let courses = [];
let overallProgress = {};


// ==========================================================
// PAGE START
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    waitForFirebase();

});


// ==========================================================
// WAIT FOR FIREBASE
// ==========================================================

function waitForFirebase() {

    if (
        typeof firebase === "undefined" ||
        typeof firebase.auth !== "function"
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


            currentUser = user;

            loadDashboard();

        }
    );

}


// ==========================================================
// LOAD DASHBOARD
// ==========================================================

async function loadDashboard() {

    showDashboardLoading();


    try {

        const db =
            firebase.firestore();


        await loadOverallProgress(
            db
        );


        await loadCourses(
            db
        );


        renderDashboard();


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        showDashboardError(
            "Dashboard load করতে সমস্যা হয়েছে।"
        );

    }

}


// ==========================================================
// LOAD OVERALL PROGRESS
// ==========================================================

async function loadOverallProgress(db) {

    overallProgress = {};


    if (!currentUser) {
        return;
    }


    try {

        const progressRef =
            db
                .collection("users")
                .doc(currentUser.uid)
                .collection("progress")
                .doc("overall");


        const snap =
            await progressRef.get();


        if (snap.exists) {

            overallProgress =
                snap.data() || {};

        }


    } catch (error) {

        console.warn(
            "Overall progress not found:",
            error
        );


        overallProgress = {};

    }

}


// ==========================================================
// LOAD COURSES
// ==========================================================

async function loadCourses(db) {

    courses = [];


    try {

        const snapshot =
            await db
                .collection("courses")
                .get();


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data() || {};


                if (
                    data.published !== undefined &&
                    data.published === false
                ) {

                    return;

                }


                courses.push({

                    id:
                        doc.id,

                    ...data

                });

            }
        );


        courses.sort(
            function (a, b) {

                return (
                    Number(a.order || 0) -
                    Number(b.order || 0)
                );

            }
        );


    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );


        throw error;

    }

}


// ==========================================================
// RENDER DASHBOARD
// ==========================================================

function renderDashboard() {

    renderWelcome();

    renderOverallProgress();

    renderStatistics();

    renderContinue();

    renderCourseList();

}


// ==========================================================
// WELCOME
// ==========================================================

function renderWelcome() {

    const welcome =
        document.getElementById(
            "welcomeText"
        );


    if (!welcome) {
        return;
    }


    const name =
        currentUser.displayName ||
        currentUser.email ||
        "Student";


    welcome.textContent =
        "Welcome, " +
        name;

}


// ==========================================================
// OVERALL PROGRESS
// ==========================================================

function renderOverallProgress() {

    const progress =
        getOverallPercent();


    setText(
        "progressPercent",
        progress + "%"
    );


    setText(
        "progressCircleText",
        progress + "%"
    );


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            progress + "%";

    }

}


// ==========================================================
// GET OVERALL PERCENT
// ==========================================================

function getOverallPercent() {

    let percent =
        Number(
            overallProgress.percent ??
            overallProgress.overallPercent ??
            overallProgress.progress ??
            0
        );


    if (
        !Number.isFinite(percent)
    ) {

        percent = 0;

    }


    return Math.max(
        0,
        Math.min(
            100,
            Math.round(percent)
        )
    );

}


// ==========================================================
// STATISTICS
// ==========================================================

function renderStatistics() {

    const lastScore =
        Number(
            overallProgress.lastScore ??
            0
        );


    const accuracy =
        Number(
            overallProgress.accuracy ??
            overallProgress.lastAccuracy ??
            0
        );


    const bestScore =
        Number(
            overallProgress.bestScore ??
            0
        );


    setText(
        "lastScore",
        Number.isFinite(lastScore)
            ? lastScore
            : 0
    );


    setText(
        "accuracy",
        (
            Number.isFinite(accuracy)
                ? accuracy
                : 0
        ) + "%"
    );


    setText(
        "bestScore",
        Number.isFinite(bestScore)
            ? bestScore
            : 0
    );


    setText(
        "courseCount",
        courses.length +
        (
            courses.length === 1
                ? " Course"
                : " Courses"
        )
    );

}


// ==========================================================
// CONTINUE SECTION
// ==========================================================

function renderContinue() {

    const continueTitle =
        document.getElementById(
            "continueTitle"
        );


    const continueText =
        document.getElementById(
            "continueText"
        );


    const continueButton =
        document.getElementById(
            "continueButton"
        );


    const lastCourseId =
        overallProgress.lastCourseId ||
        localStorage.getItem(
            "activeCourse"
        ) ||
        "";


    const lastChapterId =
        overallProgress.lastChapterId ||
        localStorage.getItem(
            "activeChapter"
        ) ||
        "";


    const lastTopicId =
        overallProgress.lastTopicId ||
        localStorage.getItem(
            "activeTopic"
        ) ||
        "";


    const lastTopicName =
        overallProgress.lastTopicName ||
        localStorage.getItem(
            "activeTopicName"
        ) ||
        "";


    if (!lastCourseId) {

        if (continueTitle) {

            continueTitle.textContent =
                "Start Your Course";

        }


        if (continueText) {

            continueText.textContent =
                courses.length
                    ? "Choose a course and start practicing."
                    : "No course available yet.";

        }


        if (continueButton) {

            continueButton.disabled =
                courses.length === 0;


            continueButton.textContent =
                courses.length
                    ? "Browse Courses"
                    : "No Course";


            continueButton.onclick =
                function () {

                    scrollToCourseList();

                };

        }


        return;
    }


    if (continueTitle) {

        continueTitle.textContent =
            "Continue Practice";

    }


    if (continueText) {

        continueText.textContent =
            lastTopicName
                ? lastTopicName
                : (
                    lastChapterId
                        ? "Continue your latest chapter practice."
                        : "Continue your latest course."
                );

    }


    if (continueButton) {

        continueButton.disabled =
            false;


        continueButton.textContent =
            "Continue";


        continueButton.onclick =
            function () {

                continuePractice();

            };

    }

}


// ==========================================================
// CONTINUE PRACTICE
// ==========================================================

function continuePractice() {

    const courseId =
        overallProgress.lastCourseId ||
        localStorage.getItem(
            "activeCourse"
        ) ||
        "";


    const chapterId =
        overallProgress.lastChapterId ||
        localStorage.getItem(
            "activeChapter"
        ) ||
        "";


    const topicId =
        overallProgress.lastTopicId ||
        localStorage.getItem(
            "activeTopic"
        ) ||
        "";


    const quizId =
        overallProgress.lastQuizId ||
        localStorage.getItem(
            "activeQuiz"
        ) ||
        "";


    if (
        courseId &&
        chapterId &&
        topicId
    ) {

        saveActiveIds(
            courseId,
            chapterId,
            topicId,
            quizId
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


        return;
    }


    if (
        courseId &&
        chapterId
    ) {

        localStorage.setItem(
            "activeCourse",
            courseId
        );


        localStorage.setItem(
            "activeChapter",
            chapterId
        );


        window.location.href =
            "chapter.html" +
            "?courseId=" +
            encodeURIComponent(
                courseId
            ) +
            "&chapterId=" +
            encodeURIComponent(
                chapterId
            );


        return;
    }


    if (courseId) {

        localStorage.setItem(
            "activeCourse",
            courseId
        );


        window.location.href =
            "course.html" +
            "?courseId=" +
            encodeURIComponent(
                courseId
            );


        return;
    }


    scrollToCourseList();

}


// ==========================================================
// COURSE LIST
// ==========================================================

function renderCourseList() {

    const container =
        document.getElementById(
            "courseList"
        );


    if (!container) {
        return;
    }


    if (!courses.length) {

        container.innerHTML = `

            <div class="course-loading">

                No courses available.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    courses.forEach(
        function (course) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "course-card";


            const badge =
                escapeHTML(
                    course.badge ||
                    "NEET BIOLOGY"
                );


            const title =
                escapeHTML(
                    course.name ||
                    course.title ||
                    "Biology Course"
                );


            const description =
                escapeHTML(
                    course.description ||
                    "NEET Biology complete practice course."
                );


            const price =
                course.price !== undefined &&
                course.price !== null &&
                String(course.price).trim() !== ""
                    ? "₹" +
                      Number(
                          course.price
                      )
                    : "";


            const progress =
                getCourseProgress(
                    course.id
                );


            card.innerHTML = `

                <div class="course-badge">
                    ${badge}
                </div>


                <div class="course-title">
                    ${title}
                </div>


                <div class="course-description">
                    ${description}
                </div>


                ${
                    price
                        ? `
                            <div
                                style="
                                    color:#ffc107;
                                    font-size:20px;
                                    font-weight:900;
                                    margin:10px 0;
                                "
                            >
                                ${price}
                            </div>
                        `
                        : ""
                }


                <div
                    style="
                        margin:10px 0;
                        font-size:13px;
                        font-weight:800;
                        opacity:.85;
                    "
                >
                    Progress: ${progress}%
                </div>


                <div
                    style="
                        width:100%;
                        height:7px;
                        background:rgba(255,255,255,.15);
                        border-radius:20px;
                        overflow:hidden;
                        margin-bottom:12px;
                    "
                >

                    <div
                        style="
                            width:${progress}%;
                            height:100%;
                            border-radius:20px;
                            background:#2e7d32;
                        "
                    ></div>

                </div>


                <button
                    type="button"
                    class="course-button"
                >
                    Open Course
                </button>

            `;


            const button =
                card.querySelector(
                    ".course-button"
                );


            if (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openCourse(
                            course.id
                        );

                    }
                );

            }


            container.appendChild(
                card
            );

        }
    );

}


// ==========================================================
// COURSE PROGRESS
// ==========================================================

function getCourseProgress(courseId) {

    if (!courseId) {
        return 0;
    }


    /*
      If Firestore overall document
      contains course-specific progress.
    */

    if (
        overallProgress.courseProgress &&
        overallProgress.courseProgress[
            courseId
        ] !== undefined
    ) {

        const value =
            Number(
                overallProgress.courseProgress[
                    courseId
                ]
            );


        if (
            Number.isFinite(value)
        ) {

            return Math.max(
                0,
                Math.min(
                    100,
                    Math.round(value)
                )
            );

        }

    }


    /*
      If last course is the active course,
      show overall progress.
    */

    if (
        overallProgress.lastCourseId ===
        courseId
    ) {

        return getOverallPercent();

    }


    return 0;

}


// ==========================================================
// OPEN COURSE
// ==========================================================

function openCourse(courseId) {

    if (!courseId) {
        return;
    }


    localStorage.setItem(
        "activeCourse",
        courseId
    );


    window.location.href =
        "course.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        );

}


// ==========================================================
// TOPIC WISE PRACTICE
// ==========================================================

function openTopicPractice() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showChooseCourseMessage();

        return;
    }


    window.location.href =
        "course.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        );

}


// ==========================================================
// CHAPTER WISE PRACTICE
// ==========================================================

function openChapterPractice() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showChooseCourseMessage();

        return;
    }


    /*
      Keep the current course.
      course.html can provide
      chapter/type practice.
    */

    window.location.href =
        "course.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        ) +
        "&practice=chapter";

}


// ==========================================================
// NCERT
// ==========================================================

function openNCERT() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showChooseCourseMessage();

        return;
    }


    window.location.href =
        "course.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        ) +
        "&section=ncert";

}


// ==========================================================
// VIDEOS
// ==========================================================

function openVideos() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showChooseCourseMessage();

        return;
    }


    window.location.href =
        "course.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        ) +
        "&section=videos";

}


// ==========================================================
// PROFILE
// ==========================================================

function openProfile() {

    /*
      If profile.html exists,
      open it.
      Otherwise keep user inside
      dashboard instead of breaking.
    */

    window.location.href =
        "profile.html";

}


// ==========================================================
// HOME
// ==========================================================

function goHome() {

    window.location.href =
        "student.html";

}


// ==========================================================
// LOGOUT
// ==========================================================

function logoutUser() {

    if (
        typeof firebase === "undefined" ||
        typeof firebase.auth !== "function"
    ) {

        window.location.href =
            "index.html";

        return;
    }


    const shouldLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!shouldLogout) {
        return;
    }


    firebase.auth()
        .signOut()
        .then(
            function () {

                /*
                  Do NOT clear active course.
                  This allows the user to
                  continue after login.
                */

                window.location.href =
                    "index.html";

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Logout করতে সমস্যা হয়েছে। Please try again."
                );

            }
        );

}


// ==========================================================
// GET ACTIVE COURSE
// ==========================================================

function getActiveCourse() {

    return (
        overallProgress.lastCourseId ||
        localStorage.getItem(
            "activeCourse"
        ) ||
        (
            courses.length
                ? courses[0].id
                : ""
        ) ||
        ""
    );

}


// ==========================================================
// SAVE ACTIVE IDS
// ==========================================================

function saveActiveIds(
    courseId,
    chapterId,
    topicId,
    quizId
) {

    if (courseId) {

        localStorage.setItem(
            "activeCourse",
            courseId
        );

    }


    if (chapterId) {

        localStorage.setItem(
            "activeChapter",
            chapterId
        );

    }


    if (topicId) {

        localStorage.setItem(
            "activeTopic",
            topicId
        );

    }


    if (quizId) {

        localStorage.setItem(
            "activeQuiz",
            quizId
        );

    }

}


// ==========================================================
// CHOOSE COURSE MESSAGE
// ==========================================================

function showChooseCourseMessage() {

    if (!courses.length) {

        alert(
            "কোনো course available নেই।"
        );

        return;
    }


    const list =
        document.getElementById(
            "courseList"
        );


    if (list) {

        list.scrollIntoView({
            behavior:
                "smooth",
            block:
                "start"
        });

    }


    alert(
        "প্রথমে একটি course select করুন।"
    );

}


// ==========================================================
// SCROLL COURSE LIST
// ==========================================================

function scrollToCourseList() {

    const list =
        document.getElementById(
            "courseList"
        );


    if (list) {

        list.scrollIntoView({
            behavior:
                "smooth",
            block:
                "start"
        });

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
// LOADING
// ==========================================================

function showDashboardLoading() {

    const list =
        document.getElementById(
            "courseList"
        );


    if (list) {

        list.innerHTML = `

            <div class="course-loading">

                Loading courses...

            </div>

        `;

    }


    setText(
        "courseCount",
        "Loading..."
    );

}


// ==========================================================
// ERROR
// ==========================================================

function showDashboardError(
    message
) {

    const list =
        document.getElementById(
            "courseList"
        );


    if (list) {

        list.innerHTML = `

            <div
                class="course-loading"
                style="color:#ff6b6b;"
            >

                ⚠️
                <br><br>

                ${escapeHTML(message)}

                <br><br>

                <button
                    type="button"
                    onclick="location.reload()"
                    style="
                        border:0;
                        border-radius:10px;
                        padding:10px 16px;
                        cursor:pointer;
                        font-weight:900;
                    "
                >
                    Retry
                </button>

            </div>

        `;

    }

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

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


// ==========================================================
// GLOBAL SAFETY
// ==========================================================

window.openCourse =
    openCourse;

window.openTopicPractice =
    openTopicPractice;

window.openChapterPractice =
    openChapterPractice;

window.openNCERT =
    openNCERT;

window.openVideos =
    openVideos;

window.openProfile =
    openProfile;

window.goHome =
    goHome;

window.logoutUser =
    logoutUser;

window.continueLearning =
    continuePractice;


// ==========================================================
// END
// ==========================================================
