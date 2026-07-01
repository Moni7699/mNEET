const BATCH_STORAGE_KEY = 'mneet_managed_batches';
const TEST_STORAGE_KEY = 'mneet_batch_test_series';

export function getTestLayout() {
    let savedBatches = localStorage.getItem(BATCH_STORAGE_KEY);
    let batches = savedBatches ? JSON.parse(savedBatches) : [];

    let optionsHTML = batches.map(b => `<option value="${b.id}">${b.name} (${b.tag})</option>`).join('');
    if (batches.length === 0) {
        optionsHTML = `<option value="">No Active Batches Found - Create a Batch First</option>`;
    }

    return `
    <style>
        .test-engine-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .test-form-card { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 30px; }
        .test-heading { text-align: center; color: var(--gold); font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        .input-label { display: block; font-weight: 700; margin-bottom: 6px; font-size: 13px; color: var(--text-title); }
        
        .custom-input { width: 100%; padding: 12px; border: var(--black-stroke) !important; border-radius: 10px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; }
        .custom-input:focus { border-color: var(--gold) !important; }
        
        .flex-row { display: flex; gap: 12px; }
        .flex-row > div { flex: 1; }
        
        .btn-action-test { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 15px; }
        .btn-action-test:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        .section-divider { font-size: 18px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 25px 0 20px 0; text-transform: uppercase; }
        
        /* 📝 PREMIUM MOCK TEST DISPLAY CARD */
        .test-mgmt-card { 
            background: var(--bg-surface) !important; 
            color: var(--text-title) !important;
            border: var(--black-stroke); 
            border-radius: 16px; 
            padding: 16px; 
            margin-bottom: 16px; 
            box-shadow: 4px 4px 0px #000000; 
            position: relative;
            overflow: hidden;
        }
        .test-left-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background-color: #2563EB; }
        .test-title { font-size: 18px; font-weight: 900; margin-bottom: 6px; color: var(--text-title); }
        .test-batch-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; background: var(--bg-input); color: var(--gold); border: 1px solid var(--border-line); margin-bottom: 8px; }
        
        .test-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; font-weight: 700; margin-bottom: 12px; padding-top: 10px; border-top: 1px dashed var(--border-line); }
        .test-meta-item { display: flex; align-items: center; gap: 6px; color: var(--text-para); }
        .test-meta-item i { color: var(--gold); }
        
        .admin-modifier-row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-line); }
        .mod-btn { border: var(--black-stroke); background: var(--bg-surface); color: var(--text-title); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 2px 2px 0px #000000; display: flex; align-items: center; gap: 4px; }
        .mod-btn:active { transform: translate(1px, 1px); box-shadow: 0px 0px 0px #000000; }
    </style>

    <div class="test-engine-panel">
        <div class="test-form-card">
            <h2 class="test-heading">Test Series Scheduler</h2>
            <form id="modTestForm">
                <input type="hidden" id="formTestId" value="">
                
                <label class="input-label">Select Targeted Batch</label>
                <select id="tBatchId" class="custom-input" required>
                    ${optionsHTML}
                </select>

                <label class="input-label">Mock Exam Title Name</label>
                <input type="text" id="tTitle" class="custom-input" placeholder="e.g., Grand NEET Mock Test - 05" required>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Exam Duration (Minutes)</label>
                        <input type="number" id="tDuration" class="custom-input" value="180" min="1" required>
                    </div>
                    <div>
                        <label class="input-label">Total Questions</label>
                        <input type="number" id="tTotalQuestions" class="custom-input" value="200" min="1" required>
                    </div>
                </div>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Positive Marks per Right Answer</label>
                        <input type="number" id="tPositiveMark" class="custom-input" value="4" min="0" required>
                    </div>
                    <div>
                        <label class="input-label">Negative Marks per Wrong Answer</label>
                        <input type="number" id="tNegativeMark" class="custom-input" value="1" min="0" required>
                    </div>
                </div>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Subject Syllabus Type</label>
                        <select id="tSyllabus" class="custom-input">
                            <option value="Full Syllabus">Full Syllabus</option>
                            <option value="Part Test - Biology">Part Test - Biology</option>
                            <option value="Part Test - Physics/Chemistry">Part Test - Physics/Chemistry</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">Exam Link / Question Paper JSON</label>
                        <input type="text" id="tExamLink" class="custom-input" placeholder="https://domain.com/exam-config.json" required>
                    </div>
                </div>

                <button type="submit" class="btn-action-test" id="testSubmitBtn">Schedule Test Series</button>
            </form>
        </div>

        <h3 class="section-divider">Scheduled Test Series Queue</h3>
        <div id="renderTestQueue"></div>
    </div>
    `;
}

