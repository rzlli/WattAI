import { CityWeather } from '../types';
import { SAUDI_CITIES_WEATHER } from '../data/saudiCities';

// WMO Weather interpretation codes with Day/Night awareness
function decodeWmoWeatherCode(
  code: number,
  tempC: number,
  humidityPercent: number,
  isNight: boolean
): { ar: string; en: string } {
  if (isNight) {
    switch (code) {
      case 0:
        return { ar: 'صافٍ ليلاً', en: 'Clear Night' };
      case 1:
      case 2:
        return { ar: 'صافٍ ليلاً مع سحب خفيفة', en: 'Mostly Clear Night' };
      case 3:
        return { ar: 'غائم جزئياً ليلاً', en: 'Partly Cloudy Night' };
      case 45:
      case 48:
        return { ar: 'ضبابي ليلاً', en: 'Foggy Night' };
      case 51:
      case 53:
      case 55:
        return { ar: 'رذاذ خفيف ليلاً', en: 'Light Drizzle Night' };
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
        return { ar: 'أمطار ممطرة ليلاً', en: 'Night Rain Showers' };
      case 95:
      case 96:
      case 99:
        return { ar: 'عاصفة رعدية ليلاً', en: 'Night Thunderstorm' };
      default:
        if (tempC >= 42) return { ar: 'حرارة شديدة ليلاً', en: 'Extreme Heat Night' };
        if (tempC >= 38 && humidityPercent >= 50) return { ar: 'حار ورطب ساحلي ليلاً', en: 'Hot & Humid Night' };
        if (tempC >= 38) return { ar: 'حرارة مرتفعة ليلاً', en: 'Warm Night' };
        if (tempC >= 30) return { ar: 'أجواء دافئة ليلاً', en: 'Warm Night' };
        return { ar: 'أجواء لطيفة ليلاً', en: 'Mild Night' };
    }
  }

  // Daytime
  switch (code) {
    case 0:
      return { ar: 'صافٍ وشمسي', en: 'Clear & Sunny' };
    case 1:
    case 2:
      return { ar: 'مشمس مع سحب خفيفة', en: 'Mostly Sunny' };
    case 3:
      return { ar: 'غائم جزئياً', en: 'Partly Cloudy' };
    case 45:
    case 48:
      return { ar: 'ضبابي', en: 'Foggy' };
    case 51:
    case 53:
    case 55:
      return { ar: 'رذاذ خفيف', en: 'Light Drizzle' };
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
      return { ar: 'أمطار ممطرة', en: 'Rain Showers' };
    case 95:
    case 96:
    case 99:
      return { ar: 'عاصفة رعدية', en: 'Thunderstorm' };
    default:
      if (tempC >= 42) return { ar: 'حرارة شديدة وجافة', en: 'Extreme Heat' };
      if (tempC >= 38 && humidityPercent >= 50) return { ar: 'حار ورطب ساحلي', en: 'Hot & Humid' };
      if (tempC >= 38) return { ar: 'حار صيفاً', en: 'Hot' };
      if (tempC >= 30) return { ar: 'معتدل الحرارة', en: 'Warm' };
      return { ar: 'أجواء لطيفة ومعتدلة', en: 'Mild Weather' };
  }
}

// Calculate AC Stress Index from live temperature & humidity
function calculateAcStressIndex(tempC: number, humidityPercent: number, lang: 'ar' | 'en' = 'ar'): string {
  if (tempC >= 43) {
    return lang === 'ar' ? 'حرج جداً (ذروة الصيف)' : 'Critical (Peak Heat)';
  }
  if (tempC >= 38) {
    return humidityPercent >= 55
      ? (lang === 'ar' ? 'حرج (حرارة ورطوبة)' : 'Critical (Heat & Humidity)')
      : (lang === 'ar' ? 'حرج (ضغط كمبروسر عالي)' : 'Critical (High Load)');
  }
  if (tempC >= 34) {
    return lang === 'ar' ? 'عالي (حمولة تبريد)' : 'High (Cooling Load)';
  }
  if (tempC >= 28) {
    return lang === 'ar' ? 'معتدل' : 'Moderate';
  }
  return lang === 'ar' ? 'منخفض (أجواء لطيفة)' : 'Low (Mild)';
}

