(function(){

  /* ============================================================
     1. DEFINICIÓN DE WIDGETS
     ============================================================ */
  const FONTS = ['Segoe UI','Arial','Helvetica','Times New Roman','Courier New','Verdana'];

  const FIELD_META = {
    text:      { label:'Texto', type:'text' },
    value:     { label:'Valor inicial', type:'text' },
    command:   { label:'Acción (command)', type:'text' },
    bg:        { label:'Color de fondo', type:'color' },
    fg:        { label:'Color de texto', type:'color' },
    fontFamily:{ label:'Fuente', type:'select', options: FONTS },
    fontSize:  { label:'Tamaño de fuente', type:'number' },
    group:     { label:'Grupo (variable compartida)', type:'text' },
    items:     { label:'Elementos (uno por línea)', type:'textarea' },
    from_:     { label:'Desde', type:'number' },
    to_:       { label:'Hasta', type:'number' },
    orient:    { label:'Orientación', type:'select', options:['horizontal','vertical'] },
    values:    { label:'Valores (separados por coma)', type:'text' },
    state:     { label:'Estado', type:'select', options:['readonly','normal','disabled'] }
  };

  const WIDGET_DEFS = {
    Button:      { label:'Button', py:'Button', ttk:false, w:100, h:32,
                   fields:['text','command','bg','fg','fontFamily','fontSize'],
                   defaults:{ text:'Botón', command:'', bg:'#e1e1e1', fg:'#000000', fontFamily:'Segoe UI', fontSize:10 } },
    Label:       { label:'Label', py:'Label', ttk:false, w:90, h:24,
                   fields:['text','bg','fg','fontFamily','fontSize'],
                   defaults:{ text:'Etiqueta', bg:'#f0f0f0', fg:'#000000', fontFamily:'Segoe UI', fontSize:10 } },
    Entry:       { label:'Entry', py:'Entry', ttk:false, w:140, h:26,
                   fields:['value','bg','fg','fontFamily','fontSize'],
                   defaults:{ value:'', bg:'#ffffff', fg:'#000000', fontFamily:'Segoe UI', fontSize:10 } },
    Text:        { label:'Text', py:'Text', ttk:false, w:200, h:100,
                   fields:['value','bg','fg','fontFamily','fontSize'],
                   defaults:{ value:'', bg:'#ffffff', fg:'#000000', fontFamily:'Courier New', fontSize:10 } },
    Checkbutton: { label:'Checkbutton', py:'Checkbutton', ttk:false, w:130, h:26,
                   fields:['text','bg','fg','fontFamily','fontSize'],
                   defaults:{ text:'Opción', bg:'#f0f0f0', fg:'#000000', fontFamily:'Segoe UI', fontSize:10 } },
    Radiobutton: { label:'Radiobutton', py:'Radiobutton', ttk:false, w:130, h:26,
                   fields:['text','group','value','bg','fg','fontFamily','fontSize'],
                   defaults:{ text:'Opción', group:'grupo1', value:1, bg:'#f0f0f0', fg:'#000000', fontFamily:'Segoe UI', fontSize:10 } },
    Listbox:     { label:'Listbox', py:'Listbox', ttk:false, w:150, h:100,
                   fields:['items','bg','fg','fontFamily','fontSize'],
                   defaults:{ items:'Elemento 1\nElemento 2\nElemento 3', bg:'#ffffff', fg:'#000000', fontFamily:'Segoe UI', fontSize:10 } },
    Frame:       { label:'Frame', py:'Frame', ttk:false, w:160, h:100,
                   fields:['bg'],
                   defaults:{ bg:'#d9d9d9' } },
    LabelFrame:  { label:'LabelFrame', py:'LabelFrame', ttk:false, w:180, h:120,
                   fields:['text','bg','fg'],
                   defaults:{ text:'Grupo', bg:'#f0f0f0', fg:'#000000' } },
    Canvas:      { label:'Canvas', py:'Canvas', ttk:false, w:160, h:100,
                   fields:['bg'],
                   defaults:{ bg:'#ffffff' } },
    Scale:       { label:'Scale', py:'Scale', ttk:false, w:150, h:44,
                   fields:['from_','to_','orient','bg','fg'],
                   defaults:{ from_:0, to_:100, orient:'horizontal', bg:'#f0f0f0', fg:'#000000' } },
    Spinbox:     { label:'Spinbox', py:'Spinbox', ttk:false, w:100, h:26,
                   fields:['from_','to_','bg','fg','fontFamily','fontSize'],
                   defaults:{ from_:0, to_:10, bg:'#ffffff', fg:'#000000', fontFamily:'Segoe UI', fontSize:10 } },
    Combobox:    { label:'Combobox', py:'Combobox', ttk:true, w:140, h:26,
                   fields:['values','state'],
                   defaults:{ values:'Opción 1, Opción 2, Opción 3', state:'readonly' } },
    Progressbar: { label:'Progressbar', py:'Progressbar', ttk:true, w:160, h:20,
                   fields:['value','orient'],
                   defaults:{ value:50, orient:'horizontal' } },
    Scrollbar:   { label:'Scrollbar', py:'Scrollbar', ttk:true, w:18, h:120,
                   fields:['orient'],
                   defaults:{ orient:'vertical' } }
  };

  /* ============================================================
     2. ESTADO
     ============================================================ */
  let widgets = [];      // instancias colocadas
  let selectedId = null;
  let idCounters = {};
  let canvasSize = { w:480, h:340 };
  let dragState = null;
  // Factor de escala aplicado al lienzo cuando no cabe a lo ancho de la
  // pantalla (móvil vertical); 1 = sin escalar (tamaño real, escritorio).
  let designScale = 1;

  // Estado del "modo importado": si no es null, venimos de pegar+importar código
  // propio y cada edición visual debe parchear ese texto original en vez de
  // regenerarlo desde cero. Ver sección 7B/7C más abajo.
  let importedLineRecords = null;
  let rootTitleLineRec = null;
  let rootGeomLineRec = null;
  let rootResizableLineRec = null;
  let rootVarNameGlobal = 'root';

  const canvasEl = document.getElementById('canvas');
  const windowMock = document.getElementById('window-mock');
  const tkCanvasColEl = document.getElementById('tkCanvasCol');
  const tkCanvasScalerEl = document.getElementById('tkCanvasScaler');
  const windowTitleEl = document.getElementById('window-title');
  const canvasSizeLabel = document.getElementById('canvas-size-label');
  const propsEl = document.getElementById('props');
  const codeBox = document.getElementById('pythonCode');
  const emptyHint = document.getElementById('empty-hint');
  const toastEl = document.getElementById('toast');

  /* ============================================================
     3. HELPERS
     ============================================================ */
  function sanitizeIdent(s){
    s = (s || '').toString().trim().toLowerCase();
    s = s.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    if(!s) s = 'x';
    if(/^[0-9]/.test(s)) s = 'v_' + s;
    return s;
  }
  function pyStr(s){
    return '"' + String(s === undefined ? '' : s)
      .replace(/\\/g,'\\\\')
      .replace(/"/g,'\\"')
      .replace(/\n/g,'\\n') + '"';
  }
  function escapeHtml(s){
    return String(s === undefined ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function clamp(v, min, max){ return Math.max(min, Math.min(v, max)); }
  // Devuelve {x,y} tanto de eventos de ratón como de eventos táctiles, para
  // que el arrastre de widgets funcione igual con el dedo en móvil.
  function getPoint(e){
    if(e.touches && e.touches.length) return { x:e.touches[0].clientX, y:e.touches[0].clientY };
    if(e.changedTouches && e.changedTouches.length) return { x:e.changedTouches[0].clientX, y:e.changedTouches[0].clientY };
    return { x:e.clientX, y:e.clientY };
  }

  let toastTimer = null;
  function showToast(msg, isErr){
    toastEl.textContent = msg;
    toastEl.className = isErr ? 'toast-err' : '';
    requestAnimationFrame(()=> toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.classList.remove('show'), isErr ? 4200 : 2400);
  }

  /* ============================================================
     3B. INTEGRACIÓN CON EL HOST (SPYidle)
     ------------------------------------------------------------
     El diseñador ya NO es una ventana ni un overlay aparte: es una
     pestaña más dentro del mismo panel del editor ("💻 Código" /
     "🎨 Diseño visual"), así que "abrir/cerrar" simplemente cambia
     qué pestaña está visible. El código en sí vive en un único
     lugar (Monaco); el textarea #pythonCode es solo un buffer
     interno de este motor, nunca se muestra al usuario.
     Exponemos window.TkDesigner para que SPYidle controle todo esto
     y reciba los cambios que el propio diseñador genera al
     arrastrar/editar widgets (onUpdate).
     ============================================================ */
  const tabCodigoBtn = document.getElementById('tabCodigoBtn');
  const tabDisenoBtn = document.getElementById('tabDisenoBtn');
  const monacoHostEl = document.getElementById('editor');
  const tkDesignPaneEl = document.getElementById('tkDesignPane');
  // Estos dos viven fuera del panel del editor (widgets bajo la lista de
  // archivos, propiedades encima de la terminal), pero se muestran y
  // ocultan siempre junto con la pestaña "Diseño visual".
  const tkToolboxColEl = document.getElementById('tkToolboxCol');
  const tkPropsColEl = document.getElementById('tkPropsCol');
  const updateListeners = [];
  let notifyScheduled = false;

  // Coalescido en un rAF: durante un arrastre, syncCode() puede llamarse
  // decenas de veces por segundo; no tiene sentido reescribir Monaco tan a
  // menudo, así que agrupamos todas esas llamadas en un único aviso por frame.
  function notifyUpdate(){
    if(notifyScheduled) return;
    notifyScheduled = true;
    requestAnimationFrame(()=>{
      notifyScheduled = false;
      updateListeners.forEach(cb=>{
        try{ cb(codeBox.value); } catch(e){ console.error(e); }
      });
    });
  }

  function openDesigner(){
    if(!tkDesignPaneEl) return;
    tkDesignPaneEl.style.display = 'flex';
    if(tkToolboxColEl) tkToolboxColEl.style.display = 'block';
    if(tkPropsColEl) tkPropsColEl.style.display = 'block';
    if(monacoHostEl) monacoHostEl.style.display = 'none';
    if(tabDisenoBtn) tabDisenoBtn.classList.add('active');
    if(tabCodigoBtn) tabCodigoBtn.classList.remove('active');
    document.body.classList.add('tk-mode');
    // Al entrar a la pestaña de diseño, el lienzo siempre refleja
    // el código que hay ahora mismo en Monaco (una sola fuente de verdad).
    if(window.editor){
      try{
        codeBox.value = window.editor.getValue();
        parsePythonToDesign(codeBox.value);
      } catch(e){ console.error(e); }
    }
    // El panel puede haber cambiado de tamaño (p.ej. body.tk-mode le da
    // más alto en móvil), así que recalculamos la escala del lienzo tras
    // el siguiente repintado.
    requestAnimationFrame(updateCanvasScale);
  }
  function closeDesigner(){
    if(!tkDesignPaneEl) return;
    tkDesignPaneEl.style.display = 'none';
    if(tkToolboxColEl) tkToolboxColEl.style.display = 'none';
    if(tkPropsColEl) tkPropsColEl.style.display = 'none';
    if(monacoHostEl) monacoHostEl.style.display = 'block';
    if(tabCodigoBtn) tabCodigoBtn.classList.add('active');
    if(tabDisenoBtn) tabDisenoBtn.classList.remove('active');
    document.body.classList.remove('tk-mode');
    // Monaco necesita recalcular su layout tras haber estado con display:none.
    if(window.editor && window.editor.layout){
      setTimeout(()=> window.editor.layout(), 0);
    }
  }
  function isDesignerOpen(){
    return !!(tkDesignPaneEl && tkDesignPaneEl.style.display === 'flex');
  }

  if(tabCodigoBtn) tabCodigoBtn.addEventListener('click', closeDesigner);
  if(tabDisenoBtn) tabDisenoBtn.addEventListener('click', openDesigner);

  /* ============================================================
     4. TOOLBOX
     ============================================================ */
  const toolboxEl = document.getElementById('toolbox');
  Object.keys(WIDGET_DEFS).forEach(type=>{
    const def = WIDGET_DEFS[type];
    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    btn.innerHTML = '<span class="tool-glyph">' + (def.ttk ? 'ttk' : 'tk') + '</span><span>' + def.label + '</span>';
    btn.addEventListener('click', ()=> addWidget(type));
    toolboxEl.appendChild(btn);
  });

  function addWidget(type){
    const def = WIDGET_DEFS[type];
    idCounters[type] = (idCounters[type] || 0) + 1;
    const varName = sanitizeIdent(type) + '_' + idCounters[type];
    const cascade = (widgets.length % 6) * 14;
    const w = {
      id: 'w' + Date.now() + Math.floor(Math.random()*1000),
      type: type,
      varName: varName,
      x: clamp(24 + cascade, 0, Math.max(0, canvasSize.w - def.w)),
      y: clamp(24 + cascade, 0, Math.max(0, canvasSize.h - def.h)),
      width: def.w,
      height: def.h,
      props: Object.assign({}, def.defaults)
    };
    widgets.push(w);
    selectedId = w.id;
    renderCanvas();
    renderProps();
    if(importedLineRecords) insertNewWidgetIntoImportedCode(w);
    syncCode();
  }

  /* ============================================================
     5. RENDER DEL LIENZO
     ============================================================ */
  function widgetPreviewHTML(w){
    const def = WIDGET_DEFS[w.type];
    const p = w.props;
    const fontCss = 'font-family:' + (p.fontFamily || 'Segoe UI') + ';font-size:' + (p.fontSize || 10) + 'px;';
    switch(w.type){
      case 'Button':
        return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
          'background:' + p.bg + ';color:' + p.fg + ';' + fontCss +
          'border:1px solid #767676;border-radius:3px;">' + escapeHtml(p.text) + '</div>';
      case 'Label':
        return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
          'background:' + p.bg + ';color:' + p.fg + ';' + fontCss + '">' + escapeHtml(p.text) + '</div>';
      case 'Entry':
        return '<div style="width:100%;height:100%;display:flex;align-items:center;padding:0 6px;' +
          'background:' + p.bg + ';color:' + p.fg + ';' + fontCss +
          'border:1px solid #767676;box-sizing:border-box;">' + escapeHtml(p.value) + '</div>';
      case 'Text':
        return '<div style="width:100%;height:100%;padding:4px 6px;overflow:hidden;white-space:pre-wrap;' +
          'background:' + p.bg + ';color:' + p.fg + ';' + fontCss +
          'border:1px solid #767676;box-sizing:border-box;text-align:left;align-items:flex-start;justify-content:flex-start;">' + escapeHtml(p.value) + '</div>';
      case 'Checkbutton':
        return '<div style="width:100%;height:100%;display:flex;align-items:center;gap:5px;' +
          'background:' + p.bg + ';color:' + p.fg + ';' + fontCss + '">' +
          '<span style="width:12px;height:12px;border:1px solid #666;background:#fff;flex-shrink:0;"></span>' + escapeHtml(p.text) + '</div>';
      case 'Radiobutton':
        return '<div style="width:100%;height:100%;display:flex;align-items:center;gap:5px;' +
          'background:' + p.bg + ';color:' + p.fg + ';' + fontCss + '">' +
          '<span style="width:12px;height:12px;border-radius:50%;border:1px solid #666;background:#fff;flex-shrink:0;"></span>' + escapeHtml(p.text) + '</div>';
      case 'Listbox': {
        const items = (p.items || '').split('\n').filter(Boolean);
        const rows = items.map(it=>'<div style="padding:1px 4px;text-align:left;">' + escapeHtml(it) + '</div>').join('');
        return '<div style="width:100%;height:100%;overflow:hidden;background:' + p.bg + ';color:' + p.fg + ';' + fontCss +
          'border:1px solid #767676;box-sizing:border-box;display:block;text-align:left;">' + rows + '</div>';
      }
      case 'Frame':
        return '<div style="width:100%;height:100%;background:' + p.bg + ';border:1px solid #9a9a95;box-sizing:border-box;"></div>';
      case 'LabelFrame':
        return '<div style="width:100%;height:100%;background:' + p.bg + ';border:1px solid #9a9a95;box-sizing:border-box;position:relative;">' +
          '<span style="position:absolute;top:-8px;left:8px;background:' + p.bg + ';padding:0 4px;font-size:10px;color:' + p.fg + ';">' + escapeHtml(p.text) + '</span></div>';
      case 'Canvas':
        return '<div style="width:100%;height:100%;background:' + p.bg + ';border:1px solid #767676;box-sizing:border-box;"></div>';
      case 'Scale': {
        const isH = p.orient === 'horizontal';
        return '<div style="width:100%;height:100%;background:' + p.bg + ';display:flex;align-items:center;justify-content:center;">' +
          '<div style="' + (isH ? 'width:85%;height:3px;' : 'width:3px;height:85%;') + 'background:#888;position:relative;">' +
          '<div style="position:absolute;' + (isH ? 'left:40%;top:-5px;width:10px;height:13px;' : 'top:40%;left:-5px;width:13px;height:10px;') +
          'background:#d8d8d8;border:1px solid #767676;"></div></div></div>';
      }
      case 'Spinbox':
        return '<div style="width:100%;height:100%;display:flex;align-items:center;padding:0 4px;' +
          'background:' + p.bg + ';color:' + p.fg + ';' + fontCss +
          'border:1px solid #767676;box-sizing:border-box;justify-content:space-between;">' +
          '<span>' + p.from_ + '</span><span style="color:#999;font-size:9px;">▲▼</span></div>';
      case 'Combobox':
        return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 6px;' +
          'background:#ffffff;border:1px solid #767676;box-sizing:border-box;font-size:11px;">' +
          '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          escapeHtml((p.values || '').split(',')[0] || '') + '</span><span style="color:#888;">▾</span></div>';
      case 'Progressbar':
        return '<div style="width:100%;height:100%;background:#dcdcdc;border:1px solid #b3b3b3;box-sizing:border-box;">' +
          '<div style="width:' + clamp(p.value,0,100) + '%;height:100%;background:#4a90d9;"></div></div>';
      case 'Scrollbar':
        return '<div style="width:100%;height:100%;background:#e4e4e4;border:1px solid #b3b3b3;box-sizing:border-box;display:flex;align-items:center;justify-content:center;">' +
          '<div style="width:70%;height:40%;background:#b8b8b8;border-radius:2px;"></div></div>';
      default:
        return '';
    }
  }

  function applyCanvasSize(){
    canvasEl.style.width = canvasSize.w + 'px';
    canvasEl.style.height = canvasSize.h + 'px';
    windowMock.style.width = canvasSize.w + 'px';
    canvasSizeLabel.textContent = canvasSize.w + ' × ' + canvasSize.h + ' px';
    document.getElementById('winW').value = canvasSize.w;
    document.getElementById('winH').value = canvasSize.h;
    updateCanvasScale();
  }

  // Si la ventana simulada no cabe a lo ancho del panel (típicamente en
  // móvil vertical), la encoge con transform:scale() hasta que quepa
  // entera, en vez de recortarla u obligar a hacer scroll horizontal.
  // #tkCanvasScaler reserva exactamente el hueco ya escalado para que el
  // resto del lienzo no herede espacio vacío de más.
  function updateCanvasScale(){
    if(!tkCanvasColEl || !tkCanvasScalerEl || !windowMock) return;
    windowMock.style.transform = 'none';
    const naturalW = windowMock.offsetWidth;
    const naturalH = windowMock.offsetHeight;
    const cs = window.getComputedStyle(tkCanvasColEl);
    const availW = tkCanvasColEl.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
    let scale = 1;
    if(naturalW > 0 && availW > 30 && naturalW > availW){
      scale = Math.max(0.3, availW / naturalW);
    }
    designScale = scale;
    windowMock.style.transform = scale < 1 ? ('scale(' + scale + ')') : '';
    tkCanvasScalerEl.style.width = (naturalW * scale) + 'px';
    tkCanvasScalerEl.style.height = (naturalH * scale) + 'px';
  }
  window.addEventListener('resize', ()=>{ if(isDesignerOpen()) updateCanvasScale(); });

  function renderCanvas(){
    canvasEl.innerHTML = '';
    emptyHint.style.display = widgets.length ? 'none' : 'block';
    if(!widgets.length){ canvasEl.appendChild(emptyHint); }

    widgets.forEach(w=>{
      const el = document.createElement('div');
      el.className = 'designer-widget' + (w.id === selectedId ? ' selected' : '');
      el.style.left = w.x + 'px';
      el.style.top = w.y + 'px';
      el.style.width = w.width + 'px';
      el.style.height = w.height + 'px';
      el.innerHTML = widgetPreviewHTML(w);
      el.dataset.id = w.id;

      function startMove(e){
        if(e.target.closest('.resize-handle')) return;
        e.stopPropagation();
        if(e.cancelable) e.preventDefault();
        selectedId = w.id;
        renderCanvas();
        renderProps();
        const p = getPoint(e);
        dragState = {
          type:'move', id:w.id,
          startX:p.x, startY:p.y,
          origX:w.x, origY:w.y, scale:designScale
        };
      }
      el.addEventListener('mousedown', startMove);
      el.addEventListener('touchstart', startMove, { passive:false });

      if(w.id === selectedId){
        const rh = document.createElement('div');
        rh.className = 'resize-handle';
        function startResize(e){
          e.stopPropagation();
          if(e.cancelable) e.preventDefault();
          const p = getPoint(e);
          dragState = {
            type:'resize', id:w.id,
            startX:p.x, startY:p.y,
            origW:w.width, origH:w.height, scale:designScale
          };
        }
        rh.addEventListener('mousedown', startResize);
        rh.addEventListener('touchstart', startResize, { passive:false });
        el.appendChild(rh);
      }

      canvasEl.appendChild(el);
    });
  }

  function deselectWidget(){
    selectedId = null;
    renderCanvas();
    renderProps();
  }

  canvasEl.addEventListener('mousedown', (e)=>{
    if(e.target === canvasEl) deselectWidget();
  });

  /* ---- redimensionar la ventana (canvas) ---- */
  function startCanvasResize(e){
    e.stopPropagation();
    if(e.cancelable) e.preventDefault();
    const p = getPoint(e);
    dragState = { type:'canvas-resize', startX:p.x, startY:p.y, origW:canvasSize.w, origH:canvasSize.h, scale:designScale };
  }
  const canvasResizeHandleEl = document.getElementById('canvas-resize-handle');
  canvasResizeHandleEl.addEventListener('mousedown', startCanvasResize);
  canvasResizeHandleEl.addEventListener('touchstart', startCanvasResize, { passive:false });

  function handleDragMove(e){
    if(!dragState) return;
    if(e.cancelable) e.preventDefault();
    const p = getPoint(e);
    const s = dragState.scale || 1;
    const dx = (p.x - dragState.startX) / s;
    const dy = (p.y - dragState.startY) / s;

    if(dragState.type === 'move'){
      const w = widgets.find(ww=>ww.id === dragState.id);
      if(!w) return;
      w.x = clamp(dragState.origX + dx, 0, Math.max(0, canvasSize.w - w.width));
      w.y = clamp(dragState.origY + dy, 0, Math.max(0, canvasSize.h - w.height));
      const el = canvasEl.querySelector('[data-id="'+w.id+'"]');
      if(el){ el.style.left = w.x + 'px'; el.style.top = w.y + 'px'; }
      if(importedLineRecords) patchWidgetPlaceKeys(w, ['x','y']);
      syncCode();
    } else if(dragState.type === 'resize'){
      const w = widgets.find(ww=>ww.id === dragState.id);
      if(!w) return;
      w.width = clamp(dragState.origW + dx, 16, canvasSize.w - w.x);
      w.height = clamp(dragState.origH + dy, 16, canvasSize.h - w.y);
      const el = canvasEl.querySelector('[data-id="'+w.id+'"]');
      if(el){ el.style.width = w.width + 'px'; el.style.height = w.height + 'px'; }
      if(importedLineRecords) patchWidgetPlaceKeys(w, ['width','height']);
      syncCode();
    } else if(dragState.type === 'canvas-resize'){
      canvasSize.w = clamp(dragState.origW + dx, 220, 1000);
      canvasSize.h = clamp(dragState.origH + dy, 160, 700);
      applyCanvasSize();
      widgets.forEach(w=>{
        const oldX = w.x, oldY = w.y;
        w.x = clamp(w.x, 0, Math.max(0, canvasSize.w - w.width));
        w.y = clamp(w.y, 0, Math.max(0, canvasSize.h - w.height));
        if(importedLineRecords){
          const keys = [];
          if(w.x !== oldX) keys.push('x');
          if(w.y !== oldY) keys.push('y');
          if(keys.length) patchWidgetPlaceKeys(w, keys);
        }
      });
      renderCanvas();
      if(importedLineRecords) patchRootGeometry(canvasSize.w, canvasSize.h);
      syncCode();
    }
  }
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('touchmove', handleDragMove, { passive:false });

  function endDrag(){ dragState = null; }
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
  document.addEventListener('touchcancel', endDrag);

  document.addEventListener('keydown', (e)=>{
    if((e.key === 'Delete' || e.key === 'Backspace') && selectedId){
      const active = document.activeElement;
      const typingInField = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
      if(typingInField) return;
      deleteSelected();
    }
  });

  function deleteSelected(){
    const w = widgets.find(ww=>ww.id === selectedId);
    if(w && importedLineRecords) removeWidgetFromImportedCode(w);
    widgets = widgets.filter(w=>w.id !== selectedId);
    selectedId = null;
    renderCanvas();
    renderProps();
    syncCode();
  }

  /* ============================================================
     6. PANEL DE PROPIEDADES
     ============================================================ */
  function renderProps(){
    const w = widgets.find(ww=>ww.id === selectedId);
    if(!w){
      propsEl.className = 'empty';
      propsEl.textContent = 'Selecciona un widget en el lienzo para editar sus propiedades, o añade uno nuevo desde la lista de arriba.';
      return;
    }
    propsEl.className = '';
    const def = WIDGET_DEFS[w.type];
    propsEl.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'prop-header';
    header.innerHTML = '<b>' + def.label + ' — <span style="color:var(--ink-dim);font-weight:400;">' + w.varName + '</span></b>';
    const headerBtns = document.createElement('div');
    headerBtns.style.display = 'flex';
    headerBtns.style.alignItems = 'center';
    headerBtns.style.gap = '8px';
    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = 'Eliminar';
    delBtn.addEventListener('click', deleteSelected);
    headerBtns.appendChild(delBtn);
    // Solo visible en móvil (hoja inferior de propiedades): permite cerrar
    // sin tener que eliminar el widget ni buscar un hueco vacío del lienzo.
    const closeBtn = document.createElement('button');
    closeBtn.id = 'tkPropsCloseBtn';
    closeBtn.title = 'Cerrar propiedades';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', deselectWidget);
    headerBtns.appendChild(closeBtn);
    header.appendChild(headerBtns);
    propsEl.appendChild(header);

    // posición y tamaño
    const geomRow = document.createElement('div');
    geomRow.className = 'prop-row prop-grid2';
    geomRow.innerHTML =
      '<div><label>X</label><input type="number" data-geom="x" value="'+w.x+'"></div>' +
      '<div><label>Y</label><input type="number" data-geom="y" value="'+w.y+'"></div>' +
      '<div><label>Ancho</label><input type="number" data-geom="width" value="'+w.width+'"></div>' +
      '<div><label>Alto</label><input type="number" data-geom="height" value="'+w.height+'"></div>';
    geomRow.querySelectorAll('[data-geom]').forEach(inp=>{
      inp.addEventListener('input', ()=>{
        const key = inp.dataset.geom;
        let val = parseInt(inp.value, 10) || 0;
        if(key === 'x') val = clamp(val, 0, canvasSize.w - w.width);
        if(key === 'y') val = clamp(val, 0, canvasSize.h - w.height);
        if(key === 'width') val = clamp(val, 16, canvasSize.w - w.x);
        if(key === 'height') val = clamp(val, 16, canvasSize.h - w.y);
        w[key] = val;
        renderCanvas();
        if(importedLineRecords) patchWidgetPlaceKeys(w, [key]);
        syncCode();
      });
    });
    propsEl.appendChild(geomRow);

    def.fields.forEach(fkey=>{
      const meta = FIELD_META[fkey];
      const row = document.createElement('div');
      row.className = 'prop-row';
      const label = document.createElement('label');
      label.textContent = meta.label;
      row.appendChild(label);

      let input;
      if(meta.type === 'select'){
        input = document.createElement('select');
        meta.options.forEach(opt=>{
          const o = document.createElement('option');
          o.value = opt; o.textContent = opt;
          if(w.props[fkey] === opt) o.selected = true;
          input.appendChild(o);
        });
      } else if(meta.type === 'textarea'){
        input = document.createElement('textarea');
        input.value = w.props[fkey];
      } else {
        input = document.createElement('input');
        input.type = meta.type;
        input.value = w.props[fkey];
      }

      input.addEventListener('input', ()=>{
        let v = input.value;
        if(meta.type === 'number') v = v === '' ? 0 : Number(v);
        w.props[fkey] = v;
        renderCanvas();
        renderProps.currentFocusKey = fkey;
        if(importedLineRecords){
          const patchMap = fieldToKwargPatch(w, fkey);
          if(Object.keys(patchMap).length) patchWidgetCtorProps(w, patchMap);
          if(fkey === 'value' && (w.type === 'Entry' || w.type === 'Text')) patchWidgetValue(w);
        }
        syncCode();
      });

      row.appendChild(input);
      propsEl.appendChild(row);
    });
  }

  /* ============================================================
     7. GENERACIÓN DE CÓDIGO PYTHON
     ============================================================ */
  function updateCode(){
    const usesTtk = widgets.some(w=>WIDGET_DEFS[w.type].ttk);
    const title = document.getElementById('rootTitle').value || 'Mi Aplicación';
    const resizable = document.getElementById('resizableChk').checked;

    const lines = [];
    lines.push('import tkinter as tk');
    lines.push('from tkinter import ttk');
    lines.push('');

    // Stubs de comandos de botones, a nivel de módulo (código plano, sin
    // envolver todo en def main(): / if __name__ == "__main__":, para que
    // cada widget nuevo solo añada las líneas que de verdad necesita).
    const buttonsWithCommand = widgets.filter(w=>w.type === 'Button' && w.props.command && w.props.command.trim() !== '');
    buttonsWithCommand.forEach(w=>{ w._fnName = 'on_' + sanitizeIdent(w.props.command); });
    buttonsWithCommand.forEach(w=>{
      lines.push('def ' + w._fnName + '():');
      lines.push('    print(' + pyStr(w.props.command + ' ejecutado') + ')');
      lines.push('');
    });

    lines.push('root = tk.Tk()');
    lines.push('root.title(' + pyStr(title) + ')');
    lines.push('root.geometry("' + canvasSize.w + 'x' + canvasSize.h + '")');
    lines.push('root.resizable(' + (resizable ? 'True' : 'False') + ', ' + (resizable ? 'True' : 'False') + ')');
    lines.push('');

    // variables de grupo para Radiobutton
    const groupVarNames = {};
    widgets.filter(w=>w.type === 'Radiobutton').forEach(w=>{
      const g = w.props.group || 'grupo1';
      if(!groupVarNames[g]) groupVarNames[g] = 'var_' + sanitizeIdent(g);
    });
    const groupKeys = Object.keys(groupVarNames);
    if(groupKeys.length){
      groupKeys.forEach(g=> lines.push(groupVarNames[g] + ' = tk.IntVar()'));
    }

    // variables para Checkbutton
    widgets.filter(w=>w.type === 'Checkbutton').forEach(w=>{
      w._checkVar = 'var_' + w.varName;
      lines.push(w._checkVar + ' = tk.IntVar()');
    });

    if(groupKeys.length || widgets.some(w=>w.type === 'Checkbutton')) lines.push('');

    widgets.forEach(w=>{
      const def = WIDGET_DEFS[w.type];
      const module = def.ttk ? 'ttk.' : 'tk.';
      const kwargs = [];
      const p = w.props;

      switch(w.type){
        case 'Button':
          kwargs.push('text=' + pyStr(p.text));
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          if(w._fnName) kwargs.push('command=' + w._fnName);
          break;
        case 'Label':
          kwargs.push('text=' + pyStr(p.text));
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          break;
        case 'Entry':
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          break;
        case 'Text':
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          break;
        case 'Checkbutton':
          kwargs.push('text=' + pyStr(p.text));
          kwargs.push('variable=' + w._checkVar);
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          break;
        case 'Radiobutton': {
          const g = p.group || 'grupo1';
          kwargs.push('text=' + pyStr(p.text));
          kwargs.push('variable=' + groupVarNames[g]);
          kwargs.push('value=' + (Number(p.value) || 0));
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          break;
        }
        case 'Listbox':
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          break;
        case 'Frame':
          kwargs.push('bg=' + pyStr(p.bg));
          break;
        case 'LabelFrame':
          kwargs.push('text=' + pyStr(p.text));
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          break;
        case 'Canvas':
          kwargs.push('bg=' + pyStr(p.bg));
          break;
        case 'Scale':
          kwargs.push('from_=' + (Number(p.from_) || 0));
          kwargs.push('to=' + (Number(p.to_) || 0));
          kwargs.push('orient=' + pyStr(p.orient));
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          break;
        case 'Spinbox':
          kwargs.push('from_=' + (Number(p.from_) || 0));
          kwargs.push('to=' + (Number(p.to_) || 0));
          kwargs.push('bg=' + pyStr(p.bg));
          kwargs.push('fg=' + pyStr(p.fg));
          kwargs.push('font=(' + pyStr(p.fontFamily) + ', ' + p.fontSize + ')');
          break;
        case 'Combobox': {
          const vals = (p.values || '').split(',').map(v=>v.trim()).filter(Boolean).map(pyStr).join(', ');
          kwargs.push('values=(' + vals + ')');
          kwargs.push('state=' + pyStr(p.state));
          break;
        }
        case 'Progressbar':
          kwargs.push('orient=' + pyStr(p.orient));
          kwargs.push('mode="determinate"');
          kwargs.push('value=' + (Number(p.value) || 0));
          break;
        case 'Scrollbar':
          kwargs.push('orient=' + pyStr(p.orient));
          break;
      }

      lines.push(w.varName + ' = ' + module + def.py + '(root' + (kwargs.length ? ', ' + kwargs.join(', ') : '') + ')');

      if(w.type === 'Entry' && p.value) lines.push(w.varName + '.insert(0, ' + pyStr(p.value) + ')');
      if(w.type === 'Text' && p.value) lines.push(w.varName + '.insert("1.0", ' + pyStr(p.value) + ')');
      if(w.type === 'Listbox'){
        (p.items || '').split('\n').filter(Boolean).forEach(it=>{
          lines.push(w.varName + '.insert(tk.END, ' + pyStr(it) + ')');
        });
      }

      lines.push(w.varName + '.place(x=' + w.x + ', y=' + w.y + ', width=' + w.width + ', height=' + w.height + ')');
      lines.push('');
    });

    lines.push('root.mainloop()');

    codeBox.value = lines.join('\n');
  }


  /* ============================================================
     7B. IMPORTAR CÓDIGO PYTHON -> DISEÑO VISUAL (inverso)
     ============================================================ */
  function splitTopLevel(str, sep){
    const parts = [];
    let depth = 0, inStr = null, cur = '';
    for(let i=0;i<str.length;i++){
      const ch = str[i];
      if(inStr){
        cur += ch;
        if(ch === '\\'){ i++; if(i<str.length) cur += str[i]; continue; }
        if(ch === inStr) inStr = null;
        continue;
      }
      if(ch === '"' || ch === "'"){ inStr = ch; cur += ch; continue; }
      if(ch === '(' || ch === '[' || ch === '{'){ depth++; cur += ch; continue; }
      if(ch === ')' || ch === ']' || ch === '}'){ depth--; cur += ch; continue; }
      if(ch === sep && depth === 0){ parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    if(cur.trim() !== '') parts.push(cur);
    return parts.map(s=>s.trim()).filter(s=>s.length);
  }

  function parsePyValue(raw){
    raw = (raw || '').trim();
    if(!raw) return undefined;
    if((raw[0]==='"' && raw[raw.length-1]==='"') || (raw[0]==="'" && raw[raw.length-1]==="'")){
      let inner = raw.slice(1,-1);
      inner = inner.replace(/\\n/g,'\n').replace(/\\t/g,'\t')
                   .replace(/\\"/g,'"').replace(/\\'/g,"'").replace(/\\\\/g,'\\');
      return inner;
    }
    if(raw[0]==='(' && raw[raw.length-1]===')'){
      const items = splitTopLevel(raw.slice(1,-1), ',');
      return items.map(parsePyValue);
    }
    if(/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw);
    if(/^-?\d+$/.test(raw)) return parseInt(raw,10);
    if(raw === 'True') return true;
    if(raw === 'False') return false;
    if(raw === 'None') return null;
    return { __raw: raw };
  }

  function parseKwargs(str){
    const out = {};
    if(!str) return out;
    splitTopLevel(str, ',').forEach(pair=>{
      const eq = pair.indexOf('=');
      if(eq === -1) return;
      const key = pair.slice(0,eq).trim();
      out[key] = parsePyValue(pair.slice(eq+1));
    });
    return out;
  }

  // Tipos cuyo width/height de constructor son PÍXELES reales en tkinter
  // (coincide con _size_unit='px' del intérprete en vivo). El resto usa
  // caracteres (ancho) y líneas de texto (alto), como en tkinter real.
  const PX_SIZED_TYPES = new Set(['Frame','LabelFrame','Canvas','Scale','Progressbar','Scrollbar']);
  const CHAR_PX = 8.2;  // ancho aproximado de un carácter con la tipografía por defecto
  const LINE_PX = 22;   // alto aproximado de una línea de texto (con relleno)

  function estimateSize(pw, def){
    let width = pw.width, height = pw.height;
    const isPx = PX_SIZED_TYPES.has(pw.type);
    if(width == null && typeof pw.kwargs.width === 'number'){
      width = isPx ? pw.kwargs.width : Math.max(24, Math.round(pw.kwargs.width * CHAR_PX + 14));
    }
    if(height == null && typeof pw.kwargs.height === 'number'){
      height = isPx ? pw.kwargs.height : Math.max(18, Math.round(pw.kwargs.height * LINE_PX + 6));
    }
    if(width == null) width = def.w;
    if(height == null) height = def.h;
    return { width, height };
  }

  function countUnquoted(line, ch){
    let count = 0, inStr = null;
    for(let i=0;i<line.length;i++){
      const c = line[i];
      if(inStr){ if(c==='\\'){ i++; continue; } if(c===inStr) inStr=null; continue; }
      if(c==='"' || c==="'"){ inStr = c; continue; }
      if(c==='#') break;
      if(c===ch) count++;
    }
    return count;
  }

  function toLogicalLines(code){
    const rawLines = code.split('\n');
    const logical = [];
    let bufferIdxs = [], depth = 0;
    rawLines.forEach((line, idx)=>{
      bufferIdxs.push(idx);
      depth += countUnquoted(line, '(') - countUnquoted(line, ')');
      if(depth <= 0){
        logical.push({ text: bufferIdxs.map(i=>rawLines[i]).join(' ').trim(), lineIdxs: bufferIdxs.slice() });
        bufferIdxs = []; depth = 0;
      }
    });
    if(bufferIdxs.length){
      logical.push({ text: bufferIdxs.map(i=>rawLines[i]).join(' ').trim(), lineIdxs: bufferIdxs.slice() });
    }
    return logical;
  }

  /* ---- Parcheo quirúrgico del código importado (sin regenerarlo) ---- */

  // Como splitTopLevel pero conservando la posición exacta (start/end) de cada
  // segmento dentro de la cadena original, para poder sustituir solo un trozo.
  function splitTopLevelSpans(str, sep){
    const spans = [];
    let depth = 0, inStr = null, start = 0;
    for(let i=0;i<str.length;i++){
      const ch = str[i];
      if(inStr){
        if(ch === '\\'){ i++; continue; }
        if(ch === inStr) inStr = null;
        continue;
      }
      if(ch === '"' || ch === "'"){ inStr = ch; continue; }
      if(ch === '(' || ch === '[' || ch === '{'){ depth++; continue; }
      if(ch === ')' || ch === ']' || ch === '}'){ depth--; continue; }
      if(ch === sep && depth === 0){
        spans.push({ start, end: i, text: str.slice(start, i) });
        start = i + 1;
      }
    }
    spans.push({ start, end: str.length, text: str.slice(start) });
    return spans;
  }

  // Reemplaza el valor de un kwarg dentro de una cadena "k1=v1, k2=v2, ...",
  // conservando literalmente todo lo demás (espacios, otros kwargs). Si la
  // clave no existe, la agrega al final.
  function replaceOrAddKwarg(argsStr, key, newValueText){
    const spans = splitTopLevelSpans(argsStr, ',');
    for(const sp of spans){
      if(!sp.text.trim()) continue;
      const eq = sp.text.indexOf('=');
      if(eq === -1) continue;
      const k = sp.text.slice(0, eq).trim();
      if(k === key){
        const afterEq = sp.text.slice(eq + 1);
        const leadWs = (afterEq.match(/^\s*/) || [''])[0].length;
        const valStart = sp.start + eq + 1 + leadWs;
        let valEnd = sp.end;
        while(valEnd > valStart && /\s/.test(argsStr[valEnd - 1])) valEnd--;
        return argsStr.slice(0, valStart) + newValueText + argsStr.slice(valEnd);
      }
    }
    const trimmed = argsStr.replace(/\s+$/, '');
    const sep = trimmed.length ? ', ' : '';
    return trimmed + sep + key + '=' + newValueText;
  }

  // Reescribe SOLO las claves indicadas (x, y, width, height) de la llamada
  // w.place(...) de origen, dejando cualquier otra clave (las no pedidas, y
  // cualquier otro kwarg como relx/anchor) intacta. Así, arrastrar (x,y) no
  // toca width/height, y redimensionar (width,height) no toca x,y.
  function patchWidgetPlaceKeys(w, keys){
    if(!w._placeLineRec || !keys.length) return false;
    const m = w._placeLineRec.text.match(/^(\s*)(\w+)\.place\(([\s\S]*)\)\s*$/);
    if(!m) return false;
    let kwargsStr = m[3];
    const valueFor = { x: Math.round(w.x), y: Math.round(w.y), width: Math.round(w.width), height: Math.round(w.height) };
    keys.forEach(k=>{
      kwargsStr = replaceOrAddKwarg(kwargsStr, k, String(valueFor[k]));
    });
    w._placeLineRec.text = m[1] + m[2] + '.place(' + kwargsStr + ')';
    return true;
  }

  // Atajo: reescribe las 4 claves de golpe (se usa solo donde de verdad las 4
  // pudieron cambiar a la vez, p. ej. al insertar un widget nuevo).
  function patchWidgetPlace(w){
    return patchWidgetPlaceKeys(w, ['x','y','width','height']);
  }

  // Reescribe solo los kwargs indicados en la línea de creación del widget
  // (constructor), preservando el argumento posicional del padre y cualquier
  // otro kwarg que el usuario haya escrito a mano.
  function patchWidgetCtorProps(w, propMap){
    if(!w._ctorLineRec || !Object.keys(propMap).length) return false;
    const m = w._ctorLineRec.text.match(/^(\s*)(\w+)\s*=\s*((?:tk|ttk)\.\w+)\(([\s\S]*)\)\s*$/);
    if(!m) return false;
    const [, indent, varName, ctorHead, argsStr] = m;
    const spans = splitTopLevelSpans(argsStr, ',');
    let hasMaster = false, masterText = '', kwargsStr = argsStr;
    if(spans.length && spans[0].text.indexOf('=') === -1 && spans[0].text.trim() !== ''){
      hasMaster = true;
      masterText = spans[0].text.trim();
      kwargsStr = spans.length > 1 ? argsStr.slice(spans[1].start) : '';
    }
    Object.keys(propMap).forEach(key=>{
      kwargsStr = replaceOrAddKwarg(kwargsStr, key, propMap[key]);
    });
    const newArgsStr = hasMaster ? (masterText + (kwargsStr.trim() ? ', ' + kwargsStr : '')) : kwargsStr;
    w._ctorLineRec.text = indent + varName + ' = ' + ctorHead + '(' + newArgsStr + ')';
    return true;
  }

  // Construye {kwarg: textoPython} con las propiedades editables del panel,
  // igual que updateCode(), pero para parchear solo esas claves.
  function buildKwargPatchMap(w){
    const p = w.props;
    const map = {};
    const fontVal = ()=> '(' + pyStr(p.fontFamily) + ', ' + (parseInt(p.fontSize,10) || 10) + ')';
    switch(w.type){
      case 'Button':
        map.text = pyStr(p.text); map.bg = pyStr(p.bg); map.fg = pyStr(p.fg); map.font = fontVal();
        break;
      case 'Label':
      case 'Checkbutton':
        map.text = pyStr(p.text); map.bg = pyStr(p.bg); map.fg = pyStr(p.fg); map.font = fontVal();
        break;
      case 'Radiobutton':
        map.text = pyStr(p.text); map.bg = pyStr(p.bg); map.fg = pyStr(p.fg); map.font = fontVal();
        map.value = String(Number(p.value) || 0);
        break;
      case 'Entry':
      case 'Text':
        map.bg = pyStr(p.bg); map.fg = pyStr(p.fg); map.font = fontVal();
        break;
      case 'Spinbox':
        map.from_ = String(Number(p.from_) || 0); map.to = String(Number(p.to_) || 0);
        map.bg = pyStr(p.bg); map.fg = pyStr(p.fg); map.font = fontVal();
        break;
      case 'Listbox':
        map.bg = pyStr(p.bg); map.fg = pyStr(p.fg); map.font = fontVal();
        break;
      case 'Frame':
        map.bg = pyStr(p.bg);
        break;
      case 'LabelFrame':
        map.text = pyStr(p.text); map.bg = pyStr(p.bg); map.fg = pyStr(p.fg);
        break;
      case 'Canvas':
        map.bg = pyStr(p.bg);
        break;
      case 'Scale':
        map.from_ = String(Number(p.from_) || 0); map.to = String(Number(p.to_) || 0);
        map.orient = pyStr(p.orient); map.bg = pyStr(p.bg); map.fg = pyStr(p.fg);
        break;
      case 'Combobox': {
        const vals = (p.values || '').split(',').map(v=>v.trim()).filter(Boolean).map(pyStr).join(', ');
        map.values = '(' + vals + ')';
        map.state = pyStr(p.state);
        break;
      }
      case 'Progressbar':
        map.orient = pyStr(p.orient); map.value = String(Number(p.value) || 0);
        break;
      case 'Scrollbar':
        map.orient = pyStr(p.orient);
        break;
    }
    return map;
  }

  // Igual que buildKwargPatchMap, pero para UN SOLO campo del panel de
  // propiedades: se usa en modo importado para tocar solo el kwarg que el
  // usuario realmente cambió (no todo el resto de props por defecto).
  // 'command', 'group' (variable) e 'items' quedan fuera a propósito: tocan
  // identificadores/lógica real del código original y renombrarlos podría
  // romperla, así que en modo importado no se reescriben.
  function fieldToKwargPatch(w, fkey){
    const p = w.props;
    const fontVal = ()=> '(' + pyStr(p.fontFamily) + ', ' + (parseInt(p.fontSize,10) || 10) + ')';
    switch(fkey){
      case 'text':
        return { text: pyStr(p.text) };
      case 'bg':
        return { bg: pyStr(p.bg) };
      case 'fg':
        return { fg: pyStr(p.fg) };
      case 'fontFamily':
      case 'fontSize':
        return { font: fontVal() };
      case 'value':
        if(w.type === 'Radiobutton' || w.type === 'Progressbar') return { value: String(Number(p.value) || 0) };
        return {}; // Entry/Text: no es kwarg del constructor, se parchea aparte con patchWidgetValue
      case 'values': {
        const vals = (p.values || '').split(',').map(v=>v.trim()).filter(Boolean).map(pyStr).join(', ');
        return { values: '(' + vals + ')' };
      }
      case 'state':
        return { state: pyStr(p.state) };
      case 'from_':
        return { from_: String(Number(p.from_) || 0) };
      case 'to_':
        return { to: String(Number(p.to_) || 0) };
      case 'orient':
        return { orient: pyStr(p.orient) };
      default:
        return {};
    }
  }

  // Reescribe la única llamada .insert(idx, "...") de un Entry/Text si existía
  // en el código original, conservando el índice/posición tal cual.
  function patchWidgetValue(w){
    if(!w._insertLineRec) return false;
    const m = w._insertLineRec.text.match(/^(\s*)(\w+)\.insert\(([\s\S]*)\)\s*$/);
    if(!m) return false;
    const spans = splitTopLevelSpans(m[3], ',');
    if(spans.length < 2) return false;
    const idxText = spans[0].text.trim();
    w._insertLineRec.text = m[1] + m[2] + '.insert(' + idxText + ', ' + pyStr(w.props.value || '') + ')';
    return true;
  }

  function patchRootTitle(newTitle){
    if(!rootTitleLineRec) return false;
    const m = rootTitleLineRec.text.match(/^(\s*)(\w+)((?:\.\w+)?)\.title\(/);
    if(!m) return false;
    rootTitleLineRec.text = m[1] + m[2] + m[3] + '.title(' + pyStr(newTitle) + ')';
    return true;
  }

  function patchRootGeometry(w, h){
    if(!rootGeomLineRec) return false;
    const m = rootGeomLineRec.text.match(/^(\s*)(\w+)((?:\.\w+)?)\.geometry\(/);
    if(!m) return false;
    rootGeomLineRec.text = m[1] + m[2] + m[3] + '.geometry(' + pyStr(w + 'x' + h) + ')';
    return true;
  }

  function patchRootResizable(val){
    if(!rootResizableLineRec) return false;
    const m = rootResizableLineRec.text.match(/^(\s*)(\w+)((?:\.\w+)?)\.resizable\(/);
    if(!m) return false;
    const b = val ? 'True' : 'False';
    rootResizableLineRec.text = m[1] + m[2] + m[3] + '.resizable(' + b + ', ' + b + ')';
    return true;
  }

  // Si el código actual todavía no tiene una ventana Tk (viene de un archivo
  // vacío, o de uno que solo trae los imports iniciales de numpy/matplotlib),
  // se la añadimos aquí antes de insertar el primer widget. Deja intacto
  // todo lo que ya hubiera arriba (esos imports de numpy/matplotlib
  // incluidos) y coloca los imports de tkinter justo debajo, seguidos al
  // final del archivo por "root = tk.Tk()" ... "root.mainloop()", que es
  // donde luego se inserta el código de cada widget nuevo.
  function ensureTkinterBoilerplate(){
    if(!importedLineRecords) return;
    const hasRoot = importedLineRecords.some(r => /=\s*tk\.Tk\(\s*\)\s*$/.test(r.text));
    if(hasRoot) return;

    const title = document.getElementById('rootTitle').value || 'Mi Aplicación';
    const resizable = document.getElementById('resizableChk').checked;

    // Los imports de tkinter van justo debajo del último "import ..."/"from
    // ... import ..." que haya al principio del archivo (p.ej. numpy y
    // matplotlib); si no hay ninguno, se ponen al principio del todo.
    let importInsertAt = 0;
    for(let i=0; i<importedLineRecords.length; i++){
      const t = importedLineRecords[i].text;
      if(/^\s*(import|from)\s+\S/.test(t)){
        importInsertAt = i + 1;
      } else if(t.trim() !== ''){
        break;
      }
    }
    const alreadyHasTkImport = importedLineRecords.some(r => /^\s*(import\s+tkinter|from\s+tkinter\s+import)/.test(r.text));
    if(!alreadyHasTkImport){
      importedLineRecords.splice(importInsertAt, 0,
        { text: 'import tkinter as tk' },
        { text: 'from tkinter import ttk' }
      );
    }

    const titleRec = { text: 'root.title(' + pyStr(title) + ')' };
    const geomRec = { text: 'root.geometry("' + canvasSize.w + 'x' + canvasSize.h + '")' };
    const resizeRec = { text: 'root.resizable(' + (resizable ? 'True' : 'False') + ', ' + (resizable ? 'True' : 'False') + ')' };
    importedLineRecords.push(
      { text: '' },
      { text: 'root = tk.Tk()' },
      titleRec, geomRec, resizeRec,
      { text: '' },
      { text: 'root.mainloop()' }
    );

    rootVarNameGlobal = 'root';
    rootTitleLineRec = titleRec;
    rootGeomLineRec = geomRec;
    rootResizableLineRec = resizeRec;
  }

  // Inserta un widget NUEVO (creado desde el panel izquierdo tras importar)
  // justo antes de la primera llamada a .mainloop() que encuentre, con la
  // misma indentación de esa línea. Si no encuentra mainloop(), lo agrega al final.
  function insertNewWidgetIntoImportedCode(w){
    if(!importedLineRecords) return;
    ensureTkinterBoilerplate();
    const def = WIDGET_DEFS[w.type];
    const module = def.ttk ? 'ttk.' : 'tk.';
    const kwargMap = buildKwargPatchMap(w);
    const kwargsText = Object.keys(kwargMap).map(k=> k + '=' + kwargMap[k]).join(', ');
    const masterName = rootVarNameGlobal || 'root';
    let idx = importedLineRecords.findIndex(r=> /\.mainloop\(\)/.test(r.text));
    let indent = '    ';
    if(idx !== -1){
      const im = importedLineRecords[idx].text.match(/^(\s*)/);
      if(im) indent = im[1];
    } else {
      idx = importedLineRecords.length;
    }
    const ctorRec = { text: indent + w.varName + ' = ' + module + def.py + '(' + masterName + (kwargsText ? ', ' + kwargsText : '') + ')' };
    const placeRec = { text: indent + w.varName + '.place(x=' + Math.round(w.x) + ', y=' + Math.round(w.y) + ', width=' + Math.round(w.width) + ', height=' + Math.round(w.height) + ')' };
    importedLineRecords.splice(idx, 0, ctorRec, placeRec);
    w._ctorLineRec = ctorRec;
    w._placeLineRec = placeRec;
  }

  // Quita del código las líneas de creación/place/insert de un widget importado
  // (por referencia de objeto, así que no descuadra los índices de los demás).
  function removeWidgetFromImportedCode(w){
    if(!importedLineRecords) return;
    [w._ctorLineRec, w._placeLineRec, w._insertLineRec].forEach(rec=>{
      if(!rec) return;
      const i = importedLineRecords.indexOf(rec);
      if(i !== -1) importedLineRecords.splice(i, 1);
    });
  }

  // Punto único de sincronización: si estamos en modo "importado" reconstruye
  // el texto a partir de los parches aplicados (sin regenerar nada), si no,
  // usa el generador normal.
  function syncCode(){
    if(importedLineRecords){
      codeBox.value = importedLineRecords.map(r=>r.text).join('\n');
    } else {
      updateCode();
    }
    notifyUpdate();
  }

  // Si el usuario edita el código a mano mientras estamos en modo "importado",
  // ya no podemos garantizar que nuestras referencias de línea sigan cuadrando,
  // así que soltamos el modo de parcheo y volvemos a la generación normal.
  codeBox.addEventListener('input', ()=>{
    if(importedLineRecords){
      importedLineRecords = null;
      rootTitleLineRec = null; rootGeomLineRec = null; rootResizableLineRec = null;
    }
  });

  function parsePythonToDesign(code, opts){
    const silent = !opts || opts.silent !== false;
    const TYPE_TO_KEY = {};
    Object.keys(WIDGET_DEFS).forEach(k=> TYPE_TO_KEY[WIDGET_DEFS[k].py] = k);

    const rawLines = code.split('\n').map(l=>l.replace(/\r$/,''));
    const funcBodies = {};
    for(let i=0;i<rawLines.length;i++){
      const m = rawLines[i].match(/^\s*def\s+(\w+)\s*\(\s*\)\s*:\s*$/);
      if(!m) continue;
      let j = i+1;
      while(j<rawLines.length && rawLines[j].trim()==='') j++;
      if(j<rawLines.length){
        const pm = rawLines[j].match(/print\(\s*(["'])((?:\\.|(?!\1).)*)\1\s*\)/);
        if(pm){
          let label = pm[2].replace(/\\n/g,'\n').replace(/\\"/g,'"').replace(/\\'/g,"'").replace(/\\\\/g,'\\');
          label = label.replace(/\s*ejecutado\s*$/i, '').trim();
          funcBodies[m[1]] = label || m[1];
        } else { funcBodies[m[1]] = m[1]; }
      } else { funcBodies[m[1]] = m[1]; }
    }

    let title = 'Mi Aplicación', resizable = true;
    let newCanvasSize = { w: canvasSize.w, h: canvasSize.h };
    const parsedWidgets = [];
    const byVar = {};

    const rawLineRecords = code.split('\n').map(text=>({ text }));
    const logicalLinesArr = toLogicalLines(code);

    // Detecta el nombre real de la variable de la ventana principal (root, ventana, win, ...)
    let rootVarName = 'root';
    for(const entry of logicalLinesArr){
      const rm = entry.text.match(/^(\w+)\s*=\s*tk\.Tk\(\s*\)\s*$/);
      if(rm){ rootVarName = rm[1]; break; }
    }
    const rootVarEsc = rootVarName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleRe = new RegExp('^' + rootVarEsc + '(?:\\.\\w+)?\\.title\\(\\s*([\\s\\S]+)\\)\\s*$');
    const geomRe = new RegExp('^' + rootVarEsc + '(?:\\.\\w+)?\\.geometry\\(\\s*(["\'])(\\d+)x(\\d+)\\1\\s*\\)');
    const resizeRe = new RegExp('^' + rootVarEsc + '(?:\\.\\w+)?\\.resizable\\(\\s*(True|False)');

    let newRootTitleLineRec = null, newRootGeomLineRec = null, newRootResizableLineRec = null;

    logicalLinesArr.forEach(entry=>{
      const line = entry.text;
      const single = entry.lineIdxs.length === 1 ? rawLineRecords[entry.lineIdxs[0]] : null;
      let m;
      if((m = line.match(titleRe))){
        const v = parsePyValue(m[1].trim());
        if(typeof v === 'string') title = v;
        if(single) newRootTitleLineRec = single;
        return;
      }
      if((m = line.match(geomRe))){
        newCanvasSize = { w: parseInt(m[2],10), h: parseInt(m[3],10) };
        if(single) newRootGeomLineRec = single;
        return;
      }
      if((m = line.match(resizeRe))){
        resizable = (m[1] === 'True');
        if(single) newRootResizableLineRec = single;
        return;
      }
      if((m = line.match(/^(\w+)\s*=\s*(?:tk|ttk)\.(\w+)\(\s*(\w+)?\s*(?:,\s*([\s\S]*))?\)\s*$/))){
        const varName = m[1], pyType = m[2], argsStr = m[4] || '';
        const key = TYPE_TO_KEY[pyType];
        if(!key) return;
        const w = { varName, type:key, kwargs: parseKwargs(argsStr), x:null,y:null,width:null,height:null,
                    extraInserts: [], _ctorLineRec: single, _placeLineRec: null, _insertLineRec: null };
        byVar[varName] = w;
        parsedWidgets.push(w);
        return;
      }
      if((m = line.match(/^(\w+)\.place\(\s*([\s\S]*)\)\s*$/))){
        const w = byVar[m[1]];
        if(w){
          const kw = parseKwargs(m[2]);
          if(typeof kw.x === 'number') w.x = kw.x;
          if(typeof kw.y === 'number') w.y = kw.y;
          if(typeof kw.width === 'number') w.width = kw.width;
          if(typeof kw.height === 'number') w.height = kw.height;
          if(single) w._placeLineRec = single;
        }
        return;
      }
      if((m = line.match(/^(\w+)\.insert\(\s*([\s\S]*)\)\s*$/))){
        const w = byVar[m[1]];
        if(w){
          const parts = splitTopLevel(m[2], ',');
          if(parts.length >= 2){
            const val = parsePyValue(parts.slice(1).join(','));
            if(typeof val === 'string'){
              w.extraInserts.push({ val });
              // Solo rastreamos esta línea como "valor inicial" parcheable si es
              // el primer insert() que le vemos a este widget (evita confundir
              // inserciones dinámicas dentro de funciones con el valor inicial).
              if(single && w.extraInserts.length === 1) w._insertLineRec = single;
            }
          }
        }
        return;
      }
    });

    widgets = [];
    idCounters = {};
    let cascadeIndex = 0;

    parsedWidgets.forEach(pw=>{
      const def = WIDGET_DEFS[pw.type];
      const props = Object.assign({}, def.defaults);
      const kw = pw.kwargs;
      const sVal = (v,f)=> typeof v==='string' ? v : f;
      const nVal = (v,f)=> typeof v==='number' ? v : f;

      switch(pw.type){
        case 'Button':
          props.text = sVal(kw.text, props.text);
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          if(Array.isArray(kw.font)){ props.fontFamily = sVal(kw.font[0], props.fontFamily); props.fontSize = nVal(kw.font[1], props.fontSize); }
          if(kw.command && kw.command.__raw){
            const fn = kw.command.__raw;
            props.command = funcBodies[fn] || fn.replace(/^on_/,'').replace(/_/g,' ');
          }
          break;
        case 'Label':
        case 'Checkbutton':
          props.text = sVal(kw.text, props.text);
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          if(Array.isArray(kw.font)){ props.fontFamily = sVal(kw.font[0], props.fontFamily); props.fontSize = nVal(kw.font[1], props.fontSize); }
          break;
        case 'Radiobutton':
          props.text = sVal(kw.text, props.text);
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          if(Array.isArray(kw.font)){ props.fontFamily = sVal(kw.font[0], props.fontFamily); props.fontSize = nVal(kw.font[1], props.fontSize); }
          props.value = nVal(kw.value, props.value);
          if(kw.variable && kw.variable.__raw) props.group = kw.variable.__raw.replace(/^var_/, '') || props.group;
          break;
        case 'Entry':
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          if(Array.isArray(kw.font)){ props.fontFamily = sVal(kw.font[0], props.fontFamily); props.fontSize = nVal(kw.font[1], props.fontSize); }
          if(pw.extraInserts.length) props.value = pw.extraInserts[0].val;
          break;
        case 'Text':
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          if(Array.isArray(kw.font)){ props.fontFamily = sVal(kw.font[0], props.fontFamily); props.fontSize = nVal(kw.font[1], props.fontSize); }
          if(pw.extraInserts.length) props.value = pw.extraInserts.map(x=>x.val).join('');
          break;
        case 'Listbox':
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          if(Array.isArray(kw.font)){ props.fontFamily = sVal(kw.font[0], props.fontFamily); props.fontSize = nVal(kw.font[1], props.fontSize); }
          if(pw.extraInserts.length) props.items = pw.extraInserts.map(x=>x.val).join('\n');
          break;
        case 'Frame':
          props.bg = sVal(kw.bg, props.bg);
          break;
        case 'LabelFrame':
          props.text = sVal(kw.text, props.text);
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          break;
        case 'Canvas':
          props.bg = sVal(kw.bg, props.bg);
          break;
        case 'Scale':
          props.from_ = nVal(kw.from_, props.from_); props.to_ = nVal(kw.to, props.to_);
          props.orient = sVal(kw.orient, props.orient);
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          break;
        case 'Spinbox':
          props.from_ = nVal(kw.from_, props.from_); props.to_ = nVal(kw.to, props.to_);
          props.bg = sVal(kw.bg, props.bg); props.fg = sVal(kw.fg, props.fg);
          if(Array.isArray(kw.font)){ props.fontFamily = sVal(kw.font[0], props.fontFamily); props.fontSize = nVal(kw.font[1], props.fontSize); }
          break;
        case 'Combobox':
          if(Array.isArray(kw.values)) props.values = kw.values.filter(v=>typeof v==='string').join(', ');
          props.state = sVal(kw.state, props.state);
          break;
        case 'Progressbar':
          props.value = nVal(kw.value, props.value);
          props.orient = sVal(kw.orient, props.orient);
          break;
        case 'Scrollbar':
          props.orient = sVal(kw.orient, props.orient);
          break;
      }

      const identBase = sanitizeIdent(pw.type);
      const suffixMatch = pw.varName.match(new RegExp('^'+identBase+'_(\\d+)$'));
      if(suffixMatch){
        idCounters[pw.type] = Math.max(idCounters[pw.type]||0, parseInt(suffixMatch[1],10));
      } else {
        idCounters[pw.type] = (idCounters[pw.type]||0) + 1;
      }

      const cascade = (cascadeIndex % 6) * 14; cascadeIndex++;
      const { width, height } = estimateSize(pw, def);
      const fx = (pw.x != null) ? pw.x : clamp(24 + cascade, 0, Math.max(0, newCanvasSize.w - width));
      const fy = (pw.y != null) ? pw.y : clamp(24 + cascade, 0, Math.max(0, newCanvasSize.h - height));

      widgets.push({
        id: 'w' + Date.now() + Math.floor(Math.random()*100000) + cascadeIndex,
        type: pw.type, varName: pw.varName,
        x: clamp(fx, 0, Math.max(0, newCanvasSize.w - width)),
        y: clamp(fy, 0, Math.max(0, newCanvasSize.h - height)),
        width, height, props,
        _ctorLineRec: pw._ctorLineRec, _placeLineRec: pw._placeLineRec, _insertLineRec: pw._insertLineRec
      });
    });

    canvasSize = newCanvasSize;
    selectedId = null;
    document.getElementById('rootTitle').value = title;
    document.getElementById('resizableChk').checked = resizable;
    windowTitleEl.textContent = title;
    applyCanvasSize();
    renderCanvas();
    renderProps();
    // A propósito NO se llama a updateCode() aquí: importar solo debe reconstruir
    // el lienzo visual a partir del código pegado, sin tocar ni regenerar ese código.
    // El código del panel derecho se conserva tal cual se pegó, para poder seguir
    // ejecutándolo (▶ Ejecutar en vivo) o copiándolo intacto.

    // A partir de aquí quedamos en "modo importado": mover/redimensionar widgets
    // o cambiar sus propiedades parcheará estas líneas puntuales en vez de
    // regenerar el archivo completo.
    importedLineRecords = rawLineRecords;
    rootTitleLineRec = newRootTitleLineRec;
    rootGeomLineRec = newRootGeomLineRec;
    rootResizableLineRec = newRootResizableLineRec;
    rootVarNameGlobal = rootVarName;

    if(!silent){
      if(!parsedWidgets.length){
        showToast('No se reconoció ningún widget de Tkinter en el código pegado.', true);
      } else {
        showToast('Diseño reconstruido (' + parsedWidgets.length + ' widget(s)) sin modificar el código.');
      }
    }
  }

  const tkSyncBtn = document.getElementById('tkSyncBtn');
  if(tkSyncBtn){
    tkSyncBtn.addEventListener('click', ()=>{
      const code = (window.editor && window.editor.getValue()) || '';
      codeBox.value = code;
      try{
        parsePythonToDesign(code, { silent:false });
      } catch(e){
        console.error(e);
        showToast('No se pudo interpretar el código: ' + e.message, true);
      }
    });
  }

  /* ============================================================
     8. CONTROLES SUPERIORES
     ============================================================ */
  document.getElementById('rootTitle').addEventListener('input', (e)=>{
    windowTitleEl.textContent = e.target.value || 'Mi Aplicación';
    if(importedLineRecords) patchRootTitle(e.target.value || 'Mi Aplicación');
    syncCode();
  });
  document.getElementById('resizableChk').addEventListener('change', (e)=>{
    if(importedLineRecords) patchRootResizable(e.target.checked);
    syncCode();
  });
  document.getElementById('winW').addEventListener('change', (e)=>{
    canvasSize.w = clamp(parseInt(e.target.value,10) || 480, 220, 1000);
    applyCanvasSize();
    widgets.forEach(w=>{
      const oldX = w.x;
      w.x = clamp(w.x, 0, Math.max(0, canvasSize.w - w.width));
      if(importedLineRecords && w.x !== oldX) patchWidgetPlaceKeys(w, ['x']);
    });
    renderCanvas();
    if(importedLineRecords) patchRootGeometry(canvasSize.w, canvasSize.h);
    syncCode();
  });
  document.getElementById('winH').addEventListener('change', (e)=>{
    canvasSize.h = clamp(parseInt(e.target.value,10) || 340, 160, 700);
    applyCanvasSize();
    widgets.forEach(w=>{
      const oldY = w.y;
      w.y = clamp(w.y, 0, Math.max(0, canvasSize.h - w.height));
      if(importedLineRecords && w.y !== oldY) patchWidgetPlaceKeys(w, ['y']);
    });
    renderCanvas();
    if(importedLineRecords) patchRootGeometry(canvasSize.w, canvasSize.h);
    syncCode();
  });

  const tkCopyCodeBtn = document.getElementById('tkCopyCodeBtn');
  if(tkCopyCodeBtn){
    tkCopyCodeBtn.addEventListener('click', ()=>{
      const code = (window.editor && window.editor.getValue()) || codeBox.value;
      navigator.clipboard && navigator.clipboard.writeText(code).catch(()=>{
        codeBox.value = code; codeBox.select(); document.execCommand('copy');
      });
      const original = tkCopyCodeBtn.textContent;
      tkCopyCodeBtn.textContent = '¡Copiado!';
      setTimeout(()=> tkCopyCodeBtn.textContent = original, 1200);
    });
  }

  /* ============================================================
     9. INICIALIZACIÓN
     ============================================================ */
  applyCanvasSize();
  renderCanvas();
  renderProps();
  updateCode();

  // widgets de ejemplo al abrir
  // addWidget('Label');
  // widgets[0].props.text = 'Bienvenido';
  // widgets[0].x = 24; widgets[0].y = 20;
  // addWidget('Button');
  // widgets[1].props.text = 'Aceptar';
  // widgets[1].x = 24; widgets[1].y = 60;
  // selectedId = null;
  renderCanvas();
  renderProps();
  updateCode();

  /* ============================================================
     10. API PÚBLICA PARA EL HOST (SPYidle)
     ============================================================ */
  window.TkDesigner = {
    open: openDesigner,
    close: closeDesigner,
    isOpen: isDesignerOpen,
    // Inyecta código Python en el buffer interno e intenta reconstruir
    // el lienzo visual a partir de él (mismo análisis que corre al
    // entrar a la pestaña "Diseño visual" o al pulsar "Sincronizar").
    // Si el código no contiene widgets reconocibles, simplemente deja
    // el buffer actualizado sin tocar el lienzo.
    setCode(code){
      codeBox.value = code || '';
      try{
        parsePythonToDesign(codeBox.value);
      } catch(e){
        console.error('TkDesigner.setCode: no se pudo interpretar el código', e);
      }
    },
    getCode(){ return codeBox.value; },
    // cb(code) se invoca cada vez que el propio diseñador regenera el
    // código (al arrastrar, redimensionar o editar propiedades de un widget).
    onUpdate(cb){ if(typeof cb === 'function') updateListeners.push(cb); }
  };
  window.dispatchEvent(new Event('tkdesigner:ready'));

})();