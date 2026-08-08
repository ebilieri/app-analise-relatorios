/**
 * Shared write lock for operations that write to data/fundos-db.json.
 * Both refreshFunds (Atualizar dados) and updateQuotes (Atualizar cotacao)
 * must check this lock before writing to prevent concurrent write corruption.
 */
let writeInProgress = false;

export function isWriteInProgress(): boolean {
  return writeInProgress;
}

export function setWriteInProgress(value: boolean): void {
  writeInProgress = value;
}
