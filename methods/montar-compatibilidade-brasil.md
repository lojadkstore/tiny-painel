# Método — Montar Compatibilidade Brasil

Adaptação da aplicação global ao mercado brasileiro. Referência: SOUL.md, seções 6 e 7.

## Princípio

A PräzisAuto vende no Brasil. **Nunca copiar lista global de aplicação sem avaliar se os veículos existiram no Brasil.**

## Checklist por veículo da lista

- O modelo existiu oficialmente no Brasil?
- O ano do veículo faz sentido no Brasil?
- A motorização existiu no Brasil?
- A carroceria existiu no Brasil?
- Há diferença entre versão europeia, americana e brasileira?
- A peça pode variar por chassi, motorização, PR code, sistema de freio, pacote, suspensão ou ano/modelo?

## Validações específicas por tipo de peça

Ver SOUL.md, seção 7:

- **Freios** — eixo, diâmetro/espessura do disco, sistema de freio, pinça, sensor, código PR (VW/Audi/Porsche).
- **Suspensão** — eixo, lado, tipo de suspensão (convencional/eletrônica/pneumática/adaptativa), pacote, necessidade de par.
- **Motor** — motor, cilindrada, combustível, código do motor, equivalências OEM.
- **Câmbio** — tipo e código do câmbio, marchas, tração, chassi.
- **Arrefecimento** — motorização, ar-condicionado, tipo de câmbio, chassi.

## Resultado

Separar a lista final em:

- **Aplicação confirmada** (com fonte)
- **Aplicação provável** (pendente de validação por chassi)

Em qualquer dúvida, marcar: *Compatibilidade pendente de validação por chassi* e incluir a mensagem obrigatória:

> Enviar chassi com 17 dígitos para verificação.

Registrar validações em `logs/compatibilidades-validadas.md`.
