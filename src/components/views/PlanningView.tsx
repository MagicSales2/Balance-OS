import React, { useState } from 'react';
import { CalendarDays, Check, Plus, Sparkles } from 'lucide-react';
import { WEEK_DAYS } from '../../data/mockData';
import { Commitment, LifeSpace } from '../../types/balance';
import { Modal } from '../ui/Modal';

interface PlanningViewProps {
  commitments: Commitment[];
  spaces: LifeSpace[];
  onToggleCommitment: (id: string) => void;
  onAddCommitment: (commitment: Commitment) => void;
  onOpenAdaptiveWeek: () => void;
  onOpenAdaptiveDay: () => void;
}

export function PlanningView({
  commitments,
  spaces,
  onToggleCommitment,
  onAddCommitment,
  onOpenAdaptiveWeek,
  onOpenAdaptiveDay,
}: PlanningViewProps) {
  const [viewMode, setViewMode] = useState<'semanal' | 'diaria'>('semanal');
  const [selectedDay, setSelectedDay] = useState<number>(2);
  const [filterSpaceId, setFilterSpaceId] = useState<string>('todos');
  const [addOpen, setAddOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [dayIndex, setDayIndex] = useState<number>(2);
  const [startTime, setStartTime] = useState('16:30');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [spaceId, setSpaceId] = useState(spaces[0]?.id ?? 'trabajo');
  const [duration, setDuration] = useState('45 min');

  const activeSpaces = spaces.filter((s) => !s.archived);

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
      kind: 'Enfoque',
      completed: false,
    });

    setTitle('');
    setShowMoreOptions(false);
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5EAE8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
            Planificación
          </h1>
          <p className="text-sm text-[#52605E] mt-1">Semana del 16 al 22 de noviembre</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={viewMode === 'semanal' ? onOpenAdaptiveWeek : onOpenAdaptiveDay}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5EAE8] text-[#135D66] text-xs font-medium hover:border-[#135D66] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {viewMode === 'semanal' ? 'Reorganizar mi semana' : 'Reorganizar mi día'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDayIndex(selectedDay);
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#135D66] text-white text-xs font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 p-1 bg-white border border-[#E5EAE8] rounded-xl w-fit"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'semanal'}
            onClick={() => setViewMode('semanal')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'semanal'
                ? 'bg-[#ECF4F5] text-[#135D66]'
                : 'text-[#52605E] hover:text-[#172121]'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'diaria'}
            onClick={() => setViewMode('diaria')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'diaria'
                ? 'bg-[#ECF4F5] text-[#135D66]'
                : 'text-[#52605E] hover:text-[#172121]'
            }`}
          >
            Día
          </button>
        </div>

        <select
          aria-label="Filtrar por espacio"
          value={filterSpaceId}
          onChange={(e) => setFilterSpaceId(e.target.value)}
          className="px-3.5 py-2 text-xs font-medium bg-white border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66] w-fit"
        >
          <option value="todos">Todos los espacios</option>
          {activeSpaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Vista semanal */}
      {viewMode === 'semanal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3.5">
          {WEEK_DAYS.map((day) => {
            const items = filteredCommitments
              .filter((c) => c.dayIndex === day.index)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = day.index === 2;

            return (
              <section
                key={day.index}
                className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 min-h-[210px] ${
                  isToday ? 'border-[#135D66]/40' : 'border-[#E5EAE8]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.index);
                    setViewMode('diaria');
                  }}
                  className="text-left pb-2 border-b border-[#EFF2F1] flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <p className="text-[11px] text-[#768482]">{day.short}</p>
                    <p className="text-sm font-semibold text-[#172121] group-hover:text-[#135D66]">
                      {day.label.split(' ')[1]} nov
                    </p>
                  </div>
                  {isToday && (
                    <span className="text-[11px] font-medium text-[#135D66]">Hoy</span>
                  )}
                </button>

                {items.length === 0 ? (
                  <p className="text-xs text-[#768482] py-6 text-center">Libre</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-[#F7F8F7] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-[#135D66] tabular-nums">
                            {item.startTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleCommitment(item.id)}
                            aria-label={`Marcar ${item.title}`}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                              item.completed
                                ? 'bg-[#5E8371] border-[#5E8371] text-white'
                                : 'bg-white border-[#CBD5D3]'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3" />}
                          </button>
                        </div>
                        <p
                          className={`text-xs font-medium leading-snug ${
                            item.completed ? 'text-[#768482] line-through' : 'text-[#172121]'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#768482] truncate">{item.spaceName}</p>
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {WEEK_DAYS.map((day) => (
              <button
                key={day.index}
                type="button"
                onClick={() => setSelectedDay(day.index)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  day.index === selectedDay
                    ? 'bg-[#135D66] text-white border-[#135D66]'
                    : 'bg-white text-[#4E5D5B] border-[#E5EAE8] hover:border-[#CBD5D3]'
                }`}
              >
                {day.label}
                {day.index === 2 ? ' · Hoy' : ''}
              </button>
            ))}
          </div>

          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6">
            {dayCommitments.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF4F0] text-[#5E8371] flex items-center justify-center mx-auto">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#172121]">
                  Día abierto y sin compromisos
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDayIndex(selectedDay);
                    setAddOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] cursor-pointer"
                >
                  Añadir bloque
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#EFF2F1]">
                {dayCommitments.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleCommitment(item.id)}
                        aria-label={`Marcar ${item.title}`}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                          item.completed
                            ? 'bg-[#5E8371] border-[#5E8371] text-white'
                            : 'bg-white border-[#CBD5D3]'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            item.completed ? 'text-[#768482] line-through' : 'text-[#172121]'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-[#768482] mt-0.5">
                          {item.spaceName} · {item.duration}
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

      {/* Modal simple para añadir bloque */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Añadir a tu agenda"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué quieres planear?"
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={dayIndex}
              onChange={(e) => setDayIndex(Number(e.target.value))}
              className="px-3 py-2 text-xs border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
            >
              {WEEK_DAYS.map((d) => (
                <option key={d.index} value={d.index}>
                  {d.label} nov
                </option>
              ))}
            </select>

            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-3 py-2 text-xs border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMoreOptions((v) => !v)}
            className="text-xs text-[#135D66] hover:underline cursor-pointer"
          >
            {showMoreOptions ? 'Ocultar opciones' : '+ Espacio y duración'}
          </button>

          {showMoreOptions && (
            <div className="grid grid-cols-2 gap-3">
              <select
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
                className="px-3 py-2 text-xs border border-[#E5EAE8] rounded-xl bg-white text-[#172121]"
              >
                {activeSpaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="px-3 py-2 text-xs border border-[#E5EAE8] rounded-xl bg-white text-[#172121]"
              >
                <option value="20 min">20 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
                <option value="90 min">90 min</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-[#52605E] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
