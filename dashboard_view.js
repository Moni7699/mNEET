// হোম পেজ (টপ র্যাঙ্কার, প্রোগ্রেস ট্র্যাকার, ৪টি উইজেট সহ কাউন্টডাউন)
export function getHomeView(userName) {
    return `
        <!-- Student Name Intro -->
        <div class="mb-6">
            <h2 class="text-2xl font-extrabold text-white">Hello, <span class="text-golden">${userName}</span> 👋</h2>
            <p class="text-xs text-gray-400">Let's crack NEET together!</p>
        </div>

        <!-- Exam Countdown Timer -->
        <div class="bg-gradient-to-r from-[#1E1A0F] to-[#141414] p-4 rounded-xl border border-yellow-600/30 mb-6 text-center">
            <p class="text-xs text-gray-400 font-semibold tracking-wider mb-2">NEET EXAM COUNTDOWN</p>
            <div class="flex justify-center space-x-4 text-white">
                <div><span id="days" class="text-2xl font-bold text-golden">00</span><p class="text-[10px] text-gray-500">Days</p></div>
                <div class="text-2xl font-bold text-golden">:</div>
                <div><span id="hours" class="text-2xl font-bold text-golden">00</span><p class="text-[10px] text-gray-500">Hrs</p></div>
                <div class="text-2xl font-bold text-golden">:</div>
                <div><span id="minutes" class="text-2xl font-bold text-golden">00</span><p class="text-[10px] text-gray-500">Min</p></div>
                <div class="text-2xl font-bold text-golden">:</div>
                <div><span id="seconds" class="text-2xl font-bold text-golden">00</span><p class="text-[10px] text-gray-500">Sec</p></div>
            </div>
        </div>

        <!-- Daily Motivation Block -->
        <div id="motivation-container" class="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] mb-6">
            <div class="flex items-center space-x-2 text-golden mb-1 text-xs font-bold"><i class="fas fa-fire"></i> <span>DAILY MOTIVATION</span></div>
            <p id="motivation-text" class="text-sm italic text-gray-300">"Success isn't given. It's earned. On the track, on the field, in the study."</p>
        </div>

        <!-- Course Progress Tracker -->
        <div class="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] mb-6">
            <div class="flex justify-between text-xs text-gray-400 font-bold mb-2"><span>Syllabus Tracker</span> <span id="progress-percent" class="text-golden">0% Complete</span></div>
            <div class="w-full bg-[#252525] h-2 rounded-full overflow-hidden">
                <div id="progress-bar" class="bg-golden h-full rounded-full" style="width: 0%"></div>
            </div>
        </div>

        <!-- 3 Core Trackers Grid -->
        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A] text-center">
                <i class="fas fa-play-circle text-golden text-lg mb-1"></i>
                <p class="text-[10px] text-gray-400 block">Lecture Watch</p>
                <span id="stat-lecture" class="text-xs font-bold block mt-1">0/180 hrs</span>
            </div>
            <div class="bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A] text-center">
                <i class="fas fa-pen-alt text-golden text-lg mb-1"></i>
                <p class="text-[10px] text-gray-400 block">Ques Attempt</p>
                <span id="stat-questions" class="text-xs font-bold block mt-1">0/5000</span>
            </div>
            <div class="bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A] text-center">
                <i class="fas fa-clock text-golden text-lg mb-1"></i>
                <p class="text-[10px] text-gray-400 block">Study Tracker</p>
                <span id="stat-study-time" class="text-xs font-bold block mt-1">0/1200 hrs</span>
            </div>
        </div>

        <!-- Topper Progress Tracker -->
        <div class="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A]">
            <h3 class="text-sm font-bold text-golden mb-3"><i class="fas fa-trophy mr-1"></i> Current Topper Benchmark</h3>
            <div class="flex justify-between items-center text-xs text-gray-300">
                <div class="flex items-center space-x-2">
                    <div class="w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">1</div>
                    <div><p class="font-semibold">AIR 1 (Benchmark)</p><p class="text-[10px] text-gray-500">Score: 715/720</p></div>
                </div>
                <div class="text-right"><span class="text-golden font-bold">98% Progress</span></div>
            </div>
        </div>
    `;
}

