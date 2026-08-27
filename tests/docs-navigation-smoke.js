const fs = require('fs');

const nav = fs.readFileSync('templates/docs-nav.html', 'utf8');
const script = fs.readFileSync('content/assets/js/script.js', 'utf8');
const style = fs.readFileSync('content/assets/css/style.css', 'utf8');
const groups = [...nav.matchAll(/class="docs-nav-group"/g)];
const routes = [...nav.matchAll(/@pathto\('([^']+)'\)/g)].map(match => match[1]);
const expected = fs.readdirSync('content/docs')
  .filter(name => name.endsWith('.html'))
  .map(name => `docs/${name.slice(0, -5)}`);
expected.push('docs');

if (groups.length !== 6) throw new Error(`expected 6 documentation groups, found ${groups.length}`);
if (new Set(routes).size !== routes.length) throw new Error('documentation navigation contains duplicate routes');
for (const route of expected) {
  if (!routes.includes(route)) throw new Error(`documentation navigation omits ${route}`);
}
for (const route of routes) {
  if (!expected.includes(route)) throw new Error(`documentation navigation points at unknown route ${route}`);
}
for (const contract of ['aria-current', 'activeGroup', 'group === activeGroup', 'aria-expanded']) {
  if (!script.includes(contract)) throw new Error(`page-aware navigation contract missing ${contract}`);
}
if (!/\.docs-nav-links\[hidden\]\s*\{\s*display\s*:\s*none\s*\}/.test(style)) {
  throw new Error('collapsed documentation groups are not hidden by author CSS');
}
console.log(`warden docs navigation smoke: ${groups.length} groups, ${routes.length} routes`);
