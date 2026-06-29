import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getHomeView, getBatchesView, getStudyView, getTestView, getMStoreView } from "./dashboard_view.js";

const mainContent = document.getElementById("main-content");
const profileDrawer = document.getElementById("profile-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");

// ================= ১. ইউজার অথেন্টিকেশন এবং ইনফো চেক =================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snapshot = await get(ref(db, 'users/' + user.uid));
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById("drawer-name").innerText = data.name || "mNEET Student";
            document.getElementById("drawer-phone").innerText = data.phone || "No Phone Mapping";
            document.getElementById("avatar-fallback").innerText = data.name ? data.name[0].toUpperCase() : "S";
            document.getElementById("top-bp-coin").innerText = `${data.bpCoins || 0} BP`;
            
            // বাই ডিফল্ট হোম ভিউ লোড করা হচ্ছে
            loadTab("home", data.name);
        }
    } else {
        window.location.href = "index.html";
    }
});

// ================= ২. ড্রয়ার এবং মেনু হ্যান্ডলিং =================
document.getElementById("menu-toggle").addEventListener("click", () => {
    profileDrawer.classList.remove("translate-x-full");
    drawerOverlay.classList.remove("hidden");
});

const closeDrawer = () => {
    profileDrawer.classList.add("translate-x-full");
    drawerOverlay.classList.add("hidden");
};
document.getElementById("menu-close").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

// ================= ৩. রিয়েল-টাইম ডার্ক এবং হোয়াইট মোড সুইচার =================
document.getElementById("theme-switch").addEventListener("change", (e) => {
    if (e.target.checked) {
        document.body.style.backgroundColor = "#0F0F0F";
        document.body.style.color = "#FFFFFF";
    } else {
        document.body.style.backgroundColor = "#F5F5F5";
        document.body.style.color = "#111111";
    }
});

// ================= ৪. ট্যাব চেঞ্জিং ও একটিভ ফিল্টারিং =================
const tabs = document.querySelectorAll(".nav-tab");
tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
        const target = tab.closest('.nav-tab').getAttribute("data-target");
        
        tabs.forEach(t => {
            t.classList.remove("text-golden");
            t.classList.add("text-gray-400");
        });
        
        tab.closest('.nav-tab').classList.remove("text-gray-400");
        tab.closest('.nav-tab').classList.add("text-golden");
        
        const userName = document.getElementById("drawer-name").innerText;
        loadTab(target, userName);
    });
});

function loadTab(target, userName) {
    if (target === "home") {
        mainContent.innerHTML = getHomeView(userName);
        startCountdown();
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

// ================= ৫. নিখুঁত NEET এক্সাম কাউন্টডাউন টাইমার =================
function startCountdown() {
    // প্রতি বছরের মে মাসের প্রথম রবিবার পরীক্ষা হয়, আমরা ২০২৭ এর লক্ষ্য ধরে টাইমার সেট করছি
    const examDate = new Date("May 2, 2027 10:00:00").getTime();

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const difference = examDate - now;

        if (difference < 0) {
            clearInterval(interval);
            return;
        }

        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        if(document.getElementById("days")) {
            document.getElementById("days").innerText = d < 10 ? "0" + d : d;
            document.getElementById("hours").innerText = h < 10 ? "0" + h : h;
            document.getElementById("minutes").innerText = m < 10 ? "0" + m : m;
            document.getElementById("seconds").innerText = s < 10 ? "0" + s : s;
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

// ================= ৬. লগআউট লজিক =================
document.getElementById("btn-logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});
      
