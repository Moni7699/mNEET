import { db, ref } from '../../config.js';
import { onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let savedGlobalTestId = localStorage.getItem('activeTestContextTokenId') || "";

export function getSelectedTestId() { return savedGlobalTestId; }

export function renderHome(canvasElement) {
    canvasElement.innerHTML = `
        <div class="card" style="border-left:5px solid var(--accent-color); padding:20px; background-color:var(--card-bg); border-radius:20px; border:1px solid var(--border-color);">
            <h2>Welcome Back Admin</h2>
            <p style="color:var(--muted-text); margin-top:5px;">Configure your workspace by selecting the active test instance below.</p>
            <div style="margin-top:20px; background-color:var(--input-bg); padding:15px; border-radius:12px; border:1px solid var(--border-color);">
                <label style="display:block; font-size:11px; color:var(--muted-text); text-transform:uppercase; font-weight:bold; margin-bottom:8px;">Select Active Target Test Instance</label>
                <select id="globalTestSelector" style="width:100%; padding:12px; background-color:var(--bg-color); border:1px solid var(--border-color); border-radius:8px; color:var(--text-color); font-weight:bold; font-size:14px; outline:none;">
                    <option value="">-- No Active Test Selected (Select to Unlock App Routes) --</option>
                </select>
                <p id="selectorAlert" style="font-size:11px; color:#ef4444; margin-top:8px; font-weight:500;">⚠️ Question, NCERT, and Student systems will lock to this specific test context.</p>
            </div>
        </div>
    `;

    const selector = document.getElementById('globalTestSelector');
    const alertBox = document.getElementById('selectorAlert');

    selector.addEventListener('change', (e) => {
        savedGlobalTestId = e.target.value;
        localStorage.setItem('activeTestContextTokenId', savedGlobalTestId);
        if(savedGlobalTestId) {
            alertBox.style.color = "#22c55e"; alertBox.textContent = `🚀 Pipeline Active: Context locked to selected test node`;
        } else {
            alertBox.style.color = "#ef4444"; alertBox.textContent = "⚠️ Question, NCERT, and Student systems will lock to this specific test context.";
        }
    });

    onValue(ref(db, 'tests'), (snapshot) => {
        selector.innerHTML = '<option value="">-- No Active Test Selected (Select to Unlock App Routes) --</option>';
        if(snapshot.exists()){
            const data = snapshot.val();
            Object.keys(data).forEach(id => {
                const opt = document.createElement('option');
                opt.value = id; opt.textContent = data[id].name;
                selector.appendChild(opt);
            });
            selector.value = savedGlobalTestId;
            if(savedGlobalTestId) selector.dispatchEvent(new Event('change'));
        }
    });
                              }
