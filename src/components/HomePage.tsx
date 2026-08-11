import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  Thermometer,
  CloudSun,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Flame,
  Wind,
  RotateCw,
  Radio,
} from 'lucide-react';
import { BillRecord, CityWeather, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SAUDI_CITIES_WEATHER } from '../data/saudiCities';
import { BillForecastSection } from './BillForecastSection';
import { calculateSmartBillForecast } from '../utils/forecastingEngine';

interface HomePageProps {
  electricityBill: BillRecord | null;
  waterBill: BillRecord | null;
  selectedCity: CityWeather;
  user: User;
  isWeatherLoading?: boolean;
  onRefreshWeather?: (
    cityId?: string,
    customLat?: number,
    customLon?: number,
    customNameAr?: string,
    customNameEn?: string
  ) => Promise<CityWeather | void>;
  onNavigateTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  electricityBill,
  waterBill,
  selectedCity,
  user,
  isWeatherLoading = false,
  onRefreshWeather,
  onNavigateTab,
}) => {
  const { lang, t } = useLanguage();

  // Check night time dynamically
  const currentHour = new Date().getHours();
  const isNightTime = selectedCity.isNight ?? (currentHour >= 18 || currentHour < 6);

  // Quick summary forecast for electricity box
  const quickForecast = calculateSmartBillForecast(user, electricityBill, 'summer', 12);

  // Handle city dropdown change
  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCityId = e.target.value;
    if (onRefreshWeather) {
      onRefreshWeather(newCityId);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 border border-emerald-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t.welcome}{user.fullName || 'User'} 👋
          </div>
          <h2 className="text-2xl font-black text-white">
            {t.dashboardTitle}
          </h2>
          <p className="text-xs text-emerald-100/80 max-w-xl">
            {t.dashboardDesc}
          </p>
        </div>
      </div>

      {/* Grid of 2 Main Modules: 1. Electricity, 2. Water */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Electricity (الكهرباء) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                electricityBill ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-400'
              }`}>
                <Zap className="w-6 h-6 fill-amber-400/30" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{t.electricityBox}</h3>
                <p className="text-[11px] text-slate-500">SEC - Saudi Electricity Company</p>
              </div>
            </div>

            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              electricityBill
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {electricityBill ? (lang === 'ar' ? 'تم التحليل والمزامنة' : 'Analyzed & Synced') : (lang === 'ar' ? 'لم يتم إرفاق الفاتورة' : 'No Bill Attached')}
            </span>
          </div>

          {/* Conditional Content based on attached bill */}
          {!electricityBill ? (
            <div className="py-8 text-center space-y-4 bg-slate-50/70 rounded-2xl p-6 border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{t.noBillsUploaded}</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {t.uploadPrompt}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('chat')}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <span>{t.attachBill}</span>
                <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">{lang === 'ar' ? 'المبلغ الحالي:' : 'Current Amount:'}</div>
                  <div className="text-2xl font-black text-rose-600 font-mono mt-1">
                    {(electricityBill.totalAmountSAR || 0).toLocaleString()} <span className="text-xs font-normal text-slate-600 font-sans">{t.sar}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{electricityBill.monthLabel}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">{t.consumption}</div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {(electricityBill.consumptionValue || 0).toLocaleString()} <span className="text-xs font-normal text-slate-600 font-sans">{t.kwh}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">18 Halala / kWh</div>
                </div>
              </div>

              {/* Forecast Card inside Electricity Box */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-4 rounded-2xl border border-emerald-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {lang === 'ar' ? `توقع الشهر القادم (${quickForecast.cityNameAr}):` : `Next Month (${quickForecast.cityNameEn}):`}
                  </span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-200">
                    {lang === 'ar' ? 'تنبؤ ذكي' : 'Smart Forecast'}
                  </span>
                </div>
                <div className="text-3xl font-black text-amber-300 font-mono">
                  {quickForecast.predictedSAR.toLocaleString()} <span className="text-xs text-white font-sans font-bold">{t.sar}</span>
                </div>
                <div className="text-[11px] text-emerald-100 flex items-center gap-1 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {quickForecast.sarDifference <= 0
                      ? (lang === 'ar' ? `توفير متوقع قدره ${Math.abs(quickForecast.sarDifference)} ر.س` : `Expected saving ${Math.abs(quickForecast.sarDifference)} SAR`)
                      : (lang === 'ar' ? `زيادة موسمية متوقعة بقيمة +${quickForecast.sarDifference} ر.س` : `Expected seasonal increase +${quickForecast.sarDifference} SAR`)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => onNavigateTab('invoices')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  {t.viewDetails} &rarr;
                </button>
                <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'محفوظة تلقائياً' : 'Auto-Saved'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Module 2: Water (المياه) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                waterBill ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <Droplets className="w-6 h-6 fill-cyan-400/30" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{t.waterBox}</h3>
                <p className="text-[11px] text-slate-500">NWC - National Water Company</p>
              </div>
            </div>

            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              waterBill
                ? 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {waterBill ? (lang === 'ar' ? 'تم التحليل والمزامنة' : 'Analyzed & Synced') : (lang === 'ar' ? 'لم يتم إرفاق الفاتورة' : 'No Bill Attached')}
            </span>
          </div>

          {/* Conditional Content based on attached bill */}
          {!waterBill ? (
            <div className="py-8 text-center space-y-4 bg-slate-50/70 rounded-2xl p-6 border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <Droplets className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{t.noBillsUploaded}</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {t.uploadPrompt}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('chat')}
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <span>{t.attachBill}</span>
                <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">{lang === 'ar' ? 'فاتورة المياه الحالية:' : 'Current Water Bill:'}</div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {(waterBill.totalAmountSAR || 0).toLocaleString()} <span className="text-xs font-normal text-slate-600 font-sans">{t.sar}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{waterBill.monthLabel}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">{t.consumption}</div>
                  <div className="text-2xl font-black text-cyan-800 font-mono mt-1">
                    {waterBill.consumptionValue} <span className="text-xs font-normal text-slate-600 font-sans">{t.m3}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{user.householdMembers} {lang === 'ar' ? 'أفراد' : 'members'}</div>
                </div>
              </div>

              {/* Water Leak Monitor Badge */}
              <div className={`p-4 rounded-2xl border ${
                waterBill.waterAnalysis?.isLeakSuspected
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1">
                    {waterBill.waterAnalysis?.isLeakSuspected ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {waterBill.waterAnalysis?.isLeakSuspected ? t.leakDetected : (lang === 'ar' ? 'استهلاك مياه طبيعي' : 'Normal Consumption')}
                  </span>
                  <span className="text-[10px]">
                    {waterBill.waterAnalysis?.dailyPerCapitaLiters || 253} L/day/person
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {waterBill.waterAnalysis?.leakAlertMessage ||
                    'Consumption exceeds 250 L/person/day limit. Possible leak detected.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => onNavigateTab('invoices')}
                  className="text-cyan-700 hover:text-cyan-800 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  {t.viewDetails} &rarr;
                </button>
                <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'محفوظة تلقائياً' : 'Auto-Saved'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 2.5: Interactive Smart Next-Bill Forecasting Engine */}
      <BillForecastSection
        user={user}
        electricityBill={electricityBill}
        onNavigateTab={onNavigateTab}
      />

      {/* Section 3: Weather Section (نظام الطقس الديناميكي المباشر للمملكة) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Weather Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isNightTime
                  ? 'bg-slate-900 text-indigo-400 border-indigo-500/40'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}
            >
              {isNightTime ? <Moon className="w-7 h-7" /> : <CloudSun className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {t.weatherTitle} - {lang === 'en' ? selectedCity.cityNameEn : selectedCity.cityNameAr}
                </h3>
                {selectedCity.isLive && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    {lang === 'ar' ? 'طقس مباشر (Meteo Live API)' : 'Live Satellite Weather'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ar'
                  ? 'بيانات طقس لحظية ومباشرة من الأقمار الاصطناعية لربط الحرارة بضغط المكيف والفاتورة'
                  : 'Live satellite meteorological data correlating heat to AC load and power bills'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Badge */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {selectedCity.lastUpdated && (
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
                {lang === 'ar' ? `آخر تحديث: ${selectedCity.lastUpdated}` : `Updated: ${selectedCity.lastUpdated}`}
              </span>
            )}

            <button
              onClick={() => onRefreshWeather && onRefreshWeather(selectedCity.cityId, selectedCity.lat, selectedCity.lon)}
              disabled={isWeatherLoading}
              title={lang === 'ar' ? 'تحديث البيانات اللحظية' : 'Refresh live data'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-600 ${isWeatherLoading ? 'animate-spin' : ''}`} />
              <span>{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Controls Row: City Dropdown Selector */}
        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <label htmlFor="city-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
            {lang === 'ar' ? 'المنطقة/المدينة:' : 'Select City:'}
          </label>
          <select
            id="city-select"
            value={selectedCity.cityId}
            onChange={handleCitySelect}
            disabled={isWeatherLoading}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            {Object.values(SAUDI_CITIES_WEATHER).map((c) => (
              <option key={c.cityId} value={c.cityId}>
                {lang === 'ar' ? c.cityNameAr : c.cityNameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Weather Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* 1. Temperature Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-0.5 relative overflow-hidden">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" /> {t.temp}
            </div>
            {isWeatherLoading ? (
              <div className="py-1">
                <div className="text-xs font-extrabold text-emerald-700 animate-pulse flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>{lang === 'ar' ? 'تحديث البيانات جارٍ...' : 'Updating...'}</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">{lang === 'ar' ? 'جلب من الأقمار الصناعية' : 'Satellite Sync'}</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {selectedCity.tempC}°C
                </div>
                <div className="text-[10px] text-rose-600 font-bold truncate px-1">
                  {selectedCity.condition}
                </div>
              </>
            )}
          </div>

          {/* 2. Humidity Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-0.5">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-600" /> {t.humidity}
            </div>
            {isWeatherLoading ? (
              <div className="text-xs font-bold text-slate-400 py-2.5 animate-pulse">
                {lang === 'ar' ? 'جاري الجلب...' : 'Fetching...'}
              </div>
            ) : (
              <>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {selectedCity.humidityPercent}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {selectedCity.humidityPercent >= 55 ? (lang === 'ar' ? 'رطوبة مرتفعة' : 'High Humidity') : (lang === 'ar' ? 'مستوى طبيعي' : 'Normal Level')}
                </div>
              </>
            )}
          </div>

          {/* 3. Wind Speed Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-0.5">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
              <Wind className="w-3.5 h-3.5 text-indigo-500" /> {lang === 'ar' ? 'الرياح' : 'Wind Speed'}
            </div>
            {isWeatherLoading ? (
              <div className="text-xs font-bold text-slate-400 py-2.5 animate-pulse">
                {lang === 'ar' ? 'جاري الجلب...' : 'Fetching...'}
              </div>
            ) : (
              <>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {selectedCity.windSpeedKmH ?? 12} <span className="text-xs font-bold text-slate-500">km/h</span>
                </div>
                <div className="text-[10px] text-slate-500">{lang === 'ar' ? 'سرعة سطحية' : 'Surface Wind'}</div>
              </>
            )}
          </div>

          {/* 4. AC Stress Index */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-0.5">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> {t.acStress}
            </div>
            {isWeatherLoading ? (
              <div className="text-xs font-bold text-slate-400 py-2.5 animate-pulse">
                {lang === 'ar' ? 'جاري التقييم...' : 'Evaluating...'}
              </div>
            ) : (
              <>
                <div className="text-xs font-black text-amber-700 mt-2 leading-tight">
                  {selectedCity.acStressIndex}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{lang === 'ar' ? 'ضغط الكمبروسر' : 'Compressor Load'}</div>
              </>
            )}
          </div>

          {/* 5. Recommended AC Temp */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-0.5 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {t.recommendedTemp}
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              24°C
            </div>
            <div className="text-[10px] text-emerald-800 font-bold">{lang === 'ar' ? 'التوفير الأمثل' : 'Optimal Savings'}</div>
          </div>
        </div>

        {/* Dynamic Weather Tip */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-950 mb-0.5 flex items-center gap-2">
              <span>{t.smartTip} ({lang === 'en' ? selectedCity.cityNameEn : selectedCity.cityNameAr}):</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              {isWeatherLoading
                ? (lang === 'ar' ? 'جاري تحديث توصيات الاستدامة والتوفير بناءً على طقس المدينة اللحظي...' : 'Updating sustainability tips for the selected city...')
                : selectedCity.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
