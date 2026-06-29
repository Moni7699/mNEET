import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// টার্গেট রোলস অ্যান্ড ক্রেডেনশিয়াল ফিল্টারিং
const ADMIN_GMAIL = "admin@mneet.com"; 

const signinBox = document.getElementById("signin-box");
const signupBox = document.getElementById("signup-box");
const forgotBox = document.getElementById("forgot-box");

// ক্লিন নেভিগেশন
document.getElementById("goto-signup").addEventListener("click", () => switchBox(signupBox));
document.getElementById("goto-signin").addEventListener("click", () => switchBox(signinBox));
document.getElementById("goto-forgot").addEventListener("click", () => switchBox(forgotBox));
document.getElementById("back-to-login").addEventListener("click", () => switchBox(signinBox));

function switchBox(target) {
    [signinBox, signupBox, forgotBox].forEach(b => b.classList.add("hidden"));
    target.classList.remove("hidden");
}

// ১. সাইন আপ লজিক
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const city = document.getElementById("reg-city").value.trim();
    const password = document.getElementById("reg-password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // অফিশিয়াল জিমেইল লিঙ্ক পাঠানো
        await sendEmailVerification(user);

        // ডেটাবেজ ম্যাপিং
        await set(ref(db, 'users/' + user.uid), {
            name: name,
            email: email,
            phone: phone,
            city: city,
            role: "student",
            uid: user.uid
        });

        alert("Official verification link sent to your Gmail! Please verify and then Sign In.");
        switchBox(signinBox);
    } catch (err) {
        alert(err.message);
    }
});

// ২. সাইন ইন লজিক (এডমিন বনাম স্টুডেন্ট ড্যাশবোর্ড রাউটিং)
document.getElementById("signin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        let email = identifier;
        
        // যদি ফোন নম্বর দিয়ে লগইন করতে চায়, তবে ডেটাবেজ চেক ইমেল লজিক কাজ করবে
        if(!identifier.includes("@")) {
            alert("Checking telephone database mappings...");
            return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // এডমিন চেক
        if(email === ADMIN_GMAIL) {
            alert("Access Granted: Admin Station");
            window.location.href = "admin_dashboard.html";
            return;
        }

        // ইমেইল ভেরিফাইড কিনা চেক
        if(!user.emailVerified) {
            alert("Please verify your account via the link sent to your Gmail inbox.");
            await signOut(auth);
            return;
        }

        // স্টুডেন্ট রাউটিং ভেরিফিকেশন
        const snap = await get(ref(db, 'users/' + user.uid));
        if(snap.exists() && snap.val().role === "student") {
            window.location.href = "student_dashboard.html";
        }
    } catch (err) {
        alert(err.message);
    }
});

// ৩. পাসওয়ার্ড রিসেট
document.getElementById("forgot-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Reset link dispatched to your Gmail.");
        switchBox(signinBox);
    } catch (err) {
        alert(err.message);
    }
});
                  
