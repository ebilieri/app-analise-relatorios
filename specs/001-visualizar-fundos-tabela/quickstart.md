# Quickstart - Visualizacao de Fundos da Planilha

## Prerequisites
- Node.js 20 LTS
- npm 10+

## Setup
1. Instalar dependencias:
   - `npm install`
2. Garantir que a planilha exista na raiz do projeto:
   - `fundos-para-analise.xlsx`
3. Iniciar ambiente de desenvolvimento:
   - `npm run dev`

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
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
