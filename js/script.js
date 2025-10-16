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
if(adminBtn){
  adminBtn.addEventListener('click', () => {
    window.location.href = 'admin.html';
  });
}
