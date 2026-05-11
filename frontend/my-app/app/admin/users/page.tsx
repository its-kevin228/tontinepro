"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Users,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Search,
  Ban,
  CheckCircle,
} from "lucide-react";

type UserStatus = "ACTIVE" | "BANNED" | "SUSPENDED";
type UserRole = "SUPER_ADMIN" | "ORGANISATEUR" | "MEMBRE";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  kycRequest: { status: string } | null;
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-[#272343] text-[#ffd803]" },
  ORGANISATEUR: { label: "Organisateur", color: "bg-[#ffd803]/10 text-[#b38a00]" },
  MEMBRE: { label: "Membre", color: "bg-[#bae8e8]/30 text-[#272343]" },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: "Actif", color: "bg-[#42c88f]/10 text-[#42c88f]", icon: CheckCircle },
  BANNED: { label: "Banni", color: "bg-[#f25f4c]/10 text-[#f25f4c]", icon: Ban },
  SUSPENDED: { label: "Suspendu", color: "bg-[#ffd803]/10 text-[#b38a00]", icon: ShieldAlert },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/admin/users");
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = search.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        )
      );
    }
  }, [search, users]);

  const handleBan = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) return;
    setActionLoading(userId);
    try {
      await fetchApi(`/admin/users/${userId}/ban`, { method: "PATCH" });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir débannir cet utilisateur ?")) return;
    setActionLoading(userId);
    try {
      await fetchApi(`/admin/users/${userId}/unban`, { method: "PATCH" });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Gestion <span className="text-[#ffd803]">Utilisateurs</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Consultez, bannissez ou débannissez les utilisateurs.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2d334a]/30" />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all placeholder:text-[#a7a9be]"
        />
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: users.length, color: "bg-[#e3f6f5]" },
          {
            label: "Actifs",
            value: users.filter((u) => u.status === "ACTIVE").length,
            color: "bg-[#42c88f]/10",
          },
          {
            label: "Bannis",
            value: users.filter((u) => u.status === "BANNED").length,
            color: "bg-[#f25f4c]/10",
          },
          {
            label: "Organisateurs",
            value: users.filter((u) => u.role === "ORGANISATEUR").length,
            color: "bg-[#ffd803]/10",
          },
        ].map((stat, i) => (
          <div key={i} className={`p-4 ${stat.color} rounded-2xl border border-[#dfe5f2]`}>
            <p className="text-[10px] uppercase font-black tracking-widest text-[#2d334a]/40">
              {stat.label}
            </p>
            <p className="text-3xl font-black text-[#272343] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-base h-20 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card-base text-center py-20">
          <Users className="h-12 w-12 text-[#2d334a]/20 mx-auto mb-4" />
          <p className="font-black text-[#272343] text-lg">Aucun utilisateur trouvé</p>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Essayez de modifier votre recherche.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const roleCfg = ROLE_CONFIG[user.role];
            const statusCfg = STATUS_CONFIG[user.status];
            const StatusIcon = statusCfg.icon;
            const isSuperAdmin = user.role === "SUPER_ADMIN";

            return (
              <div
                key={user.id}
                className="card-base flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#ffd803] transition-all"
              >
                {/* Infos */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#e3f6f5] rounded-2xl flex items-center justify-center font-black text-[#272343] text-lg shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-[#272343]">{user.name}</p>
                    <p className="text-sm text-[#2d334a]/60 font-medium">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md ${roleCfg.color}`}
                      >
                        {roleCfg.label}
                      </span>
                      {user.kycRequest && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#bae8e8]/30 text-[#272343]">
                          KYC: {user.kycRequest.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statut + actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${statusCfg.color}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusCfg.label}
                  </span>

                  {!isSuperAdmin && (
                    <>
                      {user.status === "BANNED" ? (
                        <button
                          onClick={() => handleUnban(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#42c88f] text-white text-xs font-black rounded-xl hover:bg-[#38b07d] transition-all disabled:opacity-50"
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Débannir
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBan(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#f25f4c] text-white text-xs font-black rounded-xl hover:bg-[#d94f3d] transition-all disabled:opacity-50"
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Ban className="h-3.5 w-3.5" />
                          )}
                          Bannir
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
