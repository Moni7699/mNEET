import { db } from "./firebase-config.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * স্টুডেন্টদের ডাউট ও কমপ্লেন টিকিট হ্যান্ডেল করার মূল অ্যাডমিন ফাংশন
 * @param {HTMLElement} renderArea - অ্যাডমিন প্যানেলের মেইন ভিউপোর্ট এরিয়া
 */
export function loadAdminDoubtsManager(renderArea) {
    // লোডিং স্ক্রিন
    renderArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--gold);">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; margin-bottom: 12px;"></i>
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Loading Active Helpdesk Board...</span>
        </div>
    `;

    // ফায়ারবেস রিয়েল-টাইম লিসেনার চালু করা (পাথ: admin_tickets)
    const ticketsRef = ref(db, "admin_tickets");
    
    onValue(ticketsRef, (snapshot) => {
        if (!renderArea) return;

        // হেডার ও কন্টেইনার ফ্রেম রেন্ডার
        renderArea.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="font-size: 10px; background-color: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-red); font-weight: 800; text-transform: uppercase;">ROOT HELPDESK ENGINE</span>
                <h2 style="font-size: 20px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">Incoming Tickets Board</h2>
                <p style="font-size: 11px; color: var(--text-para);">Resolve student conceptual doubts or platform hardware bugs</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;" id="admin-tickets-container">
                </div>
        `;

        const container = document.getElementById("admin-tickets-container");

        if (!snapshot.exists()) {
            container.innerHTML = `<div style="font-size:12px; color:var(--text-para); text-align:center; padding:30px;">Alhamdulillah! No pending tickets found. The board is clear.</div>`;
            return;
        }

        const allTickets = snapshot.val();
        let pendingCount = 0;

        // অবজেক্ট লুপ ঘুরিয়ে টিকিট কার্ড জেনারেট করা
        Object.keys(allTickets).forEach(ticketKey => {
            const ticket = allTickets[ticketKey];
            
            // শুধুমাত্র ওপেন (Open) টিকিটগুলো সামনে শো করবে
            if (ticket.status !== "open") return;
            pendingCount++;

            // টিকিটের টাইপ অনুযায়ী ব্যাজ কালার ডিটেকশন
            let typeBadgeColor = "var(--neon-blue)";
            if(ticket.type === "app_complaint") typeBadgeColor = "var(--neon-red)";
            if(ticket.type === "bp_issue") typeBadgeColor = "var(--gold)";

            const ticketHtml = `
                <div class="card-mneet border-red" style="padding: 14px; background: var(--bg-surface);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size: 9px; background-color: rgba(255,255,255,0.05); border:1px solid var(--border-line); padding: 3px 6px; border-radius: 4px; color: ${typeBadgeColor}; font-weight: 800; text-transform: uppercase;">
                            <i class="fas fa-ticket-alt"></i> ${ticket.type.replace(/_/g, " ")}
                        </span>
                        <span style="font-size: 10px; color: var(--text-para); font-weight: 600;">
                            ${new Date(ticket.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>

                    <h4 style="font-size: 14px; font-weight: 800; color: var(--text-title); margin: 0 0 6px 0;">Sub: ${ticket.subject}</h4>
                    <p style="font-size: 12px; color: var(--text-para); line-height: 1.4; margin: 0 0 12px 0; background: var(--bg-input); padding: 10px; border-radius: 10px; text-align: left;">
                        "${ticket.description}"
                    </p>

                    <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px dashed var(--border-line); padding-top: 10px;">
                        <div>
                            <span style="font-size: 11px; font-weight: 700; color: var(--text-title); display:block;">${ticket.studentName}</span>
                            <span style="font-size: 9px; color: var(--gold); font-weight: 600;">Phone: ${ticket.studentPhone}</span>
                        </div>
                        <button class="admin-resolve-ticket-btn class-mneet link-btn" data-key="${ticketKey}" style="background: var(--neon-green)!important; color: #000 !important; padding: 6px 12px; font-size: 11px; font-weight: 800; border-radius: 8px;">
                            <i class="fas fa-check"></i> Mark Resolved
                        </button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", ticketHtml);
        });

        if (pendingCount === 0) {
            container.innerHTML = `<div style="font-size:12px; color:var(--text-para); text-align:center; padding:30px;">Alhamdulillah! No pending tickets found. The board is clear.</div>`;
            return;
        }

        // টিকিট রিজলভ বাটন অ্যাকশন লিসেনার বাইন্ডিং
        document.querySelectorAll(".admin-resolve-ticket-btn").forEach(btn => {
            btn.onclick = async () => {
                const tKey = btn.getAttribute("data-key");
                if (confirm("Have you successfully resolved this student doubt/complaint?")) {
                    // টিকিট ডিলিট না করে স্ট্যাটাস 'resolved' করে দেওয়া, যাতে হিস্ট্রি ট্র্যাকে থাকে
                    await update(ref(db, `admin_tickets/${tKey}`), { status: "resolved" });
                    alert("Ticket updated to RESOLVED state successfully!");
                }
            };
        });
    });
}

