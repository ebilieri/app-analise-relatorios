# Feature Specification: Atualizar Cotacao

**Feature Branch**: `003-atualizar-cotacao`  
**Created**: 2026-08-07  
**Status**: Draft  
**Input**: User description: "Ao lado do botao \"Atualizar dados\" adicione um botao \"Atualizar cotacao\". A clicar no botao deve executar um funcao asincrona de webscrapper percorrendo as linha da tabela (coluna link). Um webscrapper dever acessar a url (stautsinvest) atualizar o JSON, incluir 3 novas colunas (Valor Atual, Min. 52 Semanas e Max.52 Semanas). Os valores deve ser obtido da url correspondente nos elementos ... essas 3 colunas devem ser adicionas ao JSON e tabela de exibicao"

## Clarifications

### Session 2026-08-07

- Q: Como a atualizacao de cotacao deve processar os links da tabela? -> A: Processar um link por vez, em sequencia.
- Q: Quando a coleta de uma linha falhar, o que fazer com os campos de cotacao dessa linha? -> A: Zerar os tres campos de cotacao da linha e registrar a falha separadamente no resultado da execucao.
- Q: Como o webscrapper deve localizar os valores de cotacao na pagina externa? -> A: Usar lista de seletores fallback por campo, na ordem de prioridade.
- Q: Qual o timeout e a politica de retry por requisicao de coleta? -> A: Timeout de 10s por requisicao, sem retry automatico.
- Q: Como tratar uma linha sem link valido para consulta externa? -> A: Ignorar silenciosamente (nao processa, nao conta como falha).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Atualizar cotacoes a partir dos links da tabela (Priority: P1)

Como usuario, quero clicar em um botao de atualizacao de cotacao para enriquecer os registros com dados de mercado obtidos nas paginas de referencia.

**Why this priority**: Este e o comportamento principal solicitado e agrega valor direto aos dados exibidos na tabela.

**Independent Test**: Pode ser testada clicando no botao de atualizacao de cotacao e verificando que os registros do JSON passam a conter os novos campos de cotacao preenchidos.

**Acceptance Scenarios**:

1. **Given** que existem linhas com links validos para paginas de referencia, **When** o usuario aciona a atualizacao de cotacao, **Then** o sistema percorre os links, obtem os dados de cotacao e atualiza o JSON com os novos valores por linha.
2. **Given** que a atualizacao de cotacao termina com sucesso, **When** a tela e recarregada ou atualizada, **Then** a tabela exibe os novos valores nas colunas adicionadas.
3. **Given** que existem varias linhas validas para consulta, **When** a atualizacao de cotacao e executada, **Then** os links sao processados um por vez, em sequencia.

---

### User Story 2 - Visualizar novas colunas de cotacao na tabela (Priority: P1)

Como usuario, quero ver as colunas Valor Atual, Min. 52 Semanas e Max. 52 Semanas ao lado dos demais dados para analisar cada ativo sem abrir a pagina externa.

**Why this priority**: Sem a exibicao das novas colunas, o enriquecimento do JSON nao entrega valor visivel ao usuario.

**Independent Test**: Pode ser testada abrindo a tabela apos uma atualizacao bem-sucedida e verificando a presenca e o preenchimento coerente das tres novas colunas.

**Acceptance Scenarios**:

1. **Given** que um registro possui dados de cotacao armazenados, **When** a tabela e renderizada, **Then** as colunas Valor Atual, Min. 52 Semanas e Max. 52 Semanas sao exibidas com os valores correspondentes da linha.
2. **Given** que um registro ainda nao possui cotacao atualizada, **When** a tabela e renderizada, **Then** as novas colunas exibem um estado vazio ou indicacao clara de indisponibilidade sem quebrar a linha.

---

### User Story 3 - Tratar falhas parciais durante a coleta (Priority: P2)

Como usuario, quero receber feedback claro quando algumas cotacoes nao puderem ser atualizadas para continuar usando a tabela sabendo exatamente quais linhas falharam e quais foram atualizadas.

**Why this priority**: Coleta em paginas externas pode falhar por indisponibilidade, mudanca de conteudo ou erro de rede; a experiencia precisa permanecer controlada.

**Independent Test**: Pode ser testada simulando falha em um ou mais links e verificando que o processo continua para as demais linhas, com feedback claro sobre o resultado.

**Acceptance Scenarios**:

1. **Given** que uma ou mais paginas de referencia nao podem ser processadas, **When** a atualizacao de cotacao e executada, **Then** o sistema zera os tres campos de valor de cotacao das linhas com falha (preservando `quoteUpdatedAt` do ultimo sucesso anterior, se existir) e informa que houve falhas parciais.
2. **Given** que parte das linhas foi atualizada com sucesso e outra parte falhou, **When** a operacao termina, **Then** o JSON reflete os sucessos confirmados e zera os tres campos de valor de cotacao nas linhas com falha (preservando `quoteUpdatedAt` do ultimo sucesso anterior, se existir), registrando essas falhas no resultado final da execucao.

### Edge Cases

