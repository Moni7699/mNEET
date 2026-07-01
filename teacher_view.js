// Importing active Realtime Database connection parameters from config layer
import { db, ref, set, push, onValue, remove } from './firebase-config.js';
import { getTeacherMaterialsLayout, initTeacherMaterialsLogic } from './teacher_materials_mod.js';
import { getTeacherDoubtsLayout, initTeacherDoubtsLogic } from './teacher_doubts_mod.js';

const viewport = document.getElementById('teacher-main-render-area');
const tabs = document.querySelectorAll('.dashboard-footer .footer-tab');
const body = document.body;

const SESSION_KEY = 'mneet_teacher_logged_session';
const BATCH_NODE_PATH = 'mneet_managed_batches';
const STUDY_NODE_PATH = 'mneet_batch_study_materials';

// 🔒 1. SECURE GATEWAY CHECKLIST AUTOMATION
let sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
if (!sessionData) {
    window.location.href = 'teacher_auth.html';
} else {
    document.getElementById('drawerFacultyName').innerText = sessionData.name;
    document.getElementById('drawerFacultyRole').innerText = `${sessionData.role} (${sessionData.subject})`;
}

function setupThemeHandler() {
    const themeToggle = document.getElementById('student-theme-toggle'); // mapped toggle indicator
    const targetToggle = themeToggle || document.getElementById('teacher-theme-toggle');
    if (!targetToggle) return;
    targetToggle.addEventListener('change', (e) => {
        body.className = e.target.checked ? 'theme-dark' : 'theme-white';
    });
}

// 📡 2. LISTEN LIVE CLOUD MATERIAL FEEDS ON LECTURES GRID TAB
function renderLecturesModule() {
    let activeFacultySubject = sessionData.subject.split(' ')[0]; // Extracts Botany/Zoology/Physics
    
    let cacheBatchesMap = {};
    const batchesRef = ref(db, BATCH_NODE_PATH);
    
    // Fetch batches index layout map safely first
    onValue(batchesRef, (bSnapshot) => {
        cacheBatchesMap = bSnapshot.val() || {};
        
        // Pull materials registry real-time node links
        const studyRef = ref(db, STUDY_NODE_PATH);
        onValue(studyRef, (sSnapshot) => {
            viewport.innerHTML = '';
            const materialsMap = sSnapshot.val();

            let headerHTML = `
                <div style="max-width:600px; margin:0 auto; padding-bottom:12px;">
                    <div style="background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000; margin-bottom: 24px;">
                        <h2 style="font-size: 20px; font-weight:900; color: var(--gold);">Faculty Lecture Grid (Cloud)</h2>
                        <p style="font-size: 13px; color: var(--text-para); margin-top: 2px;">Assigned streaming workspace node loops monitoring logs for <strong>${sessionData.name}</strong>.</p>
                    </div>
                </div>
            `;
            
            let itemsHTML = '';
            let counter = 0;

            if (materialsMap) {
                for (let key in materialsMap) {
                    let item = materialsMap[key];
                    
                    // Validation filter logic checking dynamic specialty tags rules matching
                    if (item.subject.toLowerCase() === activeFacultySubject.toLowerCase() || item.subject === "Full NEET Core") {
                        counter++;
                        let batchObj = cacheBatchesMap[item.batchId];
                        let parentCohortTitle = batchObj ? batchObj.name : 'All Cohorts Enrolled';

                        itemsHTML += `
                        <div style="max-width:600px; margin:0 auto 16px auto; background: var(--bg-surface); padding: 16px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000; position: relative;">
                            <div style="position: absolute; left:0; top:0; bottom:0; width:6px; background:var(--neon-blue);"></div>
                            <span style="font-size: 11px; font-weight: 800; background: var(--bg-input); color: var(--gold); border: 1px solid var(--border-line); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${parentCohortTitle}</span>
                            <h3 style="font-size: 18px; font-weight: 900; margin-top: 8px; color: var(--text-title);">${item.title}</h3>
                            <div style="margin-top: 10px; display: flex; gap: 10px;">
                                <a href="${item.videoUrl}" target="_blank" style="text-decoration:none; color:#000; background:var(--gold); border:var(--black-stroke); box-shadow:2px 2px 0px #000; font-size:12px; font-weight:800; padding:6px 12px; border-radius:6px;"><i class="fas fa-play"></i> Launch Stream Player</a>
                                <span style="font-size:12px; font-weight:700; color:var(--text-para); align-self:center;"><i class="fas fa-eye"></i> Scope: ${item.visibility}</span>
                            </div>
                        </div>`;
                    }
                }
            }

            if (counter === 0) {
                itemsHTML = `<div style="max-width:600px; margin:0 auto;"><p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 40px 0; background: var(--bg-surface); border: var(--black-stroke); border-radius:16px; box-shadow:4px 4px 0px #000;">No lectures distributed under your specialty code arrays matrix yet.</p></div>`;
            }

            viewport.innerHTML = headerHTML + itemsHTML;
        });
    }, { onlyOnce: true });
}

// 🎛️ 3. CORE ROUTER SWITCH SWITCHBOARD PANEL DISPATCHER INTERFACES
function switchTeacherView(target) {
    let activeFacultySubject = sessionData.subject.split(' ')[0]; 

    switch(target) {
        case 'lectures':
            renderLecturesModule();
            break;
        case 'materials':
            viewport.innerHTML = getTeacherMaterialsLayout(activeFacultySubject);
            initTeacherMaterialsLogic(activeFacultySubject);
            break;
        case 'doubts':
            viewport.innerHTML = getTeacherDoubtsLayout(activeFacultySubject);
            initTeacherDoubtsLogic(activeFacultySubject);
            break;
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        const activeTab = e.currentTarget;
        activeTab.classList.add('active-tab');
        switchTeacherView(activeTab.dataset.target);
    });
});

// Sidebar drawer triggers panel setup controls
document.getElementById('teacher-drawer-open-btn').addEventListener('click', () => {
    document.getElementById('profile-drawer').className = 'drawer-open';
    document.getElementById('drawer-overlay').classList.remove('hidden-widget');
});
const closeDrawer = () => {
    document.getElementById('profile-drawer').className = 'drawer-closed';
    document.getElementById('drawer-overlay').classList.add('hidden-widget');
};
if(document.getElementById('teacher-drawer-close-btn')) document.getElementById('teacher-drawer-close-btn').addEventListener('click', closeDrawer);
document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

document.getElementById('teacher-logout-btn').addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'teacher_auth.html';
});

// Launch Initialization Engine triggers
setupThemeHandler();
switchTeacherView('lectures');
        
