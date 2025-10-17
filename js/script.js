/* ========= script.js نهائي متكامل =========
  - sidebar
  - admin modal (password = 1234)
  - إدارة بيانات قسم اتصل بنا (save/load) باستخدام localStorage
  - رفع صور كـ DataURL
=========================================== */

const CONTACT_STORAGE_KEY = 'contactData_v1';
const ADMIN_PASSWORD = '1234';

const defaultContactData = {
  tabTitle: 'تواصل معنا',
  circles: [
    { text: 'النص 1', link: '#', imageData: null },
    { text: 'النص 2', link: '#', imageData: null },
    { text: 'النص 3', link: '#', imageData: null },
    { text: 'النص 4', link: '#', imageData: null },
  ]
};

function readContactData(){
  try{
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if(!raw) return JSON.parse(JSON.stringify(defaultContactData));
    return JSON.parse(raw);
  }catch(e){
    console.error('readContactData error', e);
    return JSON.parse(JSON.stringify(defaultContactData));
  }
}
function saveContactData(d){
  try{ localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(d)); }catch(e){ console.error('saveContactData', e); }
}

/* apply data to UI (contact page circles + title) */
function applyContactDataToUI(){
  const data = readContactData();
  const tabTitleEl = document.getElementById('tabTitle');
  if(tabTitleEl) tabTitleEl.textContent = data.tabTitle || '';

  for(let i=1;i<=4;i++){
    const idx = i-1;
    const circleEl = document.getElementById(`circle${i}`);
    if(!circleEl) continue;
    const imgEl = circleEl.querySelector('img');
    const textEl = circleEl.querySelector('.circle-text');

    if(textEl) textEl.textContent = data.circles[idx].text || '';
    if(imgEl){
      if(data.circles[idx].imageData) imgEl.src = data.circles[idx].imageData;
      // else keep default src already in HTML
    }
    // link behavior
    const link = data.circles[idx].link || null;
    if(link && link !== '#'){
      circleEl.style.cursor = 'pointer';
      circleEl.onclick = () => window.open(link,'_blank');
    } else {
      circleEl.style.cursor = 'default';
      circleEl.onclick = null;
    }
  }
}

/* Sidebar setup */
function setupSidebar(){
  const sidebarBtn = document.querySelector('.sidebar-btn');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close-btn');
  if(!sidebarBtn || !sidebar) return;
  sidebarBtn.addEventListener('click', ()=> sidebar.classList.toggle('open'));
  if(closeBtn) closeBtn.addEventListener('click', ()=> sidebar.classList.remove('open'));
}

/* Admin modal & bindings */
function setupAdminModal(){
  const adminBtn = document.querySelectorAll('#adminBtn');
  const adminModal = document.getElementById('adminModal');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const adminPanel = document.getElementById('adminPanel');
  const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');

  if(!adminModal) return;

  // Open modal when any adminBtn clicked (works on pages with multiple adminBtn)
  adminBtn.forEach(btn => btn.addEventListener('click', () => {
    adminModal.style.display = 'block';
    if(adminPasswordInput) adminPasswordInput.value = '';
    if(adminPanel) adminPanel.style.display = 'none';
    populateAdminFields();
  }));

  if(closeAdminModalBtn) closeAdminModalBtn.addEventListener('click', ()=> adminModal.style.display = 'none');

  if(adminLoginBtn && adminPasswordInput && adminPanel){
    adminLoginBtn.addEventListener('click', ()=>{
      if((adminPasswordInput.value || '').trim() === ADMIN_PASSWORD){
        adminPanel.style.display = 'block';
        populateAdminFields();
      } else {
        alert('كلمة المرور خاطئة!');
      }
    });
  }

  // close by clicking outside content
  adminModal.addEventListener('click', (e)=>{
    if(e.target === adminModal) adminModal.style.display = 'none';
  });

  // Bind admin actions (if inputs exist)
  const updateTabTitleBtn = document.getElementById('updateTabTitleBtn');
  const tabInput = document.getElementById('contact-tab-title-input');
  if(updateTabTitleBtn && tabInput){
    updateTabTitleBtn.addEventListener('click', ()=>{
      const data = readContactData();
      data.tabTitle = tabInput.value || '';
      saveContactData(data);
      applyContactDataToUI();
      alert('تم تحديث نص رأس التبويب.');
    });
  }

  // circles controls
  for(let i=1;i<=4;i++){
    (function(i){
      const textInput = document.getElementById(`circle${i}-text-input`);
      const linkInput = document.getElementById(`circle${i}-link-input`);
      const fileInput = document.getElementById(`circle${i}-file`);
      const uploadBtn = document.getElementById(`circle${i}-upload-btn`);
      const removeBtn = document.getElementById(`circle${i}-remove-btn`);

      if(uploadBtn){
        uploadBtn.addEventListener('click', ()=>{
          const data = readContactData();
          const idx = i-1;
          if(textInput) data.circles[idx].text = textInput.value || '';
          if(linkInput) data.circles[idx].link = linkInput.value || '#';

          if(fileInput && fileInput.files && fileInput.files[0]){
            const reader = new FileReader();
            reader.onload = function(e){
              data.circles[idx].imageData = e.target.result;
              saveContactData(data);
              applyContactDataToUI();
              alert(`تم تحديث الدائرة ${i} (بما فيها الصورة).`);
            };
            reader.readAsDataURL(fileInput.files[0]);
          } else {
            saveContactData(data);
            applyContactDataToUI();
            alert(`تم تحديث الدائرة ${i}.`);
          }
        });
      }

      if(removeBtn){
        removeBtn.addEventListener('click', ()=>{
          const data = readContactData();
          data.circles[i-1].imageData = null;
          saveContactData(data);
          applyContactDataToUI();
          alert(`تم إزالة صورة الدائرة ${i}.`);
        });
      }
    })(i);
  }
}

/* populate admin inputs from saved data */
function populateAdminFields(){
  const data = readContactData();
  const tabInput = document.getElementById('contact-tab-title-input');
  if(tabInput) tabInput.value = data.tabTitle || '';

  for(let i=1;i<=4;i++){
    const idx = i-1;
    const textInput = document.getElementById(`circle${i}-text-input`);
    const linkInput = document.getElementById(`circle${i}-link-input`);
    if(textInput) textInput.value = data.circles[idx].text || '';
    if(linkInput) linkInput.value = data.circles[idx].link || '';
  }
}

/* init */
document.addEventListener('DOMContentLoaded', ()=>{
  setupSidebar();
  setupAdminModal();
  applyContactDataToUI();
});
