import { useState } from 'react';
import { ClipboardList, MessageSquare, CalendarDays, LogOut, Menu, X } from 'lucide-react';
import Login from './components/Login';
import JCListModule from './components/JCListModule';
import JCRequestModule from './components/JCRequestModule';
import MonthlyDemandModule from './components/MonthlyDemandModule';
import LocationSelector from './components/LocationSelector';

type Tab = 'jclist' | 'requests' | 'demands';

// Store user session in localStorage
const USERS: Record<string, { village: string; role: string }> = {
  'admin': { village: 'all', role: 'computer_assistant' },
};

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('mgnrega_user');
  });
  const [activeTab, setActiveTab] = useState<Tab>('jclist');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Hierarchical location state
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_district') || '';
  });
  const [selectedBlock, setSelectedBlock] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_block') || '';
  });
  const [selectedVillage, setSelectedVillage] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_village') || '';
  });
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Force reload when switching to JC List tab
    if (tab === 'jclist') {
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    localStorage.setItem('mgnrega_selected_district', districtId);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleBlockChange = (blockId: string) => {
    setSelectedBlock(blockId);
    localStorage.setItem('mgnrega_selected_block', blockId);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleVillageChange = (village: string) => {
    setSelectedVillage(village);
    localStorage.setItem('mgnrega_selected_village', village);
    setRefreshKey(prev => prev + 1);
  };

  const handleLogin = (username: string) => {
    localStorage.setItem('mgnrega_user', username);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('mgnrega_user');
    setCurrentUser(null);
  };

  // Not logged in - show login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const userInfo = USERS[currentUser];
  const userRole = userInfo?.role || 'secretary';
  
  // For admin, use selectedVillage. For secretary, use their assigned village.
  const village = userRole === 'computer_assistant' ? selectedVillage : (userInfo?.village || 'all');
  
  // Build display string for location hierarchy
  const displayVillage = village === 'all' 
    ? 'All Villages' 
    : selectedVillage 
      ? `${selectedVillage}${selectedBlock ? ` • ${selectedBlock}` : ''}${selectedDistrict ? ` • ${selectedDistrict}` : ''}`
      : 'Select Location';

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'jclist', label: 'JC List', icon: ClipboardList },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'demands', label: 'Demands', icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">MGNREGA VEC Portal</h1>
                <p className="text-xs text-gray-500">{displayVillage} • {userRole === 'secretary' ? 'VEC Secretary' : 'Computer Assistant'}</p>
              </div>
            </div>
            
            {/* Location Selector for Admin */}
            {userRole === 'computer_assistant' && (
              <div className="flex items-center gap-2">
                <LocationSelector
                  selectedDistrict={selectedDistrict}
                  selectedBlock={selectedBlock}
                  selectedVillage={selectedVillage}
                  onDistrictChange={handleDistrictChange}
                  onBlockChange={handleBlockChange}
                  onVillageChange={handleVillageChange}
                />
              </div>
            )}

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="ml-2 flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-2 border-t border-gray-100 pt-3 space-y-2">
              {/* Location Selector for Admin - Mobile */}
              {userRole === 'computer_assistant' && (
                <div className="px-4 py-2 space-y-3">
                  <LocationSelector
                    selectedDistrict={selectedDistrict}
                    selectedBlock={selectedBlock}
                    selectedVillage={selectedVillage}
                    onDistrictChange={handleDistrictChange}
                    onBlockChange={handleBlockChange}
                    onVillageChange={handleVillageChange}
                  />
                </div>
              )}
              
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { handleTabChange(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-h-[48px] ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : 'text-gray-600 bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 min-h-[48px]"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        {activeTab === 'jclist' && (
          <JCListModule key={refreshKey} village={village} userRole={userRole} />
        )}
        {activeTab === 'requests' && (
          <JCRequestModule village={village} username={currentUser} userRole={userRole} />
        )}
        {activeTab === 'demands' && (
          <MonthlyDemandModule village={village} userRole={userRole} />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[70px] min-h-[56px] relative ${
                  activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
