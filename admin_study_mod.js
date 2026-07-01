// Importing dynamic Realtime Database configuration protocols directly from your config bridge
import { db, ref, set, push, onValue, remove } from './firebase-config.js';

const BATCH_NODE_PATH = 'mneet_managed_batches';
const STUDY_NODE_PATH = 'mneet_batch_study_materials';

export function getStudyLayout() {
    return `
    <style>
        .study-allocator-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .study-form-card { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 30px; }
        .study-heading { text-align: center; color: var(--gold); font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        .input-label { display: block; font-weight: 700; margin-bottom: 6px; font-size: 13px; color: var(--text-title); }
        
        .custom-input { width: 100%; padding: 12px; border: var(--black-stroke) !important; border-radius: 10px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; }
        .custom-input:focus { border-color: var(--gold) !important; }
        
        .flex-row { display: flex; gap: 12px; }
        .flex-row > div { flex: 1; }
        
        .btn-action-upload { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 15px; }
        .btn-action-upload:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        .section-divider { font-size: 18px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 25px 0 20px 0; text-transform: uppercase; }
        
        .content-log-card { 
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
        .content-left-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background-color: var(--burgundy); }
        .content-title { font-size: 18px; font-weight: 900; margin-bottom: 6px; color: var(--text-title); }
        .content-batch-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; background: var(--bg-input); color: var(--gold); border: 1px solid var(--border-line); margin-bottom: 8px; }
        
        .links-grid { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700; margin-bottom: 12px; padding-top: 8px; border-top: 1px dashed var(--border-line); }
        .link-item { display: flex; align-items: center; gap: 8px; color: var(--text-para); text-decoration: none; }
        .link-item i { color: var(--gold); width: 16px; }
        
        .admin-modifier-row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-line); }
        .mod-btn { border: var(--black-stroke); background: var(--bg-surface); color: var(--text-title); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 2px 2px 0px #000000; display: flex; align-items: center; gap: 4px; }
    </style>

    <div class="study-allocator-panel">
        <div class="study-form-card">
            <h2 class="study-heading">Study Engine Content Manager</h2>
            <form id="modStudyForm">
                <input type="hidden" id="formContentId" value="">
                
                <label class="input-label">Select Targeted Batch Package</label>
                <select id="sBatchId" class="custom-input" required>
                    <option value="">Loading live cloud batches...</option>
                </select>

                <label class="input-label">Topic / Lecture Title Name</label>
                <input type="text" id="sTitle" class="custom-input" placeholder="e.g., Cell Division - Lecture 01" required>

                <label class="input-label">Video Stream URL (YouTube Embed / Server Link)</label>
                <input type="text" id="sVideoUrl" class="custom-input" placeholder="https://youtube.com/embed/..." required>

                <div class="flex-row">
                    <div>
                        <label class="input-label">NCERT Reference Notes (PDF Link)</label>
                        <input type="text" id="sNotesUrl" class="custom-input" placeholder="https://drive.google.com/notes.pdf">
                    </div>
                    <div>
                        <label class="input-label">Daily Practice Problem (DPP Link)</label>
                        <input type="text" id="sDppUrl" class="custom-input" placeholder="https://drive.google.com/dpp.pdf">
                    </div>
                </div>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Subject Category</label>
                        <select id="sSubject" class="custom-input">
                            <option value="Botany">Botany</option>
                            <option value="Zoology">Zoology</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">Content Visibility Rules</label>
                        <select id="sVisibility" class="custom-input">
                            <option value="Immediate">Visible Immediately</option>
                            <option value="Scheduled">Keep Locked / Schedule</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn-action-upload" id="studySubmitBtn">Allocate to Cloud Content</button>
            </form>
        </div>

        <h3 class="section-divider">Allocated Contents Queue</h3>
        <div id="renderStudyQueue"></div>
    </div>
    `;
}

