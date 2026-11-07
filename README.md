# GIF Downloader for Chrome

Extensão gratuita para encontrar GIFs e outros conteúdos animados em páginas web e baixá-los pelo Chrome. O nome do repositório é genérico porque a detecção funciona em vários sites, incluindo páginas do Twitter/X quando o arquivo pode ser acessado diretamente.

## Como funciona

1. Você abre a página desejada e clica no ícone da extensão.
2. O Chrome concede acesso temporário à aba ativa. A extensão examina elementos de imagem, fontes de `<picture>`, links, vídeos e imagens de fundo CSS.
3. Os endereços encontrados são classificados por extensão conhecida, como `.gif`, `.webp`, `.avif`, `.apng`, `.mp4` ou `.webm`. A lista mostra miniatura, formato, dimensões disponíveis e domínio.
4. Você pode filtrar os resultados, copiar o link direto de um item, baixar um arquivo individual ou selecionar vários. Também pode colar um link direto no campo **Baixar por link**.
5. Quando você pede um download, a extensão passa a URL para `chrome.downloads`. O Chrome salva o arquivo na pasta de downloads configurada no navegador e resolve nomes repetidos com sufixos.

O processamento da página ocorre localmente. A extensão não envia seu histórico ou os links encontrados para um servidor externo. Ela não baixa nada até você selecionar um botão ou a opção do menu de contexto.

## Funcionalidades

- Busca por GIF e formatos animados comuns, além de vídeos curtos MP4 e WebM.
- Detecção de elementos de imagem, `<picture>`, links, vídeos e imagens de fundo CSS.
- Miniaturas, dimensões quando disponíveis, formato e domínio de origem.
- Download individual, seleção para baixar vários arquivos e download por URL colada.
- Cópia do link direto de cada resultado.
- Menu de contexto para baixar arquivos animados com extensão reconhecida.
- Nomes de arquivos limpos e tratamento de conflitos pelo Chrome.

## Instalação local

Não há dependências externas nem etapa de compilação.

1. Abra `chrome://extensions` no Google Chrome.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta do projeto, onde está `manifest.json`.
4. Abra uma página HTTP ou HTTPS e clique no ícone da extensão.

Após atualizar os arquivos, volte a `chrome://extensions` e clique em **Recarregar** no cartão da extensão.

## Permissões

- `activeTab` e `scripting`: examinar a página atual após o clique do usuário.
- `downloads`: iniciar os downloads escolhidos pelo usuário.
- `contextMenus`: mostrar uma ação de download no menu de contexto.

A extensão não solicita acesso persistente a todos os sites.

## Twitter/X e limitações

A extensão usa uma detecção genérica do conteúdo acessível no DOM. No Twitter/X, um link direto para um GIF ou vídeo pode ser encontrado quando a página o expõe ao navegador, mas a plataforma frequentemente entrega animações como vídeo, usa miniaturas ou URLs temporárias. Nesses casos, o resultado pode aparecer como MP4 ou WebM, ou pode não ser detectado. A extensão não contorna autenticação, DRM, controles de acesso ou outras proteções, e não converte vídeos para GIF.

A classificação usa a extensão da URL (e MIME quando o detector recebe essa informação); não inspeciona os bytes do arquivo para confirmar o formato real ou se uma imagem contém múltiplos quadros. Links sem extensão reconhecível não podem ser baixados pelo campo de URL. A análise limita a lista a 500 resultados e não garante compatibilidade com todos os sites.

## Testes e verificações

Com Node.js instalado, execute:

```sh
node --check src/background/service-worker.js
node --check src/content/content.js
node --check src/popup/popup.js
node --check src/utils/detector.js
node --test tests/detector.test.js
```

O teste no Chrome é manual: carregue a extensão conforme as instruções acima e experimente uma página que contenha imagens animadas acessíveis. Não se deve considerar o comportamento em um site verificado sem testar esse site no navegador.

