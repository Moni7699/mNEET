// ১. হোম স্ক্রিন লেআউট
export function getHomeView(userName) {
    return `
        <!-- Top Row User Greeting: Name is Boro Kore Lekha -->
        <div class="mb-5">
            <h1 class="text-3xl font-black tracking-tight leading-none">Hello, <span class="text-golden block mt-1">${userName}</span></h1>
            <p class="text-xs opacity-60 mt-1.5 font-medium">Your medical journey is perfectly tracked here.</p>
        </div>

        <!-- Row: Batch Selector Dropdown -->
        <div class="custom-card p-3.5 mb-5">
            <label class="block text-[10px] font-black uppercase tracking-wider text-golden mb-1.5">Active Target Batch</label>
            <select id="batch-dropdown-filter" class="w-full text-xs py-2 px-3 rounded-lg font-bold">
                <option value="alpha_neet">mNEET Target 2027 (Alpha Group)</option>
                <option value="dropper_pro">NEET Repeater Ultimate Pro</option>
            </select>
        </div>

        <!-- Countdown Timer: Live ticking mechanism box -->
        <div class="custom-card p-4 mb-5 text-center border-l-4 border-l-amber-500 relative overflow-hidden">
            <p class="text-[10px] font-black tracking-widest opacity-50 mb-3">NEET EXAM COUNTDOWN DEADLINE</p>
            <div class="flex justify-center space-x-3 font-mono">
                <div class="px-2"><span id="days" class="text-2xl font-black text-golden">00</span><p class="text-[9px] opacity-60 mt-0.5">DAYS</p></div>
                <div class="text-xl font-bold opacity-30 mt-0.5">:</div>
                <div class="px-2"><span id="hours" class="text-2xl font-black text-golden">00</span><p class="text-[9px] opacity-60 mt-0.5">HOURS</p></div>
                <div class="text-xl font-bold opacity-30 mt-0.5">:</div>
                <div class="px-2"><span id="minutes" class="text-2xl font-black text-golden">00</span><p class="text-[9px] opacity-60 mt-0.5">MINS</p></div>
                <div class="text-xl font-bold opacity-30 mt-0.5">:</div>
                <div class="px-2"><span id="seconds" class="text-2xl font-black text-golden">00</span><p class="text-[9px] opacity-60 mt-0.5">SECS</p></div>
            </div>
        </div>

        <!-- Daily Motivation Block (Supports Image, Video or Text) -->
        <div id="motivation-box" class="custom-card p-4 mb-5 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div class="flex items-center space-x-1.5 text-golden text-[10px] font-black tracking-wider mb-1.5">
                <i class="fas fa-fire-flame-curved"></i><span>ADMIN DAILY MOTIVATION PUSH</span>
            </div>
            <!-- Admin can inject text, image or video link here -->
            <p id="motivation-content" class="text-xs font-semibold leading-relaxed italic">"Do not stop until you are proud. Your white apron is waiting for you."</p>
        </div>

        <!-- Syllabus Progress Tracker -->
        <div class="custom-card p-4 mb-5">
            <div class="flex justify-between text-xs font-extrabold mb-2">
                <span>Overall Syllabus Pulse</span>
                <span class="text-golden" id="pulse-percentage">42% Complete</span>
            </div>
            <div class="w-full bg-gray-500/20 h-2 rounded-full overflow-hidden">
                <div class="bg-golden h-full rounded-full transition-all duration-500" style="width: 42%"></div>
            </div>
        </div>

        <!-- 3 Core Items Metrics (Completed vs Remaining Tracker) -->
        <div class="grid grid-cols-3 gap-2.5 mb-5">
            <div class="custom-card p-3 text-center">
                <i class="fas fa-circle-play text-golden text-sm mb-1.5"></i>
                <p class="text-[9px] opacity-60 font-bold uppercase">Lectures</p>
                <p class="text-xs font-black mt-1">60h <span class="text-[9px] opacity-40 block font-normal">Left: 120h</span></p>
            </div>
            <div class="custom-card p-3 text-center">
                <i class="fas fa-file-signature text-golden text-sm mb-1.5"></i>
                <p class="text-[9px] opacity-60 font-bold uppercase">Q-Attempts</p>
                <p class="text-xs font-black mt-1">1,200 <span class="text-[9px] opacity-40 block font-normal">Left: 3,800</span></p>
            </div>
            <div class="custom-card p-3 text-center">
                <i class="fas fa-clock-rotate-left text-golden text-sm mb-1.5"></i>
                <p class="text-[9px] opacity-60 font-bold uppercase">Study Time</p>
                <p class="text-xs font-black mt-1">210h <span class="text-[9px] opacity-40 block font-normal">Left: 690h</span></p>
            </div>
        </div>

        <!-- Topper Benchmark Analytics Progress -->
        <div class="custom-card p-4 flex items-center justify-between border-dashed border-amber-500/40 bg-amber-500/5">
            <div class="flex items-center space-x-2">
                <span class="text-base">🎯</span>
                <div>
                    <h5 class="text-xs font-bold">Topper Goal Post Tracker</h5>
                    <p class="text-[9px] opacity-60 mt-0.5">AIR 1 Mock Baseline Data</p>
                </div>
            </div>
            <span class="text-xs font-black text-golden">94% Tracked</span>
        </div>
    `;
}

