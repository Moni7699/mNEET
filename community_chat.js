import { db } from "./firebase-config.js";
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// এই ফাংশনটি dashboard_logic.js থেকে কল হয়ে চ্যাট সচল করে
export function initializeCommunityChat(cacheUserData) {
    const chatMessagesBox = document.getElementById("chat-messages-box");
    const chatTextInput = document.getElementById("chat-text-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatPhotoFile = document.getElementById("chat-photo-file");

    if (!chatMessagesBox || !chatSendBtn) return;

    // একটিভ ব্যাচ অনুযায়ী আলাদা চ্যাট রুমের পাথ সিঙ্ক হবে
    const selectedBatch = document.getElementById("batch-view-filter")?.value || "default_batch";
    const chatRef = ref(db, `chats/${selectedBatch}`);

    // ================= ১. রিয়েল-টাইমে মেসেজ ও ফটো ডাটাবেজ থেকে লোড করা =================
    onChildAdded(chatRef, (snapshot) => {
        if (snapshot.exists()) {
            const msgData = snapshot.val();
            renderSingleMessage(msgData, cacheUserData.uid);
            // নতুন মেসেজ এলে অটো-স্ক্রোল ডাউন
            chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
        }
    });

    // ================= ২. টেক্সট মেসেজ পাঠানো =================
    chatSendBtn.onclick = async () => {
        const text = chatTextInput.value.trim();
        if (!text) return;

        try {
            await push(chatRef, {
                senderId: cacheUserData.uid,
                senderName: cacheUserData.name || "mNEET Student",
                messageType: "text",
                content: text,
                timestamp: Date.now()
            });
            chatTextInput.value = ""; // ইনপুট বক্স ক্লিয়ার
        } catch (err) {
            alert("Chat Error: " + err.message);
        }
    };

    // এন্টার প্রেস করলে মেসেজ সেন্ড হবে
    chatTextInput.onkeypress = (e) => {
        if (e.key === 'Enter') chatSendBtn.click();
    };

    // ================= ৩. ফটো সিলেক্ট ও Base64 কনভার্ট করে ফ্রীতে পাঠানো =================
    chatPhotoFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ২ এমবির বেশি বড় ছবি আটকানোর ফিল্টার
        if (file.size > 2 * 1024 * 1024) {
            alert("Image size too big! Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Image = event.target.result; // ইমেজ টু টেক্সট স্ট্রিং রূপান্তর

            try {
                await push(chatRef, {
                    senderId: cacheUserData.uid,
                    senderName: cacheUserData.name || "mNEET Student",
                    messageType: "image",
                    content: base64Image,
                    timestamp: Date.now()
                });
            } catch (err) {
                alert("Photo Upload Error: " + err.message);
            }
        };
        reader.readAsDataURL(file);
    };
}

// ================= ৪. মেসেজ রেন্ডারিং ও ইউআই অ্যালাইনমেন্ট লজিক =================
function renderSingleMessage(msg, currentUserId) {
    const chatMessagesBox = document.getElementById("chat-messages-box");
    const isMe = msg.senderId === currentUserId;

    // নিজের মেসেজ ডানদিকে, বন্ধুদের মেসেজ বামদিকে উইথ গ্লোবাল কালার ব্যালেন্স
    const msgBg = isMe ? "background-color: #2563EB; align-self: flex-end;" : "background-color: var(--bg-input); align-self: flex-start;";
    const textColor = isMe ? "color: #FFFFFF;" : "color: var(--text-title);";
    const nameColor = isMe ? "color: #F3B917;" : "color: #10B981;";

    let mediaContent = "";
    if (msg.messageType === "image") {
        mediaContent = `<img src="${msg.content}" style="width: 100%; max-width: 200px; border-radius: 12px; margin-top: 6px; display: block; object-fit: contain;">`;
    } else {
        mediaContent = `<span style="font-size: 13px; ${textColor}">${msg.content}</span>`;
    }

    const msgHtml = `
        <div style="${msgBg} padding: 10px 14px; border-radius: 16px; max-width: 80%; display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <span style="font-size: 10px; ${nameColor} font-weight: 800; margin-bottom: 2px;">${isMe ? "You" : msg.senderName}</span>
            ${mediaContent}
        </div>
    `;

    chatMessagesBox.insertAdjacentHTML('beforeend', msgHtml);
                        }
                                                                                                
