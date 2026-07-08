let countdownInterval = null;

/**
 * mNEET Professional Home Dashboard Content Renderer
 * @param {HTMLElement} container - স্ক্রোলযোগ্য মিডল এরিয়া
 * @param {Object} userData - ফায়ারবেস থেকে আসা ইউজারের রিয়েল ডেটা
 * @param {Boolean} isAdmin - ইউজার অ্যাডমিন কি না
 */
export function renderHomeScreen(container, userData, isAdmin) {
    
    // ইন্টারনাল সিলেকশন ড্রপডাউন এবং স্ট্যাটিস্টিক ক্যালকুলেশন
    const totalTests = userData.totalTestsAttended || 0;
    const totalQuestions = userData.totalQuestionsSolved || 0;
    const successRate = userData.successPercentage || 0;
    const predictedRank = userData.airPrediction || "N/A";

    container.innerHTML = `
        <!-- 👑 ADMIN MIRROR ENGINE CONTROL -->
        ${isAdmin ? `
            <div style="background: rgba(218,54,55,0.08); border: 1px dashed var(--accent-red); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <h5 style="color:var(--accent-red); margin:0 0 5px 0;">⚡ Admin Configuration Engine</h5>
                <button id="admin-upload-btn" style="background:var(--accent-green); color:#fff; border:none; padding:6px 10px; border-radius:4px; font-size:0.75rem; font-weight:bold; cursor:pointer;">+ Upload Daily Motivation Content</button>
            </div>
        ` : ''}

        <!-- 📦 1. PURCHASED & FREE PACKAGE SELECTION BAR -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted);">Active Package:</span>
            <select id="package-selector" style="background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); padding: 5px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; outline:none;">
                <option value="free">Free Practice Account</option>
                <option value="premium_spark" ${userData.hasPremium ? 'selected' : ''}>mNEET Spark Premium Test</option>
                <option value="crash_course">NEET 2026 Rankers Test</option>
            </select>
        </div>

        <!-- ⏰ 2. HIGH-TECH TARGET COUNTDOWN CLOCK -->
        <div style="background: linear-gradient(135deg, #1f2937, #111827); border: 1px solid var(--border-color); padding: 15px; border-radius: 12px; margin-bottom: 15px; text-align: center;">
            <span style="font-size: 0.75rem; color: var(--accent-blue); font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Countdown to NEET Exam Target</span>
            <div id="countdown-clock" style="display: flex; justify-content: center; gap: 10px; margin-top: 8px; font-family: monospace; font-size: 1.2rem; font-weight: bold; color: #fff;">
                <div style="background:#2d3748; padding:5px 8px; border-radius:4px;">00<span style="font-size:0.6rem; display:block; color:var(--text-muted);">Days</span></div>
                <div style="background:#2d3748; padding:5px 8px; border-radius:4px;">00<span style="font-size:0.6rem; display:block; color:var(--text-muted);">Hours</span></div>
                <div style="background:#2d3748; padding:5px 8px; border-radius:4px;">00<span style="font-size:0.6rem; display:block; color:var(--text-muted);">Mins</span></div>
                <div style="background:#2d3748; padding:5px 8px; border-radius:4px; color:var(--coin-gold);">00<span style="font-size:0.6rem; display:block; color:var(--text-muted);">Secs</span></div>
            </div>
        </div>

        <!-- 🎥 3. DAILY MOTIVATION HUB (ADMIN CONTROLLED) -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; margin-bottom: 15px;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                <span>✨</span><h4 style="margin:0; font-size:0.85rem; color:var(--coin-gold);">Daily Mentor Feed</h4>
            </div>
            <p id="motivation-text" style="margin:0; font-size:0.8rem; color:var(--text-main); line-height:1.4;">
                ${userData.dailyMotivation || "Loading daily mentor updates... \"Believe you can and you're halfway there.\""}
            </p>
        </div>

        <!-- 🎯 4. LIVE & DAILY UPLOADED TEST TRACKS -->
        <h4 style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 8px 0; text-transform: uppercase;">Live & Upcoming Tests</h4>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-left: 4px solid var(--accent-red); padding: 12px; border-radius: 8px; margin-bottom: 10px; display:flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="background:var(--accent-red); color:white; font-size:0.6rem; font-weight:bold; padding:2px 5px; border-radius:3px;">LIVE NOW</span>
                <h5 style="margin:4px 0 2px 0; font-size:0.85rem;">Full Syllabus Biology Mock-03</h5>
                <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">Duration: 180 Mins • 90 MCQs</p>
            </div>
            <button style="background:var(--accent-blue); color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:0.75rem; font-weight:bold; cursor:pointer;">Attend</button>
        </div>

        <!-- 📊 5. COMPREHENSIVE PROGRESS TRACKER & TOPPER COMPARISON -->
        <h4 style="font-size: 0.85rem; color: var(--text-muted); margin: 15px 0 8px 0; text-transform: uppercase;">Analytics & Progress Tracking</h4>
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px; border-radius: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div style="background:var(--bg-main); padding:10px; border-radius:6px; text-align:center;">
                    <span style="font-size:1.1rem; font-weight:bold; color:var(--accent-green);">${totalTests}</span>
                    <span style="font-size:0.65rem; display:block; color:var(--text-muted);">Tests Completed</span>
                </div>
                <div style="background:var(--bg-main); padding:10px; border-radius:6px; text-align:center;">
                    <span style="font-size:1.1rem; font-weight:bold; color:var(--accent-blue);">${totalQuestions}</span>
                    <span style="font-size:0.65rem; display:block; color:var(--text-muted);">Total MCQs Solved</span>
                </div>
            </div>

            <!-- Rank & Performance Metrics -->
            <div style="margin-bottom: 12px; font-size:0.8rem; display:flex; justify-content:space-between; border-bottom: 1px solid var(--border-color); padding-bottom:6px;">
                <span style="color:var(--text-muted);">Predicted AIR Rank:</span>
                <span style="font-weight:bold; color:var(--coin-gold);">#${predictedRank}</span>
            </div>

            <!-- Topper Comparison Metrics -->
            <span style="font-size:0.75rem; font-weight:bold; color:var(--text-main); display:block; margin-bottom:8px;">Accuracy Comparison against AIR #1 Topper</span>
            <div style="margin-bottom: 8px;">
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:2px;"><span style="color:var(--accent-blue);">Your Accuracy</span><span>${successRate}%</span></div>
                <div style="background:var(--bg-main); height:6px; border-radius:3px;"><div style="background:var(--accent-blue); width:${successRate}%; height:100%; border-radius:3px;"></div></div>
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:2px;"><span style="color:var(--coin-gold);">Topper Accuracy (AIR 1)</span><span>98%</span></div>
                <div style="background:var(--bg-main); height:6px; border-radius:3px;"><div style="background:var(--coin-gold); width:98%; height:100%; border-radius:3px;"></div></div>
            </div>
        </div>
    `;

    // 🚀 রিয়েল-টাইম কাউন্টডাউন টাইমার সিস্টেম ইনিশিয়ালাইজেশন
    if (countdownInterval) clearInterval(countdownInterval);
    if (userData.targetDate) {
        setupCountdown(userData.targetDate);
    }

    // ড্রপডাউন সিলেক্টর ইভেন্ট কানেকশন (ফায়ারবেস ইন্টিগ্রেশনের সুবিধার্থে)
    document.getElementById('package-selector').addEventListener('change', (e) => {
        console.log("Selected Package: ", e.target.value);
        // পরবর্তীতে এর মাধ্যমে স্টাডি এবং টেস্ট সেকশন ফিল্টার হবে
    });
}

