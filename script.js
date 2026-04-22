// ==========================================
// 1. CINEMATIC SCROLL REVEALS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => observer.observe(el));
});

// ==========================================
// 2. DYNAMIC PORTFOLIO FILTERING
// ==========================================
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
                item.style.animation = 'none';
                item.offsetHeight; 
                item.style.animation = null; 
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// ==========================================
// 3. PRICING MODAL & CHAT LOGIC
// ==========================================
const heroOrderBtn = document.getElementById('heroOrderBtn');
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const pricingBtns = document.querySelectorAll('.tier-btn');

const chatWidget = document.getElementById('chatWidget');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatBody = document.getElementById('chatBody');
const chatFooter = document.getElementById('chatFooter');

const chatFlow = [
    { botText: "What type of design are you looking for? (e.g., Minecraft Thumbnail, Tech Banner, Poster)", type: "text", placeholder: "Design type..." },
    { botText: "Briefly explain the 'climax' or concept of the design.", type: "text", placeholder: "Type your concept..." },
    { botText: "What specific 2–4 words of text do you want printed on the graphic?", type: "text", placeholder: "Title & Text..." },
    { botText: "Upload your resource file (Optional). Attach references or logos.", type: "file" }
];
let currentStep = 0;

// Open Pricing Modal
heroOrderBtn.addEventListener('click', () => orderModal.classList.add('active'));
closeOrderModal.addEventListener('click', () => orderModal.classList.remove('active'));

// Handle Pricing Package Selection
pricingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const selectedPackage = e.target.getAttribute('data-package');
        orderModal.classList.remove('active');
        chatWidget.classList.add('active');
        initActiveOrder(selectedPackage);
    });
});

// Toggle Chat Widget Manually
chatToggleBtn.addEventListener('click', () => {
    chatWidget.classList.toggle('active');
    if (chatWidget.classList.contains('active') && chatBody.innerHTML === "") {
        showTypingIndicator(() => {
            addMessage("Hey! Feel free to ask any questions, or click 'Get Your Design' to select a package.", 'bot');
        });
    }
});

closeChatBtn.addEventListener('click', () => chatWidget.classList.remove('active'));

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

    const delay = Math.floor(Math.random() * 800) + 1200;
    setTimeout(() => {
        typingDiv.remove();
        callback();
    }, delay);
}

function initActiveOrder(packageName) {
    chatBody.innerHTML = "";
    currentStep = 0;
    
    const badge = document.createElement('div');
    badge.classList.add('order-badge');
    badge.innerText = `Active Order: ${packageName}`;
    chatBody.appendChild(badge);

    showTypingIndicator(() => {
        addMessage(`Awesome choice! You selected the ${packageName}. I just need a few details so our team can get started.`, 'bot');
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
            // This is where EmailJS will eventually fire
            addMessage("Perfect. We have captured all details! Please log in to your Account Dashboard to track the progress.", 'bot');
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
        document.getElementById('chatInput').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') handleUserSubmit();
        });
        document.getElementById('chatInput').focus();
    }
}

function handleUserSubmit() {
    const inputEl = document.getElementById('chatInput');
    let userVal = "";

    if (chatFlow[currentStep].type === 'file') {
        userVal = (inputEl.files && inputEl.files.length > 0) ? "Uploaded: " + inputEl.files[0].name : "Skipped (No file attached)";
    } else {
        userVal = inputEl.value.trim();
        if (!userVal) return;
    }

    addMessage(userVal, 'user');
    chatFooter.innerHTML = "";
    currentStep++;

    if (currentStep < chatFlow.length) {
        showTypingIndicator(() => {
            addMessage(chatFlow[currentStep].botText, 'bot');
            renderInput();
        });
    } else {
        renderInput(); 
    }
}

// ==========================================
// 4. ACCOUNTS / COMMAND CENTER LOGIC
// ==========================================
const portalBtn = document.getElementById('openPortalBtn');
const portalModal = document.getElementById('portalModal');
const closePortalModal = document.getElementById('closePortalModal');
const portalContentBox = document.getElementById('portalContentBox');

const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');

const tabSignIn = document.getElementById('tabSignIn');
const tabSignUp = document.getElementById('tabSignUp');
const signupOnlyFields = document.querySelectorAll('.signup-only');
const portalAuthForm = document.getElementById('portalAuthForm');

portalBtn.addEventListener('click', () => portalModal.classList.add('active'));
closePortalModal.addEventListener('click', () => portalModal.classList.remove('active'));

tabSignIn.addEventListener('click', () => {
    tabSignIn.classList.add('active'); tabSignUp.classList.remove('active');
    signupOnlyFields.forEach(field => field.style.display = 'none');
    document.querySelector('.auth-submit-btn').innerText = "Access Dashboard";
});

tabSignUp.addEventListener('click', () => {
    tabSignUp.classList.add('active'); tabSignIn.classList.remove('active');
    signupOnlyFields.forEach(field => field.style.display = 'block');
    document.querySelector('.auth-submit-btn').innerText = "Create Account";
});

portalAuthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authSection.style.display = 'none';
    portalContentBox.classList.add('dashboard-active');
    
    setTimeout(() => {
        dashboardSection.style.display = 'flex';
        // Reset mobile icon to Dashboard mode
        document.querySelector('.portal-text').innerText = "DASHBOARD"; 
    }, 300);
});
