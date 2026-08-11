import React from 'react';
import { Zap, Sparkles, Globe } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  user: User;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenSettings,
}) => {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="bg-emerald-950 text-white shadow-md border-b border-emerald-800/50 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      {/* Main Header Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 fill-emerald-400/20 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white font-sans">
                {t.appName}
              </h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> {t.aiAdvisor}
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Actions: Language Toggle & User Account Badge */}
        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-700/60 transition-all cursor-pointer text-xs font-bold shadow-sm"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* User Account Quick Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl border border-emerald-700/60 transition-all cursor-pointer text-xs font-bold shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <span className="hidden sm:inline">{user.fullName || user.username}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
