import { getBatchesLayout, initBatchesLogic } from './admin_batches_mod.js';

const viewport = document.getElementById('admin-main-render-area');
const tabs = document.querySelectorAll('.dashboard-footer .footer-tab');
const body = document.body;
const themeToggle = document.getElementById('admin-theme-toggle');

// Pure Theme Router Dynamic Switch Engine
function applyTheme(isDark) {
    if(isDark) {
        body.className = 'theme-dark';
        themeToggle.checked = true;
    } else {
        body.className = 'theme-white';
        themeToggle.checked = false;
    }
}

// Event trigger configuration for real-time toggle
themeToggle.addEventListener('change', (e) => {
    applyTheme(e.target.checked);
});

async function switchAdminView(target) {
    viewport.innerHTML = ''; 
    
    switch(target) {
        case 'home':
            try {
                const mod = await import('./admin_home_mod.js');
                viewport.innerHTML = mod.getHomeLayout();
                if(mod.initHomeLogic) mod.initHomeLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Home Admin Module Render.</div>`; }
            break;

        case 'batches':
            viewport.innerHTML = getBatchesLayout();
            initBatchesLogic();
            break;

        case 'study':
            try {
                const mod = await import('./admin_study_mod.js');
                viewport.innerHTML = mod.getStudyLayout();
                if(mod.initStudyLogic) mod.initStudyLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Study Engine.</div>`; }
            break;

        case 'test':
            try {
                const mod = await import('./admin_test_mod.js');
                viewport.innerHTML = mod.getTestLayout();
                if(mod.initTestLogic) mod.initTestLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Test Series.</div>`; }
            break;

        case 'mstore':
            try {
                const mod = await import('./admin_mstore_mod.js');
                viewport.innerHTML = mod.getMStoreLayout();
                if(mod.initMStoreLogic) mod.initMStoreLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>mStore Upload.</div>`; }
            break;

        case 'students':
            try {
                const mod = await import('./admin_students_mod.js');
                viewport.innerHTML = mod.getStudentsLayout();
                if(mod.initStudentsLogic) mod.initStudentsLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Student Panel.</div>`; }
            break;
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        const activeTab = e.currentTarget;
        activeTab.classList.add('active-tab');
        switchAdminView(activeTab.dataset.target);
    });
});

document.getElementById('admin-drawer-open-btn').addEventListener('click', () => {
    document.getElementById('profile-drawer').className = 'drawer-open';
    document.getElementById('drawer-overlay').classList.remove('hidden-widget');
});

const closeDrawer = () => {
    document.getElementById('profile-drawer').className = 'drawer-closed';
    document.getElementById('drawer-overlay').classList.add('hidden-widget');
};
document.getElementById('admin-drawer-close-btn').addEventListener('click', closeDrawer);
document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

// Default Load Configurations
applyTheme(true); 
switchAdminView('home');
                    
