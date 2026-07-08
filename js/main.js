window.render = function render() {
  WC.renderDashboard();
};

window.refreshFromEspn = function refreshFromEspn() {
  return WC.refreshFromEspn();
};

document.addEventListener('DOMContentLoaded', () => {
  WC.renderDashboard();
});