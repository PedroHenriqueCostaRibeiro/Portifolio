# O componente `<Pill>` — o que fizemos e por quê

> Um guia para entender os fundamentos por trás da extração do componente `<Pill>`.
> Não é a lista de passos (essa está no plano) — é o **porquê** de cada decisão.
> Leia na ordem; cada seção monta em cima da anterior.
>
> Formato de cada seção: **o problema concreto → o mecanismo por trás → a decisão
> que tomamos neste projeto**.

---

## 0. O ponto de partida, em uma frase

No [`Hero.tsx`](../src/components/Hero.tsx) havia **duas** `className` longas quase
idênticas: uma nas 4 pills brancas, outra na pill outline do e-mail. As duas
descreviam o mesmo botão em formato de pílula — mudavam só as cores. Extraímos essa
forma comum para um único componente [`<Pill>`](../src/components/Pill.tsx), com uma
prop `variant` para escolher a cor. **Nada mudou na tela**; o que mudou é que agora
existe *uma* fonte da verdade para "como é uma pill neste site".

Tudo neste documento decorre disso.

---

## 1. O custo real da duplicação (não é digitar duas vezes)

**O problema.** Quando você olha duas `className` iguais, a reação intuitiva é "que
chato, repeti". Mas o custo de digitar duas vezes é trivial — some em segundos. O
custo verdadeiro chega **meses depois**.

**O mecanismo.** Duplicação não é um problema de *escrita*, é um problema de
*manutenção*. Imagine que daqui a três meses você decide que as pills devem ter o
canto um pouco menos redondo, ou um hover diferente. Com o código duplicado, você
precisa lembrar que a mudança mora em **dois** lugares. Você muda um, testa, fica
bom… e o outro silenciosamente fica para trás. Agora seus botões estão **inconsistentes**,
e ninguém percebe até um usuário reparar. Isso tem nome: os dois trechos "derivam"
(*drift*) um do outro com o tempo.