// Generate dynamic sustainability tip based on live metrics
function generateDynamicTip(
  cityNameAr: string,
  cityNameEn: string,
  tempC: number,
  humidityPercent: number,
  lang: 'ar' | 'en' = 'ar'
): string {
  if (humidityPercent >= 55) {
    return lang === 'ar'
      ? `الرطوبة العالية الحالية (${humidityPercent}%) بـ${cityNameAr} تزيد الشعور بالحرارة وإجهاد المكيف. نوصي بتشغيل وضع إزالة الرطوبة (Dry Mode) وضبط الحرارة على 24°C لتبريد أسرع وتوفير الكهرباء.`
      : `High relative humidity (${humidityPercent}%) in ${cityNameEn} increases AC load. We recommend using Dry Mode & keeping temperature at 24°C.`;
  }
  if (tempC >= 42) {
    return lang === 'ar'
      ? `درجة الحرارة المرتفعة الحالية (${tempC}°C) بـ${cityNameAr} ترفع استهلاك التكييف بنسبة تصل إلى 70%. إحكام إغلاق الستائر وضبط المكيف على 24°C يوفر حتى 25% من الفاتورة.`
      : `Extreme temperature (${tempC}°C) in ${cityNameEn} spikes AC usage up to 70%. Setting AC to 24°C & closing curtains saves up to 25%.`;
  }
  if (tempC >= 36) {
    return lang === 'ar'
      ? `في طقس ${cityNameAr} الحالي (${tempC}°C)، تنظيف فلاتر المكيف كل أسبوعين يرفع كفاءة التبريد بـ 10% ويقلل الضغط اللحظي على الكهرباء.`
      : `At ${tempC}°C in ${cityNameEn}, cleaning AC filters bi-weekly boosts cooling efficiency by 10% and cuts bill load.`;
  }
  return lang === 'ar'
    ? `الأجواء الحالية بـ${cityNameAr} معتدلة (${tempC}°C). يمكن الاعتماد على مراوح السقف والتهوية المعتدلة لتخفيض استهلاك الكهرباء بالريال السعودي.`
    : `Mild current weather in ${cityNameEn} (${tempC}°C). Rely on ceiling fans & natural ventilation to minimize energy bills.`;
}

// Get realistic regional climate baseline if offline or network fails
function getRealisticRegionalThermalProfile(cityId: string, isNight: boolean) {
  // Highlands / Mountains (Cool climate: Abha, Taif, Baha, Khamis)
  if (['abha', 'taif', 'baha', 'khamis'].includes(cityId)) {
    return {
      tempC: isNight ? 18 : 26,
      humidityPercent: isNight ? 55 : 42,
    };
  }

  // Coastal cities (High humidity: Jeddah, Dammam, Yanbu, Jizan, Jubail, Rabigh, Dhahran, Qatif, Khafji)
  if (['jeddah', 'dammam', 'yanbu', 'jizan', 'jubail', 'dhahran', 'qatif', 'khafji', 'rabigh', 'duba', 'wajh'].includes(cityId)) {
    return {
      tempC: isNight ? 31 : 38,
      humidityPercent: isNight ? 75 : 62,
    };
  }

  // Interior / Hot Desert cities (Riyadh, Makkah, Madinah, Ahsa, Qassim, Hail, Tabuk, Hafr, etc.)
  return {
    tempC: isNight ? 32 : 42,
    humidityPercent: isNight ? 28 : 18,
  };
}

// Fetch live weather from Open-Meteo API
export async function fetchLiveWeather(
  cityId: string,
  customLat?: number,
  customLon?: number,
  customNameAr?: string,
  customNameEn?: string
): Promise<CityWeather> {
  const baseCity = SAUDI_CITIES_WEATHER[cityId] || Object.values(SAUDI_CITIES_WEATHER)[0];

  const lat = customLat ?? baseCity.lat ?? 24.7136;
  const lon = customLon ?? baseCity.lon ?? 46.6753;

  const cityNameAr = customNameAr || baseCity.cityNameAr;
  const cityNameEn = customNameEn || baseCity.cityNameEn;

  const nowTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Weather API error: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || !data.current) {
      throw new Error('Invalid weather data structure');
    }

    const liveTemp = Math.round(data.current.temperature_2m * 10) / 10;
    const liveHumidity = Math.round(data.current.relative_humidity_2m);
    const liveWindSpeed = Math.round(data.current.wind_speed_10m);
    const weatherCode = data.current.weather_code ?? 0;

    const currentHour = new Date().getHours();
    const isNightByHour = currentHour >= 18 || currentHour < 6;
    const isNight = data.current.is_day !== undefined ? data.current.is_day === 0 : isNightByHour;

    const conditionObj = decodeWmoWeatherCode(weatherCode, liveTemp, liveHumidity, isNight);
    const acStress = calculateAcStressIndex(liveTemp, liveHumidity, 'ar');
    const tip = generateDynamicTip(cityNameAr, cityNameEn, liveTemp, liveHumidity, 'ar');

    return {
      cityId,
      cityNameAr,
      cityNameEn,
      lat,
      lon,
      tempC: Math.round(liveTemp),
      humidityPercent: liveHumidity,
      windSpeedKmH: liveWindSpeed,
      condition: conditionObj.ar,
      acStressIndex: acStress,
      recommendedAcTempC: 24,
      tip,
      isLive: true,
      isNight,
      lastUpdated: nowTime,
      isCustomLocation: Boolean(customLat && customLon),
    };
  } catch (err) {
    console.warn('Falling back to realistic regional climate profile due to network/API error:', err);
    const currentHour = new Date().getHours();
    const isNightFallback = currentHour >= 18 || currentHour < 6;

    const regional = getRealisticRegionalThermalProfile(cityId, isNightFallback);
    const fallbackCondition = decodeWmoWeatherCode(0, regional.tempC, regional.humidityPercent, isNightFallback);
    const acStress = calculateAcStressIndex(regional.tempC, regional.humidityPercent, 'ar');
    const tip = generateDynamicTip(cityNameAr, cityNameEn, regional.tempC, regional.humidityPercent, 'ar');

    return {
      ...baseCity,
      tempC: regional.tempC,
      humidityPercent: regional.humidityPercent,
      condition: fallbackCondition.ar,
      acStressIndex: acStress,
      tip,
      isNight: isNightFallback,
      isLive: false,
      lastUpdated: nowTime,
    };
  }
}
