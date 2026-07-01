const STORAGE_KEY = 'mneet_managed_batches';

// Minimalist Color Coding (Left side dynamic accent accent borders)
const PALETTE_COLORS = [
    { border: '#800020', badgeBg: '#FCE7F3', badgeText: '#9D174D' }, // Deep Burgundy
    { border: '#005A5B', badgeBg: '#CCFBF1', badgeText: '#115E59' }, // Deep Teal
    { border: '#4B0082', badgeBg: '#F3E8FF', badgeText: '#6B21A8' }, // Deep Purple
    { border: '#10B981', badgeBg: '#D1FAE5', badgeText: '#065F46' }, // Mint Green
    { border: '#8B5CF6', badgeBg: '#EDE9FE', badgeText: '#5B21B6' }, // Pastel Purple
    { border: '#0284C7', badgeBg: '#E0F2FE', badgeText: '#0369A1' }  // Akash Nil
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
        
        /* 🔥 NEW RE-DESIGNED ULTRA PREMIUM STUDENT CARD */
        .student-mirror-card { 
            background: var(--bg-surface) !important; 
            color: var(--text-title) !important;
            border: var(--black-stroke); 
            border-radius: 16px; 
            padding: 18px; 
            margin-bottom: 20px; 
            box-shadow: 4px 4px 0px #000000; 
            position: relative; 
            overflow: hidden;
        }
        .student-mirror-card.is-hidden-true { opacity: 0.4; filter: grayscale(100%); }
        
        /* Premium Accent Tag on Left Frame instead of Full solid background color */
        .card-left-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; }
        
        .student-card-tag { 
            display: inline-block; 
            padding: 4px 10px; 
            border-radius: 6px; 
            font-size: 11px; 
            font-weight: 800; 
            margin-bottom: 10px; 
            text-transform: uppercase; 
            border: 1px solid rgba(0,0,0,0.15);
        }
        .student-card-title { font-size: 20px; font-weight: 900; margin-bottom: 6px; }
        .student-card-desc { font-size: 13px; opacity: 0.8; margin-bottom: 14px; line-height: 1.4; }
        
        .student-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; font-weight: 700; margin-bottom: 14px; padding-top: 10px; border-top: 1px dashed var(--border-line); }
        .student-meta-item { display: flex; align-items: center; gap: 6px; color: var(--text-para); }
        .student-meta-item i { color: var(--gold); }
        
        .student-price-container { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
        .student-main-price { font-size: 22px; font-weight: 900; color: var(--text-title); background: var(--bg-input); padding: 4px 10px; border-radius: 8px; border: var(--black-stroke); }
        .student-old-price { font-size: 13px; text-decoration: line-through; opacity: 0.5; font-weight: 600; }
        
        .admin-modifier-row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-line); }
        .mod-btn { border: var(--black-stroke); background: var(--bg-surface); color: var(--text-title); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 2px 2px 0px #000000; display: flex; align-items: center; gap: 4px; transition: 0.1s; }
        .mod-btn:active { transform: translate(1px, 1px); box-shadow: 0px 0px 0px #000000; }
    </style>

    <div class="batch-wrapper">
        <div class="batch-form-card">
            <h2 class="batch-heading">Batch Control Panel</h2>
            <form id="modBatchForm">
                <input type="hidden" id="formBatchId" value="">
                
                <label class="input-label">Batch Package Name</label>
                <input type="text" id="bName" class="custom-input" placeholder="e.g., NEET Biology Target 2027" required>

                <label class="input-label">Description</label>
                <textarea id="bDesc" class="custom-input" rows="3" placeholder="Course features details add..." required></textarea>

                <label class="input-label">Batch Thumbnail (Image or Video Link)</label>
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

                <button type="submit" class="btn-action-publish" id="modSubmitBtn">Publish Package</button>
            </form>
        </div>

        <h3 class="section-divider">Managed Batches Queue</h3>
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

    function fetchState() { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    function saveState(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); renderQueue(); }

    function renderQueue() {
        let arr = fetchState();
        queueArea.innerHTML = '';
        if(arr.length === 0) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No active batches published yet.</p>`;
            return;
        }
        
        arr.forEach((item, index) => {
            let configTheme = PALETTE_COLORS[index % PALETTE_COLORS.length];
            let card = document.createElement('div');
            card.className = `student-mirror-card ${item.isHidden ? 'is-hidden-true' : ''}`;
            
            card.innerHTML = `
                <div class="card-left-accent" style="background-color: ${configTheme.border};"></div>
                
                <div>
                    <span class="student-card-tag" style="background-color: ${configTheme.badgeBg}; color: ${configTheme.badgeText};">${item.tag}</span>
                    <h3 class="student-card-title">${item.name}</h3>
                    <p class="student-card-desc">${item.desc}</p>
                    
                    <div class="student-meta-grid">
                        <div class="student-meta-item"><i class="fas fa-user-circle"></i> Mentor: ${item.mentor || 'Not Assigned'}</div>
                        <div class="student-meta-item"><i class="fas fa-info-circle"></i> Status: ${item.status}</div>
                        <div class="student-meta-item"><i class="fas fa-calendar-alt"></i> Start: ${item.start}</div>
                        <div class="student-meta-item"><i class="fas fa-plus-circle"></i> Buffer: +${item.buffer} Days</div>
                    </div>
                    
                    <div class="student-price-container">
                        <span class="student-main-price">₹${item.finalPrice}</span>
                        <span class="student-old-price">M.R.P: ₹${item.basePrice}</span>
                    </div>
                </div>
                
                <div class="admin-modifier-row">
                    <button class="mod-btn act-edit" data-id="${item.id}"><i class="fas fa-edit" style="color:#2563EB;"></i> Edit</button>
                    <button class="mod-btn act-hide" data-id="${item.id}"><i class="fas ${item.isHidden ? 'fa-eye' : 'fa-eye-slash'}" style="color:#D97706;"></i> ${item.isHidden ? 'Show' : 'Hide'}</button>
                    <button class="mod-btn act-del" data-id="${item.id}"><i class="fas fa-trash" style="color:#EF4444;"></i> Delete</button>
                </div>
            `;
            queueArea.appendChild(card);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let arr = fetchState();
        let targetId = document.getElementById('formBatchId').value;

        let data = {
            id: targetId ? parseInt(targetId) : Date.now(),
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
            isHidden: targetId ? (arr.find(b => b.id == targetId)?.isHidden || false) : false
        };

        if(targetId) {
            arr = arr.map(b => b.id == targetId ? data : b);
            document.getElementById('modSubmitBtn').innerText = "Publish Package";
            document.getElementById('formBatchId').value = "";
        } else {
            arr.push(data);
        }
        saveState(arr);
        form.reset();
        updateCalculatedPrice();
    });

    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if(!btn) return;
        let id = parseInt(btn.dataset.id);
        let arr = fetchState();

        if(btn.classList.contains('act-edit')) {
            let item = arr.find(b => b.id === id);
            if(item) {
                document.getElementById('formBatchId').value = item.id;
                document.getElementById('bName').value = item.name;
                document.getElementById('bDesc').value = item.desc;
                document.getElementById('bThumb').value = item.thumb;
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
                document.getElementById('modSubmitBtn').innerText = "Update Package";
                document.getElementById('admin-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }
        } else if(btn.classList.contains('act-hide')) {
            arr = arr.map(b => b.id === id ? { ...b, isHidden: !b.isHidden } : b);
            saveState(arr);
        } else if(btn.classList.contains('act-del')) {
            if(confirm("Are you sure to delete this package layout?")) {
                arr = arr.filter(b => b.id !== id);
                saveState(arr);
            }
        }
    });

    renderQueue();
}
