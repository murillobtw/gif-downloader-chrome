(() => {
  if (globalThis.__animadosPageScanner) return;
  globalThis.__animadosPageScanner = true;
  let timer;
  const scan = () => globalThis.AnimDetector.collect();
  chrome.runtime.onMessage.addListener((message, _sender, reply) => {
    if (message?.type === 'ANIM_SCAN') { reply({ items: scan(), page: location.href }); return true; }
  });
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => chrome.runtime.sendMessage({ type: 'ANIM_UPDATED', tabId: null }).catch(() => {}), 500);
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'srcset', 'data-src', 'style'] });
})();
