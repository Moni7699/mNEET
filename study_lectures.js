import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * লেকচার ও ডিপিপি মডিউল লোড করার মূল ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি
 * @param {object} cacheUserData - ইউজারের লগইন ডাটা
 * @param {HTMLElement} renderArea - ড্যাশবোর্ডের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadLecturesModule(subject, chapter, cacheUserData, renderArea) {
    // লোডিং স্ক্রিন (লাক্সারি ডিপ খয়েরী/ডার্ক ওলেড থিম ম্যাচিং)
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Streaming Lectures Hub...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে ডাটা রিড করা (পাথ: lectures_content/biology/cell_cycle)
        const lectureRef = ref(db, `lectures_content/${subject}/${chapter}`);
        const snapshot = await get(lectureRef);

        let chapterTitle = "Cell Cycle and Cell Division";
        let videoEmbedUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // ডামি ডিফল্ট ভিডিও লিংক
        let notesUrl = "";
        let dppUrl = "";

        if (snapshot.exists()) {
            const data = snapshot.val();
            chapterTitle = data.title || chapterTitle;
            videoEmbedUrl = data.videoUrl || videoEmbedUrl;
            notesUrl = data.notesUrl || "";
            dppUrl = data.dppUrl || "";
        }

        // ইউআই রেন্ডার
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(243, 185, 23, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--gold); font-weight: 800; text-transform: uppercase;">LECTURE NOTES & DPP</span>
                <h2 style="font-size: 20px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">${chapterTitle}</h2>
                <p style="font-size: 11px; color: var(--text-para);">Subject: ${subject.toUpperCase()} | Watch Lectures & Solve DPPs</p>
            </div>

            <!-- 📺 ১. অ্যাডভান্সড ভিডিও প্লেয়ার এমবেড জোন -->
            <div class="card-mneet border-gold" style="padding: 0; overflow: hidden; border-radius: 16px; margin-bottom: 18px;">
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                    <iframe src="${videoEmbedUrl}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>
            </div>

            <!-- 📑 ২. ক্লাসের রিভিশন নোটস ডাউনলোড এরিয়া -->
            <div class="card-mneet border-blue" style="padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-file-pdf" style="color: #EF4444; font-size: 18px;"></i>
                    <div>
                        <h4 style="font-size: 13px; margin: 0; font-weight: 700;">Class Revision Notes</h4>
                        <p style="margin: 2px 0 0 0; font-size: 10px; color: var(--text-para);">Handwritten or Core Slides PDF</p>
                    </div>
                </div>
                ${notesUrl ? `
                    <a href="${notesUrl}" target="_blank" class="link-btn" style="color: var(--gold); font-size: 12px; font-weight: 800; text-decoration: none;">DOWNLOAD <i class="fas fa-download" style="font-size: 10px; margin-left: 2px;"></i></a>
                ` : `
                    <span style="font-size: 11px; color: var(--text-para); font-style: italic;">Coming Soon</span>
                `}
            </div>

            <!-- 📝 ৩. ডেইলি প্র্যাকটিস শিট (DPP) জোন -->
            <div class="card-mneet border-purple" style="padding: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-pen-fancy" style="color: var(--neon-purple); font-size: 18px;"></i>
                    <div>
                        <h4 style="font-size: 13px; margin: 0; font-weight: 700;">Daily Practice Sheet (DPP)</h4>
                        <p style="margin: 2px 0 0 0; font-size: 10px; color: var(--text-para);">Must-solve Top 10-15 Target MCQs</p>
                    </div>
                </div>
                ${dppUrl ? `
                    <a href="${dppUrl}" target="_blank" class="link-btn" style="color: var(--gold); font-size: 12px; font-weight: 800; text-decoration: none;">GET DPP <i class="fas fa-arrow-circle-down" style="font-size: 11px; margin-left: 2px;"></i></a>
                ` : `
                    <span style="font-size: 11px; color: var(--text-para); font-style: italic;">Coming Soon</span>
                `}
            </div>

            <!-- লেকচার কমপ্লিট করার বাটন ট্রিগার -->
            <button id="mark-lecture-complete-btn" class="btn-mneet" style="background: linear-gradient(135deg, var(--neon-blue) 0%, #1D4ED8 100%) !important; color: white !important;">
                Mark Lecture as Done (+40 BP) ✔️
            </button>
        `;

        // বাটন ক্লিক ইভেন্ট
        document.getElementById("mark-lecture-complete-btn").onclick = () => {
            alert(`Awesome! You marked this lecture as completed. +40 BP Coins script will trigger soon!`);
        };

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Error loading Lecture Engine: ${err.message}</div>`;
    }
}

