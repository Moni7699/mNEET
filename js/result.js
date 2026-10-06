/* =====================================================
   mNEET RESULT ENGINE
   ===================================================== */

let resultData = null;


/* =====================================================
   PAGE LOAD
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        if(
            typeof firebase === "undefined"
        ){

            console.error(
                "Firebase not loaded."
            );

            return;
        }


        auth.onAuthStateChanged(
            function(user){

                if(!user){

                    window.location.href =
                        "index.html";

                    return;
                }


                loadResult();

            }
        );

    }
);


/* =====================================================
   LOAD RESULT
   ===================================================== */

function loadResult(){

    /*
      First try localStorage
    */

    let savedResult =
        localStorage.getItem(
            "quizResult"
        );


    /*
      If missing, try sessionStorage
    */

    if(!savedResult){

        savedResult =
            sessionStorage.getItem(
                "quizResult"
            );
    }


    if(!savedResult){

        console.error(
            "No quiz result found."
        );

        window.location.href =
            "student.html";

        return;
    }


    try{

        resultData =
            JSON.parse(
                savedResult
            );

    }catch(error){

        console.error(
            "Result parse error:",
            error
        );

        return;
    }


    console.log(
        "mNEET RESULT:",
        resultData
    );


    displayResult();


    saveProgress();

}


/* =====================================================
   DISPLAY RESULT
   ===================================================== */

function displayResult(){

    if(!resultData){

        return;
    }


    /*
      Support BOTH old and new names
    */

    const total =
        Number(
            resultData.totalQuestions ??
            resultData.total ??
            resultData.questionCount ??
            0
        );


    const correct =
        Number(
            resultData.correct ??
            0
        );


    const incorrect =
        Number(
            resultData.incorrect ??
            0
        );


    const skipped =
        Number(
            resultData.skipped ??
            0
        );


    const score =
        Number(
            resultData.score ??
            0
        );


    const accuracy =
        Number(
            resultData.accuracy ??
            0
        );


    const time =
        Number(
            resultData.totalTime ??
            resultData.time ??
            0
        );


    const title =
        resultData.quizTitle ||
        "Quiz Result";


    const scoreEl =
        document.getElementById(
            "score"
        );


    const correctEl =
        document.getElementById(
            "correct"
        );


    const incorrectEl =
        document.getElementById(
            "incorrect"
        );


    const skippedEl =
        document.getElementById(
            "skipped"
        );


    const timeEl =
        document.getElementById(
            "time"
        );


    const accuracyEl =
        document.getElementById(
            "accuracy"
        );


    const fillEl =
        document.getElementById(
            "accuracyFill"
        );


    const titleEl =
        document.getElementById(
            "resultTitle"
        );


    if(scoreEl){

        scoreEl.textContent =
            score;
    }


    if(correctEl){

        correctEl.textContent =
            correct;
    }


    if(incorrectEl){

        incorrectEl.textContent =
            incorrect;
    }


    if(skippedEl){

        skippedEl.textContent =
            skipped;
    }


    if(timeEl){

        timeEl.textContent =
            formatTime(time);
    }


    if(accuracyEl){

        accuracyEl.textContent =
            accuracy + "%";
    }


    if(fillEl){

        fillEl.style.width =
            Math.min(
                100,
                Math.max(
                    0,
                    accuracy
                )
            ) + "%";
    }


    if(titleEl){

        titleEl.textContent =
            title;
    }


    updateMessage(
        accuracy,
        correct,
        total
    );

}


/* =====================================================
   MESSAGE
   ===================================================== */

function updateMessage(
    accuracy,
    correct,
    total
){

    const element =
        document.getElementById(
            "resultMessage"
        );


    if(!element){

        return;
    }


    if(total <= 0){

        element.textContent =
            "No questions were found in this attempt.";

        return;
    }


    if(accuracy >= 90){

        element.textContent =
            "Excellent performance! Keep this level of preparation for NEET.";

    }else if(accuracy >= 75){

        element.textContent =
            "Great work! A little more practice can make your performance even stronger.";

    }else if(accuracy >= 50){

        element.textContent =
            "Good attempt. Review the incorrect questions and try again.";

    }else{

        element.textContent =
            "Keep practicing. Review the solutions and NCERT concepts carefully.";

    }

}


/* =====================================================
   SAVE PROGRESS
   ===================================================== */

