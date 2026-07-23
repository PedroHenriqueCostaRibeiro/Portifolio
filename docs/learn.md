# SEO, Open Graph e favicon — o que fizemos e por quê

> Um guia para entender os fundamentos por trás das mudanças de SEO/compartilhamento
> do portfólio. Não é a lista de passos (essa está no plano) — é o **porquê** de
> cada decisão. Leia na ordem; cada seção monta em cima da anterior.
>
> Formato de cada seção: **o problema concreto → o mecanismo por trás → a decisão
> que tomamos neste projeto**.

---

## 0. O problema, em uma frase

Seu portfólio é uma SPA (Single Page Application) React. Isso significa que o
`index.html` que sai do servidor é praticamente **vazio** — só uma `<div id="root">`
e um `<script>`. Todo o conteúdo visível (o Hero, a Navbar, o vídeo) é construído
pelo JavaScript **depois** que a página carrega, dentro do navegador.

Um humano com um navegador não percebe isso: o JS roda em milissegundos e a página
aparece. Mas um **robô** — o crawler do Google, o do LinkedIn, o do WhatsApp — muitas
vezes **não roda seu JavaScript**. Ele baixa o HTML cru, lê o que está no `<head>`,
e vai embora. Se o `<head>` não conta quem você é, o robô não tem de onde tirar essa
informação.

Tudo neste documento decorre disso.

---

## 1. Por que o `<head>` importa mais que o resto do HTML

**O problema.** Quando você cola o link do portfólio no LinkedIn, um servidor do
LinkedIn (não o seu navegador) faz um `GET` na sua URL. Ele recebe o HTML e procura,
**só no `<head>`**, por tags que digam: qual o título, qual a descrição, qual a imagem
de preview. Ele nunca executa `main.tsx`. Nunca vê o Hero. Se essas tags não existirem,
o preview sai cinza e vazio.

**O mecanismo.** Existe uma divisão fundamental no HTML:

- `<head>` → **metadados**. Não aparece na tela. É a ficha técnica da página: título,
  codificação, ícone, e as instruções para robôs e redes sociais.
- `<body>` → **conteúdo**. O que o usuário vê.

Robôs de preview leem o `<head>` do HTML **estático** — o arquivo como ele sai do
servidor, antes de qualquer JavaScript. É por isso que existe uma regra prática:

> Metadados de SEO e compartilhamento vivem no `index.html` estático, **nunca** em
> componentes React.

Se colocássemos as meta tags dentro do `App.tsx`, elas só existiriam **depois** que o
React montasse — tarde demais para o crawler que já leu o HTML e foi embora. (Frameworks
como Next.js resolvem isso renderizando o HTML no servidor com as tags já dentro; o Vite
puro, que você usa, não faz SSR, então o `index.html` é o único lugar certo.)

**O que fizemos.** Todas as tags foram para o `<head>` do
[`index.html`](../index.html). É o primeiro e único lugar que um crawler garante ler.

---

## 2. A anatomia do Open Graph

**O problema.** Antes de 2010, cada rede social adivinhava do seu jeito o que mostrar
no preview de um link — pegava a primeira imagem da página, um pedaço de texto qualquer.
O resultado era imprevisível e feio.

**O mecanismo.** Em 2010 o Facebook criou o **Open Graph Protocol**: um conjunto de meta
tags padronizadas que a *página* declara sobre si mesma. Em vez de a rede adivinhar,
você **dita** o preview. Virou padrão de fato — LinkedIn, WhatsApp, Slack, Discord,
Telegram, iMessage, todos leem Open Graph.

A sintaxe tem um detalhe que confunde muita gente:

```html
<meta property="og:title" content="..." />
<meta name="twitter:card" content="..." />
```

Repare: Open Graph usa `property=`, e o Twitter usa `name=`. **Não é escolha estética.**
Open Graph é baseado em RDFa, um padrão da web semântica onde relações entre "coisas"
são declaradas com o atributo `property`. O Twitter criou o vocabulário dele
(`twitter:card`) por cima do sistema comum de metadados HTML, que usa `name`. Se você
trocar um pelo outro, o parser da rede simplesmente **ignora** a tag — ela não dá erro,
só some. Por isso é um erro tão comum e tão silencioso.

