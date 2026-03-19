import React, { useState } from 'react';

const ProductDetailModal = ({ item, onClose, onSave }) => {
  const [tempNotes, setTempNotes] = useState(item.notes || "");
  const presets = ["Less Sugar", "Extra Ice", "No Straw", "Pedas Sedang", "Pisah Kuah", "Pake Sambel"];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-2 border-slate-100">
        <div className="p-10 space-y-8">
          
          {/* HEADER MODAL */}
          <div className="flex justify-between items-start gap-6 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[12px] font-black text-mint uppercase tracking-widest">Catatan Kustom</p>
                {/* PENGGANTI STOCKBADGE: Langsung tulis kodenya di sini */}
                <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-lg font-bold">
                  SISA: {item.stock}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate uppercase leading-none">{item.name}</h3>
            </div>
            <button onClick={onClose} className="text-slate-200 hover:text-red-500 transition-colors p-1">
              <i className="bi bi-x-circle-fill text-3xl leading-none"></i>
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-sm font-bold text-slate-500 italic">Pilih Cepat:</p>
            
            <div className="flex flex-wrap gap-3">
              {presets.map(p => (
                <button 
                  key={p} 
                  onClick={() => setTempNotes(prev => prev ? `${prev}, ${p}` : p)}
                  className="px-5 py-2.5 rounded-full border-2 border-slate-100 bg-white text-xs font-bold text-slate-600 hover:bg-mint hover:text-white hover:border-mint transition-all active:scale-95 shadow-sm"
                >
                  + {p}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <label className="text-xs font-black text-slate-500 uppercase mb-3 block tracking-wider">Catatan Khusus (Ketik Manual):</label>
              <textarea 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-base font-medium focus:ring-4 focus:ring-mint/10 focus:border-mint focus:bg-white outline-none min-h-[120px] shadow-inner transition-all"
                placeholder="Contoh: Gak pake seledri, gulanya setengah aja..."
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <button 
            onClick={() => onSave(item.id, tempNotes)}
            className="w-full mt-6 py-6 bg-slate text-mint rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <i className="bi bi-check-circle-fill text-xl"></i>
            SIMPAN DETAIL SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;