import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    renderHomeSection, renderStudySection, renderBatchesSection, renderTestSection, renderMStoreSection 
} from "./dashboard_view.js";

const renderArea = document.getElementById("dashboard-main-render-area");
const backBtn = document.getElementById("dashboard-back-btn");
const homeWidgets = document.getElementById("home-top-widgets");
const drawer = document.getElementById("profile-drawer");
const overlay = document.getElementById("drawer-overlay");

let currentStudentUser = null;
let timerMechanismInterval = null;

// ================= ১. ইউজার অথেন্টিকেশন এবং ডাটা সেটিং =================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentStudentUser = user;
        const snap = await get(ref(db, 'users/' + user.uid));
        if (snap.exists()) {
            const data = snap.val();
            document.getElementById("profile-name-display").innerText = data.name || "Student";
            document.getElementById("profile-phone-display").innerText = data.phone || "";
            
            // সেটিংস প্যানেল ডাটা ফিলিং
            document.getElementById("target-college-input").value = data.customTargetCollege || "AIIMS Delhi";
            document.getElementById("target-date-input").value = data.customTargetDate || "2027-05-02";
            
            loadViewTab("home");
        }
    } else {
        window.location.href = "index.html";
    }
});

// ================= ২. ট্রু থিম সুইচিং মেকানিজম (Fixes White Mode Bug) =================
document.getElementById("dashboard-theme-toggle").addEventListener("change", (e) => {
    if (e.target.checked) {
        document.body.className = "theme-dark";
    } else {
        document.body.className = "theme-white";
    }
});

// ================= ৩. ৩-মুখী মোটিভেশন মিডিয়া ইনজেক্টর =================
function syncMotivationMediaPayload() {
    get(ref(db, 'admin/motivation')).then((snap) => {
        const targetArea = document.getElementById("motivation-payload-area");
        if(!targetArea) return;

        if (snap.exists()) {
            const data = snap.val(); // structure: { type: "text/image/video", src: "value" }
            if(data.type === "image") {
                targetArea.innerHTML = `<img src="${data.src}" style="width:100%; border-radius:12px; margin-top:5px; max-height:180px; object-fit:cover;">`;
            } else if (data.type === "video") {
                targetArea.innerHTML = `<iframe src="${data.src}" style="width:100%; height:160px; border-radius:12px; border:none; margin-top:5px;" allowfullscreen></iframe>`;
            } else {
                targetArea.innerHTML = `<p style="font-size: 12px; margin: 0; font-weight: 600; line-height: 1.4; font-style: italic;">"${data.src}"</p>`;
            }
        }
    });
}

function loadViewTab(viewName) {
    if (viewName === "home") {
        backBtn.classList.add("hidden-widget");
        homeWidgets.classList.remove("hidden-widget");
    } else {
        backBtn.classList.remove("hidden-widget");
        homeWidgets.classList.add("hidden-widget");
    }

    clearInterval(timerMechanismInterval);
    const sName = document.getElementById("profile-name-display").innerText;

    if (viewName === "home") {
        renderArea.innerHTML = renderHomeSection(sName.replace("Dr. ", ""));
        startPersonalizedTimer();
        syncMotivationMediaPayload();
    }
}

// ড্রয়ার স্লাইড ইন-আউট ফাংশন
document.getElementById("drawer-open-btn").addEventListener("click", () => {
    drawer.className = "drawer-open";
    overlay.classList.remove("hidden-widget");
});
const closeDrawerContainer = () => {
    drawer.className = "drawer-closed";
    overlay.classList.add("hidden-widget");
};
document.getElementById("drawer-close-btn").addEventListener("click", closeDrawerContainer);
overlay.addEventListener("click", closeDrawerContainer);

function startPersonalizedTimer() { /* টাইমার লজিক */ }
