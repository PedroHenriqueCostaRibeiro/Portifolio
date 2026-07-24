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

---
---

# Aula 2 — Extraindo o `CopyIcon` do `Hero.tsx`

> Um refactor pequeno, mas cheio de fundamentos. A ideia aqui não é só
> "mover código de lugar" — é entender **por que** movemos, **quando** vale a
> pena e o que cada linha está realmente fazendo. Leia como se estivéssemos
> lado a lado no editor.

---

## 0. O que fizemos, em uma frase

Tiramos a função `CopyIcon` de dentro de `Hero.tsx` e a colocamos em seu
próprio arquivo, `src/components/icons/CopyIcon.tsx`. O `Hero` agora **importa**
o ícone em vez de **declará-lo**.

Antes:

```tsx
// Hero.tsx — DOIS componentes no mesmo arquivo
function CopyIcon() { /* ... */ }
export default function Hero() { /* ...usa <CopyIcon /> */ }
```

Depois:

```tsx
// icons/CopyIcon.tsx
export default function CopyIcon() { /* ... */ }

// Hero.tsx
import CopyIcon from './icons/CopyIcon'
export default function Hero() { /* ...usa <CopyIcon /> */ }
```

Parece trivial. O valor está nos **porquês** abaixo.

---

## 1. A regra "um componente por arquivo" — e por que ela existe

O `CLAUDE.md` do projeto pede: *um componente por arquivo*. Não é capricho.
É uma aplicação prática do princípio da **responsabilidade única** (cada
unidade de código tem um motivo para existir e um motivo para mudar). Quando um
arquivo tem um único componente exportado, você ganha quatro coisas concretas:

1. **Localização previsível.** Precisa mexer no ícone de cópia? O arquivo se
   chama `CopyIcon.tsx`. Você não precisa lembrar que ele "mora escondido dentro
   do Hero". O nome do arquivo vira um índice do projeto.

2. **Diffs menores e honestos.** Quando `CopyIcon` e `Hero` dividem arquivo,
   qualquer mudança em um "suja" o histórico do outro. No `git blame` e nos code
   reviews, isso mistura assuntos. Arquivos separados = históricos separados.

3. **Testabilidade isolada.** Um arquivo próprio pode ser importado sozinho por
   um teste, sem arrastar junto todo o peso do `Hero` (hook de typewriter,
   estado de clipboard, timers...).

4. **Reuso sem cópia.** Enquanto o ícone estava preso ao `Hero`, usá-lo em outro
   lugar exigiria copiar e colar o SVG. Agora é `import CopyIcon from ...`.

> **Fundamento:** acoplamento e coesão. Queremos **alta coesão** (coisas que
> mudam juntas ficam juntas) e **baixo acoplamento** (coisas independentes não se
> prendem umas às outras). O `CopyIcon` não tem nada a ver com a lógica do
> `Hero` — ele é decoração. Logo, não deveria depender do arquivo do `Hero` para
> existir.

---

## 2. "Mas é um helper minúsculo — não dá pra deixar quieto?"

Ótima pergunta, e a resposta honesta é: **às vezes dá.** Nem toda função
auxiliar precisa virar arquivo. A regra tem exceções conscientes quando o
helper é (a) minúsculo, (b) privado daquele arquivo e (c) sem chance de reuso.
O próprio objetivo desta tarefa reconhecia isso: *"mover para arquivo próprio,
ou aceitar conscientemente como exceção de helper minúsculo"*.

Então por que **extrair** neste caso? Três razões:

- **Ícones tendem a se multiplicar.** Hoje é o `CopyIcon`; amanhã aparece um
  ícone de link externo, um de seta, um de e-mail. Ícone é a categoria de helper
  que *quase sempre* ganha irmãos. Extrair o primeiro estabelece o lugar deles.
- **Consistência com o precedente do repo.** O commit anterior já fez
  exatamente esse movimento com o `Pill` (`refactor: extrai componente Pill
  reutilizável do Hero`). Seguir o mesmo padrão deixa o projeto coerente — e
  coerência é o que torna um código previsível para quem chega depois.
- **O custo é quase zero.** Um SVG estático, sem props e sem estado, migra sem
  risco. Quando extrair é barato e o reuso é provável, extrair ganha.

