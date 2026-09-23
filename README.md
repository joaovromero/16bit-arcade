# 16BIT ARCADE

Coleção interativa em português com Super Mario Bros., Sonic the Hedgehog, Mortal Kombat, Street Fighter II, Castlevania: Symphony of the Night e Tetris.

## Desenvolvimento

Use Node.js 22.13 ou superior e a versão do pnpm definida em package.json.

```sh
pnpm install
pnpm dev
```

## Conteúdo e aparência

- `app/games.ts`: descrições, paletas, personagens e vídeos.
- `app/page.tsx`: navegação, player e interações por mouse, teclado e toque.
- `app/globals.css`: tema roxo e laranja, animações e responsividade.
- `public/assets/`: sprites e miniaturas locais.
- `ASSET_SOURCES.json`: fontes dos assets e links dos gameplays.

Os players só são carregados após um clique. O botão de pausa e a preferência de movimento reduzido interrompem efeitos e substituem GIFs por imagens estáticas. A tecla Espaço ativa a interação quando o foco não está em outro controle.

A identidade visual celebra os pixels; cada título informa sua plataforma real. Não inclui emulação nem cópias jogáveis dos jogos.
