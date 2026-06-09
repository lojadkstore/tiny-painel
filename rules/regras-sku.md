# Regras — SKU

Referência: SOUL.md, seção 5 (Etapa 4).

## Formato padrão

```
PRZ-[CODIGO_LIMPO]-[MARCA]
```

Com sufixos opcionais de posição/quantidade:

```
PRZ-[CODIGO_LIMPO]-[MARCA]-[DIANT|TRAS]-[LE|LD]-[PAR|UN]
```

## Regras

- Remover espaços.
- Remover barras desnecessárias.
- Manter letras e números importantes.
- Usar marca em caixa alta.
- Não usar acentos.
- **Não criar SKU duplicado** — sempre verificar no TinyERP antes.
- Lado esquerdo/direito: `LE` / `LD`.
- Dianteiro/traseiro: `DIANT` / `TRAS`.
- Par: `PAR`. Unidade: `UN`.

## Exemplos

```
PRZ-8W0698151AG-TEXTAR
PRZ-95835193910-BREMBO
PRZ-A1673237400-SACHS
PRZ-3358007-KYB
PRZ-3358007-KYB-DIANT-LE
PRZ-3358008-KYB-DIANT-LD
PRZ-3438005-KYB-TRAS-UN
```

## Registro

Todo SKU criado deve ser registrado em `logs/skus-criados.md`.