> **A lição de julgamento:** a regra não é "sempre extraia tudo". É "saiba
> *avaliar* coesão, reuso provável e consistência, e então decida". Aqui os três
> apontaram para extrair.

---

## 3. Anatomia do arquivo novo, linha a linha

```tsx
/** Two overlapping rectangles — a small copy icon. */
export default function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1"
            stroke="currentColor" strokeWidth="1" />
      <rect x="1.5" y="1.5" width="7" height="7" rx="1"
            stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
```

Três detalhes que valem ouro:

### `export default function CopyIcon()`
Usamos **default export** para espelhar o `Pill.tsx` e o `Hero.tsx` — o projeto
adotou default export para componentes. A vantagem prática do default é o import
limpo: `import CopyIcon from './icons/CopyIcon'`, sem chaves. (Named exports —
`export function CopyIcon` + `import { CopyIcon }` — são melhores quando um
arquivo exporta várias coisas e você quer que o nome seja obrigatório e
verificável pelo autocomplete. Aqui o arquivo exporta **uma** coisa, então
default é a escolha idiomática do projeto.)

### `stroke="currentColor"`
Este é o truque de acessibilidade e reuso mais importante do arquivo.
`currentColor` é uma palavra-chave do CSS/SVG que diz: *"use a cor de texto
(`color`) do elemento pai"*. Por isso o ícone fica preto quando o botão está no
estado normal e **inverte para branco** quando o pill `outline` está em hover —
sem escrevermos nenhuma regra de cor para o ícone. Ele simplesmente herda. Se
tivéssemos fixado `stroke="black"`, o ícone sumiria no hover de fundo escuro.

> **Fundamento:** herança de cor via `currentColor` é o que permite um único
> componente de ícone servir em qualquer contexto de cor. É o motivo de
> bibliotecas de ícones (Lucide, Heroicons) usarem `currentColor` em tudo.

### `aria-hidden="true"`
O ícone é **decorativo**: ele repete visualmente a ação que o texto do botão já
descreve ("Fale comigo: ..."). Um leitor de tela que anunciasse "imagem" aqui só
adicionaria ruído. `aria-hidden="true"` remove o elemento da árvore de
acessibilidade. Regra geral: **ícone que acompanha texto é decorativo → esconda
do leitor de tela; ícone que é a única informação → dê um rótulo** (`aria-label`
ou `<title>`).

---

## 4. Por que a pasta `icons/`?

Duas formas de organizar componentes:

- **Plana:** tudo em `components/` (`Pill.tsx`, `Navbar.tsx`, `CopyIcon.tsx`...).
- **Por tipo:** uma subpasta `components/icons/` para os ícones.

Escolhemos `components/icons/CopyIcon.tsx`. O raciocínio:

- Ícones formam uma **família previsível** — compartilham forma (SVG pequeno,
  `currentColor`, `aria-hidden`) e tendem a chegar em grupo. Agrupá-los antecipa
  esse crescimento e evita que a pasta `components/` vire uma lista longa e
  misturada.
- O **custo** dessa decisão é honesto e vale ser dito: introduzimos uma
  convenção que **ainda não existia** no repo. A partir de agora, "ícone novo vai
  em `icons/`" passa a ser uma regra implícita que a equipe precisa seguir. Vale
  a pena quando você acredita que virão mais ícones — que é o nosso caso.

> **Trade-off geral:** estrutura plana é mais simples até o ponto em que vira
> bagunça; estrutura por tipo organiza, mas só se paga quando há volume. Não
> crie pastas para um único arquivo *sem* expectativa de crescimento — isso seria
> abstração prematura. Crie quando o padrão de crescimento é claro.

---

## 5. Por que **não** criamos um teste para o `CopyIcon`

O projeto tem uma filosofia de testes explícita (veja
`src/hooks/useTypewriter.test.ts`): **testar a intenção que o usuário percebe,
não os detalhes de implementação.**

O `CopyIcon` não expõe comportamento nenhum: sem props, sem estado, sem
interação, e ainda por cima `aria-hidden` (invisível para a árvore de
acessibilidade). Um teste dele só poderia afirmar "o SVG tem dois `<rect>`" — ou
seja, testaria a *implementação*, não uma *intenção*. Esse tipo de teste quebra
quando você ajusta o desenho do ícone, mesmo sem nenhum bug real. É ruído.

