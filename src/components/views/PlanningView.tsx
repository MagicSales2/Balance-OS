import React, { useState } from 'react';
import { CalendarDays, Check, Plus } from 'lucide-react';
import { WEEK_DAYS } from '../../data/mockData';
import { Commitment, LifeSpace } from '../../types/balance';
import { Modal } from '../ui/Modal';

interface PlanningViewProps {
  commitments: Commitment[];
  spaces: LifeSpace[];
  onToggleCommitment: (id: string) => void;
  onAddCommitment: (commitment: Commitment) => void;
}

export function PlanningView({
  commitments,
  spaces,
  onToggleCommitment,
  onAddCommitment,
}: PlanningViewProps) {
  const [viewMode, setViewMode] = useState<'semanal' | 'diaria'>('semanal');
  const [selectedDay, setSelectedDay] = useState<number>(2); // Miércoles 18
  const [filterSpaceId, setFilterSpaceId] = useState<string>('todos');
  const [addOpen, setAddOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [spaceId, setSpaceId] = useState(spaces[0]?.id ?? 'trabajo');
  const [dayIndex, setDayIndex] = useState<number>(2);
  const [startTime, setStartTime] = useState('16:30');
  const [duration, setDuration] = useState('45 min');
  const [kind, setKind] = useState<Commitment['kind']>('Enfoque');

  const filteredCommitments =
    filterSpaceId === 'todos'
      ? commitments
      : commitments.filter((c) => c.spaceId === filterSpaceId);

  const dayCommitments = filteredCommitments
    .filter((c) => c.dayIndex === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const space = spaces.find((s) => s.id === spaceId);
    const dayObj = WEEK_DAYS.find((d) => d.index === dayIndex);

    onAddCommitment({
      id: `com-${Date.now()}`,
      title: title.trim(),
      spaceId,
      spaceName: space?.name ?? 'General',
      dayIndex,
      dateLabel: dayObj ? `${dayObj.label} nov` : 'Miércoles 18 nov',
      startTime,
      duration,
      kind,
      completed: false,
    });

    setTitle('');
    setAddOpen(false);
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE8]">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
            Planificación
          </h1>
          <p className="text-sm text-[#4E5D5B]">
            Organiza tus bloques y encuentros dejando aire suficiente entre compromisos. Semana del 16 al 22 de noviembre.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDayIndex(selectedDay);
            setAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#135D66] text-white text-sm font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo bloque</span>
        </button>
      </div>

      {/* Controls bar: Segmented view toggle + space filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          className="inline-flex items-center gap-1 p-1 bg-white border border-[#E5EAE8] rounded-xl w-fit"
          role="tablist"
          aria-label="Modo de visualización"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'semanal'}
            onClick={() => setViewMode('semanal')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'semanal'
                ? 'bg-[#ECF4F5] text-[#135D66]'
                : 'text-[#52605E] hover:text-[#172121]'
            }`}
          >
            Vista semanal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'diaria'}
            onClick={() => setViewMode('diaria')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'diaria'
                ? 'bg-[#ECF4F5] text-[#135D66]'
                : 'text-[#52605E] hover:text-[#172121]'
            }`}
          >
            Vista diaria
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <label htmlFor="space-filter" className="text-xs text-[#768482] whitespace-nowrap">
            Espacio:
          </label>
          <select
            id="space-filter"
            value={filterSpaceId}
            onChange={(e) => setFilterSpaceId(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium bg-white border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
          >
            <option value="todos">Todos los espacios</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vista semanal */}
      {viewMode === 'semanal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
          {WEEK_DAYS.map((day) => {
            const items = filteredCommitments
              .filter((c) => c.dayIndex === day.index)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = day.index === 2;

            return (
              <section
                key={day.index}
                className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 min-h-[240px] ${
                  isToday ? 'border-[#135D66]/40' : 'border-[#E5EAE8]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.index);
                    setViewMode('diaria');
                  }}
                  className="text-left pb-2.5 border-b border-[#EFF2F1] flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-medium text-[#768482]">{day.short}</p>
                    <p className="text-sm font-semibold text-[#172121] group-hover:text-[#135D66] transition-colors">
                      {day.label.split(' ')[1]} nov
                    </p>
                  </div>
                  {isToday && (
                    <span className="text-[11px] font-medium text-[#135D66]">Hoy</span>
                  )}
                </button>

                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-2">
                    <p className="text-xs text-[#768482] leading-relaxed">
                      Día abierto sin compromisos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-[#F7F8F7] hover:bg-[#EFF3F2] transition-colors space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[11px] text-[#135D66] tabular-nums">
                            {item.startTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleCommitment(item.id)}
                            aria-label={
                              item.completed
                                ? `Marcar "${item.title}" como pendiente`
                                : `Marcar "${item.title}" como completado`
                            }
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                              item.completed
                                ? 'bg-[#5E8371] border-[#5E8371] text-white'
                                : 'bg-white border-[#CBD5D3] hover:border-[#135D66]'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3" />}
                          </button>
                        </div>
                        <p
                          className={`text-xs font-medium leading-snug ${
                            item.completed
                              ? 'text-[#768482] line-through'
                              : 'text-[#172121]'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#768482] truncate">
                          {item.spaceName} · {item.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Vista diaria */}
      {viewMode === 'diaria' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {WEEK_DAYS.map((day) => {
              const active = day.index === selectedDay;
              return (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => setSelectedDay(day.index)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#135D66] text-white border-[#135D66]'
                      : 'bg-white text-[#4E5D5B] border-[#E5EAE8] hover:border-[#CBD5D3]'
                  }`}
                >
                  {day.label}
                  {day.index === 2 ? ' (Hoy)' : ''}
                </button>
              );
            })}
          </div>

          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFF2F1]">
              <div>
                <h2 className="text-lg font-semibold text-[#172121]">
                  {WEEK_DAYS[selectedDay]?.label} de noviembre
                </h2>
                <p className="text-xs text-[#768482] mt-0.5">
                  {dayCommitments.length === 0
                    ? 'Jornada libre para descansar o improvisar'
                    : `${dayCommitments.length} bloque${dayCommitments.length > 1 ? 's' : ''} en tu día`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDayIndex(selectedDay);
                  setAddOpen(true);
                }}
                className="text-xs font-medium text-[#135D66] hover:underline cursor-pointer whitespace-nowrap"
              >
                + Añadir a este día
              </button>
            </div>

            {dayCommitments.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EEF4F0] text-[#5E8371] flex items-center justify-center mx-auto">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <p className="text-base font-medium text-[#172121]">
                  Tu día está abierto y sin compromisos programados
                </p>
                <p className="text-sm text-[#52605E] max-w-md mx-auto">
                  No necesitas llenar cada hora. Si deseas reservar un momento de lectura, descanso o enfoque, puedes agregarlo aquí.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDayIndex(selectedDay);
                      setAddOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] transition-colors cursor-pointer"
                  >
                    Reservar un bloque tranquilo
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#EFF2F1] pt-2">
                {dayCommitments.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleCommitment(item.id)}
                        aria-label={`Cambiar estado de ${item.title}`}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                          item.completed
                            ? 'bg-[#5E8371] border-[#5E8371] text-white'
                            : 'bg-white border-[#CBD5D3] hover:border-[#135D66]'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            item.completed
                              ? 'text-[#768482] line-through'
                              : 'text-[#172121]'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-[#768482] mt-1">
                          {item.spaceName} · {item.kind} · {item.duration}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-sm font-medium text-[#135D66] tabular-nums shrink-0">
                      {item.startTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modal: Nuevo bloque */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Añadir actividad o compromiso"
        subtitle="Reserva un bloque claro y realista en tu semana."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#4E5D5B]">Descripción</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Lectura tranquila o reunión de diseño"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Espacio</label>
              <select
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Día</label>
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                {WEEK_DAYS.map((d) => (
                  <option key={d.index} value={d.index}>
                    {d.label} nov
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Hora</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Duración</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                <option value="20 min">20 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
                <option value="90 min">90 min</option>
                <option value="120 min">120 min</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Naturaleza</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as Commitment['kind'])}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                <option value="Enfoque">Enfoque</option>
                <option value="Encuentro">Encuentro</option>
                <option value="Bienestar">Bienestar</option>
                <option value="Gestión">Gestión</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] transition-colors cursor-pointer"
            >
              Añadir bloque
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
