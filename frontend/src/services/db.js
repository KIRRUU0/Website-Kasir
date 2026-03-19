import Dexie from 'dexie';

export const db = new Dexie('KasirOfflineDB');

// Skema untuk menyimpan transaksi saat internet mati
db.version(1).stores({
  pendingTransactions: '++id, product_id, qty, customer_name, type, status, createdAt'
});

export const saveOfflineTransaction = async (data) => {
  return await db.pendingTransactions.add({
    ...data,
    status: 'PENDING_SYNC',
    createdAt: new Date()
  });
};