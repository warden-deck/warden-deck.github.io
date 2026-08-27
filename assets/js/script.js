(() => {
  const normalisePath = value => {
    let path;
    try { path = decodeURIComponent(new URL(value, location.href).pathname); }
    catch { path = String(value); }
    return path.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  };
  const currentPath = normalisePath(location.href);
  const groups = [...document.querySelectorAll('[data-docs-group]')];
  const setOpen = (group, open) => {
    const toggle = group.querySelector('.docs-nav-toggle');
    const links = group.querySelector('.docs-nav-links');
    toggle.setAttribute('aria-expanded', String(open));
    links.hidden = !open;
  };

  let activeGroup = null;
  document.querySelectorAll('.docs-nav a').forEach(link => {
    const active = normalisePath(link.href) === currentPath;
    link.classList.toggle('active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
      activeGroup = link.closest('[data-docs-group]');
    }
  });
  groups.forEach(group => {
    setOpen(group, group === activeGroup);
    group.querySelector('.docs-nav-toggle').addEventListener('click', () => {
      setOpen(group, group.querySelector('.docs-nav-toggle').getAttribute('aria-expanded') !== 'true');
    });
  });
})();
