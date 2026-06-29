import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    renderAdminHomeSection, renderAdminStudySection, renderAdminBatchesSection, renderAdminTestSection, 
    renderAdminMStoreSection, renderAdminSubjectGate, renderAdminChapterPlaylist
} from "./admin_view.js";

// 📦 ৫টি স্পেশাল অ্যাডমিন মিরর অ্যাকশন ফাইলের ইম্পোর্টস
import { loadAdminNcertManager } from "./admin_ncert.js";
import { loadAdminLecturesManager } from "./admin_lectures.js";
import { loadAdminQuizManager } from "./admin_quiz.js";
import { loadAdminSpecialManager } from "./admin_special.js";
import { loadAdminDoubtsManager } from "./admin_doubts.js";

const renderArea = document.getElementById("admin-main-render-area");
const backBtn = document.getElementById("admin-back-btn");
const topWidgets = document.getElementById("admin-top-widgets");
const drawer = document.getElementById("profile-drawer");
const overlay = document.getElementById("drawer-overlay");

let cacheAdminData = null;

// ================= ১. অ্যাডমিন অথেন্টিকেশন ও অ্যাক্সেস কন্ট্রোল =================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // সিকিউরিটি চেক: ইউজার অ্যাডমিন কি না তা ভেরিফাই করা
        const snap = await get(ref(db, 'users/' + user.uid));
        if (snap.exists() && snap.val().role === "admin") {
            cacheAdminData = snap.val();
            
            // টপ বার ও সাইড ড্রয়ার অ্যাকশন বাইন্ডিং
            bindGlobalAdminActions();
            loadAdminTab("home");
        } else {
            alert("Unauthorized Access! Redirecting to student area.");
            window.location.href = "student_dashboard.html";
        }
    } else {
        window.location.href = "index.html";
    }
});

function bindGlobalAdminActions() {
    // হেডার উইজেট অ্যাকশন
    document.getElementById("admin-broadcast-btn").onclick = () => {
        const msg = prompt("Enter global system broadcast notice:");
        if (msg) alert("Notice Broadcasted (Logic integration pending)");
    };

    // সাইড ড্রয়ার টগলস
    document.getElementById("admin-drawer-open-btn").onclick = () => { 
        drawer.className = "drawer-open"; 
        overlay.classList.remove("hidden-widget"); 
    };
    
    const closeDrawer = () => { 
        drawer.className = "drawer-closed"; 
        overlay.classList.add("hidden-widget"); 
    };
    
    document.getElementById("admin-drawer-close-btn").onclick = closeDrawer;
    overlay.onclick = closeDrawer;
    
    document.getElementById("admin-theme-toggle").onchange = (e) => { 
        document.body.className = e.target.checked ? "theme-dark" : "theme-white"; 
    };

    document.getElementById("admin-logout-btn").onclick = () => {
        signOut(auth).then(() => { window.location.href = "index.html"; });
    };
}

// ================= ২. বটম ট্যাব ও রাউটিং মেকানিজম =================
const footerTabs = document.querySelectorAll(".footer-tab");
footerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        footerTabs.forEach(t => t.classList.remove("active-tab"));
        tab.classList.add("active-tab");
        loadAdminTab(tab.getAttribute("data-target"));
    });
});

function loadAdminTab(viewName) {
    if (viewName === "home") {
        backBtn.classList.add("hidden-widget");
        topWidgets.classList.remove("hidden-widget");
    } else {
        backBtn.classList.remove("hidden-widget");
        topWidgets.classList.add("hidden-widget");
    }

    if (viewName === "home") {
        renderArea.innerHTML = renderAdminHomeSection();
        bindHomeAdminActions();
        listenLiveStudentsDirectory();
    } else if (viewName === "study") {
        renderArea.innerHTML = renderAdminStudySection();
        bindStudyCardsRouting();
    } else if (viewName === "batches") {
        renderArea.innerHTML = renderAdminBatchesSection();
    } else if (viewName === "test") {
        renderArea.innerHTML = renderAdminTestSection();
    } else if (viewName === "mstore") {
        renderArea.innerHTML = renderAdminMStoreSection();
    }
}

// ================= ৩. হোম অ্যাকশন ও লাইভ স্টুডেন্ট ট্র্যাকিং =================
function bindHomeAdminActions() {
    document.getElementById("push-motivation-btn").onclick = async () => {
        const type = document.getElementById("admin-motivation-type").value;
        const src = document.getElementById("admin-motivation-src").value.trim();
        if (!src) return;

        await set(ref(db, "global_motivation"), { type: type, payload: src, timestamp: Date.now() });
        alert("Motivation Broadcasted Successfully to all students!");
        document.getElementById("admin-motivation-src").value = "";
    };
}

