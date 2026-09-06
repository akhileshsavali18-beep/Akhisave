(() => {
  function fixAdminTabs() {
    const tools = document.getElementById('tools');
    if (tools) tools.style.removeProperty('display');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixAdminTabs);
  else fixAdminTabs();
})();
