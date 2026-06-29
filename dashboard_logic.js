import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getHomeView, getBatchesView, getStudyView, getTestView, getMStoreView } from "./dashboard_view.js";

const mainContent = document.getElementById("main-content");
const backBtn = document.getElementById("back-btn");
const homeLeftOptions = document.getElementById("home-left-options");
const profileDrawer = document.getElementById("profile-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");

let currentActiveTab = "home";
let userDataCache = null;

// ================= ১. ইউজার ডাটা এবং কোর্স ভিত্তিক BP কয়েন লোড =================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snapshot = await get(ref(db, 'users/' + user.uid));
        if (snapshot.exists()) {
            userDataCache = snapshot.val();
            document.getElementById("drawer-name").innerText = userDataCache.name || "Student";
            document.getElementById("drawer-phone").innerText = userDataCache.phone || "";
            
            // কোর্স সিলেক্টের উপর ডিপেন্ড করে BP কয়েন ডাইনামিক আপডেট
            updateDynamicBPCoin();
            loadTab("home");
        }
    } else {
        window.location.href = "index.html";
    }
});

function updateDynamicBPCoin() {
    const selectedBatch = document.getElementById("home-batch-select")?.value || "default";
    // যদি ডাটাবেজে কোর্স অনুযায়ী স্পেসিফিক কয়েন থাকে তা দেখাবে, নাহলে ডিফল্ট দেখাবে
    const coins = userDataCache?.bpCoinsCourseWise?.[selectedBatch] || userDataCache?.bpCoins || 0;
    document.getElementById("top-bp-coin").innerText = `${coins} BP`;
}

// ================= ২. নিখুঁত ডার্ক ও হোয়াইট মোড সুইচার =================
document.getElementById("theme-switch").addEventListener("change", (e) => {
    if (e.target.checked) {
        document.body.classList.remove("theme-white");
        document.body.classList.add("theme-dark");
    } else {
        document.body.classList.remove("theme-dark");
        document.body.classList.add("theme-white");
    }
});

// ================= ৩. স্ক্রিন ট্র্যাকিং এবং ব্যাক বাটন টগল লজিক =================
backBtn.addEventListener("click", () => {
    loadTab("home"); // ব্যাক বাটনে ক্লিক করলে সবসময় হোম স্ক্রিনে নিয়ে আসবে
});

function toggleTopBarButtons(tabName) {
    if (tabName === "home") {
        backBtn.classList.add("hidden");
        homeLeftOptions.classList.remove("hidden");
    } else {
        backBtn.classList.remove("hidden"); // অন্য সব স্ক্রিনে ব্যাক বাটন অন হবে
        homeLeftOptions.classList.add("hidden");
    }
}

// ================= ৪. ট্যাব নেভিগেশন প্রসেস =================
const tabs = document.querySelectorAll(".nav-tab");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = tab.closest('.nav-tab').getAttribute("data-target");
        
        tabs.forEach(t => t.classList.replace("text-golden", "text-gray-400"));
        tab.closest('.nav-tab').classList.replace("text-gray-400", "text-golden");
        
        loadTab(target);
    });
});

function loadTab(target) {
    currentActiveTab = target;
    toggleTopBarButtons(target);
    const name = userDataCache ? userDataCache.name : "Student";

    if (target === "home") {
        mainContent.innerHTML = getHomeView(name);
        startCountdown();
        // ব্যাচ ড্রপডাউন চেঞ্জ করলে কয়েনও ডাইনামিক চেঞ্জ হবে
        document.getElementById("home-batch-select").addEventListener("change", updateDynamicBPCoin);
    } else if (target === "batches") {
        mainContent.innerHTML = getBatchesView();
    } else if (target === "study") {
        mainContent.innerHTML = getStudyView();
    } else if (target === "test") {
        mainContent.innerHTML = getTestView();
    } else if (target === "mstore") {
        mainContent.innerHTML = getMStoreView();
    }
}

// ================= ৫. টাইমার টিক লজিক =================
function startCountdown() {
    const examDate = new Date("May 2, 2027 10:00:00").getTime();
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = examDate - now;
        if (diff < 0 || currentActiveTab !== "home" || !document.getElementById("days")) {
            clearInterval(interval);
            return;
        }
        document.getElementById("days").innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById("hours").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById("minutes").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById("seconds").innerText = Math.floor((diff % (1000 * 60)) / 1000);
    }, 1000);
}

// ড্রয়ার ওপেন/ক্লোজ
document.getElementById("menu-toggle").addEventListener("click", () => { profileDrawer.classList.remove("translate-x-full"); drawerOverlay.classList.remove("hidden"); });
const closeDrawer = () => { profileDrawer.classList.add("translate-x-full"); drawerOverlay.classList.add("hidden"); };
document.getElementById("menu-close").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);
                                    
