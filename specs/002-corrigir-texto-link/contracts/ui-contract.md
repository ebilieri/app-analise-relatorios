# UI Contract - Corrigir Texto do Link

## Table Column: Link
- Quando `linkStatus` for `valid`:
  - o `href` do hyperlink deve ser `linkUrl`
  - o texto visivel do hyperlink deve ser exatamente `linkUrl`
- Quando `linkStatus` for `empty` ou `invalid`:
  - nao deve existir hyperlink
  - o texto visivel deve ser `Link indisponivel`

## Visual Behavior
- URLs longas devem permanecer legiveis com quebra de linha ou ajuste visual consistente.
- O `title` da celula pode ser mantido para exibicao completa quando aplicavel.
