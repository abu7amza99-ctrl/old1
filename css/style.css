/* ============================
   script.js النهائي - كامل
   - شريط جانبي (أصلي)
   - modal لوحة التحكم بكلمة مرور (شكلية)
   - إدارة بيانات قسم "اتصل بنا" باستخدام localStorage
   ============================ */

/* --------- Helpers & Config --------- */
const CONTACT_STORAGE_KEY = 'contactData_v1';
const ADMIN_PASSWORD = '1234'; // تقدر تغيّرها هنا بسهولة

const defaultContactData = {
  tabTitle: 'تواصل معنا',
  circles: [
    { text: 'وسيلة 1', link: '#', imageData: null },
    { text: 'وسيلة 2', link: '#', imageData: null },
    { text: 'وسيلة 3', link: '#', imageData: null },
    { text: 'وسيلة 4', link: '#', imageData: null },
  ]
};

function readContactData() {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultContactData));
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read contactData:', e);
    return JSON.parse(JSON.stringify(defaultContactData));
  }
}

function saveContactData(data) {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save contactData:', e);
  }
}

/* --------- UI Application (Contact) --------- */
function applyContactDataToUI() {
  const data = readContactData();

  // tab title
  const tabTitleEl = document.getElementById('tabTitle') || document.getElementById('contact-tab-title') || document.getElementById('contact-tab-title-display');
  if (tabTitleEl) tabTitleEl.textContent = data.tabTitle || '';

  // circles
  for (let i = 0; i < 4; i++) {
    const id = `circle${i + 1}`;
    const circleEl = document.getElementById(id);
    if (!circleEl) continue;

    // text element
    const textEl = circleEl.querySelector('.circle-text');
    if (textEl) textEl.textContent = (data.circles[i] && data.circles[i].text) ? data.circles[i].text : '';

    // image element
    const imgEl = circleEl.querySelector('img');
    if (imgEl) {
      const imgData = (data.circles[i] && data.circles[i].imageData) ? data.circles[i].imageData : null;
      if (imgData) {
        imgEl.src = imgData;
      } else {
        // leave existing src (could be default), or clear:
        // imgEl.src = 'assets/default.png';
      }
    }

    // link behavior
    const link = (data.circles[i] && data.circles[i].link) ? data.circles[i].link : null;
    // Make the whole circle clickable (if not already a link)
    if (link && link !== '#') {
      circleEl.style.cursor = 'pointer';
      circleEl.onclick = () => { window.open(link, '_blank'); };
    } else {
      circleEl.onclick = null;
      circleEl.style.cursor = 'default';
    }
  }
}

/* --------- Admin Modal & Bindings --------- */
function setupAdminModal() {
  // Elements (may not exist on every page)
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const adminPanel = document.getElementById('adminPanel');
  const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');

  if (!adminBtn || !adminModal || !adminLoginBtn || !adminPasswordInput || !adminPanel || !closeAdminModalBtn) {
    // Modal elements not present on this page — nothing to bind
    return;
  }

  // Open modal
  adminBtn.addEventListener('click', () => {
    adminModal.style.display = 'block';
    adminPasswordInput.value = '';
    adminPanel.style.display = 'none';
    // populate fields with current data so admin sees current values
    populateAdminFields();
  });

  // Close modal
  closeAdminModalBtn.addEventListener('click', () => {
    adminModal.style.display = 'none';
  });

  // Login / show panel
  adminLoginBtn.addEventListener('click', () => {
    const val = (adminPasswordInput.value || '').trim();
    if (val === ADMIN_PASSWORD) {
      adminPanel.style.display = 'block';
      // populate again to ensure fields current
      populateAdminFields();
    } else {
      alert('كلمة المرور خاطئة!');
    }
  });

  // Bind update tab title button if present
  const updateTabTitleBtn = document.getElementById('updateTabTitleBtn');
  const tabInput = document.getElementById('contact-tab-title-input');
  if (updateTabTitleBtn && tabInput) {
    updateTabTitleBtn.addEventListener('click', () => {
      const data = readContactData();
      data.tabTitle = tabInput.value || '';
      saveContactData(data);
      applyContactDataToUI();
      alert('تم تحديث نص رأس التبويب.');
    });
  }

  // For each circle bind upload, text and link update
  for (let i = 1; i <= 4; i++) {
    const textInput = document.getElementById(`circle${i}-text`);
    const linkInput = document.getElementById(`circle${i}-link`);
    const fileInput = document.getElementById(`circle${i}-file`);
    const uploadBtn = document.getElementById(`circle${i}-upload-btn`);
    const removeBtn = document.getElementById(`circle${i}-remove-btn`); // optional

    // If update text/link exists we update on click of uploadBtn or live
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        const data = readContactData();
        const idx = i - 1;

        // update text
        if (textInput) data.circles[idx].text = textInput.value || '';

        // update link
        if (linkInput) data.circles[idx].link = linkInput.value || '#';

        // handle file
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          const reader = new FileReader();
          reader.onload = function(e) {
            data.circles[idx].imageData = e.target.result;
            saveContactData(data);
            applyContactDataToUI();
            alert(`تم تحديث الدائرة ${i} (شمل الصورة).`);
          };
          reader.readAsDataURL(file);
        } else {
          // no file: just save text/link
          saveContactData(data);
          applyContactDataToUI();
          alert(`تم تحديث الدائرة ${i}.`);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        const data = readContactData();
        data.circles[i - 1].imageData = null;
        saveContactData(data);
        applyContactDataToUI();
        alert(`تم إزالة صورة الدائرة ${i}.`);
      });
    }
  }
}

/* Fill admin inputs with current data (if present) */
function populateAdminFields() {
  const data = readContactData();
  const tabInput = document.getElementById('contact-tab-title-input');
  if (tabInput) tabInput.value = data.tabTitle || '';

  for (let i = 1; i <= 4; i++) {
    const idx = i - 1;
    const textInput = document.getElementById(`circle${i}-text`);
    const linkInput = document.getElementById(`circle${i}-link`);
    if (textInput) textInput.value = data.circles[idx].text || '';
    if (linkInput) linkInput.value = data.circles[idx].link || '';
  }
}

/* --------- Sidebar original functions (safe checks) --------- */
function setupSidebar() {
  const sidebarBtn = document.querySelector('.sidebar-btn');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close-btn');
  if (!sidebarBtn || !sidebar) return;
  sidebarBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
}

/* --------- Init on DOMContentLoaded --------- */
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved contact data to UI (on contact page elements if present)
  applyContactDataToUI();

  // Setup sidebar (works on all pages)
  setupSidebar();

  // Setup admin modal & bindings if modal exists in DOM
  setupAdminModal();

  // If admin modal is present but admin button is not (edge cases), try to find any .open-admin triggers
  const adminModal = document.getElementById('adminModal');
  if (adminModal) {
    // Optional: close modal when clicking outside content
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.style.display = 'none';
      }
    });
  }
});
