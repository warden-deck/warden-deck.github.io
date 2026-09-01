// Deterministic checks for the company-subdomain deployment guide.
// Run with: node tests/deploy-guide-check.js

const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'content', 'docs', 'deploy.html'), 'utf8');
const generated = fs.existsSync(path.join(__dirname, '..', 'public', 'docs', 'deploy.html'))
  ? fs.readFileSync(path.join(__dirname, '..', 'public', 'docs', 'deploy.html'), 'utf8')
  : '';

const hostname = process.argv[2] || 'warden.company.com';
const health = process.argv[3] || '/api/setup/status';

for (const needle of [hostname, 'Caddy', 'nginx', health, '127.0.0.1:8080', 'independently', 'WARDEN_TRUST_PROXY', 'WARDEN_SECURE_COOKIES']) {
  if (!source.includes(needle)) throw new Error(`deployment guide is missing ${needle}`);
}
if (!source.includes('Type: A') || !source.includes('Type: CNAME')) {
  throw new Error('deployment guide must show both A/AAAA and CNAME DNS examples');
}
for (const sub of ['cortex.company.com', 'warden.company.com', 'trestle.company.com', 'watchpost.company.com']) {
  if (!source.includes(sub)) throw new Error(`ecosystem map must name ${sub}`);
}
if (source.includes('proxy_set_header Upgrade') === false) throw new Error('WebSocket upgrade headers must be documented for Warden terminals');
for (const leftover of ['@pathto', '@input', '@include']) {
  if (generated && generated.includes(leftover)) throw new Error(`generated output contains unresolved ${leftover}`);
}
if (generated && !generated.includes(hostname)) throw new Error('generated deploy page is stale');

console.log(`warden deploy-guide check: ok (${hostname}, ${health})`);