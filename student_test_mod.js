const TEST_STORAGE_KEY = 'mneet_batch_test_series';

export function getStudentTestLayout() {
    return `
    <style>
        .s-test-panel { max-width: 600px; margin: 0 auto; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; }
        .s-test-hero { background: var(--bg-surface); padding: 18px; border-radius: 16px; border: var(--black-stroke); box-shadow: 4px 4px 0px #000000; margin-bottom: 24px; }
        .s-test-hero h2 { font-size: 20px; font-weight: 900; color: var(--gold); text-transform: uppercase; }
        .s-test-hero p { font-size: 13px; color: var(--text-para); margin-top: 2px; }
        
        .s-divider { font-size: 16px; font-weight: 900; border-bottom: var(--black-stroke); padding-bottom: 6px; margin: 20px 0 15px 0; text-transform: uppercase; color: var(--text-title); }
        
        /* 📝 STUDENT LIVE EXAM SHEET COMPONENT */
        .live-exam-card { 
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
        .exam-left-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background-color: var(--gold); }
        .exam-title { font-size: 18px; font-weight: 900; margin-bottom: 6px; }
        .exam-syllabus-tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; background: var(--burgundy); color: #fff; border: 1px solid rgba(0,0,0,0.15); margin-bottom: 10px; text-transform: uppercase; }
        
        .exam-meta-flex { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; font-weight: 700; color: var(--text-para); margin-bottom: 14px; padding-top: 8px; border-top: 1px dashed var(--border-line); }
        .exam-meta-node { display: flex; align-items: center; gap: 6px; }
        .exam-meta-node i { color: var(--gold); }
        
        .btn-launch-exam { background: var(--gold) !important; color: #000 !important; font-weight: 900; border: var(--black-stroke); padding: 10px 16px; border-radius: 10px; cursor: pointer; font-size: 13px; text-transform: uppercase; box-shadow: 3px 3px 0px #000; display: inline-flex; align-items: center; gap: 6px; }
        .btn-launch-exam:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0px #000; }
    </style>

    <div class="s-test-panel">
        <div class="s-test-hero">
            <h2>National Mock Test Arena</h2>
            <p>Strict parameter exam simulation desk with configured negative markings rules protocols.</p>
        </div>

        <h3 class="s-divider">Available Mock Papers</h3>
        <div id="renderStudentLiveTestsArea"></div>
    </div>
    `;
}

export function initStudentTestLogic() {
    const container = document.getElementById('renderStudentLiveTestsArea');

    function fetchState() { return JSON.parse(localStorage.getItem(TEST_STORAGE_KEY)) || []; }

    function renderExamConsole() {
        let arr = fetchState();
        container.innerHTML = '';

        if(arr.length === 0) {
            // Default automated fallback seed display rules parameters if admin queue clear
            container.innerHTML = `
                <div class="live-exam-card">
                    <div class="exam-left-accent"></div>
                    <span class="exam-syllabus-tag">Full NEET Core Syllabus</span>
                    <h3 class="exam-title">All India mNEET Practice Test - 01</h3>
                    <div class="exam-meta-flex">
                        <div class="exam-meta-node"><i class="fas fa-clock"></i> 180 Minutes</div>
                        <div class="exam-meta-node"><i class="fas fa-check-double"></i> 200 Questions</div>
                        <div class="exam-meta-node"><i class="fas fa-award"></i> Rules: +4 / -1 Scheme</div>
                    </div>
                    <button class="btn-launch-exam" onclick="alert('OMR Simulation Engine loading configuration tokens...')"><i class="fas fa-stopwatch"></i> Start CBT Test</button>
                </div>
            `;
            return;
        }

        arr.forEach(test => {
            let card = document.createElement('div');
            card.className = `live-exam-card`;
            card.innerHTML = `
                <div class="exam-left-accent"></div>
                <span class="exam-syllabus-tag">${test.syllabus}</span>
                <h3 class="exam-title">${test.title}</h3>
                <div class="exam-meta-flex">
                    <div class="exam-meta-node"><i class="fas fa-clock"></i> ${test.duration} Minutes</div>
                    <div class="exam-meta-node"><i class="fas fa-check-double"></i> ${test.totalQues} Questions</div>
                    <div class="exam-meta-node"><i class="fas fa-award"></i> Scheme: +${test.posMark} / -${test.negMark}</div>
                </div>
                <button class="btn-launch-exam" onclick="window.open('${test.examLink}', '_blank')"><i class="fas fa-stopwatch"></i> Initialize Exam</button>
            `;
            container.appendChild(card);
        });
    }

    renderExamConsole();
    }

