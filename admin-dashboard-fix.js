/* AkhiSave Dashboard V8 bridge + final presentation fix
   admin-final.js still references this legacy filename. Load the current V8 dashboard
   and then apply the final readable-hour / recent-visitor enhancements. */
(function(){
  if(window.__AKHISAVE_DASHBOARD_V8_BRIDGE__) return;
  window.__AKHISAVE_DASHBOARD_V8_BRIDGE__=true;
  var v8=document.createElement('script');
  v8.src='/admin-dashboard-fix-v8.js?v=8';
  v8.async=false;
  (document.head||document.documentElement).appendChild(v8);
  var fix=document.createElement('script');
  fix.src='/admin-dashboard-hours-fix.js?v=1';
  fix.async=false;
  (document.head||document.documentElement).appendChild(fix);
})();
