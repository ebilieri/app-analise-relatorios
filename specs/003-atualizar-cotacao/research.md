# Research: Atualizar Cotacao

## 1. Biblioteca de parsing de HTML

- **Decision**: Usar `cheerio` para carregar o HTML da pagina externa e aplicar seletores CSS.
- **Rationale**: API de seletores CSS mapeia diretamente para o requisito de "lista de seletores fallback por campo" (FR-011); leve o suficiente para uso em runtime de producao (ao contrario de `jsdom`, hoje devDependency usada apenas em testes); amplamente utilizada e mantida para scraping em Node.
- **Alternatives considered**:
  - Regex sobre o HTML bruto: rejeitado por fragilidade a mudancas de marcacao e dificuldade em expressar prioridade de fallback.
  - `jsdom` em producao: rejeitado por overhead maior de parsing/DOM completo quando so precisamos de consultas simples por seletor.

## 2. Timeout e cancelamento por requisicao

- **Decision**: Usar `fetch` nativo do Node 20 combinado com `AbortController` e `setTimeout(10_000)` para abortar a requisicao apos 10s, sem retry automatico.
- **Rationale**: Atende FR-012 diretamente sem adicionar dependencia extra (`fetch`/`AbortController` sao globais no Node 20 LTS, ja usado no projeto).
- **Alternatives considered**:
  - `axios` com `timeout` configuravel: rejeitado por introduzir dependencia adicional sem beneficio sobre a solucao nativa.

## 3. Modelo de execucao sequencial

- **Decision**: Loop `for...of` assincrono percorrendo os registros com `linkStatus === "valid"`, processando um de cada vez (`await` por iteracao) dentro de uma funcao orquestradora com trava de execucao unica (`quoteRefreshInProgress`), no mesmo padrao de `refreshFunds` em `lib/funds-service.ts`.
- **Rationale**: Atende diretamente FR-003 (sequencial) e FR-008 (uma execucao por vez) reaproveitando um padrao ja validado no codebase.
- **Alternatives considered**:
  - Fila com biblioteca externa (ex.: `p-queue`): rejeitado por ser desnecessario para concorrencia 1 (sequencial simples).

## 4. Persistencia dos novos campos no schema Zod

- **Decision**: Adicionar campos explicitos ao `fundRecordSchema` (`quoteValorAtual`, `quoteMin52Semanas`, `quoteMax52Semanas`, `quoteStatus`, `quoteUpdatedAt`, `quoteFailureReason`), todos nullable/opcionais.
- **Rationale**: `z.object()` remove por padrao chaves nao declaradas no schema durante `parse` (modo "strip"). Sem declarar os campos explicitamente, os valores de cotacao seriam descartados ao persistir/ler o JSON via `dbSchema.parse`.
- **Alternatives considered**:
  - Usar `.passthrough()` no schema: rejeitado por reduzir a garantia de tipo/validacao dos novos campos e permitir dados invalidos silenciosamente.

## 5. Formato de armazenamento dos valores de cotacao

- **Decision**: Armazenar os tres valores como texto normalizado (`string | null`), preservando o formato de exibicao (ex.: `"R$ 12,34"` ou `"12,34"` conforme capturado, apenas com trim de espacos), em vez de converter para `number`.
- **Rationale**: Consistente com o padrao existente do projeto, onde todos os campos de registro sao tratados como texto (`tipo`, `papel`, `linkDisplay`); evita bugs de localizacao (formato BR `1.234,56`) e mantem a complexidade de implementacao baixa, já que o requisito e apenas exibir o valor na tabela (FR-005), nao realizar calculos.
- **Alternatives considered**:
  - Converter para `number` (parseFloat com normalizacao de milhar/decimal BR): rejeitado por complexidade/risco de erro de parsing sem necessidade funcional comprovada (nenhum requisito pede calculo numerico).

## 6. Exclusao mutua entre "Atualizar dados" e "Atualizar cotacao"

- **Decision**: Introduzir um lock compartilhado (ou verificacao cruzada dos dois flags `refreshInProgress` e `quoteRefreshInProgress`) para impedir que a atualizacao de cotacao rode simultaneamente com a atualizacao de dados da planilha, ja que ambas escrevem no mesmo arquivo `data/fundos-db.json` via `writeDbAtomic`.
- **Rationale**: Embora a especificacao (FR-008) so mencione bloqueio entre execucoes da propria atualizacao de cotacao, as duas operacoes fazem read-modify-write no mesmo arquivo; rodar ambas ao mesmo tempo pode causar perda de dados (last-write-wins sobrescrevendo campos escritos pela outra operacao). Bloquear execucao cruzada e a extensao minima necessaria para preservar integridade dos dados, sem alterar o contrato funcional descrito na spec.
- **Alternatives considered**:
  - Locks totalmente independentes (rejeitado: risco real de corrupcao/perda de dados por escrita concorrente no mesmo arquivo).

## 7. Seletores fallback para statusinvest

- **Decision**: Definir em `lib/quote-selectors.ts` uma lista ordenada de seletores CSS candidatos por campo (`valorAtual`, `min52Semanas`, `max52Semanas`), tentando cada seletor em ordem ate obter um valor de texto nao vazio; a lista inicial e baseada na estrutura observada publicamente da pagina de ativo do statusinvest e MUST ser validada/ajustada durante a implementacao com uma pagina real de exemplo.
- **Rationale**: Atende FR-011; isola o acoplamento com a marcacao externa em um unico modulo de configuracao, facilitando manutencao caso o site mude a estrutura.
- **Alternatives considered**:
  - Selecionar por texto/label fixo (`:contains()`): rejeitado como fallback secundario apenas, pois `cheerio` suporta mas e menos preciso que seletores estruturais; mantido como opcao de ultimo nivel na lista de fallback quando aplicavel.

## Resumo

Todas as incognitas tecnicas relevantes para a implementacao foram resolvidas. Nenhum item permanece como `NEEDS CLARIFICATION`.
