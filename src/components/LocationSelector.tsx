import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { District, Block, Village } from '../types';
import { fetchDistricts, fetchBlocks, fetchVillages } from '../lib/services';

interface LocationSelectorProps {
  selectedDistrict: string;
  selectedBlock: string;
  selectedVillage: string;
  onDistrictChange: (districtId: string) => void;
  onBlockChange: (blockId: string) => void;
  onVillageChange: (villageName: string) => void;
}

export default function LocationSelector({
  selectedDistrict,
  selectedBlock,
  selectedVillage,
  onDistrictChange,
  onBlockChange,
  onVillageChange,
}: LocationSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);

  // Load districts on mount
  useEffect(() => {
    loadDistricts();
  }, []);

  // Load blocks when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadBlocks(selectedDistrict);
    } else {
      setBlocks([]);
    }
    // Reset block and village when district changes
    onBlockChange('');
    onVillageChange('');
    setVillages([]);
  }, [selectedDistrict]);

  // Load villages when block changes
  useEffect(() => {
    if (selectedBlock) {
      loadVillages(selectedBlock);
    } else {
      setVillages([]);
    }
    // Reset village when block changes
    onVillageChange('');
  }, [selectedBlock]);

  async function loadDistricts() {
    setLoading(true);
    const data = await fetchDistricts();
    setDistricts(data);
    setLoading(false);
  }

  async function loadBlocks(districtId: string) {
    setLoading(true);
    const data = await fetchBlocks(districtId);
    setBlocks(data);
    setLoading(false);
  }

  async function loadVillages(blockId: string) {
    setLoading(true);
    const data = await fetchVillages(blockId);
    setVillages(data);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      {/* District Selector */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">District</label>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-gray-800 appearance-none outline-none cursor-pointer min-h-[28px]"
            disabled={loading}
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Block Selector */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Block</label>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
          <select
            value={selectedBlock}
            onChange={(e) => onBlockChange(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-gray-800 appearance-none outline-none cursor-pointer min-h-[28px]"
            disabled={!selectedDistrict || loading}
          >
            <option value="">Select Block</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Village Selector */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Village</label>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
          <select
            value={selectedVillage}
            onChange={(e) => onVillageChange(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-gray-800 appearance-none outline-none cursor-pointer min-h-[28px]"
            disabled={!selectedBlock || loading}
          >
            <option value="">Select Village</option>
            {villages.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
