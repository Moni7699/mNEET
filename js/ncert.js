// ==========================================================
// mNEET - NCERT READING
// FINAL COMPLETE VERSION
// Firebase Auth + Firestore + Storage
// Chapter-wise NCERT + Chapter-wise PYQ
// ==========================================================

"use strict";


/* ==========================================================
   GLOBAL STATE
   ========================================================== */

let currentUser = null;

let db = null;

let storage = null;

let chapters = [];

let filteredChapters = [];

let currentCourseId = "";

let currentCourse = {};

let firebaseReady = false;

let searchReady = false;


/* ==========================================================
   PAGE START
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupSearch();

        waitForFirebase();

    }
);


/* ==========================================================
   WAIT FOR FIREBASE
   ========================================================== */

function waitForFirebase() {

    if (
        typeof firebase === "undefined"
    ) {

        setTimeout(
            waitForFirebase,
            300
        );

        return;
    }


    if (
        typeof firebase.auth !== "function"
    ) {

        setTimeout(
            waitForFirebase,
            300
        );

        return;
    }


    if (
        !firebase.apps ||
        !firebase.apps.length
    ) {

        setTimeout(
            waitForFirebase,
            300
        );

        return;
    }


    firebaseReady = true;


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

    try {

        db = getFirestore();

        storage = getStorage();


        if (!db) {

            showError(
                "Firebase Firestore পাওয়া যায়নি।",
                "js/firebase.js check করুন।"
            );

            return;
        }


        const ids = getIds();


        currentCourseId =
            ids.courseId;


        if (!currentCourseId) {

            showNoCourse();

            updateCourseInfo();

            return;
        }


        localStorage.setItem(
            "activeCourse",
            currentCourseId
        );


        await loadCourse();

        await loadChapters();

        renderChapters();


    } catch (error) {

        console.error(
            "NCERT initialize error:",
            error
        );


        showError(
            "NCERT page load করতে সমস্যা হয়েছে।",
            error.message ||
            "Unknown error"
        );

    }

}


/* ==========================================================
   FIRESTORE
   ========================================================== */

