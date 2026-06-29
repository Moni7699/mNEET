import { db } from "./firebase-config.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * ডাউট ও কমপ্লেন বক্স মডিউল লোড করার মূল ফাংশন
 * @param {object} cacheUserData - ইউজারের লগইন ডাটা
 * @param {HTMLElement} renderArea - ড্যাশবোর্ডের মেইন ভিউপোর্ট এরিয়া
 */
export function loadDoubtsModule(cacheUserData, renderArea) {
    // ইউআই রেন্ডার (কোনো চ্যাপ্টার বা সাবজেক্ট গেট ছাড়াই ডিরেক্ট ওপেন হবে)
    renderArea.innerHTML = `
        <div style="margin-bottom: 16px;">
            <span style="font-size: 10px; background-color: rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--neon-red); font-weight: 800; text-transform: uppercase;">SUPPORT & BOX STATION</span>
            <h2 style="font-size: 20px; font-weight: 900; margin: 6px 0 2px 0; color: var(--text-title);">Doubts & Complaints</h2>
            <p style="font-size: 11px; color: var(--text-para);">Submit your subject doubts or app issues directly to Dr. Monirul Islam</p>
        </div>

        <div class="card-mneet border-red" style="padding: 16px; margin-bottom: 16px;">
            <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Select Ticket Type</label>
                <select id="doubt-ticket-type" class="input-field">
                    <option value="academic_doubt">🧬 Biology/Chemistry/Physics Doubt</option>
                    <option value="app_complaint">⚠️ App Bug / Course Complaint</option>
                    <option value="bp_issue">🪙 BP Coin Sync Issue</option>
                </select>
            </div>

            <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Subject/Topic Heading</label>
                <input type="text" id="doubt-subject-input" class="input-field" placeholder="e.g. Mitosis Anaphase doubt / Payment issue">
            </div>

            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 11px; font-weight: 800; color: var(--gold); margin-bottom: 6px; text-transform: uppercase;">Describe Your Problem Detailed</label>
                <textarea id="doubt-description-input" class="input-field" style="height: 100px; resize: none; font-family: inherit; line-height: 1.4;" placeholder="Type your question or complaint here clearly..."></textarea>
            </div>

            <button id="submit-doubt-ticket-btn" class="btn-mneet" style="background: linear-gradient(135deg, var(--neon-red) 0%, #B91C1C) !important; color: white !important;">
                Submit Ticket to Admin <i class="fas fa-paper-plane" style="font-size: 11px; margin-left: 4px;"></i>
            </button>
        </div>

        <div class="card-mneet border-blue" style="padding: 12px 14px; background: rgba(37, 99, 235, 0.02);">
            <h4 style="font-size: 12px; font-weight: 800; margin-bottom: 4px; color: var(--text-title);"><i class="fas fa-info-circle"></i> Support SLA Notice</h4>
            <p style="font-size: 11px; color: var(--text-para); margin: 0; line-height: 1.4;">
                All resolved tickets will be pushed directly back to your profile or resolved via the official mNEET Community Bot within 24-48 working hours.
            </p>
        </div>
    `;

    // টিকিট সাবমিশন বাটন ক্লিক হ্যান্ডলার লজিক
    document.getElementById("submit-doubt-ticket-btn").onclick = async () => {
        const ticketType = document.getElementById("doubt-ticket-type").value;
        const ticketSubject = document.getElementById("doubt-subject-input").value.trim();
        const ticketDesc = document.getElementById("doubt-description-input").value.trim();

        if (!ticketSubject || !ticketDesc) {
            alert("Please fill up both subject heading and description box!");
            return;
        }

        // বাটন ডিজেবল ও লোডিং স্টেট ট্র্যাকিং
        const submitBtn = document.getElementById("submit-doubt-ticket-btn");
        submitBtn.disabled = true;
        submitBtn.innerText = "SUBMITTING TICKET...";

        try {
            // ফায়ারবেস ডেটাবেজের ডেডিকেটেড 'admin_tickets' নোডে পুশ করা হবে
            const ticketRef = ref(db, "admin_tickets");
            await push(ticketRef, {
                studentId: cacheUserData.uid,
                studentName: cacheUserData.name || "mNEET Aspirant",
                studentPhone: cacheUserData.phone || "No Phone",
                type: ticketType,
                subject: ticketSubject,
                description: ticketDesc,
                status: "open",
                timestamp: Date.now()
            });

            alert("Alhamdulillah! Your ticket has been registered successfully. Admin will look into this right away.");
            
            // সাবমিশন সফল হলে স্টুডেন্টকে ডিরেক্ট হোম বা স্টাডি আর্কাইভে রিডাইরেক্ট করা
            document.getElementById("dashboard-back-btn").click();

        } catch (err) {
            alert("Ticket Submission Failed: " + err.message);
            submitBtn.disabled = false;
            submitBtn.innerText = "SUBMIT TICKET TO ADMIN";
        }
    };
          }
                  
