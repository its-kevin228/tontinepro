const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Helper fetch avec gestion d'erreurs ─────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    apiFetch<void>("/api/auth/logout", { method: "POST" }),
};

// ─── Utilisateurs ─────────────────────────────────────────────────────────────
export const userApi = {
  getMe: () => apiFetch<{ user: User }>("/api/users/me"),
  updateMe: (body: { name?: string; image?: string }) =>
    apiFetch<{ user: User }>("/api/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  submitKyc: (documentUrl: string) =>
    apiFetch<{ kyc: KycRequest }>("/api/users/kyc", {
      method: "POST",
      body: JSON.stringify({ documentUrl }),
    }),
};

// ─── Cercles ──────────────────────────────────────────────────────────────────
export const circleApi = {
  getAll: () => apiFetch<{ circles: Circle[] }>("/api/circles"),
  getById: (id: string) => apiFetch<{ circle: Circle }>(`/api/circles/${id}`),
  create: (body: CreateCircleDto) =>
    apiFetch<{ circle: Circle }>("/api/circles", { method: "POST", body: JSON.stringify(body) }),
  activate: (id: string) =>
    apiFetch<{ circle: Circle }>(`/api/circles/${id}/activate`, { method: "POST" }),
};

// ─── Cycles ───────────────────────────────────────────────────────────────────
export const cycleApi = {
  getByCircle: (circleId: string) =>
    apiFetch<{ cycles: Cycle[] }>(`/api/circles/${circleId}/cycles`),
  create: (circleId: string) =>
    apiFetch<{ cycle: Cycle }>(`/api/circles/${circleId}/cycles`, { method: "POST" }),
  close: (cycleId: string, beneficiaryId?: string) =>
    apiFetch<{ cycle: Cycle }>(`/api/cycles/${cycleId}/close`, {
      method: "PATCH",
      body: JSON.stringify({ beneficiaryId }),
    }),
};

// ─── Paiements ────────────────────────────────────────────────────────────────
export const paymentApi = {
  getAll: (params?: { cycleId?: string; circleId?: string; status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return apiFetch<{ payments: Payment[] }>(`/api/payments${qs}`);
  },
  create: (body: CreatePaymentDto) =>
    apiFetch<{ payment: Payment }>("/api/payments", { method: "POST", body: JSON.stringify(body) }),
  confirm: (id: string) =>
    apiFetch<{ payment: Payment }>(`/api/payments/${id}/confirm`, { method: "PATCH" }),
  reject: (id: string) =>
    apiFetch<{ payment: Payment }>(`/api/payments/${id}/reject`, { method: "PATCH" }),
};

// ─── Invitations ──────────────────────────────────────────────────────────────
export const invitationApi = {
  create: (circleId: string) =>
    apiFetch<{ invitation: Invitation }>(`/api/circles/${circleId}/invitations`, { method: "POST" }),
  verify: (token: string) =>
    apiFetch<{ invitation: Invitation; circle: Circle }>(`/api/invitations/${token}`),
  accept: (token: string) =>
    apiFetch<{ membership: Membership }>(`/api/invitations/${token}/accept`, { method: "POST" }),
  revoke: (id: string) =>
    apiFetch<void>(`/api/invitations/${id}`, { method: "DELETE" }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => apiFetch<{ notifications: Notification[]; unreadCount: number }>("/api/notifications"),
  markRead: (id: string) =>
    apiFetch<void>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    apiFetch<void>("/api/notifications/read-all", { method: "PATCH" }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => apiFetch<AdminDashboard>("/api/admin/dashboard"),
  getUsers: () => apiFetch<{ users: User[] }>("/api/admin/users"),
  banUser: (id: string) => apiFetch<void>(`/api/admin/users/${id}/ban`, { method: "PATCH" }),
  unbanUser: (id: string) => apiFetch<void>(`/api/admin/users/${id}/unban`, { method: "PATCH" }),
  getKyc: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return apiFetch<{ requests: KycRequest[] }>(`/api/admin/kyc${qs}`);
  },
  reviewKyc: (id: string, action: "approve" | "reject", note?: string) =>
    apiFetch<void>(`/api/admin/kyc/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action, note }),
    }),
  getSettings: () => apiFetch<{ settings: Record<string, string> }>("/api/admin/settings"),
  updateSetting: (key: string, value: string) =>
    apiFetch<void>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ key, value }),
    }),
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ORGANISATEUR" | "MEMBRE";
  status: "ACTIVE" | "BANNED" | "SUSPENDED";
  image?: string;
  createdAt: string;
  kycRequest?: { status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: string };
  memberships?: Membership[];
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: "WEEKLY" | "MONTHLY";
  maxMembers: number;
  isPublic: boolean;
  status: "PENDING" | "ACTIVE" | "CLOSED";
  createdAt: string;
  memberships?: Membership[];
  cycles?: Cycle[];
}

export interface Membership {
  id: string;
  role: "ORGANISATEUR" | "MEMBRE";
  order?: number;
  joinedAt: string;
  circle?: Circle;
  user?: User;
}

export interface Cycle {
  id: string;
  circleId: string;
  number: number;
  startDate: string;
  endDate?: string;
  beneficiary?: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  createdAt: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  userId: string;
  cycleId: string;
  amount: number;
  method: "CASH" | "VIREMENT" | "MOBILE_MONEY";
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  confirmedAt?: string;
  createdAt: string;
  user?: Pick<User, "id" | "name" | "email">;
  cycle?: Pick<Cycle, "id" | "number" | "circleId">;
}

export interface Invitation {
  id: string;
  circleId: string;
  token: string;
  email?: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface KycRequest {
  id: string;
  userId: string;
  documentUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  user?: Pick<User, "id" | "name" | "email">;
}

export interface AdminDashboard {
  totalUsers: number;
  activeCircles: number;
  totalPayments: number;
  pendingKyc: number;
  totalVolume: number;
}

export interface CreateCircleDto {
  name: string;
  description?: string;
  amount: number;
  frequency: "WEEKLY" | "MONTHLY";
  maxMembers: number;
  isPublic?: boolean;
}

export interface CreatePaymentDto {
  cycleId: string;
  memberId: string;
  amount: number;
  method?: "CASH" | "VIREMENT" | "MOBILE_MONEY";
}
