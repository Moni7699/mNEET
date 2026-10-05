// ==========================================
// mNEET - Chapter Wise Practice
// ==========================================

let courseId = null;
let chapterId = null;


// ==========================================
// PRACTICE TYPES
// ==========================================

const practiceTypes = {

    "assertion-reason": {

        title:
            "Assertion & Reason",

        description:
            "Practice NEET Assertion and Reason questions.",

        icon:
            "🧠"

    },


    "statement-based": {

        title:
            "Statement Based",

        description:
            "Solve multiple statement-based NEET questions.",

        icon:
            "📋"

    },


    "match-following": {

        title:
            "Match the Following",

        description:
            "Practice matching concepts, terms and facts.",

        icon:
            "🔗"

    },


    "diagram-based": {

        title:
            "Diagram Based",

        description:
            "Identify and solve important Biology diagrams.",

        icon:
            "🧬"

    },


    "pyq": {

        title:
            "PYQ",

        description:
            "Practice previous year NEET questions.",

        icon:
            "📚"

    },


    "rapid-revision": {

        title:
            "Rapid Revision",

        description:
            "Quick revision questions for fast preparation.",

        icon:
            "⚡"

    }

};


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
                        "activeCourse"
                    );


                chapterId =
                    localStorage.getItem(
                        "activeChapter"
                    );


                if (
                    !courseId ||
                    !chapterId
                ) {

                    window.location.href =
                        "student.html";

                    return;
                }


                loadChapter();

                loadPracticeTypes();

            }
        );

    }
);


// ==========================================
// LOAD CHAPTER
// ==========================================

function loadChapter() {

    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .get()

        .then(function (doc) {

            if (!doc.exists) {

                document.getElementById(
                    "chapterTitle"
                ).textContent =
                    "Chapter not found.";

                return;
            }


            const data =
                doc.data();


            document.getElementById(
                "chapterTitle"
            ).textContent =
                data.name ||
                data.title ||
                "Biology Chapter";

        })

        .catch(function (error) {

            console.error(
                "Chapter loading error:",
                error
            );

        });

}


// ==========================================
// LOAD TYPES
// ==========================================

function loadPracticeTypes() {

    const container =
        document.getElementById(
            "typeGrid"
        );


    db.collection("courses")
        .doc(courseId)
        .collection("chapters")
        .doc(chapterId)
        .collection("typePractice")
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

                    <div class="loading">

                        No practice types
                        are available yet.

                    </div>

                `;

                return;
            }


            snapshot.forEach(
                function (doc) {

                    const typeId =
                        doc.id;


                    const data =
                        doc.data();


                    const preset =
                        practiceTypes[typeId];


                    if (!preset) {

                        return;
                    }


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "type-card";


                    card.innerHTML = `

                        <div class="type-icon">

                            ${preset.icon}

                        </div>


                        <div class="type-title">

                            ${escapeHTML(
                                data.title ||
                                preset.title
                            )}

                        </div>


                        <div class="type-description">

                            ${escapeHTML(
                                data.description ||
                                preset.description
                            )}

                        </div>


                        <button
                            class="type-button"
                            onclick="
                                openTypePractice(
                                    '${typeId}'
                                )
                            "
                        >
                            Start Practice
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
                "Practice type error:",
                error
            );


            container.innerHTML = `

                <div class="loading">

                    Unable to load
                    practice types.

                </div>

            `;

        });

}


// ==========================================
// OPEN TYPE PRACTICE
// ==========================================

function openTypePractice(
    typeId
) {

    localStorage.setItem(
        "practiceCourse",
        courseId
    );


    localStorage.setItem(
        "practiceChapter",
        chapterId
    );


    localStorage.setItem(
        "practiceType",
        typeId
    );


    window.location.href =
        "type-quiz.html";

}


// ==========================================
// BACK
// ==========================================

function goBack() {

    window.location.href =
        "chapter.html";

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
