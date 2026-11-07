const $ = selector => document.querySelector(selector);
let allItems = [];
let currentTab;

async function scan() {
  $('#status').textContent = 'Analisando a página…'; $('#status').className = '';
  $('#results').replaceChildren();
  try {
    [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!currentTab?.id || !/^https?:/.test(currentTab.url || '')) throw new Error('Esta página não permite análise pela extensão.');
    $('#domain').textContent = new URL(currentTab.url).hostname;
    await chrome.scripting.executeScript({ target: { tabId: currentTab.id }, files: ['src/utils/detector.js', 'src/content/content.js'] });
    const response = await chrome.tabs.sendMessage(currentTab.id, { type: 'ANIM_SCAN' });
    allItems = response?.items || [];
    render();
  } catch (error) {
    $('#status').textContent = error.message || 'Não foi possível analisar esta página.';
    $('#status').className = 'error';
  }
}

function render() {
  const query = $('#search').value.trim().toLowerCase();
  const items = allItems.filter(item => `${item.label} ${item.format} ${item.source}`.toLowerCase().includes(query));
  $('#count').textContent = `${allItems.length} ${allItems.length === 1 ? 'item' : 'itens'}`;
  $('#status').textContent = allItems.length ? '' : 'Nenhuma imagem animada ou vídeo compatível encontrado.';
  $('#results').replaceChildren(...items.map((item, index) => card(item, index)));
  $('#downloadSelected').disabled = !items.length;
}

function card(item, index) {
  const article = document.createElement('article'); article.className = 'card';
  const preview = document.createElement('div'); preview.className = 'preview';
  const media = document.createElement(item.format === 'MP4' || item.format === 'WEBM' ? 'video' : 'img');
  media.src = item.url; if (media.tagName === 'VIDEO') { media.muted = true; media.loop = true; media.autoplay = true; media.playsInline = true; }
  media.loading = 'lazy'; media.alt = item.label || item.format;
  preview.append(media);
  const details = document.createElement('div'); details.className = 'details';
  const name = document.createElement('div'); name.className = 'name'; name.textContent = item.label || item.url.split('/').pop().split('?')[0] || `Animação ${index + 1}`;
  const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${item.format} · ${item.width && item.height ? `${item.width}×${item.height}` : 'dimensão desconhecida'} · ${item.source}`;
  const row = document.createElement('div'); row.className = 'row';
  const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.className = 'pick'; checkbox.dataset.url = item.url; checkbox.setAttribute('aria-label', `Selecionar ${name.textContent}`);
  const download = document.createElement('button'); download.textContent = 'Baixar'; download.addEventListener('click', () => downloadOne(item, download));
  const copy = document.createElement('button'); copy.className = 'copy'; copy.textContent = 'Copiar link'; copy.title = 'Copiar link do arquivo';
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(item.url); copy.textContent = 'Copiado!'; }
    catch { copy.textContent = 'Erro ao copiar'; }
    setTimeout(() => copy.textContent = 'Copiar link', 1600);
  });
  row.append(checkbox, copy, download); details.append(name, meta, row); article.append(preview, details); return article;
}

async function downloadOne(item, button) {
  button.disabled = true; button.textContent = '…';
  try { const result = await chrome.runtime.sendMessage({ type: 'ANIM_DOWNLOAD', url: item.url, format: item.format }); button.textContent = result?.ok ? 'Iniciado' : 'Falhou'; }
  catch { button.textContent = 'Falhou'; }
  setTimeout(() => { button.disabled = false; button.textContent = 'Baixar'; }, 1800);
}

$('#refresh').addEventListener('click', scan);
$('#search').addEventListener('input', render);
$('#downloadUrl').addEventListener('click', async () => {
  const field = $('#directUrl');
  let url;
  try { url = new URL(field.value.trim()); } catch { $('#status').textContent = 'Cole um link válido do arquivo.'; $('#status').className = 'error'; return; }
  if (!['http:', 'https:'].includes(url.protocol)) { $('#status').textContent = 'O link precisa começar com http:// ou https://.'; $('#status').className = 'error'; return; }
  const format = AnimDetector.classify(url.href);
  if (!format) { $('#status').textContent = 'Formato não identificado. Use um link direto para GIF, WebP, AVIF, APNG, MP4 ou WebM.'; $('#status').className = 'error'; return; }
  const button = $('#downloadUrl'); button.disabled = true; button.textContent = 'Iniciando…';
  try {
    const result = await chrome.runtime.sendMessage({ type: 'ANIM_DOWNLOAD', url: url.href, format });
    $('#status').textContent = result?.ok ? 'Download iniciado.' : (result?.error || 'Não foi possível iniciar o download.');
    $('#status').className = result?.ok ? '' : 'error';
  } catch { $('#status').textContent = 'Não foi possível iniciar o download.'; $('#status').className = 'error'; }
  button.disabled = false; button.textContent = 'Baixar';
});
$('#selectAll').addEventListener('click', () => document.querySelectorAll('.pick').forEach(box => box.checked = true));
$('#downloadSelected').addEventListener('click', async () => {
  const chosen = new Set([...document.querySelectorAll('.pick:checked')].map(box => box.dataset.url));
  const selected = allItems.filter(item => chosen.has(item.url));
  if (!selected.length) { $('#status').textContent = 'Selecione ao menos um item.'; return; }
  $('#status').textContent = `Baixando 0 de ${selected.length}…`;
  for (let i = 0; i < selected.length; i++) { await chrome.runtime.sendMessage({ type: 'ANIM_DOWNLOAD', url: selected[i].url, format: selected[i].format }); $('#status').textContent = `Baixando ${i + 1} de ${selected.length}…`; }
  $('#status').textContent = `Downloads solicitados: ${selected.length}.`;
});
scan();
