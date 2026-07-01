import { getStudentTestLayout, initStudentTestLogic } from './student_test_mod.js';
import { getStudentShopLayout, initStudentShopLogic } from './student_shop_mod.js';
import { getStudentDoubtsLayout, initStudentDoubtLogic } from './student_doubts_mod.js';

const viewport = document.getElementById('student-main-render-area');
const tabs = document.querySelectorAll('.dashboard-footer .footer-tab');
const body = document.body;

const BATCH_STORAGE_KEY = 'mneet_managed_batches';
const STUDY_STORAGE_KEY = 'mneet_batch_study_materials';

function setupThemeHandler() {
    const themeToggle = document.getElementById('student-theme-toggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('change', (e) => {
        body.className = e.target.checked ? 'theme-dark' : 'theme-white';
    });
}

function renderClassroomModule() {
    let batches = JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY)) || [];
    let materials = JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY)) || [];

    let batchesHTML = batches.filter(b => !b.isHidden).map(batch => {
        let classContents = materials.filter(m => m.batchId == batch.id);
        
        let lecturesRows = classContents.map(c => `
            <div style="background: var(--bg-input); padding: 12px; border-radius: 10px; border: 1px solid var(--border-line); margin-top: 10px;">
                <strong style="font-size: 14px; color: var(--text-title); display: block; margin-bottom: 6px;">${c.title} (${c.subject})</strong>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <a href="${c.videoUrl}" target="_blank" style="text-decoration:none; color:#000; background:var(--gold); font-size:11px; font-weight:800; padding:4px 8px; border-radius:4px; border:1px solid #000;"><i class="fas fa-play"></i> Watch Class</a>
                    ${c.notesUrl ? `<a href="${c.notesUrl}" target="_blank" style="text-decoration:none; color:var(--text-title); background:var(--bg-surface); font-size:11px; font-weight:800; padding:4px 8px; border-radius:4px; border:1px solid var(--border-line);"><i class="fas fa-file-pdf"></i> PDF Notes</a>` : ''}
                    ${c.dppUrl ? `<a href="${c.dppUrl}" target="_blank" style="text-decoration:none; color:var(--text-title); background:var(--bg-surface); font-size:11px; font-weight:800; padding:4px 8px; border-radius:4px; border:1px solid var(--border-line);"><i class="fas fa-tasks"></i> Solve DPP</a>` : ''}
                </div>
            </div>
        `).join('');

        if(classContents.length === 0) {
            lecturesRows = `<p style="font-size:12px; opacity:0.6; padding-top:8px; font-weight:700;">No live lectures or study resources allocated under this cohort yet.</p>`;
        }

        return `
        <div style="background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000; margin-bottom: 20px;">
            <span style="font-size: 10px; font-weight: 800; color: #fff; background: var(--burgundy); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Enrolled Package</span>
            <h3 style="font-size: 20px; font-weight: 900; margin-top: 6px; color: var(--text-title);">${batch.name}</h3>
            <p style="font-size: 13px; color: var(--text-para); margin-top: 2px;">Instructor Core: ${batch.mentor || 'NEET Specialized Panel'}</p>
            
            <div style="margin-top: 14px; border-top: 1px dashed var(--border-line); padding-top: 10px;">
                <h4 style="font-size: 13px; font-weight: 900; text-transform: uppercase; color: var(--gold);"><i class="fas fa-graduation-cap"></i> Syllabus Timeline Classroom</h4>
                ${lecturesRows}
            </div>
        </div>`;
    }).join('');

    if(batches.length === 0) {
        batchesHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 40px 0;">No batches published or active inside system workspace database layers.</p>`;
    }

    viewport.innerHTML = `
        <div style="max-width:600px; margin:0 auto; padding-bottom:40px;">
            <div style="background: var(--bg-surface); padding: 16px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000; margin-bottom: 24px;">
                <h2 style="font-size: 22px; font-weight:900; color: var(--gold);">My Digital Classroom</h2>
                <p style="font-size: 13px; color: var(--text-para); margin-top: 2px;">Access your batch lectures, structural PDF notes, and high-focus DPP worksheets items.</p>
            </div>
            ${batchesHTML}
        </div>
    `;
}

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
            // Connects Student dynamic Ask Doubt desk workspace codes securely
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
    
