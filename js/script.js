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

// لوحة التحكم لقسم اتصل بنا
function updateContactCircle(circleId, newText, newLink){
  const circle = document.getElementById(circleId);
  if(circle){
    circle.querySelector('.circle-text').textContent = newText;
    circle.href = newLink;
  }
}

function updateContactTabTitle(newTitle){
  const tabTitle = document.getElementById('contact-tab-title');
  if(tabTitle){
    tabTitle.textContent = newTitle;
  }
}
