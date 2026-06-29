// হোম পেজ লোড লজিক
export function getHomeView(userName) {
    return `
        <!-- Student Name Intro (Boro Kore Lekha) -->
        <div class="mb-5">
            <h1 class="text-3xl font-black tracking-tight">Hello, <span class="text-golden block sm:inline">${userName}</span></h1>
            <p class="text-xs text-gray-400 mt-1">Ready to dominate your daily targets?</p>
        </div>

        <!-- Course & Batch Selection Row (Essential Required Feature) -->
        <div class="card-bg p-3 rounded-xl mb-5 flex space-x-2">
            <div class="flex-1">
                <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Enrolled Batch</label>
                <select id="home-batch-select" class="w-full text-xs py-2 px-3 rounded-lg font-medium">
                    <option value="neet_2027_alpha">mNEET 2027 Alpha Batch</option>
                    <option value="neet_dropper_pro">NEET Dropper Pro Batch</option>
                </select>
            </div>
        </div>

        <!-- Exam Countdown Timer (Hours, Min, Sec counts down) -->
        <div class="card-bg p-4 rounded-xl mb-5 text-center border-l-4 border-l-amber-500">
            <p class="text-[10px] font-bold tracking-widest text-gray-400 mb-2">TIME LEFT FOR TARGET NEET EXAM</p>
            <div class="flex justify-center space-x-4">
                <div><span id="days" class="text-2xl font-black text-golden">00</span><p class="text-[9px] text-gray-400">Days</p></div>
                <div class="text-xl font-bold text-golden mt-1">:</div>
                <div><span id="hours" class="text-2xl font-black text-golden">00</span><p class="text-[9px] text-gray-400">Hours</p></div>
                <div class="text-xl font-bold text-golden mt-1">:</div>
                <div><span id="minutes" class="text-2xl font-black text-golden">00</span><p class="text-[9px] text-gray-400">Min</p></div>
                <div class="text-xl font-bold text-golden mt-1">:</div>
                <div><span id="seconds" class="text-2xl font-black text-golden">00</span><p class="text-[9px] text-gray-400">Sec</p></div>
            </div>
        </div>

        <!-- Daily Motivation Widget (Admin controlled updates) -->
        <div class="card-bg p-4 rounded-xl mb-5 relative overflow-hidden">
            <div class="absolute right-2 top-2 text-yellow-600/20 text-4xl"><i class="fas fa-quote-right"></i></div>
            <p class="text-[10px] font-bold text-golden tracking-wider mb-1"><i class="fas fa-bolt mr-1"></i> DAILY MOTIVATION ZONE</p>
            <p id="motivation-text" class="text-sm font-medium italic">"Every single page you read today in NCERT puts you one foot closer to the medical college gates."</p>
        </div>

        <!-- Syllabus Course Progress Tracker -->
        <div class="card-bg p-4 rounded-xl mb-5">
            <div class="flex justify-between text-xs font-bold mb-2">
                <span>My Syllabus Coverage</span> 
                <span id="progress-percent" class="text-golden">34%</span>
            </div>
            <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div id="progress-bar" class="bg-golden h-full rounded-full" style="width: 34%"></div>
            </div>
        </div>

        <!-- 3 Core Row Statistics Trackers (Completed vs Remainder balanced) -->
        <div class="grid grid-cols-3 gap-2 mb-5">
            <div class="card-bg p-3 rounded-xl text-center">
                <i class="fas fa-film text-golden text-sm mb-1"></i>
                <p class="text-[9px] text-gray-400">Lectures</p>
                <span class="text-xs font-black block mt-1">45h / <span class="text-gray-500">180h</span></span>
            </div>
            <div class="card-bg p-3 rounded-xl text-center">
                <i class="fas fa-check-double text-golden text-sm mb-1"></i>
                <p class="text-[9px] text-gray-400">Questions</p>
                <span class="text-xs font-black block mt-1">620 / <span class="text-gray-500">5000</span></span>
            </div>
            <div class="card-bg p-3 rounded-xl text-center">
                <i class="fas fa-hourglass-half text-golden text-sm mb-1"></i>
                <p class="text-[9px] text-gray-400">Study Time</p>
                <span class="text-xs font-black block mt-1">120h / <span class="text-gray-500">900h</span></span>
            </div>
        </div>

        <!-- Topper Tracker (Aiming Reference) -->
        <div class="card-bg p-3 rounded-xl flex items-center justify-between border border-dashed border-yellow-600/30">
            <div class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center text-xs">👑</div>
                <span class="text-xs font-bold">Topper Baseline Progress</span>
            </div>
            <span class="text-xs font-black text-golden">91% Completed</span>
        </div>
    `;
}

export function getBatchesView() {
    return `<h2 class="text-xl font-bold mb-4 text-golden">Available Batches</h2><div class="space-y-3" id="batches-container"></div>`;
}

// ৪টি প্রধান রো সমৃদ্ধ স্টাডি জোন
export function getStudyView() {
    return `
        <h2 class="text-xl font-bold mb-4 text-golden">Study Material Zone</h2>
        <div class="space-y-3">
            <div class="card-bg p-4 rounded-xl flex items-center justify-between cursor-pointer study-node" data-module="ncert">
                <div class="flex items-center space-x-3">
                    <div class="text-red-500 text-lg"><i class="fas fa-book-open"></i></div>
                    <div><h4 class="text-sm font-bold">i) NCERT Reading & PYQ Tag</h4></div>
                </div>
                <i class="fas fa-chevron-right text-xs text-gray-500"></i>
            </div>
            <div class="card-bg p-4 rounded-xl flex items-center justify-between cursor-pointer study-node" data-module="notes">
                <div class="flex items-center space-x-3">
                    <div class="text-blue-400 text-lg"><i class="fas fa-file-signature"></i></div>
                    <div><h4 class="text-sm font-bold">ii) Lectures Notes & DPP Hub</h4></div>
                </div>
                <i class="fas fa-chevron-right text-xs text-gray-500"></i>
            </div>
            <div class="card-bg p-4 rounded-xl flex items-center justify-between cursor-pointer study-node" data-module="quiz">
                <div class="flex items-center space-x-3">
                    <div class="text-yellow-500 text-lg"><i class="fas fa-trophy"></i></div>
                    <div><h4 class="text-sm font-bold">iii) Chapter & Topic-wise Quiz</h4></div>
                </div>
                <i class="fas fa-chevron-right text-xs text-gray-500"></i>
            </div>
            <div class="card-bg p-4 rounded-xl flex items-center justify-between cursor-pointer study-node" data-module="doubt">
                <div class="flex items-center space-x-3">
                    <div class="text-purple-400 text-lg"><i class="fas fa-question-circle"></i></div>
                    <div><h4 class="text-sm font-bold">iv) Doubt & Support Box</h4></div>
                </div>
                <i class="fas fa-chevron-right text-xs text-gray-500"></i>
            </div>
        </div>
    `;
}

export function getTestView() {
    return `
        <h2 class="text-xl font-bold mb-3 text-golden">Test Series</h2>
        <select class="w-full text-xs py-2 px-3 rounded-lg font-medium mb-4"><option>Select Test Target Series</option></select>
        <div class="p-6 text-center text-xs text-gray-500 card-bg rounded-xl">No active tests scheduled.</div>
    `;
}

export function getMStoreView() {
    return `<h2 class="text-xl font-bold mb-4 text-golden">mStore Books & Gadgets</h2><div class="grid grid-cols-2 gap-3" id="store-grid"></div>`;
}