O comportamento que **importa** já vive no `Hero`: clicar copia o e-mail e o
texto vira "Copiado!" por 2 segundos. *Esse* é o teste que vale escrever (no
`Hero`, se e quando quiser cobertura), porque descreve algo que o usuário
percebe.

> **Fundamento:** a pergunta certa antes de escrever um teste não é "esse código
> pode ser testado?", e sim "existe um comportamento observável que eu quero
> proteger de regressões?". Se a resposta é não, o teste é custo sem retorno.

---

## 6. Como verificar que deu certo

```bash
npm run build
```
Type-check + build de produção. Deve passar limpo: o import `./icons/CopyIcon`
resolve e não sobrou nenhum `CopyIcon` órfão no `Hero.tsx`.

```bash
npm test
```
A suíte existente continua verde — a mudança é uma **movimentação**, não altera
comportamento algum.

```bash
npm run dev
```
Abra `http://localhost:5173` e confira, no botão "Fale comigo: ...":
- o ícone de cópia continua à direita do texto;
- clicar copia o e-mail e o rótulo vira "Copiado!" por 2s;
- no hover do pill (fundo branco → texto preto), o ícone acompanha a cor —
  prova viva do `currentColor` funcionando.

E o teste final contra o **objetivo**: abra o `Hero.tsx`. Ele agora declara
**um único componente**. Missão cumprida.

---

## Resumo dos fundamentos (Aula 2)

| Conceito | Onde apareceu | Por que importa |
|---|---|---|
| Responsabilidade única / coesão | regra "um componente por arquivo" | código previsível, diffs limpos |
| Julgamento sobre exceções | extrair vs. manter helper | regras servem a objetivos, não o contrário |
| `currentColor` | `stroke` do SVG | um ícone serve a qualquer cor de contexto |
| `aria-hidden` | ícone decorativo | acessibilidade sem ruído |
| Abstração no tempo certo | pasta `icons/` | organizar quando há crescimento, não antes |
| Teste de intenção | ausência de `CopyIcon.test.tsx` | não testar implementação |

---
---

# Aula 3 — Testando as intenções observáveis do `Hero`

> Acompanha `src/components/Hero.test.tsx`. A ideia não é descrever o que o teste
> faz, e sim te ensinar **por que** cada linha existe — os fundamentos de web e de
> testes por trás dela. Leia com o arquivo de teste aberto ao lado.

---

## 0. O ponto de partida: o que é "intenção observável"?

O `CLAUDE.md` deste projeto tem uma regra forte:

> Teste o comportamento que o usuário percebe, não detalhes internos de implementação.
> - ✅ "revela o texto completo e marca done ao terminar"
> - ❌ "chama setState N vezes com os argumentos corretos"

Por que isso importa tanto? Porque um teste é um **contrato sobre comportamento**. Se
você testa "chamou `setState` 3 vezes", qualquer refatoração legítima (trocar `useState`
por `useReducer`, memoizar algo, reordenar o interior) quebra o teste **sem que nada
tenha piorado para o usuário**. Testes assim geram falsos alarmes e, com o tempo, as
pessoas param de confiar neles.

Quando você testa "ao clicar, aparece 'Copiado!'", o teste só quebra se o comportamento
visível quebrar. Ele te dá liberdade para reescrever o interior do componente à vontade.
**Um bom teste falha por um motivo, e esse motivo é sempre "o usuário foi prejudicado".**

As três intenções que o `Hero` precisa garantir:

1. Clicar na pill de contato **copia o e-mail** e a UI confirma.
2. As pills **aparecem (fade) ~400ms após o load**.
3. Com **movimento reduzido**, as pills aparecem **na hora**.

> **Por que o `Hero` e não o menu?** O objetivo pedia testar "abrir/fechar o menu", mas
> ao explorar o repo descobrimos que isso **já está coberto** em `Navbar.test.tsx`
> (`aria-expanded` + visibilidade do overlay). O `CLAUDE.md` manda *apontar o conflito
> antes de executar* e fazer *mudanças cirúrgicas*. Cobertura duplicada não é cobertura
> melhor — é manutenção dobrada para a mesma garantia. A lacuna real era o `Hero`, que
> não tinha **nenhum** teste. Por isso miramos nele.

---

