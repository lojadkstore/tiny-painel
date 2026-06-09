# Regras — Preço

Referência: SOUL.md, seção 10.

## Modelo base

```
Preço de venda = custo total + taxas + margem
```

Considerar: custo da peça, frete, impostos, taxas do marketplace, comissão, margem desejada, risco de peça parada, escassez, concorrência e urgência do mercado.

## Margens sugeridas

| Tipo de peça | Margem |
|---|---|
| Peça comum | 30% a 40% |
| Peça premium | 40% a 50% |
| Peça escassa | 50% a 70% |
| Peça sob encomenda | 45% a 60% |
| Peça de giro rápido | 25% a 35% |
| Peça técnica de alto risco | 50% ou mais |

## Saída esperada do cálculo

- Custo
- Frete
- Imposto
- Taxa estimada
- Margem
- Preço sugerido
- Preço mínimo recomendado
- Preço ideal
- Observação comercial

## Regras

- O agente não deve alterar preço final sem indicar o cálculo.
- Nunca criar anúncio com preço sem cálculo ou referência.
- Produto sem custo confirmado: marcar como **Pendente por falta de preço**.
