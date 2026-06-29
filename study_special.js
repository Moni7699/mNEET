import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * স্পেশাল ম্যাটেরিয়াল হাব মডিউল লোড করার মূল ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি
 * @param {object} cacheUserData - ইউজারের লগইন ডাটা
 * @param {HTMLElement} renderArea - ড্যাশবোর্ডের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadSpecialModule(subject, chapter, cacheUserData, renderArea) {
    // লোডিং অ্যানিমেশন স্ক্রিন
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Unlocking Special Premium Hub...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে স্পেশাল কন্টেন্ট রিড করা (পাথ: special_content/biology/cell_cycle)
        const specialRef = ref(db, `special_content/${subject}/${chapter}`);
        const snapshot = await get(specialRef);

        let chapterTitle = "Cell Cycle and Cell Division";
        let mindMapUrl = "";
        let cheatSheetUrl = "";
        let shortTricks = [];

        if (snapshot.exists()) {
            const data = snapshot.val();
            chapterTitle = data.title || chapterTitle;
            mindMapUrl = data.mindMapUrl || "";
            cheatSheetUrl = data.cheatSheetUrl || "";
            shortTricks = data.tricks || [];
        } else {
            // ডাটাবেজে ডাটা না থাকলে প্রিমিয়াম ডিফল্ট ব্যাকআপ কন্টেন্ট লোড হবে
            shortTricks = [
                { title: "Mitosis Stages Mnemonic", desc: "Remember <b>PMAT</b>: Prophase ➔ Metaphase ➔ Anaphase ➔ Telophase." },
                { title: "Meiosis Prophase-I Substages Trick", desc: "Remember <b>L Z P D D</b>: Lazy Zebra Please Do Dance (Leptotene, Zygotene, Pachytene, Diplotene, Diakinesis)." }
            ];
        }

        // ইউআই রেন্ডার
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-green); font-weight: 800; text-transform: uppercase;">MNEET SPECIAL HUB</span>
                <h2 style="font-size: 20px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">${chapterTitle}</h2>
                <p style="font-size: 11px; color: var(--text-para);">Subject: ${subject.toUpperCase()} | High-Yield Revision Boosters</p>
            </div>

            <div class="card-mneet border-green" style="padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-project-diagram" style="color: var(--neon-green); font-size: 18px;"></i>
                    <div>
                        <h4 style="font-size: 13px; margin: 0; font-weight: 700;">Visual Mind Map 1-Page</h4>
                        <p style="margin: 2px 0 0 0; font-size: 10px; color: var(--text-para);">Entire chapter mapped in single layout</p>
                    </div>
                </div>
                ${mindMapUrl ? `
                    <a href="${mindMapUrl}" target="_blank" class="link-btn" style="color: var(--gold); font-size: 12px; font-weight: 800; text-decoration: none;">VIEW MAP <i class="fas fa-eye" style="font-size: 10px; margin-left: 2px;"></i></a>
                ` : `
                    <span style="font-size: 11px; color: var(--text-para); font-style: italic;">Verified ✅</span>
                `}
            </div>

            <div class="card-mneet border-blue" style="padding: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-bolt" style="color: var(--neon-blue); font-size: 18px;"></i>
                    <div>
                        <h4 style="font-size: 13px; margin: 0; font-weight: 700;">Formula & Chart Cheat Sheet</h4>
                        <p style="margin: 2px 0 0 0; font-size: 10px; color: var(--text-para);">Last minute rapid check summary</p>
                    </div>
                </div>
                ${cheatSheetUrl ? `
                    <a href="${cheatSheetUrl}" target="_blank" class="link-btn" style="color: var(--gold); font-size: 12px; font-weight: 800; text-decoration: none;">OPEN PDF <i class="fas fa-file-alt" style="font-size: 10px; margin-left: 2px;"></i></a>
                ` : `
                    <span style="font-size: 11px; color: var(--text-para); font-style: italic;">Premium ⭐</span>
                `}
            </div>

            <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; color: var(--text-title);">Smart Memorization Mnemonics</h4>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                ${shortTricks.map((trick, index) => `
                    <div class="card-mneet border-gold" style="padding: 14px; background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(16, 185, 129, 0.02) 100%);">
                        <h5 style="font-size: 12px; font-weight: 800; color: var(--gold); margin: 0 0 6px 0; text-transform: uppercase;"><i class="fas fa-lightbulb"></i> Trick #${index + 1}: ${trick.title}</h5>
                        <p style="font-size: 12px; line-height: 1.4; color: var(--text-title); margin: 0;">${trick.desc}</p>
                    </div>
                `).join('')}
            </div>

            <button id="special-back-to-study-btn" class="btn-mneet" style="background: linear-gradient(135deg, var(--neon-green) 0%, #059669) !important; color: white !important;">
                Back to Archive Main
            </button>
        `;

        document.getElementById("special-back-to-study-btn").onclick = () => {
            document.getElementById("dashboard-back-btn").click();
        };

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Error loading Special Hub: ${err.message}</div>`;
    }
    }
                  
