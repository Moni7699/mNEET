/**
 * mNEET প্রফেশনাল হোম স্ক্রিন মডিউল
 * @param {HTMLElement} container - স্ক্রোলযোগ্য মিডল জোন ডিভ
 * @param {Boolean} isAdmin - ইউজার অ্যাডমিন কি না
 */
export function renderHomeScreen(container, isAdmin) {
    let adminPanelHTML = '';

    // 👑 অ্যাডমিন মিরর স্পেশাল প্যানেল
    if (isAdmin) {
        adminPanelHTML = `
            <div style="background: rgba(218, 54, 55, 0.08); border: 1px dashed var(--accent-red); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: var(--accent-red); margin: 0 0 5px 0; font-size:0.95rem;">⚡ Admin Mirror Panel Active</h4>
                <p style="font-size: 0.8rem; margin: 0 0 12px 0; color: var(--text-main);">Manage global features, add banners, or edit student targets from here.</p>
                <div style="display:flex; gap:10px;">
                    <button style="background: var(--accent-green); color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:0.8rem; font-weight:bold; cursor:pointer;">+ Create Chapter</button>
                    <button style="background: var(--accent-blue); color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:0.8rem; font-weight:bold; cursor:pointer;">Edit Content</button>
                </div>
            </div>
        `;
    }

    // প্রফেশনাল ড্যাশবোর্ড কার্ড লেআউট (UI/UX)
    container.innerHTML = `
        ${adminPanelHTML}

        <!-- 🚀 প্রফেশনাল মোটিভেশনাল কার্ড -->
        <div style="background: linear-gradient(135deg, var(--accent-blue), #3a86ff); color: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <h3 style="margin: 0 0 5px 0; font-size: 1.3rem;">Target NEET 2026</h3>
            <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Consistency beats talent. Keep your daily streak active and earn more bP coins!</p>
        </div>

        <!-- 🎯 DAILY CHECKLIST ZONES (SCROLLABLE CONTENT) -->
        <h3 style="font-size: 1rem; color: var(--text-main); margin-bottom: 10px; text-align:left;">Today's Focus Goals</h3>
        
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <h4 style="margin: 0 0 4px 0; font-size: 0.95rem;">Biology Revision</h4>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Cell Cycle and Division • Topic 1</p>
            </div>
            <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: bold;">+10 bP</span>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <h4 style="margin: 0 0 4px 0; font-size: 0.95rem;">Physics Mock Practice</h4>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Units and Measurements • PYQ Tagged</p>
            </div>
            <span style="color: var(--accent-blue); font-size: 0.85rem; font-weight: bold;">+25 bP</span>
        </div>

        <!-- EXTRA BOXES TO PROVE SCROLLING IN PHONES & LAPTOPS -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px; border-radius: 10px; margin-bottom: 12px; opacity:0.6;">
            <h4 style="margin: 0 0 4px 0; font-size: 0.95rem;">Chemistry High-Yield Lines</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">NCERT Paragraph Reading</p>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px; border-radius: 10px; margin-bottom: 12px; opacity:0.4;">
            <h4 style="margin: 0 0 4px 0; font-size: 0.95rem;">Weekly Live Challenge</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Compete with Elite Tier students</p>
        </div>
    `;
}