// ব্যাচ লিস্ট ভিউ
export function getBatchesView() {
    return `
        <h2 class="text-xl font-bold mb-4 text-golden"><i class="fas fa-layer-group mr-2"></i>Available Batches</h2>
        <div id="batches-list" class="space-y-4">
            <!-- Admin items loaded via database -->
            <p class="text-sm text-gray-400">Loading amazing standard batches for you...</p>
        </div>
    `;
}

// স্টাডি জোন ভিউ (৪টি প্রধান রিকোয়ার্ড রো)
export function getStudyView() {
    return `
        <h2 class="text-xl font-bold mb-2 text-golden"><i class="fas fa-graduation-cap mr-2"></i>Study Zone</h2>
        <p class="text-xs text-gray-400 mb-6">Select your active batch to unlock modules</p>
        
        <div class="space-y-3">
            <div class="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between cursor-pointer hover:border-yellow-600/40">
                <div class="flex items-center space-x-3">
                    <div class="p-3 bg-red-900/20 text-red-500 rounded-lg"><i class="fas fa-book-open"></i></div>
                    <div><h4 class="text-sm font-bold">NCERT Reading & PYQ Tag</h4><p class="text-[11px] text-gray-500">Standard NCERT lines mapped with previous questions</p></div>
                </div>
                <i class="fas fa-chevron-right text-gray-600"></i>
            </div>

            <div class="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between cursor-pointer hover:border-yellow-600/40">
                <div class="flex items-center space-x-3">
                    <div class="p-3 bg-blue-900/20 text-blue-400 rounded-lg"><i class="fas fa-video"></i></div>
                    <div><h4 class="text-sm font-bold">Lectures Notes & DPP Hub</h4><p class="text-[11px] text-gray-500">Video solutions, hand-written notes, daily practice sheets</p></div>
                </div>
                <i class="fas fa-chevron-right text-gray-600"></i>
            </div>

            <div class="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between cursor-pointer hover:border-yellow-600/40">
                <div class="flex items-center space-x-3">
                    <div class="p-3 bg-yellow-900/20 text-yellow-500 rounded-lg"><i class="fas fa-vial"></i></div>
                    <div><h4 class="text-sm font-bold">Chapter & Topic wise Quiz</h4><p class="text-[11px] text-gray-500">Gamified quiz system to boost your score accuracy</p></div>
                </div>
                <i class="fas fa-chevron-right text-gray-600"></i>
            </div>

            <div class="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between cursor-pointer hover:border-yellow-600/40">
                <div class="flex items-center space-x-3">
                    <div class="p-3 bg-purple-900/20 text-purple-400 rounded-lg"><i class="fas fa-headset"></i></div>
                    <div><h4 class="text-sm font-bold">Doubt & Support Box</h4><p class="text-[11px] text-gray-500">Get your medical concept cleared in real-time</p></div>
                </div>
                <i class="fas fa-chevron-right text-gray-600"></i>
            </div>
        </div>
    `;
}

// টেস্ট জোন ভিউ
export function getTestView() {
    return `
        <h2 class="text-xl font-bold mb-4 text-golden"><i class="fas fa-file-alt mr-2"></i>Test Series Arena</h2>
        <div class="bg-[#1A1A1A] p-3 rounded-lg border border-[#2A2A2A] mb-4">
            <label class="block text-xs text-gray-400 mb-1">Select Test Series</label>
            <select id="test-series-dropdown" class="w-full bg-[#252525] text-sm text-white py-2 px-3 rounded-lg border border-[#3D3D3D]">
                <option value="">-- Choose Your Enrolled Test Series --</option>
            </select>
        </div>
        <div id="test-list" class="space-y-3">
            <p class="text-xs text-gray-500 text-center py-6">Select a series from above to load question papers.</p>
        </div>
    `;
}

// এমস্টোর ভিউ
export function getMStoreView() {
    return `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-golden"><i class="fas fa-shopping-bag mr-2"></i>mStore Marketplace</h2>
            <span class="text-xs bg-[#252525] px-3 py-1 rounded-full border border-[#3D3D3D]"><i class="fas fa-truck text-yellow-500 mr-1"></i> Free Delivery</span>
        </div>
        <div id="store-products-grid" class="grid grid-cols-2 gap-3">
            <!-- Dynamic products like Books, Modules, Pens will be loaded -->
            <p class="text-xs text-gray-500 col-span-2 text-center py-6">Connecting to mStore shelves...</p>
        </div>
    `;
}

