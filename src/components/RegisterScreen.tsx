import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { BotanicalBackdrop } from './BotanicalBackdrop';
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  formatAuthError,
} from '../firebase';

interface RegisterScreenProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onRegisterSuccess: (name: string, email: string, photoURL?: string, uid?: string) => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  isDark,
  onToggleTheme,
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { width: '10%', label: 'Mínimo 8 dígitos', color: isDark ? '#414843' : '#c0c8c4' };
    if (password.length < 6) return { width: '30%', label: 'Curta', color: '#ba1a1a' };
    if (password.length < 10) return { width: '65%', label: 'Boa', color: '#8EB69B' };
    return { width: '100%', label: 'Forte & Segura', color: '#235347' };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem!');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 dígitos.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        try {
          await updateProfile(cred.user, { displayName: name.trim() });
        } catch {
          // ignore profile update failure
        }
      }
      onRegisterSuccess(
        name.trim() || cred.user.email?.split('@')[0] || 'Usuário',
        cred.user.email || email,
        cred.user.photoURL || undefined,
        cred.user.uid
      );
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onRegisterSuccess(
        result.user.displayName || result.user.email?.split('@')[0] || 'Usuário',
        result.user.email || 'usuario@google.com',
        result.user.photoURL || undefined,
        result.user.uid
      );
    } catch (err) {
      console.error('Google register error:', err);
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
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

      {/* LEFT COLUMN: Botanical Art & Benefit Cards */}
      <BotanicalBackdrop isDark={isDark} variant="register" />

      {/* RIGHT COLUMN: Registration Glass Card */}
      <section className="relative w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-10 lg:p-14 min-h-screen z-10">
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

          {/* Logo Centerpiece */}
          <div className="flex flex-col items-center justify-center mb-5">
            <BrandLogo isDark={isDark} />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center mb-6">
            <h2
              className={`text-2xl sm:text-3xl font-bold tracking-tight font-display ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#0B2B26]'
              }`}
            >
              Criar Conta
            </h2>
            <p className={`text-[14px] mt-1 ${isDark ? 'text-[#cde8e8]/75' : 'text-[#0B2B26]/75'}`}>
              Comece a monitorar seu IMC e saúde hoje
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            {/* Field 1: Nome Completo */}
            <div className="flex flex-col gap-1">
              <label
                className={`text-[12px] font-semibold px-1 ${isDark ? 'text-[#DAF1DE]' : 'text-[#0B2B26]'}`}
                htmlFor="name"
              >
                Nome Completo
              </label>
              <div className="relative flex items-center">
                <span
                  className={`material-symbols-outlined absolute left-4 text-xl pointer-events-none ${
                    isDark ? 'text-[#8EB69B]' : 'text-[#235347]/70'
                  }`}
                >
                  person
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className={`w-full h-[50px] pl-12 pr-4 rounded-full text-[14px] outline-none transition-all duration-200 border ${
                    isDark
                      ? 'bg-[#001718]/80 border-[#8EB69B]/20 text-[#FFFFFF] placeholder:text-[#8b938c] focus:border-[#8EB69B] focus:ring-2 focus:ring-[#8EB69B]/20'
                      : 'bg-[#def9f9]/60 border-[#c0c8c4]/60 text-[#051F20] placeholder:text-[#707975] focus:bg-white focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/15'
                  }`}
                />
              </div>
            </div>

            {/* Field 2: E-mail */}
            <div className="flex flex-col gap-1">
              <label
                className={`text-[12px] font-semibold px-1 ${isDark ? 'text-[#DAF1DE]' : 'text-[#0B2B26]'}`}
                htmlFor="email"
              >
                E-mail
              </label>
              <div className="relative flex items-center">
                <span
                  className={`material-symbols-outlined absolute left-4 text-xl pointer-events-none ${
                    isDark ? 'text-[#8EB69B]' : 'text-[#235347]/70'
                  }`}
                >
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className={`w-full h-[50px] pl-12 pr-4 rounded-full text-[14px] outline-none transition-all duration-200 border ${
                    isDark
                      ? 'bg-[#001718]/80 border-[#8EB69B]/20 text-[#FFFFFF] placeholder:text-[#8b938c] focus:border-[#8EB69B] focus:ring-2 focus:ring-[#8EB69B]/20'
                      : 'bg-[#def9f9]/60 border-[#c0c8c4]/60 text-[#051F20] placeholder:text-[#707975] focus:bg-white focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/15'
                  }`}
                />
              </div>
            </div>

            {/* Field 3: Senha */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-1">
                <label
                  className={`text-[12px] font-semibold ${isDark ? 'text-[#DAF1DE]' : 'text-[#0B2B26]'}`}
                  htmlFor="password"
                >
                  Senha
                </label>
                <span className={`text-[11px] ${isDark ? 'text-[#8EB69B]' : 'text-[#0B2B26]/60'}`}>
                  {strength.label}
                </span>
              </div>
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
                  placeholder="Digite sua senha"
                  className={`w-full h-[50px] pl-12 pr-12 rounded-full text-[14px] outline-none transition-all duration-200 border ${
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

              {/* Password strength bar */}
              <div
                className={`h-1.5 w-full rounded-full overflow-hidden mt-1 px-0.5 flex ${
                  isDark ? 'bg-[#20393a]' : 'bg-[#cde8e8]'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: strength.width, backgroundColor: strength.color }}
                />
              </div>
            </div>

            {/* Field 4: Confirmação de Senha */}
            <div className="flex flex-col gap-1">
              <label
                className={`text-[12px] font-semibold px-1 ${isDark ? 'text-[#DAF1DE]' : 'text-[#0B2B26]'}`}
                htmlFor="confirm-password"
              >
                Confirmação de Senha
              </label>
              <div className="relative flex items-center">
                <span
                  className={`material-symbols-outlined absolute left-4 text-xl pointer-events-none ${
                    isDark ? 'text-[#8EB69B]' : 'text-[#235347]/70'
                  }`}
                >
                  verified_user
                </span>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className={`w-full h-[50px] pl-12 pr-12 rounded-full text-[14px] outline-none transition-all duration-200 border ${
                    isDark
                      ? 'bg-[#001718]/80 border-[#8EB69B]/20 text-[#FFFFFF] placeholder:text-[#8b938c] focus:border-[#8EB69B] focus:ring-2 focus:ring-[#8EB69B]/20'
                      : 'bg-[#def9f9]/60 border-[#c0c8c4]/60 text-[#051F20] placeholder:text-[#707975] focus:bg-white focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/15'
                  }`}
                />
                {passwordsMatch && (
                  <span className="material-symbols-outlined absolute right-4 text-[#8EB69B] text-xl">
                    check_circle
                  </span>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="px-3 py-2 rounded-xl text-xs bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`group w-full h-[52px] rounded-full font-semibold text-[15px] tracking-wide shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75 ${
                  isDark
                    ? 'bg-[#235347] hover:bg-[#2d6657] text-[#FFFFFF] shadow-[#001112]/50 border border-[#8EB69B]/30'
                    : 'bg-[#235347] hover:bg-[#0B2B26] text-white shadow-[#235347]/25'
                }`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                    <span>Criando sua conta...</span>
                  </>
                ) : (
                  <>
                    <span>Cadastrar</span>
                    <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className={`w-full h-[1px] ${isDark ? 'bg-[#8EB69B]/20' : 'bg-[#c0c8c4]/50'}`} />
            <span
              className={`absolute px-3 text-[11px] uppercase tracking-wider font-semibold rounded-full ${
                isDark ? 'bg-[#0B2B26] text-[#8EB69B]' : 'bg-white text-[#0B2B26]/60'
              }`}
            >
              ou
            </span>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className={`w-full h-[50px] rounded-full border transition-all duration-200 flex items-center justify-center gap-3 shadow-sm cursor-pointer active:scale-[0.99] ${
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
            <span className="font-medium text-[14px]">Cadastrar com Google</span>
          </button>

          {/* Footer Link: Entrar */}
          <div className="mt-6 text-center">
            <p className={`text-[14px] ${isDark ? 'text-[#cde8e8]/80' : 'text-[#0B2B26]/80'}`}>
              Já possui conta?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className={`font-bold hover:underline underline-offset-4 ml-1 transition-all cursor-pointer ${
                  isDark ? 'text-[#8EB69B] hover:text-[#FFFFFF]' : 'text-[#235347] hover:text-[#0B2B26]'
                }`}
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
