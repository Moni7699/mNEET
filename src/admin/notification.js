import { db, ref } from '../../config.js';
import { onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export function initNotification() {
    const target = document.getElementById('notification-tray-target');
    target.innerHTML = `
        <div id="notiTray" style="position:fixed; top:65px; left:10px; width:300px; max-height:400px; background-color:var(--card-bg); z-index:150; border-radius:15px; border:1px solid var(--border-color); box-shadow:0 10px 25px rgba(0,0,0,0.3); display:none; overflow-y:auto; padding:15px;">
            <h4 style="margin-bottom:10px; color:var(--accent-color);">Live Alerts</h4>
            <div id="notiContainer"><div style="font-size:12px;color:var(--muted-text);">Loading notifications...</div></div>
        </div>
    `;

    const notiBtn = document.getElementById('notiBtn');
    const notiTray = document.getElementById('notiTray');

    notiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notiTray.style.display = notiTray.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { notiTray.style.display = 'none'; });
    notiTray.addEventListener('click', (e) => e.stopPropagation());

    onValue(ref(db, 'users'), (snapshot) => {
        const container = document.getElementById('notiContainer');
        container.innerHTML = '';
        if(snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach(id => {
                const u = data[id];
                if(u.role === 'student') {
                    const item = document.createElement('div');
                    item.style.cssText = "padding:10px; border-bottom:1px solid var(--border-color); font-size:12px;";
                    item.innerHTML = `🎓 <b>${u.name}</b> registered from ${u.city || 'India'}`;
                    container.appendChild(item);
                }
            });
        } else {
            container.innerHTML = '<div style="font-size:12px;color:var(--muted-text);">No alerts found</div>';
        }
    });
            }
