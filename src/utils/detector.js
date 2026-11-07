(() => {
  const EXTENSIONS = {
    gif: ['gif'], webp: ['webp'], apng: ['apng'], avif: ['avif'],
    mp4: ['mp4', 'm4v'], webm: ['webm']
  };
  const VIDEO = new Set(['mp4', 'webm']);
  const IMAGE = new Set(['gif', 'webp', 'apng', 'avif']);

  function extensionOf(value) {
    try {
      const path = new URL(value, location.href).pathname;
      const match = path.match(/\.([a-z0-9]+)$/i);
      return match ? match[1].toLowerCase() : '';
    } catch { return ''; }
  }

  function classify(url, tagName = 'IMG', mime = '') {
    const ext = extensionOf(url);
    const contentType = mime.toLowerCase();
    if (VIDEO.has(ext) || contentType.startsWith('video/')) return ext === 'webm' || contentType.includes('webm') ? 'WEBM' : 'MP4';
    if (IMAGE.has(ext) || contentType === 'image/gif' || contentType === 'image/webp' || contentType === 'image/avif' || contentType === 'image/apng') {
      if (ext === 'gif' || contentType === 'image/gif') return 'GIF';
      if (ext === 'webp' || contentType === 'image/webp') return 'WebP';
      if (ext === 'avif' || contentType === 'image/avif') return 'AVIF';
      return 'APNG';
    }
    return tagName === 'VIDEO' ? 'Vídeo' : '';
  }

  function normalizedUrl(value) {
    try { const u = new URL(value, location.href); u.hash = ''; return u.href; } catch { return ''; }
  }

  function collect() {
    const found = new Map();
    function add(url, el, tag) {
      const normalized = normalizedUrl(url);
      if (!normalized || !/^https?:/.test(normalized)) return;
      const format = classify(normalized, tag);
      if (!format) return;
      const width = el.naturalWidth || el.videoWidth || el.width || 0;
      const height = el.naturalHeight || el.videoHeight || el.height || 0;
      const label = el.getAttribute('alt') || el.getAttribute('aria-label') || '';
      const item = { url: normalized, format, width, height, label, source: new URL(normalized).hostname };
      const existing = found.get(normalized);
      if (!existing || (width * height) > (existing.width * existing.height)) found.set(normalized, item);
    }

    document.querySelectorAll('img').forEach(img => {
      add(img.currentSrc || img.src, img, 'IMG');
      const srcset = img.getAttribute('srcset') || '';
      srcset.split(',').forEach(part => add(part.trim().split(/\s+/)[0], img, 'IMG'));
      const dataSrc = img.getAttribute('data-src'); if (dataSrc) add(dataSrc, img, 'IMG');
    });
    document.querySelectorAll('picture source, video, video source, a[href]').forEach(el => {
      const url = el.currentSrc || el.src || el.href || el.getAttribute('src');
      if (url) add(url, el, el.tagName === 'VIDEO' ? 'VIDEO' : 'IMG');
    });
    document.querySelectorAll('*').forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      for (const match of bg.matchAll(/url\(["']?(.*?)["']?\)/g)) add(match[1], el, 'IMG');
    });
    return [...found.values()].slice(0, 500);
  }

  globalThis.AnimDetector = { collect, classify, extensionOf, normalizedUrl };
})();
