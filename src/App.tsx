import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './components/HomePage';
import { ChatPage } from './components/ChatPage';
import { InvoicesPage } from './components/InvoicesPage';
import { SettingsPage } from './components/SettingsPage';
import { SAUDI_CITIES_WEATHER } from './data/saudiCities';
import { User, BillRecord, CityWeather } from './types';
import { useLanguage } from './context/LanguageContext';
import { fetchLiveWeather } from './utils/weatherService';

export default function App() {
  const { lang } = useLanguage();

  // User Authentication State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wattai_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active Tab state: 'home', 'chat', 'invoices', 'settings'
  const [activeTab, setActiveTab] = useState<string>('home');

  // Attached Bills Archive state
  const [bills, setBills] = useState<BillRecord[]>(() => {
    const saved = localStorage.getItem('wattai_bills');
    return saved ? JSON.parse(saved) : [];
  });

  // Live weather state
  const defaultCityId = user?.cityId || localStorage.getItem('wattai_last_selected_city') || 'taif';
  const [cityWeather, setCityWeather] = useState<CityWeather>(
    () => SAUDI_CITIES_WEATHER[defaultCityId] || Object.values(SAUDI_CITIES_WEATHER)[0]
  );
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Refresh live weather
  const handleRefreshWeather = async (
    cityId?: string,
    customLat?: number,
    customLon?: number,
    customNameAr?: string,
    customNameEn?: string
  ) => {
    setIsWeatherLoading(true);
    const targetCityId = cityId || user?.cityId || localStorage.getItem('wattai_last_selected_city') || 'taif';
    const liveData = await fetchLiveWeather(targetCityId, customLat, customLon, customNameAr, customNameEn);
    setCityWeather(liveData);
    setIsWeatherLoading(false);

    // If city changed, update user state and store in localStorage
    if (cityId) {
      localStorage.setItem('wattai_last_selected_city', cityId);
      if (user && user.cityId !== cityId) {
        setUser({ ...user, cityId });
      }
    }
  };

  // Automatically fetch live weather on mount or when user city changes
  useEffect(() => {
    if (user?.cityId) {
      handleRefreshWeather(user.cityId);
    }
  }, [user?.cityId]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('wattai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wattai_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('wattai_bills', JSON.stringify(bills));
  }, [bills]);

  // Handle Login / Register
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setActiveTab('home');
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
  };

  // Add a newly analyzed bill from Chat
  const handleBillAnalyzed = (newBill: BillRecord) => {
    setBills((prev) => [newBill, ...prev]);
  };

  // Toggle Archive status of a bill
  const handleToggleArchive = (id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isArchived: !b.isArchived } : b))
    );
  };

  // Delete a bill from records
  const handleDeleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  // Get current city object (falls back to cityWeather state or user city)
  const selectedCity: CityWeather = cityWeather || SAUDI_CITIES_WEATHER[user?.cityId || defaultCityId] || Object.values(SAUDI_CITIES_WEATHER)[0];

  // Get latest active electricity and water bills for the Home boxes
  const latestElectricityBill =
    bills.find((b) => b.type === 'electricity' && !b.isArchived) || null;
  const latestWaterBill =
    bills.find((b) => b.type === 'water' && !b.isArchived) || null;

  // If user is not logged in, show login / register screen
  if (!user || !user.isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div
      className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white pb-16"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Header */}
      <Header
        user={user}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'home' && (
          <HomePage
            electricityBill={latestElectricityBill}
            waterBill={latestWaterBill}
            selectedCity={selectedCity}
            user={user}
            isWeatherLoading={isWeatherLoading}
            onRefreshWeather={handleRefreshWeather}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'chat' && (
          <ChatPage
            selectedCity={selectedCity}
            onBillAnalyzed={handleBillAnalyzed}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesPage
            bills={bills}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onToggleArchive={handleToggleArchive}
            onDeleteBill={handleDeleteBill}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
