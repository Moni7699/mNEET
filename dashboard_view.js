// ১. হোম পেজ উইজেটস মডিউল
export function renderHomeSection(studentName) {
    return `
        <div class="widget-row">
            <h1 class="student-hero-title">Dr. ${studentName}</h1>
            <p style="color: #94A3B8; font-size: 11px; margin: 4px 0 0 0; font-weight: 500;">AIIMS TARGET STATION</p>
        </div>

        <div class="mneet-card-gold" style="padding: 14px; margin-bottom: 16px;">
            <label style="display: block; font-size: 10px; font-weight: 800; color: #F3B917; margin-bottom: 6px; text-transform: uppercase;">Active Workspace Batch</label>
            <select id="batch-view-filter" style="width:100%; font-size:13px; font-weight:700; padding:10px; border-radius:12px;">
                <option value="neet_2027_ultimate">NEET 2027 ULTIMATE BATCH</option>
                <option value="neet_dropper_pro">NEET DROPPER PRO BATCH</option>
            </select>
        </div>

        <div class="mneet-card-blue text-center" style="padding: 16px; margin-bottom: 16px;">
            <p style="font-size: 10px; font-weight: 700; color: #94A3B8; margin: 0 0 10px 0; letter-spacing: 0.5px;">NEET VICTORY COUNTDOWN</p>
            <div style="display: flex; justify-content: center; gap: 12px; font-family: monospace;">
                <div><span id="timer-days" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8; margin-top:2px;">Days</div></div>
                <div style="font-size: 20px; color: #F3B917; font-weight:900;">:</div>
                <div><span id="timer-hours" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8; margin-top:2px;">Hours</div></div>
                <div style="font-size: 20px; color: #F3B917; font-weight:900;">:</div>
                <div><span id="timer-mins" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8; margin-top:2px;">Mins</div></div>
                <div style="font-size: 20px; color: #F3B917; font-weight:900;">:</div>
                <div><span id="timer-secs" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8; margin-top:2px;">Secs</div></div>
            </div>
        </div>

        <div id="admin-motivation-banner" class="mneet-card-purple" style="padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #8B5CF6; margin-bottom: 4px;"><i class="fas fa-fire"></i> DAILY MOTIVATION</div>
            <p id="motivation-box-text" style="font-size: 12px; margin: 0; font-weight: 600; line-height: 1.4; italic">"Every single MCQ you solve correctly brings you closer to your stethoscope."</p>
        </div>

        <div class="mneet-card-blue" style="padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px;">
                <span>Syllabus Progress Tracker</span>
                <span style="color: #F3B917;" id="syllabus-percent-badge">0%</span>
            </div>
            <div style="width: 100%; background-color: #0D131F; height: 8px; border-radius: 4px; overflow: hidden;">
                <div id="syllabus-ui-progress-bar" style="background-color: #F3B917; width: 0%; height: 100%; transition: width 0.4s;"></div>
            </div>
        </div>

        <div style="display: grid; grid-template-cols: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
            <div class="mneet-card-blue text-center" style="padding: 10px 4px;">
                <span style="font-size: 13px; font-weight: 800; color: #F3B917; block" id="track-lec">0h done</span>
                <span style="font-size: 9px; color: #94A3B8; display: block; margin-top: 4px;">Lectures Left</span>
            </div>
            <div class="mneet-card-blue text-center" style="padding: 10px 4px;">
                <span style="font-size: 13px; font-weight: 800; color: #F3B917; block" id="track-q">0 Qs</span>
                <span style="font-size: 9px; color: #94A3B8; display: block; margin-top: 4px;">Qs Remaining</span>
            </div>
            <div class="mneet-card-blue text-center" style="padding: 10px 4px;">
                <span style="font-size: 13px; font-weight: 800; color: #F3B917; block" id="track-study">0h done</span>
                <span style="font-size: 9px; color: #94A3B8; display: block; margin-top: 4px;">Study Target</span>
            </div>
        </div>

        <div class="mneet-card-green" style="padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">👑</span>
                <span style="font-size: 11px; font-weight: 700;">Topper Dashboard Pulse</span>
            </div>
            <span style="font-size: 12px; font-weight: 900; color: #10B981;">96% Score</span>
        </div>
    `;
}

// ২. স্টাডি জোন উইজেটস মডিউল
export function renderStudySection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">STUDY VAULT</h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="mneet-card-blue node-action-row">
                <div class="node-left-part"><i class="fas fa-book-open" style="color: #2563EB;"></i><span>i) NCERT Reading & PYQ Tag</span></div>
                <i class="fas fa-chevron-right node-arrow"></i>
            </div>
            <div class="mneet-card-gold node-action-row">
                <div class="node-left-part"><i class="fas fa-file-alt" style="color: #F3B917;"></i><span>ii) Lectures Notes & DPP Hub</span></div>
                <i class="fas fa-chevron-right node-arrow"></i>
            </div>
            <div class="mneet-card-purple node-action-row">
                <div class="node-left-part"><i class="fas fa-vial" style="color: #8B5CF6;"></i><span>iii) Chapter & Topic wise Quiz</span></div>
                <i class="fas fa-chevron-right node-arrow"></i>
            </div>
            <div class="mneet-card-red node-action-row">
                <div class="node-left-part"><i class="fas fa-headset" style="color: #EF4444;"></i><span>iv) Doubt & Support Box</span></div>
                <i class="fas fa-chevron-right node-arrow"></i>
            </div>
        </div>
    `;
}

// ৩. ব্যাচ সেকশন উইজেটস মডিউল
export function renderBatchesSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">BATCHES</h2>
        <div style="display: flex; flex-direction: column; gap: 12px;" id="inject-db-batches-list">
            <div class="mneet-card-gold" style="padding: 16px;">
                <h3 style="margin: 0 0 6px 0; font-size: 15px;">Target NEET Dropper Pro</h3>
                <p style="margin: 0; font-size: 11px; color:#94A3B8;">Complete Video Lectures, Modules & Live Test Access</p>
                <button class="btn-mneet" style="margin-top: 12px; padding: 10px;">Enroll In Batch</button>
            </div>
        </div>
    `;
}

// ৪. টেস্ট জোন উইজেটস মডিউল
export function renderTestSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">TEST CENTER</h2>
        <div class="mneet-card-purple" style="padding: 12px; margin-bottom: 14px;">
            <label style="display: block; font-size: 10px; font-weight: 700; color:#8B5CF6; margin-bottom: 4px;">SELECT TEST PACK</label>
            <select style="width: 100%; padding: 8px; border-radius: 8px; font-size: 12px;"><option>All India mNEET Test Series 2026/2027</option></select>
        </div>
        <div class="mneet-card-blue text-center" style="padding: 30px 10px; color: #94A3B8; font-size: 12px; font-weight:600;">
            No online mock question papers are scheduled right now.
        </div>
    `;
}

// ৫. এমস্টোর উইজেটস মডিউল
export function renderMStoreSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">mSTORE MARKETPLACE</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="mneet-card-blue" style="padding: 10px; display: flex; flex-direction: column;">
                <div style="width: 100%; height: 100px; background-color: #0D131F; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">📚</div>
                <h4 style="margin: 8px 0 4px 0; font-size: 12px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">NCERT Punch Biology</h4>
                <p style="margin: 0; font-size: 12px; color: #F3B917; font-weight: 800;">₹380 <span style="font-size: 9px; color: #94A3B8; text-decoration: line-through; font-weight:400;">₹500</span></p>
                <button class="btn-mneet" style="margin-top: 8px; padding: 8px; font-size: 11px;">Buy Now</button>
            </div>
        </div>
    `;
}
