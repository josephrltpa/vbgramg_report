import { useState, useEffect } from 'react';
import { ClipboardList, MessageSquare, CalendarDays, LogOut, Menu, X, Bell, FileText } from 'lucide-react';
import Login from './components/Login';
import JCListModule from './components/JCListModule';
import JCRequestModule from './components/JCRequestModule';
import MonthlyDemandModule from './components/MonthlyDemandModule';
import FTOReportsModule from './components/FTOReportsModule';
import LocationSelector from './components/LocationSelector';
import { fetchJCRequests } from './lib/services';

type Tab = 'jclist' | 'requests' | 'demands' | 'fto';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('mgnrega_user');
  });
  const [userVillage, setUserVillage] = useState<string>(() => {
    return localStorage.getItem('mgnrega_user_village') || '';
  });
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('mgnrega_user_role') || 'secretary';
  });
  const [activeTab, setActiveTab] = useState<Tab>('jclist');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Hierarchical location state - store both ID and name
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_district_id') || '';
  });
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_district_name') || '';
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_block_id') || '';
  });
  const [selectedBlockName, setSelectedBlockName] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_block_name') || '';
  });
  const [selectedVillage, setSelectedVillage] = useState<string>(() => {
    return localStorage.getItem('mgnrega_selected_village') || '';
  });
  
  // Notification state for admin
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [villagePendingMap, setVillagePendingMap] = useState<Record<string, number>>({});
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  // Fetch pending requests count for admin with village breakdown
  useEffect(() => {
    if (userRole === 'computer_assistant') {
      const fetchPendingCount = async () => {
        const requests = await fetchJCRequests();
        const pendingRequests = requests.filter(r => r.status === 'Submitted');
        
        // Total count
        setPendingRequestsCount(pendingRequests.length);
        
        // Village-wise breakdown
        const villageMap: Record<string, number> = {};
        pendingRequests.forEach(req => {
          villageMap[req.village] = (villageMap[req.village] || 0) + 1;
        });
        setVillagePendingMap(villageMap);
      };
      
      fetchPendingCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole, activeTab]);
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Force reload when switching to JC List tab
    if (tab === 'jclist') {
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const handleDistrictChange = (districtId: string, districtName: string) => {
    setSelectedDistrictId(districtId);
    setSelectedDistrictName(districtName);
    localStorage.setItem('mgnrega_selected_district_id', districtId);
    localStorage.setItem('mgnrega_selected_district_name', districtName);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleBlockChange = (blockId: string, blockName: string) => {
    setSelectedBlockId(blockId);
    setSelectedBlockName(blockName);
    localStorage.setItem('mgnrega_selected_block_id', blockId);
    localStorage.setItem('mgnrega_selected_block_name', blockName);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleVillageChange = (village: string) => {
    setSelectedVillage(village);
    localStorage.setItem('mgnrega_selected_village', village);
    setRefreshKey(prev => prev + 1);
  };

  const handleLogin = (username: string, village: string) => {
    localStorage.setItem('mgnrega_user', username);
    localStorage.setItem('mgnrega_user_village', village);
    
    // Determine role based on username
    const role = username === 'admin' ? 'computer_assistant' : 'secretary';
    localStorage.setItem('mgnrega_user_role', role);
    
    setCurrentUser(username);
    setUserVillage(village);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('mgnrega_user');
    localStorage.removeItem('mgnrega_user_village');
    localStorage.removeItem('mgnrega_user_role');
    setCurrentUser(null);
    setUserVillage('');
    setUserRole('secretary');
  };

  // Not logged in - show login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  // For admin, use selectedVillage. For secretary, use their assigned village.
  const village = userRole === 'computer_assistant' ? selectedVillage : userVillage;
  
  // Build display string for location hierarchy
  const displayVillage = userRole === 'computer_assistant'
    ? (selectedVillage 
        ? `${selectedVillage}${selectedBlockName ? ` • ${selectedBlockName}` : ''}${selectedDistrictName ? ` • ${selectedDistrictName}` : ''}`
        : 'Select Location')
    : userVillage || 'Village';

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'jclist', label: 'JC List', icon: ClipboardList },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'demands', label: 'Demands', icon: CalendarDays },
    { id: 'fto', label: 'FTO Reports', icon: FileText },
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
                <span className="text-white text-sm font-bold">V</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">VBGRAMG VEC Portal</h1>
                <p className="text-xs text-gray-500">{displayVillage} • {userRole === 'computer_assistant' ? 'Computer Assistant' : 'Login'}</p>
              </div>
            </div>
            
            {/* Location Selector and Notifications for Admin */}
            {userRole === 'computer_assistant' && (
              <div className="flex items-center gap-2">
                {/* Notification Bell with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={`${pendingRequestsCount} pending request${pendingRequestsCount !== 1 ? 's' : ''}`}
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {pendingRequestsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotificationDropdown && pendingRequestsCount > 0 && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowNotificationDropdown(false)}
                      />
                      
                      {/* Dropdown Panel */}
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                          <h3 className="text-white font-semibold text-sm">Pending Requests</h3>
                          <p className="text-indigo-100 text-xs mt-0.5">
                            {pendingRequestsCount} request{pendingRequestsCount !== 1 ? 's' : ''} from {Object.keys(villagePendingMap).length} village{Object.keys(villagePendingMap).length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        {/* Village List */}
                        <div className="max-h-80 overflow-y-auto">
                          {Object.entries(villagePendingMap)
                            .sort(([, a], [, b]) => b - a)
                            .map(([village, count]) => (
                              <button
                                key={village}
                                onClick={() => {
                                  handleVillageChange(village);
                                  handleTabChange('requests');
                                  setShowNotificationDropdown(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">{village}</p>
                                    <p className="text-xs text-gray-500">
                                      {count} pending request{count !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                                    {count}
                                  </span>
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </button>
                            ))}
                        </div>
                        
                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                          <button
                            onClick={() => {
                              handleTabChange('requests');
                              setShowNotificationDropdown(false);
                            }}
                            className="w-full text-center text-xs text-indigo-600 font-medium hover:text-indigo-700"
                          >
                            View All Requests →
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <LocationSelector
                  selectedDistrict={selectedDistrictId}
                  selectedBlock={selectedBlockId}
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
                const showBadge = tab.id === 'requests' && userRole === 'computer_assistant' && pendingRequestsCount > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                      </span>
                    )}
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
                    selectedDistrict={selectedDistrictId}
                    selectedBlock={selectedBlockId}
                    selectedVillage={selectedVillage}
                    onDistrictChange={handleDistrictChange}
                    onBlockChange={handleBlockChange}
                    onVillageChange={handleVillageChange}
                  />
                  
                  {/* Pending Requests Summary */}
                  {pendingRequestsCount > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Pending Requests</h4>
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {pendingRequestsCount}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {Object.entries(villagePendingMap)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([village, count]) => (
                            <button
                              key={village}
                              onClick={() => {
                                handleVillageChange(village);
                                handleTabChange('requests');
                                setMobileMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between bg-white rounded-lg px-3 py-2 hover:bg-indigo-50 transition-colors"
                            >
                              <span className="text-xs font-medium text-gray-700">{village}</span>
                              <span className="text-xs font-bold text-red-600">{count}</span>
                            </button>
                          ))}
                        {Object.keys(villagePendingMap).length > 5 && (
                          <button
                            onClick={() => {
                              handleTabChange('requests');
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-center text-xs text-indigo-600 font-medium py-1"
                          >
                            +{Object.keys(villagePendingMap).length - 5} more villages
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const showBadge = tab.id === 'requests' && userRole === 'computer_assistant' && pendingRequestsCount > 0;
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
                    {showBadge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {pendingRequestsCount} pending
                      </span>
                    )}
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
        {activeTab === 'fto' && (
          <FTOReportsModule village={village} userRole={userRole} />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const showBadge = tab.id === 'requests' && userRole === 'computer_assistant' && pendingRequestsCount > 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[70px] min-h-[56px] relative ${
                  activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                    </span>
                  )}
                </div>
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
