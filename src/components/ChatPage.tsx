import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Loader2,
  Paperclip,
  Zap,
  Droplets,
  CheckCircle2,
  X,
  ImageIcon
} from 'lucide-react';
import { ChatMessage, CityWeather, BillRecord } from '../types';
import { ATTACHED_SAMPLE_BILL } from '../data/sampleInvoice';
import { useLanguage } from '../context/LanguageContext';

interface ChatPageProps {
  selectedCity: CityWeather;
  onBillAnalyzed: (bill: BillRecord) => void;
}

const QUICK_QUESTIONS_AR = [
  'كيف أمنع دخول فاتورتي في شريحة الـ 30 هللة؟',
  'كيف أتحقق من وجود تسريب خفي بخزان المياه الأرضي؟',
  'ما هو الفرق المالي بين مكيف العادي ومكيف الإنفرتر بالريال؟',
  'ما هي أفضل درجة حرارة للمكيف لترشيد الاستهلاك بالصيف؟',
];

const QUICK_QUESTIONS_EN = [
  'How to avoid entering the 30 Halala tariff bracket?',
  'How to check for hidden underground water tank leaks?',
  'What is the SAR cost difference between standard and inverter ACs?',
  'What is the recommended AC temperature for summer savings?',
];

export const ChatPage: React.FC<ChatPageProps> = ({ selectedCity, onBillAnalyzed }) => {
  const { lang, t } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: t.initialChatMsg,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<{ base64: string; fileName: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    const currentImage = attachedImage;

    if (!text.trim() && !currentImage) return;
    if (loading) return;

    // Build User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim() || (lang === 'ar' ? 'تحليل ومصادقة الصورة المرفقة' : 'Analyze attached image'),
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      imageUrl: currentImage ? currentImage.base64 : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setAttachedImage(null);
    setLoading(true);

    if (currentImage) {
      // Process image with /api/analyze-bill
      try {
        const res = await fetch('/api/analyze-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage.base64,
            userText: text.trim(),
            cityId: selectedCity.cityId,
          }),
        });

        const data = await res.json();

        if (data.success && data.analysis) {
          const analysis = data.analysis;

          // CHECK IF IT IS AN OFFICIAL UTILITY BILL
          if (analysis.isUtilityBill === true) {
            const rawBillType = (analysis.billType || '').toLowerCase();
            const isWater = rawBillType.includes('water') || rawBillType.includes('مياه') || rawBillType.includes('nwc') || rawBillType.includes('الوطنية للمياه');
            const providerName = isWater
              ? (lang === 'ar' ? 'شركة المياه الوطنية (NWC)' : 'National Water Company (NWC)')
              : (lang === 'ar' ? 'الشركة السعودية للكهرباء (SEC)' : 'Saudi Electricity Company (SEC)');
            const unit = isWater ? 'م³' : 'ك.و.س';
            const totalSAR = Number(analysis.totalAmountSAR) || 0;
            const consumptionVal = Number(analysis.consumptionKWh) || 0;

            // Format steps dynamically based on bill type (isWater vs electricity)
            let stepsFormatted = '';
            if (analysis.detailedSavingsSteps && analysis.detailedSavingsSteps.length > 0) {
              stepsFormatted = analysis.detailedSavingsSteps.map((step: string) => `• ${step}`).join('\n');
            } else if (isWater) {
              stepsFormatted = lang === 'ar'
                ? '• **تركيب أدوات ومرشدات الترشيد:** تركيب مرشدات تدفق المياه المعقلنة المعتمدة على الصنابير ورأس الدش لتوفير حتى 40% من استهلاك المياه.\n• **فحص واكتشاف التسريبات الخفية:** إجراء فحص دقيق لعوامة الخزان الأرضي والعلوي للتأكد من عدم وجود تسريب خفي هادر.\n• **إصلاح السيفونات والصنابير:** صيانة وإصلاح محابس المياه والتسريبات الدقيقة بجلد السيفونات فوراً.\n• **الري الذكي وترشيد الاستخدام:** تنظيم أوقات ري الحدائق في الأوقات الباردة واستخدام أنظمة التقطير.'
                : '• **Install Water Aerators:** Install certified water efficiency flow restrictors on faucets and showers to save up to 40% water.\n• **Inspect Hidden Leaks:** Conduct a full inspection of ground and roof tank float valves for undetected leaks.\n• **Repair Leaky Faucets & Toilets:** Replace worn toilet flappers and valve seals immediately to prevent water waste.\n• **Smart Irrigation:** Schedule garden watering during cool off-peak hours using drip irrigation.';
            } else {
              stepsFormatted = lang === 'ar'
                ? '• **ضبط المكيفات:** ضبط درجة حرارة المكيف على 24°C لتقليل استهلاك الضغاط وتوفير حتى 25% من الطاقة.\n• **صيانة الفلاتر:** تنظيف فلاتر المكيف دورياً كل أسبوعين لرفع كفاءة التبريد وتحسين تدفق الهواء.\n• **أجهزة موفرة للطاقة:** استخدام مكيفات وأجهزة موفرة للطاقة بتقنية الإنفرتر (Inverter) عالية الكفاءة.\n• **العزل وإحكام الإغلاق:** إغلاق الأبواب والنوافذ والستائر لمنع تسرب التبريد أثناء تشغيل التكييف.'
                : '• **AC Temperature:** Set AC temperature to 24°C for optimal efficiency (saves up to 25%).\n• **Filter Maintenance:** Clean AC filters bi-weekly to improve airflow and cut compressor load.\n• **Inverter Appliances:** Upgrade to High-Efficiency Inverter ACs (6+ SASO Stars).\n• **Insulation & Sealing:** Keep doors, windows, and curtains closed to prevent cool air leaks.';
            }

            const responseText = lang === 'ar'
              ? `تم التعرف بنجاح على **${providerName}**! ⚡📄\n\n📌 **النتائج الفعلية المستخرجة من الفاتورة:**\n• **نوع الفاتورة:** **${isWater ? 'فاتورة مياه' : 'فاتورة كهرباء'}**\n• **الجهة:** **${providerName}**\n• **رقم الحساب:** **${analysis.accountNumber || 'غير مدون'}**\n• **اسم المشترك:** **${analysis.subscriberName || 'غير مدون'}**\n• **كمية الاستهلاك:** **${consumptionVal.toLocaleString()} ${unit}**\n• **المبلغ المطلوب الإجمالي:** **${totalSAR.toLocaleString()} ر.س**\n• **فترة الفاتورة:** ${analysis.billingPeriod || 'الفترة الحالية'}\n• **تقييم الشريحة والهدر:** ${analysis.tariffTier || 'الشريحة الأولى'} - ${analysis.wasteExplanation || 'استهلاك طبيعي'}\n\n🌤️ **تأثير طقس مدينة ${selectedCity.cityNameAr}:** ${analysis.weatherCorrelation?.impactOnAC || 'أحمال استهلاك مرتفعة'} \n\n🌱 **خطوات خطة الترشيد المفصلة:**\n${stepsFormatted}\n\n✅ **تم حفظ الفاتورة تلقائياً وتحديث قسم ${isWater ? 'المياه' : 'الكهرباء'} بالرئيسية وأرشيف الفواتير.**`
              : `Successfully identified **${providerName}**! ⚡📄\n\n📌 **Extracted Bill Details:**\n• **Type:** **${isWater ? 'Water Bill' : 'Electricity Bill'}**\n• **Provider:** **${providerName}**\n• **Account Number:** **${analysis.accountNumber || 'N/A'}**\n• **Subscriber:** **${analysis.subscriberName || 'N/A'}**\n• **Actual Consumption:** **${consumptionVal.toLocaleString()} ${unit}**\n• **Total Amount Due:** **${totalSAR.toLocaleString()} SAR**\n• **Billing Period:** ${analysis.billingPeriod || 'Current'}\n• **Tariff Tier:** ${analysis.tariffTier || 'Tier 1'}\n\n🌤️ **Weather Impact (${selectedCity.cityNameEn}):** ${analysis.weatherCorrelation?.impactOnAC || 'High load'}\n\n🌱 **Detailed Savings Plan Steps:**\n${stepsFormatted}\n\n✅ **Bill auto-saved to ${isWater ? 'Water' : 'Electricity'} section in Home dashboard & Invoices archive.**`;

            const botReply: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: responseText,
              timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => [...prev, botReply]);

            // Save bill to state & dashboard
            const billRecord: BillRecord = {
              id: `bill_${Date.now()}`,
              type: isWater ? 'water' : 'electricity',
              monthLabel: analysis.billingPeriod || (lang === 'ar' ? 'أغسطس 2026' : 'August 2026'),
              uploadDate: new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US'),
              totalAmountSAR: totalSAR,
              consumptionValue: consumptionVal,
              unit,
              electricityAnalysis: !isWater ? analysis : undefined,
              waterAnalysis: isWater ? analysis : undefined,
              imageUrl: currentImage.base64,
            };

            onBillAnalyzed(billRecord);
            showToast(lang === 'ar' ? `تم تحليل وحفظ الفاتورة بقيمة (${totalSAR} ر.س) بنجاح! ⚡` : `Analyzed and saved bill (${totalSAR} SAR)! ⚡`);
          } else {
            // NOT A BILL! (Appliance / Device / Photo / Inquiry)
            // DO NOT SAVE AS BILL OR ADD TO INVOICES/HOME DASHBOARD
            const replyContent = analysis.nonBillResponseText || analysis.overallRecommendation || (lang === 'ar'
              ? 'تم فحص صورة المعدة/الجهاز المرفق. هذه الصورة ليست فاتورة خدمات رسمية، وتم تقديم الاستشارة الفنية وإرشادات الترشيد والتبريد بالريال السعودي بناءً على فحص الجهاز الموضح.'
              : 'Image evaluated as an appliance or non-bill item. Technical & energy saving advice provided.');

            const botReply: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: `💡 **${lang === 'ar' ? 'تحليل وملاحظات خبير الاستدامة حول الجهاز/الصورة المرفقة:' : 'Sustainability Expert Evaluation:'}**\n\n${replyContent}\n\nℹ️ *${lang === 'ar' ? 'تنبيه: نظراً لأن الصورة ليست فاتورة خدمات، لم يتم إضافتها لأرشيف الفواتير أو الرئيسية.' : 'Note: This photo is not a bill and has not been saved to invoices archive.'}*`,
              timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => [...prev, botReply]);
            showToast(lang === 'ar' ? 'تم تقديم الاستشارة الفنية للمعدة والجهاز المرفق 💡' : 'Technical appliance evaluation provided 💡');
          }
        } else {
          throw new Error(data.error || 'Failed to analyze image');
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'assistant',
            text: lang === 'ar'
              ? 'عذراً، حدث خطأ أثناء تحليل الصورة المرفقة. يرجى إعادة المحاولة والتأكد من وضوح الصورة.'
              : 'Sorry, error occurred analyzing image. Please try again.',
            timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      // Text-only message
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages,
            cityId: selectedCity.cityId,
          }),
        });
        const data = await res.json();

        const botReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.reply || (lang === 'ar' ? 'أهلاً بك! يسعدني إجابتك حول كافة تفاصيل الترشيد والاستدامة بالريال السعودي.' : 'Welcome! I am happy to assist you.'),
          timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botReply]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'assistant',
            text: lang === 'ar' ? 'حدث خطأ مؤقت بالاتصال، يرجى المحاولة مرة أخرى.' : 'Temporary network error. Please try again.',
            timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle File Select - DO NOT AUTO SEND, just store in state for user to add text/question
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedImage({ base64: dataUrl, fileName: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Attach Electricity Bill Demo
  const handleAttachElectricityDemo = () => {
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: lang === 'ar' ? 'قم بتحليل فاتورة الكهرباء المرفقة لشهر أغسطس وتحديث لوحة التحكم.' : 'Analyze attached August electricity bill and update dashboard.',
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    };

    setTimeout(() => {
      const elecBillRecord: BillRecord = {
        id: `elec_${Date.now()}`,
        type: 'electricity',
        monthLabel: lang === 'ar' ? 'أغسطس 2026' : 'August 2026',
        uploadDate: new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US'),
        totalAmountSAR: 1149.0,
        consumptionValue: 6000,
        unit: 'ك.و.س',
        electricityAnalysis: ATTACHED_SAMPLE_BILL,
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      };

      onBillAnalyzed(elecBillRecord);

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: lang === 'ar'
          ? `تم تحليل فاتورة الكهرباء بنجاح! ⚡📄\n\n📌 **النتائج الحالية:**\n• قيمة الفاتورة: **1,149.00 ر.س** (6,000 ك.و.س).\n• تقييم الطقس: درجات الحرارة في ${selectedCity.cityNameAr} (${selectedCity.tempC}°C) رفعت أحمال التكييف إلى ${selectedCity.acStressIndex}.\n• **التوقع الرقمي للشهر القادم:** عند تطبيق خطة الترشيد ستنخفض الفاتورة إلى **426.00 ر.س** بالتحديد (توفير **723.00 ر.س** بنسبة 63%).\n\n🌱 **خطوات خطة الترشيد المفصلة:**\n• **ضبط المكيفات:** ضبط درجة حرارة المكيف على 24°C لتقليل استهلاك الضغاط وتوفير حتى 25% من الطاقة.\n• **صيانة الفلاتر:** تنظيف فلاتر المكيف دورياً كل أسبوعين لرفع كفاءة التبريد وتحسين تدفق الهواء.\n• **أجهزة موفرة للطاقة:** استخدام مكيفات وأجهزة موفرة للطاقة بتقنية الإنفرتر (Inverter) عالية الكفاءة.\n• **العزل وإحكام الإغلاق:** إغلاق الأبواب والنوافذ والستائر لمنع تسرب التبريد أثناء تشغيل التكييف.\n\n✅ **تم حفظ الفاتورة تلقائياً لتظهر الآن في الرئيسية وقسم الفواتير.**`
          : `Electricity bill analyzed successfully! ⚡📄\n\n📌 **Current Results:**\n• Total Bill: **1,149.00 SAR** (6,000 kWh).\n• Weather Impact: Temperature in ${selectedCity.cityNameEn} (${selectedCity.tempC}°C) increased AC stress to ${selectedCity.acStressIndex}.\n• **Next Month Forecast:** Applying savings plan reduces bill to **426.00 SAR** (Saving **723.00 SAR**, -63%).\n\n🌱 **Detailed Savings Plan Steps:**\n• **AC Temperature:** Set AC temperature to 24°C for optimal efficiency (saves up to 25%).\n• **Filter Maintenance:** Clean AC filters bi-weekly to improve airflow and cut compressor load.\n• **Energy Efficient Appliances:** Upgrade to High-Efficiency Inverter ACs (6+ SASO Stars).\n• **Insulation & Sealing:** Keep doors, windows, and curtains closed to prevent cool air leaks.\n\n✅ **Bill auto-saved to Home & Bills archive.**`,
        timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg, botReply]);
      setLoading(false);
      showToast(lang === 'ar' ? 'تم حفظ فاتورة الكهرباء تلقائياً وتحديث الصفحة الرئيسية وقسم الفواتير! ⚡' : 'Electricity bill saved automatically! ⚡');
    }, 1500);
  };

  // Attach Water Bill Demo
  const handleAttachWaterDemo = () => {
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: lang === 'ar' ? 'قم بتحليل فاتورة المياه المرفقة وفحص احتمالية التسريبات الخفية.' : 'Analyze attached water bill and check for hidden leaks.',
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    };

    setTimeout(() => {
      const waterBillRecord: BillRecord = {
        id: `water_${Date.now()}`,
        type: 'water',
        monthLabel: lang === 'ar' ? 'أغسطس 2026' : 'August 2026',
        uploadDate: new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US'),
        totalAmountSAR: 210.0,
        consumptionValue: 38,
        unit: 'م³',
        waterAnalysis: {
          monthlyConsumptionM3: 38,
          householdMembers: 5,
          dailyPerCapitaLiters: 253,
          isLeakSuspected: true,
          leakSeverity: 'تسريب خفي خطير',
          leakAlertMessage: 'معدل الاستهلاك بلغ 253 لتر/فرد/يوم وهو أعلى من الحد الطبيعي (250 لتر/يوم). هناك تسريب خفي محتمل بعوامة الخزان الأرضي أو خطوط الدفع!',
          normalCapitaLitersLimit: 250,
          monthlyBillSAR: 210.0,
          estimatedLeakWasteSAR: 85.0,
          inspectionSteps: [
            'إغلاق المحبس الرئيسي واختبار حركة عداد المياه.',
            'فحص عوامة الخزان الأرضي والعلوي.',
            'اختبار عوامات صناديق الطرد (السيفون).',
          ],
        },
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      };

      onBillAnalyzed(waterBillRecord);

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: lang === 'ar'
          ? `تم تحليل فاتورة المياه بنجاح! 💧📄\n\n🚨 **تنبيه فورى للتسريب الخفي:**\n• قيمة الفاتورة: **210.00 ر.س** (38 م³).\n• معدل استهلاك الفرد: **253 لتر/فرد/يوم** (تجاوز للحد الطبيعي 250L).\n• هدر مالي متوقع بسبب التسريب: **85.00 ر.س/شهرياً**.\n\n💧 **خطوات خطة الترشيد المفصلة للمياه:**\n• **تركيب مرشدات المياه:** تركيب مرشدات التدفق المعقلنة المعتمدة بالصنابير والدش لتوفير حتى 40% من المياه.\n• **فحص واكتشاف التسريبات الخفية:** فحص عوامات الخزانات الأرضية والعلوية للحد من الهدر غير المرئي.\n• **صيانة السيفونات والمحابس:** استبدال جلد السيفونات والمحابس التالفة فوراً.\n• **تقنيات الري الذكي:** جدولة ري الحدائق في الساعات الباردة واستخدام التقطير.\n\n✅ **تم حفظ الفاتورة تلقائياً لتظهر الآن في الرئيسية وقسم الفواتير.**`
          : `Water bill analyzed successfully! 💧📄\n\n🚨 **Hidden Leak Alert:**\n• Total Bill: **210.00 SAR** (38 m³).\n• Per Capita Rate: **253 L/person/day** (Above 250L limit).\n• Estimated Monthly Waste: **85.00 SAR/month**.\n\n💧 **Detailed Water Savings Plan:**\n• **Install Water Flow Aerators:** Save up to 40% water using certified restrictors.\n• **Inspect Hidden Leaks:** Check ground/roof tank float valves to prevent unseen waste.\n• **Fix Faucets & Toilets:** Replace damaged toilet seals and valves immediately.\n• **Smart Irrigation:** Schedule garden watering during cool hours.\n\n✅ **Bill auto-saved to Home & Bills archive.**`,
        timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg, botReply]);
      setLoading(false);
      showToast(lang === 'ar' ? 'تم حفظ فاتورة المياه تلقائياً وتحديث الصفحة الرئيسية وقسم الفواتير! 💧' : 'Water bill saved automatically! 💧');
    }, 1500);
  };

  const quickQuestions = lang === 'ar' ? QUICK_QUESTIONS_AR : QUICK_QUESTIONS_EN;

  return (
    <div className="space-y-4 pb-20 font-sans max-w-3xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-4 rounded-3xl border border-emerald-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white">{t.chatTitle}</h2>
            <p className="text-[10px] text-emerald-300">{t.chatSub} | {lang === 'en' ? selectedCity.cityNameEn : selectedCity.cityNameAr}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAttachElectricityDemo}
            className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> {t.demoElectricity}
          </button>
          <button
            onClick={handleAttachWaterDemo}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> {t.demoWater}
          </button>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[420px] max-h-[550px] overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/20 max-w-[220px]">
                  <img src={msg.imageUrl} alt="Bill/Image Attachment" className="w-full h-auto object-cover max-h-[180px]" />
                </div>
              )}
              <p className="whitespace-pre-line font-medium">{msg.text}</p>
              <div
                className={`text-[9px] text-left ${
                  msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-slate-600 text-xs p-3 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>{lang === 'ar' ? 'جاري فحص الصورة وتحليل البيانات بالذكاء الاصطناعي...' : 'Analyzing image & evaluating with AI...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Chips */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box Container */}
      <div className="space-y-2">
        {/* Attached Image Preview Badge */}
        {attachedImage && (
          <div className="bg-emerald-50 border-2 border-emerald-400/80 p-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-md animate-fade-in">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={attachedImage.base64}
                alt="Attached Preview"
                className="w-12 h-12 object-cover rounded-xl border border-emerald-500 shrink-0 shadow-sm"
              />
              <div className="truncate">
                <div className="flex items-center gap-1 text-emerald-900 font-extrabold text-xs">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{attachedImage.fileName}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                  {lang === 'ar' ? 'تم إرفاق الصورة. يمكنك كتابة استفسارك قبل الإرسال:' : 'Image attached. Type your question before sending:'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1.5 bg-emerald-100 hover:bg-rose-100 text-emerald-800 hover:text-rose-700 rounded-xl transition-all shrink-0 cursor-pointer border border-emerald-300"
              title={lang === 'ar' ? 'إزالة الصورة' : 'Remove Image'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={t.attachBill}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              attachedImage
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              attachedImage
                ? lang === 'ar'
                  ? 'اكتب استفسارك عن هذه الصورة (مثال: هل هذا المكيف موفر؟)...'
                  : 'Type your question about this image...'
                : t.typeMessagePlaceholder
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedImage) || loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

