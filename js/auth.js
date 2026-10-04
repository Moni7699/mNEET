// ==========================================
// mNEET - Authentication System
// ==========================================


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Check current login status

    auth.onAuthStateChanged(function (user) {

        if (user) {

            // User already logged in.
            // Don't show login page again.

            if (
                window.location.pathname.endsWith(
                    "index.html"
                ) ||
                window.location.pathname === "/" ||
                window.location.pathname === ""
            ) {

                window.location.href =
                    "student.html";

            }

        }

    });

});


// ==========================================
// REGISTER USER
// ==========================================

function registerUser() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();


    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("registerPassword")
            .value;


    const confirmPassword =
        document
            .getElementById("registerConfirmPassword")
            .value;


    // --------------------------------------
    // Validation
    // --------------------------------------

    if (!name) {

        showMessage(
            "Please enter your full name."
        );

        return;
    }


    if (!email) {

        showMessage(
            "Please enter your email."
        );

        return;
    }


    if (!password) {

        showMessage(
            "Please enter a password."
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match."
        );

        return;
    }


    // --------------------------------------
    // Show Loading
    // --------------------------------------

    setLoading(true);


    // --------------------------------------
    // Create Firebase Account
    // --------------------------------------

    auth
        .createUserWithEmailAndPassword(
            email,
            password
        )

        .then(function (result) {

            const user = result.user;


            // ----------------------------------
            // Save User Profile
            // ----------------------------------

            return db
                .collection("users")
                .doc(user.uid)
                .set({

                    uid: user.uid,

                    name: name,

                    email: email,

                    role: "student",

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

        })

        .then(function () {

            setLoading(false);

            showMessage(
                "Account created successfully!"
            );


            // ----------------------------------
            // Go to Student Dashboard
            // ----------------------------------

            setTimeout(function () {

                window.location.href =
                    "student.html";

            }, 800);

        })

        .catch(function (error) {

            setLoading(false);

            showFirebaseError(error);

        });

}



// ==========================================
// LOGIN USER
// ==========================================

function loginUser() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    // --------------------------------------
    // Validation
    // --------------------------------------

    if (!email) {

        showMessage(
            "Please enter your email."
        );

        return;
    }


    if (!password) {

        showMessage(
            "Please enter your password."
        );

        return;
    }


    // --------------------------------------
    // Loading
    // --------------------------------------

    setLoading(true);


    // --------------------------------------
    // Firebase Login
    // --------------------------------------

    auth
        .signInWithEmailAndPassword(
            email,
            password
        )

        .then(function () {

            showMessage(
                "Login successful!"
            );


            setTimeout(function () {

                window.location.href =
                    "student.html";

            }, 500);

        })

        .catch(function (error) {

            setLoading(false);

            showFirebaseError(error);

        });

}



// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

    auth
        .signOut()

        .then(function () {

            window.location.href =
                "index.html";

        })

        .catch(function (error) {

            console.error(
                "Logout error:",
                error
            );

        });

}



// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    const loginBox =
        document.getElementById(
            "loginBox"
        );


    const registerBox =
        document.getElementById(
            "registerBox"
        );


    loginBox.classList.remove(
        "hidden"
    );


    registerBox.classList.add(
        "hidden"
    );


    clearMessage();

}



// ==========================================
// SHOW REGISTER
// ==========================================

function showRegister() {

    const loginBox =
        document.getElementById(
            "loginBox"
        );


    const registerBox =
        document.getElementById(
            "registerBox"
        );


    loginBox.classList.add(
        "hidden"
    );


    registerBox.classList.remove(
        "hidden"
    );


    clearMessage();

}



// ==========================================
// MESSAGE
// ==========================================

function showMessage(message) {

    const messageBox =
        document.getElementById(
            "message"
        );


    if (!messageBox) {

        return;

    }


    messageBox.textContent =
        message;

}



// ==========================================
// CLEAR MESSAGE
// ==========================================

function clearMessage() {

    const messageBox =
        document.getElementById(
            "message"
        );


    if (!messageBox) {

        return;

    }


    messageBox.textContent =
        "";

}



// ==========================================
// LOADING STATE
// ==========================================

function setLoading(isLoading) {

    const loading =
        document.getElementById(
            "authLoading"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const registerButton =
        document.getElementById(
            "registerButton"
        );


    if (isLoading) {

        if (loading) {

            loading.classList.remove(
                "hidden"
            );

        }


        if (loginButton) {

            loginButton.disabled =
                true;

        }


        if (registerButton) {

            registerButton.disabled =
                true;

        }

    }

    else {

        if (loading) {

            loading.classList.add(
                "hidden"
            );

        }


        if (loginButton) {

            loginButton.disabled =
                false;

        }


        if (registerButton) {

            registerButton.disabled =
                false;

        }

    }

}



// ==========================================
// FIREBASE ERROR HANDLER
// ==========================================

function showFirebaseError(error) {

    console.error(
        "Firebase Error:",
        error
    );


    let message =
        "Something went wrong. Please try again.";


    switch (error.code) {

        case "auth/email-already-in-use":

            message =
                "This email is already registered.";

            break;


        case "auth/invalid-email":

            message =
                "Please enter a valid email address.";

            break;


        case "auth/weak-password":

            message =
                "Password is too weak. Use at least 6 characters.";

            break;


        case "auth/user-not-found":

            message =
                "No account found with this email.";

            break;


        case "auth/wrong-password":

            message =
                "Incorrect password.";

            break;


        case "auth/invalid-credential":

            message =
                "Email or password is incorrect.";

            break;


        case "auth/too-many-requests":

            message =
                "Too many attempts. Please try again later.";

            break;


        case "auth/network-request-failed":

            message =
                "Network error. Check your internet connection.";

            break;


        default:

            if (error.message) {

                message =
                    error.message;

            }

            break;

    }


    setLoading(false);

    showMessage(message);

}