## 1. Encontrar elementos pelo "papel" (role), não pelo CSS

```ts
screen.getByRole('button', { name: /fale comigo/i })
screen.getByRole('button', { name: /ver projetos/i })
```

Poderíamos ter usado `querySelector('.rounded-full')` ou um `data-testid`. Por que não?

A **Testing Library** foi desenhada para você consultar a página como uma pessoa (ou um
leitor de tela) a percebe. Todo elemento interativo tem um **papel de acessibilidade**
(`role`): `<button>` → `button`, `<a href>` → `link`. E tem um **nome acessível** — o
texto que a tecnologia assistiva anuncia. `getByRole('button', { name: /fale comigo/i })`
diz literalmente "o botão que uma pessoa cega ouviria como 'Fale comigo…'".

Isso te dá duas coisas de graça:

- **Resiliência**: mudar a classe Tailwind, o layout ou a árvore de `<div>`s não quebra o
  teste. Só mudar o que o usuário percebe quebra.
- **Acessibilidade como efeito colateral**: se você *não consegue* selecionar por role +
  nome, provavelmente uma pessoa com leitor de tela também não usa aquele elemento. O
  teste vira detector de problemas de a11y.

> **Ordem de preferência de consulta:** `getByRole` → `getByLabelText` → `getByText`.
> `data-testid` é o último recurso, para quando não há como descrever o elemento de forma
> humana.

O `name` aceita regex (`/fale comigo/i`) para casar um trecho **estável** ("Fale comigo")
sem depender do texto completo, que inclui o e-mail e poderia variar.

---

## 2. `userEvent` vs. `fireEvent`: simular um humano, não um evento

```ts
const user = userEvent.setup()
await user.click(...)
```

Um clique real não é *um* evento — é uma **sequência**: o ponteiro se move
(`pointerover`, `pointermove`), pressiona (`pointerdown`, `mousedown`), foca, solta
(`pointerup`, `mouseup`) e só então dispara `click`. O `userEvent` reproduz essa
coreografia inteira; o `fireEvent.click` pula direto para o final, disparando um único
evento sintético.

Testar com `userEvent` te dá muito mais confiança de que "funciona quando um humano
clica", que é a intenção real. Regra moderna: **use `userEvent` por padrão; `fireEvent`
só para casos de baixo nível que o `userEvent` não cobre.**

Repare no `await`: como `userEvent` simula a sequência de forma assíncrona, **toda**
interação é uma Promise. Esquecer o `await` é a causa nº 1 de testes "flaky".

---

## 3. Tempo em teste: `vi.useFakeTimers()` e o poder de adiantar o relógio

O `Hero` tem comportamento que depende do **tempo**:

```ts
// Hero.tsx
const id = setTimeout(() => setPillsVisible(true), 400)
```

Esperar 400ms de verdade seria lento; esperar o typewriter ou o reset de 2s do
"Copiado!" tornaria a suíte insuportável. Pior: tempo real é **não determinístico** — a
máquina de CI pode disparar o timer "tarde". A solução é substituir o relógio do
JavaScript por um **falso e controlado por você**:

```ts
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })
```

A partir daí, `setTimeout`/`setInterval` **não avançam sozinhos**. Ficam congelados até
você mandar o relógio andar:

```ts
act(() => { vi.advanceTimersByTime(400) })
expect(container.style.opacity).toBe('1')
```

`advanceTimersByTime(400)` diz "faça o tempo pular 400ms". Todos os timers agendados para
até 400ms disparam, na ordem certa, **instantaneamente**. O teste vira determinístico e
rápido. É crucial **restaurar** com `vi.useRealTimers()` no `afterEach`: fake timers são
globais e, esquecidos, um teste contamina o outro.

---

## 4. `act()`: por que envolvemos o avanço do relógio

```ts
act(() => { vi.advanceTimersByTime(400) })
```

Adiantar o relógio dispara o callback do `setTimeout`, que chama `setPillsVisible(true)`
— uma **atualização de estado do React**. `act()` é a fronteira que diz ao React:
"estou provocando uma atualização; processe tudo (renders, efeitos) até estabilizar
**antes** de eu inspecionar o resultado". Sem `act()`, você poderia ler o DOM no meio de
uma atualização — vendo um estado intermediário — e o React ainda imprimiria o aviso
*"An update … was not wrapped in act(...)"*. Esse aviso significa que sua asserção pode
estar olhando para o passado.

