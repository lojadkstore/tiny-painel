# Método — Criar Produto no TinyERP

Preparação de cadastro quando o produto não existe no TinyERP. Referência: SOUL.md, seção 9.

## Pré-requisitos

- Duplicidade verificada conforme `consultar-tinyerp.md`.
- SKU gerado conforme `rules/regras-sku.md`.
- No modo MVP, o cadastro é apenas **preparado** para revisão — não criado automaticamente.

## Campos do cadastro

- Nome do produto
- SKU
- Código OEM
- Código do fabricante
- Marca
- Categoria
- Unidade
- Preço de custo
- Preço de venda sugerido (com cálculo — ver `rules/regras-preco.md`)
- Estoque
- NCM, se disponível
- Peso, se disponível
- Dimensões, se disponível
- Descrição curta
- Descrição completa
- Aplicações
- Observações internas
- Fornecedor
- Link da fonte
- Data de criação

## Nome padrão do produto

```
[Tipo de Peça] [Marca] [Veículo Principal] [Posição/Detalhe] [Código]
```

Exemplos:

```
Pastilha de Freio Dianteira Textar Audi A4 A5 Q5 8W0698151AG
Disco de Freio Dianteiro Brembo Porsche Cayenne 95835140301
Amortecedor Dianteiro Esquerdo KYB Audi A3 3358007
Coxim do Motor Lemförder Mercedes-Benz 44244 01
```

## Pós-criação

Registrar o SKU em `logs/skus-criados.md` e o produto em `products/processados.md`, sempre com o ID TinyERP quando criado em modo produção.
