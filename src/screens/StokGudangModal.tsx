import React, { useState } from 'react';
import { Ingredient } from '../types';

interface StokGudangModalProps {
  ingredients: Ingredient[];
  onUpdateStock: (id: string, newStockKg: number, newPrice: number) => void;
  onClose: () => void;
}

export const StokGudangModal: React.FC<StokGudangModalProps> = ({
  ingredients,
  onUpdateStock,
  onClose
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const startEdit = (ing: Ingredient) => {
    setEditingId(ing.id);
    setTempStock(ing.inStockKg);
    setTempPrice(ing.currentPrice);
  };

  const saveEdit = (id: string) => {
    onUpdateStock(id, tempStock, tempPrice);
    setEditingId(null);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006e2f] text-[24px]">inventory_2</span>
            <div>
              <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Gudang &amp; Stok Bahan</h3>
              <p className="text-[11px] text-[#6d7b6c]">Kelola ketersediaan bahan pakan kandang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Total Stock Summary */}
        <div className="p-3 bg-[#eff4ff] rounded-[16px] border border-[#e6eeff] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6d7b6c]">Total Persediaan Pakan</span>
            <div className="text-[18px] font-bold text-[#121c2a]">
              {ingredients.reduce((acc, i) => acc + i.inStockKg, 0).toLocaleString('id-ID')} kg
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-[#006e2f] rounded-full text-[11px] font-bold">
            Cukup ± 7 Hari
          </span>
        </div>

        {/* List of Ingredients */}
        <div className="flex flex-col gap-2.5">
          {ingredients.map((ing) => {
            const isEditing = editingId === ing.id;
            return (
              <div
                key={ing.id}
                className="p-3 bg-white rounded-[16px] border border-[#e5e7eb] shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-[12px] bg-[#7cf994]/30 text-[#006e2f] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">{ing.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#121c2a]">{ing.name}</h4>
                      <p className="text-[11px] text-[#6d7b6c]">Rp {ing.currentPrice.toLocaleString('id-ID')} /kg</p>
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[14px] font-bold text-[#121c2a]">{ing.inStockKg.toLocaleString('id-ID')}</span>
                        <span className="text-[10px] text-[#6d7b6c] ml-1">kg</span>
                      </div>
                      <button
                        onClick={() => startEdit(ing)}
                        className="w-7 h-7 rounded-full bg-[#eff4ff] text-[#006e2f] flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => saveEdit(ing.id)}
                      className="px-3 py-1 rounded-full bg-[#22c55e] text-white text-[11px] font-bold shadow-xs"
                    >
                      Simpan
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <label className="text-[10px] text-[#6d7b6c] font-semibold">Stok Baru (kg)</label>
                      <input
                        type="number"
                        value={tempStock}
                        onChange={(e) => setTempStock(Number(e.target.value) || 0)}
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] text-[12px] font-bold text-[#121c2a] border border-[#e6eeff]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6d7b6c] font-semibold">Harga Baru (Rp/kg)</label>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(Number(e.target.value) || 0)}
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] text-[12px] font-bold text-[#121c2a] border border-[#e6eeff]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#006e2f] text-white font-bold text-[13px] shadow-sm hover:bg-[#004b1e]"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
