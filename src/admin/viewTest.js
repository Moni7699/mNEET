import { db, ref, set, push } from '../../config.js';
import { onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export function renderTest(canvasElement) {
    canvasElement.innerHTML = `
        <div class="card" style="padding:20px; background-color:var(--card-bg); border-radius:20px; border:1px solid var(--border-color);">
            <h3 id="formTitle" style="color:var(--accent-color); margin-bottom:15px;">Create Custom Assessment Package</h3>
            <form id="testControlForm">
                <input type="hidden" id="editTestId" value="">
                <div style="margin-bottom:15px;"><label style="display:block;font-size:11px;color:var(--muted-text);margin-bottom:5px;">Test Name</label><input type="text" id="testName" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color);" required></div>
                <div style="margin-bottom:15px;"><label style="display:block;font-size:11px;color:var(--muted-text);margin-bottom:5px;">Description</label><input type="text" id="testDesc" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color);" required></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div><label style="display:block;font-size:11px;color:var(--muted-text);margin-bottom:5px;">Price (₹)</label><input type="number" id="testPrice" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color);" required></div>
                    <div><label style="display:block;font-size:11px;color:var(--muted-text);margin-bottom:5px;">Passing %</label><input type="number" id="testPassMark" style="width:100%; padding:12px; background:var(--input-bg); border:1px solid var(--border-color); border-radius:10px; color:var(--text-color);" required></div>
                </div>
                <div style="margin-bottom:15px; background:var(--input-bg); padding:15px; border-radius:10px; border:1px solid var(--border-color);">
                    <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:10px;">Select Subjects</label>
                    <input type="checkbox" name="subjectCheck" value="Biology"> Biology &nbsp;
                    <input type="checkbox" name="subjectCheck" value="Physics"> Physics &nbsp;
                    <input type="checkbox" name="subjectCheck" value="Chemistry"> Chemistry
                </div>
                <button type="submit" id="submitFormBtn" style="width:100%; padding:14px; background:var(--accent-color); border:none; border-radius:10px; color:#0d1424; font-weight:bold; cursor:pointer;">Save Assessment Package</button>
            </form>
        </div>
        <h3 style="margin:25px 0 15px 0;">📋 Configured Test Repositories</h3>
        <div id="testCardsGrid"></div>
    `;

    const form = document.getElementById('testControlForm');
    const grid = document.getElementById('testCardsGrid');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const testId = document.getElementById('editTestId').value;
        const subs = [];
        document.querySelectorAll('input[name="subjectCheck"]:checked').forEach(cb => subs.push(cb.value));
        
        if(!subs.length) { alert("Select at least 1 subject"); return; }
        
        const payload = {
            name: document.getElementById('testName').value,
            desc: document.getElementById('testDesc').value,
            price: Number(document.getElementById('testPrice').value),
            passMark: Number(document.getElementById('testPassMark').value),
            subjects: subs, hidden: false, updatedAt: new Date().toISOString()
        };

        if(testId) await update(ref(db, `tests/${testId}`), payload);
        else await set(push(ref(db, 'tests')), payload);
        form.reset(); document.getElementById('editTestId').value = "";
    });

    onValue(ref(db, 'tests'), (snapshot) => {
        grid.innerHTML = '';
        if(snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach(id => {
                const item = data[id];
                const card = document.createElement('div');
                card.style.cssText = "background:var(--card-bg); padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;";
                card.innerHTML = `<div><h4>${item.name}</h4><p style="font-size:12px;color:var(--muted-text);">${item.desc}</p></div>
                <div><button class="del-btn" data-id="${id}" style="padding:6px 12px; background:#ef4444; color:white; border:none; border-radius:6px; cursor:pointer;">🗑️ Delete</button></div>`;
                grid.appendChild(card);
                
                card.querySelector('.del-btn').addEventListener('click', async () => {
                    if(confirm("Delete?")) await remove(ref(db, `tests/${id}`));
                });
            });
        }
    });
}

