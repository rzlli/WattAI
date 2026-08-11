import React, { useState } from 'react';
import { Sliders, Zap, Sun, ShieldAlert, ArrowLeftRight, Calculator } from 'lucide-react';
import { CityWeather } from '../types';

interface TariffCalculatorProps {
  selectedCity: CityWeather;
}

export const TariffCalculator: React.FC<TariffCalculatorProps> = ({ selectedCity }) => {
  const [kwhInput, setKwhInput] = useState<number>(5800);
  const [acTemp, setAcTemp] = useState<number>(20); // user current AC thermostat setting

  // SEC Residential Tariff Rules:
  // Tier 1: 1 to 6,000 kWh @ 0.18 SAR
  // Tier 2: > 6,000 kWh @ 0.30 SAR
  const calculateBillDetails = (kwh: number) => {
    const tier1Limit = 6000;
    let tier1Kwh = Math.min(kwh, tier1Limit);
    let tier2Kwh = Math.max(0, kwh - tier1Limit);

    let tier1Cost = tier1Kwh * 0.18;
    let tier2Cost = tier2Kwh * 0.30;
    let consumptionSubtotal = tier1Cost + tier2Cost;
    let meterFee = 15;
    let subtotalWithMeter = consumptionSubtotal + meterFee;
    let vat = subtotalWithMeter * 0.15;
    let totalSAR = subtotalWithMeter + vat;

    return {
      tier1Kwh,
      tier1Cost,
      tier2Kwh,
      tier2Cost,
      consumptionSubtotal,
      meterFee,
      vat,
      totalSAR,
    };
  };

  const currentBill = calculateBillDetails(kwhInput);

  // Expected savings if AC temperature raised to 24°C
  // Raising AC from 20°C to 24°C saves roughly 20% of total household AC consumption (~15% total kWh)
  const tempDiff = Math.max(0, 24 - acTemp);
  const savingsKwh = Math.round(kwhInput * (tempDiff * 0.04));
  const optimizedKwh = Math.max(100, kwhInput - savingsKwh);
  const optimizedBill = calculateBillDetails(optimizedKwh);
  const monthlySavingsSAR = Math.max(0, Math.round(currentBill.totalSAR - optimizedBill.totalSAR));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 border border-emerald-800/50 shadow-lg">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" /> حاسبة الشريحة وتعديل الثرموستات
          </div>
          <h2 className="text-2xl font-bold tracking-tight">حاسبة الشرائح والتوفير بالريال السعودي</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            محاكاة تفاعلية لحساب تكلفة الكهرباء حسب تعريفة الشركة السعودية للكهرباء (18 هللة مقابل 30 هللة)، واختبار أثر رفع ثرموستات التكييف لـ 24°C بالريال السعودي.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Controls */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-emerald-600" />
            تعديل مؤشرات الاستهلاك والحرارة:
          </h3>

          {/* kWh Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>كمية الاستهلاك المتوقعة (ك.و.س / شهرياً):</span>
              <span className="font-mono text-emerald-700 text-sm font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                {kwhInput.toLocaleString()} ك.و.س
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="12000"
              step="100"
              value={kwhInput}
              onChange={(e) => setKwhInput(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>500 ك.و.س</span>
              <span className="text-amber-600 font-bold">6,000 ك.و.س (حد الشريحة 1)</span>
              <span>12,000 ك.و.س</span>
            </div>
          </div>

          {/* AC Temperature Thermostat Slider */}
          <div className="space-y-2 bg-amber-50/60 p-4 rounded-xl border border-amber-200/60">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-600" />
                حرارة ثرموستات المكيف الحالية بالمنزل:
              </span>
              <span className="font-mono text-amber-900 text-sm font-bold bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                {acTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="18"
              max="26"
              step="1"
              value={acTemp}
              onChange={(e) => setAcTemp(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              حرارة الطقس بـ ({selectedCity.cityNameAr}): <span className="font-bold">{selectedCity.tempC}°C</span>. ضبط المكيف على 24°C يُقلل زمن عمل الكمبروسر ويمنع الهدر بدون التضحية بالبرودة.
            </p>
          </div>

          {/* Savings Callout Box */}
          <div className="bg-emerald-900 text-white rounded-xl p-4 space-y-2 border border-emerald-800">
            <div className="text-xs text-emerald-300 font-medium">التوفير المتوقع عند ضبط الحرارة على 24°C:</div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {monthlySavingsSAR.toLocaleString()} ر.س / شهرياً
            </div>
            <p className="text-[11px] text-emerald-200">
              تخفيض كمية الاستهلاك بمقدار <span className="font-mono font-bold text-white">{savingsKwh.toLocaleString()} ك.و.س</span> شهرياً.
            </p>
          </div>
        </div>

        {/* Tariff Breakdown Output */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
              <span>تفاصيل احتساب الفاتورة المعتمدة (ر.س):</span>
              <span className="text-xs font-normal text-slate-500">شامل ضريبة 15% وخدمة العداد</span>
            </h3>

            {/* Bill Details List */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">استهلاك الشريحة الأولى (حتى 6000 ك.و.س @ 0.18 SAR):</span>
                <span className="font-bold font-mono text-slate-900">
                  {currentBill.tier1Kwh.toLocaleString()} ك.و.س = {currentBill.tier1Cost.toFixed(2)} ر.س
                </span>
              </div>

              <div
                className={`flex justify-between p-2.5 rounded-lg border ${
                  currentBill.tier2Kwh > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-950 font-bold'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                <span>استهلاك الشريحة الثانية (ما زاد عن 6000 @ 0.30 SAR):</span>
                <span className="font-mono">
                  {currentBill.tier2Kwh.toLocaleString()} ك.و.س = {currentBill.tier2Cost.toFixed(2)} ر.س
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">رسوم خدمة العداد (قاطع 160 أمبير):</span>
                <span className="font-bold font-mono text-slate-900">15.00 ر.س</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">ضريبة القيمة المضافة VAT (15%):</span>
                <span className="font-bold font-mono text-slate-900">{currentBill.vat.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* Total Highlight */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">صافي المبلـغ المطلـوب:</div>
              <div className="text-xs text-emerald-400">حسب التعرفة السكنية المعتمدة</div>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {currentBill.totalSAR.toFixed(2)} <span className="text-xs font-sans text-slate-300">ر.س</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
