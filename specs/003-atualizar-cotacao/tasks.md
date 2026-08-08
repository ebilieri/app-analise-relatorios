# Tasks: Atualizar Cotacao

**Input**: Design documents from `/specs/003-atualizar-cotacao/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-contract.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencias em tarefas incompletas)
- **[Story]**: User story correspondente (US1, US2, US3)
- Caminhos de arquivo absolutos da raiz do repositorio

---

## Phase 1: Setup

**Purpose**: Adicionar dependencia de producao necessaria para o scraping.

- [X] T001 Instalar dependencia `cheerio` com `npm install cheerio` (cheerio >=1.0 inclui tipos TypeScript proprios — `@types/cheerio` nao e necessario)

**Checkpoint**: `package.json` e `package-lock.json` atualizados com `cheerio` em `dependencies`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infra central que DEVE estar completa antes de qualquer implementacao de user story.

**CRITICO**: Nenhum trabalho de user story pode comecar ate esta fase estar completa.

- [X] T002 Estender `fundRecordSchema` em `lib/funds-schema.ts` para incluir os 6 novos campos de cotacao (`quoteValorAtual`, `quoteMin52Semanas`, `quoteMax52Semanas`, `quoteStatus`, `quoteUpdatedAt`, `quoteFailureReason`) todos opcionais/nullable com defaults conforme `data-model.md`; exportar o tipo `QuoteStatus`
- [X] T003 [P] Criar `lib/quote-selectors.ts` com as listas de seletores CSS fallback (em ordem de prioridade) para os campos `valorAtual`, `min52Semanas` e `max52Semanas` da pagina statusinvest — baseado na estrutura observada da pagina; exportar `QUOTE_SELECTORS` como const
- [X] T004 Atualizar `lib/funds-service.ts` para implementar lock compartilhado entre `refreshFunds` e a futura `updateQuotes`: exportar uma flag `writeInProgress` (ou mecanismo equivalente) que impeca escrita concorrente no `fundos-db.json` por ambas as operacoes

**Checkpoint**: Schema estendido, seletores definidos, mecanismo de lock atualizado — pronto para implementacao das user stories.

---

## Phase 3: User Story 1 — Atualizar cotacoes a partir dos links da tabela (Priority: P1) MVP

**Goal**: Implementar o backend completo de scraping sequencial: modulo de scraping, orquestracao e endpoint de API.

**Independent Test**: `POST /api/cotacao` retorna 200 com `updatedCount > 0` e o arquivo `data/fundos-db.json` passa a conter `quoteValorAtual`, `quoteMin52Semanas`, `quoteMax52Semanas` preenchidos nos registros com link valido.

### Tests para User Story 1

- [X] T005 [P] [US1] Criar `tests/unit/quote-scraper.test.ts` com testes unitarios (fetch mockado via `vi.stubGlobal`): sucesso com seletor primario; sucesso com seletor fallback (seletor primario vazio); falha por timeout (AbortError); falha por erro HTTP (4xx/5xx); falha por nenhum seletor encontrar valor (todos os campos null); normalizacao de texto (trim de espacos)
- [X] T006 [P] [US1] Criar `tests/integration/quote-service.test.ts` com testes de integracao (fetch e `writeDbAtomic` mockados): execucao sequencial com todos os links validos bem-sucedidos (`status: "success"`); execucao com falha parcial (`status: "partial"`, campos zerados na linha com falha, linha aparece em `failures[]`); execucao com lock ativo retorna `status: "blocked"`; linhas sem link valido contabilizadas em `skippedCount` sem aparecer em `failures[]`

### Implementacao User Story 1

- [X] T007 [US1] Criar `lib/quote-scraper.ts`: funcao `scrapeQuote(url: string): Promise<CotacaoAtualizada>` usando `fetch` nativo com `AbortController` (timeout 10s), carregando HTML com `cheerio.load`, aplicando os seletores de `lib/quote-selectors.ts` na ordem de prioridade por campo; retornar `{ success: true, valorAtual, min52Semanas, max52Semanas }` ou `{ success: false, failureReason }` conforme `data-model.md`
- [X] T008 [US1] Criar `lib/quote-service.ts`: funcao `updateQuotes(): Promise<ResultadoAtualizacaoCotacao>` que (1) verifica lock compartilhado de T004; (2) faz loop `for...of` sequencial sobre os registros com `linkStatus === "valid"`; (3) aplica `scrapeQuote` por linha; (4) em sucesso: preenche os 3 campos + `quoteStatus: "updated"` + `quoteUpdatedAt`; (5) em falha: zera os 3 campos + `quoteStatus: "failed"` + `quoteFailureReason`; (6) ignora silenciosamente linhas sem link valido (conta em `skippedCount`); (7) persiste o JSON atualizado via `writeDbAtomic`; retornar `ResultadoAtualizacaoCotacao` conforme `data-model.md`
- [X] T009 [US1] Criar `app/api/cotacao/route.ts`: handler `POST` que chama `updateQuotes()`, retorna 409 para `status: "blocked"`, 500 para `status: "failed"`, 200 para `status: "success"` ou `"partial"` — seguindo o mesmo padrao de `app/api/refresh/route.ts`
- [X] T010 [US1] Validar gates de constituicao da US1: executar `npm run typecheck`, `npm run lint`, `npm run test` (somente os novos testes unitarios e de integracao de US1) e confirmar que todos passam; ajustar quaisquer erros antes de prosseguir

**Checkpoint**: Backend de scraping completo e testado. `POST /api/cotacao` funcional. US1 verificavel via `curl` ou chamada manual.

---

## Phase 4: User Story 2 — Visualizar novas colunas de cotacao na tabela (Priority: P1)

**Goal**: Expor os novos campos de cotacao no frontend: novas colunas na tabela e botao `Atualizar cotacao` na pagina.

**Independent Test**: Abrir a tabela apos uma atualizacao bem-sucedida e verificar que as colunas `Valor Atual`, `Min. 52 Semanas` e `Max. 52 Semanas` aparecem com valores preenchidos ou indicacao de indisponibilidade sem quebrar o layout.

### Tests para User Story 2

- [X] T011 [P] [US2] Estender `tests/unit/funds-schema.test.ts` (ou criar `tests/unit/quote-fields.test.ts`) com testes: `dbSchema.parse(...)` preserva os 6 novos campos (sem strip); registro com campos de cotacao `null` passa validacao sem erros; `quoteStatus` aceita somente os valores enum definidos
- [X] T012 [P] [US2] Criar `tests/integration/table-quote-columns.test.tsx` com testes de renderizacao (jsdom + Testing Library): tabela renderiza as 3 novas colunas no `<thead>`; linha com `quoteStatus: "updated"` exibe valores nos 3 campos; linha com `quoteStatus: "not_collected"` exibe indicacao de indisponibilidade sem quebrar a linha; linha com `quoteStatus: "failed"` exibe indicacao de falha (campos vazios/dash)

### Implementacao User Story 2

- [X] T013 [US2] Estender `components/fundos-table.tsx`: adicionar colunas `Valor Atual`, `Min. 52 Semanas` e `Max. 52 Semanas` no `<thead>` e nos `<td>` correspondentes de cada linha; exibir o valor quando `quoteStatus === "updated"`, indicacao de indisponibilidade (`-` ou similar, seguindo padrao visual existente) quando `quoteStatus !== "updated"`
- [X] T014 [US2] Atualizar `app/page.tsx`: adicionar estado `busyQuote: boolean`; adicionar funcao `updateQuote` que faz `fetch("/api/cotacao", { method: "POST" })` e trata respostas 200 (sucesso/parcial), 409 (bloqueado) e erro; adicionar botao `Atualizar cotacao` ao lado do botao `Atualizar dados` reaproveitando a mesma classe CSS; exibir `StatusBanner` com o resultado da operacao (mensagem de sucesso, parcial ou bloqueado)
- [X] T015 [US2] Validar gates de constituicao da US2: executar `npm run typecheck`, `npm run lint`, `npm run test` (incluindo os novos testes de renderizacao) e confirmar que todos passam

**Checkpoint**: Tabela exibe as 3 novas colunas. Botao `Atualizar cotacao` visivel e funcional na UI.

---

## Phase 5: User Story 3 — Tratar falhas parciais durante a coleta (Priority: P2)

**Goal**: Garantir feedback claro ao usuario sobre falhas parciais, e cobrir todos os cenarios de falha com testes automatizados (incluindo E2E).

**Independent Test**: Simular falha em pelo menos um link durante a atualizacao de cotacao e verificar que: o processo continua para as demais linhas; o JSON reflete os campos zerados nas linhas com falha; a UI exibe mensagem clara de falha parcial com detalhes.

### Tests para User Story 3

- [X] T016 [P] [US3] Criar `tests/unit/quote-failure-cases.test.ts` com testes unitarios dos cenarios de falha: timeout gera `quoteFailureReason: "timeout"` e campos zerados; seletor nao encontrado gera `quoteFailureReason: "seletor_nao_encontrado"` e campos zerados; erro HTTP gera `quoteFailureReason: "erro_http"` e campos zerados; registro com cotacao antiga que falha fica com campos zerados e `quoteUpdatedAt` preservado
- [X] T017 [P] [US3] Criar `tests/e2e/quote-update.spec.ts` com testes E2E (Playwright com rotas mockadas via `page.route`): fluxo completo de sucesso — botao clicavel, spinner durante execucao, mensagem de sucesso, novas colunas visiveis na tabela; fluxo de falha parcial — mensagem de falha parcial exibida no `StatusBanner`; fluxo bloqueado — segundo clique retorna mensagem de bloqueio sem iniciar novo processamento

### Implementacao User Story 3

- [X] T018 [US3] Revisar `app/page.tsx` para garantir tratamento correto de todos os cenarios de resposta da API de cotacao: `status: "partial"` MUST exibir mensagem informando quantas linhas falharam (usando `failedCount`); `status: "blocked"` MUST exibir mensagem de bloqueio via `StatusBanner` com tom `info`; `status: "failed"` MUST exibir mensagem de erro com tom `error`; botao `Atualizar cotacao` MUST ser desabilitado enquanto `busyQuote === true` ou `busyRefresh === true`
- [X] T019 [US3] Validar todos os gates de constituicao da feature completa: executar `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e` e confirmar que toda a suite passa; documentar resultados em `specs/003-atualizar-cotacao/evidence/test-results.txt`

**Checkpoint**: Todos os cenarios de falha cobertos com testes automatizados e manuais. Feature 003 completa e verificavel de ponta a ponta.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T020 [P] Atualizar `README.md`: adicionar descricao do botao `Atualizar cotacao`, das novas colunas de cotacao e da politica de falha (campos zerados + resumo de falhas)
- [X] T021 [P] Criar `specs/003-atualizar-cotacao/evidence/validation-report.md` com evidencia objetiva: resultado do `typecheck`, `lint`, `test`, `test:e2e`; screenshot ou saida da tabela com as novas colunas preenchidas; conteudo de exemplo do `data/fundos-db.json` com campos de cotacao preenchidos

---

## Dependency Graph (ordem de conclusao por user story)

```
T001 (setup cheerio)
  └── T002 (extend schema)
        ├── T003 [P] (quote-selectors) ─┐
        └── T004 (lock update)          │
              │                         │
              ▼                         ▼
        T005 [P] (unit tests scraper) ──────── T007 (quote-scraper impl)
        T006 [P] (integration tests) ─────────── T008 (quote-service impl)
                                                    └── T009 (route /api/cotacao)
                                                          └── T010 (validate US1)
                                                                └── T011 [P] (schema tests)
                                                                    T012 [P] (render tests)
                                                                    T013 (table columns)
                                                                    T014 (page.tsx button)
                                                                      └── T015 (validate US2)
                                                                            └── T016 [P] (failure unit tests)
                                                                                T017 [P] (E2E tests)
                                                                                T018 (page review)
                                                                                  └── T019 (validate full suite)
                                                                                        ├── T020 [P] (README)
                                                                                        └── T021 [P] (evidence)
