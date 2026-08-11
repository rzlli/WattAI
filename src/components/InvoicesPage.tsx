import React, { useState } from 'react';
import {
  FileText,
  Zap,
  Droplets,
  Archive,
  Trash2,
  PlusCircle,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BillRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface InvoicesPageProps {
  bills: BillRecord[];
  onNavigateTab: (tab: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteBill: (id: string) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({
  bills,
  onNavigateTab,
  onToggleArchive,
  onDeleteBill,
}) => {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'electricity' | 'water' | 'archived'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const safeBills = Array.isArray(bills) ? bills : [];
  const activeBills = safeBills.filter((b) => filter === 'archived' ? b.isArchived : !b.isArchived);
  const filteredBills = activeBills.filter((b) => {
    if (filter === 'electricity') return b.type === 'electricity';
    if (filter === 'water') return b.type === 'water';
    return true;
  });

  const totalSpentSAR = safeBills.reduce((acc, b) => acc + (b.totalAmountSAR || 0), 0);

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> {t.invoicesTitle}
            </div>
            <h2 className="text-2xl font-black text-white">
              {t.invoicesTitle}
            </h2>
            <p className="text-xs text-emerald-100/80">
              {t.invoicesDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/20">
            <div className="text-center px-3 border-l border-white/20">
              <div className="text-[10px] text-emerald-200">{lang === 'ar' ? 'إجمالي الفواتير' : 'Total Bills'}</div>
              <div className="text-lg font-black text-white font-mono">{bills.length}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] text-emerald-200">{lang === 'ar' ? 'إجمالي التكلفة' : 'Total Amount'}</div>
              <div className="text-lg font-black text-amber-300 font-mono">
                {totalSpentSAR.toLocaleString()} <span className="text-[10px] font-sans">{t.sar}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'ar' ? `جميع الفواتير النشطة (${bills.filter((b) => !b.isArchived).length})` : `Active Bills (${bills.filter((b) => !b.isArchived).length})`}
        </button>
        <button
          onClick={() => setFilter('electricity')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            filter === 'electricity'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'ar' ? 'فواتير الكهرباء ⚡' : 'Electricity Bills ⚡'}
        </button>
        <button
          onClick={() => setFilter('water')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            filter === 'water'
              ? 'bg-cyan-600 text-white shadow-md font-black'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'ar' ? 'فواتير المياه 💧' : 'Water Bills 💧'}
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            filter === 'archived'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {lang === 'ar' ? `الأرشيف 📦 (${bills.filter((b) => b.isArchived).length})` : `Archived 📦 (${bills.filter((b) => b.isArchived).length})`}
        </button>
      </div>

      {/* Bills List Container */}
      {filteredBills.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">{t.noBillsUploaded}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t.uploadPrompt}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('chat')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.attachBill}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => {
            const isExpanded = expandedId === bill.id;
            const isElec = bill.type === 'electricity';

            return (
              <div
                key={bill.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Main Row */}
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                        isElec ? 'bg-amber-500' : 'bg-cyan-600'
                      }`}
                    >
                      {isElec ? <Zap className="w-6 h-6" /> : <Droplets className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {isElec ? (lang === 'ar' ? 'فاتورة الكهرباء' : 'Electricity Bill') : (lang === 'ar' ? 'فاتورة المياه' : 'Water Bill')} - {bill.monthLabel}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            isElec
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-cyan-100 text-cyan-900'
                          }`}
                        >
                          {bill.unit}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.consumption}: <strong className="text-slate-800 font-mono">{bill.consumptionValue} {bill.unit}</strong> | {lang === 'ar' ? 'تاريخ الحفظ:' : 'Saved:'} {bill.uploadDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-left">
                      <div className="text-xs text-slate-400 font-medium">{lang === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}</div>
                      <div className="text-xl font-black text-slate-900 font-mono">
                        {bill.totalAmountSAR.toLocaleString()} <span className="text-xs font-sans font-bold">{t.sar}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : bill.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? (lang === 'ar' ? 'إغلاق التفاصيل' : 'Close') : t.viewDetails}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onToggleArchive(bill.id)}
                        title={bill.isArchived ? 'Unarchive' : 'Archive'}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteBill(bill.id)}
                        title="Delete"
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Expanded Details */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-4">
                    {isElec && bill.electricityAnalysis && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-2xl border border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <div className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-amber-400" /> {lang === 'ar' ? 'التوقع الرقمي للشهر القادم:' : 'Target Next Month Forecast:'}
                            </div>
                            <div className="text-3xl font-black text-amber-300 font-mono mt-1">
                              426.00 <span className="text-xs text-white font-sans font-bold">{t.sar}</span>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-emerald-200 bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                            {lang === 'ar' ? 'تخفيض 63% (-723 ر.س) بضبط المكيفات عـلى 24°C' : '-63% reduction (-723 SAR) setting AC to 24°C'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-slate-900 text-xs">{lang === 'ar' ? 'خطة الترشيد الموصى بها:' : 'Recommended Savings Plan:'}</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {(bill.electricityAnalysis?.savingsPlan || []).map((plan, pIdx) => (
                              <div key={pIdx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                <div className="font-bold text-slate-800">{plan.action}</div>
                                <div className="text-emerald-700 font-bold font-mono">
                                  {lang === 'ar' ? `توفير: ${plan.monthlySavingSAR} ر.س/شهرياً` : `Saving: ${plan.monthlySavingSAR} SAR/month`}
                                </div>
                                <div className="text-[11px] text-slate-500">{plan.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isElec && bill.waterAnalysis && (
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" /> {lang === 'ar' ? 'نتائج فحص التسريبات الخفية:' : 'Hidden Leak Inspection:'}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {bill.waterAnalysis.leakAlertMessage}
                          </p>
                          <div className="text-xs font-bold text-rose-600">
                            {lang === 'ar' ? `الهدر المالي المقدر: ${bill.waterAnalysis.estimatedLeakWasteSAR} ر.س/شهرياً.` : `Estimated Waste: ${bill.waterAnalysis.estimatedLeakWasteSAR} SAR/month.`}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-900 text-xs">{lang === 'ar' ? 'خطوات الفحص السريعة:' : 'Quick Inspection Steps:'}</h5>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {(bill.waterAnalysis?.inspectionSteps || []).map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
