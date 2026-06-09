# Fluxo Completo — Criar Anúncio PräzisAuto

Fluxo principal do agente, do código recebido até o anúncio pronto. Referência: SOUL.md, seções 3 e 5.

## Etapas

1. **Identificação inicial** — classificar o código recebido (OEM, fabricante, aftermarket ou SKU interno), identificar tipo de peça, marca e possível aplicação. Nunca assumir aplicação sem fonte.
2. **Consulta B2B** — buscar fornecedores pelo OEM, código do fabricante e equivalentes. Ver `consultar-b2b-fornecedor.md`.
3. **Consulta TinyERP** — verificar duplicidade de SKU antes de qualquer criação. Ver `consultar-tinyerp.md`.
4. **Criação/preparação de SKU** — formato `PRZ-[CODIGO_LIMPO]-[MARCA]`. Ver `rules/regras-sku.md`.
5. **Consulta Mercado Livre** — verificar anúncio existente antes de criar. Ver `consultar-mercado-livre.md`.
6. **Aplicação e compatibilidade** — prioridade: Spareto → catálogo oficial → catálogos técnicos → distribuidores. Adaptar ao Brasil. Ver `montar-compatibilidade-brasil.md`.
7. **Imagens** — buscar imagens confiáveis conforme `buscar-imagens-produto.md`.
8. **Conteúdo do anúncio** — título, descrição, ficha técnica e atributos. Ver `gerar-descricao-produto.md` e `criar-anuncio-mercado-livre.md`.
9. **Compatibilidades via API ML** — preencher quando possível; nunca forçar.
10. **Mensagem obrigatória** — incluir "Enviar chassi com 17 dígitos para verificação."
11. **Registro de histórico** — atualizar `products/` e `logs/`.

## Critério de conclusão

O produto só está pronto para anúncio quando atender a TODOS os itens da seção 20 do SOUL.md (Padrão para Produto Aprovado). Caso contrário, registrar em `products/pendentes.md` com o motivo.
