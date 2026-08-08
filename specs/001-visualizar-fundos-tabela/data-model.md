# Data Model - Visualizacao de Fundos da Planilha

## Entity: RegistroFundo
- Description: Registro normalizado exibido na tabela principal.
- Fields:
  - id: string (gerado a partir de hash da linha ou indice estavel)
  - tipo: string (obrigatorio, texto limpo)
  - papel: string (obrigatorio, texto limpo)
  - linkRaw: string | null (valor original vindo da planilha)
  - linkUrl: string | null (URL validada para hyperlink)
  - linkDisplay: string ("Link" quando valido, "Link indisponivel" quando invalido/vazio)
  - linkStatus: "valid" | "invalid" | "empty"
- Validation rules:
  - tipo e papel devem existir apos trim; caso vazio, linha pode ser descartada conforme regra de negocio definida no service.
  - linkUrl so e preenchido quando a URL passa validacao.
  - linkDisplay deve ser derivado de linkStatus.

## Entity: BaseFundosJSON
- Description: Representa o arquivo persistido com metadados e colecao de registros.
- Fields:
  - version: number
  - generatedAt: string (ISO datetime)
  - sourceFile: string (ex.: fundos-para-analise.xlsx)
  - rowCount: number
  - records: RegistroFundo[]
- Validation rules:
  - rowCount deve corresponder ao tamanho de records.
  - generatedAt deve ser atualizado a cada refresh bem-sucedido.

## Entity: UpdateState
- Description: Estado de controle de concorrencia para atualizacao de JSON.
- Fields:
  - inProgress: boolean
  - startedAt: string | null
  - lastStatus: "idle" | "success" | "failed" | "blocked"
  - lastMessage: string | null
- Validation rules:
  - Apenas uma atualizacao ativa por vez (inProgress = true).

## Relationships
- BaseFundosJSON 1:N RegistroFundo
- UpdateState e transversal ao processo de refresh (nao persistido obrigatoriamente em disco nesta fase).

## State Transitions
- Startup:
  - JSON existe -> carregar BaseFundosJSON -> status "idle"
  - JSON nao existe -> executar refresh inicial -> status "success" ou "failed"
- Refresh manual:
  - idle -> inProgress -> success
  - idle -> inProgress -> failed
  - inProgress + nova solicitacao -> blocked
