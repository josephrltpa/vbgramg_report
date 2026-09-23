import { useState } from 'react';
import { FinancialRecord, ProcessingStage, CreditStatus } from '../types';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface FinancialMobileCardProps {
  record: FinancialRecord;
  onStatusToggle: (id: string, field: 'creditStatus' | 'processingStage', value: string) => void;
}

const stageColors: Record<ProcessingStage, string> = {
  'Generated': 'bg-gray-100 text-gray-700 border-gray-200',
  'FTO Signed': 'bg-blue-100 text-blue-700 border-blue-200',
  'Processed': 'bg-purple-100 text-purple-700 border-purple-200',
  'Credited': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const stageProgress: Record<ProcessingStage, number> = {
  'Generated': 25,
  'FTO Signed': 50,
  'Processed': 75,
  'Credited': 100,
};

export default function FinancialMobileCard({ record, onStatusToggle }: FinancialMobileCardProps) {
  const [expanded, setExpanded] = useState(false);

  const cycleCreditStatus = () => {
    const statuses: CreditStatus[] = ['Pending', 'Credited'];
    const currentIdx = statuses.indexOf(record.creditStatus);
    const next = statuses[(currentIdx + 1) % statuses.length];
    onStatusToggle(record.id, 'creditStatus', next);
  };

  const cycleStage = () => {
    const stages: ProcessingStage[] = ['Generated', 'FTO Signed', 'Processed', 'Credited'];
    const currentIdx = stages.indexOf(record.processingStage);
    const next = stages[(currentIdx + 1) % stages.length];
    onStatusToggle(record.id, 'processingStage', next);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-400 mb-0.5">{record.demandId}</p>
            <h3 className="text-sm font-semibold text-gray-900 truncate">{record.workName}</h3>
            <p className="text-base font-bold text-gray-800 mt-1">{formatAmount(record.amountCredited)}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); cycleCreditStatus(); }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border min-h-[32px] active:scale-95 transition-transform ${
                record.creditStatus === 'Credited'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              {record.creditStatus}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Stage</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${stageColors[record.processingStage]}`}>
              {record.processingStage}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${stageProgress[record.processingStage]}%` }}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50">
          <div className="space-y-3 mt-3">
            {record.creditDate && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Credit Date</span>
                <span className="text-xs font-medium text-gray-700">{record.creditDate}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 block mb-2">Processing Stage (tap to advance)</span>
              <button
                onClick={cycleStage}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold border min-h-[44px] active:scale-[0.98] transition-transform ${stageColors[record.processingStage]}`}
              >
                {record.processingStage} → {
                  record.processingStage === 'Generated' ? 'FTO Signed' :
                  record.processingStage === 'FTO Signed' ? 'Processed' :
                  record.processingStage === 'Processed' ? 'Credited' : 'Generated'
                }
              </button>
            </div>
            {record.attachmentLink && (
              <div className="pt-2 border-t border-gray-100">
                <a
                  href={record.attachmentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-indigo-600 font-medium min-h-[44px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Wagelist / Bill
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
