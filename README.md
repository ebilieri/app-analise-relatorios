# App Analise Relatorios

Aplicacao web em Next.js para visualizar dados da planilha `fundos-para-analise.xlsx` em uma tabela com as colunas `Tipo`, `Papel` e `Link`.

Os dados exibidos na interface sao carregados a partir de um arquivo JSON local. Na inicializacao da aplicacao:

- se `data/fundos-db.json` existir, a aplicacao usa esse arquivo como fonte de dados;
- se o arquivo nao existir, a aplicacao tenta gerar o JSON a partir da planilha;
- a interface tambem oferece uma acao manual para atualizar o JSON com base na planilha.

## Funcionalidades

- Leitura da planilha `fundos-para-analise.xlsx`
- Exibicao dos dados em tabela na tela inicial
- Exibicao da propria URL como texto visivel para links validos
- Renderizacao de links validos como hyperlink clicavel
- Exibicao de `Link indisponivel` para links vazios ou invalidos
- Atualizacao manual do cache JSON
- Bloqueio de atualizacoes concorrentes

## Tecnologias

- Next.js 15
- React 18
- TypeScript
- `xlsx` para leitura da planilha
- `zod` para validacao dos dados
- Vitest para testes unitarios e de integracao
- Playwright para testes E2E

## Requisitos

- Node.js 20 LTS
- npm 10+

## Como executar localmente

### 1. Instalar dependencias

Use um dos comandos abaixo:

```powershell
npm install
```

Se o terminal nao resolver `npm` corretamente no Windows, use:

```powershell
"C:\Program Files\nodejs\npm.cmd" install
```

### 2. Garantir a planilha na raiz do projeto

O arquivo abaixo precisa estar presente na raiz do repositorio:

```text
fundos-para-analise.xlsx
```

### 3. Iniciar a aplicacao em modo de desenvolvimento

```powershell
npm run dev
```

Alternativa no Windows, se necessario:

```powershell
"C:\Program Files\nodejs\npm.cmd" run dev
```

Depois disso, abra:

```text
http://localhost:3000
```

## Fluxo de dados

1. A aplicacao verifica se `data/fundos-db.json` existe.
2. Se existir, carrega os dados desse JSON.
3. Se nao existir, tenta gerar o JSON a partir da planilha.
4. A rota de atualizacao manual reprocessa a planilha e regrava o JSON.

## Scripts disponiveis

```powershell
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run test:watch
npm run test:e2e
npm run perf:smoke
```

## Testes

### Testes unitarios e de integracao

```powershell
npm run test
```

### Testes E2E

Antes da primeira execucao, instale o navegador do Playwright:

```powershell
.\node_modules\.bin\playwright.cmd install chromium
```

Depois execute:

```powershell
npm run test:e2e
```

### Lint e typecheck

```powershell
npm run lint
npm run typecheck
```

## Estrutura principal

```text
app/
	api/
		fundos/
		refresh/
	globals.css
	layout.tsx
	page.tsx
components/
	fundos-table.tsx
	status-banner.tsx
lib/
	api-response.ts
	funds-schema.ts
	funds-service.ts
	json-store.ts
	spreadsheet-reader.ts
data/
tests/
specs/
```

## Problemas comuns

### Falha ao carregar dados

Verifique se:

- a planilha existe na raiz do projeto;
- a planilha contem as colunas `Tipo`, `Papel` e `Link`;
- o processo tem permissao para escrever em `data/`.

### Erro `Cannot access file ...fundos-para-analise.xlsx`

Se a aplicacao retornar a mensagem `Cannot access file ...fundos-para-analise.xlsx`, isso pode nao significar que o arquivo esta ausente.

Neste projeto, esse erro ja ocorreu quando a leitura era feita com `XLSX.readFile(...)` dentro do runtime do Next.js. Mesmo com o arquivo existente e legivel no disco, a leitura falhava no ambiente empacotado do servidor.

Por isso, a implementacao atual em [lib/spreadsheet-reader.ts](lib/spreadsheet-reader.ts) usa esta estrategia:

- leitura do arquivo com `fs.readFile(...)`;
- parse do conteudo com `XLSX.read(buffer, { type: "buffer" })`.

Se esse erro voltar a aparecer, valide primeiro:

- se o arquivo realmente existe na raiz do projeto;
- se o processo Node tem permissao de leitura no arquivo;
- se a leitura esta sendo feita via buffer, e nao com `XLSX.readFile(...)`.

### Erro ao executar testes E2E

Se o Playwright reclamar de browser ausente, rode:

```powershell
.\node_modules\.bin\playwright.cmd install chromium
```

### Erro com o comando `npm`

Em alguns terminais do Windows, pode ser necessario usar o caminho completo:

```powershell
"C:\Program Files\nodejs\npm.cmd" run dev
```

## Observacoes

- O refresh manual do JSON esta aberto para qualquer visitante nesta versao.
- Em caso de falha durante refresh, a aplicacao deve preservar o ultimo JSON valido.
- A validacao de usabilidade com participantes reais ainda depende de execucao manual fora da automacao local.
