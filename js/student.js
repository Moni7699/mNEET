// ==========================================================
// mNEET - STUDENT DASHBOARD
// Firebase Firestore Progress Version
// COMPLETE VERSION
// ==========================================================

"use strict";

let currentUser = null;

let courses = [];

let overallProgress = {};

let coursePurchases = {};

let progressRecords = [];


// ==========================================================
// PAGE START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        waitForFirebase();

    }
);


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
          Load progress
        */

        await loadOverallProgress(
            db
        );


        /*
          Load courses
        */

        await loadCourses(
            db
        );


        /*
          Load purchases
        */

        await loadPurchases(
            db
        );


        /*
          Render everything
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

    progressRecords = [];


    try {

        const progressRef =
            db
                .collection("users")
                .doc(currentUser.uid)
                .collection("progress");


        /*
          First try overall document
        */

        try {

            const overallSnap =
                await progressRef
                    .doc("overall")
                    .get();


            if (overallSnap.exists) {

                overallProgress =
                    overallSnap.data() || {};

            }

        } catch (overallError) {

            console.warn(
                "Overall document unavailable:",
                overallError
            );

        }


        /*
          Load individual progress
        */

        try {

            const snapshot =
                await progressRef.get();


            snapshot.forEach(
                function (doc) {

                    if (
                        doc.id === "overall"
                    ) {

                        return;
                    }


                    const data =
                        doc.data() || {};


                    progressRecords.push({
                        id:
                            doc.id,

                        ...data
                    });

                }
            );

        } catch (progressError) {

            console.warn(
                "Progress records unavailable:",
                progressError
            );

        }


        /*
          If overall document does not contain
          useful data, calculate it from
          individual progress records.
        */

        buildOverallProgress();


    } catch (error) {

        console.warn(
            "Overall progress load error:",
            error
        );


        overallProgress = {};

    }

}


// ==========================================================
// BUILD OVERALL PROGRESS
// ==========================================================

