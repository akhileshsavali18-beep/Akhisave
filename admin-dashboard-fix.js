/* AkhiSave Dashboard V8 bridge + final presentation fix */
(function(){
  if(window.__AKHISAVE_DASHBOARD_V8_BRIDGE_V3__) return;
  window.__AKHISAVE_DASHBOARD_V8_BRIDGE_V3__=true;
  var v8=document.createElement('script');
  v8.src='/admin-dashboard-fix-v8.js?v=9';
  v8.async=false;
  (document.head||document.documentElement).appendChild(v8);
  var fix=document.createElement('script');
  fix.src='/admin-dashboard-hours-fix.js?v=2';
  fix.async=false;
  (document.head||document.documentElement).appendChild(fix);
  var bot=document.createElement('script');
  bot.src='/admin-dashboard-bot-human.js?v=1';
  bot.async=false;
  (document.head||document.documentElement).appendChild(bot);
})();