// ২. স্টাডি জোন (৫টি ডেডিকেটেড রো)
export function getStudyView() {
    return `
        <h2 class="text-lg font-black mb-1.5 text-golden"><i class="fas fa-graduation-cap mr-2"></i>Study Syllabus Vault</h2>
        <p class="text-xs opacity-60 mb-5">Course mapped academic modules</p>
        
        <div class="space-y-3">
            <div class="custom-card p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition">
                <div class="flex items-center space-x-3.5">
                    <div class="text-red-500 text-lg"><i class="fas fa-book-open"></i></div>
                    <h4 class="text-xs font-bold">i) NCERT Reading and PYQ Tag</h4>
                </div>
                <i class="fas fa-chevron-right text-[10px] opacity-40"></i>
            </div>
            <div class="custom-card p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition">
                <div class="flex items-center space-x-3.5">
                    <div class="text-blue-400 text-lg"><i class="fas fa-notes-medical"></i></div>
                    <h4 class="text-xs font-bold">ii) Lectures Notes and DPP Hub</h4>
                </div>
                <i class="fas fa-chevron-right text-[10px] opacity-40"></i>
            </div>
            <div class="custom-card p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition">
                <div class="flex items-center space-x-3.5">
                    <div class="text-yellow-500 text-lg"><i class="fas fa-gamepad"></i></div>
                    <h4 class="text-xs font-bold">iii) Chapter and Topic wise Quiz</h4>
                </div>
                <i class="fas fa-chevron-right text-[10px] opacity-40"></i>
            </div>
            <div class="custom-card p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition">
                <div class="flex items-center space-x-3.5">
                    <div class="text-purple-400 text-lg"><i class="fas fa-circle-question"></i></div>
                    <h4 class="text-xs font-bold">iv) Doubt and Support Box</h4>
                </div>
                <i class="fas fa-chevron-right text-[10px] opacity-40"></i>
            </div>
        </div>
    `;
}

// ৩. ব্যাচ পারচেজ ভিউ
export function getBatchesView() {
    return `
        <h2 class="text-lg font-black mb-4 text-golden"><i class="fas fa-layer-group mr-2"></i>Premium Batches Arena</h2>
        <div class="space-y-4" id="db-batches-injector">
            <!-- Dynamic Batches will be rendered here via Admin Panel inputs -->
            <div class="custom-card p-5 text-center">
                <p class="text-xs font-bold opacity-60">Synchronizing premium academic bundles...</p>
            </div>
        </div>
    `;
}

// ৪. টেস্ট সিরিজ ভিউ
export function getTestView() {
    return `
        <h2 class="text-lg font-black mb-4 text-golden"><i class="fas fa-flask-vial mr-2"></i>Test Series Center</h2>
        <div class="custom-card p-3 mb-4">
            <label class="block text-[9px] font-black tracking-wider opacity-60 mb-1">CHOOSE ENROLLED TEST PACKAGE</label>
            <select class="w-full text-xs py-2 px-2 rounded-lg font-bold"><option>All India mNEET Mock Series 2027</option></select>
        </div>
        <div class="custom-card p-8 text-center text-xs font-bold opacity-50">No online exam papers active right now.</div>
    `;
}

// ৫. এমস্টোর মার্কেটপ্লেস ভিউ (ই-কমার্স ক্যাটাগরি)
export function getMStoreView() {
    return `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-black text-golden"><i class="fas fa-store mr-2"></i>mStore Academic Hub</h2>
            <span class="text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">Secure Hub</span>
        </div>
        <div class="grid grid-cols-2 gap-3" id="store-shelf-injector">
            <!-- Flipkart/Amazon style card blocks -->
            <div class="custom-card p-3 flex flex-col">
                <div class="w-full h-28 bg-gray-500/10 rounded-lg flex items-center justify-center text-xl">📚</div>
                <h4 class="text-xs font-bold mt-2 truncate">NCERT Punch Biology Vol 1</h4>
                <p class="text-[10px] text-golden font-black mt-1">₹340 <span class="opacity-40 line-through font-normal">₹499</span></p>
                <button class="w-full py-1.5 bg-golden-btn text-[10px] font-bold rounded-lg mt-2">Buy Now</button>
            </div>
        </div>
    `;
}
