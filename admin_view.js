// ১. হোম অ্যাডমিন স্ক্রিন (সমস্ত রেজিস্টার্ড স্টুডেন্টের লাইভ ডিটেইলস ট্র্যাকার টেবিল ও কন্ট্রোল গ্রিড)
export function renderAdminHomeSection() {
    return `
        <div class="premium-name-card">
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 45px; height: 45px; background-color: var(--neon-red); border-radius: 50%; color: #fff; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div>
                    <h1 style="font-size: 22px; font-weight: 900; margin: 0; color: var(--text-title);">System Command</h1>
                    <p style="color: var(--gold); font-size: 11px; margin: 4px 0 0 0; font-weight: 800; letter-spacing: 0.5px;">REAL-TIME STUDENT RADAR TRACKER</p>
                </div>
            </div>
        </div>

        <div class="card-mneet border-purple">
            <div style="font-size: 11px; font-weight: 800; color: var(--neon-purple); margin-bottom: 10px; text-transform: uppercase;"><i class="fas fa-bullhorn"></i> Global App Motivation Hub</div>
            <div style="margin-bottom: 10px;">
                <select id="admin-motivation-type" class="input-field">
                    <option value="text">✍️ Simple Text Quote</option>
                    <option value="video">📺 YouTube Video Embed Code</option>
                </select>
            </div>
            <input type="text" id="admin-motivation-src" class="input-field" placeholder="Enter motivational quote text or video iframe url...">
            <button id="push-motivation-btn" class="btn-mneet" style="background: var(--neon-purple)!important; color:white!important; padding:10px; font-size:12px;">Update Live Motivation Area</button>
        </div>

        <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; color: var(--text-title);"><i class="fas fa-users-cog mr-2"></i>Surgeons Pulse Directory</h4>
        <div style="overflow-x: auto; border: 2px solid var(--border-line); border-radius: 16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; background: var(--bg-surface);">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-line); background: var(--bg-input);">
                        <th style="padding: 12px; font-weight:800; color:var(--gold);">Student Details</th>
                        <th style="padding: 12px; font-weight:800; color:var(--gold);">Target College</th>
                        <th style="padding: 12px; font-weight:800; color:var(--gold);">BP Wallet</th>
                        <th style="padding: 12px; font-weight:800; color:var(--gold);">Actions</th>
                    </tr>
                </thead>
                <tbody id="admin-student-directory-table">
                    <tr>
                        <td colspan="4" style="padding:20px; text-align:center; color:var(--text-para);">Connecting Live Pulse Directory...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// 📚 ২. স্টাডি ইঞ্জিন ম্যানেজার (৫টি রেপ্লিকেটেড মিরর কার্ড ডেটা ইনজেকশন প্যানেল)
export function renderAdminStudySection() {
    return `
        <h2 style="font-size: 20px; font-weight: 800; color: var(--gold); margin-bottom: 14px; text-transform: uppercase;">Study Engine Control</h2>
        
        <div class="card-mneet border-blue node-row admin-study-card-trigger" data-origin="ncert" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;">
                <i class="fas fa-book-open" style="color:var(--neon-blue); font-size:16px;"></i>
                <span>MIRROR 1: NCERT READING AND PYQ TAG MANAGER</span>
            </div>
            <i class="fas fa-arrow-right" style="font-size:12px; color:var(--text-para);"></i>
        </div>
        
        <div class="card-mneet border-gold node-row admin-study-card-trigger" data-origin="lectures" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;">
                <i class="fas fa-file-signature" style="color:var(--gold); font-size:16px;"></i>
                <span>MIRROR 2: LECTURE NOTES AND DPP HUB SYNC</span>
            </div>
            <i class="fas fa-arrow-right" style="font-size:12px; color:var(--text-para);"></i>
        </div>
        
        <div class="card-mneet border-purple node-row admin-study-card-trigger" data-origin="quiz" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;">
                <i class="fas fa-trophy" style="color:var(--neon-purple); font-size:16px;"></i>
                <span>MIRROR 3: CHAPTER & CUSTOM QUIZ TIMER MATRIX</span>
            </div>
            <i class="fas fa-arrow-right" style="font-size:12px; color:var(--text-para);"></i>
        </div>

        <div class="card-mneet border-green node-row admin-study-card-trigger" data-origin="special" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;">
                <i class="fas fa-star" style="color:var(--neon-green); font-size:16px;"></i>
                <span>MIRROR 4: SPECIAL MATERIAL HUB PUSHER</span>
            </div>
            <i class="fas fa-arrow-right" style="font-size:12px; color:var(--text-para);"></i>
        </div>

        <div class="card-mneet border-red node-row admin-study-card-trigger" data-origin="doubts" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:700;">
                <i class="fas fa-headset" style="color:var(--neon-red); font-size:16px;"></i>
                <span>MIRROR 5: INCOMING DOUBTS & TICKET BOARD</span>
            </div>
            <i class="fas fa-arrow-right" style="font-size:12px; color:var(--text-para);"></i>
        </div>
    `;
}

// ৩. সাবজেক্ট গেট মিরর
export function renderAdminSubjectGate(originCard) {
    return `
        <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 14px; text-transform: uppercase;">Select Target Subject</h2>
        <div class="card-mneet border-green node-row admin-subject-select-btn" data-subject="biology" data-origin="${originCard}" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;">
                <i class="fas fa-dna" style="color:var(--neon-green);"></i><span>🧬 BIOLOGY DATABASE</span>
            </div>
        </div>
        <div class="card-mneet border-red node-row admin-subject-select-btn" data-subject="chemistry" data-origin="${originCard}" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;">
                <i class="fas fa-flask" style="color:var(--neon-red);"></i><span>🧪 CHEMISTRY DATABASE</span>
            </div>
        </div>
        <div class="card-mneet border-blue node-row admin-subject-select-btn" data-subject="physics" data-origin="${originCard}" style="cursor: pointer;">
            <div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:800;">
                <i class="fas fa-bolt" style="color:var(--neon-blue);"></i><span>⚡ PHYSICS DATABASE</span>
            </div>
        </div>
    `;
}

// ৪. চ্যাপ্টার ম্যানেজার মিরর ভিউ
export function renderAdminChapterPlaylist(subject, originCard) {
    return `
        <h2 style="font-size: 16px; font-weight: 800; margin-bottom: 14px; text-transform: uppercase;">${subject} Content Nodes</h2>
        
        <div class="card-mneet border-gold" style="padding:12px; margin-bottom:14px;">
            <input type="text" id="new-chapter-title-input" class="input-field" placeholder="Create New Custom Chapter Name..." style="margin-bottom:8px!important;">
            <button id="admin-create-chapter-node-btn" data-subject="${subject}" data-origin="${originCard}" class="btn-mneet" style="padding:10px; font-size:12px;">Deploy Chapter Node</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;" id="admin-chapters-inject-container">
            <div class="card-mneet border-blue admin-chapter-item-btn" data-chapter="cell_cycle" data-subject="${subject}" data-origin="${originCard}" style="padding:14px; cursor:pointer;">
                <h4 style="font-size:14px; margin:0;">Cell Cycle and Cell Division</h4>
            </div>
        </div>
    `;
}

// ৫. ৩টি এক্সটার্নাল উইজেট মিরর ফর্ম
export function renderAdminBatchesSection() {
    return `<h2 style="font-size:20px; font-weight:800; color:var(--gold);">BATCH CONTROL PANEL</h2><div class="card-mneet border-gold"><input type="text" id="batch-title-up" class="input-field" placeholder="Batch Package Name"><button class="btn-mneet">Publish Package</button></div>`;
}
export function renderAdminTestSection() {
    return `<h2 style="font-size:20px; font-weight:800; color:var(--gold);">TEST SERIES SYSTEM CONSTRUCTOR</h2><div class="card-mneet border-purple"><input type="text" id="test-title-up" class="input-field" placeholder="All India Mock Title"><button class="btn-mneet">Deploy Test Link</button></div>`;
}
export function renderAdminMStoreSection() {
    return `<h2 style="font-size:20px; font-weight:800; color:var(--gold);">mSTORE INVENTORY LOADER</h2><div class="card-mneet border-blue"><input type="text" id="book-title-up" class="input-field" placeholder="Book Title"><input type="number" id="book-price-up" class="input-field" placeholder="Price (INR)"><button class="btn-mneet">Inject to Store</button></div>`;
}

