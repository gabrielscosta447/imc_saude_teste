import React, { useState } from 'react';
import { calculateBMI, getBMIInfo } from '../utils/bmi';
import { Measurement } from '../types';

interface NewMeasurementScreenProps {
  isDark: boolean;
  userDefaultHeight: number;
  onSaveMeasurement: (measurement: Omit<Measurement, 'id'>) => void;
  onCancel: () => void;
}

export const NewMeasurementScreen: React.FC<NewMeasurementScreenProps> = ({
  isDark,
  userDefaultHeight,
  onSaveMeasurement,
  onCancel,
}) => {
  const [weight, setWeight] = useState<number>(72.4);
  const [unit, setUnit] = useState<'m' | 'cm'>('m');
  const [heightInput, setHeightInput] = useState<number>(userDefaultHeight || 1.75);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [showToast, setShowToast] = useState(false);

  // Compute normalized height in meters
  const heightInMeters = unit === 'cm' ? heightInput / 100 : heightInput;

  // Calculate live BMI
  const currentBMI = calculateBMI(weight, heightInMeters);
  const bmiInfo = getBMIInfo(currentBMI);

  // Gauge needle rotation
  // Map IMC 15..35 to -80deg..+80deg
  const clampedBMI = Math.min(Math.max(currentBMI || 15, 15), 35);
  const needleAngle = -80 + ((clampedBMI - 15) / 20) * 160;

  const handleUnitToggle = (newUnit: 'm' | 'cm') => {
    if (newUnit === unit) return;
    if (newUnit === 'cm') {
      setUnit('cm');
      setHeightInput(Math.round(heightInput * 100));
    } else {
      setUnit('m');
      setHeightInput(Number((heightInput / 100).toFixed(2)));
    }
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight <= 0 || heightInMeters <= 0) {
      setValidationError('Por favor, informe valores válidos de peso e altura.');
      setTimeout(() => setValidationError(null), 4000);
      return;
    }
    setValidationError(null);

    onSaveMeasurement({
      date,
      time: time || '08:00',
      weight,
      height: heightInMeters,
      bmi: currentBMI,
      classification: bmiInfo.label,
      statusLabel: bmiInfo.statusDetailed,
    });

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onCancel(); // return to dashboard
    }, 1200);
  };

  return (
    <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 transition-all animate-bounce ${
            isDark
              ? 'bg-[#235347] text-[#FFFFFF] border border-[#8EB69B]/40 shadow-black/60'
              : 'bg-[#053c31] text-white shadow-lg'
          }`}
        >
          <span className="material-symbols-outlined text-2xl text-[#8EB69B]">task_alt</span>
          <span className="font-semibold text-sm">Medição registrada com sucesso!</span>
        </div>
      )}

      {/* Ambient Organic Circles */}
      <div className="relative w-full max-w-4xl mx-auto">
        <div
          className={`absolute -top-12 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-10 ${
            isDark ? 'bg-[#0B2B26]/80' : 'bg-[#c3eccf]/40'
          }`}
        />
        <div
          className={`absolute top-1/2 -right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-10 ${
            isDark ? 'bg-[#163832]/70' : 'bg-[#bbeddd]/30'
          }`}
        />

        {/* Main Card */}
        <div
          className={`rounded-3xl border backdrop-blur-2xl p-6 sm:p-10 relative overflow-hidden transition-all duration-300 ${
            isDark
              ? 'bg-[#0B2B26]/65 border-[#8EB69B]/20 shadow-[0_25px_60px_-15px_rgba(0,17,18,0.7)] text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_20px_50px_-10px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          {/* Top Header */}
          <div className="flex flex-col items-center text-center mb-8 relative">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide mb-2.5 uppercase border shadow-sm ${
                isDark
                  ? 'bg-[#163832] border-[#8EB69B]/30 text-[#DAF1DE]'
                  : 'bg-[#c0eacc] border-[#235347]/20 text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#8EB69B]">spa</span>
              <span>Registro Biológico</span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-bold font-display tracking-tight ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
              }`}
            >
              Nova Medição
            </h1>
            <p className={`text-sm sm:text-base max-w-md mt-1.5 ${isDark ? 'text-[#c1c8c1]' : 'text-[#404945]'}`}>
              Informe seu peso e altura para calcular e registrar seu IMC com harmonia natural.
            </p>
          </div>

          {/* Grid Layout: Inputs Form (7 cols) + Real-time Live Gauge (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Inputs Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-5">
              {/* Field 1: Peso */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="weight-input"
                    className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                      isDark ? 'text-[#DAF1DE]' : 'text-[#051F20]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">scale</span>
                    PESO (kg)
                  </label>
                  <span className={`text-xs ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>Ex: 72.4</span>
                </div>
                <div
                  className={`relative flex items-center rounded-full transition-all border ${
                    isDark
                      ? 'bg-[#163832]/60 border-[#8EB69B]/20 focus-within:border-[#8EB69B] focus-within:ring-2 focus-within:ring-[#8EB69B]/20'
                      : 'bg-[#def9f9]/70 border-[#c0c8c4]/60 focus-within:border-[#053c31] focus-within:ring-2 focus-within:ring-[#053c31]/15'
                  }`}
                >
                  <input
                    id="weight-input"
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    required
                    value={weight || ''}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    placeholder="00.0"
                    className={`w-full h-14 bg-transparent pl-5 pr-20 font-bold text-xl outline-none rounded-full ${
                      isDark ? 'text-[#FFFFFF]' : 'text-[#051F20]'
                    }`}
                  />
                  <div
                    className={`absolute right-2 px-3 py-1.5 rounded-full text-xs font-semibold pointer-events-none border ${
                      isDark
                        ? 'bg-[#20393a] border-[#8EB69B]/30 text-[#DAF1DE]'
                        : 'bg-[#c0eacc] border-[#235347]/20 text-[#053c31]'
                    }`}
                  >
                    kg
                  </div>
                </div>
              </div>

              {/* Field 2: Altura */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="height-input"
                    className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                      isDark ? 'text-[#DAF1DE]' : 'text-[#051F20]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">height</span>
                    ALTURA ({unit})
                  </label>
                  {/* Unit switcher */}
                  <div
                    className={`flex items-center gap-1 p-0.5 rounded-full text-[11px] border ${
                      isDark
                        ? 'bg-[#163832]/70 border-[#8EB69B]/20'
                        : 'bg-[#d2edee] border-[#c0c8c4]/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('m')}
                      className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                        unit === 'm'
                          ? isDark
                            ? 'bg-[#a9d2b6] text-[#051F20]'
                            : 'bg-[#053c31] text-white'
                          : isDark
                          ? 'text-[#c1c8c1]'
                          : 'text-[#404945]'
                      }`}
                    >
                      Metros
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('cm')}
                      className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                        unit === 'cm'
                          ? isDark
                            ? 'bg-[#a9d2b6] text-[#051F20]'
                            : 'bg-[#053c31] text-white'
                          : isDark
                          ? 'text-[#c1c8c1]'
                          : 'text-[#404945]'
                      }`}
                    >
                      Centímetros
                    </button>
                  </div>
                </div>

                <div
                  className={`relative flex items-center rounded-full transition-all border ${
                    isDark
                      ? 'bg-[#163832]/60 border-[#8EB69B]/20 focus-within:border-[#8EB69B] focus-within:ring-2 focus-within:ring-[#8EB69B]/20'
                      : 'bg-[#def9f9]/70 border-[#c0c8c4]/60 focus-within:border-[#053c31] focus-within:ring-2 focus-within:ring-[#053c31]/15'
                  }`}
                >
                  <input
                    id="height-input"
                    type="number"
                    step={unit === 'm' ? '0.01' : '1'}
                    min={unit === 'm' ? 0.5 : 50}
                    max={unit === 'm' ? 2.5 : 250}
                    required
                    value={heightInput || ''}
                    onChange={(e) => setHeightInput(parseFloat(e.target.value) || 0)}
                    placeholder={unit === 'm' ? '1.75' : '175'}
                    className={`w-full h-14 bg-transparent pl-5 pr-20 font-bold text-xl outline-none rounded-full ${
                      isDark ? 'text-[#FFFFFF]' : 'text-[#051F20]'
                    }`}
                  />
                  <div
                    className={`absolute right-2 px-3 py-1.5 rounded-full text-xs font-semibold pointer-events-none border ${
                      isDark
                        ? 'bg-[#20393a] border-[#8EB69B]/30 text-[#DAF1DE]'
                        : 'bg-[#c0eacc] border-[#235347]/20 text-[#053c31]'
                    }`}
                  >
                    {unit}
                  </div>
                </div>
              </div>

              {/* Field 3: Data da Medição */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="date-input"
                    className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                      isDark ? 'text-[#DAF1DE]' : 'text-[#051F20]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#8EB69B]">calendar_today</span>
                    DATA DA MEDIÇÃO
                  </label>
                  <button
                    type="button"
                    onClick={handleSetToday}
                    className={`text-xs font-semibold underline cursor-pointer transition-colors ${
                      isDark ? 'text-[#8EB69B] hover:text-[#FFFFFF]' : 'text-[#053c31] hover:text-[#235347]'
                    }`}
                  >
                    Definir hoje
                  </button>
                </div>

                <div
                  className={`relative flex items-center rounded-full transition-all border ${
                    isDark
                      ? 'bg-[#163832]/60 border-[#8EB69B]/20 focus-within:border-[#8EB69B]'
                      : 'bg-[#def9f9]/70 border-[#c0c8c4]/60 focus-within:border-[#053c31]'
                  }`}
                >
                  <input
                    id="date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full h-14 bg-transparent pl-5 pr-12 text-sm sm:text-base outline-none rounded-full cursor-pointer ${
                      isDark ? 'text-[#FFFFFF] [color-scheme:dark]' : 'text-[#051F20]'
                    }`}
                  />
                  <div className="absolute right-4 text-[#8EB69B] pointer-events-none">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="px-4 py-2.5 rounded-xl text-xs bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Submit & Cancel Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  className={`w-full sm:flex-1 h-14 rounded-full font-semibold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all ${
                    isDark
                      ? 'bg-[#235347] hover:bg-[#2d6657] text-white border border-[#8EB69B]/30'
                      : 'bg-[#235347] hover:bg-[#053c31] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Salvar Medição</span>
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className={`w-full sm:w-auto px-6 h-14 rounded-full text-sm font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                    isDark
                      ? 'border-[#8EB69B]/20 hover:bg-[#163832]/40 text-[#cde8e8]'
                      : 'border-[#c0c8c4]/70 hover:bg-[#def9f9]/50 text-[#051F20]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Cancelar / Dashboard</span>
                </button>
              </div>
            </form>

            {/* Right: Real-Time Dynamic Feedback & Gauge Card */}
            <div
              className={`lg:col-span-5 w-full rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between border backdrop-blur-md shadow-lg ${
                isDark
                  ? 'bg-[#0B2B26]/65 border-[#8EB69B]/20 text-[#cde8e8]'
                  : 'bg-[#def9f9]/60 border-[#c0c8c4]/50 text-[#051F20]'
              }`}
            >
              {/* Live Preview Top Status */}
              <div
                className={`w-full flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-[#8EB69B]/15' : 'border-[#c0c8c4]/40'
                }`}
              >
                <span className={`text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                  Cálculo em Tempo Real
                </span>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 border ${
                    isDark ? bmiInfo.badgeClassDark : bmiInfo.badgeClassLight
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      bmiInfo.category === 'normal' ? 'bg-[#235347]' : 'bg-[#ba1a1a]'
                    }`}
                  />
                  <span>{bmiInfo.label}</span>
                </div>
              </div>

              {/* Gauge Arc Graphic */}
              <div className="relative flex flex-col items-center justify-center my-4">
                <svg className="w-56 h-36 overflow-visible" viewBox="0 0 200 120">
                  {/* Arc Segments */}
                  {/* Faixa 1: Abaixo <18.5 */}
                  <path
                    d="M 20 110 A 80 80 0 0 1 50 45"
                    fill="none"
                    stroke={isDark ? '#25433d' : '#def9f9'}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Faixa 2: Normal 18.5 - 24.9 */}
                  <path
                    d="M 54 41 A 80 80 0 0 1 125 32"
                    fill="none"
                    stroke={isDark ? '#2d6657' : '#c0eacc'}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Faixa 3: Sobrepeso 25 - 29.9 */}
                  <path
                    d="M 130 34 A 80 80 0 0 1 170 70"
                    fill="none"
                    stroke={isDark ? '#6e502c' : '#ffdcb8'}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Faixa 4: Obesidade 30+ */}
                  <path
                    d="M 173 75 A 80 80 0 0 1 180 110"
                    fill="none"
                    stroke={isDark ? '#682928' : '#ffdad6'}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Needle Indicator */}
                  <g
                    className="origin-[100px_110px] transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${needleAngle}deg)` }}
                  >
                    <line
                      x1="100"
                      y1="110"
                      x2="100"
                      y2="38"
                      stroke={isDark ? '#DAF1DE' : '#053c31'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="110" r="7" fill={isDark ? '#a9d2b6' : '#053c31'} />
                    <circle cx="100" cy="110" r="3" fill={isDark ? '#051F20' : '#ffffff'} />
                  </g>
                </svg>

                {/* Central Metric Value */}
                <div className="text-center mt-[-10px]">
                  <span
                    className={`text-[11px] block uppercase tracking-wider font-semibold ${
                      isDark ? 'text-[#8b938c]' : 'text-[#707975]'
                    }`}
                  >
                    Seu Índice Atual
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-4xl font-extrabold font-display tracking-tight ${
                        isDark ? 'text-[#FFFFFF]' : 'text-[#053c31]'
                      }`}
                    >
                      {currentBMI ? currentBMI.toFixed(1) : '--.-'}
                    </span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-[#DAF1DE]/80' : 'text-[#404945]'}`}>
                      kg/m²
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorical Scale 4-Bracket Bar */}
              <div className="w-full flex flex-col gap-2 pt-2">
                <div className="grid grid-cols-4 gap-1.5 w-full text-center">
                  {/* Underweight */}
                  <div
                    className={`p-2 rounded-xl text-xs transition-colors border ${
                      bmiInfo.category === 'under'
                        ? isDark
                          ? 'bg-[#25433d] border-[#8EB69B]/40 text-[#DAF1DE] font-bold shadow-sm'
                          : 'bg-[#c0eacc] border-[#235347] text-[#051F20] font-bold shadow-sm'
                        : isDark
                        ? 'bg-[#163832]/50 border-transparent text-[#8b938c]'
                        : 'bg-white/60 border-transparent text-[#707975]'
                    }`}
                  >
                    <p className="font-semibold text-[11px]">Baixo</p>
                    <p className="text-[10px] mt-0.5">&lt; 18.5</p>
                  </div>

                  {/* Normal */}
                  <div
                    className={`p-2 rounded-xl text-xs transition-colors border ${
                      bmiInfo.category === 'normal'
                        ? isDark
                          ? 'bg-[#235347] border-[#a9d2b6]/50 text-white font-bold shadow-sm'
                          : 'bg-[#c3eccf] border-[#235347] text-[#002111] font-bold shadow-sm'
                        : isDark
                        ? 'bg-[#163832]/50 border-transparent text-[#8b938c]'
                        : 'bg-white/60 border-transparent text-[#707975]'
                    }`}
                  >
                    <p className="font-semibold text-[11px]">Normal</p>
                    <p className="text-[10px] mt-0.5">18.5 - 24.9</p>
                  </div>

                  {/* Overweight */}
                  <div
                    className={`p-2 rounded-xl text-xs transition-colors border ${
                      bmiInfo.category === 'over'
                        ? isDark
                          ? 'bg-[#6e502c] border-[#ffdcb8]/40 text-[#ffdcb8] font-bold shadow-sm'
                          : 'bg-[#ffdcb8] border-[#ba1a1a]/40 text-[#0c1f14] font-bold shadow-sm'
                        : isDark
                        ? 'bg-[#163832]/50 border-transparent text-[#8b938c]'
                        : 'bg-white/60 border-transparent text-[#707975]'
                    }`}
                  >
                    <p className="font-semibold text-[11px]">Sobrepeso</p>
                    <p className="text-[10px] mt-0.5">25 - 29.9</p>
                  </div>

                  {/* Obese */}
                  <div
                    className={`p-2 rounded-xl text-xs transition-colors border ${
                      bmiInfo.category === 'obese'
                        ? isDark
                          ? 'bg-[#682928] border-[#ffdad6]/40 text-[#ffdad6] font-bold shadow-sm'
                          : 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a] font-bold shadow-sm'
                        : isDark
                        ? 'bg-[#163832]/50 border-transparent text-[#8b938c]'
                        : 'bg-white/60 border-transparent text-[#707975]'
                    }`}
                  >
                    <p className="font-semibold text-[11px]">Obesidade</p>
                    <p className="text-[10px] mt-0.5">30.0 +</p>
                  </div>
                </div>

                {/* Feedback Box */}
                <div
                  className={`text-center mt-2 p-3 rounded-xl border ${
                    isDark
                      ? 'bg-[#163832]/60 border-[#8EB69B]/20 text-[#DAF1DE]'
                      : 'bg-white/80 border-[#c0c8c4]/40 text-[#051F20]'
                  }`}
                >
                  <p className="text-xs leading-relaxed">
                    <span className="material-symbols-outlined text-[16px] text-[#8EB69B] align-middle mr-1.5">
                      check_circle
                    </span>
                    {bmiInfo.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Health Advice Pill Card */}
        <div
          className={`mt-6 p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between flex-wrap gap-4 shadow-sm ${
            isDark
              ? 'bg-[#0B2B26]/60 border-[#8EB69B]/20 text-[#cde8e8]'
              : 'bg-white/70 border-[#c0c8c4]/40 text-[#051F20]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                isDark
                  ? 'bg-[#163832] border-[#8EB69B]/30 text-[#8EB69B]'
                  : 'bg-[#c0eacc] border-[#235347]/20 text-[#053c31]'
              }`}
            >
              <span className="material-symbols-outlined text-xl">monitor_heart</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold">Consistência é Vitalidade</h4>
              <p className={`text-xs ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                Recomenda-se realizar a pesagem pela manhã, em jejum e após esvaziar a bexiga.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8EB69B]">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Classificação OMS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
