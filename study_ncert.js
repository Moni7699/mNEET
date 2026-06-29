import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * NCERT মডিউল লোড করার মূল ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি
 * @param {object} cacheUserData - ইউজারের লগইন ডাটা
 * @param {HTMLElement} renderArea - ড্যাশবোর্ডের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadNcertModule(subject, chapter, cacheUserData, renderArea) {
    // লোডিং স্ক্রিন তৈরি (লাক্সারি ডিপ খয়েরী/ডার্ক ওলেড থিম ম্যাচিং)
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Loading NCERT High-Yield Radar...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে এই চ্যাপ্টারের ডেটা নিয়ে আসা (যা এডমিন প্যানেল থেকে আপলোড করা হবে)
        // পাথ ফরম্যাট: ncert_content/biology/cell_cycle
        const ncertRef = ref(db, `ncert_content/${subject}/${chapter}`);
        const snapshot = await get(ncertRef);

        let chapterTitle = "Cell Cycle and Cell Division";
        let pdfUrl = "";
        let highYieldLines = [];

        if (snapshot.exists()) {
            const data = snapshot.val();
            chapterTitle = data.title || chapterTitle;
            pdfUrl = data.pdfUrl || "";
            highYieldLines = data.lines || [];
        } else {
            // যদি ডাটাবেজে ডাটা না থাকে, তবে স্টুডেন্টকে ডামি রিচ ডাটা দেখাবে যাতে স্ট্রাকচার সুন্দর থাকে
            highYieldLines = [
                { text: "Stages of Mitosis: Prophase, Metaphase, Anaphase, Telophase.", pyq: "NEET 2022, 2024" },
                { text: "Anaphase is characterized by the splitting of centromeres and separation of chromatids.", pyq: "NEET 2019, 2021" },
                { text: "Meiosis involves two sequential cycles of nuclear and cell division called meiosis I and meiosis II but only a single cycle of DNA replication.", pyq: "NEET 2020, 2023" }
            ];
        }

        // ইউআই রেন্ডার করা
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(37, 99, 235, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-blue); font-weight: 800; text-transform: uppercase;">NCERT LINE-BY-LINE RADAR</span>
                <h2 style="font-size: 20px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">${chapterTitle}</h2>
                <p style="font-size: 11px; color: var(--text-para);">Subject: ${subject.toUpperCase()} | Read & Focus on Golden Points</p>
            </div>

            ${pdfUrl ? `
                <div class="card-mneet border-blue" style="padding: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; font-weight: 700;"><i class="fas fa-file-pdf style="color: #EF4444; margin-right: 8px;"></i> Official Textbook PDF</span>
                    <a href="${pdfUrl}" target="_blank" class="link-btn" style="color: var(--gold); font-size: 13px; font-weight: 800; text-decoration: none;">OPEN PDF <i class="fas fa-external-link-alt" style="font-size:10px;"></i></a>
                </div>
            ` : ''}

            <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; color: var(--text-title);">High-Yield Target Lines</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;" id="ncert-lines-container">
                ${highYieldLines.map((line, index) => `
                    <div class="card-mneet border-gold" style="padding: 14px; background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(243, 185, 23, 0.02) 100%);">
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <span style="font-size: 12px; font-weight: 900; color: var(--gold); background: var(--bg-input); width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${index + 1}</span>
                            <div style="flex: 1;">
                                <p style="font-size: 13px; font-weight: 600; line-height: 1.5; color: var(--text-title); margin: 0; text-align: left;">
                                    "${line.text}"
                                </p>
                                <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
                                    <span style="font-size: 9px; background-color: rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px; color: var(--neon-red); font-weight: 800; letter-spacing: 0.5px;">
                                        <i class="fas fa-crosshairs"></i> PYQ TAG: ${line.pyq}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button id="mark-ncert-complete-btn" class="btn-mneet" style="margin-top: 10px; background: linear-gradient(135deg, var(--gold) 0%, #D9A312 100%) !important; color: #000000 !important;">
                Mark Chapter as Read (+50 BP) ✔️
            </button>
        `;

        // বাটন অ্যাকশন লিসেনার
        document.getElementById("mark-ncert-complete-btn").onclick = () => {
            alert(`Great Job! You have successfully completed reading ${chapterTitle}. +50 BP Coins script will trigger soon!`);
        };

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Error loading NCERT Matrix: ${err.message}</div>`;
    }
              }
                 
