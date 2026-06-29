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
    `;
}

// 📚 স্তর ১: ৪টি মেনু সম্বলিত স্টাডি জোন ফ্রন্ট গেট
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

// 🧬 স্তর ২: সাবজেক্ট সিলেকশন গেট
export function renderSubjectGate(originRow) {
    return `
        <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 14px; text-transform: uppercase;">Select Subject</h2>
        <div class="card-mneet border-green node-row subject-select-btn" data-subject="biology" data-origin="${originRow}">
            <div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;"><i class="fas fa-dna" style="color:var(--neon-green);"></i><span>🧬 BIOLOGY CORE</span></div>
        </div>
        <div class="card-mneet border-red node-row subject-select-btn" data-subject="chemistry" data-origin="${originRow}">
            <div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;"><i class="fas fa-flask" style="color:var(--neon-red);"></i><span>🧪 CHEMISTRY CORE</span></div>
        </div>
        <div class="card-mneet border-blue node-row subject-select-btn" data-subject="physics" data-origin="${originRow}">
            <div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;"><i class="fas fa-bolt" style="color:var(--neon-blue);"></i><span>⚡ PHYSICS CORE</span></div>
        </div>
    `;
}

// 📑 স্তর ৩: চ্যাপ্টার প্লেলিস্ট
export function renderChapterPlaylist(subject, originRow) {
    return `
        <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 14px; text-transform: uppercase;">${subject} Chapters</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
            <div class="card-mneet border-gold chapter-item-btn" data-chapter="cell_division" data-subject="${subject}" data-origin="${originRow}" style="padding:14px; cursor:pointer;">
                <h4 style="font-size:14px; margin:0;">Cell Cycle and Cell Division</h4>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-para); margin-top:6px;">
                    <span>🔥 High Yield (Red Tag)</span>
                    <span style="color:var(--gold); font-weight:700;">✅ Verified</span>
                </div>
            </div>
            <div class="card-mneet border-blue chapter-item-btn" data-chapter="biomolecules" data-subject="${subject}" data-origin="${originRow}" style="padding:14px; cursor:pointer;">
                <h4 style="font-size:14px; margin:0;">Biomolecules and Proteins</h4>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-para); margin-top:6px;">
                    <span>⚡ Medium Priority</span>
                    <span style="color:var(--neon-blue); font-weight:700;">+50 BP Value</span>
                </div>
            </div>
        </div>
    `;
}

// ⚔️ স্তর ৪: ১০-প্লেয়ার আল্ট্রা-অ্যাডভান্সড লাইভ ব্যাটল রুম এরিনা ইউআই
export function renderBattleLobbyView(roomCode, currentParticipantsCount) {
    return `
        <div class="card-mneet border-purple" style="text-align:center; padding:20px;">
            <span style="font-size:10px; background-color:rgba(139,92,246,0.1); padding:4px 8px; border-radius:6px; color:var(--neon-purple); font-weight:800;">10-PLAYER LIVE ARENA</span>
            <h3 style="font-size:22px; margin:12px 0 6px 0; font-weight:900;">BATTLE ROOM CODE</h3>
            <div style="font-size:26px; font-family:monospace; font-weight:900; color:var(--gold); background:var(--bg-input); padding:10px; border-radius:12px; letter-spacing:4px; margin-bottom:12px;">
                ${roomCode}
            </div>
            <p style="font-size:12px; color:var(--text-para);">Share this code with up to 10 friends. The quiz begins automatically when the slots fill or room creator locks start.</p>
        </div>

        <div class="card-mneet border-blue">
            <h4 style="font-size:13px; margin-bottom:12px; font-weight:800;"><i class="fas fa-users mr-2"></i>Joined Surgeons Slots (${currentParticipantsCount}/10)</h4>
            <div id="battle-participants-list" style="display:flex; flex-direction:column; gap:8px;">
                <div class="battle-user-badge"><span>🥇 1. Waiting for players...</span><span style="color:var(--gold);">READY</span></div>
            </div>
        </div>

        <button id="force-start-battle-btn" class="btn-mneet" style="background: linear-gradient(135deg, var(--neon-purple) 0%, var(--neon-blue) 100%) !important; color:white !important;">
            Launch Multiplayer Battle ⚔️
        </button>
    `;
}

export function renderNotificationSection() { return ``; }
export function renderWPCommunitySection() { return ``; }
export function renderBPCoinGamingSection() { return ``; }
export function renderBatchesSection() { return ``; }
export function renderTestSection() { return ``; }
export function renderMStoreSection() { return ``; }
