const STORAGE_KEY = 'mneet_managed_batches';

// Dynamic Color Array based on user choice
const CARD_COLORS = [
    { bg: '#800020', text: '#ffffff' }, // Deep Burgundy
    { bg: '#005A5B', text: '#ffffff' }, // Deep Teal
    { bg: '#4B0082', text: '#ffffff' }, // Deep Purple
    { bg: '#98FF98', text: '#222222' }, // Mint Green
    { bg: '#E6E6FA', text: '#222222' }, // Pastel Purple
    { bg: '#87CEEB', text: '#222222' }  // Akash Nil
];

export function getBatchesLayout() {
    return `
    <style>
        .batch-container-box { max-width: 650px; margin: 0 auto; background: var(--bg-surface); padding: 20px; border-radius: 14px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; color: var(--text-title); }
        .batch-title-centered { text-align: center; color: var(--burgundy) !important; font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; text-shadow: 1px 1px 0px #000000; }
        .b-label { display: block; font-weight: 700; margin-bottom: 5px; font-size: 13px; }
        .b-input { width: 100%; padding: 10px; border: var(--black-stroke) !important; border-radius: 8px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; }
        .b-input:focus { box-shadow: 3px 3px 0px var(--gold); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .toggle-features-panel { border: var(--black-stroke); padding: 12px; border-radius: 8px; background: var(--bg-input); margin-bottom: 14px; }
        .feat-chk { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; cursor: pointer; }
        .feat-chk input { accent-color: var(--gold); width: 16px; height: 16px; }
        .price-calc-box { background: var(--bg-input); border: var(--black-stroke); padding: 10px; border-radius: 8px; text-align: center; font-weight: 800; color: var(--gold); margin-bottom: 14px; font-size: 15px; }
        .btn-publish { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 12px; border: var(--black-stroke); border-radius: 8px; text-transform: uppercase; box-shadow: 3px 3px 0px #000000; cursor: pointer; }
        
        .list-header { font-size: 18px; font-weight: 800; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 30px 0 15px 0; text-transform: uppercase; }
        
        /* PREMIUM STUDENT MODE STYLE DISPLAY CARD */
        .premium-student-card { border: var(--black-stroke); border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 4px 4px 0px #000000; position: relative; overflow: hidden; transition: opacity 0.3s; }
        .premium-student-card.hidden-flag { opacity: 0.3; }
        .card-tag { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; border: 1px solid #000; margin-bottom: 8px; text-transform: uppercase; }
        .card-title { font-size: 20px; font-weight: 900; margin-bottom: 6px; }
        .card-desc { font-size: 13px; opacity: 0.9; margin-bottom: 12px; line-height: 1.4; }
        .card-meta-row { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; margin-bottom: 12px; border-top: 1px dashed rgba(0,0,0,0.2); padding-top: 8px; }
        .card-price-tag { font-size: 18px; font-weight: 900; display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 8px; border: 1px solid #000; }
        .card-control-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; border-top: 1px dashed rgba(0,0,0,0.2); padding-top: 10px; }
        .act-btn { border: var(--black-stroke); background: #ffffff !important; color: #000000 !important; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 2px 2px 0px #000; }
        .act-btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0px #000; }
    </style>

    <div class="batch-container-box">
        <h2 class="batch-title-centered">Batch Control Panel</h2>
        <form id="modBatchForm">
            <input type="hidden" id="formBatchId" value="">
            
            <label class="b-label">Batch Package Name</label>
            <input type="text" id="bName" class="b-input" placeholder="e.g., NEET Biology Target 2027" required>

            <label class="b-label">Description</label>
            <textarea id="bDesc" class="b-input" rows="2" placeholder="Course features details add..." required></textarea>

            <label class="b-label">Batch Thumbnail (Image or Video Link)</label>
            <input type="text" id="bThumb" class="b-input" placeholder="https://domain.com/thumb.jpg">

            <div class="grid-2">
                <div>
                    <label class="b-label">Batch Start Date</label>
                    <input type="date" id="bStart" class="b-input" required>
                </div>
                <div>
                    <label class="b-label">Batch End Date</label>
                    <input type="date" id="bEnd" class="b-input" required>
                </div>
            </div>

            <div class="grid-2">
                <div>
                    <label class="b-label">Base Price (INR)</label>
                    <input type="number" id="bBasePrice" class="b-input" value="1500" min="0">
                </div>
                <div>
                    <label class="b-label">Discount Percentage (%)</label>
                    <input type="number" id="bDiscount" class="b-input" value="20" min="0" max="100">
                </div>
            </div>

            <div class="price-calc-box">Final Selling Price: ₹<span id="bFinalCalc">1200</span></div>

            <div class="grid-2">
                <div>
                    <label class="b-label">Subject Syllabus Tag</label>
                    <select id="bTag" class="b-input">
                        <option value="Biology Special">Biology Special</option>
                        <option value="Physics Crash Course">Physics Crash Course</option>
                        <option value="Full NEET Core">Full NEET Core</option>
                    </select>
                </div>
                <div>
                    <label class="b-label">Post-Expiry Access Buffer</label>
                    <select id="bBuffer" class="b-input">
                        <option value="30">30 Days Extra</option>
                        <option value="60">60 Days Extra</option>
                        <option value="90">90 Days Extra</option>
                    </select>
                </div>
            </div>

            <label class="b-label">Toggle System Core Features</label>
            <div class="toggle-features-panel">
                <label class="feat-chk"><input type="checkbox" id="chkLive" checked> Live Class Engine Access</label>
                <label class="feat-chk"><input type="checkbox" id="chkNotes" checked> Study Material & NCERT Engine</label>
                <label class="feat-chk"><input type="checkbox" id="chkTest" checked> Comprehensive National Test Series</label>
            </div>

            <div class="grid-2">
                <div>
                    <label class="b-label">Admission Status</label>
                    <select id="bStatus" class="b-input">
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Coming Soon">Coming Soon</option>
                    </select>
                </div>
                <div>
                    <label class="b-label">Assign Course Mentor</label>
                    <input type="text" id="bMentor" class="b-input" placeholder="e.g., Dr. Roy Chowdhoury">
                </div>
            </div>

            <button type="submit" class="btn-publish" id="modSubmitBtn">Publish Package</button>
        </form>

        <h3 class="list-header">Managed Batches Queue</h3>
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
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px;">No active batches published yet.</p>`;
            return;
        }
        
        arr.forEach((item, index) => {
            // Pick static beautiful colors from array loop safely
            let colorSet = CARD_COLORS[index % CARD_COLORS.length];
            let card = document.createElement('div');
            card.className = `premium-student-card ${item.isHidden ? 'hidden-flag' : ''}`;
            card.style.backgroundColor = colorSet.bg;
            card.style.color = colorSet.text;
            
            card.innerHTML = `
                <div>
                    <span class="card-tag" style="background:rgba(255,255,255,0.2); color:${colorSet.text};">${item.tag}</span>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-desc">${item.desc}</p>
                    <div class="card-meta-row" style="color:${colorSet.text};">
                        <span><i class="fas fa-user-tie"></i> ${item.mentor || 'N/A'}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${item.start} to ${item.end}</span>
                        <span><i class="fas fa-door-open"></i> Status: ${item.status}</span>
                    </div>
                    <div class="card-price-tag">₹${item.finalPrice} <span style="font-size:11px; font-weight:normal; text-decoration:line-through; opacity:0.7;">₹${item.basePrice}</span></div>
                </div>
                <div class="card-control-actions">
                    <button class="act-btn act-edit" data-id="${item.id}" title="Edit"><i class="fas fa-edit" style="color:#1D4ED8;"></i> Edit</button>
                    <button class="act-btn act-hide" data-id="${item.id}" title="Toggle Hide"><i class="fas ${item.isHidden ? 'fa-eye' : 'fa-eye-slash'}" style="color:#D97706;"></i> ${item.isHidden ? 'Show' : 'Hide'}</button>
                    <button class="act-btn act-del" data-id="${item.id}" title="Delete"><i class="fas fa-trash" style="color:#DC2626;"></i> Delete</button>
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
        let btn = e.target.closest('.act-btn');
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
            if(confirm("Are you sure to delete this batch package?")) {
                arr = arr.filter(b => b.id !== id);
                saveState(arr);
            }
        }
    });

    renderQueue();
                                                                               }
                
