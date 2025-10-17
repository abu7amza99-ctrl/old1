/* ============================
   script.js النهائي - مدمج
   - وظائف الشريط الجانبي (أصلي)
   - نظام إدارة "اتصل بنا" باستخدام localStorage
   - نافذة دخول شكلية لصفحة admin.html
   ============================ */

/* ======== وظائف الشريط الجانبي (أصلي) ======== */
const sidebarBtn = document.querySelector('.sidebar-btn');
const sidebar = document.querySelector('.sidebar');
const closeBtn = document.querySelector('.close-btn');

if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}
if (closeBtn && sidebar) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}

/* زر لوحة التحكم في index.html (إن وُجد) */
const adminBtn = document.getElementById('adminBtn');
if (adminBtn) {
  adminBtn.addEventListener('click', () => {
    window.location.href = 'admin.html';
  });
}

/* ============================
   إعدادات لوحة تحكم "اتصل بنا"
   يتم التخزين في localStorage تحت المفتاح 'contactData'
   البنية المتوقعـة:
   {
     tabTitle: "نص رأس التبويب",
     circles: [
       { text: "وسيلة 1", link: "https://...", imageData: "data:image/..." },
       ...
     ]
   }
   ============================ */

const CONTACT_STORAGE_KEY = 'contactData';
const adminPassword = '1234'; // تقدر تغيّرها هنا بسهولة

/* بيانات افتراضية عند عدم وجود بيانات محفوظة */
const defaultContactData = {
  tabTitle: 'تواصل معنا',
  circles: [
    { text: 'وسيلة 1', link: '#', imageData: null },
    { text: 'وسيلة 2', link: '#', imageData: null },
    { text: 'وسيلة 3', link: '#', imageData: null },
    { text: 'وسيلة 4', link: '#', imageData: null },
  ]
};

/* قراءة بيانات من localStorage أو إرجاع الافتراضية */
function readContactData() {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultContactData));
    return JSON.parse(raw);
  } catch (e) {
    console.error('خطأ بقراءة contactData من localStorage:', e);
    return JSON.parse(JSON.stringify(defaultContactData));
  }
}

/* حفظ بيانات في localStorage */
function saveContactData(data) {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('خطأ بحفظ contactData في localStorage:', e);
  }
}

/* ============================
   وظائف لتحديث الواجهة (contact.html)
   - تطبق البيانات على الدوائر والعنوان
   ============================ */
function applyContactDataToUI() {
  const data = readContactData();

  // عنوان التبويب
  const tabTitleEl = document.getElementById('contact-tab-title');
  if (tabTitleEl) tabTitleEl.textContent = data.tabTitle || '';

  // الدوائر الأربع
  for (let i = 0; i < 4; i++) {
    const id = `circle${i + 1}`;
    const circleEl = document.getElementById(id);
    if (!circleEl) continue;

    // النص تحت الدائرة (عنصر .circle-text داخل الدائرة)
    const textEl = circleEl.querySelector('.circle-text');
    if (textEl) textEl.textContent = (data.circles[i] && data.circles[i].text) ? data.circles[i].text : '';

    // الرابط
    const link = (data.circles[i] && data.circles[i].link) ? data.circles[i].link : '#';
    circleEl.href = link || '#';

    // الصورة الخلفية إن وجدت
    const imgData = (data.circles[i] && data.circles[i].imageData) ? data.circles[i].imageData : null;
    if (imgData) {
      circleEl.style.backgroundImage = `url('${imgData}')`;
      circleEl.style.backgroundSize = 'cover';
      circleEl.style.backgroundPosition = 'center';
      // لو الصورة موجودة، نُخبئ النص داخل الدائرة ونُظهر النص أسفل الدائرة (نستخدم .circle-text لعرض نص صغير)
      circleEl.classList.add('has-image');
      // للتباين، نجعل نص الدائرة أبيض مع ظل
      if (textEl) {
        textEl.style.color = '#fff';
        textEl.style.textShadow = '0 1px 2px rgba(0,0,0,0.7)';
      }
    } else {
      // إزالة الخلفية إن لم تعد موجودة
      circleEl.style.backgroundImage = '';
      circleEl.classList.remove('has-image');
      if (textEl) {
        textEl.style.color = '';
        textEl.style.textShadow = '';
      }
    }
  }
}

/* فور تحميل أي صفحة، نطبّق البيانات إن كانت موجودة */
document.addEventListener('DOMContentLoaded', () => {
  applyContactDataToUI();

  // إذا نحن على صفحة admin.html، نشغّل شاشة الدخول والنماذج
  if (location.pathname.endsWith('admin.html') || location.pathname.endsWith('/admin.html')) {
    handleAdminAuthAndBindings();
  }
});

