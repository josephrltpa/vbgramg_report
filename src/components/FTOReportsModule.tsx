import { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, Search, Download } from 'lucide-react';
import { FTOReport } from '../types';
import { fetchFTOReports, deleteFTOReport, deleteAllFTOReports } from '../lib/services';
import { parseExcelFile, importFTOReports, ImportResult } from '../lib/excelImport';

interface FTOReportsModuleProps {
  village: string;
  userRole: string;
}

export default function FTOReportsModule({ village, userRole }: FTOReportsModuleProps) {
  const [reports, setReports] = useState<FTOReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    loadReports();
  }, [village, selectedMonth, selectedYear]);

  async function loadReports() {
    setLoading(true);
    const data = await fetchFTOReports(village, selectedMonth, selectedYear);
    setReports(data);
    setLoading(false);
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (userRole === 'computer_assistant' && !village) {
      alert('Please select a village first before importing FTO reports.');
      e.target.value = '';
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const data = await parseExcelFile(file);
      const result = await importFTOReports(data, village, selectedMonth, selectedYear, file.name);
      setImportResult(result);
      
      if (result.success > 0) {
        await loadReports();
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
      e.target.value = '';
    }
  }

  async function handleDeleteAll() {
    setDeletingAll(true);
    const success = await deleteAllFTOReports(village, selectedMonth, selectedYear);
    if (success) {
      setReports([]);
      setShowDeleteAllConfirm(false);
    }
    setDeletingAll(false);
  }

  const filtered = reports
    .filter(r =>
      r.jobCardNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.jobCardNo.localeCompare(b.jobCardNo));

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading FTO reports...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">FTO Reports</h3>
          <p className="text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              📍 {village || 'All Villages'}
            </span>
            {' '}• {reports.length} records
          </p>
        </div>
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
                  Import Report
                </>
              )}
            </button>
            {reports.length > 0 && (
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

      {/* Month/Year Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Month</label>
          <div className="flex overflow-x-auto whitespace-nowrap gap-1.5 pb-1 scrollbar-hide snap-x">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthName, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMonth(idx + 1)}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold min-h-[40px] min-w-[50px] snap-start transition-all ${
                  selectedMonth === idx + 1
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {monthName}
              </button>
            ))}
          </div>
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

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by JC number, name, status, or bank..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Job Card No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applicant Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Processed Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bank Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((report, idx) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{report.jobCardNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{report.applicantName}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{formatAmount(report.amountToBeCredited)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      report.status.toLowerCase().includes('credit') || report.status.toLowerCase().includes('paid')
                        ? 'bg-emerald-100 text-emerald-700'
                        : report.status.toLowerCase().includes('pending') || report.status.toLowerCase().includes('process')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatDate(report.processedDate)}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{report.bankName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((report, idx) => (
          <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-gray-400 font-mono">#{idx + 1}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{report.jobCardNo}</p>
                <h4 className="text-sm font-semibold text-gray-900 mt-1">{report.applicantName}</h4>
                <p className="text-sm font-bold text-gray-800 mt-1">{formatAmount(report.amountToBeCredited)}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                report.status.toLowerCase().includes('credit') || report.status.toLowerCase().includes('paid')
                  ? 'bg-emerald-100 text-emerald-700'
                  : report.status.toLowerCase().includes('pending') || report.status.toLowerCase().includes('process')
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {report.status || '-'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Processed Date:</span>
                <span className="font-medium text-gray-700">{formatDate(report.processedDate)}</span>
              </div>
              {report.bankName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Name:</span>
                  <span className="font-medium text-gray-700">{report.bankName}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No FTO reports found</p>
          {userRole === 'computer_assistant' && (
            <p className="text-xs text-gray-400 mt-1">Click "Import Report" to get started</p>
          )}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import FTO Report from Excel</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Excel Format Requirements:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <strong>Job Card No</strong> (or Job Card Number, JC Number)</li>
                  <li>• <strong>Applicant Name</strong> (or Name)</li>
                  <li>• <strong>Amount to be credited</strong> (or Amount)</li>
                  <li>• <strong>Status</strong></li>
                  <li>• <strong>Processed Date</strong></li>
                  <li>• <strong>Paid in account of (in case of ABP)</strong> → will be shown as "Bank Name"</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2">
                  All reports will be added to: <strong>{village}</strong> for <strong>{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth - 1]} {selectedYear}</strong>
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  disabled={importing}
                  className="hidden"
                  id="fto-excel-import"
                />
                <label
                  htmlFor="fto-excel-import"
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

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete All FTO Reports</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>all {reports.length} FTO reports</strong> for <strong>{village}</strong> for <strong>{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth - 1]} {selectedYear}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-700">
                ⚠️ This action cannot be undone. All FTO reports for this village and month will be permanently deleted.
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
                    Deleting...
                  </>
                ) : (
                  'Delete All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
