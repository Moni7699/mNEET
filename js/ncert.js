// ==========================================================
// mNEET - NCERT READING SYSTEM
// Firebase Firestore Compatible
// Chapter-wise NCERT + Chapter-wise PYQ PDF
// ==========================================================

"use strict";


/* ==========================================================
   GLOBAL STATE
   ========================================================== */

let currentUser = null;

let db = null;

let currentCourseId = "";

let currentCourse = {};

let chapters = [];

let filteredChapters = [];

let currentReaderUrl = "";

let currentReaderPyqUrl = "";



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


            try {

                db =
                    firebase.firestore();

            } catch (error) {

                console.error(
                    "Firestore error:",
                    error
                );

                showMessage(
                    "Firebase Firestore load করতে সমস্যা হয়েছে."
                );

                return;
            }


            loadNCERT();

        }
    );

}



/* ==========================================================
   GET URL PARAMETER
   ========================================================== */

function getParam(name) {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        return (
            params.get(name) || ""
        ).trim();

    } catch (error) {

        return "";

    }

}



/* ==========================================================
   GET COURSE ID
   ========================================================== */

function getCourseId() {

    const fromUrl =
        getParam("courseId") ||
        getParam("course");


    if (fromUrl) {

        return fromUrl;

    }


    const fromStorage =
        localStorage.getItem(
            "activeCourse"
        );


    return (
        fromStorage || ""
    ).trim();

}



/* ==========================================================
   LOAD NCERT
   ========================================================== */

async function loadNCERT() {

    currentCourseId =
        getCourseId();


    if (!currentCourseId) {

        setText(
            "courseTitle",
            "No Course Selected"
        );


        showMessage(
            "Please select a course first."
        );


        return;
    }


    localStorage.setItem(
        "activeCourse",
        currentCourseId
    );


    try {

        showLoading();


        await loadCourse();


        await loadChapters();


        filteredChapters =
            chapters.slice();


        renderChapters();


    } catch (error) {

        console.error(
            "NCERT loading error:",
            error
        );


        showMessage(
            "NCERT load করতে সমস্যা হয়েছে.<br><br>" +
            escapeHTML(
                error.message ||
                "Unknown error"
            )
        );

    }

}



/* ==========================================================
   LOAD COURSE
   ========================================================== */

async function loadCourse() {

    const courseRef =
        db
            .collection("courses")
            .doc(currentCourseId);


    const courseSnap =
        await courseRef.get();


    if (!courseSnap.exists) {

        throw new Error(
            "Course not found."
        );

    }


    currentCourse =
        courseSnap.data() || {};


    const title =
        currentCourse.name ||
        currentCourse.title ||
        "NEET Biology";


    const description =
        currentCourse.description ||
        "NCERT Biology Reading";


    setText(
        "courseTitle",
        title
    );


    setText(
        "courseDescription",
        description
    );

}



/* ==========================================================
   LOAD CHAPTERS
   ========================================================== */

