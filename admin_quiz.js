import { db } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * কুইজ প্রশ্ন ও কাস্টম টাইমার আপলোড এবং কন্ট্রোল করার মূল অ্যাডমিন ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি
 * @param {HTMLElement} renderArea - অ্যাডমিন প্যানেলের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadAdminQuizManager(subject, chapter, renderArea) {
    // লোডিং স্ক্রিন
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Building Quiz Custom Timer Matrix...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে এক্সিস্টিং কুইজ কন্টেন্ট তুলে আনা
        const quizRef = ref(db, `quiz_content/${subject}/${chapter}`);
        const snapshot = await get(quizRef);

        let existingQuestions = [];
        let globalChapterTimer = 15; // ডিফল্ট ১৫ সেকেন্ড

        if (snapshot.exists()) {
            const data = snapshot.val();
            existingQuestions = data.questions || [];
            globalChapterTimer = data.perQuestionTimer || globalChapterTimer;
        }

        // ইউআই রেন্ডার
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(139, 92, 246, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-purple); font-weight: 800; text-transform: uppercase;">QUIZ & TIMER CONSTRUCTOR</span>
                <h2 style="font-size: 18px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">Node: ${chapter.toUpperCase()}</h2>
                <p style="font-size: 11px; color: var(--text-para);">Subject: ${subject.toUpperCase()} | Inject Target MCQs & Seconds Countdown</p>
            </div>

            <div class="card-mneet border-purple" style="padding: 14px; margin-bottom: 14px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;"><i class="fas fa-hourglass-start"></i> Set Custom Timer (Seconds Per Question)</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="number" id="admin-quiz-timer-input" class="input-field" value="${globalChapterTimer}" style="margin-bottom:0!important; flex: 1;" placeholder="e.g. 15, 30, 45">
                    <button id="admin-save-quiz-timer-btn" class="btn-mneet" style="width:auto; padding: 12px 18px; font-size:12px; background:var(--neon-purple)!important; color:white!important;">Lock Time 🔒</button>
                </div>
                <p style="font-size: 9px; color: var(--text-para); margin-top: 6px; margin-bottom: 0;">*This countdown will trigger automatically on student screens for every single MCQ of this chapter.</p>
            </div>

            <div class="card-mneet border-gold" style="padding: 14px; margin-bottom: 16px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Question Target Text</label>
                <textarea id="admin-quiz-q-input" class="input-field" style="height: 60px; resize: none; margin-bottom: 12px!important;" placeholder="Type the core MCQ question here..."></textarea>
                
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">MCQ Options Matrix</label>
                <input type="text" id="admin-quiz-opt-0" class="input-field" placeholder="Option A" style="margin-bottom:6px!important;">
                <input type="text" id="admin-quiz-opt-1" class="input-field" placeholder="Option B" style="margin-bottom:6px!important;">
                <input type="text" id="admin-quiz-opt-2" class="input-field" placeholder="Option C" style="margin-bottom:6px!important;">
                <input type="text" id="admin-quiz-opt-3" class="input-field" placeholder="Option D" style="margin-bottom:12px!important;">

                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Select Correct Answer Key</label>
                <select id="admin-quiz-correct-key" class="input-field" style="margin-bottom:14px!important;">
                    <option value="0">Option A is Correct</option>
                    <option value="1">Option B is Correct</option>
                    <option value="2">Option C is Correct</option>
                    <option value="3">Option D is Correct</option>
                </select>

                <button id="admin-inject-quiz-mcq-btn" class="btn-mneet" style="padding: 12px; font-size: 12px;">Deploy MCQ to Live Portal ⚔️</button>
            </div>

            <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; color: var(--text-title);">Active Live Questions Pool (${existingQuestions.length})</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;" id="admin-live-quiz-review-list">
                ${existingQuestions.length === 0 ? `<div style="font-size:12px; color:var(--text-para); text-align:center; padding:10px;">No MCQs deployed yet. Inject your first question!</div>` : ''}
                ${existingQuestions.map((item, idx) => `
                    <div class="card-mneet border-blue" style="padding: 12px; font-size: 12px; background: var(--bg-input);">
                        <p style="font-weight: 700; margin: 0 0 8px 0; line-height: 1.4; color:var(--text-title);">Q${idx+1}: ${item.q}</p>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; margin-bottom:8px; color:var(--text-para);">
                            <div>A. ${item.options[0]}</div>
                            <div>B. ${item.options[1]}</div>
                            <div>C. ${item.options[2]}</div>
                            <div>D. ${item.options[3]}</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border-line); padding-top:8px;">
                            <span style="font-size: 10px; color: var(--neon-green); font-weight:800;"><i class="fas fa-check-circle"></i> Key: Option ${String.fromCharCode(65 + item.correct)}</span>
                            <button class="admin-delete-mcq-btn link-btn" data-idx="${idx}" style="color:var(--neon-red); font-size:11px;"><i class="fas fa-trash-alt"></i> Wipe Out</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // ================= অ্যাকশন ইভেন্ট লিসেনারস =================

        // ক) কাস্টম টাইমার সেকেন্ড সেভ মেকানিজম
        document.getElementById("admin-save-quiz-timer-btn").onclick = async () => {
            const timeSec = parseInt(document.getElementById("admin-quiz-timer-input").value);
            if(isNaN(timeSec) || timeSec <= 0) {
                alert("Please enter a valid number of seconds!");
                return;
            }
            await set(ref(db, `quiz_content/${subject}/${chapter}/perQuestionTimer`), timeSec);
            alert(`Alhamdulillah! Quiz timer successfully set to ${timeSec} seconds per question.`);
        };

        // খ) নতুন MCQ প্রশ্ন ডাটাবেজে পুশ লজিক
        document.getElementById("admin-inject-quiz-mcq-btn").onclick = async () => {
            const qText = document.getElementById("admin-quiz-q-input").value.trim();
            const opt0 = document.getElementById("admin-quiz-opt-0").value.trim();
            const opt1 = document.getElementById("admin-quiz-opt-1").value.trim();
            const opt2 = document.getElementById("admin-quiz-opt-2").value.trim();
            const opt3 = document.getElementById("admin-quiz-opt-3").value.trim();
            const correctKey = parseInt(document.getElementById("admin-quiz-correct-key").value);

            if (!qText || !opt0 || !opt1 || !opt2 || !opt3) {
                alert("Question and all 4 choices are mandatory fields!");
                return;
            }

            const newMCQ = {
                q: qText,
                options: [opt0, opt1, opt2, opt3],
                correct: correctKey
            };

            existingQuestions.push(newMCQ);

            // ফায়ারবেসে সম্পূর্ণ অ্যারে এবং টাইমার এক সাথে সেভ রাখা
            await set(ref(db, `quiz_content/${subject}/${chapter}/questions`), existingQuestions);
            alert("MCQ successfully deployed to live quiz archive!");
            
            // রিলোডার
            loadAdminQuizManager(subject, chapter, renderArea);
        };

        // গ) এক্সিস্টিং MCQ ডিলিট লজিক
        document.querySelectorAll(".admin-delete-mcq-btn").forEach(btn => {
            btn.onclick = async () => {
                const deleteIdx = parseInt(btn.getAttribute("data-idx"));
                if (confirm("Are you sure you want to permanently erase this question from the student server?")) {
                    existingQuestions.splice(deleteIdx, 1);
                    await set(ref(db, `quiz_content/${subject}/${chapter}/questions`), existingQuestions);
                    loadAdminQuizManager(subject, chapter, renderArea);
                }
            };
        });

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Admin Quiz Setup Error: ${err.message}</div>`;
    }
              }
              
