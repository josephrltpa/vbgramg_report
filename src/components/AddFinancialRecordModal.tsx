import { useState } from 'react';
import { X, Calendar, Link2, IndianRupee, FileText } from 'lucide-react';
import { ProcessingStage, CreditStatus, MONTHS } from '../types';

interface AddFinancialRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    demandId: string;
    workName: string;
    amountCredited: number;
    creditStatus: CreditStatus;
    creditDate: string;
    attachmentLink: string;
    processingStage: ProcessingStage;
    month: number;
    village: string;
  }) => void;
  villages: string[];
}

export default function AddFinancialRecordModal({ isOpen, onClose, onSubmit, villages }: AddFinancialRecordModalProps) {
  const [form, setForm] = useState({
    demandId: '',
    workName: '',
    amountCredited: 0,
    creditStatus: 'Pending' as CreditStatus,
    creditDate: '',
    attachmentLink: '',
    processingStage: 'Generated' as ProcessingStage,
    month: new Date().getMonth() + 1,
    village: villages[0] || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.demandId || !form.workName) return;
    onSubmit(form);
    setForm({
      demandId: '',
      workName: '',
      amountCredited: 0,
      creditStatus: 'Pending',
      creditDate: '',
      attachmentLink: '',
      processingStage: 'Generated',
      month: new Date().getMonth() + 1,
      village: villages[0] || '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">New Financial Record</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Demand ID *</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <FileText className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.demandId}
                onChange={(e) => setForm({ ...form, demandId: e.target.value })}
                placeholder="e.g. DM-RAM-FY24-04-001"
                className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Work Name *</label>
            <input
              type="text"
              value={form.workName}
              onChange={(e) => setForm({ ...form, workName: e.target.value })}
              placeholder="e.g. Road Construction - Village Link"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Amount (₹)</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <IndianRupee className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={form.amountCredited || ''}
                onChange={(e) => setForm({ ...form, amountCredited: Number(e.target.value) })}
                placeholder="0"
                className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Credit Status</label>
              <select
                value={form.creditStatus}
                onChange={(e) => setForm({ ...form, creditStatus: e.target.value as CreditStatus })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px]"
              >
                <option value="Pending">Pending</option>
                <option value="Credited">Credited</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Stage</label>
              <select
                value={form.processingStage}
                onChange={(e) => setForm({ ...form, processingStage: e.target.value as ProcessingStage })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px]"
              >
                <option value="Generated">Generated</option>
                <option value="FTO Signed">FTO Signed</option>
                <option value="Processed">Processed</option>
                <option value="Credited">Credited</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Credit Date</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={form.creditDate}
                onChange={(e) => setForm({ ...form, creditDate: e.target.value })}
                className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Attachment Link (Drive/Cloud)</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <Link2 className="w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={form.attachmentLink}
                onChange={(e) => setForm({ ...form, attachmentLink: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px]"
              >
                {MONTHS.map((m) => (
                  <option key={m.index} value={m.index}>{m.fullLabel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Village</label>
              <select
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px]"
              >
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl min-h-[48px] active:scale-[0.98] transition-transform shadow-lg shadow-indigo-200"
          >
            Add Record
          </button>
        </form>
      </div>
    </div>
  );
}
