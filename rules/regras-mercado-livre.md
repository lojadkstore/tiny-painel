# Regras — Mercado Livre

Referência: SOUL.md, seções 5 (Etapa 5), 8.3, 11, 12 e 24.

## Antes de criar anúncio

- **Sempre** verificar anúncio existente por SKU, OEM, código do fabricante, marca + código e nome + veículo principal.
- Nunca criar anúncio duplicado.
- Se existir anúncio incompleto: sugerir atualização/enriquecimento em vez de criar novo.

## Como fonte de informação

- Mercado Livre **nunca** é fonte principal de compatibilidade.
- Pode ser usado apenas como referência comercial secundária: faixa de preço, títulos, nível de oferta, escassez, termos buscados.

## Compatibilidades via API

- Validar categoria e atributos obrigatórios.
- Validar veículos na base do Mercado Livre Brasil.
- Não forçar preenchimento quando a API não validar — retornar lista para revisão.
- Incluir sempre: *Enviar chassi com 17 dígitos para verificação.*

## Modo produção

- Nunca alterar anúncio ativo sem registrar.
- Nunca publicar com compatibilidade incerta sem aviso.
- Nunca publicar sem preço revisado.
- Sempre registrar o ID do anúncio em `logs/anuncios-criados.md`.
