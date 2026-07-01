const BATCH_STORAGE_KEY = 'mneet_managed_batches';
const STUDENT_DB_KEY = 'mneet_student_directory_db';

export function getStudentsLayout() {
    let savedBatches = localStorage.getItem(BATCH_STORAGE_KEY);
    let batches = savedBatches ? JSON.parse(savedBatches) : [];

    let optionsHTML = batches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    if (batches.length === 0) {
        optionsHTML = `<option value="">No Active Batches - Create Batch First</option>`;
    }

    return `
    <style>
        .students-panel-box { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .student-form-card { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 30px; }
        .student-heading { text-align: center; color: var(--gold); font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        .input-label { display: block; font-weight: 700; margin-bottom: 6px; font-size: 13px; color: var(--text-title); }
        
        .custom-input { width: 100%; padding: 12px; border: var(--black-stroke) !important; border-radius: 10px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; }
        .custom-input:focus { border-color: var(--gold) !important; }
        
        .flex-row { display: flex; gap: 12px; }
        .flex-row > div { flex: 1; }
        
        .btn-action-student { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 15px; }
        .btn-action-student:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        .section-divider { font-size: 18px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 25px 0 20px 0; text-transform: uppercase; }
        
        /* 👥 PREMIUM STUDENT ROW ROW SYSTEM LIST */
        .student-directory-card { 
            background: var(--bg-surface) !important; 
            color: var(--text-title) !important;
            border: var(--black-stroke); 
            border-radius: 16px; 
            padding: 16px; 
            margin-bottom: 16px; 
            box-shadow: 4px 4px 0px #000000; 
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .student-directory-card.is-blocked-true { border-color: var(--neon-red) !important; opacity: 0.6; }
        .stud-avatar { width: 44px; height: 44px; border-radius: 50%; border: var(--black-stroke); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; background-color: var(--bg-input); }
        
        .stud-details { flex-grow: 1; margin-left: 14px; }
        .stud-name { font-size: 16px; font-weight: 900; color: var(--text-title); }
        .stud-sub { font-size: 12px; color: var(--text-para); font-weight: 600; margin-top: 2px; }
        
        .admin-modifier-row { display: flex; gap: 6px; }
        .mod-btn { border: var(--black-stroke); background: var(--bg-surface); color: var(--text-title); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 2px 2px 0px #000000; }
        .mod-btn:active { transform: translate(1px, 1px); box-shadow: 0px 0px 0px #000000; }
    </style>

    <div class="students-panel-box">
        <div class="student-form-card">
            <h2 class="student-heading">Student Authorization Panel</h2>
            <form id="modStudentsForm">
                <input type="hidden" id="formStudentId" value="">
                
                <label class="input-label">Student Registered Mobile Number</label>
                <input type="text" id="sPhone" class="custom-input" placeholder="e.g., +91 9876543210" required>

                <label class="input-label">Student Legal Full Name</label>
                <input type="text" id="sFullName" class="custom-input" placeholder="e.g., Tanmoy Das" required>

                <label class="input-label">Assign Course/Batch Package Access</label>
                <select id="sAssignedBatch" class="custom-input" required>
                    ${optionsHTML}
                </select>

                <div class="flex-row">
                    <div>
                        <label class="input-label">Account Security Guard</label>
                        <select id="sStatus" class="custom-input">
                            <option value="Active">Active / Approved</option>
                            <option value="Blocked">Blocked / Suspend</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">Verification Mode</label>
                        <select id="sVerification" class="custom-input">
                            <option value="Verified OTP">Verified via OTP</option>
                            <option value="Manual Access">Manual Force Grant</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn-action-student" id="studentsSubmitBtn">Provision Access Token</button>
            </form>
        </div>

        <h3 class="section-divider">Student Enrollment Directory</h3>
        <div id="renderStudentsQueue"></div>
    </div>
    `;
}

