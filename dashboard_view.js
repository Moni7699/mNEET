// ১. হোম স্ক্রিন মডিউল
export function renderHomeSection(studentName) {
    return `
        <div style="margin-bottom: 20px;">
            <h1 style="font-size: 26px; font-weight: 900; margin: 0; tracking: -0.5px;">Dr. ${studentName}</h1>
            <p id="college-target-badge" style="color: #F3B917; font-size: 11px; margin: 4px 0 0 0; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">TARGET: NOT SET (Click Menu to Set)</p>
        </div>

        <div class="card-gold" style="padding: 14px; margin-bottom: 16px;">
            <label style="display: block; font-size: 10px; font-weight: 800; color: #F3B917; margin-bottom: 6px; text-transform: uppercase;">Active Course Batch</label>
            <select id="batch-view-filter" class="input-field">
                <option value="neet_2027_ultimate">mNEET 2027 ULTIMATE BATCH</option>
                <option value="neet_dropper_pro">NEET DROPPER PRO BATCH</option>
            </select>
        </div>

        <div class="card-blue" style="padding: 16px; margin-bottom: 16px; text-align: center;">
            <p style="font-size: 10px; font-weight: 800; color: #94A3B8; margin: 0 0 10px 0; letter-spacing: 0.5px;">MY TARGET EXAM COUNTDOWN</p>
            <div style="display: flex; justify-content: center; gap: 14px; font-family: monospace;">
                <div><span id="timer-days" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8;">Days</div></div>
                <div style="font-size: 20px; color: #F3B917; font-weight:900;">:</div>
                <div><span id="timer-hours" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8;">Hrs</div></div>
                <div style="font-size: 20px; color: #F3B917; font-weight:900;">:</div>
                <div><span id="timer-mins" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8;">Mins</div></div>
                <div style="font-size: 20px; color: #F3B917; font-weight:900;">:</div>
                <div><span id="timer-secs" style="font-size: 24px; font-weight: 900; color: #F3B917;">00</span><div style="font-size: 9px; color: #94A3B8;">Secs</div></div>
            </div>
        </div>

        <div class="card-purple" style="padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #8B5CF6; margin-bottom: 4px;"><i class="fas fa-fire"></i> DAILY MOTIVATION HUB</div>
            <p style="font-size: 12px; margin: 0; font-weight: 600; line-height: 1.4; font-style: italic;">"Every single MCQ you solve correctly brings you closer to your stethoscope."</p>
        </div>

        <div class="card-blue" style="padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px;">
                <span>Syllabus Coverage Pulse</span>
                <span style="color: #F3B917;" id="syllabus-percent-badge">38%</span>
            </div>
            <div style="width: 100%; background-color: var(--bg-input); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background-color: #F3B917; width: 38%; height: 100%;"></div>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            <div class="card-blue" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 13px; font-weight: 800; color: #F3B917;"><i class="fas fa-play-circle mr-2"></i>Lectures: 45h / 180h Done</span>
                    <div style="font-size: 10px; color:#94A3B8; margin-top:2px;">Remaining: 135h | Topper Benchmark: 165h</div>
                </div>
            </div>
            <div class="card-blue" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 13px; font-weight: 800; color: #F3B917;"><i class="fas fa-pen-nib mr-2"></i>Ques Attempted: 650 / 5000</span>
                    <div style="font-size: 10px; color:#94A3B8; margin-top:2px;">Remaining: 4350 Qs | Topper Benchmark: 4200 Qs</div>
                </div>
            </div>
            <div class="card-blue" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 13px; font-weight: 800; color: #F3B917;"><i class="fas fa-hourglass-half mr-2"></i>Self Study: 120h / 900h</span>
                    <div style="font-size: 10px; color:#94A3B8; margin-top:2px;">Remaining: 780h | Topper Benchmark: 760h</div>
                </div>
            </div>
        </div>

        <div class="card-green" style="padding: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">👑</span>
                <span style="font-size: 11px; font-weight: 700;">Topper Aim Post Benchmark</span>
            </div>
            <span style="font-size: 12px; font-weight: 900; color: #10B981;">Score: 710/720</span>
        </div>
    `;
}

export function renderStudySection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">STUDY MATERIAL VAULT</h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="card-blue node-row">
                <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;"><i class="fas fa-book-open" style="color:#2563EB;"></i><span>i) NCERT Reading and PYQ Tag</span></div>
                <i class="fas fa-chevron-right" style="font-size:10px; color:#94A3B8;"></i>
            </div>
            <div class="card-gold node-row">
                <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;"><i class="fas fa-file-signature" style="color:#F3B917;"></i><span>ii) Lectures Notes and DPP Hub</span></div>
                <i class="fas fa-chevron-right" style="font-size:10px; color:#94A3B8;"></i>
            </div>
            <div class="card-purple node-row">
                <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;"><i class="fas fa-trophy" style="color:#8B5CF6;"></i><span>iii) Chapter and Topic wise Quiz</span></div>
                <i class="fas fa-chevron-right" style="font-size:10px; color:#94A3B8;"></i>
            </div>
            <div class="card-red node-row">
                <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;"><i class="fas fa-headset" style="color:#EF4444;"></i><span>iv) Doubt and Support Box</span></div>
                <i class="fas fa-chevron-right" style="font-size:10px; color:#94A3B8;"></i>
            </div>
        </div>
    `;
}

export function renderBatchesSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">AVAILABLE BATCHES</h2>
        <div class="card-gold" style="padding: 16px;">
            <h3 style="margin: 0 0 6px 0; font-size: 15px;">Target NEET Dropper Pro</h3>
            <p style="margin: 0; font-size: 11px; color:#94A3B8; line-height:1.4;">Complete Syllabus mapped video classes, structured modules & free Test Series.</p>
            <button class="btn-mneet" style="margin-top: 14px;">Enroll & Purchase</button>
        </div>
    `;
}

export function renderTestSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">TEST CENTER SERIES</h2>
        <div class="card-purple" style="padding: 12px; margin-bottom: 14px;">
            <label style="display: block; font-size: 10px; font-weight: 700; color:#8B5CF6; margin-bottom: 4px;">ACTIVE TEST SERIES</label>
            <select class="input-field"><option>All India mNEET Major Test Pack 2026/2027</option></select>
        </div>
        <div class="card-blue text-center" style="padding: 40px 10px; color: #94A3B8; font-size: 12px; font-weight:600;"> No papers active right now.</div>
    `;
}

export function renderMStoreSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color:#F3B917; margin: 0 0 14px 0;">mSTORE MARKETPLACE</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="card-blue" style="padding: 10px; display: flex; flex-direction: column;">
                <div style="width: 100%; height: 100px; background-color: var(--bg-input); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">📚</div>
                <h4 style="margin: 8px 0 4px 0; font-size: 12px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">NCERT Punch Biology</h4>
                <p style="margin: 0; font-size: 12px; color: #F3B917; font-weight: 800;">₹380</p>
                <button class="btn-mneet" style="margin-top: 8px; padding: 6px; font-size: 11px;">Buy Now</button>
            </div>
        </div>
    `;
}
