# Implementation Plan: Visualizacao de Fundos da Planilha

**Branch**: `001-visualizar-fundos-tabela` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-visualizar-fundos-tabela/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Construir uma aplicacao web em Next.js que exibe na tela inicial uma tabela com as colunas Tipo, Papel e Link a partir de uma base JSON local. Na inicializacao, o sistema deve usar o JSON se existir; caso contrario, deve gerar o JSON a partir da planilha `fundos-para-analise.xlsx`. A aplicacao tambem deve oferecer uma acao manual para atualizar o JSON a partir da planilha, com bloqueio de execucoes simultaneas e feedback claro ao usuario.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS  
**Primary Dependencies**: Next.js (App Router), React, xlsx (leitura da planilha), zod (validacao de registros)  
**Storage**: Arquivo JSON local versionado como base de leitura em runtime  
**Testing**: Vitest + Testing Library (unit/integration) e Playwright (E2E do fluxo principal)  
**Target Platform**: Web (desktop e mobile) com execucao server-side em Node.js
**Project Type**: Aplicacao web full-stack (frontend + rotas de API no mesmo projeto)  
**Performance Goals**: Renderizar tabela inicial em ate 2s para ate 1.000 linhas e atualizar JSON em ate 5s para ate 1.000 linhas  
**Constraints**: Exibir somente Tipo/Papel/Link; preservar linhas com Link invalido usando "Link indisponivel"; bloquear atualizacoes concorrentes; sem autenticacao para atualizacao manual nesta versao  
**Scale/Scope**: 1 tela principal, 1 acao manual de atualizacao de dados, 1 base JSON local, ate 1.000 linhas por planilha

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code Quality Gate: PASS. Adotar `next lint`, `tsc --noEmit` e formatacao consistente como criterios bloqueantes de merge.
- Testing Gate: PASS. Cobertura minima: unit para parser/normalizacao, integration para startup e atualizacao JSON, E2E para carga da tabela e clique em links.
- UX Consistency Gate: PASS. Tabela com hierarquia visual clara, feedback de sucesso/erro na atualizacao e comportamento responsivo sem sobreposicao de conteudo.
- Performance Gate: PASS. Metas definidas em contexto tecnico (2s carga inicial/5s atualizacao para 1.000 linhas) com medicao em ambiente local de referencia.
- Evidence Gate: PASS. PR deve anexar saida de testes, resultado de lint/type-check e evidencias de UX/performance para o fluxo principal.

## Project Structure

### Documentation (this feature)

```text
specs/001-visualizar-fundos-tabela/
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
├── page.tsx
├── api/
│   ├── fundos/route.ts
│   └── refresh/route.ts
components/
└── fundos-table.tsx
lib/
├── spreadsheet-reader.ts
├── json-store.ts
└── funds-service.ts
data/
└── fundos-db.json
public/
tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Projeto unico Next.js (App Router), unificando UI e API interna para leitura/atualizacao da base JSON. Essa estrutura reduz complexidade operacional para esta feature e facilita testes ponta a ponta no mesmo repositorio.

## Post-Design Constitution Check

- Code Quality Gate: PASS. Estrutura preve separacao clara entre `lib/`, `components/` e `app/api`, facilitando lint e type-check consistentes.
- Testing Gate: PASS. Escopo de testes mapeado em `tests/unit`, `tests/integration` e `tests/e2e`, cobrindo parser, bootstrap JSON e fluxo do usuario.
- UX Consistency Gate: PASS. Contrato de UI define colunas fixas, fallback padronizado para link invalido e feedback uniforme para acao de refresh.
- Performance Gate: PASS. Decisoes de cache em JSON e leitura prioritaria do JSON na inicializacao suportam meta de carga inicial em ate 2s.
- Evidence Gate: PASS. `quickstart.md` inclui comandos de validacao e checklist objetivo para evidenciar conformidade na PR.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | N/A | N/A |
