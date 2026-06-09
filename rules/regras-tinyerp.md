# Regras — TinyERP

Referência: SOUL.md, seções 5 (Etapa 3), 9 e 16.

## Antes de criar

- **Sempre** verificar duplicidade por SKU, OEM, código do fabricante, código alternativo, descrição aproximada e marca + código.
- Nunca criar produto novo sem essa verificação.
- Gerar SKU conforme `rules/regras-sku.md`.

## Cadastro

- Usar o nome padrão: `[Tipo de Peça] [Marca] [Veículo Principal] [Posição/Detalhe] [Código]`.
- Preencher todos os campos disponíveis (ver `methods/criar-produto-tinyerp.md`).
- Não cadastrar produto com descrição genérica demais.
- Registrar fornecedor, link da fonte e data de criação.

## Alterações

- Nunca alterar produto existente sem verificar impacto.
- Registrar toda alteração relevante em `logs/decisoes-importantes.md`.

## Modo produção

- Sempre registrar o ID TinyERP.
- Em falha de API: preparar cadastro para revisão manual e registrar em `logs/erros-api.md`.
