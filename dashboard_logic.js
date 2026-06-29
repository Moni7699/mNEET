import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    renderHomeSection, renderStudySection, renderBatchesSection, renderTestSection, renderMStoreSection,
    renderNotificationSection, renderWPCommunitySection, renderBPCoinGamingSection
} from "./dashboard_view.js";
import { initializeCommunityChat } from "./community_chat.js";

const renderArea = document.getElementById("dashboard-main-render-area");
const backBtn = document.getElementById("dashboard-back-btn");
const homeWidgets = document.getElementById("home-top-widgets");
const drawer = document.getElementById("profile-drawer");
const overlay = document.getElementById("drawer-overlay");

let cacheUserData = null;
let timerMechanismInterval = null;

// ================= ১. ইউজার অথেন্টিকেশন এবং ডাটা সেটিং =================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await get(ref(db, 'users/' + user.uid));
        if (snap.exists()) {
            cacheUserData = snap.val();
            document.getElementById("profile-name-display").innerText = cacheUserData.name || "Student";
            document.getElementById("profile-phone-display").innerText = cacheUserData.phone || "";
            document.getElementById("user-avatar").innerText = cacheUserData.name ? cacheUserData.name[0].toUpperCase() : "M";
            
            // সাইড ড্রয়ারের ইনপুট ফিল্ডগুলোতে ডাটা সেট করা
            document.getElementById("target-college-input").value = cacheUserData.customTargetCollege || "AIIMS Delhi";
            document.getElementById("target-date-input").value = cacheUserData.customTargetDate || "2027-05-02";
            
            bindTopBarClickActions();
            loadViewTab("home");
        }
    } else {
        window.location.href = "index.html";
    }
});

// ================= ২. টপ বারের আইকন ক্লিক অ্যাকশন রাউটিং =================
function bindTopBarClickActions() {
    document.getElementById("noti-btn").onclick = () => loadViewTab("notification_screen");
    document.getElementById("wp-community-btn").onclick = () => loadViewTab("wp_screen");
    document.getElementById("top-bp-trigger-btn").onclick = () => loadViewTab("bp_gaming_screen");
}

function syncBPCoinCountDisplay() {
    const selectedBatch = document.getElementById("batch-view-filter")?.value || "default";
    const coins = cacheUserData?.bpCoinsCourseWise?.[selectedBatch] || cacheUserData?.bpCoins || 0;
    const countBadge = document.getElementById("top-bp-count");
    if (countBadge) countBadge.innerText = `${coins} BP`;
    
    const targetBadge = document.getElementById("college-target-badge");
    if (targetBadge && cacheUserData) {
        targetBadge.innerText = `TARGET: ${cacheUserData.customTargetCollege || "AIIMS DELHI"}`;
    }
}

// ================= ৩. বটম ট্যাব নেভিগেশন কন্ট্রোল =================
const footerTabs = document.querySelectorAll(".footer-tab");
footerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        footerTabs.forEach(t => t.classList.remove("active-tab"));
        tab.classList.add("active-tab");
        loadViewTab(tab.getAttribute("data-target"));
    });
});

function loadViewTab(viewName) {
    // হেডার ও ব্যাক বাটন টগল
    if (viewName === "home") {
        if (backBtn) backBtn.classList.add("hidden-widget");
        if (homeWidgets) homeWidgets.classList.remove("hidden-widget");
    } else {
        if (backBtn) backBtn.classList.remove("hidden-widget");
        if (homeWidgets) homeWidgets.classList.add("hidden-widget");
    }

    clearInterval(timerMechanismInterval);
    const sName = cacheUserData ? cacheUserData.name : "Student";

    // ভিউ রেন্ডারিং সুইচ
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
    // কাস্টম টপ বার স্ক্রিন রাউটিং
    else if (viewName === "notification_screen") {
        renderArea.innerHTML = renderNotificationSection();
    } else if (viewName === "wp_screen") {
        renderArea.innerHTML = renderWPCommunitySection();
        // ৩ নম্বর রিকোয়ারমেন্ট: চ্যাট ও ফটো ইঞ্জিন সচল করা
        initializeCommunityChat(cacheUserData); 
    } else if (viewName === "bp_gaming_screen") {
        const currentBP = cacheUserData ? (cacheUserData.bpCoins || 0) : 0;
        const currentRank = currentBP > 1200 ? "Elite Surgeon" : "Medical Aspirant";
        renderArea.innerHTML = renderBPCoinGamingSection(currentBP, currentRank);
    }
}

// ব্যাক বাটনে ক্লিক করলে হোমে নিয়ে আসবে
if (backBtn) {
    backBtn.addEventListener("click", () => {
        footerTabs.forEach(t => t.classList.remove("active-tab"));
        const homeTab = document.querySelector('[data-target="home"]');
        if (homeTab) homeTab.classList.add("active-tab");
        loadViewTab("home");
    });
}

// ================= ৪. কাস্টম গোল সেটিংস আপডেট ইঞ্জিন =================
document.getElementById("save-goals-btn").addEventListener("click", async () => {
    const tCollege = document.getElementById("target-college-input").value.trim();
    const tDate = document.getElementById("target-date-input").value;
    
    if (!tDate) {
        alert("Please select a target date!");
        return;
    }

    try {
        await update(ref(db, 'users/' + cacheUserData.uid), {
            customTargetCollege: tCollege,
            customTargetDate: tDate
        });
        alert("Targets Updated!");
        
        // লোকাল ক্যাশ আপডেট
        cacheUserData.customTargetCollege = tCollege;
        cacheUserData.customTargetDate = tDate;
        
        closeDrawerContainer();
        loadViewTab("home");
    } catch (err) {
        alert("Error: " + err.message);
    }
});

// ================= ৫. স্টুডেন্টের কাস্টম ডেট অনুযায়ী টাইমার কাউন্টডাউন =================
function startPersonalizedTimer() {
    let targetString = cacheUserData && cacheUserData.customTargetDate ? cacheUserData.customTargetDate + "T10:00:00" : "2027-05-02T10:00:00";
    const targetTime = new Date(targetString).getTime();

    timerMechanismInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetTime - now;

        const dBox = document.getElementById("timer-days");
        if (diff < 0 || !dBox) {
            clearInterval(timerMechanismInterval);
            if (dBox) dBox.innerText = "00";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        dBox.innerText = d < 10 ? "0" + d : d;
        document.getElementById("timer-hours").innerText = h < 10 ? "0" + h : h;
        document.getElementById("timer-mins").innerText = m < 10 ? "0" + m : m;
        document.getElementById("timer-secs").innerText = s < 10 ? "0" + s : s;
    }, 1000);
}

// ================= ৬. ড্রয়ার এবং থিম ট্রু সুইচার =================
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
            
