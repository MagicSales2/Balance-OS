import React, { useEffect, useState } from 'react';
import {
  Check,
  Edit3,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { ChatMessage } from '../../types/balance';
import {
  AdaptiveContextSnapshot,
  AdaptivePlanProposal,
  ProposalActionType,
  ReorganizationSuggestion,
} from '../../utils/adaptivePlanning';

interface AdaptivePlanningDrawerProps {
  open: boolean;
  onClose: () => void;
  context: AdaptiveContextSnapshot;
  initialProposal: AdaptivePlanProposal;
  onApplyReorganization: (acceptedSuggestions: ReorganizationSuggestion[]) => void;
}

const ACTION_META: Record<
  ProposalActionType,
  { label: string; textClass: string; surfaceClass: string }
> = {
  mantener: {
    label: 'Mantener',
    textClass: 'text-[#5E8371]',
    surfaceClass: 'bg-[#EEF4F0]',
  },
  reprogramar: {
    label: 'Cambiar de horario',
    textClass: 'text-[#135D66]',
    surfaceClass: 'bg-[#ECF4F5]',
  },
  dividir: {
    label: 'Dividir en pasos pequeños',
    textClass: 'text-[#7D71A8]',
    surfaceClass: 'bg-[#F3F1F8]',
  },
  aplazar: {
    label: 'Aplazar sin culpa',
    textClass: 'text-[#6A7B8E]',
    surfaceClass: 'bg-[#F0F3F6]',
  },
  descanso: {
    label: 'Espacio de descanso',
    textClass: 'text-[#5E8371]',
    surfaceClass: 'bg-[#EEF4F0]',
  },
};

export function AdaptivePlanningDrawer({
  open,
  onClose,
  context,
  initialProposal,
  onApplyReorganization,
}: AdaptivePlanningDrawerProps) {
  const [suggestions, setSuggestions] = useState<ReorganizationSuggestion[]>(
    initialProposal.suggestions
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editStepsText, setEditStepsText] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'adp-init',
      sender: 'assistant',
      text: initialProposal.greetingMessage,
      timestamp: 'Ahora',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Sync proposal whenever drawer opens with fresh state
  useEffect(() => {
    if (open) {
      setSuggestions(initialProposal.suggestions);
      setEditingId(null);
      setMessages([
        {
          id: `adp-init-${Date.now()}`,
          sender: 'assistant',
          text: initialProposal.greetingMessage,
          timestamp: 'Ahora',
        },
      ]);
    }
  }, [open, initialProposal]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const acceptedCount = suggestions.filter((s) => s.status === 'accepted').length;

  const toggleSuggestionStatus = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'accepted' ? 'discarded' : 'accepted' }
          : s
      )
    );
  };

  const startEditing = (item: ReorganizationSuggestion) => {
    setEditingId(item.id);
    setEditTitle(item.proposedTitle);
    setEditTime(item.proposedTimeWindow);
    setEditStepsText(item.steps ? item.steps.join('\n') : '');
  };

  const saveEdit = (id: string) => {
    const parsedSteps = editStepsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              proposedTitle: editTitle.trim() || s.proposedTitle,
              proposedTimeWindow: editTime.trim() || s.proposedTimeWindow,
              steps: parsedSteps.length > 0 ? parsedSteps : s.steps,
              status: 'accepted',
            }
          : s
      )
    );
    setEditingId(null);
  };

  const handleChatSend = (preset?: string) => {
    const text = (preset ?? chatInput).trim();
    if (!text || isReplying) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text, timestamp: 'Ahora' },
    ]);
    if (!preset) setChatInput('');
    setIsReplying(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply =
        'Recuerda que puedes editar o descartar cualquier bloque de la lista. Lo más valioso es que al cerrar el día sientas que tu agenda estuvo de tu lado.';

      if (lower.includes('liger') || lower.includes('menos') || lower.includes('aplaz')) {
        reply =
          'Totalmente válido. Si quieres un día todavía más ligero, te sugiero descartar los bloques de proyecto o lectura y quedarte únicamente con tu pausa de descanso y un compromiso afectivo.';
      } else if (lower.includes('por qué') || lower.includes('pasos') || lower.includes('divid')) {
        reply =
          'Cuando la energía mental baja, mirar una tarea grande genera fricción. Al dejarla en 2 o 3 pasos pequeños de pocos minutos, mantienes el impulso sin agotarte.';
      } else if (lower.includes('descans') || lower.includes('pausa')) {
        reply =
          'El espacio de descanso propuesto busca cortar la inercia antes del final de la tarde. Si prefieres otra hora, pulsa "Editar" en esa tarjeta y ajústala a tu ritmo.';
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'assistant', text: reply, timestamp: 'Ahora' },
      ]);
      setIsReplying(false);
    }, 450);
  };

  const moodDisplay =
    context.energy.emotionalLabel === 'Otro' && context.energy.customMoodText.trim()
      ? `Otro (${context.energy.customMoodText.trim()})`
      : context.energy.emotionalLabel;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#172121]/25 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="adaptive-drawer-title"
        className="relative z-10 w-full max-w-2xl h-full bg-white border-l border-[#E5EAE8] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5EAE8] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#135D66]" />
              <h2
                id="adaptive-drawer-title"
                className="text-lg font-semibold text-[#172121]"
              >
                Reorganizar mi día
              </h2>
            </div>
            <p className="text-xs text-[#52605E]">
              Tu planificación debe adaptarse a ti, no tú a tu planificación.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar asistente de reorganización"
            className="p-2 -mr-2 rounded-lg text-[#768482] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 bg-[#FAFBFB]">
          {/* Contexto tenido en cuenta */}
          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-4 space-y-2">
            <p className="text-xs font-medium text-[#768482]">
              Contexto actual considerado (datos de demostración)
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#172121]">
              <span>
                Energía física:{' '}
                <strong className="font-mono text-[#135D66]">{context.energy.physical}/5</strong>
              </span>
              <span aria-hidden="true" className="text-[#CBD5D3]">
                ·
              </span>
              <span>
                Energía mental:{' '}
                <strong className="font-mono text-[#5E8371]">{context.energy.mental}/5</strong>
              </span>
              <span aria-hidden="true" className="text-[#CBD5D3]">
                ·
              </span>
              <span>
                Ánimo: <strong className="text-[#7D71A8]">{moodDisplay}</strong>
              </span>
              <span aria-hidden="true" className="text-[#CBD5D3]">
                ·
              </span>
              <span>
                {context.pendingIntentions.length} pendientes ·{' '}
                {context.todayCommitments.length} compromiso hoy
              </span>
            </div>
          </section>

          {/* Experiencia conversacional */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4E5D5B]">
              <MessageCircle className="w-3.5 h-3.5 text-[#7D71A8]" />
              <span>Conversación con Asistente Balance</span>
            </div>

            <div className="space-y-2.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#135D66] text-white'
                        : 'bg-white border border-[#E5EAE8] text-[#172121]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isReplying && (
                <p className="text-xs text-[#768482] px-1">Pensando alternativas suaves...</p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Haz el día aún más ligero',
                '¿Por qué sugieres dividir o aplazar?',
                'Quiero proteger mi descanso hoy',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleChatSend(q)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[#E5EAE8] text-[#4E5D5B] hover:border-[#135D66] hover:text-[#135D66] transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChatSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pide otro ajuste o cuéntame qué necesitas hoy..."
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-[#E5EAE8] rounded-xl text-[#172121] placeholder:text-[#768482] focus:outline-none focus:border-[#135D66]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isReplying}
                aria-label="Enviar mensaje al asistente"
                className="p-2.5 rounded-xl bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>

          {/* Prioridades reales del día */}
          <section className="bg-white border border-[#E5EAE8] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#172121]">
              Prioridades reales para hoy
            </h3>
            <ul className="space-y-2">
              {initialProposal.realPriorities.map((prio, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-[#4E5D5B]">
                  <span className="font-mono text-xs font-semibold text-[#135D66] mt-0.5 shrink-0">
                    0{index + 1}.
                  </span>
                  <span>{prio}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Propuesta visual de reorganización */}
          <section className="space-y-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#172121]">
                Propuesta de ajustes para tu día
              </h3>
              <span className="text-xs text-[#768482] tabular-nums">
                {acceptedCount} de {suggestions.length} seleccionados
              </span>
            </div>

            <div className="space-y-3">
              {suggestions.map((item) => {
                const meta = ACTION_META[item.actionType];
                const isAccepted = item.status === 'accepted';
                const isEditing = editingId === item.id;

                return (
                  <article
                    key={item.id}
                    className={`bg-white border rounded-2xl p-5 space-y-3 transition-opacity ${
                      isAccepted
                        ? 'border-[#E5EAE8] opacity-100'
                        : 'border-[#E5EAE8] opacity-60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-md font-medium ${meta.surfaceClass} ${meta.textClass}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[#768482]">· {item.spaceName}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#52605E] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleSuggestionStatus(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isAccepted
                              ? 'bg-[#EEF4F0] text-[#5E8371] hover:bg-[#E1ECE5]'
                              : 'bg-[#F2F5F4] text-[#52605E] hover:text-[#172121]'
                          }`}
                        >
                          {isAccepted ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Aceptado</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>Incluir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 pt-1">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#4E5D5B]">
                            Actividad propuesta
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#4E5D5B]">
                            Horario o momento sugerido
                          </label>
                          <input
                            type="text"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
                          />
                        </div>
                        {(item.steps || item.actionType === 'dividir') && (
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-[#4E5D5B]">
                              Pasos pequeños (uno por línea)
                            </label>
                            <textarea
                              rows={3}
                              value={editStepsText}
                              onChange={(e) => setEditStepsText(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-xs font-medium text-[#52605E] cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="px-3.5 py-1.5 text-xs font-medium bg-[#135D66] text-white rounded-xl cursor-pointer"
                          >
                            Guardar ajuste
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <p className="text-sm font-medium text-[#172121]">
                            {item.proposedTitle}
                          </p>
                          <span className="font-mono text-xs text-[#135D66] shrink-0 tabular-nums">
                            {item.proposedTimeWindow}
                          </span>
                        </div>

                        {item.proposedTitle !== item.originalTitle &&
                          item.targetType !== 'new_rest' && (
                            <p className="text-xs text-[#768482]">
                              Original: {item.originalTitle}
                            </p>
                          )}

                        {item.steps && item.steps.length > 0 && (
                          <ul className="space-y-1 pl-3.5 text-xs text-[#4E5D5B]">
                            {item.steps.map((step, i) => (
                              <li key={i}>• {step}</li>
                            ))}
                          </ul>
                        )}

                        <p className="text-xs leading-relaxed text-[#52605E] bg-[#F7F8F7] rounded-xl px-3 py-2">
                          Por qué: {item.reason}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer confirmation */}
        <div className="px-6 py-4 border-t border-[#E5EAE8] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#768482]">
            {initialProposal.closingNote}
          </p>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#52605E] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer whitespace-nowrap"
            >
              Cerrar sin cambios
            </button>
            <button
              type="button"
              disabled={acceptedCount === 0}
              onClick={() =>
                onApplyReorganization(
                  suggestions.filter((s) => s.status === 'accepted')
                )
              }
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-[#135D66] text-white hover:bg-[#0E4950] disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
            >
              Aplicar esta reorganización
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
