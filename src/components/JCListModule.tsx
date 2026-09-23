import { useState, useEffect } from 'react';
import { Plus, Search, FileText, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { JobCard, JCRequest } from '../types';
import { fetchJobCards, addJobCard, updateJobCardStatus, deleteJobCard } from '../lib/services';

interface JCListModuleProps {
  village: string;
  userRole: string;
}

export default function JCListModule({ village, userRole }: JCListModuleProps) {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    setLoading(false);
  }

  async function handleAddJC(e: React.FormEvent) {
    e.preventDefault();
    if (!newJC.jobCardNumber || !newJC.headName) return;

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
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    const success = await updateJobCardStatus(id, !currentStatus);
    if (success) {
      setJobCards(prev => prev.map(jc => 
        jc.id === id ? { ...jc, isActive: !currentStatus } : jc
      ));
    }
  }

  async function handleDeleteJC(id: string) {
    console.log('[JCList] Delete button clicked for:', id);
    
    if (!confirm('Are you sure you want to delete this job card? This action cannot be undone.')) {
      console.log('[JCList] Delete cancelled by user');
      return;
    }
    
    console.log('[JCList] Calling deleteJobCard...');
    const success = await deleteJobCard(id);
    console.log('[JCList] Delete result:', success);
    
    if (success) {
      console.log('[JCList] Removing from local state...');
      setJobCards(prev => prev.filter(jc => jc.id !== id));
      console.log('[JCList] Job card deleted successfully');
    } else {
      console.error('[JCList] Failed to delete job card');
      alert('Failed to delete job card. Please check the console for details.');
    }
  }

  const filtered = jobCards.filter(jc =>
    jc.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    jc.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium min-h-[44px] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add JC
          </button>
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
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium min-h-[44px]">
              Add to List
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium min-h-[44px]">
              Cancel
            </button>
          </div>
        </form>
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
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                        jc.isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title="Click to toggle status"
                    >
                      {jc.isActive ? (
                        <><CheckCircle2 className="w-3 h-3" /> Active</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Inactive</>
                      )}
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
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete job card"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
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
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                    jc.isActive 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {jc.isActive ? (
                    <><CheckCircle2 className="w-3 h-3" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Inactive</>
                  )}
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
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
    </div>
  );
}