- Linhas sem link valido para consulta externa sao ignoradas silenciosamente durante a atualizacao de cotacao, sem contar como falha no resumo final.
- Quando `Atualizar dados` estiver em execucao, `Atualizar cotacao` MUST ser bloqueado (retorna 409), e vice-versa, pois ambas as operacoes escrevem no mesmo arquivo `data/fundos-db.json`.
- Quando a pagina externa nao contem um ou mais valores esperados apos tentar todos os seletores fallback do campo, a linha e tratada como falha (campos zerados e falha registrada).
- Quando a pagina externa demora mais que 10 segundos para responder, a requisicao e tratada como falha (timeout, sem retry automatico).
- Uma nova atualizacao de cotacao nao pode ser iniciada enquanto outra atualizacao de cotacao ainda esta em execucao (ver FR-008).
- Quando uma coleta falha em um registro com cotacao antiga, os campos sao zerados e a falha e registrada no resumo final (ver FR-006, FR-010).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir um botao `Atualizar cotacao` ao lado do botao `Atualizar dados`.
- **FR-002**: O sistema MUST iniciar uma operacao assincrona de atualizacao de cotacao quando o usuario acionar o botao `Atualizar cotacao`.
- **FR-003**: O sistema MUST percorrer os registros com links validos e tentar obter os dados de cotacao correspondentes de cada pagina de referencia, processando um link por vez em sequencia.
- **FR-004**: O sistema MUST armazenar no JSON os campos `Valor Atual`, `Min. 52 Semanas` e `Max. 52 Semanas` para cada registro atualizado com sucesso.
- **FR-005**: O sistema MUST exibir na tabela as colunas `Valor Atual`, `Min. 52 Semanas` e `Max. 52 Semanas`.
- **FR-006**: O sistema MUST zerar os campos `Valor Atual`, `Min. 52 Semanas` e `Max. 52 Semanas` quando uma linha nao puder ter a cotacao atualizada, e MUST atualizar `quoteStatus` para `"failed"` e `quoteFailureReason` com o motivo da falha no registro persistido no JSON.
- **FR-007**: O sistema MUST informar ao usuario o resultado da operacao de atualizacao de cotacao, incluindo sucesso total, sucesso parcial ou falha.
- **FR-008**: O sistema MUST impedir que uma nova atualizacao de cotacao seja iniciada enquanto outra atualizacao de cotacao estiver em execucao.
- **FR-009**: O sistema MUST exibir estado vazio ou indicacao clara quando os campos de cotacao ainda nao estiverem disponiveis para uma linha.
- **FR-010**: O sistema MUST registrar separadamente, no resultado da execucao, as linhas que falharam e o motivo da falha para cada linha quando disponivel.
- **FR-011**: O sistema MUST utilizar, para cada campo de cotacao (`Valor Atual`, `Min. 52 Semanas`, `Max. 52 Semanas`), uma lista de seletores alternativos em ordem de prioridade, tentando o proximo seletor da lista quando o anterior nao retornar valor valido.
- **FR-012**: O sistema MUST aplicar um timeout de 10 segundos por requisicao de coleta e MUST tratar o esgotamento do timeout como falha da linha, sem tentativa automatica de nova requisicao (retry).
- **FR-013**: O sistema MUST ignorar silenciosamente as linhas sem link valido durante a atualizacao de cotacao, sem contabiliza-las como falha no resumo da execucao.

### Non-Functional Requirements *(mandatory)*

- **NFR-001 (Code Quality)**: A feature MUST passar validacoes de qualidade sem issues bloqueantes.
- **NFR-002 (Testing Standard)**: A feature MUST incluir testes para atualizacao assincrona de cotacoes, persistencia no JSON, exibicao das novas colunas e tratamento de falhas parciais.
- **NFR-003 (UX Consistency)**: O botao novo, os estados de carregamento e as mensagens de feedback MUST seguir o padrao visual e textual existente da aplicacao.
- **NFR-004 (Performance)**: A atualizacao de cotacao MUST aplicar timeout de 10 segundos por requisicao (sem retry automatico) e MUST concluir o processamento sequencial de todas as linhas em no maximo 420 segundos (~7 minutos) para o volume maximo esperado de 42 linhas com link valido (42 x 10s de timeout + overhead), sem bloquear permanentemente a interface.

### Key Entities *(include if feature involves data)*

- **RegistroFundo**: Representa cada linha da tabela e passa a incluir os campos de cotacao associados ao link do ativo.
- **CotacaoAtualizada**: Representa o conjunto de valores enriquecidos de uma linha, incluindo Valor Atual, Min. 52 Semanas e Max. 52 Semanas.
- **ResultadoAtualizacaoCotacao**: Representa o resumo da operacao assincrona, incluindo linhas atualizadas, linhas com falha e estado final da execucao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos registros com coleta bem-sucedida passam a conter os tres campos de cotacao no JSON.
- **SC-002**: 100% das linhas da tabela exibem as tres novas colunas sem quebrar a estrutura de exibicao.
- **SC-003**: Em caso de falha parcial, 100% das linhas com falha ficam com os tres campos de cotacao zerados no JSON e aparecem no resumo de falhas da execucao.
- **SC-004**: O usuario recebe feedback visivel ao final da operacao de atualizacao de cotacao em todos os cenarios principais.
- **SC-005**: A entrega nao possui bloqueios nos checks obrigatorios de qualidade.
- **SC-006**: A atualizacao de cotacao conclui em no maximo 420 segundos (~7 minutos) para o volume maximo esperado de 42 linhas com link valido, medido pela diferenca `finishedAt - startedAt` retornada pela API `POST /api/cotacao`.

## Assumptions

- Os links armazenados na tabela apontam para paginas de referencia com informacoes suficientes para obter os tres valores desejados.
- O formato externo pode falhar por linha, e a aplicacao deve tolerar isso sem interromper toda a operacao.
- A estrutura atual de persistencia JSON sera reutilizada para armazenar os novos campos.
- O botao `Atualizar cotacao` sera adicionado na mesma area de acoes da tela principal.
- Cada campo de cotacao tera uma lista de seletores fallback definida em fase de planejamento/implementacao, com base na estrutura observada da pagina de referencia.
