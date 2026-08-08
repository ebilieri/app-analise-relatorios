# Feature Specification: Visualizacao de Fundos da Planilha

**Feature Branch**: `001-visualizar-fundos-tabela`  
**Created**: 2026-08-07  
**Status**: Draft  
**Input**: User description: "Criar uma aplicacao em Next.js para ler a planilha \"fundos-para-analise.xlsx\". Apresentar na tela inicial os dados da planilha em uma tabela. Apresentar apenas as colunas Tipo, Papel e Link. A coluna Link deve conter um hyperlink para url indicada no conteudo da coluna. Formate a tabela de forma que fique agradadel e de facil visualizacao para o usuario."

## Clarifications

### Session 2026-08-07

- Q: Como tratar linhas com Link vazio ou invalido? -> A: Exibir a linha e mostrar "Link indisponivel" sem hyperlink.
- Q: Qual estrategia de carregamento dos dados deve ser usada? -> A: Carregar uma unica vez em um banco JSON, com verificacao na inicializacao; se o JSON existir, usar JSON; se nao existir, gerar JSON a partir da planilha; permitir atualizacao manual do JSON a partir da planilha.
- Q: Quem pode acionar a atualizacao do JSON? -> A: Qualquer visitante pode atualizar o JSON.
- Q: Como tratar atualizacoes simultaneas do JSON? -> A: Bloquear novas atualizacoes enquanto uma estiver em execucao.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar dados essenciais dos fundos (Priority: P1)

Como usuario, quero abrir a tela inicial e ver uma tabela com os fundos da planilha para consultar rapidamente as informacoes principais.

**Why this priority**: Este e o valor principal da feature. Sem a exibicao da tabela, a aplicacao nao cumpre seu objetivo.

**Independent Test**: Pode ser testada abrindo a aplicacao com uma planilha valida e verificando se a tabela mostra somente as colunas Tipo, Papel e Link com os dados esperados.

**Acceptance Scenarios**:

1. **Given** que a planilha existe e possui as colunas Tipo, Papel e Link, **When** o usuario acessa a tela inicial, **Then** a tabela e exibida com registros e apenas essas tres colunas.
2. **Given** que ha multiplas linhas na planilha, **When** o usuario acessa a tela inicial, **Then** todas as linhas validas sao exibidas na tabela.

---

### User Story 2 - Abrir referencia externa pelo campo Link (Priority: P1)

Como usuario, quero clicar no link de um fundo para abrir a pagina de referencia correspondente.

**Why this priority**: O campo Link so gera valor completo quando permite navegacao direta para a URL de cada linha.

**Independent Test**: Pode ser testada clicando em um link exibido na tabela e confirmando que a URL correspondente e acionada corretamente.

**Acceptance Scenarios**:

1. **Given** que uma linha possui URL valida na coluna Link, **When** o usuario clica no hyperlink exibido, **Then** a URL correspondente e aberta.
2. **Given** que a URL esta presente como texto na planilha, **When** a tabela e renderizada, **Then** o valor da coluna Link e apresentado como hyperlink clicavel.

---

### User Story 3 - Ler informacoes com conforto visual (Priority: P2)

Como usuario, quero uma tabela organizada e facil de ler para analisar os dados sem esforco.

**Why this priority**: Boa legibilidade melhora uso continuo e reduz erros de interpretacao, mas depende da entrega basica da tabela.

**Independent Test**: Pode ser testada avaliando a tela inicial em desktop e mobile para confirmar alinhamento, espaco entre colunas, contraste e clareza dos links.

**Acceptance Scenarios**:

1. **Given** que o usuario acessa a tabela em desktop, **When** a tela carrega, **Then** os dados aparecem com cabecalho claro, espacamento consistente e leitura facil.
2. **Given** que o usuario acessa em tela menor, **When** a tabela e exibida, **Then** o conteudo permanece legivel sem sobreposicao de texto.

---

### User Story 4 - Manter base JSON sincronizada sob demanda (Priority: P1)

Como usuario responsavel, quero atualizar o banco JSON com os dados da planilha para refletir alteracoes sem depender de novo deploy.

**Why this priority**: Define a fonte de dados operacional da aplicacao e garante continuidade de uso com dados reaproveitaveis na inicializacao.

**Independent Test**: Pode ser testada iniciando a aplicacao com e sem arquivo JSON e executando a funcionalidade de atualizacao para confirmar que os dados da tabela mudam conforme a planilha.

**Acceptance Scenarios**:

1. **Given** que o arquivo JSON existe, **When** a aplicacao inicia, **Then** a tabela e carregada usando os dados do JSON.
2. **Given** que o arquivo JSON nao existe, **When** a aplicacao inicia, **Then** o sistema gera/atualiza o JSON com dados da planilha e usa esse JSON para exibir a tabela.
3. **Given** que a planilha foi alterada, **When** o usuario aciona a atualizacao do JSON, **Then** o arquivo JSON e regravado com os dados atuais da planilha.

### Edge Cases

