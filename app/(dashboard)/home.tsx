import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useController } from "../../src/controllers/AppController";

// 1. DEFINISIKAN TIPE DATA (INTERFACE)
// Ini memberi tahu TypeScript bentuk data item kopi kita
interface Item {
  id: string;
  code: string;
  name: string;
  qty: number;
  minStock: number;
  unit: string;
}

export default function HomeScreen() {
  const { user, items, logout, isDark, toggleTheme, theme, isTablet } = useController();

  // 2. TERAPKAN TIPE DATA PADA FUNGSI STATISTIK
  // Tambahkan ': number' pada acc, dan ': Item' pada curr/i
  const totalStok = items.reduce((acc: number, curr: Item) => acc + curr.qty, 0);
  const lowStock = items.filter((i: Item) => i.qty < i.minStock).length;

  const gridWidth = isTablet ? "48%" : "100%";

  return (
    // ... (Sisa kode ke bawah sama persis, tidak perlu diubah)
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ... kode UI Anda ... */}

      {/* BANTUAN: Jika Anda malas scroll, copy paste kode UI dari response sebelumnya ke sini */}
      {/* Bagian bawah ini hanya contoh penempatan, pastikan kode UI Sprint 2 Anda tetap ada */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        {/* ... Header Content ... */}
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>Halo, {user?.name}</Text>
          <Text style={{ color: theme.primary, fontWeight: "bold" }}>{user?.role?.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ padding: 20 }}>
        {lowStock > 0 && (
          <View style={styles.alertBox}>
            <Ionicons name="warning" size={20} color="#D32F2F" />
            <Text style={{ color: "#D32F2F", marginLeft: 10 }}>Peringatan: {lowStock} item stok menipis!</Text>
          </View>
        )}

        <View style={styles.gridContainer}>
          <View style={[styles.card, { backgroundColor: theme.card, width: gridWidth }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{items.length}</Text>
            <Text style={{ color: "gray" }}>Jenis Kopi</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card, width: gridWidth }]}>
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>{totalStok}</Text>
            <Text style={{ color: "gray" }}>Total Stok (Kg)</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Menu Utama</Text>

        <TouchableOpacity style={[styles.menuBtn, { backgroundColor: theme.primary }]} onPress={() => router.push("/(dashboard)/inventory")}>
          <Ionicons name="cube-outline" size={24} color="#fff" />
          <Text style={styles.menuText}>Cek Stok & Transaksi</Text>
        </TouchableOpacity>

        {user?.role === "owner" && (
          <>
            <TouchableOpacity style={[styles.menuBtn, { backgroundColor: "#FF9800" }]} onPress={() => router.push("/(dashboard)/manage_items")}>
              <Ionicons name="barcode-outline" size={24} color="#fff" />
              <Text style={styles.menuText}>Atur Kode Barang</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuBtn, { backgroundColor: "#2196F3" }]} onPress={() => router.push("/(dashboard)/add_user")}>
              <Ionicons name="people-outline" size={24} color="#fff" />
              <Text style={styles.menuText}>Kelola Karyawan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuBtn, { backgroundColor: "#607D8B" }]} // Warna Abu-abu metalik
              onPress={() => router.push("/(dashboard)/history")}
            >
              <Ionicons name="time-outline" size={24} color="#fff" />
              <Text style={styles.menuText}>Riwayat Keluar/Masuk</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 2 },
  greeting: { fontSize: 18, fontWeight: "bold" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  card: { padding: 20, borderRadius: 10, alignItems: "center", marginBottom: 10, elevation: 2 },
  statNumber: { fontSize: 32, fontWeight: "bold" },
  alertBox: { flexDirection: "row", backgroundColor: "#FFEBEE", padding: 15, borderRadius: 8, marginBottom: 20, alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  menuBtn: { flexDirection: "row", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 10, elevation: 2 },
  menuText: { color: "#fff", fontWeight: "bold", marginLeft: 15, fontSize: 16 },
});