Detalhe: **`userEvent` já embrulha as ações em `act()`** por baixo dos panos. Por isso o
teste do clique não precisa de `act()` explícito, mas o teste que adianta o relógio
manualmente precisa.

---

## 5. O jsdom não é um navegador: mockando `matchMedia`

Os testes rodam no **jsdom**, uma simulação leve do DOM em Node. Ele implementa boa parte
da API do navegador, mas **não tudo**. `usePrefersReducedMotion` chama:

```ts
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

No jsdom, `window.matchMedia` é `undefined`. Então nós o **substituímos** por uma versão
controlável:

```ts
function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}
```

`mockMatchMedia(false)` simula um usuário sem preferência (pills fazem fade);
`mockMatchMedia(true)` simula quem pediu movimento reduzido (pills na hora). **Mockar não
é trapacear** — é isolar a unidade sob teste do ambiente para poder testar cada cenário
de propósito.

Repare que o mock devolve `addEventListener`/`removeEventListener` como `vi.fn()`, porque
o hook chama `media.addEventListener('change', ...)`. Um mock precisa ter a **mesma forma**
do objeto real, senão o código explode ao chamar um método inexistente. O mesmo padrão já
vive em `usePrefersReducedMotion.test.ts` e `BackgroundVideo.test.tsx` — reaproveitá-lo
mantém a suíte consistente.

---

## 6. A grande armadilha do dia: `userEvent` traz o próprio clipboard

Este foi o ponto que mais ensina. A primeira versão do teste fez assim:

```ts
const writeText = vi.fn()
Object.defineProperty(navigator, 'clipboard', { value: { writeText }, ... })
await user.click(botãoDeEmail)
expect(writeText).toHaveBeenCalledWith(EMAIL) // ❌ "Number of calls: 0"
```

E falhava com **0 chamadas** — apesar de "Copiado!" aparecer na tela! Como o handler
rodou (a confirmação surgiu) mas o nosso mock não foi chamado?

Investigando, a resposta: **`userEvent.setup()` instala o seu próprio `navigator.clipboard`
falso** para conseguir testar copiar/colar de forma realista. Como chamamos `setup()`
*depois* de definir nosso mock, o `userEvent` **sobrescreveu** o `navigator.clipboard` —
então `copyEmail` escreveu no clipboard *do userEvent*, não no nosso. Nosso `vi.fn()`
ficou órfão, com 0 chamadas. (Provamos isso medindo a identidade do objeto antes e depois:
`sameBefore=true`, `sameAfter=false`.)

A lição de fundamento: **quando uma ferramenta de teste gerencia um recurso do ambiente,
trabalhe *com* a ferramenta, não contra ela.** Em vez de brigar por quem controla
`navigator.clipboard`, deixamos o `userEvent` prover o clipboard e simplesmente **lemos de
volta** o que foi copiado:

```ts
await user.click(screen.getByRole('button', { name: /fale comigo/i }))

