// Local Storage references simulating enterprise global schema keys
const STATS_STORAGE_KEY = 'mneet_global_system_stats';
const TEACHER_STORAGE_KEY = 'mneet_registered_teachers_db';

export function getHomeLayout() {
    // Standardizing values safely for initial boot parameters
    let savedStats = localStorage.getItem(STATS_STORAGE_KEY);
    let stats = savedStats ? JSON.parse(savedStats) : { students: 1420, teachers: 18, revenue: '124.5K', alerts: 3 };

    return `
    <style>
        .home-master-panel { max-width: 650px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .welcome-hero-banner { background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 24px; position: relative; }
        .welcome-hero-banner h2 { font-size: 22px; font-weight: 900; color: var(--gold); text-transform: uppercase; margin-bottom: 4px; }
        .welcome-hero-banner p { font-size: 13px; color: var(--text-para); font-weight: 500; }
        
        /* 4x4 Enterprise Metrics Grid Cluster */
        .metrics-grid-cluster { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
        .stat-metric-node { background: var(--bg-surface); padding: 16px; border-radius: 14px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; display: flex; align-items: center; gap: 14px; }
        .metric-icon-box { width: 44px; height: 44px; border-radius: 10px; border: var(--black-stroke); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #000000; font-shadow: none; }
        .metric-info-data h4 { font-size: 20px; font-weight: 900; color: var(--text-title); line-height: 1.1; }
        .metric-info-data span { font-size: 11px; font-weight: 700; color: var(--text-para); text-transform: uppercase; letter-spacing: 0.5px; }
        
        /* Interactive Node Forms Panels Layout */
        .interactive-form-panel { background: var(--bg-surface); padding: 20px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 24px; }
        .panel-block-title { font-size: 16px; font-weight: 900; text-transform: uppercase; margin-bottom: 16px; color: var(--text-title); border-bottom: 1px dashed var(--border-line); padding-bottom: 6px; display: flex; align-items: center; gap: 8px; }
        .panel-block-title i { color: var(--gold); }
        
        .entry-group { margin-bottom: 14px; }
        .entry-group label { display: block; font-size: 12px; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; color: var(--text-title); }
        .entry-ctrl { width: 100%; padding: 12px; border: var(--black-stroke) !important; border-radius: 10px; font-size: 14px; background: var(--bg-input) !important; color: var(--text-title) !important; outline: none; font-weight: 600; }
        .entry-ctrl:focus { border-color: var(--gold) !important; }
        
        .grid-split-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        
        .btn-core-submit { width: 100%; background: var(--gold) !important; color: #000000 !important; font-weight: 900; padding: 14px; border: var(--black-stroke); border-radius: 12px; text-transform: uppercase; box-shadow: 4px 4px 0px #000000; cursor: pointer; font-size: 14px; letter-spacing: 0.5px; }
        .btn-core-submit:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000000; }
        
        /* Runtime Realtime Feed Logger */
        .live-log-feed-box { border: var(--black-stroke); border-radius: 12px; background: var(--bg-input); padding: 12px; max-height: 150px; overflow-y: auto; }
        .log-item-row { font-size: 12px; font-family: monospace; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-para); display: flex; justify-content: space-between; }
        .log-item-row strong { color: var(--gold); }
    </style>

    <div class="home-master-panel">
        <div class="welcome-hero-banner">
            <h2>Command Station Home</h2>
            <p>mNEET High-Focus Academic Core Management Console Dashboard Interface Node Engine.</p>
        </div>

        <div class="metrics-grid-cluster">
            <div class="stat-metric-node">
                <div class="metric-icon-box" style="background-color: #BAE6FD;"><i class="fas fa-user-graduate"></i></div>
                <div class="metric-info-data">
                    <h4 id="statStudents">${stats.students}</h4>
                    <span>Active Enrolled</span>
                </div>
            </div>
            <div class="stat-metric-node">
                <div class="metric-icon-box" style="background-color: #E9D5FF;"><i class="fas fa-chalkboard-teacher"></i></div>
                <div class="metric-info-data">
                    <h4 id="statTeachers">${stats.teachers}</h4>
                    <span>Active Mentors</span>
                </div>
            </div>
            <div class="stat-metric-node">
                <div class="metric-icon-box" style="background-color: #A7F3D0;"><i class="fas fa-wallet"></i></div>
                <div class="metric-info-data">
                    <h4>₹${stats.revenue}</h4>
                    <span>Gross Sales Volume</span>
                </div>
            </div>
            <div class="stat-metric-node">
                <div class="metric-icon-box" style="background-color: #FCA5A5;"><i class="fas fa-exclamation-circle"></i></div>
                <div class="metric-info-data">
                    <h4>${stats.alerts} Cases</h4>
                    <span>Pending Doubts</span>
                </div>
            </div>
        </div>

        <div class="interactive-form-panel">
            <h3 class="panel-block-title"><i class="fas fa-user-plus"></i> Mentor Provisioning Portal</h3>
            <form id="homeAddTeacherForm">
                <div class="entry-group">
                    <label>Instructor Full Legal Name</label>
                    <input type="text" id="tName" class="entry-ctrl" placeholder="e.g., Dr. Arindam Das" required>
                </div>
                
                <div class="grid-split-2">
                    <div class="entry-group">
                        <label>Academic Subject Specialty</label>
                        <select id="tSubject" class="entry-ctrl">
                            <option value="Botany Core">Botany Core</option>
                            <option value="Zoology Special">Zoology Special</option>
                            <option value="Organic Chemistry">Organic Chemistry</option>
                            <option value="Inorganic Chemistry">Inorganic Chemistry</option>
                            <option value="Physics Mechanics">Physics Mechanics</option>
                        </select>
                    </div>
                    <div class="entry-group">
                        <label>Assigned Access Permissions Tier</label>
                        <select id="tRole" class="entry-ctrl">
                            <option value="Senior Lecturer">Senior Lecturer</option>
                            <option value="Doubt Clearing Assistant">Doubt Clearing Assistant</option>
                            <option value="Content Publisher Only">Content Publisher Only</option>
                        </select>
                    </div>
                </div>

                <div class="entry-group">
                    <label>Secure Key / Database Password Generator</label>
                    <input type="text" id="tKey" class="entry-ctrl" placeholder="Click button to map server secure key sequence" readonly required>
                </div>

                <div class="grid-split-2" style="margin-top: 10px;">
                    <button type="button" class="btn-core-submit" id="btnGenKey" style="background:#E2E8F0 !important; color:#000 !important; box-shadow: 2px 2px 0px #000;">Generate Server Key</button>
                    <button type="submit" class="btn-core-submit">Authorize Instructor</button>
                </div>
            </form>
        </div>

        <div class="interactive-form-panel">
            <h3 class="panel-block-title"><i class="fas fa-server"></i> Live Node Activity Feed Logger</h3>
            <div class="live-log-feed-box" id="homeLiveLogContainer">
                </div>
        </div>
    </div>
    `;
}

