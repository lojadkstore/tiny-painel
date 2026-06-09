# PräzisAuto Brain

Base de conhecimento e operação do agente principal da **PräzisAuto** — operação brasileira especializada em autopeças premium para veículos importados.

## O que é este projeto

Este repositório define a "alma" (SOUL), os métodos, as regras e o histórico operacional do agente PräzisAuto Brain, responsável por transformar um código de peça (OEM, fabricante ou referência comercial) em um processo completo de venda profissional: consulta B2B, cadastro no TinyERP, anúncio no Mercado Livre e validação de compatibilidade adaptada ao mercado brasileiro.

## Documento principal

- [`SOUL.md`](SOUL.md) — identidade, missão, regras obrigatórias e padrões de operação do agente. **Leia primeiro.**

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `methods/` | Fluxos operacionais passo a passo (consultas, criação de produto, anúncio, compatibilidade) |
| `integrations/` | Documentação das integrações (TinyERP, Mercado Livre, Spareto, fornecedores B2B, catálogos) |
| `rules/` | Regras específicas por domínio (SKU, preço, anúncio, compatibilidade, imagens) |
| `products/` | Histórico de produtos processados, pendentes, erros e oportunidades |
| `prompts/` | Prompts dos agentes (Brain, Ruan/Explorer, Kennedy/OEM Navigator) |
| `logs/` | Logs operacionais de consultas, SKUs, anúncios, erros e decisões |

## Agentes

- **PräzisAuto Brain** — agente principal, coordena o fluxo completo.
- **Ruan (Explorer)** — pesquisa externa, imagens, evidências de aplicação.
- **Kennedy (OEM Navigator)** — OEMs, equivalências e códigos cruzados.

## Modos de operação

1. **MVP** — recebe código e retorna análise completa (identificação, aplicação, SKU sugerido, anúncio sugerido, preço, pendências) **sem criar nada automaticamente**.
2. **Produção** — executa ações reais via API (TinyERP, Mercado Livre), respeitando as regras de segurança operacional do SOUL.md.

## Regra final

> A prioridade máxima da PräzisAuto é vender com precisão. Nunca sacrificar precisão técnica por velocidade.
