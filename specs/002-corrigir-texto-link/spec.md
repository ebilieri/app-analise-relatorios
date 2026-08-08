# Feature Specification: Corrigir Texto do Link

**Feature Branch**: `002-corrigir-texto-link`  
**Created**: 2026-08-07  
**Status**: Draft  
**Input**: User description: "corrija para que o texto do link da coluna link seja a propria url"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar a URL completa no texto do link (Priority: P1)

Como usuario, quero ver a propria URL na coluna Link para identificar o destino antes de clicar.

**Why this priority**: Esta e a mudanca central solicitada e altera diretamente a forma como o dado principal e apresentado ao usuario.

**Independent Test**: Pode ser testada abrindo a tela inicial com uma planilha valida e verificando que cada link valido exibe como texto a propria URL da linha.

**Acceptance Scenarios**:

1. **Given** que uma linha possui URL valida na coluna Link, **When** a tabela e renderizada, **Then** o texto visivel do hyperlink corresponde exatamente a URL normalizada daquela linha.
2. **Given** que existem multiplas linhas com URLs diferentes, **When** a tabela e renderizada, **Then** cada linha exibe seu proprio texto de URL sem reutilizar valor de outra linha.

---

### User Story 2 - Manter fallback para links indisponiveis (Priority: P1)

Como usuario, quero continuar vendo uma indicacao clara quando um link estiver vazio ou invalido.

**Why this priority**: A mudanca no texto dos links nao pode regredir o tratamento atual de links invalidos ou vazios.

**Independent Test**: Pode ser testada com linhas contendo Link vazio e Link invalido, confirmando que o texto continua como "Link indisponivel" sem hyperlink.

**Acceptance Scenarios**:

1. **Given** que uma linha possui Link vazio, **When** a tabela e renderizada, **Then** a coluna Link mostra "Link indisponivel" sem hyperlink.
2. **Given** que uma linha possui Link invalido, **When** a tabela e renderizada, **Then** a coluna Link mostra "Link indisponivel" sem hyperlink.

---

### User Story 3 - Preservar legibilidade visual com URLs longas (Priority: P2)

Como usuario, quero continuar conseguindo ler a tabela mesmo quando a URL exibida for longa.

**Why this priority**: Mostrar a URL completa aumenta o comprimento visivel do conteudo e pode afetar a legibilidade da tabela.

**Independent Test**: Pode ser testada com URLs longas em desktop e mobile, verificando que a tabela continua legivel sem sobreposicao de conteudo.

**Acceptance Scenarios**:

1. **Given** que a coluna Link possui URL longa, **When** a tabela e exibida, **Then** o layout permanece legivel com quebra de linha ou ajuste visual consistente.
2. **Given** que o usuario acessa a tela em largura menor, **When** a URL longa e renderizada, **Then** o conteudo permanece acessivel sem ocultar informacao essencial.

### Edge Cases

- O que acontece quando a URL contem espacos extras nas extremidades antes da normalizacao?
- Como o sistema se comporta quando a URL e longa demais para caber em uma unica linha?
- Como o sistema se comporta quando o texto da URL e igual ao href, mas o destino esta indisponivel no navegador?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir, na coluna Link, a propria URL como texto visivel quando o link da linha for valido.
- **FR-002**: O sistema MUST usar a URL normalizada da linha tanto como destino do hyperlink quanto como texto visivel do hyperlink.
- **FR-003**: O sistema MUST manter o comportamento atual de exibir "Link indisponivel" sem hyperlink para links vazios.
- **FR-004**: O sistema MUST manter o comportamento atual de exibir "Link indisponivel" sem hyperlink para links invalidos.
- **FR-005**: O sistema MUST preservar a associacao correta entre o texto visivel da URL e a linha correspondente da tabela.
- **FR-006**: O sistema MUST manter a tabela legivel quando a URL exibida for longa.

### Non-Functional Requirements *(mandatory)*

- **NFR-001 (Code Quality)**: A mudanca MUST passar validacoes de qualidade sem issues bloqueantes.
- **NFR-002 (Testing Standard)**: A mudanca MUST incluir testes para renderizacao do texto da URL, fallback de links indisponiveis e impacto visual com URLs longas.
- **NFR-003 (UX Consistency)**: A interface MUST manter comportamento consistente entre href, texto visivel e fallback visual da coluna Link.
- **NFR-004 (Performance)**: A mudanca MUST nao degradar perceptivelmente o tempo de renderizacao da tabela no volume esperado da planilha.

### Key Entities *(include if feature involves data)*

- **RegistroFundo**: Representa a linha exibida na tabela, incluindo o valor normalizado de Link e seu estado de validade.
- **CelulaLinkExibida**: Representa o conteudo visual apresentado na coluna Link, podendo ser URL clicavel ou texto de fallback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das linhas com Link valido exibem a propria URL como texto visivel na coluna Link.
- **SC-002**: 100% das linhas com Link vazio ou invalido continuam exibindo "Link indisponivel" sem hyperlink.
- **SC-003**: Em verificacao funcional, nenhuma linha exibe texto de URL pertencente a outra linha.
- **SC-004**: Em avaliacao visual, a tabela permanece legivel em desktop e mobile com URLs longas.
- **SC-005**: A entrega nao possui bloqueios nos checks obrigatorios de qualidade.
- **SC-006**: O tempo de renderizacao da tabela permanece dentro do orcamento de performance ja definido para a feature base.

## Assumptions

- O comportamento de destino do hyperlink nao muda; apenas o texto visivel do link sera ajustado.
- O processo atual de normalizacao da URL continuara sendo reutilizado.
- A coluna Link continua exibindo fallback para links vazios ou invalidos.
- A validacao visual de URLs longas sera tratada sem alterar as demais colunas da tabela.