expect(await navigator.clipboard.readText()).toBe(EMAIL)   // o e-mail foi parar lá?
expect(screen.getByText('Copiado!')).toBeInTheDocument()   // a UI confirmou?
```

Esse teste é melhor que o original em dois sentidos:

- **Testa a intenção, não a fiação.** "O e-mail está no clipboard" é o que o usuário quer;
  "`writeText` foi chamado com tal argumento" é como o código faz isso *hoje*. `readText()`
  verifica o resultado, seja qual for o caminho interno.
- **Não depende da implementação do clipboard.** Amanhã o `copyEmail` pode usar outra API
  de cópia; enquanto o e-mail acabar no clipboard, o teste continua válido.

> **Moral:** antes de mockar uma API global, verifique se a sua ferramenta de teste já não
> a controla. Duas mãos no mesmo volante = bug silencioso.

Um detalhe de tempo: este teste chama `vi.useRealTimers()` no início. O fluxo clique +
Promise do clipboard se encaixa mal com fake timers (a primeira tentativa *travou* por
5s). Como esse teste não precisa controlar o relógio, voltar ao tempo real é o caminho
mais simples e robusto.

---

## 7. `toBeVisible()` vs. `opacity`: por que verificamos coisas diferentes

No `Navbar.test.tsx`, a visibilidade do menu é testada com `expect(link).not.toBeVisible()`.
Nas pills do `Hero`, verificamos o `opacity` na unha:

```ts
expect(container.style.opacity).toBe('0')   // escondido
// ...avança 400ms...
expect(container.style.opacity).toBe('1')   // visível
```

Por que não usar `toBeVisible()` nos dois? Porque **existem várias formas de "esconder" um
elemento no CSS, e elas não são equivalentes**:

| Técnica | Ocupa espaço? | Recebe clique? | Lido por leitor de tela? | `toBeVisible()` vê como oculto? |
|---|---|---|---|---|
| `display: none` | não | não | não | **sim** |
| `visibility: hidden` | sim | não | não | **sim** |
| `opacity: 0` | sim | **sim** (!) | **sim** (!) | **não** |

O menu usa `visibility: hidden` (+ `pointerEvents: none`), que o jest-dom entende como
"invisível" — por isso `toBeVisible()` funciona lá. Já as pills usam `opacity` para poder
**animar o fade** com `transition`. E `opacity: 0` é especial: o elemento continua
ocupando espaço, clicável e anunciado por leitores de tela — só está *transparente*. Por
isso o jest-dom **não** o considera oculto, e `toBeVisible()` retornaria `true` mesmo com
`opacity: 0`. Como a intenção é justamente "a opacidade vai de 0 a 1 no fade", verificamos
o `opacity` diretamente — usar `toBeVisible()` aqui passaria sempre, sem testar nada.

> **Lição de a11y de brinde:** `opacity: 0` **não** esconde conteúdo de leitores de tela.
> Para esconder de verdade, use `display:none`/`visibility:hidden` ou o atributo `hidden`.

Sobre o `.parentElement!`: pegamos uma pill conhecida e subimos um nível até o `div` que
carrega o `opacity`. É um pequeno acoplamento à estrutura, mas deliberado e mínimo —
ancoramos numa âncora estável (o botão "Ver projetos", que existe por intenção) em vez de
num `data-testid` artificial. O `!` é o **non-null assertion** do TypeScript: garantimos
ao compilador que aquele pai existe (e existe, pois a pill está dentro do container).

---

## 8. Como rodar e o que observar

```bash
npm test
```

Os três testes novos do `Hero` passam junto com os demais (a suíte fica com 24 testes em
7 arquivos). `npm run build` confirma que o TypeScript strict aceita o arquivo (sem `any`).

Para entender de verdade, **quebre de propósito** e veja o teste te avisar:

- Troque `400` por `4000` no `setTimeout` do `Hero` → o teste do fade falha (as pills não
  apareceram em 400ms). É a intenção "aparecem logo após o load" sendo protegida.
- Faça `copyEmail` copiar o texto errado → `readText()` não bate com o e-mail.
- Remova o texto "Fale comigo" do botão → `getByRole(..., { name: /fale comigo/i })` não
  encontra nada — e isso *deveria* falhar: seria uma regressão de acessibilidade.

> Um teste em que você não sabe descrever "o que faria ele falhar" não protege de nada.
> Sempre saiba qual regressão cada teste captura.

---

## Resumo dos fundamentos (Aula 3)

| Conceito | Onde apareceu | Por que importa |
|---|---|---|
| Testar intenção, não implementação | as 3 asserções | o teste é contrato sobre o que o usuário percebe |
| Consulta por role + nome acessível | `getByRole(..., { name })` | resiliente a refatoração e detector de a11y |
| `userEvent` simula um humano | `await user.click` | confiança + lembrar do `await` |
| Fake timers | `advanceTimersByTime(400)` | tempo determinístico e rápido; sempre restaurar |
| `act()` | avanço manual do relógio | sincroniza atualizações antes de inspecionar o DOM |
| jsdom ≠ navegador | mock de `matchMedia` | mocke o que falta, com a forma correta |
| Trabalhar com a ferramenta | clipboard do `userEvent` | leia com `readText()` em vez de brigar pelo `navigator.clipboard` |
| `opacity: 0` ≠ escondido | `toBeVisible` vs. `opacity` | escolha a asserção conforme a técnica de CSS |
| Não duplicar cobertura | menu deixado como está | aponte o conflito e mire a lacuna real |
