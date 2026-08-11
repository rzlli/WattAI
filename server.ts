import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { SAUDI_CITIES_WEATHER } from './src/data/saudiCities';
import { ATTACHED_SAMPLE_BILL } from './src/data/sampleInvoice';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with higher limit for images (base64)
app.use(express.json({ limit: '20mb' }));

// Lazy initializer for Gemini client
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined.');
    }
    genAiClient = new GoogleGenAI({
      apiKey: apiKey || 'DUMMY_KEY_FOR_LOCAL_DEV',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// System prompt for Saudi Energy & Sustainability Expert
const SUSTAINABILITY_SYSTEM_PROMPT = `أنت شات بوت ذكي وخبير استدامة وطاقة سعودي متمرس وسفير ترشيد بالشركة السعودية للكهرباء والشركة الوطنية للمياه.
مهمتك الأساسية:
1. تحليل صور الفواتير (كهرباء ومياه) واستخراج القيم بدقة متناهية.
2. عند إعطاء نتيجة تحليل الفاتورة، اجعل خطة الترشيد والخطوات المفصلة تتناسب وتتخصص ديناميكياً مع نوع الفاتورة المستخرجة بصرامة شديدة:
   • لفواتير المياه (billType = "water"): تقديم نصائح وخطة ترشيد خاصة بالكامل لترشيد المياه، مثل (تركيب أدوات ومرشدات ترشيد المياه المعقلنة المعتمدة، فحص الخزانات الأرضية والعلوية والعوامات لكشف التسريبات الخفية، إصلاح محابس وصنابير وسيفونات المياه التالفة، وإدارة أوقات الري والتقنيات الذكية). ويُمنع منعاً باتاً ذكر المكيفات أو التبريد أو الكهرباء في فاتورة المياه.
   • لفواتير الكهرباء (billType = "electricity"): تقديم نصائح التكييف والأجهزة الكهربائية (ضبط المكيف على 24°C لتقليل استهلاك الضغاط وتوفير حتى 25%، تنظيف الفلاتر دورياً كل أسبوعين، استخدام أجهزة الإنفرتر عالية الكفاءة، العزل الحراري وإحكام إغلاق الأبواب والنوافذ).
3. تقييم الأجهزة المنزلية من الصور المرفقة، وتحديد ما إذا كان الجهاز قديم ومستهلك أو جديد وموفر للتقنية (Inverter).
4. ربط الاستهلاك بحالة الطقس الخارجية بالمملكة العربية السعودية (درجات الحرارة العالية، الرطوبة الساحلية في جدة/الدمام، جفاف الرياض، إلخ).
5. توفير خطط ترشيد واضحة ومحسوبة بالريال السعودي (SAR) بدقة واستناداً لتعريفات الخدمات بالمملكة.
6. مراقبة استهلاك المياه، وتنبيه المستخدم فوراً في حال وجود مؤشرات تسريب خفي (تجاوز متوسط 250 لتر/فرد/يوم).
تحدث بلغة عربية راقية، احترافية، مودة، ومشجعة للاستدامة والتوفير بالريال السعودي.`;

// Helper to fetch live weather from Open-Meteo for server routes
async function fetchServerLiveWeather(cityId: string, customLat?: number, customLon?: number) {
  const base = SAUDI_CITIES_WEATHER[cityId] || SAUDI_CITIES_WEATHER.riyadh;
  const lat = customLat ?? base.lat ?? 24.7136;
  const lon = customLon ?? base.lon ?? 46.6753;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data.current) {
        const liveTemp = Math.round(data.current.temperature_2m);
        const liveHumidity = Math.round(data.current.relative_humidity_2m);
        const liveWind = Math.round(data.current.wind_speed_10m);

        const currentHour = new Date().getHours();
        const isNight = data.current.is_day !== undefined ? data.current.is_day === 0 : (currentHour >= 18 || currentHour < 6);

        let acStress = 'معتدل';
        if (liveTemp >= 43) acStress = 'حرج جداً (ذروة الصيف)';
        else if (liveTemp >= 38) acStress = liveHumidity >= 55 ? 'حرج (حرارة ورطوبة)' : 'حرج (ضغط كمبروسر عالي)';
        else if (liveTemp >= 34) acStress = 'عالي';
        else if (liveTemp < 28) acStress = 'منخفض (أجواء لطيفة)';

        let conditionText = base.condition;
        if (isNight) {
          if (data.current.weather_code === 0) conditionText = 'صافٍ ليلاً';
          else if (data.current.weather_code <= 3) conditionText = 'غائم جزئياً ليلاً';
          else conditionText = 'أجواء ليلية معتدلة';
        }

        return {
          ...base,
          lat,
          lon,
          tempC: liveTemp,
          humidityPercent: liveHumidity,
          windSpeedKmH: liveWind,
          acStressIndex: acStress,
          condition: conditionText,
          isNight,
          isLive: true,
          lastUpdated: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }
  } catch (err) {
    console.warn('Server failed to fetch live weather, falling back to static metadata:', err);
  }
  return base;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/weather', (req, res) => {
  res.json({ cities: SAUDI_CITIES_WEATHER });
});

