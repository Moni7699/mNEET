// Importing dynamic Realtime Database configuration protocols directly from your config bridge
import { db, ref, set, push, onValue, remove } from './firebase-config.js';
import { getStudentTestLayout, initStudentTestLogic } from './student_test_mod.js';
import { getStudentShopLayout, initStudentShopLogic } from './student_shop_mod.js';
import { getStudentDoubtsLayout, initStudentDoubtLogic } from './student_doubts_mod.js';

const viewport = document.getElementById('student-main-render-area');
const tabs = document.querySelectorAll('.dashboard-footer .footer-tab');
const body = document.body;

// Central Enterprise Schema Cloud Node Paths
const BATCH_NODE_PATH = 'mneet_managed_batches';
const STUDY_NODE_PATH = 'mneet_batch_study_materials';

function setupThemeHandler() {
    const themeToggle = document.getElementById('student-theme-toggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('change', (e) => {
        body.className = e.target.checked ? 'theme-dark' : 'theme-white';
    });
}

// 📡 LIVER STREAM CLOUD ROUTER: MATCHES BATCH COHORTS DATA STREAM AUTOMATICALLY
function renderClassroomModule() {
    viewport.innerHTML = `<div style="text-align:center; opacity:0.7; font-size:14px; font-weight:700; padding:40px 0;"><i class="fas fa-spinner fa-spin"></i> Synchronizing cloud database channels...</div>`;

    const batchesRef = ref(db, BATCH_NODE_PATH);
    
    // ☁️ 1. Fetch live published cohort packages tree nodes parameters
    onValue(batchesRef, (bSnapshot) => {
        const batchesMap = bSnapshot.val() || {};
        
        // ☁️ 2. Pull content materials allocated pipeline
        const studyRef = ref(db, STUDY_NODE_PATH);
        onValue(studyRef, (sSnapshot) => {
            viewport.innerHTML = '';
            const materialsMap = sSnapshot.val() || {};

            let headerHTML = `
                <div style="max-width:600px; margin:0 auto; padding-bottom:12px;">
                    <div style="background: var(--bg-surface); padding: 16px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000; margin-bottom: 24px;">
                        <h2 style="font-size: 22px; font-weight:900; color: var(--gold);">My Digital Classroom</h2>
                        <p style="font-size: 13px; color: var(--text-para); margin-top: 2px;">Access your cloud sync batch lectures, structural PDF notes, and high-focus DPP worksheets items.</p>
                    </div>
                </div>
            `;
            
            let batchesHTML = '';
            let totalBatchesCounter = 0;

            for (let bKey in batchesMap) {
                let batch = batchesMap[bKey];
                
                // Do not render to client viewport grid screens if flagged hidden inside admin panel parameters
                if (!batch.isHidden) {
                    totalBatchesCounter++;
                    
                    // Filter materials linked structurally with this explicit cohort key payload node
                    let lecturesRows = '';
                    let hasLectures = false;

                    for (let sKey in materialsMap) {
                        let materialItem = materialsMap[sKey];
                        if (materialItem.batchId === bKey) {
                            hasLectures = true;
                            lecturesRows += `
                                <div style="background: var(--bg-input); padding: 12px; border-radius: 10px; border: 1px solid var(--border-line); margin-top: 10px;">
                                    <strong style="font-size: 14px; color: var(--text-title); display: block; margin-bottom: 6px;">${materialItem.title} (${materialItem.subject})</strong>
                                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                        <a href="${materialItem.videoUrl}" target="_blank" style="text-decoration:none; color:#000; background:var(--gold); font-size:11px; font-weight:800; padding:4px 8px; border-radius:4px; border:1px solid #000;"><i class="fas fa-play"></i> Watch Class</a>
                                        ${materialItem.notesUrl ? `<a href="${materialItem.notesUrl}" target="_blank" style="text-decoration:none; color:var(--text-title); background:var(--bg-surface); font-size:11px; font-weight:800; padding:4px 8px; border-radius:4px; border:1px solid var(--border-line);"><i class="fas fa-file-pdf"></i> PDF Notes</a>` : ''}
                                        ${materialItem.dppUrl ? `<a href="${materialItem.dppUrl}" target="_blank" style="text-decoration:none; color:var(--text-title); background:var(--bg-surface); font-size:11px; font-weight:800; padding:4px 8px; border-radius:4px; border:1px solid var(--border-line);"><i class="fas fa-tasks"></i> Solve DPP</a>` : ''}
                                    </div>
                                </div>
                            `;
                        }
                    }

                    if (!hasLectures) {
                        lecturesRows = `<p style="font-size:12px; opacity:0.6; padding-top:8px; font-weight:700;">No live lectures or study resources allocated under this cohort yet.</p>`;
                    }

                    batchesHTML += `
                    <div style="max-width:600px; margin:0 auto 20px auto; background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000;">
                        <span style="font-size: 10px; font-weight: 800; color: #fff; background: var(--burgundy); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Enrolled Package</span>
                        <h3 style="font-size: 20px; font-weight: 900; margin-top: 6px; color: var(--text-title);">${batch.name}</h3>
                        <p style="font-size: 13px; color: var(--text-para); margin-top: 2px;">Instructor Core: ${batch.mentor || 'NEET Specialized Panel'}</p>
                        
                        <div style="margin-top: 14px; border-top: 1px dashed var(--border-line); padding-top: 10px;">
                            <h4 style="font-size: 13px; font-weight: 900; text-transform: uppercase; color: var(--gold);"><i class="fas fa-graduation-cap"></i> Syllabus Timeline Classroom</h4>
                            ${lecturesRows}
                        </div>
                    </div>`;
                }
            }

            if (totalBatchesCounter === 0) {
                batchesHTML = `<div style="max-width:600px; margin:0 auto;"><p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 40px 0; background:var(--bg-surface); border:var(--black-stroke); border-radius:16px; box-shadow:4px 4px 0px #000;">No batches published or active inside system workspace database layers.</p></div>`;
            }

            viewport.innerHTML = headerHTML + batchesHTML;
        });
    });
}

// 🎛️ CENTRAL ROUTER INTERFACE HANDLERS DISPATCH SWITCHBOARD
function switchStudentView(target) {
    viewport.innerHTML = '';
    
    switch(target) {
        case 'classroom':
            renderClassroomModule();
            break;
            
        case 'testpack':
            viewport.innerHTML = getStudentTestLayout();
            initStudentTestLogic();
            break;
            
        case 'shop':
            viewport.innerHTML = getStudentShopLayout();
            initStudentShopLogic();
            break;
            
        case 'queries':
            viewport.innerHTML = getStudentDoubtsLayout();
            initStudentDoubtLogic();
            break;
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        const activeTab = e.currentTarget;
        activeTab.classList.add('active-tab');
        switchStudentView(activeTab.dataset.target);
    });
});

document.getElementById('student-drawer-open-btn').addEventListener('click', () => {
    document.getElementById('profile-drawer').className = 'drawer-open';
    document.getElementById('drawer-overlay').classList.remove('hidden-widget');
});
const closeDrawer = () => {
    document.getElementById('profile-drawer').className = 'drawer-closed';
    document.getElementById('drawer-overlay').classList.add('hidden-widget');
};
document.getElementById('student-drawer-close-btn').addEventListener('click', closeDrawer);
document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

document.getElementById('student-logout-btn').addEventListener('click', () => {
    alert("Secure session terminated parameters successfully.");
    closeDrawer();
});

setupThemeHandler();
switchStudentView('classroom');
                                          
