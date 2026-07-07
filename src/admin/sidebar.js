import { auth } from '../../config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function initSidebar() {
    const target = document.getElementById('sidebar-drawer-target');
    target.innerHTML = `
        <div id="profileSidebar" style="position:fixed; top:0; right:-320px; width:320px; height:100vh; background-color:var(--card-bg); z-index:200; box-shadow:-5px 0 25px rgba(0,0,0,0.3); transition:right 0.3s ease; overflow-y:auto; padding:30px 20px; border-left:1px solid var(--border-color);">
            <h3 style="margin-bottom:20px; color:var(--accent-color); display:flex; justify-content:space-between;">Control Menu <span id="closeSidebar" style="cursor:pointer;">✕</span></h3>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding:12px; background-color:var(--input-bg); border-radius:10px;">
                <span style="font-size:13px; font-weight:600;">App UI View Mode</span>
                <button id="themeToggleBtn" style="font-size:14px; background:var(--bg-color); color:var(--text-color); border:1px solid var(--border-color); padding:5px 10px; border-radius:6px; cursor:pointer;">🌓 Toggle</button>
            </div>
            <div style="margin-bottom:15px;"><label style="display:block; font-size:11px; color:var(--muted-text); margin-bottom:5px; text-transform:uppercase;">Admin Name</label><input type="text" id="adminName" placeholder="Admin Full Name" style="width:100%; padding:12px; background-color:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color); outline:none;"></div>
            <div style="margin-bottom:15px;"><label style="display:block; font-size:11px; color:var(--muted-text); margin-bottom:5px; text-transform:uppercase;">Profile Image URL</label><input type="text" id="adminPhoto" placeholder="Link to photo file" style="width:100%; padding:12px; background-color:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color); outline:none;"></div>
            <div style="margin-bottom:15px;"><label style="display:block; font-size:11px; color:var(--muted-text); margin-bottom:5px; text-transform:uppercase;">Target Exam Date</label><input type="date" id="targetExamDate" style="width:100%; padding:12px; background-color:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color); outline:none;"></div>
            <div style="margin-bottom:15px;"><label style="display:block; font-size:11px; color:var(--muted-text); margin-bottom:5px; text-transform:uppercase;">Dream Medical College</label><input type="text" id="dreamCollege" placeholder="AIIMS New Delhi" style="width:100%; padding:12px; background-color:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color); outline:none;"></div>
            <hr style="border:0; border-top:1px solid var(--border-color); margin:20px 0;">
            <a href="#" target="_blank" style="display:block; color:var(--accent-color); margin:10px 0; text-decoration:none; font-size:13px;">📺 YouTube Channel</a>
            <a href="#" target="_blank" style="display:block; color:var(--accent-color); margin:10px 0; text-decoration:none; font-size:13px;">✈️ Telegram Channel</a>
            <button id="logoutBtn" style="width:100%; padding:12px; background-color:#ef4444; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold; margin-top:20px;">LOGOUT</button>
        </div>
    `;

    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('profileSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    menuBtn.addEventListener('click', () => sidebar.style.right = '0px');
    closeSidebar.addEventListener('click', () => sidebar.style.right = '-320px');

    themeToggleBtn.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if(confirm("Logout?")) { await signOut(auth); window.location.href = "index.html"; }
    });
          }

