(()=>{
function clean(){
 const wrap=document.getElementById('atmModalWrap');
 if(!wrap)return;
 const ids=['atmName','atmIcon','atmPlatformEdit','atmEngine','atmCategory','atmEnabledEdit','atmDescription','atmButton','atmPlaceholder','atmOrder','atmTypeHelp'];
 const seen=new Set();
 ids.forEach(id=>{
   [...wrap.querySelectorAll('#'+CSS.escape(id))].forEach(el=>{
     if(seen.has(id)){
       const field=el.closest('.field');
       if(field)field.remove(); else el.remove();
     }else seen.add(id);
   });
 });
 const modal=wrap.querySelector('.atm-modal');
 if(!modal)return;
 const actions=[...modal.querySelectorAll('.atm-modal-actions')];
 if(actions.length>1)actions.slice(1).forEach(x=>x.remove());
 let action=modal.querySelector('.atm-modal-actions');
 if(!action){
   action=document.createElement('div');
   action.className='atm-modal-actions';
   action.innerHTML='<button type="button" id="atmCancel">Cancel</button><button type="button" class="primary" id="atmSave">Save Tool</button>';
   modal.appendChild(action);
 }
 const cancel=action.querySelector('#atmCancel'),save=action.querySelector('#atmSave');
 if(cancel){cancel.textContent='Cancel';cancel.type='button';cancel.style.display='inline-flex';cancel.style.visibility='visible'}
 if(save){save.textContent='Save Tool';save.type='button';save.style.display='inline-flex';save.style.visibility='visible'}
 modal.appendChild(action);
}
function start(){
 const wrap=document.getElementById('atmModalWrap');
 if(!wrap)return;
 if(wrap.dataset.addtoolModalFix)return;
 wrap.dataset.addtoolModalFix='1';
 const run=()=>setTimeout(clean,10);
 new MutationObserver(run).observe(wrap,{childList:true,subtree:true});
 document.addEventListener('click',e=>{if(e.target?.id==='atmAdd'||e.target?.closest?.('#atmAdd'))setTimeout(clean,30)},true);
 setInterval(()=>{if(wrap.classList.contains('show'))clean()},400);
 clean();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();