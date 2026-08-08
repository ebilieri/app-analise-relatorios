# US4 Performance Evidence

- Metrica alvo: refresh manual em ate 5s para ate 1.000 linhas.
- Instrumentacao: script scripts/perf-smoke.mjs (POST /api/refresh).
- Resultado esperado: refresh concluido dentro do limite no ambiente de referencia.

## Execucao 2026-08-08

- POST /api/refresh: 361.33 ms (dentro do alvo de tempo)
- Status HTTP: 500
- Status da resposta: failed
- Observacao: refresh falhou no ambiente local devido validacao de entrada da planilha.
