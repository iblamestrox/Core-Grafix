// ==========================================
// 0. FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDW0oHVNOysOVPLxDDOV0fy8wk2u3mc_FQ",
  authDomain: "coregrafix.firebaseapp.com",
  databaseURL: "https://coregrafix-default-rtdb.firebaseio.com",
  projectId: "coregrafix",
  storageBucket: "coregrafix.firebasestorage.app",
  messagingSenderId: "1011567166365",
  appId: "1:1011567166365:web:a5e5579ddb074d01292574"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// FIX: Forces long polling to bypass AdBlockers & Offline Bugs
db.settings({ experimentalForceLongPolling: true });

// ==========================================
// 1. CINEMATIC PRELOADER
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => { document.getElementById('preloader').classList.add('hidden'); }, 1200);
});

// ==========================================
// 2. SCROLL REVEALS & FILTERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
});

const filterBtns = document.querySelectorAll('.filter-btn');
const masonryItems = document.querySelectorAll('.masonry-item');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');
        masonryItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// ==========================================
// 3. PRICING & CHAT LOGIC
// ==========================================
const heroOrderBtn = document.getElementById('heroOrderBtn');
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const chatWidget = document.getElementById('chatWidget');
const portalModal = document.getElementById('portalModal');
const chatBody = document.getElementById('chatBody');

let activeOrder = { packageName: "", packagePrice: 0, answers: [] };
const chatFlow = [
    { botText: "What type of design are you looking for? (e.g., Minecraft Thumbnail, Tech Banner, Poster)", type: "text" },
    { botText: "Briefly explain the 'climax' or concept of the design.", type: "text" },
    { botText: "What specific 2–4 words of text do you want printed on the graphic?", type: "text" }
];
let currentStep = 0;

heroOrderBtn.addEventListener('click', () => orderModal.classList.add('active'));
closeOrderModal.addEventListener('click', () => orderModal.classList.remove('active'));
document.getElementById('closeChatBtn').addEventListener('click', () => chatWidget.classList.remove('active'));

document.querySelectorAll('.tier-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        activeOrder.packageName = e.target.getAttribute('data-package');
        activeOrder.packagePrice = parseInt(e.target.getAttribute('data-price'));
        activeOrder.answers = [];
        orderModal.classList.remove('active');
        chatWidget.classList.add('active');
        initActiveOrder();
    });
});

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg', sender);
    msgDiv.innerText = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator(callback) {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('msg', 'bot', 'typing-bubble');
    typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    setTimeout(() => { typingDiv.remove(); callback(); }, 1000); 
}

function initActiveOrder() {
    chatBody.innerHTML = ""; currentStep = 0;
    showTypingIndicator(() => {
        addMessage(`Awesome choice! You selected the ${activeOrder.packageName}. Let's get the details.`, 'bot');
        showTypingIndicator(() => { addMessage(chatFlow[currentStep].botText, 'bot'); renderInput(); });
    });
}

