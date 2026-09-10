(function(){
  if(window.__AKHISAVE_RESIZER_SEO_V1__) return;
  window.__AKHISAVE_RESIZER_SEO_V1__=true;
  function add(){
    if(document.getElementById('ak-image-resizer-seo')) return;
    var about=document.getElementById('about');
    if(!about || !about.parentNode) return;
    var s=document.createElement('section');
    s.id='ak-image-resizer-seo';
    s.className='section ak-seo';
    s.innerHTML='<div class="heading"><h2>Free Image Resizer Online</h2><p>Resize JPG, PNG and other common image files online with AkhiSave. Set the exact width and height you need, keep the original aspect ratio when required, preview the result and download your resized image.</p></div>'+
      '<div class="features">'+
      '<div class="card"><h3>Resize images by pixels</h3><p>Enter a new width and height in pixels to resize a photo or image to exact dimensions.</p></div>'+
      '<div class="card"><h3>Keep the aspect ratio</h3><p>Lock the aspect ratio to resize an image proportionally and avoid unwanted stretching.</p></div>'+
      '<div class="card"><h3>Resize images in your browser</h3><p>The resize operation is designed to run in your browser, making the basic tool quick and simple to use.</p></div>'+
      '</div>'+
      '<div class="heading ak-seo-sub"><h2>How to resize an image online</h2><p>Select an image, enter the target dimensions, choose whether to lock the aspect ratio, then select Resize &amp; Download.</p></div>'+
      '<div class="steps">'+
      '<div class="step"><span class="num">01</span><h3>Upload your image</h3><p>Select a photo or image from your device.</p></div>'+
      '<div class="step"><span class="num">02</span><h3>Choose dimensions</h3><p>Set the width and height you want in pixels.</p></div>'+
      '<div class="step"><span class="num">03</span><h3>Download the resized image</h3><p>Preview the result and save the resized file.</p></div>'+
      '</div>'+
      '<div class="heading ak-seo-sub"><h2>Why use AkhiSave Image Resizer?</h2><p>It is useful when you need a specific image size for websites, social posts, documents, profile pictures or everyday photo sharing. The tool is responsive and works on mobile, tablet and desktop browsers.</p></div>';
    about.parentNode.insertBefore(s,about);
    var st=document.createElement('style');
    st.textContent='.ak-seo-sub{margin-top:38px}.ak-seo .card h3{margin-top:0}.ak-seo .card p{line-height:1.75}@media(max-width:760px){.ak-seo-sub{margin-top:30px}}';
    document.head.appendChild(st);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
})();
