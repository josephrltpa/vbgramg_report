import { MapPin, ChevronDown } from 'lucide-react';
import { Village } from '../types';

interface VillageSelectorProps {
  villages: Village[];
  selectedVillage: string;
  onSelect: (village: string) => void;
}

export default function VillageSelector({ villages, selectedVillage, onSelect }: VillageSelectorProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
        <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
        <select
          value={selectedVillage}
          onChange={(e) => onSelect(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium text-gray-800 appearance-none outline-none cursor-pointer min-h-[44px]"
        >
          <option value="all">All Villages</option>
          {villages.map((v) => (
            <option key={v.id} value={v.name}>
              {v.name} ({v.block})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </div>
    </div>
  );
}