function renderInput() {
    const chatFooter = document.getElementById('chatFooter');
    if (currentStep >= chatFlow.length) {
        chatFooter.innerHTML = "";
        showTypingIndicator(() => {
            addMessage("Perfect! I have your details. To secure your spot and pay the deposit, please log in.", 'bot');
            setTimeout(() => { chatWidget.classList.remove('active'); portalModal.classList.add('active'); }, 2500);
        });
        return;
    }
    chatFooter.innerHTML = `<input type="text" class="chat-input" id="chatInput"> <button class="chat-send" id="chatSendBtn">Send</button>`;
    document.getElementById('chatSendBtn').addEventListener('click', handleUserSubmit);
    document.getElementById('chatInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserSubmit(); });
    document.getElementById('chatInput').focus();
}

function handleUserSubmit() {
    const inputEl = document.getElementById('chatInput');
    const userVal = inputEl.value.trim(); if (!userVal) return;
    activeOrder.answers.push(userVal); addMessage(userVal, 'user'); currentStep++;
    document.getElementById('chatFooter').innerHTML = "";
    if (currentStep < chatFlow.length) { showTypingIndicator(() => { addMessage(chatFlow[currentStep].botText, 'bot'); renderInput(); }); } else { renderInput(); }
}

// ==========================================
// 4. AUTH & PRO DASHBOARD UI LOGIC
// ==========================================
const portalBtn = document.getElementById('openPortalBtn');
const closePortalModal = document.getElementById('closePortalModal');
const togglePassword = document.getElementById('togglePassword');
const authPass = document.getElementById('authPass');
const eyeOpen = document.getElementById('eyeOpen');
const eyeClosed = document.getElementById('eyeClosed');

togglePassword.addEventListener('click', () => {
    if (authPass.getAttribute('type') === 'password') {
        authPass.setAttribute('type', 'text');
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        authPass.setAttribute('type', 'password');
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
});

portalBtn.addEventListener('click', () => { activeOrder = { packageName: "", packagePrice: 0, answers: [] }; portalModal.classList.add('active'); });
closePortalModal.addEventListener('click', () => portalModal.classList.remove('active'));

document.getElementById('tabSignIn').addEventListener('click', (e) => {
    e.target.classList.add('active'); document.getElementById('tabSignUp').classList.remove('active');
    document.querySelector('.auth-submit-btn').innerText = "Sign In";
    document.querySelectorAll('.signup-only').forEach(el => el.style.display = 'none');
});

document.getElementById('tabSignUp').addEventListener('click', (e) => {
    e.target.classList.add('active'); document.getElementById('tabSignIn').classList.remove('active');
    document.querySelector('.auth-submit-btn').innerText = "Sign Up";
    document.querySelectorAll('.signup-only').forEach(el => el.style.display = 'block');
});

// Tab Switching inside Client Dashboard
const dashNavItems = document.querySelectorAll('#dashNav li');
const dashTabs = document.querySelectorAll('#dashboardSection .pro-dash-tab');
dashNavItems.forEach(item => {
    item.addEventListener('click', () => {
        dashNavItems.forEach(nav => nav.classList.remove('active'));
        dashTabs.forEach(tab => tab.style.display = 'none');
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-tab')).style.display = 'block';
    });
});

// Tab Switching for Admin Nav
document.querySelectorAll('#adminNav li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('#adminNav li').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('#adminDashboardSection .pro-dash-tab').forEach(tab => tab.style.display = 'none');
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-tab')).style.display = 'block';
    });
});

// Profile Picture Visual Upload (Client Setting)
let currentProfilePicBase64 = null;
document.getElementById('settingProfilePic').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentProfilePicBase64 = event.target.result;
            document.getElementById('settingAvatarPreview').innerHTML = `<img src="${currentProfilePicBase64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            document.querySelector('#dashboardSection .pro-dash-avatar').innerHTML = `<img src="${currentProfilePicBase64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
        reader.readAsDataURL(file);
    }
});

// Profile Save Logic (Client Setting)
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const newName = document.getElementById('settingName').value;
    const user = auth.currentUser;
    if (user && newName) {
        document.getElementById('saveProfileBtn').innerText = "Saving...";
        try {
            await user.updateProfile({ displayName: newName });
            const updateData = { name: newName };
            if (currentProfilePicBase64) {
                updateData.profilePic = currentProfilePicBase64;
            }
            await db.collection("users").doc(user.uid).set(updateData, { merge: true });
            
            document.getElementById('welcomeName').innerText = newName.split(" ")[0];
            setTimeout(() => { document.getElementById('saveProfileBtn').innerText = "Saved!"; }, 500);
            setTimeout(() => { document.getElementById('saveProfileBtn').innerText = "Save Profile"; }, 2000);
        } catch (error) {
            alert("Error saving profile: " + error.message);
            document.getElementById('saveProfileBtn').innerText = "Save Profile";
        }
    }
});

