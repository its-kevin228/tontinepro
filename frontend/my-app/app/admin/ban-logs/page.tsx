"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Ban, CheckCircle2, RefreshCw, ScrollText } from "lucide-react";

interface BanLog {
  id: string;
  action: "BAN" | "UNBAN";
  reason: string | null;
  createdAt: string;
  target: { id: string; name: string; email: string };
  admin: { id: string; name: string };
}

export default function BanLogsPage() {
  const [logs, setLogs] = useState<BanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/admin/ban-logs");
      setLogs(data.logs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Journal <span className="text-[#ffd803]">Bannissements</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Historique complet des actions de bannissement et débannissement.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[#f25f4c]/5 border border-[#f25f4c]/20 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2d334a]/40">
            Total bannissements
          </p>
          <p className="text-3xl font-black text-[#f25f4c] mt-1">
            {logs.filter((l) => l.action === "BAN").length}
          </p>
        </div>
        <div className="p-5 bg-[#42c88f]/5 border border-[#42c88f]/20 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2d334a]/40">
            Total débannissements
          </p>
          <p className="text-3xl font-black text-[#42c88f] mt-1">
            {logs.filter((l) => l.action === "UNBAN").length}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-base h-20 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card-base text-center py-24">
          <ScrollText className="h-12 w-12 text-[#2d334a]/20 mx-auto mb-4" />
          <p className="font-black text-[#272343] text-lg">Aucune action enregistrée</p>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Les bannissements et débannissements apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="card-base flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#ffd803] transition-all"
            >
              {/* Icône action */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    log.action === "BAN"
                      ? "bg-[#f25f4c]/10"
                      : "bg-[#42c88f]/10"
                  }`}
                >
                  {log.action === "BAN" ? (
                    <Ban className="h-5 w-5 text-[#f25f4c]" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-[#42c88f]" />
                  )}
                </div>

                {/* Infos */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-[#272343]">{log.target.name}</p>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                        log.action === "BAN"
                          ? "bg-[#f25f4c]/10 text-[#f25f4c]"
                          : "bg-[#42c88f]/10 text-[#42c88f]"
                      }`}
                    >
                      {log.action === "BAN" ? "BANNI" : "DÉBANNI"}
                    </span>
                  </div>
                  <p className="text-sm text-[#2d334a]/60 font-medium">
                    {log.target.email}
                  </p>
                  {log.reason && (
                    <p className="text-xs text-[#2d334a]/40 font-medium italic mt-0.5">
                      Raison : {log.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Admin + date */}
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-[#272343]">
                  Par {log.admin.name}
                </p>
                <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest mt-0.5">
                  {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  à{" "}
                  {new Date(log.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
