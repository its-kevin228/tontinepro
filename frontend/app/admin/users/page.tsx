"use client";

import { useEffect, useState } from "react";
import { adminApi, type User } from "@/lib/api";
import { Search, Ban, CheckCircle, Loader2, Shield, User as UserIcon } from "lucide-react";

function RoleBadge({ role }: { role: User["role"] }) {
  const map = {
    SUPER_ADMIN:  { cls: "badge-error",   label: "Super Admin" },
    ORGANISATEUR: { cls: "badge-info",    label: "Organisateur" },
    MEMBRE:       { cls: "badge-neutral", label: "Membre" },
  };
  const { cls, label } = map[role];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function StatusBadge({ status }: { status: User["status"] }) {
  const map = {
    ACTIVE:    { cls: "badge-success", label: "Actif" },
    BANNED:    { cls: "badge-error",   label: "Banni" },
    SUSPENDED: { cls: "badge-warning", label: "Suspendu" },
  };
  const { cls, label } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    adminApi.getUsers()
      .then((res) => { setUsers(res.users); setFiltered(res.users); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : users
    );
  }, [search, users]);

  const handleBan = async (id: string, currentStatus: User["status"]) => {
    setActionLoading(id);
    try {
      if (currentStatus === "BANNED") {
        await adminApi.unbanUser(id);
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "ACTIVE" } : u));
      } else {
        await adminApi.banUser(id);
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "BANNED" } : u));
      }
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {users.length} utilisateur{users.length !== 1 ? "s" : ""} inscrits
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
        <input
          type="text"
          className="input pl-10"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tableau */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={24} className="animate-spin mx-auto" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserIcon size={32} className="mx-auto mb-3 opacity-30" />
            <p style={{ color: "var(--text-secondary)" }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-alt)" }}>
                {["Utilisateur", "Rôle", "Statut", "KYC", "Inscription", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  className="transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-alt)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Utilisateur */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "var(--surface-tertiary)", color: "var(--text-primary)" }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Rôle */}
                  <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                  {/* Statut */}
                  <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
                  {/* KYC */}
                  <td className="px-5 py-4">
                    {user.kycRequest ? (
                      <span className={`badge ${
                        user.kycRequest.status === "APPROVED" ? "badge-success" :
                        user.kycRequest.status === "REJECTED" ? "badge-error" : "badge-warning"
                      }`}>
                        {user.kycRequest.status === "APPROVED" ? "Approuvé" :
                         user.kycRequest.status === "REJECTED" ? "Rejeté" : "En attente"}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>—</span>
                    )}
                  </td>
                  {/* Inscription */}
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    {user.role !== "SUPER_ADMIN" && (
                      <button
                        id={`ban-user-${user.id}`}
                        onClick={() => handleBan(user.id, user.status)}
                        disabled={actionLoading === user.id}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: user.status === "BANNED"
                            ? "rgba(66,200,143,0.1)" : "rgba(242,95,76,0.1)",
                          color: user.status === "BANNED"
                            ? "var(--success)" : "var(--error)",
                        }}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : user.status === "BANNED" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Ban size={12} />
                        )}
                        {user.status === "BANNED" ? "Réactiver" : "Bannir"}
                      </button>
                    )}
                    {user.role === "SUPER_ADMIN" && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <Shield size={12} /> Protégé
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