app.get('/api/weather/live', async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
  const cityId = ((req.query.cityId as string) || 'riyadh').toLowerCase();

  const weather = await fetchServerLiveWeather(cityId, lat, lon);
  res.json(weather);
});

app.get('/api/weather/:cityId', async (req, res) => {
  const cityId = req.params.cityId.toLowerCase();
  const weather = await fetchServerLiveWeather(cityId);
  res.json(weather);
});

// Analyze Invoice Route
app.post('/api/analyze-bill', async (req, res) => {
  try {
    const { imageBase64, isSampleBill, cityId = 'riyadh', userText = '' } = req.body;

    // If requesting the sample bill attached in the request without image
    if (isSampleBill && !imageBase64) {
      return res.json({
        success: true,
        analysis: ATTACHED_SAMPLE_BILL,
        isSample: true,
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'يرجى إرفاق صورة للتحليل.' });
    }

    const ai = getGeminiClient();
    const cityWeather = SAUDI_CITIES_WEATHER[cityId] || SAUDI_CITIES_WEATHER.riyadh;

    // Detect MIME type dynamically
    let mimeType = 'image/jpeg';
    if (imageBase64.startsWith('data:image/png')) mimeType = 'image/png';
    else if (imageBase64.startsWith('data:image/webp')) mimeType = 'image/webp';
    else if (imageBase64.startsWith('data:image/gif')) mimeType = 'image/gif';

    // Remove data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const userTextContext = userText ? `نص/استفسار المستخدم المرفق مع الصورة: "${userText}"` : 'لم يرفق المستخدم نصاً مع الصورة.';

    const promptText = `أنت خبير استدامة وطاقة سعودي متمرس وسفير ترشيد بالشركة السعودية للكهرباء والشركة الوطنية للمياه.
قم بفحص واختبار الصورة المرفقة بعناية فائقة وتحديد نوعها ودقتها:

1. الخطوة الأولى والأهم: التحقق مما إذا كانت الصورة هي (فاتورة رسمية للكهرباء SEC أو المياه NWC أو كشف حساب استهلاك ببيانات مالية ورقم حساب).
- اجعل قيمة isUtilityBill بـ true فقط وفقط إذا كانت الصورة فاتورة رسمية حقيقية تحتوي بيانات استهلاك ومالية!
- إذا كانت الصورة جهاز تكييف، ثلاجة، لوحة جهاز، تسريب مياه، محبس، أو صورة عامة وليست فاتورة، فاجعل isUtilityBill بـ false فوراً بصرامة شديدة!

2. فحص الشعار والترويسة العلوية بدقة شديدة لتحديد حقل billType:
- افحص الشعار والنصوص العلوية والجهات الرسمية بالفاتورة:
  * إذا كانت الفاتورة تحمل شعار أو اسم "الشركة السعودية للكهرباء" (Saudi Electricity Company / SEC)، أو تحتوي وحدات "كيلو واط ساعة" (kwh) أو حسابات الكهرباء: صنفها فوراً وبصرامة كـ billType = "electricity".
  * إذا كانت الفاتورة تحمل شعار أو اسم "شركة المياه الوطنية" (National Water Company / NWC) أو "الخدمات البيئية والمياه"، أو تحتوي وحدات "متر مكعب" (m3) أو الصرف الصحي أو حسابات المياه: صنفها فوراً وبصرامة كـ billType = "water".
- يمنع منعاً باتاً الخلط بين فاتورة الكهرباء وفاتورة المياه!

3. حالة الصورة فاتورة رسمية (isUtilityBill = true):
- اقرأ بصرامة الأرقام والبيانات المكتوبة بوضوح في الفاتورة (رقم الحساب، اسم المشترك إن وجد، كمية الاستهلاك بالكيلوواط/ساعة أو المتر المكعب، والمبلغ المطلوب بالريال السعودي SAR).
- يمنع منعاً باتاً استخدام أرقام افتراضية ثابته عند قراءة فاتورة حقيقية!
- اذكر خطوات خطة الترشيد المفصلة والوفر المالي بالريال السعودي ديناميكياً بحسب نوع الفاتورة:
  * إذا كانت الفاتورة (مياه): اجعل نصائح خطة الترشيد والخطوات المفصلة وحقول التوفير خاصة حصرياً بترشيد استهلاك المياه (تركيب مرشدات وأدوات ترشيد المياه المعقلنة، كشف التسريبات الخفية بالخزانات والعوامات، إصلاح المحابس والسيفونات والصنابير التالفة، وتقنيات الري الذكي) مع حظر ذكر المكيفات أو الكهرباء تماماً.
  * إذا كانت الفاتورة (كهرباء): اجعل نصائح خطة الترشيد مخصصة للكهرباء والتكييف (ضبط المكيف على 24°C، تنظيف الفلاتر دورياً، استخدام أجهزة الإنفرتر عالية الكفاءة، والعزل الحراري).

4. حالة الصورة ليست فاتورة (isUtilityBill = false) - مثل صورة مكيف، ثلاجة، جهاز، أو تسريب:
- أجب عن استفسار المستخدم المرفق [${userTextContext}] كاستشارة فنية وطاقة بدقة شديدة.
- قيّم الجهاز الموضح بالصورة (قديم، حديث، تقنية الإنفرتر، حالة الاتساخ/الصيانة، استهلاك الطاقة المتوقع بالريال السعودي، ونصائح ترشيد وتخفيض الفاتورة).
- اكتب الإجابة الفنية الشاملة والمخصصة في حقل (nonBillResponseText).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: SUSTAINABILITY_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isUtilityBill: {
              type: Type.BOOLEAN,
              description: "True ONLY if image is an official electricity or water bill. False if it is an appliance, device, leak, or non-bill image."
            },
            nonBillResponseText: {
              type: Type.STRING,
              description: "Detailed technical advice, evaluation of appliance, and answers to user question if isUtilityBill is false."
            },
            billType: { type: Type.STRING, description: "electricity or water" },
            subscriberName: { type: Type.STRING },
            accountNumber: { type: Type.STRING },
            city: { type: Type.STRING },
            billingPeriod: { type: Type.STRING },
            daysCount: { type: Type.NUMBER },
            currentReading: { type: Type.NUMBER },
            previousReading: { type: Type.NUMBER },
            consumptionKWh: { type: Type.NUMBER, description: "consumption amount in kWh or m3" },
            meterFeeSAR: { type: Type.NUMBER },
            consumptionCostSAR: { type: Type.NUMBER },
            vatSAR: { type: Type.NUMBER },
            totalAmountSAR: { type: Type.NUMBER, description: "exact total amount due in SAR" },
            tariffTier: { type: Type.STRING },
            hasWaste: { type: Type.BOOLEAN },
            wasteSeverity: { type: Type.STRING },
            wasteExplanation: { type: Type.STRING },
            weatherCorrelation: {
              type: Type.OBJECT,
              properties: {
                city: { type: Type.STRING },
                temperatureRange: { type: Type.STRING },
                humidity: { type: Type.STRING },
                impactOnAC: { type: Type.STRING },
              },
            },
            savingsPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  monthlySavingSAR: { type: Type.NUMBER },
                  annualSavingSAR: { type: Type.NUMBER },
                  effort: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            detailedSavingsSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "خطوات خطة الترشيد المفصلة في نقاط واضحة"
            },
            overallRecommendation: { type: Type.STRING },
          },
          required: ['isUtilityBill'],
        },
      },
    });

    const jsonText = response.text || '{}';
    const analysisData = JSON.parse(jsonText);
    res.json({ success: true, analysis: analysisData });
  } catch (error: any) {
    console.error('Error analyzing bill/image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'فشل في تحليل الصورة. يرجى التأكد من وضوح الصورة والتحقق من الخدمة.',
    });
  }
});

// Analyze Appliance Route
app.post('/api/analyze-appliance', async (req, res) => {
  try {
    const { imageBase64, applianceType, cityId = 'riyadh' } = req.body;
    const ai = getGeminiClient();
    const cityWeather = SAUDI_CITIES_WEATHER[cityId] || SAUDI_CITIES_WEATHER.riyadh;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const prompt = `أنت خبير كفاءة أجهزة منزلية سعودي. قم ببدراسة الصورة/الوصف للجهاز التالي: "${applianceType || 'جهاز منزلي'}".
المدينة: ${cityWeather.cityNameAr} (درجة الحرارة: ${cityWeather.tempC}°C، الرطوبة: ${cityWeather.humidityPercent}%).
حدد:
1. حالة الجهاز: هل هو (قديم ومستهلك) أم (جديد وموفر) أم (متوسط الكفاءة)؟
2. تقييم نجوم كفاءة الطاقة SASO المتوقع.
3. تقدير القدرة بالكيواط والتكلفة الشهرية بالريال السعودي.
4. نسبة الهدر في حال كان قديماً.
5. توصية بديل موفر مع حساب فترة استرداد الاستثمار بالأشهر (Payback period) بالريال السعودي.
6. نصائح سريعة للترشيد.`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction: SUSTAINABILITY_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applianceType: { type: Type.STRING },
            status: { type: Type.STRING },
            sasoStarsEstimate: { type: Type.NUMBER },
            estimatedPowerKW: { type: Type.NUMBER },
            estimatedMonthlyCostSAR: { type: Type.NUMBER },
            weatherSensitivity: { type: Type.STRING },
            wastePercentage: { type: Type.NUMBER },
            replacementRecommendation: {
              type: Type.OBJECT,
              properties: {
                recommendedModel: { type: Type.STRING },
                estimatedCostSAR: { type: Type.NUMBER },
                monthlySavingSAR: { type: Type.NUMBER },
                paybackPeriodMonths: { type: Type.NUMBER },
              },
              required: ['recommendedModel', 'estimatedCostSAR', 'monthlySavingSAR', 'paybackPeriodMonths'],
            },
            quickTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'applianceType',
            'status',
            'sasoStarsEstimate',
            'estimatedMonthlyCostSAR',
            'weatherSensitivity',
            'wastePercentage',
            'replacementRecommendation',
            'quickTips',
          ],
        },
      },
    });

    const analysisData = JSON.parse(response.text || '{}');
    res.json({ success: true, analysis: analysisData });
  } catch (error: any) {
    console.error('Error analyzing appliance:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء فحص الجهاز.',
    });
  }
});

// Water Leak & Audit Route
app.post('/api/check-water', async (req, res) => {
  try {
    const { monthlyConsumptionM3, householdMembers = 5, monthlyBillSAR = 0 } = req.body;

    const m3 = Number(monthlyConsumptionM3) || 0;
    const members = Math.max(1, Number(householdMembers) || 1);
    const daysInMonth = 30;

    // Total liters consumed = m3 * 1000
    const totalLiters = m3 * 1000;
    const dailyPerCapitaLiters = Math.round(totalLiters / (members * daysInMonth));
    const normalCapitaLitersLimit = 250; // Saudi Water Authority benchmark is 200-250 L/person/day

    const isLeakSuspected = dailyPerCapitaLiters > normalCapitaLitersLimit;
    const excessLitersPerCapitaDay = Math.max(0, dailyPerCapitaLiters - normalCapitaLitersLimit);
    const totalExcessM3Month = Math.round((excessLitersPerCapitaDay * members * daysInMonth) / 1000);

    // Approximate tariff estimation for Saudi National Water Company
    let estimatedLeakWasteSAR = 0;
    if (totalExcessM3Month > 0) {
      estimatedLeakWasteSAR = totalExcessM3Month * 6; // Average 6 SAR/m3 for upper tiers + sewage
    }

    let leakSeverity: 'لا يوجد' | 'طفيف' | 'متوسط' | 'تسريب خفي خطير' = 'لا يوجد';
    let leakAlertMessage = 'استهلاكك ضمن المعدل الطبيعي والمستدام للشخص (أقل من 250 لتر/يوم). لا توجد مؤشرات تسريب.';

    if (dailyPerCapitaLiters > 450) {
      leakSeverity = 'تسريب خفي خطير';
      leakAlertMessage = `⚠️ تنبيه عاجل جداً! معدل الاستهلاك الفردي يبلغ ${dailyPerCapitaLiters} لتر/يوم، وهو أعلى بـ ${Math.round((dailyPerCapitaLiters / normalCapitaLitersLimit) * 100 - 100)}% من الحد الطبيعي! هناك احتمال كبير لوجود تسريب خفي في الخزان الأرضي، عوامة السيفون، أو شبكة التغذية. هدر مالي تقديري: ${estimatedLeakWasteSAR} ريال شهرياً.`;
    } else if (dailyPerCapitaLiters > 320) {
      leakSeverity = 'متوسط';
      leakAlertMessage = `⚠️ تنبيه تسريب محتمل! الاستهلاك يبلغ ${dailyPerCapitaLiters} لتر/فرد/يوم. يتجاوز المعيار الوطني السليم (250 لتر). يُنصح بإغلاق المحبس الرئيسي واختبار عداد المياه فوراً.`;
    } else if (dailyPerCapitaLiters > 250) {
      leakSeverity = 'طفيف';
      leakAlertMessage = `تنبيه: الاستهلاك أعلى قليلاً من المعدل المثالي (${dailyPerCapitaLiters} لتر/يوم). تحقق من كفاءة مرشدات المياه والرشاشات.`;
    }

    const inspectionSteps = [
      'فحص عوامة الخزان الأرضي والخزان العلوي للتأكد من عدم فيضان المياه.',
      'اختبار السيفونات والمراحيض بوضع قطرات صبغة طعام في الصندوق ومراقبة تسربها للحوض دون ضغط الزر.',
      'إغلاق جميع المحابس الداخلية لمدة ساعتين ومراقبة حركة مؤشر عداد المياه الرئيسي (إذا تحرك فالإشارة إلى وجود تسريب مدفون).',
      'تركيب أدوات ترشيد استهلاك المياه المعتمدة من هيئة كفاءة الإنفاق والمشاريع الحكومية / شركة المياه الوطنية.',
    ];

    res.json({
      success: true,
      analysis: {
        monthlyConsumptionM3: m3,
        householdMembers: members,
        dailyPerCapitaLiters,
        normalCapitaLitersLimit,
        isLeakSuspected,
        leakSeverity,
        leakAlertMessage,
        monthlyBillSAR,
        estimatedLeakWasteSAR,
        inspectionSteps,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat with Saudi Energy Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, cityId = 'riyadh', imageBase64 } = req.body;
    const ai = getGeminiClient();
    const cityWeather = SAUDI_CITIES_WEATHER[cityId] || SAUDI_CITIES_WEATHER.riyadh;

    const parts: any[] = [];

    if (imageBase64) {
      let mimeType = 'image/jpeg';
      if (imageBase64.startsWith('data:image/png')) mimeType = 'image/png';
      else if (imageBase64.startsWith('data:image/webp')) mimeType = 'image/webp';
      else if (imageBase64.startsWith('data:image/gif')) mimeType = 'image/gif';

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const lastUserText = messages && messages.length > 0 ? messages[messages.length - 1]?.text : 'مرحباً خبير الاستدامة';

    const promptText = `المدينة الحالية للمستخدم: ${cityWeather.cityNameAr} (${cityWeather.tempC}°C، الرطوبة: ${cityWeather.humidityPercent}%).
تاريخ ووقت المحادثة: ${new Date().toLocaleString('ar-SA')}.

تنبيه هائم جداً: عند وجود صورة مرفقة، اقرأ بصرامة الأرقام والبيانات الفعلية الظاهرة في الصورة بالكامل (مثل رقم الحساب، اسم المشترك، كمية الاستهلاك، والمبلغ المطلوب) واعرض الأرقام الحقيقية المستخرجة من الصورة في ردك. تجنب تماماً استخدام أي بيانات وهمية أو افتراضية!

سؤال/محادثة المستخدم الأخيرة:
${lastUserText}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SUSTAINABILITY_SYSTEM_PROMPT,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'أهلاً بك! أنا خبير الاستدامة والطاقة السعودي، كيف يمكنني مساعدتك في توفير فاتورتك اليوم؟',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      reply: 'عذراً، حدث خطأ مؤقت في التواصل مع خبير الذكاء الاصطناعي. يرجى إعادة المحاولة.',
    });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🇸🇦 Saudi Energy & Sustainability Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
