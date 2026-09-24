import { useState, useEffect, useRef } from 'react';
import { Plus, Search, FileText, Check, X, Upload, Download, Link2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { JobCard, MonthlyDemand, MONTHS, CreditStatus } from '../types';
import { fetchJobCards, fetchMonthlyDemands, addMonthlyDemand, updateDemandCreditStatus, deleteMonthlyDemand, fetchVillageWagelist, uploadVillageWagelist, deleteVillageWagelist, VillageWagelist } from '../lib/services';
import { uploadWagelistFile, deleteWagelistFile, viewHtmlFile, downloadFile } from '../lib/storage';
import { parseExcelFile, importMonthlyDemands, ImportResult } from '../lib/excelImport';

interface MonthlyDemandModuleProps {
  village: string;
  userRole: string;
}

export default function MonthlyDemandModule({ village, userRole }: MonthlyDemandModuleProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [demands, setDemands] = useState<MonthlyDemand[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(200);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [markingAllCredited, setMarkingAllCredited] = useState(false);
  const [markingAllPending, setMarkingAllPending] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [togglingCredit, setTogglingCredit] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [villageWagelist, setVillageWagelist] = useState<VillageWagelist | null>(null);
  const [uploadingWagelist, setUploadingWagelist] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [village, selectedMonth, selectedYear]);

  async function loadData() {
    setLoading(true);
    const [jcs, dems, wagelist] = await Promise.all([
      fetchJobCards(village),
      fetchMonthlyDemands(village, selectedMonth, selectedYear),
      fetchVillageWagelist(village, selectedMonth, selectedYear),
    ]);
    setJobCards(jcs);
    setDemands(dems);
    setVillageWagelist(wagelist);
    setCurrentPage(1);
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
    if (result) {
      await loadData();
      setShowAddPanel(false);
    }
  }

  async function handleToggleCredit(demand: MonthlyDemand) {
    setTogglingCredit(demand.id);
    const newStatus: CreditStatus = demand.creditStatus === 'Credited' ? 'Pending' : 'Credited';
    const creditDate = newStatus === 'Credited' ? new Date().toISOString().split('T')[0] : '';
    await updateDemandCreditStatus(demand.id, newStatus, creditDate);
    await loadData();
    setTogglingCredit(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteMonthlyDemand(id);
    setDeleteConfirm(null);
    await loadData();
    setDeletingId(null);
  }

  async function handleMarkAllCredited() {
    setMarkingAllCredited(true);
    const pendingDemands = demands.filter(d => d.creditStatus === 'Pending');
    const creditDate = new Date().toISOString().split('T')[0];
    
    // Update all pending demands to credited
    for (const demand of pendingDemands) {
      await updateDemandCreditStatus(demand.id, 'Credited', creditDate);
    }
    
    await loadData();
    setMarkingAllCredited(false);
  }

  async function handleMarkAllPending() {
    setMarkingAllPending(true);
    const creditedDemands = demands.filter(d => d.creditStatus === 'Credited');
    
    // Update all credited demands back to pending
    for (const demand of creditedDemands) {
      await updateDemandCreditStatus(demand.id, 'Pending', '');
    }
    
    await loadData();
    setMarkingAllPending(false);
  }

  async function handleDeleteAll() {
    setDeletingAll(true);
    // Delete all demands for current village/month/year
    for (const demand of demands) {
      await deleteMonthlyDemand(demand.id);
    }
    setShowDeleteAllConfirm(false);
    await loadData();
    setDeletingAll(false);
  }

  async function handleUploadVillageWagelist() {
    if (!selectedFile) return;
    
    setUploadingWagelist(true);
    
    // Upload file to storage
    const fileUrl = await uploadWagelistFile(
      selectedFile,
      village,
      selectedMonth,
      selectedYear
    );
    
    if (fileUrl) {
      // If there's an existing wagelist, delete the old file
      if (villageWagelist?.wagelistLink) {
        await deleteWagelistFile(villageWagelist.wagelistLink);
      }
      
      // Save the new file URL to database
      const result = await uploadVillageWagelist(
        village,
        selectedMonth,
        selectedYear,
        fileUrl,
        userRole === 'computer_assistant' ? 'admin' : village
      );
      
      if (result) {
        setVillageWagelist(result);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
    
    setUploadingWagelist(false);
  }

  async function handleDeleteVillageWagelist() {
    if (!villageWagelist) return;
    
    if (!window.confirm('Are you sure you want to delete this wagelist? This action cannot be undone.')) {
      return;
    }
    
    console.log('Starting delete process for:', villageWagelist);
    setUploadingWagelist(true);
    
    try {
      // Delete file from storage
      if (villageWagelist.wagelistLink) {
        console.log('Deleting file from storage:', villageWagelist.wagelistLink);
        const storageDeleted = await deleteWagelistFile(villageWagelist.wagelistLink);
        console.log('Storage delete result:', storageDeleted);
      }
      
      // Delete record from database
      console.log('Deleting record from database:', { village, month: selectedMonth, year: selectedYear });
      const success = await deleteVillageWagelist(
        village,
        selectedMonth,
        selectedYear
      );
      console.log('Database delete result:', success);
      
      if (success) {
        setVillageWagelist(null);
        console.log('Wagelist deleted successfully');
      } else {
        console.error('Failed to delete wagelist from database');
        alert('Failed to delete wagelist. Please try again.');
      }
    } catch (error) {
      console.error('Error during delete:', error);
      alert('An error occurred while deleting. Please try again.');
    }
    
    setUploadingWagelist(false);
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const data = await parseExcelFile(file);
      const result = await importMonthlyDemands(data, village, selectedMonth, selectedYear);
      setImportResult(result);
      
      if (result.success > 0) {
        await loadData();
      }
    } catch (error: any) {
      setImportResult({
        success: 0,
        failed: 0,
        errors: [`Failed to parse Excel file: ${error.message}`],
      });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  // JCs not yet in this month's demand
  const availableJCs = jobCards.filter(jc =>
    !demands.some(d => d.jobCardId === jc.id)
  );

  const filtered = demands
    .filter(d =>
      d.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.jobCardNumber.localeCompare(b.jobCardNumber));

  // Pagination
  const isAllRows = rowsPerPage === 'all';
  const itemsPerPage = isAllRows ? filtered.length : rowsPerPage;
  const totalPages = isAllRows ? 1 : Math.ceil(filtered.length / rowsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDemands = filtered.slice(startIndex, endIndex);

  const totalWage = demands.reduce((sum, d) => sum + d.wageAmount, 0);
  const creditedCount = demands.filter(d => d.creditStatus === 'Credited').length;
  const pendingCount = demands.filter(d => d.creditStatus === 'Pending').length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Monthly Demand List</h3>
          <p className="text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              📍 {village}
            </span>
            {' '}• {demands.length} members
          </p>
        </div>
        {userRole === 'computer_assistant' && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              disabled={importing}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium min-h-[44px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Excel
                </>
              )}
            </button>
            <button
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium min-h-[44px] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        )}
      </div>

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

      {/* Village Wagelist Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Village Wagelist</h3>
            <p className="text-xs text-gray-500">
              {MONTHS.find(m => m.index === selectedMonth)?.fullLabel} {selectedYear} • {village}
            </p>
          </div>
          {villageWagelist && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const fileName = villageWagelist.wagelistLink.split('/').pop() || 'wagelist';
                  viewHtmlFile(villageWagelist.wagelistLink, `Wagelist - ${village} - ${MONTHS.find(m => m.index === selectedMonth)?.fullLabel} ${selectedYear}`);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                View Wagelist
              </button>
              <button
                onClick={() => {
                  const fileName = villageWagelist.wagelistLink.split('/').pop() || 'wagelist';
                  downloadFile(villageWagelist.wagelistLink, fileName);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          )}
        </div>
        
        {userRole === 'computer_assistant' && (
          <div className="space-y-3">
            {villageWagelist && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Current wagelist uploaded</p>
                    <p className="text-xs text-emerald-700">
                      Uploaded on {new Date(villageWagelist.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      viewHtmlFile(villageWagelist.wagelistLink, `Wagelist - ${village} - ${MONTHS.find(m => m.index === selectedMonth)?.fullLabel} ${selectedYear}`);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      const fileName = villageWagelist.wagelistLink.split('/').pop() || 'wagelist';
                      downloadFile(villageWagelist.wagelistLink, fileName);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  {userRole === 'computer_assistant' && (
                    <button
                      onClick={handleDeleteVillageWagelist}
                      disabled={uploadingWagelist}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingWagelist ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.html,.htm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button
                onClick={handleUploadVillageWagelist}
                disabled={uploadingWagelist || !selectedFile}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingWagelist ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {villageWagelist ? 'Update' : 'Upload'}
                  </>
                )}
              </button>
            </div>
            
            {selectedFile && (
              <p className="text-xs text-gray-600">
                Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}
        
        {!villageWagelist && userRole !== 'computer_assistant' && (
          <p className="text-xs text-gray-400 italic">No wagelist uploaded yet for this month</p>
        )}
      </div>

      {/* Bulk Actions for Admin */}
      {userRole === 'computer_assistant' && (pendingCount > 0 || creditedCount > 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Bulk Actions</p>
              <p className="text-xs text-gray-600">
                {pendingCount > 0 && <span className="text-amber-600">{pendingCount} pending</span>}
                {pendingCount > 0 && creditedCount > 0 && <span> • </span>}
                {creditedCount > 0 && <span className="text-emerald-600">{creditedCount} credited</span>}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {pendingCount > 0 && (
                <button
                  onClick={handleMarkAllCredited}
                  disabled={markingAllCredited}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {markingAllCredited ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Marking...
                    </>
                  ) : (
                    'Mark All as Credited'
                  )}
                </button>
              )}
              {creditedCount > 0 && (
                <button
                  onClick={handleMarkAllPending}
                  disabled={markingAllPending}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {markingAllPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Marking...
                    </>
                  ) : (
                    'Mark All as Pending'
                  )}
                </button>
              )}
              {demands.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  disabled={deletingAll}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingAll ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
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

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or JC number..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">JC Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Days</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              {userRole === 'computer_assistant' && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedDemands.map((demand, idx) => (
              <DemandRow
                key={demand.id}
                demand={demand}
                index={startIndex + idx + 1}
                userRole={userRole}
                onToggleCredit={handleToggleCredit}
                onDelete={setDeleteConfirm}
                isToggling={togglingCredit === demand.id}
                isDeleting={deletingId === demand.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {paginatedDemands.map((demand, idx) => (
          <DemandCard
            key={demand.id}
            demand={demand}
            index={startIndex + idx + 1}
            userRole={userRole}
            onToggleCredit={handleToggleCredit}
            onDelete={setDeleteConfirm}
            isToggling={togglingCredit === demand.id}
            isDeleting={deletingId === demand.id}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {isAllRows ? (
                `Showing all ${filtered.length} members`
              ) : (
                `Showing ${startIndex + 1}-${Math.min(endIndex, filtered.length)} of ${filtered.length}`
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  const value = e.target.value;
                  setRowsPerPage(value === 'all' ? 'all' : Number(value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          {!isAllRows && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No demands found for this month</p>
          {userRole === 'computer_assistant' && (
            <p className="text-xs text-gray-400 mt-1">Click "Import Excel" or "Add Member" to get started</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove from Demand List</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove this member from the monthly demand list?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete All Demands</h3>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete <strong>all {demands.length} demands</strong> for:
            </p>
            <p className="text-sm font-medium text-gray-800 mb-4">
              {village} • {MONTHS.find(m => m.index === selectedMonth)?.fullLabel} {selectedYear}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-700">
                ⚠️ This action cannot be undone. All demand records for this month will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Monthly Demands from Excel</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Excel Format Requirements:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Column headers: <strong>Job Card Number</strong>, <strong>Head Name</strong>, <strong>Days Worked</strong>, <strong>Amount</strong></li>
                  <li>• All demands will be added to: <strong>{village}</strong> for <strong>{MONTHS.find(m => m.index === selectedMonth)?.fullLabel} {selectedYear}</strong></li>
                  <li>• Job cards must exist in the JC List</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  disabled={importing}
                  className="hidden"
                  id="demand-excel-import"
                />
                <label
                  htmlFor="demand-excel-import"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {importing ? 'Importing...' : 'Click to select Excel file'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Supports .xlsx and .xls files</span>
                </label>
              </div>

              {importResult && (
                <div className={`border rounded-lg p-4 ${
                  importResult.success > 0 && importResult.failed === 0
                    ? 'bg-green-50 border-green-200'
                    : importResult.success > 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className="text-sm font-medium mb-2">Import Results:</p>
                  <div className="text-xs space-y-1">
                    <p className="text-green-700">✓ Successfully imported: {importResult.success}</p>
                    {importResult.failed > 0 && (
                      <p className="text-red-700">✗ Failed: {importResult.failed}</p>
                    )}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-3 max-h-40 overflow-y-auto">
                      <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
                      <ul className="text-xs text-red-600 space-y-1">
                        {importResult.errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportResult(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Month Selector Component
function MonthSelector({ selectedMonth, onSelect }: { selectedMonth: number; onSelect: (month: number) => void }) {
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

// Desktop Table Row Component
function DemandRow({
  demand,
  index,
  userRole,
  onToggleCredit,
  onDelete,
  isToggling,
  isDeleting,
}: {
  demand: MonthlyDemand;
  index: number;
  userRole: string;
  onToggleCredit: (d: MonthlyDemand) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-400 text-xs">{index}</td>
      <td className="px-4 py-3 font-mono text-xs text-gray-700">{demand.jobCardNumber}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{demand.headName}</td>
      <td className="px-4 py-3 text-gray-700">{demand.daysWorked}</td>
      <td className="px-4 py-3 font-semibold text-gray-800">{formatAmount(demand.wageAmount)}</td>
      <td className="px-4 py-3">
        {userRole === 'computer_assistant' ? (
          <button
            onClick={() => onToggleCredit(demand)}
            disabled={isToggling}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold min-h-[32px] disabled:opacity-50 disabled:cursor-not-allowed ${
              demand.creditStatus === 'Credited'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            {isToggling ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : demand.creditStatus === 'Credited' ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {isToggling ? 'Updating...' : demand.creditStatus}
          </button>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              demand.creditStatus === 'Credited'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {demand.creditStatus === 'Credited' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {demand.creditStatus}
          </span>
        )}
      </td>
      {userRole === 'computer_assistant' && (
        <td className="px-4 py-3">
          <button
            onClick={() => onDelete(demand.id)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </button>
        </td>
      )}
    </tr>
  );
}

// Mobile Card Component
function DemandCard({
  demand,
  index,
  userRole,
  onToggleCredit,
  onDelete,
  isToggling,
  isDeleting,
}: {
  demand: MonthlyDemand;
  index: number;
  userRole: string;
  onToggleCredit: (d: MonthlyDemand) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-400 font-mono">#{index} • {demand.jobCardNumber}</p>
          <h4 className="text-sm font-semibold text-gray-900 mt-1">{demand.headName}</h4>
          <p className="text-sm font-bold text-gray-800 mt-1">{formatAmount(demand.wageAmount)}</p>
        </div>
        {userRole === 'computer_assistant' ? (
          <button
            onClick={() => onToggleCredit(demand)}
            disabled={isToggling}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
              demand.creditStatus === 'Credited'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            {isToggling ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : demand.creditStatus === 'Credited' ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {isToggling ? 'Updating...' : demand.creditStatus}
          </button>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              demand.creditStatus === 'Credited'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {demand.creditStatus === 'Credited' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {demand.creditStatus}
          </span>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium min-h-[32px]"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Details
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Days Worked:</span>
            <span className="font-medium text-gray-700">{demand.daysWorked}</span>
          </div>

          {userRole === 'computer_assistant' && (
            <button
              onClick={() => onDelete(demand.id)}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 rounded-lg py-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3" />
                  Remove from list
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
