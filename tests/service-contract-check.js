// Deterministic service-contract checks for the Warden site.
// Run with: node tests/service-contract-check.js

const fs = require('fs');
const path = require('path');

const service = fs.readFileSync(path.join(__dirname, '..', 'content', 'docs', 'service.html'), 'utf8');
const battle = fs.readFileSync(path.join(__dirname, '..', 'content', 'docs', 'battle-tested.html'), 'utf8');
const generated = fs.readFileSync(path.join(__dirname, '..', 'public', 'docs', 'service.html'), 'utf8');

for (const cmd of ['service install', 'service start', 'service stop', 'service restart', 'service status', 'service logs', 'service uninstall']) {
  if (!service.includes(cmd)) throw new Error(`service page is missing ${cmd}`);
}
if (!service.includes('enabled-runtime')) throw new Error('enabled-runtime must be documented');
if (!service.includes('runtime-only enablement') || !service.includes('without leaving a persistent link')) {
  throw new Error('runtime-only enablement restoration must be described exactly');
}
if (!/unmask|unmasking/.test(service)) throw new Error('masked install must document unmasking first');
if (!/uninstall.*preserves|preserves.*uninstall/i.test(service)) throw new Error('uninstall must preserve data');
if (!service.includes('enable-linger')) throw new Error('lingering must be documented');
if (!/never enables .*lingering automatically/.test(service)) throw new Error('lingering must not be claimed automatic');
if (/battle-proven on every supported operating system|validated against every systemd release|production-proven rollback/i.test(battle)) {
  throw new Error('battle-tested page overclaims live systemd evidence');
}
if (!battle.includes('has not been proven through destructive live-service failure injection')) {
  throw new Error('battle-tested page must state the destructive-live-injection caveat');
}
if (!generated.includes('enabled-runtime')) throw new Error('generated service page is stale');

console.log('warden service-contract check: ok');