import { IndianRupee, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface SummaryWidgetProps {
  totalDemands: number;
  totalAmount: number;
  creditedAmount: number;
  pendingAmount: number;
}

export default function SummaryWidget({ totalDemands, totalAmount, creditedAmount, pendingAmount }: SummaryWidgetProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-indigo-600 font-medium">Demands</span>
        </div>
        <p className="text-xl font-bold text-indigo-900">{totalDemands}</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-emerald-600 font-medium">Credited</span>
        </div>
        <p className="text-lg font-bold text-emerald-900">{formatAmount(creditedAmount)}</p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-amber-600 font-medium">Pending</span>
        </div>
        <p className="text-lg font-bold text-amber-900">{formatAmount(pendingAmount)}</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-purple-600 font-medium">Total</span>
        </div>
        <p className="text-lg font-bold text-purple-900">{formatAmount(totalAmount)}</p>
      </div>
    </div>
  );
}
