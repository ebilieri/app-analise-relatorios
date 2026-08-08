# Implementation Plan: Atualizar Cotacao

**Branch**: `003-atualizar-cotacao` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-atualizar-cotacao/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Adicionar um botao `Atualizar cotacao` que dispara um webscrapper assincrono, processando sequencialmente cada linha com link valido (statusinvest), extraindo `Valor Atual`, `Min. 52 Semanas` e `Max. 52 Semanas` via listas de seletores CSS com fallback, com timeout de 10s por requisicao (sem retry), zerando os campos e registrando a falha quando uma linha nao puder ser atualizada, e persistindo o resultado no JSON existente (`data/fundos-db.json`) reaproveitando a infraestrutura de `lib/json-store.ts` e `lib/funds-service.ts`. As tres novas colunas passam a ser exibidas na tabela existente.

## Technical Context

**Language/Version**: TypeScript 5.6.x on Node.js 20 LTS  
**Primary Dependencies**: Next.js 15 (App Router), React 18, `cheerio` (novo - parsing HTML via seletores CSS), `fetch` nativo do Node com `AbortController` para timeout, reaproveitamento de `lib/json-store.ts`, `lib/funds-schema.ts` e `lib/funds-service.ts`  
**Storage**: Arquivo JSON `data/fundos-db.json` (schema estendido com campos de cotacao por registro)  
**Testing**: Vitest + Testing Library (unit/integration com `fetch` mockado) e Playwright (E2E)  
**Target Platform**: Web (desktop e mobile)  
**Project Type**: Aplicacao web full-stack com nova rota de API e extensao incremental de UI/dados  
**Performance Goals**: Processamento sequencial (1 link por vez); timeout individual de 10s por requisicao; budget maximo de execucao: ≤ 420 segundos (~7 minutos) para ate 42 linhas com link valido (42 × 10s worst case + overhead), medido via `finishedAt − startedAt` retornado pela API; UI MUST permanecer responsiva durante a execucao (operacao assincrona, sem bloquear a thread principal)  
**Constraints**: Timeout de 10s por requisicao sem retry automatico (FR-012); processamento sequencial, um link por vez (FR-003); falha por linha MUST zerar os 3 campos de cotacao e ser registrada separadamente (FR-006, FR-010); linhas sem link valido MUST ser ignoradas silenciosamente (FR-013); apenas uma atualizacao de cotacao por vez (FR-008); escrita no JSON MUST ser mutuamente exclusiva com a atualizacao de dados existente (`Atualizar dados`) para evitar corrupcao por escrita concorrente no mesmo arquivo  
**Scale/Scope**: ~39 registros atualmente (planilha `fundos-para-analise.xlsx`); mudanca concentrada em novo modulo de scraping, extensao de schema/serviço existente, nova rota de API e extensao da tabela/pagina atual

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code Quality Gate: PASS. Novo modulo de scraping e extensao de schema MUST passar `typecheck`, `lint` e revisao estatica sem bloqueadores; seletores fallback isolados em modulo de configuracao para reduzir complexidade ciclomatica no parser.
- Testing Gate: PASS. Cobertura minima: unit (parsing por seletor fallback, normalizacao, schema estendido), integration (orquestracao sequencial com `fetch` mockado, lock, falha parcial, persistencia), E2E (fluxo do botao `Atualizar cotacao` e exibicao das novas colunas).
- UX Consistency Gate: PASS. Novo botao reutiliza estilo do botao `Atualizar dados`; estados de carregamento, bloqueio (409) e feedback de sucesso/falha parcial seguem o padrao existente (`StatusBanner`).
- Performance Gate: PASS. Metas mensuraveis definidas: timeout de 10s por linha, processamento sequencial, budget maximo de ≤ 420s para 42 linhas com link valido, operacao assincrona sem bloquear a UI; validado via `finishedAt − startedAt` retornado pela API e teste manual documentado em `quickstart.md`.
- Evidence Gate: PASS. PR MUST anexar resultados de testes (unit/integration/E2E), evidencia do JSON atualizado com os novos campos e verificacao visual das novas colunas.

## Project Structure

### Documentation (this feature)

```text
specs/003-atualizar-cotacao/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                     # adiciona botao "Atualizar cotacao" e estado de resumo
└── api/
    └── cotacao/
        └── route.ts              # novo endpoint POST que dispara a atualizacao de cotacao

components/
└── fundos-table.tsx              # adiciona colunas Valor Atual, Min. 52 Semanas, Max. 52 Semanas

lib/
├── funds-schema.ts                # estende FundRecord com campos de cotacao
├── funds-service.ts                # ajusta lock compartilhado de escrita no JSON
├── json-store.ts                   # reaproveitado sem alteracao estrutural
├── quote-selectors.ts               # NOVO - listas de seletores fallback por campo
├── quote-scraper.ts                 # NOVO - fetch com timeout + parsing via cheerio
└── quote-service.ts                 # NOVO - orquestracao sequencial, lock e resumo da execucao

tests/
├── unit/
│   ├── quote-scraper.test.ts        # NOVO
│   └── funds-schema.test.ts         # estendido para os novos campos
├── integration/
│   └── quote-service.test.ts        # NOVO
└── e2e/
    └── quote-update.spec.ts         # NOVO
```

**Structure Decision**: Reaproveitar a estrutura existente do projeto (Next.js App Router + `lib/` + `components/` + `tests/`), adicionando um novo dominio de scraping (`lib/quote-*.ts`) e uma nova rota de API (`app/api/cotacao/route.ts`), seguindo o mesmo padrao de `lib/funds-service.ts` + `app/api/refresh/route.ts` ja usado na feature 001. Nenhuma nova aplicacao/projeto e necessaria.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | N/A | N/A |

## Post-Design Constitution Check

- Code Quality Gate: PASS. Modulos `quote-selectors`, `quote-scraper` e `quote-service` tem responsabilidades unicas e isoladas, facilitando lint/revisao.
- Testing Gate: PASS. `data-model.md` e `contracts/api-contract.md` confirmam pontos de teste unitario, integracao e E2E cobrindo sucesso, falha parcial, timeout e bloqueio de concorrencia.
- UX Consistency Gate: PASS. `quickstart.md` documenta os estados visuais (carregando, sucesso, falha parcial, bloqueado) reaproveitando `StatusBanner`.
- Performance Gate: PASS. Timeout de 10s por linha, processamento sequencial e budget maximo de ≤ 420s para 42 linhas documentados e testaveis via `finishedAt − startedAt`; nenhum bloqueio permanente da UI.
- Evidence Gate: PASS. `quickstart.md` lista passos objetivos de verificacao manual e evidencia esperada (JSON atualizado, colunas visiveis, resumo de falhas).
