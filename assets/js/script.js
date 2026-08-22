(() => {
  document.querySelectorAll('.docs-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => link.blur());
  });
})();