As tags de OG que usamos e o papel de cada uma:

| Tag | Para quê |
|---|---|
| `og:type` | `website` — o tipo de conteúdo. (Seria `article` num blog, `profile` num perfil.) |
| `og:url` | A URL **canônica** da página (veja §3 e §7). |
| `og:title` | O título do card. Costuma repetir o `<title>`, mas pode ser diferente. |
| `og:description` | O subtítulo do card. |
| `og:image` | A imagem grande do preview. **A estrela do show.** |
| `og:image:width/height` | As dimensões, para o crawler não precisar baixar a imagem para descobri-las. |
| `og:site_name` | "Pedro Ribeiro" — o nome do site, mostrado em cima do card. |
| `og:locale` | `pt_BR` — o idioma do conteúdo. |

**Por que declarar `og:image:width` e `:height`?** Sem elas, no **primeiro** compartilhamento
o crawler ainda não baixou a imagem, então não sabe o tamanho — e muitas redes mostram
um card menor (sem imagem grande) nessa primeira vez. Declarando as dimensões, o card
grande aparece já na estreia.

**O que fizemos.** Um bloco Open Graph completo + um bloco Twitter espelhando os campos
principais com `twitter:card=summary_large_image` (o formato de card com imagem grande,
não a miniatura quadradinha).

---

## 3. Por que a imagem precisa de URL absoluta

**O problema.** Dentro do seu HTML, você está acostumado a escrever caminhos relativos:
`/og-image.png`, `./foto.jpg`. Funciona no navegador porque o navegador sabe qual é a
"página atual" e resolve o caminho a partir dela.

**O mecanismo.** O crawler do WhatsApp **não tem página atual**. Ele tem só uma string
de texto que você mandou:

```
/og-image.png
```

`/og-image.png` a partir de quê? De `whatsapp.com`? Do servidor do WhatsApp? Não há
como saber. Um caminho relativo só faz sentido quando existe uma origem para resolvê-lo,
e o processo que lê seu `og:image` frequentemente não tem essa origem. O resultado é
imagem quebrada.

A solução é dar o endereço completo, sem ambiguidade:

```html
<meta property="og:image" content="https://SEU-DOMINIO.com/og-image.png" />
```

**O que fizemos.** Todas as URLs em `og:*`, `twitter:*` e `canonical` são absolutas.
Como você ainda não decidiu o domínio, usamos o placeholder `SEU-DOMINIO.com`,
concentrado num comentário de aviso no topo do `<head>`. **Enquanto esse placeholder
não for trocado pela URL real, o preview não carrega a imagem** — esse é o único passo
que falta para o resultado final funcionar.

---

## 4. O ciclo de cache dos crawlers (por que "não atualiza")

**O problema.** Você compartilha o link, vê que a imagem está errada, corrige o
`og:image`, compartilha de novo… e aparece a **imagem velha**. Parece que nada mudou.

**O mecanismo.** Buscar e processar uma página é caro para as redes sociais — elas fazem
isso para milhões de links. Então elas **guardam em cache** o que leram da sua URL, às
vezes por dias. O segundo compartilhamento não relê sua página; ele serve o que está no
cache.

A solução é forçar a rede a reler. Cada plataforma tem uma ferramenta oficial que também
serve de validador:

- **Facebook / WhatsApp** → [Sharing Debugger](https://developers.facebook.com/tools/debug/)
  (o "Scrape Again" limpa o cache; WhatsApp usa o mesmo cache do Facebook)
- **LinkedIn** → [Post Inspector](https://www.linkedin.com/post-inspector/)
- Último recurso: mudar a URL da imagem (`og-image.png?v=2`) — para a rede, é um arquivo
  novo, então não há cache.

**O que fizemos.** Nada em código — isso é operação. Mas o passo 5 da verificação e este
documento registram o fluxo, para você não perder tempo achando que "a mudança não pegou"
quando na verdade é só cache.

---

## 5. Anatomia do favicon em 2026

**O problema.** Sem um ícone declarado, a aba do navegador mostra um quadradinho genérico,
e o site parece amador. Mas "favicon" hoje é uma família de arquivos para contextos
diferentes, e é fácil se perder.

**O mecanismo.** Um pouco de história explica a bagunça:

- **`favicon.ico`** — o formato original, dos anos 2000. `.ico` é um formato de ícone do
  Windows que empacota vários tamanhos num arquivo. Até hoje, **todo navegador pede
  `/favicon.ico` automaticamente** se você não declarar nada — é por isso que você vê um
  `GET /favicon.ico 404` nos logs mesmo sem ter pedido. É um comportamento herdado do
  Internet Explorer.
- **`favicon.svg`** — o presente. Um ícone vetorial: nítido em qualquer resolução (retina,
  4K), um arquivo só, e pode até responder ao tema escuro com media query dentro do SVG.
  Todos os navegadores atuais suportam. **Se você declara um `<link rel="icon">`, o
  navegador usa ele e nunca cai no `/favicon.ico`** — então aquele 404 vira inofensivo.
- **`apple-touch-icon.png`** — o teimoso. Quando alguém salva seu site na tela inicial do
  iPhone, o Safari **ignora** seu `favicon.svg` e procura por um PNG de 180×180 chamado
  `apple-touch-icon.png`. Regra da Apple, sem discussão. Por isso geramos esse arquivo
  separado, em PNG, sem cantos arredondados (o iOS aplica a própria máscara).

**O que fizemos.**

- `public/favicon.svg` → o ícone principal (a marca ✳︎ do seu portfólio, a mesma da
  Navbar). Declarado com `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
- `public/apple-touch-icon.png` (180×180) → para a tela inicial do iOS.
- Não geramos `favicon.ico`: com o SVG declarado, nenhum navegador atual precisa dele.

O ícone é a **mesma** marca em todos os tamanhos, gerada a partir de um SVG único, para
não haver divergência visual entre a aba, o iOS e o Android.

---

## 6. `public/` vs. `src/` no Vite (e por que o favicon não pode ter hash)

**O problema.** No Vite, quando você importa um asset dentro do código
(`import logo from './logo.png'`), o build renomeia o arquivo para algo como
`logo-a3f9c2.png`. Esse hash no nome é **proposital** e ótimo — mas seria fatal para um
favicon.

**O mecanismo.** Existem dois tipos de asset num projeto Vite:

1. **Asset processado** (importado no `src/`) → ganha um hash no nome baseado no conteúdo.
   Se o arquivo muda, o hash muda, o nome muda. Isso permite **cache eterno**: o navegador
   pode guardar `logo-a3f9c2.png` para sempre, porque uma versão nova terá outro nome.
   O preço: você **não sabe** o nome final antecipadamente.

2. **Asset da pasta `public/`** → copiado **cru** para a raiz do `dist/`, com o **nome
   exato**, **sem hash**. `public/favicon.svg` vira `dist/favicon.svg`, servido em
   `https://seusite.com/favicon.svg`.

Agora junte com o que vimos: o navegador procura o favicon num nome fixo (`/favicon.svg`),
o iOS procura `/apple-touch-icon.png`, o crawler do LinkedIn procura a URL absoluta que
você escreveu à mão no `og:image`. **Todos esses são terceiros que precisam adivinhar a
URL.** Se o arquivo tivesse hash (`favicon-a3f9c2.svg`), eles nunca acertariam o nome.

É exatamente por isso que esses arquivos **têm** que estar em `public/`, com nome estável.
No build você viu a confirmação: `favicon.svg`, `og-image.png`, `robots.txt`, etc. saíram
na **raiz** do `dist/`, sem hash, enquanto o JS e o CSS da aplicação saíram em
`dist/assets/` **com** hash.

**O que fizemos.** Criamos a pasta `public/` (o projeto não tinha) e colocamos lá tudo
que precisa de URL previsível: o favicon, os ícones, a imagem OG, o manifest, o robots e
o sitemap.

---

## 7. Meta description e canonical: dois mal-entendidos comuns

### Meta description ≠ ranking

**O mito.** "Preciso encher a description de palavras-chave para subir no Google."

**A realidade.** O Google **não usa** a meta description como fator de ranqueamento desde
2009. Ela não te faz subir. O que ela faz é aparecer como o **texto cinza embaixo do seu
link** nos resultados de busca. Ou seja: ela não decide se você aparece, ela decide se a
pessoa **clica** quando você aparece. É uma isca de clique (CTR), não um sinal de rank.

Isso muda como você escreve: em vez de empilhar termos, você escreve uma frase que dá
vontade de clicar. A nossa — *"Portfólio de Pedro Ribeiro, Software Engineer. Produtos
web com React, Next.js e TypeScript."* — diz em uma linha quem você é e o que faz, em
~95 caracteres (o Google corta por volta de 155–160).

### Canonical: evitando duplicatas de você mesmo

**O problema.** O mesmo site costuma ser acessível por várias URLs: `com-www` e `sem-www`,
`http` e `https`, com e sem `/` no final, com parâmetros de campanha (`?utm_source=...`).
Para o Google, essas podem parecer **páginas diferentes com o mesmo conteúdo** —
conteúdo duplicado, que dilui sua relevância.

**O mecanismo.** `<link rel="canonical" href="...">` diz ao Google: *"de todas as URLs que
levam a esta página, esta é a oficial; credite tudo a ela."* Consolida a autoridade num
endereço só.

**O que fizemos.** Um `<link rel="canonical">` apontando para a raiz do domínio, e o
mesmo endereço em `og:url`. Quando você definir a URL real, os dois passam a proteger
contra duplicação.

---

## 8. Dados estruturados: falando com o grafo do Google

**O problema.** As meta tags dizem a *humanos* (via preview) quem você é. Mas quando um
recrutador **pesquisa seu nome** no Google — não a sua URL, seu *nome* — o Google precisa
entender que existe uma pessoa chamada Pedro Ribeiro, que ela é Software Engineer, e que
este site é dela.

**O mecanismo.** O Google mantém um **grafo de conhecimento**: uma rede de "entidades"
(pessoas, empresas, lugares) e as relações entre elas. Você pode alimentar esse grafo
diretamente com **JSON-LD** (JSON Linked Data), um bloco de dados estruturados no
vocabulário do [schema.org](https://schema.org):

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Pedro Ribeiro",
  "jobTitle": "Software Engineer",
  "sameAs": ["https://github.com/PedroHenriqueCostaRibeiro"]
}
```

`@type: "Person"` diz "isto é uma pessoa". O campo mais interessante é o **`sameAs`**:
é a lista de outras URLs que são *a mesma pessoa* — seu GitHub, seu LinkedIn. É assim
que o Google conecta os pontos: "o Pedro do portfólio é o mesmo do GitHub é o mesmo do
LinkedIn". Isso reforça sua identidade como entidade única e é o que, com o tempo,
alimenta aquele painel lateral quando alguém busca seu nome.

**O que fizemos.** Um bloco JSON-LD `Person` no `<head>`, com seu cargo, e-mail e o
GitHub em `sameAs`. Deixamos um lugar marcado para o LinkedIn — quando você passar a URL
do seu perfil, ele entra ali. É só dado, não muda nada visual na página.

---

## 9. 1200×630: a matemática do card de preview

**O problema.** Por que exatamente 1200×630? Por que não um quadrado, ou a resolução do
seu monitor?

**O mecanismo.** 1200÷630 ≈ **1.91:1**. Essa é a proporção que LinkedIn, Facebook e o
Twitter card grande usam para o preview "hero". Se você entrega uma imagem noutra
proporção, a rede **corta** para caber — e o corte é automático e burro, costuma comer o
texto das bordas ou de cima/baixo.

Duas consequências práticas para o design do card:

1. **Deixe respiro nas bordas.** Não encoste texto importante na margem — pode ser cortado
   dependendo da rede.
2. **Texto grande.** No feed do WhatsApp o card aparece com poucos centímetros de largura.
   Texto pequeno vira borrão ilegível. Por isso o nosso card tem só o essencial em fonte
   bem grande: nome, cargo, stack.

**O que fizemos.** Geramos `og-image.png` em exatos 1200×630, usando o **próprio design
system** do portfólio: fundo na cor do vídeo (`#8d8b89`, a mesma `FALLBACK_COLOR` do
`BackgroundVideo`), a fonte Inter auto-hospedada (não uma fonte de CDN qualquer), o preto
sobre claro, a pílula `rounded-full`. Assim o card *é* o portfólio em miniatura, coerente
com o que a pessoa vê ao clicar. A imagem foi renderizada num HTML temporário e capturada
como PNG — redes sociais **não aceitam SVG** em `og:image`, então precisava ser raster de
verdade.

---

## 10. Como verificar de verdade

Meta tag quebrada é **invisível**: o site funciona igual, o preview é que falha. Então
verificar não é opcional. Há dois níveis:

**Antes do deploy (dá para fazer em localhost):**

- Os testes em [`index.html.test.ts`](../index.html.test.ts) — leem o HTML e garantem que
  título, description, canonical, Open Graph, Twitter card, favicon e JSON-LD estão
  presentes, e que a `og:image` é uma URL absoluta. Rode com `npm test`. Eles são a rede
  de segurança contra alguém apagar uma tag sem querer no futuro.
- `npm run build` e confira que `favicon.svg`, `og-image.png` etc. estão na **raiz** do
  `dist/`.

**Depois do deploy (só funciona com a URL real, porque o preview precisa baixar a imagem
de um endereço público):**

- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (vale para o
  WhatsApp também)
- [Rich Results Test do Google](https://search.google.com/test/rich-results) — valida o
  JSON-LD
- O teste mais honesto de todos: **mande o link para você mesmo no WhatsApp** e veja o
  card aparecer.

Por que só depois do deploy? Porque o `og:image` aponta para uma URL absoluta pública.
Em `localhost`, nenhum servidor do LinkedIn consegue acessar `http://localhost:5173` para
baixar a imagem. O preview real só existe quando a imagem está num endereço que o mundo
alcança.

---

## 11. Checklist de manutenção

Sempre que algo mudar, revise estes pontos — eles se repetem em vários arquivos e
desincronizam fácil:

- **Trocou de domínio?** Atualize `SEU-DOMINIO.com` em três lugares: `index.html`
  (várias tags), `public/robots.txt` e `public/sitemap.xml`.
- **Mudou o cargo ou o título?** Ele aparece em `<title>`, `og:title`, `twitter:title` e
  no `jobTitle` do JSON-LD. Mantenha os quatro iguais — e coerentes com o que o Hero
  mostra na tela (hoje: "Software Engineer").
- **Trocou a foto/card de compartilhamento?** Gere um novo `og-image.png` **em 1200×630**
  e rode o "Scrape Again" nos validadores para furar o cache das redes.
- **Ganhou um LinkedIn/novo perfil público?** Adicione a URL no `sameAs` do JSON-LD.
- **Rode `npm test`** depois de mexer no `<head>` — o teste avisa se alguma tag essencial
  sumiu.

---

### TL;DR

Seu site é uma SPA, então robôs leem só o `<head>` estático — nunca o React. Por isso
todo o SEO/compartilhamento vive no `index.html`: Open Graph e Twitter card (com **URL
absoluta** na imagem, senão nada aparece), um favicon SVG servido de `public/` com nome
fixo, e JSON-LD para o Google te reconhecer como pessoa. O único passo que falta é trocar
o placeholder `SEU-DOMINIO.com` pela URL real depois do deploy — sem isso, o preview não
carrega a imagem.
