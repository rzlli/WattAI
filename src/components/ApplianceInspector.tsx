import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Zap,
  Award,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { ApplianceAnalysis, CityWeather } from '../types';

interface ApplianceInspectorProps {
  selectedCity: CityWeather;
}

const PRESET_APPLIANCES = [
  {
    title: 'مكيف شباك قديم (18,000 وحدة)',
    type: 'مكيف شباك قديم',
    imageSample: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop',
    desc: 'مكيف شباك مستعمل لأكثر من 7 سنوات دون تقنية إنفرتر ولا يحمل نجوم كفاءة SASO.',
  },
  {
    title: 'مكيف سبليت حديث 7 نجوم (Inverter)',
    type: 'مكيف سبليت إنفرتر',
    imageSample: 'https://images.unsplash.com/photo-1614633833026-002064211a3a?q=80&w=400&auto=format&fit=crop',
    desc: 'مكيف سبليت جداري إنفرتر ببطاقة كفاءة طاقة خضراء (7 نجوم).',
  },
  {
    title: 'ثلاجة قديمة بمكثف غبار خلفي',
    type: 'ثلاجة قديمة',
    imageSample: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400&auto=format&fit=crop',
    desc: 'ثلاجة عائلية قديمة تعمل بضاغط تقليدي مرتفع الحرارة.',
  },
  {
    title: 'سخان مياه كهربائي 50 لتر دون عزل',
    type: 'سخان مياه كهربائي',
    imageSample: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=400&auto=format&fit=crop',
    desc: 'سخان كهربائي رأسي يسخن باستمرار دون ضبط ثرموستات.',
  },
];

