// ১. হোম ইন্টারফেস (কাউন্টডাউন + ৩টি অ্যাডভান্সড মেকানিজম ট্র্যাকার সহ)
export function renderHomeSection(studentName) {
    return `
        <div class="premium-name-card">
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 45px; height: 45px; background-color: var(--gold); border-radius: 50%; color: #000; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                    ${studentName[0].toUpperCase()}
                </div>
                <div>
                    <h1 style="font-size: 24px; font-weight: 900; margin: 0; color: var(--text-title);">Dr. ${studentName}</h1>
                    <p id="college-target-badge" style="color: var(--gold); font-size: 11px; margin: 4px 0 0 0; font-weight: 800; letter-spacing: 0.5px;">TARGET: LOADING...</p>
                </div>
            </div>
        </div>

        <div class="card-mneet border-gold">
            <label style="display: block; font-size: 10px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Active Course Workspace</label>
            <select id="batch-view-filter" class="input-field">
                <option value="neet_2027_ultimate">mNEET 2027 ULTIMATE BATCH</option>
                <option value="neet_dropper_pro">NEET DROPPER PRO BATCH</option>
            </select>
        </div>

        <div class="card-mneet border-blue" style="text-align: center;">
            <p style="font-size: 10px; font-weight: 800; color: var(--text-para); margin: 0 0 10px 0; letter-spacing: 0.5px;">MY TARGET EXAM COUNTDOWN</p>
            <div style="display: flex; justify-content: center; gap: 14px; font-family: monospace;">
                <div><span id="timer-days" style="font-size: 24px; font-weight: 900; color: var(--gold);">00</span><div style="font-size: 9px; color: var(--text-para);">Days</div></div>
                <div style="font-size: 20px; color: var(--gold); font-weight:900;">:</div>
                <div><span id="timer-hours" style="font-size: 24px; font-weight: 900; color: var(--gold);">00</span><div style="font-size: 9px; color: var(--text-para);">Hrs</div></div>
                <div style="font-size: 20px; color: var(--gold); font-weight:900;">:</div>
                <div><span id="timer-mins" style="font-size: 24px; font-weight: 900; color: var(--gold);">00</span><div style="font-size: 9px; color: var(--text-para);">Mins</div></div>
                <div style="font-size: 20px; color: var(--gold); font-weight:900;">:</div>
                <div><span id="timer-secs" style="font-size: 24px; font-weight: 900; color: var(--gold);">00</span><div style="font-size: 9px; color: var(--text-para);">Secs</div></div>
            </div>
        </div>

        <div class="card-mneet border-purple" id="motivation-media-container">
            <div style="font-size: 10px; font-weight: 800; color: var(--neon-purple); margin-bottom: 8px;"><i class="fas fa-fire"></i> DAILY MOTIVATION STATION</div>
            <div id="motivation-payload-area">
                <p style="font-size: 12px; margin: 0; font-weight: 600; line-height: 1.4; font-style: italic;">"Every single MCQ you solve correctly brings you closer to your stethoscope."</p>
            </div>
        </div>

        <div class="card-mneet border-blue">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px;">
                <span>Syllabus Target Coverage</span>
                <span style="color: var(--gold);" id="syllabus-percent-badge">38%</span>
            </div>
            <div style="width: 100%; background-color: var(--bg-input); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background-color: var(--gold); width: 38%; height: 100%;"></div>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div class="card-mneet border-blue" style="padding: 12px 16px;">
                <span style="font-size: 13px; font-weight: 800; color: var(--gold);"><i class="fas fa-play-circle mr-2"></i>Lectures: 45h / 180h Done</span>
                <div style="font-size: 10px; color: var(--text-para); margin-top:2px;">Remaining: 135h | Topper Benchmark: 165h</div>
            </div>
            <div class="card-mneet border-blue" style="padding: 12px 16px;">
                <span style="font-size: 13px; font-weight: 800; color: var(--gold);"><i class="fas fa-pen-nib mr-2"></i>Ques Attempted: 650 / 5000</span>
                <div style="font-size: 10px; color: var(--text-para); margin-top:2px;">Remaining: 4350 Qs | Topper Benchmark: 4200 Qs</div>
            </div>
            <div class="card-mneet border-blue" style="padding: 12px 16px;">
                <span style="font-size: 13px; font-weight: 800; color: var(--gold);"><i class="fas fa-hourglass-half mr-2"></i>Self Study: 120h / 900h</span>
                <div style="font-size: 10px; color: var(--text-para); margin-top:2px;">Remaining: 780h | Topper Benchmark: 760h</div>
            </div>
        </div>
    `;
}

// 🔔 ২. নোটিফিকেশন ইন্টারফেস
export function renderNotificationSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color: var(--neon-red); margin-bottom: 14px;"><i class="fas fa-bell mr-2"></i>Live Notification Updates</h2>
        <div class="card-mneet border-red" style="padding: 14px;">
            <span style="font-size: 10px; background-color: rgba(239,68,68,0.1); padding: 2px 6px; border-radius: 6px; color: var(--neon-red); font-weight:700;">UPDATE</span>
            <h4 style="margin: 8px 0 4px 0; font-size: 13px;">New Quiz Engine Live!</h4>
            <p style="margin: 0; font-size: 11px; color: var(--text-para);">Earn +10 BP Coins on every correct answer in the Topic wise Quiz zone now!</p>
        </div>
    `;
}

// 📚 ৩. স্টাডি জোন রুট উইন্ডো
export function renderStudySection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color: var(--gold); margin-bottom: 14px;">STUDY ARCHIVE</h2>
        <div class="card-mneet border-blue node-row" id="trigger-ncert-reading">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;"><i class="fas fa-book-open" style="color:var(--neon-blue);"></i><span>i) NCERT Reading and PYQ Tag</span></div>
            <i class="fas fa-chevron-right"></i>
        </div>
        <div class="card-mneet border-gold node-row" id="trigger-lectures">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;"><i class="fas fa-file-signature" style="color:var(--gold);"></i><span>ii) Lectures Notes and DPP Hub</span></div>
            <i class="fas fa-chevron-right"></i>
        </div>
        <div class="card-mneet border-purple node-row" id="trigger-quiz">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;"><i class="fas fa-trophy" style="color:var(--neon-purple);"></i><span>iii) Chapter and Topic wise Quiz</span></div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `;
}

