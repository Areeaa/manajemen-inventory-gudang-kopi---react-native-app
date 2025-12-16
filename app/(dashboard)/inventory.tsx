import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useController } from '../../src/controllers/AppController';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Item {
  id: string;
  code: string;
  name: string;
  qty: number;
  minStock: number;
  unit: string;
}

export default function InventoryScreen() {
  const { items, theme, handleTransaction } = useController();
  const typedItems = (items || []) as Item[]; 
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const [transType, setTransType] = useState<'IN' | 'OUT'>('IN');
  const [qtyInput, setQtyInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  // STATE BARU: STATUS RUSAK
  const [isWaste, setIsWaste] = useState(false);

  const openModal = (item: Item, type: 'IN' | 'OUT') => {
    setSelectedItem(item);
    setTransType(type);
    setQtyInput('');
    setLocationInput('');
    setIsWaste(false); // Reset ke normal setiap buka modal
    setModalVisible(true);
  };

  const submitTransaction = () => {
    if (!selectedItem) {
        Alert.alert("Error", "Tidak ada barang yang dipilih");
        return;
    }

    // MODIFIKASI: Jika Rusak, tambahkan tag [RUSAK] di depan catatan
    let finalLocation = locationInput;
    if (transType === 'OUT' && isWaste) {
        finalLocation = `[RUSAK] ${locationInput}`;
    }

    handleTransaction(selectedItem.id, transType, qtyInput, finalLocation, () => {
      setModalVisible(false);
      setSelectedItem(null);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Stok Gudang</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={typedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }: { item: Item }) => {
            return (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{item.code}</Text>
                  <Text style={{ fontSize: 16, color: theme.text, fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ color: item.qty < item.minStock ? theme.danger : 'gray', marginTop: 5 }}>
                    Stok: {item.qty} {item.unit} {item.qty < item.minStock && "(LOW!)"}
                  </Text>
                </View>
                
                <View style={{ justifyContent: 'space-around' }}>
                  <TouchableOpacity 
                    style={[styles.btnAction, { backgroundColor: '#4CAF50', marginBottom: 5 }]}
                    onPress={() => openModal(item, 'IN')}
                  >
                    <Text style={styles.btnText}>MASUK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btnAction, { backgroundColor: theme.danger }]}
                    onPress={() => openModal(item, 'OUT')}
                  >
                    <Text style={styles.btnText}>KELUAR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
        }}
      />

      {/* MODAL INPUT */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {transType === 'IN' ? 'Barang Masuk' : 'Barang Keluar'}
            </Text>
            
            <Text style={{ color: 'gray', marginBottom: 15 }}>{selectedItem?.name || '-'}</Text>

            {/* TOGGLE KHUSUS BARANG KELUAR */}
            {transType === 'OUT' && (
                <View style={{ flexDirection: 'row', marginBottom: 15, backgroundColor: theme.bg, borderRadius: 8, padding: 2 }}>
                    <TouchableOpacity 
                        onPress={() => setIsWaste(false)}
                        style={{ flex: 1, padding: 8, borderRadius: 6, backgroundColor: !isWaste ? theme.primary : 'transparent', alignItems: 'center' }}
                    >
                        <Text style={{ color: !isWaste ? '#fff' : 'gray', fontWeight: 'bold' }}>Penjualan Normal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setIsWaste(true)}
                        style={{ flex: 1, padding: 8, borderRadius: 6, backgroundColor: isWaste ? '#FF9800' : 'transparent', alignItems: 'center' }}
                    >
                        <Text style={{ color: isWaste ? '#fff' : 'gray', fontWeight: 'bold' }}>Lapor Rusak ⚠️</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={{ color: theme.text, marginBottom: 5 }}>Jumlah ({selectedItem?.unit})</Text>
            <TextInput 
              placeholder="0"
              placeholderTextColor="gray"
              keyboardType="numeric"
              style={[styles.input, { color: theme.text, borderColor: 'gray' }]}
              value={qtyInput}
              onChangeText={setQtyInput}
            />

            {/* LABEL BERUBAH SESUAI KONDISI */}
            <Text style={{ color: theme.text, marginBottom: 5, marginTop: 10 }}>
                {transType === 'IN' 
                    ? 'Dari Siapa? (Supplier)' 
                    : (isWaste ? 'Penyebab Kerusakan (Wajib Isi)' : 'Tujuan / Pembeli')
                }
            </Text>
            <TextInput 
              placeholder={
                  transType === 'IN' ? "Cth: Petani Budi" 
                  : (isWaste ? "Cth: Busuk / Dimakan Tikus" : "Cth: Cafe Cabang A")
              }
              placeholderTextColor="gray"
              style={[styles.input, { color: theme.text, borderColor: 'gray' }]}
              value={locationInput}
              onChangeText={setLocationInput}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10, marginRight: 10 }}>
                <Text style={{ color: 'gray' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={submitTransaction} 
                style={{ backgroundColor: isWaste ? '#FF9800' : theme.primary, padding: 10, borderRadius: 5 }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {isWaste ? 'Lapor Rusak' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { flexDirection: 'row', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  btnAction: { paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5 },
  btnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { padding: 20, borderRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  input: { borderWidth: 1, borderRadius: 5, padding: 10 }
});