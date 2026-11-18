import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { UserPreferences } from '../../types/balance';

interface SettingsViewProps {
  preferences: UserPreferences;
  onSavePreferences: (next: UserPreferences) => void;
}

export function SettingsView({ preferences, onSavePreferences }: SettingsViewProps) {
  const [form, setForm] = useState<UserPreferences>(preferences);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      ...form,
      name: form.name.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="pb-5 border-b border-[#E5EAE8]">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
          Configuración
        </h1>
        <p className="text-sm text-[#52605E] mt-1">Perfil y preferencias de sesión</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Perfil personal */}
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#172121]">Perfil</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pref-name" className="block text-xs font-medium text-[#4E5D5B]">
                Nombre (opcional)
              </label>
              <input
                id="pref-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="¿Cómo quieres que te llame?"
                className="w-full px-3.5 py-2 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-email" className="block text-xs font-medium text-[#4E5D5B]">
                Correo
              </label>
              <input
                id="pref-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pref-city" className="block text-xs font-medium text-[#4E5D5B]">
                Ciudad
              </label>
              <input
                id="pref-city"
                type="text"
                value={form.city ?? ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-role" className="block text-xs font-medium text-[#4E5D5B]">
                Perfil profesional
              </label>
              <input
                id="pref-role"
                type="text"
                value={form.role ?? ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pref-motto" className="block text-xs font-medium text-[#4E5D5B]">
              Frase guía
            </label>
            <textarea
              id="pref-motto"
              rows={2}
              value={form.personalMotto}
              onChange={(e) => setForm({ ...form, personalMotto: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>
        </section>

        {/* Preferencias de ritmo */}
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#172121]">Avisos suaves</h2>

          <div className="divide-y divide-[#EFF2F1]">
            <label className="py-2.5 first:pt-0 flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-[#172121]">Registro matutino breve</span>
              <input
                type="checkbox"
                checked={form.morningCheckIn}
                onChange={(e) => setForm({ ...form, morningCheckIn: e.target.checked })}
                className="w-4 h-4 accent-[#135D66] rounded cursor-pointer"
              />
            </label>

            <label className="py-2.5 flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-[#172121]">Resumen semanal sereno</span>
              <input
                type="checkbox"
                checked={form.weeklyDigest}
                onChange={(e) => setForm({ ...form, weeklyDigest: e.target.checked })}
                className="w-4 h-4 accent-[#135D66] rounded cursor-pointer"
              />
            </label>

            <label className="py-2.5 last:pb-0 flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-[#172121]">Recordatorios de pausa</span>
              <input
                type="checkbox"
                checked={form.gentleReminders}
                onChange={(e) => setForm({ ...form, gentleReminders: e.target.checked })}
                className="w-4 h-4 accent-[#135D66] rounded cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Preferencias generales y asistente */}
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#172121]">Formato y asistente</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pref-ai-tone" className="block text-xs font-medium text-[#4E5D5B]">
                Tono del asistente
              </label>
              <select
                id="pref-ai-tone"
                value={form.aiTone}
                onChange={(e) =>
                  setForm({ ...form, aiTone: e.target.value as UserPreferences['aiTone'] })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                <option value="Cercano y reflexivo">Cercano y reflexivo</option>
                <option value="Directo y sereno">Directo y sereno</option>
                <option value="Estructurado y breve">Estructurado y breve</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-currency" className="block text-xs font-medium text-[#4E5D5B]">
                Moneda en Finanzas
              </label>
              <select
                id="pref-currency"
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value as UserPreferences['currency'] })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-week" className="block text-xs font-medium text-[#4E5D5B]">
                Inicio de semana
              </label>
              <select
                id="pref-week"
                value={form.weekStart}
                onChange={(e) =>
                  setForm({ ...form, weekStart: e.target.value as UserPreferences['weekStart'] })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                <option value="Lunes">Lunes</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-4">
          <div className="min-h-[24px]">
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5E8371]">
                <Check className="w-4 h-4" />
                Preferencias actualizadas para esta sesión
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#135D66] text-white text-sm font-medium hover:bg-[#0E4950] transition-colors cursor-pointer"
          >
            Guardar preferencias
          </button>
        </div>
      </form>
    </div>
  );
}
