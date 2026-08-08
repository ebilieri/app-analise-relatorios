"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FundosTable } from "@/components/fundos-table";
import { StatusBanner } from "@/components/status-banner";
import type { FundRecord } from "@/lib/funds-schema";

type FundsApiResponse = {
  generatedAt: string;
  rowCount: number;
  records: FundRecord[];
  discardedCount: number;
};

type RefreshResponse = {
  status: "success" | "failed" | "blocked";
  message: string;
  rowCount?: number;
  generatedAt?: string;
};

export default function HomePage() {
  const [rows, setRows] = useState<FundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyRefresh, setBusyRefresh] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const loadFunds = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/fundos", { cache: "no-store" });
      const payload = (await response.json()) as FundsApiResponse | { message?: string };

      if (!response.ok) {
        const errorMessage = "message" in payload && payload.message ? payload.message : "Falha ao carregar dados";
        setRows([]);
        setMessage({ tone: "error", text: errorMessage });
        return;
      }

      const okPayload = payload as FundsApiResponse;
      setRows(okPayload.records);
      setGeneratedAt(okPayload.generatedAt);
      if (okPayload.records.length === 0) {
        setMessage({ tone: "info", text: "Nenhum dado valido encontrado para exibicao." });
      }
    } catch {
      setRows([]);
      setMessage({ tone: "error", text: "Falha ao carregar dados" });
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setBusyRefresh(true);
    try {
      const response = await fetch("/api/refresh", { method: "POST" });
      const payload = (await response.json()) as RefreshResponse;

      if (response.status === 409) {
        setMessage({ tone: "info", text: payload.message || "Atualizacao ja em andamento" });
        return;
      }

      if (!response.ok || payload.status === "failed") {
        setMessage({ tone: "error", text: payload.message || "Falha ao atualizar JSON a partir da planilha" });
        return;
      }

      setMessage({ tone: "success", text: payload.message || "JSON atualizado com sucesso" });
      await loadFunds();
    } catch {
      setMessage({ tone: "error", text: "Falha ao atualizar JSON a partir da planilha" });
    } finally {
      setBusyRefresh(false);
    }
  }, [loadFunds]);

  useEffect(() => {
    void loadFunds();
  }, [loadFunds]);

  const generatedAtLabel = useMemo(() => {
    if (!generatedAt) return "-";
    return new Date(generatedAt).toLocaleString("pt-BR");
  }, [generatedAt]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <h1>Analise de Fundos</h1>
          <p>Visualizacao em tabela com cache JSON e atualizacao manual da planilha.</p>
        </div>
        <button type="button" onClick={refresh} disabled={busyRefresh} className="refresh-btn">
          {busyRefresh ? "Atualizando..." : "Atualizar dados"}
        </button>
      </header>

      {message ? <StatusBanner tone={message.tone} message={message.text} /> : null}

      <section className="meta">
        <span>Ultima geracao: {generatedAtLabel}</span>
      </section>

      {loading ? <p className="loading">Carregando dados...</p> : <FundosTable rows={rows} />}
    </main>
  );
}
