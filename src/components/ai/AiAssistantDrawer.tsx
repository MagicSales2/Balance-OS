import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { ChatMessage, EnergyState, NavSection, UserPreferences } from '../../types/balance';

interface AiAssistantDrawerProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  activeSection: NavSection;
  preferences: UserPreferences;
  energy: EnergyState;
  initialPrompt?: string | null;
  onClearInitialPrompt: () => void;
}

const SECTION_SUGGESTIONS: Record<NavSection, string[]> = {
  inicio: [
    '¿Cómo enfoco mi tarde con calma?',
    'Tengo poca energía mental hoy, ¿qué priorizo?',
    'Sugiere una pausa consciente de 10 minutos',
  ],
  espacios: [
    '¿Qué espacio necesita más cuidado esta semana?',
    'Ayúdame a definir una intención para Bienestar',
    '¿Cómo equilibro trabajo y descanso sin rigidez?',
  ],
  planificacion: [
    'Organiza mis bloques de hoy sin saturar la tarde',
    '¿Dónde puedo dejar un espacio libre esta semana?',
    'Reorganiza mis compromisos con ritmo más suave',
  ],
  evolucion: [
    '¿Qué notas en mi tendencia de energía reciente?',
    '¿Cómo cuidar mejor mi descanso según estos días?',
    'Dame una pregunta de reflexión para cerrar el día',
  ],
  finanzas: [
    '¿Cómo va mi balance mensual en términos simples?',
    '¿Qué hábito tranquilo me ayuda a sostener mi ahorro?',
    'Revisa mis gastos de ocio y bienestar este mes',
  ],
  biblioteca: [
    'Propón una idea de reflexión sobre ritmo sostenible',
    'Ayúdame a resumir mis notas recientes',
    '¿Qué recurso me sirve para desconectar al final del día?',
  ],
  configuracion: [
    '¿Qué tono de acompañamiento me recomiendas?',
    '¿Cómo ajustar recordatorios sin sentir presión?',
    'Ayúdame a redactar mi intención personal',
  ],
};

function generateSimulatedReply(
  query: string,
  section: NavSection,
  preferences: UserPreferences,
  energy: EnergyState
): string {
  const q = query.toLowerCase();
  const tonePrefix =
    preferences.aiTone === 'Directo y sereno'
      ? ''
      : preferences.aiTone === 'Estructurado y breve'
        ? 'En tres puntos claros: '
        : `${preferences.name}, `;

  if (q.includes('tarde') || q.includes('energía') || q.includes('mental') || q.includes('poca')) {
    return `${tonePrefix}viendo que tu energía física está en ${energy.physical}/5 y tu energía mental en ${energy.mental}/5 (${energy.emotionalLabel.toLowerCase()}), lo más amable hoy es cerrar solo el compromiso con Laura y dejar las tareas analíticas para mañana por la mañana. Una caminata de 20 minutos después de comer te ayudará a despejar sin exigirte de más.`;
  }

  if (q.includes('pausa') || q.includes('descanso') || q.includes('respir')) {
    return `${tonePrefix}prueba una transición de 10 minutos sin pantallas: prepara algo caliente, mira por la ventana y haz cuatro respiraciones lentas exhalando un poco más largo de lo que inhalas. No hace falta hacer nada productivo en ese rato; el descanso también sostiene tu semana.`;
  }

  if (q.includes('equilibr') || q.includes('espacio') || q.includes('semana')) {
    return `${tonePrefix}esta semana Trabajo y Bienestar ocupan casi la mitad de tu atención, mientras Ocio y Hogar están en un ritmo más suave. No tienes que repartirlo todo igual cada semana; basta con proteger un momento pequeño para ti el jueves y tu almuerzo familiar del sábado.`;
  }

  if (q.includes('finanz') || q.includes('ahorro') || q.includes('gast') || q.includes('balance')) {
    return `${tonePrefix}con los datos de demostración de este mes mantienes un margen positivo cercano al 23% y ya cubriste tu aporte al fondo de tranquilidad. Tu presupuesto de ocio y bienestar todavía tiene margen cómodo si decides darte un gusto sin culpas.`;
  }

  if (q.includes('reflex') || q.includes('nota') || q.includes('biblioteca')) {
    return `${tonePrefix}una pregunta sencilla para guardar hoy en Mi biblioteca: "¿Qué cosa pequeña de hoy me hizo sentir realmente presente, y qué podría soltar mañana sin que pase nada grave?"`;
  }

  const sectionHints: Record<NavSection, string> = {
    inicio:
      'Tu jornada de hoy tiene buen margen si proteges tu caminata de mediodía y disfrutas el café de la tarde sin mirar pendientes.',
    espacios:
      'Cada espacio tiene su temporada. Si uno está en pausa consciente, está cumpliendo su función de darte aire en otros frentes.',
    planificacion:
      'Tu semana se ve respirable: tienes espacio entre bloques y el domingo completamente abierto para descansar.',
    evolucion:
      'En los últimos registros se nota que los días con movimiento suave al mediodía elevan tu calma al final de la jornada.',
    finanzas:
      'Tus números muestran estabilidad y previsión. La claridad financiera aquí busca darte tranquilidad, no rigidez.',
    biblioteca:
      'Tus notas reflejan una búsqueda constante de ritmo humano y menos ruido visual.',
    configuracion:
      'Puedes adaptar el ritmo y tono del espacio cuando cambie tu momento vital; la herramienta se ajusta a ti, no al revés.',
  };

  return `${tonePrefix}${sectionHints[section]} (Respuesta simulada en esta primera etapa de BALANCE OS).`;
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
}: AiAssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hola, ${preferences.name}. Estoy aquí para acompañarte a ordenar tus días con calma, sin prisas ni exigencias. ¿En qué espacio te gustaría poner claridad hoy?`,
      timestamp: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateSimulatedReply(content, activeSection, preferences, energy);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversación reiniciada. ¿Qué te ayudaría a sentir mayor equilibrio en este momento, ${preferences.name}?`,
        timestamp: 'Ahora',
      },
    ]);
  };

  const suggestions = SECTION_SUGGESTIONS[activeSection];

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Abrir asistente de acompañamiento"
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#135D66] text-white shadow-md hover:bg-[#0E4950] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135D66] focus-visible:ring-offset-2"
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
            aria-label="Panel del Asistente Balance"
            className="relative z-10 w-full max-w-[420px] h-full bg-white border-l border-[#E5EAE8] shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAE8] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#F3F1F8] text-[#7D71A8] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#172121] truncate">
                    Asistente Balance
                  </h2>
                  <p className="text-xs text-[#768482] truncate">
                    Acompañamiento simulado · Tono {preferences.aiTone.toLowerCase()}
                  </p>
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

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#FAFBFB]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#135D66] text-white'
                        : 'bg-white border border-[#E5EAE8] text-[#172121]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white border border-[#E5EAE8] rounded-2xl px-4 py-3 text-xs text-[#768482]">
                    Pensando con calma...
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
                  placeholder="Cuéntame cómo va tu día..."
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
