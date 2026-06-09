# Integração — TinyERP API

Documentação da integração com o TinyERP para consulta, criação e atualização de produtos.

## Status

⏳ **Pendente de configuração** — preencher credenciais e endpoints quando a integração for ativada.

## Configuração

| Item | Valor |
|---|---|
| Token de API | _(definir via variável de ambiente, nunca commitar)_ |
| Ambiente | _(produção/homologação)_ |
| Documentação oficial | https://tiny.com.br/api-docs |

## Operações usadas pelo agente

- **Consultar produto** — por SKU, OEM, código do fabricante, descrição aproximada (ver `methods/consultar-tinyerp.md`).
- **Criar produto** — somente após verificação de duplicidade (ver `methods/criar-produto-tinyerp.md`).
- **Atualizar produto** — somente registrando o impacto da alteração.
- **Consultar estoque e preço**.

## Regras

- Nunca criar produto sem verificar duplicidade.
- Sempre registrar o ID TinyERP retornado.
- Em falha de API: preparar cadastro para revisão manual e registrar em `logs/erros-api.md`; o fluxo continua nas demais etapas.
