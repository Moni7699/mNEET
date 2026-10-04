// ==========================================
// mNEET - Notes
// ==========================================

let courseId = null;
let chapterId = null;
let topicId = null;


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


                courseId =
                    localStorage.getItem(
                        "notesCourse"
                    ) ||
                    localStorage.getItem(
                        "activeCourse"
                    );


                chapterId =
                    localStorage.getItem(
                        "notesChapter"
                    ) ||
                    localStorage.getItem(
                        "activeChapter"
                    );


                topicId =
                    localStorage.getItem(
                        "notesTopic"
                    ) ||
                    localStorage.getItem(
                        "activeTopic"
                    );


                if (
                    !courseId ||
                    !chapterId ||
                    !topicId
                ) {

                    window.location.href =
                        "student.html";

                    return;
                }


                loadTopic();

                loadNotes();

            }
        );

    }
);


// ==========================================
// LOAD TOPIC
// ==========================================

function loadTopic() {

    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                return;
            }


            const data =
                doc.data();


            document.getElementById(
                "topicTitle"
            ).textContent =
                data.name ||
                data.title ||
                "Topic Notes";


            document.getElementById(
                "topicDescription"
            ).textContent =
                data.description ||
                "Read the notes carefully for NEET preparation.";

        });

}


// ==========================================
// LOAD NOTES
// ==========================================

function loadNotes() {

    const container =
        document.getElementById(
            "notesContainer"
        );


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("topics")
        .doc(topicId)
        .collection("notes")
        .where(
            "published",
            "==",
            true
        )
        .get()

        .then(function (snapshot) {

            container.innerHTML = "";


            if (snapshot.empty) {

                container.innerHTML = `

                    <div class="pdf-empty">

                        <div style="
                            font-size:42px;
                            margin-bottom:10px;
                        ">
                            📄
                        </div>

                        Notes are not available yet.

                    </div>

                `;

                return;
            }


            snapshot.forEach(
                function (doc) {

                    const note =
                        doc.data();


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "pdf-card";


                    card.innerHTML = `

                        <div class="pdf-icon">
                            📄
                        </div>

                        <div class="pdf-title">
                            ${escapeHTML(
                                note.title ||
                                "Topic Notes"
                            )}
                        </div>

                        <div class="pdf-description">
                            ${escapeHTML(
                                note.description ||
                                "Study notes"
                            )}
                        </div>

                        <button
                            class="pdf-button"
                            onclick="
                                openPDF(
                                    '${escapeHTML(
                                        note.pdfUrl ||
                                        ""
                                    )}'
                                )
                            "
                        >
                            📖 Open Notes PDF
                        </button>

                    `;


                    container.appendChild(
                        card
                    );

                }
            );

        })

        .catch(function (error) {

            console.error(
                "Notes loading error:",
                error
            );


            container.innerHTML = `

                <div class="pdf-error">

                    Unable to load notes.

                </div>

            `;

        });

}


// ==========================================
// OPEN PDF
// ==========================================

function openPDF(url) {

    if (
        !url ||
        url === "YOUR_PDF_URL"
    ) {

        alert(
            "Notes PDF has not been uploaded yet."
        );

        return;
    }


    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// BACK
// ==========================================

function goBackToTopic() {

    window.location.href =
        "topic.html";

}


// ==========================================
// ESCAPE HTML
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
