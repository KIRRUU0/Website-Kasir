import React, { useState, useEffect } from 'react';

const ProductSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Debounce: Tunggu 500ms setelah user berhenti mengetik
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="relative w-full max-w-xs group">
      <i className="bi bi-search absolute left-3 top-3 text-slate-400 group-focus-within:text-mint transition-colors"></i>
      <input
        type="text"
        className="input-pos" // Menggunakan class dari index.css kita
        placeholder="Cari produk..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default ProductSearch;