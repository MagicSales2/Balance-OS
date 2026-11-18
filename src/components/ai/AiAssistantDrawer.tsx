import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { ChatMessage, EnergyState, NavSection, UserPreferences } from '../../types/balance';
import { AdaptiveScope } from '../../utils/adaptivePlanning';

interface AiAssistantDrawerProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  activeSection: NavSection;
  preferences: UserPreferences;
  energy: EnergyState;
  initialPrompt?: string | null;
  onClearInitialPrompt: () => void;
  onOpenAdaptivePlanning: (scope: AdaptiveScope) => void;
  onQuickAddIntention: (title: string, spaceId: string) => void;
}

interface RichAssistantMessage extends ChatMessage {
  action?: {
    label: string;
    type: 'reorganize_day' | 'reorganize_week' | 'add_intention';
    payload?: string;
  };
}

const SECTION_SUGGESTIONS: Record<NavSection, string[]> = {
  inicio: [
    'Reorganizar mi día',
    'Priorizar entre Magia Pastelera y proyectos',
    'Sugiere una pausa de 10 min',
  ],
  espacios: [
    '¿Qué espacio necesita atención hoy?',
    'Reducir dependencia de Magia Pastelera',
  ],
  planificacion: [
    'Reorganizar mi semana',
    'Ordenar mis pendientes sin saturar',
  ],
  evolucion: [
    '¿Cómo empiezo a registrar mi energía?',
    'Pregunta breve para cerrar el día',
  ],
  finanzas: [
    '¿Qué conviene registrar primero en Finanzas?',
    'Separar flujo de Magia Pastelera y personal',
  ],
  biblioteca: [
    'Idea para automatizar atención en WhatsApp',
    'Enfoque para proyectos con IA',
  ],
  configuracion: [
    '¿Qué tono me recomiendas?',
    'Personalizar mi perfil',
  ],
};

function generateSimulatedReply(
  query: string,
  section: NavSection,
  preferences: UserPreferences,
  energy: EnergyState
): { text: string; action?: RichAssistantMessage['action'] } {
  const q = query.toLowerCase();

  if (q.includes('reorganizar') && q.includes('semana')) {
    return {
      text: 'Podemos ordenar tu semana en un momento según tu prioridad actual.',
      action: { label: 'Abrir organizador de semana', type: 'reorganize_week' },
    };
  }

  if (q.includes('reorganizar') || (q.includes('organiz') && q.includes('día'))) {
    return {
      text: 'Revisemos juntos tus pendientes y energía para ordenar el día.',
      action: { label: 'Abrir organizador de día', type: 'reorganize_day' },
    };
  }

  const addMatch = query.match(/^(?:añadir|agregar|anotar|recordar)\s+(.+)/i);
  if (addMatch && addMatch[1].trim().length > 2) {
    const cleanTitle = addMatch[1].trim();
    return {
      text: `Puedo sumar "${cleanTitle}" a tu lista de hoy.`,
      action: { label: 'Añadir a Mi día', type: 'add_intention', payload: cleanTitle },
    };
  }

  const namePrefix =
    preferences.name.trim() && preferences.aiTone !== 'Directo y sereno'
      ? `${preferences.name}, `
      : '';

  if (
    q.includes('magia') ||
    q.includes('pastelera') ||
    q.includes('ads') ||
    q.includes('whatsapp') ||
    q.includes('prioriz')
  ) {
    return {
      text: `${namePrefix}para que Magia Pastelera no consuma toda tu energía hoy, separa un bloque corto solo para revisar Meta Ads o automatizar respuestas de WhatsApp, y protege otro bloque libre para tus proyectos digitales e IA.`,
      action: { label: 'Reorganizar mi día', type: 'reorganize_day' },
    };
  }

  if (q.includes('tarde') || q.includes('energía') || q.includes('mental') || q.includes('poca')) {
    const energySummary =
      energy.physical > 0 && energy.mental > 0
        ? `con tu energía actual (${energy.physical}/5 física, ${energy.mental}/5 mental)`
        : 'si hoy buscas cuidar tu energía';
    return {
      text: `${namePrefix}${energySummary}, cierra solo un pendiente concreto de alto impacto y deja el resto para mañana.`,
      action: { label: 'Reorganizar mi día', type: 'reorganize_day' },
    };
  }

  if (q.includes('pausa') || q.includes('descanso') || q.includes('desconectar')) {
    return {
      text: 'Toma 10 minutos lejos del celular y WhatsApp, estira hombros y haz cuatro respiraciones lentas antes de retomar.',
    };
  }

  if (q.includes('finanz') || q.includes('gast') || q.includes('balance') || q.includes('flujo')) {
    return {
      text: 'Aún no hay movimientos registrados. Puedes empezar anotando las ventas o gastos principales de Magia Pastelera junto con tu inversión en Meta Ads para ver la rentabilidad real en COP.',
    };
  }

  if (q.includes('evoluc') || q.includes('registr')) {
    return {
      text: 'Todavía no tienes histórico en Mi evolución. Registra tu primer momento hoy en 10 segundos y con el paso de los días verás qué hábitos cuidan mejor tu energía.',
    };
  }

  const sectionHints: Record<NavSection, string> = {
    inicio: 'Puedes contarme qué tienes en mente o pedirme añadir un pendiente rápido a tu día.',
    espacios: 'Tus 7 espacios están listos con tu contexto real; puedes ajustar ritmos u objetivos cuando quieras.',
    planificacion: 'Tu agenda empieza limpia sin compromisos inventados. Si quieres distribuir pendientes, abre el organizador.',
    evolucion: 'Registra tu primer momento para comenzar tu bitácora real de energía y calma.',
    finanzas: 'Tu módulo financiero está en $0 COP esperando tus registros reales.',
    biblioteca: 'Ya tienes precargado el catálogo de Magia Pastelera, tu perfil profesional y tus notas base.',
    configuracion: 'Si quieres que te llame por tu nombre o cambiar preferencias, puedes ajustarlo aquí.',
  };

  return { text: sectionHints[section] };
}