// ==========================================
// 5. FIREBASE DATABASE FAILSAFE & ROUTING ENGINE
// ==========================================
document.querySelector('.google-btn').addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        let finalUID = "CG#----";
        let name = user.displayName || "Client";
        const userEmail = user.email;

        // Hardcoded Admin Failsafes
        if (userEmail === "coregrafix.in@gmail.com") finalUID = "CG#0001";
        else if (userEmail === "vermasaksham882@gmail.com") finalUID = "CG#0126";
        else if (userEmail === "armazaid406@gmail.com") finalUID = "CG#0226";
        else {
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (userDoc.exists && userDoc.data().cgUid) { finalUID = userDoc.data().cgUid; } 
            else {
                const currentYear = new Date().getFullYear().toString().slice(-2);
                const usersRef = await db.collection("users").get();
                // Normal clients start at 10
                finalUID = `CG#${(usersRef.size + 10).toString().padStart(2, '0')}${currentYear}`;
                await db.collection("users").doc(user.uid).set({ name: name, email: userEmail, cgUid: finalUID, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            }
        }

        if(activeOrder.packageName !== "") {
            const orderData = { userId: user.uid, cgUid: finalUID, clientName: name, clientEmail: userEmail, package: activeOrder.packageName, price: activeOrder.packagePrice, answers: activeOrder.answers, status: "Awaiting Deposit", timestamp: firebase.firestore.FieldValue.serverTimestamp() };
            await db.collection("orders").add(orderData);
            emailjs.send('service_p0qd645', 'template_9vgle6h', { package_name: activeOrder.packageName, client_contact: userEmail, design_type: activeOrder.answers[0], climax: activeOrder.answers[1], text_details: activeOrder.answers[2] });
        }
        
        // Router
        const adminEmails = ["coregrafix.in@gmail.com", "vermasaksham882@gmail.com"];
        if (adminEmails.includes(userEmail)) {
            renderAdminDashboard(name, finalUID, userEmail);
        } else {
            renderDashboard(name, finalUID, userEmail);
        }

    } catch (error) { alert("Google Login Error: " + error.message); }
});

