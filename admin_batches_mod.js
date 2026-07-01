// Importing dynamic Realtime Database configuration protocols directly from your config bridge
import { db, ref, set, push, onValue, remove } from './firebase-config.js';

const DATABASE_NODE_PATH = 'mneet_managed_batches';

const PALETTE_COLORS = [
    { bg: '#800020', text: '#FFFFFF' }, // Deep Burgundy
    { bg: '#005A5B', text: '#FFFFFF' }, // Deep Teal
    { bg: '#4B0082', text: '#FFFFFF' }, // Deep Purple
    { bg: '#A7F3D0', text: '#064E3B' }, // Mint Green
    { bg: '#E9D5FF', text: '#581C87' }, // Pastel Purple
    { bg: '#BAE6FD', text: '#0C4A6E' }  // Akash Nil
];

export function getBatchesLayout() {
    return `
    <style>
        .batch-wrapper { max-width: 600px; margin: 0 auto; padding-bottom: 40px; }
        .batch-form-card { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 30px; }
        .batch-heading { text-align: center; color: var(--gold); font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        .input-label { display: block; font-weight: 700; margin-bottom: 6px; font-size: 13px; color: var(--text-title); }
        
        .custom-input { width: 100%; padding: 12px; border: var(--black-stroke); border-radius: 10px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input); color: var(--text-title); outline: none; font-weight: 600; }
        
        .flex-row { display: flex; gap: 12px; }
        .flex-row > div { flex: 1; }
        
        .features-box { border: var(--black-stroke); padding: 14px; border-radius: 12px; background: var(--bg-input); margin-bottom: 14px; }
        .feature-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
        .feature-item input { accent-color: var(--gold); width: 18px; height: 18px; }
        
        .price-panel { background: var(--bg-input); border: var(--black-stroke); padding: 12px; border-radius: 10px; text-align: center; font-weight: 900; color: var(--gold); margin-bottom: 16px; font-size: 16px; }
        .btn-action-publish { width: 100%; background: var(--gold); color: #000000; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 15px; }
        .btn-action-publish:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        .section-divider { font-size: 18px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 25px 0 20px 0; text-transform: uppercase; }
        
        .student-mirror-card { border: var(--black-stroke); border-radius: 20px; padding: 20px; margin-bottom: 20px; box-shadow: 5px 5px 0px #000000; position: relative; }
        .student-mirror-card.is-hidden-true { opacity: 0.35; filter: grayscale(50%); }
        .student-card-tag { display: inline-block; padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; border: var(--black-stroke); margin-bottom: 12px; text-transform: uppercase; background: rgba(255,255,255,0.25); }
        .student-card-title { font-size: 22px; font-weight: 900; margin-bottom: 8px; }
        .student-card-desc { font-size: 14px; opacity: 0.95; margin-bottom: 16px; line-height: 1.5; }
        
        .student-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; font-weight: 700; margin-bottom: 16px; padding-top: 12px; border-top: 1px dashed rgba(0,0,0,0.2); }
        .student-meta-item { display: flex; align-items: center; gap: 8px; }
        
        .student-price-container { display: flex; align-items: baseline; gap: 10px; margin-top: 12px; }
        .student-main-price { font-size: 24px; font-weight: 900; color: #000000; background: #FFFFFF; padding: 4px 12px; border-radius: 10px; border: var(--black-stroke); }
        .student-old-price { font-size: 14px; text-decoration: line-through; opacity: 0.6; font-weight: 600; }
        
        .admin-modifier-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 2px solid #000000; }
        .mod-btn { border: var(--black-stroke); background: #FFFFFF; color: #000000; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 800; box-shadow: 2px 2px 0px #000000; display: flex; align-items: center; gap: 6px; }
    </style>

    <div class="batch-wrapper">
        <div class="batch-form-card">
            <h2 class="batch-heading">Batch Control Panel (Cloud Sync)</h2>
            <form id="modBatchForm">
                <input type="hidden" id="formBatchId" value="">
                
                <label class="input-label">Batch Package Name</label>
                <input type="text" id="bName" class="custom-input" placeholder="e.g., NEET Biology Target 2027" required>

                <label class="input-label">Description</label>
                <textarea id="bDesc" class="custom-input" rows="3" placeholder="Course features details add..." required></textarea>

                <label class="input-label">Batch Thumbnail (Image Link)</label>
                <input type="text" id="bThumb" class="custom-input" placeholder="https://domain.com/thumb.jpg">

                <div class="flex-row">
                    <div>
                        <label class="input-label">Batch Start Date</label>
                        <input type="date" id="bStart" class="custom-input" required>
                    </div>
                    <div>
                        <label class="input-label">Batch End Date</label>
                        <input type="date" id="bEnd" class="custom-input" required>
                    </div>
                </div>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Base Price (INR)</label>
                        <input type="number" id="bBasePrice" class="custom-input" value="1500" min="0">
                    </div>
                    <div>
                        <label class="input-label">Discount Percentage (%)</label>
                        <input type="number" id="bDiscount" class="custom-input" value="20" min="0" max="100">
                    </div>
                </div>

                <div class="price-panel">Final Selling Price: ₹<span id="bFinalCalc">1200</span></div>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Subject Syllabus Tag</label>
                        <select id="bTag" class="custom-input">
                            <option value="Biology Special">Biology Special</option>
                            <option value="Physics Course">Physics Course</option>
                            <option value="Full NEET Core">Full NEET Core</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">Post-Expiry Access Buffer</label>
                        <select id="bBuffer" class="custom-input">
                            <option value="30">30 Days Extra</option>
                            <option value="60">60 Days Extra</option>
                            <option value="90">90 Days Extra</option>
                        </select>
                    </div>
                </div>

                <label class="input-label">Activate System Core Features</label>
                <div class="features-box">
                    <label class="feature-item"><input type="checkbox" id="chkLive" checked> Live Class Engine Access</label>
                    <label class="feature-item"><input type="checkbox" id="chkNotes" checked> Study Material & NCERT Engine</label>
                    <label class="feature-item"><input type="checkbox" id="chkTest" checked> Comprehensive National Test Series</label>
                </div>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Admission Status</label>
                        <select id="bStatus" class="custom-input">
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="Coming Soon">Coming Soon</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">Assign Course Mentor</label>
                        <input type="text" id="bMentor" class="custom-input" placeholder="e.g., Dr. Roy Chowdhoury">
                    </div>
                </div>

                <button type="submit" class="btn-action-publish" id="modSubmitBtn">Publish to Firebase Cloud</button>
            </form>
        </div>

        <h3 class="section-divider">Live Cloud Batches Queue</h3>
        <div id="renderBatchQueue"></div>
    </div>
    `;
}

