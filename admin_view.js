import { getBatchesLayout, initBatchesLogic } from './admin_batches_mod.js';

const viewport = document.getElementById('admin-main-render-area');
const tabs = document.querySelectorAll('.dashboard-footer .footer-tab');
const body = document.body;

function setupThemeHandler() {
    const themeToggle = document.getElementById('admin-theme-toggle');
    if (!themeToggle) return;

    // Direct active detection loop
    if(themeToggle.checked) {
        body.className = 'theme-dark';
    } else {
        body.className = 'theme-white';
    }

    themeToggle.addEventListener('change', (e) => {
        if(e.target.checked) {
            body.className = 'theme-dark';
        } else {
            body.className = 'theme-white';
        }
    });
}

async function switchAdminView(target) {
    viewport.innerHTML = ''; 
    
    switch(target) {
        case 'home':
            viewport.innerHTML = `<div style="padding:20px; font-weight:700;">Welcome to mNEET Home Control Station.</div>`;
            break;

        case 'batches':
            viewport.innerHTML = getBatchesLayout();
            initBatchesLogic();
            break;

        case 'study':
            viewport.innerHTML = `<div style="padding:20px; font-weight:700;">Study Engine Dashboard Module Loading...</div>`;
            break;

        case 'test':
            viewport.innerHTML = `<div style="padding:20px; font-weight:700;">Test Series Question Bank Module Loading...</div>`;
            break;

        case 'mstore':
            viewport.innerHTML = `<div style="padding:20px; font-weight:700;">mStore E-commerce Manager Module Loading...</div>`;
            break;

        case 'students':
            viewport.innerHTML = `<div style="padding:20px; font-weight:700;">Student Ranks & Access Control Panel Loading...</div>`;
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

// Fire systems safely
setupThemeHandler();
switchAdminView('home');
