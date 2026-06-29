import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const signinBox = document.getElementById("signin-box");
const signupBox = document.getElementById("signup-box");
const forgotBox = document.getElementById("forgot-box");

// নেভিগেশন ক্লিক লিসেনার
document.getElementById("goto-signup").addEventListener("click", (e) => { e.preventDefault(); switchBox(signupBox); });
document.getElementById("goto-signin").addEventListener("click", (e) => { e.preventDefault(); switchBox(signinBox); });
document.getElementById("goto-forgot").addEventListener("click", (e) => { e.preventDefault(); switchBox(forgotBox); });
document.getElementById("back-to-login").addEventListener("click", (e) => { e.preventDefault(); switchBox(signinBox); });

// এটি ১০০০% গ্যারান্টি দিয়ে সাইন আপ ফর্মকে স্ক্রিনে ভিজিবল করবে
function switchBox(targetBox) {
    signinBox.classList.add("hidden");
    signupBox.classList.add("hidden");
    forgotBox.classList.add("hidden");
    
    signinBox.style.setProperty('display', 'none', 'important');
    signupBox.style.setProperty('display', 'none', 'important');
    forgotBox.style.setProperty('display', 'none', 'important');

    targetBox.classList.remove("hidden");
    targetBox.style.setProperty('display', 'block', 'important');
}

// সাইন আপ এবং ভেরিফিকেশন প্রসেস
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

        await sendEmailVerification(user);

        await set(ref(db, 'users/' + user.uid), {
            name: name,
            email: email,
            phone: phone,
            city: city,
            role: "student",
            uid: user.uid,
            bpCoins: 0
        });

        alert("Verification email dispatched! Verify and Sign In.");
        switchBox(signinBox);
    } catch (err) {
        alert(err.message);
    }
});

// সাইন ইন ভেরিফিকেশন ও ড্যাশবোর্ড ট্রান্সফার
document.getElementById("signin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
        const user = userCredential.user;

        if(!user.emailVerified) {
            alert("Please click the verification link sent to your Gmail inbox first.");
            await signOut(auth);
            return;
        }

        const snap = await get(ref(db, 'users/' + user.uid));
        if(snap.exists() && snap.val().role === "student") {
            window.location.href = "student_dashboard.html";
        }
    } catch (err) {
        alert(err.message);
    }
});
            
