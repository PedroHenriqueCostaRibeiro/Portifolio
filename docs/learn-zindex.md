# z-index via classes Tailwind — o que fizemos e por quê

> Um guia para entender os fundamentos por trás de tirar o `z-index` do `style`
> inline e colocá-lo em classes do Tailwind. Não é a lista de passos (essa está
> no plano) — é o **porquê** de cada decisão. Leia na ordem; cada seção monta em
> cima da anterior.
>
> Formato de cada seção: **o problema concreto → o mecanismo por trás → a decisão
> que tomamos neste projeto**.

---

## 0. O que fizemos, em uma frase

O portfólio tem um sistema de camadas explícito no `CLAUDE.md` — **fundo `z-0`,
conteúdo `z-1`, overlay `z-9`, navbar `z-10`** — mas o `z-index` estava escrito em
`style={{ zIndex: ... }}` inline, e o `Hero` ainda **misturava** os dois mundos
(`zIndex:1` inline + `z-10` em classe). Estendemos a escala do Tailwind com `z-1` e
`z-9`, e passamos todas as camadas para **classes**. Nada mudou na tela; o que mudou
é que o sistema de camadas agora se lê direto no `className`.

Antes e depois, no `Hero`:

```tsx
// Antes — duas coisas que são puras classes moravam no style inline
<section
  className="h-screen flex ... overflow-hidden"
  style={{ zIndex: 1, position: 'relative' }}
>

// Depois — style some; a section é descrita só por classes
<section className="relative z-1 h-screen flex ... overflow-hidden">
```

Parece cosmético. O valor está nos fundamentos abaixo.

---

## 1. O que o `z-index` realmente faz (e a pegadinha do `position`)

**O problema.** É comum achar que `z-index: 1` "coloca o elemento na frente". Você põe
o número e às vezes… nada acontece. Por quê?

**O mecanismo.** `z-index` **só tem efeito em elementos posicionados** — ou seja, com
`position` diferente de `static` (`relative`, `absolute`, `fixed` ou `sticky`). Num
elemento `static` (o padrão), o `z-index` é simplesmente **ignorado**. Ele controla a
ordem no **eixo Z** (profundidade, "quem fica na frente"), e esse eixo só existe para
coisas que saíram do fluxo estático.

É por isso que a nossa `section` do Hero precisava de **duas** propriedades juntas:

```tsx
className="relative z-1 ..."
//         ^^^^^^^^ sem 'relative', o 'z-1' não faria nada
```

O `relative` dá à `section` um `position` que ativa o `z-index`; o `z-1` então a
coloca na camada 1. Repare que a navbar e o overlay usam `fixed`, e o vídeo usa `fixed`
também — todos posicionados —, então neles o `z-index` funciona direto. O único que
precisava do `relative` explícito era o Hero.

**O que fizemos.** Trocamos `style={{ zIndex: 1, position: 'relative' }}` por
`className="relative z-1"`. As **duas** propriedades eram expressáveis como classe
Tailwind (`relative` e `z-1`), então o `style` inline deixou de ter razão de existir.

---

## 2. Contextos de empilhamento — o conceito que resolve tudo

Esta é a seção mais importante. Quase todo bug de `z-index` do mundo vem de não
entender **stacking context** (contexto de empilhamento).

**O problema.** Olhe as camadas do projeto: a navbar é `z-10`, e o `div` interno do
Hero **também** é `z-10` (`className="max-w-xl relative z-10"`). Dois `z-10`. Eles
brigam? O conteúdo do Hero pode passar por cima da navbar? A resposta é **não** — e o
motivo não é óbvio.

**O mecanismo.** Um **contexto de empilhamento** é como uma "caixa de profundidade
isolada". Dentro dela, os filhos disputam o eixo Z entre si. Mas a caixa **inteira**
disputa, como um bloco único, no contexto do **pai** dela. Números de `z-index` de
contextos diferentes **nunca** se comparam diretamente.

Uma analogia: pense em prédios numa rua. O apartamento 10 do Prédio A e o apartamento
10 do Prédio B têm o "mesmo número", mas não competem por altura — o que decide quem
está mais alto é a **altura dos prédios**, não o número do apartamento. O apartamento é
relativo ao seu prédio; o prédio é relativo à rua.

Um elemento cria um novo contexto de empilhamento quando tem `position` posicionado +
`z-index` diferente de `auto` (entre outras formas — `opacity < 1`, `transform`,
`filter` etc. também criam). No nosso caso:

- A `section` do Hero tem `relative` + `z-1` → **cria um contexto de empilhamento**.
  Ela é um "prédio" plantado na camada 1 da rua (o contexto raiz, o `<body>`).
- O `div` interno com `z-10` mora **dentro** desse prédio. Seu `z-10` só o compara com
  **irmãos dentro da section** — e não há nenhum. Esse `z-10` é, na prática, inerte
  hoje; ele nunca escapa para competir com a navbar.
