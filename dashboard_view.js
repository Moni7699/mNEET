// ১. হোম সেকশন রেন্ডারার
export function renderHomeSection(studentName) {
    return `
        <div class="premium-name-card">
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 45px; height: 45px; background-color: var(--gold); border-radius: 50%; color: #000; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                    ${studentName[0].toUpperCase()}
                </div>
                <div>
                    <h1 style="font-size: 24px; font-weight: 900; margin: 0; color: var(--text-title);">Dr. ${studentName}</h1>
                    <p id="college-target-badge" style="color: var(--gold); font-size: 11px; margin: 4px 0 0 0; font-weight: 800; letter-spacing: 0.5px;">TARGET: AIIMS DELHI</p>
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

        <!-- 3-Way Active Motivation Frame -->
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

// 🔔 ২. ডেডিকেটেড নোটিফিকেশন স্ক্রিন ভিউ
export function renderNotificationSection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color: var(--neon-red); margin-bottom: 14px;"><i class="fas fa-bell mr-2"></i>Live Notification Updates</h2>
        <div style="display: flex; flex-direction: column; gap: 12px;" id="notification-list-target">
            <div class="card-mneet border-red" style="padding: 14px;">
                <span style="font-size: 10px; background-color: rgba(239,68,68,0.1); padding: 2px 6px; border-radius: 6px; color: var(--neon-red); font-weight:700;">UPDATE</span>
                <h4 style="margin: 8px 0 4px 0; font-size: 13px;">New Quiz Engine Live!</h4>
                <p style="margin: 0; font-size: 11px; color: var(--text-para);">Earn +10 BP Coins on every correct answer in the Topic wise Quiz zone now!</p>
            </div>
        </div>
    `;
}

// 💬 ৩. হোয়াটসঅ্যাপ কমিউনিটি ডিসকাশন স্ক্রিন (Chat & Photo Upload)
export function renderWPCommunitySection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color: var(--neon-green); margin-bottom: 4px;"><i class="fab fa-whatsapp mr-2"></i>mNEET Elite Club</h2>
        <p style="font-size: 11px; color: var(--text-para); margin-bottom: 14px;">Course Mapped Peer-to-Peer Group Discussion</p>
        
        <div class="card-mneet border-green" style="height: calc(100vh - 260px); display: flex; flex-direction: column; padding: 10px;">
            <div id="chat-messages-box" style="flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 10px;">
                <div style="background-color: var(--bg-input); padding: 10px; border-radius: 12px; max-width: 85%; align-self: flex-start;">
                    <span style="font-size: 10px; color: var(--gold); font-weight: 700; display:block;">Admin Bot</span>
                    <span style="font-size: 12px;">Welcome to your batch community! Ask doubts, share photos of solved equations here.</span>
                </div>
            </div>
            
            <!-- Message & Photo Input Row -->
            <div style="display: flex; gap: 8px; align-items: center; border-top: 1px solid var(--border-line); padding-top: 10px; margin-top: 5px;">
                <label for="chat-photo-file" style="color: var(--neon-green); font-size: 18px; cursor: pointer; padding: 0 4px;"><i class="fas fa-camera"></i></label>
                <input type="file" id="chat-photo-file" accept="image/*" style="display: none !important;">
                <input type="text" id="chat-text-input" placeholder="Type message or paste image link..." style="flex:1; margin:0 !important; padding: 10px !important;">
                <button id="chat-send-btn" class="link-btn" style="color: var(--neon-green); font-size: 18px; padding: 0 4px;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
}

// 🎮 ৪. বিপি কয়েন গেমিং সিস্টেম লিডারবোর্ড (Weekly Promotion/Demotion Mechanism)
export function renderBPCoinGamingSection(userCurrentBP, userCurrentRank) {
    // র্যাংক অনুযায়ী মেডেল বা ব্যাজ নির্ধারণ
    let statusBadge = "STAY RANK";
    if(userCurrentBP > 1200) statusBadge = "🔥 PROMOTION ZONE";
    if(userCurrentBP < 100) statusBadge = "⚠️ DEMOTION WARNING";

    return `
        <h2 style="font-size: 20px; font-weight: 800; color: var(--gold); margin-bottom: 2px;"><i class="fas fa-trophy mr-2"></i>Gaming Rank System</h2>
        <p style="font-size: 11px; color: var(--text-para); margin-bottom: 16px;">Weekly Rank changes on Sunday based on study activity</p>

        <!-- Current User Profile Rank Card -->
        <div class="card-mneet border-gold" style="background: linear-gradient(135deg, rgba(243,185,23,0.05) 0%, transparent 100%); padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 11px; font-weight: 800; color: var(--text-para); block; uppercase;">My Live Status</span>
                    <h3 style="font-size: 22px; font-weight: 900; margin: 4px 0 0 0; color: var(--gold);">${userCurrentRank}</h3>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 14px; font-weight: 900; block;">${userCurrentBP} BP</span>
                    <span style="font-size: 10px; display:block; margin-top:4px; font-weight: 800; color: ${userCurrentBP < 100 ? '#EF4444' : '#10B981'};">${statusBadge}</span>
                </div>
            </div>
            
            <!-- Rules Mapping Box -->
            <div style="background-color: var(--bg-input); padding: 8px 12px; border-radius: 10px; margin-top: 12px; font-size: 10px; color: var(--text-para); line-height: 1.4;">
                ⚡ <b>BP Multiplier Rules:</b> Correct Quiz Answer (+10 BP) | Complete NCERT Reading Chapter (+50 BP) | DPP Full Watch Solutions (+30 BP) | Lecture Completions (+40 BP). Wrong Ans triggers Stay/Demotion status.
            </div>
        </div>

        <!-- Weekly Leaderboard Table -->
        <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 10px; color: var(--text-title);">Weekly Global Leaderboard</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="card-mneet border-blue" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin: 0;">
                <span style="font-size: 12px; font-weight: 800;">🥇 #1 Dr. Ananya Sen (Alpha)</span>
                <span style="font-size: 12px; font-weight: 900; color: var(--neon-green);">2,450 BP [PROMOTED]</span>
            </div>
            <div class="card-mneet border-purple" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin: 0;">
                <span style="font-size: 12px; font-weight: 800;">🥈 #2 Dr. Subhojit Das</span>
                <span style="font-size: 12px; font-weight: 900; color: var(--gold);">1,890 BP [STAY RANK]</span>
            </div>
            <div class="card-mneet border-red" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin: 0;">
                <span style="font-size: 12px; font-weight: 800;">🥉 #3 Dr. Monirul Islam (You)</span>
                <span style="font-size: 12px; font-weight: 900; color: var(--gold);">${userCurrentBP} BP [STAY]</span>
            </div>
        </div>
    `;
}

export function renderStudySection() { return ``; }
export function renderBatchesSection() { return ``; }
export function renderTestSection() { return ``; }
export function renderMStoreSection() { return ``; }
