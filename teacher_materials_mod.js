// Importing active Realtime Database connection parameters from config layer
import { db, ref, set, push, onValue, remove } from './firebase-config.js';

const BATCH_NODE_PATH = 'mneet_managed_batches';
const STUDY_NODE_PATH = 'mneet_batch_study_materials';

export function getTeacherMaterialsLayout(facultySubject) {
    return `
    <style>
        .t-mat-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .t-mat-card { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 30px; }
        .t-mat-heading { text-align: center; color: var(--gold); font-size: 21px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        .t-label { display: block; font-weight: 700; margin-bottom: 6px; font-size: 13px; color: var(--text-title); }
        
        .t-input { width: 100%; padding: 12px; border: var(--black-stroke) !important; border-radius: 10px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; }
        .t-input:focus { border-color: var(--gold) !important; }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        
        .btn-faculty-upload { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 15px; }
        .btn-faculty-upload:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        .t-divider { font-size: 18px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 25px 0 20px 0; text-transform: uppercase; }
        
        .faculty-log-card { 
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
        .faculty-accent-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background-color: var(--neon-green); }
        .faculty-mat-title { font-size: 18px; font-weight: 900; margin-bottom: 6px; }
        .faculty-batch-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; background: var(--bg-input); color: var(--gold); border: 1px solid var(--border-line); margin-bottom: 8px; }
        
        .links-stack { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700; margin-bottom: 12px; padding-top: 8px; border-top: 1px dashed var(--border-line); }
        .link-row-node { display: flex; align-items: center; gap: 8px; color: var(--text-para); text-decoration: none; }
        .link-row-node i { color: var(--gold); }
        
        .card-actions-row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-line); }
        .act-btn { border: var(--black-stroke); background: var(--bg-surface); color: var(--text-title); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 2px 2px 0px #000000; }
    </style>

    <div class="t-mat-panel">
        <div class="t-mat-card">
            <h2 class="t-mat-heading">Locker Content Allocator</h2>
            <form id="facultyStudyForm">
                <input type="hidden" id="facContentId" value="">
                
                <label class="t-label">Select Targeted Student Batch</label>
                <select id="fBatchId" class="t-input" required>
                    <option value="">Loading active cohorts map...</option>
                </select>

                <label class="t-label">Topic / Lecture Chapter Title</label>
                <input type="text" id="fTitle" class="t-input" placeholder="e.g., Photosynthesis - Class DPP 02" required>

                <label class="t-label">Video Lecture Reference Stream Link</label>
                <input type="text" id="fVideoUrl" class="t-input" placeholder="https://youtube.com/embed/..." required>

                <div class="grid-2">
                    <div>
                        <label class="t-label">Upload Lecture Notes (PDF Drive Link)</label>
                        <input type="text" id="fNotesUrl" class="t-input" placeholder="https://drive.google.com/notes.pdf">
                    </div>
                    <div>
                        <label class="t-label">Upload Daily DPP (PDF Drive Link)</label>
                        <input type="text" id="fDppUrl" class="t-input" placeholder="https://drive.google.com/dpp.pdf">
                    </div>
                </div>

                <div class="grid-2">
                    <div>
                        <label class="t-label">Subject Locked Code</label>
                        <input type="text" id="fSubject" class="t-input" value="${facultySubject}" readonly>
                    </div>
                    <div>
                        <label class="t-label">Visibility Protocol</label>
                        <select id="fVisibility" class="t-input">
                            <option value="Immediate">Visible Immediately</option>
                            <option value="Scheduled">Keep Locked / Schedule</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn-faculty-upload" id="facSubmitBtn">Push to Cloud Classroom</button>
            </form>
        </div>

        <h3 class="t-divider">Your Uploaded Logs</h3>
        <div id="renderFacultyMaterialsQueue"></div>
    </div>
    `;
}

