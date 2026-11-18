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
      name: form.name.trim() || 'Sofía',
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-7 max-w-3xl">
      <div className="pb-6 border-b border-[#E5EAE8] space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
          Configuración
        </h1>
        <p className="text-sm text-[#4E5D5B]">
          Ajusta tu perfil y preferencias personales para que BALANCE OS se adapte a tu ritmo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Perfil personal */}
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#172121]">Perfil personal</h2>
            <p className="text-xs text-[#768482] mt-0.5">
              Información básica de demostración (almacenada solo en esta sesión)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pref-name" className="block text-xs font-medium text-[#4E5D5B]">
                Cómo te gustaría que te saludemos
              </label>
              <input
                id="pref-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pref-email" className="block text-xs font-medium text-[#4E5D5B]">
                Correo personal (demo)
              </label>
              <input
                id="pref-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pref-motto" className="block text-xs font-medium text-[#4E5D5B]">
              Intención o frase guía
            </label>
            <textarea
              id="pref-motto"
              rows={2}
              value={form.personalMotto}
              onChange={(e) => setForm({ ...form, personalMotto: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>
        </section>

        {/* Preferencias de ritmo */}
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#172121]">Ritmo y acompañamiento</h2>
            <p className="text-xs text-[#768482] mt-0.5">
              Configura avisos suaves sin alarmas invasivas
            </p>
          </div>

          <div className="divide-y divide-[#EFF2F1]">
            <label className="py-3 first:pt-0 flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#172121]">Registro matutino breve</p>
                <p className="text-xs text-[#768482]">
                  Invitación amable al iniciar el día para notar tu energía
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.morningCheckIn}
                onChange={(e) => setForm({ ...form, morningCheckIn: e.target.checked })}
                className="w-4 h-4 accent-[#135D66] rounded cursor-pointer"
              />
            </label>

            <label className="py-3 flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#172121]">Resumen semanal sereno</p>
                <p className="text-xs text-[#768482]">
                  Vista de cierre de semana centrada en equilibrio, no en productividad
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.weeklyDigest}
                onChange={(e) => setForm({ ...form, weeklyDigest: e.target.checked })}
                className="w-4 h-4 accent-[#135D66] rounded cursor-pointer"
              />
            </label>

            <label className="py-3 last:pb-0 flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#172121]">Recordatorios de pausa</p>
                <p className="text-xs text-[#768482]">
                  Sugerencias sutiles entre bloques largos de concentración
                </p>
              </div>
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
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#172121]">Formato y asistente</h2>
            <p className="text-xs text-[#768482] mt-0.5">
              Opciones visuales y tono del panel lateral de conversación
            </p>
          </div>

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
