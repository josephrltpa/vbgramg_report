import { useState, useEffect } from 'react';
import { Plus, Search, FileText, CheckCircle2 } from 'lucide-react';
import { JobCard, JCRequest } from '../types';
import { fetchJobCards, addJobCard } from '../lib/services';

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

  useEffect(() => {
    loadJobCards();
  }, [village]);

  async function loadJobCards() {
    setLoading(true);
    console.log('[JCList] Loading job cards for village:', village);
    const data = await fetchJobCards(village);
    console.log('[JCList] Received data:', data.length, 'cards');
    setJobCards(data);
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

  const filtered = jobCards.filter(jc =>
    jc.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    jc.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading job cards...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Job Card List</h3>
          <p className="text-xs text-gray-500">{village} • {jobCards.length} cards</p>
        </div>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((jc, idx) => (
              <tr key={jc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{jc.jobCardNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{jc.headName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((jc, idx) => (
          <div key={jc.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-mono">#{idx + 1} • {jc.jobCardNumber}</p>
                <h4 className="text-sm font-semibold text-gray-900 mt-1">{jc.headName}</h4>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No job cards found</p>
        </div>
      )}
    </div>
  );
}
