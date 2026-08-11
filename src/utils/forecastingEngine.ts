import { User, BillRecord, CityWeather } from '../types';
import { SAUDI_CITIES_WEATHER } from '../data/saudiCities';

export type SeasonType = 'summer' | 'winter' | 'moderate';

export interface ForecastResult {
  cityId: string;
  cityNameAr: string;
  cityNameEn: string;
  season: SeasonType;
  operatingHoursPerDay: number;
  householdMembers: number;
  currentKWh: number;
  currentSAR: number;
  predictedKWh: number;
  predictedSAR: number;
  kWhDifference: number;
  sarDifference: number;
  percentChange: number;
  tariffTier: 'الفيئة الأولى (18 هلالة/ك.و.س)' | 'الفئة الثانية (30 هلالة/ك.و.س - الشريحة العليا)';
  detailedReasonAr: string;
  detailedReasonEn: string;
  actionableTipsAr: string[];
}

// Calculate SEC Residential Electricity Bill (KSA Tariff Rules)
export function calculateKSABillSAR(kWh: number): {
  consumptionCostSAR: number;
  meterFeeSAR: number;
  vatSAR: number;
  totalSAR: number;
  tier: 'الفيئة الأولى (18 هلالة/ك.و.س)' | 'الفئة الثانية (30 هلالة/ك.و.س - الشريحة العليا)';
} {
  const safeKWh = Math.max(0, Math.round(kWh));
  const meterFeeSAR = 15;
  let consumptionCostSAR = 0;
  let tier: 'الفيئة الأولى (18 هلالة/ك.و.س)' | 'الفئة الثانية (30 هلالة/ك.و.س - الشريحة العليا)' =
    'الفيئة الأولى (18 هلالة/ك.و.س)';

  if (safeKWh <= 6000) {
    consumptionCostSAR = safeKWh * 0.18;
  } else {
    consumptionCostSAR = 6000 * 0.18 + (safeKWh - 6000) * 0.30;
    tier = 'الفئة الثانية (30 هلالة/ك.و.س - الشريحة العليا)';
  }

  const subtotal = consumptionCostSAR + meterFeeSAR;
  const vatSAR = subtotal * 0.15;
  const totalSAR = Math.round((subtotal + vatSAR) * 100) / 100;

  return {
    consumptionCostSAR: Math.round(consumptionCostSAR * 100) / 100,
    meterFeeSAR,
    vatSAR: Math.round(vatSAR * 100) / 100,
    totalSAR,
    tier,
  };
}

