const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const code = fs.readFileSync(path.join(__dirname, '../src/utils/detector.js'), 'utf8');
const context = { location: { href: 'https://example.test/page' }, URL, globalThis: {} };
vm.runInNewContext(code, context);
const detector = context.globalThis.AnimDetector;

test('classifica GIF e formatos alternativos pela URL e MIME', () => {
  assert.equal(detector.classify('https://cdn.test/a.gif?size=2'), 'GIF');
  assert.equal(detector.classify('https://cdn.test/a.webp'), 'WebP');
  assert.equal(detector.classify('https://cdn.test/a.avif'), 'AVIF');
  assert.equal(detector.classify('https://cdn.test/a.bin', 'IMG', 'image/gif'), 'GIF');
  assert.equal(detector.classify('https://cdn.test/a.webm'), 'WEBM');
  assert.equal(detector.classify('https://cdn.test/a.jpg'), '');
});

test('normaliza URLs removendo fragmentos e rejeita URLs inválidas', () => {
  assert.equal(detector.normalizedUrl('/media/a.gif#frame'), 'https://example.test/media/a.gif');
  assert.equal(detector.normalizedUrl('javascript:alert(1)'), 'javascript:alert(1)');
  assert.equal(detector.normalizedUrl('http://['), '');
});
