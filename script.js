// ==========================================
// 1. CINEMATIC SCROLL REVEALS & FILTERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

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
// 2. FAQ ACCORDION
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
// 3. LEGAL MODALS (T&C and Refund)
// ==========================================
const legalModal = document.getElementById('legalModal');
const closeLegalModal = document.getElementById('closeLegalModal');
const legalTitle = document.getElementById('legalTitle');
const legalBody = document.getElementById('legalBody');

const tosText = `
    <h3>1. Project Initiation</h3>
    <p>All design requests must be submitted through the Core Grafix portal. All official project communication will take place via the client's provided Email.</p><br>
    <h3>2. Revisions & Approvals</h3>
    <p>Revisions are limited to the amount specified in your chosen package. A "revision" constitutes a minor tweak. Requesting a completely new design concept does not count as a revision and requires a new order.</p><br>
    <h3>3. Intellectual Property</h3>
    <p>Upon final payment and delivery, the client is granted full usage rights. Core Grafix retains the right to display completed designs in our portfolio.</p>
`;

const refundText = `
    <h3>1. The 50% Deposit</h3>
    <p>To initiate any project, a 50% non-refundable deposit is required. This reserves your spot and covers the initial labor required to produce your first draft.</p><br>
    <h3>2. Cancellation Before Work Begins</h3>
    <p>If you cancel before our team has started any work, your deposit will be refunded in full.</p><br>
    <h3>3. The Draft Phase</h3>
    <p>Once the initial watermarked draft is delivered, the deposit becomes non-refundable. If you are unhappy and cancel, you will not be billed for the remaining 50%.</p><br>
    <h3>4. Final Delivery</h3>
    <p>Upon approval, the remaining 50% must be paid to unlock the unwatermarked files. Once delivered, all sales are final.</p>
`;

document.getElementById('openTOS').addEventListener('click', (e) => {
    e.preventDefault(); legalTitle.innerText = "Terms of Service"; legalBody.innerHTML = tosText; legalModal.classList.add('active');
});
document.getElementById('openRefund').addEventListener('click', (e) => {
    e.preventDefault(); legalTitle.innerText = "Refund Policy"; legalBody.innerHTML = refundText; legalModal.classList.add('active');
});
closeLegalModal.addEventListener('click', () => legalModal.classList.remove('active'));

// ==========================================
// 4. PRICING & CHAT LOGIC (Soft Gate)
// ==========================================
const heroOrderBtn = document.getElementById('heroOrderBtn');
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const pricingBtns = document.querySelectorAll('.tier-btn');

const chatWidget = document.getElementById('chatWidget');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatBody = document.getElementById('chatBody');
const chatFooter = document.getElementById('chatFooter');
const portalModal = document.getElementById('portalModal');

// Global Order Data
let activeOrder = {
    packageName: "",
    packagePrice: 0,
    answers: []
};

const chatFlow = [
    { botText: "What type of design are you looking for? (e.g., Minecraft Thumbnail, Tech Banner, Poster)", type: "text", placeholder: "Design type..." },
    { botText: "Briefly explain the 'climax' or concept of the design.", type: "text", placeholder: "Type your concept..." },
    { botText: "What specific 2–4 words of text do you want printed on the graphic?", type: "text", placeholder: "Title & Text..." },
    { botText: "Upload your resource file (Optional). Attach references or logos.", type: "file" }
];
let currentStep = 0;

heroOrderBtn.addEventListener('click', () => orderModal.classList.add('active'));
closeOrderModal.addEventListener('click', () => orderModal.classList.remove('active'));
closeChatBtn.addEventListener('click', () => chatWidget.classList.remove('active'));

