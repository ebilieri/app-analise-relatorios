# Tasks: Visualizacao de Fundos da Planilha

**Input**: Design documents from /specs/001-visualizar-fundos-tabela/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are mandatory. Every user story includes unit, integration, and E2E coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling

- [x] T001 Initialize Next.js TypeScript app structure and scripts in package.json
- [x] T002 Add runtime dependencies for spreadsheet and validation in package.json
- [x] T003 [P] Configure linting rules for the project in eslint.config.mjs
- [x] T004 [P] Configure unit and integration test runner in vitest.config.ts
- [x] T005 [P] Configure end-to-end test runner in playwright.config.ts
- [x] T006 [P] Prepare data directory bootstrap artifact in data/.gitkeep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data, API, UX and performance foundations that block all stories

**Critical**: No user story work starts before this phase completes

- [x] T007 Define canonical fund record schema and parsing guards in lib/funds-schema.ts
- [x] T008 [P] Implement XLSX reader and raw row extraction in lib/spreadsheet-reader.ts
- [x] T009 [P] Implement JSON storage reader and atomic writer in lib/json-store.ts
- [x] T010 Implement startup bootstrap and refresh orchestration with lock state in lib/funds-service.ts
- [x] T011 [P] Create GET endpoint contract skeleton for table data in app/api/fundos/route.ts
- [x] T012 [P] Create POST endpoint contract skeleton for refresh action in app/api/refresh/route.ts
- [x] T013 Define shared API success and error response helpers in lib/api-response.ts
- [x] T014 Define shared user feedback component for status messages in components/status-banner.tsx
- [x] T015 Define performance smoke measurement script for startup and refresh in scripts/perf-smoke.mjs

**Checkpoint**: Foundation ready, user stories can now proceed

---

## Phase 3: User Story 1 - Visualizar dados essenciais dos fundos (Priority: P1) MVP

**Goal**: Exibir tabela inicial com dados de Tipo, Papel e Link usando fonte JSON

**Independent Test**: Acessar tela inicial e validar colunas fixas e registros carregados sem depender de outras historias

### Tests for User Story 1 (Mandatory)

- [x] T016 [P] [US1] Create unit tests for schema normalization and required columns in tests/unit/funds-schema.test.ts
- [x] T017 [P] [US1] Create integration tests for startup loading from JSON and fallback generation in tests/integration/bootstrap-json.test.ts
- [x] T018 [P] [US1] Create E2E test for home table rendering with fixed columns in tests/e2e/home-table.spec.ts

### Implementation for User Story 1

- [x] T019 [P] [US1] Implement table component with fixed headers Tipo, Papel and Link in components/fundos-table.tsx
- [x] T020 [US1] Implement home page data loading and rendering flow in app/page.tsx
- [x] T021 [US1] Implement GET fundos endpoint using JSON-backed service in app/api/fundos/route.ts
- [x] T022 [US1] Implement empty and startup-error visual states in app/page.tsx
- [x] T023 [US1] Record UX consistency evidence for table readability in specs/001-visualizar-fundos-tabela/evidence/us1-ux.md
- [x] T024 [US1] Record startup performance evidence against target in specs/001-visualizar-fundos-tabela/evidence/us1-performance.md

**Checkpoint**: US1 functional and independently testable

---

## Phase 4: User Story 2 - Abrir referencia externa pelo campo Link (Priority: P1)

**Goal**: Tornar links validos clicaveis e links invalidos visiveis como Link indisponivel

**Independent Test**: Validar clique de link valido e fallback sem hyperlink para link invalido sem depender de refresh manual

### Tests for User Story 2 (Mandatory)

- [x] T025 [P] [US2] Create unit tests for link validation and link status derivation in tests/unit/link-validation.test.ts
- [x] T026 [P] [US2] Create integration tests for GET payload link fields and fallback mapping in tests/integration/link-status-api.test.ts
- [x] T027 [P] [US2] Create E2E test for clickable link and Link indisponivel fallback in tests/e2e/link-behavior.spec.ts

### Implementation for User Story 2

- [x] T028 [P] [US2] Implement link normalization fields linkUrl, linkDisplay and linkStatus in lib/funds-schema.ts
- [x] T029 [US2] Implement hyperlink rendering and invalid-link fallback in components/fundos-table.tsx
- [x] T030 [US2] Ensure GET fundos contract returns link fields required by UI in app/api/fundos/route.ts
- [x] T031 [US2] Record UX consistency evidence for link behavior in specs/001-visualizar-fundos-tabela/evidence/us2-ux.md
- [x] T032 [US2] Record rendering performance evidence for link handling in specs/001-visualizar-fundos-tabela/evidence/us2-performance.md

**Checkpoint**: US2 functional and independently testable

---

## Phase 5: User Story 4 - Manter base JSON sincronizada sob demanda (Priority: P1)

**Goal**: Atualizar JSON manualmente a partir da planilha com bloqueio de concorrencia

**Independent Test**: Iniciar app com e sem JSON, executar refresh manual e validar bloqueio quando houver refresh em andamento

### Tests for User Story 4 (Mandatory)

- [x] T033 [P] [US4] Create unit tests for refresh lock and state transitions in tests/unit/funds-refresh-lock.test.ts
- [x] T034 [P] [US4] Create integration tests for refresh success, failure and blocked responses in tests/integration/refresh-endpoint.test.ts
- [x] T035 [P] [US4] Create E2E test for manual refresh feedback and concurrent request blocking in tests/e2e/manual-refresh.spec.ts

### Implementation for User Story 4

