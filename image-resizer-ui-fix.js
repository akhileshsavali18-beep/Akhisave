(function(){
  if(window.__AKHISAVE_RESIZER_UI_V2__) return;
  window.__AKHISAVE_RESIZER_UI_V2__=true;
  function start(){
    var file=document.getElementById('file'),panel=document.getElementById('panel'),zone=document.getElementById('akUploadZone');
    if(!file||!panel||!zone)return;
    var wrap=document.createElement('div');
    wrap.className='ak-resizer-workspace';
    wrap.style.display='none';
    wrap.innerHTML=`
      <div class="ak-file-summary">
        <img id="akRzThumb" alt="Selected image preview">
        <div style="min-width:0;flex:1"><strong id="akRzName">Image</strong><span id="akRzMeta">Original image</span></div>
        <button type="button" class="ak-secondary" id="akRzChoose">Choose another</button>
      </div>
      <div class="ak-resize-editor">
        <div class="ak-preview-pane">
          <div class="ak-pane-title"><h2>Preview</h2><span id="akRzPreviewMeta">Original</span></div>
          <div class="ak-preview-stage"><canvas id="akRzCanvas"></canvas></div>
        </div>
        <div class="ak-settings-pane">
          <div class="ak-pane-title"><h2>Resize settings</h2><span id="akRzModeLabel">Pixels</span></div>
          <div class="ak-mode-tabs"><button type="button" class="ak-mode-tab active" data-mode="pixels">By Pixels</button><button type="button" class="ak-mode-tab" data-mode="percent">By Percentage</button></div>
          <div class="ak-fields">
            <div class="ak-field"><label id="akRzLabelW">Width (px)</label><input id="akRzWidth" type="number" min="1" inputmode="numeric"></div>
            <div class="ak-field" id="akRzHeightField"><label id="akRzLabelH">Height (px)</label><input id="akRzHeight" type="number" min="1" inputmode="numeric"></div>
          </div>
          <label class="ak-lock"><input id="akRzLock" type="checkbox" checked> Keep aspect ratio</label>
          <div class="ak-section-label">Quick sizes</div>
          <div class="ak-presets">
            <button type="button" class="ak-preset" data-w="1920" data-h="1080">1920×1080</button>
            <button type="button" class="ak-preset" data-w="1280" data-h="720">1280×720</button>
            <button type="button" class="ak-preset" data-w="1080" data-h="1080">1080×1080</button>
            <button type="button" class="ak-preset" data-w="800" data-h="600">800×600</button>
            <button type="button" class="ak-preset" data-w="400" data-h="400">400×400</button>
          </div>
          <div class="ak-section-label">Output</div>
          <div class="ak-output"><div class="ak-output-box"><strong id="akRzOutDim">—</strong><span>Dimensions</span></div><div class="ak-output-box"><strong id="akRzScale">100%</strong><span>Scale</span></div><div class="ak-output-box"><strong id="akRzOriginal">—</strong><span>Original</span></div></div>
          <div class="ak-actions"><button type="button" class="ak-primary" id="akRzDownload">Resize &amp; Download</button><button type="button" class="ak-secondary" id="akRzReset">Reset</button></div>
          <div class="ak-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg><span>Your image is processed in your browser. The current tool does not need to upload the selected image to resize it.</span></div>
        </div>
      </div>`;
    panel.style.display='none';
    zone.style.display='none';
    panel.parentElement.appendChild(wrap);

    var thumb=wrap.querySelector('#akRzThumb'),name=wrap.querySelector('#akRzName'),meta=wrap.querySelector('#akRzMeta'),canvas=wrap.querySelector('#akRzCanvas'),ctx=canvas.getContext('2d'),w=wrap.querySelector('#akRzWidth'),h=wrap.querySelector('#akRzHeight'),lock=wrap.querySelector('#akRzLock'),outDim=wrap.querySelector('#akRzOutDim'),scale=wrap.querySelector('#akRzScale'),orig=wrap.querySelector('#akRzOriginal'),previewMeta=wrap.querySelector('#akRzPreviewMeta'),modeLabel=wrap.querySelector('#akRzModeLabel'),heightField=wrap.querySelector('#akRzHeightField'),labelW=wrap.querySelector('#akRzLabelW'),labelH=wrap.querySelector('#akRzLabelH'),img=new Image(),objectUrl='',sourceFile=null,mode='pixels';
    function bytes(n){if(!n)return'0 B';var u=['B','KB','MB','GB'],i=Math.min(3,Math.floor(Math.log(n)/Math.log(1024)));return(n/Math.pow(1024,i)).toFixed(i?1:0)+' '+u[i]}
    function activateStep(n){document.querySelectorAll('.ak-tool-step').forEach(function(s,i){s.classList.toggle('active',i<n);});}
    function draw(){if(!img.naturalWidth)return;var ow=img.naturalWidth,oh=img.naturalHeight,nw=Math.max(1,Math.round(parseFloat(w.value)||ow)),nh=Math.max(1,Math.round(parseFloat(h.value)||oh));canvas.width=nw;canvas.height=nh;ctx.clearRect(0,0,nw,nh);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,nw,nh);outDim.textContent=nw+' × '+nh;scale.textContent=Math.round(nw/ow*100)+'%';orig.textContent=ow+' × '+oh;previewMeta.textContent=nw+' × '+nh+' px';}
    function setPixels(nw,nh){w.value=Math.max(1,Math.round(nw));h.value=Math.max(1,Math.round(nh));draw()}
    function syncOriginal(){if(!img.naturalWidth)return;setPixels(img.naturalWidth,img.naturalHeight)}
    function keepWidth(){if(!img.naturalWidth)return;var nw=Math.max(1,parseInt(w.value)||1);h.value=Math.max(1,Math.round(nw*img.naturalHeight/img.naturalWidth));draw()}
    function keepHeight(){if(!img.naturalHeight)return;var nh=Math.max(1,parseInt(h.value)||1);w.value=Math.max(1,Math.round(nh*img.naturalWidth/img.naturalHeight));draw()}
    function setMode(next){mode=next;modeLabel.textContent=next==='pixels'?'Pixels':'Percentage';wrap.querySelectorAll('.ak-mode-tab').forEach(function(b){b.classList.toggle('active',b.dataset.mode===next)});if(next==='percent'){labelW.textContent='Scale (%)';labelH.textContent='Scale (%)';h.style.display='none';heightField.style.visibility='hidden';w.value='100';h.value='100';lock.checked=true;draw()}else{labelW.textContent='Width (px)';labelH.textContent='Height (px)';h.style.display='block';heightField.style.visibility='visible';syncOriginal()}}
    w.addEventListener('input',function(){if(mode==='percent'){var p=Math.max(1,Math.min(500,parseFloat(w.value)||100));w.value=p;h.value=p;var nw=img.naturalWidth*p/100,nh=img.naturalHeight*p/100;canvas.width=Math.max(1,Math.round(nw));canvas.height=Math.max(1,Math.round(nh));ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,canvas.width,canvas.height);outDim.textContent=canvas.width+' × '+canvas.height;scale.textContent=Math.round(p)+'%';orig.textContent=img.naturalWidth+' × '+img.naturalHeight;previewMeta.textContent=canvas.width+' × '+canvas.height+' px';return}if(lock.checked)keepWidth();else draw()});
    h.addEventListener('input',function(){if(mode==='percent')return;if(lock.checked)keepHeight();else draw()});
    wrap.querySelectorAll('.ak-mode-tab').forEach(function(b){b.addEventListener('click',function(){setMode(b.dataset.mode)})});
    wrap.querySelectorAll('.ak-preset').forEach(function(b){b.addEventListener('click',function(){setMode('pixels');setPixels(+b.dataset.w,+b.dataset.h)})});
    function loadFile(f){if(!f||!/^image\//i.test(f.type))return;sourceFile=f;wrap.style.display='block';activateStep(2);if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(f);img.onload=function(){name.textContent=f.name;meta.textContent=img.naturalWidth+' × '+img.naturalHeight+' px · '+bytes(f.size);thumb.src=objectUrl;syncOriginal();activateStep(3)};img.src=objectUrl}
    file.addEventListener('change',function(){loadFile(file.files&&file.files[0])});
    document.getElementById('akRzChoose').addEventListener('click',function(){file.click()});
    document.getElementById('akRzReset').addEventListener('click',function(){file.value='';sourceFile=null;if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=''};wrap.style.display='none';zone.style.display='block';activateStep(1);setMode('pixels')});
    document.getElementById('akRzDownload').addEventListener('click',function(){if(!img.naturalWidth||!sourceFile)return;var nw=Math.max(1,Math.round(parseFloat(w.value)||img.naturalWidth)),nh=Math.max(1,Math.round(parseFloat(h.value)||img.naturalHeight)),c=document.createElement('canvas');c.width=nw;c.height=nh;var x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(img,0,0,nw,nh);var type=/png/i.test(sourceFile.type)?'image/png':'image/jpeg';c.toBlob(function(blob){if(!blob)return;var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(sourceFile.name||'image').replace(/\.[^.]+$/,'')+'-resized.'+(type==='image/png'?'png':'jpg');a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1200)},type,.92);activateStep(3)});
    ['dragenter','dragover'].forEach(function(ev){zone.addEventListener(ev,function(e){e.preventDefault();zone.classList.add('drag')})});['dragleave','drop'].forEach(function(ev){zone.addEventListener(ev,function(e){e.preventDefault();zone.classList.remove('drag')})});zone.addEventListener('drop',function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];loadFile(f)});
    zone.addEventListener('click',function(e){if(e.target.closest('label'))return;file.click()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();