function buildOverallProgress() {

    if (!progressRecords.length) {

        return;
    }


    /*
      Latest progress
    */

    const sorted =
        progressRecords.slice().sort(
            function (a, b) {

                const aTime =
                    getTimeValue(
                        a.lastAttemptAt
                    );


                const bTime =
                    getTimeValue(
                        b.lastAttemptAt
                    );


                return bTime - aTime;

            }
        );


    const latest =
        sorted[0] || null;


    /*
      Best score
    */

    let bestScore =
        Number(
            overallProgress.bestScore || 0
        );


    /*
      Best accuracy
    */

    let bestAccuracy =
        Number(
            overallProgress.bestAccuracy ||
            overallProgress.accuracy ||
            0
        );


    /*
      Completed topics
    */

    let completedTopics = 0;


    let totalTopics = 0;


    progressRecords.forEach(
        function (record) {

            const attempts =
                Number(
                    record.attempts || 0
                );


            if (attempts > 0) {

                completedTopics++;

            }


            const score =
                Number(
                    record.bestScore ||
                    record.lastScore ||
                    0
                );


            const accuracy =
                Number(
                    record.bestAccuracy ||
                    record.lastAccuracy ||
                    0
                );


            if (score > bestScore) {

                bestScore = score;

            }


            if (accuracy > bestAccuracy) {

                bestAccuracy =
                    accuracy;

            }

        }
    );


    /*
      If overall percent already exists
      use it.

      Otherwise calculate a safe
      progress percentage from completed
      topics.
    */

    let percent =
        Number(
            overallProgress.percent
        );


    if (
        !Number.isFinite(percent) ||
        percent <= 0
    ) {

        if (totalTopics > 0) {

            percent =
                Math.round(
                    (
                        completedTopics /
                        totalTopics
                    ) * 100
                );

        } else {

            /*
              Since progress documents represent
              completed/attempted topics, this
              fallback avoids falsely showing 100%.
            */

            percent =
                completedTopics > 0
                    ? Math.min(
                        100,
                        completedTopics
                    )
                    : 0;
        }

    }


    /*
      Latest attempt information
    */

    if (latest) {

        if (
            !overallProgress.lastCourseId
        ) {

            overallProgress.lastCourseId =
                latest.courseId || "";

        }


        if (
            !overallProgress.lastChapterId
        ) {

            overallProgress.lastChapterId =
                latest.chapterId || "";

        }


        if (
            !overallProgress.lastTopicId
        ) {

            overallProgress.lastTopicId =
                latest.topicId || "";

        }


        if (
            !overallProgress.lastQuizId
        ) {

            overallProgress.lastQuizId =
                latest.quizId || "";

        }


        if (
            !overallProgress.lastScore &&
            latest.lastScore !== undefined
        ) {

            overallProgress.lastScore =
                Number(
                    latest.lastScore || 0
                );

        }


        if (
            !overallProgress.lastAccuracy &&
            latest.lastAccuracy !== undefined
        ) {

            overallProgress.lastAccuracy =
                Number(
                    latest.lastAccuracy || 0
                );

        }

    }


    overallProgress.bestScore =
        bestScore;


    overallProgress.bestAccuracy =
        bestAccuracy;


    if (
        !Number.isFinite(
            Number(
                overallProgress.percent
            )
        ) ||
        Number(
            overallProgress.percent
        ) <= 0
    ) {

        overallProgress.percent =
            percent;

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
// LOAD PURCHASES
// ==========================================================

async function loadPurchases(db) {

    coursePurchases = {};


    if (!currentUser) {

        return;
    }


    try {

        /*
          Expected structure:

          purchases/{userId}

          {
              courseId: true
          }
        */

        const purchaseRef =
            db
                .collection("purchases")
                .doc(currentUser.uid);


        const snap =
            await purchaseRef.get();


        if (snap.exists) {

            coursePurchases =
                snap.data() || {};

        }


    } catch (error) {

        console.warn(
            "Purchase data unavailable:",
            error
        );


        coursePurchases = {};

    }

}


// ==========================================================
// IS COURSE PURCHASED
// ==========================================================

function isCoursePurchased(courseId) {

    if (!courseId) {

        return false;
    }


    return (
        coursePurchases[courseId] === true
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

      Keep original visible behaviour.
    */

    setText(
        "courseCount",
        courses.length +
        (
            courses.length === 1
                ? " Course"
                : " Courses"
        )
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
// CONTINUE LEARNING
// ==========================================================

function continueLearning() {

    continuePractice();

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


            const purchased =
                isCoursePurchased(
                    course.id
                );


            /*
              Course button
            */

            const buttonText =
                purchased
                    ? "Open Course"
                    : (
                        price
                            ? "View Course"
                            : "Open Course"
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

                <button
                    type="button"
                    class="course-button"
                >
                    ${buttonText}
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
// TOPIC PRACTICE
// ==========================================================

function openTopicPractice() {

    const courseId =
        getActiveCourse();


    if (courseId) {

        window.location.href =
            "course.html" +
            "?courseId=" +
            encodeURIComponent(
                courseId
            );

        return;
    }


    scrollToCourses();

}


// ==========================================================
// CHAPTER PRACTICE
// ==========================================================

function openChapterPractice() {

    const courseId =
        getActiveCourse();


    if (courseId) {

        window.location.href =
            "course.html" +
            "?courseId=" +
            encodeURIComponent(
                courseId
            ) +
            "&practice=chapter";

        return;
    }


    scrollToCourses();

}


// ==========================================================
// NCERT
// ==========================================================

function openNCERT() {

    const courseId =
        getActiveCourse();


    if (courseId) {

        window.location.href =
            "course.html" +
            "?courseId=" +
            encodeURIComponent(
                courseId
            ) +
            "&section=ncert";

        return;
    }


    scrollToCourses();

}


// ==========================================================
// VIDEOS
// ==========================================================

function openVideos() {

    const courseId =
        getActiveCourse();


    if (courseId) {

        window.location.href =
            "course.html" +
            "?courseId=" +
            encodeURIComponent(
                courseId
            ) +
            "&section=videos";

        return;
    }


    scrollToCourses();

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
        )
    );

}


// ==========================================================
// HOME
// ==========================================================

function goHome() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ==========================================================
// PROFILE
// ==========================================================

function openProfile() {

    /*
      If profile.html exists, this will open it.
      Otherwise student.html is used as fallback.
    */

    window.location.href =
        "profile.html";

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


    const proceed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!proceed) {

        return;
    }


    firebase.auth()
        .signOut()
        .then(
            function () {

                localStorage.removeItem(
                    "activeCourse"
                );

                localStorage.removeItem(
                    "activeChapter"
                );

                localStorage.removeItem(
                    "activeTopic"
                );

                localStorage.removeItem(
                    "activeQuiz"
                );


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
                    "Logout করতে সমস্যা হয়েছে।"
                );

            }
        );

}


// ==========================================================
// SCROLL TO COURSES
// ==========================================================

function scrollToCourses() {

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

            </div>

        `;

    }

}


// ==========================================================
// FIRESTORE TIMESTAMP VALUE
// ==========================================================

function getTimeValue(value) {

    if (!value) {

        return 0;
    }


    /*
      Firestore Timestamp
    */

    if (
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();

    }


    /*
      JavaScript Date
    */

    if (
        value instanceof Date
    ) {

        return value.getTime();

    }


    /*
      Number
    */

    if (
        typeof value === "number"
    ) {

        return value;
    }


    /*
      String date
    */

    const parsed =
        Date.parse(
            value
        );


    return Number.isFinite(parsed)
        ? parsed
        : 0;

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