export function initTeacherMaterialsLogic(facultySubject) {
    const form = document.getElementById('facultyStudyForm');
    const queueArea = document.getElementById('renderFacultyMaterialsQueue');
    const batchSelect = document.getElementById('fBatchId');

    let cacheBatchesMap = {};

    // ☁️ 1. FETCH LIVE CLOUD BATCH COHORTS FOR SELECTION TARGET DROPDOWN
    const batchesRef = ref(db, BATCH_NODE_PATH);
    onValue(batchesRef, (snapshot) => {
        const dataMap = snapshot.val() || {};
        cacheBatchesMap = dataMap;
        
        let htmlOptions = '<option value="">-- Choose Target Batch --</option>';
        for (let key in dataMap) {
            htmlOptions += `<option value="${key}">${dataMap[key].name}</option>`;
        }
        batchSelect.innerHTML = htmlOptions;
    }, { onlyOnce: true });

    // ☁️ 2. LISTEN REAL-TIME CONTENT REPOSITORY FEEDS
    const studyRef = ref(db, STUDY_NODE_PATH);
    onValue(studyRef, (snapshot) => {
        queueArea.innerHTML = '';
        const dataMap = snapshot.val();

        if (!dataMap) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No materials uploaded inside your workspace cloud environment nodes yet.</p>`;
            return;
        }

        let hasContent = false;
        for (let key in dataMap) {
            let item = dataMap[key];
            
            // Checking logic parameters boundary to filter item profiles matching this teacher specialty code only
            if (item.subject.toLowerCase() === facultySubject.toLowerCase()) {
                hasContent = true;
                let batchObj = cacheBatchesMap[item.batchId];
                let parentBatchTitle = batchObj ? batchObj.name : 'Target Course Expired';
                
                let card = document.createElement('div');
                card.className = `faculty-log-card`;
                card.innerHTML = `
                    <div class="faculty-accent-bar"></div>
                    <div>
                        <span class="faculty-batch-badge">${parentBatchTitle}</span>
                        <h3 class="faculty-mat-title">${item.title}</h3>
                        <div class="links-stack">
                            <a href="${item.videoUrl}" target="_blank" class="link-row-node"><i class="fas fa-video"></i> <span>Video Stream Link</span></a>
                            ${item.notesUrl ? `<a href="${item.notesUrl}" target="_blank" class="link-row-node"><i class="fas fa-file-pdf"></i> <span>Notes Reference Document</span></a>` : ''}
                            ${item.dppUrl ? `<a href="${item.dppUrl}" target="_blank" class="link-row-node"><i class="fas fa-clipboard-list"></i> <span>Daily Practice Sheet</span></a>` : ''}
                        </div>
                    </div>
                    <div class="card-actions-row">
                        <button class="act-btn act-edit" data-firebase-key="${key}" style="color:#2563EB;"><i class="fas fa-edit"></i> Edit</button>
                        <button class="act-btn act-del" data-firebase-key="${key}" style="color:#EF4444;"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                `;
                queueArea.appendChild(card);
            }
        }

        if (!hasContent) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No materials uploaded by you inside current configuration streams.</p>`;
        }
    });

    // 📤 3. DISPATCH EXECUTIONS SYSTEM WRITE CODES DATA PAYLOAD TO CLOUD CLUSTER NODE TREE
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let targetFirebaseKey = document.getElementById('facContentId').value;
        let selectedBatch = batchSelect.value;

        if (!selectedBatch) {
            alert("Please bundle an active structural cohort database index key destination!");
            return;
        }

        let data = {
            batchId: selectedBatch,
            title: document.getElementById('fTitle').value,
            videoUrl: document.getElementById('fVideoUrl').value,
            notesUrl: document.getElementById('fNotesUrl').value,
            dppUrl: document.getElementById('fDppUrl').value,
            subject: facultySubject,
            visibility: document.getElementById('fVisibility').value
        };

        if (targetFirebaseKey) {
            const contentUpdateRef = ref(db, `${STUDY_NODE_PATH}/${targetFirebaseKey}`);
            set(contentUpdateRef, data).then(() => {
                document.getElementById('facSubmitBtn').innerText = "Push to Cloud Classroom";
                document.getElementById('facContentId').value = "";
                form.reset();
                document.getElementById('fSubject').value = facultySubject;
            });
        } else {
            const contentPushRef = push(ref(db, STUDY_NODE_PATH));
            set(contentPushRef, data).then(() => {
                form.reset();
                document.getElementById('fSubject').value = facultySubject;
            });
        }
    });

    // ⚙️ 4. BIND MODIFIERS REMOVE/UPDATE OPERATION LOOPS
    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.act-btn');
        if (!btn) return;
        let firebaseKey = btn.dataset.firebaseKey;

        if (btn.classList.contains('act-edit')) {
            const targetNodeFetchRef = ref(db, `${STUDY_NODE_PATH}/${firebaseKey}`);
            onValue(targetNodeFetchRef, (snapshot) => {
                let item = snapshot.val();
                if (!item) return;
                document.getElementById('facContentId').value = firebaseKey;
                batchSelect.value = item.batchId;
                document.getElementById('fTitle').value = item.title;
                document.getElementById('fVideoUrl').value = item.videoUrl;
                document.getElementById('fNotesUrl').value = item.notesUrl;
                document.getElementById('fDppUrl').value = item.dppUrl;
                document.getElementById('fVisibility').value = item.visibility;
                document.getElementById('facSubmitBtn').innerText = "Update Cloud Locker Data";
                document.getElementById('teacher-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }, { onlyOnce: true });

        } else if (btn.classList.contains('act-del')) {
            if (confirm("Delete this specialized study resource matrix document sheet node parameter from online cloud server arrays?")) {
                const targetedEraserRef = ref(db, `${STUDY_NODE_PATH}/${firebaseKey}`);
                remove(targetedEraserRef);
            }
        }
    });
                          }
                                                        
