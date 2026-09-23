import { useState } from 'react';
import { JobCardRecord, ApprovalStatus, OfficeAction } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface JobCardMobileCardProps {
  record: JobCardRecord;
  onStatusToggle: (id: string, field: 'approvalStatus' | 'officeAction', value: string) => void;
}

const approvalColors: Record<ApprovalStatus, string> = {
  'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Not Approved': 'bg-red-100 text-red-700 border-red-200',
  'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
};

const officeColors: Record<OfficeAction, string> = {
  'Added to Portal': 'bg-blue-100 text-blue-700 border-blue-200',
  'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
};

export default function JobCardMobileCard({ record, onStatusToggle }: JobCardMobileCardProps) {
  const [expanded, setExpanded] = useState(false);

  const cycleApproval = () => {
    const statuses: ApprovalStatus[] = ['Pending', 'Approved', 'Not Approved'];
    const currentIdx = statuses.indexOf(record.approvalStatus);
    const next = statuses[(currentIdx + 1) % statuses.length];
    onStatusToggle(record.id, 'approvalStatus', next);
  };

  const cycleOffice = () => {
    const statuses: OfficeAction[] = ['Pending', 'Added to Portal', 'Rejected'];
    const currentIdx = statuses.indexOf(record.officeAction);
    const next = statuses[(currentIdx + 1) % statuses.length];
    onStatusToggle(record.id, 'officeAction', next);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header - always visible */}
      <div className="p-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">#{record.slNo}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                record.remarks === 'Add New' ? 'bg-green-50 text-green-700 border-green-200' :
                record.remarks === 'Delete' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {record.remarks}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 truncate">{record.headName}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{record.jobCardNumber}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); cycleApproval(); }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border min-h-[32px] active:scale-95 transition-transform ${approvalColors[record.approvalStatus]}`}
            >
              {record.approvalStatus}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50">
          <div className="space-y-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Request Date</span>
              <span className="text-xs font-medium text-gray-700">{record.requestDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Village</span>
              <span className="text-xs font-medium text-gray-700">{record.village}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 block mb-2">Office Action (tap to toggle)</span>
              <button
                onClick={cycleOffice}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold border min-h-[44px] active:scale-[0.98] transition-transform ${officeColors[record.officeAction]}`}
              >
                {record.officeAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
