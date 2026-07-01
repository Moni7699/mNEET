const viewport = document.getElementById('teacher-main-render-area');
const tabs = document.querySelectorAll('.dashboard-footer .footer-tab');
const body = document.body;
const SESSION_KEY = 'mneet_teacher_logged_session';
const STUDY_STORAGE_KEY = 'mneet_batch_study_materials';
const BATCH_STORAGE_KEY = 'mneet_managed_batches';

// Verification security gateway checklist check routine
let sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
if (!sessionData) {
    window.location.href = 'teacher_auth.html';
} else {
    document.getElementById('drawerFacultyName').innerText = sessionData.name;
    document.getElementById('drawerFacultyRole').innerText = `${sessionData.role} (${sessionData.subject})`;
}

function setupThemeHandler() {
    const themeToggle = document.getElementById('teacher-theme-toggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('change', (e) => {
        body.className = e.target.checked ? 'theme-dark' : 'theme-white';
    });
}

function renderLecturesModule() {
    let materials = JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY)) || [];
    let batches = JSON.parse(localStorage.getItem(BATCH_STORAGE_KEY)) || [];
    
    // Filtering items only belonging to this teacher's specialty subject cluster mapping
    let activeFacultySubject = sessionData.subject.split(' ')[0]; // Extract Botany/Zoology/Physics
    let filteredList = materials.filter(m => m.subject.toLowerCase() === activeFacultySubject.toLowerCase() || m.subject === "Full NEET Core");

    let itemsHTML = filteredList.map(item => {
        let batch = batches.find(b => b.id == item.batchId);
        return `
        <div style="background: var(--bg-surface); padding: 16px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000; margin-bottom: 16px; position: relative;">
            <div style="position: absolute; left:0; top:0; bottom:0; width:6px; background:var(--neon-blue);"></div>
            <span style="font-size: 11px; font-weight: 800; background: var(--bg-input); color: var(--gold); border: 1px solid var(--border-line); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${batch ? batch.name : 'All Cohorts'}</span>
            <h3 style="font-size: 18px; font-weight: 900; margin-top: 8px; color: var(--text-title);">${item.title}</h3>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <a href="${item.videoUrl}" target="_blank" style="text-decoration:none; color:#000; background:var(--gold); border:var(--black-stroke); box-shadow:2px 2px 0px #000; font-size:12px; font-weight:800; padding:6px 12px; border-radius:6px;"><i class="fas fa-play"></i> Stream</a>
                <span style="font-size:12px; font-weight:700; color:var(--text-para); align-self:center;"><i class="fas fa-eye"></i> Visibility: ${item.visibility || 'Live'}</span>
            </div>
        </div>`;
    }).join('');

    if(filteredList.length === 0) {
        itemsHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 40px 0;">No lectures distributed under your topic specialty codes.</p>`;
    }

    viewport.innerHTML = `
        <div style="max-width:600px; margin:0 auto; padding-bottom:40px;">
            <div style="background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000; margin-bottom: 24px;">
                <h2 style="font-size: 20px; font-weight:900; color: var(--gold);">Faculty Lecture Grid</h2>
                <p style="font-size: 13px; color: var(--text-para); margin-top: 2px;">Assigned workspace monitoring loops for <strong>${sessionData.name}</strong>.</p>
            </div>
            ${itemsHTML}
        </div>
    `;
}

function switchTeacherView(target) {
    viewport.innerHTML = '';
    switch(target) {
        case 'lectures':
            renderLecturesModule();
            break;
        case 'materials':
            viewport.innerHTML = `<div style="padding:20px; font-weight:700;">Step 2.3: Study Materials Locker Module Loading UI...</div>`;
            break;
        case 'doubts':
            viewport.innerHTML = `<div style="padding:20px; font-weight:700;">Step 2.4: Faculty Student Doubt Desk Resolver Module Loading UI...</div>`;
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

// Sidebar drawer triggers
document.getElementById('teacher-drawer-open-btn').addEventListener('click', () => {
    document.getElementById('profile-drawer').className = 'drawer-open';
    document.getElementById('drawer-overlay').classList.remove('hidden-widget');
});
const closeDrawer = () => {
    document.getElementById('profile-drawer').className = 'drawer-closed';
    document.getElementById('drawer-overlay').classList.add('hidden-widget');
};
document.getElementById('teacher-drawer-close-btn').addEventListener('click', closeDrawer);
document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

document.getElementById('teacher-logout-btn').addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'teacher_auth.html';
});

// Default Load initialization
setupThemeHandler();
switchTeacherView('lectures');
      
