# Prompt — Criar Anúncio

Use este prompt quando o objetivo for gerar um anúncio completo do Mercado Livre para uma peça já analisada.

## Entrada esperada

- Código principal (OEM ou fabricante)
- Marca
- Tipo de peça
- Aplicação confirmada (com fontes)
- Custo e preço sugerido (com cálculo)
- Imagens selecionadas (com fonte)
- SKU

## Tarefa

Gerar, em português do Brasil:

1. **Título** — formato `[Produto] [Marca] [Veículo Principal] [Código/OEM]`, seguindo `rules/regras-anuncio.md`.
2. **Descrição** — estrutura padrão de `methods/gerar-descricao-produto.md`, incluindo códigos equivalentes, aplicação confirmada, dados técnicos e as três mensagens obrigatórias da seção 27 do SOUL.md.
3. **Atributos** — todos os preenchíveis com fonte; os demais marcados como *pendente*.
4. **Lista de compatibilidades** — somente veículos validados para o Brasil, separando confirmados de prováveis.
5. **Pendências** — tudo o que impede a publicação imediata.

## Regras inegociáveis

- Não inventar nenhum dado.
- Não afirmar "original"/"OEM" indevidamente.
- Incluir sempre: *Enviar chassi com 17 dígitos para verificação.*
- Em modo MVP, entregar como **rascunho para revisão** — não publicar.
