import { db } from "./firebase-config.js";
import { ref, push, onChildAdded, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { renderBattleLobbyView } from "./dashboard_view.js";

// ================= চ্যাট লজিক কন্টেইনার =================
export function initializeCommunityChat(cacheUserData) {
    const chatMessagesBox = document.getElementById("chat-messages-box");
    const chatTextInput = document.getElementById("chat-text-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatPhotoFile = document.getElementById("chat-photo-file");

    if (!chatMessagesBox || !chatSendBtn) return;
    const selectedBatch = document.getElementById("batch-view-filter")?.value || "default_batch";
    const chatRef = ref(db, `chats/${selectedBatch}`);

    onChildAdded(chatRef, (snapshot) => {
        if (snapshot.exists()) {
            const msgData = snapshot.val();
            renderSingleMessage(msgData, cacheUserData.uid);
            chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
        }
    });

    chatSendBtn.onclick = async () => {
        const text = chatTextInput.value.trim();
        if (!text) return;
        await push(chatRef, { senderId: cacheUserData.uid, senderName: cacheUserData.name || "Student", messageType: "text", content: text, timestamp: Date.now() });
        chatTextInput.value = "";
    };

    chatPhotoFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file || file.size > 2 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            await push(chatRef, { senderId: cacheUserData.uid, senderName: cacheUserData.name || "Student", messageType: "image", content: event.target.result, timestamp: Date.now() });
        };
        reader.readAsDataURL(file);
    };
}

function renderSingleMessage(msg, currentUserId) { /* ওল্ড চ্যাট রেন্ডারার */ }

// ================= ⚔️ আল্ট্রা-অ্যাডভান্সড ১০-প্লেয়ার লাইভ ব্যাটল ইঞ্জিন =================
export function createOrJoinMultiplayerBattle(chapterName, cacheUserData, renderArea) {
    // ৬ ডিজিটের ইউনিক কোড জেনারেশন মেকানিজম
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const roomRef = ref(db, `battles/${roomCode}`);

    // ডেটাবেজে ১০ জন ম্যাক্স স্লটের ফ্রেম লক করা হলো
    const initialRoomSetup = {
        roomCode: roomCode,
        chapter: chapterName,
        creatorId: cacheUserData.uid,
        status: "waiting",
        participantsCount: 1,
        maxSlots: 10
    };

    set(roomRef, initialRoomSetup).then(() => {
        // ক্রিয়েটরকে অটোমেটিক স্লট ১ এ যুক্ত করা
        set(ref(db, `battles/${roomCode}/players/${cacheUserData.uid}`), {
            uid: cacheUserData.uid,
            name: cacheUserData.name || "Surgeon Team",
            score: 0,
            slotNo: 1
        });

        // লাইভ ১০ জন প্লেয়ার ট্র্যাকিং লিসেনার অ্যাক্টিভেশন
        listenBattleRoomParticipants(roomCode, cacheUserData, renderArea);
    });
}

export function joinExistingBattleRoom(roomCode, cacheUserData, renderArea) {
    const roomRef = ref(db, `battles/${roomCode}`);
    
    get(roomRef).then((snapshot) => {
        if(!snapshot.exists()) {
            alert("Battle Room Code not found! Please check again.");
            return;
        }
        
        const data = snapshot.val();
        if(data.participantsCount >= 10) {
            alert("Room is Full! Maximum 10 Surgeons allowed per Battle.");
            return;
        }

        const nextSlot = data.participantsCount + 1;
        
        // প্লেয়ার এন্ট্রি পুশ
        update(ref(db, `battles/${roomCode}/players/${cacheUserData.uid}`), {
            uid: cacheUserData.uid,
            name: cacheUserData.name || "Surgeon Ally",
            score: 0,
            slotNo: nextSlot
        });

        // কাউন্টার আপডেট
        update(roomRef, { participantsCount: nextSlot });
        listenBattleRoomParticipants(roomCode, cacheUserData, renderArea);
    });
}

function listenBattleRoomParticipants(roomCode, cacheUserData, renderArea) {
    const playersRef = ref(db, `battles/${roomCode}/players`);
    
    onValue(playersRef, (snapshot) => {
        if(!snapshot.exists()) return;
        
        const playersData = snapshot.val();
        const playersArray = Object.values(playersData);
        
        // ভিউ রেন্ডার পরিবর্তন
        renderArea.innerHTML = renderBattleLobbyView(roomCode, playersArray.length);
        
        const listContainer = document.getElementById("battle-participants-list");
        if(listContainer) {
            listContainer.innerHTML = "";
            playersArray.forEach((player, index) => {
                const badge = `
                    <div class="battle-user-badge" style="border: 1px solid ${player.uid === cacheUserData.uid ? 'var(--gold)' : 'var(--border-line)'};">
                        <span>⚔️ Slot ${index + 1}: ${player.name}</span>
                        <span style="color:var(--neon-green);">CONNECTED</span>
                    </div>
                `;
                listContainer.insertAdjacentHTML('beforeend', badge);
            });
        }
    });
            }
                                       
