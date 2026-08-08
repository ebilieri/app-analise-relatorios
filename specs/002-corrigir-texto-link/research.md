# Phase 0 Research - Corrigir Texto do Link

## Decision 1: Reaproveitar a arquitetura existente
- Decision: Implementar a mudanca na feature atual sem alterar o modelo geral de leitura da planilha, cache JSON ou rotas da API.
- Rationale: O pedido e localizado na camada de apresentacao da coluna Link e nao exige nova arquitetura.
- Alternatives considered:
  - Reestruturar a resposta da API: descartado por nao agregar valor para esta correcao.
  - Adicionar nova propriedade dedicada so para texto de URL: descartado porque `linkUrl` ja representa o valor correto a exibir quando valido.

## Decision 2: Texto visivel do hyperlink
- Decision: Usar a propria `linkUrl` como texto visivel quando `linkStatus` for `valid`.
- Rationale: Atende diretamente a solicitacao do usuario e mantem consistencia entre destino e texto exibido.
- Alternatives considered:
  - Manter texto fixo `Link`: descartado por nao atender o requisito novo.
  - Exibir `linkRaw`: descartado porque o valor normalizado `linkUrl` e mais consistente.

## Decision 3: Fallback para links invalidos
- Decision: Preservar `Link indisponivel` para estados `empty` e `invalid`.
- Rationale: Evita regressao funcional e preserva o comportamento atual da interface.
- Alternatives considered:
  - Exibir texto bruto invalido: descartado por piorar a UX.

## Decision 4: Tratamento visual de URLs longas
- Decision: Reutilizar a estrategia atual de limite visual, quebra de linha e `title` nas celulas da tabela.
- Rationale: Ja existe base de legibilidade e a mudanca deve ser incremental.
- Alternatives considered:
  - Truncar sempre com reticencias: descartado por esconder informacao relevante da URL.

## Decision 5: Testes necessarios
- Decision: Cobrir a mudanca com testes unitarios/integracao para renderizacao do texto da URL e E2E para comportamento visivel da tabela.
- Rationale: O risco principal e regressao na renderizacao da coluna Link.
- Alternatives considered:
  - Somente ajuste manual sem testes: descartado por violar os gates de qualidade.
