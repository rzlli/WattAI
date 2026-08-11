export interface User {
  fullName: string;
  username: string;
  householdMembers: number;
  cityId: string;
  isLoggedIn: boolean;
  isProfileComplete?: boolean;
}

export interface BillRecord {
  id: string;
  type: 'electricity' | 'water';
  monthLabel: string;
  uploadDate: string;
  totalAmountSAR: number;
  consumptionValue: number;
  unit: 'ك.و.س' | 'م³';
  electricityAnalysis?: BillAnalysis;
  waterAnalysis?: WaterAnalysis;
  imageUrl?: string;
  isArchived?: boolean;
}

export interface BillAnalysis {
  subscriberName?: string;
  accountNumber?: string;
  city?: string;
  billingPeriod?: string;
  daysCount?: number;
  currentReading?: number;
  previousReading?: number;
  consumptionKWh: number;
  meterFeeSAR: number;
  consumptionCostSAR: number;
  vatSAR: number;
  totalAmountSAR: number;
  tariffTier: string;
  hasWaste: boolean;
  wasteSeverity: 'low' | 'medium' | 'high' | 'critical';
  wasteExplanation: string;
  weatherCorrelation: {
    city: string;
    temperatureRange: string;
    humidity: string;
    impactOnAC: string;
  };
  savingsPlan: Array<{
    action: string;
    monthlySavingSAR: number;
    annualSavingSAR: number;
    effort: 'سهل' | 'متوسط' | 'استثماري';
    description: string;
  }>;
  overallRecommendation: string;
}

export interface ApplianceAnalysis {
  applianceType: string;
  status: 'قديم ومستهلك' | 'جديد وموفر' | 'متوسط الكفاءة';
  sasoStarsEstimate: number;
  estimatedPowerKW: number;
  estimatedMonthlyCostSAR: number;
  weatherSensitivity: string;
  wastePercentage: number;
  replacementRecommendation: {
    recommendedModel: string;
    estimatedCostSAR: number;
    monthlySavingSAR: number;
    paybackPeriodMonths: number;
  };
  quickTips: string[];
}

export interface WaterAnalysis {
  monthlyConsumptionM3: number;
  householdMembers: number;
  dailyPerCapitaLiters: number;
  isLeakSuspected: boolean;
  leakSeverity?: 'لا يوجد' | 'طفيف' | 'متوسط' | 'تسريب خفي خطير';
  leakAlertMessage?: string;
  normalCapitaLitersLimit: number; // 250 L / person / day in KSA
  monthlyBillSAR: number;
  estimatedLeakWasteSAR: number;
  inspectionSteps: string[];
}

export interface CityWeather {
  cityId: string;
  cityNameAr: string;
  cityNameEn: string;
  tempC: number;
  humidityPercent: number;
  condition: string;
  acStressIndex: string;
  recommendedAcTempC: number;
  tip: string;
  lat?: number;
  lon?: number;
  windSpeedKmH?: number;
  isLive?: boolean;
  isNight?: boolean;
  lastUpdated?: string;
  isCustomLocation?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
}
