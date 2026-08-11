import React, { useState } from 'react';
import {
  Zap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Upload,
  Sun,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { BillAnalysis, CityWeather } from '../types';
import { ATTACHED_SAMPLE_BILL } from '../data/sampleInvoice';

interface InvoiceAnalyzerProps {
  selectedCity: CityWeather;
}

export const InvoiceAnalyzer: React.FC<InvoiceAnalyzerProps> = ({ selectedCity }) => {
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(ATTACHED_SAMPLE_BILL);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analyze attached sample invoice
  const handleLoadSampleBill = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/analyze-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSampleBill: true, cityId: selectedCity.cityId }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setUploadedImage(null);
      } else {
        setErrorMsg(data.error);
      }
    } catch (e: any) {
      setErrorMsg('تعذر تحليل الفاتورة المرفقة. الرجاء التحقق من الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  // Upload custom bill image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch('/api/analyze-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            cityId: selectedCity.cityId,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setAnalysis(data.analysis);
        } else {
          setErrorMsg(data.error || 'فشل تحليل الفاتورة المرفوعة.');
        }
      } catch (e: any) {
        setErrorMsg('حدث خطأ أثناء إرسال الصورة للتحليل الذكي.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Action Banner / Upload Trigger */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> خبير الذكاء الاصطناعي - الشركة السعودية للكهرباء
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">
              تحليل الفواتير المرفقة وتقييم الهدر بالريال السعودي
            </h2>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              قم بتحليل فاتورتك الحالية فورياً لاستخراج كميات الاستهلاك (ك.و.س)، واكتشاف أي هدر كهربائي مرتبط بالطقس، والحصول على خطة ترشيد محسوبة بالريال السعودي.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Instant Button for attached SEC bill */}
            <button
              onClick={handleLoadSampleBill}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold text-xs shadow-lg hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2 border border-emerald-300/40 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              عرض الفاتورة المرفقة المباشرة
            </button>

            {/* Upload Button */}
            <label className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-emerald-700/50 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              رفع صورة فاتورة جديدة
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200 space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-slate-800 font-semibold text-sm">جاري معالجة الفاتورة واستخراج شرائح الاستهلاك بالذكاء الاصطناعي...</p>
          <p className="text-slate-500 text-xs">نقرأ القراءات الحالية، وخدمة العداد، ونحلل الأثر الحراري لطقس {selectedCity.cityNameAr}</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Main Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Consumption */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                <span>إجمالي كمية الاستهلاك الحالي</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {analysis.consumptionKWh.toLocaleString()} <span className="text-xs text-slate-500 font-normal font-sans">ك.و.س</span>
              </div>
              <div className="text-[11px] text-amber-700 font-medium">
                معدل يومي: {Math.round(analysis.consumptionKWh / (analysis.daysCount || 30))} ك.و.س/يوم
              </div>
            </div>

            {/* Total Bill Amount in SAR */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                <span>المبلغ المطلوب بالفاتورة الحالية</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-rose-600 font-mono">
                {analysis.totalAmountSAR.toLocaleString()} <span className="text-xs text-rose-500 font-normal font-sans">ر.س</span>
              </div>
              <div className="text-[11px] text-slate-500">
                يشمل خدمة العداد ({analysis.meterFeeSAR || 15} ر.س) والضريبة
              </div>
            </div>

            {/* Next Month Forecasted Bill Highlight */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white p-5 rounded-2xl shadow-md space-y-1 border border-emerald-400/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full filter blur-xl pointer-events-none"></div>
              <div className="text-xs font-medium text-emerald-100 flex items-center justify-between">
                <span>توقع الفاتورة الشهر القادم</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                426.00 <span className="text-xs text-emerald-200 font-normal font-sans">ر.س</span>
              </div>
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> تخفيض هائل بنسبة 63% (-723 ر.س)
              </div>
            </div>

            {/* Tariff Tier Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                <span>تعريفة الشريحة المطبقة</span>
                <Info className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-sm font-bold text-slate-900 leading-tight">
                {analysis.tariffTier}
              </div>
              <div className="text-[11px] text-slate-500">
                18 هللة/ك.و.س (حتى 6,000 ك.و.س)
              </div>
            </div>
          </div>

          {/* Forecast Spotlight Card - Prominent Numerical Target */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-6 border border-emerald-700/60 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" /> التوقع الرقمي المحسوب بالريال السعودي (SAR)
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  الفاتورة المتوقعة للشهر القادم عند تطبيق خطوات الترشيد:
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  عند تطبيق التوصيات الأربع (ضبط حرارة التكييف على 24°C، غسيل الفلاتر، استخدام عوازل الأبواب، والاستفادة من مبادرة التكييف الإنفرتر)، سينخفض الاستهلاك من <strong className="text-amber-300 font-mono">6,000 ك.و.س</strong> إلى <strong className="text-emerald-300 font-mono">2,200 ك.و.س</strong> شهرياً.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center min-w-[220px] space-y-1 shadow-inner">
                <div className="text-xs font-semibold text-emerald-200">الرقم المستهدف بالتحديد:</div>
                <div className="text-4xl font-black text-amber-300 font-mono">
                  426.00 <span className="text-sm font-bold text-white font-sans">ر.س</span>
                </div>
                <div className="text-[10px] text-emerald-200 border-t border-white/10 pt-1.5 mt-1">
                  بدلاً من 1,149.00 ر.س الحالي (توفير 723 ر.س)
                </div>
              </div>
            </div>
          </div>

          {/* Deep Waste Analysis & Weather Connection Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Waste Assessment Explanation */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">تحليل الهدر وتأثير شرائح الكهرباء</h3>
                  <p className="text-xs text-slate-500">تقييم استخراج البيانات من الفاتورة بناءً على تعريفة الشركة السعودية للكهرباء</p>
                </div>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 font-medium">
                {analysis.wasteExplanation}
              </p>

              {/* Tariff Visual Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>موقع الاستهلاك من الشريحة الأولى (0 - 6,000 ك.و.س):</span>
                  <span className="text-amber-700 font-mono font-bold">
                    {analysis.consumptionKWh} / 6,000 ك.و.س (100%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (analysis.consumptionKWh / 6000) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>الشريحة 1 (18 هللة)</span>
                  <span className="font-bold text-rose-600">الشريحة 2 الخطيرة (30 هللة)</span>
                </div>
              </div>
            </div>

            {/* Weather Correlation Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800/50 space-y-4">
              <div className="flex items-center gap-2 border-b border-emerald-800/80 pb-3">
                <Sun className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">ربط الاستهلاك بطقس {analysis.weatherCorrelation.city}</h3>
                  <p className="text-[11px] text-emerald-300">الأثر الحراري الخارجي على أحمال التكييف</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between bg-emerald-900/40 p-2.5 rounded-lg border border-emerald-800/50">
                  <span className="text-emerald-200">درجة الحرارة العظمى:</span>
                  <span className="font-bold text-amber-300">{analysis.weatherCorrelation.temperatureRange}</span>
                </div>

                <div className="flex items-center justify-between bg-emerald-900/40 p-2.5 rounded-lg border border-emerald-800/50">
                  <span className="text-emerald-200">معدل الرطوبة الخارجية:</span>
                  <span className="font-bold text-emerald-100">{analysis.weatherCorrelation.humidity}</span>
                </div>

                <div className="space-y-1 bg-emerald-900/30 p-3 rounded-lg border border-emerald-800/40">
                  <span className="text-emerald-300 font-semibold text-[11px] block">تأثير الطقس على أجهزة التبريد:</span>
                  <p className="text-emerald-100/90 leading-relaxed text-[11px]">
                    {analysis.weatherCorrelation.impactOnAC}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Savings Plan in SAR (خطة الترشيد المحسوبة بالريال السعودي) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  خطة الترشيد الدقيقة والمحسوبة بالريال السعودي (SAR)
                </h3>
                <p className="text-xs text-slate-500">
                  تطبيقات عمليّة واضحة لتخفيض الفاتورة ومنع الانتقال لشريحة الـ 30 هللة
                </p>
              </div>

              {/* Total Potential Savings Badge */}
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
                <div className="text-[11px] text-emerald-800 font-medium">إجمالي التوفير المستهدف شهرياً:</div>
                <div className="text-xl font-black text-emerald-700 font-mono">
                  {(analysis?.savingsPlan || []).reduce((acc, item) => acc + (item.monthlySavingSAR || 0), 0)} ر.س / شهرياً
                </div>
              </div>
            </div>

            {/* Savings Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analysis?.savingsPlan || []).map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all hover:shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug flex-1">
                        {step.action}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          step.effort === 'سهل'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : step.effort === 'متوسط'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        جهد {step.effort}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pr-8">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs pr-8">
                    <span className="text-slate-500">التوفير المتوقع:</span>
                    <div className="font-bold text-emerald-700 font-mono">
                      {step.monthlySavingSAR} ر.س/شهرياً <span className="text-[10px] text-slate-400">({step.annualSavingSAR} ر.س/سنوياً)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Recommendation Callout */}
            <div className="bg-emerald-900 text-white rounded-xl p-4 flex items-start gap-3 border border-emerald-800">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-emerald-300">الخلاصة والتوصية النهائية:</h4>
                <p className="text-xs text-emerald-100 leading-relaxed">{analysis.overallRecommendation}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
