const BATCH_STORAGE_KEY = 'mneet_managed_batches';
const STUDY_STORAGE_KEY = 'mneet_batch_study_materials';

export function getStudyLayout() {
    // Local storage theke active batches fetch korche dynamic dropdown menu builder-er jonno
    let savedBatches = localStorage.getItem(BATCH_STORAGE_KEY);
    let batches = savedBatches ? JSON.parse(savedBatches) : [];

    let optionsHTML = batches.map(b => `<option value="${b.id}">${b.name} (${b.tag})</option>`).join('');
    if (batches.length === 0) {
        optionsHTML = `<option value="">No Active Batches Found - Create a Batch First</option>`;
    }

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
        
        /* 📚 NEW RE-DESIGNED PREMIUM STUDY MATERIAL ROW CARD */
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
        .link-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 85%; }
        
        .admin-modifier-row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-line); }
        .mod-btn { border: var(--black-stroke); background: var(--bg-surface); color: var(--text-title); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 2px 2px 0px #000000; display: flex; align-items: center; gap: 4px; }
        .mod-btn:active { transform: translate(1px, 1px); box-shadow: 0px 0px 0px #000000; }
    </style>

    <div class="study-allocator-panel">
        <div class="study-form-card">
            <h2 class="study-heading">Study Engine Content Manager</h2>
            <form id="modStudyForm">
                <input type="hidden" id="formContentId" value="">
                
                <label class="input-label">Select Targeted Batch Package</label>
                <select id="sBatchId" class="custom-input" required>
                    ${optionsHTML}
                </select>

                <label class="input-label">Topic / Lecture Title Name</label>
                <input type="text" id="sTitle" class="custom-input" placeholder="e.g., Cell Division - Lecture 01" required>

                <label class="input-label">Video Stream URL (YouTube Embed / Server Link)</label>
                <input type="text" id="sVideoUrl" class="custom-input" placeholder="https://youtube.com/embed/... or dynamic mp4 link" required>

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

                <button type="submit" class="btn-action-upload" id="studySubmitBtn">Allocate Content</button>
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

    function fetchBatches() { return JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY)) || []; }
    function fetchState() { return JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY)) || []; }
    function saveState(arr) { localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(arr)); renderQueue(); }

    function renderQueue() {
        let arr = fetchState();
        let batches = fetchBatches();
        queueArea.innerHTML = '';
        
        if(arr.length === 0) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No lectures or contents allocated yet.</p>`;
            return;
        }
        
        arr.forEach(item => {
            let matchedBatch = batches.find(b => b.id == item.batchId);
            let batchName = matchedBatch ? matchedBatch.name : 'Unknown Batch';
            
            let card = document.createElement('div');
            card.className = `content-log-card`;
            
            card.innerHTML = `
                <div class="content-left-bar"></div>
                <div>
                    <span class="content-batch-tag">${batchName} | ${item.subject}</span>
                    <h3 class="content-title">${item.title}</h3>
                    
                    <div class="links-grid">
                        <a href="${item.videoUrl}" target="_blank" class="link-item">
                            <i class="fas fa-video"></i> <span>Video: ${item.videoUrl}</span>
                        </a>
                        ${item.notesUrl ? `
                        <a href="${item.notesUrl}" target="_blank" class="link-item">
                            <i class="fas fa-file-pdf"></i> <span>Notes: ${item.notesUrl}</span>
                        </a>` : ''}
                        ${item.dppUrl ? `
                        <a href="${item.dppUrl}" target="_blank" class="link-item">
                            <i class="fas fa-clipboard-list"></i> <span>DPP: ${item.dppUrl}</span>
                        </a>` : ''}
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
        let targetId = document.getElementById('formContentId').value;
        let selectedBatch = document.getElementById('sBatchId').value;

        if(!selectedBatch || selectedBatch === "") {
            alert("Please create a batch first before allocating study contents!");
            return;
        }

        let data = {
            id: targetId ? parseInt(targetId) : Date.now(),
            batchId: selectedBatch,
            title: document.getElementById('sTitle').value,
            videoUrl: document.getElementById('sVideoUrl').value,
            notesUrl: document.getElementById('sNotesUrl').value,
            dppUrl: document.getElementById('sDppUrl').value,
            subject: document.getElementById('sSubject').value,
            visibility: document.getElementById('sVisibility').value
        };

        if(targetId) {
            arr = arr.map(c => c.id == targetId ? data : c);
            document.getElementById('studySubmitBtn').innerText = "Allocate Content";
            document.getElementById('formContentId').value = "";
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
            let item = arr.find(c => c.id === id);
            if(item) {
                document.getElementById('formContentId').value = item.id;
                document.getElementById('sBatchId').value = item.batchId;
                document.getElementById('sTitle').value = item.title;
                document.getElementById('sVideoUrl').value = item.videoUrl;
                document.getElementById('sNotesUrl').value = item.notesUrl;
                document.getElementById('sDppUrl').value = item.dppUrl;
                document.getElementById('sSubject').value = item.subject;
                document.getElementById('sVisibility').value = item.visibility;
                document.getElementById('studySubmitBtn').innerText = "Update Content";
                document.getElementById('admin-main-render-area').scrollTo({top: 0, behavior: 'smooth'});
            }
        } else if(btn.classList.contains('act-del')) {
            if(confirm("Are you sure to delete this allocated study material?")) {
                arr = arr.filter(c => c.id !== id);
                saveState(arr);
            }
        }
    });

    renderQueue();
      }
      
