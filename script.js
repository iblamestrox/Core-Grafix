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

// ==========================================
// 1. CINEMATIC PRELOADER
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 1200);
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
// 4. AUTH, UI & FIREBASE ENGINE 
// ==========================================
const portalBtn = document.getElementById('openPortalBtn');
const closePortalModal = document.getElementById('closePortalModal');

// Password Visibility Toggle
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

// Open Accounts Directly
portalBtn.addEventListener('click', () => {
    activeOrder = { packageName: "", packagePrice: 0, answers: [] }; 
    portalModal.classList.add('active');
});

closePortalModal.addEventListener('click', () => portalModal.classList.remove('active'));

// Tab Listeners (dynamically updates the Submit button text)
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

// The Engine: Logs user in, generates V1.2 UID, saves to DB
async function finalizeLoginAndSendEmail(userEmail) {
    let name = document.getElementById('authName').value || "Client";
    const pass = document.getElementById('authPass').value;
    
    // FIREBASE BUG FIX: Checks the active tab to safely determine Sign Up vs Sign In
    const isSignUp = document.getElementById('tabSignUp').classList.contains('active');
    let finalUID = "CG#----";

    try {
        let userCredential;
        
        if (isSignUp) {
            userCredential = await auth.createUserWithEmailAndPassword(userEmail, pass);
            await userCredential.user.updateProfile({ displayName: name });
            
            const currentYear = new Date().getFullYear().toString().slice(-2); // e.g. "26"

            // Custom Hardcoded UIDs for Admins
            if (userEmail === "coregrafix.in@gmail.com") finalUID = "CG#0001";
            else if (userEmail === "vermasaksham882@gmail.com") finalUID = `CG#01${currentYear}`;
            else if (userEmail === "armazaid406@gmail.com") finalUID = `CG#02${currentYear}`;
            else {
                // Generate sequential ID
                const usersRef = await db.collection("users").get();
                const count = usersRef.size + 1; 
                const paddedCount = count.toString().padStart(2, '0'); // Makes '5' into '05'
                finalUID = `CG#${paddedCount}${currentYear}`;
            }

            // Save user info into database
            await db.collection("users").doc(userCredential.user.uid).set({
                name: name, email: userEmail, cgUid: finalUID, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        } else {
            // Sign In
            userCredential = await auth.signInWithEmailAndPassword(userEmail, pass);
            const userDoc = await db.collection("users").doc(userCredential.user.uid).get();
            if (userDoc.exists) {
                finalUID = userDoc.data().cgUid;
                name = userDoc.data().name; 
            }
        }

        const user = userCredential.user;

        // Process Active Order
        if(activeOrder.packageName !== "") {
            const orderData = {
                userId: user.uid, cgUid: finalUID, clientName: name, clientEmail: userEmail,
                package: activeOrder.packageName, price: activeOrder.packagePrice, answers: activeOrder.answers,
                status: "Awaiting Deposit", timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection("orders").add(orderData);

            const templateParams = { package_name: activeOrder.packageName, client_contact: userEmail, design_type: activeOrder.answers[0], climax: activeOrder.answers[1], text_details: activeOrder.answers[2] };
            emailjs.send('service_p0qd645', 'template_9vgle6h', templateParams);
        }

        // Render purely to V1.2 UI
        renderDashboard(name, finalUID);

    } catch (error) {
        alert("Account Error: " + error.message);
    }
}

// BUG FIX: Uses .trim() to chop off hidden spaces caused by phone Auto-Fill
document.getElementById('portalAuthForm').addEventListener('submit', (e) => { 
    e.preventDefault(); 
    const cleanedEmail = document.getElementById('authContact').value.trim();
    finalizeLoginAndSendEmail(cleanedEmail); 
});

function renderDashboard(clientName, clientUID) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('portalContentBox').classList.add('dashboard-active');
    document.getElementById('dashboardSection').style.display = 'flex';
    document.querySelector('.portal-text').innerText = "DASHBOARD";
    
    // Inject Custom ID directly into V1.2 header
    document.getElementById('welcomeName').innerText = `Welcome, ${clientName.split(" ")[0]}`;
    document.getElementById('dashUIDDisplay').innerText = clientUID;

    if(activeOrder.packageName !== "") {
        document.getElementById('dashWelcome').style.display = 'none';
        document.getElementById('dashOrder').style.display = 'block';
        document.getElementById('dashHistoryList').innerHTML = `<li class="history-item active"><span class="history-id">#CG-NEW</span><br><span style="color:#fff">${activeOrder.packageName}</span></li>`;
        
        const depAmount = Math.ceil(activeOrder.packagePrice / 2);
        document.getElementById('depositAmount').innerText = depAmount;
        document.getElementById('qrAmountDisplay').innerText = depAmount;
    } else {
        document.getElementById('dashWelcome').style.display = 'block';
        document.getElementById('dashOrder').style.display = 'none';
    }
}

// ==========================================
// 5. 60-SECOND TIMED QR PAYMENT FLOW
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
    const verificationParams = { package_name: "PAYMENT VERIFICATION REQUIRED", client_contact: document.getElementById('authContact').value || "Active User", design_type: "Client completed the 60-second QR scan window.", climax: "Please check your bank/UPI application now.", text_details: `Amount Expected: ₹${Math.ceil(activeOrder.packagePrice / 2)}` };
    emailjs.send('service_p0qd645', 'template_9vgle6h', verificationParams);
}

// ==========================================
// 6. FAQ ACCORDION (RESTORED)
// ==========================================
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        question.classList.toggle('active');
        const answer = question.nextElementSibling;
        if (question.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = 0;
        }
    });
});

