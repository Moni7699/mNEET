/**
 * হোম স্ক্রিন মডিউল - রেন্ডারার
 * @param {HTMLElement} container - মাঝখানের স্ক্রোলযোগ্য ডিভ কনটেইনার
 * @param {Boolean} isAdmin - ইউজার অ্যাডমিন কি না তার স্ট্যাটাস
 */
export function renderScreen(container, isAdmin) {
    let adminControlHTML = '';

    // 👑 অ্যাডমিন মিরর স্পেশাল প্যানেল জেনারেটর
    if (isAdmin) {
        adminControlHTML = `
            <div style="background: rgba(218, 54, 55, 0.1); border: 1px dashed var(--accent-red); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: var(--accent-red); margin: 0 0 10px 0;">⚡ Admin Master Engine Active</h4>
                <p style="font-size: 0.85rem; margin: 0 0 10px 0;">You can globally manage information on this screen.</p>
                <button style="background: var(--accent-green); color: white; border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">+ Configure Live Announcements</button>
            </div>
        `;
    }

    // স্ক্রোলযোগ্য হোম স্ক্রিনের ইন্টারনাল ইন্টারফেস ডিজাইন
    container.innerHTML = `
        ${adminControlHTML}
        
        <div style="margin-bottom: 20px; background: var(--card-dark); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
            <h3 style="margin-top: 0;">🔥 Welcome to mNEET Home</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
                This middle zone is fully scrollable. Here you will see your regular feed, exam alerts, daily goals, and target metrics.
            </p>
        </div>

        <div style="height: 300px; background: linear-gradient(180deg, var(--card-dark), transparent); margin-bottom: 15px; border-radius: 8px; padding: 15px; box-sizing: border-box; border: 1px solid var(--border-color);">
            <h4>Daily Streak Goal</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Complete 1 topic quiz today to keep your streak alive.</p>
        </div>

        <div style="height: 300px; background: linear-gradient(180deg, var(--card-dark), transparent); border-radius: 8px; padding: 15px; box-sizing: border-box; border: 1px solid var(--border-color);">
            <h4>Latest NEET Updates</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Check current updates directly fetched from the official portal.</p>
        </div>
    `;
}

