/* full patched main.js — selection gating, image-controls removal, theme persistence,
   drawline tool (capped), stickers, special chars, sheet builder, find/replace, autosave
   + injected digital clock (IST) and draw-button blinking CSS */
(() => {
  try {
    const $ = id => document.getElementById(id);
    function safeAdd(el, ev, cb) { if (el) el.addEventListener(ev, cb); }

    // elements (may be null during early parse)
    const editor = $('editor');
    const status = $('status');
    const savedList = $('savedList');
    const newBtn = $('newBtn');
    const openBtn = $('openBtn');
    const saveBtn = $('saveBtn');
    const saveAsBtn = $('saveAsBtn');
    const printBtn = $('printBtn');
    const openName = $('openName');

    const exportPdfBtn = $('exportPdfBtn');
    const sendDevicePdfBtn = $('sendDevicePdfBtn');
    const exportWKBtn = $('exportWKBtn');
    const previewBtn = $('previewBtn');
    const previewServerBtn = $('previewServerBtn');

    const colorPicker = $('colorPicker');
    const highlightColor = $('highlightColor');
    const fontSelect = $('fontSelect');
    const sizeBox = $('sizeBox');
    const applySizeBtn = $('applySizeBtn');
    const fontIncrease = $('fontIncrease');
    const fontDecrease = $('fontDecrease');
    const clearFormatting = $('clearFormatting');

    const insertImageBtn = $('insertImageBtn');
    const imageFile = $('imageFile');
    const uploadImageField = $('uploadImageField');

    const insertTableBtn = $('insertTableBtn');
    const insertSheetBtn = $('insertSheetBtn');
    const sheetModal = $('sheetModal');
    const sheetRows = $('sheetRows');
    const sheetCols = $('sheetCols');
    const buildSheetBtn = $('buildSheetBtn');
    const sheetPreview = $('sheetPreview');
    const insertSheetAsTableBtn = $('insertSheetAsTableBtn');
    const insertSheetAsTsvBtn = $('insertSheetAsTsvBtn');
    const closeSheetBtn = $('closeSheetBtn');

    const insertStickerBtn = $('insertStickerBtn');
    const stickerModal = $('stickerModal');
    const stickerGrid = $('stickerGrid');
    const closeStickerBtn = $('closeStickerBtn');

    const insertSpecialBtn = $('insertSpecialBtn');
    const specialModal = $('specialModal');
    const specialGrid = $('specialGrid');
    const closeSpecialBtn = $('closeSpecialBtn');

    const findReplaceBtn = $('findReplaceBtn');
    const findModal = $('findModal');
    const findInput = $('findInput');
    const replaceInput = $('replaceInput');
    const findNextBtn = $('findNextBtn');
    const replaceOneBtn = $('replaceOneBtn');
    const replaceAllBtn = $('replaceAllBtn');
    const closeFindBtn = $('closeFindBtn');

    const numberedBtn = $('numberedBtn');
    const bulletedBtn = $('bulletedBtn');

    const highlightBtn = $('highlightBtn');
    const importBtn = $('importBtn');
    const exportRtfBtn = $('exportRtfBtn');

    const tbLeft = $('tb-left');
    const tbRight = $('tb-right');
    const toolbarInner = $('toolbar_inner');

    const selectionToolbar = $('selectionToolbar');
    const selColorInput = $('selColorInput');
    const selInc = $('selInc');
    const selDec = $('selDec');
    // selObliq and selFancy and selClose may be inside selectionToolbar
    const selObliq = $('selObliq');
    const selFancy = $('selFancy');
    const selClose = $('selClose');

    const imageSizeModal = $('imageSizeModal');
    const imagePreviewWrap = $('imagePreviewWrap');
    const imgSmall = $('imgSmall');
    const imgMedium = $('imgMedium');
    const imgLarge = $('imgLarge');
    const imgFull = $('imgFull');
    const imgCancel = $('imgCancel');

    const themeToggle = $('themeToggle');
    const drawlineBtn = $('drawlineBtn');

    if (editor && !editor.innerHTML.trim()) editor.innerHTML = '<p><br/></p>';

    // ---------- helper: inject small style for draw-button blinking & clock if not present ----------
    (function injectHelpersCSS(){
      try {
        const css = `
@keyframes sajid-blink {
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.0); transform: translateY(0); }
  50% { box-shadow: 0 0 12px 4px rgba(34,197,94,0.18); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.0); transform: translateY(0); }
}
.active-draw {
  animation: sajid-blink 1.2s infinite ease-in-out;
  border-radius: 8px !important;
}
.sajid-draw-canvas {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.sajid-clock-box {
  display:inline-block;padding:6px 10px;border-radius:8px;background:rgba(0,0,0,0.58);color:#fff;font-size:13px;margin-left:10px;
  box-shadow:0 6px 18px rgba(0,0,0,0.35);
}
.sajid-clock-row{display:flex;gap:8px;align-items:center;margin:2px 0;}
.sajid-clock-label{opacity:0.85;font-weight:600;width:44px;}
.sajid-clock-time{color:#7CFC00;font-weight:800;}
.sajid-clock-date{color:#63b3ff;font-weight:700;}
.sajid-clock-day{color:#ff6b6b;font-weight:700;}
`;
        const s = document.createElement('style');
        s.setAttribute('data-sajid-style','1');
        s.appendChild(document.createTextNode(css));
        document.head.appendChild(s);
      } catch(e){ /* ignore */ }
    })();

    // ---------- small helper: ensure clock HTML exists (inject if template not updated) ----------
    (function ensureClockHtml() {
      try {
        if (!document.getElementById('sajidClock')) {
          const left = document.querySelector('.hdr-left') || document.querySelector('header');
          if (left) {
            const box = document.createElement('div');
            box.id = 'sajidClock';
            box.style.marginTop = '6px';
            box.innerHTML = `
<div class="sajid-clock-box" id="sajidClockBox" aria-hidden="false">
  <div class="sajid-clock-row"><span class="sajid-clock-label">Time</span><span id="sajidTime" class="sajid-clock-time">--:-- --</span></div>
  <div class="sajid-clock-row"><span class="sajid-clock-label">Date</span><span id="sajidDate" class="sajid-clock-date">-- / -- / ----</span></div>
  <div class="sajid-clock-row"><span class="sajid-clock-label">Day</span><span id="sajidDay" class="sajid-clock-day">----</span></div>
</div>`;
            left.appendChild(box);
          }
        }
      } catch(e){}
    })();

    // ---------- digital clock updater (IST/Kolkata) ----------
    function updateSajidClock(){
      try {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istOffset = 5.5 * 60 * 60000;
        const ist = new Date(utc + istOffset);

        const h = ist.getHours();
        const hh = ((h + 11) % 12) + 1;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const mins = String(ist.getMinutes()).padStart(2,'0');
        const timeStr = `${hh}:${mins} ${ampm}`;
        const dateStr = `${String(ist.getDate()).padStart(2,'0')} / ${String(ist.getMonth()+1).padStart(2,'0')} / ${ist.getFullYear()}`;
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const dayStr = days[ist.getDay()];

        const elTime = document.getElementById('sajidTime');
        const elDate = document.getElementById('sajidDate');
        const elDay = document.getElementById('sajidDay');
        if (elTime) elTime.textContent = timeStr;
        if (elDate) elDate.textContent = dateStr;
        if (elDay) elDay.textContent = dayStr;
      } catch(e){}
    }
    setInterval(updateSajidClock, 1000);
    updateSajidClock();

    // ---------- selection save/restore ----------
    function saveSelection() {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return null;
      const ranges = [];
      for (let i = 0; i < sel.rangeCount; i++) ranges.push(sel.getRangeAt(i).cloneRange());
      return ranges;
    }
    function restoreSelection(ranges) {
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      if (!ranges) return;
      for (let r of ranges) sel.addRange(r);
    }

    function doCmd(cmd, val=null) {
      const r = saveSelection();
      if (editor) editor.focus();
      try { document.execCommand(cmd, false, val); } catch(e) { try{ document.execCommand(cmd, true, val); } catch(_){} }
      restoreSelection(r);
      if (editor) editor.focus();
    }

    // wrap selection in span with data-sajid and return span
    function wrapSelectionWithSpan(styleObj) {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return null;
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.setAttribute('data-sajid', '1');
      Object.keys(styleObj || {}).forEach(k => span.style[k] = styleObj[k]);
      span.appendChild(range.extractContents());
      range.insertNode(span);
      const newR = document.createRange();
      newR.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newR);
      if (editor) editor.focus();
      return span;
    }

    function getCurrentLineNode() {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) return null;
      let node = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      while (node && node !== editor && getComputedStyle(node).display === 'inline') node = node.parentElement;
      return (node === editor) ? null : node;
    }

    // ========== selection toolbar gating (long-press on mobile) ==========
    let lastTouchStart = 0;
    let allowSelectionToolbar = false;
    const LONG_PRESS_MS = 320;

    if (editor) {
      safeAdd(editor, 'touchstart', (ev)=> {
        lastTouchStart = Date.now();
        allowSelectionToolbar = false;
        setTimeout(()=> {
          if (Date.now() - lastTouchStart >= LONG_PRESS_MS) allowSelectionToolbar = true;
        }, LONG_PRESS_MS + 10);
      });
      safeAdd(editor, 'touchend', ()=> {
        const dur = Date.now() - lastTouchStart;
        if (dur >= LONG_PRESS_MS) allowSelectionToolbar = true;
        setTimeout(()=> { allowSelectionToolbar = false; }, 1200);
      });
      safeAdd(editor, 'touchcancel', ()=> { allowSelectionToolbar = false; });
    }

    function showSelectionToolbarAtRect(rect) {
      if (!selectionToolbar) return;
      selectionToolbar.style.display = 'flex';
      selectionToolbar.style.pointerEvents = 'auto';
      let top = window.scrollY + rect.top - selectionToolbar.offsetHeight - 8;
      if (top < 60) top = window.scrollY + rect.bottom + 8;
      let left = Math.max(8, Math.min(window.scrollX + rect.left, window.innerWidth - selectionToolbar.offsetWidth - 8));
      selectionToolbar.style.top = top + 'px';
      selectionToolbar.style.left = left + 'px';
    }
    function hideSelectionToolbar() {
      if (!selectionToolbar) return;
      selectionToolbar.style.display = 'none';
      selectionToolbar.style.pointerEvents = 'none';
    }

    document.addEventListener('selectionchange', ()=> {
      try {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) { hideSelectionToolbar(); return; }
        const range = sel.rangeCount ? sel.getRangeAt(0) : null;
        if (!range) { hideSelectionToolbar(); return; }
        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width < 4 && rect.height < 4)) { hideSelectionToolbar(); return; }
        const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        const selText = sel.toString().trim();
        if (isMobile) {
          if (!allowSelectionToolbar && selText.length < 2) { hideSelectionToolbar(); return; }
        }
        showSelectionToolbarAtRect(rect);
      } catch (e) { console.error('selectionchange', e); hideSelectionToolbar(); }
    });

    // selection toolbar buttons (delegated)
    if (selectionToolbar) {
      selectionToolbar.addEventListener('click', (e)=> {
        const btn = e.target.closest('button');
        if (!btn) return;
        const sc = btn.getAttribute('data-scmd');
        if (sc) { doCmd(sc); return; }
        if (btn.id === 'selInc') { adjustSelectionFontSize(2); return; }
        if (btn.id === 'selDec') { adjustSelectionFontSize(-2); return; }
        if (btn.id === 'selClose') { hideSelectionToolbar(); return; }
        if (btn.id === 'selObliq') {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) return alert('Select text first');
          wrapSelectionWithSpan({ fontStyle: 'oblique' });
          return;
        }
        if (btn.id === 'selFancy') {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) return alert('Select text first');
          wrapSelectionWithSpan({ display:'inline-block', transform:'skew(-8deg)', letterSpacing:'0.6px', fontFamily:'"Brush Script MT", "Caveat", cursive' });
          return;
        }
      });
    }
    safeAdd(selColorInput, 'input', (e)=> { applyColorToSelectionOrLine(e.target.value); });

    function applyColorToSelectionOrLine(color) {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        wrapSelectionWithSpan({ color: color });
        return;
      }
      const node = getCurrentLineNode();
      if (node) {
        const span = document.createElement('span');
        span.style.color = color;
        while (node.firstChild) span.appendChild(node.firstChild);
        node.appendChild(span);
      } else if (editor) {
        editor.style.color = color;
      }
    }

    function adjustSelectionFontSize(delta) {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        let anc = range.commonAncestorContainer;
        if (anc.nodeType === 3) anc = anc.parentElement;
        let existing = anc && anc.closest ? anc.closest('span[data-sajid]') : null;
        if (existing) {
          const cur = parseInt(existing.style.fontSize) || parseInt(window.getComputedStyle(existing).fontSize) || 16;
          existing.style.fontSize = (cur + delta) + 'px';
          const r2 = document.createRange(); r2.selectNodeContents(existing);
          const s = window.getSelection(); s.removeAllRanges(); s.addRange(r2);
          return;
        }
        const parent = range.startContainer.parentElement;
        const base = parseInt(window.getComputedStyle(parent).fontSize) || 16;
        const span = document.createElement('span');
        span.setAttribute('data-sajid','1');
        span.style.fontSize = (base + delta) + 'px';
        span.appendChild(range.extractContents());
        range.insertNode(span);
        const r3 = document.createRange(); r3.selectNodeContents(span);
        const s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(r3);
        return;
      } else {
        const node = getCurrentLineNode();
        if (node) {
          const cur = parseInt(window.getComputedStyle(node).fontSize) || 16;
          node.style.fontSize = (cur + delta) + 'px';
        } else if (editor) {
          const cur = parseInt(window.getComputedStyle(editor).fontSize) || 16;
          editor.style.fontSize = Math.max(8, cur + delta) + 'px';
        }
      }
    }

    // toolbar [data-cmd]
    document.querySelectorAll('[data-cmd]').forEach(b => {
      if (!b) return;
      const cmd = b.getAttribute('data-cmd');
      safeAdd(b, 'click', ()=> {
        if (cmd === 'undo') doCmd('undo');
        else if (cmd === 'redo') doCmd('redo');
        else if (cmd === 'cut') doCmd('cut');
        else if (cmd === 'copy') doCmd('copy');
        else if (cmd === 'paste') doCmd('paste');
        else doCmd(cmd);
      });
    });

    safeAdd($('align-left'), 'click', ()=> doCmd('justifyLeft'));
    safeAdd($('align-center'), 'click', ()=> doCmd('justifyCenter'));
    safeAdd($('align-right'), 'click', ()=> doCmd('justifyRight'));

    safeAdd(colorPicker, 'change', (e)=> applyColorToSelectionOrLine(e.target.value));

    safeAdd(highlightBtn, 'click', ()=> {
      const color = (highlightColor && highlightColor.value) ? highlightColor.value : '#ffff66';
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) { alert('Select text to highlight'); return; }
      const range = sel.getRangeAt(0);
      const span = document.createElement('span'); span.style.backgroundColor = color;
      span.appendChild(range.extractContents()); range.insertNode(span); if (editor) editor.focus();
    });

    safeAdd(fontSelect, 'change', (e)=> {
      const f = e.target.value;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span'); span.style.fontFamily = (f==='inherit'?'':f);
        span.appendChild(range.extractContents()); range.insertNode(span);
      } else if (editor) {
        editor.style.fontFamily = (f==='inherit'?'':f);
      }
    });

    safeAdd(applySizeBtn, 'click', ()=> {
      let size = parseInt(sizeBox.value) || 12;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span'); span.style.fontSize = size + 'px';
        span.appendChild(range.extractContents()); range.insertNode(span);
      } else {
        const node = getCurrentLineNode();
        if (node) node.style.fontSize = size + 'px';
        else if (editor) editor.style.fontSize = size + 'px';
      }
      if (editor) editor.focus();
    });

    safeAdd(fontIncrease, 'click', ()=> {
      const cur = parseInt(window.getComputedStyle(editor || document.body).fontSize) || 12;
      if (editor) editor.style.fontSize = Math.min(72, cur + 2) + 'px';
    });
    safeAdd(fontDecrease, 'click', ()=> {
      const cur = parseInt(window.getComputedStyle(editor || document.body).fontSize) || 12;
      if (editor) editor.style.fontSize = Math.max(8, cur - 2) + 'px';
    });

    safeAdd(clearFormatting, 'click', ()=> {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const txt = range.toString();
        range.deleteContents(); range.insertNode(document.createTextNode(txt));
      } else if (editor) {
        const t = editor.innerText;
        editor.innerHTML = ''; editor.appendChild(document.createTextNode(t));
      }
    });

    // -------- image insertion + controls (one-click removes controls) --------
    let pendingImageFile = null;
    safeAdd(insertImageBtn, 'click', ()=> imageFile && imageFile.click());
    safeAdd(imageFile, 'change', (ev)=> {
      const f = ev.target.files[0]; if (!f) return;
      pendingImageFile = f;
      const url = URL.createObjectURL(f);
      if (imagePreviewWrap) imagePreviewWrap.innerHTML = `<img src="${url}" style="max-width:100%;height:auto;"/>`;
      if (imageSizeModal) { imageSizeModal.style.display = 'flex'; imageSizeModal.setAttribute('aria-hidden','false'); }
    });

    async function uploadAndInsertImage(file, widthStyle) {
      if (!file) return;
      const fd = new FormData(); fd.append('image', file);
      if (status) status.textContent = 'Uploading image...';
      try {
        const res = await fetch('/api/upload-image', { method:'POST', body: fd });
        const j = await res.json();
        if (j.ok && j.url) {
          const wstyle = widthStyle ? `width:${widthStyle};height:auto;display:block;margin:8px auto;` : 'max-width:100%;height:auto;display:block;margin:8px auto;';
          const uniq = 'imgctrl_' + Date.now() + '_' + Math.floor(Math.random()*1000);
          const controlHtml = `<div class="img-controls" id="${uniq}" data-src="${j.url}" style="text-align:center;margin:6px 0;">
              <button class="img-sm" data-width="150px">Small</button>
              <button class="img-md" data-width="300px">Medium</button>
              <button class="img-lg" data-width="600px">Large</button>
              <button class="img-full" data-width="100%">Full</button>
            </div>`;
          document.execCommand('insertHTML', false, `<img src="${j.url}" style="${wstyle}"/>` + controlHtml);
          if (status) status.textContent = 'Image inserted';
        } else alert('Upload failed: ' + (j.error || 'no url'));
      } catch (e) { alert('Upload error: ' + e); }
      pendingImageFile = null;
    }

    safeAdd(imgSmall, 'click', ()=> { if (imageSizeModal) imageSizeModal.style.display='none'; uploadAndInsertImage(pendingImageFile, '150px'); });
    safeAdd(imgMedium, 'click', ()=> { if (imageSizeModal) imageSizeModal.style.display='none'; uploadAndInsertImage(pendingImageFile, '300px'); });
    safeAdd(imgLarge, 'click', ()=> { if (imageSizeModal) imageSizeModal.style.display='none'; uploadAndInsertImage(pendingImageFile, '600px'); });
    safeAdd(imgFull, 'click', ()=> { if (imageSizeModal) imageSizeModal.style.display='none'; uploadAndInsertImage(pendingImageFile, '100%'); });
    safeAdd(imgCancel, 'click', ()=> { if (imageSizeModal) imageSizeModal.style.display='none'; pendingImageFile=null; });

    // delegated inline image control clicks — set width AND remove controls right away
    document.addEventListener('click', (e)=> {
      const b = e.target.closest('.img-sm, .img-md, .img-lg, .img-full');
      if (!b) return;
      const width = b.getAttribute('data-width');
      const ctrl = b.closest('.img-controls');
      if (!ctrl) return;
      const prev = ctrl.previousElementSibling;
      if (prev && prev.tagName === 'IMG') {
        prev.style.width = width;
        prev.style.height = 'auto';
      }
      // remove the control container after pressing — prevents printing and duplicates
      try { ctrl.remove(); } catch(_) {}
    });

    safeAdd(uploadImageField, 'change', async (ev)=> {
      const f = ev.target.files[0]; if (!f) return;
      await uploadAndInsertImage(f, '300px');
      uploadImageField.value = '';
    });

    // table
    safeAdd(insertTableBtn, 'click', ()=> {
      const r = parseInt(prompt('Rows', '3') || '0'); const c = parseInt(prompt('Cols', '3') || '0');
      if (!r || !c) return;
      let html = '<table border="1" style="border-collapse:collapse;width:100%;">';
      for (let i=0;i<r;i++){ html += '<tr>'; for (let j=0;j<c;j++) html += '<td style="padding:6px">&nbsp;</td>'; html += '</tr>'; }
      html += '</table><p></p>';
      document.execCommand('insertHTML', false, html);
    });

    // sheet builder
    function buildSheetPreview(){
      const r = Math.max(1, parseInt(sheetRows ? sheetRows.value : 5));
      const c = Math.max(1, parseInt(sheetCols ? sheetCols.value : 5));
      let tbl = '<table border="1" style="border-collapse:collapse;width:100%;">';
      tbl += '<thead><tr>';
      for (let j=1;j<=c;j++) tbl += `<th style="padding:6px">c${j}</th>`;
      tbl += '</tr></thead><tbody>';
      for (let i=0;i<r;i++){ tbl += '<tr>'; for (let j=0;j<c;j++) tbl += `<td contenteditable="true" style="padding:6px"></td>`; tbl += '</tr>'; }
      tbl += '</tbody></table>';
      if (sheetPreview) sheetPreview.innerHTML = tbl;
    }
    safeAdd(insertSheetBtn, 'click', ()=> { if (sheetModal) { sheetModal.style.display='block'; sheetModal.setAttribute('aria-hidden','false'); } buildSheetPreview(); });
    safeAdd(buildSheetBtn, 'click', buildSheetPreview);
    safeAdd(insertSheetAsTableBtn, 'click', ()=> { document.execCommand('insertHTML', false, sheetPreview ? sheetPreview.innerHTML + '<p></p>' : ''); if (sheetModal) { sheetModal.style.display='none'; sheetModal.setAttribute('aria-hidden','true'); } });
    safeAdd(insertSheetAsTsvBtn, 'click', ()=> { const rows = Array.from(sheetPreview ? sheetPreview.querySelectorAll('tbody tr') : []); const lines = rows.map(tr => Array.from(tr.children).map(td=>td.innerText.trim()).join('\t')); document.execCommand('insertHTML', false, lines.join('\n') + '<p></p>'); if (sheetModal) { sheetModal.style.display='none'; sheetModal.setAttribute('aria-hidden','true'); } });
    safeAdd(closeSheetBtn, 'click', ()=> { if (sheetModal) { sheetModal.style.display='none'; sheetModal.setAttribute('aria-hidden','true'); } });

    // stickers / special
    const stickers = ['\u{1F600}','\u{1F609}','\u2714','\u{1F525}','\u{1F4A1}','\u{1F44D}','\u{1F49C}','\u{1F60D}','\u{1F44C}','\u{1F4DD}'];
    function buildStickerGrid(){ if (!stickerGrid) return; stickerGrid.innerHTML=''; stickers.forEach(s=>{ const b=document.createElement('button'); b.textContent=s; b.className='stickerBtn'; b.addEventListener('click', ()=>{ document.execCommand('insertHTML', false, s); if (stickerModal) { stickerModal.style.display='none'; stickerModal.setAttribute('aria-hidden','true'); } }); stickerGrid.appendChild(b); }); }
    safeAdd(insertStickerBtn, 'click', ()=> { if (stickerModal) { stickerModal.style.display='block'; stickerModal.setAttribute('aria-hidden','false'); } buildStickerGrid(); });
    safeAdd(closeStickerBtn, 'click', ()=> { if (stickerModal) { stickerModal.style.display='none'; stickerModal.setAttribute('aria-hidden','true'); } });

    const specialChars = ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','₹','©','•','—','…'];
    function buildSpecialGrid(){ if(!specialGrid) return; specialGrid.innerHTML=''; specialChars.forEach(ch=>{ const b=document.createElement('button'); b.textContent=ch; b.addEventListener('click', ()=>{ document.execCommand('insertHTML', false, ch); if (specialModal) { specialModal.style.display='none'; specialModal.setAttribute('aria-hidden','true'); } }); specialGrid.appendChild(b); }); }
    safeAdd(insertSpecialBtn, 'click', ()=> { if (specialModal) { specialModal.style.display='block'; specialModal.setAttribute('aria-hidden','false'); } buildSpecialGrid(); });
    safeAdd(closeSpecialBtn, 'click', ()=> { if (specialModal) { specialModal.style.display='none'; specialModal.setAttribute('aria-hidden','true'); } });

    // Find/Replace
    let lastFoundIdx = 0;
    safeAdd(findReplaceBtn, 'click', ()=> { if (findModal) { findModal.style.display='block'; findModal.setAttribute('aria-hidden','false'); } if (findInput) findInput.focus(); });
    safeAdd(closeFindBtn, 'click', ()=> { if (findModal) { findModal.style.display='none'; findModal.setAttribute('aria-hidden','true'); } lastFoundIdx=0; });

    safeAdd(findNextBtn, 'click', ()=> {
      const needle = findInput ? findInput.value : ''; if(!needle) return alert('Enter text to find');
      const text = editor ? editor.innerText : '';
      const idx = text.indexOf(needle, lastFoundIdx);
      if(idx === -1){ alert('Not found'); lastFoundIdx = 0; return; }
      function createRangeAt(root, charIndex, length){
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let cur = tw.nextNode(); let count = 0;
        while(cur){
          const next = count + cur.textContent.length;
          if(charIndex < next){
            const r = document.createRange();
            const startOff = charIndex - count; const endOff = Math.min(cur.textContent.length, startOff + length);
            r.setStart(cur, startOff); r.setEnd(cur, endOff); return r;
          }
          count = next; cur = tw.nextNode();
        }
        return null;
      }
      const r = createRangeAt(editor, idx, needle.length);
      if(r){ const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); if (editor) editor.focus(); lastFoundIdx = idx + needle.length; }
      else alert('Could not select found text');
    });

    safeAdd(replaceOneBtn, 'click', ()=> {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const r = sel.getRangeAt(0); r.deleteContents(); r.insertNode(document.createTextNode(replaceInput ? replaceInput.value || '' : '')); if (status) status.textContent = 'Replaced one';
      } else alert('Select the occurrence (Find Next) first');
    });

    safeAdd(replaceAllBtn, 'click', ()=> {
      const needle = findInput ? findInput.value : ''; const replacement = replaceInput ? replaceInput.value || '' : '';
      if(!needle) return alert('Enter find text');
      if(!confirm('Replace all occurrences (formatting may be lost)?')) return;
      const newText = (editor ? editor.innerText : '').split(needle).join(replacement);
      if (editor) { editor.innerHTML = ''; editor.appendChild(document.createTextNode(newText)); }
      if (status) status.textContent='Replace all done (formatting lost)'; if (findModal) { findModal.style.display='none'; findModal.setAttribute('aria-hidden','true'); }
    });

    safeAdd(numberedBtn, 'click', ()=> doCmd('insertOrderedList'));
    safeAdd(bulletedBtn, 'click', ()=> doCmd('insertUnorderedList'));

    // Open / Save
    safeAdd(openBtn, 'click', async ()=> {
      const name = openName ? openName.value.trim() : '';
      if(!name){ alert('Enter filename to load'); return; }
      try {
        const res = await fetch('/api/load?name=' + encodeURIComponent(name));
        const j = await res.json();
        if(j.ok && editor){ editor.innerHTML = j.html; if (status) status.textContent = 'Loaded: ' + name; updateSavedList(name); }
        else alert('Load failed: ' + (j.error || 'not found'));
      } catch(e){ alert('Load error: ' + e); }
    });

    safeAdd(saveBtn, 'click', async ()=> {
      const name = openName ? openName.value.trim() : `.autosave.html`;
      const html = editor ? editor.innerHTML : '';
      try {
        const res = await fetch('/api/save', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, html }) });
        const j = await res.json();
        if(j.ok){ if (openName) openName.value = j.path; alert('Saved: ' + j.path); if (status) status.textContent = 'Saved: ' + j.path; updateSavedList(j.path); }
        else alert('Save failed: ' + (j.error || 'unknown'));
      } catch(e){ alert('Save error: ' + e); }
    });

    safeAdd(saveAsBtn, 'click', ()=> {
      const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + (editor ? editor.innerHTML : '') + '</body></html>';
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      const filename = prompt('Save as filename', openName ? openName.value || `note_${Date.now()}.html` : `note_${Date.now()}.html`) || `note_${Date.now()}.html`;
      a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      if (status) status.textContent = 'Downloaded HTML';
    });

    safeAdd(printBtn, 'click', ()=> {
      const w = window.open(); w.document.write('<!doctype html><html><head><meta charset="utf-8"></head><body>' + (editor ? editor.innerHTML : '') + '</body></html>'); w.document.close(); w.print();
    });

    safeAdd(exportRtfBtn, 'click', ()=> {
      const txt = editor ? editor.innerText || '' : '';
      const rtf = '{\\rtf1\\ansi ' + txt.replace(/\\/g,'\\\\').replace(/{/g,'\\\\{').replace(/}/g,'\\\\}').replace(/\n/g,'\\\\par ') + '}';
      const blob = new Blob([rtf], { type: 'application/rtf' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (openName ? openName.value || 'document' : 'document') + '.rtf'; document.body.appendChild(a); a.click(); a.remove();
    });

    // image inlining helpers for export
    async function urlToDataURI(url) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        return url;
      }
    }
    async function inlineImagesInHtml(htmlRoot) {
      const tmp = document.createElement('div');
      tmp.innerHTML = htmlRoot;
      const imgs = Array.from(tmp.querySelectorAll('img'));
      for (const img of imgs) {
        const src = img.getAttribute('src') || '';
        if (src.startsWith('/')) {
          try {
            const data = await urlToDataURI(src);
            img.setAttribute('src', data);
          } catch (e) {}
        }
      }
      return tmp.innerHTML;
    }

    async function exportHtmlToServer(outname){
      const inlineCSS = 'body{font-family: \"Noto Sans\",\"DejaVu Sans\",sans-serif;margin:20mm;} img{max-width:100%;height:auto;}';
      let html = '<!doctype html><html><head><meta charset=\"utf-8\"><style>' + inlineCSS + '</style></head><body>' + (editor ? editor.innerHTML : '') + '</body></html>';
      if (status) status.textContent = 'Preparing images...';
      try {
        const bodyOnly = '<div>' + (editor ? editor.innerHTML : '') + '</div>';
        const inlined = await inlineImagesInHtml(bodyOnly);
        html = '<!doctype html><html><head><meta charset=\"utf-8\"><style>' + inlineCSS + '</style></head><body>' + inlined + '</body></html>';

        if (status) status.textContent = 'Exporting...';
        const res = await fetch('/api/export_pdf', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ html, outname }) });
        const j = await res.json();
        if(j.ok && j.pdf){ alert('Exported: ' + j.pdf); if (status) status.textContent = 'Exported: ' + j.pdf; }
        else if(j.warning){ alert('Warning: ' + j.warning); if (status) status.textContent = 'Saved HTML fallback'; }
        else alert('Export failed: ' + (j.error || 'unknown'));
      } catch (e) { if (status) status.textContent = 'Export error'; alert('Export error: ' + e); }
    }

    safeAdd(exportPdfBtn, 'click', ()=> exportHtmlToServer(openName ? openName.value.trim() || (`sajid_${Date.now()}.pdf`) : (`sajid_${Date.now()}.pdf`)));
    safeAdd(sendDevicePdfBtn, 'click', ()=> exportHtmlToServer(openName ? openName.value.trim() || (`sajid_${Date.now()}.pdf`) : (`sajid_${Date.now()}.pdf`)));
    safeAdd(exportWKBtn, 'click', ()=> exportHtmlToServer(openName ? openName.value.trim() || (`sajid_${Date.now()}.pdf`) : (`sajid_${Date.now()}.pdf`)));
    safeAdd(previewServerBtn, 'click', ()=> exportHtmlToServer(openName ? openName.value.trim() || (`preview_${Date.now()}.pdf`) : (`preview_${Date.now()}.pdf`)));

    safeAdd(previewBtn, 'click', ()=> {
      const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + (editor ? editor.innerHTML : '') + '</body></html>';
      const w = window.open(); w.document.write(html); w.document.close();
    });

    // import from storage (client)
    safeAdd(importBtn, 'click', async ()=> {
      const inp = document.createElement('input'); inp.type='file'; inp.multiple=true;
      inp.onchange = async (ev) => {
        for (const f of ev.target.files) {
          if (f.type && f.type.startsWith('image/')) {
            const fd = new FormData(); fd.append('image', f);
            const res = await fetch('/api/upload-image', { method:'POST', body: fd });
            const j = await res.json();
            if (j.ok && j.url) document.execCommand('insertHTML', false, `<img src="${j.url}" style="max-width:80%;height:auto;display:block;margin:8px auto;"/><div class="img-controls" data-src="${j.url}" style="text-align:center;margin:6px 0;"><button class="img-sm" data-width="150px">Small</button><button class="img-md" data-width="300px">Medium</button><button class="img-lg" data-width="600px">Large</button><button class="img-full" data-width="100%">Full</button></div>`);
          } else {
            const txt = await f.text();
            document.execCommand('insertHTML', false, `<pre>${txt}</pre><p></p>`);
          }
        }
        if (status) status.textContent = 'Import finished';
      };
      inp.click();
    });

    safeAdd(tbLeft, 'click', ()=> toolbarInner && toolbarInner.scrollBy({left:-140, behavior:'smooth'}));
    safeAdd(tbRight, 'click', ()=> toolbarInner && toolbarInner.scrollBy({left:140, behavior:'smooth'}));

    if (editor) {
      editor.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') setTimeout(()=> { try { document.execCommand('foreColor', false, '#000000'); } catch(e){} }, 10);
      });
    }

    // autosave every 15s
    let lastHtml = '';
    async function autosave() {
      const html = editor ? editor.innerHTML : '';
      if (html === lastHtml) return;
      lastHtml = html;
      const name = openName && openName.value.trim() ? openName.value.trim() : '.autosave.html';
      try {
        const res = await fetch('/api/autosave', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, html }) });
        const j = await res.json();
        if (j.ok) { if (status) status.textContent = 'Autosaved: ' + j.path + ' @ ' + (new Date()).toLocaleTimeString(); updateSavedList(j.path); }
        else if (status) status.textContent = 'Autosave failed';
      } catch(e){ if (status) status.textContent = 'Autosave error'; }
    }
    setInterval(autosave, 15000);

    function updateSavedList(latest) {
      try {
        const name = latest || (openName ? openName.value.trim() : '');
        if (!name) return;
        const now = new Date(); if (savedList) savedList.innerHTML = `<div class="saved-item">${name} — ${now.toLocaleString()}</div>`;
      } catch(e){}
    }

    (async function tryLoadAutosave(){
      try {
        const res = await fetch('/api/autosave/load?name=' + encodeURIComponent('.autosave.html'));
        const j = await res.json();
        if(j.ok && j.html && j.html.trim()) {
          if (editor) editor.innerHTML = j.html;
          if (openName) openName.value = j.path || '.autosave.html';
          updateSavedList(openName ? openName.value : '.autosave.html');
          if (status) status.textContent = 'Restored autosave: ' + (openName ? openName.value : '.autosave.html');
          lastHtml = editor ? editor.innerHTML : '';
        }
      } catch(e){}
    })();

    window.addEventListener('click', (e)=> {
      const modals = [sheetModal, stickerModal, specialModal, findModal, imageSizeModal];
      for (const m of modals) {
        if (!m) continue;
        const visible = (m.style && m.style.display && m.style.display !== 'none') || m.getAttribute && m.getAttribute('aria-hidden') === 'false';
        if (visible) {
          const content = m.querySelector && m.querySelector('.modal-content');
          if (content && !content.contains(e.target)) {
            m.style.display = 'none'; m.setAttribute('aria-hidden','true');
          }
        }
      }
      if (selectionToolbar && selectionToolbar.style.display && selectionToolbar.style.display !== 'none') {
        if (!selectionToolbar.contains(e.target) && editor && !editor.contains(e.target)) hideSelectionToolbar();
      }
    });

    // THEME persistence
    const THEME_KEY = 'sajid_theme';
    (function applySavedTheme() {
      try {
        const t = localStorage.getItem(THEME_KEY);
        if (t === 'dark') document.documentElement.classList.add('dark-theme');
        else document.documentElement.classList.remove('dark-theme');
      } catch(e){}
    })();
    safeAdd(themeToggle, 'click', ()=> {
      const dark = document.documentElement.classList.toggle('dark-theme');
      try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch(e){}
    });

    // ========== DRAWLINE tool (freehand, safe/capped) ==========
    let drawActive = false;
    let drawCanvas = null;
    let drawCtx = null;
    let drawing = false;
    let lastPos = null;
    let rafScheduled = false;
    // increased caps per request (still cautious)
    const MAX_CANVAS_DIM = 6000; // larger but capped
    const MAX_DPR = 2.5;

    function createDrawCanvasSafely() {
      if (!editor) return null;
      const rect = editor.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) return null;

      const cssW = Math.max(200, Math.round(rect.width));
      const cssH = Math.max(120, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      // compute backing but cap
      let backingW = Math.min(Math.round(cssW * dpr), MAX_CANVAS_DIM);
      let backingH = Math.min(Math.round(cssH * dpr), MAX_CANVAS_DIM);

      const c = document.createElement('canvas');
      c.className = 'sajid-draw-canvas';
      c.style.position = 'absolute';
      c.style.left = (rect.left + window.scrollX) + 'px';
      c.style.top = (rect.top + window.scrollY) + 'px';
      c.style.width = cssW + 'px';
      c.style.height = cssH + 'px';
      c.style.zIndex = 99999;
      c.style.pointerEvents = 'auto';
      c.style.background = 'transparent';
      c.width = backingW;
      c.height = backingH;

      drawCtx = c.getContext('2d');
      if (!drawCtx) return null;

      // scale context so drawing can use CSS pixels coordinates
      const scaleX = backingW / cssW;
      const scaleY = backingH / cssH;
      if (scaleX !== 1 || scaleY !== 1) drawCtx.scale(scaleX, scaleY);

      // stroke defaults
      drawCtx.lineWidth = 4;
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';
      drawCtx.strokeStyle = '#1f8bff';

      document.body.appendChild(c);

      function updatePos() {
        const r = editor.getBoundingClientRect();
        c.style.left = (r.left + window.scrollX) + 'px';
        c.style.top = (r.top + window.scrollY) + 'px';
        c.style.width = Math.max(2, Math.round(r.width)) + 'px';
        c.style.height = Math.max(2, Math.round(r.height)) + 'px';
      }
      window.addEventListener('resize', updatePos);
      window.addEventListener('scroll', updatePos, true);
      c._updatePos = updatePos;
      return c;
    }

    function enableDraw() {
      try {
        if (drawCanvas) return;
        drawCanvas = createDrawCanvasSafely();
        if (!drawCanvas) { if (status) status.textContent = 'Cannot enable draw (editor too small)'; return; }
        drawCtx = drawCanvas.getContext('2d');
        drawing = false; lastPos = null; rafScheduled = false;
        drawCanvas.addEventListener('pointerdown', onPointerDown);
        drawCanvas.addEventListener('pointermove', onPointerMove);
        drawCanvas.addEventListener('pointerup', onPointerUp);
        drawCanvas.addEventListener('pointercancel', onPointerUp);
        // ensure draw button visible state
        if (drawlineBtn) drawlineBtn.classList.add('active-draw');
        if (status) status.textContent = 'Draw mode ON — draw on the editor';
      } catch (err) { console.error('enableDraw', err); }
    }

    function disableDraw() {
      try {
        if (!drawCanvas) return;
        drawCanvas.removeEventListener('pointerdown', onPointerDown);
        drawCanvas.removeEventListener('pointermove', onPointerMove);
        drawCanvas.removeEventListener('pointerup', onPointerUp);
        drawCanvas.removeEventListener('pointercancel', onPointerUp);
        if (drawCanvas._updatePos) {
          window.removeEventListener('resize', drawCanvas._updatePos);
          window.removeEventListener('scroll', drawCanvas._updatePos, true);
        }
        drawCanvas.remove();
        drawCanvas = null;
        drawCtx = null;
        drawing = false; lastPos = null; rafScheduled = false;
        if (drawlineBtn) drawlineBtn.classList.remove('active-draw');
        if (status) status.textContent = 'Draw mode OFF';
      } catch (err) { console.error('disableDraw', err); }
    }

    function getPointerPosRelative(event, canvas) {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left), y: (event.clientY - rect.top) };
    }

    function onPointerDown(e) {
      drawing = true;
      try { if (drawCanvas.setPointerCapture) drawCanvas.setPointerCapture(e.pointerId); } catch(_) {}
      lastPos = getPointerPosRelative(e, drawCanvas);
      if (drawCtx) {
        drawCtx.beginPath();
        drawCtx.moveTo(lastPos.x, lastPos.y);
      }
    }
    function onPointerMove(e) {
      if (!drawing) return;
      const pos = getPointerPosRelative(e, drawCanvas);
      if (!rafScheduled) {
        rafScheduled = true;
        window.requestAnimationFrame(() => {
          rafScheduled = false;
          if (!drawCtx || !lastPos) { lastPos = pos; return; }
          drawCtx.lineTo(pos.x, pos.y);
          drawCtx.stroke();
          lastPos = pos;
        });
      } else {
        lastPos = pos;
      }
    }
    function onPointerUp(e) {
      if (!drawing) return;
      drawing = false;
      try { if (drawCanvas.releasePointerCapture) drawCanvas.releasePointerCapture(e.pointerId); } catch(_) {}
      setTimeout(()=> {
        if (!drawCanvas) return;
        try {
          // convert to dataURL (may be large) and insert as image
          const dataUrl = drawCanvas.toDataURL('image/png');
          const imgHtml = `<img src="${dataUrl}" style="max-width:100%;height:auto;display:block;margin:8px auto;"/>`;
          document.execCommand('insertHTML', false, imgHtml);
        } catch(err) { console.error('export draw', err); }
        // clear backing (so next drawing doesn't overlay) — clear full backing dimensions
        if (drawCtx && drawCanvas) {
          try {
            // clear using backing-width/height (context is scaled) - clearing full canvas pixels
            drawCtx.clearRect(0,0,drawCanvas.width, drawCanvas.height);
          } catch(e){ /* ignore */ }
        }
      }, 30);
    }

    safeAdd(drawlineBtn, 'click', ()=> {
      try {
        drawActive = !drawActive;
        if (drawActive) {
          enableDraw();
        } else {
          disableDraw();
        }
      } catch(err){ console.error('draw toggle', err); }
    });

    // done main logic
  } catch (err) {
    console.error('main.js top-level error:', err);
  }
})();
