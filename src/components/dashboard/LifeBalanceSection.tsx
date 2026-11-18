import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { LifeBalanceDimension, LifeBalancePeriod } from '../../types/balance';
import {
  buildLifeBalanceSnapshot,
  extractBalanceHighlights,
  SIGNAL_LABELS,
} from '../../utils/lifeBalance';

const PERIOD_OPTIONS: { id: LifeBalancePeriod; label: string }[] = [
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'trimestre', label: 'Últimos 3 meses' },
];

export function LifeBalanceSection() {
  const [period, setPeriod] = useState<LifeBalancePeriod>('semana');
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);

  const snapshot = useMemo(() => buildLifeBalanceSnapshot(period), [period]);
  const { higherAttention, needsMoreSpace } = useMemo(
    () => extractBalanceHighlights(snapshot.dimensions),
    [snapshot.dimensions]
  );

  const activeDimension: LifeBalanceDimension | null = useMemo(() => {
    if (!selectedDimensionId) return null;
    return snapshot.dimensions.find((d) => d.id === selectedDimensionId) ?? null;
  }, [selectedDimensionId, snapshot.dimensions]);

  // SVG Radar Geometry
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 132;
  const labelRadius = 166;
  const levels = [0.25, 0.5, 0.75, 1];
  const count = snapshot.dimensions.length;

  const getPoint = (index: number, ratio: number, radius = maxRadius) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
      angle,
    };
  };

  const polygonPoints = snapshot.dimensions
    .map((dim, idx) => {
      const pt = getPoint(idx, dim.presence / 100);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <section
      aria-labelledby="life-balance-heading"
      className="bg-white border border-[#E5EAE8] rounded-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header + Period selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EFF2F1]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2
              id="life-balance-heading"
              className="text-xl font-semibold tracking-tight text-[#172121]"
            >
              Mi balance de vida
            </h2>
            <span className="text-xs text-[#768482]">
              · Datos demostrativos de ejemplo
            </span>
          </div>
          <p className="text-sm text-[#4E5D5B]">
            Una mirada panorámica para observar cómo se distribuye tu atención y tomar decisiones conscientes, sin juicios ni calificaciones.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-1 p-1 bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl w-fit shrink-0"
          role="tablist"
          aria-label="Periodo de visualización del balance"
        >
          {PERIOD_OPTIONS.map((opt) => {
            const active = period === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(opt.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white text-[#135D66] shadow-xs'
                    : 'text-[#52605E] hover:text-[#172121]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Radar + Insights Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar Chart */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[460px]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label="Gráfico radial de Mi balance de vida con datos ilustrativos de ejemplo"
            >
              {/* Concentric Web Rings */}
              {levels.map((lvl) => {
                const ringPoints = snapshot.dimensions
                  .map((_, idx) => {
                    const p = getPoint(idx, lvl);
                    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lvl}
                    points={ringPoints}
                    fill="none"
                    stroke={lvl === 1 ? '#DCE3E0' : '#EDF1F0'}
                    strokeWidth="1"
                  />
                );
              })}

              {/* Radial Axes */}
              {snapshot.dimensions.map((dim, idx) => {
                const outer = getPoint(idx, 1);
                return (
                  <line
                    key={`axis-${dim.id}`}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#E7ECEA"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled Balance Polygon */}
              <polygon
                points={polygonPoints}
                fill="#135D66"
                fillOpacity="0.12"
                stroke="#135D66"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Differentiated Dimension Vertices & Labels */}
              {snapshot.dimensions.map((dim, idx) => {
                const vertex = getPoint(idx, dim.presence / 100);
                const labelPt = getPoint(idx, 1, labelRadius);
                const isSelected = activeDimension?.id === dim.id;

                // Determine horizontal text alignment based on radial position
                const dx = labelPt.x - cx;
                let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                if (dx > 24) textAnchor = 'start';
                else if (dx < -24) textAnchor = 'end';

                const dy = labelPt.y - cy;
                const verticalOffset = dy > 24 ? 10 : dy < -24 ? -4 : 3;

                // Split two-word labels cleanly if near sides so nothing clips
                const words = dim.shortLabel.split(' ');
                const shouldWrap = words.length >= 2 && Math.abs(dx) > 20;
                const firstLine = shouldWrap ? words[0] : dim.shortLabel;
                const secondLine = shouldWrap ? words.slice(1).join(' ') : '';

                return (
                  <g
                    key={dim.id}
                    className="cursor-pointer group"
                    onClick={() =>
                      setSelectedDimensionId((prev) => (prev === dim.id ? null : dim.id))
                    }
                  >
                    {/* Subtle ring on selected vertex */}
                    {isSelected && (
                      <circle
                        cx={vertex.x}
                        cy={vertex.y}
                        r="11"
                        fill={dim.color}
                        fillOpacity="0.16"
                      />
                    )}

                    {/* Differentiated colored vertex marker */}
                    <circle
                      cx={vertex.x}
                      cy={vertex.y}
                      r={isSelected ? '6.5' : '5'}
                      fill="#FFFFFF"
                      stroke={dim.color}
                      strokeWidth="2.5"
                    />

                    {/* Subtle color indicator next to label + readable label */}
                    <text
                      x={labelPt.x}
                      y={labelPt.y + verticalOffset}
                      textAnchor={textAnchor}
                      className={`text-[12px] transition-colors ${
                        isSelected
                          ? 'fill-[#172121] font-semibold'
                          : 'fill-[#4E5D5B] font-medium group-hover:fill-[#172121]'
                      }`}
                    >
                      <tspan x={labelPt.x} dy="0">
                        {firstLine}
                      </tspan>
                      {secondLine && (
                        <tspan x={labelPt.x} dy="14">
                          {secondLine}
                        </tspan>
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Differentiated Dimension Legend Strip */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {snapshot.dimensions.map((dim) => {
              const isSelected = activeDimension?.id === dim.id;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() =>
                    setSelectedDimensionId((prev) => (prev === dim.id ? null : dim.id))
                  }
                  className={`inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'text-[#172121] font-semibold'
                      : 'text-[#52605E] hover:text-[#172121]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: dim.color }}
                    aria-hidden="true"
                  />
                  <span>{dim.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Interpretation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#768482]">{snapshot.periodLabel}</p>
            <p className="text-[15px] leading-relaxed text-[#172121]">
              {snapshot.summaryNote}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-1">
            {/* Areas receiving higher attention */}
            <div className="p-4 rounded-xl bg-[#F7F8F7] space-y-2.5">
              <h3 className="text-xs font-semibold text-[#135D66]">
                Con mayor presencia actual
              </h3>
              <ul className="space-y-2">
                {higherAttention.map((dim) => (
                  <li
                    key={dim.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDimensionId(dim.id)}
                      className="flex items-center gap-2 text-left text-[#172121] hover:underline cursor-pointer"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: dim.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium">{dim.label}</span>
                    </button>
                    <span className="text-xs text-[#768482] whitespace-nowrap">
                      Presencia alta
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas needing more space */}
            <div className="p-4 rounded-xl bg-[#F7F8F7] space-y-2.5">
              <h3 className="text-xs font-semibold text-[#7D71A8]">
                Áreas que piden más espacio
              </h3>
              <ul className="space-y-2">
                {needsMoreSpace.map((dim) => (
                  <li
                    key={dim.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDimensionId(dim.id)}
                      className="flex items-center gap-2 text-left text-[#172121] hover:underline cursor-pointer"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: dim.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium">{dim.label}</span>
                    </button>
                    <span className="text-xs text-[#768482] whitespace-nowrap">
                      Espacio abierto
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive detail when user clicks a dimension, or calm transparency note */}
          <div className="pt-2 border-t border-[#EFF2F1]">
            {activeDimension ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#172121]">
                    {activeDimension.label} (ejemplo ilustrativo)
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedDimensionId(null)}
                    className="text-xs text-[#768482] hover:text-[#172121] cursor-pointer"
                  >
                    Cerrar detalle
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-[#4E5D5B]">
                  {activeDimension.exampleContext}
                </p>
                <p className="text-[11px] text-[#768482]">
                  Se calculará con:{' '}
                  {activeDimension.sourceSignals.map((s) => SIGNAL_LABELS[s]).join(' · ')}
                </p>
              </div>
            ) : (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-[#768482]">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#5E8371]" />
                <span>
                  Valores de ejemplo para mostrar la lectura visual. En futuras etapas, este mapa se construirá automáticamente con tus registros de energía, actividades, tiempo dedicado y reflexiones. Haz clic en cualquier dimensión para ver qué señales la alimentan.
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
