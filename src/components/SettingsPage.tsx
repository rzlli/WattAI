import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  Users,
  MapPin,
  CheckCircle2,
  LogOut,
  AlertCircle,
  Save,
  Globe
} from 'lucide-react';
import { User, CityWeather } from '../types';
import { SAUDI_CITIES_WEATHER } from '../data/saudiCities';
import { useLanguage } from '../context/LanguageContext';

interface SettingsPageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const HOUSEHOLD_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onUpdateUser,
  onLogout,
}) => {
  const { lang, setLang, t } = useLanguage();

  const [fullName, setFullName] = useState<string>(user.fullName || '');
  const [username, setUsername] = useState<string>(user.username || '');
  const [householdMembers, setHouseholdMembers] = useState<number>(user.householdMembers || 5);
  const [cityId, setCityId] = useState<string>(user.cityId || localStorage.getItem('wattai_last_selected_city') || 'taif');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      fullName: fullName.trim() || user.username,
      username: username.trim() || user.username,
      householdMembers,
      cityId,
      isProfileComplete: true,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const showDataCompletionNotice = !user.isProfileComplete || !user.householdMembers || !user.cityId;

  return (
    <div className="space-y-6 pb-20 font-sans max-w-2xl mx-auto">
      {/* Data Completion Alert Box (Conditional Rendering) */}
      {showDataCompletionNotice && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400/90 text-amber-950 p-4 rounded-3xl flex items-start gap-3 shadow-md animate-fade-in">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="pt-1">
            <p className="text-xs sm:text-sm font-black leading-relaxed text-amber-950">
              {t.dataCompletionNotice}
            </p>
          </div>
        </div>
      )}

      {/* Settings Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{t.settingsTitle}</h2>
            <p className="text-xs text-emerald-200/80">
              {t.cityDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Language Switcher Card Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-emerald-600" /> {t.languageSetting} / Language:
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLang('ar')}
            className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lang === 'ar'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="text-sm">🇸🇦</span>
            <span>{t.arabic}</span>
          </button>

          <button
            type="button"
            onClick={() => setLang('en')}
            className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-extrabold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="text-sm">🌐</span>
            <span>{t.english}</span>
          </button>
        </div>
      </div>

      {/* Floating Popup Toast Notification */}
      {savedSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 border-2 border-emerald-400 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce font-black text-sm sm:text-base">
          <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
          <span>{lang === 'ar' ? '✓ تم حفظ التغييرات' : '✓ Changes saved successfully'}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="bg-emerald-600 text-white text-sm font-black p-4 rounded-2xl border-2 border-emerald-400 flex items-center justify-center gap-2 shadow-xl animate-pulse">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <span>{lang === 'ar' ? '✓ تم حفظ التغييرات' : '✓ Changes saved successfully'}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">{t.personalInfo}</h3>

        {/* Full Name & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-emerald-600" /> {t.fullName}:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-emerald-600" /> {t.username}:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.usernamePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Household Members Count Field */}
        <div className="space-y-2 border-t border-slate-100 pt-5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" /> {t.householdMembers}:
          </label>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
            {HOUSEHOLD_OPTIONS.map((count) => {
              const isSelected = householdMembers === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setHouseholdMembers(count)}
                  className={`py-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {count} {count === 8 ? '+' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* City Selection (Linked to Weather API) */}
        <div className="space-y-2 border-t border-slate-100 pt-5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" /> {t.citySelect}:
          </label>
          <p className="text-[11px] text-slate-500">
            {t.cityDesc}
          </p>

          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {Object.values(SAUDI_CITIES_WEATHER).map((c: CityWeather) => (
              <option key={c.cityId} value={c.cityId}>
                {lang === 'en' ? c.cityNameEn : c.cityNameAr} ({c.tempC}°C - {c.condition})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveChanges}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
