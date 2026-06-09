# Método — Criar Anúncio no Mercado Livre

Preparação e criação de anúncio com padrão profissional. Referência: SOUL.md, seções 11 e 12.

## Pré-requisitos

- Anúncio existente verificado (ver `consultar-mercado-livre.md`).
- Produto aprovado conforme seção 20 do SOUL.md.
- No modo MVP, o anúncio é gerado como **rascunho para revisão**.

## Título

Formato: `[Produto] [Marca] [Veículo Principal] [Código/OEM]`

Regras principais (ver `rules/regras-anuncio.md`):

- Não usar título genérico.
- Usar "Original" apenas para peça genuína; "OEM" apenas para código realmente original.
- Incluir principal aplicação quando confirmada.
- Priorizar termos buscáveis no Brasil.

## Descrição

Usar a estrutura padrão da seção 11.2 do SOUL.md (gerada por `gerar-descricao-produto.md`), incluindo sempre:

> Enviar chassi com 17 dígitos para verificação.

## Atributos

Preencher Marca, Número de peça, OEM, MPN, Modelo, Posição, Lado, Eixo, Material, Quantidade, Condição, Origem, Garantia e Compatibilidades. **Nunca preencher atributo com informação inventada** — marcar como pendente.

## Compatibilidades via API oficial

1. Identificar categoria correta e atributos obrigatórios.
2. Validar se a categoria suporta compatibilidade.
3. Montar e validar a lista de veículos na base do Mercado Livre Brasil.
4. Preencher posição conforme API oficial.
5. Inserir a observação obrigatória de chassi.

Se não for possível validar pela API: não forçar preenchimento; retornar lista sugerida para revisão e informar pendências.

## Pós-criação

Registrar em `logs/anuncios-criados.md` com o ID do anúncio (modo produção) e atualizar `products/processados.md`.