export function initStudyLogic() {
    const form = document.getElementById('modStudyForm');
    const queueArea = document.getElementById('renderStudyQueue');
    const batchSelect = document.getElementById('sBatchId');

    let cacheBatchesMap = {};

    // ☁️ 1. FETCH LIVE BATCHES FOR DROPDOWN ACCESSIBILITY
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

    // ☁️ 2. LISTEN LIVE ALLOCATED CONTENT MAP
    const studyRef = ref(db, STUDY_NODE_PATH);
    onValue(studyRef, (snapshot) => {
        queueArea.innerHTML = '';
        const contentsMap = snapshot.val();

        if (!contentsMap) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No lectures or contents allocated inside online repository.</p>`;
            return;
        }

        for (let key in contentsMap) {
            let item = contentsMap[key];
            let batchObj = cacheBatchesMap[item.batchId];
            let parentBatchName = batchObj ? batchObj.name : 'Target Cohort Deleted';

            let card = document.createElement('div');
            card.className = `content-log-card`;
            card.innerHTML = `
                <div class="content-left-bar"></div>
                <div>
                    <span class="content-batch-tag">${parentBatchName} | ${item.subject}</span>
                    <h3 class="content-title">${item.title}</h3>
                    <div class="links-grid">
                        <a href="${item.videoUrl}" target="_blank" class="link-item"><i class="fas fa-video"></i> <span>Video: Stream Link</span></a>
                        ${item.notesUrl ? `<a href="${item.notesUrl}" target="_blank" class="link-item"><i class="fas fa-file-pdf"></i> <span>Notes: PDF Attached</span></a>` : ''}
                        ${item.dppUrl ? `<a href="${item.dppUrl}" target="_blank" class="link-item"><i class="fas fa-clipboard-list"></i> <span>DPP: Exercise Sheet</span></a>` : ''}
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

    // 📤 3. PUSH FORM DATA DIRECTLY TO CLOUD NODES
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let targetFirebaseKey = document.getElementById('formContentId').value;
        let selectedBatch = batchSelect.value;

        if (!selectedBatch) {
            alert("Please hook a valid system batch package node registry!");
            return;
        }

        let data = {
            batchId: selectedBatch,
            title: document.getElementById('sTitle').value,
            videoUrl: document.getElementById('sVideoUrl').value,
            notesUrl: document.getElementById('sNotesUrl').value,
            dppUrl: document.getElementById('sDppUrl').value,
            subject: document.getElementById('sSubject').value,
            visibility: document.getElementById('sVisibility').value
        };

        if (targetFirebaseKey) {
            const contentUpdateRef = ref(db, `${STUDY_NODE_PATH}/${targetFirebaseKey}`);
            set(contentUpdateRef, data).then(() => {
                document.getElementById('studySubmitBtn').innerText = "Allocate to Cloud Content";
                document.getElementById('formContentId').value = "";
                form.reset();
            });
        } else {
            const contentPushRef = push(ref(db, STUDY_NODE_PATH));
            set(contentPushRef, data).then(() => {
                form.reset();
            });
        }
    });

    // ⚙️ 4. CLOUD REMOVAL AND EDIT TRIGGER BINDINGS
    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if (!btn) return;
        let firebaseKey = btn.dataset.firebaseKey;

        if (btn.classList.contains('act-edit')) {
            const fetchNodeRef = ref(db, `${STUDY_NODE_PATH}/${firebaseKey}`);
            onValue(fetchNodeRef, (snapshot) => {
                let item = snapshot.val();
                if (!item) return;
                document.getElementById('formContentId').value = firebaseKey;
                batchSelect.value = item.batchId;
                document.getElementById('sTitle').value = item.title;
                document.getElementById('sVideoUrl').value = item.videoUrl;
                document.getElementById('sNotesUrl').value = item.notesUrl;
                document.getElementById('sDppUrl').value = item.dppUrl;
                document.getElementById('sSubject').value = item.subject;
                document.getElementById('sVisibility').value = item.visibility;
                document.getElementById('studySubmitBtn').innerText = "Update Cloud Content";
                document.getElementById('admin-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }, { onlyOnce: true });

        } else if (btn.classList.contains('act-del')) {
            if (confirm("Permanently erase this content array record from online cloud servers?")) {
                const deleteNodeRef = ref(db, `${STUDY_NODE_PATH}/${firebaseKey}`);
                remove(deleteNodeRef);
            }
        }
    });
}
