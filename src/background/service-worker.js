chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'anim-download', title: 'Baixar animação', contexts: ['image', 'video'] });
});

function safeFilename(url, format) {
  let name = '';
  try { name = decodeURIComponent(new URL(url).pathname.split('/').pop() || ''); } catch {}
  name = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/[. ]+$/g, '').slice(0, 120);
  const ext = format === 'GIF' ? 'gif' : format === 'WebP' ? 'webp' : format === 'AVIF' ? 'avif' : format === 'APNG' ? 'png' : format === 'WEBM' ? 'webm' : 'mp4';
  if (!name) name = `animacao-${Date.now()}.${ext}`;
  else if (!/\.[a-z0-9]{2,5}$/i.test(name)) name += `.${ext}`;
  return name;
}

function startDownload(url, format) {
  if (!/^https?:\/\//i.test(url)) throw new Error('URL não permitida');
  if (!['GIF', 'WebP', 'AVIF', 'APNG', 'WEBM', 'MP4'].includes(format)) throw new Error('Formato não permitido');
  return chrome.downloads.download({ url, filename: safeFilename(url, format), conflictAction: 'uniquify', saveAs: false });
}

chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message?.type === 'ANIM_DOWNLOAD') {
    startDownload(message.url, message.format).then(id => reply({ ok: true, id })).catch(error => reply({ ok: false, error: error.message }));
    return true;
  }
});

chrome.contextMenus.onClicked.addListener((info) => {
  const url = info.srcUrl;
  if (!url || !/^https?:\/\//i.test(url)) return;
  const ext = new URL(url).pathname.split('.').pop().toLowerCase();
  const format = ext === 'gif' ? 'GIF' : ext === 'webp' ? 'WebP' : ext === 'avif' ? 'AVIF' : ext === 'apng' ? 'APNG' : ext === 'webm' ? 'WEBM' : ext === 'mp4' ? 'MP4' : '';
  if (!format) return;
  startDownload(url, format).catch(() => {});
});