- A **navbar** (`z-10`) e a **section** (`z-1`) são vizinhas no **mesmo** contexto raiz.
  Aí sim os números se comparam: `10 > 1`, então a navbar fica **sempre** na frente do
  Hero inteiro — não importa o que aconteça com o `z-10` lá dentro da section.

```
contexto raiz (<body>)
├─ BackgroundVideo   z-0   ← prédio mais baixo
├─ section (Hero)    z-1   ← prédio; cria seu próprio contexto interno
│    └─ div          z-10  ← apartamento DENTRO do prédio z-1; não escapa
├─ overlay mobile    z-9
└─ nav (Navbar)      z-10  ← prédio mais alto; vence a section inteira
```

**O que fizemos.** Deixamos o `z-10` interno do Hero **como estava** (mudança cirúrgica
— ele já era classe e não causa bug). Mas agora você entende por que ele e o `z-10` da
navbar coexistem em paz: vivem em contextos diferentes.

> **O mito que isso desfaz:** "z-index maior sempre fica na frente." Falso. Só vale
> dentro do **mesmo** contexto de empilhamento. Um `z-index: 9999` preso dentro de um
> pai com `z-index: 1` **jamais** passa por cima de um irmão desse pai com `z-index: 2`.

---

## 3. A escala como sistema de camadas nomeadas (0/1/9/10)

**O problema.** A forma mais comum (e mais triste) de mexer com z-index é a **corrida
armamentista**: um elemento fica escondido, você põe `z-index: 999`; semana que vem
outro some, você põe `9999`; depois `99999`. Ninguém sabe mais qual número significa o
quê, e o valor não tem relação com nenhuma intenção.

**O mecanismo.** z-index não precisa ser grande — precisa ser **ordenado**. Só importa
a ordem relativa entre elementos do mesmo contexto. `1 < 9 < 10` empilha exatamente
igual a `100 < 900 < 1000`. Números pequenos e espaçados de propósito viram um
**sistema legível**.

O `CLAUDE.md` do projeto define esse sistema:

| Camada | Valor | O que é |
|---|---|---|
| Fundo | `z-0` | vídeo de fundo fixo |
| Conteúdo | `z-1` | o Hero (e futuras seções) |
| Overlay | `z-9` | o menu mobile em tela cheia |
| Navbar | `z-10` | a barra fixa, sempre por cima |

Repare que há **folga proposital** entre `1` e `9`: se amanhã surgir um "conteúdo
destacado" que precise ficar acima do Hero mas abaixo do overlay, há espaço (`z-2`…`z-8`)
sem renumerar nada. É um sistema pensado para crescer.

**O que fizemos.** Em vez de espalhar `9999` aleatórios, mantivemos os quatro valores
nomeados do design system e os tornamos **classes de verdade** — o número passa a
carregar significado ("camada de conteúdo", não "número mágico grande o suficiente").

---

## 4. `theme.extend` vs `theme` no Tailwind (e por que `z-1`/`z-9` faltavam)

**O problema.** Por que o projeto usava inline no `z-1` e no `z-9`, mas o `div` interno
já conseguia usar a classe `z-10`? Porque `z-10` **existe** no Tailwind por padrão e
`z-1`/`z-9` **não existem**.

**O mecanismo.** O Tailwind vem com uma escala de z-index padrão:

```
z-0  z-10  z-20  z-30  z-40  z-50  z-auto
```

`z-0` e `z-10` (as camadas de fundo e navbar) já eram classes válidas de fábrica. Mas
`1` e `9` não estão nessa lista — então `z-1` e `z-9` simplesmente não geravam CSS
nenhum. Sem a classe, o jeito fácil foi cair no `style={{ zIndex: 1 }}` inline. A
**causa raiz** do problema todo era essa lacuna na escala.

A correção é ensinar a escala ao Tailwind, no `tailwind.config.js`:

```js
theme: {
  extend: {
    zIndex: {
      1: '1',
      9: '9',
    },
  },
},
```

O detalhe crucial é o `extend`. Existem dois lugares onde você pode declarar tema:

- **`theme.zIndex`** → **substitui** a escala inteira. Se escrevêssemos aqui, `z-0`,
  `z-10`, `z-20`… **sumiriam**, e a navbar (`z-10`) quebraria. Perigoso.
- **`theme.extend.zIndex`** → **soma** aos padrões. `z-0` e `z-10` continuam existindo;
  só **acrescentamos** `z-1` e `z-9`. Seguro e aditivo.

Como regra geral: use `extend` para **adicionar** ao design system do Tailwind, e o
`theme` puro só quando você quer deliberadamente **descartar** os padrões. Com o config
estendido, o `tailwind.config.js` vira a **fonte única** da escala de camadas do projeto.

> **Curiosidade de build:** o Tailwind só gera o CSS de uma classe que ele **vê** no seu
> código (é o "JIT", varrendo os arquivos de `content`). `z-1` e `z-9` agora existem na
> escala **e** são usados nos componentes — as duas condições necessárias para o CSS
> `.z-1 { z-index: 1 }` sair no bundle.

