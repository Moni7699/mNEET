import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    renderHomeSection, renderStudySection, renderBatchesSection, renderTestSection, renderMStoreSection,
    renderNotificationSection, renderWPCommunitySection, renderBPCoinGamingSection, renderSubjectGate, renderChapterPlaylist
} from "./dashboard_view.js";
import { initializeCommunityChat, createOrJoinMultiplayerBattle } from "./community_chat.js";

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

function bindTopBarClickActions() {
    document.getElementById("noti-btn").onclick = () => loadViewTab("notification_screen");
    document.getElementById("wp-community-btn").onclick = () => loadViewTab("wp_screen");
    document.getElementById("top-bp-trigger-btn").onclick = () => loadViewTab("bp_gaming_screen");
}

function syncBPCoinCountDisplay() {
    const selectedBatch = document.getElementById("batch-view-filter")?.value || "default";
    const coins = cacheUserData?.bpCoinsCourseWise?.[selectedBatch] || cacheUserData?.bpCoins || 0;
    if(document.getElementById("top-bp-count")) document.getElementById("top-bp-count").innerText = `${coins} BP`;
    if(document.getElementById("college-target-badge")) {
        document.getElementById("college-target-badge").innerText = `TARGET: ${cacheUserData.customTargetCollege || "AIIMS DELHI"}`;
    }
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
    if (viewName === "home") {
        backBtn.classList.add("hidden-widget");
        homeWidgets.classList.remove("hidden-widget");
    } else {
        backBtn.classList.remove("hidden-widget");
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
        bindStudyRoutingEvents();
    } else if (viewName === "batches") {
        renderArea.innerHTML = renderBatchesSection();
    } else if (viewName === "test") {
        renderArea.innerHTML = renderTestSection();
    } else if (viewName === "mstore") {
        renderArea.innerHTML = renderMStoreSection();
    } else if (viewName === "notification_screen") {
        renderArea.innerHTML = renderNotificationSection();
    } else if (viewName === "wp_screen") {
        renderArea.innerHTML = renderWPCommunitySection();
        initializeCommunityChat(cacheUserData); 
    } else if (viewName === "bp_gaming_screen") {
        const currentBP = cacheUserData ? (cacheUserData.bpCoins || 0) : 0;
        renderArea.innerHTML = renderBPCoinGamingSection(currentBP, "Medical Aspirant");
    }
}

function bindStudyRoutingEvents() {
    document.getElementById("trigger-ncert-reading")?.addEventListener("click", () => {
        renderArea.innerHTML = renderSubjectGate("ncert_reading");
        bindSubjectGateClicks();
    });
    document.getElementById("trigger-lectures")?.addEventListener("click", () => {
        renderArea.innerHTML = renderSubjectGate("lectures");
        bindSubjectGateClicks();
    });
    document.getElementById("trigger-quiz")?.addEventListener("click", () => {
        renderArea.innerHTML = renderSubjectGate("quiz");
        bindSubjectGateClicks();
    });
}

function bindSubjectGateClicks() {
    document.querySelectorAll(".subject-select-btn").forEach(btn => {
        btn.onclick = () => {
            renderArea.innerHTML = renderChapterPlaylist(btn.getAttribute("data-subject"), btn.getAttribute("data-origin"));
            bindChapterClicks();
        };
    });
}

function bindChapterClicks() {
    document.querySelectorAll(".chapter-item-btn").forEach(item => {
        item.onclick = () => {
            if(item.getAttribute("data-origin") === "quiz") {
                createOrJoinMultiplayerBattle(item.getAttribute("data-chapter"), cacheUserData, renderArea);
            } else {
                renderArea.innerHTML = `<div class="card-mneet border-blue">📚 Opening Material Engine...</div>`;
            }
        };
    });
}

backBtn.addEventListener("click", () => {
    footerTabs.forEach(t => t.classList.remove("active-tab"));
    document.querySelector('[data-target="home"]')?.classList.add("active-tab");
    loadViewTab("home");
});

document.getElementById("drawer-open-btn").onclick = () => { drawer.className = "drawer-open"; overlay.classList.remove("hidden-widget"); };
const closeDrawerContainer = () => { drawer.className = "drawer-closed"; overlay.classList.add("hidden-widget"); };
document.getElementById("drawer-close-btn").onclick = closeDrawerContainer;
overlay.onclick = closeDrawerContainer;
document.getElementById("dashboard-theme-toggle").onchange = (e) => { document.body.className = e.target.checked ? "theme-dark" : "theme-white"; };

document.getElementById("save-goals-btn").onclick = async () => {
    const tCollege = document.getElementById("target-college-input").value.trim();
    const tDate = document.getElementById("target-date-input").value;
    if (!tDate) return;
    await update(ref(db, 'users/' + cacheUserData.uid), { customTargetCollege: tCollege, customTargetDate: tDate });
    cacheUserData.customTargetCollege = tCollege; cacheUserData.customTargetDate = tDate;
    closeDrawerContainer(); loadViewTab("home");
};

function startPersonalizedTimer() {
    let targetString = cacheUserData && cacheUserData.customTargetDate ? cacheUserData.customTargetDate + "T10:00:00" : "2027-05-02T10:00:00";
    const targetTime = new Date(targetString).getTime();
    timerMechanismInterval = setInterval(() => {
        const diff = targetTime - new Date().getTime();
        const dBox = document.getElementById("timer-days");
        if (diff < 0 || !dBox) { clearInterval(timerMechanismInterval); return; }
        dBox.innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById("timer-hours").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById("timer-mins").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById("timer-secs").innerText = Math.floor((diff % (1000 * 60)) / 1000);
    }, 1000);
        }
            
