import { useState, useEffect } from 'react';
import { ClipboardList, TrendingUp, Menu, X } from 'lucide-react';
import { JobCardRecord, FinancialRecord } from './types';
import { generateMockJobCards, generateMockFinancialRecords } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import JobCardModule from './components/JobCardModule';
import FinancialTrackerModule from './components/FinancialTrackerModule';

type Module = 'jobcards' | 'financial';

function App() {
  const [activeModule, setActiveModule] = useState<Module>('jobcards');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [jobCards, setJobCards] = useLocalStorage<JobCardRecord[]>(
    'mgnrega-jobcards',
    generateMockJobCards()
  );

  const [financialRecords, setFinancialRecords] = useLocalStorage<FinancialRecord[]>(
    'mgnrega-financial',
    generateMockFinancialRecords()
  );

  // Initialize mock data on first load
  useEffect(() => {
    if (jobCards.length === 0) {
      setJobCards(generateMockJobCards());
    }
    if (financialRecords.length === 0) {
      setFinancialRecords(generateMockFinancialRecords());
    }
  }, []);

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
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-gray-900 leading-tight">MGNREGA</h1>
                <p className="text-xs text-gray-500">Rural Employment Records</p>
              </div>
              <h1 className="sm:hidden text-sm font-bold text-gray-900">MGNREGA</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveModule('jobcards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeModule === 'jobcards'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Job Cards
              </button>
              <button
                onClick={() => setActiveModule('financial')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeModule === 'financial'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Financial Tracker
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-2 border-t border-gray-100 pt-3">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setActiveModule('jobcards'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                    activeModule === 'jobcards'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'text-gray-600 bg-gray-50'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  Job Card Management
                </button>
                <button
                  onClick={() => { setActiveModule('financial'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                    activeModule === 'financial'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'text-gray-600 bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Financial Year Tracker
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        {/* Module Title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {activeModule === 'jobcards' ? 'Job Card Management' : 'Financial Year Tracker'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {activeModule === 'jobcards'
              ? 'FY 2024-25 • Village-wise JC requests & approvals'
              : 'FY 2024-25 (April – March) • Wage demands & credit tracking'
            }
          </p>
        </div>

        {/* Module Content */}
        {activeModule === 'jobcards' ? (
          <JobCardModule records={jobCards} setRecords={setJobCards} />
        ) : (
          <FinancialTrackerModule records={financialRecords} setRecords={setFinancialRecords} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2 px-4">
          <button
            onClick={() => setActiveModule('jobcards')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[80px] min-h-[56px] transition-all ${
              activeModule === 'jobcards'
                ? 'text-indigo-600'
                : 'text-gray-400'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${activeModule === 'jobcards' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-semibold">Job Cards</span>
            {activeModule === 'jobcards' && (
              <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveModule('financial')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[80px] min-h-[56px] transition-all ${
              activeModule === 'financial'
                ? 'text-indigo-600'
                : 'text-gray-400'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeModule === 'financial' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-semibold">Financial</span>
            {activeModule === 'financial' && (
              <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
