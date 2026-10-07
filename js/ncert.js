// ==========================================================
// mNEET - NCERT READING
// Fresh Complete Firebase Firestore Version
// Chapter-wise NCERT + Chapter-wise PYQ
// ==========================================================

"use strict";


/* ==========================================================
   GLOBAL STATE
   ========================================================== */

let currentUser = null;

let db = null;

let chapters = [];

let filteredChapters = [];

let currentCourseId = "";

let currentCourse = {};



/* ==========================================================
   PAGE START
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        waitForFirebase();

        setupSearch();

    }
);



/* ==========================================================
   WAIT FOR FIREBASE
   ========================================================== */

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

            initializeNCERT();

        }
    );

}



/* ==========================================================
   INITIALIZE
   ========================================================== */

async function initializeNCERT() {

    db = getFirestore();


    if (!db) {

        showError(
            "Firebase Firestore load হয়নি।<br><br>" +
            "Please check js/firebase.js"
        );

        return;
    }


    const ids =
        getIds();


    currentCourseId =
        ids.courseId;


    localStorage.setItem(
        "activeCourse",
        currentCourseId
    );


    try {

        await loadCourse();

        await loadChapters();

        renderChapters();

    } catch (error) {

        console.error(
            "NCERT loading error:",
            error
        );


        showError(
            "NCERT page load করতে সমস্যা হয়েছে।<br><br>" +
            escapeHTML(
                error.message ||
                "Unknown error"
            )
        );

    }

}



/* ==========================================================
   FIRESTORE
   ========================================================== */

function getFirestore() {

    try {

        if (
            typeof firebase ===
            "undefined"
        ) {

            return null;
        }


        if (
            !firebase.apps ||
            !firebase.apps.length
        ) {

            return null;
        }


        return firebase.firestore();

    } catch (error) {

        console.error(
            "Firestore error:",
            error
        );

        return null;
    }

}



/* ==========================================================
   GET URL / STORAGE IDS
   ========================================================== */

function getIds() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const courseId =
        cleanValue(
            params.get("courseId") ||
            params.get("course") ||
            localStorage.getItem(
                "activeCourse"
            ) ||
            sessionStorage.getItem(
                "activeCourse"
            )
        );


    return {

        courseId:
            courseId

    };

}



/* ==========================================================
   LOAD COURSE
   ========================================================== */

async function loadCourse() {

    if (!currentCourseId) {

        currentCourse = {};

        updateCourseInfo();

        return;
    }


    try {

        const courseRef =
            db
                .collection("courses")
                .doc(currentCourseId);


        const snap =
            await courseRef.get();


        if (snap.exists) {

            currentCourse =
                snap.data() || {};

        } else {

            currentCourse = {};

        }


        updateCourseInfo();

    } catch (error) {

        console.warn(
            "Course information error:",
            error
        );


        currentCourse = {};

        updateCourseInfo();

    }

}



/* ==========================================================
   COURSE INFO
   ========================================================== */

function updateCourseInfo() {

    const element =
        document.getElementById(
            "courseInfo"
        );


    if (!element) {
        return;
    }


    const title =
        currentCourse.name ||
        currentCourse.title ||
        "NEET Biology";


    const description =
        currentCourse.description ||
        "Chapter-wise NCERT Biology reading";


    element.innerHTML = `

        <div class="course-name">

            ${escapeHTML(title)}

        </div>

        <div class="course-path">

            ${escapeHTML(description)}

        </div>

    `;

}



/* ==========================================================
   LOAD CHAPTERS
   ========================================================== */

async function loadChapters() {

    chapters = [];


    if (!currentCourseId) {

        showNoCourse();

        return;
    }


    const chapterRef =
        db
            .collection("courses")
            .doc(currentCourseId)
            .collection("chapters");


    let snap;


    try {

        snap =
            await chapterRef
                .orderBy(
                    "order",
                    "asc"
                )
                .get();

    } catch (error) {

        console.warn(
            "Chapter order query failed:",
            error
        );


        snap =
            await chapterRef.get();

    }


    snap.forEach(
        function (doc) {

            const data =
                doc.data() || {};


            if (
                data.published !==
                    undefined &&
                data.published === false
            ) {

                return;
            }


            chapters.push({

                id:
                    doc.id,

                ...data

            });

        }
    );


    sortChapters();


    filteredChapters =
        chapters.slice();


    updateChapterCount();

}



/* ==========================================================
   SORT CHAPTERS
   ========================================================== */

function sortChapters() {

    chapters.sort(
        function (a, b) {

            const aOrder =
                Number(
                    a.order ||
                    a.chapterOrder ||
                    a.number ||
                    9999
                );


            const bOrder =
                Number(
                    b.order ||
                    b.chapterOrder ||
                    b.number ||
                    9999
                );


            return (
                aOrder -
                bOrder
            );

        }
    );

}



/* ==========================================================
   RENDER CHAPTERS
   ========================================================== */

function renderChapters() {

    const container =
        document.getElementById(
            "chapterList"
        );


    if (!container) {
        return;
    }


    if (!filteredChapters.length) {

        container.innerHTML = `

            <div class="empty-box">

                📖

                <br><br>

                No NCERT chapters available.

            </div>

        `;

        updateChapterCount();

        return;
    }


    container.innerHTML = "";


    filteredChapters.forEach(
        function (chapter, index) {

            const card =
                createChapterCard(
                    chapter,
                    index
                );


            container.appendChild(
                card
            );

        }
    );


    updateChapterCount();

}



/* ==========================================================
   CREATE CHAPTER CARD
   ========================================================== */

