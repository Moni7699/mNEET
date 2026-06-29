import { db } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * লেকচার, নোটস এবং ডিলিপি আপলোড ও কন্ট্রোল করার মূল অ্যাডমিন ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি
 * @param {HTMLElement} renderArea - অ্যাডমিন প্যানেলের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadAdminLecturesManager(subject, chapter, renderArea) {
    // লোডিং স্ক্রিন
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Syncing Live Lectures Database...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে এক্সিস্টিং লেকচার ডাটা তুলে আনা
        const lectureRef = ref(db, `lectures_content/${subject}/${chapter}`);
        const snapshot = await get(lectureRef);

        let videoUrl = "";
        let notesUrl = "";
        let dppUrl = "";

        if (snapshot.exists()) {
            const data = snapshot.val();
            videoUrl = data.videoUrl || "";
            notesUrl = data.notesUrl || "";
            dppUrl = data.dppUrl || "";
        }

        // ইউআই রেন্ডার
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(243, 185, 23, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--gold); font-weight: 800; text-transform: uppercase;">LECTURE & DPP INJECTOR</span>
                <h2 style="font-size: 18px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">Node: ${chapter.toUpperCase()}</h2>
                <p style="font-size: 11px; color: var(--text-para);">Subject: ${subject.toUpperCase()} | Stream Video & Syllabi Reference</p>
            </div>

            <div class="card-mneet border-gold" style="padding: 14px; margin-bottom: 14px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;"><i class="fab fa-youtube"></i> YouTube Video Embed Link</label>
                <input type="text" id="admin-lecture-video-input" class="input-field" value="${videoUrl}" placeholder="e.g. https://www.youtube.com/embed/VIDEO_ID">
                <p style="font-size: 9px; color: var(--text-para); margin-top: -6px; margin-bottom: 8px;">*Make sure to use the <b>/embed/</b> format link for seamless viewing inside the student app.</p>
            </div>

            <div class="card-mneet border-blue" style="padding: 14px; margin-bottom: 14px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;"><i class="fas fa-file-pdf"></i> Class Revision Notes PDF URL</label>
                <input type="text" id="admin-lecture-notes-input" class="input-field" value="${notesUrl}" placeholder="Paste PDF direct drive download URL...">
            </div>

            <div class="card-mneet border-purple" style="padding: 14px; margin-bottom: 18px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;"><i class="fas fa-pen-nib"></i> Daily Practice Sheet (DPP) PDF URL</label>
                <input type="text" id="admin-lecture-dpp-input" class="input-field" value="${dppUrl}" placeholder="Paste DPP direct target sheet link...">
            </div>

            <button id="admin-save-lectures-hub-btn" class="btn-mneet" style="background: linear-gradient(135deg, var(--neon-green) 0%, #059669) !important; color: white !important;">
                Synchronize Lecture Hub Data 🚀
            </button>
        `;

        // ================= সেভ অ্যাকশন লিসেনার লজিক =================
        document.getElementById("admin-save-lectures-hub-btn").onclick = async () => {
            const currentVideo = document.getElementById("admin-lecture-video-input").value.trim();
            const currentNotes = document.getElementById("admin-lecture-notes-input").value.trim();
            const currentDpp = document.getElementById("admin-lecture-dpp-input").value.trim();

            const btn = document.getElementById("admin-save-lectures-hub-btn");
            btn.disabled = true;
            btn.innerText = "DEPLOYING HUB MATRIX...";

            try {
                // ফায়ারবেস ডাটাবেজে সম্পূর্ণ মেকানিজম একবারে পুশ বা আপডেট করা
                await set(ref(db, `lectures_content/${subject}/${chapter}`), {
                    title: chapter.replace(/_/g, " ").toUpperCase(),
                    videoUrl: currentVideo,
                    notesUrl: currentNotes,
                    dppUrl: currentDpp,
                    lastUpdated: Date.now()
                });

                alert("Alhamdulillah! Video, Notes and DPP successfully linked to live student interface.");
                
                // বাটন স্টেট রিলিজ এবং রিলোড
                btn.disabled = false;
                btn.innerText = "Synchronize Lecture Hub Data 🚀";
                loadAdminLecturesManager(subject, chapter, renderArea);

            } catch (err) {
                alert("Lecture Sync Error: " + err.message);
                btn.disabled = false;
                btn.innerText = "Synchronize Lecture Hub Data 🚀";
            }
        };

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Admin Lecture Error: ${err.message}</div>`;
    }
    }
  
