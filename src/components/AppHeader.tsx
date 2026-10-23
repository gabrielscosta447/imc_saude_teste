import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { Screen, UserProfile } from '../types';

interface AppHeaderProps {
  isDark: boolean;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  user: UserProfile;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isDark,
  currentScreen,
  onNavigate,
  onToggleTheme,
  onLogout,
  user,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (screen: Screen) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-colors duration-200 ${
          isDark
            ? 'bg-[#0B2B26]/90 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.35)]'
            : 'bg-[#e4feff]/90 border-b border-[#c0c8c4]/40 shadow-[0_4px_20px_-2px_rgba(5,31,32,0.05)]'
        }`}
      >
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleMobileNav('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <BrandLogo isDark={isDark} compact />
            <span
              className={`font-bold text-lg sm:text-xl font-display tracking-tight ${
                isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'
              }`}
            >
              IMC Saúde
            </span>
          </div>

          {/* Desktop Navigation Pills (Hidden on Mobile) */}
          <nav
            className={`hidden md:flex items-center gap-2 px-1.5 py-1 rounded-full backdrop-blur-md border ${
              isDark
                ? 'bg-[#001718]/70 border-white/[0.08]'
                : 'bg-[#def9f9]/80 border-[#c0c8c4]/50'
            }`}
          >
            {/* Dashboard Tab */}
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                currentScreen === 'dashboard'
                  ? isDark
                    ? 'bg-[#a9d2b6] text-[#051F20] shadow-sm'
                    : 'bg-[#053c31] text-white shadow-sm'
                  : isDark
                  ? 'text-[#c1c8c1] hover:text-[#DAF1DE]'
                  : 'text-[#404945] hover:text-[#051F20]'
              }`}
            >
              Dashboard
            </button>

            {/* Nova Medição Tab */}
            <button
              type="button"
              onClick={() => onNavigate('new-measurement')}
              className={`text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                currentScreen === 'new-measurement'
                  ? isDark
                    ? 'bg-[#a9d2b6] text-[#051F20] shadow-sm'
                    : 'bg-[#053c31] text-white shadow-sm'
                  : isDark
                  ? 'text-[#c1c8c1] hover:text-[#DAF1DE]'
                  : 'text-[#404945] hover:text-[#051F20]'
              }`}
            >
              Nova Medição
            </button>

            {/* Sair / Entrar */}
            <button
              type="button"
              onClick={onLogout}
              className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                isDark
                  ? 'text-[#c1c8c1] hover:text-[#DAF1DE]'
                  : 'text-[#404945] hover:text-[#051F20]'
              }`}
              title="Encerrar sessão"
            >
              Sair / Entrar
            </button>
          </nav>

          {/* Right Controls: Desktop theme toggle & avatar + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Available on both desktop & mobile) */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* User Profile Avatar (Desktop) */}
            <div
              className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center font-bold text-xs shadow-sm border overflow-hidden ${
                isDark
                  ? 'bg-[#235347] border-[#8EB69B]/40 text-[#DAF1DE]'
                  : 'bg-[#053c31] border-[#053c31] text-white'
              }`}
              title={user.name || user.email}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name || 'Usuário'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : user.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <span className="material-symbols-outlined text-[18px]">person</span>
              )}
            </div>

            {/* Mobile Hamburger Menu Button (Visible on mobile only) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
              className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-[#163832]/80 border-[#8EB69B]/30 text-[#DAF1DE] hover:bg-[#163832]'
                  : 'bg-[#def9f9] border-[#c0c8c4]/60 text-[#053c31] hover:bg-[#d8f3f4]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Menu Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-start pt-16">
          {/* Backdrop blur with fade */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Mobile Navigation Dropdown Card */}
          <div
            className={`relative z-50 w-full border-b shadow-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200 ${
              isDark
                ? 'bg-[#0B2B26] border-[#8EB69B]/20 text-[#cde8e8]'
                : 'bg-white border-[#c0c8c4]/40 text-[#051F20]'
            }`}
          >
            {/* User Info Header in Mobile Drawer */}
            <div
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                isDark ? 'bg-[#163832]/60 border-[#8EB69B]/20' : 'bg-[#def9f9]/60 border-[#c0c8c4]/40'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden ${
                  isDark
                    ? 'bg-[#235347] border border-[#8EB69B]/40 text-[#DAF1DE]'
                    : 'bg-[#053c31] text-white'
                }`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name || 'Usuário'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : user.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <span className="material-symbols-outlined text-xl">person</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm font-display truncate ${isDark ? 'text-white' : 'text-[#051F20]'}`}>
                  {user.name || 'Usuário'}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-[#8b938c]' : 'text-[#707975]'}`}>
                  {user.email || 'Conectado'}
                </p>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${
                  isDark
                    ? 'bg-[#235347] text-[#8EB69B] border-[#8EB69B]/30'
                    : 'bg-[#c0eacc] text-[#053c31] border-[#235347]/20'
                }`}
              >
                Ativo
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1.5">
              {/* Dashboard */}
              <button
                type="button"
                onClick={() => handleMobileNav('dashboard')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                  currentScreen === 'dashboard'
                    ? isDark
                      ? 'bg-[#a9d2b6] text-[#051F20] shadow-md'
                      : 'bg-[#053c31] text-white shadow-md'
                    : isDark
                    ? 'hover:bg-[#163832]/60 text-[#cde8e8]'
                    : 'hover:bg-[#def9f9] text-[#051F20]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">dashboard</span>
                  <span>Dashboard</span>
                </div>
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>

              {/* Nova Medição */}
              <button
                type="button"
                onClick={() => handleMobileNav('new-measurement')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                  currentScreen === 'new-measurement'
                    ? isDark
                      ? 'bg-[#a9d2b6] text-[#051F20] shadow-md'
                      : 'bg-[#053c31] text-white shadow-md'
                    : isDark
                    ? 'hover:bg-[#163832]/60 text-[#cde8e8]'
                    : 'hover:bg-[#def9f9] text-[#051F20]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  <span>Nova Medição</span>
                </div>
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>

            {/* Quick Action Button */}
            {currentScreen !== 'new-measurement' && (
              <button
                type="button"
                onClick={() => handleMobileNav('new-measurement')}
                className={`w-full py-3 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98 ${
                  isDark
                    ? 'bg-gradient-to-r from-[#a9d2b6] to-[#8eb69b] text-[#051F20]'
                    : 'bg-[#235347] hover:bg-[#053c31] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Registrar Nova Medição Agora</span>
              </button>
            )}

            {/* Divider & Logout */}
            <div
              className={`pt-3 border-t flex items-center justify-between ${
                isDark ? 'border-white/[0.08]' : 'border-[#c0c8c4]/30'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-base text-[#8EB69B]">palette</span>
                <span className={isDark ? 'text-[#c1c8c1]' : 'text-[#707975]'}>
                  Tema: {isDark ? 'Modo Escuro' : 'Modo Claro'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleMobileLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
