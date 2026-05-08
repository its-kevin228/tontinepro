"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Diamond, Target, Calendar, Users, Info } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function NewCirclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    frequency: "MONTHLY",
    maxMembers: "10",
    startDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/circles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          maxMembers: Number(formData.maxMembers),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      alert("Cercle créé avec succès !");
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffffe] font-sans text-[#272343] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[#2d334a]/60 hover:text-[#272343] mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au dashboard
        </Link>

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Créer un nouveau cercle</h1>
          <p className="text-[#2d334a]/60">Définissez les règles de votre tontine et invitez vos membres.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[32px] border border-[#dfe5f2] shadow-sm">
          {/* Section 1: Identité */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#ffd803]">1. Identité du cercle</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Nom du cercle</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Tontine des Entrepreneurs"
                  className="w-full px-5 py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Description (optionnel)</label>
                <textarea
                  placeholder="Expliquez l'objectif de ce cercle..."
                  className="w-full px-5 py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Configuration financière */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#ffd803]">2. Configuration Financière</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Montant de la cotisation (FCFA)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    placeholder="Ex: 50000"
                    className="w-full pl-12 pr-5 py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                  <Diamond className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2d334a]/40" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Fréquence des tours</label>
                <div className="relative">
                  <select
                    className="w-full pl-12 pr-5 py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all appearance-none"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option value="WEEKLY">Hebdomadaire</option>
                    <option value="BIWEEKLY">Bimensuelle</option>
                    <option value="MONTHLY">Mensuelle</option>
                  </select>
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2d334a]/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Logistique */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#ffd803]">3. Logistique & Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Nombre max de membres</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    className="w-full pl-12 pr-5 py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
                  />
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2d334a]/40" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Date de début prévue</label>
                <div className="relative">
                  <input
                    required
                    type="date"
                    className="w-full pl-12 pr-5 py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2d334a]/40" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#dfe5f2] flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 text-[12px] text-[#2d334a]/60 italic items-start">
              <Info className="h-4 w-4 shrink-0" />
              <p>Une fois le cercle lancé, certains paramètres ne pourront plus être modifiés.</p>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full md:w-auto px-10 py-4 bg-[#272343] text-white rounded-2xl font-bold hover:bg-[#2d334a] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Création en cours..." : "Confirmer la création"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
