const BATCH_STORAGE_KEY = 'mneet_managed_batches';
const STUDY_STORAGE_KEY = 'mneet_batch_study_materials';

export function getTeacherMaterialsLayout(facultySubject) {
    let savedBatches = localStorage.getItem(BATCH_STORAGE_KEY);
    let batches = savedBatches ? JSON.parse(savedBatches) : [];

    let optionsHTML = batches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    if (batches.length === 0) {
        optionsHTML = `<option value="">No Active Batches - Contact Administrator</option>`;
    }

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
                    ${optionsHTML}
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

                <button type="submit" class="btn-faculty-upload" id="facSubmitBtn">Push to Classroom</button>
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

    function fetchBatches() { return JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY)) || []; }
    function fetchState() { return JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY)) || []; }
    function saveState(arr) { localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(arr)); renderQueue(); }

    function renderQueue() {
        let arr = fetchState();
        let batches = fetchBatches();
        queueArea.innerHTML = '';
        
        // Filtering content belonging only to this teacher's specialty parameters code
        let filtered = arr.filter(m => m.subject.toLowerCase() === facultySubject.toLowerCase());

        if(filtered.length === 0) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No materials uploaded by you yet.</p>`;
            return;
        }
        
        filtered.forEach(item => {
            let batch = batches.find(b => b.id == item.batchId);
            let card = document.createElement('div');
            card.className = `faculty-log-card`;
            
            card.innerHTML = `
                <div class="faculty-accent-bar"></div>
                <div>
                    <span class="faculty-batch-badge">${batch ? batch.name : 'All Cohorts'}</span>
                    <h3 class="faculty-mat-title">${item.title}</h3>
                    <div class="links-stack">
                        <a href="${item.videoUrl}" target="_blank" class="link-row-node"><i class="fas fa-video"></i> <span>Video Stream Link</span></a>
                        ${item.notesUrl ? `<a href="${item.notesUrl}" target="_blank" class="link-row-node"><i class="fas fa-file-pdf"></i> <span>Notes Reference Document</span></a>` : ''}
                        ${item.dppUrl ? `<a href="${item.dppUrl}" target="_blank" class="link-row-node"><i class="fas fa-clipboard-list"></i> <span>Daily Practice Sheet</span></a>` : ''}
                    </div>
                </div>
                <div class="card-actions-row">
                    <button class="act-btn act-edit" data-id="${item.id}" style="color:#2563EB;"><i class="fas fa-edit"></i> Edit</button>
                    <button class="act-btn act-del" data-id="${item.id}" style="color:#EF4444;"><i class="fas fa-trash"></i> Remove</button>
                </div>
            `;
            queueArea.appendChild(card);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let arr = fetchState();
        let targetId = document.getElementById('facContentId').value;
        let selectedBatch = document.getElementById('fBatchId').value;

        let data = {
            id: targetId ? parseInt(targetId) : Date.now(),
            batchId: selectedBatch,
            title: document.getElementById('fTitle').value,
            videoUrl: document.getElementById('fVideoUrl').value,
            notesUrl: document.getElementById('fNotesUrl').value,
            dppUrl: document.getElementById('fDppUrl').value,
            subject: facultySubject,
            visibility: document.getElementById('fVisibility').value
        };

        if(targetId) {
            arr = arr.map(c => c.id == targetId ? data : c);
            document.getElementById('facSubmitBtn').innerText = "Push to Classroom";
            document.getElementById('facContentId').value = "";
        } else {
            arr.push(data);
        }
        saveState(arr);
        form.reset();
        document.getElementById('fSubject').value = facultySubject;
    });

    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.act-btn');
        if(!btn) return;
        let id = parseInt(btn.dataset.id);
        let arr = fetchState();

        if(btn.classList.contains('act-edit')) {
            let item = arr.find(c => c.id === id);
            if(item) {
                document.getElementById('facContentId').value = item.id;
                document.getElementById('fBatchId').value = item.batchId;
                document.getElementById('fTitle').value = item.title;
                document.getElementById('fVideoUrl').value = item.videoUrl;
                document.getElementById('fNotesUrl').value = item.notesUrl;
                document.getElementById('fDppUrl').value = item.dppUrl;
                document.getElementById('fVisibility').value = item.visibility;
                document.getElementById('facSubmitBtn').innerText = "Update Content";
                document.getElementById('teacher-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }
        } else if(btn.classList.contains('act-del')) {
            if(confirm("Delete this material profile?")) {
                arr = arr.filter(c => c.id !== id);
                saveState(arr);
            }
        }
    });

    renderQueue();
          }

