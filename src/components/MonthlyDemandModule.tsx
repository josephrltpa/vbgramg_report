import { useState, useEffect, useRef } from 'react';
import { Plus, Check, X, Upload, Download, Link2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { JobCard, MonthlyDemand, MONTHS, CreditStatus } from '../types';
import { fetchJobCards, fetchMonthlyDemands, addMonthlyDemand, updateDemandCreditStatus, updateDemandWagelistLink, deleteMonthlyDemand } from '../lib/services';

interface MonthlyDemandModuleProps {
  village: string;
  userRole: string;
}

export default function MonthlyDemandModule({ village, userRole }: MonthlyDemandModuleProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [demands, setDemands] = useState<MonthlyDemand[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [village, selectedMonth, selectedYear]);

  async function loadData() {
    setLoading(true);
    const [jcs, dems] = await Promise.all([
      fetchJobCards(village),
      fetchMonthlyDemands(village, selectedMonth, selectedYear),
    ]);
    setJobCards(jcs);
    setDemands(dems);
    setLoading(false);
  }

  async function handleAddDemand(jc: JobCard) {
    const result = await addMonthlyDemand({
      jobCardId: jc.id,
      jobCardNumber: jc.jobCardNumber,
      headName: jc.headName,
      village,
      month: selectedMonth,
      year: selectedYear,
      daysWorked: 0,
      wageAmount: 0,
      creditStatus: 'Pending',
      creditDate: '',
      wagelistLink: '',
    });
    if (result) await loadData();
  }

  async function handleToggleCredit(demand: MonthlyDemand) {
    const newStatus: CreditStatus = demand.creditStatus === 'Credited' ? 'Pending' : 'Credited';
    const creditDate = newStatus === 'Credited' ? new Date().toISOString().split('T')[0] : '';
    await updateDemandCreditStatus(demand.id, newStatus, creditDate);
    await loadData();
  }

  async function handleUpdateWagelist(id: string, link: string) {
    await updateDemandWagelistLink(id, link);
    await loadData();
  }

  async function handleDelete(id: string) {
    if (confirm('Remove this member from monthly demand?')) {
      await deleteMonthlyDemand(id);
      await loadData();
    }
  }

  // JCs not yet in this month's demand
  const availableJCs = jobCards.filter(jc =>
    !demands.some(d => d.jobCardId === jc.id)
  );

  const totalWage = demands.reduce((sum, d) => sum + d.wageAmount, 0);
  const creditedCount = demands.filter(d => d.creditStatus === 'Credited').length;
  const pendingCount = demands.filter(d => d.creditStatus === 'Pending').length;

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Month</label>
          <MonthSelector selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
        </div>
        <div className="w-full sm:w-32">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px] bg-white"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
          <p className="text-xs text-indigo-600">Total Members</p>
          <p className="text-xl font-bold text-indigo-900">{demands.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-xs text-emerald-600">Credited</p>
          <p className="text-xl font-bold text-emerald-900">{creditedCount}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="text-xl font-bold text-amber-900">{pendingCount}</p>
        </div>
      </div>

      {/* Add Member Button */}
      {userRole === 'secretary' && (
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium min-h-[48px]"
        >
          <Plus className="w-4 h-4" />
          Add Member to Demand List
        </button>
      )}

      {/* Add Member Panel */}
      {showAddPanel && (
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 space-y-2">
          <p className="text-xs font-medium text-indigo-700 mb-2">Select from Job Card list:</p>
          {availableJCs.length === 0 ? (
            <p className="text-sm text-gray-500">All JCs already added for this month</p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {availableJCs.map(jc => (
                <button
                  key={jc.id}
                  onClick={() => handleAddDemand(jc)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-100 text-left min-h-[44px] hover:bg-indigo-50 active:scale-[0.99]"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{jc.headName}</p>
                    <p className="text-xs text-gray-500 font-mono">{jc.jobCardNumber}</p>
                  </div>
                  <Plus className="w-4 h-4 text-indigo-600" />
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setShowAddPanel(false)} className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium min-h-[40px]">
            Close
          </button>
        </div>
      )}

      {/* Demand List */}
      <div className="space-y-2">
        {demands.map((demand) => (
          <DemandCard
            key={demand.id}
            demand={demand}
            userRole={userRole}
            onToggleCredit={handleToggleCredit}
            onUpdateWagelist={handleUpdateWagelist}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {demands.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No members added for this month yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Member" to select from JC list</p>
        </div>
      )}
    </div>
  );
}

// Month Selector (horizontal scrollable pills)
function MonthSelector({ selectedMonth, onSelect }: { selectedMonth: number; onSelect: (m: number) => void }) {
  return (
    <div className="flex overflow-x-auto whitespace-nowrap gap-1.5 pb-1 scrollbar-hide snap-x">
      {MONTHS.map((m) => (
        <button
          key={m.index}
          onClick={() => onSelect(m.index)}
          className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold min-h-[40px] min-w-[50px] snap-start transition-all ${
            selectedMonth === m.index
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// Individual Demand Card
function DemandCard({
  demand,
  userRole,
  onToggleCredit,
  onUpdateWagelist,
  onDelete,
}: {
  demand: MonthlyDemand;
  userRole: string;
  onToggleCredit: (d: MonthlyDemand) => void;
  onUpdateWagelist: (id: string, link: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [linkInput, setLinkInput] = useState(demand.wagelistLink);
  const [showLinkInput, setShowLinkInput] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">{demand.headName}</h4>
            <p className="text-xs text-gray-500 font-mono">{demand.jobCardNumber}</p>
            {demand.wageAmount > 0 && (
              <p className="text-sm font-bold text-gray-800 mt-1">{formatAmount(demand.wageAmount)}</p>
            )}
          </div>

          {/* Credit Toggle */}
          <button
            onClick={() => onToggleCredit(demand)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-[44px] min-w-[90px] justify-center active:scale-95 transition-transform ${
              demand.creditStatus === 'Credited'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            {demand.creditStatus === 'Credited' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {demand.creditStatus === 'Credited' ? 'Credited' : 'Pending'}
          </button>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium min-h-[32px]"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Wagelist & Details
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50">
          <div className="space-y-3 mt-3">
            {/* Days worked & amount */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Days Worked</label>
                <input
                  type="number"
                  defaultValue={demand.daysWorked}
                  onBlur={(e) => {/* TODO: update */}}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none min-h-[40px]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Wage Amount (₹)</label>
                <input
                  type="number"
                  defaultValue={demand.wageAmount}
                  onBlur={(e) => {/* TODO: update */}}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none min-h-[40px]"
                />
              </div>
            </div>

            {/* Wagelist Link */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Wagelist / Bill Link</label>
              {demand.wagelistLink && !showLinkInput ? (
                <div className="flex items-center gap-2">
                  <a
                    href={demand.wagelistLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 text-sm text-indigo-600 font-medium bg-indigo-50 rounded-lg px-3 py-2.5 min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span className="truncate">{demand.wagelistLink}</span>
                  </a>
                  <button
                    onClick={() => setShowLinkInput(true)}
                    className="px-3 py-2.5 bg-gray-100 rounded-lg min-h-[44px]"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="Paste Drive/Dropbox link (PDF, Excel, HTML)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none min-h-[44px]"
                  />
                  <button
                    onClick={() => { onUpdateWagelist(demand.id, linkInput); setShowLinkInput(false); }}
                    className="px-3 bg-indigo-600 text-white rounded-lg min-h-[44px]"
                  >
                    Save
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">Supports PDF, Excel, HTML files via Google Drive, Dropbox, etc.</p>
            </div>

            {/* Delete */}
            {userRole === 'secretary' && (
              <button
                onClick={() => onDelete(demand.id)}
                className="flex items-center gap-1.5 text-xs text-red-600 font-medium min-h-[36px]"
              >
                <Trash2 className="w-3 h-3" />
                Remove from demand list
              </button>
            )}

            {demand.creditDate && (
              <p className="text-xs text-gray-400">Credited on: {demand.creditDate}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
