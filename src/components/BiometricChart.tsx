import React, { useState } from 'react';
import { Measurement, TimeFilter } from '../types';
import { formatDateBR } from '../utils/bmi';

interface BiometricChartProps {
  measurements: Measurement[];
  isDark: boolean;
  userHeight: number;
  onAddNew: () => void;
}

export const BiometricChart: React.FC<BiometricChartProps> = ({
  measurements,
  isDark,
  userHeight,
  onAddNew,
}) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter measurements according to selected timeframe
  const getFilteredData = (): Measurement[] => {
    if (measurements.length === 0) return [];

    // sort chronologically (oldest first for chart left-to-right)
    const sorted = [...measurements].sort(
      (a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime()
    );

    const now = new Date();
    if (activeFilter === '30d') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const filtered = sorted.filter((m) => new Date(m.date) >= thirtyDaysAgo);
      return filtered.length > 0 ? filtered : sorted.slice(-7);
    }
    if (activeFilter === '3m') {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const filtered = sorted.filter((m) => new Date(m.date) >= threeMonthsAgo);
      return filtered.length > 0 ? filtered : sorted.slice(-15);
    }
    if (activeFilter === '1y') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const filtered = sorted.filter((m) => new Date(m.date) >= oneYearAgo);
      return filtered.length > 0 ? filtered : sorted;
    }
    return sorted;
  };

  const chartData = getFilteredData();

  // Calculate dynamic axis scales
  const weights = chartData.map((d) => d.weight);
  const minWeight = weights.length ? Math.floor(Math.min(...weights) - 3) : 60;
  const maxWeight = weights.length ? Math.ceil(Math.max(...weights) + 3) : 85;
  const weightSpan = Math.max(maxWeight - minWeight, 5);

  const bmisArray = chartData.map((d) => d.bmi);
  const minBMI = bmisArray.length ? Number((Math.min(...bmisArray) - 1.5).toFixed(1)) : 19.0;
  const maxBMI = bmisArray.length ? Number((Math.max(...bmisArray) + 1.5).toFixed(1)) : 27.0;
  const bmiSpan = Math.max(maxBMI - minBMI, 2);

  // SVG dimensions
  const svgWidth = 900;
  const svgHeight = 280;
  const paddingLeft = 70;
  const paddingRight = 70;
  const paddingTop = 45;
  const paddingBottom = 55;

  const innerWidth = svgWidth - paddingLeft - paddingRight;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates for points
  const points = chartData.map((item, index) => {
    const x =
      chartData.length === 1
        ? paddingLeft + innerWidth / 2
        : paddingLeft + (index / (chartData.length - 1)) * innerWidth;

    const yWeight = paddingTop + innerHeight - ((item.weight - minWeight) / weightSpan) * innerHeight;
    const yBMI = paddingTop + innerHeight - ((item.bmi - minBMI) / bmiSpan) * innerHeight;

    return {
      x,
      yWeight: Math.max(paddingTop, Math.min(paddingTop + innerHeight, yWeight)),
      yBMI: Math.max(paddingTop, Math.min(paddingTop + innerHeight, yBMI)),
      item,
      index,
    };
  });

  const weightPolylinePoints = points.map((p) => `${p.x},${p.yWeight}`).join(' ');
  const imcPolylinePoints = points.map((p) => `${p.x},${p.yBMI}`).join(' ');

  // Polygon area for weight fill
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const baselineY = paddingTop + innerHeight;
  const areaPolygonPoints =
    points.length >= 2
      ? `${firstPoint.x},${firstPoint.yWeight} ${weightPolylinePoints} ${lastPoint.x},${baselineY} ${firstPoint.x},${baselineY}`
      : '';

  // 4 horizontal grid lines
  const gridLevels = [0, 0.33, 0.66, 1];

  return (
    <div
      className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md transition-colors duration-200 ${
        isDark
          ? 'bg-[#0B2B26]/65 border-white/[0.08] text-[#cde8e8]'
          : 'bg-white/85 border-white/80 shadow-[0_4px_24px_-2px_rgba(5,31,32,0.06)] text-[#051F20]'
      }`}
    >
      {/* Top Header of Chart */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2
            className={`text-lg sm:text-xl font-bold font-display ${
              isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
            }`}
          >
            Trajetória e Tendência
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
            Dinâmica simultânea entre massa corporal e índice antropométrico
          </p>
        </div>

        {/* Legend & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full inline-block ${
                  isDark ? 'bg-[#a9d2b6] shadow-[0_0_8px_rgba(169,210,182,0.8)]' : 'bg-[#053c31]'
                }`}
              />
              <span className={`font-medium ${isDark ? 'text-[#DAF1DE]' : 'text-[#051F20]'}`}>Peso (kg)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full inline-block border-2 ${
                  isDark ? 'border-[#DAF1DE] bg-[#051F20]' : 'border-[#41664f] bg-white'
                }`}
              />
              <span className={`font-medium ${isDark ? 'text-[#DAF1DE]' : 'text-[#051F20]'}`}>IMC (kg/m²)</span>
            </div>
          </div>

          {/* Timeframe Pill Switcher */}
          <div
            className={`inline-flex p-1 rounded-full border ${
              isDark ? 'bg-[#001718]/80 border-white/[0.08]' : 'bg-[#def9f9]/80 border-[#c0c8c4]/40'
            }`}
          >
            {(
              [
                { id: '30d', label: '30 dias' },
                { id: '3m', label: '3 meses' },
                { id: '1y', label: '1 ano' },
                { id: 'all', label: 'Tudo' },
              ] as const
            ).map((filter) => {
              const active = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? isDark
                        ? 'bg-[#a9d2b6] text-[#051F20] shadow-md'
                        : 'bg-[#053c31] text-white shadow-sm'
                      : isDark
                      ? 'text-[#c1c8c1] hover:text-[#DAF1DE]'
                      : 'text-[#404945] hover:text-[#051F20]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      {chartData.length === 0 ? (
        /* Clean empty state when user has 0 measurements */
        <div
          className={`w-full h-72 rounded-xl flex flex-col items-center justify-center text-center p-6 border border-dashed ${
            isDark ? 'border-[#8EB69B]/20 bg-[#001718]/40' : 'border-[#c0c8c4]/50 bg-[#def9f9]/30'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
              isDark ? 'bg-[#163832] text-[#8EB69B]' : 'bg-[#235347]/10 text-[#235347]'
            }`}
          >
            <span className="material-symbols-outlined text-3xl">show_chart</span>
          </div>
          <h3 className={`text-base font-bold font-display ${isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}`}>
            Ambiente Inicial Limpo
          </h3>
          <p className={`text-xs sm:text-sm max-w-sm mt-1 mb-4 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
            Nenhum dado cadastrado ainda. Registre sua primeira medição para visualizar as curvas de evolução biométrica.
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 ${
              isDark
                ? 'bg-[#a9d2b6] text-[#051F20] hover:bg-[#c3eccf]'
                : 'bg-[#053c31] text-white hover:bg-[#235347]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Adicionar Primeira Medição</span>
          </button>
        </div>
      ) : (
        /* Real Interactive SVG Dual Line Chart */
        <div className="w-full h-72 relative">
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            <defs>
              <linearGradient id="weightGradDark" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a9d2b6" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#235347" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#051f20" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="weightGradLight" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#053c31" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#053c31" stopOpacity="0.0" />
              </linearGradient>

              <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid Guides */}
            {gridLevels.map((lvl, i) => {
              const y = paddingTop + innerHeight * (1 - lvl);
              const weightVal = Math.round(minWeight + lvl * weightSpan);
              const bmiVal = (minBMI + lvl * bmiSpan).toFixed(1);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    x2={svgWidth - paddingRight}
                    y1={y}
                    y2={y}
                    stroke={isDark ? '#8eb69b' : '#c0c8c4'}
                    strokeOpacity={isDark ? '0.15' : '0.35'}
                    strokeDasharray="4 4"
                  />
                  {/* Left Axis Label (Peso) */}
                  <text
                    x={paddingLeft - 14}
                    y={y + 4}
                    textAnchor="end"
                    fill={isDark ? '#8eb69b' : '#707975'}
                    fontSize="11"
                    fontWeight="500"
                    className="font-mono select-none"
                  >
                    {weightVal}
                  </text>
                  {/* Right Axis Label (IMC) */}
                  <text
                    x={svgWidth - paddingRight + 14}
                    y={y + 4}
                    textAnchor="start"
                    fill={isDark ? '#DAF1DE' : '#707975'}
                    fontSize="11"
                    fontWeight="500"
                    className="font-mono select-none"
                  >
                    {bmiVal}
                  </text>
                </g>
              );
            })}

            {/* Weight Area Gradient Fill */}
            {points.length >= 2 && (
              <polygon
                points={areaPolygonPoints}
                fill={isDark ? 'url(#weightGradDark)' : 'url(#weightGradLight)'}
              />
            )}

            {/* Weight Curve Polyline */}
            {points.length >= 2 && (
              <polyline
                points={weightPolylinePoints}
                fill="none"
                stroke={isDark ? '#a9d2b6' : '#053c31'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isDark ? 'url(#lineGlow)' : undefined}
              />
            )}

            {/* IMC Curve Polyline (Dashed) */}
            {points.length >= 2 && (
              <polyline
                points={imcPolylinePoints}
                fill="none"
                stroke={isDark ? '#DAF1DE' : '#41664f'}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {points.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              const isLatest = idx === points.length - 1;

              return (
                <g key={p.item.id || idx}>
                  {/* Vertical Guide Line on Hover (pointer-events-none to prevent mouseleave flicker) */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      x2={p.x}
                      y1={paddingTop}
                      y2={baselineY}
                      stroke={isDark ? '#8EB69B' : '#235347'}
                      strokeOpacity="0.45"
                      strokeDasharray="3 3"
                      className="pointer-events-none"
                    />
                  )}

                  {/* IMC Point (Visual only, pointer-events-none) */}
                  <circle
                    cx={p.x}
                    cy={p.yBMI}
                    r={isHovered ? 5.5 : 4}
                    fill={isDark ? '#0B2B26' : '#ffffff'}
                    stroke={isDark ? '#DAF1DE' : '#41664f'}
                    strokeWidth="2.5"
                    className="pointer-events-none transition-all duration-200"
                  />

                  {/* Pulsing halo around hovered weight point */}
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.yWeight}
                      r={14}
                      fill={isDark ? '#a9d2b6' : '#053c31'}
                      fillOpacity={isDark ? '0.25' : '0.15'}
                      className="pointer-events-none"
                    />
                  )}

                  {/* Weight Point (Visual only, pointer-events-none to eliminate jitter) */}
                  <circle
                    cx={p.x}
                    cy={p.yWeight}
                    r={isHovered ? 7.5 : isLatest ? 6 : 5}
                    fill={isLatest || isHovered ? (isDark ? '#a9d2b6' : '#053c31') : isDark ? '#0B2B26' : '#ffffff'}
                    stroke={isDark ? '#a9d2b6' : '#053c31'}
                    strokeWidth={isHovered ? 3.5 : 3}
                    className="pointer-events-none transition-all duration-150"
                  />

                  {/* Stable Invisible Hit Area (Radius 28px for smooth, zero-flicker hover detection) */}
                  <circle
                    cx={p.x}
                    cy={p.yWeight}
                    r={26}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* X Axis Date Label */}
                  <text
                    x={p.x}
                    y={baselineY + 24}
                    textAnchor="middle"
                    fill={isLatest ? (isDark ? '#DAF1DE' : '#053c31') : isDark ? '#8eb69b' : '#707975'}
                    fontSize="11"
                    fontWeight={isLatest ? '700' : '500'}
                    className="select-none pointer-events-none"
                  >
                    {isLatest ? 'Hoje' : formatDateBR(p.item.date).split(' ').slice(0, 2).join(' ')}
                  </text>
                </g>
              );
            })}

            {/* Hovered / Latest Tooltip Callout */}
            {(() => {
              const activePoint =
                hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];
              if (!activePoint) return null;

              const tooltipX = Math.min(Math.max(activePoint.x - 45, 10), svgWidth - 100);
              const tooltipY = Math.max(activePoint.yWeight - 46, 10);

              return (
                <g transform={`translate(${tooltipX}, ${tooltipY})`} className="pointer-events-none">
                  <rect
                    width="92"
                    height="38"
                    rx="8"
                    fill={isDark ? '#001718' : '#053c31'}
                    stroke={isDark ? '#a9d2b6' : '#94c5b6'}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="46"
                    y="16"
                    textAnchor="middle"
                    fill={isDark ? '#DAF1DE' : '#ffffff'}
                    fontSize="11"
                    fontWeight="700"
                  >
                    {activePoint.item.weight.toFixed(1)} kg
                  </text>
                  <text
                    x="46"
                    y="29"
                    textAnchor="middle"
                    fill={isDark ? '#a9d2b6' : '#bbeddd'}
                    fontSize="10"
                    fontWeight="500"
                  >
                    IMC {activePoint.item.bmi.toFixed(1)}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Footer Info */}
      <div
        className={`mt-4 pt-3 flex flex-wrap items-center justify-between text-xs border-t ${
          isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#8EB69B]">info</span>
          Os índices são calculados com base na altura de {userHeight.toFixed(2)} m.
        </span>
        <span className={`font-medium ${isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'}`}>
          {chartData.length > 0 ? 'Equilíbrio sustentável no último trimestre' : 'Ambiente pronto para registro'}
        </span>
      </div>
    </div>
  );
};
