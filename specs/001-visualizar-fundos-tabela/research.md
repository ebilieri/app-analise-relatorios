# Phase 0 Research - Visualizacao de Fundos da Planilha

## Decision 1: Framework e arquitetura de execucao
- Decision: Usar Next.js com App Router em um projeto unico full-stack (UI + API routes).
- Rationale: Atende a necessidade de tela inicial e funcionalidade de atualizacao de dados sem separar frontend/backend, reduzindo complexidade de entrega e operacao.
- Alternatives considered:
  - Frontend e backend separados: descartado por custo adicional de integracao para um escopo pequeno.
  - SPA sem backend: descartado porque o processamento de planilha e persistencia local do JSON sao mais seguros e previsiveis no lado servidor.

## Decision 2: Estrategia de persistencia de dados
- Decision: Persistir dados em arquivo JSON local e usar esse arquivo como fonte primaria de leitura na inicializacao.
- Rationale: Alinha com o requisito clarificado pelo usuario (carregar uma unica vez e reutilizar base JSON), com implementacao simples e auditavel.
- Alternatives considered:
  - Ler XLSX em toda requisicao: descartado por pior desempenho e maior custo de I/O.
  - Banco relacional: descartado por complexidade desnecessaria para o volume e escopo atual.

## Decision 3: Processo de inicializacao
- Decision: Na inicializacao, verificar existencia do JSON; se existir, carregar JSON; se nao existir, gerar JSON a partir da planilha e entao carregar.
- Rationale: Garante disponibilidade imediata da tabela e cria fluxo deterministico de bootstrap.
- Alternatives considered:
  - Falhar quando JSON nao existir: descartado por baixa resiliencia operacional.
  - Gerar JSON apenas manualmente: descartado por exigir intervencao humana para primeiro uso.

## Decision 4: Atualizacao manual de dados
- Decision: Expor acao manual de atualizacao de JSON acessivel a qualquer visitante, com bloqueio de concorrencia (single-flight lock).
- Rationale: Alinha com as clarificacoes aceitas (acesso aberto + bloqueio de execucoes simultaneas), evita corrupcao e evita condicoes de corrida.
- Alternatives considered:
  - Permitir atualizacoes simultaneas: descartado por risco de escrita concorrente.
  - Exigir autenticacao de admin: descartado para esta versao por decisao explicita do usuario.

## Decision 5: Tratamento de qualidade de dados
- Decision: Normalizar colunas Tipo/Papel/Link; para Link vazio/invalido, manter a linha e exibir "Link indisponivel" sem hyperlink.
- Rationale: Preserva integridade da tabela sem navegação quebrada e atende criterio de UX definido.
- Alternatives considered:
  - Remover linhas com link invalido: descartado por perda de informacao.
  - Mostrar link invalido clicavel: descartado por experiencia inconsistente e risco de erro.

## Decision 6: Testes e verificacao
- Decision: Cobrir parser/normalizacao com testes unitarios, fluxo de inicializacao/atualizacao com integracao e jornada principal com E2E.
- Rationale: Mapeia diretamente os gates constitucionais de qualidade e testes obrigatorios.
- Alternatives considered:
  - Somente testes manuais: descartado por baixo controle de regressao.
  - Somente unitarios: descartado por nao cobrir fluxos de arquivo e API.
