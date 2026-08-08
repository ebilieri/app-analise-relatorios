# Implementation Plan: Corrigir Texto do Link

**Branch**: `002-corrigir-texto-link` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-corrigir-texto-link/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Corrigir a renderizacao da coluna Link para que hyperlinks validos exibam a propria URL como texto visivel, preservando o fallback `Link indisponivel` para links vazios ou invalidos. A implementacao deve ser incremental, reaproveitando a estrutura existente de Next.js, o modelo `RegistroFundo` e os estilos atuais de legibilidade para URLs longas.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS  
**Primary Dependencies**: Next.js (App Router), React, existing table component and tests  
**Storage**: N/A for this change beyond existing JSON data flow  
**Testing**: Vitest + Testing Library and Playwright  
**Target Platform**: Web (desktop e mobile)
**Project Type**: Aplicacao web full-stack com ajuste incremental de UI  
**Performance Goals**: Manter o tempo de renderizacao da tabela dentro do orcamento atual da feature base  
**Constraints**: Nao alterar destino do hyperlink; preservar `Link indisponivel`; manter legibilidade com URLs longas  
**Scale/Scope**: Mudanca localizada principalmente na coluna Link da tabela e testes associados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code Quality Gate: PASS. A mudanca deve passar `typecheck`, `lint` e revisao estatica sem bloqueadores.
- Testing Gate: PASS. Cobertura minima inclui teste de renderizacao da URL visivel, fallback e verificacao E2E da coluna Link.
- UX Consistency Gate: PASS. O ajuste deve manter semantica visual e comportamento consistente entre href, texto visivel e fallback.
- Performance Gate: PASS. A mudanca nao deve aumentar perceptivelmente o custo de renderizacao da tabela.
- Evidence Gate: PASS. PR deve anexar resultados de testes e validacao visual da coluna Link.

## Project Structure

### Documentation (this feature)

```text
specs/002-corrigir-texto-link/
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
components/
└── fundos-table.tsx
lib/
└── funds-schema.ts
tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Reaproveitar a estrutura existente do projeto, concentrando a mudanca em `components/fundos-table.tsx` e nos testes relacionados. O ajuste nao requer novas rotas nem novo armazenamento.

## Post-Design Constitution Check

- Code Quality Gate: PASS. Mudanca pequena e localizada, com baixo risco estrutural.
- Testing Gate: PASS. Artefatos de design ja apontam para testes unitarios, integracao e E2E da renderizacao da coluna Link.
- UX Consistency Gate: PASS. O texto do link passa a refletir o proprio destino sem alterar o fallback visual.
- Performance Gate: PASS. A exibicao da propria URL nao altera a fonte de dados nem a estrategia de carregamento.
- Evidence Gate: PASS. `quickstart.md` lista validacoes objetivas para revisar o comportamento novo.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | N/A | N/A |
