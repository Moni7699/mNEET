const DOUBT_STORAGE_KEY = 'mneet_global_student_doubts_db';

export function getStudentDoubtsLayout() {
    return `
    <style>
        .s-doubt-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .s-doubt-card { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 30px; }
        .s-doubt-heading { text-align: center; color: var(--gold); font-size: 21px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        .s-label { display: block; font-weight: 700; margin-bottom: 6px; font-size: 13px; color: var(--text-title); }
        
        .s-input { width: 100%; padding: 12px; border: var(--black-stroke) !important; border-radius: 10px; font-size: 14px; margin-bottom: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; }
        .s-input:focus { border-color: var(--gold) !important; }
        
        .btn-dispatch-doubt { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 15px; }
        .btn-dispatch-doubt:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        .s-divider { font-size: 18px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 25px 0 20px 0; text-transform: uppercase; }
        
        /* 💬 PREMIUM STUDENT DOUBT TRACKING CARD */
        .ticket-status-card { 
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
        .ticket-bar-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background-color: var(--neon-red); }
        .ticket-bar-indicator.is-resolved { background-color: var(--neon-green); }
        
        .ticket-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; color: var(--text-para); }
        .ticket-query { font-size: 14px; font-weight: 700; color: var(--text-title); line-height: 1.4; }
        
        .ticket-solution-node { background: var(--bg-input); padding: 10px; border-radius: 8px; border: 1px solid var(--border-line); font-size: 13px; margin-top: 10px; }
        .ticket-solution-node strong { color: var(--gold); display: block; margin-bottom: 2px; }
    </style>

    <div class="s-doubt-panel">
        <div class="s-doubt-card">
            <h2 class="s-doubt-heading">Ask Instant Doubt</h2>
            <form id="studentDoubtForm">
                <label class="s-label">Select Target Department Specialty</label>
                <select id="sdSubject" class="s-input" required>
                    <option value="Botany">Botany Department</option>
                    <option value="Zoology">Zoology Department</option>
                    <option value="Physics">Physics Mechanics/Core</option>
                    <option value="Chemistry">Chemistry Modules</option>
                </select>

                <label class="s-label">Describe your core Academic Doubt / Problem Statement</label>
                <textarea id="sdQuery" class="s-input" rows="4" placeholder="Type specific chapter reference keys or problem statements clearly..." required></textarea>

                <button type="submit" class="btn-dispatch-doubt">Dispatch Ticket to Faculty</button>
            </form>
        </div>

        <h3 class="s-divider">My Doubt History Logs</h3>
        <div id="renderStudentDoubtsHistoryArea"></div>
    </div>
    `;
}

export function initStudentDoubtLogic() {
    const form = document.getElementById('studentDoubtForm');
    const container = document.getElementById('renderStudentDoubtsHistoryArea');

    function fetchState() { return JSON.parse(localStorage.getItem(DOUBT_STORAGE_KEY)) || []; }
    function saveState(arr) { localStorage.setItem(DOUBT_STORAGE_KEY, JSON.stringify(arr)); renderHistoryGrid(); }

    function renderHistoryGrid() {
        let arr = fetchState();
        container.innerHTML = '';

        if(arr.length === 0) {
            container.innerHTML = `<p style="text-align:center; opacity:0.6; font-size:13px; font-weight:700; padding: 20px 0;">No doubt queries dispatched yet.</p>`;
            return;
        }

        arr.forEach(ticket => {
            let card = document.createElement('div');
            card.className = `ticket-status-card`;
            let isResolved = ticket.reply !== null;

            card.innerHTML = `
                <div class="ticket-bar-indicator ${isResolved ? 'is-resolved' : ''}"></div>
                <div class="ticket-header">
                    <span>Subject: ${ticket.subject}</span>
                    <span style="color: ${isResolved ? 'var(--neon-green)' : 'var(--neon-red)'};">${isResolved ? 'RESOLVED' : 'PENDING'}</span>
                </div>
                <p class="ticket-query">${ticket.query}</p>
                ${isResolved ? `
                <div class="ticket-solution-node">
                    <strong>Faculty Response:</strong>
                    ${ticket.reply}
                </div>` : ''}
            `;
            container.appendChild(card);
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let arr = fetchState();

        let data = {
            id: Date.now(),
            studentName: "Tanmoy Das (Self)",
            subject: document.getElementById('sdSubject').value,
            query: document.getElementById('sdQuery').value,
            reply: null,
            timestamp: "Just Now"
        };

        arr.push(data);
        saveState(arr);
        form.reset();
    });

    renderHistoryGrid();
}

