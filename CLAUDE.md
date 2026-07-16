# CLAUDE.md

## Sobre o projeto

Portfólio pessoal de Pedro Ribeiro, evoluído da landing page "Mainframe". O design original da landing é a identidade visual do portfólio e deve ser preservado conforme o projeto cresce.

**Stack:** Vite, React 18, TypeScript (strict), Tailwind CSS 3. Nenhuma outra biblioteca de UI — não adicione component libraries, CSS-in-JS ou frameworks de animação.

## Design System

**Regra central: toda página, seção ou componente novo segue o visual existente.** Em caso de conflito entre um pedido e o design system, aponte o conflito antes de implementar.

- **Fontes:** **Inter** (open source, SIL OFL), auto-hospedada via `@fontsource-variable/inter` e importada em `src/main.tsx` — sem CDN de terceiros. As variáveis vivem em `src/index.css`: `var(--font-heading)` (Inter, peso 500 via `font-medium`) apenas para logo e títulos; `var(--font-body)` (Inter, peso 400) para todo o resto. Não introduza outras fontes.
- **Paleta:** preto sobre fundos claros. Hovers invertem as cores (branco↔preto) ou usam `opacity-60`. Não introduza cores de destaque sem discutir antes.
- **Elementos de identidade:** pílulas `rounded-full` com borda sutil (`border-black/10` ou `border-white`), tipografia grande e fluida com `clamp()`, efeitos de blur, vídeo de fundo fixo.
- **Animações:** discretas e curtas — fade/slide de 0.4s, `transition-colors` de 0.2s, cursor piscando via keyframe `blink`. Nada chamativo.
- **Camadas (z-index):** fundo/vídeo `z-0`, conteúdo `z-1`, overlays `z-9`, navbar `z-10`.
- **Responsividade:** mobile-first com os breakpoints `sm`/`md` do Tailwind.

## Regras de trabalho

### Pense antes de codar

- Declare suas presunções explicitamente antes de implementar.
- Se tiver dúvida sobre requisito, escopo ou design, pergunte em vez de adivinhar.
- Leia o código existente relevante antes de propor mudanças — o padrão que você precisa provavelmente já existe no projeto.

### Simplicidade primeiro

- Escreva o menor código possível que resolve o problema.
- Não adicione dependências sem necessidade comprovada; prefira o que React, TypeScript e Tailwind já oferecem.
- Não crie abstrações para uso único — extraia um hook ou componente apenas quando houver reuso real ou o arquivo ficar difícil de ler.

### Mudanças cirúrgicas

- Altere apenas o necessário para a tarefa em questão.
- Não reformate, renomeie ou reorganize código não relacionado no mesmo diff.
- Diffs pequenos e focados: uma tarefa, uma mudança coerente.

### Execução baseada em objetivos

- Entenda o objetivo por trás do pedido, não apenas a instrução literal.
- Se a instrução literal não atinge o objetivo declarado, aponte isso antes de executar.
- Ao terminar, verifique contra o objetivo ("o portfólio agora mostra X?") e não apenas contra a instrução ("o código compila").

### Testes que verificam intenção

- Teste o comportamento que o usuário percebe, não detalhes internos de implementação.
  - ✅ "revela o texto completo e marca done ao terminar"
  - ❌ "chama setState N vezes com os argumentos corretos"
- Nomes de teste descrevem a intenção em linguagem natural.
- Não teste implementação de bibliotecas (React, Tailwind) — teste o seu código.
- Referência viva: `src/hooks/useTypewriter.test.ts`.

## Padrões de código

- TypeScript strict, sem `any`. Props tipadas com `interface`.
- Componentes funcionais com hooks; um componente por arquivo.
- Hooks customizados em arquivos próprios (`src/hooks/`), retornando objetos com campos nomeados (ex.: `{ displayed, done }`).
- Estilo via classes Tailwind. Use `style` inline apenas para valores que o Tailwind não expressa (ex.: `clamp()`, animações condicionais dependentes de estado).
- Constantes em `UPPER_SNAKE_CASE` no topo do arquivo (ex.: `SENSITIVITY`, `NAV_LINKS`).
- Sem comentários óbvios — comente apenas restrições que o código não consegue mostrar.

## Padrões de pastas

```
src/
  components/   → componentes React (um por arquivo, PascalCase.tsx)
  hooks/        → hooks customizados (useNome.ts)
  test/         → setup de testes
  App.tsx       → composição das seções da página
  main.tsx      → entry point
  index.css     → Tailwind + variáveis CSS globais (--font-heading, --font-body, keyframes)
```

Testes são co-localizados: `Componente.test.tsx` / `useNome.test.ts` ao lado do arquivo testado.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server (Vite) na porta 5173 |
| `npm run build` | Type-check (`tsc -b`) + build de produção |
| `npm run preview` | Serve o build de produção localmente |
| `npm test` | Roda todos os testes uma vez (Vitest) |
| `npm run test:watch` | Testes em modo watch |
  