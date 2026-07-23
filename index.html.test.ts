import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Meta tags quebram em silêncio: o site continua carregando normalmente, mas o
// preview de compartilhamento e o resultado no Google apodrecem sem aviso.
// Estes testes guardam a intenção — que o portfólio se apresente corretamente
// para buscadores e redes sociais — lendo o HTML estático direto do disco.
const html = readFileSync(resolve(__dirname, 'index.html'), 'utf-8')

describe('index.html — apresentação para buscadores e redes', () => {
  it('expõe título, descrição e URL canônica para buscadores', () => {
    expect(html).toMatch(/<title>[^<]*Pedro Ribeiro[^<]*<\/title>/)
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]+"/)
    expect(html).toMatch(/<link\s+rel="canonical"\s+href="https?:\/\/[^"]+"/)
  })

  it('expõe um card de compartilhamento com imagem absoluta (Open Graph)', () => {
    expect(html).toContain('property="og:title"')
    expect(html).toContain('property="og:description"')
    // Crawler nenhum resolve caminho relativo: og:image tem que ser absoluta.
    expect(html).toMatch(/property="og:image"\s+content="https:\/\/[^"]+"/)
  })

  it('expõe um card do Twitter/X com imagem grande', () => {
    expect(html).toMatch(
      /name="twitter:card"\s+content="summary_large_image"/,
    )
    expect(html).toMatch(/name="twitter:image"\s+content="https:\/\/[^"]+"/)
  })

  it('declara um favicon próprio', () => {
    expect(html).toMatch(/<link\s+rel="icon"\s+href="\/favicon\.svg"/)
  })

  it('descreve a página como uma pessoa (JSON-LD schema.org)', () => {
    expect(html).toContain('"@type": "Person"')
    expect(html).toContain('"name": "Pedro Ribeiro"')
  })

  it('mantém o cargo consistente com o Hero (Software Engineer)', () => {
    // O título é a vitrine no Google; deve bater com o cargo usado no site.
    expect(html).toContain('Software Engineer')
    expect(html).not.toContain('Desenvolvedor Full-Stack')
  })
})