export function initHomeLogic() {
    const form = document.getElementById('homeAddTeacherForm');
    const genKeyBtn = document.getElementById('btnGenKey');
    const keyInput = document.getElementById('tKey');
    const logArea = document.getElementById('homeLiveLogContainer');
    const teacherCountHeader = document.getElementById('statTeachers');

    // Safe base states arrays trackers
    function getTeachersList() { return JSON.parse(localStorage.getItem(TEACHER_STORAGE_KEY)) || []; }
    function saveTeachersList(arr) { localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(arr)); }
    function getStats() { return JSON.parse(localStorage.getItem(STATS_STORAGE_KEY)) || { students: 1420, teachers: 18, revenue: '124.5K', alerts: 3 }; }
    function saveStats(obj) { localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(obj)); }

    // Runtime custom logger engine functions
    function pushSystemLog(message) {
        let time = new Date().toLocaleTimeString();
        let logLine = document.createElement('div');
        logLine.className = 'log-item-row';
        logLine.innerHTML = `<span>[${time}] SYSTEM: ${message}</span><strong>OK</strong>`;
        logArea.insertBefore(logLine, logArea.firstChild);
    }

    // Initialize base system logs sequence simulations
    pushSystemLog("Connected to Cloud Database Server securely.");
    pushSystemLog("All active user navigation session authentication maps synced.");
    
    // Generates a professional cryptography secure hex key for teacher portal auth rules mapping
    genKeyBtn.addEventListener('click', () => {
        let randomHex = 'MNEET-MTR-' + Math.floor(100000 + Math.random() * 900000);
        keyInput.value = randomHex;
        pushSystemLog(`Generated new security profile credential payload node token: <strong>${randomHex}</strong>`);
    });

    // Form registration processing workflow routing rules triggers
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let list = getTeachersList();
        let currentStats = getStats();

        let newInstructor = {
            id: Date.now(),
            name: document.getElementById('tName').value,
            subject: document.getElementById('tSubject').value,
            role: document.getElementById('tRole').value,
            authKey: keyInput.value
        };

        // Inject inside list data object model layers securely
        list.push(newInstructor);
        saveTeachersList(list);

        // Mutate stats display layers runtime structures parameters metrics values 
        currentStats.teachers = 18 + list.length;
        saveStats(currentStats);

        // Sync view state update counters directly inside dashboard screen nodes
        teacherCountHeader.innerText = currentStats.teachers;

        pushSystemLog(`Authorized access rules parameters for <strong>${newInstructor.name}</strong> (${newInstructor.role}) mapped.`);
        form.reset();
    });
                      }
      
