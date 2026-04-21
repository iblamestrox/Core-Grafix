// DOM Elements
const heroOrderBtn = document.getElementById('heroOrderBtn');
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const quoteForm = document.getElementById('quoteForm');

const chatWidget = document.getElementById('chatWidget');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatBody = document.getElementById('chatBody');
const chatFooter = document.getElementById('chatFooter');

// Accounts Portal Elements
const portalBtn = document.getElementById('openPortalBtn');
const portalModal = document.getElementById('portalModal');
const closePortalModal = document.getElementById('closePortalModal');
const tabSignIn = document.getElementById('tabSignIn');
const tabSignUp = document.getElementById('tabSignUp');
const signupOnlyFields = document.querySelectorAll('.signup-only');
const portalAuthForm = document.getElementById('portalAuthForm');

// Fiverr-style Questions
const chatFlow = [
    { botText: "Briefly explain the 'climax' or most important moment of your video so I can design the thumbnail around it. (Note: Generic answers like 'good video' will be cancelled).", type: "text", placeholder: "Type your video climax..." },
    { botText: "What is the final Video Title, and what specific 2–4 words of text do you want printed on the thumbnail?", type: "text", placeholder: "Title & Text..." },
    { botText: "Which style best fits your channel's niche?", type: "select", options: ["High-Energy Gaming / Anime", "Clean / Documentary / Finance", "Vlog / Lifestyle", "Corporate / Brand"] },
    { botText: "Upload your resource file (Optional). Feel free to attach any specific references, logos, or cutouts.", type: "file" }
];
let currentStep = 0;

// ==========================================
// ORDER MODAL & CHAT LOGIC
// ==========================================
heroOrderBtn.addEventListener('click', () => {
    orderModal.classList.add('active');
});

closeOrderModal.addEventListener('click', () => {
    orderModal.classList.remove('active');
});

chatToggleBtn.addEventListener('click', () => {
    chatWidget.classList.toggle('active');
    if (chatWidget.classList.contains('active') && chatBody.innerHTML === "") {
        addMessage("Hey! Feel free to ask any questions, or click 'Get Your Design' to start an order.", 'bot');
        chatFooter.innerHTML = "";
    }
});

closeChatBtn.addEventListener('click', () => {
    chatWidget.classList.remove('active');
});

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

function initActiveOrder(designType) {
    chatBody.innerHTML = "";
    currentStep = 0;
    const badge = document.createElement('div');
    badge.classList.add('order-badge');
    badge.innerText = `Active Order: ${designType}`;
    chatBody.appendChild(badge);

    setTimeout(() => {
        addMessage("Quote request received! I just need a few specific details to start the work.", 'bot');
        setTimeout(() => {
            addMessage(chatFlow[currentStep].botText, 'bot');
            renderInput();
        }, 800);
    }, 400);
}

function renderInput() {
    chatFooter.innerHTML = "";
    if (currentStep >= chatFlow.length) {
        addMessage("Perfect. We have submitted your order! Our team will review these assets and reach out to you shortly with pricing and time.", 'bot');
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
                sendBtn.innerText = "Send";
                sendBtn.style.backgroundColor = "var(--cyan)";
                sendBtn.style.color = "#000";
            } else {
                document.getElementById('fileNameDisplay').innerText = "Select File (Optional)";
                sendBtn.innerText = "Skip";
                sendBtn.style.backgroundColor = "#555";
                sendBtn.style.color = "#fff";
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
        if (inputEl.files && inputEl.files.length > 0) {
            userVal = "Uploaded: " + inputEl.files[0].name;
        } else {
            userVal = "Skipped (No file attached)";
        }
    } else {
        userVal = inputEl.value.trim();
        if (!userVal) return;
    }

    addMessage(userVal, 'user');
    chatFooter.innerHTML = "";
    currentStep++;

    setTimeout(() => {
        if (currentStep < chatFlow.length) {
            addMessage(chatFlow[currentStep].botText, 'bot');
        }
        renderInput();
    }, 600);
}

// ==========================================
// ACCOUNTS PORTAL LOGIC
// ==========================================
portalBtn.addEventListener('click', () => {
    portalModal.classList.add('active');
});

closePortalModal.addEventListener('click', () => {
    portalModal.classList.remove('active');
});

tabSignIn.addEventListener('click', () => {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    signupOnlyFields.forEach(field => field.style.display = 'none');
    document.querySelector('.auth-submit-btn').innerText = "Access Dashboard";
});

tabSignUp.addEventListener('click', () => {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    signupOnlyFields.forEach(field => field.style.display = 'block');
    document.querySelector('.auth-submit-btn').innerText = "Create Account";
});

portalAuthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const contactInfo = document.getElementById('authContact').value;
    alert(`Success! Backend portal connection pending. Welcome, ${contactInfo}!`);
    portalModal.classList.remove('active');
    portalAuthForm.reset();
});