export function initTestLogic() {
    const form = document.getElementById('modTestForm');
    const queueArea = document.getElementById('renderTestQueue');

    function fetchBatches() { return JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY)) || []; }
    function fetchState() { return JSON.parse(localStorage.getItem(TEST_STORAGE_KEY)) || []; }
    function saveState(arr) { localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(arr)); renderQueue(); }

    function renderQueue() {
        let arr = fetchState();
        let batches = fetchBatches();
        queueArea.innerHTML = '';
        
        if(arr.length === 0) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No test series scheduled yet.</p>`;
            return;
        }
        
        arr.forEach(item => {
            let matchedBatch = batches.find(b => b.id == item.batchId);
            let batchName = matchedBatch ? matchedBatch.name : 'Unknown Batch';
            
            let card = document.createElement('div');
            card.className = `test-mgmt-card`;
            
            card.innerHTML = `
                <div class="test-left-bar"></div>
                <div>
                    <span class="test-batch-tag">${batchName} | ${item.syllabus}</span>
                    <h3 class="test-title">${item.title}</h3>
                    
                    <div class="test-meta-grid">
                        <div class="test-meta-item"><i class="fas fa-hourglass-half"></i> Duration: ${item.duration} Mins</div>
                        <div class="test-meta-item"><i class="fas fa-list-ol"></i> Questions: ${item.totalQues}</div>
                        <div class="test-meta-item"><i class="fas fa-check-circle"></i> Marking: +${item.posMark} / -${item.negMark}</div>
                        <div class="test-meta-item"><i class="fas fa-link"></i> Config Link Connected</div>
                    </div>
                </div>
                
                <div class="admin-modifier-row">
                    <button class="mod-btn act-edit" data-id="${item.id}"><i class="fas fa-edit" style="color:#2563EB;"></i> Edit</button>
                    <button class="mod-btn act-del" data-id="${item.id}"><i class="fas fa-trash" style="color:#EF4444;"></i> Delete</button>
                </div>
            `;
            queueArea.appendChild(card);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let arr = fetchState();
        let targetId = document.getElementById('formTestId').value;
        let selectedBatch = document.getElementById('tBatchId').value;

        if(!selectedBatch || selectedBatch === "") {
            alert("Please create a batch first before allocating a test series!");
            return;
        }

        let data = {
            id: targetId ? parseInt(targetId) : Date.now(),
            batchId: selectedBatch,
            title: document.getElementById('tTitle').value,
            duration: document.getElementById('tDuration').value,
            totalQues: document.getElementById('tTotalQuestions').value,
            posMark: document.getElementById('tPositiveMark').value,
            negMark: document.getElementById('tNegativeMark').value,
            syllabus: document.getElementById('tSyllabus').value,
            examLink: document.getElementById('tExamLink').value
        };

        if(targetId) {
            arr = arr.map(t => t.id == targetId ? data : t);
            document.getElementById('testSubmitBtn').innerText = "Schedule Test Series";
            document.getElementById('formTestId').value = "";
        } else {
            arr.push(data);
        }
        saveState(arr);
        form.reset();
    });

    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if(!btn) return;
        let id = parseInt(btn.dataset.id);
        let arr = fetchState();

        if(btn.classList.contains('act-edit')) {
            let item = arr.find(t => t.id === id);
            if(item) {
                document.getElementById('formTestId').value = item.id;
                document.getElementById('tBatchId').value = item.batchId;
                document.getElementById('tTitle').value = item.title;
                document.getElementById('tDuration').value = item.duration;
                document.getElementById('tTotalQuestions').value = item.totalQues;
                document.getElementById('tPositiveMark').value = item.posMark;
                document.getElementById('tNegativeMark').value = item.negMark;
                document.getElementById('tSyllabus').value = item.syllabus;
                document.getElementById('tExamLink').value = item.examLink;
                document.getElementById('testSubmitBtn').innerText = "Update Test Setup";
                document.getElementById('admin-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }
        } else if(btn.classList.contains('act-del')) {
            if(confirm("Are you sure to delete this scheduled mock exam setup?")) {
                arr = arr.filter(t => t.id !== id);
                saveState(arr);
            }
        }
    });

    renderQueue();
      }
      