function createChapterCard(
    chapter,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "chapter-card";


    const number =
        Number(
            chapter.number ||
            chapter.chapterNumber ||
            chapter.order ||
            index + 1
        );


    const title =
        chapter.name ||
        chapter.title ||
        chapter.chapterName ||
        "Biology Chapter";


    const ncertUrl =
        getNCERTUrl(
            chapter
        );


    const pyqUrl =
        getPYQUrl(
            chapter
        );


    const topicCount =
        chapter.topicCount ||
        chapter.topicsCount ||
        "";


    card.innerHTML = `

        <div class="chapter-top">

            <div class="chapter-number">

                ${number}

            </div>


            <div>

                <div class="chapter-name">

                    ${escapeHTML(title)}

                </div>


                <div class="chapter-meta">

                    ${
                        topicCount
                            ? escapeHTML(
                                String(
                                    topicCount
                                )
                              ) +
                              " Topics"
                            : "NCERT + PYQ"
                    }

                </div>

            </div>

        </div>


        <div class="chapter-buttons">

            <button
                type="button"
                class="ncert-button"
                data-action="ncert"
            >
                📖 NCERT
            </button>


            <button
                type="button"
                class="ncert-button pyq-button"
                data-action="pyq"
            >
                📝 PYQ
            </button>

        </div>

    `;


    const ncertButton =
        card.querySelector(
            '[data-action="ncert"]'
        );


    const pyqButton =
        card.querySelector(
            '[data-action="pyq"]'
        );


    ncertButton.addEventListener(
        "click",
        function () {

            openPDF(
                ncertUrl,
                "NCERT PDF"
            );

        }
    );


    pyqButton.addEventListener(
        "click",
        function () {

            openPDF(
                pyqUrl,
                "PYQ PDF"
            );

        }
    );


    /*
      If PDF is not available,
      button stays usable and gives
      a clear message instead of
      breaking the page.
    */


    return card;

}



/* ==========================================================
   NCERT URL
   ========================================================== */

function getNCERTUrl(chapter) {

    return cleanValue(

        chapter.ncertPdfUrl ||

        chapter.ncertPDFUrl ||

        chapter.ncertUrl ||

        chapter.ncertURL ||

        chapter.ncertPdf ||

        chapter.ncertPDF ||

        chapter.pdfUrl ||

        chapter.pdfURL ||

        chapter.bookPdfUrl ||

        chapter.bookPDFUrl ||

        ""

    );

}



/* ==========================================================
   PYQ URL
   ========================================================== */

function getPYQUrl(chapter) {

    return cleanValue(

        chapter.pyqPdfUrl ||

        chapter.pyqPDFUrl ||

        chapter.pyqUrl ||

        chapter.pyqURL ||

        chapter.pyqPdf ||

        chapter.pyqPDF ||

        chapter.previousYearPdfUrl ||

        chapter.previousYearPDFUrl ||

        ""

    );

}



/* ==========================================================
   OPEN PDF
   ========================================================== */

function openPDF(
    url,
    label
) {

    if (!url) {

        alert(
            label +
            " এই chapter-এর জন্য এখনো upload করা হয়নি."
        );

        return;
    }


    /*
      Save last opened PDF
    */

    localStorage.setItem(
        "lastNCERTPdf",
        url
    );


    /*
      Open PDF
    */

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}



/* ==========================================================
   SEARCH
   ========================================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "chapterSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            const value =
                String(
                    search.value || ""
                )
                .trim()
                .toLowerCase();


            if (!value) {

                filteredChapters =
                    chapters.slice();

            } else {

                filteredChapters =
                    chapters.filter(
                        function (chapter) {

                            const title =
                                chapter.name ||
                                chapter.title ||
                                chapter.chapterName ||
                                "";


                            return String(
                                title
                            )
                            .toLowerCase()
                            .includes(value);

                        }
                    );

            }


            renderChapters();

        }
    );

}



/* ==========================================================
   CHAPTER COUNT
   ========================================================== */

function updateChapterCount() {

    const element =
        document.getElementById(
            "chapterCount"
        );


    if (!element) {
        return;
    }


    const count =
        filteredChapters.length;


    element.textContent =
        count +
        (
            count === 1
                ? " Chapter"
                : " Chapters"
        );

}



/* ==========================================================
   NO COURSE
   ========================================================== */

function showNoCourse() {

    const container =
        document.getElementById(
            "chapterList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-box">

            📚

            <br><br>

            Course select করা হয়নি।

            <br><br>

            Dashboard থেকে একটি course
            select করুন।

        </div>

    `;

}



/* ==========================================================
   ERROR
   ========================================================== */

function showError(message) {

    const container =
        document.getElementById(
            "chapterList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="error-box">

            ⚠️

            <br><br>

            ${message}

            <br><br>

            <button
                type="button"
                onclick="location.reload()"
                style="
                    border:0;
                    border-radius:10px;
                    padding:11px 17px;
                    background:#1b5e20;
                    color:#fff;
                    font-weight:900;
                "
            >
                Retry
            </button>

        </div>

    `;

}



/* ==========================================================
   NAVIGATION
   ========================================================== */

function goBack() {

    window.history.back();

}


function goHome() {

    window.location.href =
        "student.html";

}


function goTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


function openPractice() {

    const courseId =
        currentCourseId ||
        localStorage.getItem(
            "activeCourse"
        ) ||
        "";


    if (!courseId) {

        window.location.href =
            "student.html";

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


function openProfile() {

    /*
      Profile page না থাকলেও
      dashboard-এ ফেরত যাবে।
    */

    window.location.href =
        "student.html";

}



/* ==========================================================
   HELPERS
   ========================================================== */

function cleanValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value).trim();

}



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