pricingBtns.forEach(btn => {
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
    setTimeout(() => { typingDiv.remove(); callback(); }, Math.floor(Math.random() * 800) + 1200);
}

function initActiveOrder() {
    chatBody.innerHTML = ""; currentStep = 0;
    const badge = document.createElement('div');
    badge.classList.add('order-badge'); badge.innerText = `Active Order: ${activeOrder.packageName}`;
    chatBody.appendChild(badge);

    showTypingIndicator(() => {
        addMessage(`Awesome choice! You selected the ${activeOrder.packageName}. I just need a few details so our team can get started.`, 'bot');
        showTypingIndicator(() => {
            addMessage(chatFlow[currentStep].botText, 'bot');
            renderInput();
        });
    });
}

function renderInput() {
    chatFooter.innerHTML = "";
    if (currentStep >= chatFlow.length) {
        showTypingIndicator(() => {
            // SOFT GATE TRIGGER
            addMessage("Perfect. I have all your details! To secure your order and proceed to the 50% deposit, please log in or create an account.", 'bot');
            setTimeout(() => {
                chatWidget.classList.remove('active');
                portalModal.classList.add('active');
            }, 3000);
        });
        return;
    }

    const stepData = chatFlow[currentStep];
    if (stepData.type === 'text') {
        chatFooter.innerHTML = `<input type="text" class="chat-input" id="chatInput" placeholder="${stepData.placeholder}"> <button class="chat-send" id="chatSendBtn">Send</button>`;
    } else if (stepData.type === 'file') {
        chatFooter.innerHTML = `<label class="chat-file-btn"><span id="fileNameDisplay">Select File (Optional)</span><input type="file" id="chatInput" style="display:none;"></label> <button class="chat-send" id="chatSendBtn" style="background-color: #555; color: #fff;">Skip</button>`;
        document.getElementById('chatInput').addEventListener('change', function() {
            const sendBtn = document.getElementById('chatSendBtn');
            if (this.files && this.files.length > 0) {
                document.getElementById('fileNameDisplay').innerText = this.files[0].name;
                sendBtn.innerText = "Send"; sendBtn.style.backgroundColor = "var(--cyan)"; sendBtn.style.color = "#000";
            } else {
                document.getElementById('fileNameDisplay').innerText = "Select File (Optional)";
                sendBtn.innerText = "Skip"; sendBtn.style.backgroundColor = "#555"; sendBtn.style.color = "#fff";
            }
        });
    }

    document.getElementById('chatSendBtn').addEventListener('click', handleUserSubmit);
    if (stepData.type !== 'file') {
        document.getElementById('chatInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserSubmit(); });
        document.getElementById('chatInput').focus();
    }
}

function handleUserSubmit() {
    const inputEl = document.getElementById('chatInput'); let userVal = "";
    if (chatFlow[currentStep].type === 'file') {
        userVal = (inputEl.files && inputEl.files.length > 0) ? "Uploaded: " + inputEl.files[0].name : "Skipped (No file attached)";
    } else {
        userVal = inputEl.value.trim(); if (!userVal) return;
    }
    
    activeOrder.answers.push(userVal); // Save for EmailJS
    addMessage(userVal, 'user');
    chatFooter.innerHTML = ""; currentStep++;

    if (currentStep < chatFlow.length) {
        showTypingIndicator(() => { addMessage(chatFlow[currentStep].botText, 'bot'); renderInput(); });
    } else {
        renderInput(); 
    }
}

// ==========================================
// 5. AUTH, EMAILJS, & DASHBOARD LOGIC
// ==========================================
const portalBtn = document.getElementById('openPortalBtn');
const closePortalModal = document.getElementById('closePortalModal');
const portalContentBox = document.getElementById('portalContentBox');
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const portalAuthForm = document.getElementById('portalAuthForm');

portalBtn.addEventListener('click', () => portalModal.classList.add('active'));
closePortalModal.addEventListener('click', () => portalModal.classList.remove('active'));

document.getElementById('tabSignIn').addEventListener('click', (e) => {
    e.target.classList.add('active'); document.getElementById('tabSignUp').classList.remove('active');
    document.querySelectorAll('.signup-only').forEach(f => f.style.display = 'none');
    document.querySelector('.auth-submit-btn').innerText = "Access Dashboard";
});

document.getElementById('tabSignUp').addEventListener('click', (e) => {
    e.target.classList.add('active'); document.getElementById('tabSignIn').classList.remove('active');
    document.querySelectorAll('.signup-only').forEach(f => f.style.display = 'block');
    document.querySelector('.auth-submit-btn').innerText = "Create Account";
});

// Helper: Transition to Dashboard & Trigger Email
function finalizeLoginAndSendEmail(userEmail) {
    // 1. FIRE EMAILJS ALARM BELL
    if(activeOrder.packageName !== "") {
        const templateParams = {
            package_name: activeOrder.packageName,
            client_contact: userEmail,
            design_type: activeOrder.answers[0] || "N/A",
            climax: activeOrder.answers[1] || "N/A",
            text_details: activeOrder.answers[2] || "N/A",
            to_email: 'coregrafix.in@gmail.com'
        };

        // REPLACE 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with actual EmailJS IDs
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) { console.log('Order Sent to Gmail!', response.status, response.text); }, 
                  function(error) { console.log('Failed to send order email...', error); });
    }

    // 2. UI Transition to Dashboard
    authSection.style.display = 'none';
    portalContentBox.classList.add('dashboard-active');
    
    // 3. Update 50% Deposit Invoice dynamically
    setTimeout(() => {
        dashboardSection.style.display = 'flex';
        document.querySelector('.portal-text').innerText = "DASHBOARD";
        
        if(activeOrder.packageName !== "") {
            document.getElementById('dashHistoryList').innerHTML = `
                <li class="history-item active">
                    <span class="history-id">#CG-NEW</span>
                    <span class="history-desc">${activeOrder.packageName}</span>
                </li>`;
            document.getElementById('dashOrderTitle').innerText = `Order #CG-NEW`;
            document.getElementById('depositAmount').innerText = Math.ceil(activeOrder.packagePrice / 2);
        }
    }, 300);
}

// Form Submit (Email)
portalAuthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('authContact').value;
    finalizeLoginAndSendEmail(email);
});

// Google Button Mock Submit
document.querySelector('.google-btn').addEventListener('click', () => {
    // In a real app, this triggers Firebase Google Auth. For now, we simulate success.
    finalizeLoginAndSendEmail("Google_User@gmail.com");
});