```

## Parallel Execution Examples

### US1 — apos T004 completado
- T005 e T006 podem ser escritos em paralelo com T007 (arquivos distintos: `tests/unit/` vs `lib/`)
- T003 pode ser completado em paralelo com T002 (arquivos distintos)

### US2 — apos T010 completado
- T011 e T012 podem ser escritos em paralelo com T013 e T014 (arquivos distintos)

### US3 — apos T015 completado
- T016 e T017 podem ser escritos em paralelo entre si e com T018 (arquivos distintos)

### Final — apos T019 completado
- T020 e T021 podem ser feitos em paralelo (arquivos distintos)

## Implementation Strategy

**MVP (entrega minima verificavel)**: Completar apenas as Phases 1, 2 e 3 (T001–T010).  
Resultado: `POST /api/cotacao` funcional, JSON atualizado com campos de cotacao, testado.  
Sem UI ainda — verificavel via chamada direta ao endpoint.

**Increment 2**: Completar Phase 4 (T011–T015).  
Resultado: tabela exibe as 3 novas colunas e botao `Atualizar cotacao` funciona no frontend.

**Increment 3**: Completar Phase 5 + Final (T016–T021).  
Resultado: cobertura E2E completa, todos os cenarios de falha testados e documentados, feature pronta para merge.

---

## Summary

| Categoria | Detalhes |
|---|---|
| Total de tarefas | 21 |
| Phase 1 Setup | 1 tarefa |
| Phase 2 Foundational | 3 tarefas |
| US1 (P1 — MVP) | 6 tarefas (2 testes + 4 implementacao) |
| US2 (P1) | 5 tarefas (2 testes + 3 implementacao) |
| US3 (P2) | 4 tarefas (2 testes + 2 implementacao) |
| Final/Polish | 2 tarefas |
| Tarefas paralelizaveis | 11 (T003, T005, T006, T011, T012, T016, T017, T020, T021) |
| Arquivos novos (lib) | `lib/quote-selectors.ts`, `lib/quote-scraper.ts`, `lib/quote-service.ts` |
| Arquivos novos (API) | `app/api/cotacao/route.ts` |
| Arquivos novos (testes) | `tests/unit/quote-scraper.test.ts`, `tests/unit/quote-failure-cases.test.ts`, `tests/integration/quote-service.test.ts`, `tests/integration/table-quote-columns.test.tsx`, `tests/e2e/quote-update.spec.ts` |
| Arquivos modificados | `lib/funds-schema.ts`, `lib/funds-service.ts`, `components/fundos-table.tsx`, `app/page.tsx`, `README.md` |
| MVP scope | T001–T010 (Phase 1 + 2 + 3) |
