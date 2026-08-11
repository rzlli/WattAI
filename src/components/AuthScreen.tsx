import React, { useState } from 'react';
import { Zap, Lock, User as UserIcon, UserCheck, ArrowLeft, Globe, CheckCircle2, AlertTriangle, ShieldCheck, Check, X } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const { lang, setLang, t } = useLanguage();

  const [isRegister, setIsRegister] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if string contains Arabic characters
  const containsArabic = (text: string): boolean => {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
  };

  // Check Password Security Policy rules
  const getPasswordPolicy = (pass: string) => {
    const hasArabic = containsArabic(pass);
    const isEnglishOnly = pass.length > 0 && !hasArabic && /^[\x20-\x7E]+$/.test(pass);
    const hasMinLen = pass.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasMix = hasLetter && hasNumber;
    const isFullyValid = isEnglishOnly && hasMinLen && hasMix;

    return {
      hasArabic,
      isEnglishOnly,
      hasMinLen,
      hasLetter,
      hasNumber,
      hasMix,
      isFullyValid,
    };
  };

  const passPolicy = getPasswordPolicy(password);
  const usernameHasArabic = containsArabic(username);

  // Store registered accounts in localStorage
  const getRegisteredUsers = (): Record<string, { fullName: string; password: string }> => {
    const saved = localStorage.getItem('wattai_registered_users');
    return saved ? JSON.parse(saved) : {};
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 1. Validate Username (English only)
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError(t.fillAllFields);
      return;
    }

    if (containsArabic(cleanUsername)) {
      setError(t.usernameEnglishOnly);
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setError(
        lang === 'ar'
          ? 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام إنجليزية فقط (مثل: ahmed_2030).'
          : 'Username must contain English letters and numbers only (e.g. ahmed_2030).'
      );
      return;
    }

    // 2. Validate Password (English only + Security Policy: min 8 chars, mix of letters & numbers)
    if (!password) {
      setError(t.fillAllFields);
      return;
    }

    if (containsArabic(password)) {
      setError(t.passwordEnglishOnly);
      return;
    }

    if (!passPolicy.hasMinLen) {
      setError(t.passwordMinLength);
      return;
    }

    if (!passPolicy.hasMix) {
      setError(t.passwordMixLettersNumbers);
      return;
    }

    if (isRegister) {
      // Sign Up Mode
      if (!fullName.trim()) {
        setError(t.fillFullName);
        return;
      }

      if (!confirmPassword) {
        setError(t.fillAllFields);
        return;
      }

      if (password !== confirmPassword) {
        setError(t.passwordMismatch);
        return;
      }

      // Save user account to localStorage
      const users = getRegisteredUsers();
      users[cleanUsername.toLowerCase()] = {
        fullName: fullName.trim(),
        password: password,
      };
      localStorage.setItem('wattai_registered_users', JSON.stringify(users));

      // Switch to Login mode upon successful registration
      setSuccessMessage(t.registerSuccessMsg);
      setIsRegister(false);
      setPassword('');
      setConfirmPassword('');
    } else {
      // Log In Mode
      const users = getRegisteredUsers();
      const existingUser = users[cleanUsername.toLowerCase()];

      if (existingUser && existingUser.password !== password) {
        setError(t.invalidCredentials);
        return;
      }

      const loggedUser: User = {
        fullName: existingUser ? existingUser.fullName : cleanUsername,
        username: cleanUsername,
        householdMembers: 5,
        cityId: 'riyadh',
        isLoggedIn: true,
        isProfileComplete: false,
      };

      onLogin(loggedUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Language Switcher Bar */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 bg-slate-900/90 border border-emerald-700/60 hover:bg-slate-800 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-slate-900/90 border border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl space-y-6">
        {/* Brand Logo & Name */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 p-0.5 shadow-xl mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
              <Zap className="w-8 h-8 fill-emerald-400/20 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-white font-sans flex items-center justify-center gap-2">
              {t.appName}
            </h1>
            <p className="text-xs text-emerald-300/80 mt-1">
              {t.authSubtitle}
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle */}
        <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              isRegister
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.signUp}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              !isRegister
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.logIn}
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs p-3.5 rounded-2xl flex items-start gap-2 text-right">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl flex items-center gap-2 text-right">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field (Sign Up only) */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" /> {t.fullName}:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
              />
            </div>
          )}

          {/* Username field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> {t.username}:
            </label>
            <input
              type="text"
              value={username}
              dir="ltr"
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.usernamePlaceholder}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-600 font-mono ${
                usernameHasArabic
                  ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500'
                  : 'border-slate-800 focus:ring-2 focus:ring-emerald-500'
              }`}
            />
            {usernameHasArabic && (
              <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {t.usernameEnglishOnly}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> {t.password}:
            </label>
            <input
              type="password"
              value={password}
              dir="ltr"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-600 font-mono ${
                passPolicy.hasArabic
                  ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500'
                  : 'border-slate-800 focus:ring-2 focus:ring-emerald-500'
              }`}
            />

            {/* Arabic Password Warning */}
            {passPolicy.hasArabic && (
              <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {t.passwordEnglishOnly}
              </p>
            )}

            {/* Live Security Policy Criteria Indicators (Sign Up mode ONLY) */}
            {isRegister && password.length > 0 && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px] font-bold">
                <div
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                    passPolicy.hasMinLen
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {passPolicy.hasMinLen ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                  <span>{t.passwordRuleLen}</span>
                </div>

                <div
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                    passPolicy.hasMix
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {passPolicy.hasMix ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                  <span>{t.passwordRuleMix}</span>
                </div>

                <div
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                    !passPolicy.hasArabic
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {!passPolicy.hasArabic ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-rose-400" />}
                  <span>{t.passwordRuleNoArabic}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field for Sign Up */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> {t.confirmPassword}:
              </label>
              <input
                type="password"
                value={confirmPassword}
                dir="ltr"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPasswordPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600 font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            <span>{isRegister ? t.submitSignUp : t.submitLogIn}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

