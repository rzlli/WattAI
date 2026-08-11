import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Loader2,
  Sparkles,
  Search,
} from 'lucide-react';
import { WaterAnalysis } from '../types';

export const WaterLeakMonitor: React.FC = () => {
  const [m3Input, setM3Input] = useState<number>(65); // 65 m3 monthly consumption
  const [membersInput, setMembersInput] = useState<number>(5); // 5 family members
  const [billInputSAR, setBillInputSAR] = useState<number>(310);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<WaterAnalysis | null>(null);

  const calculateWaterAudit = async (m3: number, members: number, billSAR: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/check-water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyConsumptionM3: m3,
          householdMembers: members,
          monthlyBillSAR: billSAR,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateWaterAudit(m3Input, membersInput, billInputSAR);
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-teal-950 to-slate-900 text-white rounded-2xl p-6 border border-sky-800/50 shadow-lg">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold">
            <Droplets className="w-3.5 h-3.5 text-sky-400" /> كشف التسربات وفحص المياه الفوري
          </div>
          <h2 className="text-2xl font-bold tracking-tight">مراقب استهلاك المياه واكتشاف التسريب الخفي</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            وفق المعايير الوطنية السعودية، أداء المياه السليم لا يتجاوز 250 لتر/فرد/يومياً. يُطلق النظام تنبيهاً أمنياً فورياً عند حدوث قفزات غير مبررة للتحقق من سلامة الخزانات والأنابيب.
          </p>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Search className="w-4 h-4 text-sky-600" /> أدخل بيانات الفاتورة الحالية للمياه:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Monthly Consumption M3 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">كمية الاستهلاك الشهري (متر مكعب m³):</label>
            <input
              type="number"
              value={m3Input}
              onChange={(e) => setM3Input(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="مثال: 65"
            />
          </div>

          {/* Household Members */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">عدد أفراد الأسرة والمقيمين بالمسكن:</label>
            <input
              type="number"
              value={membersInput}
              onChange={(e) => setMembersInput(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="مثال: 5"
            />
          </div>

          {/* Bill SAR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">مبلغ الفاتورة الكلي (ريال سعودي SAR):</label>
            <input
              type="number"
              value={billInputSAR}
              onChange={(e) => setBillInputSAR(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="مثال: 310"
            />
          </div>
        </div>

        <button
          onClick={() => calculateWaterAudit(m3Input, membersInput, billInputSAR)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Droplets className="w-4 h-4" />}
          فحص معدل المياه وكشف التسربات الآن
        </button>
      </div>

      {/* Audit Output Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Immediate Alert Box */}
          <div
            className={`p-6 rounded-2xl border shadow-md space-y-3 ${
              analysis.isLeakSuspected
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    analysis.isLeakSuspected ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {analysis.isLeakSuspected ? (
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {analysis.isLeakSuspected
                      ? '⚠️ تنبيه أمني عاجل: احتمالية تسريب خفي للمياه!'
                      : '✅ معدل استهلاك المياه طبيعي ومستدام'}
                  </h3>
                  <p className="text-xs opacity-80">
                    معدل الاستهلاك الفردي الحسباتي: <span className="font-mono font-bold">{analysis.dailyPerCapitaLiters} لتر/فرد/يوم</span> (المعيار الوطني: 250 لتر/يوم)
                  </p>
                </div>
              </div>

              {analysis.isLeakSuspected && (
                <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full border border-rose-700">
                  {analysis.leakSeverity}
                </span>
              )}
            </div>

            <p className="text-xs leading-relaxed font-medium p-3 bg-white/60 rounded-xl border border-black/5">
              {analysis.leakAlertMessage}
            </p>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs text-slate-500 font-medium">معدل الفرد اليومي</div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {analysis.dailyPerCapitaLiters} <span className="text-xs text-slate-500 font-normal">لتر / يوم</span>
              </div>
              <div className="text-[11px] text-slate-500">
                المعيار المعتمد: {analysis.normalCapitaLitersLimit} لتر/فرد
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs text-slate-500 font-medium">الاستهلاك الشهري الكلي</div>
              <div className="text-2xl font-black text-sky-700 font-mono">
                {analysis.monthlyConsumptionM3} <span className="text-xs text-sky-600 font-normal">m³ متر مكعب</span>
              </div>
              <div className="text-[11px] text-slate-500">يعادل {analysis.monthlyConsumptionM3 * 1000} لتر شهرياً</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs text-slate-500 font-medium">الهدر المالي الشهري التقديري</div>
              <div className="text-2xl font-black text-rose-600 font-mono">
                {analysis.estimatedLeakWasteSAR} <span className="text-xs text-rose-500 font-normal">ر.س / شهرياً</span>
              </div>
              <div className="text-[11px] text-slate-500">بسبب الاستهلاك المتجاوز للحد الطبيعي</div>
            </div>
          </div>

          {/* Inspection Steps */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              خطوات فحص واكتشاف التسربات الخفية بالمنزل (توصيات شركة المياه الوطنية):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(analysis?.inspectionSteps || []).map((step, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