async function loadChapters() {

    const chapterRef =
        db
            .collection("courses")
            .doc(currentCourseId)
            .collection("chapters");


    const snapshot =
        await chapterRef.get();


    chapters = [];


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


            chapters.push({

                id:
                    doc.id,

                ...data

            });

        }
    );


    /*
      Chapter order
    */

    chapters.sort(
        function (a, b) {

            const aOrder =
                Number(
                    a.order ??
                    a.chapterNumber ??
                    9999
                );


            const bOrder =
                Number(
                    b.order ??
                    b.chapterNumber ??
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


    const count =
        document.getElementById(
            "chapterCount"
        );


    if (!container) {

        return;

    }


    if (count) {

        count.textContent =
            filteredChapters.length +
            (
                filteredChapters.length === 1
                    ? " Chapter"
                    : " Chapters"
            );

    }


    if (!filteredChapters.length) {

        container.innerHTML = `

            <div class="course-loading">

                No NCERT chapters found.

            </div>

        `;


        hideMessage();

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


    hideMessage();

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
            "div"
        );


    card.className =
        "course-card";


    const chapterNumber =
        Number(
            chapter.chapterNumber ||
            chapter.chapterNo ||
            chapter.order ||
            index + 1
        );


    const title =
        chapter.name ||
        chapter.title ||
        chapter.chapterName ||
        (
            "Chapter " +
            chapterNumber
        );


    const description =
        chapter.description ||
        "Read NCERT Biology chapter";


    const ncertUrl =
        getNCERTUrl(
            chapter
        );


    const pyqUrl =
        getPYQUrl(
            chapter
        );


    const completed =
        isChapterRead(
            chapter.id
        );


    card.innerHTML = `

        <div class="course-badge">
            CHAPTER ${escapeHTML(
                String(chapterNumber)
            )}
        </div>


        <div class="course-title">
            ${escapeHTML(title)}
        </div>


        <div class="course-description">
            ${escapeHTML(description)}
        </div>


        <div
            style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
                margin-top:12px;
            "
        >

            ${
                ncertUrl
                    ? `
                        <button
                            type="button"
                            class="course-button ncert-read-button"
                            style="
                                flex:1;
                                min-width:130px;
                            "
                        >
                            📖 Read NCERT
                        </button>
                      `
                    : `
                        <button
                            type="button"
                            class="course-button"
                            disabled
                            style="
                                flex:1;
                                min-width:130px;
                                opacity:.55;
                                cursor:not-allowed;
                            "
                        >
                            PDF Unavailable
                        </button>
                      `
            }


            ${
                pyqUrl
                    ? `
                        <button
                            type="button"
                            class="ncert-pyq-button"
                            style="
                                flex:1;
                                min-width:130px;
                                padding:12px 10px;
                                border:0;
                                border-radius:10px;
                                background:#1565c0;
                                color:#fff;
                                font-weight:800;
                                cursor:pointer;
                            "
                        >
                            📚 PYQ PDF
                        </button>
                      `
                    : ""
            }

        </div>


        ${
            completed
                ? `
                    <div
                        style="
                            margin-top:12px;
                            color:#2e7d32;
                            font-size:13px;
                            font-weight:800;
                        "
                    >
                        ✓ Reading Opened
                    </div>
                  `
                : ""
        }

    `;


    /*
      NCERT button
    */

    if (ncertUrl) {

        const button =
            card.querySelector(
                ".ncert-read-button"
            );


        if (button) {

            button.addEventListener(
                "click",
                function () {

                    openReader(
                        title,
                        ncertUrl,
                        pyqUrl,
                        chapter.id
                    );

                }
            );

        }

    }


    /*
      PYQ button
    */

    if (pyqUrl) {

        const pyqButton =
            card.querySelector(
                ".ncert-pyq-button"
            );


        if (pyqButton) {

            pyqButton.addEventListener(
                "click",
                function () {

                    openPDFInNewTab(
                        pyqUrl
                    );

                }
            );

        }

    }


    return card;

}



/* ==========================================================
   GET NCERT PDF URL
   ========================================================== */

function getNCERTUrl(
    chapter
) {

    const value =

        chapter.ncertPdfUrl ||

        chapter.ncertPDFUrl ||

        chapter.ncertPdfURL ||

        chapter.ncertPDF ||

        chapter.ncertPdf ||

        chapter.ncertPDFUrl ||

        chapter.ncertBookUrl ||

        chapter.ncertBook ||

        chapter.pdfUrl ||

        chapter.pdfURL ||

        chapter.pdf ||

        chapter.bookPdfUrl ||

        chapter.bookPdf ||

        "";


    return cleanUrl(
        value
    );

}



/* ==========================================================
   GET PYQ PDF URL
   ========================================================== */

function getPYQUrl(
    chapter
) {

    const value =

        chapter.pyqPdfUrl ||

        chapter.pyqPDFUrl ||

        chapter.pyqPdf ||

        chapter.pyqPDF ||

        chapter.pyqUrl ||

        chapter.pyqURL ||

        chapter.chapterPyqPdf ||

        chapter.chapterPYQPdf ||

        chapter.pyq ||

        "";


    return cleanUrl(
        value
    );

}



/* ==========================================================
   CLEAN URL
   ========================================================== */

function cleanUrl(value) {

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
   OPEN NCERT READER
   ========================================================== */

function openReader(
    title,
    ncertUrl,
    pyqUrl,
    chapterId
) {

    if (!ncertUrl) {

        return;

    }


    currentReaderUrl =
        ncertUrl;


    currentReaderPyqUrl =
        pyqUrl || "";


    const chapterSection =
        document.getElementById(
            "chapterSection"
        );


    const readerSection =
        document.getElementById(
            "readerSection"
        );


    const viewer =
        document.getElementById(
            "pdfViewer"
        );


    const readerTitle =
        document.getElementById(
            "readerTitle"
        );


    const pyqArea =
        document.getElementById(
            "readerPyqArea"
        );


    const pyqButton =
        document.getElementById(
            "readerPyqButton"
        );


    if (
        !chapterSection ||
        !readerSection ||
        !viewer
    ) {

        openPDFInNewTab(
            ncertUrl
        );

        return;

    }


    if (readerTitle) {

        readerTitle.textContent =
            title;

    }


    /*
      Load PDF
    */

    viewer.src =
        ncertUrl;


    /*
      PYQ button
    */

    if (
        pyqArea &&
        pyqButton
    ) {

        if (pyqUrl) {

            pyqArea.style.display =
                "block";


            pyqButton.onclick =
                function () {

                    openPDFInNewTab(
                        pyqUrl
                    );

                };

        } else {

            pyqArea.style.display =
                "none";

        }

    }


    chapterSection.style.display =
        "none";


    readerSection.style.display =
        "block";


    /*
      Save reading state
    */

    if (chapterId) {

        localStorage.setItem(
            "lastNCERTChapter",
            chapterId
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    );

}



/* ==========================================================
   OPEN PDF IN NEW TAB
   ========================================================== */

function openPDFInNewTab(url) {

    if (!url) {

        return;

    }


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}



/* ==========================================================
   OPEN PDF BUTTON
   ========================================================== */

function setupReaderOpenButton() {

    const button =
        document.getElementById(
            "openPdfButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            if (currentReaderUrl) {

                openPDFInNewTab(
                    currentReaderUrl
                );

            }

        }
    );

}



/* ==========================================================
   CLOSE READER
   ========================================================== */

function closeReader() {

    const readerSection =
        document.getElementById(
            "readerSection"
        );


    const chapterSection =
        document.getElementById(
            "chapterSection"
        );


    const viewer =
        document.getElementById(
            "pdfViewer"
        );


    if (viewer) {

        viewer.src =
            "";

    }


    currentReaderUrl =
        "";


    currentReaderPyqUrl =
        "";


    if (readerSection) {

        readerSection.style.display =
            "none";

    }


    if (chapterSection) {

        chapterSection.style.display =
            "block";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

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

            const query =
                String(
                    search.value || ""
                )
                .trim()
                .toLowerCase();


            if (!query) {

                filteredChapters =
                    chapters.slice();

            } else {

                filteredChapters =
                    chapters.filter(
                        function (chapter) {

                            const text = (

                                chapter.name ||

                                chapter.title ||

                                chapter.chapterName ||

                                ""

                            ).toLowerCase();


                            return text.includes(
                                query
                            );

                        }
                    );

            }


            renderChapters();

        }
    );

}



/* ==========================================================
   CHAPTER READING STATE
   ========================================================== */

function isChapterRead(
    chapterId
) {

    if (!chapterId) {

        return false;

    }


    const key =
        "mneet_ncert_read_" +
        currentCourseId +
        "_" +
        chapterId;


    return (
        localStorage.getItem(
            key
        ) === "true"
    );

}



/* ==========================================================
   MARK CHAPTER READ
   ========================================================== */

function markChapterRead(
    chapterId
) {

    if (!chapterId) {

        return;

    }


    const key =
        "mneet_ncert_read_" +
        currentCourseId +
        "_" +
        chapterId;


    localStorage.setItem(
        key,
        "true"
    );

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

    if (currentCourseId) {

        window.location.href =
            "course.html" +
            "?courseId=" +
            encodeURIComponent(
                currentCourseId
            );

        return;

    }


    window.location.href =
        "student.html";

}



/* ==========================================================
   VIDEOS
   ========================================================== */

function openVideos() {

    const url =
        currentCourseId

            ? (
                "videos.html" +
                "?courseId=" +
                encodeURIComponent(
                    currentCourseId
                )
            )

            : "videos.html";


    window.location.href =
        url;

}



/* ==========================================================
   PROFILE
   ========================================================== */

function openProfile() {

    window.location.href =
        "profile.html";

}



/* ==========================================================
   BACK
   ========================================================== */

function goBack() {

    if (
        document.referrer &&
        document.referrer.indexOf(
            window.location.host
        ) !== -1
    ) {

        window.history.back();

        return;

    }


    window.location.href =
        "student.html";

}



/* ==========================================================
   LOADING
   ========================================================== */

function showLoading() {

    const container =
        document.getElementById(
            "chapterList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="course-loading">

            Loading NCERT chapters...

        </div>

    `;

}



/* ==========================================================
   MESSAGE
   ========================================================== */

function showMessage(
    message
) {

    const element =
        document.getElementById(
            "ncertMessage"
        );


    if (!element) {

        return;

    }


    element.innerHTML =
        message;


    element.style.display =
        "block";

}



/* ==========================================================
   HIDE MESSAGE
   ========================================================== */

function hideMessage() {

    const element =
        document.getElementById(
            "ncertMessage"
        );


    if (element) {

        element.style.display =
            "none";

    }

}



/* ==========================================================
   SAFE TEXT
   ========================================================== */

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



/* ==========================================================
   HTML ESCAPE
   ========================================================== */

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



/* ==========================================================
   INITIALIZE READER BUTTON
   ========================================================== */

setupReaderOpenButton();
