// Local Storage Key mapping for runtime reactivity
const STORAGE_KEY = 'mneet_managed_batches';

export function getBatchesLayout() {
    let saved = localStorage.getItem(STORAGE_KEY);
    let batches = saved ? JSON.parse(saved) : [];

    // Container injection containing Premium Burgundy White Mode styles
    let html = `
    <style>
        .batch-container-box { max-width: 650px; margin: 0 auto; background: #ffffff !important; padding: 20px; border-radius: 14px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; color: #222222 !important; }
        .batch-title-centered { text-align: center; color: var(--burgundy) !important; font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; text-shadow: 1px 1px 0px #000000; }
        .b-label { display: block; font-weight: 700; margin-bottom: 5px; font-size: 13px; color: #333; }
        .b-input { width: 100%; padding: 10px; border: var(--black-stroke) !important; border-radius: 8px; font-size: 14px; margin-bottom: 14px; background: #ffffff !important; color: #000000 !important; outline: none; }
        .b-input:focus { box-shadow: 3px 3px 0px var(--burgundy); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .toggle-features-panel { border: var(--black-stroke); padding: 12px; border-radius: 8px; background: #FFF5F5; margin-bottom: 14px; }
        .feat-chk { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; cursor: pointer; }
        .feat-chk input { accent-color: var(--burgundy); width: 16px; height: 16px; }
        .price-calc-box { background: #E2E8F0; border: var(--black-stroke); padding: 10px; border-radius: 8px; text-align: center; font-weight: 800; color: var(--burgundy); margin-bottom: 14px; font-size: 15px; }
        .btn-publish { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 12px; border: var(--black-stroke); border-radius: 8px; text-transform: uppercase; box-shadow: 3px 3px 0px #000000; cursor: pointer; }
        .btn-publish:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0px #000000; }
        .list-header { font-size: 18px; font-weight: 800; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 30px 0 15px 0; text-transform: uppercase; color: #000; }
        .batch-mgmt-card { background: #ffffff !important; border: var(--black-stroke); border-radius: 8px; padding: 12px; margin-bottom: 12px; box-shadow: 3px 3px 0px #000000; display: flex; justify-content: space-between; align-items: center; color: #000 !important; }
        .batch-mgmt-card.hidden-flag { opacity: 0.4; background: #E2E8F0 !important; }
        .card-actions { display: flex; gap: 8px; }
        .act-btn { border: var(--black-stroke); background: #fff; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
        .act-edit { color: #1D4ED8; } .act-hide { color: #D97706; } .act-del { color: #DC2626; }
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
    return html;
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

    function fetchState() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }
    function saveState(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        renderQueue();
    }

    function renderQueue() {
        let arr = fetchState();
        queueArea.innerHTML = '';
        if(arr.length === 0) {
            queueArea.innerHTML = `<p style="text-align:center; color:#666; font-size:13px;">No active batches published yet.</p>`;
            return;
        }
        arr.forEach(item => {
            let card = document.createElement('div');
            card.className = `batch-mgmt-card ${item.isHidden ? 'hidden-flag' : ''}`;
            card.innerHTML = `
                <div>
                    <strong style="font-size:15px; display:block;">${item.name}</strong>
                    <span style="font-size:12px; color:#555;">Price: ₹${item.finalPrice} | Tag: ${item.tag}</span>
                </div>
                <div class="card-actions">
                    <button class="act-btn act-edit" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                    <button class="act-btn act-hide" data-id="${item.id}"><i class="fas ${item.isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                    <button class="act-btn act-del" data-id="${item.id}"><i class="fas fa-trash"></i></button>
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
            if(confirm("Are you sure to delete this batch package permanently?")) {
                arr = arr.filter(b => b.id !== id);
                saveState(arr);
            }
        }
    });

    renderQueue();
      }
      
