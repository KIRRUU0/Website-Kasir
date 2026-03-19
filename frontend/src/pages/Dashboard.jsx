import React, { useState, useEffect } from 'react';
import ProductSearch from '../components/ProductSearch';
import OjolControl from '../components/OjolControl';
import ProductDetailModal from '../components/ProductDetailModal'; 
import { useStore } from '../store/useStore';
import { allProducts, categories } from '../data/products';
import { saveOfflineTransaction } from '../services/db';
import { checkout } from '../services/api';

const Dashboard = () => {
  // --- STATE LAYER ---
  const { 
    isStoreOpen, toggleStore, isOjolActive, ojolStockLimit, setOjolLimit,
    cart, addToCart, removeFromCart, updateQuantity, updateNotes, clearCart, 
    orderType, setOrderType 
  } = useStore();
  
  const [customerName, setCustomerName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItemModal, setActiveItemModal] = useState(null);

  // --- LOGIC: CALCULATIONS ---
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const filteredProducts = allProducts.filter((p) => {
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // --- LOGIC: HANDLERS ---
  const handlePayment = async () => {
    if (orderType === 'online' && (!isOjolActive || ojolStockLimit <= 0)) {
      return alert("Peringatan: Penjualan Online Sedang Tutup!");
    }
    if (!customerName) return alert("Harap isi Nama Pelanggan / ID Order!");
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    const payload = { items: cart, total: totalPrice, customer_name: customerName, type: orderType };

    try {
      if (!navigator.onLine) throw new Error("Offline");
      await checkout(payload);
      if (orderType === 'online') setOjolLimit(ojolStockLimit - 1);
      alert("Transaksi Berhasil! ✅");
      setCustomerName("");
      clearCart();
    } catch (err) {
      await saveOfflineTransaction(payload);
      alert("Tersimpan secara Lokal (Offline) 💾");
      clearCart();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      
      {/* POP-UP DETAIL (NOTES) */}
      {activeItemModal && (
        <ProductDetailModal 
          item={activeItemModal} 
          onClose={() => setActiveItemModal(null)}
          onSave={(id, notes) => {
            updateNotes(id, notes);
            setActiveItemModal(null);
          }}
        />
      )}

      {/* HEADER NAVBAR */}
      <nav className="bg-slate text-white p-5 flex justify-between items-center shadow-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-mint p-2.5 rounded-2xl rotate-3 shadow-lg">
            <i className="bi bi-shop text-slate text-2xl"></i>
          </div>
          <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">Mint<span className="text-mint text-3xl">POS</span></h1>
        </div>
        <button 
          onClick={toggleStore} 
          className={`px-8 py-3 rounded-2xl text-xs font-black transition-all border-2 
          ${isStoreOpen ? 'bg-mint/10 text-mint border-mint shadow-mint/20' : 'bg-red-500/10 text-red-500 border-red-500'}`}
        >
          {isStoreOpen ? 'TOKO: BUKA' : 'TOKO: TUTUP'}
        </button>
      </nav>

      <main className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 max-w-[1700px] mx-auto w-full">
        
        {/* KOLOM KIRI (KATALOG) */}
        <div className="lg:col-span-8 space-y-6">
          <OjolControl /> 

          <div className="flex flex-col md:flex-row justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <h2 className="text-2xl font-black text-slate italic flex items-center gap-3 underline decoration-mint decoration-4">
              <span className="w-10 h-1.5 bg-mint rounded-full"></span> KATALOG MENU
            </h2>
            <ProductSearch onSearch={(term) => setSearchQuery(term)} />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)} 
                className={`px-8 py-3 rounded-2xl text-xs font-black border-2 transition-all shadow-md
                ${selectedCategory === cat ? 'bg-slate text-mint border-mint scale-105' : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-mint transition-all group relative">
                <div className="h-40 bg-slate-50 rounded-3xl mb-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                   <i className={`bi ${p.icon} text-slate-200 text-6xl group-hover:scale-110 group-hover:text-mint/30 transition-all duration-500`}></i>
                   <div className="absolute top-3 left-3 bg-slate text-white px-3 py-1 rounded-xl text-[10px] font-black italic shadow-lg">
                     STOK: {p.stock}
                   </div>
                </div>
                <h3 className="font-black text-slate-700 text-sm uppercase truncate mb-1">{p.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-mint font-black text-xl italic tracking-tighter">Rp {p.price.toLocaleString()}</p>
                  
                  {/* ICON (+) PADA KATALOG: Warna Putih Terang */}
                  <button 
                    onClick={() => addToCart(p)}
                    className="bg-slate text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-mint hover:text-slate transition-all shadow-xl active:scale-95"
                  >
                    <i className="bi bi-plus-lg text-white text-2xl group-hover:text-slate"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN (CART) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col sticky top-28 h-[calc(100vh-140px)] border border-slate-200">
            
            {/* SWITCHER OFFLINE/OJOL */}
            <div className="bg-slate-100 p-2 rounded-[1.5rem] flex gap-2 mb-8 shadow-inner border border-slate-200">
              <button onClick={() => setOrderType('offline')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black transition-all ${orderType === 'offline' ? 'bg-white text-slate shadow-lg' : 'text-slate-400'}`}>
                <i className="bi bi-people-fill text-lg"></i> PELANGGAN
              </button>
              <button 
                onClick={() => isOjolActive ? setOrderType('online') : alert("Ojol Nonaktif!")}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black transition-all ${orderType === 'online' ? 'bg-white text-orange-500 shadow-lg' : 'text-slate-400'} ${!isOjolActive ? 'opacity-30' : ''}`}
              >
                <i className="bi bi-bicycle text-lg"></i> OJOI.
              </button>
            </div>

            {/* LIST CART ITEM */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-40">
                  <i className="bi bi-cart-x text-7xl mb-4"></i>
                  <p className="text-xs font-black uppercase tracking-widest">Keranjang Kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-5 rounded-3xl border border-transparent hover:border-slate-200 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 mr-4">
                        <p className="text-base font-black text-slate uppercase leading-tight">{item.name}</p>
                        <p className="text-[12px] text-mint font-bold italic mt-1 bg-mint/5 inline-block px-2 py-0.5 rounded-lg truncate max-w-full">
                          {item.notes || "Tanpa catatan..."}
                        </p>
                      </div>
                      
                      {/* ICON PENSIL EDIT: Warna Mint Cerah */}
                      <button 
                        onClick={() => setActiveItemModal(item)} 
                        className="text-mint hover:text-white transition-colors bg-white w-11 h-11 flex items-center justify-center rounded-xl shadow-sm border border-slate-100 hover:bg-mint"
                      >
                        <i className="bi bi-pencil-square text-xl"></i>
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-5">
                      {/* QTY SELECTOR - / + */}
                      <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                          <i className="bi bi-dash-lg text-xl"></i>
                        </button>
                        <span className="px-5 text-sm font-black text-slate">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-mint/10 hover:text-mint rounded-xl transition-all">
                          <i className="bi bi-plus-lg text-xl text-mint"></i>
                        </button>
                      </div>
                      
                      {/* HARGA & ICON TRASH (HAPUS) */}
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black text-slate">Rp {(item.price * item.quantity).toLocaleString()}</p>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                        >
                          <i className="bi bi-trash3-fill text-xl"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* BILL SUMMARY & ACTION (LAYOUT SEJAJAR) */}
            <div className="mt-8 pt-8 border-t-2 border-slate-50 space-y-6">
              <div className="relative">
                <i className={`bi ${orderType === 'offline' ? 'bi-person-fill' : 'bi-bicycle'} absolute left-5 top-5 text-slate-300 text-lg`}></i>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-none rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-mint/20 outline-none transition-all shadow-inner" 
                  placeholder={orderType === 'offline' ? "NAMA PELANGGAN..." : "NOMOR ORDER OJOL..."}
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                />
              </div>

              {/* BARIS SEJAJAR: TOTAL & TOMBOL PROSES */}
              <div className={`p-4 rounded-[2.5rem] transition-all shadow-2xl flex items-center justify-between gap-6 border-2 border-slate-900/10 ${orderType === 'offline' ? 'bg-slate' : 'bg-orange-500'}`}>
                
                {/* GRAND TOTAL (Kiri) */}
                <div className="pl-4">
                  <span className="text-[10px] font-black text-slate-400 opacity-60 uppercase tracking-widest block mb-0.5">Total Bayar</span>
                  <span className="text-2xl font-black italic tracking-tighter text-mint leading-none">Rp {totalPrice.toLocaleString()}</span>
                </div>
                
                {/* TOMBOL PROSES (Kanan) */}
                <button 
                  onClick={handlePayment}
                  disabled={!isStoreOpen || cart.length === 0}
                  className={`py-6 px-10 flex-grow rounded-[2rem] font-black text-lg flex justify-center items-center gap-3 transition-all active:scale-95 shadow-xl
                  ${isStoreOpen && cart.length > 0 
                    ? (orderType === 'offline' ? 'bg-mint text-slate hover:bg-mint/90' : 'bg-orange-600 text-white hover:bg-orange-700') 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  <span>PROSES {orderType.toUpperCase()}</span>
                  <i className="bi bi-arrow-right-circle-fill text-2xl leading-none"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;