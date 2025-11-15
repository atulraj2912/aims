'use client';

import { InventoryItem } from '@/types';
import StockCard from './StockCard';
import { Virtuoso } from 'react-virtuoso';

interface VirtualInventoryTableProps {
  inventory: InventoryItem[];
  onStockUpdate: () => void;
}

export default function VirtualInventoryTable({ inventory, onStockUpdate }: VirtualInventoryTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Table Header */}
      <table className="w-full table-fixed">
        <thead className="bg-gradient-to-r from-[#9A3F3F] to-[#7D3333] text-white sticky top-0 z-10">
          <tr>
            <th className="w-[25%] px-6 py-4 text-left text-sm font-semibold">Product</th>
            <th className="w-[12%] px-6 py-4 text-left text-sm font-semibold">SKU</th>
            <th className="w-[13%] px-6 py-4 text-center text-sm font-semibold">Current Stock</th>
            <th className="w-[13%] px-6 py-4 text-center text-sm font-semibold">Optimal</th>
            <th className="w-[17%] px-6 py-4 text-center text-sm font-semibold">Status</th>
            <th className="w-[20%] px-6 py-4 text-center text-sm font-semibold">Actions</th>
          </tr>
        </thead>
      </table>

      {/* Virtual Scrolling List */}
      <Virtuoso
        style={{ height: '600px' }}
        totalCount={inventory.length}
        itemContent={(index) => {
          const item = inventory[index];
          return (
            <table className="w-full table-fixed">
              <tbody>
                <StockCard 
                  item={item}
                  onStockUpdate={onStockUpdate}
                />
              </tbody>
            </table>
          );
        }}
      />

      {/* Footer with count */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold">{inventory.length}</span> items
        </div>
        <div className="text-xs">
          ⚡ Virtual scrolling enabled - rendering only visible items
        </div>
      </div>
    </div>
  );
}
