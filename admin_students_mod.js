// Importing dynamic Realtime Database configuration protocols directly from your config bridge
import { db, ref, set, push, onValue, remove } from './firebase-config.js';

const BATCH_NODE_PATH = 'mneet_managed_batches';
const STUDENT_NODE_PATH = 'mneet_student_directory_db';

export function getStudentsLayout() {
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
                    <option value="">Loading live cloud batches...</option>
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

        <h3 class="section-divider">Student Enrollment Directory (Cloud)</h3>
        <div id="renderStudentsQueue"></div>
    </div>
    `;
}

export function initStudentsLogic() {
    const form = document.getElementById('modStudentsForm');
    const queueArea = document.getElementById('renderStudentsQueue');
    const batchSelect = document.getElementById('sAssignedBatch');

    let cacheBatchesMap = {};

    // ☁️ 1. FETCH LIVE CLOUD COHORTS FOR ASSIGNMENT SELECTION
    const batchesRef = ref(db, BATCH_NODE_PATH);
    onValue(batchesRef, (snapshot) => {
        const dataMap = snapshot.val() || {};
        cacheBatchesMap = dataMap;
        
        let htmlOptions = '<option value="">-- Choose Access Batch --</option>';
        for (let key in dataMap) {
            htmlOptions += `<option value="${key}">${dataMap[key].name}</option>`;
        }
        batchSelect.innerHTML = htmlOptions;
    }, { onlyOnce: true });

    // ☁️ 2. LISTEN LIVE USER DIRECTORY REPOSITORY PIPELINE
    const studentRef = ref(db, STUDENT_NODE_PATH);
    onValue(studentRef, (snapshot) => {
        queueArea.innerHTML = '';
        const directoryMap = snapshot.val();

        if (!directoryMap) {
            queueArea.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No active student directories registered on cloud.</p>`;
            return;
        }

        for (let key in directoryMap) {
            let item = directoryMap[key];
            let batchObj = cacheBatchesMap[item.batchId];
            let assignedCourseName = batchObj ? batchObj.name : 'Access Cohort Key Deleted';
            let initialLetter = item.name ? item.name.charAt(0).toUpperCase() : 'S';
            let isBlocked = item.status === 'Blocked';

            let card = document.createElement('div');
            card.className = `student-directory-card ${isBlocked ? 'is-blocked-true' : ''}`;
            card.innerHTML = `
                <div class="stud-avatar" style="border-color: ${isBlocked ? 'var(--neon-red)' : 'initial'};">${initialLetter}</div>
                <div class="stud-details">
                    <h3 class="stud-name">${item.name} ${isBlocked ? '<span style="color:var(--neon-red); font-size:11px;">[SUSPENDED]</span>' : ''}</h3>
                    <div class="stud-sub"><i class="fas fa-phone-alt" style="font-size:10px;"></i> ${item.phone} | <i class="fas fa-layer-group" style="font-size:10px;"></i> ${assignedCourseName}</div>
                </div>
                <div class="admin-modifier-row">
                    <button class="mod-btn act-toggle-block" data-firebase-key="${key}" data-current-status="${item.status}">
                        ${isBlocked ? '<i class="fas fa-check-circle" style="color:#10B981;"></i> Unblock' : '<i class="fas fa-ban" style="color:#EF4444;"></i> Block'}
                    </button>
                    <button class="mod-btn act-del" data-firebase-key="${key}"><i class="fas fa-trash-alt" style="color:#222;"></i></button>
                </div>
            `;
            queueArea.appendChild(card);
        }
    });

    // 📤 3. PUSH ENROLLMENT REGISTRATION RECORDS
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let targetFirebaseKey = document.getElementById('formStudentId').value;
        let selectedBatch = batchSelect.value;

        if (!selectedBatch) {
            alert("Please apply a true relational cohort target node access boundary!");
            return;
        }

        let data = {
            phone: document.getElementById('sPhone').value,
            name: document.getElementById('sFullName').value,
            batchId: selectedBatch,
            status: document.getElementById('sStatus').value,
            verification: document.getElementById('sVerification').value
        };

        if (targetFirebaseKey) {
            const userUpdateRef = ref(db, `${STUDENT_NODE_PATH}/${targetFirebaseKey}`);
            set(userUpdateRef, data).then(() => {
                document.getElementById('studentsSubmitBtn').innerText = "Provision Access Token";
                document.getElementById('formStudentId').value = "";
                form.reset();
            });
        } else {
            const userPushRef = push(ref(db, STUDENT_NODE_PATH));
            set(userPushRef, data).then(() => {
                form.reset();
            });
        }
    });

    // ⚙️ 4. ACCELERATE SUSPENSION & REMOVAL ROUTING LOGICS
    queueArea.addEventListener('click', function(e) {
        let btn = e.target.closest('.mod-btn');
        if (!btn) return;
        let firebaseKey = btn.dataset.firebaseKey;

        if (btn.classList.contains('act-toggle-block')) {
            let currentStatus = btn.dataset.currentStatus;
            let nextStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
            
            const statusUpdateRef = ref(db, `${STUDENT_NODE_PATH}/${firebaseKey}/status`);
            set(statusUpdateRef, nextStatus);

        } else if (btn.classList.contains('act-del')) {
            if (confirm("Evict this student account token registration index from production database nodes?")) {
                const docEvictRef = ref(db, `${STUDENT_NODE_PATH}/${firebaseKey}`);
                remove(docEvictRef);
            }
        }
    });
            }
            
