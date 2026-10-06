// ==========================================================
// mNEET - STUDENT DASHBOARD
// Firebase Firestore Progress Version
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


        /*
          Load user progress first
        */

        await loadOverallProgress(
            db
        );


        /*
          Load available courses
        */

        await loadCourses(
            db
        );


        /*
          Update dashboard
        */

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


    const snapshot =
        await db
            .collection("courses")
            .get();


    snapshot.forEach(
        function (doc) {

            const data =
                doc.data() || {};


            /*
              Published false হলে
              student দেখবে না।
            */

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


    /*
      Sort by order
    */

    courses.sort(
        function (a, b) {

            return (
                Number(a.order || 0) -
                Number(b.order || 0)
            );

        }
    );

}


// ==========================================================
// RENDER DASHBOARD
// ==========================================================

function renderDashboard() {

    /*
      Welcome
    */

    const welcome =
        document.getElementById(
            "welcomeText"
        );


    if (welcome) {

        const name =
            currentUser.displayName ||
            currentUser.email ||
            "Student";


        welcome.textContent =
            "Welcome, " +
            name;

    }


    /*
      Progress
    */

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


    /*
      Last score
    */

    const lastScore =
        Number(
            overallProgress.lastScore || 0
        );


    setText(
        "lastScore",
        lastScore
    );


    /*
      Accuracy
    */

    const accuracy =
        Number(
            overallProgress.accuracy ||
            overallProgress.lastAccuracy ||
            0
        );


    setText(
        "accuracy",
        accuracy + "%"
    );


    /*
      Best score
    */

    const bestScore =
        Number(
            overallProgress.bestScore || 0
        );


    setText(
        "bestScore",
        bestScore
    );


    /*
      Course count
    */

    setText(
        "courseCount",
        courses.length
    );


    /*
      Continue
    */

    renderContinue();


    /*
      Course list
    */

    renderCourseList();

}


// ==========================================================
// OVERALL PERCENT
// ==========================================================

function getOverallPercent() {

    let percent =
        Number(
            overallProgress.percent || 0
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
        );


    const lastTopicName =
        overallProgress.lastTopicName ||
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

            continueButton.textContent =
                courses.length
                    ? "Browse Courses"
                    : "No Course";

            continueButton.disabled =
                courses.length === 0;


            continueButton.onclick =
                function () {

                    const list =
                        document.getElementById(
                            "courseList"
                        );


                    if (list) {

                        list.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                    }

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
                : "Continue your latest practice.";

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
        );


    const chapterId =
        overallProgress.lastChapterId ||
        localStorage.getItem(
            "activeChapter"
        );


    const topicId =
        overallProgress.lastTopicId ||
        localStorage.getItem(
            "activeTopic"
        );


    if (
        courseId &&
        chapterId &&
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


        return;
    }


    /*
      Course available but no
      previous topic found.
    */

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


    /*
      Nothing to continue.
    */

    const list =
        document.getElementById(
            "courseList"
        );


    if (list) {

        list.scrollIntoView({
            behavior:
                "smooth"
        });

    }

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
                course.price !== undefined
                    ? "₹" +
                      Number(
                          course.price
                      )
                    : "";


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


            button.addEventListener(
                "click",
                function () {

                    openCourse(
                        course.id
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
// SAFE TEXT
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

}


// ==========================================================
// ERROR
// ==========================================================

function showDashboardError(message) {

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
