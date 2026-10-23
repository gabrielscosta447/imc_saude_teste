import React, { useState } from 'react';
import { Measurement, UserProfile } from '../types';
import { BiometricChart } from './BiometricChart';
import { EditMeasurementModal } from './EditMeasurementModal';
import {
  formatDateBR,
  getBMIInfo,
  getIdealWeightRange,
  exportToCSV,
  DEMO_MEASUREMENTS,
} from '../utils/bmi';

interface DashboardScreenProps {
  measurements: Measurement[];
  isDark: boolean;
  userHeight: number;
  user?: UserProfile;
  onNavigateToNew: () => void;
  onUpdateMeasurement: (updated: Measurement) => void;
  onDeleteMeasurement: (id: string) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onManualSync?: () => Promise<{ successCount: number; errorCount: number; lastError?: string; code?: string }>;
  onTestFirestore?: () => Promise<{ connected: boolean; canWrite: boolean; message: string; code?: string }>;
  onConnectGoogle?: () => Promise<{ success: boolean; error?: string }>;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  measurements,
  isDark,
  userHeight,
  onNavigateToNew,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onLoadDemoData,
  onClearAllData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<Measurement | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Measurement | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const itemsPerPage = 5;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Most recent measurement (if any)
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime()
  );

  const latestMeasurement = sortedMeasurements[0] || null;
  const previousMeasurement = sortedMeasurements[1] || null;

  // Weight delta
  const weightDelta =
    latestMeasurement && previousMeasurement
      ? Number((latestMeasurement.weight - previousMeasurement.weight).toFixed(1))
      : null;

  // IMC info
  const latestBMIInfo = latestMeasurement ? getBMIInfo(latestMeasurement.bmi) : null;

  // Ideal weight range based on user's height
  const effectiveHeight = latestMeasurement ? latestMeasurement.height : userHeight || 1.77;
  const idealRange = getIdealWeightRange(effectiveHeight);

  // Distance from ideal limit
  let distanceMessage = 'Dentro da faixa';
  if (latestMeasurement) {
    if (latestMeasurement.weight > idealRange.max) {
      const over = (latestMeasurement.weight - idealRange.max).toFixed(1);
      distanceMessage = `+${over} kg acima da faixa`;
    } else if (latestMeasurement.weight < idealRange.min) {
      const under = (idealRange.min - latestMeasurement.weight).toFixed(1);
      distanceMessage = `-${under} kg abaixo da faixa`;
    } else {
      const margin = (idealRange.max - latestMeasurement.weight).toFixed(1);
      distanceMessage = `+${margin} kg de margem`;
    }
  }

  // Filter table rows
  const filteredMeasurements = sortedMeasurements.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const dateFormatted = formatDateBR(m.date).toLowerCase();
    return (
      m.date.includes(term) ||
      dateFormatted.includes(term) ||
      m.classification.toLowerCase().includes(term) ||
      m.weight.toString().includes(term) ||
      m.bmi.toString().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredMeasurements.length / itemsPerPage) || 1;
  const paginatedMeasurements = filteredMeasurements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    if (measurements.length === 0) {
      alert('Não há medições cadastradas para exportar.');
      return;
    }
    exportToCSV(measurements);
  };

  return (
    <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all border animate-fade-in ${
            isDark
              ? 'bg-[#163832] border-[#8EB69B]/40 text-[#DAF1DE] shadow-black/60'
              : 'bg-[#053c31] border-[#235347] text-white shadow-lg'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-[#8EB69B]">check_circle</span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditMeasurementModal
          measurement={editingItem}
          isDark={isDark}
          onSave={(updated) => {
            onUpdateMeasurement(updated);
            setEditingItem(null);
            showToast('Medição atualizada com sucesso!');
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* In-App Delete Confirmation Modal (NO window.confirm!) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl relative transition-all ${
              isDark
                ? 'bg-[#0B2B26] border-[#8EB69B]/30 text-[#cde8e8]'
                : 'bg-white border-[#c0c8c4] text-[#051F20]'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-display">Excluir Medição</h3>
                <p className={`text-xs ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Deseja realmente remover o registro de{' '}
              <strong className={isDark ? 'text-white' : 'text-[#051F20]'}>
                {itemToDelete.weight.toFixed(1)} kg
              </strong>{' '}
              realizado em{' '}
              <strong className={isDark ? 'text-white' : 'text-[#051F20]'}>
                {formatDateBR(itemToDelete.date)} às {itemToDelete.time || '08:30'}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/[0.15] hover:bg-white/[0.08] text-[#c1c8c1]'
                    : 'border-[#c0c8c4] hover:bg-gray-100 text-[#404945]'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMeasurement(itemToDelete.id);
                  if (paginatedMeasurements.length === 1 && currentPage > 1) {
                    setCurrentPage((p) => p - 1);
                  }
                  setItemToDelete(null);
                  showToast('Medição excluída com sucesso!');
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Clear All Data Confirmation Modal (NO window.confirm!) */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl relative transition-all ${
              isDark
                ? 'bg-[#0B2B26] border-[#8EB69B]/30 text-[#cde8e8]'
                : 'bg-white border-[#c0c8c4] text-[#051F20]'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-display">Limpar Todas as Medições</h3>
                <p className={`text-xs ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                  Retornar ao ambiente limpo inicial
                </p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Tem certeza que deseja apagar todos os{' '}
              <strong className={isDark ? 'text-white' : 'text-[#051F20]'}>
                {measurements.length} registros
              </strong>
              ? O painel voltará ao estado limpo inicial sem medições.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/[0.15] hover:bg-white/[0.08] text-[#c1c8c1]'
                    : 'border-[#c0c8c4] hover:bg-gray-100 text-[#404945]'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setCurrentPage(1);
                  setShowClearConfirm(false);
                  showToast('Ambiente limpo! Todos os dados foram resetados.');
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer active:scale-95"
              >
                Limpar Todos os Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bioluminescent ambient background accents */}
      <div className="relative w-full overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-24 -left-20 w-96 h-96 rounded-full blur-3xl ${
            isDark ? 'bg-[#a9d2b6]/10' : 'bg-[#c3eccf]/30'
          }`}
        />
        <div
          className={`absolute top-48 -right-24 w-80 h-80 rounded-full blur-3xl ${
            isDark ? 'bg-[#163832]/60' : 'bg-[#d8f3f4]/40'
          }`}
        />
      </div>

      {/* Header Section with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mb-6 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#a9d2b6]' : 'bg-[#235347]'}`}
            />
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'
              }`}
            >
              Acompanhamento Biológico
            </span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold font-display tracking-tight ${
              isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
            }`}
          >
            Evolução do IMC &amp; Peso
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToNew}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer ${
              isDark
                ? 'bg-gradient-to-r from-[#a9d2b6] to-[#8eb69b] hover:from-[#c3eccf] hover:to-[#a9d2b6] text-[#051F20] shadow-[#a9d2b6]/20'
                : 'bg-[#053c31] hover:bg-[#235347] text-white shadow-[#053c31]/25'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-sm">+ Nova Medição</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Biometric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Card 1: Último Peso */}
        <div
          className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between transition-all group ${
            isDark
              ? 'bg-[#0B2B26]/65 border-white/[0.08] hover:border-[#8EB69B]/40 shadow-black/20 text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_4px_20px_-2px_rgba(5,31,32,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">monitor_weight</span>
              Último Peso
            </span>
            {weightDelta !== null ? (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border ${
                  weightDelta <= 0
                    ? isDark
                      ? 'bg-[#163832] border-[#8EB69B]/30 text-[#DAF1DE]'
                      : 'bg-[#c3eccf] border-[#235347]/20 text-[#002111]'
                    : isDark
                    ? 'bg-[#3d2f19] border-[#ffdcb8]/30 text-[#ffdcb8]'
                    : 'bg-[#ffdcb8] border-[#ba1a1a]/30 text-[#0c1f14]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {weightDelta <= 0 ? 'arrow_downward' : 'arrow_upward'}
                </span>
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
              </span>
            ) : (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/[0.06] text-[#c1c8c1]' : 'bg-[#def9f9] text-[#707975]'
                }`}
              >
                Inicial
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span
              className={`text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              {latestMeasurement ? latestMeasurement.weight.toFixed(1) : '--.-'}
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>kg</span>
          </div>

          <div
            className={`mt-2 flex items-center justify-between text-xs border-t pt-2.5 ${
              isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
            }`}
          >
            <span>Último registro</span>
            <span className={`font-semibold ${isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}`}>
              {latestMeasurement
                ? `${formatDateBR(latestMeasurement.date).split(' ').slice(0, 2).join(' ')}, ${latestMeasurement.time || '08:30'}`
                : 'Nenhum ainda'}
            </span>
          </div>
        </div>

        {/* Card 2: Último IMC */}
        <div
          className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between transition-all group ${
            isDark
              ? 'bg-[#0B2B26]/65 border-white/[0.08] hover:border-[#8EB69B]/40 shadow-black/20 text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_4px_20px_-2px_rgba(5,31,32,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">vital_signs</span>
              Último IMC
            </span>
            {latestBMIInfo ? (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  isDark ? latestBMIInfo.badgeClassDark : latestBMIInfo.badgeClassLight
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8EB69B]" />
                {latestBMIInfo.label}
              </span>
            ) : (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/[0.06] text-[#c1c8c1]' : 'bg-[#def9f9] text-[#707975]'
                }`}
              >
                Aguardando
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span
              className={`text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              {latestMeasurement ? latestMeasurement.bmi.toFixed(1) : '--.-'}
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>kg/m²</span>
          </div>

          <div
            className={`mt-2 flex items-center justify-between text-xs border-t pt-2.5 ${
              isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
            }`}
          >
            <span>Estado ponderal</span>
            <span className={`font-semibold ${isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'}`}>
              {latestBMIInfo ? latestBMIInfo.statusDetailed : 'Registre uma medição'}
            </span>
          </div>
        </div>

        {/* Card 3: Faixa Ideal (OMS) */}
        <div
          className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between transition-all group ${
            isDark
              ? 'bg-[#0B2B26]/65 border-white/[0.08] hover:border-[#8EB69B]/40 shadow-black/20 text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_4px_20px_-2px_rgba(5,31,32,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">health_and_safety</span>
              Faixa Ideal (OMS)
            </span>
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-white/[0.06] border-white/[0.08] text-[#DAF1DE]'
                  : 'bg-[#d8f3f4] border-[#c0c8c4]/40 text-[#053c31]'
              }`}
            >
              18.5 – 24.9
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              {idealRange.min} – {idealRange.max}
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              kg estimado
            </span>
          </div>

          <div
            className={`mt-2 flex items-center justify-between text-xs border-t pt-2.5 ${
              isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
            }`}
          >
            <span>Distância do limite</span>
            <span className={`font-semibold ${isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'}`}>
              {latestMeasurement ? distanceMessage : `Para altura ${effectiveHeight.toFixed(2)} m`}
            </span>
          </div>
        </div>
      </div>

      {/* Trajetória e Tendência (Chart Section) */}
      <div className="mb-6 relative z-10">
        <BiometricChart
          measurements={measurements}
          isDark={isDark}
          userHeight={effectiveHeight}
          onAddNew={onNavigateToNew}
        />
      </div>

      {/* Histórico de Medições (Data Table Section) */}
      <div
        className={`border backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md transition-colors duration-200 relative z-10 ${
          isDark
            ? 'bg-[#0B2B26]/65 border-white/[0.08] text-[#cde8e8]'
            : 'bg-white/85 border-white/80 shadow-[0_4px_24px_-2px_rgba(5,31,32,0.06)] text-[#051F20]'
        }`}
      >
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2
              className={`text-lg sm:text-xl font-bold font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              Histórico de Medições
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Listagem detalhada das aferições biométricas cadastradas
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <span
                className={`material-symbols-outlined absolute left-3 top-2.5 text-[18px] pointer-events-none ${
                  isDark ? 'text-[#8b938c]' : 'text-[#707975]'
                }`}
              >
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filtrar medição..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-full text-xs sm:text-sm outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#001718]/80 border-white/[0.1] text-[#DAF1DE] placeholder:text-[#8b938c] focus:border-[#a9d2b6]'
                    : 'bg-[#def9f9]/70 border-[#c0c8c4]/60 text-[#051F20] placeholder:text-[#707975] focus:bg-white focus:border-[#053c31]'
                }`}
              />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExport}
              title="Exportar CSV"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
                isDark
                  ? 'bg-[#001718]/80 border-white/[0.1] hover:bg-white/[0.1] text-[#DAF1DE]'
                  : 'bg-[#def9f9] border-[#c0c8c4]/60 hover:bg-[#d8f3f4] text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>
        </div>

        {/* Clean Empty State or Measurements Table */}
        {filteredMeasurements.length === 0 ? (
          <div
            className={`text-center py-12 px-4 rounded-xl border border-dashed ${
              isDark ? 'border-white/[0.08] bg-[#001718]/40' : 'border-[#c0c8c4]/50 bg-[#def9f9]/30'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-[#8EB69B] mb-2">monitoring</span>
            <h3 className={`text-base font-bold font-display ${isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}`}>
              {searchTerm ? 'Nenhuma medição encontrada com o termo buscado' : 'Nenhuma medição cadastrada'}
            </h3>
            <p className={`text-xs sm:text-sm max-w-md mx-auto mt-1 mb-4 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              {searchTerm
                ? 'Tente ajustar os filtros ou limpar o campo de busca.'
                : 'Seu histórico começa limpo como solicitado. Clique no botão abaixo para adicionar sua primeira medição.'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={onNavigateToNew}
                className={`px-5 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 ${
                  isDark
                    ? 'bg-[#a9d2b6] text-[#051F20] hover:bg-[#c3eccf]'
                    : 'bg-[#053c31] text-white hover:bg-[#235347]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nova Medição</span>
              </button>
            )}
          </div>
        ) : (
          /* Measurements Data Table */
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr
                  className={`text-xs font-semibold uppercase tracking-wider border-b ${
                    isDark ? 'border-white/[0.08] text-[#8EB69B]' : 'border-[#c0c8c4]/40 text-[#235347]'
                  }`}
                >
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Peso (kg)</th>
                  <th className="py-3 px-3">Altura (m)</th>
                  <th className="py-3 px-3">IMC Calculado</th>
                  <th className="py-3 px-3">Classificação</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {paginatedMeasurements.map((m) => {
                  const info = getBMIInfo(m.bmi);
                  return (
                    <React.Fragment key={m.id}>
                      <tr
                        className={`transition-colors rounded-2xl group border ${
                          isDark
                            ? 'bg-[#001718]/50 hover:bg-[#001718]/80 border-white/[0.04]'
                            : 'bg-[#def9f9]/40 hover:bg-[#def9f9]/80 border-[#c0c8c4]/30'
                        }`}
                      >
                        {/* Data & Horário */}
                        <td className="py-3.5 px-3 rounded-l-2xl">
                          <span
                            className={`font-semibold text-xs sm:text-sm block ${
                              isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'
                            }`}
                          >
                            {formatDateBR(m.date)}
                          </span>
                          <span className={`text-[11px] font-normal ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                            {m.time || '08:30'}
                          </span>
                        </td>

                        {/* Peso */}
                        <td
                          className={`py-3.5 px-3 font-bold text-sm sm:text-base ${
                            isDark ? 'text-[#FFFFFF]' : 'text-[#051F20]'
                          }`}
                        >
                          {m.weight.toFixed(1)} kg
                        </td>

                        {/* Altura */}
                        <td className={`py-3.5 px-3 text-xs sm:text-sm ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
                          {m.height.toFixed(2)} m
                        </td>

                        {/* IMC Calculado */}
                        <td
                          className={`py-3.5 px-3 font-bold text-xs sm:text-sm ${
                            isDark ? 'text-[#a9d2b6]' : 'text-[#053c31]'
                          }`}
                        >
                          {m.bmi.toFixed(1)}
                        </td>

                        {/* Classificação */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isDark ? info.badgeClassDark : info.badgeClassLight
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                info.category === 'normal' ? 'bg-[#8EB69B]' : 'bg-[#ba1a1a]'
                              }`}
                            />
                            {m.classification || info.label}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-3 text-right rounded-r-2xl">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingItem(m)}
                              title="Editar"
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                isDark
                                  ? 'hover:bg-white/[0.1] text-[#c1c8c1] hover:text-[#DAF1DE]'
                                  : 'hover:bg-[#def9f9] text-[#707975] hover:text-[#053c31]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(m)}
                              title="Excluir"
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-red-500/15 text-red-400 hover:text-red-500"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Spacer between rows */}
                      <tr className="h-1.5" />
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Compact Footer Pagination */}
        <div
          className={`mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t ${
            isDark ? 'border-white/[0.06] text-[#c1c8c1]' : 'border-[#c0c8c4]/30 text-[#404945]'
          }`}
        >
          <span>
            Mostrando{' '}
            <strong className={isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}>
              {filteredMeasurements.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredMeasurements.length)}
            </strong>{' '}
            de{' '}
            <strong className={isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}>
              {filteredMeasurements.length}
            </strong>{' '}
            medições
          </span>

          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer border ${
                isDark
                  ? 'bg-[#001718]/80 border-white/[0.08] hover:bg-white/[0.1] text-[#DAF1DE]'
                  : 'bg-[#def9f9] border-[#c0c8c4]/40 hover:bg-[#d8f3f4] text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border ${
                isDark
                  ? 'bg-[#a9d2b6]/20 border-[#a9d2b6]/40 text-[#a9d2b6]'
                  : 'bg-[#c3eccf] border-[#235347]/30 text-[#053c31]'
              }`}
            >
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer border ${
                isDark
                  ? 'bg-[#001718]/80 border-white/[0.08] hover:bg-white/[0.1] text-[#DAF1DE]'
                  : 'bg-[#def9f9] border-[#c0c8c4]/40 hover:bg-[#d8f3f4] text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Environment Helper Strip */}
      <div
        className={`mt-6 p-4 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-[#0B2B26]/50 border-white/[0.06] text-[#8b938c]'
            : 'bg-white/60 border-[#c0c8c4]/30 text-[#707975]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#8EB69B]">clean_hands</span>
          <span>
            {measurements.length === 0
              ? 'Ambiente limpo inicial ativo (nenhum dado fictício populado)'
              : `${measurements.length} medições salvas`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {measurements.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                onLoadDemoData();
                showToast('5 medições de teste carregadas com sucesso!');
              }}
              className={`px-3 py-1.5 rounded-full font-semibold border cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#163832] border-[#8EB69B]/30 text-[#DAF1DE] hover:bg-[#235347]'
                  : 'bg-[#def9f9] border-[#235347]/20 text-[#053c31] hover:bg-[#c0eacc]'
              }`}
            >
              Carregar dados do anexo (5 medições de teste)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-full font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
            >
              Limpar dados (Voltar ao ambiente limpo)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
