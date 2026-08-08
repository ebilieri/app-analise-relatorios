# Tasks: Corrigir Texto do Link

**Input**: Design documents from /specs/002-corrigir-texto-link/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are mandatory. Every user story includes unit, integration, and E2E coverage proporcional ao risco.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar o contexto minimo da correcao incremental

- [x] T001 Review current link rendering behavior in components/fundos-table.tsx
- [x] T002 [P] Review existing link-related tests in tests/unit/link-validation.test.ts
- [x] T003 [P] Review existing E2E coverage for link behavior in tests/e2e/link-behavior.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ajustes base de contrato e regra de exibicao que bloqueiam as historias

**Critical**: No user story work starts before this phase completes

- [x] T004 Confirm link rendering contract for valid and fallback states in specs/002-corrigir-texto-link/contracts/ui-contract.md
- [x] T005 Define visible text derivation rule for valid links in lib/funds-schema.ts
- [x] T006 Define visual constraint expectation for long URLs in components/fundos-table.tsx

**Checkpoint**: Foundation ready, user stories can now proceed

---

## Phase 3: User Story 1 - Visualizar a URL completa no texto do link (Priority: P1) MVP

**Goal**: Mostrar a propria URL como texto visivel em hyperlinks validos

**Independent Test**: Abrir a tela inicial e verificar que cada link valido exibe a propria URL da linha como texto clicavel

### Tests for User Story 1 (Mandatory)

- [x] T007 [P] [US1] Update unit tests for visible text equal to normalized URL in tests/unit/link-validation.test.ts
- [x] T008 [P] [US1] Add integration test for Link column text rendering from API-backed row data in tests/integration/table-responsive.test.tsx
- [x] T009 [P] [US1] Update E2E assertion for visible URL text in tests/e2e/link-behavior.spec.ts

### Implementation for User Story 1

- [x] T010 [P] [US1] Update valid-link visible text derivation in lib/funds-schema.ts
- [x] T011 [US1] Render linkUrl as hyperlink text in components/fundos-table.tsx
- [x] T012 [US1] Verify table page continues wiring Link column correctly in app/page.tsx
- [x] T013 [US1] Record UX evidence for visible URL rendering in specs/002-corrigir-texto-link/evidence/us1-ux.md
- [x] T014 [US1] Record performance non-regression evidence for visible URL rendering in specs/002-corrigir-texto-link/evidence/us1-performance.md

**Checkpoint**: US1 functional and independently testable

---

## Phase 4: User Story 2 - Manter fallback para links indisponiveis (Priority: P1)

**Goal**: Preservar Link indisponivel sem hyperlink para estados empty e invalid

**Independent Test**: Validar que linhas com link vazio ou invalido nao mudaram o comportamento visual

### Tests for User Story 2 (Mandatory)

- [x] T015 [P] [US2] Keep unit coverage for empty and invalid link fallback in tests/unit/link-validation.test.ts
- [x] T016 [P] [US2] Add integration assertion for fallback text without anchor in tests/integration/table-responsive.test.tsx
- [x] T017 [P] [US2] Keep E2E fallback verification for Link indisponivel in tests/e2e/link-behavior.spec.ts

### Implementation for User Story 2

- [x] T018 [US2] Verify fallback branch remains unchanged in components/fundos-table.tsx
- [x] T019 [US2] Verify fallback semantics remain aligned in specs/002-corrigir-texto-link/contracts/ui-contract.md
- [x] T020 [US2] Record UX evidence for preserved fallback behavior in specs/002-corrigir-texto-link/evidence/us2-ux.md
- [x] T021 [US2] Record performance non-regression evidence for fallback behavior in specs/002-corrigir-texto-link/evidence/us2-performance.md

**Checkpoint**: US2 functional and independently testable

---

## Phase 5: User Story 3 - Preservar legibilidade visual com URLs longas (Priority: P2)

**Goal**: Manter a tabela legivel ao exibir URLs completas longas

**Independent Test**: Validar em desktop e mobile que URLs longas nao quebram a experiencia de leitura

### Tests for User Story 3 (Mandatory)

- [x] T022 [P] [US3] Add integration test for long URL rendering in table cells in tests/integration/table-responsive.test.tsx
- [x] T023 [P] [US3] Update mobile readability E2E coverage for long URLs in tests/e2e/mobile-readability.spec.ts
- [x] T024 [P] [US3] Update accessibility/navigation E2E assertions if needed in tests/e2e/a11y-table.spec.ts

### Implementation for User Story 3

- [x] T025 [US3] Adjust long URL wrapping or truncation behavior in components/fundos-table.tsx
- [x] T026 [US3] Adjust supporting styles for long URL readability in app/globals.css
- [x] T027 [US3] Record UX evidence for desktop and mobile long URL readability in specs/002-corrigir-texto-link/evidence/us3-ux.md
- [x] T028 [US3] Record performance non-regression evidence for long URL layout in specs/002-corrigir-texto-link/evidence/us3-performance.md

**Checkpoint**: US3 functional and independently testable

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Consolidar documentacao, validacao e evidencia da correcao

- [x] T029 [P] Update quick validation steps in specs/002-corrigir-texto-link/quickstart.md
- [x] T030 [P] Update README guidance if user-facing behavior description mentions generic link label in README.md
- [x] T031 Consolidate final quality notes for this correction in specs/002-corrigir-texto-link/evidence/final-quality-report.md
- [ ] T032 Run quickstart validation and record final sign-off in specs/002-corrigir-texto-link/evidence/final-validation.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup Phase 1 starts immediately
- Foundational Phase 2 depends on Setup completion and blocks all user stories
- User story phases depend on Foundational completion
- Polish Phase 6 depends on completion of desired user stories

### User Story Dependencies

- US1 depends on Phase 2 only
- US2 depends on Phase 2 and can run independently after core rendering rule is confirmed
- US3 depends on Phase 2 and should run after US1 because it refines the visible URL presentation

### Within Each User Story

- Tests are updated before implementation tasks
- Rendering rule changes precede style refinements
- Evidence tasks close each story

## Parallel Opportunities

- Setup parallel tasks: T002, T003
- US1 parallel tests: T007, T008, T009
- US2 parallel tests: T015, T016, T017
- US3 parallel tests: T022, T023, T024
- Polish parallel tasks: T029, T030

## Parallel Example: User Story 1

- Run T007, T008 and T009 in parallel
- Run T010 and T011 in parallel, then complete T012

## Parallel Example: User Story 3

- Run T022, T023 and T024 in parallel
- Run T025 and T026 in parallel, then complete T027

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1)
3. Validate US1 independently before proceeding

### Incremental Delivery

1. Deliver US1 for visible URL text
2. Deliver US2 for fallback regression safety
3. Deliver US3 for long URL readability
4. Finish with Phase 6 documentation and sign-off

### Parallel Team Strategy

1. One developer handles test updates while another adjusts rendering logic
2. After US1 stabilizes, visual refinement for US3 can proceed in parallel with documentation updates
