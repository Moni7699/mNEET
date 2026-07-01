// Importing dynamic Realtime Database configuration protocols directly from your config bridge
import { db, ref, set, push, onValue, remove } from './firebase-config.js';

const BATCH_NODE_PATH = 'mneet_managed_batches';
const TEST_NODE_PATH = 'mneet_batch_test_series';

export function getTestLayout() {
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
    </style>

    <div class="test-engine-panel">
        <div class="test-form-card">
            <h2 class="test-heading">Test Series Scheduler (Cloud)</h2>
            <form id="modTestForm">
                <input type="hidden" id="formTestId" value="">
                
                <label class="input-label">Select Targeted Batch</label>
                <select id="tBatchId" class="custom-input" required>
                    <option value="">Loading live cloud batches...</option>
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

                <button type="submit" class="btn-action-test" id="testSubmitBtn">Schedule to Cloud Arena</button>
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
    const batchSelect = document.getElementById('tBatchId');

    let cacheBatchesMap = {};

    // ☁️ 1. FETCH LIVE BATCH COHORTS FOR SELECTION MENU
    const batchesRef = ref(db, BATCH_NODE_PATH);
    onValue(batchesRef, (snapshot) => {
        const dataMap = snapshot.val() || {};
        cacheBatchesMap = dataMap;
        
        let htmlOptions = '<option value="">-- Choose Target Batch --</option>';
        for (let key in dataMap) {
            htmlOptions += `<option value="${key}">${dataMap[key].name}</option>`;
        }
        if (Object.keys(dataMap).length === 0) {
            htmlOptions = '<option value="">No Active Cloud Cohorts Found</option>';
        }
        batchSelect.innerHTML = htmlOptions;
    }, { onlyOnce: true });

    // ☁️ 2. LISTEN REALTIME SCHEDULER MATRIX DATA LIST
    const testRef = ref(db, TEST_NODE_PATH);
    onValue(testRef, (snapshot) => {
        queueArea.innerHTML = '';
        const testsMap = snapshot.val();

        if (!testsMap) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No mock evaluation papers mapped inside network nodes.</p>`;
            return;
        }

        for (let key in testsMap) {
            let item = testsMap[key];
            let batchObj = cacheBatchesMap[item.batchId];
            let batchTitleName = batchObj ? batchObj.name : 'Target Cohort Erased';

            let card = document.createElement('div');
            card.className = `test-mgmt-card`;
            card.innerHTML = `
                <div class="test-left-bar"></div>
                <div>
                    <span class="test-batch-tag">${batchTitleName} | ${item.syllabus}</span>
                    <h3 class="test-title">${item.title}</h3>
                    <div class="test-meta-grid">
                        <div class="test-meta-item"><i class="fas fa-hourglass-half"></i> Duration: ${item.duration} Mins</div>
                        <div class="test-meta-item"><i class="fas fa-list-ol"></i> Questions: ${item.totalQues}</div>
                        <div class="test-meta-item"><i class="fas fa-check-circle"></i> Marking: +${item.posMark} / -${item.negMark}</div>
                        <div class="test-meta-item"><i class="fas fa-link"></i> Endpoint Config Connected</div>
                    </div>
                </div>
                <div class="admin-modifier-row">
                    <button class="mod-btn act-edit" data-firebase-key="${key}"><i class="fas fa-edit" style="color:#2563EB;"></i> Edit</button>
                    <button class="mod-btn act-del" data-firebase-key="${key}"><i class="fas fa-trash" style="color:#EF4444;"></i> Delete</button>
                </div>
            `;
            queueArea.appendChild(card);
        }
    });

    // 📤 3. DISPATCH EXAM DATA TO REMOTE STORAGE TREE
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let targetFirebaseKey = document.getElementById('formTestId').value;
        let selectedBatch = batchSelect.value;

        if (!selectedBatch) {
            alert("Please couple a valid network package cohort registration target node!");
            return;
        }

        let data = {
            batchId: selectedBatch,
            title: document.getElementById('tTitle').value,
            duration: document.getElementById('tDuration').value,
            totalQues: document.getElementById('tTotalQuestions').value,
            posMark: document.getElementById('tPositiveMark').value,
            negMark: document.getElementById('tNegativeMark').value,
            syllabus: document.getElementById('tSyllabus').value,
            examLink: document.getElementById('tExamLink').value
        };

        if (targetFirebaseKey) {
            const taskUpdateRef = ref(db, `${TEST_NODE_PATH}/${targetFirebaseKey}`);
            set(taskUpdateRef, data).then(() => {
                document.getElementById('testSubmitBtn').innerText = "Schedule to Cloud Arena";
                document.getElementById('formTestId').value = "";
                form.reset();
            });
        } else {
            const taskPushRef = push(ref(db, TEST_NODE_PATH));
            set(taskPushRef, data).then(() => {
                form.reset();
            });
        }
    });

    // ⚙️ 4. DISPATCH DATA ERASE & EDIT HANDLERS
    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if (!btn) return;
        let firebaseKey = btn.dataset.firebaseKey;

        if (btn.classList.contains('act-edit')) {
            const readTargetNodeRef = ref(db, `${TEST_NODE_PATH}/${firebaseKey}`);
            onValue(readTargetNodeRef, (snapshot) => {
                let item = snapshot.val();
                if (!item) return;
                document.getElementById('formTestId').value = firebaseKey;
                batchSelect.value = item.batchId;
                document.getElementById('tTitle').value = item.title;
                document.getElementById('tDuration').value = item.duration;
                document.getElementById('tTotalQuestions').value = item.totalQues;
                document.getElementById('tPositiveMark').value = item.posMark;
                document.getElementById('tNegativeMark').value = item.negMark;
                document.getElementById('tSyllabus').value = item.syllabus;
                document.getElementById('tExamLink').value = item.examLink;
                document.getElementById('testSubmitBtn').innerText = "Update Cloud Test Configuration";
                document.getElementById('admin-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }, { onlyOnce: true });

        } else if (btn.classList.contains('act-del')) {
            if (confirm("Are you completely certain you want to purge this test configuration sheet node parameters from online real-time systems?")) {
                const targetNodeEraserRef = ref(db, `${TEST_NODE_PATH}/${firebaseKey}`);
                remove(targetNodeEraserRef);
            }
        }
    });
            }
                