function setupCountdown(targetDateStr) {
    const clockEl = document.getElementById('countdown-clock');
    if (!clockEl) return;

    const targetDate = new Date(targetDateStr).getTime();

    function updateClock() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            clockEl.innerHTML = `<span style="color:var(--accent-red)">Target Exam Date Passed!</span>`;
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        clockEl.innerHTML = `
            <div style="background:#2d3748; padding:5px 8px; border-radius:4px; min-width:40px;">${days}<span style="font-size:0.55rem; display:block; color:var(--text-muted);">Days</span></div>
            <div style="background:#2d3748; padding:5px 8px; border-radius:4px; min-width:40px;">${hours}<span style="font-size:0.55rem; display:block; color:var(--text-muted);">Hours</span></div>
            <div style="background:#2d3748; padding:5px 8px; border-radius:4px; min-width:40px;">${minutes}<span style="font-size:0.55rem; display:block; color:var(--text-muted);">Mins</span></div>
            <div style="background:#2d3748; padding:5px 8px; border-radius:4px; min-width:40px; color:var(--coin-gold);">${seconds}<span style="font-size:0.55rem; display:block; color:var(--text-muted);">Secs</span></div>
        `;
    }

    updateClock();
    countdownInterval = setInterval(updateClock, 1000);
                                                                 }
        
