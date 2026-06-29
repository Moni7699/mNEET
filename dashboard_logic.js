import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    renderHomeSection, renderStudySection, renderBatchesSection, renderTestSection, renderMStoreSection 
} from "./dashboard_view.js";

const renderArea = document.getElementById("dashboard-main-render-area");
const backBtn = document.getElementById("dashboard-back-btn");
const homeWidgets = document.getElementById("home-top-widgets");
const drawer = document.getElementById("profile-drawer");
const overlay = document.getElementById("drawer-overlay");

let cacheUserData = null;
let countdownMechanismInterval = null;

// ================= ১. ইউজার ডাটা অথেন্টিকেশন ও ক্যাশিং =================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await get(ref(db, 'users/' + user.uid));
        if (snap.exists()) {
            cacheUserData = snap.val();
            document.getElementById("profile-name-display").innerText = cacheUserData.name || "mNEET Student";
            document.getElementById("profile-phone-display").innerText = cacheUserData.phone || "";
            document.getElementById("user-avatar").innerText = cacheUserData.name ? cacheUserData.name[0].toUpperCase() : "M";
            
            // কোর্স অনুযায়ী ডাইনামিক বিপি কয়েন হ্যান্ডলিং
            triggerDynamicBPCoinSync();
            loadWorkspaceTab("home");
        }
    } else {
        window.location.href = "index.html";
    }
});

function triggerDynamicBPCoinSync() {
    const selectedBatch = document.getElementById("batch-view-filter")?.value || "default_course";
    const coins = cacheUserData?.bpCoinsCourseWise?.[selectedBatch] || cacheUserData?.bpCoins || 0;
    document.getElementById("top-bp-count").innerText = `${coins} BP`;
}

// ================= ২. ট্যাব চেঞ্জিং নেভিগেশন কন্ট্রোল =================
const footerTabs = document.querySelectorAll(".footer-tab");
footerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        footerTabs.forEach(t => t.classList.remove("active-tab"));
        tab.classList.add("active-tab");
        
        const targetView = tab.getAttribute("data-target");
        loadWorkspaceTab(targetView);
    });
});

function loadWorkspaceTab(viewName) {
    // টপ বার উইজেটস ফিল্টারিং (প্রত্যেক স্ক্রিন আলাদা হলে হোম ছাড়া বাকিগুলোতে ব্যাক বাটন ও কয়েন থাকবে)
    if (viewName === "home") {
        backBtn.classList.add("hidden-widget");
        homeWidgets.classList.remove("hidden-widget");
    } else {
        backBtn.classList.remove("hidden-widget");
        homeWidgets.classList.add("hidden-widget");
    }

    clearInterval(countdownMechanismInterval);
    const studentName = cacheUserData ? cacheUserData.name : "Student";

    if (viewName === "home") {
        renderArea.innerHTML = renderHomeSection(studentName);
        triggerDynamicBPCoinSync();
        startTargetCountdown();
        // ডাইনামিক ফিল্টার ইভেন্ট বাইন্ডিং
        document.getElementById("batch-view-filter").addEventListener("change", triggerDynamicBPCoinSync);
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

// ব্যাক বাটন ক্লিক অ্যাকশন ফিক্স (ক্লিক করলে হোমে ব্যাক করাবে)
backBtn.addEventListener("click", () => {
    footerTabs.forEach(t => t.classList.remove("active-tab"));
    document.querySelector('[data-target="home"]').classList.add("active-tab");
    loadWorkspaceTab("home");
});

// ================= ৩. রিয়েল-টাইম লাইভ কন্টিনিউয়াস টাইমার =================
function startTargetCountdown() {
    const neetExamTargetDate = new Date("May 2, 2027 10:00:00").getTime();
    
    countdownMechanismInterval = setInterval(() => {
        const timeNow = new Date().getTime();
        const gapDistance = neetExamTargetDate - timeNow;
        
        if (gapDistance < 0 || !document.getElementById("timer-days")) {
            clearInterval(countdownMechanismInterval);
            return;
        }

        const d = Math.floor(gapDistance / (1000 * 60 * 60 * 24));
        const h = Math.floor((gapDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((gapDistance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((gapDistance % (1000 * 60)) / 1000);

        document.getElementById("timer-days").innerText = d < 10 ? "0" + d : d;
        document.getElementById("timer-hours").innerText = h < 10 ? "0" + h : h;
        document.getElementById("timer-mins").innerText = m < 10 ? "0" + m : m;
        document.getElementById("timer-secs").innerText = s < 10 ? "0" + s : s;
    }, 1000);
}

// ================= ৪. থিম চেঞ্জার এবং হ্যামবার্গার ড্রয়ার লজিক =================
document.getElementById("drawer-open-btn").addEventListener("click", () => {
    drawer.className = "profile-drawer-open";
    overlay.classList.remove("hidden-widget");
});

const closeDrawerContainer = () => {
    drawer.className = "profile-drawer-closed";
    overlay.classList.add("hidden-widget");
};
document.getElementById("drawer-close-btn").addEventListener("click", closeDrawerContainer);
overlay.addEventListener("click", closeDrawerContainer);

document.getElementById("dashboard-theme-toggle").addEventListener("change", (e) => {
    if (e.target.checked) {
        document.body.className = "theme-dark";
    } else {
        document.body.className = "theme-white";
    }
});

// লগআউট প্রসেস
document.getElementById("logout-submit-btn").addEventListener("click", () => {
    signOut(auth).then(() => { window.location.href = "index.html"; });
});
