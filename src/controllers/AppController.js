import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, useWindowDimensions } from "react-native";
import { initialItems, initialUsers, validateLogin, validateTransaction } from "../models/DataModel";

export const AppContext = createContext();

export const AppController = ({ children }) => {
  // --- STATE ---
  const [users, setUsers] = useState(initialUsers);
  const [items, setItems] = useState(initialItems);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  // --- 1. LOAD DATA (User, Items, History, AND USERS LIST) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // A. Load Session Login
        const savedSession = await AsyncStorage.getItem("user_session");
        if (savedSession) setUser(JSON.parse(savedSession));

        // B. Load Inventory
        const savedItems = await AsyncStorage.getItem("inventory_data");
        if (savedItems) setItems(JSON.parse(savedItems));

        // C. Load History
        const savedHistory = await AsyncStorage.getItem("history_data");
        if (savedHistory) setHistory(JSON.parse(savedHistory));

        // D. LOAD DAFTAR KARYAWAN (INI YANG KEMARIN HILANG)
        const savedUsersList = await AsyncStorage.getItem("users_data");
        if (savedUsersList) {
          console.log("👥 Data Karyawan Ditemukan");
          setUsers(JSON.parse(savedUsersList));
        }
      } catch (e) {
        console.error("Gagal load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- HELPER: SIMPAN DATA KE HP ---
  const saveItemsToStorage = async (newItems) => {
    setItems(newItems);
    await AsyncStorage.setItem("inventory_data", JSON.stringify(newItems));
  };

  const saveHistoryToStorage = async (newHistory) => {
    setHistory(newHistory);
    await AsyncStorage.setItem("history_data", JSON.stringify(newHistory));
  };

  // Simpan Karyawan
  const saveUsersToStorage = async (newUsers) => {
    setUsers(newUsers);
    await AsyncStorage.setItem("users_data", JSON.stringify(newUsers));
  };

  // --- 2. FITUR LOGIN/LOGOUT ---
  const login = async (username, password) => {
    // Validasi menggunakan data 'users' yang terbaru (bisa jadi sudah ada karyawan baru)
    const result = validateLogin(users, username, password);
    if (result.success) {
      setUser(result.data);
      await AsyncStorage.setItem("user_session", JSON.stringify(result.data));
    } else {
      Alert.alert("Gagal Masuk", result.msg);
    }
  };

  const logout = async () => {
    Alert.alert("Konfirmasi", "Keluar aplikasi?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user_session");
          setUser(null);
        },
      },
    ]);
  };

  // --- 3. FITUR TRANSAKSI ---
  const handleTransaction = (itemId, type, qtyInput, locationInput, onSuccess) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const result = validateTransaction(item, type, qtyInput);
    if (!result.success) {
      Alert.alert("Gagal", result.msg);
      return;
    }

    // Tentukan label berdasarkan tipe
    const label = type === "IN" ? "Terima dari" : "Kirim ke";
    // Jika user tidak isi lokasi, kita kasih tanda strip (-)
    const finalLocation = locationInput ? locationInput : "-";

    Alert.alert(
      "Konfirmasi",
      // Tampilkan info lokasi di Alert Konfirmasi juga agar mantap
      `${type === "IN" ? "Masuk" : "Keluar"} ${result.qty} ${item.unit}\n${label}: ${finalLocation}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Simpan",
          onPress: () => {
            // A. Update Stok
            const newItems = items.map((i) => {
              if (i.id === itemId) {
                const newQty = type === "IN" ? i.qty + result.qty : i.qty - result.qty;
                return { ...i, qty: newQty };
              }
              return i;
            });
            saveItemsToStorage(newItems);

            // B. Catat ke History (DENGAN LOKASI)
            const newLog = {
              id: Date.now().toString(),
              date: new Date().toLocaleString(),
              type: type,
              itemName: item.name,
              qty: result.qty,
              unit: item.unit,
              actor: user ? user.name : "Unknown",
              location: finalLocation, // <--- SIMPAN DATA LOKASI DI SINI
            };

            const newHistory = [newLog, ...history];
            saveHistoryToStorage(newHistory);

            Alert.alert("Sukses", "Transaksi berhasil dicatat!");
            if (onSuccess) onSuccess();
          },
        },
      ]
    );
  };

  // --- 4. FITUR OWNER (ADD ITEM & ADD USER) ---

  // A. Tambah Karyawan (SUDAH DIPERBAIKI)
  const addUser = async (newUser, onSuccess) => {
    if (!newUser.username || !newUser.password || !newUser.name) return Alert.alert("Error", "Lengkapi data!");

    // Cek duplikat username
    if (users.find((u) => u.username === newUser.username)) return Alert.alert("Error", "Username terpakai!");

    // Buat data user baru
    const newUserData = { ...newUser, id: Date.now().toString(), role: "karyawan" };

    // Gabungkan dengan user lama
    const updatedUsers = [...users, newUserData];

    // PANGGIL HELPER SIMPAN (Supaya Permanen)
    saveUsersToStorage(updatedUsers);

    Alert.alert("Sukses", "Karyawan ditambahkan");
    if (onSuccess) onSuccess();
  };

  // B. Tambah Barang
  const addItem = (newItemData, onSuccess) => {
    if (!newItemData.code || !newItemData.name || !newItemData.unit || !newItemData.minStock) {
      Alert.alert("Error", "Mohon lengkapi data barang");
      return;
    }
    if (items.find((i) => i.code === newItemData.code)) {
      Alert.alert("Error", "Kode barang sudah terdaftar!");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      qty: 0,
      ...newItemData,
      minStock: parseInt(newItemData.minStock),
    };
    const updatedItems = [...items, newItem];
    saveItemsToStorage(updatedItems);

    Alert.alert("Sukses", "Barang baru berhasil ditambahkan");
    if (onSuccess) onSuccess();
  };

  // C. Update Barang
  const updateItem = (id, newCode, newName, onSuccess) => {
    if (!newCode || !newName) return Alert.alert("Error", "Lengkapi data!");
    const newItems = items.map((i) => (i.id === id ? { ...i, code: newCode, name: newName } : i));
    saveItemsToStorage(newItems);
    Alert.alert("Sukses", "Data diupdate");
    if (onSuccess) onSuccess();
  };


  //  Tema
  const toggleTheme = () => setIsDark(!isDark);
  const theme = {
    bg: isDark ? "#121212" : "#F5F7FA",
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#E0E0E0" : "#333333",
    primary: "#6F4E37",
    danger: "#CF6679",
  };

  const deleteItem = (itemId, onSuccess) => {
    // 1. Cari data barang dulu sebelum dihapus (untuk dicatat)
    const itemToDelete = items.find(i => i.id === itemId);
    
    if (!itemToDelete) return; // Jaga-jaga jika null

    // 2. Hapus dari daftar
    const newItems = items.filter(i => i.id !== itemId);
    saveItemsToStorage(newItems);

    // 3. CATAT KE HISTORY (LOG PENGHAPUSAN)
    const newLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      type: 'DELETE', // Tipe Khusus
      itemName: itemToDelete.name, // Catat nama barang yg dihapus
      qty: itemToDelete.qty,       // Catat sisa stok terakhir saat dihapus
      unit: itemToDelete.unit,
      actor: user ? user.name : 'Unknown',
      location: 'Penghapusan Data Permanen' // Keterangan otomatis
    };
    
    const newHistory = [newLog, ...history];
    saveHistoryToStorage(newHistory);

    Alert.alert("Sukses", "Barang berhasil dihapus dan tercatat di riwayat.");
    if (onSuccess) onSuccess();
  };

  // --- BERSIHKAN SEMUA RIWAYAT ---
  const clearHistory = (onSuccess) => {
    Alert.alert(
      "Hapus Semua Riwayat",
      "Apakah Anda yakin ingin menghapus SELURUH catatan transaksi? Tindakan ini tidak bisa dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus Semua", 
          style: "destructive",
          onPress: () => {
            setHistory([]); // Kosongkan State
            AsyncStorage.removeItem('history_data'); // Hapus dari HP
            Alert.alert("Sukses", "Riwayat telah dikosongkan.");
            if (onSuccess) onSuccess();
          }
        }
      ]
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        items,
        history,
        users,
        login,
        logout,
        isLoading,
        handleTransaction,
        addUser,
        updateItem,
        addItem,
        isDark,
        toggleTheme,
        theme,
        isTablet,
        deleteItem,
        clearHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useController = () => useContext(AppContext);