// Main Smart Forecasting Engine
export function calculateSmartBillForecast(
  user: User,
  electricityBill: BillRecord | null,
  seasonOverride?: SeasonType,
  operatingHoursPerDay: number = 8
): ForecastResult {
  const userCityId = user.cityId || Object.keys(SAUDI_CITIES_WEATHER)[0];
  const cityMeta = SAUDI_CITIES_WEATHER[userCityId] || Object.values(SAUDI_CITIES_WEATHER)[0];
  const members = Math.max(1, user.householdMembers || 5);

  // 1. Auto-detect season based on current calendar month if not explicitly overridden
  const currentMonth = new Date().getMonth() + 1; // 1-12
  let season: SeasonType = seasonOverride || 'summer';
  if (!seasonOverride) {
    if (currentMonth >= 5 && currentMonth <= 9) season = 'summer';
    else if (currentMonth === 11 || currentMonth === 12 || currentMonth <= 2) season = 'winter';
    else season = 'moderate';
  }

  // 2. Determine current bill baseline
  let currentKWh = electricityBill?.consumptionValue || 0;
  let currentSAR = electricityBill?.totalAmountSAR || 0;

  if (currentKWh === 0 || currentSAR === 0) {
    // Standard baseline estimate if no bill uploaded yet (average KSA household)
    currentKWh = 1400 + members * 200; // e.g. 2400 kWh (~430 SAR)
    currentSAR = calculateKSABillSAR(currentKWh).totalSAR;
  }

  // Determine climate zone type for user's registered city
  const coolMountainCities = ['abha', 'taif', 'baha', 'khamis'];
  const humidCoastalCities = ['jeddah', 'dammam', 'yanbu', 'jizan', 'jubail', 'dhahran', 'qatif', 'khafji', 'rabigh', 'duba', 'wajh'];

  const isMountain = coolMountainCities.includes(userCityId);
  const isCoastal = humidCoastalCities.includes(userCityId);

  // 3. Proportional Mathematics for Consumption Forecasting
  // Non-climate fixed baseline (appliances, lighting, fridge, water pumps, chargers)
  const nonClimateMonthlyKWh = Math.min(currentKWh * 0.25, members * 12 * 30);
  const baselineClimateMonthlyKWh = Math.max(300, currentKWh - nonClimateMonthlyKWh);

  // Climate scaling factor based on operating hours relative to standard 8 hrs/day baseline
  const hoursRatio = Math.max(0.1, operatingHoursPerDay / 8.0);

  // Climate factor based on city and season
  let climateFactor = 1.0;

  if (season === 'summer') {
    if (isMountain) climateFactor = 0.75; // Mild mountain summer
    else if (isCoastal) climateFactor = 1.20; // Hot & humid coastal
    else climateFactor = 1.32; // Interior desert peak summer heat
  } else if (season === 'winter') {
    if (isCoastal) climateFactor = 0.30; // Mild coastal winter (almost no heating/cooling)
    else if (isMountain) climateFactor = 1.15; // Cold mountain winter heating
    else climateFactor = 0.95; // Cold interior desert winter nights (heaters)
  } else {
    // Moderate season (Spring / Autumn)
    climateFactor = 0.40;
  }

  // Calculate predicted kWh dynamically
  const predictedClimateKWh = baselineClimateMonthlyKWh * hoursRatio * climateFactor;
  const predictedKWh = Math.round(nonClimateMonthlyKWh + predictedClimateKWh);

  // Calculate bill for predicted kWh using KSA tariff rules
  const predictedBillCalc = calculateKSABillSAR(predictedKWh);
  const predictedSAR = predictedBillCalc.totalSAR;

  const kWhDifference = Math.round(predictedKWh - currentKWh);
  const sarDifference = Math.round((predictedSAR - currentSAR) * 100) / 100;
  const percentChange = currentSAR > 0 ? Math.round(((predictedSAR - currentSAR) / currentSAR) * 100) : 0;

  // Build Arabic & English Reason Text dynamically matching exact calculation results
  let detailedReasonAr = '';
  let detailedReasonEn = '';
  const tipsAr: string[] = [];

  const absDiffSAR = Math.abs(sarDifference);
  const absPercent = Math.abs(percentChange);

  if (sarDifference < 0) {
    // PREDICTED DECREASE IN BILL (توفير وانخفاض)
    let causeTextAr = '';
    let causeTextEn = '';

    if (season === 'summer') {
      if (isMountain) {
        causeTextAr = `طقس مدينة [${cityMeta.cityNameAr}] الجبلي المعتدل صيفاً وخفض ساعات تشغيل المكيفات إلى (${operatingHoursPerDay} ساعات يومياً) لأسرة تضم (${members} أفراد).`;
        causeTextEn = `${cityMeta.cityNameEn}'s mild mountain summer weather and reduced AC operating hours (~${operatingHoursPerDay} hrs/day) for ${members} members.`;
      } else {
        causeTextAr = `ترشيد ساعات تشغيل التكييف بمعدل (${operatingHoursPerDay} ساعات يومياً) لأسرة تضم (${members} أفراد)، مما يقلل الاستهلاك مقارنة بنمط التشغيل المرتفع السابق.`;
        causeTextEn = `Optimized AC usage (~${operatingHoursPerDay} hrs/day) for ${members} members, reducing consumption compared to previous heavy operation.`;
      }
    } else if (season === 'winter') {
      if (isCoastal) {
        causeTextAr = `أجواء مدينة [${cityMeta.cityNameAr}] الشتوية الدافئة والتي تلغي الحاجة للتبريد المكثف أو التدفئة الكهربائية عالية القدرة لأسرة تضم (${members} أفراد).`;
        causeTextEn = `${cityMeta.cityNameEn}'s warm winter climate, eliminating the need for heavy AC cooling or energy-intensive space heaters for ${members} members.`;
      } else {
        causeTextAr = `الاعتماد على التدفئة المعتدلة بمعدل (${operatingHoursPerDay} ساعات يومياً) لأسرة تضم (${members} أفراد)، وهو حمل كهربائي أقل بكثير مقارنة بـ ذروة الصيف.`;
        causeTextEn = `Moderate space heating (~${operatingHoursPerDay} hrs/day) for ${members} members, requiring significantly less power than summer peak cooling.`;
      }
    } else {
      causeTextAr = `الاعتدال الطبيعي في درجات الحرارة خلال فصل الربيع/الخريف بمدينة [${cityMeta.cityNameAr}]، مما يقلل الحاجة للتبريد والتدفئة لأسرة تضم (${members} أفراد).`;
      causeTextEn = `Mild spring/autumn temperatures in ${cityMeta.cityNameEn}, sharply reducing heating and cooling demands for ${members} members.`;
    }

    detailedReasonAr = `بناءً على نتائج الحسابات، يُتوقع انخفاض الفاتورة القادمة بمدينة [${cityMeta.cityNameAr}] لتصل إلى (${predictedSAR} ر.س) بتوفير قدره (${absDiffSAR} ر.س / %${absPercent}-) مقارنة بالفاتورة الحالية (${currentSAR} ر.س). يرجع هذا الانخفاض الملحوظ إلى: ${causeTextAr}`;
    detailedReasonEn = `Based on calculations, the next bill in ${cityMeta.cityNameEn} is expected to decrease to ${predictedSAR} SAR, saving ${absDiffSAR} SAR (-${absPercent}%) compared to current bill (${currentSAR} SAR). Main reason: ${causeTextEn}`;
  } else if (sarDifference > 0) {
    // PREDICTED INCREASE IN BILL (ارتفاع موسمية أو زيادة تشغيل)
    let causeTextAr = '';
    let causeTextEn = '';

    if (season === 'summer') {
      if (isMountain) {
        causeTextAr = `الزيادة الموسمية في درجات الحرارة بمدينة [${cityMeta.cityNameAr}] وتشغيل المكيفات بمعدل مرتفع (${operatingHoursPerDay} ساعات يومياً) لأسرة تضم (${members} أفراد).`;
        causeTextEn = `Seasonal temperature rise in ${cityMeta.cityNameEn} and running ACs for ~${operatingHoursPerDay} hrs/day for ${members} members.`;
      } else {
        causeTextAr = `ارتفاع درجات الحرارة في [${cityMeta.cityNameAr}] صيفاً، وزيادة تشغيل أجهزة التكييف بمعدل مرتفع (${operatingHoursPerDay} ساعات يومياً) لتغطية احتياجات أسرة مكونة من (${members} أفراد).`;
        causeTextEn = `Extreme summer heat in ${cityMeta.cityNameEn} and increased AC runtime (~${operatingHoursPerDay} hrs/day) for ${members} members.`;
      }
    } else if (season === 'winter') {
      if (isCoastal) {
        causeTextAr = `ارتفاع ساعات تشغيل الأجهزة الكهربائية بمعدل (${operatingHoursPerDay} ساعات يومياً) لأسرة تضم (${members} أفراد).`;
        causeTextEn = `Increased appliance operating hours (~${operatingHoursPerDay} hrs/day) for ${members} members in ${cityMeta.cityNameEn}.`;
      } else {
        causeTextAr = `موجات البرد الشديدة بمدينة [${cityMeta.cityNameAr}] شتاءً، وتشغيل أجهزة التدفئة الكهربائية بمعدل مرتفع (${operatingHoursPerDay} ساعات يومياً) لأسرة تضم (${members} أفراد).`;
        causeTextEn = `Cold winter spells in ${cityMeta.cityNameEn} and operating electric space heaters for ~${operatingHoursPerDay} hrs/day for ${members} members.`;
      }
    } else {
      causeTextAr = `ارتفاع ساعات تشغيل الأجهزة المنزلية (${operatingHoursPerDay} ساعات يومياً) لأسرة تضم (${members} أفراد) مقارنة بنمط الاستهلاك السابق.`;
      causeTextEn = `Higher daily appliance operating hours (~${operatingHoursPerDay} hrs/day) for ${members} members in ${cityMeta.cityNameEn}.`;
    }

    detailedReasonAr = `بناءً على نتائج الحسابات، يُتوقع ارتفاع الفاتورة القادمة بمدينة [${cityMeta.cityNameAr}] لتصل إلى (${predictedSAR} ر.س) بزيادة قدرها (+${absDiffSAR} ر.س / +%${absPercent}) مقارنة بالفاتورة الحالية (${currentSAR} ر.س). ويرجع هذا الارتفاع الملحوظ إلى: ${causeTextAr}`;
    detailedReasonEn = `Based on calculations, the next bill in ${cityMeta.cityNameEn} is expected to increase to ${predictedSAR} SAR (+${absDiffSAR} SAR / +${absPercent}%) compared to current bill (${currentSAR} SAR). Main reason: ${causeTextEn}`;
  } else {
    // STABLE BILL (استقرار)
    detailedReasonAr = `يُتوقع استقرار الفاتورة القادمة بمدينة [${cityMeta.cityNameAr}] عند حدود (${predictedSAR} ر.س) لمطابقة نمط الاستهلاك الحالي وساعات التشغيل اليومية (${operatingHoursPerDay} ساعات/يومياً) لأسرة تضم (${members} أفراد).`;
    detailedReasonEn = `The next bill in ${cityMeta.cityNameEn} is expected to remain stable around ${predictedSAR} SAR matching your current consumption pattern and daily runtime (~${operatingHoursPerDay} hrs/day) for ${members} members.`;
  }

  // Generate actionable tips
  if (season === 'summer') {
    tipsAr.push(`ضبط درجة حرارة المكيفات على 24°C بمدينة ${cityMeta.cityNameAr} يوفر حتى 25% من الاستهلاك.`);
    tipsAr.push('إغلاق ستائر الغرف المعرضة لأشعة الشمس المباشرة لتقليل الحمل الحراري على الكمبروسر.');
  } else if (season === 'winter') {
    if (isCoastal) {
      tipsAr.push(`استغل طقس ${cityMeta.cityNameAr} الشتوي الدافئ لإيقاف التكييف والاعتماد على التهوية الطبيعية.`);
    } else {
      tipsAr.push('الدفيات الكهربائية تستهلك طاقة عالية (2000 واط)؛ يفضل استخدام التدفئة بمكيفات الإنفرتر في وضع الـ Heat للتوفير.');
      tipsAr.push('إغلاق منافذ الهواء البارد العلوية والنوافذ في الشتاء يحافظ على الدفء داخل الغرف.');
    }
  } else {
    tipsAr.push('استغل فترات الاعتدال لإجراء صيانة دورية لفلتر المكيفات قبل حلول فصل الصيف.');
  }

  if (predictedKWh > 6000) {
    tipsAr.push('⚠️ تنبيه: الاستهلاك المتوقع يدخل في الشريحة العليا (30 هلالة/ك.و.س). تقليل التشغيل بساعتين يومياً يعيدك للشرائح الأولى الموفرة.');
  }

  return {
    cityId: userCityId,
    cityNameAr: cityMeta.cityNameAr,
    cityNameEn: cityMeta.cityNameEn,
    season,
    operatingHoursPerDay,
    householdMembers: members,
    currentKWh: Math.round(currentKWh),
    currentSAR: Math.round(currentSAR * 100) / 100,
    predictedKWh: Math.round(predictedKWh),
    predictedSAR,
    kWhDifference,
    sarDifference,
    percentChange,
    tariffTier: predictedBillCalc.tier,
    detailedReasonAr,
    detailedReasonEn,
    actionableTipsAr: tipsAr,
  };
}
