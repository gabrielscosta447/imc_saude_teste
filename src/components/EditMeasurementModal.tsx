import React, { useState } from 'react';
import { Measurement } from '../types';
import { calculateBMI, getBMIInfo } from '../utils/bmi';

interface EditMeasurementModalProps {
  measurement: Measurement;
  isDark: boolean;
  onSave: (updated: Measurement) => void;
  onClose: () => void;
}

export const EditMeasurementModal: React.FC<EditMeasurementModalProps> = ({
  measurement,
  isDark,
  onSave,
  onClose,
}) => {
  const [weight, setWeight] = useState<number>(measurement.weight);
  const [height, setHeight] = useState<number>(measurement.height);
  const [date, setDate] = useState<string>(measurement.date);
  const [time, setTime] = useState<string>(measurement.time || '08:00');

  const computedBMI = calculateBMI(weight, height);
  const bmiInfo = getBMIInfo(computedBMI);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight <= 0 || height <= 0) return;

    onSave({
      ...measurement,
      weight,
      height,
      date,
      time,
      bmi: computedBMI,
      classification: bmiInfo.label,
      statusLabel: bmiInfo.statusDetailed,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative transition-colors ${
          isDark
            ? 'bg-[#0B2B26] border-[#8EB69B]/30 text-[#cde8e8]'
            : 'bg-white border-[#c0c8c4] text-[#051F20]'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8EB69B]">edit_note</span>
            <h3 className="font-bold text-lg font-display">Editar Medição</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className={`w-full h-12 px-4 rounded-full border text-sm font-semibold outline-none ${
                isDark
                  ? 'bg-[#001718] border-[#8EB69B]/30 text-white'
                  : 'bg-[#def9f9]/50 border-[#c0c8c4] text-[#051F20]'
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Altura (m)</label>
            <input
              type="number"
              step="0.01"
              required
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              className={`w-full h-12 px-4 rounded-full border text-sm font-semibold outline-none ${
                isDark
                  ? 'bg-[#001718] border-[#8EB69B]/30 text-white'
                  : 'bg-[#def9f9]/50 border-[#c0c8c4] text-[#051F20]'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full h-12 px-3 rounded-full border text-xs outline-none ${
                  isDark
                    ? 'bg-[#001718] border-[#8EB69B]/30 text-white [color-scheme:dark]'
                    : 'bg-[#def9f9]/50 border-[#c0c8c4] text-[#051F20]'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Horário</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full h-12 px-3 rounded-full border text-xs outline-none ${
                  isDark
                    ? 'bg-[#001718] border-[#8EB69B]/30 text-white [color-scheme:dark]'
                    : 'bg-[#def9f9]/50 border-[#c0c8c4] text-[#051F20]'
                }`}
              />
            </div>
          </div>

          {/* Recalculated preview */}
          <div
            className={`p-3 rounded-2xl flex items-center justify-between border ${
              isDark ? 'bg-[#163832]/60 border-[#8EB69B]/20' : 'bg-[#d8f3f4]/70 border-[#c0c8c4]/40'
            }`}
          >
            <div>
              <span className="text-[11px] block text-[#8EB69B]">Novo IMC Calculado</span>
              <span className="font-bold text-base">{computedBMI} kg/m²</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isDark ? bmiInfo.badgeClassDark : bmiInfo.badgeClassLight
              }`}
            >
              {bmiInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              type="submit"
              className="flex-1 h-12 rounded-full bg-[#235347] hover:bg-[#053c31] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-12 rounded-full border border-gray-400/40 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
