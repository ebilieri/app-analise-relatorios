# Data Model - Corrigir Texto do Link

## Entity: RegistroFundo
- Description: Registro exibido na tabela principal.
- Relevant fields for this change:
  - linkRaw: string | null
  - linkUrl: string | null
  - linkDisplay: string
  - linkStatus: "valid" | "invalid" | "empty"
- Validation rules:
  - Quando `linkStatus` for `valid`, `linkUrl` deve existir e o texto visivel da celula deve corresponder a `linkUrl`.
  - Quando `linkStatus` for `invalid` ou `empty`, o texto visivel deve ser `Link indisponivel`.

## Entity: CelulaLinkExibida
- Description: Representa a renderizacao final da coluna Link na tabela.
- Fields:
  - href: string | null
  - visibleText: string
  - fallback: boolean
- Rules:
  - `href` e `visibleText` usam a mesma URL quando o link e valido.
  - `fallback=true` quando `visibleText` for `Link indisponivel`.
