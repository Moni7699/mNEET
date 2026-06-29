import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    renderHomeSection, renderStudySection, renderBatchesSection, renderTestSection, renderMStoreSection,
    renderNotificationSection, renderWPCommunitySection, renderBPCoinGamingSection
} from "./dashboard_view.js";

const renderArea = document.getElementById("dashboard-main-render-area");
const backBtn = document.getElementById("dashboard-back-btn");
const homeWidgets = document.getElementById("home-top-widgets");
const drawer = document.getElementById("profile-drawer");
const overlay = document.getElementById("drawer-overlay");

let cacheUserData = null;
let timerMechanismInterval = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await get(ref(db, 'users/' + user.uid));
        if (snap.exists()) {
            cacheUserData = snap.val();
            document.getElementById("profile-name-display").innerText = cacheUserData.name || "Student";
            document.getElementById("profile-phone-display").innerText = cacheUserData.phone || "";
            
            document.getElementById("target-college-input").value = cacheUserData.customTargetCollege || "AIIMS Delhi";
            document.getElementById("target-date-input").value = cacheUserData.customTargetDate || "2027-05-02";
            
            bindTopBarClickActions();
            loadViewTab("home");
        }
    } else {
        window.location.href = "index.html";
    }
});

// 🚀 টপ বারের নোটিফিকেশন, হোয়াটসঅ্যাপ এবং বিপি কয়েন স্ক্রিন রাউটিং বাইন্ডিং
function bindTopBarClickActions() {
    document.getElementById("noti-btn").addEventListener("click", () => loadViewTab("notification_screen"));
    document.getElementById("wp-community-btn").addEventListener("click", () => loadViewTab("wp_screen"));
    document.getElementById("top-bp-trigger-btn").addEventListener("click", () => loadViewTab("bp_gaming_screen"));
}

function syncBPCoinCountDisplay() {
    const selectedBatch = document.getElementById("batch-view-filter")?.value || "default";
    const coins = cacheUserData?.bpCoinsCourseWise?.[selectedBatch] || cacheUserData?.bpCoins || 0;
    document.getElementById("top-bp-count").innerText = `${coins} BP`;
}

const footerTabs = document.querySelectorAll(".footer-tab");
footerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        footerTabs.forEach(t => t.classList.remove("active-tab"));
        tab.classList.add("active-tab");
        loadViewTab(tab.getAttribute("data-target"));
    });
});

function loadViewTab(viewName) {
    // টপ বার ম্যানেজমেন্ট
    if (viewName === "home") {
        backBtn.classList.add("hidden-widget");
        homeWidgets.classList.remove("hidden-widget");
    } else {
        backBtn.classList.remove("hidden-widget"); // অন্য সব স্ক্রিনে ব্যাক বাটন অন হবে
        homeWidgets.classList.add("hidden-widget");
    }

    clearInterval(timerMechanismInterval);
    const sName = cacheUserData ? cacheUserData.name : "Student";

    if (viewName === "home") {
        renderArea.innerHTML = renderHomeSection(sName);
        syncBPCoinCountDisplay();
        startPersonalizedTimer();
        document.getElementById("batch-view-filter").addEventListener("change", syncBPCoinCountDisplay);
    } else if (viewName === "study") {
        renderArea.innerHTML = renderStudySection();
    } else if (viewName === "batches") {
        renderArea.innerHTML = renderBatchesSection();
    } else if (viewName === "test") {
        renderArea.innerHTML = renderTestSection();
    } else if (viewName === "mstore") {
        renderArea.innerHTML = renderMStoreSection();
    } 
    // কাস্টম স্ক্রিন ডাইনামিক ইনজেকশন
    else if (viewName === "notification_screen") {
        renderArea.innerHTML = renderNotificationSection();
    } else if (viewName === "wp_screen") {
        renderArea.innerHTML = renderWPCommunitySection();
    } else if (viewName === "bp_gaming_screen") {
        const currentBP = cacheUserData ? (cacheUserData.bpCoins || 0) : 0;
        const currentRank = currentBP > 1200 ? "Elite Surgeon" : "Medical Aspirant";
        renderArea.innerHTML = renderBPCoinGamingSection(currentBP, currentRank);
    }
}

backBtn.addEventListener("click", () => {
    footerTabs.forEach(t => t.classList.remove("active-tab"));
    document.querySelector('[data-target="home"]').classList.add("active-tab");
    loadViewTab("home");
});

// ড্রয়ার ও থিম টগল অ্যাকশন
document.getElementById("drawer-open-btn").addEventListener("click", () => { drawer.className = "drawer-open"; overlay.classList.remove("hidden-widget"); });
const closeDrawerContainer = () => { drawer.className = "drawer-closed"; overlay.classList.add("hidden-widget"); };
document.getElementById("drawer-close-btn").addEventListener("click", closeDrawerContainer);
overlay.addEventListener("click", closeDrawerContainer);
document.getElementById("dashboard-theme-toggle").addEventListener("change", (e) => {
    document.body.className = e.target.checked ? "theme-dark" : "theme-white";
});

// কাস্টম গোল সেটিংস আপডেট ইঞ্জিন
document.getElementById("save-goals-btn").addEventListener("click", async () => {
    const tCollege = document.getElementById("target-college-input").value.trim();
    const tDate = document.getElementById("target-date-input").value;
    if(!tDate) return;
    await update(ref(db, 'users/' + currentStudentUser.uid), { customTargetCollege: tCollege, customTargetDate: tDate });
    alert("Targets Updated!"); closeDrawerContainer(); loadViewTab("home");
});

function startPersonalizedTimer() { /* কাস্টম কাউন্টডাউন মেকানিজম টিক্স */ }
