import React, { useEffect, useState } from 'react';
import { Check, Edit3, Send, Sparkles, X } from 'lucide-react';
import {
  AdaptiveContextSnapshot,
  AdaptiveScope,
  interpretAndPlan,
  ProposalActionType,
  ReorganizationSuggestion,
} from '../../utils/adaptivePlanning';

interface AdaptivePlanningModalProps {
  open: boolean;
  scope: AdaptiveScope;
  onClose: () => void;
  context: AdaptiveContextSnapshot;
  onApplyReorganization: (
    acceptedSuggestions: ReorganizationSuggestion[],
    scope: AdaptiveScope
  ) => void;
}

const DAY_CHIPS = [
  'Hoy solo quiero trabajar',
  'Tengo demasiados pendientes',
  'Quiero descansar y hacer pocas cosas',
  'Necesito concentrarme en mis proyectos',
];

const WEEK_CHIPS = [
  'Quiero una semana más ligera',
  'Necesito concentrarme en mis proyectos',
  'Tengo demasiados pendientes esta semana',
  'Priorizar trabajo y descanso',
];

const ACTION_LABELS: Record<ProposalActionType, { label: string; colorClass: string }> = {
  mantener: { label: 'Mantener', colorClass: 'text-[#5E8371]' },
  reprogramar: { label: 'Mover horario', colorClass: 'text-[#135D66]' },
  dividir: { label: 'En pasos', colorClass: 'text-[#7D71A8]' },
  aplazar: { label: 'Para después', colorClass: 'text-[#52687A]' },
  descanso: { label: 'Descanso', colorClass: 'text-[#5E8371]' },
};

interface DialogueTurn {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export function AdaptivePlanningModal({
  open,
  scope,
  onClose,
  context,
  onApplyReorganization,
}: AdaptivePlanningModalProps) {
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [suggestions, setSuggestions] = useState<ReorganizationSuggestion[] | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');

  useEffect(() => {
    if (open) {
      setInput('');
      setTurns([]);
      setSuggestions(null);
      setEditingId(null);
      setIsThinking(false);
    }
  }, [open, scope]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const chips = scope === 'week' ? WEEK_CHIPS : DAY_CHIPS;
  const initialQuestion =
    scope === 'week'
      ? '¿Cómo quieres organizar tu semana?'
      : '¿Cómo quieres organizar tu día?';

  const handleSend = (textToSend?: string) => {
    const prompt = (textToSend ?? input).trim();
    if (!prompt || isThinking) return;

    setTurns((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: prompt },
    ]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const result = interpretAndPlan(context, prompt, scope);
      setTurns((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'assistant', text: result.assistantReply },
      ]);
      setSuggestions(result.suggestions);
      setIsThinking(false);
    }, 350);
  };

  const toggleSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev
        ? prev.map((s) =>
            s.id === id
              ? { ...s, status: s.status === 'accepted' ? 'discarded' : 'accepted' }
              : s
          )
        : null
    );
  };

  const startEdit = (item: ReorganizationSuggestion) => {
    setEditingId(item.id);
    setEditTitle(item.proposedTitle);
    setEditTime(item.proposedTimeWindow);
  };

  const saveEdit = (id: string) => {
    setSuggestions((prev) =>
      prev
        ? prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  proposedTitle: editTitle.trim() || s.proposedTitle,
                  proposedTimeWindow: editTime.trim() || s.proposedTimeWindow,
                  status: 'accepted',
                }
              : s
          )
        : null
    );
    setEditingId(null);
  };

  const acceptedSuggestions = suggestions?.filter((s) => s.status === 'accepted') ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172121]/25 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adaptive-modal-title"
    >
      <div
        className="w-full max-w-xl bg-white border border-[#E5EAE8] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal header */}
        <div className="px-6 py-4 border-b border-[#EFF2F1] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ECF4F5] text-[#135D66] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="adaptive-modal-title" className="text-base font-semibold text-[#172121]">
                {initialQuestion}
              </h2>
              <p className="text-xs text-[#768482]">
                Cuéntame qué tienes en mente. Yo te ayudo a organizarlo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 -mr-2 rounded-lg text-[#768482] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversational body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FAFBFB]">
          {/* Quick options before or during chat */}
          {turns.length === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[#768482]">
                Elige una opción rápida o escribe libremente abajo:
              </p>
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSend(chip)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-[#E5EAE8] text-[#172121] hover:border-[#135D66] hover:text-[#135D66] transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={`flex ${turn.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  turn.sender === 'user'
                    ? 'bg-[#135D66] text-white'
                    : 'bg-white border border-[#E5EAE8] text-[#172121]'
                }`}
              >
                {turn.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <p className="text-xs text-[#768482]">Organizando una propuesta...</p>
          )}

          {/* Simple, scannable reorganization result */}
          {suggestions && suggestions.length > 0 && !isThinking && (
            <div className="space-y-2.5 pt-1">
              {suggestions.map((item) => {
                const badge = ACTION_LABELS[item.actionType];
                const accepted = item.status === 'accepted';
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white border border-[#E5EAE8] rounded-xl p-4 space-y-2 transition-opacity ${
                      accepted ? 'opacity-100' : 'opacity-55'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-[#E5EAE8] rounded-lg focus:outline-none focus:border-[#135D66]"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-40 px-3 py-1.5 text-xs border border-[#E5EAE8] rounded-lg focus:outline-none focus:border-[#135D66]"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-xs text-[#52605E] cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(item.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-[#135D66] text-white rounded-lg cursor-pointer"
                            >
                              Listo
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className={`font-medium ${badge.colorClass}`}>
                                {badge.label}
                              </span>
                              <span className="text-[#CBD5D3]" aria-hidden="true">·</span>
                              <span className="font-mono text-[#135D66] tabular-nums">
                                {item.proposedTimeWindow}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-[#172121]">
                              {item.proposedTitle}
                            </p>
                            <p className="text-xs text-[#768482]">{item.reason}</p>
                            {item.steps && item.steps.length > 0 && (
                              <ul className="text-xs text-[#4E5D5B] pt-0.5 space-y-0.5">
                                {item.steps.map((step, i) => (
                                  <li key={i}>• {step}</li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              aria-label="Ajustar"
                              className="p-1.5 rounded-lg text-[#768482] hover:text-[#172121] hover:bg-[#F2F5F4] cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSuggestion(item.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                accepted
                                  ? 'bg-[#EEF4F0] text-[#5E8371]'
                                  : 'bg-[#F2F5F4] text-[#52605E]'
                              }`}
                            >
                              {accepted ? (
                                <span className="inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Sí
                                </span>
                              ) : (
                                'Incluir'
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input & Confirm Footer */}
        <div className="px-6 py-4 border-t border-[#EFF2F1] bg-white space-y-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                suggestions
                  ? 'Pide otro ajuste si lo necesitas...'
                  : 'Escribe lo que tienes en mente...'
              }
              className="flex-1 px-3.5 py-2.5 text-sm bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl text-[#172121] placeholder:text-[#768482] focus:outline-none focus:border-[#135D66] focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              aria-label="Enviar"
              className="p-2.5 rounded-xl bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {suggestions && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={acceptedSuggestions.length === 0}
                onClick={() => onApplyReorganization(acceptedSuggestions, scope)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#135D66] text-white hover:bg-[#0E4950] disabled:opacity-40 transition-colors cursor-pointer"
              >
                Aplicar esta reorganización ({acceptedSuggestions.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
