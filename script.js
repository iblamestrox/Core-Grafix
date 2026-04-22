// ==========================================
// 1. CINEMATIC SCROLL REVEALS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Only animate once
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
        // Remove active class from all buttons, add to clicked
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        masonryItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.classList.remove('hidden');
                // Quick reflow trigger to restart animation smoothly
                item.style.animation = 'none';
                item.offsetHeight; /* trigger reflow */
                item.style.animation = null; 
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// ==========================================
// 3. ORDER MODAL & CHAT LOGIC
// ==========================================
const heroOrderBtn = document.getElementById('heroOrderBtn');
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const quoteForm = document.getElementById('quoteForm');

const chatWidget = document.getElementById('chatWidget');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatBody = document.getElementById('chatBody');
const chatFooter = document.getElementById('chatFooter');

// Fiverr-style Questions
const chatFlow = [
    { botText: "Briefly explain the 'climax' or most important moment of your video so I can design the thumbnail around it.", type: "text", placeholder: "Type your video climax..." },
    { botText: "What is the final Video Title, and what specific 2–4 words of text do you want printed on the thumbnail?", type: "text", placeholder: "Title & Text..." },
    { botText: "Which style best fits your channel's niche?", type: "select", options: ["High-Energy Gaming / Anime", "Clean / Documentary / Finance", "Vlog / Lifestyle", "Corporate / Brand"] },
    { botText: "Upload your resource file (Optional). Feel free to attach any specific references, logos, or cutouts.", type: "file" }
];
let currentStep = 0;

heroOrderBtn.addEventListener('click', () => orderModal.classList.add('active'));
closeOrderModal.addEventListener('click', () => orderModal.classList.remove('active'));

chatToggleBtn.addEventListener('click', () => {
    chatWidget.classList.toggle('active');
    if (chatWidget.classList.contains('active') && chatBody.innerHTML === "") {
        showTypingIndicator(() => {
            addMessage("Hey! Feel free to ask any questions, or click 'Get Your Design' to start an order.", 'bot');
        });
    }
});

closeChatBtn.addEventListener('click', () => chatWidget.classList.remove('active'));

quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const designType = document.getElementById('designTypeInput').value;
    orderModal.classList.remove('active');
    chatWidget.classList.add('active');
    initActiveOrder(designType);
});

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg', sender);
    msgDiv.innerText = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Bot Personality: Typing Delay
function showTypingIndicator(callback) {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('msg', 'bot', 'typing-bubble');
    typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Random delay between 1.2s and 2s
    const delay = Math.floor(Math.random() * 800) + 1200;
    
    setTimeout(() => {
        typingDiv.remove();
        callback();
    }, delay);
}

function initActiveOrder(designType) {
    chatBody.innerHTML = "";
    currentStep = 0;
    const badge = document.createElement('div');
    badge.classList.add('order-badge');
    badge.innerText = `Active Order: ${designType}`;
    chatBody.appendChild(badge);

    showTypingIndicator(() => {
        addMessage("Quote request received! I just need a few specific details to start the work.", 'bot');
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
            addMessage("Perfect. We have submitted your order! Our team will review these assets and reach out to you shortly.", 'bot');
        });
        return;
    }

    const stepData = chatFlow[currentStep];

    if (stepData.type === 'text') {
        chatFooter.innerHTML = `<input type="text" class="chat-input" id="chatInput" placeholder="${stepData.placeholder}"> <button class="chat-send" id="chatSendBtn">Send</button>`;
    } else if (stepData.type === 'select') {
        let optionsHtml = stepData.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        chatFooter.innerHTML = `<select class="chat-select" id="chatInput">${optionsHtml}</select> <button class="chat-send" id="chatSendBtn">Send</button>`;
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
        renderInput(); // Triggers the final success message
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

// Simulate Login & Transition to Option B Dashboard
portalAuthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide Login, Expand Modal, Show Dashboard
    authSection.style.display = 'none';
    portalContentBox.classList.add('dashboard-active');
    
    setTimeout(() => {
        dashboardSection.style.display = 'flex';
        portalBtn.innerText = "MY DASHBOARD"; // Update nav button
    }, 300); // Wait for modal resize transition
});