- [x] T036 [US4] Implement startup check JSON exists else generate from spreadsheet in lib/funds-service.ts
- [x] T037 [US4] Implement POST refresh endpoint with single-flight lock and status messages in app/api/refresh/route.ts
- [x] T038 [US4] Implement manual refresh action and user feedback states in app/page.tsx
- [x] T039 [US4] Implement atomic JSON rewrite with metadata update in lib/json-store.ts
- [x] T040 [US4] Record UX evidence for success, failure and blocked refresh states in specs/001-visualizar-fundos-tabela/evidence/us4-ux.md
- [x] T041 [US4] Record refresh performance evidence against target in specs/001-visualizar-fundos-tabela/evidence/us4-performance.md

**Checkpoint**: US4 functional and independently testable

---

## Phase 6: User Story 3 - Ler informacoes com conforto visual (Priority: P2)

**Goal**: Garantir leitura confortavel e consistente em desktop e mobile

**Independent Test**: Validar legibilidade, espacamento, contraste e responsividade da tabela em diferentes viewports

### Tests for User Story 3 (Mandatory)

- [x] T042 [P] [US3] Create integration test for responsive table layout behavior in tests/integration/table-responsive.test.tsx
- [x] T043 [P] [US3] Create E2E mobile viewport readability test in tests/e2e/mobile-readability.spec.ts
- [x] T044 [P] [US3] Create E2E accessibility smoke test for table navigation and labels in tests/e2e/a11y-table.spec.ts

### Implementation for User Story 3

- [x] T045 [US3] Implement responsive spacing, typography and overflow handling in app/globals.css
- [x] T046 [US3] Improve header, row density and contrast behavior in components/fundos-table.tsx
- [x] T047 [US3] Apply consistent loading, success and error feedback visuals in components/status-banner.tsx
- [x] T048 [US3] Record UX checklist evidence for desktop and mobile readability in specs/001-visualizar-fundos-tabela/evidence/us3-ux.md
- [x] T049 [US3] Record post-polish performance evidence in specs/001-visualizar-fundos-tabela/evidence/us3-performance.md

**Checkpoint**: US3 functional and independently testable

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Final hardening and consolidated evidence across stories

- [x] T050 [P] Align contract examples with implemented responses in specs/001-visualizar-fundos-tabela/contracts/api-contract.md
- [x] T051 [P] Update final runbook and troubleshooting in specs/001-visualizar-fundos-tabela/quickstart.md
- [x] T052 Consolidate quality gate outputs in specs/001-visualizar-fundos-tabela/evidence/final-quality-report.md
- [ ] T053 Consolidate final validation checklist and sign-off in specs/001-visualizar-fundos-tabela/evidence/final-validation.md
- [x] T054 [P] [US1] Create integration test for missing required columns user message in tests/integration/missing-columns-message.test.ts
- [x] T055 [US1] Implement explicit missing required columns message path in app/api/fundos/route.ts and app/page.tsx
- [ ] T056 [P] Execute timed usability validation for SC-003 and record protocol plus results in specs/001-visualizar-fundos-tabela/evidence/sc-003-usability.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup Phase 1 has no dependencies and starts immediately
- Foundational Phase 2 depends on Setup completion and blocks all user stories
- User story phases depend on Foundational completion
- Polish Phase 7 depends on completion of desired user stories

### User Story Dependencies

- US1 depends on Phase 2 only
- US2 depends on Phase 2 and can run independently of US1 implementation sequence once foundations are done
- US4 depends on Phase 2 and can run independently once foundations are done
- US3 depends on Phase 2 and can run after core rendering pieces exist

### Additional Requirement-Driven Dependencies

- T054 must be completed before T055
- T055 should complete before final sign-off task T053
- T056 should complete before final sign-off task T053

### Recommended Story Completion Order

- First deliverable MVP: US1
- Next high-value increment: US2
- Next operational increment: US4
- Final experience increment: US3

### Within Each User Story

- Tests are created before implementation tasks
- Core schema and models precede service logic
- Service logic precedes endpoint or UI wiring
- Story closes only after UX and performance evidence tasks

## Parallel Opportunities

- Setup parallel tasks: T003, T004, T005, T006
- Foundational parallel tasks: T008, T009, T011, T012
- US1 parallel tests: T016, T017, T018
- US2 parallel tests: T025, T026, T027
- US4 parallel tests: T033, T034, T035
- US3 parallel tests: T042, T043, T044
- Requirement-gap tasks can run in parallel: T054 and T056

## Parallel Example: User Story 1

- Run T016, T017 and T018 in parallel while implementation has not started
- Run T019 and T021 in parallel after tests exist and foundational tasks are complete

## Parallel Example: User Story 2

- Run T025, T026 and T027 in parallel
- Run T028 and T029 in parallel, then complete T030

## Parallel Example: User Story 4

- Run T033, T034 and T035 in parallel
- Run T037 and T039 in parallel, then complete T038

## Parallel Example: User Story 3

- Run T042, T043 and T044 in parallel
- Run T045 and T046 in parallel, then complete T047

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1)
3. Validate US1 independently before proceeding

### Incremental Delivery

1. Deliver US1 for core table value
2. Deliver US2 for link behavior value
3. Deliver US4 for data update and operational value
4. Deliver US3 for UX polish value

### Parallel Team Strategy

1. Team aligns on Phase 1 and 2 together
2. After Phase 2, split by story tracks:
   - Track A: US1 then US3
   - Track B: US2
   - Track C: US4
3. Rejoin for Phase 7 final hardening
