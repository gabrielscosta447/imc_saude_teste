import React from 'react';

interface BotanicalBackdropProps {
  isDark: boolean;
  variant: 'login' | 'register';
}

export const BotanicalBackdrop: React.FC<BotanicalBackdropProps> = ({ isDark, variant }) => {
  return (
    <section
      className={`relative w-full lg:w-1/2 min-h-[520px] lg:min-h-screen flex-col justify-between p-6 sm:p-10 lg:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r hidden lg:flex select-none transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#051F20] via-[#0B2B26] to-[#001112] border-[#8EB69B]/20 text-[#cde8e8]'
          : 'bg-gradient-to-b from-[#def9f9] to-[#c4dfe0]/70 border-white/60 text-[#051F20]'
      }`}
    >
      {/* Botanical Papercut Organic Foliage SVG Backdrop */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden ${
          isDark ? 'opacity-70 mix-blend-screen' : 'opacity-40 mix-blend-multiply'
        }`}
      >
        <svg
          className="absolute -right-24 top-0 h-full w-[140%] max-w-none object-cover"
          fill="none"
          viewBox="0 0 700 900"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient cx="60%" cy="40%" id="leafGrad1" r="70%">
              <stop offset="0%" stop-color={isDark ? '#163832' : '#235347'} stop-opacity={isDark ? '1' : '0.45'} />
              <stop offset="60%" stop-color={isDark ? '#0B2B26' : '#163832'} stop-opacity={isDark ? '0.8' : '0.3'} />
              <stop offset="100%" stop-color={isDark ? '#051F20' : '#0B2B26'} stop-opacity={isDark ? '0.6' : '0.2'} />
            </radialGradient>
            <radialGradient cx="30%" cy="50%" id="leafGrad2" r="80%">
              <stop offset="0%" stop-color={isDark ? '#235347' : '#8EB69B'} stop-opacity={isDark ? '0.8' : '0.5'} />
              <stop offset="100%" stop-color={isDark ? '#0B2B26' : '#235347'} stop-opacity={isDark ? '0.5' : '0.25'} />
            </radialGradient>
            <filter id="leafShadow1" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow
                dx="-8"
                dy="12"
                floodColor={isDark ? '#001112' : '#051F20'}
                floodOpacity={isDark ? '0.6' : '0.12'}
                stdDeviation="14"
              />
            </filter>
            <filter id="leafShadow2" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow
                dx="-12"
                dy="18"
                floodColor={isDark ? '#001112' : '#051F20'}
                floodOpacity={isDark ? '0.8' : '0.15'}
                stdDeviation="18"
              />
            </filter>
          </defs>

          {/* Organic Paper-Cut Layer 1 */}
          <path
            d="M520,0 C620,120 720,280 660,420 C600,560 670,720 590,900 L700,900 L700,0 Z"
            fill={isDark ? '#051F20' : '#235347'}
            opacity={isDark ? '0.8' : '0.25'}
          />

          {/* Layer 2: Palm fronds & Monstera silhouettes with depth */}
          <g filter="url(#leafShadow2)">
            <path
              d="M440,-40 C490,80 570,180 500,320 C440,440 530,580 470,720 C420,840 480,920 460,940 L700,940 L700,-40 Z"
              fill="url(#leafGrad1)"
            />
          </g>

          {/* Layer 3: Paper S-Curve Contour */}
          <g filter="url(#leafShadow1)">
            <path
              d="M370,-50 C410,90 350,190 390,310 C430,420 330,520 370,680 C400,800 340,890 360,950 L700,950 L700,-50 Z"
              fill={isDark ? '#163832' : '#8EB69B'}
              opacity={isDark ? '0.7' : '0.4'}
            />
          </g>

          {/* Tropical Vector Shapes */}
          <g fill={isDark ? '#8EB69B' : '#235347'} opacity={isDark ? '0.4' : '0.4'}>
            <path d="M490,240 C530,220 580,240 600,280 C610,310 590,350 560,370 C530,390 490,380 470,350 C450,320 460,260 490,240 Z" />
            <path d="M380,390 Q460,380 540,430 Q460,450 380,410 Z" />
            <path d="M360,430 Q450,440 520,510 Q430,510 360,450 Z" opacity="0.7" />
            <path d="M390,470 Q480,510 510,600 Q430,570 380,500 Z" />
            <path d="M350,530 Q440,580 470,680 Q400,640 350,560 Z" opacity="0.6" />
          </g>

          {/* Front Wave Contour */}
          <path
            d="M300,-20 C360,110 290,240 330,370 C370,490 280,600 320,740 C350,840 300,920 310,940 L350,940 C340,890 380,800 350,680 C320,550 400,430 360,320 C330,210 390,110 340,-20 Z"
            fill={isDark ? '#235347' : '#a7d0b4'}
            opacity={isDark ? '0.45' : '0.45'}
          />
        </svg>
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-sm backdrop-blur-md ${
            isDark
              ? 'bg-[#0B2B26]/80 border-[#8EB69B]/20 text-[#DAF1DE]'
              : 'bg-white/75 border-[#235347]/10 text-[#0B2B26]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#a9d2b6]' : 'bg-[#235347]'}`} />
          <span className="text-[11px] font-semibold tracking-wider uppercase">
            {variant === 'login' ? 'Monitoramento & Bem-Estar' : 'Ecossistema de Saúde'}
          </span>
        </div>

        <div
          className={`hidden sm:flex items-center gap-2 text-[12px] font-medium ${
            isDark ? 'text-[#8EB69B]' : 'text-[#235347]/80'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">spa</span>
          <span>Sincronização Ativa</span>
        </div>
      </div>

      {/* Center Manifesto Content */}
      <div className="relative z-10 max-w-lg my-10 lg:my-auto">
        <p
          className={`text-[13px] uppercase tracking-widest font-semibold mb-3 flex items-center gap-2 ${
            isDark ? 'text-[#8EB69B]' : 'text-[#235347]'
          }`}
        >
          <span className={`inline-block w-6 h-[2px] ${isDark ? 'bg-[#8EB69B]' : 'bg-[#235347]'}`} />
          {variant === 'login' ? 'Ciência & Harmonia Corporal' : 'Biometria Consciente'}
        </p>

        <h1
          className={`text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-[1.15] mb-4 font-display ${
            isDark ? 'text-[#FFFFFF]' : 'text-[#0B2B26]'
          }`}
        >
          {variant === 'login' ? (
            'Equilíbrio e Vitalidade Biológica.'
          ) : (
            <>
              Comece hoje sua evolução <span className={isDark ? 'text-[#a9d2b6] italic' : 'text-[#235347] italic'}>biométrica</span> consciente.
            </>
          )}
        </h1>

        <p
          className={`text-[15px] leading-relaxed max-w-md ${
            isDark ? 'text-[#cde8e8]/90' : 'text-[#0B2B26]/80'
          }`}
        >
          {variant === 'login'
            ? 'Acompanhe sua composição corporal, métricas basais e evolução contínua em um ambiente sereno, seguro e focado no seu bem-estar diário.'
            : 'Substitua a ansiedade clínica pela clareza serena da natureza. Monitore peso, altura e composição corporal com harmonia e base na ciência da OMS.'}
        </p>

        {variant === 'login' ? (
          /* Pills */
          <div className="mt-8 flex flex-wrap gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur-sm border ${
                isDark
                  ? 'bg-[#163832]/80 border-[#8EB69B]/30 text-[#DAF1DE]'
                  : 'bg-white/70 border-white/80 text-[#235347]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">check_circle</span> IMC &amp; Taxa Basal
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur-sm border ${
                isDark
                  ? 'bg-[#163832]/80 border-[#8EB69B]/30 text-[#DAF1DE]'
                  : 'bg-white/70 border-white/80 text-[#235347]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">timeline</span> Curvas Ponderadas
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur-sm border ${
                isDark
                  ? 'bg-[#163832]/80 border-[#8EB69B]/30 text-[#DAF1DE]'
                  : 'bg-white/70 border-white/80 text-[#235347]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">shield</span> Dados Criptografados
            </span>
          </div>
        ) : (
          /* Benefit Cards for Register */
          <div className="mt-8 flex flex-col gap-3">
            <div
              className={`flex items-center space-x-4 p-4 rounded-2xl border backdrop-blur-md shadow-sm transition-transform duration-300 hover:translate-x-1 ${
                isDark
                  ? 'bg-[#0B2B26]/65 border-[#8EB69B]/20 text-[#DAF1DE]'
                  : 'bg-white/65 border-white/80 text-[#0B2B26]'
              }`}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-[#8EB69B]/20 text-[#8EB69B]' : 'bg-[#235347]/10 text-[#235347]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">Cálculo automático da faixa ideal OMS</p>
                <p className={`text-[12px] ${isDark ? 'text-[#cde8e8]/70' : 'text-[#0B2B26]/70'}`}>
                  Intervalos saudáveis personalizados para sua estatura
                </p>
              </div>
            </div>

            <div
              className={`flex items-center space-x-4 p-4 rounded-2xl border backdrop-blur-md shadow-sm transition-transform duration-300 hover:translate-x-1 ${
                isDark
                  ? 'bg-[#0B2B26]/65 border-[#8EB69B]/20 text-[#DAF1DE]'
                  : 'bg-white/65 border-white/80 text-[#0B2B26]'
              }`}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-[#8EB69B]/20 text-[#8EB69B]' : 'bg-[#235347]/10 text-[#235347]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">Histórico detalhado e metas saudáveis</p>
                <p className={`text-[12px] ${isDark ? 'text-[#cde8e8]/70' : 'text-[#0B2B26]/70'}`}>
                  Acompanhe tendências sem pressões desnecessárias
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Left Bottom Stats or Swatches */}
      {variant === 'login' ? (
        <div
          className={`relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t ${
            isDark ? 'border-[#8EB69B]/15' : 'border-[#0B2B26]/10'
          }`}
        >
          {/* Metric Card 1 */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300 ${
              isDark
                ? 'bg-[#0B2B26]/65 border-[#8EB69B]/20 text-[#DAF1DE]'
                : 'bg-white/65 border-white/90 text-[#0B2B26]'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isDark ? 'bg-[#163832] text-[#8EB69B]' : 'bg-[#235347]/10 text-[#235347]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">vital_signs</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg font-display">98.4%</span>
                <span
                  className={`text-[11px] font-semibold flex items-center ${
                    isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span>+2.1%
                </span>
              </div>
              <p className={`text-[12px] truncate ${isDark ? 'text-[#cde8e8]/70' : 'text-[#0B2B26]/70'}`}>
                Índice de Equilíbrio Médio
              </p>
            </div>
          </div>

          {/* Metric Card 2 */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300 ${
              isDark
                ? 'bg-[#0B2B26]/65 border-[#8EB69B]/20 text-[#DAF1DE]'
                : 'bg-white/65 border-white/90 text-[#0B2B26]'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isDark ? 'bg-[#163832] text-[#8EB69B]' : 'bg-[#235347]/10 text-[#235347]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">eco</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg font-display">14.8k</span>
                <span className={`text-[11px] font-medium ${isDark ? 'text-[#8EB69B]' : 'text-[#235347]/80'}`}>
                  metas
                </span>
              </div>
              <p className={`text-[12px] truncate ${isDark ? 'text-[#cde8e8]/70' : 'text-[#0B2B26]/70'}`}>
                Evolução Contínua
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Swatch Bar on Register */
        <div
          className={`relative z-10 flex items-center justify-between pt-6 border-t ${
            isDark ? 'border-[#8EB69B]/15 text-[#8EB69B]' : 'border-[#0B2B26]/10 text-[#0B2B26]/70'
          }`}
        >
          <div className="flex items-center space-x-1.5" title="Minimal Green Palette">
            <div className="w-6 h-2 rounded-full bg-[#051F20]" />
            <div className="w-6 h-2 rounded-full bg-[#0B2B26]" />
            <div className="w-6 h-2 rounded-full bg-[#163832]" />
            <div className="w-6 h-2 rounded-full bg-[#235347]" />
            <div className="w-6 h-2 rounded-full bg-[#8EB69B]" />
            <div className="w-6 h-2 rounded-full bg-[#DAF1DE]" />
          </div>
          <p className="text-[12px] font-medium">Plataforma Segura e Privada</p>
        </div>
      )}
    </section>
  );
};
