import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 🔄 ওয়ান-ফাইল ট্যাব চেঞ্জার লজিক
const tabs = document.querySelectorAll('.nav-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        e.currentTarget.classList.add('active-tab');

        // সব স্ক্রিন ভিউ অফ করে টার্গেট ভিউ অন করা
        const targetScreen = e.currentTarget.getAttribute('data-screen');
        document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active-view'));
        document.getElementById(`view-${targetScreen}`).classList.add('active-view');
    });
});

// কার্ড সুইচ
document.getElementById('go-to-signup').addEventListener('click', () => switchCard(signupCard));
document.getElementById('go-to-signin').addEventListener('click', () => switchCard(signinCard));
document.getElementById('go-to-forgot').addEventListener('click', () => switchCard(forgotCard));
document.getElementById('back-to-signin').addEventListener('click', () => switchCard(signinCard));

function switchCard(targetCard) {
    [signinCard, signupCard, forgotCard].forEach(card => card.classList.remove('active'));
    targetCard.classList.add('active');
}

// সাইডবার কন্ট্রোল
document.getElementById('btn-sidebar-open').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
document.getElementById('btn-sidebar-close').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

// থিম টগল
document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('white-mode');
    localStorage.setItem('mneet-theme', document.body.classList.contains('white-mode') ? 'light' : 'dark');
});
if(localStorage.getItem('mneet-theme') === 'light') document.body.classList.add('white-mode');

// 🔄 সেশন অবজার্ভার
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let userData = userDoc.exists() ? userDoc.data() : {};

        document.getElementById('nav-user-name').innerText = userData.displayName || "Aspirant";
        document.getElementById('user-bp-coins').innerText = userData.bp_coins || 0;

        document.getElementById('sb-name').value = userData.displayName || "";
        document.getElementById('sb-phone').value = userData.phone || "";
        document.getElementById('sb-dream-college').value = userData.dreamCollege || "";
        document.getElementById('sb-target-date').value = userData.targetDate || "";

        document.getElementById('link-yt').href = "https://youtube.com";
        document.getElementById('link-insta').href = "https://instagram.com";
        document.getElementById('link-fb').href = "https://facebook.com";
        document.getElementById('link-tele').href = "https://t.me";

        // 👑 মিরর ইমেজ অ্যাডমিন লজিক
        if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            document.getElementById('admin-mirror-tag').style.display = "inline-block";
            document.querySelectorAll('.id-admin-panel').forEach(panel => panel.style.display = 'block');
        } else {
            document.getElementById('admin-mirror-tag').style.display = "none";
            document.querySelectorAll('.id-admin-panel').forEach(panel => panel.style.display = 'none');
        }

        ['sb-dream-college', 'sb-target-date'].forEach(id => {
            document.getElementById(id).addEventListener('change', async (e) => {
                const field = id === 'sb-dream-college' ? 'dreamCollege' : 'targetDate';
                await updateDoc(doc(db, "users", user.uid), { [field]: e.target.value });
            });
        });

        splashScreen.classList.remove('active');
        authContainer.classList.remove('active');
        appDashboard.classList.add('active');
    } else {
        splashScreen.classList.remove('active');
        appDashboard.classList.remove('active');
        authContainer.classList.add('active');
    }
});

// সাইন আপ
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const cred = await createUserWithEmailAndPassword(auth, document.getElementById('reg-email').value, document.getElementById('reg-password').value);
        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid, displayName: document.getElementById('reg-name').value, email: cred.user.email,
            phone: document.getElementById('reg-phone').value, city: document.getElementById('reg-city').value,
            bp_coins: 100, streak: 1, createdAt: new Date()
        });
    } catch (error) { alert(error.message); }
});

// সাইন ইন
document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value).catch(err => alert(err.message));
});

// রিসেট পাসওয়ার্ড
document.getElementById('forgot-form').addEventListener('submit', (e) => {
    e.preventDefault();
    sendPasswordResetEmail(auth, document.getElementById('forgot-email').value).then(() => { alert("Reset link sent!"); switchCard(signinCard); }).catch(err => alert(err.message));
});

// লগআউট
document.getElementById('btn-sidebar-logout').addEventListener('click', () => { signOut(auth).then(() => closeSidebar()); });
                                
