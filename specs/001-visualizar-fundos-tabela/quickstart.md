# Quickstart - Visualizacao de Fundos da Planilha

## Prerequisites
- Node.js 20 LTS
- npm 10+

## Setup
1. Instalar dependencias:
   - `"C:\\Program Files\\nodejs\\npm.cmd" install`
2. Garantir que a planilha exista na raiz do projeto:
   - `fundos-para-analise.xlsx`
3. Iniciar ambiente de desenvolvimento:
   - `"C:\\Program Files\\nodejs\\npm.cmd" run dev`

4. Instalar browser para testes E2E:
   - `.\\node_modules\\.bin\\playwright.cmd install chromium`

## First Run Behavior
- Na inicializacao da aplicacao:
  - Se `data/fundos-db.json` existir, os dados serao lidos desse arquivo.
  - Se nao existir, o sistema deve criar/atualizar o JSON com base na planilha e usar esse JSON.

## Manual Refresh Flow
1. Abrir tela inicial.
2. Acionar comando/botao de atualizacao de dados.
3. Validar retorno:
   - Sucesso: mensagem de confirmacao e timestamp atualizado.
   - Bloqueio: mensagem "Atualizacao ja em andamento".
   - Falha: mensagem explicita de erro sem quebrar a tela.

## Verification Checklist
- A tabela exibe apenas Tipo, Papel e Link.
- Links validos sao clicaveis.
- Links invalidos/vazios mostram "Link indisponivel" sem hyperlink.
- Atualizacao manual regrava JSON e reflete dados novos.
- Tentativas concorrentes sao bloqueadas.

## Suggested Test Commands
- `"C:\\Program Files\\nodejs\\npm.cmd" run lint`
- `"C:\\Program Files\\nodejs\\npm.cmd" run test`
- `"C:\\Program Files\\nodejs\\npm.cmd" run test:e2e`
