import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { renderHomeScreen } from "./home.js";

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

const splashScreen = document.getElementById('splash-screen');
const authContainer = document.getElementById('auth-container');
const appDashboard = document.getElementById('app-dashboard');
const signinCard = document.getElementById('signin-card');
const signupCard = document.getElementById('signup-card');
const sidebar = document.getElementById('app-sidebar');
const overlay = document.getElementById('sb-overlay');
const scrollZone = document.getElementById('main-scroll-zone');

// স্ক্রিন কন্ট্রোল ও সুইচিং
document.getElementById('go-to-signup').addEventListener('click', () => { signinCard.classList.remove('active'); signupCard.classList.add('active'); });
document.getElementById('go-to-signin').addEventListener('click', () => { signupCard.classList.remove('active'); signinCard.classList.add('active'); });

document.getElementById('btn-sidebar-open').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
document.getElementById('btn-sidebar-close').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

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

        const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        document.getElementById('nav-user-name').innerText = userData.displayName || "Aspirant";
        document.getElementById('user-bp-coins').innerText = userData.bp_coins || 0;
        document.getElementById('sb-name').value = userData.displayName || "";
        document.getElementById('sb-phone').value = userData.phone || "";
        document.getElementById('sb-dream-college').value = userData.dreamCollege || "";
        document.getElementById('sb-target-date').value = userData.targetDate || "";

        // 🚀 হোম পেজের প্রফেশনাল কোড রেন্ডার করা (home.js থেকে)
        renderHomeScreen(scrollZone, isAdmin);

        splashScreen.classList.remove('active');
        authContainer.classList.remove('active');
        appDashboard.classList.add('active');
    } else {
        splashScreen.classList.remove('active');
        appDashboard.classList.remove('active');
        authContainer.classList.add('active');
    }
});

// সাইন আপ ও সাইন ইন হ্যান্ডলার
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

document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value).catch(err => alert(err.message));
});

document.getElementById('btn-sidebar-logout').addEventListener('click', () => { signOut(auth).then(() => closeSidebar()); });
          
