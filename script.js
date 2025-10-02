/* script.js - نهائي: إدارة أقسام/ملفات، خطوط محلية، زخارف، بحث، ألوان، خلفية، كلمات مرور */
(() => {
  const LS_FILES = "my_design_files_v1";
  const LS_COLORS = "my_design_colors_v1";
  const LS_THEME = "my_design_theme_v1";
  const LS_PASSWORD = "my_design_master_v1";
  const LS_BG_IMAGE = "my_design_bgimage_v1";
  const LS_DECOR = "my_design_decor_styles_v1";
  const DEFAULT_MASTER = "asd321321";

  // IndexedDB for fonts
  const FONT_DB = { name: 'design_fonts_db', store: 'fonts', version: 1 };
  function openFontDB() {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(FONT_DB.name, FONT_DB.version);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(FONT_DB.store)) {
            db.createObjectStore(FONT_DB.store, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error('indexedDB open failed'));
      } catch (err) { reject(err); }
    });
  }
  async function saveFontToDB(fontObj) {
    const db = await openFontDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(FONT_DB.store, 'readwrite');
      const store = tx.objectStore(FONT_DB.store);
      store.put(fontObj);
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error || new Error('فشل حفظ الخط'));
    });
  }
  async function getAllFontsFromDB() {
    const db = await openFontDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(FONT_DB.store, 'readonly');
      const store = tx.objectStore(FONT_DB.store);
      const req = store.getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  }
  async function deleteFontFromDB(id) {
    const db = await openFontDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(FONT_DB.store, 'readwrite');
      const store = tx.objectStore(FONT_DB.store);
      store.delete(id);
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    });
  }

  // helpers localStorage
  function getMaster(){ return localStorage.getItem(LS_PASSWORD) || DEFAULT_MASTER; }
  function setMaster(v){ try{ localStorage.setItem(LS_PASSWORD, v); return true;}catch(e){console.error('setMaster',e);return false;} }
  function persistFiles(map){ try { localStorage.setItem(LS_FILES, JSON.stringify(map)); } catch(e){ console.error('persistFiles', e); } }
  function persistColors(obj){ try { localStorage.setItem(LS_COLORS, JSON.stringify(obj)); } catch(e){ console.error('persistColors', e); } }
  function persistTheme(v){ try { localStorage.setItem(LS_THEME, v); } catch(e){} }
  function persistBgImage(d){ try { if(!d) localStorage.removeItem(LS_BG_IMAGE); else localStorage.setItem(LS_BG_IMAGE, d); } catch(e){ console.error('persistBgImage', e); } }

  function getDecorList(){ try{ return JSON.parse(localStorage.getItem(LS_DECOR) || "[]"); }catch(e){ return []; } }
  function saveDecorList(list){ try{ localStorage.setItem(LS_DECOR, JSON.stringify(list)); }catch(e){console.error(e);} }

  // read file to dataURL
  function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      try {
        const r = new FileReader();
        r.onload = ()=> resolve(r.result);
        r.onerror = ()=> reject(new Error("فشل قراءة الملف"));
        r.readAsDataURL(file);
      } catch(err) { reject(err); }
    });
  }

  // helper for font format mapping
  function mapFontFormat(ext){
    if(!ext) return 'truetype';
    ext = ext.toLowerCase();
    if(ext === 'ttf') return 'truetype';
    if(ext === 'otf') return 'opentype';
    if(ext === 'woff') return 'woff';
    if(ext === 'woff2') return 'woff2';
    return ext;
  }

  // image resize via canvas
  function resizeImageDataURL(dataUrl, mimeType='image/jpeg', maxDim=1920, quality=0.8) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const scale = Math.min(1, maxDim / Math.max(width, height));
          const cw = Math.round(width * scale);
          const ch = Math.round(height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, cw, ch);
          canvas.toBlob(blob => {
            if(!blob) return reject(new Error('فشل إنشاء blob من الصورة'));
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('فشل تحويل الصورة بعد الضغط'));
            reader.readAsDataURL(blob);
          }, mimeType, quality);
        };
        img.onerror = () => reject(new Error('فشل تحميل الصورة أثناء الضغط'));
        img.src = dataUrl;
      } catch(err){ reject(err); }
    });
  }

  // Safe exec helper
  function safe(el, fn){
    try { if(el) fn(); } catch(e) { console.error('safe error', e); }
  }

  // ---------- DOM Ready ----------
  document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const welcome = document.getElementById("welcomeScreen");
    const startBtn = document.getElementById("startBtn");
    const skipBtn = document.getElementById("skipBtn");

    const sidebar = document.getElementById("sidebar");
    const toggleSidebar = document.getElementById("toggleSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");
    const sectionsList = document.getElementById("sectionsList");
    const main = document.getElementById("main");
    const searchInput = document.getElementById("searchInput");

    const viewer = document.getElementById("viewer");
    const viewerTitle = document.getElementById("viewerTitle");
    const viewerBody = document.getElementById("viewerBody");
    const closeViewer = document.getElementById("closeViewer");
    const downloadBtn = document.getElementById("downloadBtn");
    const copyBtn = document.getElementById("copyBtn");

    const adminBtn = document.getElementById("adminBtn");
    const loginModal = document.getElementById("loginModal");
    const adminModal = document.getElementById("adminModal");
    const adminPassword = document.getElementById("adminPassword");
    const loginBtn = document.getElementById("loginBtn");
    const closeLogin = document.getElementById("closeLogin");
    const closeAdmin = document.getElementById("closeAdmin");

    const newSectionName = document.getElementById("newSectionName");
    const addSectionBtn = document.getElementById("addSectionBtn");
    const editSectionSelect = document.getElementById("editSectionSelect");
    const renameSectionInput = document.getElementById("renameSectionInput");
    const renameSectionBtn = document.getElementById("renameSectionBtn");
    const deleteSectionBtn = document.getElementById("deleteSectionBtn");

    const fileSectionSelect = document.getElementById("fileSectionSelect");
    const fileNameInput = document.getElementById("fileNameInput");
    const fileUrlInput = document.getElementById("fileUrlInput");
    const fileUploadInput = document.getElementById("fileUploadInput");
    const saveFileBtn = document.getElementById("saveFileBtn");
    const clearUploads = document.getElementById("clearUploads");
    const sectionFilesList = document.getElementById("sectionFilesList");

    const fileSectionFilter = document.getElementById("fileSectionFilter");
    const fileEditSelect = document.getElementById("fileEditSelect");
    const editFileName = document.getElementById("editFileName");
    const renameFileBtn = document.getElementById("renameFileBtn");
    const deleteFileBtn = document.getElementById("deleteFileBtn");

    const headerColor = document.getElementById("headerColor");
    const textColor = document.getElementById("textColor");
    const bgColor = document.getElementById("bgColor");
    const saveColors = document.getElementById("saveColors");
    const bgImageUrl = document.getElementById("bgImageUrl");
    const bgImageUpload = document.getElementById("bgImageUpload");
    const saveBgImage = document.getElementById("saveBgImage");
    const clearBgImage = document.getElementById("clearBgImage");

    const fontsSectionWrapper = document.getElementById('fontsWrapper');
    const arabicFontSelect = document.getElementById('arabicFontSelect');
    const arabicFontName = document.getElementById('arabicFontName');
    const arabicColor = document.getElementById('arabicColor');
    const arabicGradientStart = document.getElementById('arabicGradientStart');
    const arabicGradientEnd = document.getElementById('arabicGradientEnd');
    const arabicPreview = document.getElementById('arabicPreview');
    const arabicDownloadPreviewBtn = document.getElementById('arabicDownloadPreviewBtn');
    const arabicDownloadFont = document.getElementById('arabicDownloadFont');

    const decorStyleSelect = document.getElementById('decorStyleSelect');
    const decorNameInput = document.getElementById('decorNameInput');
    const decorPreview = document.getElementById('decorPreview');
    const decorCopyBtn = document.getElementById('decorCopyBtn');
    const decorDownloadBtn = document.getElementById('decorDownloadBtn');

    const fontNameInput = document.getElementById('fontNameInput');
    const fontFileInput = document.getElementById('fontFileInput');
    const addFontBtn = document.getElementById('addFontBtn');
    const clearFontsBtn = document.getElementById('clearFontsBtn');
    const fontsAdminList = document.getElementById('fontsAdminList');

    const decorNameInputAdmin = document.getElementById('decorNameInputAdmin');
    const decorTemplateInput = document.getElementById('decorTemplateInput');
    const addDecorBtn = document.getElementById('addDecorBtn');
    const clearDecorsBtn = document.getElementById('clearDecorsBtn');
    const decorAdminList = document.getElementById('decorAdminList');

    const bgGradStart = document.getElementById('bgGradStart');
    const bgGradEnd = document.getElementById('bgGradEnd');

    const oldPasswordInput = document.getElementById('oldPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordMsg = document.getElementById('changePasswordMsg');

    // initialize files map
    let filesMap = {};
    try { filesMap = JSON.parse(localStorage.getItem(LS_FILES) || "{}"); } catch(e){ filesMap = {}; }

    // decor list (start empty as requested)
    let decorStyles = getDecorList() || [];
    if(!decorStyles || !decorStyles.length) {
      decorStyles = []; // empty by default per request
      saveDecorList(decorStyles);
    }

    // ---------- helper: render sections list ----------
    function renderSections(){
      if(!sectionsList) return;
      sectionsList.innerHTML = '';
      const keys = Object.keys(filesMap);
      keys.forEach(sec => {
        const li = document.createElement('li');
        li.textContent = sec;
        li.addEventListener('click', () => openSection(sec));
        sectionsList.appendChild(li);
      });
      // add fonts link at the end (single)
      const liFonts = document.createElement('li');
      liFonts.textContent = 'الخطوط المزخرفة';
      liFonts.addEventListener('click', () => openFontsSection());
      sectionsList.appendChild(liFonts);

      updateAdminSectionSelects();
    }

    function updateAdminSectionSelects(){
      [fileSectionSelect, editSectionSelect, fileSectionFilter].forEach(sel => {
        if(!sel) return;
        sel.innerHTML = '';
        const keys = Object.keys(filesMap);
        keys.forEach(sec => {
          const op = document.createElement('option'); op.value = sec; op.textContent = sec;
          sel.appendChild(op);
        });
      });
      if(Object.keys(filesMap).length === 0){
        filesMap['عام'] = [];
        persistFiles(filesMap);
      }
    }

    function openSection(sectionName){
      if(!main) return;
      main.setAttribute('data-current-section', sectionName);
      // hide fontsWrapper if visible
      if(fontsSectionWrapper) fontsSectionWrapper.style.display = 'none';
      main.innerHTML = '';
      const h = document.createElement('h2'); h.textContent = sectionName;
      main.appendChild(h);
      const grid = document.createElement('div'); grid.className = 'grid';
      const list = filesMap[sectionName] || [];
      list.forEach(item => {
        const card = document.createElement('div'); card.className = 'card';
        if(item.type && item.type.startsWith('image/')){
          const img = document.createElement('img'); img.src = item.url; img.alt = item.name;
          card.appendChild(img);
        } else {
          const p = document.createElement('div'); p.textContent = item.name || 'ملف';
          card.appendChild(p);
        }
        card.addEventListener('click', () => openViewer(item));
        grid.appendChild(card);
      });
      main.appendChild(grid);
    }

    function openViewer(item){
      if(!viewer) return;
      try {
        safe(viewerTitle, ()=> viewerTitle.textContent = item.name || 'ملف');
        safe(viewerBody, ()=> viewerBody.innerHTML = '');
        if(item.type && item.type.startsWith('image/')){
          const img = document.createElement('img'); img.src = item.url; img.style.maxWidth='100%';
          viewerBody.appendChild(img);
          safe(downloadBtn, ()=> downloadBtn.onclick = () => downloadDataUrl(item.url, item.name || 'image'));
        } else {
          const p = document.createElement('p'); p.textContent = 'ملف غير صورة — التحميل إن وجد.';
          viewerBody.appendChild(p);
          safe(downloadBtn, ()=> downloadBtn.onclick = () => { if(item.url) downloadDataUrl(item.url, item.name || 'file'); });
        }
        safe(copyBtn, ()=> copyBtn.onclick = () => { if(item.url && navigator.clipboard) navigator.clipboard.writeText(item.url).then(()=>alert('رابط نسخ')).catch(()=>{}); });
        viewer.setAttribute('aria-hidden','false');
      } catch(e){ console.error('openViewer err', e); }
    }
    closeViewer && closeViewer.addEventListener('click', ()=> viewer && viewer.setAttribute('aria-hidden','true'));

    function downloadDataUrl(dataUrl, filename){
      try {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch(e){ console.error('downloadDataUrl', e); }
    }

    // ---------- file upload: allow multiple files (no strict cap) ----------
    if(fileUploadInput) fileUploadInput.setAttribute('multiple', '');

    async function handleSelectedFiles(fileList, targetSection) {
      if(!fileList || fileList.length === 0) return { added:0, errors:[] };
      const files = Array.from(fileList);
      const batchSize = 8;
      const errors = [];
      let added = 0;

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const tasks = batch.map(f => processSingleFile(f, targetSection).catch(err => ({ error:true, fileName: f.name, message: err.message || err })));
        const results = await Promise.all(tasks);
        results.forEach(r => {
          if(r && r.error) errors.push(`${r.fileName}: ${r.message}`);
          else if(r) added++;
        });
      }

      persistFiles(filesMap);
      if(typeof refreshGallery === 'function') refreshGallery();
      return { added, errors };
    }

    async function processSingleFile(file, targetSection) {
      const allowedImage = /^image\//i;
      const maxFileSize = 8 * 1024 * 1024;
      let type = file.type || (file.name.match(/\.(\w+)$/) ? ('application/' + file.name.split('.').pop()) : 'application/octet-stream');

      if(allowedImage.test(type)){
        const dataUrl = await fileToDataURL(file);
        let finalDataUrl = dataUrl;
        try {
          if((file.size && file.size > maxFileSize) || (dataUrl.length > 1.5 * 1024 * 1024)) {
            finalDataUrl = await resizeImageDataURL(dataUrl, 'image/jpeg', 1920, 0.8);
          }
        } catch(e) {
          console.warn('compress failed', e);
          finalDataUrl = dataUrl;
        }
        const id = 'img_' + Date.now() + '_' + Math.floor(Math.random()*9999);
        const entry = { id, name: file.name, url: finalDataUrl, type: 'image/jpeg', addedAt: Date.now() };
        if(!filesMap[targetSection]) filesMap[targetSection] = [];
        filesMap[targetSection].push(entry);
        return entry;
      } else {
        if(file.size && file.size > 3 * 1024 * 1024) {
          throw new Error('الملف كبير جداً للتخزين المحلي. استخدم رابطًا خارجيًا أو ارفع للخادم.');
        }
        const dataUrl = await fileToDataURL(file);
        const id = 'file_' + Date.now() + '_' + Math.floor(Math.random()*9999);
        const entry = { id, name: file.name, url: dataUrl, type, addedAt: Date.now() };
        if(!filesMap[targetSection]) filesMap[targetSection] = [];
        filesMap[targetSection].push(entry);
        return entry;
      }
    }

    if(saveFileBtn){
      saveFileBtn.addEventListener('click', async () => {
        try {
          const target = (fileSectionSelect && fileSectionSelect.value) || Object.keys(filesMap)[0];
          const nameOverride = fileNameInput && fileNameInput.value;
          const urlOverride = fileUrlInput && fileUrlInput.value;
          const selectedFiles = fileUploadInput && fileUploadInput.files;

          if((urlOverride && urlOverride.trim()) && (!selectedFiles || selectedFiles.length === 0)){
            const id = 'link_' + Date.now();
            const entry = { id, name: nameOverride || urlOverride, url: urlOverride.trim(), type: 'link', addedAt: Date.now() };
            if(!filesMap[target]) filesMap[target] = [];
            filesMap[target].push(entry);
            persistFiles(filesMap);
            alert('تم إضافة الرابط كملف.');
            fileUrlInput.value = '';
            fileNameInput.value = '';
            renderSections();
            return;
          }

          if(!selectedFiles || selectedFiles.length === 0){
            alert('اختر ملفات من جهازك أو أدخل رابطاً.');
            return;
          }

          const { added, errors } = await handleSelectedFiles(selectedFiles, target);
          let msg = `تمت إضافة ${added} ملف(ـات).`;
          if(errors.length) msg += `\nلكن حدثت أخطاء مع بعض الملفات:\n` + errors.join('\n');
          alert(msg);
          if(fileUploadInput) fileUploadInput.value = '';
          if(fileNameInput) fileNameInput.value = '';
          renderSections();
        } catch(err){ console.error('saveFileBtn click error', err); alert('حدث خطأ أثناء حفظ الملفات'); }
      });
    }

    if(clearUploads){
      clearUploads.addEventListener('click', () => {
        if(fileUploadInput) fileUploadInput.value = '';
        fileNameInput && (fileNameInput.value = '');
        fileUrlInput && (fileUrlInput.value = '');
      });
    }

    // section files list for admin
    function refreshSectionFilesList(sectionName){
      if(!sectionFilesList) return;
      sectionFilesList.innerHTML = '';
      const list = filesMap[sectionName] || [];
      list.forEach(it => {
        const row = document.createElement('div'); row.className = 'file-row';
        const left = document.createElement('div'); left.textContent = it.name || 'ملف';
        const right = document.createElement('div');
        const del = document.createElement('button'); del.textContent = '🗑'; del.className='btn';
        del.onclick = () => {
          const idx = list.findIndex(x => x.id === it.id);
          if(idx >= 0) { list.splice(idx,1); persistFiles(filesMap); renderSections(); refreshSectionFilesList(sectionName); }
        };
        right.appendChild(del);
        row.appendChild(left); row.appendChild(right);
        sectionFilesList.appendChild(row);
      });
    }

    if(fileSectionFilter){
      fileSectionFilter.addEventListener('change', ()=> {
        const sec = fileSectionFilter.value;
        if(!fileEditSelect) return;
        fileEditSelect.innerHTML = '';
        const list = filesMap[sec] || [];
        list.forEach(it => {
          const op = document.createElement('option'); op.value = it.id; op.textContent = it.name; fileEditSelect.appendChild(op);
        });
        refreshSectionFilesList(sec);
      });
    }
    if(renameFileBtn){
      renameFileBtn.addEventListener('click', () => {
        const sec = fileSectionFilter && fileSectionFilter.value;
        const fid = fileEditSelect && fileEditSelect.value;
        if(!sec || !fid) return alert('اختر قسمًا وملفًا.');
        const list = filesMap[sec] || [];
        const it = list.find(x=>x.id===fid);
        if(it){ it.name = editFileName.value || it.name; persistFiles(filesMap); alert('تمت إعادة التسمية'); renderSections(); refreshSectionFilesList(sec); }
      });
    }
    if(deleteFileBtn){
      deleteFileBtn.addEventListener('click', () => {
        const sec = fileSectionFilter && fileSectionFilter.value;
        const fid = fileEditSelect && fileEditSelect.value;
        if(!sec || !fid) return alert('اختر قسمًا وملفًا.');
        const list = filesMap[sec] || [];
        const idx = list.findIndex(x=>x.id===fid);
        if(idx>=0){ list.splice(idx,1); persistFiles(filesMap); alert('حُذف الملف'); renderSections(); refreshSectionFilesList(sec); }
      });
    }

    // ---------- Sections CRUD ----------
    if(addSectionBtn){
      addSectionBtn.addEventListener('click', ()=> {
        const name = (newSectionName && newSectionName.value || '').trim();
        if(!name) return alert('أدخل اسم القسم');
        if(filesMap[name]) return alert('القسم موجود مسبقاً');
        filesMap[name] = [];
        persistFiles(filesMap);
        newSectionName.value = '';
        renderSections();
      });
    }
    if(renameSectionBtn){
      renameSectionBtn.addEventListener('click', ()=> {
        const from = editSectionSelect && editSectionSelect.value;
        const to = renameSectionInput && renameSectionInput.value && renameSectionInput.value.trim();
        if(!from || !to) return alert('اختر قسمًا وحدد اسمًا جديدًا');
        if(filesMap[to]) return alert('الاسم الجديد مستخدم');
        filesMap[to] = filesMap[from];
        delete filesMap[from];
        persistFiles(filesMap);
        renderSections();
      });
    }
    if(deleteSectionBtn){
      deleteSectionBtn.addEventListener('click', ()=> {
        const which = editSectionSelect && editSectionSelect.value;
        if(!which) return alert('اختر قسمًا للحذف');
        if(!confirm('هل أنت متأكد من حذف القسم وكل ملفاته؟')) return;
        delete filesMap[which];
        persistFiles(filesMap);
        renderSections();
      });
    }

    // ---------- Fonts & UI for Arabic Fonts ----------
    async function registerFontInPage(fontRecord){
      try {
        const cssName = `custom_font_${fontRecord.id}`;
        if(document.getElementById('font_style_' + fontRecord.id)) return cssName;
        const fmt = mapFontFormat(fontRecord.format);
        const style = document.createElement('style');
        style.id = 'font_style_' + fontRecord.id;
        style.innerText = `
          @font-face {
            font-family: "${cssName}";
            src: url("${fontRecord.dataUrl}") format("${fmt}");
            font-weight: normal;
            font-style: normal;
          }`;
        document.head.appendChild(style);
        return cssName;
      } catch(e){ console.error('registerFontInPage err', e); return null; }
    }

    async function refreshFontsUI(){
      try {
        const fonts = await getAllFontsFromDB();
        if(fontsAdminList) fontsAdminList.innerHTML = '';
        if(arabicFontSelect) arabicFontSelect.innerHTML = '';
        for(const f of fonts){
          if(fontsAdminList){
            const row = document.createElement('div'); row.className='file-row';
            const left = document.createElement('div'); left.textContent = f.name + ' • ' + (f.filename||'');
            const right = document.createElement('div');
            const del = document.createElement('button'); del.className='btn'; del.textContent='🗑';
            del.onclick = async () => { await deleteFontFromDB(f.id); await refreshFontsUI(); alert('حُذف الخط محلياً'); };
            right.appendChild(del);
            row.appendChild(left); row.appendChild(right);
            fontsAdminList.appendChild(row);
          }
          if(arabicFontSelect){
            const op = document.createElement('option'); op.value = f.id; op.textContent = f.name;
            arabicFontSelect.appendChild(op);
          }
          await registerFontInPage(f).catch(()=>{});
        }
        if(fonts && fonts.length) {
          if(fontsSectionWrapper){ fontsSectionWrapper.style.display = ''; }
        } else {
          if(fontsSectionWrapper){ fontsSectionWrapper.style.display = 'none'; }
        }
      } catch(e){ console.error('refreshFontsUI', e); }
    }

    if(addFontBtn){
      addFontBtn.addEventListener('click', async () => {
        try {
          const name = (fontNameInput && fontNameInput.value || '').trim();
          const file = (fontFileInput && fontFileInput.files && fontFileInput.files[0]) || null;
          if(!name) return alert('أدخل اسم الخط');
          if(!file) return alert('اختر ملف الخط');
          const dataUrl = await fileToDataURL(file);
          const id = 'font_' + Date.now() + '_' + Math.floor(Math.random()*9999);
          const fmt = (file.name.split('.').pop() || 'ttf').toLowerCase();
          const record = { id, name, filename: file.name, dataUrl, format: fmt, addedAt: Date.now() };
          await saveFontToDB(record);
          await registerFontInPage(record);
          await refreshFontsUI();
          fontNameInput.value = ''; if(fontFileInput) fontFileInput.value = '';
          alert('تم إضافة الخط محلياً.');
        } catch(e){ console.error('addFont error', e); alert('فشل إضافة الخط: ' + (e.message || e)); }
      });
    }
    if(clearFontsBtn){
      clearFontsBtn.addEventListener('click', async () => {
        try {
          if(!confirm('هل تريد حذف كل الخطوط المخزنة محلياً؟')) return;
          const fonts = await getAllFontsFromDB();
          for(const f of fonts) await deleteFontFromDB(f.id).catch(()=>{});
          await refreshFontsUI();
          alert('تم حذف الخطوط المحلّية.');
        } catch(e){ console.error('clearFontsBtn', e); }
      });
    }

    // ---------- Decor management (empty by default) ----------
    function saveDecorStyles(){
      saveDecorList(decorStyles);
    }

    function refreshDecorUI(){
      if(!decorStyleSelect || !decorAdminList) return;
      decorStyleSelect.innerHTML = '';
      decorAdminList.innerHTML = '';
      decorStyles.forEach(s => {
        const op = document.createElement('option'); op.value = s.id; op.textContent = s.name;
        decorStyleSelect.appendChild(op);

        const row = document.createElement('div'); row.className = 'file-row';
        const left = document.createElement('div'); left.textContent = s.name + (s.template ? ` • ${s.template}` : '');
        const right = document.createElement('div');
        const del = document.createElement('button'); del.className='btn'; del.textContent='🗑';
        del.onclick = () => { if(confirm('حذف الستايل؟')){ decorStyles = decorStyles.filter(x=>x.id!==s.id); saveDecorStyles(); refreshDecorUI(); } };
        right.appendChild(del);
        row.appendChild(left); row.appendChild(right);
        decorAdminList.appendChild(row);
      });
      if(decorStyles.length === 0 && decorStyleSelect){
        const op = document.createElement('option'); op.value = ''; op.textContent = '(لا توجد ستايلات)'; decorStyleSelect.appendChild(op);
      }
    }

    addDecorBtn && addDecorBtn.addEventListener('click', () => {
      const name = (decorNameInputAdmin && decorNameInputAdmin.value || '').trim();
      const templ = (decorTemplateInput && decorTemplateInput.value || '').trim();
      if(!name) return alert('أدخل اسم الستايل');
      const id = 'decor_' + Date.now() + '_' + Math.floor(Math.random()*9999);
      let obj = null;
      if(templ.startsWith('wrap:')){
        const parts = templ.replace('wrap:','').split(',');
        obj = { id, name, type:'wrap', prefix: parts[0]||'', suffix: parts[1]||'', template: templ, addedAt: Date.now() };
      } else if(templ.startsWith('interleave:')){
        const ch = templ.replace('interleave:','') || '❈';
        obj = { id, name, type:'interleave', char: ch, template: templ, addedAt: Date.now() };
      } else {
        obj = { id, name, type:'template', template: templ, addedAt: Date.now() };
      }
      decorStyles.push(obj);
      saveDecorStyles();
      decorNameInputAdmin.value=''; decorTemplateInput.value='';
      refreshDecorUI();
      alert('تمت إضافة الستايل محلياً');
    });

    clearDecorsBtn && clearDecorsBtn.addEventListener('click', () => {
      if(!confirm('حذف كل الستايلات؟')) return;
      decorStyles = [];
      saveDecorStyles();
      refreshDecorUI();
      alert('تم مسح الستايلات');
    });

    // apply decor style
    function applyDecorStyle(style, text){
      try {
        if(!style) return text;
        if(style.type === 'wrap'){
          return `${style.prefix || ''}${text}${style.suffix || ''}`;
        } else if(style.type === 'interleave'){
          const ch = style.char || '✦';
          return text.split('').join(ch);
        } else if(style.type === 'template' && style.template){
          return style.template.replace(/\{text\}/g, text) || (style.template + text);
        }
        return text;
      } catch(e){ console.error('applyDecorStyle', e); return text; }
    }

    function updateDecorPreview(){
      try {
        const sid = decorStyleSelect && decorStyleSelect.value;
        const text = (decorNameInput && decorNameInput.value) || 'مرحبا';
        const style = decorStyles.find(s=>s.id===sid) || null;
        const output = applyDecorStyle(style, text);
        if(decorPreview){
          decorPreview.innerHTML = '';
          const p = document.createElement('div');
          p.style.fontSize = '28px';
          p.style.direction = 'rtl';
          p.style.wordBreak = 'break-word';
          p.textContent = output;
          decorPreview.appendChild(p);
        }
        decorCopyBtn && (decorCopyBtn.onclick = () => {
          if(navigator.clipboard) navigator.clipboard.writeText(output).then(()=>alert('تم النسخ')).catch(()=>alert('فشل النسخ'));
        });
        decorDownloadBtn && (decorDownloadBtn.onclick = () => {
          const canvas = document.createElement('canvas');
          const fontSize = 64;
          canvas.width = Math.max(600, output.length * fontSize);
          canvas.height = fontSize + 80;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.textAlign = 'center'; ctx.textBaseline='middle';
          ctx.font = `${fontSize}px Cairo, sans-serif`;
          ctx.fillStyle = '#000';
          ctx.fillText(output, canvas.width/2, canvas.height/2);
          const url = canvas.toDataURL('image/png');
          downloadDataUrl(url, (text.replace(/\s+/g,'_')||'decor') + '.png');
        });
      } catch(e){ console.error('updateDecorPreview', e); }
    }

    // ---------- Arabic preview update ----------
    async function updateArabicPreview(){
      try {
        const fid = arabicFontSelect && arabicFontSelect.value;
        const txt = (arabicFontName && arabicFontName.value) || 'مرحبا';
        let cssName = null;
        if(fid){
          const fonts = await getAllFontsFromDB();
          const rec = fonts.find(f=>f.id===fid);
          if(rec) cssName = await registerFontInPage(rec);
        }
        const family = cssName || 'Cairo';
        const start = arabicGradientStart && arabicGradientStart.value;
        const end = arabicGradientEnd && arabicGradientEnd.value;
        const color = arabicColor && arabicColor.value;

        const fontSize = 72;
        const width = Math.max(600, txt.length * fontSize);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = fontSize + 80;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${fontSize}px "${family}", Cairo, sans-serif`;

        if(start && end && start !== end){
          const g = ctx.createLinearGradient(0,0,canvas.width,0);
          g.addColorStop(0, start);
          g.addColorStop(1, end);
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = color || '#000';
        }
        ctx.fillText(txt, canvas.width/2, canvas.height/2);

        if(arabicPreview){
          arabicPreview.innerHTML = '';
          const img = document.createElement('img'); img.src = canvas.toDataURL('image/png');
          img.style.maxWidth = '100%';
          arabicPreview.appendChild(img);
        }
        if(arabicDownloadFont && fid){
          const fonts = await getAllFontsFromDB();
          const rec = fonts.find(f=>f.id===fid);
          if(rec){ arabicDownloadFont.href = rec.dataUrl; arabicDownloadFont.download = rec.filename || (rec.name + '.ttf'); }
        }
        arabicDownloadPreviewBtn && (arabicDownloadPreviewBtn.onclick = () => {
          const url = canvas.toDataURL('image/png');
          downloadDataUrl(url, (txt.replace(/\s+/g,'_')||'preview') + '.png');
        });
      } catch(e){ console.error('updateArabicPreview', e); }
    }

    // ---------- Basic UI (sidebar, welcome, admin) ----------
    if(toggleSidebar) toggleSidebar.addEventListener('click', ()=> sidebar && sidebar.setAttribute('aria-hidden','false'));
    if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', ()=> sidebar && sidebar.setAttribute('aria-hidden','true'));

    // welcome hide
    if (startBtn && skipBtn && welcome) {
      const hideWelcome = () => {
        try { welcome.setAttribute("aria-hidden", "true"); welcome.style.display = "none"; } catch(e){ console.error(e); }
      };
      startBtn.addEventListener("click", hideWelcome);
      skipBtn.addEventListener("click", hideWelcome);
    }

    if(adminBtn) adminBtn.addEventListener('click', ()=> {
      if(loginModal) loginModal.setAttribute('aria-hidden','false');
    });
    if(closeLogin) closeLogin.addEventListener('click', ()=> loginModal && loginModal.setAttribute('aria-hidden','true'));
    if(loginBtn){
      loginBtn.addEventListener('click', ()=> {
        try {
          const pw = adminPassword && adminPassword.value;
          if(pw === getMaster()){
            loginModal && loginModal.setAttribute('aria-hidden','true');
            adminModal && adminModal.setAttribute('aria-hidden','false');
            if(adminPassword) adminPassword.value='';
            // ensure admin modal scroll to top on open
            if(adminModal) adminModal.scrollTop = 0;
          } else {
            const err = document.getElementById('loginError'); if(err) err.textContent='كلمة المرور خاطئة';
          }
        } catch(e){ console.error('loginBtn handler', e); }
      });
    }
    if(closeAdmin) closeAdmin.addEventListener('click', ()=> adminModal && adminModal.setAttribute('aria-hidden','true'));

    // ---------- Colors & Background ----------
    if(saveColors){
      saveColors.addEventListener('click', () => {
        try {
          const obj = {
            header: headerColor ? headerColor.value : null,
            text: textColor ? textColor.value : null,
            bg: bgColor ? bgColor.value : null,
            bgGradStart: bgGradStart ? bgGradStart.value : null,
            bgGradEnd: bgGradEnd ? bgGradEnd.value : null
          };
          persistColors(obj);
          // apply header/text/bg
          if(obj.header) document.documentElement.style.setProperty("--header", obj.header);
          if(obj.text) document.documentElement.style.setProperty("--text", obj.text);
          if(obj.bg) document.documentElement.style.setProperty("--bg", obj.bg);
          // apply background gradient or solid
          if(obj.bgGradStart && obj.bgGradEnd){
            document.body.style.background = `linear-gradient(180deg, ${obj.bgGradStart}, ${obj.bgGradEnd})`;
          } else {
            document.body.style.background = obj.bg || '';
          }
          alert('تم حفظ الألوان');
        } catch(e){ console.error('saveColors', e); }
      });
    }

    if(saveBgImage){
      saveBgImage.addEventListener('click', async () => {
        try {
          if(bgImageUpload && bgImageUpload.files && bgImageUpload.files[0]){
            const dataUrl = await fileToDataURL(bgImageUpload.files[0]);
            persistBgImage(dataUrl);
            applyBgImage(dataUrl);
            alert('تم تعيين الخلفية من ملف');
            bgImageUpload.value = '';
            return;
          }
          const url = bgImageUrl && bgImageUrl.value && bgImageUrl.value.trim();
          if(url){ persistBgImage(url); applyBgImage(url); alert('تم تعيين الخلفية'); bgImageUrl.value=''; }
          else alert('أدخل رابطًا أو ارفع صورة');
        } catch(e){ console.error('saveBgImage', e); alert('فشل تعيين الخلفية'); }
      });
    }
    if(clearBgImage) clearBgImage.addEventListener('click', ()=> { persistBgImage(null); applyBgImage(null); alert('تم مسح الخلفية'); });

    // ---------- Change password ----------
    changePasswordBtn && changePasswordBtn.addEventListener('click', ()=> {
      try {
        const oldp = oldPasswordInput && oldPasswordInput.value;
        const np = newPasswordInput && newPasswordInput.value;
        const cp = confirmNewPasswordInput && confirmNewPasswordInput.value;
        if(!oldp || !np || !cp) return changePasswordMsg && (changePasswordMsg.textContent = 'أدخل الحقول المطلوبة');
        if(oldp !== getMaster()) return changePasswordMsg && (changePasswordMsg.textContent = 'كلمة المرور الحالية خاطئة');
        if(np.length < 4) return changePasswordMsg && (changePasswordMsg.textContent = 'كلمة المرور الجديدة قصيرة');
        if(np !== cp) return changePasswordMsg && (changePasswordMsg.textContent = 'تأكيد كلمة المرور لا يطابق');
        const ok = setMaster(np);
        if(ok){ changePasswordMsg && (changePasswordMsg.textContent = 'تم تغيير كلمة المرور'); oldPasswordInput.value=''; newPasswordInput.value=''; confirmNewPasswordInput.value=''; }
        else changePasswordMsg && (changePasswordMsg.textContent = 'فشل الحفظ');
      } catch(e){ console.error('changePassword', e); changePasswordMsg && (changePasswordMsg.textContent = 'خطأ'); }
    });

    // ---------- Open fonts section in main ----------
    function openFontsSection(){
      if(!main) return;
      main.setAttribute('data-current-section','الخطوط المزخرفة');
      // We keep fontsSectionWrapper in DOM (in HTML) and simply show it.
      // Clear other main content but preserve fontsWrapper element reference.
      // Hide everything in main except fontsWrapper, then show fontsWrapper.
      Array.from(main.children).forEach(ch=>{
        if(ch.id === 'fontsWrapper') return;
        ch.style.display = 'none';
      });
      if(fontsSectionWrapper){
        fontsSectionWrapper.style.display = '';
        // ensure fonts section is visible to user
        fontsSectionWrapper.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }

    // ---------- Search (search across sections & files) ----------
    function searchAll(query){
      const q = (query||'').trim().toLowerCase();
      if(!q) return [];
      const results = [];
      for(const sec of Object.keys(filesMap)){
        const list = filesMap[sec] || [];
        // if section name matches
        if(sec.toLowerCase().includes(q)){
          results.push({ type:'section', section: sec });
        }
        list.forEach(item => {
          if((item.name && item.name.toLowerCase().includes(q)) || (item.filename && item.filename.toLowerCase().includes(q))){
            results.push({ type:'file', section: sec, item });
          }
          // if url contains q (searching links etc)
          else if(item.url && item.url.toLowerCase().includes(q)){
            results.push({ type:'file', section: sec, item });
          }
        });
      }
      return results;
    }

    function renderSearchResults(results, q){
      if(!main) return;
      main.innerHTML = '';
      const h = document.createElement('h2'); h.textContent = `نتائج البحث عن "${q}"`;
      main.appendChild(h);
      if(!results || results.length === 0){
        const p = document.createElement('p'); p.textContent = 'لا توجد نتائج.';
        main.appendChild(p);
        return;
      }
      // group by section
      const grouped = {};
      results.forEach(r => {
        if(r.type === 'section') {
          grouped[r.section] = grouped[r.section] || { sectionMatch:true, files: [] };
        } else if(r.type === 'file') {
          grouped[r.section] = grouped[r.section] || { sectionMatch:false, files: [] };
          grouped[r.section].files.push(r.item);
        }
      });
      for(const sec of Object.keys(grouped)){
        const box = document.createElement('div'); box.className = 'section-card';
        const title = document.createElement('h3'); title.className = 'section-title'; title.textContent = sec;
        box.appendChild(title);
        const list = grouped[sec].files || [];
        if(list.length){
          const grid = document.createElement('div'); grid.className = 'grid';
          list.forEach(item => {
            const card = document.createElement('div'); card.className = 'card';
            if(item.type && item.type.startsWith('image/')){
              const img = document.createElement('img'); img.src = item.url; img.alt = item.name;
              card.appendChild(img);
            } else {
              const p = document.createElement('div'); p.textContent = item.name || 'ملف';
              card.appendChild(p);
            }
            card.addEventListener('click', ()=> openViewer(item));
            grid.appendChild(card);
          });
          box.appendChild(grid);
        } else {
          const p = document.createElement('p'); p.textContent = 'مطابق لاسم القسم';
          box.appendChild(p);
        }
        main.appendChild(box);
      }
    }

    if(searchInput){
      let timer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(()=> {
          const q = (searchInput.value || '').trim();
          if(!q) {
            // restore placeholder/main content
            // hide fontsWrapper and show placeholder
            if(fontsSectionWrapper) fontsSectionWrapper.style.display = 'none';
            main.innerHTML = '<p class="placeholder">اختر قسماً من القائمة أو أضف جديداً من لوحة التحكم ✨</p>';
            return;
          }
          const res = searchAll(q);
          renderSearchResults(res, q);
        }, 220);
      });
    }

    // ---------- placeholders and misc ----------
    window.refreshGallery = function(){ /* placeholder for integrations */ };
    window.updateUploadProgress = function(done, total){ /* placeholder */ };

    // ---------- initial setup ----------
    try { loadColors(); loadTheme(); loadBgImage(); } catch(e){}
    if(Object.keys(filesMap).length === 0){ filesMap['عام'] = []; persistFiles(filesMap); }
    renderSections();
    refreshFontsUI().catch(()=>{});
    refreshDecorUI();

    // default preview updates
    updateArabicPreview();
    updateDecorPreview();

    // allow long-press on decorPreview to copy (mobile)
    if(decorPreview){
      let pressTimer = null;
      decorPreview.addEventListener('touchstart', function(e){ pressTimer = setTimeout(()=>{ decorCopyBtn && decorCopyBtn.click(); }, 700); });
      decorPreview.addEventListener('touchend', function(e){ if(pressTimer) clearTimeout(pressTimer); });
      decorPreview.addEventListener('mousedown', function(e){ pressTimer = setTimeout(()=>{ decorCopyBtn && decorCopyBtn.click(); }, 900); });
      decorPreview.addEventListener('mouseup', function(e){ if(pressTimer) clearTimeout(pressTimer); });
    }

    // init admin selects defaults
    updateAdminSectionSelects();
    if(fileSectionFilter && Object.keys(filesMap).length) {
      fileSectionFilter.value = Object.keys(filesMap)[0];
      fileSectionFilter.dispatchEvent(new Event('change'));
    }
    if(fileSectionSelect && Object.keys(filesMap).length){
      fileSectionSelect.value = Object.keys(filesMap)[0];
    }

  }); // DOMContentLoaded end

  // helper functions that rely on outer-scope
  function loadColors(){ try{ const c = JSON.parse(localStorage.getItem(LS_COLORS)||"null"); if(c){ if(c.header) document.documentElement.style.setProperty("--header", c.header); if(c.text) document.documentElement.style.setProperty("--text", c.text); if(c.bg) document.documentElement.style.setProperty("--bg", c.bg); } }catch(e){console.error(e);} }
  function loadTheme(){ try{ const t = localStorage.getItem(LS_THEME); if(t) document.body.setAttribute('data-theme', t); } catch(e){} }
  function applyBgImage(dataUrl){ try { if(!dataUrl){ document.body.style.backgroundImage=""; return; } document.body.style.backgroundImage = `url(${dataUrl})`; document.body.style.backgroundSize = "cover"; document.body.style.backgroundPosition = "center"; } catch(e){ console.error('applyBgImage', e); } }
  function loadBgImage(){ try{ const d = localStorage.getItem(LS_BG_IMAGE); if(d) applyBgImage(d); }catch(e){console.error(e);} }

})();