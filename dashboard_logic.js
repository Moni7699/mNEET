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

// ================= ১. অথেন্টিকেশন ও পার্সোনালাইজড ডাটা লোড =================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentStudentUser = user;
        const snap = await get(ref(db, 'users/' + user.uid));
        if (snap.exists()) {
            const data = snap.val();
            document.getElementById("profile-name-display").innerText = data.name || "Student";
            document.getElementById("profile-phone-display").innerText = data.phone || "";
            document.getElementById("user-avatar").innerText = data.name ? data.name[0].toUpperCase() : "M";
            
            // ডায়নামিক সেটিংস ইনপুট সেট করা সাইড প্যানেলে
            document.getElementById("target-college-input").value = data.customTargetCollege || "AIIMS Delhi";
            document.getElementById("target-date-input").value = data.customTargetDate || "2027-05-02";
            
            loadViewTab("home");
        }
    } else {
        window.location.href = "index.html";
    }
});

function syncBPCoinAndTargetLabels() {
    get(ref(db, 'users/' + currentStudentUser.uid)).then((snap) => {
        if (snap.exists()) {
            const uData = snap.val();
            // বিপি কয়েন সিঙ্ক
            const selectedBatch = document.getElementById("batch-view-filter")?.value || "default";
            const coins = uData.bpCoinsCourseWise?.[selectedBatch] || uData.bpCoins || 0;
            document.getElementById("top-bp-count").innerText = `${coins} BP`;
            
            // কলেজ গোল পোস্ট আপডেট
            const targetBadge = document.getElementById("college-target-badge");
            if(targetBadge) {
                targetBadge.innerText = `TARGET: ${uData.customTargetCollege || "AIIMS DELHI"}`;
            }
        }
    });
}

// ================= ২. কাস্টম গোল ও এক্সাম ডেট সেভ ইঞ্জিন =================
document.getElementById("save-goals-btn").addEventListener("click", async () => {
    const targetCollege = document.getElementById("target-college-input").value.trim();
    const targetDate = document.getElementById("target-date-input").value;

    if(!targetDate) {
        alert("Please select your target exam date!");
        return;
    }

    try {
        await update(ref(db, 'users/' + currentStudentUser.uid), {
            customTargetCollege: targetCollege,
            customTargetDate: targetDate
        });
        alert("My Target Settings Saved Successfully!");
        closeDrawerContainer();
        loadViewTab("home"); // টাইমার রিসেট করার জন্য রিলোড
    } catch (err) {
        alert("Error saving: " + err.message);
    }
});

// ================= ৩. ট্যাব রাউটিং ও নেভিগেশন =================
const footerTabs = document.querySelectorAll(".footer-tab");
footerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        footerTabs.forEach(t => t.classList.remove("active-tab"));
        tab.classList.add("active-tab");
        loadViewTab(tab.getAttribute("data-target"));
    });
});

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
        syncBPCoinAndTargetLabels();
        startPersonalizedTimer();
        document.getElementById("batch-view-filter").addEventListener("change", syncBPCoinAndTargetLabels);
    } else if (viewName === "study") {
        renderArea.innerHTML = renderStudySection();
    } else if (viewName === "batches") {
        renderArea.innerHTML = renderBatchesSection();
    } else if (viewName === "test") {
        renderArea.innerHTML = renderTestSection();
    } else if (viewName === "mstore") {
        renderArea.innerHTML = renderMStoreSection();
    }
}

backBtn.addEventListener("click", () => {
    footerTabs.forEach(t => t.classList.remove("active-tab"));
    document.querySelector('[data-target="home"]').classList.add("active-tab");
    loadViewTab("home");
});

// ================= ৪. স্টুডেন্টের সেট করা কাস্টম ডেট অনুযায়ী লাইভ টাইমার =================
async function startPersonalizedTimer() {
    const snap = await get(ref(db, 'users/' + currentStudentUser.uid));
    let targetString = "2027-05-02T10:00:00";
    if(snap.exists() && snap.val().customTargetDate) {
        targetString = snap.val().customTargetDate + "T10:00:00";
    }
    
    const targetTime = new Date(targetString).getTime();

    timerMechanismInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff < 0 || !document.getElementById("timer-days")) {
            clearInterval(timerMechanismInterval);
            if(document.getElementById("timer-days")) {
                document.getElementById("timer-days").innerText = "EXAM!";
            }
            return;
        }

        document.getElementById("timer-days").innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById("timer-hours").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById("timer-mins").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById("timer-secs").innerText = Math.floor((diff % (1000 * 60)) / 1000);
    }, 1000);
}

// ================= ৫. ড্রয়ার এবং থিম হ্যান্ডলার =================
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

document.getElementById("dashboard-theme-toggle").addEventListener("change", (e) => {
    document.body.className = e.target.checked ? "theme-dark" : "theme-white";
});

document.getElementById("logout-submit-btn").addEventListener("click", () => {
    signOut(auth).then(() => { window.location.href = "index.html"; });
});
            
