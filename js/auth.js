import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// তোমার দেওয়া মডিফাইড mNEET ফায়ারবেস কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyApQOM_mtFZ16RiNJEaIUhb4iYFBIBRK58",
  authDomain: "mneet-spark.firebaseapp.com",
  databaseURL: "https://mneet-spark-default-rtdb.firebaseio.com",
  projectId: "mneet-spark",
  storageBucket: "mneet-spark.firebasestorage.app",
  messagingSenderId: "252201633700",
  appId: "1:252201633700:web:1a1e7a2cff1f0b168ea331"
};

// ইনিশিয়েলাইজেশন
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 👑 এখানে তোমার অ্যাডমিন জিমেইলটি সেট করে দেওয়া হয়েছে
const ADMIN_EMAIL = "mi4286803@gmail.com";

// DOM সিলেকশন
const splashScreen = document.getElementById('splash-screen');
const authContainer = document.getElementById('auth-container');
const appDashboard = document.getElementById('app-dashboard');
const signinCard = document.getElementById('signin-card');
const signupCard = document.getElementById('signup-card');
const forgotCard = document.getElementById('forgot-card');

// রুট বাটন লিসেনার্স
document.getElementById('go-to-signup').addEventListener('click', () => switchCard(signupCard));
document.getElementById('go-to-signin').addEventListener('click', () => switchCard(signinCard));
document.getElementById('go-to-forgot').addEventListener('click', () => switchCard(forgotCard));
document.getElementById('back-to-signin').addEventListener('click', () => switchCard(signinCard));

function switchCard(targetCard) {
    [signinCard, signupCard, forgotCard].forEach(card => card.classList.remove('active'));
    targetCard.classList.add('active');
}

// 🔄 ইউজার লগইন ট্র্যাকিং (Auth State Observer)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let userData = userDoc.exists() ? userDoc.data() : { displayName: "Aspirant" };

        document.getElementById('nav-user-name').innerText = userData.displayName;
        document.getElementById('dash-user-name').innerText = userData.displayName;

        // 👑 অ্যাডমিন জিমেইল ম্যাচিং লজিক
        if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            document.getElementById('admin-tag').classList.add('active-tag');
            document.getElementById('admin-control-panel').classList.remove('hidden');
        } else {
            document.getElementById('admin-tag').classList.remove('active-tag');
            document.getElementById('admin-control-panel').classList.add('hidden');
        }

        splashScreen.classList.remove('active');
        authContainer.classList.remove('active');
        appDashboard.classList.add('active');
    } else {
        splashScreen.classList.remove('active');
        appDashboard.classList.remove('active');
        authContainer.classList.add('active');
    }
});

// 📝 সাইন-আপ প্রসেস (ডাটাবেস কালেকশন অটোমেশনসহ)
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const city = document.getElementById('reg-city').value;
    const password = document.getElementById('reg-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ফায়ারস্টোরে সম্পূর্ণ প্রোফাইল অটো-সেভ হবে
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: name,
            email: email,
            phone: phone,
            city: city,
            role: email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "student",
            bp_coins: 100, // ফ্রি সাইনআপ বোনাস কয়েন
            streak: 1,
            createdAt: new Date()
        });
        alert("Account Registered successfully inside mNEET!");
    } catch (error) {
        alert("Registration Failed: " + error.message);
    }
});

// 🔑 সাইন-ইন প্রসেস
document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .catch(error => alert("Authentication Failed: " + error.message));
});

// 📨 ফরগট পাসওয়ার্ড প্রসেস
document.getElementById('forgot-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("A password reset link has been dispatched to your email!");
            switchCard(signinCard);
        })
        .catch(error => alert("Error: " + error.message));
});

// 🚪 লগআউট প্রসেস
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth).catch(error => console.error("Signout Error:", error));
});
  
