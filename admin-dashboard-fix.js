/* AkhiSave Dashboard V8 bridge
   admin-final.js still references this legacy filename. Load the current V8 dashboard
   from here so every existing admin route receives the same dashboard implementation. */
(function(){
  if(window.__AKHISAVE_DASHBOARD_V8_BRIDGE__) return;
  window.__AKHISAVE_DASHBOARD_V8_BRIDGE__=true;
  var s=document.createElement('script');
  s.src='/admin-dashboard-fix-v8.js?v=8';
  s.async=false;
  (document.head||document.documentElement).appendChild(s);
})();
