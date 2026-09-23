import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { FinancialRecord, ProcessingStage, CreditStatus } from '../types';
import { VILLAGES } from '../data/mockData';
import VillageSelector from './VillageSelector';
import MonthTabs from './MonthTabs';
import FinancialMobileCard from './FinancialMobileCard';
import SummaryWidget from './SummaryWidget';
import AddFinancialRecordModal from './AddFinancialRecordModal';

interface FinancialTrackerModuleProps {
  records: FinancialRecord[];
  setRecords: (records: FinancialRecord[] | ((prev: FinancialRecord[]) => FinancialRecord[])) => void;
}

const stageColors: Record<ProcessingStage, string> = {
  'Generated': 'bg-gray-100 text-gray-700',
  'FTO Signed': 'bg-blue-100 text-blue-700',
  'Processed': 'bg-purple-100 text-purple-700',
  'Credited': 'bg-emerald-100 text-emerald-700',
};

export default function FinancialTrackerModule({ records, setRecords }: FinancialTrackerModuleProps) {
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredRecords = useMemo(() => {
    let filtered = records.filter((r) => r.month === selectedMonth);
    if (selectedVillage !== 'all') {
      filtered = filtered.filter((r) => r.village === selectedVillage);
    }
    return filtered;
  }, [records, selectedVillage, selectedMonth]);

  const summary = useMemo(() => {
    const total = filteredRecords.length;
    const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amountCredited, 0);
    const credited = filteredRecords.filter((r) => r.creditStatus === 'Credited').reduce((sum, r) => sum + r.amountCredited, 0);
    const pending = totalAmount - credited;
    return { total, totalAmount, credited, pending };
  }, [filteredRecords]);

  const handleStatusToggle = (id: string, field: 'creditStatus' | 'processingStage', value: string) => {
    setRecords((prev: FinancialRecord[]) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: value as CreditStatus | ProcessingStage }
          : r
      )
    );
  };

  const handleAddRecord = (data: {
    demandId: string;
    workName: string;
    amountCredited: number;
    creditStatus: CreditStatus;
    creditDate: string;
    attachmentLink: string;
    processingStage: ProcessingStage;
    month: number;
    village: string;
  }) => {
    const newRecord: FinancialRecord = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    setRecords((prev: FinancialRecord[]) => [newRecord, ...prev]);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const villageNames = VILLAGES.map((v) => v.name);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3">
        <VillageSelector
          villages={VILLAGES}
          selectedVillage={selectedVillage}
          onSelect={setSelectedVillage}
        />

        {/* Month Tabs */}
        <MonthTabs selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
      </div>

      {/* Summary Widget */}
      <SummaryWidget
        totalDemands={summary.total}
        totalAmount={summary.totalAmount}
        creditedAmount={summary.credited}
        pendingAmount={summary.pending}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Demand ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Work Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attachment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Village</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.slice(0, 50).map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{record.demandId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{record.workName}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{formatAmount(record.amountCredited)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const statuses: CreditStatus[] = ['Pending', 'Credited'];
                        const idx = statuses.indexOf(record.creditStatus);
                        handleStatusToggle(record.id, 'creditStatus', statuses[(idx + 1) % statuses.length]);
                      }}
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 ${
                        record.creditStatus === 'Credited'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      {record.creditStatus}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{record.creditDate || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const stages: ProcessingStage[] = ['Generated', 'FTO Signed', 'Processed', 'Credited'];
                        const idx = stages.indexOf(record.processingStage);
                        handleStatusToggle(record.id, 'processingStage', stages[(idx + 1) % stages.length]);
                      }}
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 ${stageColors[record.processingStage]}`}
                    >
                      {record.processingStage}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {record.attachmentLink ? (
                      <a href={record.attachmentLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{record.village}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredRecords.slice(0, 20).map((record) => (
          <FinancialMobileCard
            key={record.id}
            record={record}
            onStatusToggle={handleStatusToggle}
          />
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No records for this month</p>
          <p className="text-xs text-gray-400 mt-1">Tap + to add a new record</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddFinancialRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
        villages={villageNames}
      />
    </div>
  );
}
