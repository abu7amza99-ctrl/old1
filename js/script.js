// فتح وغلق الشريط الجانبي
const sidebarBtn = document.querySelector('.sidebar-btn');
const sidebar = document.querySelector('.sidebar');
const closeBtn = document.querySelector('.close-btn');

sidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});
closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('open');
});

// زر لوحة التحكم
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminPanel = document.getElementById('adminPanel');
const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');

const adminPassword = '1234'; // كلمة المرور

adminBtn.addEventListener('click', () => {
  adminModal.style.display = 'block';
  adminPasswordInput.value = '';
  adminPanel.style.display = 'none';
});

adminLoginBtn.addEventListener('click', () => {
  if (adminPasswordInput.value === adminPassword) {
    adminPanel.style.display = 'block';
    alert('تم الدخول للوحة التحكم');
  } else {
    alert('كلمة المرور خاطئة!');
  }
});

closeAdminModalBtn.addEventListener('click', () => {
  adminModal.style.display = 'none';
});

// ================================
// قسم اتصل بنا - التحكم بالدوائر
// ================================
function setupCircle(circleId) {
  const fileInput = document.getElementById(`${circleId}-file`);
  const uploadBtn = document.getElementById(`${circleId}-upload-btn`);
  const textInput = document.getElementById(`${circleId}-text`);
  const linkInput = document.getElementById(`${circleId}-link`);
  const circleElement = document.getElementById(circleId);
  const imgElement = circleElement.querySelector('img');
  const textElement = circleElement.querySelector('.circle-text');

  uploadBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imgElement.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  textInput.addEventListener('input', () => {
    textElement.textContent = textInput.value;
  });

  linkInput.addEventListener('input', () => {
    const link = linkInput.value;
    if (link) {
      imgElement.parentElement.style.cursor = 'pointer';
      imgElement.parentElement.onclick = () => {
        window.open(link, '_blank');
      };
    } else {
      imgElement.parentElement.onclick = null;
      imgElement.parentElement.style.cursor = 'default';
    }
  });
}

// إعداد كل الدوائر الأربعة
['circle1', 'circle2', 'circle3', 'circle4'].forEach(setupCircle);

// تحديث نص رأس تبويب اتصل بنا
const tabTitleInput = document.getElementById('contact-tab-title-input');
const tabTitle = document.getElementById('tabTitle');
const updateTabTitleBtn = document.getElementById('updateTabTitleBtn');

updateTabTitleBtn.addEventListener('click', () => {
  tabTitle.textContent = tabTitleInput.value;
});
