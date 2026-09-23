import { useState } from 'react';
import { X, Calendar, FileText, User } from 'lucide-react';
import { RequestType, ApprovalStatus, OfficeAction } from '../types';

interface AddJobCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    jobCardNumber: string;
    headName: string;
    remarks: RequestType;
    requestDate: string;
    approvalStatus: ApprovalStatus;
    officeAction: OfficeAction;
    village: string;
  }) => void;
  villages: string[];
}

export default function AddJobCardModal({ isOpen, onClose, onSubmit, villages }: AddJobCardModalProps) {
  const [form, setForm] = useState({
    jobCardNumber: '',
    headName: '',
    remarks: 'Add New' as RequestType,
    requestDate: new Date().toISOString().split('T')[0],
    approvalStatus: 'Pending' as ApprovalStatus,
    officeAction: 'Pending' as OfficeAction,
    village: villages[0] || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jobCardNumber || !form.headName) return;
    onSubmit(form);
    setForm({
      jobCardNumber: '',
      headName: '',
      remarks: 'Add New',
      requestDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'Pending',
      officeAction: 'Pending',
      village: villages[0] || '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">New JC Request</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Job Card Number *</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <FileText className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.jobCardNumber}
                onChange={(e) => setForm({ ...form, jobCardNumber: e.target.value })}
                placeholder="e.g. RAM/2024/0001"
                className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Head / Worker Name *</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <User className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.headName}
                onChange={(e) => setForm({ ...form, headName: e.target.value })}
                placeholder="Full name"
                className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Request Type</label>
            <select
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value as RequestType })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none min-h-[44px]"
            >
              <option value="Add New">Add New</option>
              <option value="Delete">Delete</option>
              <option value="Correction">Correction</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Request Date</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={form.requestDate}
                onChange={(e) => setForm({ ...form, requestDate: e.target.value })}
                className="flex-1 text-sm outline-none bg-transparent min-h-[28px]"
              />
            </div>
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

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl min-h-[48px] active:scale-[0.98] transition-transform shadow-lg shadow-indigo-200"
          >
            Add Request
          </button>
        </form>
      </div>
    </div>
  );
}
