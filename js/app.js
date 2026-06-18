/* app.js — Core Grafix frontend interactions */
(function(){
  // Simple DOM helpers
  const $ = (s, root=document)=> root.querySelector(s);
  const $$ = (s, root=document)=> Array.from(root.querySelectorAll(s));

  // Elements
  const preloader = $('#preloader');
  const ctaGet = $('#cta-get');
  const ctaHero = $('#cta-hero');
  const chatWidget = $('#chat-widget');
  const chatBody = $('#chat-body');
  const chatInput = $('#chat-input-field');
  const chatClose = $('#chat-close');
  const btnLogin = $('#btn-login');
  const dashboard = $('#dashboard');
  const adminFeed = $('#admin-feed');
  const globalFeed = $('#global-feed');
  const orderTracker = $('#order-tracker');
  const qrModal = $('#qr-modal');
  const qrTimerEl = $('#qr-timer');
  const qrState = $('#qr-state');
  const btnVerify = $('#btn-verify');
  const btnCloseQr = $('#btn-close-qr');

  // Mock portfolio images (ratios: 16:9, square, ultrawide)
  const portfolioItems = [
    {w:16,h:9,src:'https://picsum.photos/seed/p1/1200/675'},
    {w:1,h:1,src:'https://picsum.photos/seed/p2/800/800'},
    {w:2.39,h:1,src:'https://picsum.photos/seed/p3/1200/500'},
    {w:16,h:9,src:'https://picsum.photos/seed/p4/1200/675'},
    {w:1,h:1,src:'https://picsum.photos/seed/p5/800/800'},
    {w:2.39,h:1,src:'https://picsum.photos/seed/p6/1200/500'},
    {w:16,h:9,src:'https://picsum.photos/seed/p7/1200/675'},
    {w:1,h:1,src:'https://picsum.photos/seed/p8/800/800'},
  ];

  // Render masonry
  const masonry = $('#masonry');
  function renderPortfolio(){
    masonry.innerHTML = '';
    portfolioItems.forEach((it, idx)=>{
      const div = document.createElement('div');
      div.className = 'masonry-item';
      const img = document.createElement('img');
      img.src = it.src;
      img.alt = `Portfolio ${idx+1}`;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = ['Thumbnail','Banner','Poster'][idx%3];
      div.appendChild(img);
      div.appendChild(meta);
      masonry.appendChild(div);
    })
  }

  // Preloader hide after DOM ready
  window.addEventListener('load', ()=>{
    setTimeout(()=>{
      preloader.classList.add('hidden');
    },700);
    renderPortfolio();
    startTestimonialSlider();
  });

  // Chat flow state
  const brief = {type:'',climax:'',copy:''};
  const chatSteps = [
    {key:'type', prompt:'What type of design do you want? (e.g., Minecraft Thumbnail)'} ,
    {key:'climax', prompt:"What's the climax or core concept? (one sentence)"},
    {key:'copy', prompt:'What specific text/copy should appear on the graphic?'}
  ];
  let chatStepIndex = 0;

  function openChat(){
    chatWidget.classList.remove('hidden');
    chatBody.innerHTML = '';
    addBotMessage(chatSteps[0].prompt);
    chatStepIndex = 0;
    chatInput.focus();
  }

  function closeChat(){
    chatWidget.classList.add('hidden');
  }

  function addBotMessage(text){
    const el = document.createElement('div'); el.className='bot'; el.textContent = text; chatBody.appendChild(el); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function addUserMessage(text){
    const el = document.createElement('div'); el.className='user'; el.textContent = text; el.style.marginTop='8px'; chatBody.appendChild(el); chatBody.scrollTop = chatBody.scrollHeight;
  }

  chatInput.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){ const v = chatInput.value.trim(); if(!v) return; addUserMessage(v); chatInput.value='';
      const step = chatSteps[chatStepIndex]; brief[step.key]=v; chatStepIndex++;
      if(chatStepIndex < chatSteps.length){ setTimeout(()=>addBotMessage(chatSteps[chatStepIndex].prompt),400); }
      else{ setTimeout(()=>{ addBotMessage('Thanks — choose a package to continue.'); showPackageOptions(); },600); }
    }
  });

  function showPackageOptions(){
    const el = document.createElement('div'); el.className='bot'; el.innerHTML = `
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn" onclick="window.__cg_choose('iron')">Iron — ₹299</button>
        <button class="btn" onclick="window.__cg_choose('silver')">Silver — ₹749</button>
        <button class="btn" onclick="window.__cg_choose('gold')">Gold — ₹999</button>
      </div>`;
    chatBody.appendChild(el); chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Expose choice to global for buttons inside string html
  window.__cg_choose = function(pack){
    addBotMessage(`You picked ${pack.toUpperCase()}. Next: you must login to reserve a slot.`);
    // simulate required login
    setTimeout(()=>{
      promptLoginForPayment(pack);
    },600);
  }

  function promptLoginForPayment(pack){
    closeChat();
    // open a quick login prompt (demo)
    const email = prompt('Enter your email to continue (demo):');
    if(!email) return alert('Login required to continue.');
    // mock save user
    localStorage.setItem('cg_user', JSON.stringify({email:email,uid: 'cg_'+Date.now()}));
    // store brief and pack as pending order
    localStorage.setItem('cg_pending_order', JSON.stringify({brief,pack,created:Date.now(),status:'deposit_pending'}));
    openQrModal();
    updateDashboard();
  }

  // QR Modal / 60s timer
  let qrTimer = null; let qrRemaining = 60;
  function openQrModal(){
    qrModal.classList.remove('hidden'); qrRemaining = 60; updateQrUI();
    qrTimer = setInterval(()=>{
      qrRemaining--; if(qrRemaining<=0){ clearInterval(qrTimer); onQrTimeout(); }
      updateQrUI();
    },1000);
  }
  function updateQrUI(){
    const mm = String(Math.floor(qrRemaining/60)).padStart(2,'0');
    const ss = String(qrRemaining%60).padStart(2,'0');
    qrTimerEl.textContent = `${mm}:${ss}`;
  }
  function onQrTimeout(){
    qrState.textContent = 'Verifying Payment...';
    // Simulate server verification delay
    setTimeout(()=>{
      // For demo: mark payment as complete and move to Drafting state
      const ord = JSON.parse(localStorage.getItem('cg_pending_order')||'null');
      if(ord){ ord.status='drafting'; ord.depositPaid=true; localStorage.setItem('cg_pending_order', JSON.stringify(ord)); updateDashboard(); globalFeedInsert(ord); }
      qrState.textContent = 'Payment Verified — Drafting started';
      btnVerify.classList.remove('hidden');
    },1800);
  }

  btnVerify.addEventListener('click', ()=>{
    // manual verify for demo
    const ord = JSON.parse(localStorage.getItem('cg_pending_order')||'null'); if(ord){ ord.status='drafting'; ord.depositPaid=true; localStorage.setItem('cg_pending_order', JSON.stringify(ord)); updateDashboard(); globalFeedInsert(ord); qrState.textContent='Payment Verified — Drafting started'; }
  });
  btnCloseQr.addEventListener('click', ()=>{ qrModal.classList.add('hidden'); if(qrTimer) clearInterval(qrTimer); });

  // Dashboard update
  function updateDashboard(){
    const user = JSON.parse(localStorage.getItem('cg_user')||'null');
    const ord = JSON.parse(localStorage.getItem('cg_pending_order')||'null');
    if(user){ dashboard.classList.remove('hidden'); btnLogin.textContent = 'Profile'; }
    if(ord){ orderTracker.textContent = `Order: ${ord.pack.toUpperCase()} — Status: ${ord.status || 'deposit_pending'}`; }
  }

  // Global feed insert (admin view)
  function globalFeedInsert(ord){
    const el = document.createElement('div'); el.style.padding='8px'; el.style.borderBottom='1px solid rgba(255,255,255,0.03)';
    el.textContent = `[${new Date().toLocaleTimeString()}] ${ord.pack.toUpperCase()} — ${ord.brief.type} — status: ${ord.status}`;
    if(globalFeed) globalFeed.prepend(el);
  }

  // Testimonial slider
  function startTestimonialSlider(){
    const slider = $('#testimonial-slider'); if(!slider) return;
    let i=0; setInterval(()=>{
      slider.style.transform = `translateX(-${i*100}%)`; i = (i+1)%3;
      slider.style.transition='transform 600ms ease';
    },4200);
  }

  // Admin toggle: simple demo via prompt
  function tryAdminReveal(){
    const adminCode = localStorage.getItem('cg_admin_code');
    if(adminCode==='iamadmin'){ adminFeed.classList.remove('hidden'); dashboard.classList.add('hidden'); }
  }

  // Simple login button behaviour
  btnLogin.addEventListener('click', ()=>{
    const user = JSON.parse(localStorage.getItem('cg_user')||'null');
    if(user){
      // show profile quick actions
      const ans = prompt('Type "logout" to sign out or "admin" to attempt admin (demo):');
      if(ans==='logout'){ localStorage.removeItem('cg_user'); localStorage.removeItem('cg_pending_order'); dashboard.classList.add('hidden'); adminFeed.classList.add('hidden'); btnLogin.textContent='Login'; alert('Signed out (demo)'); }
      if(ans==='admin'){ const code = prompt('Enter admin code (demo):'); if(code==='iamadmin'){ localStorage.setItem('cg_admin_code','iamadmin'); tryAdminReveal(); alert('Admin mode enabled (demo)'); }}
    } else {
      const email = prompt('Enter your email to sign up (demo):'); if(!email) return; localStorage.setItem('cg_user', JSON.stringify({email:email,uid:'cg_'+Date.now()})); updateDashboard(); alert('Signed in (demo)');
    }
  });

  // Wire CTAs
  ctaGet.addEventListener('click', openChat);
  ctaHero.addEventListener('click', openChat);
  chatClose.addEventListener('click', closeChat);

  // On load, update dashboard
  updateDashboard(); tryAdminReveal();

})();
