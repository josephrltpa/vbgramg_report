import { useState, useEffect } from 'react';
import { Plus, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { JCRequest, RequestType, RequestStatus } from '../types';
import { fetchJCRequests, addJCRequest, updateJCRequest } from '../lib/services';

interface JCRequestModuleProps {
  village: string;
  username: string;
  userRole: string;
}

const statusColors: Record<RequestStatus, string> = {
  'Submitted': 'bg-amber-100 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<RequestStatus, any> = {
  'Submitted': Clock,
  'In Progress': Clock,
  'Completed': CheckCircle,
  'Rejected': XCircle,
};

export default function JCRequestModule({ village, username, userRole }: JCRequestModuleProps) {
  const [requests, setRequests] = useState<JCRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newReq, setNewReq] = useState({
    jobCardNumber: '',
    headName: '',
    requestType: 'Add New JC' as RequestType,
    remarks: '',
  });

  useEffect(() => {
    loadRequests();
  }, [village]);

  async function loadRequests() {
    setLoading(true);
    const data = await fetchJCRequests(village);
    setRequests(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newReq.jobCardNumber || !newReq.headName) return;

    const result = await addJCRequest({
      jobCardNumber: newReq.jobCardNumber,
      headName: newReq.headName,
      village,
      requestType: newReq.requestType,
      remarks: newReq.remarks,
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: username,
    });

    if (result) {
      await loadRequests();
      setNewReq({ jobCardNumber: '', headName: '', requestType: 'Add New JC', remarks: '' });
      setShowForm(false);
    }
  }

  async function handleCAAction(id: string, status: RequestStatus, feedback: string) {
    // First, update the request status
    await updateJCRequest(id, {
      status,
      feedback,
      actionDate: new Date().toISOString().split('T')[0],
      processedBy: username,
    });
    
    // If completed and it's an "Add New JC" request, also add the job card
    if (status === 'Completed') {
      const request = requests.find(r => r.id === id);
      if (request && request.requestType === 'Add New JC') {
        const { addJobCard } = await import('../lib/services');
        await addJobCard({
          jobCardNumber: request.jobCardNumber,
          headName: request.headName,
          village: request.village,
          isActive: true,
        });
      }
      // If "Delete JC" request, mark the card as inactive
      if (request && request.requestType === 'Delete JC') {
        const { supabase } = await import('../lib/supabase');
        await supabase
          .from('job_cards')
          .update({ is_active: false })
          .eq('job_card_number', request.jobCardNumber)
          .eq('village', request.village);
      }
    }
    
    await loadRequests();
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading requests...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">JC Requests & Feedback</h3>
          <p className="text-xs text-gray-500">
            {userRole === 'secretary' ? 'Submit requests for JC changes' : 'Process requests from VEC'}
          </p>
        </div>
        {userRole === 'secretary' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        )}
      </div>

      {/* VEC Request Form */}
      {showForm && userRole === 'secretary' && (
        <form onSubmit={handleSubmit} className="bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100">
          <input
            type="text"
            value={newReq.jobCardNumber}
            onChange={(e) => setNewReq({ ...newReq, jobCardNumber: e.target.value })}
            placeholder="Job Card Number"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none min-h-[44px]"
            required
          />
          <input
            type="text"
            value={newReq.headName}
            onChange={(e) => setNewReq({ ...newReq, headName: e.target.value })}
            placeholder="Worker Name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none min-h-[44px]"
            required
          />
          <select
            value={newReq.requestType}
            onChange={(e) => setNewReq({ ...newReq, requestType: e.target.value as RequestType })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none min-h-[44px]"
          >
            <option value="Add New JC">Add New JC</option>
            <option value="Delete JC">Delete JC</option>
            <option value="Correction">Correction</option>
          </select>
          <textarea
            value={newReq.remarks}
            onChange={(e) => setNewReq({ ...newReq, remarks: e.target.value })}
            placeholder="Remarks / Details (e.g. reason, Aadhar number, etc.)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none min-h-[80px]"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium min-h-[44px]">
              Submit Request
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium min-h-[44px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((req) => {
          const StatusIcon = statusIcons[req.status];
          return (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              {/* Request Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[req.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {req.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      req.requestType === 'Add New JC' ? 'bg-green-50 text-green-700' :
                      req.requestType === 'Delete JC' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {req.requestType}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{req.headName}</h4>
                  <p className="text-xs text-gray-500 font-mono">{req.jobCardNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{req.requestDate}</p>
                  <p className="text-xs text-gray-400">by {req.requestedBy}</p>
                </div>
              </div>

              {/* Remarks */}
              {req.remarks && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Remarks:</p>
                  <p className="text-sm text-gray-700">{req.remarks}</p>
                </div>
              )}

              {/* CA Feedback */}
              {req.feedback && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium mb-1">
                    <MessageSquare className="w-3 h-3 inline" /> Feedback from {req.processedBy}:
                  </p>
                  <p className="text-sm text-emerald-800">{req.feedback}</p>
                  {req.actionDate && <p className="text-xs text-emerald-500 mt-1">Action date: {req.actionDate}</p>}
                </div>
              )}

              {/* CA Actions (only for computer assistant) */}
              {userRole === 'computer_assistant' && req.status !== 'Completed' && req.status !== 'Rejected' && (
                <CAActionPanel
                  requestId={req.id}
                  onAction={handleCAAction}
                />
              )}
            </div>
          );
        })}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No requests yet</p>
          {userRole === 'secretary' && <p className="text-xs text-gray-400 mt-1">Click "New Request" to submit one</p>}
        </div>
      )}
    </div>
  );
}

// CA Action Panel
function CAActionPanel({ requestId, onAction }: { requestId: string; onAction: (id: string, status: RequestStatus, feedback: string) => void }) {
  const [feedback, setFeedback] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>('Completed');

  return (
    <div className="border-t border-gray-100 pt-3">
      {!showInput ? (
        <div className="flex gap-2">
          <button
            onClick={() => { setShowInput(true); setSelectedStatus('Completed'); }}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium min-h-[40px]"
          >
            ✓ Mark Completed
          </button>
          <button
            onClick={() => { setShowInput(true); setSelectedStatus('Rejected'); }}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-medium min-h-[40px]"
          >
            ✗ Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add feedback for VEC (e.g. 'Added to portal', 'Aadhar mismatch - please correct')"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none min-h-[60px]"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onAction(requestId, selectedStatus, feedback)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium min-h-[40px] text-white ${
                selectedStatus === 'Completed' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-3 bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium min-h-[40px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
