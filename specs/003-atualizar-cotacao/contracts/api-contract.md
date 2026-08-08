# API Contract: Atualizar Cotacao

## POST /api/cotacao

Dispara a atualizacao assincrona de cotacoes, processando sequencialmente as linhas com link valido.

### Request

- Metodo: `POST`
- Body: nenhum (sem parametros de entrada)

### Responses

#### 200 OK — execucao concluida (com sucesso total ou parcial)

```json
{
  "status": "success",
  "message": "Cotacoes atualizadas com sucesso",
  "updatedCount": 39,
  "failedCount": 0,
  "skippedCount": 0,
  "failures": [],
  "startedAt": "2026-08-07T12:00:00.000Z",
  "finishedAt": "2026-08-07T12:00:45.000Z"
}
```

Exemplo de falha parcial:

```json
{
  "status": "partial",
  "message": "Cotacoes atualizadas com falhas parciais",
  "updatedCount": 35,
  "failedCount": 4,
  "skippedCount": 2,
  "failures": [
    { "id": "3-etf-xyz11", "tipo": "ETF", "papel": "XYZ11", "reason": "timeout" },
    { "id": "7-acao-abc3", "tipo": "Acao", "papel": "ABC3", "reason": "seletor_nao_encontrado" }
  ],
  "startedAt": "2026-08-07T12:00:00.000Z",
  "finishedAt": "2026-08-07T12:01:10.000Z"
}
```

#### 409 Conflict — bloqueado (ja existe atualizacao de cotacao ou de dados em execucao)

```json
{
  "status": "blocked",
  "message": "Atualizacao ja em andamento"
}
```

#### 500 Internal Server Error — falha inesperada nao tratada pela logica de falha por linha

```json
{
  "status": "failed",
  "message": "Falha ao executar atualizacao de cotacao"
}
```

### Regras de contrato

- FR-002: a chamada MUST iniciar a operacao assincrona no servidor; a resposta so e enviada apos a conclusao (sequencial) ou bloqueio imediato (409).
- FR-003 / FR-012: cada linha valida e processada uma de cada vez, com timeout individual de 10s e sem retry.
- FR-006 / FR-010: linhas com falha aparecem em `failures[]` e tem os 3 campos de cotacao zerados no JSON persistido.
- FR-008: uma nova chamada enquanto outra atualizacao de cotacao (ou de dados) estiver em execucao MUST retornar `409` com `status: "blocked"`, sem iniciar novo processamento.
- FR-013: linhas sem link valido sao contadas em `skippedCount` e nao aparecem em `failures[]`.

## GET /api/fundos (contrato existente, estendido)

Nenhuma mudanca de assinatura. O payload de cada registro em `records[]` passa a incluir os 6 novos campos de cotacao descritos em `data-model.md`, com valores `null`/`"not_collected"` ate a primeira execucao bem-sucedida de `POST /api/cotacao`.