function getFirestore() {

    try {

        if (
            typeof firebase === "undefined"
        ) {

            return null;
        }


        if (
            !firebase.apps ||
            !firebase.apps.length
        ) {

            return null;
        }


        if (
            typeof firebase.firestore !==
            "function"
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
   FIREBASE STORAGE
   ========================================================== */

function getStorage() {

    try {

        if (
            typeof firebase === "undefined"
        ) {

            return null;
        }


        if (
            !firebase.apps ||
            !firebase.apps.length
        ) {

            return null;
        }


        if (
            typeof firebase.storage !==
            "function"
        ) {

            return null;
        }


        return firebase.storage();

    } catch (error) {

        console.warn(
            "Firebase Storage unavailable:",
            error
        );

        return null;
    }

}


/* ==========================================================
   GET COURSE ID
   ========================================================== */

function getIds() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const fromURL =
        params.get("courseId") ||
        params.get("course");


    const fromStorage =
        localStorage.getItem(
            "activeCourse"
        );


    const fromSession =
        sessionStorage.getItem(
            "activeCourse"
        );


    const courseId =
        cleanValue(
            fromURL ||
            fromStorage ||
            fromSession ||
            ""
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

    currentCourse = {};


    if (!currentCourseId) {

        updateCourseInfo();

        return;
    }


    try {

        const ref =
            db
                .collection("courses")
                .doc(currentCourseId);


        const snapshot =
            await ref.get();


        if (
            snapshot.exists
        ) {

            currentCourse =
                snapshot.data() || {};

        }


    } catch (error) {

        console.warn(
            "Course loading error:",
            error
        );

    }


    updateCourseInfo();

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

    filteredChapters = [];


    if (!currentCourseId) {

        showNoCourse();

        return;
    }


    const chapterRef =
        db
            .collection("courses")
            .doc(currentCourseId)
            .collection("chapters");


    let snapshot = null;


    /*
       প্রথমে order
    */

    try {

        snapshot =
            await chapterRef
                .orderBy(
                    "order",
                    "asc"
                )
                .get();

    } catch (error) {

        console.warn(
            "order query failed:",
            error
        );

    }


    /*
       দ্বিতীয় fallback
    */

    if (!snapshot) {

        try {

            snapshot =
                await chapterRef
                    .orderBy(
                        "chapterOrder",
                        "asc"
                    )
                    .get();

        } catch (error) {

            console.warn(
                "chapterOrder query failed:",
                error
            );

        }

    }


    /*
       শেষ fallback
    */

    if (!snapshot) {

        snapshot =
            await chapterRef.get();

    }


    if (!snapshot) {

        throw new Error(
            "Chapter data পাওয়া যায়নি।"
        );

    }


    snapshot.forEach(
        function (doc) {

            const data =
                doc.data() || {};


            /*
               unpublished chapter hide
            */

            if (
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
                getChapterNumber(
                    a,
                    999999
                );


            const bOrder =
                getChapterNumber(
                    b,
                    999999
                );


            if (
                aOrder !== bOrder
            ) {

                return (
                    aOrder -
                    bOrder
                );

            }


            const aTitle =
                getChapterTitle(a)
                .toLowerCase();


            const bTitle =
                getChapterTitle(b)
                .toLowerCase();


            return aTitle.localeCompare(
                bTitle
            );

        }
    );

}


/* ==========================================================
   GET CHAPTER NUMBER
   ========================================================== */

function getChapterNumber(
    chapter,
    fallback
) {

    if (!chapter) {

        return fallback;
    }


    const values = [

        chapter.number,

        chapter.chapterNumber,

        chapter.order,

        chapter.chapterOrder,

        chapter.position,

        chapter.index

    ];


    for (
        let i = 0;
        i < values.length;
        i++
    ) {

        const value =
            Number(values[i]);


        if (
            Number.isFinite(value)
        ) {

            return value;
        }

    }


    return fallback;

}


/* ==========================================================
   GET CHAPTER TITLE
   ========================================================== */

function getChapterTitle(chapter) {

    if (!chapter) {

        return "Biology Chapter";
    }


    return cleanValue(

        chapter.name ||

        chapter.title ||

        chapter.chapterName ||

        chapter.chapterTitle ||

        "Biology Chapter"

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


    if (
        !filteredChapters.length
    ) {

        if (
            chapters.length
        ) {

            showSearchEmpty();

        } else {

            showEmptyChapters();

        }


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
        getChapterNumber(
            chapter,
            index + 1
        );


    const title =
        getChapterTitle(
            chapter
        );


    const ncertValue =
        getNCERTValue(
            chapter
        );


    const pyqValue =
        getPYQValue(
            chapter
        );


    const topicCount =
        getTopicCount(
            chapter
        );


    const metaText =
        topicCount !== ""
            ? topicCount +
              " Topics"
            : "NCERT + PYQ";


    card.innerHTML = `

        <div class="chapter-top">

            <div class="chapter-number">

                ${escapeHTML(
                    String(number)
                )}

            </div>


            <div class="chapter-content">

                <div class="chapter-name">

                    ${escapeHTML(title)}

                </div>


                <div class="chapter-meta">

                    ${escapeHTML(
                        metaText
                    )}

                </div>

            </div>

        </div>


        <div class="chapter-buttons">

            <button
                type="button"
                class="pdf-button ncert-button"
                data-action="ncert"
            >
                📖 NCERT
            </button>


            <button
                type="button"
                class="pdf-button pyq-button"
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


    if (ncertButton) {

        ncertButton.addEventListener(
            "click",
            function () {

                openPDF(
                    ncertValue,
                    "NCERT PDF",
                    chapter
                );

            }
        );

    }


    if (pyqButton) {

        pyqButton.addEventListener(
            "click",
            function () {

                openPDF(
                    pyqValue,
                    "PYQ PDF",
                    chapter
                );

            }
        );

    }


    return card;

}


/* ==========================================================
   TOPIC COUNT
   ========================================================== */

function getTopicCount(chapter) {

    if (!chapter) {

        return "";
    }


    const value =
        chapter.topicCount ??
        chapter.topicsCount;


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";
    }


    const number =
        Number(value);


    if (
        Number.isFinite(number)
    ) {

        return String(number);
    }


    return cleanValue(value);

}


/* ==========================================================
   NCERT VALUE
   ========================================================== */

function getNCERTValue(chapter) {

    if (!chapter) {

        return "";
    }


    return cleanValue(

        chapter.ncertPdfUrl ||

        chapter.ncertPDFUrl ||

        chapter.ncertPdfURL ||

        chapter.ncertUrl ||

        chapter.ncertURL ||

        chapter.ncertPdf ||

        chapter.ncertPDF ||

        chapter.ncert ||

        chapter.ncertBookUrl ||

        chapter.ncertBookURL ||

        chapter.bookPdfUrl ||

        chapter.bookPDFUrl ||

        chapter.bookPdf ||

        chapter.bookPDF ||

        chapter.ncertStoragePath ||

        chapter.ncertPdfPath ||

        chapter.ncertPath ||

        chapter.ncertStorage ||

        ""

    );

}


/* ==========================================================
   PYQ VALUE
   ========================================================== */

function getPYQValue(chapter) {

    if (!chapter) {

        return "";
    }


    return cleanValue(

        chapter.pyqPdfUrl ||

        chapter.pyqPDFUrl ||

        chapter.pyqPdfURL ||

        chapter.pyqUrl ||

        chapter.pyqURL ||

        chapter.pyqPdf ||

        chapter.pyqPDF ||

        chapter.pyq ||

        chapter.previousYearPdfUrl ||

        chapter.previousYearPDFUrl ||

        chapter.previousYearPdf ||

        chapter.previousYearPDF ||

        chapter.pyqStoragePath ||

        chapter.pyqPdfPath ||

        chapter.pyqPath ||

        chapter.pyqStorage ||

        ""

    );

}


/* ==========================================================
   STORAGE PATH DETECTION
   ========================================================== */

function looksLikeStoragePath(value) {

    const text =
        cleanValue(value);


    if (!text) {

        return false;
    }


    /*
       Already URL
    */

    if (
        isWebURL(text) ||
        text.startsWith("blob:") ||
        text.startsWith("data:")
    ) {

        return false;
    }


    /*
       Firebase gs://
    */

    if (
        text.startsWith("gs://")
    ) {

        return true;
    }


    /*
       Common storage path
    */

    if (
        text.includes("/")
    ) {

        return true;
    }


    return false;

}


/* ==========================================================
   WEB URL CHECK
   ========================================================== */

function isWebURL(value) {

    const text =
        cleanValue(value);


    return (
        text.startsWith(
            "http://"
        ) ||
        text.startsWith(
            "https://"
        )
    );

}


/* ==========================================================
   RESOLVE PDF URL
   ========================================================== */

async function resolvePDFUrl(
    value
) {

    const clean =
        cleanValue(value);


    if (!clean) {

        return "";
    }


    /*
       Direct URL
    */

    if (
        isWebURL(clean) ||
        clean.startsWith("blob:") ||
        clean.startsWith("data:")
    ) {

        return clean;
    }


    /*
       No storage
    */

    if (!storage) {

        return "";
    }


    if (
        !looksLikeStoragePath(clean)
    ) {

        return "";
    }


    try {

        const reference =
            storage.ref(
                clean
            );


        const downloadURL =
            await reference.getDownloadURL();


        return cleanValue(
            downloadURL
        );

    } catch (error) {

        console.warn(
            "Storage URL resolve failed:",
            error
        );


        return "";
    }

}


/* ==========================================================
   OPEN PDF
   ========================================================== */

async function openPDF(
    value,
    label,
    chapter
) {

    let finalURL =
        cleanValue(value);


    /*
       Empty PDF
    */

    if (!finalURL) {

        showToast(
            label +
            " এই chapter-এর জন্য এখনো upload করা হয়নি।"
        );

        return;
    }


    /*
       Storage path হলে URL বানাবে
    */

    if (
        !isWebURL(finalURL) &&
        !finalURL.startsWith("blob:") &&
        !finalURL.startsWith("data:")
    ) {

        finalURL =
            await resolvePDFUrl(
                finalURL
            );

    }


    if (!finalURL) {

        showToast(
            label +
            " open করা যাচ্ছে না। PDF upload/path check করুন।"
        );

        return;
    }


    /*
       Save last opened information
    */

    localStorage.setItem(
        "lastNCERTPdf",
        finalURL
    );


    if (chapter) {

        localStorage.setItem(
            "lastNCERTChapter",
            cleanValue(
                chapter.id
            )
        );


        localStorage.setItem(
            "lastNCERTChapterTitle",
            getChapterTitle(
                chapter
            )
        );

    }


    if (currentCourseId) {

        localStorage.setItem(
            "lastNCERTCourse",
            currentCourseId
        );

    }


    /*
       Open PDF
    */

    const opened =
        window.open(
            finalURL,
            "_blank"
        );


    if (!opened) {

        showToast(
            "PDF open হয়নি। Browser popup permission allow করুন।"
        );

    }

}


/* ==========================================================
   SEARCH SETUP
   ========================================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "chapterSearch"
        );


    if (!search) {

        return;
    }


    if (searchReady) {

        return;
    }


    searchReady = true;


    search.addEventListener(
        "input",
        function () {

            const value =
                cleanValue(
                    search.value
                )
                .toLowerCase();


            if (!value) {

                filteredChapters =
                    chapters.slice();

            } else {

                filteredChapters =
                    chapters.filter(
                        function (chapter) {

                            const title =
                                getChapterTitle(
                                    chapter
                                );


                            const number =
                                getChapterNumber(
                                    chapter,
                                    ""
                                );


                            const combined =
                                title +
                                " " +
                                number;


                            return combined
                                .toLowerCase()
                                .includes(
                                    value
                                );

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
   EMPTY CHAPTERS
   ========================================================== */

function showEmptyChapters() {

    const container =
        document.getElementById(
            "chapterList"
        );


    if (!container) {

        return;
    }


    container.innerHTML = `

        <div class="state-box">

            <div class="state-icon">
                📚
            </div>

            <div class="state-title">
                No NCERT chapters available
            </div>

            <div class="state-text">
                এই course-এর জন্য এখনো কোনো
                chapter publish করা হয়নি।
            </div>

        </div>

    `;

}


/* ==========================================================
   SEARCH EMPTY
   ========================================================== */

function showSearchEmpty() {

    const container =
        document.getElementById(
            "chapterList"
        );


    if (!container) {

        return;
    }


    container.innerHTML = `

        <div class="state-box">

            <div class="state-icon">
                🔍
            </div>

            <div class="state-title">
                Chapter পাওয়া যায়নি
            </div>

            <div class="state-text">
                অন্য chapter name বা number দিয়ে
                search করুন।
            </div>

        </div>

    `;

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

        <div class="state-box">

            <div class="state-icon">
                📚
            </div>

            <div class="state-title">
                Course select করা হয়নি
            </div>

            <div class="state-text">
                Dashboard থেকে একটি course
                select করে আবার NCERT খুলুন।
            </div>

            <button
                type="button"
                class="retry-button"
                onclick="goHome()"
            >
                Go to Dashboard
            </button>

        </div>

    `;

}


/* ==========================================================
   ERROR
   ========================================================== */

function showError(
    title,
    detail
) {

    const container =
        document.getElementById(
            "chapterList"
        );


    if (!container) {

        return;
    }


    const safeTitle =
        escapeHTML(
            title ||
            "Something went wrong"
        );


    const safeDetail =
        escapeHTML(
            detail ||
            "Please try again."
        );


    container.innerHTML = `

        <div class="state-box">

            <div class="state-icon">
                ⚠️
            </div>

            <div class="state-title">
                ${safeTitle}
            </div>

            <div class="state-text">
                ${safeDetail}
            </div>

            <button
                type="button"
                class="retry-button"
                onclick="location.reload()"
            >
                Retry
            </button>

        </div>

    `;

}


/* ==========================================================
   TOAST
   ========================================================== */

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        alert(message);

        return;
    }


    toast.textContent =
        cleanValue(message);


    toast.classList.add(
        "show"
    );


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

    }


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* ==========================================================
   NAVIGATION
   ========================================================== */

function goBack() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

    } else {

        goHome();

    }

}


/* ==========================================================
   HOME
   ========================================================== */

function goHome() {

    window.location.href =
        "student.html";

}


/* ==========================================================
   PRACTICE
   ========================================================== */

function openPractice() {

    const courseId =
        currentCourseId ||
        localStorage.getItem(
            "activeCourse"
        ) ||
        "";


    if (!courseId) {

        goHome();

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


/* ==========================================================
   PROFILE
   ========================================================== */

function openProfile() {

    window.location.href =
        "profile.html";

}


/* ==========================================================
   NCERT
   ========================================================== */

function openNCERT() {

    const courseId =
        currentCourseId ||
        localStorage.getItem(
            "activeCourse"
        ) ||
        "";


    if (!courseId) {

        goHome();

        return;
    }


    window.location.href =
        "ncert.html" +
        "?courseId=" +
        encodeURIComponent(
            courseId
        );

}


/* ==========================================================
   TOP
   ========================================================== */

function goTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ==========================================================
   CLEAN VALUE
   ========================================================== */

function cleanValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(
        value
    ).trim();

}


/* ==========================================================
   HTML ESCAPE
   ========================================================== */

function escapeHTML(value) {

    return String(
        value
    )

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
