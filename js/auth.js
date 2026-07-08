import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ফায়ারবেস কনফিগারেশন
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
let currentUserRole = "student"; 

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appDashboard = document.getElementById('app-dashboard');
const sidebar = document.getElementById('app-sidebar');
const overlay = document.getElementById('sb-overlay');
const dynamicContainer = document.getElementById('dynamic-middle-container');

// সাইডবার ওপেন/ক্লোজ মেকানিজম
document.getElementById('btn-sidebar-open').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
document.getElementById('btn-sidebar-close').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

// ডার্ক এবং হোয়াইট মোড টগল লজিক
document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('white-mode');
    localStorage.setItem('mneet-theme', document.body.classList.contains('white-mode') ? 'light' : 'dark');
});
if(localStorage.getItem('mneet-theme') === 'light') document.body.classList.add('white-mode');

// ট্যাব পরিবর্তনের মেকানিজম এবং আলাদা ফাইল কলিং ট্রিপার
const tabs = document.querySelectorAll('.nav-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        const targetTab = e.currentTarget;
        targetTab.classList.add('active-tab');
        loadTabScreen(targetTab.getAttribute('data-target'));
    });
});

// 🔄 আলাদা আলাদা ফাইল থেকে স্ক্রিন ডাটা ইম্পোর্ট করার ডাইনামিক ফাংশন
async function loadTabScreen(tabName) {
    dynamicContainer.innerHTML = `<div style="text-align:center; padding:5px;">Loading Grid...</div>`;
    try {
        // মডিউলগুলো ডাইনামিকালি আলাদা আলাদা ফাইল থেকে রান হবে
        const module = await import(`./${tabName}.js`);
        module.renderScreen(dynamicContainer, currentUserRole === 'admin');
    } catch (err) {
        dynamicContainer.innerHTML = `<div style="color:var(--accent-red)">Error loading section: ${err.message}</div>`;
    }
}

// 🔄 সেশন অবজার্ভার
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let userData = userDoc.exists() ? userDoc.data() : {};

        currentUserRole = (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? "admin" : "student";
        
        // টপ বার আপডেট
        document.getElementById('nav-user-name').innerText = userData.displayName || "Aspirant";
        document.getElementById('user-bp-coins').innerText = userData.bp_coins || 0;

        // সাইডবার প্রোফাইল ফিলআপ
        document.getElementById('sb-name').value = userData.displayName || "";
        document.getElementById('sb-phone').value = userData.phone || "";
        document.getElementById('sb-dream-college').value = userData.dreamCollege || "";
        document.getElementById('sb-target-date').value = userData.targetDate || "";

        // সোশ্যাল মিডিয়া লিংক অ্যাডমিন হ্যান্ডেল সেটআপ
        document.getElementById('link-yt').href = "https://youtube.com";
        document.getElementById('link-insta').href = "https://instagram.com";
        document.getElementById('link-fb').href = "https://facebook.com";
        document.getElementById('link-tele').href = "https://t.me";

        // মিরর মোড চেক
        if (currentUserRole === "admin") {
            document.getElementById('admin-mirror-tag').style.display = "inline-block";
        } else {
            document.getElementById('admin-mirror-tag').style.display = "none";
        }

        // রিয়েল-টাইম সাইডবার আপডেট সেভ লজিক
        ['sb-dream-college', 'sb-target-date'].forEach(id => {
            document.getElementById(id).addEventListener('change', async (e) => {
                const field = id === 'sb-dream-college' ? 'dreamCollege' : 'targetDate';
                await updateDoc(doc(db, "users", user.uid), { [field]: e.target.value });
            });
        });

        authContainer.classList.remove('active');
        appDashboard.classList.add('active');
        loadTabScreen('home'); // বাই-ডিফল্ট হোম পেজ লোড হবে
    } else {
        appDashboard.classList.remove('active');
        authContainer.classList.add('active');
    }
});

// সাইন-আপ, সাইন-ইন ও লগআউট ইভেন্ট লিসেনার
document.getElementById('go-to-signup').addEventListener('click', () => { document.getElementById('signin-card').classList.remove('active'); document.getElementById('signup-card').classList.add('active'); });
document.getElementById('go-to-signin').addEventListener('click', () => { document.getElementById('signup-card').classList.remove('active'); document.getElementById('signin-card').classList.add('active'); });

document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value)
    .catch(err => alert(err.message));
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, document.getElementById('reg-password').value);
        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid, displayName: name, email: email,
            phone: document.getElementById('reg-phone').value,
            city: document.getElementById('reg-city').value,
            bp_coins: 100, streak: 1, createdAt: new Date()
        });
    } catch (err) { alert(err.message); }
});

const logoutHandler = () => signOut(auth).then(() => closeSidebar()).catch(err => console.size(err));
document.getElementById('btn-sidebar-logout').addEventListener('click', logoutHandler);
