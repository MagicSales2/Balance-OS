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
import { LiveBalanceInput } from '../../utils/lifeBalance';
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
  balanceInput: LiveBalanceInput;
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
  balanceInput,
  onNavigate,
  onAskAi,
}: HomeViewProps) {
  const [newIntention, setNewIntention] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0]?.id ?? 'trabajo');
  const [showSpaceOption, setShowSpaceOption] = useState(false);

  const visibleSpaces = spaces.filter((s) => !s.archived && s.visible).slice(0, 7);
  const upcomingCommitments = commitments.filter((c) => !c.completed).slice(0, 3);
  const completedCount = intentions.filter((i) => i.completed).length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntention.trim()) return;
    onAddIntention(newIntention.trim(), selectedSpaceId);
    setNewIntention('');
    setShowSpaceOption(false);
  };

  const dailySuggestionText = !hasWellbeingCheckIn
    ? 'Registra cómo está tu energía hoy para adaptar tus pendientes sin exigirte de más.'
    : (energy.physical > 0 && energy.physical <= 2) || (energy.mental > 0 && energy.mental <= 2)
      ? 'Tu energía está baja hoy. Elige un único avance ligero en Magia Pastelera y protege un descanso real.'
      : 'Elige un pendiente inicial de Magia Pastelera para avanzar hoy sin que el negocio consuma toda tu tarde.';

  return (
    <div className="space-y-7">
      {/* Saludo compacto */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5EAE8]">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#5E8371]">
            Miércoles, 18 de noviembre de 2026
            {preferences.city ? ` · ${preferences.city}` : ''}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#172121]">
            {preferences.name.trim() ? `Buenos días, ${preferences.name}` : 'Buenos días'}
          </h1>
          <p className="text-sm text-[#52605E]">
            {completedCount} de {intentions.length} pendientes en marcha ·{' '}
            {upcomingCommitments.length === 0
              ? 'Sin compromisos agendados'
              : `${upcomingCommitments.length} compromiso(s) próximo(s)`}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdaptivePlanning}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5EAE8] text-xs font-medium text-[#135D66] hover:border-[#135D66] transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reorganizar mi día</span>
        </button>
      </section>

      {/* Mi balance de vida (Protagonista) */}
      <LifeBalanceSection balanceInput={balanceInput} />

      {/* Registro rápido de bienestar */}
      <section aria-label="¿Cómo te sientes hoy?" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-[#4E5D5B]">Energía física</h2>
              <span className="font-mono text-sm font-medium text-[#135D66] tabular-nums">
                {energy.physical > 0 ? `${energy.physical}/5` : '—/5'}
              </span>
            </div>
            <div className="flex items-center gap-1.5" role="group" aria-label="Energía física">
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
              <span>Alta</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-[#4E5D5B]">Energía mental</h2>
              <span className="font-mono text-sm font-medium text-[#5E8371] tabular-nums">
                {energy.mental > 0 ? `${energy.mental}/5` : '—/5'}
              </span>
            </div>
            <div className="flex items-center gap-1.5" role="group" aria-label="Energía mental">
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
              <span>Despejada</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium text-[#4E5D5B]">Estado de ánimo</h2>
              <span className="text-xs font-semibold text-[#7D71A8] truncate">
                {hasWellbeingCheckIn ? energy.emotionalLabel : 'Sin registrar'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {energy.emotionalOptions.map((option) => {
                const active = hasWellbeingCheckIn && option === energy.emotionalLabel;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onUpdateEnergy({ ...energy, emotionalLabel: option })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
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
              <input
                type="text"
                value={energy.customMoodText}
                onChange={(e) =>
                  onUpdateEnergy({ ...energy, customMoodText: e.target.value })
                }
                placeholder="¿Cómo te sientes?"
                className="w-full px-3 py-1.5 text-xs bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#7D71A8] focus:bg-white"
              />
            )}
          </div>
        </div>

        {hasWellbeingCheckIn && (
          <div className="bg-white border border-[#135D66]/25 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-[#172121]">
              Tu día puede cambiar y tus planes también. ¿Quieres que revisemos juntos tus prioridades?
            </p>
            <button
              type="button"
              onClick={onOpenAdaptivePlanning}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#135D66] text-white text-xs font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reorganizar mi día</span>
            </button>
          </div>
        )}

        {reorganizationNotice && (
          <div className="bg-[#EEF4F0] border border-[#5E8371]/25 rounded-2xl px-5 py-3 text-xs text-[#2E4D3E]">
            Reorganización aplicada a tu día.
          </div>
        )}
      </section>

      {/* Mi día + Sugerencia IA y Mis espacios */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-7 bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#172121]">Mi día</h2>
            <span className="text-xs text-[#768482] tabular-nums">
              {completedCount}/{intentions.length}
            </span>
          </div>

          {/* Entrada rápida de 1 línea */}
          <form onSubmit={handleQuickAdd} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newIntention}
                onChange={(e) => setNewIntention(e.target.value)}
                onFocus={() => setShowSpaceOption(true)}
                placeholder="Añadir pendiente o intención para hoy..."
                className="flex-1 px-3.5 py-2 text-sm bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl text-[#172121] placeholder:text-[#768482] focus:outline-none focus:border-[#135D66] focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={!newIntention.trim()}
                aria-label="Añadir intención"
                className="p-2.5 rounded-xl bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {showSpaceOption && (
              <div className="flex flex-wrap items-center gap-1.5">
                {spaces
                  .filter((s) => !s.archived)
                  .slice(0, 7)
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSpaceId(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedSpaceId === s.id
                          ? 'bg-[#ECF4F5] text-[#135D66]'
                          : 'bg-[#F7F8F7] text-[#52605E] hover:text-[#172121]'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
              </div>
            )}
          </form>

          {intentions.length === 0 ? (
            <p className="text-xs text-[#768482] py-4">
              Aún no hay pendientes para hoy. Agrega uno arriba cuando quieras.
            </p>
          ) : (
            <div className="divide-y divide-[#EFF2F1]">
              {intentions.map((item) => (
                <div
                  key={item.id}
                  className={`py-3 first:pt-0 last:pb-0 flex items-start gap-3 ${
                    item.postponedTo ? 'opacity-60' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleIntention(item.id)}
                    aria-label={`Cambiar estado de "${item.title}"`}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                      item.completed
                        ? 'bg-[#5E8371] border-[#5E8371] text-white'
                        : 'bg-white border-[#CBD5D3] hover:border-[#135D66]'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p
                      className={`text-sm leading-snug ${
                        item.completed ? 'text-[#768482] line-through' : 'text-[#172121]'
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.steps && item.steps.length > 0 && (
                      <ul className="space-y-0.5 text-xs text-[#4E5D5B] pl-3">
                        {item.steps.map((step, idx) => (
                          <li key={idx}>• {step}</li>
                        ))}
                      </ul>
                    )}
                    <p className="text-xs text-[#768482] tabular-nums">
                      {item.spaceName}
                      {item.isSuggestedInitial ? ' · Pendiente inicial sugerido' : ''}
                      {item.isRest ? ' · Descanso' : ''}
                      {item.postponedTo
                        ? ` · Para ${item.postponedTo}`
                        : item.timeWindow !== 'Flexible'
                          ? ` · ${item.timeWindow}`
                          : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="xl:col-span-5 space-y-5">
          {/* Sugerencia IA */}
          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7D71A8]" />
              <h2 className="text-sm font-semibold text-[#172121]">Sugerencia de hoy</h2>
            </div>
            <p className="text-sm text-[#4E5D5B] leading-relaxed">{dailySuggestionText}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenAdaptivePlanning}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#135D66] text-white hover:bg-[#0E4950] transition-colors cursor-pointer"
              >
                Reorganizar con IA
              </button>
              <button
                type="button"
                onClick={() =>
                  onAskAi('¿Cómo priorizo hoy entre Magia Pastelera y mis proyectos?')
                }
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#7D71A8] bg-[#F3F1F8] hover:bg-[#EAE6F4] transition-colors cursor-pointer"
              >
                Conversar
              </button>
            </div>
          </section>

          {/* Mis 7 espacios */}
          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#172121]">Mis espacios</h2>
              <button
                type="button"
                onClick={() => onNavigate('espacios')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#135D66] hover:underline cursor-pointer"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#EFF2F1]">
              {visibleSpaces.map((space) => {
                const style = TONE_STYLES[space.tone];
                return (
                  <div
                    key={space.id}
                    className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${style.bar}`}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-[#172121] truncate">{space.name}</span>
                    </div>
                    <span className="text-[#768482] shrink-0">{space.rhythm}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Próximos compromisos + Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#172121]">Próximos compromisos</h2>
            <button
              type="button"
              onClick={() => onNavigate('planificacion')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#135D66] hover:underline cursor-pointer"
            >
              <span>Ir a agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {upcomingCommitments.length === 0 ? (
            <p className="text-xs text-[#768482] py-2">
              Sin compromisos agendados por ahora.
            </p>
          ) : (
            <div className="divide-y divide-[#EFF2F1]">
              {upcomingCommitments.map((com) => (
                <div
                  key={com.id}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#172121] truncate">{com.title}</p>
                    <p className="text-xs text-[#768482]">
                      {com.spaceName} · {com.dateLabel}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-medium text-[#135D66] tabular-nums shrink-0">
                    {com.startTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3.5">
          <h2 className="text-base font-semibold text-[#172121]">Actividad reciente</h2>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-[#768482] py-2">
              Aquí aparecerán tus cambios y registros a medida que uses la app.
            </p>
          ) : (
            <div className="divide-y divide-[#EFF2F1]">
              {recentActivity.slice(0, 3).map((act) => (
                <div key={act.id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-sm text-[#172121]">{act.description}</p>
                  <p className="text-xs text-[#768482] mt-0.5">
                    {act.spaceName} · {act.timeLabel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
