// ১. হোম সেকশন রেন্ডারার
export function renderHomeSection(studentName) {
    return `
        <!-- Attractive Premium Student Badge -->
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

        <!-- Workspace Course Filter Selector -->
        <div class="card-mneet border-gold">
            <label style="display: block; font-size: 10px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Active Course Workspace</label>
            <select id="batch-view-filter" class="input-field">
                <option value="neet_2027_ultimate">mNEET 2027 ULTIMATE BATCH</option>
                <option value="neet_dropper_pro">NEET DROPPER PRO BATCH</option>
            </select>
        </div>

        <!-- Target Count Down Framework -->
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

        <!-- 3-Way Media Adaptive Motivation Block (Text, Image, or Video Player) -->
        <div class="card-mneet border-purple" id="motivation-media-container">
            <div style="font-size: 10px; font-weight: 800; color: var(--neon-purple); margin-bottom: 8px;"><i class="fas fa-fire"></i> DAILY MOTIVATION STATION</div>
            <div id="motivation-payload-area">
                <!-- ডাইনামিকভাবে এডমিন প্যানেল থেকে টেক্সট, ছবি বা ভিডিও এখানে ইনজেক্ট হবে -->
                <p style="font-size: 12px; margin: 0; font-weight: 600; line-height: 1.4; font-style: italic;">"Every single MCQ you solve correctly brings you closer to your stethoscope."</p>
            </div>
        </div>

        <!-- Syllabus Coverage Pulse Bar -->
        <div class="card-mneet border-blue">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px;">
                <span>Syllabus Target Coverage</span>
                <span style="color: var(--gold);" id="syllabus-percent-badge">38%</span>
            </div>
            <div style="width: 100%; background-color: var(--bg-app); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background-color: var(--gold); width: 38%; height: 100%;"></div>
            </div>
        </div>

        <!-- 3 Core Trackers Metrics with Topper Cross Validation Mappings -->
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

export function renderStudySection() { return ``; }
export function renderBatchesSection() { return ``; }
export function renderTestSection() { return ``; }
export function renderMStoreSection() { return ``; }
