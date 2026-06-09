# Integração — Mercado Livre API

Documentação da integração com a API oficial do Mercado Livre para anúncios e compatibilidades.

## Status

⏳ **Pendente de configuração** — preencher credenciais OAuth quando a integração for ativada.

## Configuração

| Item | Valor |
|---|---|
| App ID / Client Secret | _(definir via variável de ambiente, nunca commitar)_ |
| Seller ID | _(definir)_ |
| Site | MLB (Mercado Livre Brasil) |
| Documentação oficial | https://developers.mercadolivre.com.br |

## Operações usadas pelo agente

- **Buscar anúncios** — por SKU, código, marca + código (ver `methods/consultar-mercado-livre.md`).
- **Identificar categoria e atributos obrigatórios** — `/categories`, `/categories/{id}/attributes`.
- **Criar/atualizar anúncio** — somente após verificação de duplicidade.
- **Compatibilidades** — validar se a categoria suporta compatibilidade e preencher veículos da base MLB (ver SOUL.md, seção 12).

## Regras

- Nunca criar anúncio duplicado.
- Nunca alterar anúncio ativo sem registrar.
- Não forçar preenchimento de compatibilidade quando a API não validar — retornar lista sugerida para revisão.
- Sempre registrar o ID do anúncio em `logs/anuncios-criados.md`.
- Incluir sempre nas observações: *Enviar chassi com 17 dígitos para verificação.*
