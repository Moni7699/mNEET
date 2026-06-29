import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    renderHomeSection, renderStudySection, renderSubjectGate, renderChapterPlaylist 
} from "./dashboard_view.js";
import { createOrJoinMultiplayerBattle } from "./community_chat.js";

const renderArea = document.getElementById("dashboard-main-render-area");
const backBtn = document.getElementById("dashboard-back-btn");
let cacheUserData = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await get(ref(db, 'users/' + user.uid));
        if (snap.exists()) {
            cacheUserData = snap.val();
            loadViewTab("home");
        }
    }
});

// ৪-স্তরের স্টাডি জোন ক্লিক বাইন্ডিং রুলস
function bindStudyRoutingEvents() {
    // স্তর ১ ট্রিপল রাউটার ট্রিগার
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

// স্তর ২ ট্র্যাকার
function bindSubjectGateClicks() {
    const btns = document.querySelectorAll(".subject-select-btn");
    btns.forEach(btn => {
        btn.onclick = () => {
            const sub = btn.getAttribute("data-subject");
            const origin = btn.getAttribute("data-origin");
            renderArea.innerHTML = renderChapterPlaylist(sub, origin);
            bindChapterClicks();
        };
    });
}

// স্তর ৩ এবং ৪: চ্যাপ্টার থেকে মাল্টিপ্লেয়ার ব্যাটল জোন সুইচিং
function bindChapterClicks() {
    const items = document.querySelectorAll(".chapter-item-btn");
    items.forEach(item => {
        item.onclick = () => {
            const origin = item.getAttribute("data-origin");
            const chapter = item.getAttribute("data-chapter");
            
            if(origin === "quiz") {
                // ১০ জনের মাল্টিপ্লেয়ার ব্যাটল রিয়েল-টাইম রুম ক্রিয়েশন অ্যাক্টিভেট
                createOrJoinMultiplayerBattle(chapter, cacheUserData, renderArea);
            } else {
                renderArea.innerHTML = `<div class="card-mneet border-blue" style="padding:20px;">📚 Opening Line-By-Line Content for ${chapter}...</div>`;
            }
        };
    });
}

function loadViewTab(viewName) {
    if(viewName === "study") {
        renderArea.innerHTML = renderStudySection();
        bindStudyRoutingEvents();
    }
    // হোম ও অন্যান্য বেসিক ট্যাব ম্যাপ
            }
            
