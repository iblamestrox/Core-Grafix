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
// 3. PRICING & CHAT LOGIC (Soft Gate)
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

function initActiveOrder() {
    chatBody.innerHTML = ""; currentStep = 0;
    addMessage(`Awesome choice! You selected the ${activeOrder.packageName}. Let's get the details.`, 'bot');
    setTimeout(() => { addMessage(chatFlow[currentStep].botText, 'bot'); renderInput(); }, 800);
}

function renderInput() {
    const chatFooter = document.getElementById('chatFooter');
    if (currentStep >= chatFlow.length) {
        chatFooter.innerHTML = "";
        addMessage("Perfect! I have your details. To secure your spot and pay the deposit, please log in.", 'bot');
        setTimeout(() => { chatWidget.classList.remove('active'); portalModal.classList.add('active'); }, 2500);
        return;
    }
    chatFooter.innerHTML = `<input type="text" class="chat-input" id="chatInput"> <button class="chat-send" id="chatSendBtn">Send</button>`;
    document.getElementById('chatSendBtn').addEventListener('click', handleUserSubmit);
}

function handleUserSubmit() {
    const inputEl = document.getElementById('chatInput');
    const userVal = inputEl.value.trim(); if (!userVal) return;
    
    activeOrder.answers.push(userVal);
    addMessage(userVal, 'user');
    currentStep++;
    
    if (currentStep < chatFlow.length) {
        setTimeout(() => { addMessage(chatFlow[currentStep].botText, 'bot'); renderInput(); }, 600);
    } else {
        renderInput(); 
    }
}

// ==========================================
// 4. AUTH, DASHBOARD LOGIC, & EMAILJS 
// ==========================================
const portalBtn = document.getElementById('openPortalBtn');
const closePortalModal = document.getElementById('closePortalModal');

// When user clicks the top nav Accounts button directly (just logging in, no order)
portalBtn.addEventListener('click', () => {
    activeOrder = { packageName: "", packagePrice: 0, answers: [] }; // Reset order memory
    portalModal.classList.add('active');
});

closePortalModal.addEventListener('click', () => portalModal.classList.remove('active'));

document.getElementById('tabSignIn').addEventListener('click', (e) => {
    e.target.classList.add('active'); document.getElementById('tabSignUp').classList.remove('active');
    document.querySelector('.auth-submit-btn').innerText = "Access Dashboard";
    // Hide 'Full Name' Input
    document.querySelectorAll('.signup-only').forEach(el => el.style.display = 'none');
});

document.getElementById('tabSignUp').addEventListener('click', (e) => {
    e.target.classList.add('active'); document.getElementById('tabSignIn').classList.remove('active');
    document.querySelector('.auth-submit-btn').innerText = "Create Account";
    // Show 'Full Name' Input
    document.querySelectorAll('.signup-only').forEach(el => el.style.display = 'block');
});

// Handles Dashboard Display Rules (Welcome Screen vs Payment Gate)
function finalizeLoginAndSendEmail(userEmail) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('portalContentBox').classList.add('dashboard-active');
    
    setTimeout(() => {
        document.getElementById('dashboardSection').style.display = 'flex';
        document.querySelector('.portal-text').innerText = "DASHBOARD";
        
        if(activeOrder.packageName !== "") {
            // USER HAS AN ACTIVE ORDER: Fire EmailJS & Show Deposit UI
            const templateParams = {
                package_name: activeOrder.packageName,
                client_contact: userEmail,
                design_type: activeOrder.answers[0] || "N/A",
                climax: activeOrder.answers[1] || "N/A",
                text_details: activeOrder.answers[2] || "N/A"
            };

            emailjs.send('service_p0qd645', 'template_9vgle6h', templateParams)
                .then(function() { console.log('Order Sent to Gmail!'); }, 
                      function(err) { console.log('EmailJS Error:', err); });
            
            document.getElementById('dashWelcome').style.display = 'none';
            document.getElementById('dashOrder').style.display = 'block';
            document.getElementById('dashHistoryList').innerHTML = `<li class="history-item active"><span class="history-id">#CG-NEW</span><br><span style="color:#fff">${activeOrder.packageName}</span></li>`;
            
            const depAmount = Math.ceil(activeOrder.packagePrice / 2);
            document.getElementById('depositAmount').innerText = depAmount;
            document.getElementById('qrAmountDisplay').innerText = depAmount;
            
        } else {
            // USER JUST CREATED ACCOUNT DIRECTLY: Show Welcome UI (No Pay Gate)
            document.getElementById('dashWelcome').style.display = 'block';
            document.getElementById('dashOrder').style.display = 'none';
            document.getElementById('dashHistoryList').innerHTML = "";
        }
    }, 300);
}

document.getElementById('portalAuthForm').addEventListener('submit', (e) => {
    e.preventDefault(); finalizeLoginAndSendEmail(document.getElementById('authContact').value);
});
document.querySelector('.google-btn').addEventListener('click', () => finalizeLoginAndSendEmail("Google_User@gmail.com"));

// ==========================================
// 5. 60-SECOND TIMED QR PAYMENT FLOW
// ==========================================
const initiatePaymentBtn = document.getElementById('initiatePaymentBtn');
const qrModal = document.getElementById('qrModal');
const qrTimerEl = document.getElementById('qrTimer');
let qrInterval;

initiatePaymentBtn.addEventListener('click', () => {
    qrModal.classList.add('active');
    startQRTimer();
});

function startQRTimer() {
    let timeLeft = 60; // 60 Seconds
    qrTimerEl.innerText = "01:00";
    
    qrInterval = setInterval(() => {
        timeLeft--;
        let displaySeconds = timeLeft < 10 ? "0" + timeLeft : timeLeft;
        qrTimerEl.innerText = "00:" + displaySeconds;

        if (timeLeft <= 0) {
            clearInterval(qrInterval);
            finalizeQRWindow();
        }
    }, 1000);
}

function finalizeQRWindow() {
    qrModal.classList.remove('active');
    
    document.getElementById('dashStatusBadge').className = 'status-badge verifying-badge';
    document.getElementById('dashStatusBadge').innerText = 'Verifying Payment';
    
    document.getElementById('depositBoxContent').innerHTML = `
        <h2 style="color: #ff6600; margin-bottom: 10px; font-size: 2rem;">Verifying Payment...</h2>
        <p style="color: var(--text-muted);">Please wait while we confirm the transaction with our bank. It may take a few minutes.</p>
    `;

    const verificationParams = {
        package_name: "PAYMENT VERIFICATION REQUIRED",
        client_contact: document.getElementById('authContact').value || "Active User",
        design_type: "Client completed the 60-second QR scan window.",
        climax: "Please check your bank/UPI application now.",
        text_details: `Amount Expected: ₹${Math.ceil(activeOrder.packagePrice / 2)}`
    };

    emailjs.send('service_p0qd645', 'template_9vgle6h', verificationParams)
        .then(() => console.log('Verification Alert Sent!'));
}

// ==========================================
// 6. PERFECTED EXACT LEGAL MODALS
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

document.getElementById('openTOS').addEventListener('click', (e) => {
    e.preventDefault(); 
    legalTitle.innerText = "Terms of Service"; 
    legalBody.innerHTML = tosText; 
    legalModal.classList.add('active');
});

document.getElementById('openRefund').addEventListener('click', (e) => {
    e.preventDefault(); 
    legalTitle.innerText = "Refund Policy"; 
    legalBody.innerHTML = refundText; 
    legalModal.classList.add('active');
});

closeLegalModal.addEventListener('click', () => legalModal.classList.remove('active'));
