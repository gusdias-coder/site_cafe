# TORRA NOBRE — site conceito

Projeto estático em HTML, CSS e JavaScript vanilla. Não usa framework ou etapa de build.

## Como testar

1. Extraia o ZIP.
2. Abra a pasta `torra-nobre` no VS Code.
3. Abra `index.html` no navegador ou use a extensão Live Server.
4. As imagens remotas e as fontes do Google exigem conexão com a internet.

## Hero cinematográfica controlada pelo scroll

A hero já tem a lógica de sincronização temporal de vídeo com a rolagem. O vídeo `assets/video/hero.mp4` já está ativo; a imagem `assets/images/hero-poster.jpg` serve de fallback.

Para ativar o vídeo:
1. Coloque um arquivo MP4 otimizado em `assets/video/hero.mp4`.
2. No `index.html`, altere o elemento `<video data-scroll-video>` para incluir `data-video-src="assets/video/hero.mp4"`.
3. Use vídeo horizontal, sem áudio, com enquadramento que funcione em desktop e celular. Para melhor desempenho, mantenha o arquivo comprimido e com duração curta.

Exemplo:
```html
<video class="hero-video" muted playsinline preload="metadata" aria-hidden="true"
       data-scroll-video data-video-src="assets/video/hero.mp4"></video>
```

O código procura posicionar o vídeo no tempo correspondente à posição de scroll da hero. O suporte e a precisão podem variar conforme navegador, codec e dispositivo. Se não houver vídeo configurado, a imagem continua visível.

## Estrutura

- `index.html`: conteúdo semântico e estrutura da página.
- `css/style.css`: variáveis, componentes, layout, responsividade e efeitos.
- `js/main.js`: menu acessível, estado do cabeçalho, progresso da hero, reveal e sincronização opcional do vídeo.
- `assets/images/`: pasta para imagens locais futuras.
- `assets/video/`: pasta para o vídeo da hero.

## Personalização antes de publicar

- A TORRA NOBRE é uma marca conceitual.
- Nomes e perfis de cafés são exemplos, não produtos verificados.
- O e-mail `contato@torranobre.com.br` é provisório.
- As imagens atuais usam URLs do Unsplash Source/Images e carregam remotamente. Para produção, confira as condições de licença de cada imagem, salve assets locais licenciados e atualize os caminhos.
- Substitua texto, produtos, contatos e metadados conforme as informações reais da marca.

## Desempenho e acessibilidade

- Imagens abaixo da hero usam lazy loading.
- A hero tem prioridade de carregamento e fallback de imagem.
- Menu móvel suporta teclado e Escape.
- O efeito de entrada respeita `prefers-reduced-motion`.
- Não há dependências JavaScript externas.

## Animações

- Hero com vídeo que avança conforme a rolagem (suavizado) e texto que se dissolve.
- Títulos com revelação palavra por palavra; manifesto que "acende" conforme você lê.
- Imagens com revelação em cortina e parallax; faixa em movimento (marquee); botões magnéticos; barra de progresso da página.
- As revelações acontecem a cada vez que o item entra na tela e se escondem ao sair, tanto subindo quanto descendo.
- Tudo respeita `prefers-reduced-motion` (sem movimento, a hero vira estática).
