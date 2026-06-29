import { db } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * NCERT কন্টেন্ট আপলোড ও ম্যানেজ করার মূল অ্যাডমিন ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি (স্লাগ)
 * @param {HTMLElement} renderArea - অ্যাডমিন প্যানেলের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadAdminNcertManager(subject, chapter, renderArea) {
    // লোডিং স্ক্রিন
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700;">Fetching Live NCERT Node Matrix...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে এক্সিস্টিং ডাটা চেক করা
        const ncertRef = ref(db, `ncert_content/${subject}/${chapter}`);
        const snapshot = await get(ncertRef);

        let pdfUrl = "";
        let existingLines = [];

        if (snapshot.exists()) {
            const data = snapshot.val();
            pdfUrl = data.pdfUrl || "";
            existingLines = data.lines || [];
        }

        // ইউআই রেন্ডার
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(37, 99, 235, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-blue); font-weight: 800; text-transform: uppercase;">NCERT LINE MANAGER</span>
                <h2 style="font-size: 18px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">Node: ${chapter.toUpperCase()}</h2>
                <p style="font-size: 11px; color: var(--text-para);">Subject: ${subject.toUpperCase()} | Push High-Yield Lines & PYQs</p>
            </div>

            <div class="card-mneet border-blue" style="padding: 14px; margin-bottom: 14px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Official Textbook PDF URL</label>
                <input type="text" id="admin-ncert-pdf-input" class="input-field" value="${pdfUrl}" placeholder="Paste Google Drive/Firebase PDF direct link...">
                <button id="admin-save-pdf-url-btn" class="btn-mneet" style="padding: 10px; font-size: 11px; background: var(--neon-blue)!important; color:white!important;">Link Textbook PDF</button>
            </div>

            <div class="card-mneet border-gold" style="padding: 14px; margin-bottom: 16px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Add High-Yield Target Line</label>
                <textarea id="admin-ncert-line-text" class="input-field" style="height: 70px; resize: none;" placeholder="Type or paste core NCERT textbook sentence here..."></textarea>
                
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-top: 8px; margin-bottom: 6px; text-transform: uppercase;">Target PYQ Tag Years</label>
                <input type="text" id="admin-ncert-line-pyq" class="input-field" placeholder="e.g. NEET 2022, 2025">
                
                <button id="admin-inject-ncert-line-btn" class="btn-mneet" style="padding: 12px; font-size: 12px; margin-top: 4px;">Inject Line to Live Radar 🚀</button>
            </div>

            <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; color: var(--text-title);">Active Lines in Student View (${existingLines.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;" id="admin-live-lines-review">
                ${existingLines.length === 0 ? `<div style="text-size:12px; color:var(--text-para); text-align:center; padding:10px;">No lines deployed yet. Inject your first line!</div>` : ''}
                ${existingLines.map((line, idx) => `
                    <div class="card-mneet border-purple" style="padding: 12px; font-size: 12px; background: var(--bg-input);">
                        <p style="font-weight: 600; margin: 0 0 6px 0; line-height: 1.4;">"${line.text}"</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size: 9px; color: var(--neon-red); font-weight:800;"><i class="fas fa-tag"></i> ${line.pyq}</span>
                            <button class="admin-delete-line-btn link-btn" data-idx="${idx}" style="color:var(--neon-red); font-size:11px;"><i class="fas fa-trash-alt"></i> Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // ================= অ্যাকশন ইভেন্ট লিসেনারস =================

        // ক) পিডিএফ লিঙ্ক আপডেট লজিক
        document.getElementById("admin-save-pdf-url-btn").onclick = async () => {
            const currentPdf = document.getElementById("admin-ncert-pdf-input").value.trim();
            await set(ref(db, `ncert_content/${subject}/${chapter}/pdfUrl`), currentPdf);
            alert("Textbook PDF reference synchronized successfully!");
        };

        // খ) নতুন লাইন ইনজেক্ট লজিক
        document.getElementById("admin-inject-ncert-line-btn").onclick = async () => {
            const lineText = document.getElementById("admin-ncert-line-text").value.trim();
            const linePyq = document.getElementById("admin-ncert-line-pyq").value.trim();

            if (!lineText || !linePyq) {
                alert("Both NCERT sentence and PYQ tag cannot be left blank!");
                return;
            }

            existingLines.push({ text: lineText, pyq: linePyq });
            
            await set(ref(db, `ncert_content/${subject}/${chapter}/lines`), existingLines);
            alert("Line successfully injected to live server!");
            
            // উইন্ডো রি-লোডার
            loadAdminNcertManager(subject, chapter, renderArea);
        };

        // গ) ডেপ্লয়েড লাইন ডিলিট লজিক
        document.querySelectorAll(".admin-delete-line-btn").forEach(btn => {
            btn.onclick = async () => {
                const deleteIdx = parseInt(btn.getAttribute("data-idx"));
                if (confirm("Are you sure you want to pull down this high-yield line from student devices?")) {
                    existingLines.splice(deleteIdx, 1);
                    await set(ref(db, `ncert_content/${subject}/${chapter}/lines`), existingLines);
                    loadAdminNcertManager(subject, chapter, renderArea);
                }
            };
        });

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Admin Matrix Error: ${err.message}</div>`;
    }
}
  
