// src/models/DataModel.js

export const initialUsers = [
  { id: '1', username: 'owner', password: '123', role: 'owner', name: 'Pak Ketua' },
  { id: '2', username: 'budi', password: '123', role: 'karyawan', name: 'Budi Santoso' },
];

export const initialItems = [
  { id: '1', code: 'KOPI-R-01', name: 'Robusta Grade A', qty: 500, minStock: 100, unit: 'Kg' },
  { id: '2', code: 'KOPI-A-01', name: 'Arabica Full Wash', qty: 40, minStock: 50, unit: 'Kg' },
  { id: '3', code: 'KOPI-L-99', name: 'Liberica Dark', qty: 15, minStock: 20, unit: 'Kg' }, // Stok tipis
];

// Fungsi Logika Bisnis: Cek Login
export const validateLogin = (users, username, password) => {
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return { success: true, data: user };
  }
  return { success: false, msg: "Username atau Password salah!" };
};

export const validateTransaction = (item, type, qtyInput) => {
  const qty = parseInt(qtyInput);

  // 1. Cek apakah input angka valid
  if (isNaN(qty) || qty <= 0) {
    return { success: false, msg: "Jumlah harus angka lebih dari 0!" };
  }

  // 2. Cek jika Barang Keluar (OUT), stok cukup gak?
  if (type === 'OUT' && item.qty < qty) {
    return { success: false, msg: `Stok tidak cukup! Sisa hanya ${item.qty} ${item.unit}` };
  }

  return { success: true, qty: qty };
};