// 📦 ৪. বাকি স্ট্যাটিক উইজেট ম্যাপস
export function renderBatchesSection() {
    return `<h2 style="font-size:20px; font-weight:800; color:var(--gold);">AVAILABLE BATCHES</h2><div class="card-mneet border-gold" style="padding:16px;"><h3 style="margin:0 0 6px 0; font-size:15px;">Target NEET Dropper Pro</h3><button class="btn-mneet" style="margin-top:14px;">Enroll & Purchase</button></div>`;
}
export function renderTestSection() {
    return `<h2 style="font-size:20px; font-weight:800; color:var(--gold);">TEST SERIES</h2><div class="card-mneet border-purple" style="padding:12px;"><select class="input-field"><option>All India mNEET Major Test Pack</option></select></div>`;
}
export function renderMStoreSection() {
    return `<h2 style="font-size:20px; font-weight:800; color:var(--gold);">mSTORE MARKETPLACE</h2><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div class="card-mneet border-blue" style="padding:10px;"><h4 style="font-size:12px;">NCERT Punch Biology</h4><p style="color:var(--gold); font-weight:800; margin:4px 0;">₹380</p><button class="btn-mneet" style="padding:6px; font-size:11px;">Buy Now</button></div></div>`;
}

// ৪-স্তরের সাবজেক্ট ও ১০-প্লেয়ার এরিনা এক্সটেনশনগুলো নিচে লোড হচ্ছে
export function renderSubjectGate(originRow) {
    return `<h2 style="font-size:18px; font-weight:800; margin-bottom:14px;">SELECT SUBJECT</h2><div class="card-mneet border-green node-row subject-select-btn" data-subject="biology" data-origin="${originRow}"><div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;"><i class="fas fa-dna" style="color:var(--neon-green);"></i><span>🧬 BIOLOGY CORE</span></div></div><div class="card-mneet border-red node-row subject-select-btn" data-subject="chemistry" data-origin="${originRow}"><div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;"><i class="fas fa-flask" style="color:var(--neon-red);"></i><span>🧪 CHEMISTRY CORE</span></div></div>`;
}
export function renderChapterPlaylist(subject, originRow) {
    return `<h2 style="font-size:18px; font-weight:800; margin-bottom:14px; text-transform:uppercase;">${subject} Chapters</h2><div class="card-mneet border-gold chapter-item-btn" data-chapter="cell_division" data-subject="${subject}" data-origin="${originRow}" style="padding:14px; cursor:pointer;"><h4 style="font-size:14px; margin:0;">Cell Cycle and Cell Division</h4></div>`;
}
export function renderBattleLobbyView(roomCode, currentParticipantsCount) {
    return `<div class="card-mneet border-purple" style="text-align:center; padding:20px;"><span style="font-size:10px; color:var(--neon-purple); font-weight:800;">10-PLAYER LIVE ARENA</span><h3 style="font-size:22px; margin:12px 0 6px 0;">BATTLE CODE</h3><div style="font-size:26px; font-family:monospace; font-weight:900; color:var(--gold); background:var(--bg-input); padding:10px; border-radius:12px; letter-spacing:4px;">${roomCode}</div></div><div class="card-mneet border-blue"><h4>Slots Joined (${currentParticipantsCount}/10)</h4><div id="battle-participants-list" style="margin-top:10px;"></div></div>`;
}
export function renderWPCommunitySection() {
    return `<h2 style="font-size: 20px; font-weight: 800; color: var(--neon-green); margin-bottom: 14px;"><i class="fab fa-whatsapp mr-2"></i>mNEET Elite Club</h2><div class="card-mneet border-green" style="height: calc(100vh - 260px); display: flex; flex-direction: column; padding: 10px;"><div id="chat-messages-box" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px;"></div><div style="display:flex; gap:8px; border-top:1px solid var(--border-line); padding-top:10px;"><label for="chat-photo-file" style="color:var(--neon-green); font-size:18px; cursor:pointer;"><i class="fas fa-camera"></i></label><input type="file" id="chat-photo-file" accept="image/*" style="display:none;"><input type="text" id="chat-text-input" placeholder="Type message..." style="flex:1;"><button id="chat-send-btn" class="link-btn" style="color:var(--neon-green);"><i class="fas fa-paper-plane"></i></button></div></div>`;
}
export function renderBPCoinGamingSection(userCurrentBP, userCurrentRank) {
    return `<h2 style="font-size:20px; font-weight:800; color:var(--gold); margin-bottom:14px;">Gaming Rank System</h2><div class="card-mneet border-gold" style="padding:16px;"><h3>${userCurrentRank}</h3><p style="color:var(--gold); font-weight:900; margin-top:4px;">${userCurrentBP} BP</p></div>`;
}
