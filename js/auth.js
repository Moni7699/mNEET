import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// তোমার অরিজিনাল ফায়ারবেস কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyApQOM_mtFZ16RiNJEaIUhb4iYFBIBRK58",
  authDomain: "mneet-spark.firebaseapp.com",
  databaseURL: "https://mneet-spark-default-rtdb.firebaseio.com",
  projectId: "mneet-spark",
  storageBucket: "mneet-spark.firebasestorage.app",
  messagingSenderId: "252201633700",
  appId: "1:252201633700:web:1a1e7a2cff1f0b168ea331"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ফায়ারবেসে অলরেডি রেজিস্টার্ড থাকা নির্দিষ্ট অ্যাডমিন জিমেইল
const ADMIN_EMAIL = "mi4286803@gmail.com";

// DOM Elements
const splashScreen = document.getElementById('splash-screen');
const authContainer = document.getElementById('auth-container');
const appDashboard = document.getElementById('app-dashboard');
const signinCard = document.getElementById('signin-card');
const signupCard = document.getElementById('signup-card');
const forgotCard = document.getElementById('forgot-card');
const sidebar = document.getElementById('app-sidebar');
const overlay = document.getElementById('sb-overlay');

// কার্ড ও স্ক্রিন সুইচ লজিক (আগের মতো নিখুঁত)
document.getElementById('go-to-signup').addEventListener('click', () => switchCard(signupCard));
document.getElementById('go-to-signin').addEventListener('click', () => switchCard(signinCard));
document.getElementById('go-to-forgot').addEventListener('click', () => switchCard(forgotCard));
document.getElementById('back-to-signin').addEventListener('click', () => switchCard(signinCard));

function switchCard(targetCard) {
    [signinCard, signupCard, forgotCard].forEach(card => card.classList.remove('active'));
    targetCard.classList.add('active');
}

// সাইডবার ওপেন ও ক্লোজ ইভেন্ট
document.getElementById('btn-sidebar-open').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
document.getElementById('btn-sidebar-close').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

// থিম পরিবর্তন (ডার্ক মোড / হোয়াইট মোড টগল)
document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('white-mode');
    localStorage.setItem('mneet-theme', document.body.classList.contains('white-mode') ? 'light' : 'dark');
});
if(localStorage.getItem('mneet-theme') === 'light') document.body.classList.add('white-mode');

// 🔄 ইউজার সেশন ও মিরর রোল অবজার্ভার
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let userData = userDoc.exists() ? userDoc.data() : { displayName: "Aspirant" };

        // টপ বার ও ড্যাশবোর্ডে নাম এবং কয়েন সিঙ্ক
        document.getElementById('nav-user-name').innerText = userData.displayName || "Aspirant";
        document.getElementById('dash-user-name').innerText = userData.displayName || "Aspirant";
        document.getElementById('user-bp-coins').innerText = userData.bp_coins || 0;

        // সাইডবার ফর্ম ফিলআপ
        document.getElementById('sb-name').value = userData.displayName || "";
        document.getElementById('sb-phone').value = userData.phone || "";
        document.getElementById('sb-dream-college').value = userData.dreamCollege || "";
        document.getElementById('sb-target-date').value = userData.targetDate || "";

        // সোশ্যাল লিংক ডিরেকশন
        document.getElementById('link-yt').href = "https://youtube.com";
        document.getElementById('link-insta').href = "https://instagram.com";
        document.getElementById('link-fb').href = "https://facebook.com";
        document.getElementById('link-tele').href = "https://t.me";

        // 👑 মিরর লজিক: অ্যাডমিন ও স্টুডেন্টদের স্ক্রিন একই কিন্তু কন্ট্রোল আলাদা
        if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            document.getElementById('admin-mirror-tag').style.display = "inline-block";
            document.getElementById('admin-control-panel').classList.remove('hidden');
        } else {
            document.getElementById('admin-mirror-tag').style.display = "none";
            document.getElementById('admin-control-panel').classList.add('hidden');
        }

        // সাইডবারের ড্রিম কলেজ ও এক্সাম ডেট ফায়ারবেসে অটো-আপডেট সেভ করার লজিক
        ['sb-dream-college', 'sb-target-date'].forEach(id => {
            document.getElementById(id).addEventListener('change', async (e) => {
                const field = id === 'sb-dream-college' ? 'dreamCollege' : 'targetDate';
                await updateDoc(doc(db, "users", user.uid), { [field]: e.target.value });
            });
        });

        splashScreen.classList.remove('active');
        authContainer.classList.remove('active');
        appDashboard.add('active');
    } else {
        splashScreen.classList.remove('active');
        appDashboard.classList.remove('active');
        authContainer.classList.add('active');
    }
});

// 📝 সাইন-আপ সাবমিশন (আগের মতো নিখুঁত কালেকশন মেকার)
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const city = document.getElementById('reg-city').value;
    const password = document.getElementById('reg-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            displayName: name,
            email: email,
            phone: phone,
            city: city,
            bp_coins: 100,
            streak: 1,
            createdAt: new Date()
        });
        alert("Account registered inside mNEET!");
    } catch (error) { alert("Registration Failed: " + error.message); }
});

// 🔑 সাইন-ইন সাবমিশন
document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value)
        .catch(error => alert("Authentication Failed: " + error.message));
});

// 📨 ফরগট পাসওয়ার্ড
document.getElementById('forgot-form').addEventListener('submit', (e) => {
    e.preventDefault();
    sendPasswordResetEmail(auth, document.getElementById('forgot-email').value)
        .then(() => { alert("Password reset link dispatched!"); switchCard(signinCard); })
        .catch(error => alert("Error: " + error.message));
});

// 🚪 লগআউট
const performLogout = () => signOut(auth).then(() => closeSidebar()).catch(err => console.error(err));
document.getElementById('btn-sidebar-logout').addEventListener('click', performLogout);
  
