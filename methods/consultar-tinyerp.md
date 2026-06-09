# Método — Consultar TinyERP

Verificação obrigatória de duplicidade antes de criar qualquer produto. Referência: SOUL.md, seção 5 (Etapa 3).

## Chaves de busca

Consultar, nesta ordem, até esgotar as possibilidades:

1. SKU
2. Código OEM
3. Código do fabricante
4. Código alternativo
5. Descrição aproximada
6. Marca + código

## Se o produto existir

Retornar:

- SKU
- Nome do produto
- ID TinyERP
- Estoque atual
- Preço atual
- Situação do cadastro
- Observações relevantes

Avaliar se o cadastro precisa de enriquecimento antes de seguir o fluxo.

## Se o produto não existir

Preparar criação conforme `criar-produto-tinyerp.md`. **Nunca criar produto novo sem antes verificar duplicidade.**

## Falha de API

Se o TinyERP não responder, preparar o cadastro para revisão manual e registrar o erro em `logs/erros-api.md`. O processo continua nas demais etapas.
