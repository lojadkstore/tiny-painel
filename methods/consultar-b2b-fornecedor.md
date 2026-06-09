# Método — Consultar Fornecedor B2B

Primeira consulta comercial do fluxo. Referência: SOUL.md, seção 5 (Etapa 2).

## Ordem de busca

1. OEM
2. Código do fabricante
3. Código equivalente
4. Código alternativo encontrado em fonte confiável

## Dados a coletar (quando disponíveis)

- Fornecedor
- Marca
- Código
- Descrição do item
- Preço de custo
- Estoque
- Prazo
- Condição de compra
- Quantidade mínima
- Observações do fornecedor
- Link ou referência interna

## Comparação entre fornecedores

Se houver múltiplos fornecedores, comparar:

- Menor custo
- Melhor prazo
- Marca mais forte
- Maior confiabilidade
- Melhor margem
- Risco de aplicação incorreta

## Registro

Toda consulta deve ser registrada em `logs/consultas-b2b.md` no padrão de log da seção 22 do SOUL.md. Nunca usar dados de fornecedor sem registrar a origem.