async function finalizeLoginAndSendEmail(userEmail) {
    let name = document.getElementById('authName').value || "Client";
    const pass = document.getElementById('authPass').value;
    const isSignUp = document.getElementById('tabSignUp').classList.contains('active');
    let finalUID = "CG#----";

    try {
        let userCredential;
        if (isSignUp) {
            userCredential = await auth.createUserWithEmailAndPassword(userEmail, pass);
            await userCredential.user.updateProfile({ displayName: name });
            if (userEmail === "coregrafix.in@gmail.com") finalUID = "CG#0001";
            else if (userEmail === "vermasaksham882@gmail.com") finalUID = "CG#0126";
            else if (userEmail === "armazaid406@gmail.com") finalUID = "CG#0226";
            else {
                const currentYear = new Date().getFullYear().toString().slice(-2);
                const usersRef = await db.collection("users").get();
                finalUID = `CG#${(usersRef.size + 10).toString().padStart(2, '0')}${currentYear}`;
            }
            await db.collection("users").doc(userCredential.user.uid).set({ name: name, email: userEmail, cgUid: finalUID, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        } else {
            userCredential = await auth.signInWithEmailAndPassword(userEmail, pass);
            const userDoc = await db.collection("users").doc(userCredential.user.uid).get();
            if (userEmail === "coregrafix.in@gmail.com") finalUID = "CG#0001";
            else if (userEmail === "vermasaksham882@gmail.com") finalUID = "CG#0126";
            else if (userEmail === "armazaid406@gmail.com") finalUID = "CG#0226";
            else if (userDoc.exists && userDoc.data().cgUid) { finalUID = userDoc.data().cgUid; name = userDoc.data().name || userCredential.user.displayName || "Client"; }
        }

        const user = userCredential.user;
        if(activeOrder.packageName !== "") {
            const orderData = { userId: user.uid, cgUid: finalUID, clientName: name, clientEmail: userEmail, package: activeOrder.packageName, price: activeOrder.packagePrice, answers: activeOrder.answers, status: "Awaiting Deposit", timestamp: firebase.firestore.FieldValue.serverTimestamp() };
            await db.collection("orders").add(orderData);
            emailjs.send('service_p0qd645', 'template_9vgle6h', { package_name: activeOrder.packageName, client_contact: userEmail, design_type: activeOrder.answers[0], climax: activeOrder.answers[1], text_details: activeOrder.answers[2] });
        }
        
        // Router
        const adminEmails = ["coregrafix.in@gmail.com", "vermasaksham882@gmail.com"];
        if (adminEmails.includes(userEmail)) {
            renderAdminDashboard(name, finalUID, userEmail);
        } else {
            renderDashboard(name, finalUID, userEmail);
        }
    } catch (error) { alert("Account Error: " + error.message); }
}

document.getElementById('portalAuthForm').addEventListener('submit', (e) => { 
    e.preventDefault(); 
    finalizeLoginAndSendEmail(document.getElementById('authContact').value.trim()); 
});

// Standard Client Dashboard Render
function renderDashboard(clientName, clientUID, clientEmail) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('portalContentBox').classList.add('dashboard-active');
    document.getElementById('dashboardSection').style.display = 'flex';
    document.getElementById('adminDashboardSection').style.display = 'none'; // Hide Admin
    
    document.querySelector('.portal-text').innerText = "DASHBOARD";
    document.getElementById('welcomeName').innerText = clientName.split(" ")[0];
    document.getElementById('dashUIDDisplay').innerText = clientUID;
    
    document.getElementById('settingName').value = clientName;
    document.getElementById('settingEmail').value = clientEmail || document.getElementById('authContact').value;

    if(activeOrder.packageName !== "") {
        document.getElementById('dashWelcome').style.display = 'none';
        document.getElementById('dashOrder').style.display = 'block';
        document.getElementById('activeOrderName').innerText = activeOrder.packageName;
        if (activeOrder.answers.length >= 2) document.getElementById('activeOrderBrief').innerText = `Brief: ${activeOrder.answers[0]} - ${activeOrder.answers[1]}`;
        
        const depAmount = Math.ceil(activeOrder.packagePrice / 2);
        document.getElementById('depositAmount').innerText = depAmount;
        document.getElementById('qrAmountDisplay').innerText = depAmount;
        
        let revs = "--";
        if(activeOrder.packageName.includes("Iron")) revs = "10";
        if(activeOrder.packageName.includes("Silver")) revs = "20";
        if(activeOrder.packageName.includes("Gold")) revs = "Unlimited";
        document.getElementById('revisionCounter').innerText = `Revisions Used: 0 / ${revs}`;
    } else {
        document.getElementById('dashWelcome').style.display = 'block';
        document.getElementById('dashOrder').style.display = 'none';
        document.getElementById('revisionCounter').innerText = "Revisions Used: 0 / --";
    }
}

// ----------------------------------------------------
// COMMAND CENTER LOGIC
// ----------------------------------------------------
function renderAdminDashboard(adminName, adminUID, adminEmail) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('portalContentBox').classList.add('dashboard-active');
    document.getElementById('dashboardSection').style.display = 'none'; // Hide Client
    document.getElementById('adminDashboardSection').style.display = 'flex';
    
    document.querySelector('.portal-text').innerText = "COMMAND CENTER";
    document.getElementById('adminUIDDisplay').innerText = adminUID;

    fetchAdminOrders();
}

async function fetchAdminOrders() {
    const feed = document.getElementById('adminOrdersFeed');
    feed.innerHTML = '<p style="color: var(--cyan); text-align: center; font-weight: bold;">Syncing with Firestore Database...</p>';
    
    try {
        const snapshot = await db.collection("orders").orderBy("timestamp", "desc").get();
        
        if (snapshot.empty) {
            feed.innerHTML = '<div class="pro-dash-card" style="text-align: center; padding: 2rem;">No active orders found in the database.</div>';
            return;
        }
        
        feed.innerHTML = ""; 
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const orderId = doc.id; 
            const answers = data.answers || ["N/A", "N/A", "N/A"];
            
            const orderHTML = `
                <div class="admin-order-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: #fff; margin: 0;">${data.clientName} <span style="font-size: 0.75rem; background: #111; color: var(--cyan); padding: 2px 6px; border-radius: 4px; margin-left: 10px;">${data.cgUid}</span></h3>
                        <span class="status-badge awaiting-deposit">${data.status || "Awaiting Deposit"}</span>
                    </div>
                    
                    <div class="admin-order-details">
                        <div>
                            <p style="color: #777; margin-bottom: 5px;"><strong>Package:</strong> <span style="color: var(--cyan);">${data.package}</span> (₹${data.price})</p>
                            <p style="color: #777; margin-bottom: 5px;"><strong>Email:</strong> <span style="color: #fff;">${data.clientEmail}</span></p>
                            <p style="color: #777;"><strong>Order ID:</strong> <span style="font-family: monospace; font-size: 0.7rem;">${orderId}</span></p>
                        </div>
                        <div style="background: #111; padding: 10px; border-radius: 4px; border: 1px solid #333;">
                            <p style="color: var(--cyan); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Client Brief</p>
                            <p><strong>Niche:</strong> ${answers[0]}</p>
                            <p><strong>Concept:</strong> ${answers[1]}</p>
                            <p><strong>Text:</strong> ${answers[2]}</p>
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem; display: flex; gap: 10px;">
                        <button class="admin-action-btn" style="background: var(--cyan); color: #000;" onclick="alert('Draft Upload Portal opening soon!')">Upload Draft</button>
                        <button class="admin-action-btn" style="background: #222; color: #fff;" onclick="alert('Marking as paid...')">Approve Deposit</button>
                    </div>
                </div>
            `;
            feed.innerHTML += orderHTML;
        });

    } catch (error) {
        console.error(error);
        feed.innerHTML = `<p style="color: #ff3366; text-align: center;">Connection Error: Ensure your Firestore Database is published.</p>`;
    }
}