O princípio por trás é o **DRY** (*Don't Repeat Yourself*), mas com uma nuance que
quase todo mundo erra: DRY é sobre não duplicar **conhecimento**, não sobre não
duplicar **texto**. "Como é uma pill neste projeto" é um pedaço de conhecimento. Ele
deve existir em um lugar só. Quando esse conhecimento vive em dois lugares, você não
tem duas cópias — você tem duas chances de discordarem.

**O que fizemos.** Movemos a definição de "como é uma pill" para o `Pill.tsx`. Agora
mudar o formato das pills é mudar **uma** constante, e as 5 pills mudam juntas, por
construção. É impossível elas divergirem.

---

## 2. Quando extrair — e quando NÃO extrair

**O problema.** Se duplicação é ruim, por que não transformar *tudo* em componente?
Porque abstrair cedo demais é tão custoso quanto duplicar — só que o custo aparece de
outro jeito.

**O mecanismo.** O `CLAUDE.md` deste projeto tem uma regra explícita:

> Não crie abstrações para uso único — extraia um hook ou componente apenas quando
> houver reuso real ou o arquivo ficar difícil de ler.

A razão: cada abstração tem um **preço fixo**. Ela cria um arquivo novo, um nome novo
para lembrar, uma indireção ("cadê a classe da pill? ah, tenho que abrir *outro*
arquivo"). Para *um único uso*, esse preço não se paga — você adicionou cerimônia sem
ganhar nada. Existe até um contraprincípio famoso para conter o exagero de DRY: **WET**
/ a "regra de três" — só extraia quando algo aparece pela terceira vez, porque aí o
padrão já se provou estável e o reuso é real.

Como este caso se encaixa:

| Situação | Extrair? |
|---|---|
| 1 botão, 1 aparência | ❌ Não. É abstração para uso único; o preço não se paga. |
| **5 botões, 2 variantes** (o nosso caso) | ✅ Sim. Reuso real e comprovado, e a variação (cor) é pequena e clara. |

Repare no número: **5 usos**. Não estamos adivinhando que talvez um dia haja reuso —
o reuso já *existe*, na sua frente, hoje. Isso é o oposto de especular.

**O que fizemos.** Extraímos porque o gatilho da regra foi atingido de sobra. Se
fosse um botão só, teríamos deixado o `<button>` inline — e estaria certo.

---

## 3. Composição via `children` (por que não um prop `label`)

**O problema.** A forma "óbvia" de fazer o Pill receber seu texto seria um prop:
`<Pill label="Ver projetos" />`. Funciona para as 4 pills simples. Mas a pill do
e-mail não tem só texto — ela tem **texto + um ícone de copiar** (`<CopyIcon/>`), e
parte do texto é sublinhada. Um prop `label: string` não consegue expressar isso.

**O mecanismo.** React tem um mecanismo embutido para "conteúdo que vai dentro":
`children`. Quando você escreve `<Pill>qualquer coisa aqui</Pill>`, esse "qualquer
coisa" — texto, outros elementos, uma mistura — chega ao componente como a prop
`children`. O componente só precisa renderizá-la, **sem saber o que é**.

Isso se chama **composição**, e é o coração do modelo do React. A diferença de
mentalidade:

- **Configuração** (`label="..."`): o componente pai preenche campos que o filho
  definiu. O filho dita o formato. Rígido.
- **Composição** (`children`): o pai entrega conteúdo arbitrário; o filho só fornece a
  *moldura*. Flexível.

O Pill é uma **moldura** (a pílula: borda, cor, padding, hover). O que vai *dentro* é
problema de quem usa. Por isso a mesma `<Pill>` serve tanto para um texto seco
(`<Pill>Sobre mim</Pill>`) quanto para o combo texto+ícone do e-mail — o componente
não precisou de nenhum código especial para o segundo caso.

**O que fizemos.** `Pill` recebe `children` e renderiza dentro do `<button>`. As pills
de texto passam uma string; a de e-mail passa um `<span>` mais o `<CopyIcon/>`. Um
componente, dois formatos de conteúdo, zero ramificação interna.

---

## 4. `variant`: o enum de string que sustenta design systems inteiros

**O problema.** As pills têm duas aparências: fundo branco (solid) e contorno
transparente (outline). Como o componente escolhe entre as duas? A tentação é um
booleano: `<Pill outline />`. Funciona para dois casos. Mas e quando aparecer uma
terceira aparência? `<Pill outline ghost />`? Dois booleanos criam **quatro**
combinações, sendo duas sem sentido (`outline` *e* `ghost` ao mesmo tempo?).

**O mecanismo.** O padrão profissional é uma **prop `variant` do tipo união de
strings**:

```tsx
type PillVariant = 'solid' | 'outline'
```

Uma união de strings diz ao TypeScript: "só estes valores existem". Se você escrever
`<Pill variant="slid">` (typo), o compilador **reclama antes de rodar**. E variantes
são mutuamente exclusivas por natureza — é impossível pedir duas ao mesmo tempo, ao
contrário dos booleanos. É exatamente assim que bibliotecas de UI de verdade
(Material UI, Chakra, shadcn) modelam botões.

E como o `variant` vira classe? Com um **objeto de lookup**:

```tsx
const VARIANTS: Record<PillVariant, string> = {
  solid: 'bg-white text-black border-black/10 hover:bg-black hover:text-white',
  outline: 'bg-transparent text-white border-white hover:bg-white hover:text-black',
}
```

Compare com a alternativa de `if/else` ou ternário:

```tsx
// evitado:
const cor = variant === 'solid' ? 'bg-white text-black ...' : 'bg-transparent ...'
```

O objeto ganha em três frentes: (1) `Record<PillVariant, string>` **obriga** você a
ter uma entrada para *cada* variante — esqueceu de definir a `outline`? Erro de
compilação. (2) Adicionar uma variante nova é adicionar **uma linha** ao objeto, sem
tocar na lógica de render. (3) Lê-se como uma tabela: "solid é isto, outline é aquilo",
sem cadeia de condicionais para desembaraçar.

**O que fizemos.** `variant?: 'solid' | 'outline'`, com default `'solid'` (as 4 pills
comuns nem precisam escrever a prop — `<Pill>` já é solid). A cor sai de um
`Record<PillVariant, string>`. Uma 3ª variante amanhã = uma linha nova.

---

## 5. Herdar as props nativas do `<button>` com `ComponentPropsWithoutRef`

**O problema.** Um `<button>` de verdade aceita dezenas de props: `onClick`,
`disabled`, `aria-label`, `title`, `autoFocus`, `type`… Se o `<Pill>` só declarasse
`variant` e `children`, você perderia todas essas. Precisaria da pill do e-mail com
`onClick`? Teria que declarar `onClick` na mão. E `disabled`? Declarar também. Um por
um, reinventando a interface do botão.

**O mecanismo.** O TypeScript, junto com os tipos do React, oferece um atalho:

```tsx
interface PillProps extends ComponentPropsWithoutRef<'button'> {
  variant?: PillVariant
}
```

`ComponentPropsWithoutRef<'button'>` significa, em português: "**todas** as props que
um `<button>` de verdade aceita". Ao `extends`-er esse tipo, o `PillProps` herda
`onClick`, `disabled`, `type`, `aria-*`, `className`, `children` — tudo — de graça, e
tipado corretamente. Só acrescentamos o que é *nosso*: `variant`.

E como essas props herdadas chegam ao `<button>` lá dentro? Com **rest + spread**:

```tsx
function Pill({ variant = 'solid', className, type = 'button', children, ...rest }) {
  return <button type={type} className={...} {...rest}>{children}</button>
}
```

O `...rest` recolhe "todas as outras props que eu não desestruturei" e o `{...rest}`
as despeja no `<button>`. Então `<Pill onClick={copyEmail} disabled aria-busy>` só
funciona — o `onClick`, o `disabled` e o `aria-busy` fluem por `...rest` até o botão
nativo, sem uma linha de código dedicada a cada um.

**Por que desestruturar `type` e `className` separadamente**, em vez de deixá-los no
`...rest`? Porque nós temos um plano para eles. O `type` queremos com **default
`'button'`** (veja a §7). O `className` queremos **mesclar** com as nossas classes
base, não deixar o consumidor sobrescrever tudo (veja a §6). Ao puxá-los para fora do
`rest`, controlamos o destino deles; o resto das props passa direto, intocado. (E
`(WithoutRef)` porque um `ref` não é uma prop comum — encaminhar `ref` exige
`forwardRef`, que não precisamos aqui.)

**O que fizemos.** `PillProps extends ComponentPropsWithoutRef<'button'>` + `...rest`
no `<button>`. O Pill *é* um botão para todos os efeitos, ganhando toda a API nativa
sem manutenção.

---

## 6. Mesclar o `className` (o princípio "aberto para extensão")

**O problema.** A pill outline precisa de uma classe a mais que as solid **não**
precisam: `gap-2 sm:gap-3`, o espaçamento entre o texto e o `<CopyIcon/>`. Onde
colocar isso? Três opções ruins e uma boa.

**O mecanismo.** As opções:

1. **Jogar `gap` na base**, aplicada a todas as pills. Funciona (numa flex com um
   filho só, `gap` não faz efeito visual), mas suja a base com uma classe que só uma
   pill usa. A base deixa de descrever "a pill genérica".
2. **Criar uma 3ª variante** só para a outline-com-ícone. Exagero: variante é sobre
   *cor/estilo*, não sobre um detalhe de espaçamento de um caso único.
3. **Deixar o consumidor sobrescrever a `className` inteira.** Aí ele teria que
   recopiar todas as classes base — voltamos à duplicação que viemos eliminar.
4. ✅ **Aceitar um `className` extra e concatenar** com o nosso.

A opção 4 segue o **Princípio Aberto/Fechado**: o componente é *fechado* para
modificação (você não edita o `Pill.tsx` para cada caso especial) mas *aberto* para
extensão (quem usa pode adicionar classes pontuais). A implementação:

```tsx
className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`.trim()}
```

Lê-se: primeiro as classes base (a forma da pill), depois as da variante (a cor),
depois **as que o consumidor mandou** (`className ?? ''` — se ninguém mandou nada, vira
string vazia). O `.trim()` remove o espaço sobrando quando não há `className` extra.

Assim a base permanece pura ("toda pill é assim"), e o `gap` fica onde pertence: **na
única chamada que precisa dele**, no `Hero.tsx`:

```tsx
<Pill variant="outline" onClick={copyEmail} className="gap-2 sm:gap-3">
```

**O que fizemos.** `className` é desestruturado das props e concatenado depois da base
e da variante. A base descreve a pill genérica; o detalhe do ícone mora na chamada que
o usa. Extensível sem ser bagunçado.

---

## 7. Um detalhe fácil de esquecer: `type="button"`

**O problema.** Por padrão, um `<button>` dentro de um `<form>` tem
`type="submit"`. Se um dia qualquer uma dessas pills for parar dentro de um formulário
(uma futura seção de contato, por exemplo), clicar nela **enviaria o formulário** sem
querer — um bug traiçoeiro, porque o botão "parece" só um botão.

**O mecanismo.** O default do HTML para `<button>` é `submit`. A defesa é sempre
declarar `type="button"` em botões que não são de envio. Fazemos isso **uma vez**, no
Pill, com default:

```tsx
function Pill({ type = 'button', ... }) {
  return <button type={type} ...>
}
```

Como é um *default* (não um valor fixo), uma pill que *precise* enviar um form ainda
pode passar `<Pill type="submit">` — o consumidor manda, e por `type={type}` ele vence
o default. Melhor dos dois mundos: seguro por padrão, flexível quando preciso.

**O que fizemos.** `type = 'button'` como default no Pill. Antes, cada `<button>` no
Hero repetia `type="button"` na mão; agora é uma garantia central, impossível de
esquecer numa pill nova.

---

## 8. Testar intenção, não classes

**O problema.** Como testar um componente que é basicamente "um botão com umas
classes"? A tentação é verificar as classes: `expect(button).toHaveClass('bg-white')`.
Resista.

**O mecanismo.** O `CLAUDE.md` é direto:

> Teste o comportamento que o usuário percebe, não detalhes internos de implementação.

Um usuário nunca "percebe" a classe `bg-white` — ele percebe um botão que ele lê,
clica, e que responde. Se amanhã trocarmos `bg-white` por outra forma de deixar o
fundo branco, o *comportamento* é o mesmo, mas um teste que checa `bg-white`
**quebraria** sem nenhum bug real. Isso é um teste frágil: dá alarme falso e treina
você a ignorá-lo.

Então [`Pill.test.tsx`](../src/components/Pill.test.tsx) verifica três comportamentos
observáveis:

1. **renderiza o conteúdo como um `button`** — usando `getByRole('button', { name })`,
   que é como um leitor de tela (e um usuário) encontra o botão;
2. **dispara o `onClick` ao ser clicado** — prova que props de botão realmente fluem
   pelo `...rest` (§5); testa o *contrato*, não o mecanismo;
3. **usa `type="button"` por padrão** — protege a decisão de segurança da §7 contra
   uma regressão futura.

Nenhum deles menciona Tailwind. Se a implementação interna mudar mas o comportamento
continuar, os testes continuam verdes — que é exatamente o que um bom teste deve fazer.

**O que fizemos.** Três testes de comportamento, no mesmo estilo do
[`Navbar.test.tsx`](../src/components/Navbar.test.tsx) (que checa `aria-expanded`, não
classes de CSS). Verde = "a pill se comporta como um botão", não "a pill tem a string
X".

---

## 9. Como verificar de verdade

O critério de sucesso desta mudança é peculiar: **o usuário não deve notar diferença
nenhuma**. Refatoração boa é invisível. Então "verificar" é provar que *nada* mudou na
tela, e que a duplicação sumiu por baixo.

- `npm run build` — o `tsc -b` confirma que os tipos do Pill e do Hero batem, sem
  `any`. Passou.
- `npm test` — os 3 testes novos do Pill passam e os 18 antigos continuam verdes (21
  no total). Passou.
- **Comparação de classes renderizadas** — abrimos o site rodando e conferimos que a
  `className` final de uma pill solid e da pill outline contêm **exatamente** as mesmas
  classes de antes (a ordem muda, mas no Tailwind ordem não importa), com o
  `gap-2 sm:gap-3` presente **só** na outline. Bateu.
- Visualmente: as 4 pills brancas e a outline do e-mail continuam idênticas; o hover
  ainda inverte as cores; clicar no e-mail ainda copia e mostra "Copiado!".

Por que essa comparação de classes é o teste mais honesto aqui: numa refatoração de
estilo, o risco número um é uma classe cair no caminho (um `hover:` esquecido, um
`px-` trocado). Comparar a saída final classe a classe pega isso na hora.

---

## 10. Checklist de manutenção

Sempre que mexer nas pills, lembre de onde as coisas moram agora:

- **Mudar o formato de *todas* as pills** (raio, padding, transição)? Edite a constante
  `BASE` em [`Pill.tsx`](../src/components/Pill.tsx) — muda as 5 de uma vez.
- **Mudar a cor de uma variante**? Edite a entrada dela em `VARIANTS`. Não toque no
  Hero.
- **Precisa de uma 3ª aparência** (ex.: `ghost`)? Adicione `'ghost'` ao tipo
  `PillVariant` e uma linha ao `VARIANTS`. O `Record` **obriga** você a definir a cor,
  senão o build falha — rede de segurança automática.
- **Um detalhe pontual em uma pill só** (como o `gap` da outline)? Passe via
  `className` na chamada, no Hero — não invente uma variante para isso.
- **Botão de pill dentro de um `<form>` que deve enviar**? Passe `type="submit"`
  explicitamente; o default seguro é `'button'`.
- **Rode `npm test`** depois de mexer no Pill — os testes avisam se o comportamento de
  botão regrediu.

---

### TL;DR

Duas `className` gigantes e quase iguais viraram um `<Pill variant="solid|outline">`.
Extraímos porque havia **reuso real** (5 botões, 2 variantes) — não fosse isso, a
regra "nada de abstração para uso único" mandaria deixar inline. O conteúdo entra por
`children` (composição, não um prop `label`), a cor por uma prop `variant` de união de
strings resolvida num `Record`, e todas as props nativas do botão fluem por
`ComponentPropsWithoutRef<'button'>` + `...rest`. A base fica pura; detalhes pontuais
(o `gap` da outline) entram por um `className` mesclado. Testamos **comportamento**
(clica, renderiza, `type=button`), nunca as classes Tailwind. Resultado: zero mudança
visual, uma fonte da verdade só, impossível as pills divergirem.