// ==========================================
// 7. LEGAL MODALS
// ==========================================
const legalModal = document.getElementById('legalModal');
const closeLegalModal = document.getElementById('closeLegalModal');
const legalTitle = document.getElementById('legalTitle');
const legalBody = document.getElementById('legalBody');

const tosText = `
    <h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">1. Project Initiation</h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">All design requests must be submitted through the Core Grafix portal. All official project communication, file deliveries, and feedback will take place via the client's provided Email address to ensure a clear paper trail.</p>
    <h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">2. Revisions & Approvals</h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">Revisions are limited to the exact amount specified in your chosen package (e.g., 10, 20, or Unlimited). A "revision" constitutes a minor tweak to text, color, or layout. Requesting a completely new, from-scratch design concept does not count as a revision and will require a new active order.</p>
    <h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">3. Intellectual Property</h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">Upon completion of the final 50% payment and delivery of the unwatermarked assets, the client is granted full, unrestricted usage rights. Core Grafix retains the right to display the completed designs in our public portfolio and social media archives.</p>
`;

const refundText = `
    <h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">1. The 50% Deposit</h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">To initiate any project and secure your spot in our queue, a 50% upfront deposit is required. This covers the initial creative labor required to produce your first high-quality draft.</p>
    <h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">2. Cancellation Before Work Begins</h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">If you choose to cancel your order before our team has begun any drafting or compositional work, your 50% deposit will be refunded in full.</p>
    <h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">3. The Draft Phase</h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">Once the initial watermarked draft is delivered to your email, the initial 50% deposit becomes strictly non-refundable. If you are unhappy with the direction and choose to walk away instead of using your revisions, you are free to cancel and will not be billed for the remaining 50%.</p>
    <h3 style="color: var(--cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">4. Final Delivery</h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.6;">Upon final approval of the watermarked draft, the remaining 50% balance must be paid to unlock the final, unwatermarked high-resolution files. Once these final files are delivered, all sales are final.</p>
`;

document.getElementById('openTOS').addEventListener('click', (e) => { e.preventDefault(); legalTitle.innerText = "Terms of Service"; legalBody.innerHTML = tosText; legalModal.classList.add('active'); });
document.getElementById('openRefund').addEventListener('click', (e) => { e.preventDefault(); legalTitle.innerText = "Refund Policy"; legalBody.innerHTML = refundText; legalModal.classList.add('active'); });
closeLegalModal.addEventListener('click', () => legalModal.classList.remove('active'));