import { SAUDI_CITIES_WEATHER } from '../data/saudiCities';
import { CityWeather } from '../types';

export interface IpLocationResult {
  success: boolean;
  cityId?: string;
  cityNameAr?: string;
  cityNameEn?: string;
  lat?: number;
  lon?: number;
  ipCityName?: string;
  error?: string;
}

// Map common English IP city names to Saudi city keys in our app
const CITY_NAME_MAPPINGS: Record<string, string> = {
  'taif': 'taif',
  'at taif': 'taif',
  'al taif': 'taif',
  'طائف': 'taif',
  'الطائف': 'taif',
  'jeddah': 'jeddah',
  'jiddah': 'jeddah',
  'جدة': 'jeddah',
  'mecca': 'makkah',
  'makkah': 'makkah',
  'makkah al mukarramah': 'makkah',
  'مكة': 'makkah',
  'مكة المكرمة': 'makkah',
  'medina': 'madinah',
  'madinah': 'madinah',
  'al madinah': 'madinah',
  'المدينة': 'madinah',
  'المدينة المنورة': 'madinah',
  'riyadh': 'riyadh',
  'ar riyadh': 'riyadh',
  'الرياض': 'riyadh',
  'dammam': 'dammam',
  'ad dammam': 'dammam',
  'الدمام': 'dammam',
  'khobar': 'dammam',
  'al khobar': 'dammam',
  'الخبر': 'dammam',
  'dhahran': 'dhahran',
  'الظهران': 'dhahran',
  'hofuf': 'ahsa',
  'al hofuf': 'ahsa',
  'al ahsa': 'ahsa',
  'ahsa': 'ahsa',
  'الأحساء': 'ahsa',
  'الهفوف': 'ahsa',
  'buraidah': 'buraidah',
  'buraydah': 'buraidah',
  'بريدة': 'buraidah',
  'qassim': 'buraidah',
  'القصيم': 'buraidah',
  'unaizah': 'unaizah',
  'عنيزة': 'unaizah',
  'hail': 'hail',
  'حائل': 'hail',
  'abha': 'abha',
  'أبها': 'abha',
  'khamis mushait': 'khamis',
  'khamis mushayt': 'khamis',
  'خميس مشيط': 'khamis',
  'jizan': 'jizan',
  'jizan / gizan': 'jizan',
  'gizan': 'jizan',
  'جازان': 'jizan',
  'جازان / جيزان': 'jizan',
  'najran': 'najran',
  'نجران': 'najran',
  'tabuk': 'tabuk',
  'تبوك': 'tabuk',
  'sakaka': 'jouf',
  'al jouf': 'jouf',
  'سكاكا': 'jouf',
  'الجوف': 'jouf',
  'arar': 'arar',
  'عرعر': 'arar',
  'yanbu': 'yanbu',
  'ينبع': 'yanbu',
  'jubail': 'jubail',
  'al jubail': 'jubail',
  'الجبيل': 'jubail',
  'hafr al-batin': 'hafr',
  'hafar al-batin': 'hafr',
  'حفر الباطن': 'hafr',
  'al baha': 'baha',
  'baha': 'baha',
  'الباحة': 'baha',
  'kharj': 'kharj',
  'al kharj': 'kharj',
  'الخرج': 'kharj',
  'alula': 'ula',
  'al ula': 'ula',
  'العلا': 'ula',
  'rabigh': 'rabigh',
  'رابغ': 'rabigh',
  'qatif': 'qatif',
  'al qatif': 'qatif',
  'القطيف': 'qatif',
  'khafji': 'khafji',
  'الخفجي': 'khafji',
  'dubba': 'duba',
  'duba': 'duba',
  'ضباء': 'duba',
  'al wajh': 'wajh',
  'الوجه': 'wajh',
  'qurayyat': 'qurayyat',
  'القريات': 'qurayyat',
};

// Helper: Calculate nearest city among all Saudi cities in database using coordinates
export function findNearestSaudiCity(lat: number, lon: number): CityWeather {
  const cities = Object.values(SAUDI_CITIES_WEATHER);
  let minDistance = Infinity;
  let nearestCity = cities[0];

  for (const city of cities) {
    if (city.lat && city.lon) {
      // Euclidean distance approximation for proximity
      const dLat = city.lat - lat;
      const dLon = city.lon - lon;
      const dist = dLat * dLat + dLon * dLon;
      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = city;
      }
    }
  }

  return nearestCity;
}

// Fetch IP Geolocation from ipwho.is with fallback to ipapi.co
export async function detectCityByIp(): Promise<IpLocationResult> {
  // 1. Try ipwho.is (fast, CORS-friendly, free)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const rawCityName = (data.city || '').toLowerCase().trim();
        const lat = data.latitude;
        const lon = data.longitude;

        // Try direct name mapping
        const matchedCityKey = CITY_NAME_MAPPINGS[rawCityName];
        if (matchedCityKey && SAUDI_CITIES_WEATHER[matchedCityKey]) {
          const matched = SAUDI_CITIES_WEATHER[matchedCityKey];
          return {
            success: true,
            cityId: matched.cityId,
            cityNameAr: matched.cityNameAr,
            cityNameEn: matched.cityNameEn,
            lat: lat || matched.lat,
            lon: lon || matched.lon,
            ipCityName: data.city,
          };
        }

        // If coordinates available, find nearest Saudi city in our database
        if (typeof lat === 'number' && typeof lon === 'number') {
          const nearest = findNearestSaudiCity(lat, lon);
          return {
            success: true,
            cityId: nearest.cityId,
            cityNameAr: nearest.cityNameAr,
            cityNameEn: nearest.cityNameEn,
            lat,
            lon,
            ipCityName: data.city || nearest.cityNameEn,
          };
        }
      }
    }
  } catch (err) {
    console.warn('ipwho.is failed, trying secondary IP geo service:', err);
  }

  // 2. Try ipapi.co fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const rawCityName = (data.city || '').toLowerCase().trim();
        const matchedCityKey = CITY_NAME_MAPPINGS[rawCityName];

        if (matchedCityKey && SAUDI_CITIES_WEATHER[matchedCityKey]) {
          const matched = SAUDI_CITIES_WEATHER[matchedCityKey];
          return {
            success: true,
            cityId: matched.cityId,
            cityNameAr: matched.cityNameAr,
            cityNameEn: matched.cityNameEn,
            lat: data.latitude,
            lon: data.longitude,
            ipCityName: data.city,
          };
        }

        const nearest = findNearestSaudiCity(data.latitude, data.longitude);
        return {
          success: true,
          cityId: nearest.cityId,
          cityNameAr: nearest.cityNameAr,
          cityNameEn: nearest.cityNameEn,
          lat: data.latitude,
          lon: data.longitude,
          ipCityName: data.city || nearest.cityNameEn,
        };
      }
    }
  } catch (err) {
    console.warn('ipapi.co failed:', err);
  }

  return {
    success: false,
    error: 'Could not resolve IP Geolocation',
  };
}
