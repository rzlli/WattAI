import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sun,
  Snowflake,
  Flower2,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { User, BillRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  SeasonType,
  calculateSmartBillForecast,
} from '../utils/forecastingEngine';

interface BillForecastSectionProps {
  user: User;
  electricityBill: BillRecord | null;
  onNavigateTab?: (tab: string) => void;
}

export const BillForecastSection: React.FC<BillForecastSectionProps> = ({
  user,
  electricityBill,
  onNavigateTab,
}) => {
  const { lang, t } = useLanguage();

  // Determine current calendar month name for auto-detection badge
  const currentMonthNum = new Date().getMonth() + 1; // 1-12
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const currentMonthNameAr = monthNamesAr[currentMonthNum - 1];

  // State for daily operating hours of climate control appliances (AC / Heater)
  // Default to realistic 10 hours/day
  const [operatingHours, setOperatingHours] = useState<number>(10);

  // Calculate forecast dynamically with auto-detected season
  const forecast = calculateSmartBillForecast(
    user,
    electricityBill,
    undefined, // Auto-detect season based on calendar month
    operatingHours
  );

  const isIncrease = forecast.sarDifference > 0;
  const isDecrease = forecast.sarDifference < 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {lang === 'ar' ? 'نظام التنبؤ الذكي بالفاتورة القادمة' : 'Smart Next-Bill Forecasting System'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {lang === 'ar' ? 'تحديد المناخ تلقائياً' : 'Auto Climate Detection'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ar'
                ? 'توقع دقيق ومستقبلي يستند تلقائياً إلى طقس مدينتك المسجلة والظروف المناخية وساعات تشغيل الأجهزة'
                : 'Accurate prediction based automatically on your registered city climate and daily usage hours'}
            </p>
          </div>
        </div>

        {/* User Context Badges (City & Household) */}
        <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {lang === 'ar' ? `المدينة: ${forecast.cityNameAr}` : `City: ${forecast.cityNameEn}`}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {lang === 'ar' ? `${forecast.householdMembers} أفراد` : `${forecast.householdMembers} Members`}
            </span>
          </div>
        </div>
      </div>

      {/* Auto-detected Season Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-4 rounded-2xl border border-teal-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          {forecast.season === 'summer' && (
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
          )}
          {forecast.season === 'winter' && (
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <Snowflake className="w-5 h-5" />
            </div>
          )}
          {forecast.season === 'moderate' && (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Flower2 className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>
                {lang === 'ar'
                  ? `الفصل المناخي المحدد تلقائياً (شهر ${currentMonthNameAr}):`
                  : `Auto-detected Season (${currentMonthNameAr}):`}
              </span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {forecast.season === 'summer' && (lang === 'ar' ? `فصل الصيف - ذروة التبريد في مدينة ${forecast.cityNameAr}` : `Summer Peak Cooling in ${forecast.cityNameEn}`)}
              {forecast.season === 'winter' && (lang === 'ar' ? `فصل الشتاء - التدفئة وأحمال البرد في ${forecast.cityNameAr}` : `Winter Season Heating in ${forecast.cityNameEn}`)}
              {forecast.season === 'moderate' && (lang === 'ar' ? `فصل الاعتدال (الربيع/الخريف) في مدينة ${forecast.cityNameAr}` : `Mild Moderate Climate in ${forecast.cityNameEn}`)}
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold shrink-0">
          {lang === 'ar' ? 'ربط مباشر بالطبيعة والموقع' : 'Live Geographic Link'}
        </span>
      </div>

      {/* Operating Hours Interactive Slider */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            {forecast.season === 'winter'
              ? (lang === 'ar' ? 'ساعات تشغيل أجهزة التدفئة / الدفيات اليومية:' : 'Daily Heating Operating Hours:')
              : (lang === 'ar' ? 'ساعات تشغيل أجهزة التكييف والتبريد اليومية:' : 'Daily AC Operating Hours:')}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-black shadow-xs">
            {operatingHours} {lang === 'ar' ? 'ساعات / يوم' : 'hrs / day'}
          </span>
        </div>

        <input
          type="range"
          min={2}
          max={22}
          step={1}
          value={operatingHours}
          onChange={(e) => setOperatingHours(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />

        <div className="flex justify-between text-[10px] font-bold text-slate-500">
          <span>2 {lang === 'ar' ? 'ساعات (ترشيد اقتصادي)' : 'hrs (Economy)'}</span>
          <span>8 {lang === 'ar' ? 'ساعات (متوسط قياسي)' : 'hrs (Standard)'}</span>
          <span>14 {lang === 'ar' ? 'ساعة (تشغيل مكثف)' : 'hrs (Heavy)'}</span>
          <span>20+ {lang === 'ar' ? 'ساعة (تشغيل متواصل)' : 'hrs (Continuous)'}</span>
        </div>
      </div>

      {/* Professional Comparison Table (جدول مقارنة احترافي) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            {lang === 'ar' ? 'جدول مقارنة الاستهلاك الحالي مقابل المتوقع للشهر القادم:' : 'Comparison: Current vs Next Month Forecast'}
          </h4>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">{lang === 'ar' ? 'عنصر المقارنة' : 'Metric'}</th>
                <th className="p-3.5 text-center">{lang === 'ar' ? 'الشهر الحالي' : 'Current Month'}</th>
                <th className="p-3.5 text-center">{lang === 'ar' ? 'التوقع للشهر القادم' : 'Next Month Forecast'}</th>
                <th className="p-3.5 text-center">{lang === 'ar' ? 'صافي التغير المتوقع' : 'Net Change'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {/* Row 1: Weather & Season */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 font-bold text-slate-800">
                  {lang === 'ar' ? 'حالة الفصل والطقس' : 'Season & Climate'}
                </td>
                <td className="p-3.5 text-center text-slate-600 font-medium">
                  {electricityBill?.monthLabel || (lang === 'ar' ? 'الشهر الحالي' : 'Current Month')}
                </td>
                <td className="p-3.5 text-center font-bold text-slate-900">
                  {forecast.season === 'summer' && (lang === 'ar' ? '☀️ ذروة الصيف' : '☀️ Summer Peak')}
                  {forecast.season === 'winter' && (lang === 'ar' ? '❄️ فصل الشتاء' : '❄️ Winter Season')}
                  {forecast.season === 'moderate' && (lang === 'ar' ? '🌸 الربيع/الخريف' : '🌸 Moderate')}
                </td>
                <td className="p-3.5 text-center font-bold text-slate-700">
                  {forecast.cityNameAr}
                </td>
              </tr>

              {/* Row 2: kWh Consumption */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 font-bold text-slate-800">
                  {lang === 'ar' ? 'حجم الاستهلاك (ك.و.س)' : 'Consumption (kWh)'}
                </td>
                <td className="p-3.5 text-center font-mono font-bold text-slate-700">
                  {forecast.currentKWh.toLocaleString()} {t.kwh}
                </td>
                <td className="p-3.5 text-center font-mono font-black text-emerald-800">
                  {forecast.predictedKWh.toLocaleString()} {t.kwh}
                </td>
                <td className="p-3.5 text-center font-mono font-bold">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black ${
                      forecast.kWhDifference > 0
                        ? 'bg-rose-100 text-rose-800'
                        : forecast.kWhDifference < 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {forecast.kWhDifference > 0 ? `+${forecast.kWhDifference}` : forecast.kWhDifference} {t.kwh}
                  </span>
                </td>
              </tr>

              {/* Row 3: Total SAR Bill */}
              <tr className="bg-slate-50/60 font-bold hover:bg-slate-100/80 transition-colors">
                <td className="p-3.5 font-extrabold text-slate-900">
                  {lang === 'ar' ? 'قيمة الفاتورة المتوقعة (ر.س)' : 'Total Bill (SAR)'}
                </td>
                <td className="p-3.5 text-center font-mono text-slate-800">
                  {forecast.currentSAR.toLocaleString()} {t.sar}
                </td>
                <td className="p-3.5 text-center font-mono text-lg font-black text-amber-700">
                  {forecast.predictedSAR.toLocaleString()} {t.sar}
                </td>
                <td className="p-3.5 text-center">
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                      isIncrease
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isDecrease
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {isIncrease && <TrendingUp className="w-3.5 h-3.5 text-rose-600" />}
                    {isDecrease && <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>
                      {isIncrease ? `+${forecast.sarDifference.toLocaleString()}` : forecast.sarDifference.toLocaleString()} {t.sar}
                      {forecast.percentChange !== 0 && ` (${forecast.percentChange > 0 ? '+' : ''}${forecast.percentChange}%)`}
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 4: Tariff Bracket */}
              <tr className="hover:bg-slate-50/80 transition-colors text-[11px]">
                <td className="p-3.5 font-bold text-slate-800">
                  {lang === 'ar' ? 'تعريفة الكهرباء المطبقة' : 'Applied Tariff Bracket'}
                </td>
                <td className="p-3.5 text-center text-slate-600">
                  {forecast.currentKWh > 6000 ? 'الفئة الثانية (30 هلالة)' : 'الفئة الأولى (18 هلالة)'}
                </td>
                <td className="p-3.5 text-center font-bold text-slate-800">
                  {forecast.tariffTier}
                </td>
                <td className="p-3.5 text-center text-slate-500">
                  {forecast.predictedKWh > 6000 ? (
                    <span className="text-rose-600 font-bold flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'تجاوز للشرائح الاقتصادية' : 'Higher Bracket'}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'ضمن الشريحة الأولى الموفرة' : 'Economy Tier 1'}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Rationale Box & Recommendations */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white rounded-2xl p-5 border border-emerald-800/80 space-y-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h5 className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
              <span>{lang === 'ar' ? 'تحليل الأسباب والتفسير الذكي:' : 'Smart Analysis & Reason:'}</span>
            </h5>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {lang === 'ar' ? forecast.detailedReasonAr : forecast.detailedReasonEn}
            </p>
          </div>
        </div>

        {/* Actionable Tips */}
        {forecast.actionableTipsAr.length > 0 && (
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <div className="text-[11px] font-extrabold text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'خطة الترشيد الموصى بها لتقليل الفاتورة القادمة:' : 'Recommended Saving Plan:'}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {forecast.actionableTipsAr.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
