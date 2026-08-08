# Quickstart: Atualizar Cotacao

## Pre-requisitos

- Node.js 20 LTS instalado.
- Dependencias instaladas: `npm install` (inclui a nova dependencia `cheerio`).
- Acesso a internet para que o webscrapper consiga acessar as paginas do statusinvest.

## Executando localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Validacao manual do fluxo principal

1. Com a tabela carregada, clique no botao **Atualizar cotacao** (ao lado de **Atualizar dados**).
2. Observe o estado de carregamento no botao enquanto a operacao roda (processamento sequencial pode levar alguns segundos, dependendo do numero de linhas com link valido).
3. Ao concluir, verifique a mensagem de resultado (`StatusBanner`):
   - Sucesso total: mensagem de sucesso, sem falhas.
   - Sucesso parcial: mensagem indicando quantidade de falhas.
4. Verifique que as colunas **Valor Atual**, **Min. 52 Semanas** e **Max. 52 Semanas** aparecem na tabela com valores preenchidos para as linhas processadas com sucesso.
5. Abra `data/fundos-db.json` e confirme que os registros processados contem `quoteValorAtual`, `quoteMin52Semanas`, `quoteMax52Semanas`, `quoteStatus: "updated"` e `quoteUpdatedAt` preenchidos.

## Validacao de bloqueio de concorrencia (FR-008)

1. Clique em **Atualizar cotacao**.
2. Enquanto a operacao ainda estiver em execucao, clique novamente em **Atualizar cotacao** (ou em **Atualizar dados**).
3. Confirme que a segunda chamada retorna HTTP 409 e a UI exibe mensagem informando que ja existe uma atualizacao em andamento, sem iniciar um segundo processamento.

## Validacao de falha por linha (FR-006, FR-010, FR-013)

1. Simule uma falha (ex.: usando um teste de integracao com `fetch` mockado para retornar erro/timeout para um link especifico, ou temporariamente apontando uma linha para uma URL invalida acessivel mas sem os elementos esperados).
2. Execute **Atualizar cotacao**.
3. Confirme que:
   - A linha com falha fica com os 3 campos de cotacao `null` e `quoteStatus: "failed"` no JSON.
   - A linha aparece no resumo de falhas retornado pela API (`failures[]`).
   - Linhas sem link valido (`linkStatus !== "valid"`) permanecem com `quoteStatus: "not_collected"` e nao aparecem em `failures[]`.

## Validacao de timeout (FR-012)

1. Em teste de integracao, mockar `fetch` para nunca resolver (ou resolver apos >10s) para uma URL especifica.
2. Confirmar que a requisicao e abortada em ~10s, a linha e tratada como falha (`quoteFailureReason: "timeout"`), e nenhuma nova tentativa automatica e feita para essa linha na mesma execucao.

## Testes automatizados

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

Os testes unitarios/integracao devem mockar chamadas de rede (`fetch`) — nenhum teste automatizado deve depender de acesso real ao statusinvest.
