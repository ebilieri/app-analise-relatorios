# US1 Performance Evidence

- Metrica alvo: carga inicial em ate 2s para ate 1.000 linhas.
- Instrumentacao: script scripts/perf-smoke.mjs (GET /api/fundos).
- Resultado esperado: latencia media de leitura do endpoint abaixo do alvo em ambiente de referencia.

## Execucao 2026-08-08

- GET /api/fundos: 1383.77 ms (dentro do alvo de tempo)
- Status HTTP: 500
- Observacao: endpoint respondeu com erro por validacao de colunas obrigatorias da planilha no ambiente local.