export function AiAssistantDrawer({
  open,
  onToggle,
  onClose,
  activeSection,
  preferences,
  energy,
  initialPrompt,
  onClearInitialPrompt,
  onOpenAdaptivePlanning,
  onQuickAddIntention,
}: AiAssistantDrawerProps) {
  const greetingName = preferences.name.trim() ? `, ${preferences.name}` : '';
  const [messages, setMessages] = useState<RichAssistantMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hola${greetingName}. Dime qué necesitas ordenar, añadir o ajustar hoy.`,
      timestamp: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [executedActionIds, setExecutedActionIds] = useState<Record<string, boolean>>({});
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && initialPrompt) {
      handleSend(initialPrompt);
      onClearInitialPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPrompt]);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSend = (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: RichAssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateSimulatedReply(content, activeSection, preferences, energy);
      const botMsg: RichAssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply.text,
        action: reply.action,
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 360);
  };

  const handleMessageAction = (msg: RichAssistantMessage) => {
    if (!msg.action) return;
    if (msg.action.type === 'reorganize_day') {
      onClose();
      onOpenAdaptivePlanning('day');
      return;
    }
    if (msg.action.type === 'reorganize_week') {
      onClose();
      onOpenAdaptivePlanning('week');
      return;
    }
    if (msg.action.type === 'add_intention' && msg.action.payload) {
      onQuickAddIntention(msg.action.payload, 'trabajo');
      setExecutedActionIds((prev) => ({ ...prev, [msg.id]: true }));
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `¿En qué te ayudo ahora${greetingName}?`,
        timestamp: 'Ahora',
      },
    ]);
    setExecutedActionIds({});
  };

  const suggestions = SECTION_SUGGESTIONS[activeSection];

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Abrir asistente"
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#135D66] text-white shadow-md hover:bg-[#0E4950] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135D66] focus-visible:ring-offset-2"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">Asistente</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="fixed inset-0 bg-[#172121]/15 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden="true"
          />

          <aside
            aria-label="Asistente Balance"
            className="relative z-10 w-full max-w-[400px] h-full bg-white border-l border-[#E5EAE8] shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5EAE8] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#ECF4F5] text-[#135D66] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#172121] truncate">
                    Asistente Balance
                  </h2>
                  <p className="text-xs text-[#768482] truncate">Tu copiloto personal</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Nueva conversación"
                  aria-label="Reiniciar conversación"
                  className="p-2 rounded-lg text-[#768482] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar asistente"
                  className="p-2 rounded-lg text-[#768482] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3.5 bg-[#FAFBFB]">
              {messages.map((msg) => {
                const done = executedActionIds[msg.id];
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1.5 ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#135D66] text-white'
                          : 'bg-white border border-[#E5EAE8] text-[#172121]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.action && (
                      <button
                        type="button"
                        disabled={done}
                        onClick={() => handleMessageAction(msg)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        {done ? 'Añadido a Mi día' : msg.action.label}
                      </button>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white border border-[#E5EAE8] rounded-2xl px-4 py-2.5 text-xs text-[#768482]">
                    Pensando...
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="px-5 pt-3 pb-4 border-t border-[#E5EAE8] bg-white space-y-3 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#F2F5F4] text-[#4E5D5B] hover:bg-[#ECF4F5] hover:text-[#135D66] transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

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
                  placeholder="Escribe lo que necesitas..."
                  className="flex-1 px-3.5 py-2.5 text-sm bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl text-[#172121] placeholder:text-[#768482] focus:outline-none focus:border-[#135D66] focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Enviar mensaje"
                  className="p-2.5 rounded-xl bg-[#135D66] text-white hover:bg-[#0E4950] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
