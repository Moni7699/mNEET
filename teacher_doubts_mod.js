// Importing active Realtime Database connection parameters from config layer
import { db, ref, set, push, onValue, remove } from './firebase-config.js';

const DOUBT_NODE_PATH = 'mneet_global_student_doubts_db';

export function getTeacherDoubtsLayout(facultySubject) {
    return `
    <style>
        .t-doubt-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .t-doubt-hero { background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 24px; }
        .t-doubt-hero h2 { font-size: 20px; font-weight: 900; color: var(--gold); text-transform: uppercase; }
        .t-doubt-hero p { font-size: 13px; color: var(--text-para); margin-top: 2px; }
        
        .t-divider { font-size: 16px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 20px 0 15px 0; text-transform: uppercase; color: var(--text-title); }
        
        .doubt-resolver-card { 
            background: var(--bg-surface) !important; 
            color: var(--text-title) !important;
            border: var(--black-stroke); 
            border-radius: 16px; 
            padding: 16px; 
            margin-bottom: 16px; 
            box-shadow: 4px 4px 0px #000000; 
            position: relative;
            overflow: hidden;
        }
        .doubt-status-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background-color: var(--neon-red); }
        .doubt-status-bar.is-resolved { background-color: var(--neon-green); }
        
        .doubt-meta-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; text-transform: uppercase; border-bottom: 1px dashed var(--border-line); padding-bottom: 6px; margin-bottom: 10px; color: var(--text-para); }
        .doubt-body-text { font-size: 14px; font-weight: 700; line-height: 1.4; color: var(--text-title); margin-bottom: 12px; }
        
        .faculty-reply-box { background: var(--bg-input); padding: 10px; border-radius: 8px; border: 1px solid var(--border-line); font-size: 13px; margin-top: 10px; }
        .faculty-reply-box strong { color: var(--gold); display: block; margin-bottom: 2px; }
        
        .reply-input-ctrl { width: 100%; padding: 10px; border: var(--black-stroke) !important; border-radius: 8px; font-size: 13px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; margin-top: 10px; }
        .btn-resolve-trigger { background: var(--gold) !important; color: #000 !important; font-weight: 900; border: var(--black-stroke); padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; text-transform: uppercase; box-shadow: 2px 2px 0px #000; margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; }
    </style>

    <div class="t-doubt-panel">
        <div class="t-doubt-hero">
            <h2>Doubt Resolution Desk</h2>
            <p>Real-time academic ticket query router stream cloud sync filtered under: <strong>${facultySubject} Core</strong>.</p>
        </div>

        <h3 class="t-divider">Pending Student Tickets</h3>
        <div id="renderPendingDoubtsContainer"></div>

        <h3 class="t-divider" style="margin-top: 30px;">Resolved History</h3>
        <div id="renderResolvedDoubtsContainer"></div>
    </div>
    `;
}

export function initTeacherDoubtsLogic(facultySubject) {
    const pendingContainer = document.getElementById('renderPendingDoubtsContainer');
    const resolvedContainer = document.getElementById('renderResolvedDoubtsContainer');

    // ☁️ 1. LISTEN TO CLOUD STUDENT DOUBTS MATRIX
    const doubtsRef = ref(db, DOUBT_NODE_PATH);
    onValue(doubtsRef, (snapshot) => {
        pendingContainer.innerHTML = '';
        resolvedContainer.innerHTML = '';
        const dataMap = snapshot.val();

        if (!dataMap) {
            pendingContainer.innerHTML = `<p style="text-align:center; opacity:0.5; font-size:12px; padding:15px 0; font-weight:700;">Clean desk! No dynamic pending doubt tokens registered on server.</p>`;
            resolvedContainer.innerHTML = `<p style="text-align:center; opacity:0.5; font-size:12px; padding:15px 0; font-weight:700;">No query resolution log blueprint history tracked.</p>`;
            return;
        }

        let pendingCount = 0;
        let resolvedCount = 0;

        for (let key in dataMap) {
            let ticket = dataMap[key];
            
            // Filtering ticket array logs matching this teacher subject profile logic configuration rules
            if (ticket.subject.toLowerCase() === facultySubject.toLowerCase()) {
                let card = document.createElement('div');
                card.className = `doubt-resolver-card`;

                if (!ticket.reply) {
                    pendingCount++;
                    card.innerHTML = `
                        <div class="doubt-status-bar"></div>
                        <div class="doubt-meta-header">
                            <span>Student: ${ticket.studentName}</span>
                            <span>${ticket.timestamp || 'Just Now'}</span>
                        </div>
                        <p class="doubt-body-text">${ticket.query}</p>
                        <div>
                            <textarea class="reply-input-ctrl" id="rawReplyField_${key}" rows="2" placeholder="Type verified explanations solutions..."></textarea>
                            <button class="btn-resolve-trigger act-submit-reply" data-firebase-key="${key}"><i class="fas fa-paper-plane"></i> Dispatch Resolution</button>
                        </div>
                    `;
                    pendingContainer.appendChild(card);
                } else {
                    resolvedCount++;
                    card.innerHTML = `
                        <div class="doubt-status-bar is-resolved"></div>
                        <div class="doubt-meta-header">
                            <span>Student: ${ticket.studentName}</span>
                            <span>Resolved Protocol Mapped</span>
                        </div>
                        <p class="doubt-body-text" style="opacity:0.75; font-weight:500;">${ticket.query}</p>
                        <div class="faculty-reply-box">
                            <strong>Your Solution Key Response:</strong>
                            ${ticket.reply}
                        </div>
                    `;
                    resolvedContainer.appendChild(card);
                }
            }
        }

        if (pendingCount === 0) pendingContainer.innerHTML = `<p style="text-align:center; opacity:0.5; font-size:12px; padding:15px 0; font-weight:700;">Clean desk! No pending doubt tokens.</p>`;
        if (resolvedCount === 0) resolvedContainer.innerHTML = `<p style="text-align:center; opacity:0.5; font-size:12px; padding:15px 0; font-weight:700;">No query resolution log footprint history.</p>`;
    });

    // 📤 2. MUTATION WRITE OPERATIONS DISPATCH BACK RESPONSE TO ONLINE DATABASE SERVER TREE NODE
    document.addEventListener('click', function(e) {
        let btn = e.target.closest('.act-submit-reply');
        if (!btn) return;
        let firebaseKey = btn.dataset.firebaseKey;
        let textVal = document.getElementById(`rawReplyField_${firebaseKey}`).value.trim();

        if (textVal === "") {
            alert("Explanation query parameter block data text payload cannot be dispatched empty!");
            return;
        }

        // Apply targeted specific updates inside existing doubt data cluster path
        const replyUpdateRef = ref(db, `${DOUBT_NODE_PATH}/${firebaseKey}/reply`);
        set(replyUpdateRef, textVal).then(() => {
            console.log(`Dispatched verification tokens payload to key node: ${firebaseKey}`);
        });
    });
            }
