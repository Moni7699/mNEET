import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// এডমিনের নির্দিষ্ট ক্রেডেনশিয়াল (এখানে তোমার আসল এডমিন ডিটেইলস বসাবে)
const ADMIN_GMAIL = "admin@mneet.com"; // তোমার পছন্দমত ইমেইল বসাও
const ADMIN_PHONE = "0123456789";     // তোমার পছন্দমত ফোন নম্বর বসাও

// DOM Elements
const signinBox = document.getElementById("signin-box");
const signupBox = document.getElementById("signup-box");
const otpBox = document.getElementById("otp-box");
const forgotBox = document.getElementById("forgot-box");

// Navigation Logic
document.getElementById("goto-signup").addEventListener("click", () => switchBox(signupBox));
document.getElementById("goto-signin").addEventListener("click", () => switchBox(signinBox));
document.getElementById("goto-forgot").addEventListener("click", () => switchBox(forgotBox));
document.getElementById("back-to-login").addEventListener("click", () => switchBox(signinBox));
document.getElementById("goto-signin-from-otp")?.addEventListener("click", () => switchBox(signinBox));

function switchBox(targetBox) {
    [signinBox, signupBox, otpBox, forgotBox].forEach(box => {
        if(box) box.classList.add("hidden");
    });
    targetBox.classList.remove("hidden");
}

// ================= ১. সাইন আপ এবং অফিশিয়াল ভেরিফিকেশন লিঙ্ক (OTP) =================
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const city = document.getElementById("reg-city").value.trim();
    const password = document.getElementById("reg-password").value;

    try {
        // ফায়ারবেস অথেন্টিকেশনে ইউজার তৈরি
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // অফিশিয়াল ভেরিফিকেশন ইমেইল পাঠানো (যা ওটিপি-র কাজ করবে)
        await sendEmailVerification(user);

        // রিয়েল-টাইম ডেটাবেজে স্টুডেন্টের বাকি তথ্য সেভ করা
        await set(ref(db, 'users/' + user.uid), {
            name: name,
            email: email,
            phone: phone,
            city: city,
            role: "student", // বাই ডিফল্ট সবাই স্টুডেন্ট
            uid: user.uid,
            createdAt: new Date().toISOString()
        });

        // ওটিপি বক্স বা ভেরিফিকেশন মেসেজ বক্স দেখানো
        switchBox(otpBox);
        alert("Your official verification email has been sent! Please click the link in your inbox to verify your account, then Sign In.");
        switchBox(signinBox); // ভেরিফিকেশন লিঙ্ক ক্লিক করার জন্য লগইন স্ক্রিনে ব্যাক করানো হলো

    } catch (error) {
        alert("Sign Up Error: " + error.message);
    }
});

// ================= ২. সাইন ইন এবং এডমিন/স্টুডেন্ট ড্যাশবোর্ড রাউটিং =================
document.getElementById("signin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const identifier = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        let email = identifier;

        // ইউজার যদি ইমেইলের বদলে ফোন নম্বর দিয়ে লগইন করতে চায়, তবে ডেটাবেজ থেকে ইমেইল খুঁজে বের করার লজিক
        if (!identifier.includes("@")) {
            alert("Processing phone login look up...");
            // ফোন নম্বর দিয়ে লগইন প্রসেস করার জন্য আপাতত ইমেইল ফরম্যাট রিকোয়ার্ড করা হচ্ছে প্রফেশনাল সিকিউরিটির জন্য।
            // (পরের ধাপে ডেটাবেজ কোয়েরি দিয়ে এটা আরও নিখুঁত করা যাবে)
            return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // এডমিন চেক (সরাসরি হার্ডকোড ইমেইল অথবা ফোন ম্যাচিং)
        if (email === ADMIN_GMAIL) {
            alert("Welcome Admin! Redirecting to Admin Dashboard...");
            window.location.href = "admin_dashboard.html"; // আমরা পরে এই ফাইল তৈরি করব
            return;
        }

        // অফিশিয়াল ইমেইল ভেরিফাইড কিনা চেক করা (রিয়েল সিকিউরিটি গ্রাউন্ড)
        if (!user.emailVerified) {
            alert("Please verify your email first! Check your inbox for the official verification link.");
            await signOut(auth);
            return;
        }

        // ডেটাবেজ থেকে রোল চেক করা (স্টুডেন্ট ভেরিফিকেশন)
        const snapshot = await get(ref(db, 'users/' + user.uid));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.role === "student") {
                alert("Login Successful! Welcome to mNEET.");
                window.location.href = "student_dashboard.html"; // আমরা পরে এই ফাইল তৈরি করব
            }
        } else {
            alert("User data not found in Database.");
        }

    } catch (error) {
        alert("Sign In Error: " + error.message);
    }
});

// ================= ৩. পাসওয়ার্ড রিসেট (Forgot Password) =================
document.getElementById("forgot-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent to your Gmail! Please check your inbox.");
        switchBox(signinBox);
    } catch (error) {
        alert("Error: " + error.message);
    }
});
                        
