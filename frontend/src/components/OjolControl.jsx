import React from 'react';
import { useStore } from '../store/useStore';

const OjolControl = () => {
  const { isOjolActive, toggleOjol, ojolStockLimit, setOjolLimit } = useStore();

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 mb-6">
      <div className="flex items-center gap-3 border-r pr-6 border-slate-100">
        <div 
          onClick={toggleOjol}
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${isOjolActive ? 'bg-orange-500' : 'bg-slate-300'}`}
        >
          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${isOjolActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Status Ojol</p>
          <p className={`text-[11px] font-bold ${isOjolActive ? 'text-orange-500' : 'text-slate-400'}`}>
            {isOjolActive ? 'ONLINE RECEIVING' : 'OFFLINE MODE'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Kuota Online</p>
          <p className="text-[11px] font-bold text-slate">SISA: <span className="text-orange-500 font-black">{ojolStockLimit}</span></p>
        </div>
        <input 
          type="number" 
          className="w-14 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none"
          value={ojolStockLimit}
          onChange={(e) => setOjolLimit(parseInt(e.target.value) || 0)}
        />
      </div>
      <i className="bi bi-info-circle text-slate-200 text-sm ml-auto"></i>
    </div>
  );
};

export default OjolControl;