export function initStudentsLogic() {
    const form = document.getElementById('modStudentsForm');
    const queueArea = document.getElementById('renderStudentsQueue');

    function fetchBatches() { return JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY)) || []; }
    function fetchState() { return JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY)) || []; } // using storage sync safely
    function getStudentDirectory() { return JSON.parse(localStorage.getItem(STUDENT_DB_KEY)) || []; }
    function saveStudentDirectory(arr) { localStorage.setItem(STUDENT_DB_KEY, JSON.stringify(arr)); renderQueue(); }

    function renderQueue() {
        let arr = getStudentDirectory();
        let batches = fetchBatches();
        queueArea.innerHTML = '';
        
        if(arr.length === 0) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No student directories registered manually.</p>`;
            return;
        }
        
        arr.forEach(item => {
            let matchedBatch = batches.find(b => b.id == item.batchId);
            let batchName = matchedBatch ? matchedBatch.name : 'No Active Course Access';
            let initialLetter = item.name ? item.name.charAt(0).toUpperCase() : 'S';
            let isBlocked = item.status === 'Blocked';
            
            let card = document.createElement('div');
            card.className = `student-directory-card ${isBlocked ? 'is-blocked-true' : ''}`;
            
            card.innerHTML = `
                <div class="stud-avatar" style="border-color: ${isBlocked ? 'var(--neon-red)' : 'initial'};">${initialLetter}</div>
                <div class="stud-details">
                    <h3 class="stud-name">${item.name} ${isBlocked ? '<span style="color:var(--neon-red); font-size:11px;">[SUSPENDED]</span>' : ''}</h3>
                    <div class="stud-sub"><i class="fas fa-phone-alt" style="font-size:10px;"></i> ${item.phone} | <i class="fas fa-layer-group" style="font-size:10px;"></i> ${batchName}</div>
                </div>
                <div class="admin-modifier-row">
                    <button class="mod-btn act-toggle-block" data-id="${item.id}" style="color: ${isBlocked ? '#10B981' : '#EF4444'};">
                        ${isBlocked ? '<i class="fas fa-check-circle"></i> Unblock' : '<i class="fas fa-ban"></i> Block'}
                    </button>
                    <button class="mod-btn act-del" data-id="${item.id}"><i class="fas fa-trash-alt" style="color:#222;"></i></button>
                </div>
            `;
            queueArea.appendChild(card);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let arr = getStudentDirectory();
        let targetId = document.getElementById('formStudentId').value;
        let selectedBatch = document.getElementById('sAssignedBatch').value;

        if(!selectedBatch || selectedBatch === "") {
            alert("Please configure an active cohort batch first!");
            return;
        }

        let data = {
            id: targetId ? parseInt(targetId) : Date.now(),
            phone: document.getElementById('sPhone').value,
            name: document.getElementById('sFullName').value,
            batchId: selectedBatch,
            status: document.getElementById('sStatus').value,
            verification: document.getElementById('sVerification').value
        };

        if(targetId) {
            arr = arr.map(s => s.id == targetId ? data : s);
            document.getElementById('studentsSubmitBtn').innerText = "Provision Access Token";
            document.getElementById('formStudentId').value = "";
        } else {
            arr.push(data);
        }
        saveStudentDirectory(arr);
        form.reset();
    });

    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if(!btn) return;
        let id = parseInt(btn.dataset.id);
        let arr = getStudentDirectory();

        if(btn.classList.contains('act-toggle-block')) {
            arr = arr.map(s => {
                if(s.id === id) {
                    let nextStatus = s.status === 'Blocked' ? 'Active' : 'Blocked';
                    return { ...s, status: nextStatus };
                }
                return s;
            });
            saveStudentDirectory(arr);
        } else if(btn.classList.contains('act-del')) {
            if(confirm("Are you sure to remove this student account registration profile parameters?")) {
                arr = arr.filter(s => s.id !== id);
                saveStudentDirectory(arr);
            }
        }
    });

    renderQueue();
}