// ==========================================
// 6. QR PAYMENT MODAL
// ==========================================
const initiatePaymentBtn = document.getElementById('initiatePaymentBtn');
const qrModal = document.getElementById('qrModal');
const qrTimerEl = document.getElementById('qrTimer');
let qrInterval;

initiatePaymentBtn.addEventListener('click', () => { qrModal.classList.add('active'); startQRTimer(); });

function startQRTimer() {
    let timeLeft = 60; qrTimerEl.innerText = "01:00";
    qrInterval = setInterval(() => {
        timeLeft--;
        qrTimerEl.innerText = "00:" + (timeLeft < 10 ? "0" + timeLeft : timeLeft);
        if (timeLeft <= 0) { clearInterval(qrInterval); finalizeQRWindow(); }
    }, 1000);
}

function finalizeQRWindow() {
    qrModal.classList.remove('active');
    document.getElementById('dashStatusBadge').className = 'status-badge verifying-badge';
    document.getElementById('dashStatusBadge').innerText = 'Verifying Payment';
    document.getElementById('depositBoxContent').innerHTML = `<h2 style="color: #ff6600; margin-bottom: 10px; font-size: 2rem;">Verifying Payment...</h2><p style="color: var(--text-muted);">Please wait while we confirm the transaction with our bank. It may take a few minutes.</p>`;
    emailjs.send('service_p0qd645', 'template_9vgle6h', { package_name: "PAYMENT VERIFICATION REQUIRED", client_contact: document.getElementById('authContact').value || "Active User", design_type: "Client completed the 60-second QR scan window.", climax: "Please check your bank/UPI application now.", text_details: `Amount Expected: ₹${Math.ceil(activeOrder.packagePrice / 2)}` });
}

// ==========================================
// 7. LEGAL MODALS & FAQ
// ==========================================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        question.classList.toggle('active');
        const answer = question.nextElementSibling;
        answer.style.maxHeight = question.classList.contains('active') ? answer.scrollHeight + "px" : 0;
    });
});

const legalModal = document.getElementById('legalModal');
const legalTitle = document.getElementById('legalTitle');
const legalBody = document.getElementById('legalBody');
const tosText = `<h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">1. Project Initiation</h3><p style="margin-bottom: 1.5rem; line-height: 1.6;">All design requests must be submitted through the Core Grafix portal...</p>`;
const refundText = `<h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">1. The 50% Deposit</h3><p style="margin-bottom: 1.5rem; line-height: 1.6;">To initiate any project and secure your spot in our queue...</p>`;

document.getElementById('openTOS').addEventListener('click', (e) => { e.preventDefault(); legalTitle.innerText = "Terms of Service"; legalBody.innerHTML = tosText; legalModal.classList.add('active'); });
document.getElementById('openRefund').addEventListener('click', (e) => { e.preventDefault(); legalTitle.innerText = "Refund Policy"; legalBody.innerHTML = refundText; legalModal.classList.add('active'); });
document.getElementById('closeLegalModal').addEventListener('click', () => legalModal.classList.remove('active'));
