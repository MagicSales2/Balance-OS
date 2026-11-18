import React, { useState } from 'react';
import { ArrowRight, Check, Plus, Sparkles } from 'lucide-react';
import {
  ActivityEntry,
  Commitment,
  DailyIntention,
  EnergyState,
  LifeSpace,
  NavSection,
  UserPreferences,
} from '../../types/balance';
import { LifeBalanceSection } from '../dashboard/LifeBalanceSection';
import { TONE_STYLES } from '../ui/SpaceIcon';

interface HomeViewProps {
  preferences: UserPreferences;
  energy: EnergyState;
  onUpdateEnergy: (next: EnergyState) => void;
  hasWellbeingCheckIn: boolean;
  onOpenAdaptivePlanning: () => void;
  reorganizationNotice: boolean;
  intentions: DailyIntention[];
  onToggleIntention: (id: string) => void;
  onAddIntention: (title: string, spaceId: string) => void;
  spaces: LifeSpace[];
  commitments: Commitment[];
  recentActivity: ActivityEntry[];
  onNavigate: (section: NavSection) => void;
  onAskAi: (prompt: string) => void;
}

export function HomeView({
  preferences,
  energy,
  onUpdateEnergy,
  hasWellbeingCheckIn,
  onOpenAdaptivePlanning,
  reorganizationNotice,
  intentions,
  onToggleIntention,
  onAddIntention,
  spaces,
  commitments,
  recentActivity,
  onNavigate,
  onAskAi,
}: HomeViewProps) {
  const [newIntention, setNewIntention] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0]?.id ?? 'bienestar');
  const [addingIntention, setAddingIntention] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  const visibleSpaces = spaces.filter((s) => s.visible).slice(0, 5);
  const upcomingCommitments = commitments.filter((c) => !c.completed).slice(0, 4);
  const completedCount = intentions.filter((i) => i.completed).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntention.trim()) return;
    onAddIntention(newIntention.trim(), selectedSpaceId);
    setNewIntention('');
    setAddingIntention(false);
  };

  const handleApplySuggestion = () => {
    if (suggestionApplied) return;
    onAddIntention('Pausa de respiración y té sin pantallas (15 min)', 'bienestar');
    setSuggestionApplied(true);
  };

  return (
    <div className="space-y-8">
      {/* Saludo, fecha y resumen del día */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E5EAE8]">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm text-[#5E8371] font-medium">
            Miércoles, 18 de noviembre de 2026
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#172121]">
            Buenos días, {preferences.name}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#4E5D5B]">
            Hoy es una jornada ligera: tienes dos momentos clave —tu caminata al mediodía y el café con Laura por la tarde— con espacio real para respirar entre bloques.
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0 text-sm">
          <div>
            <p className="text-xs text-[#768482]">Intenciones de hoy</p>
            <p className="mt-0.5 text-lg font-semibold text-[#172121] tabular-nums">
              {completedCount} de {intentions.length} en marcha
            </p>
          </div>
          <div className="h-8 w-px bg-[#E5EAE8]" aria-hidden="true" />
          <div>
            <p className="text-xs text-[#768482]">Próximo encuentro</p>
            <p className="mt-0.5 text-lg font-semibold text-[#135D66] tabular-nums">18:15</p>
          </div>
        </div>
      </section>

      {/* Mi balance de vida (Protagonista) */}
      <LifeBalanceSection />

      {/* Indicadores de energía física, energía mental y estado de ánimo */}
      <section aria-label="Registro de bienestar de hoy" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium text-[#4E5D5B]">Energía física</h2>
              <span className="font-mono text-sm font-medium text-[#135D66] tabular-nums">
                {energy.physical} / 5
              </span>
            </div>
            <div className="flex items-center gap-2" role="group" aria-label="Nivel de energía física">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onUpdateEnergy({ ...energy, physical: level })}
                  aria-label={`Energía física ${level} de 5`}
                  className={`h-3 flex-1 rounded-full transition-colors cursor-pointer ${
                    level <= energy.physical
                      ? 'bg-[#135D66]'
                      : 'bg-[#EDF1F0] hover:bg-[#DCE4E2]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-[#768482]">
              <span>Baja</span>
              <span>Media</span>
              <span>Alta</span>
            </div>
            <p className="text-xs text-[#52605E]">
              {energy.physical >= 4
                ? 'Buena vitalidad corporal para sostener el día.'
                : energy.physical === 3
                  ? 'Nivel estable; conviene incluir movimiento suave.'
                  : 'Cuerpo pidiendo ritmo tranquilo y menos exigencia física.'}
            </p>
          </div>

          <div className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium text-[#4E5D5B]">Energía mental</h2>
              <span className="font-mono text-sm font-medium text-[#5E8371] tabular-nums">
                {energy.mental} / 5
              </span>
            </div>
            <div className="flex items-center gap-2" role="group" aria-label="Nivel de energía mental">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onUpdateEnergy({ ...energy, mental: level })}
                  aria-label={`Energía mental ${level} de 5`}
                  className={`h-3 flex-1 rounded-full transition-colors cursor-pointer ${
                    level <= energy.mental
                      ? 'bg-[#5E8371]'
                      : 'bg-[#EDF1F0] hover:bg-[#DCE4E2]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-[#768482]">
              <span>Saturada</span>
              <span>Media</span>
              <span>Despejada</span>
            </div>
            <p className="text-xs text-[#52605E]">
              {energy.mental >= 4
                ? 'Claridad alta para trabajo creativo o decisiones.'
                : energy.mental === 3
                  ? 'Atención moderada; ideal para un bloque a la vez.'
                  : 'Conviene dividir lo complejo en pasos pequeños.'}
            </p>
          </div>

          <div className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium text-[#4E5D5B]">Estado de ánimo</h2>
              <span className="text-sm font-semibold text-[#7D71A8] truncate">
                {energy.emotionalLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {energy.emotionalOptions.map((option) => {
                const active = option === energy.emotionalLabel;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onUpdateEnergy({ ...energy, emotionalLabel: option })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#F3F1F8] text-[#7D71A8]'
                        : 'bg-[#F7F8F7] text-[#52605E] hover:bg-[#EEF1F0]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {energy.emotionalLabel === 'Otro' && (
              <div className="pt-1">
                <label htmlFor="custom-mood-input" className="sr-only">
                  Describe libremente cómo te sientes
                </label>
                <input
                  id="custom-mood-input"
                  type="text"
                  value={energy.customMoodText}
                  onChange={(e) =>
                    onUpdateEnergy({ ...energy, customMoodText: e.target.value })
                  }
                  placeholder="Describe libremente cómo te sientes hoy..."
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl text-[#172121] placeholder:text-[#768482] focus:outline-none focus:border-[#7D71A8] focus:bg-white transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Activación de planificación adaptativa (solo tras actualizar el registro de bienestar) */}
        {hasWellbeingCheckIn && (
          <div className="bg-white border border-[#135D66]/25 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-[#172121]">
                Tu día puede cambiar y tus planes también. ¿Quieres que revisemos juntos tus prioridades?
              </p>
              <p className="text-xs text-[#52605E]">
                Ajusta tu agenda según cómo te sientes ahora, sin presión ni cambios automáticos.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAdaptivePlanning}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#135D66] text-white text-sm font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Reorganizar mi día</span>
            </button>
          </div>
        )}

        {reorganizationNotice && (
          <div className="bg-[#EEF4F0] border border-[#5E8371]/25 rounded-2xl px-5 py-3.5 text-xs text-[#2E4D3E]">
            Reorganización aplicada con éxito. Tu plan de hoy ahora refleja el ritmo que elegiste.
          </div>
        )}
      </section>

      {/* Main 2-column grid: Mi día + Sugerencia contextual IA / Mi equilibrio */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Mi día */}
        <section className="xl:col-span-7 bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#172121]">Mi día</h2>
              <p className="text-xs text-[#768482] mt-0.5">
                Intenciones elegidas para vivir hoy con serenidad
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddingIntention((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#135D66] bg-[#ECF4F5] hover:bg-[#DFEEF0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir intención</span>
            </button>
          </div>

          {addingIntention && (
            <form
              onSubmit={handleAddSubmit}
              className="p-4 rounded-xl bg-[#F7F8F7] border border-[#E5EAE8] space-y-3"
            >
              <input
                type="text"
                value={newIntention}
                onChange={(e) => setNewIntention(e.target.value)}
                placeholder="Ej. Cerrar el ordenador a las 18:00 y salir a caminar"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5EAE8] rounded-xl text-[#172121] placeholder:text-[#768482] focus:outline-none focus:border-[#135D66]"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <select
                  value={selectedSpaceId}
                  onChange={(e) => setSelectedSpaceId(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-[#E5EAE8] rounded-xl text-[#4E5D5B] focus:outline-none focus:border-[#135D66]"
                >
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAddingIntention(false)}
                    className="px-3 py-1.5 text-xs font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] transition-colors cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="divide-y divide-[#EFF2F1]">
            {intentions.map((item) => (
              <div
                key={item.id}
                className={`py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5 group ${
                  item.postponedTo ? 'opacity-65' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleIntention(item.id)}
                  aria-label={
                    item.completed
                      ? `Desmarcar "${item.title}"`
                      : `Marcar "${item.title}" como realizada`
                  }
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                    item.completed
                      ? 'bg-[#5E8371] border-[#5E8371] text-white'
                      : 'bg-white border-[#CBD5D3] hover:border-[#135D66]'
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p
                    className={`text-sm leading-snug transition-colors ${
                      item.completed ? 'text-[#768482] line-through' : 'text-[#172121]'
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.steps && item.steps.length > 0 && (
                    <ul className="space-y-0.5 text-xs text-[#4E5D5B] pl-3.5">
                      {item.steps.map((step, idx) => (
                        <li key={idx}>• {step}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#768482]">
                    <span>{item.spaceName}</span>
                    {item.isRest && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#5E8371] font-medium">Espacio de descanso</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {item.postponedTo
                        ? `Reprogramada para ${item.postponedTo}`
                        : item.timeWindow}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right column: Sugerencia contextual IA + Mi equilibrio */}
        <div className="xl:col-span-5 space-y-6">
          {/* Sugerencia contextual de IA */}
          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F3F1F8] text-[#7D71A8] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#172121]">
                    Sugerencia contextual
                  </h2>
                  <p className="text-xs text-[#768482]">Basada en tu ritmo de hoy</p>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#4E5D5B]">
              Tu energía física está alta, pero tu foco mental está en punto medio. Protege una pausa de 15 minutos sin pantallas antes del café con Laura para cambiar de ritmo con calma.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleApplySuggestion}
                disabled={suggestionApplied}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  suggestionApplied
                    ? 'bg-[#EEF4F0] text-[#5E8371] cursor-default'
                    : 'bg-[#135D66] text-white hover:bg-[#0E4950]'
                }`}
              >
                {suggestionApplied ? 'Añadida a Mi día' : 'Sumar pausa a Mi día'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onAskAi('Tengo energía mental media hoy, ¿cómo organizo mi tarde con calma?')
                }
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#7D71A8] bg-[#F3F1F8] hover:bg-[#EAE6F4] transition-colors whitespace-nowrap cursor-pointer"
              >
                Conversar sobre esto
              </button>
            </div>
          </section>

          {/* Mi equilibrio */}
          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#172121]">Mi equilibrio</h2>
                <p className="text-xs text-[#768482] mt-0.5">
                  Atención dedicada esta semana por espacio
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('espacios')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#135D66] hover:underline cursor-pointer whitespace-nowrap"
              >
                <span>Ver espacios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {visibleSpaces.map((space) => {
                const style = TONE_STYLES[space.tone];
                return (
                  <div key={space.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#172121]">{space.name}</span>
                      <span className="text-[#768482] tabular-nums">
                        {space.rhythm} · {space.weeklyFocusShare}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F2F5F4] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar}`}
                        style={{ width: `${Math.min(space.weeklyFocusShare * 2.5, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom row: Próximos compromisos + Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#172121]">Próximos compromisos</h2>
              <p className="text-xs text-[#768482] mt-0.5">
                Agenda cercana en los próximos días
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('planificacion')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#135D66] hover:underline cursor-pointer whitespace-nowrap"
            >
              <span>Abrir planificación</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#EFF2F1]">
            {upcomingCommitments.map((com) => (
              <div
                key={com.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#172121] truncate">{com.title}</p>
                  <p className="text-xs text-[#768482] mt-0.5">
                    {com.spaceName} · {com.dateLabel}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xs font-medium text-[#135D66] tabular-nums">
                    {com.startTime}
                  </p>
                  <p className="text-[11px] text-[#768482] tabular-nums">{com.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#172121]">Actividad reciente</h2>
            <p className="text-xs text-[#768482] mt-0.5">
              Últimos registros y movimientos en tu espacio
            </p>
          </div>

          <div className="divide-y divide-[#EFF2F1]">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <p className="text-sm text-[#172121] leading-snug">{act.description}</p>
                <p className="text-xs text-[#768482]">
                  {act.spaceName} · {act.timeLabel}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
