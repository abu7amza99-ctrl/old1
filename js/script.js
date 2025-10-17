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