- O que acontece quando a planilha existe, mas esta vazia de dados?
- O que acontece quando uma ou mais colunas obrigatorias (Tipo, Papel, Link) estao ausentes?
- Quando uma linha possui Link vazio ou com formato invalido, a linha deve permanecer visivel e o campo Link deve exibir "Link indisponivel" sem hyperlink.
- Como o sistema se comporta quando ha celulas com espacos extras antes/depois do valor?
- Como o sistema se comporta quando o JSON nao existe e a planilha nao pode ser lida na inicializacao?
- Como o sistema se comporta quando a atualizacao do JSON falha durante a regravacao?
- Quando uma atualizacao do JSON estiver em execucao, novas tentativas de atualizacao devem ser bloqueadas com aviso claro ao usuario.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST usar um arquivo JSON como base de dados principal para exibicao na tela inicial.
- **FR-002**: O sistema MUST exibir na tela inicial uma tabela contendo apenas as colunas Tipo, Papel e Link.
- **FR-003**: O sistema MUST preservar a associacao correta entre os valores de cada linha nas colunas Tipo, Papel e Link.
- **FR-004**: O sistema MUST apresentar o valor da coluna Link como hyperlink clicavel apenas quando a URL da celula for valida.
- **FR-005**: O sistema MUST tratar ausencia de dados validos com mensagem clara ao usuario, sem quebrar a tela.
- **FR-006**: O sistema MUST tratar ausencia de colunas obrigatorias com mensagem clara informando o problema encontrado.
- **FR-007**: O sistema MUST manter a tabela legivel em diferentes tamanhos de tela com estrutura visual organizada.
- **FR-008**: O sistema MUST manter linhas com Link vazio ou invalido e exibir "Link indisponivel" sem hyperlink na coluna Link.
- **FR-009**: O sistema MUST verificar na inicializacao da aplicacao se o arquivo JSON existe.
- **FR-010**: Se o JSON existir, o sistema MUST carregar e apresentar os dados a partir do JSON sem reler a planilha para exibicao inicial.
- **FR-011**: Se o JSON nao existir, o sistema MUST gerar/atualizar o JSON com os dados da planilha e usar esse JSON para apresentacao inicial.
- **FR-012**: O sistema MUST disponibilizar funcionalidade para atualizar manualmente o JSON com os dados atuais da planilha.
- **FR-013**: O sistema MUST permitir que qualquer visitante acione a funcionalidade de atualizacao manual do JSON.
- **FR-014**: O sistema MUST bloquear novas solicitacoes de atualizacao do JSON enquanto uma atualizacao estiver em execucao.
- **FR-015**: O sistema MUST informar de forma explicita quando uma tentativa de atualizacao for bloqueada por atualizacao ja em andamento.

### Non-Functional Requirements *(mandatory)*

- **NFR-001 (Code Quality)**: Mudancas da feature MUST passar validacoes de qualidade definidas pelo projeto sem issues bloqueantes.
- **NFR-002 (Testing Standard)**: A feature MUST ter cobertura de testes para carregamento da planilha, renderizacao das colunas exigidas e comportamento dos hyperlinks.
- **NFR-003 (UX Consistency)**: A interface MUST manter padrao visual consistente para cabecalho, linhas e links, com foco em legibilidade.
- **NFR-004 (Performance)**: A tela inicial MUST apresentar os dados em ate 2 segundos para planilha com ate 1.000 linhas, e a atualizacao manual do JSON MUST concluir em ate 5 segundos para o mesmo volume em ambiente de referencia.
- **NFR-005 (Confiabilidade de Dados)**: O processo de leitura/gravacao do JSON MUST preservar consistencia dos registros e evitar arquivo corrompido em caso de falha de atualizacao.
- **NFR-006 (Controle de Uso da Atualizacao)**: A atualizacao manual aberta a qualquer visitante MUST fornecer feedback claro de sucesso ou falha para evitar repeticao desnecessaria de acionamentos.
- **NFR-007 (Concorrencia de Atualizacao)**: O mecanismo de bloqueio de atualizacoes simultaneas MUST evitar regravacoes concorrentes do JSON.

### Key Entities *(include if feature involves data)*

- **RegistroFundo**: Representa cada linha util da planilha, com os atributos Tipo, Papel e Link.
- **TabelaFundos**: Representa a colecao de registros exibidos ao usuario na tela inicial.
- **BaseFundosJSON**: Representa o arquivo JSON persistido contendo os registros normalizados usados pela aplicacao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das linhas validas armazenadas no JSON sao exibidas na tabela com correspondencia correta de valores.
- **SC-002**: 100% das celulas nao vazias da coluna Link sao exibidas como hyperlinks clicaveis.
- **SC-003**: Pelo menos 95% dos usuarios de teste conseguem localizar um fundo e abrir seu link em ate 30 segundos.
- **SC-004**: Em avaliacao funcional, a tabela permanece legivel em desktop e mobile sem perda de informacao essencial.
- **SC-005**: A entrega nao possui bloqueios de qualidade nos checks obrigatorios definidos para o repositorio.
- **SC-006**: A tabela e apresentada em ate 2 segundos para planilha com ate 1.000 linhas em ambiente de referencia.

## Assumptions

- A planilha `fundos-para-analise.xlsx` estara disponivel no repositorio e acessivel para criar/atualizar o JSON.
- A primeira linha da planilha contem os cabecalhos das colunas.
- Os nomes de coluna esperados sao Tipo, Papel e Link.
- URLs validas na coluna Link devem ser abertas quando o usuario clica no hyperlink.
- Edicao de dados da planilha pela interface nao faz parte do escopo desta feature.
- O JSON persistido sera considerado a fonte de dados para renderizacao da tabela na inicializacao.
- A funcionalidade de atualizacao manual do JSON ficara acessivel para qualquer visitante da aplicacao.