export const ApplianceInspector: React.FC<ApplianceInspectorProps> = ({ selectedCity }) => {
  const [selectedApplianceType, setSelectedApplianceType] = useState<string>('مكيف شباك قديم');
  const [analysis, setAnalysis] = useState<ApplianceAnalysis | null>({
    applianceType: 'مكيف شباك قديم (18,000 BTU)',
    status: 'قديم ومستهلك',
    sasoStarsEstimate: 1,
    estimatedPowerKW: 2.2,
    estimatedMonthlyCostSAR: 215,
    weatherSensitivity: `بسبب درجات الحرارة المرتفعة بالرياض (${selectedCity.tempC}°C)، يعمل ضاغط التكييف القديم لـ 18 ساعة يومياً بأقصى قدرة دون توقف، مما يتسبب برفع الفاتورة بمقدار 215 ريال شهرياً لهذا الجهاز وحده.`,
    wastePercentage: 45,
    replacementRecommendation: {
      recommendedModel: 'مكيف سبليت إنفرتر 7 نجوم (18,000 BTU) المعتمد من كفاءة',
      estimatedCostSAR: 1800,
      monthlySavingSAR: 105,
      paybackPeriodMonths: 17,
    },
    quickTips: [
      'استغل خصم مبادرة كفاءة التابع للمركز السعودي لكفاءة الطاقة للحصول على دعم 900 ريال.',
      'احرص على غسيل الفلتر كل 14 يوماً لمنع إجهاد المحرك.',
      'اضبط درجة حرارة التكييف على 24°C دائماً.',
    ],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleAnalyzeAppliance = async (appType: string, imageBase64?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-appliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applianceType: appType,
          imageBase64: imageBase64 || customImage,
          cityId: selectedCity.cityId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setCustomImage(b64);
      handleAnalyzeAppliance('جهاز منزل مصور من المالك', b64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 border border-emerald-800/50 shadow-lg">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> تقييم كفاءة الطاقة SASO
          </div>
          <h2 className="text-2xl font-bold tracking-tight">فحص الأجهزة المنزلية وتقييم خيار الاستبدال</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            التقط صورة لمكيفك، ثلاجتك، أو سخان المياه لتحديد ما إذا كان الجهاز مستهلكاً للطاقة، وحساب الجدوى المالية لاستبداله بأجهزة موفرة (Inverter) بالريال السعودي.
          </p>
        </div>
      </div>

      {/* Selector Presets & Custom Upload */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>اختر جهازاً من النماذج أو ارفع صورة جهازك الخاص:</span>
          <label className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-100 cursor-pointer flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5" /> رفع صورة جهازك
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_APPLIANCES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedApplianceType(item.type);
                handleAnalyzeAppliance(item.type);
              }}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                selectedApplianceType === item.type
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80'
              }`}
            >
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900">{item.title}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{item.desc}</p>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-600" /> فحص الكفاءة الفوري
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Result Card */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-slate-800 text-xs font-semibold">جاري تقييم قدرة الجهاز واستهلاكه بالذكاء الاصطناعي...</p>
        </div>
      ) : analysis ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* Header Status Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                analysis.status === 'قديم ومستهلك'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {analysis.status === 'قديم ومستهلك' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{analysis.applianceType}</h3>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    analysis.status === 'قديم ومستهلك'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    تصنيف الجهاز: {analysis.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  تقييم نجوم كفاءة الطاقة المكتشف: <span className="font-bold text-amber-600">{analysis.sasoStarsEstimate} نجوم</span> من أصل 7 نجوم
                </p>
              </div>
            </div>

            {/* Monthly Cost Pill */}
            <div className="bg-slate-900 text-white p-3 rounded-xl text-left border border-slate-800 w-full sm:w-auto">
              <div className="text-[10px] text-slate-400">التكلفة التشغيلية التقديرية:</div>
              <div className="text-lg font-black font-mono text-emerald-400">
                {analysis.estimatedMonthlyCostSAR} ر.س / شهرياً
              </div>
            </div>
          </div>

          {/* Details & Weather Sensitivity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 md:col-span-2 space-y-1">
              <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                أثر الجو الخارجي بـ ({selectedCity.cityNameAr}) ونسبة الهدر:
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {analysis.weatherSensitivity}
              </p>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-1 text-center flex flex-col justify-center">
              <div className="text-xs text-rose-800 font-medium">معدل الطاقة المهدورة:</div>
              <div className="text-2xl font-black text-rose-600 font-mono">
                {analysis.wastePercentage}%
              </div>
              <div className="text-[10px] text-rose-700">مقارنة بالأجهزة الموفرة ذات 7 نجوم</div>
            </div>
          </div>

          {/* Replacement Investment Plan (خطة الاستبدال والاسترداد بالريال) */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-800 shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-800/80 pb-3">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-white text-sm">دراسة جدوى استبدال الجهاز موفر بالريال السعودي</h4>
                <p className="text-[11px] text-emerald-300">حساب فترة استرداد قيمة الشراء (Payback Period)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-800/60 md:col-span-2 space-y-1">
                <span className="text-emerald-300 text-[11px]">الموديل الموصى به:</span>
                <div className="font-bold text-white text-xs leading-snug">
                  {analysis.replacementRecommendation.recommendedModel}
                </div>
              </div>

              <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-800/60 space-y-1">
                <span className="text-emerald-300 text-[11px]">التكلفة التقديرية للشراء:</span>
                <div className="font-extrabold text-amber-300 font-mono text-sm">
                  {analysis.replacementRecommendation.estimatedCostSAR} ر.س
                </div>
              </div>

              <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-800/60 space-y-1">
                <span className="text-emerald-300 text-[11px]">التوفير الشهري المتوقع:</span>
                <div className="font-extrabold text-emerald-400 font-mono text-sm">
                  {analysis.replacementRecommendation.monthlySavingSAR} ر.س / شهرياً
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700/60 flex items-center justify-between text-xs">
              <span className="text-emerald-200">فترة استرداد رأس المال بالكامل من توفير الكهرباء:</span>
              <span className="font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 font-mono">
                خلال {analysis.replacementRecommendation.paybackPeriodMonths} شهراً فقط!
              </span>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              نصائح الترشيد وتمديد عمر الجهاز:
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {(analysis?.quickTips || []).map((tip, idx) => (
                <li key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};