---

## 5. Classe utilitária vs. `style` inline — e quando o inline continua certo

**O problema.** O `CLAUDE.md` manda: *"Estilo via classes Tailwind. Use `style` inline
apenas para valores que o Tailwind não expressa."* Mas isso não é dogma cego — é uma
regra com um porquê, e com exceções conscientes.

**O mecanismo — por que classe é melhor por padrão:**

1. **Consistência via tokens.** `z-1` sempre significa a mesma camada em todo o projeto.
   Um `style={{ zIndex: 1 }}` é um valor solto que ninguém garante estar sincronizado com
   o sistema. A classe amarra o valor ao design system.
2. **Um só idioma.** Quando parte do estilo está em `className` e parte em `style`, você
   lê o componente em dois lugares. O `Hero` era o exemplo perfeito da dor: `zIndex:1` no
   `style` e `z-10` na classe — a mesma preocupação (camadas) partida em dois dialetos.
3. **Menos "números mágicos" espalhados.** Centralizar a escala no config significa que,
   para mudar todas as camadas, há **um** lugar — não um `grep` por `zIndex` em N arquivos.

**Mas — quando o inline é a escolha certa.** O próprio `CLAUDE.md` prevê a exceção:
valores que o Tailwind não expressa, em especial **valores dependentes de estado**. O
overlay do menu mobile é o caso didático:

```tsx
<div
  className="md:hidden fixed inset-0 ... z-9"   // ← estático → classe
  style={{
    opacity: menuOpen ? 1 : 0,                  // ← depende de menuOpen → inline
    visibility: menuOpen ? 'visible' : 'hidden',
    pointerEvents: menuOpen ? 'auto' : 'none',
  }}
>
```

O `z-9` é **fixo**: o overlay está *sempre* na camada 9. Vira classe. Já o `opacity`,
`visibility` e `pointerEvents` **mudam em tempo de execução** conforme o menu abre ou
fecha — o Tailwind não tem como expressar "1 se `menuOpen`, senão 0" sem lógica de JS.
Esses **continuam** no `style`, e isso está correto.

> **O critério, em uma frase:** valor **estático e conhecido em build** → classe; valor
> que **só existe em runtime** (depende de estado, de `clamp()`, de cálculo) → inline.
> A migração do z-index foi exatamente separar o estático (que estava indevidamente no
> inline) do dinâmico (que fica).

---

## 6. Como verificar que deu certo

**Type-check + build** — garante que `z-1`/`z-9` são classes válidas (o Tailwind as
gerou) e que nada de TypeScript quebrou:

```bash
npm run build
```

**A suíte de testes** — continua verde. Nenhum teste dependia de `style="z-index:…"`, e
como o resultado visual é idêntico, nada deveria mudar:

```bash
npm test
```

**No navegador** (`npm run dev`, `http://localhost:5173`) — confirme que **nada mudou**
na tela, que é justamente o objetivo de um refactor:

- o vídeo continua **atrás** de tudo (camada 0);
- o conteúdo do Hero fica **sobre** o vídeo (camada 1);
- a navbar fica **sobre** o conteúdo ao rolar (camada 10);
- abra o menu mobile (viewport estreita): o overlay cobre o conteúdo mas fica **sob** a
  navbar (`9 < 10`), e fecha normal.

E a prova definitiva do refactor, no DevTools: inspecione os elementos e veja o
`z-index` vindo de uma **classe** (`.z-0`, `.z-1`, `.z-9`, `.z-10`), sem nenhum
`style="z-index:…"` inline.

**Quebre de propósito** para sentir o sistema:

- Troque o `z-10` da navbar por `z-1` no `className` → a navbar passa a empilhar igual à
  section e o conteúdo do Hero pode cobri-la ao rolar. Prova que a ordem relativa no
  contexto raiz é o que manda.
- Remova o `relative` da section (deixando só `z-1`) → o `z-1` deixa de ter efeito (volta
  a §1: sem `position`, não há eixo Z). A section perde seu contexto de empilhamento.

> Um refactor que você não sabe como quebrar é um refactor que você não entende. Saber
> o que faria cada camada falhar é a prova de que o modelo mental está certo.

---

## Resumo dos fundamentos

| Conceito | Onde apareceu | Por que importa |
|---|---|---|
| `z-index` exige `position` posicionado | `relative z-1` na section | sem `position`, o número é ignorado |
| Contexto de empilhamento | `z-10` interno do Hero vs. `z-10` da navbar | números só competem dentro do mesmo contexto |
| Escala como camadas nomeadas | 0/1/9/10 | ordem legível > corrida do `z-9999` |
| `theme.extend` vs `theme` | `zIndex: { 1, 9 }` no config | `extend` soma; `theme` puro descarta os padrões |
| Classe vs. `style` inline | z-9 estático vs. opacity dinâmico | estático→classe, runtime→inline |
| Mudança cirúrgica | manter o `z-10` interno intacto | refatorar sem alterar comportamento |
