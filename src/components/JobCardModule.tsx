import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Search, Plus, Download, FileSpreadsheet } from 'lucide-react';
import { JobCardRecord, ApprovalStatus, OfficeAction } from '../types';
import { VILLAGES } from '../data/mockData';
import VillageSelector from './VillageSelector';
import JobCardMobileCard from './JobCardMobileCard';
import AddJobCardModal from './AddJobCardModal';

interface JobCardModuleProps {
  records: JobCardRecord[];
  setRecords: (records: JobCardRecord[] | ((prev: JobCardRecord[]) => JobCardRecord[])) => void;
}

export default function JobCardModule({ records, setRecords }: JobCardModuleProps) {
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (selectedVillage !== 'all') {
      filtered = filtered.filter((r) => r.village === selectedVillage);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.headName.toLowerCase().includes(q) ||
          r.jobCardNumber.toLowerCase().includes(q) ||
          r.remarks.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [records, selectedVillage, searchQuery]);

  const handleStatusToggle = (id: string, field: 'approvalStatus' | 'officeAction', value: string) => {
    setRecords((prev: JobCardRecord[]) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: value as ApprovalStatus | OfficeAction }
          : r
      )
    );
  };

  const handleAddRecord = (data: {
    jobCardNumber: string;
    headName: string;
    remarks: 'Add New' | 'Delete' | 'Correction';
    requestDate: string;
    approvalStatus: ApprovalStatus;
    officeAction: OfficeAction;
    village: string;
  }) => {
    const newRecord: JobCardRecord = {
      id: uuidv4(),
      slNo: records.length + 1,
      ...data,
      createdAt: new Date().toISOString(),
    };
    setRecords((prev: JobCardRecord[]) => [newRecord, ...prev]);
  };

  const exportCSV = () => {
    const headers = ['Sl No.', 'Job Card No.', 'Name', 'Request Type', 'Date', 'Approval', 'Office Action', 'Village'];
    const rows = filteredRecords.map((r) => [
      r.slNo, r.jobCardNumber, r.headName, r.remarks, r.requestDate, r.approvalStatus, r.officeAction, r.village
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-cards-${selectedVillage || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, JC number, or type..."
            className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 min-h-[44px] active:scale-95 transition-transform"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-400">{filteredRecords.length} records</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Job Card No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Approval</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Office Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Village</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.slice(0, 50).map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{record.slNo}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{record.jobCardNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{record.headName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                      record.remarks === 'Add New' ? 'bg-green-50 text-green-700 border-green-200' :
                      record.remarks === 'Delete' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {record.remarks}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{record.requestDate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const statuses: ApprovalStatus[] = ['Pending', 'Approved', 'Not Approved'];
                        const idx = statuses.indexOf(record.approvalStatus);
                        handleStatusToggle(record.id, 'approvalStatus', statuses[(idx + 1) % statuses.length]);
                      }}
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 ${
                        record.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        record.approvalStatus === 'Not Approved' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      {record.approvalStatus}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const statuses: OfficeAction[] = ['Pending', 'Added to Portal', 'Rejected'];
                        const idx = statuses.indexOf(record.officeAction);
                        handleStatusToggle(record.id, 'officeAction', statuses[(idx + 1) % statuses.length]);
                      }}
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 ${
                        record.officeAction === 'Added to Portal' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        record.officeAction === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      {record.officeAction}
                    </button>
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
        {filteredRecords.slice(0, 30).map((record) => (
          <JobCardMobileCard
            key={record.id}
            record={record}
            onStatusToggle={handleStatusToggle}
          />
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No records found</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddJobCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
        villages={villageNames}
      />
    </div>
  );
}