export function initBatchesLogic() {
    const form = document.getElementById('modBatchForm');
    const baseInput = document.getElementById('bBasePrice');
    const discInput = document.getElementById('bDiscount');
    const finalCalc = document.getElementById('bFinalCalc');
    const queueArea = document.getElementById('renderBatchQueue');

    function updateCalculatedPrice() {
        let base = parseFloat(baseInput.value) || 0;
        let disc = parseFloat(discInput.value) || 0;
        let final = base - (base * (disc / 100));
        finalCalc.innerText = final.toFixed(0);
    }

    baseInput.addEventListener('input', updateCalculatedPrice);
    discInput.addEventListener('input', updateCalculatedPrice);

    // ☁️ FIREBASE REALTIME LISTENER (Automatic updates whenever data alters inside Cloud nodes)
    const batchesRef = ref(db, DATABASE_NODE_PATH);
    onValue(batchesRef, (snapshot) => {
        queueArea.innerHTML = '';
        const dataMap = snapshot.val();
        
        if (!dataMap) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No active cloud clusters configured.</p>`;
            return;
        }

        let index = 0;
        for (let key in dataMap) {
            let item = dataMap[key];
            let colorTheme = PALETTE_COLORS[index % PALETTE_COLORS.length];
            let card = document.createElement('div');
            card.className = `student-mirror-card ${item.isHidden ? 'is-hidden-true' : ''}`;
            card.style.backgroundColor = colorTheme.bg;
            card.style.color = colorTheme.text;
            
            card.innerHTML = `
                <div>
                    <span class="student-card-tag" style="color: ${colorTheme.text}; border-color: ${colorTheme.text};">${item.tag}</span>
                    <h3 class="student-card-title">${item.name}</h3>
                    <p class="student-card-desc">${item.desc}</p>
                    <div class="student-meta-grid" style="border-color: rgba(0,0,0,0.15);">
                        <div class="student-meta-item"><i class="fas fa-user-circle"></i> Mentor: ${item.mentor || 'Not Assigned'}</div>
                        <div class="student-meta-item"><i class="fas fa-toggle-on"></i> Status: ${item.status}</div>
                        <div class="student-meta-item"><i class="fas fa-calendar-alt"></i> Start: ${item.start}</div>
                        <div class="student-meta-item"><i class="fas fa-plus-circle"></i> Buffer: +${item.buffer} Days</div>
                    </div>
                    <div class="student-price-container">
                        <span class="student-main-price">₹${item.finalPrice}</span>
                        <span class="student-old-price" style="color: ${colorTheme.text};">M.R.P: ₹${item.basePrice}</span>
                    </div>
                </div>
                <div class="admin-modifier-row">
                    <button class="mod-btn act-edit" data-firebase-key="${key}"><i class="fas fa-edit" style="color:#2563EB;"></i> Edit</button>
                    <button class="mod-btn act-hide" data-firebase-key="${key}" data-current-hidden="${item.isHidden || false}"><i class="fas ${item.isHidden ? 'fa-eye' : 'fa-eye-slash'}" style="color:#D97706;"></i> ${item.isHidden ? 'Show' : 'Hide'}</button>
                    <button class="mod-btn act-del" data-firebase-key="${key}"><i class="fas fa-trash" style="color:#EF4444;"></i> Delete</button>
                </div>
            `;
            queueArea.appendChild(card);
            index++;
        }
    });

    // 📤 FIREBASE CLOUD WRITE OPERATION
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let targetFirebaseKey = document.getElementById('formBatchId').value;

        let data = {
            name: document.getElementById('bName').value,
            desc: document.getElementById('bDesc').value,
            thumb: document.getElementById('bThumb').value,
            start: document.getElementById('bStart').value,
            end: document.getElementById('bEnd').value,
            basePrice: baseInput.value,
            discount: discInput.value,
            finalPrice: finalCalc.innerText,
            tag: document.getElementById('bTag').value,
            buffer: document.getElementById('bBuffer').value,
            live: document.getElementById('chkLive').checked,
            notes: document.getElementById('chkNotes').checked,
            test: document.getElementById('chkTest').checked,
            status: document.getElementById('bStatus').value,
            mentor: document.getElementById('bMentor').value,
            isHidden: false
        };

        if (targetFirebaseKey) {
            // Update targeted specific data reference block
            const updateRef = ref(db, `${DATABASE_NODE_PATH}/${targetFirebaseKey}`);
            set(updateRef, data).then(() => {
                document.getElementById('modSubmitBtn').innerText = "Publish to Firebase Cloud";
                document.getElementById('formBatchId').value = "";
                form.reset();
                updateCalculatedPrice();
            });
        } else {
            // Push completely fresh automatic entry unique node token key sequence
            const newBatchPushRef = push(ref(db, DATABASE_NODE_PATH));
            set(newBatchPushRef, data).then(() => {
                form.reset();
                updateCalculatedPrice();
            });
        }
    });

    // ⚙️ CLOUD MUTATIONS CONTROLLERS
    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if (!btn) return;
        let firebaseKey = btn.dataset.firebaseKey;

        if (btn.classList.contains('act-edit')) {
            const singleFetchRef = ref(db, `${DATABASE_NODE_PATH}/${firebaseKey}`);
            onValue(singleFetchRef, (snapshot) => {
                let item = snapshot.val();
                if (!item) return;
                document.getElementById('formBatchId').value = firebaseKey;
                document.getElementById('bName').value = item.name;
                document.getElementById('bDesc').value = item.desc;
                document.getElementById('bThumb').value = item.thumb || '';
                document.getElementById('bStart').value = item.start;
                document.getElementById('bEnd').value = item.end;
                baseInput.value = item.basePrice;
                discInput.value = item.discount;
                finalCalc.innerText = item.finalPrice;
                document.getElementById('bTag').value = item.tag;
                document.getElementById('bBuffer').value = item.buffer;
                document.getElementById('chkLive').checked = item.live;
                document.getElementById('chkNotes').checked = item.notes;
                document.getElementById('chkTest').checked = item.test;
                document.getElementById('bStatus').value = item.status;
                document.getElementById('bMentor').value = item.mentor;
                document.getElementById('modSubmitBtn').innerText = "Update Cloud Package";
                document.getElementById('admin-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }, { onlyOnce: true });

        } else if (btn.classList.contains('act-hide')) {
            let currentHiddenState = btn.dataset.currentHidden === "true";
            const visibilityUpdateRef = ref(db, `${DATABASE_NODE_PATH}/${firebaseKey}/isHidden`);
            set(visibilityUpdateRef, !currentHiddenState);

        } else if (btn.classList.contains('act-del')) {
            if (confirm("Delete this package parameters instantly from live cloud servers?")) {
                const targetDeleteRef = ref(db, `${DATABASE_NODE_PATH}/${firebaseKey}`);
                remove(targetDeleteRef);
            }
        }
    });
        }
            
