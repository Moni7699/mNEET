// ==========================================
// mNEET - Student Dashboard
// ==========================================


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let currentCourseId = null;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    auth.onAuthStateChanged(function (user) {

        // --------------------------------------
        // User NOT logged in
        // --------------------------------------

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        // --------------------------------------
        // User logged in
        // --------------------------------------

        currentUser = user;


        // Load dashboard

        loadStudentProfile();

        loadCourses();

        loadProgress();

    });

});


// ==========================================
// LOAD STUDENT PROFILE
// ==========================================

function loadStudentProfile() {

    if (!currentUser) {

        return;

    }


    db.collection("users")
        .doc(currentUser.uid)
        .get()

        .then(function (doc) {

            if (doc.exists) {

                const data =
                    doc.data();


                const name =
                    data.name ||
                    "Student";


                const welcome =
                    document.getElementById(
                        "welcomeText"
                    );


                if (welcome) {

                    welcome.textContent =
                        "Welcome, " + name;

                }

            }

        })

        .catch(function (error) {

            console.error(
                "Profile loading error:",
                error
            );

        });

}


// ==========================================
// LOAD COURSES
// ==========================================

function loadCourses() {

    const courseList =
        document.getElementById(
            "courseList"
        );


    if (!courseList) {

        return;

    }


    courseList.innerHTML = `
        <div class="course-loading">
            Loading courses...
        </div>
    `;


    db.collection("courses")
        .get()

        .then(function (snapshot) {

            courseList.innerHTML = "";


            // No courses

            if (snapshot.empty) {

                courseList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            📚
                        </div>

                        <h3>
                            No courses available
                        </h3>

                        <p>
                            Courses will appear here
                            when they are published.
                        </p>
                    </div>
                `;

                updateCourseCount(0);

                return;

            }


            let totalCourses = 0;


            snapshot.forEach(function (doc) {

                const course =
                    doc.data();


                // ----------------------------------
                // Only published courses
                // ----------------------------------

                if (
                    course.published === false
                ) {

                    return;

                }


                totalCourses++;


                createCourseCard(
                    doc.id,
                    course,
                    courseList
                );

            });


            updateCourseCount(
                totalCourses
            );


            if (totalCourses === 0) {

                courseList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            📚
                        </div>

                        <h3>
                            No published courses
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
                "Course loading error:",
                error
            );


            courseList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load courses
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
// CREATE COURSE CARD
// ==========================================

function createCourseCard(
    courseId,
    course,
    container
) {


    const name =
        course.name ||
        course.title ||
        "Biology Course";


    const description =
        course.description ||
        "NEET Biology preparation course.";


    const price =
        course.price !== undefined
            ? course.price
            : 0;


    const image =
        course.image ||
        "assets/logo.png";


    const card =
        document.createElement("div");


    card.className =
        "course-card";


    card.innerHTML = `

        <div class="course-image">

            <img
                src="${image}"
                alt="${escapeHTML(name)}"
                onerror="
                    this.style.display='none';
                "
            >

        </div>


        <div class="course-content">

            <div class="course-badge">
                NEET BIOLOGY
            </div>


            <h3 class="course-title">

                ${escapeHTML(name)}

            </h3>


            <p class="course-description">

                ${escapeHTML(description)}

            </p>


            <div class="course-bottom">

                <div class="course-price">

                    ${
                        price > 0
                            ? "₹" + price
                            : "Free"
                    }

                </div>


                <button
                    class="course-button"
                    onclick="
                        openCourse('${courseId}')
                    "
                >

                    Open

                </button>

            </div>

        </div>

    `;


    container.appendChild(card);


    // Check purchase

    checkPurchase(
        courseId,
        card
    );

}


// ==========================================
// CHECK COURSE PURCHASE
// ==========================================

function checkPurchase(
    courseId,
    card
) {

    if (!currentUser) {

        return;

    }


    db.collection("purchases")
        .doc(currentUser.uid)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                return;

            }


            const purchases =
                doc.data();


            if (
                purchases[courseId] === true
            ) {

                card.classList.add(
                    "purchased"
                );


                const badge =
                    card.querySelector(
                        ".course-badge"
                    );


                if (badge) {

                    badge.textContent =
                        "PURCHASED";

                }

            }

        })

        .catch(function (error) {

            console.error(
                "Purchase check error:",
                error
            );

        });

}


// ==========================================
// OPEN COURSE
// ==========================================

function openCourse(courseId) {

    if (!courseId) {

        return;

    }


    currentCourseId =
        courseId;


    localStorage.setItem(
        "activeCourse",
        courseId
    );


    window.location.href =
        "course.html";

}


// ==========================================
// LOAD PROGRESS
// ==========================================

function loadProgress() {

    if (!currentUser) {

        return;

    }


    db.collection("users")
        .doc(currentUser.uid)
        .collection("progress")
        .doc("overall")
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                setProgress(0);

                setText(
                    "lastScore",
                    "--"
                );

                setText(
                    "accuracy",
                    "--"
                );

                setText(
                    "bestScore",
                    "--"
                );

                return;

            }


            const data =
                doc.data();


            const progress =
                Number(
                    data.percent || 0
                );


            const lastScore =
                data.lastScore !== undefined
                    ? data.lastScore
                    : "--";


            const accuracy =
                data.accuracy !== undefined
                    ? data.accuracy + "%"
                    : "--";


            const bestScore =
                data.bestScore !== undefined
                    ? data.bestScore
                    : "--";


            setProgress(
                progress
            );


            setText(
                "lastScore",
                lastScore
            );


            setText(
                "accuracy",
                accuracy
            );


            setText(
                "bestScore",
                bestScore
            );


            if (data.lastCourseId) {

                currentCourseId =
                    data.lastCourseId;

            }


            if (data.lastTopicName) {

                setText(
                    "continueTitle",
                    data.lastTopicName
                );

            }


            if (data.lastActivity) {

                setText(
                    "continueText",
                    data.lastActivity
                );

            }

        })

        .catch(function (error) {

            console.error(
                "Progress loading error:",
                error
            );

        });

}


// ==========================================
// SET PROGRESS
// ==========================================

function setProgress(percent) {

    let value =
        Number(percent);


    // Keep between 0 and 100

    if (value < 0) {

        value = 0;

    }


    if (value > 100) {

        value = 100;

    }


    value =
        Math.round(value);


    setText(
        "progressPercent",
        value + "%"
    );


    setText(
        "progressCircleText",
        value + "%"
    );


    const bar =
        document.getElementById(
            "progressBar"
        );


    if (bar) {

        bar.style.width =
            value + "%";

    }

}


// ==========================================
// CONTINUE LEARNING
// ==========================================

function continueLearning() {

    const savedCourse =
        localStorage.getItem(
            "activeCourse"
        );


    const courseId =
        currentCourseId ||
        savedCourse;


    if (courseId) {

        localStorage.setItem(
            "activeCourse",
            courseId
        );


        window.location.href =
            "course.html";


        return;

    }


    // No course selected

    const courseList =
        document.getElementById(
            "courseList"
        );


    if (courseList) {

        courseList.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ==========================================
// QUICK PRACTICE
// ==========================================

function openTopicPractice() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showDashboardMessage(
            "Please open a course first."
        );

        return;

    }


    localStorage.setItem(
        "practiceMode",
        "topic"
    );


    window.location.href =
        "course.html";

}


// ==========================================
// CHAPTER PRACTICE
// ==========================================

function openChapterPractice() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showDashboardMessage(
            "Please open a course first."
        );

        return;

    }


    localStorage.setItem(
        "practiceMode",
        "chapter"
    );


    window.location.href =
        "course.html";

}


// ==========================================
// NCERT
// ==========================================

function openNCERT() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showDashboardMessage(
            "Please open a course first."
        );

        return;

    }


    window.location.href =
        "ncert.html";

}


// ==========================================
// VIDEOS
// ==========================================

function openVideos() {

    const courseId =
        getActiveCourse();


    if (!courseId) {

        showDashboardMessage(
            "Please open a course first."
        );

        return;

    }


    window.location.href =
        "video.html";

}


// ==========================================
// PROFILE
// ==========================================

function openProfile() {

    showDashboardMessage(
        "Profile section will be added soon."
    );

}


// ==========================================
// HOME
// ==========================================

function goHome() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ==========================================
// ACTIVE COURSE
// ==========================================

function getActiveCourse() {

    return (
        currentCourseId ||
        localStorage.getItem(
            "activeCourse"
        )
    );

}


// ==========================================
// COURSE COUNT
// ==========================================

function updateCourseCount(count) {

    const element =
        document.getElementById(
            "courseCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        count + (
            count === 1
                ? " Course"
                : " Courses"
        );

}


// ==========================================
// SET TEXT
// ==========================================

function setText(
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
// DASHBOARD MESSAGE
// ==========================================

function showDashboardMessage(
    message
) {

    alert(message);

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
