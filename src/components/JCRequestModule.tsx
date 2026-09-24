import { useState, useEffect } from 'react';
import { Plus, MessageSquare, CheckCircle, XCircle, Clock, MessageCircle, Send, Trash2 } from 'lucide-react';
import { JCRequest, RequestType, RequestStatus } from '../types';
import { fetchJCRequests, addJCRequest, updateJCRequest, addJobCard, fetchRequestComments, addRequestComment, deleteJCRequest, RequestComment } from '../lib/services';
import { supabase } from '../lib/supabase';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'Submitted' | 'Completed' | 'Rejected'>('all');
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
  
  // Filter requests by status
  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);
    
  const statusCounts = {
    all: requests.length,
    Submitted: requests.filter(r => r.status === 'Submitted').length,
    Completed: requests.filter(r => r.status === 'Completed').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

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
        await addJobCard({
          jobCardNumber: request.jobCardNumber,
          headName: request.headName,
          village: request.village,
          isActive: true,
        });
      }
      // If "Delete JC" request, mark the card as inactive
      if (request && request.requestType === 'Delete JC') {
        await supabase
          .from('job_cards')
          .update({ is_active: false })
          .eq('job_card_number', request.jobCardNumber)
          .eq('village', request.village);
      }
    }
    
    await loadRequests();
  }

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteRequest(id: string) {
    setDeleting(true);
    const success = await deleteJCRequest(id);
    if (success) {
      setDeleteConfirm(null);
      await loadRequests();
    }
    setDeleting(false);
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

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'Submitted', 'Completed', 'Rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Requests List - Compact */}
      <div className="space-y-2">
        {filteredRequests.map((req) => {
          const StatusIcon = statusIcons[req.status];
          return (
            <CompactRequestCard
              key={req.id}
              request={req}
              userRole={userRole}
              username={username}
              onAction={handleCAAction}
              onDelete={handleDeleteRequest}
              isDeleting={deleting && deleteConfirm === req.id}
            />
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this request and all its comments? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRequest(deleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
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

      {filteredRequests.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {statusFilter === 'all' ? 'No requests yet' : `No ${statusFilter.toLowerCase()} requests`}
          </p>
          {userRole === 'secretary' && statusFilter === 'all' && (
            <p className="text-xs text-gray-400 mt-1">Click "New Request" to submit one</p>
          )}
        </div>
      )}
    </div>
  );
}

// Compact Request Card
function CompactRequestCard({ 
  request: req, 
  userRole, 
  username, 
  onAction,
  onDelete,
  isDeleting 
}: { 
  request: JCRequest; 
  userRole: string; 
  username: string; 
  onAction: (id: string, status: RequestStatus, feedback: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const StatusIcon = statusIcons[req.status];

  // Load comments when expanded
  useEffect(() => {
    if (expanded && comments.length === 0) {
      loadComments();
    }
  }, [expanded]);

  async function loadComments() {
    setLoadingComments(true);
    const data = await fetchRequestComments(req.id);
    setComments(data);
    setLoadingComments(false);
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    
    const result = await addRequestComment(req.id, newComment, username, userRole);
    if (result) {
      setComments(prev => [...prev, {
        id: result.id,
        requestId: result.request_id,
        commentText: result.comment_text,
        commentBy: result.comment_by,
        commentRole: result.comment_role,
        createdAt: result.created_at,
      }]);
      setNewComment('');
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      {/* Compact Header - Always Visible */}
      <div className="flex items-center gap-3 p-3">
        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[req.status]}`}>
          <StatusIcon className="w-3 h-3" />
          <span className="hidden sm:inline">{req.status}</span>
        </span>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{req.headName}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              req.requestType === 'Add New JC' ? 'bg-green-100 text-green-700' :
              req.requestType === 'Delete JC' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {req.requestType === 'Add New JC' ? '+' : req.requestType === 'Delete JC' ? '-' : '~'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-mono">{req.jobCardNumber}</span>
            <span>•</span>
            <span>{req.requestDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {userRole === 'computer_assistant' && (
            <button
              onClick={() => {
                if (window.confirm('Delete this request and all its comments?')) {
                  onDelete(req.id);
                }
              }}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
              title="Delete request"
            >
              {isDeleting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-3">
          {req.remarks && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Remarks:</p>
              <p className="text-sm text-gray-700">{req.remarks}</p>
            </div>
          )}
          {req.feedback && (
            <div className="bg-emerald-50 rounded p-2 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium">
                <MessageSquare className="w-3 h-3 inline" /> {req.processedBy}:
              </p>
              <p className="text-sm text-emerald-800 mt-1">{req.feedback}</p>
              {req.actionDate && <p className="text-xs text-emerald-500 mt-1">{req.actionDate}</p>}
            </div>
          )}

          {/* Comments Thread */}
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Discussion ({comments.length})
            </p>
            
            {loadingComments ? (
              <p className="text-xs text-gray-400">Loading comments...</p>
            ) : (
              <div className="space-y-2 mb-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`rounded p-2 ${
                        comment.commentRole === 'computer_assistant'
                          ? 'bg-blue-50 border border-blue-100'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {comment.commentBy}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          comment.commentRole === 'computer_assistant'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {comment.commentRole === 'computer_assistant' ? 'CA' : 'VEC'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.commentText}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CA Actions */}
      {userRole === 'computer_assistant' && req.status === 'Submitted' && (
        <div className="border-t border-gray-100 p-3">
          <CAActionPanel requestId={req.id} onAction={onAction} />
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
    <div>
      {!showInput ? (
        <div className="flex gap-2">
          <button
            onClick={() => { setShowInput(true); setSelectedStatus('Completed'); }}
            className="flex-1 bg-emerald-600 text-white py-1.5 rounded text-xs font-medium"
          >
            ✓ Complete
          </button>
          <button
            onClick={() => { setShowInput(true); setSelectedStatus('Rejected'); }}
            className="flex-1 bg-red-600 text-white py-1.5 rounded text-xs font-medium"
          >
            ✗ Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add feedback..."
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none min-h-[50px]"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onAction(requestId, selectedStatus, feedback)}
              className={`flex-1 py-1.5 rounded text-xs font-medium text-white ${
                selectedStatus === 'Completed' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              Submit
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-2 bg-gray-200 text-gray-700 py-1.5 rounded text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
