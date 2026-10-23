import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { BotanicalBackdrop } from './BotanicalBackdrop';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  formatAuthError,
} from '../firebase';

interface LoginScreenProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onLoginSuccess: (email: string, name?: string, photoURL?: string, uid?: string) => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  isDark,
  onToggleTheme,
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setInfoNotice(null);
    setLoading(true);
    setAuthStatus('Autenticando...');

    try {
      const result = await signInWithEmailAndPassword(auth, identifier.trim(), password);
      setAuthStatus('Acesso Autorizado!');
      setTimeout(() => {
        onLoginSuccess(
          result.user.email || identifier,
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          result.user.uid
        );
      }, 500);
    } catch (err: unknown) {
      console.error('Email sign-in error:', err);
      setAuthError(formatAuthError(err));
      setLoading(false);
      setAuthStatus(null);
    }
  };

  const handleSocialLogin = async () => {
    setAuthError(null);
    setInfoNotice(null);
    setLoading(true);
    setAuthStatus('Conectando com Google...');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setAuthStatus('Acesso Autorizado!');
      setTimeout(() => {
        onLoginSuccess(
          result.user.email || 'usuario@google.com',
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          result.user.uid
        );
      }, 500);
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      setAuthError(formatAuthError(err));
      setLoading(false);
      setAuthStatus(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier || !identifier.includes('@')) {
      setAuthError('Por favor, informe seu e-mail no campo de usuário para receber o link de recuperação.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, identifier.trim());
      setInfoNotice('Link de recuperação de senha enviado com sucesso para seu e-mail!');
      setAuthError(null);
      setTimeout(() => setInfoNotice(null), 5000);
    } catch (err) {
      setAuthError(formatAuthError(err));
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#001718]' : 'bg-gradient-to-br from-[#def9f9] via-[#e4feff] to-[#def9f9]'
      }`}
    >
      {/* Floating Theme Toggle Top-Right */}
      <ThemeToggle isDark={isDark} onToggle={onToggleTheme} floating />

      {/* Ambient Glows */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-[#0B2B26]/50' : 'bg-[#c3eccf]/50'
        }`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-[36rem] h-[36rem] rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-[#163832]/40' : 'bg-[#d8f3f4]/60'
        }`}
      />

      {/* LEFT COLUMN: Botanical Art & Brand Depth */}
      <BotanicalBackdrop isDark={isDark} variant="login" />

      {/* RIGHT COLUMN: Authentication Glass Card */}
      <section className="relative w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-10 lg:p-16 min-h-screen z-10">
        <div
          className={`w-full max-w-md p-7 sm:p-10 rounded-[2.5rem] border backdrop-blur-xl shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300 ${
            isDark
              ? 'bg-[#0B2B26]/65 border-[#8EB69B]/20 shadow-[0_25px_60px_-15px_rgba(0,17,18,0.7)] text-[#cde8e8]'
              : 'bg-white/85 border-white shadow-[0_20px_50px_rgba(5,31,32,0.08)] text-[#051F20]'
          }`}
        >
          {/* Soft inner glow */}
          <div
            className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-28 rounded-full blur-2xl pointer-events-none ${
              isDark ? 'bg-[#8EB69B]/10' : 'bg-[#235347]/10'
            }`}
          />

          {/* Logo & Version Chip */}
          <div className="flex items-center justify-between mb-7">
            <BrandLogo isDark={isDark} />
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                isDark
                  ? 'bg-[#163832] text-[#8EB69B] border-[#8EB69B]/30'
                  : 'bg-[#d8f3f4] text-[#235347] border-[#235347]/10'
              }`}
            >
              v3.2 Secure
            </span>
          </div>

          {/* Header Titles */}
          <div className="mb-6">
            <h2
              className={`text-2xl sm:text-3xl font-bold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#0B2B26]'
              }`}
            >
              Entrar
            </h2>
            <p className={`text-[14px] mt-1.5 ${isDark ? 'text-[#cde8e8]/75' : 'text-[#0B2B26]/75'}`}>
              Acesse sua jornada de saúde contínua e consulte seus biomarcadores.
            </p>
          </div>

          {/* Login Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Input 1: E-mail / Usuário */}
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-[12px] font-semibold flex justify-between px-1 ${
                  isDark ? 'text-[#DAF1DE]' : 'text-[#0B2B26]'
                }`}
                htmlFor="identifier"
              >
                <span>E-mail ou usuário</span>
                <span className={`text-[11px] font-normal ${isDark ? 'text-[#8EB69B]' : 'text-[#0B2B26]/60'}`}>
                  Identificador único
                </span>
              </label>
              <div className="relative flex items-center">
                <span
                  className={`material-symbols-outlined absolute left-4 text-xl pointer-events-none ${
                    isDark ? 'text-[#8EB69B]' : 'text-[#235347]/70'
                  }`}
                >
                  alternate_email
                </span>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nome@exemplo.com.br"
                  className={`w-full h-[52px] pl-12 pr-4 rounded-full text-[14px] outline-none transition-all duration-200 border ${
                    isDark
                      ? 'bg-[#001718]/80 border-[#8EB69B]/20 text-[#FFFFFF] placeholder:text-[#8b938c] focus:border-[#8EB69B] focus:ring-2 focus:ring-[#8EB69B]/20'
                      : 'bg-[#def9f9]/60 border-[#c0c8c4]/60 text-[#051F20] placeholder:text-[#707975] focus:bg-white focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/15'
                  }`}
                />
              </div>
            </div>

            {/* Input 2: Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <label
                  className={`text-[12px] font-semibold ${isDark ? 'text-[#DAF1DE]' : 'text-[#0B2B26]'}`}
                  htmlFor="password"
                >
                  Senha
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={`text-[12px] font-semibold transition-colors focus:outline-none cursor-pointer ${
                    isDark ? 'text-[#8EB69B] hover:text-[#DAF1DE]' : 'text-[#235347] hover:text-[#0B2B26]'
                  }`}
                >
                  Esqueceu a senha?
                </button>
              </div>

              {infoNotice && (
                <div
                  className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
                    isDark
                      ? 'bg-[#163832] border-[#8EB69B]/30 text-[#DAF1DE]'
                      : 'bg-[#def9f9] border-[#235347]/20 text-[#053c31]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#8EB69B]">check_circle</span>
                  <span>{infoNotice}</span>
                </div>
              )}

              {authError && (
                <div className="px-3.5 py-2.5 rounded-xl text-xs bg-red-500/15 border border-red-500/30 text-red-400 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                  <span className="leading-snug">{authError}</span>
                </div>
              )}
              <div className="relative flex items-center">
                <span
                  className={`material-symbols-outlined absolute left-4 text-xl pointer-events-none ${
                    isDark ? 'text-[#8EB69B]' : 'text-[#235347]/70'
                  }`}
                >
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full h-[52px] pl-12 pr-12 rounded-full text-[14px] outline-none transition-all duration-200 border ${
                    isDark
                      ? 'bg-[#001718]/80 border-[#8EB69B]/20 text-[#FFFFFF] placeholder:text-[#8b938c] focus:border-[#8EB69B] focus:ring-2 focus:ring-[#8EB69B]/20'
                      : 'bg-[#def9f9]/60 border-[#c0c8c4]/60 text-[#051F20] placeholder:text-[#707975] focus:bg-white focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Alternar visibilidade da senha"
                  className={`absolute right-4 p-1 rounded-full transition-colors cursor-pointer focus:outline-none ${
                    isDark ? 'text-[#8EB69B] hover:text-[#DAF1DE]' : 'text-[#235347]/70 hover:text-[#0B2B26]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1 px-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`w-4 h-4 rounded cursor-pointer ${
                  isDark ? 'accent-[#8EB69B]' : 'accent-[#235347]'
                }`}
              />
              <label
                htmlFor="rememberMe"
                className={`text-[12px] cursor-pointer select-none ${
                  isDark ? 'text-[#cde8e8]/75' : 'text-[#0B2B26]/75'
                }`}
              >
                Lembrar deste dispositivo por 30 dias
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group w-full h-[52px] rounded-full font-semibold text-[15px] tracking-wide shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.99] disabled:opacity-75 ${
                isDark
                  ? 'bg-[#235347] hover:bg-[#2d6657] text-[#FFFFFF] shadow-[#001112]/50 border border-[#8EB69B]/30'
                  : 'bg-[#235347] hover:bg-[#0B2B26] text-white shadow-[#235347]/25'
              }`}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                  <span>{authStatus}</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6 flex items-center justify-center">
            <div className={`w-full h-[1px] ${isDark ? 'bg-[#8EB69B]/20' : 'bg-[#c0c8c4]/50'}`} />
            <span
              className={`absolute px-3 text-[11px] uppercase tracking-wider font-semibold rounded-full ${
                isDark ? 'bg-[#0B2B26] text-[#8EB69B]' : 'bg-white text-[#0B2B26]/60'
              }`}
            >
              ou entrar com
            </span>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleSocialLogin}
            disabled={loading}
            className={`w-full h-[52px] rounded-full border transition-all duration-200 flex items-center justify-center gap-3 shadow-sm cursor-pointer active:scale-[0.99] ${
              isDark
                ? 'bg-[#001718]/80 hover:bg-[#001718] border-[#8EB69B]/30 text-[#DAF1DE]'
                : 'bg-white hover:bg-[#def9f9]/50 border-[#c0c8c4]/70 text-[#0B2B26]'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium text-[14px]">Continuar com Google</span>
          </button>

          {/* Switch to Register */}
          <div className="mt-6 text-center">
            <p className={`text-[14px] ${isDark ? 'text-[#cde8e8]/80' : 'text-[#0B2B26]/80'}`}>
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className={`font-bold underline underline-offset-4 ml-1 transition-colors cursor-pointer ${
                  isDark ? 'text-[#8EB69B] hover:text-[#FFFFFF]' : 'text-[#235347] hover:text-[#0B2B26]'
                }`}
              >
                Cadastre-se
              </button>
            </p>
          </div>

          {/* Footnote */}
          <div className={`mt-5 pt-4 border-t text-center ${isDark ? 'border-[#8EB69B]/15' : 'border-[#c0c8c4]/30'}`}>
            <p className={`text-[11px] leading-snug ${isDark ? 'text-[#8b938c]' : 'text-[#0B2B26]/60'}`}>
              Seus dados antropométricos e de saúde são protegidos sob rígidos padrões de conformidade biomédica.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
