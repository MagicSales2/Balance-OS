import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { EvolutionPoint } from '../../types/balance';
import { Modal } from '../ui/Modal';

interface EvolutionViewProps {
  points: EvolutionPoint[];
  onAddPoint: (point: EvolutionPoint) => void;
}

export function EvolutionView({ points, onAddPoint }: EvolutionViewProps) {
  const [visibleSeries, setVisibleSeries] = useState({
    physical: true,
    mental: true,
    calm: true,
  });
  const [logOpen, setLogOpen] = useState(false);

  const [newPhysical, setNewPhysical] = useState(8);
  const [newMental, setNewMental] = useState(7);
  const [newCalm, setNewCalm] = useState(8);
  const [newReflection, setNewReflection] = useState('');

  const avgPhysical = (
    points.reduce((acc, p) => acc + p.physical, 0) / Math.max(points.length, 1)
  ).toFixed(1);
  const avgMental = (
    points.reduce((acc, p) => acc + p.mental, 0) / Math.max(points.length, 1)
  ).toFixed(1);
  const avgCalm = (
    points.reduce((acc, p) => acc + p.calm, 0) / Math.max(points.length, 1)
  ).toFixed(1);

  // Build SVG coordinates
  const svgW = 760;
  const svgH = 240;
  const padX = 36;
  const padY = 24;
  const innerW = svgW - padX * 2;
  const innerH = svgH - padY * 2;

  const getCoords = (getter: (p: EvolutionPoint) => number) => {
    return points.map((p, idx) => {
      const x =
        points.length === 1
          ? padX + innerW / 2
          : padX + (idx / (points.length - 1)) * innerW;
      const val = Math.max(1, Math.min(10, getter(p)));
      const y = padY + innerH - ((val - 1) / 9) * innerH;
      return { x, y, val, label: p.dateLabel };
    });
  };

  const toPolyline = (coords: { x: number; y: number }[]) =>
    coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  const physicalCoords = getCoords((p) => p.physical);
  const mentalCoords = getCoords((p) => p.mental);
  const calmCoords = getCoords((p) => p.calm);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPoint({
      id: `ev-${Date.now()}`,
      dateLabel: 'Hoy',
      fullDate: 'Miércoles 18 de noviembre (Nuevo registro)',
      physical: newPhysical,
      mental: newMental,
      calm: newCalm,
      reflection:
        newReflection.trim() ||
        'Registro consciente guardado para observar cómo evoluciona mi ritmo.',
    });
    setNewReflection('');
    setLogOpen(false);
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE8]">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
            Mi evolución
          </h1>
          <p className="text-sm text-[#4E5D5B]">
            Observa tendencias suaves en tu energía y serenidad para cuidarte mejor, sin calificaciones ni juicios. Datos de demostración.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#135D66] text-white text-sm font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar momento</span>
        </button>
      </div>

      {/* Averages strip (no global score!) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5">
          <p className="text-xs text-[#768482]">Energía física media</p>
          <p className="mt-1.5 text-2xl font-semibold text-[#135D66] tabular-nums">
            {avgPhysical} <span className="text-sm font-normal text-[#768482]">/ 10</span>
          </p>
          <p className="mt-1 text-xs text-[#52605E]">Tendencia estable en las últimas semanas</p>
        </div>

        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5">
          <p className="text-xs text-[#768482]">Energía mental media</p>
          <p className="mt-1.5 text-2xl font-semibold text-[#5E8371] tabular-nums">
            {avgMental} <span className="text-sm font-normal text-[#768482]">/ 10</span>
          </p>
          <p className="mt-1 text-xs text-[#52605E]">Mayor claridad en días con pausas</p>
        </div>

        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5">
          <p className="text-xs text-[#768482]">Calma emocional media</p>
          <p className="mt-1.5 text-2xl font-semibold text-[#7D71A8] tabular-nums">
            {avgCalm} <span className="text-sm font-normal text-[#768482]">/ 10</span>
          </p>
          <p className="mt-1 text-xs text-[#52605E]">Sensación general de equilibrio cotidiano</p>
        </div>
      </section>

      {/* Visual trend chart */}
      <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#172121]">
              Tendencia de bienestar (datos de demostración)
            </h2>
            <p className="text-xs text-[#768482] mt-0.5">
              Activa o desactiva cada línea para observar patrones con claridad
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setVisibleSeries((s) => ({ ...s, physical: !s.physical }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                visibleSeries.physical
                  ? 'bg-[#ECF4F5] border-[#135D66]/30 text-[#135D66]'
                  : 'bg-white border-[#E5EAE8] text-[#768482]'
              }`}
            >
              Energía física
            </button>
            <button
              type="button"
              onClick={() => setVisibleSeries((s) => ({ ...s, mental: !s.mental }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                visibleSeries.mental
                  ? 'bg-[#EEF4F0] border-[#5E8371]/30 text-[#5E8371]'
                  : 'bg-white border-[#E5EAE8] text-[#768482]'
              }`}
            >
              Energía mental
            </button>
            <button
              type="button"
              onClick={() => setVisibleSeries((s) => ({ ...s, calm: !s.calm }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                visibleSeries.calm
                  ? 'bg-[#F3F1F8] border-[#7D71A8]/30 text-[#7D71A8]'
                  : 'bg-white border-[#E5EAE8] text-[#768482]'
              }`}
            >
              Calma emocional
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full min-w-[540px] h-auto"
            role="img"
            aria-label="Gráfico de evolución personal con datos de demostración"
          >
            {/* Horizontal grid lines */}
            {[2, 4, 6, 8, 10].map((tick) => {
              const y = padY + innerH - ((tick - 1) / 9) * innerH;
              return (
                <g key={tick}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={svgW - padX}
                    y2={y}
                    stroke="#EDF1F0"
                    strokeWidth="1"
                  />
                  <text
                    x={padX - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-[#768482] text-[11px] font-mono"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Lines */}
            {visibleSeries.physical && (
              <polyline
                fill="none"
                stroke="#135D66"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={toPolyline(physicalCoords)}
              />
            )}
            {visibleSeries.mental && (
              <polyline
                fill="none"
                stroke="#5E8371"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={toPolyline(mentalCoords)}
              />
            )}
            {visibleSeries.calm && (
              <polyline
                fill="none"
                stroke="#7D71A8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={toPolyline(calmCoords)}
              />
            )}

            {/* Data points and date labels */}
            {points.map((p, idx) => {
              const x = physicalCoords[idx].x;
              return (
                <g key={p.id}>
                  {visibleSeries.physical && (
                    <circle
                      cx={physicalCoords[idx].x}
                      cy={physicalCoords[idx].y}
                      r="4"
                      fill="#FFFFFF"
                      stroke="#135D66"
                      strokeWidth="2.5"
                    />
                  )}
                  {visibleSeries.mental && (
                    <circle
                      cx={mentalCoords[idx].x}
                      cy={mentalCoords[idx].y}
                      r="4"
                      fill="#FFFFFF"
                      stroke="#5E8371"
                      strokeWidth="2.5"
                    />
                  )}
                  {visibleSeries.calm && (
                    <circle
                      cx={calmCoords[idx].x}
                      cy={calmCoords[idx].y}
                      r="4"
                      fill="#FFFFFF"
                      stroke="#7D71A8"
                      strokeWidth="2.5"
                    />
                  )}
                  <text
                    x={x}
                    y={svgH - 4}
                    textAnchor="middle"
                    className="fill-[#768482] text-[11px]"
                  >
                    {p.dateLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* Personal log history */}
      <section className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#172121]">Bitácora reciente</h2>
          <p className="text-xs text-[#768482] mt-0.5">
            Breves notas personales que acompañan cada registro
          </p>
        </div>

        <div className="divide-y divide-[#EFF2F1]">
          {[...points].reverse().map((p) => (
            <div
              key={p.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 max-w-2xl">
                <p className="text-xs font-medium text-[#768482]">{p.fullDate}</p>
                <p className="text-sm text-[#172121] leading-relaxed">{p.reflection}</p>
              </div>
              <div className="flex items-center gap-4 text-xs shrink-0 tabular-nums font-mono">
                <span className="text-[#135D66]">Física {p.physical}/10</span>
                <span className="text-[#5E8371]">Mental {p.mental}/10</span>
                <span className="text-[#7D71A8]">Calma {p.calm}/10</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal: Registrar momento */}
      <Modal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Registrar momento personal"
        subtitle="Anota cómo te sientes hoy para observar tu evolución con el tiempo."
      >
        <form onSubmit={handleLogSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <label className="text-[#4E5D5B]">Energía física</label>
              <span className="font-mono text-[#135D66] tabular-nums">{newPhysical} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={newPhysical}
              onChange={(e) => setNewPhysical(Number(e.target.value))}
              className="w-full accent-[#135D66]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <label className="text-[#4E5D5B]">Energía mental</label>
              <span className="font-mono text-[#5E8371] tabular-nums">{newMental} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={newMental}
              onChange={(e) => setNewMental(Number(e.target.value))}
              className="w-full accent-[#5E8371]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <label className="text-[#4E5D5B]">Calma emocional</label>
              <span className="font-mono text-[#7D71A8] tabular-nums">{newCalm} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={newCalm}
              onChange={(e) => setNewCalm(Number(e.target.value))}
              className="w-full accent-[#7D71A8]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#4E5D5B]">
              Reflexión breve (opcional)
            </label>
            <textarea
              rows={3}
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              placeholder="¿Qué te ayudó hoy a sentir equilibrio?"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setLogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] transition-colors cursor-pointer"
            >
              Guardar registro
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