function listenLiveStudentsDirectory() {
    const tableBody = document.getElementById("admin-student-directory-table");
    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
        if (!snapshot.exists() || !tableBody) return;
        tableBody.innerHTML = "";
        
        const allUsers = snapshot.val();
        Object.keys(allUsers).forEach(uid => {
            const user = allUsers[uid];
            if (user.role === "admin") return; 

            const tr = `
                <tr style="border-bottom: 1px solid var(--border-line);">
                    <td style="padding: 12px; font-weight:700;">
                        ${user.name || "N/A"}<br>
                        <span style="font-size:10px; color:var(--text-para); font-weight:500;">${user.phone || "No Phone"}</span>
                    </td>
                    <td style="padding: 12px; color:var(--gold); font-weight:700;">${user.customTargetCollege || "Not Set"}</td>
                    <td style="padding: 12px; font-weight:800; color:var(--neon-green);">${user.bpCoins || 0} BP</td>
                    <td style="padding: 12px;">
                        <button class="adjust-bp-btn link-btn" data-uid="${uid}" data-current="${user.bpCoins || 0}" style="color:var(--gold); font-size: 14px;"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", tr);
        });

        // বিপি কয়েন ইনস্ট্যান্ট এডিট অ্যাকশন
        document.querySelectorAll(".adjust-bp-btn").forEach(btn => {
            btn.onclick = async () => {
                const uid = btn.getAttribute("data-uid");
                const current = parseInt(btn.getAttribute("data-current"));
                const newCoins = prompt(`Enter new BP Coins Balance (Current: ${current}):`, current);
                if (newCoins !== null && !isNaN(newCoins)) {
                    await update(ref(db, `users/${uid}`), { bpCoins: parseInt(newCoins) });
                }
            };
        });
    });
}

// ================= ৪. স্টাডি নোডস ও চ্যাপ্টার জেনারেটর মেকানিজম =================
function bindStudyCardsRouting() {
    document.querySelectorAll(".admin-study-card-trigger").forEach(card => {
        card.onclick = () => {
            const origin = card.getAttribute("data-origin");
            if (origin === "doubts") {
                loadAdminDoubtsManager(renderArea);
            } else {
                renderArea.innerHTML = renderAdminSubjectGate(origin);
                bindSubjectGateClicks();
            }
        };
    });
}

function bindSubjectGateClicks() {
    document.querySelectorAll(".admin-subject-select-btn").forEach(btn => {
        btn.onclick = () => {
            const origin = btn.getAttribute("data-origin");
            const subject = btn.getAttribute("data-subject");
            renderArea.innerHTML = renderAdminChapterPlaylist(subject, origin);
            bindChapterPlaylistActions(subject, origin);
        };
    });
}

function bindChapterPlaylistActions(subject, originCard) {
    document.getElementById("admin-create-chapter-node-btn").onclick = async () => {
        const title = document.getElementById("new-chapter-title-input").value.trim();
        if (!title) return;

        const chapterId = title.toLowerCase().replace(/[^a-z0-9]/g, "_");
        await set(ref(db, `chapters/${subject}/${chapterId}`), { id: chapterId, title: title, timestamp: Date.now() });
        
        alert(`Chapter Node [${title}] successfully deployed!`);
        document.getElementById("new-chapter-title-input").value = "";
        refreshAdminChaptersList(subject, originCard);
    };

    refreshAdminChaptersList(subject, originCard);
}

async function refreshAdminChaptersList(subject, originCard) {
    const container = document.getElementById("admin-chapters-inject-container");
    if (!container) return;

    const snap = await get(ref(db, `chapters/${subject}`));
    if (snap.exists()) {
        container.innerHTML = "";
        const chaptersData = snap.val();
        Object.keys(chaptersData).forEach(id => {
            const ch = chaptersData[id];
            const div = `
                <div class="card-mneet border-gold admin-chapter-item-btn" data-chapter="${ch.id}" data-subject="${subject}" data-origin="${originCard}" style="padding:14px; cursor:pointer; margin-bottom: 8px;">
                    <h4 style="font-size:14px; margin:0;">${ch.title}</h4>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", div);
        });

        // চ্যাপ্টার ক্লিক ইভেন্ট - ডেডিকেটেড অ্যাডমিন ফাইল কল
        document.querySelectorAll(".admin-chapter-item-btn").forEach(item => {
            item.onclick = () => {
                const origin = item.getAttribute("data-origin");
                const sub = item.getAttribute("data-subject");
                const chap = item.getAttribute("data-chapter");

                if (origin === "ncert") loadAdminNcertManager(sub, chap, renderArea);
                else if (origin === "lectures") loadAdminLecturesManager(sub, chap, renderArea);
                else if (origin === "quiz") loadAdminQuizManager(sub, chap, renderArea);
                else if (origin === "special") loadAdminSpecialManager(sub, chap, renderArea);
            };
        });
    }
}

// ================= ৫. গ্লোবাল ব্যাক বাটন =================
backBtn.addEventListener("click", () => {
    footerTabs.forEach(t => t.classList.remove("active-tab"));
    document.querySelector('[data-target="home"]')?.classList.add("active-tab");
    loadAdminTab("home");
});
            
