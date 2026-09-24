import { useState, useEffect } from 'react';
import { Plus, Search, FileText, CheckCircle2, XCircle, Trash2, Upload } from 'lucide-react';
import { JobCard, JCRequest } from '../types';
import { fetchJobCards, addJobCard, updateJobCardStatus, deleteJobCard, deleteAllJobCards } from '../lib/services';
import { parseExcelFile, importJobCards, ImportResult } from '../lib/excelImport';

interface JCListModuleProps {
  village: string;
  userRole: string;
}

export default function JCListModule({ village, userRole }: JCListModuleProps) {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJC, setNewJC] = useState({ jobCardNumber: '', headName: '' });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(200);

  useEffect(() => {
    loadJobCards();
  }, [village]);

  async function loadJobCards() {
    setLoading(true);
    console.log('[JCList] Loading job cards for village:', village);
    const data = await fetchJobCards(village);
    console.log('[JCList] Received data:', data.length, 'cards');
    
    // Sort by job card number
    const sorted = data.sort((a, b) => {
      return a.jobCardNumber.localeCompare(b.jobCardNumber);
    });
    
    setJobCards(sorted);
    setCurrentPage(1); // Reset to first page
    setStatusFilter('all'); // Reset status filter
    setLoading(false);
  }

  async function handleAddJC(e: React.FormEvent) {
    e.preventDefault();
    if (!newJC.jobCardNumber || !newJC.headName) return;

    setAddingJC(true);
    const result = await addJobCard({
      jobCardNumber: newJC.jobCardNumber,
      headName: newJC.headName,
      village,
      isActive: true,
    });

    if (result) {
      setJobCards(prev => [...prev, {
        id: result.id,
        jobCardNumber: result.job_card_number,
        headName: result.head_name,
        village: result.village,
        createdAt: result.created_at,
        isActive: result.is_active,
      }]);
      setNewJC({ jobCardNumber: '', headName: '' });
      setShowAddForm(false);
    }
    setAddingJC(false);
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    setTogglingStatus(id);
    const success = await updateJobCardStatus(id, !currentStatus);
    if (success) {
      setJobCards(prev => prev.map(jc => 
        jc.id === id ? { ...jc, isActive: !currentStatus } : jc
      ));
    }
    setTogglingStatus(null);
  }

  async function handleDeleteAll() {
    setDeletingAll(true);
    const success = await deleteAllJobCards(village);
    if (success) {
      setJobCards([]);
      setShowDeleteAllConfirm(false);
    }
    setDeletingAll(false);
  }

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [addingJC, setAddingJC] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const data = await parseExcelFile(file);
      const result = await importJobCards(data, village);
      setImportResult(result);
      
      // Reload job cards if any were imported successfully
      if (result.success > 0) {
        await loadJobCards();
      }
    } catch (error: any) {
      setImportResult({
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [`Failed to parse Excel file: ${error.message}`],
      });
    } finally {
      setImporting(false);
      // Reset file input
      e.target.value = '';
    }
  }

  async function handleDeleteJC(id: string) {
    const jc = jobCards.find(j => j.id === id);
    setDeleteConfirm({ id, name: jc?.headName || '' });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    const success = await deleteJobCard(deleteConfirm.id);
    if (success) {
      setJobCards(prev => prev.filter(jc => jc.id !== deleteConfirm.id));
    }
    setDeleteConfirm(null);
    setDeletingId(null);
  }

  const filtered = jobCards.filter(jc => {
    // Search filter
    const matchesSearch = jc.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && jc.isActive) ||
      (statusFilter === 'inactive' && !jc.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const isAllRows = rowsPerPage === 'all';
  const itemsPerPage = isAllRows ? filtered.length : rowsPerPage;
  const totalPages = isAllRows ? 1 : Math.ceil(filtered.length / rowsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCards = filtered.slice(startIndex, endIndex);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading job cards...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Job Card List</h3>
          <p className="text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              📍 {village}
            </span>
            {' '}• {jobCards.length} cards
          </p>
        </div>
        <button
          onClick={loadJobCards}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium min-h-[40px]"
        >
          🔄 Reload
        </button>
        {userRole === 'computer_assistant' && (
          <div className="flex gap-2 flex-wrap">
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
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium min-h-[44px] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add JC
            </button>
            {jobCards.length > 0 && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                disabled={deletingAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium min-h-[44px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddJC} className="bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100">
          <div className="bg-white rounded-lg px-3 py-2 border border-indigo-200">
            <p className="text-xs text-gray-500">Adding to village:</p>
            <p className="text-sm font-semibold text-indigo-700">{village}</p>
          </div>
          <input
            type="text"
            value={newJC.jobCardNumber}
            onChange={(e) => setNewJC({ ...newJC, jobCardNumber: e.target.value })}
            placeholder="Job Card Number (e.g. RAM/2024/0006)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none min-h-[44px]"
            required
          />
          <input
            type="text"
            value={newJC.headName}
            onChange={(e) => setNewJC({ ...newJC, headName: e.target.value })}
            placeholder="Head / Worker Name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none min-h-[44px]"
            required
          />
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={addingJC}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {addingJC ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add to List'
              )}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} disabled={addingJC} className="px-4 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium min-h-[44px] disabled:opacity-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
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

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-600">Filter:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({jobCards.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Active ({jobCards.filter(jc => jc.isActive).length})
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Inactive ({jobCards.filter(jc => !jc.isActive).length})
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">JC Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              {userRole === 'computer_assistant' && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedCards.map((jc, idx) => (
              <tr key={jc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs">{startIndex + idx + 1}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{jc.jobCardNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{jc.headName}</td>
                <td className="px-4 py-3">
                  {userRole === 'computer_assistant' ? (
                    <button
                      onClick={() => handleToggleStatus(jc.id, jc.isActive)}
                      disabled={togglingStatus === jc.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                        jc.isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title="Click to toggle status"
                    >
                      {togglingStatus === jc.id ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : jc.isActive ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {jc.isActive ? 'Active' : 'Inactive'}
                    </button>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      jc.isActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {jc.isActive ? (
                        <><CheckCircle2 className="w-3 h-3" /> Active</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Inactive</>
                      )}
                    </span>
                  )}
                </td>
                {userRole === 'computer_assistant' && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteJC(jc.id)}
                      disabled={deletingId === jc.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete job card"
                    >
                      {deletingId === jc.id ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      {deletingId === jc.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {paginatedCards.map((jc, idx) => (
          <div key={jc.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-gray-400 font-mono">#{startIndex + idx + 1} • {jc.jobCardNumber}</p>
                <h4 className="text-sm font-semibold text-gray-900 mt-1">{jc.headName}</h4>
              </div>
              {userRole === 'computer_assistant' ? (
                <button
                  onClick={() => handleToggleStatus(jc.id, jc.isActive)}
                  disabled={togglingStatus === jc.id}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    jc.isActive 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {togglingStatus === jc.id ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  ) : jc.isActive ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {jc.isActive ? 'Active' : 'Inactive'}
                </button>
              ) : (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  jc.isActive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {jc.isActive ? (
                    <><CheckCircle2 className="w-3 h-3" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Inactive</>
                  )}
                </span>
              )}
            </div>
            {userRole === 'computer_assistant' && (
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleDeleteJC(jc.id)}
                  disabled={deletingId === jc.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === jc.id ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3" /> Delete
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {isAllRows ? (
                `Showing all ${filtered.length} cards`
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
          <p className="text-sm text-gray-500">No job cards found</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Job Card</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId !== null ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete All Job Cards</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>all {jobCards.length} job cards</strong> for <strong>{village}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-700">
                ⚠️ This action cannot be undone. All job cards for this village will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={deletingAll}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAll ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Deleting All...
                  </>
                ) : (
                  'Delete All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Job Cards from Excel</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Excel Format Requirements:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Column headers: <strong>Job Card Number</strong> (or JC Number) and <strong>Head Name</strong> (or Name)</li>
                  <li>• All job cards will be added to village: <strong>{village}</strong></li>
                  <li>• Duplicate job card numbers will be rejected</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  disabled={importing}
                  className="hidden"
                  id="excel-import"
                />
                <label
                  htmlFor="excel-import"
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
                    {importResult.skipped > 0 && (
                      <p className="text-blue-700">⊘ Skipped (marked with *): {importResult.skipped}</p>
                    )}
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
