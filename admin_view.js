import { getBatchesLayout, initBatchesLogic } from './admin_batches_mod.js';

const viewport = document.getElementById('admin-main-render-area');
const tabs = document.querySelectorAll('.dashboard-footer .footer-tab');

// Main Router Hub mapping module layouts dynamically
async function switchAdminView(target) {
    viewport.innerHTML = ''; 
    
    switch(target) {
        case 'home':
            try {
                const mod = await import('./admin_home_mod.js');
                viewport.innerHTML = mod.getHomeLayout();
                if(mod.initHomeLogic) mod.initHomeLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Home Admin Module Render Failed. File 'admin_home_mod.js' create korun.</div>`; }
            break;

        case 'batches':
            // Renders our deep burgundy with black stroke validated setup
            viewport.innerHTML = getBatchesLayout();
            initBatchesLogic();
            break;

        case 'study':
            try {
                const mod = await import('./admin_study_mod.js');
                viewport.innerHTML = mod.getStudyLayout();
                if(mod.initStudyLogic) mod.initStudyLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Study Engine Module Render Failed. File 'admin_study_mod.js' create korun.</div>`; }
            break;

        case 'test':
            try {
                const mod = await import('./admin_test_mod.js');
                viewport.innerHTML = mod.getTestLayout();
                if(mod.initTestLogic) mod.initTestLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Test Series Module Render Failed. File 'admin_test_mod.js' create korun.</div>`; }
            break;

        case 'mstore':
            try {
                const mod = await import('./admin_mstore_mod.js');
                viewport.innerHTML = mod.getMStoreLayout();
                if(mod.initMStoreLogic) mod.initMStoreLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>mStore Upload Module Render Failed. File 'admin_mstore_mod.js' create korun.</div>`; }
            break;

        case 'students':
            try {
                const mod = await import('./admin_students_mod.js');
                viewport.innerHTML = mod.getStudentsLayout();
                if(mod.initStudentsLogic) mod.initStudentsLogic();
            } catch(e) { viewport.innerHTML = `<div style='padding:20px;'>Student Control Panel Module Ready State Pending. File 'admin_students_mod.js' create korun.</div>`; }
            break;

        default:
            viewport.innerHTML = `<div style='padding:20px;'>Module not found.</div>`;
    }
}

// Event Listeners setup for Tabs active toggles
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        const activeTab = e.currentTarget;
        activeTab.classList.add('active-tab');
        switchAdminView(activeTab.dataset.target);
    });
});

// Sidebar Drawer Control Triggers
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

// Run Initial default load view state
switchAdminView('home');
