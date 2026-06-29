import { db } from "./firebase-config.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * চ্যাপ্টার ওয়াইজ কুইজ মডিউল লোড করার মূল ফাংশন
 * @param {string} subject - biology / chemistry / physics
 * @param {string} chapter - চ্যাপ্টারের আইডি
 * @param {object} cacheUserData - ইউজারের লগইন ডাটা
 * @param {HTMLElement} renderArea - ড্যাশবোর্ডের মেইন ভিউপোর্ট এরিয়া
 */
export async function loadQuizModule(subject, chapter, cacheUserData, renderArea) {
    // লোডিং স্ক্রিন
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Compiling MCQ Test Matrix...</span>
        </div>
    `;

    try {
        // ফায়ারবেস থেকে কুইজের প্রশ্ন তুলে আনা (পাথ: quiz_content/biology/cell_cycle)
        const quizRef = ref(db, `quiz_content/${subject}/${chapter}`);
        const snapshot = await get(quizRef);

        let chapterTitle = "Cell Cycle and Cell Division";
        let questions = [];

        if (snapshot.exists()) {
            const data = snapshot.val();
            chapterTitle = data.title || chapterTitle;
            questions = data.questions || [];
        } else {
            // ডাটাবেজে প্রশ্ন না থাকলে ডিফল্ট এনসিইআরটি বেসড সলিড ব্যাকআপ প্রশ্ন লোড হবে
            questions = [
                {
                    q: "During which phase of cell cycle does DNA replication occur?",
                    options: ["G1 phase", "S phase", "G2 phase", "M phase"],
                    correct: 1 // S phase
                },
                {
                    q: "The stage of mitosis where chromosomes align at the equatorial plate is:",
                    options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
                    correct: 1 // Metaphase
                }
            ];
        }

        // কুইজ স্টেট ম্যানেজমেন্ট ট্র্যাকার
        let currentQIndex = 0;
        let score = 0;
        let totalCoinsEarned = 0;

        // ইন্টারনাল ফাংশন: একটি নির্দিষ্ট প্রশ্ন রেন্ডার করা
        function displayQuestion() {
            if (currentQIndex >= questions.length) {
                displayQuizResults();
                return;
            }

            const currentQuestion = questions[currentQIndex];

            renderArea.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <span style="font-size: 10px; background-color: rgba(139, 92, 246, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-purple); font-weight: 800; text-transform: uppercase;">SOLO TARGET MCQ PRACTICE</span>
                    <h2 style="font-size: 18px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">${chapterTitle}</h2>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                        <span style="font-size: 11px; color: var(--text-para);">Question ${currentQIndex + 1} of ${questions.length}</span>
                        <span style="font-size: 11px; color: var(--gold); font-weight: 800;"><i class="fas fa-coins"></i> Score: ${score * 10} BP</span>
                    </div>
                </div>

                <div class="card-mneet border-purple" style="padding: 18px; margin-bottom: 16px;">
                    <p style="font-size: 14px; font-weight: 700; line-height: 1.5; color: var(--text-title); margin: 0; text-align: left;">
                        ${currentQuestion.q}
                    </p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;" id="quiz-options-container">
                    ${currentQuestion.options.map((opt, idx) => `
                        <button class="card-mneet option-btn-wire" data-idx="${idx}" style="width: 100%; text-align: left; padding: 14px; cursor: pointer; background: var(--bg-surface); border: 2px solid var(--border-line); border-radius: 14px; font-size: 13px; font-weight: 600; color: var(--text-title); transition: all 0.2s;">
                            <span style="color: var(--gold); margin-right: 8px;">${String.fromCharCode(65 + idx)}.</span> ${opt}
                        </button>
                    `).join('')}
                </div>
            `;

            // অপশন বাটনগুলোতে ক্লিক ইভেন্ট লিসেনার বাইন্ডিং
            document.querySelectorAll(".option-btn-wire").forEach(btn => {
                btn.onclick = () => {
                    const selectedIdx = parseInt(btn.getAttribute("data-idx"));
                    handleAnswerSelection(selectedIdx, currentQuestion.correct, btn);
                };
            });
        }

        // উত্তর সঠিক না ভুল তা যাচাই ও কয়েন ক্রেডিট লজিক
        async function handleAnswerSelection(selectedIdx, correctIdx, clickedButton) {
            // অন্য অপশনগুলো লক করে দেওয়া যাতে ডাবল ক্লিক না হয়
            document.querySelectorAll(".option-btn-wire").forEach(b => b.disabled = true);

            if (selectedIdx === correctIdx) {
                clickedButton.style.borderColor = "var(--neon-green)";
                clickedButton.style.background = "rgba(16, 185, 129, 0.05)";
                score++;
                totalCoinsEarned += 10;
                
                // ফায়ারবেস রিয়েল-টাইম ডাটাবেজে BP Coin যোগ করা (+10 BP)
                try {
                    const currentBatch = document.getElementById("batch-view-filter")?.value || "neet_2027_ultimate";
                    const newCoinsCount = (cacheUserData.bpCoins || 0) + 10;
                    
                    // ইউজারের গ্লোবাল ও ব্যাচ-ওয়াইজ কয়েন আপডেট
                    await update(ref(db, `users/${cacheUserData.uid}`), {
                        bpCoins: newCoinsCount,
                        [`bpCoinsCourseWise/${currentBatch}`]: (cacheUserData.bpCoinsCourseWise?.[currentBatch] || 0) + 10
                    });
                    
                    // লোকাল ক্যাশ মেমোরি আপডেট
                    cacheUserData.bpCoins = newCoinsCount;
                    if(!cacheUserData.bpCoinsCourseWise) cacheUserData.bpCoinsCourseWise = {};
                    cacheUserData.bpCoinsCourseWise[currentBatch] = (cacheUserData.bpCoinsCourseWise[currentBatch] || 0) + 10;
                    
                    // টপ হেডার কয়েন কাউন্টার রি-সিঙ্ক
                    const headerCoins = document.getElementById("top-bp-count");
                    if (headerCoins) headerCoins.innerText = `${newCoinsCount} BP`;
                } catch (e) {
                    console.error("Coin Sync Failed: ", e);
                }
            } else {
                clickedButton.style.borderColor = "var(--neon-red)";
                clickedButton.style.background = "rgba(239, 68, 68, 0.05)";
                // সঠিক উত্তরটি সবুজ বর্ডার দিয়ে হাইলাইট করে দেওয়া
                document.querySelector(`[data-idx="${correctIdx}"]`).style.borderColor = "var(--neon-green)";
            }

            // ১.৫ সেকেন্ড পর অটোমেটিক পরবর্তী প্রশ্নে নিয়ে যাবে
            setTimeout(() => {
                currentQIndex++;
                displayQuestion();
            }, 1500);
        }

        // কুইজ শেষ হলে রেজাল্ট ও টোটাল কয়েন জয়ের স্ক্রিন
        function displayQuizResults() {
            renderArea.innerHTML = `
                <div class="card-mneet border-gold" style="text-align: center; padding: 24px 16px; background: linear-gradient(135deg, rgba(243,185,23,0.02) 0%, transparent 100%);">
                    <span style="font-size: 36px;">🏆</span>
                    <h3 style="font-size: 20px; font-weight: 900; margin: 12px 0 6px 0; color: var(--text-title);">Quiz Completed!</h3>
                    <p style="font-size: 12px; color: var(--text-para); margin-bottom: 16px;">Chapter: ${chapterTitle}</p>
                    
                    <div style="background-color: var(--bg-input); padding: 14px; border-radius: 14px; margin-bottom: 20px; border: 1px solid var(--border-line);">
                        <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:6px;">
                            <span>Correct Answers:</span>
                            <span style="color: var(--neon-green);">${score} / ${questions.length}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;">
                            <span>BP Coins Credited:</span>
                            <span style="color: var(--gold);">+${totalCoinsEarned} BP</span>
                        </div>
                    </div>

                    <button id="quiz-exit-back-btn" class="btn-mneet">
                        Back to Chapters
                    </button>
                </div>
            `;

            document.getElementById("quiz-exit-back-btn").onclick = () => {
                // ড্যাশবোর্ডের ব্যাক বাটন ট্রিগার করে স্টাডি জোনে ফেরত পাঠানো
                document.getElementById("dashboard-back-btn").click();
            };
        }

        // কুইজ ইঞ্জিন স্টার্ট ট্রিগার
        displayQuestion();

    } catch (err) {
        renderArea.innerHTML = `<div class="card-mneet border-red" style="padding: 16px; color: var(--neon-red);">Error booting Quiz Matrix: ${err.message}</div>`;
    }
                                          }
                      
