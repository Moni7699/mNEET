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
const sidebar = document.getElementById('app-sidebar');
const overlay = document.getElementById('sb-overlay');
const scrollZone = document.getElementById('main-scroll-zone');

// ওয়ান-ক্লিক সাইডবার টগল
document.getElementById('btn-sidebar-open').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
document.getElementById('btn-sidebar-close').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('white-mode');
    localStorage.setItem('mneet-theme', document.body.classList.contains('white-mode') ? 'light' : 'dark');
});
if(localStorage.getItem('mneet-theme') === 'light') document.body.classList.add('white-mode');

// 🔄 রিয়েল-টাইম ইউজার সেশন ট্র্যাকার
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        let userData = userDoc.exists() ? userDoc.data() : {};

        const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        // টপ বার রেন্ডারিং (নাম এবং ড্রিম কলেজ সুন্দর অ্যালাইনমেন্টে)
        document.getElementById('nav-user-name').innerText = userData.displayName || "Aspirant";
        document.getElementById('nav-user-college').innerText = userData.dreamCollege || "No Dream College Set";
        document.getElementById('user-bp-coins').innerText = userData.bp_coins || 0;

        // সাইডবার প্রোফাইল ডাটা
        document.getElementById('sb-name').value = userData.displayName || "";
        document.getElementById('sb-phone').value = userData.phone || "";
        document.getElementById('sb-dream-college').value = userData.dreamCollege || "";
        document.getElementById('sb-target-date').value = userData.targetDate || "";

        // ডাটাবেসে সেভ থাকা প্রোফাইল পিকচার লোড লজিক
        const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b949e'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
        document.getElementById('user-avatar').src = userData.avatarImage || defaultAvatar;

        // 📷 প্রোফাইল ফটো আপলোড লজিক (Base64 রূপান্তর করে ফায়ারস্টোরে সেভ)
        document.getElementById('avatar-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result;
                    document.getElementById('user-avatar').src = base64String;
                    await updateDoc(userRef, { avatarImage: base64String });
                };
                reader.readAsDataURL(file);
            }
        });

        // সোশ্যাল লিংক হ্যান্ডেল
        document.getElementById('link-yt').href = "https://youtube.com";
        document.getElementById('link-insta').href = "https://instagram.com";

        // 🚀 হোম স্ক্রিন ড্যাশবোর্ড কন্টেন্ট জেনারেটর কল
        renderHomeScreen(scrollZone, userData, isAdmin);

        // ইনপুট পরিবর্তনের সাথে সাথে ফায়ারবেসে অটো-সেভ লজিক
        ['sb-dream-college', 'sb-target-date'].forEach(id => {
            document.getElementById(id).addEventListener('change', async (e) => {
                const field = id === 'sb-dream-college' ? 'dreamCollege' : 'targetDate';
                await updateDoc(userRef, { [field]: e.target.value });
                if(field === 'dreamCollege') document.getElementById('nav-user-college').innerText = e.target.value;
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

// লগইন/সাইনআপ লজিক
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const cred = await createUserWithEmailAndPassword(auth, document.getElementById('reg-email').value, document.getElementById('reg-password').value);
        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid, displayName: document.getElementById('reg-name').value, email: cred.user.email,
            phone: document.getElementById('reg-phone').value, city: document.getElementById('reg-city').value,
            bp_coins: 100, totalTestsAttended: 0, totalQuestionsSolved: 0, successPercentage: 0, airPrediction: "99,999", createdAt: new Date()
        });
    } catch (error) { alert(error.message); }
});

document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value).catch(err => alert(err.message));
});

document.getElementById('btn-sidebar-logout').addEventListener('click', () => { signOut(auth).then(() => closeSidebar()); });
  