function saveProgress(){

    const user =
        firebase.auth().currentUser;


    if(
        !user ||
        !resultData
    ){

        return;
    }


    const total =
        Number(
            resultData.totalQuestions ??
            resultData.total ??
            0
        );


    const correct =
        Number(
            resultData.correct ??
            0
        );


    const percent =
        total > 0
            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )
            : 0;


    const courseId =
        resultData.courseId ||
        localStorage.getItem(
            "activeCourse"
        );


    const chapterId =
        resultData.chapterId ||
        localStorage.getItem(
            "activeChapter"
        );


    const topicId =
        resultData.topicId ||
        localStorage.getItem(
            "activeTopic"
        );


    if(
        !courseId ||
        !chapterId ||
        !topicId
    ){

        return;
    }


    const progressId =
        courseId +
        "_" +
        chapterId +
        "_" +
        topicId;


    const progressRef =
        db.collection("users")
          .doc(user.uid)
          .collection("progress")
          .doc(progressId);


    progressRef.get()

    .then(function(doc){

        let attempts = 0;

        let bestScore = 0;


        if(doc.exists){

            const old =
                doc.data() || {};


            attempts =
                Number(
                    old.attempts || 0
                );


            bestScore =
                Number(
                    old.bestScore || 0
                );

        }


        const currentScore =
            Number(
                resultData.score || 0
            );


        return progressRef.set({

            courseId:
                courseId,

            chapterId:
                chapterId,

            topicId:
                topicId,

            attempts:
                attempts + 1,

            percent:
                percent,

            bestScore:
                Math.max(
                    bestScore,
                    currentScore
                ),

            lastScore:
                currentScore,

            lastAccuracy:
                Number(
                    resultData.accuracy || 0
                ),

            lastCorrect:
                Number(
                    resultData.correct || 0
                ),

            lastIncorrect:
                Number(
                    resultData.incorrect || 0
                ),

            lastSkipped:
                Number(
                    resultData.skipped || 0
                ),

            lastTime:
                Number(
                    resultData.totalTime ??
                    resultData.time ??
                    0
                ),

            lastAttemptAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        },{
            merge:true
        });

    })

    .catch(function(error){

        console.error(
            "Progress save error:",
            error
        );

    });

}


/* =====================================================
   REATTEMPT
   ===================================================== */

function reattemptQuiz(){

    if(!resultData){

        return;
    }


    /*
      IMPORTANT:
      Remove old attempt so quiz starts fresh.
    */

    const courseId =
        resultData.courseId ||
        localStorage.getItem(
            "activeCourse"
        );


    const chapterId =
        resultData.chapterId ||
        localStorage.getItem(
            "activeChapter"
        );


    const topicId =
        resultData.topicId ||
        localStorage.getItem(
            "activeTopic"
        );


    const quizId =
        resultData.quizId ||
        localStorage.getItem(
            "activeQuiz"
        );


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


    if(quizId){

        localStorage.setItem(
            "activeQuiz",
            quizId
        );
    }


    /*
      Clear previous quiz attempt
    */

    const attemptKey =
        [
            "mneet_attempt",
            courseId,
            chapterId,
            topicId,
            quizId || "quiz-01"
        ].join("_");


    localStorage.removeItem(
        attemptKey
    );


    window.location.href =
        "quiz.html";
}


/* =====================================================
   TOPIC
   ===================================================== */

function goToTopic(){

    if(!resultData){

        window.location.href =
            "student.html";

        return;
    }


    const courseId =
        resultData.courseId ||
        localStorage.getItem(
            "activeCourse"
        );


    const chapterId =
        resultData.chapterId ||
        localStorage.getItem(
            "activeChapter"
        );


    const topicId =
        resultData.topicId ||
        localStorage.getItem(
            "activeTopic"
        );


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
        "topic.html";
}


/* =====================================================
   CHAPTER
   ===================================================== */

function goToChapter(){

    if(!resultData){

        window.location.href =
            "student.html";

        return;
    }


    const courseId =
        resultData.courseId ||
        localStorage.getItem(
            "activeCourse"
        );


    const chapterId =
        resultData.chapterId ||
        localStorage.getItem(
            "activeChapter"
        );


    localStorage.setItem(
        "activeCourse",
        courseId
    );


    localStorage.setItem(
        "activeChapter",
        chapterId
    );


    window.location.href =
        "chapter.html";
}


/* =====================================================
   DASHBOARD
   ===================================================== */

function goToStudent(){

    window.location.href =
        "student.html";
}


/* =====================================================
   FORMAT TIME
   ===================================================== */

function formatTime(seconds){

    seconds =
        Number(
            seconds || 0
        );


    if(
        !Number.isFinite(seconds) ||
        seconds < 0
    ){

        seconds = 0;
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (
        String(minutes)
            .padStart(2,"0")
        +
        ":" +
        String(remainingSeconds)
            .padStart(2,"0")
    );

}