/* ============================
   دوال تُستخدم داخل admin.html (تحديث مباشر)
   - هذه الدوال تُستدعى من أزرار admin.html أو تُستخدم كـ API
   ============================ */

/* تحديث عنوان التبويب وحفظه */
function updateContactTabTitle(newTitle) {
  const data = readContactData();
  data.tabTitle = newTitle || '';
  saveContactData(data);
  applyContactDataToUI();
  alert('تم تحديث نص رأس التبويب.');
}

/* تحديث دائرة (نص + رابط) وحفظها
   circleId مثل 'circle1' أو 'circle2'
*/
function updateContactCircle(circleId, newText, newLink) {
  const data = readContactData();
  const index = parseInt(circleId.replace('circle', ''), 10) - 1;
  if (index < 0 || index > 3) return;
  data.circles[index].text = newText || '';
  data.circles[index].link = newLink || '#';
  saveContactData(data);
  applyContactDataToUI();
  alert(`تم تحديث ${circleId}.`);
}

/* دعم رفع صورة لكل دائرة (تستخدم عنصر input[type=file] في admin.html إن أضفته)
   fileInputElement: عنصر الإدخال (input[type=file])
   circleId: 'circle1'..
*/
function uploadImageForCircle(fileInputElement, circleId) {
  const file = fileInputElement && fileInputElement.files && fileInputElement.files[0];
  if (!file) {
    alert('اختر صورة أولاً.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const data = readContactData();
    const index = parseInt(circleId.replace('circle', ''), 10) - 1;
    if (index < 0 || index > 3) return;
    data.circles[index].imageData = dataUrl;
    saveContactData(data);
    applyContactDataToUI();
    alert('تم رفع الصورة وحفظها محليًا.');
  };
  reader.readAsDataURL(file);
}

/* حذف صورة دائرة (إن أردت) */
function removeImageFromCircle(circleId) {
  const data = readContactData();
  const index = parseInt(circleId.replace('circle', ''), 10) - 1;
  if (index < 0 || index > 3) return;
  data.circles[index].imageData = null;
  saveContactData(data);
  applyContactDataToUI();
  alert('تم إزالة صورة الدائرة.');
}

/* ============================
   دوال مساعدة لصفحة admin.html:
   - شاشة تحقق بسيطة بالرمز (رمز ضمن الكود)
   - ربط أزرار الإدخال مع الدوال أعلاه
   ============================ */

function handleAdminAuthAndBindings() {
  // شاشة تحقق بسيطة
  const userPass = prompt('أدخل رمز الدخول للوصول إلى لوحة التحكم:');
  if (userPass !== adminPassword) {
    alert('رمز خاطئ. سيتم إعادة التوجيه إلى الصفحة الرئيسية.');
    window.location.href = 'index.html';
    return;
  }

  // بعد التحقق، نربط الأزرار وحقول الإدخال (إن وُجدت في admin.html)
  // ربط عنوان التبويب
  const tabInput = document.getElementById('contact-tab-title-input');
  const tabBtn = document.querySelector('button[onclick^="updateContactTabTitle"]');
  if (tabInput && tabBtn) {
    tabBtn.addEventListener('click', () => {
      updateContactTabTitle(tabInput.value);
    });
  }

  // ربط كل دائرة (نص + رابط + ملف صورة إن وُجد)
  for (let i = 1; i <= 4; i++) {
    const textInput = document.getElementById(`circle${i}-text`);
    const linkInput = document.getElementById(`circle${i}-link`);
    const updateBtn = document.querySelector(`button[onclick*="updateContactCircle('circle${i}'`); // زر موجود مسبقاً
    // زر رفع صورة (إن وُجد)
    const fileInput = document.getElementById(`circle${i}-file`); // إن أضفت هذا الحقل في admin.html
    const uploadBtn = document.getElementById(`circle${i}-upload-btn`);
    const removeBtn = document.getElementById(`circle${i}-remove-btn`);

    if (updateBtn && textInput && linkInput) {
      updateBtn.addEventListener('click', () => {
        updateContactCircle(`circle${i}`, textInput.value, linkInput.value);
      });
    }

    if (fileInput && uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        uploadImageForCircle(fileInput, `circle${i}`);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        removeImageFromCircle(`circle${i}`);
      });
    }
  }

  // فور فتح لوحة التحكم، نعبي الحقول بالقيم الحالية لتسهيل التعديل
  populateAdminFieldsWithCurrentData();
}

/* تعبئة حقول admin.html بالقيم المحفوظة حاليا */
function populateAdminFieldsWithCurrentData() {
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

/* ============================
   نهاية الملف
   ============================ */
