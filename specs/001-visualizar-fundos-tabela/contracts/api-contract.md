# API Contract - Visualizacao de Fundos da Planilha

## Overview
A aplicacao expoe duas interfaces HTTP internas para suportar leitura e atualizacao da base JSON.

## GET /api/fundos
- Purpose: Retornar dados atuais para renderizacao da tabela.
- Success (200):
```json
{
  "generatedAt": "2026-08-07T12:00:00.000Z",
  "rowCount": 123,
  "records": [
    {
      "id": "abc123",
      "tipo": "FII",
      "papel": "HGLG11",
      "linkDisplay": "Link",
      "linkUrl": "https://exemplo.com/hglg11",
      "linkStatus": "valid"
    },
    {
      "id": "def456",
      "tipo": "FII",
      "papel": "XPML11",
      "linkDisplay": "Link indisponivel",
      "linkUrl": null,
      "linkStatus": "invalid"
    }
  ]
}
```
- Failure (500): erro de leitura/carga do JSON.

## POST /api/refresh
- Purpose: Atualizar JSON a partir da planilha.
- Access: Aberto a qualquer visitante (sem autenticacao nesta versao).
- Concurrency rule: Se houver refresh em andamento, retornar bloqueio sem iniciar novo processo.
- Success (200):
```json
{
  "status": "success",
  "message": "JSON atualizado com sucesso",
  "rowCount": 123,
  "generatedAt": "2026-08-07T12:05:00.000Z"
}
```
- Blocked (409):
```json
{
  "status": "blocked",
  "message": "Atualizacao ja em andamento"
}
```
- Failure (500):
```json
{
  "status": "failed",
  "message": "Falha ao atualizar JSON a partir da planilha"
}
```

## UI Contract (Home)
- A tabela deve exibir apenas colunas: Tipo, Papel, Link.
- Quando linkStatus != "valid", exibir texto "Link indisponivel" sem hyperlink.
- A acao de atualizar dados deve apresentar feedback visivel de sucesso/falha/bloqueio.
