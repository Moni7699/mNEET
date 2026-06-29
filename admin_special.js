import { db } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * স্পেশাল ম্যাটেরিয়াল ও শর্ট ট্রিকস আপলোড করার মূল অ্যাডমিন ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি
 * @param {HTMLElement} renderArea - অ্যাডমিন প্যানেলের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadAdminSpecialManager(subject, chapter, renderArea) {
    // লোডিং স্ক্রিন
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Opening Premium Material Hub...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে এক্সিস্টিং স্পেশাল কন্টেন্ট তুলে আনা
        const specialRef = ref(db, `special_content/${subject}/${chapter}`);
        const snapshot = await get(specialRef);

        let mindMapUrl = "";
        let cheatSheetUrl = "";
        let existingTricks = [];

        if (snapshot.exists()) {
            const data = snapshot.val();
            mindMapUrl = data.mindMapUrl || "";
            cheatSheetUrl = data.cheatSheetUrl || "";
            existingTricks = data.tricks || [];
        }

        // ইউআই রেন্ডার
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-green); font-weight: 800; text-transform: uppercase;">SPECIAL HUB LOADER</span>
                <h2 style="font-size: 18px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">Node: ${chapter.toUpperCase()}</h2>
                <p style="font-size: 11px; color: var(--text-para);">Subject: ${subject.toUpperCase()} | Deploy Mnemonics, Mind Maps & Cheatsheets</p>
            </div>

            <div class="card-mneet border-green" style="padding: 14px; margin-bottom: 14px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;"><i class="fas fa-project-diagram"></i> 1-Page Mind Map Document URL</label>
                <input type="text" id="admin-special-map-input" class="input-field" value="${mindMapUrl}" placeholder="Paste high-res image or drive PDF URL...">

                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-top: 8px; margin-bottom: 6px; text-transform: uppercase;"><i class="fas fa-bolt"></i> Formula / Chart Cheat Sheet URL</label>
                <input type="text" id="admin-special-cheat-input" class="input-field" value="${cheatSheetUrl}" placeholder="Paste summary sheets direct link...">
                
                <button id="admin-save-special-urls-btn" class="btn-mneet" style="padding: 10px; font-size: 11px; background: var(--neon-green)!important; color:white!important; margin-top: 4px;">Link Static Resources</button>
            </div>

            <div class="card-mneet border-gold" style="padding: 14px; margin-bottom: 16px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Trick Heading / Mnemonic Topic</label>
                <input type="text" id="admin-trick-title-input" class="input-field" placeholder="e.g. Mitosis Stages Trick / G-Phase order">
                
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Mnemonic Formula / Description</label>
                <textarea id="admin-trick-desc-input" class="input-field" style="height: 70px; resize: none;" placeholder="Type the smart trick sentence or shortcut rule here..."></textarea>
                
                <button id="admin-inject-special-trick-btn" class="btn-mneet" style="padding: 12px; font-size: 12px; margin-top: 4px;">Inject Trick to Live App ⚡</button>
            </div>

            <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; color: var(--text-title);">Active Mnemonics on Devices (${existingTricks.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;" id="admin-live-tricks-pool">
                ${existingTricks.length === 0 ? `<div style="font-size:12px; color:var(--text-para); text-align:center; padding:10px;">No mnemonics pushed yet. Deploy your first trick!</div>` : ''}
                ${existingTricks.map((trick, idx) => `
                    <div class="card-mneet border-blue" style="padding: 12px; font-size: 12px; background: var(--bg-input);">
                        <h5 style="font-size: 12px; font-weight: 800; color: var(--gold); margin: 0 0 4px 0;"><i class="fas fa-lightbulb"></i> ${trick.title}</h5>
                        <p style="color:var(--text-title); line-height:1.4; margin: 0 0 8px 0;">${trick.desc}</p>
                        <div style="text-align: right; border-top: 1px dashed var(--border-line); padding-top: 6px;">
                            <button class="admin-delete-trick-btn link-btn" data-idx="${idx}" style="color:var(--neon-red); font-size:11px;"><i class="fas fa-trash-alt"></i> Delete Trick</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // ================= অ্যাকশন ইভেন্ট লিসেনারস =================

        // ক) মাইন্ড ম্যাপ ও চিট শিট লিংক সিঙ্ক
        document.getElementById("admin-save-special-urls-btn").onclick = async () => {
            const currentMap = document.getElementById("admin-special-map-input").value.trim();
            const currentCheat = document.getElementById("admin-special-cheat-input").value.trim();

            await set(ref(db, `special_content/${subject}/${chapter}`), {
                title: chapter.replace(/_/g, " ").toUpperCase(),
                mindMapUrl: currentMap,
                cheatSheetUrl: currentCheat,
                tricks: existingTricks
            });
            alert("Static resources referenced successfully!");
        };

        // খ) নতুন নেমোনিক্স ইনজেক্ট লজিক
        document.getElementById("admin-inject-special-trick-btn").onclick = async () => {
            const tTitle = document.getElementById("admin-trick-title-input").value.trim();
            const tDesc = document.getElementById("admin-trick-desc-input").value.trim();

            if (!tTitle || !tDesc) {
                alert("Both trick title and mnemonic code description are required!");
                return;
            }

            existingTricks.push({ title: tTitle, desc: tDesc });

            await set(ref(db, `special_content/${subject}/${chapter}`), {
                title: chapter.replace(/_/g, " ").toUpperCase(),
                mindMapUrl: mindMapUrl,
                cheatSheetUrl: cheatSheetUrl,
                tricks: existingTricks
            });

            alert("New mnemonic successfully deployed live!");
            loadAdminSpecialManager(subject, chapter, renderArea);
        };

        // গ) নেমোনিক্স ডিলিট লজিক
        document.querySelectorAll(".admin-delete-trick-btn").forEach(btn => {
            btn.onclick = async () => {
                const deleteIdx = parseInt(btn.getAttribute("data-idx"));
                if (confirm("Are you sure you want to pull down this mnemonic trick?")) {
                    existingTricks.splice(deleteIdx, 1);
                    await set(ref(db, `special_content/${subject}/${chapter}/tricks`), existingTricks);
                    loadAdminSpecialManager(subject, chapter, renderArea);
                }
            };
        });

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Admin Special Hub Error: ${err.message}</div>`;
    }
                  }
              
