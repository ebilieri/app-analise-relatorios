# Data Model: Atualizar Cotacao

## RegistroFundo (extensao de `FundRecord`)

Campos existentes (`lib/funds-schema.ts`) permanecem inalterados. Novos campos adicionados ao mesmo registro:

| Campo | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `quoteValorAtual` | `string \| null` | opcional (default `null`) | Texto normalizado do valor atual do ativo, capturado da pagina externa. `null` quando nunca coletado ou quando a ultima coleta falhou. |
| `quoteMin52Semanas` | `string \| null` | opcional (default `null`) | Texto normalizado do valor minimo em 52 semanas. `null` quando nunca coletado ou quando a ultima coleta falhou. |
| `quoteMax52Semanas` | `string \| null` | opcional (default `null`) | Texto normalizado do valor maximo em 52 semanas. `null` quando nunca coletado ou quando a ultima coleta falhou. |
| `quoteStatus` | `"not_collected" \| "updated" \| "failed"` | opcional (default `"not_collected"`) | Estado da ultima tentativa de coleta de cotacao para a linha. |
| `quoteUpdatedAt` | `string (ISO datetime) \| null` | opcional (default `null`) | Timestamp da ultima coleta bem-sucedida. `null` se nunca houve sucesso. |
| `quoteFailureReason` | `string \| null` | opcional (default `null`) | Motivo da ultima falha (ex.: `"timeout"`, `"seletor_nao_encontrado"`, `"erro_http"`). `null` quando `quoteStatus !== "failed"`. |

### Regras de validacao e transicao de estado

- Linhas com `linkStatus !== "valid"` MUST permanecer com `quoteStatus = "not_collected"` e os demais campos de cotacao em `null` (FR-013 - ignoradas silenciosamente).
- Ao processar uma linha com `linkStatus === "valid"`:
  - **Sucesso** (todos os seletores fallback resolveram os 3 campos dentro do timeout): `quoteStatus = "updated"`, os 3 campos de valor preenchidos, `quoteUpdatedAt = now`, `quoteFailureReason = null`.
  - **Falha** (timeout, erro HTTP, ou qualquer um dos 3 campos nao encontrado apos esgotar os seletores fallback): `quoteStatus = "failed"`, os 3 campos de valor zerados para `null`, `quoteFailureReason` preenchido com o motivo, `quoteUpdatedAt` preservado do valor anterior (nao apagar o timestamp do ultimo sucesso, apenas os valores) — ver FR-006/FR-010.
- O registro nunca deve ficar em estado parcial (ex.: 2 campos preenchidos e 1 nulo) apos uma tentativa: sucesso preenche os 3, falha zera os 3.

## CotacaoAtualizada (resultado transitorio por linha, interno ao scraper)

Estrutura interna usada por `lib/quote-scraper.ts` antes de aplicar o resultado ao registro persistido.

| Campo | Tipo | Descricao |
|---|---|---|
| `valorAtual` | `string \| null` | Valor extraido para o campo, ou `null` se nao encontrado. |
| `min52Semanas` | `string \| null` | Valor extraido para o campo, ou `null` se nao encontrado. |
| `max52Semanas` | `string \| null` | Valor extraido para o campo, ou `null` se nao encontrado. |
| `success` | `boolean` | `true` somente se os 3 campos foram encontrados dentro do timeout. |
| `failureReason` | `string \| null` | Motivo quando `success === false`. |

## ResultadoAtualizacaoCotacao (resumo da execucao, retornado pela API)

| Campo | Tipo | Descricao |
|---|---|---|
| `status` | `"success" \| "partial" \| "failed" \| "blocked"` | `success`: todas as linhas validas atualizadas; `partial`: pelo menos uma atualizada e pelo menos uma falhou; `failed`: nenhuma linha valida pode ser atualizada; `blocked`: ja existe uma atualizacao de cotacao (ou de dados) em execucao. |
| `message` | `string` | Mensagem amigavel para exibicao no `StatusBanner`. |
| `updatedCount` | `number` | Quantidade de linhas atualizadas com sucesso. |
| `failedCount` | `number` | Quantidade de linhas que falharam. |
| `skippedCount` | `number` | Quantidade de linhas ignoradas por nao possuirem link valido (FR-013). |
| `failures` | `Array<{ id: string; tipo: string; papel: string; reason: string }>` | Detalhe por linha com falha, para feedback e depuracao (FR-010). |
| `startedAt` | `string (ISO datetime)` | Inicio da execucao. |
| `finishedAt` | `string (ISO datetime)` | Termino da execucao. |

## Impacto no schema Zod (`lib/funds-schema.ts`)

`fundRecordSchema` MUST declarar explicitamente os 6 novos campos (ver tabela acima) para que sobrevivam ao `dbSchema.parse(...)` (modo padrao "strip" do Zod remove chaves nao declaradas). `dbSchema` (nivel raiz do arquivo) nao precisa de novos campos proprios; o resumo `ResultadoAtualizacaoCotacao` e retornado apenas pela resposta da API, nao persistido no arquivo JSON.

## Relacoes

```text
FundsDb (data/fundos-db.json)
└── records: FundRecord[] (estendido com campos de cotacao)

POST /api/cotacao
└── retorna ResultadoAtualizacaoCotacao (nao persistido, apenas resposta HTTP)
    └── failures[] referencia records por id/tipo/papel
```
