(() => {
  const normalisePath = value => {
    let path;
    try { path = decodeURIComponent(new URL(value, location.href).pathname); }
    catch { path = String(value); }
    return path.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  };

  const wireDocs = root => {
    const groups = [...root.querySelectorAll('[data-docs-group]')];
    if (!groups.length) return;
    const currentPath = normalisePath(location.href);
    const setOpen = (group, open) => {
      const toggle = group.querySelector('.docs-nav-toggle');
      const links = group.querySelector('.docs-nav-links');
      toggle.setAttribute('aria-expanded', String(open));
      links.hidden = !open;
    };

    let activeGroup = null;
    root.querySelectorAll('.docs-nav-links a').forEach(link => {
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
  };

  const aside = document.querySelector('.docs-nav');
  if (aside) wireDocs(aside);

  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.getElementById('mobile-menu');
  const docsToggle = document.querySelector('[data-docs-menu-toggle]');
  const docsMenu = document.getElementById('docs-mobile-nav');
  const setMenu = (panel, btn, open) => {
    panel.classList.toggle('open', open);
    panel.toggleAttribute('hidden', !open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('open');
      if (open && docsMenu && docsMenu.classList.contains('open')) setMenu(docsMenu, docsToggle, false);
      setMenu(mobileMenu, menuToggle, open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { setMenu(mobileMenu, menuToggle, false); document.body.style.overflow = ''; }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setMenu(mobileMenu, menuToggle, false); document.body.style.overflow = ''; menuToggle.focus(); } });
  }
  if (docsToggle && docsMenu) {
    docsToggle.addEventListener('click', () => {
      const open = !docsMenu.classList.contains('open');
      if (open && mobileMenu && mobileMenu.classList.contains('open')) { setMenu(mobileMenu, menuToggle, false); document.body.style.overflow = ''; }
      setMenu(docsMenu, docsToggle, open);
    });
    const source = aside;
    if (source) {
      source.querySelectorAll('[data-docs-group]').forEach(group => {
        const heading = group.querySelector('.docs-nav-toggle span')?.textContent || '';
        if (!heading) return;
        const section = document.createElement('div');
        section.className = 'docs-nav-group';
        section.setAttribute('data-docs-group', '');
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'docs-nav-toggle'; btn.setAttribute('aria-expanded', 'false');
        const label = document.createElement('span'); label.textContent = heading;
        const icon = document.createElement('i'); icon.setAttribute('aria-hidden', 'true');
        btn.append(label, icon);
        const links = document.createElement('div');
        links.className = 'docs-nav-links'; links.hidden = true;
        links.innerHTML = [...group.querySelectorAll('.docs-nav-links a')].map(a => a.outerHTML).join('');
        section.append(btn, links);
        docsMenu.append(section);
      });
      wireDocs(docsMenu);
    }
    docsMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(docsMenu, docsToggle, false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && docsMenu.classList.contains('open')) { setMenu(docsMenu, docsToggle, false); docsToggle.focus(); } });
  }
})();