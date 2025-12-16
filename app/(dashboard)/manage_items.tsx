import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import { useController } from '../../src/controllers/AppController';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Item {
  id: string;
  code: string;
  name: string;
  qty: number;
  minStock: number;
  unit: string;
}

export default function ManageItemsScreen() {
  // Ambil deleteItem dari controller
  const { items, theme, updateItem, addItem, deleteItem } = useController(); 
  const typedItems = (items || []) as Item[];
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({ code: '', name: '', unit: '', minStock: '' });

  const openAdd = () => {
    setMode('ADD');
    setForm({ code: '', name: '', unit: 'Kg', minStock: '10' });
    setModalVisible(true);
  };

  const openEdit = (item: Item) => {
    setMode('EDIT');
    setSelectedId(item.id);
    setForm({ 
      code: item.code, 
      name: item.name, 
      unit: item.unit, 
      minStock: item.minStock.toString() 
    });
    setModalVisible(true);
  };

  // FUNGSI KONFIRMASI HAPUS
  const handleDelete = (item: Item) => {
    Alert.alert(
        "Hapus Barang",
        `Yakin ingin menghapus "${item.name}"? Data yang sudah dihapus tidak bisa dikembalikan.`,
        [
            { text: "Batal", style: "cancel" },
            { 
                text: "Hapus", 
                style: "destructive", // Warna merah di iOS
                onPress: () => deleteItem(item.id) 
            }
        ]
    );
  };

  const handleSave = () => {
    if (mode === 'ADD') {
      addItem(form, () => setModalVisible(false));
    } else {
      if (selectedId) {
        updateItem(selectedId, form.code, form.name, () => setModalVisible(false));
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Atur Barang</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={typedItems}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }: { item: Item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Bagian Kiri (Klik untuk Edit) */}
            <TouchableOpacity 
                style={{ flex: 1 }} 
                onPress={() => openEdit(item)}
            >
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{item.code}</Text>
              <Text style={{ color: theme.text, fontSize: 16 }}>{item.name}</Text>
              <Text style={{ color: 'gray', fontSize: 12 }}>
                Min. Stok: {item.minStock} {item.unit}
              </Text>
            </TouchableOpacity>

            {/* Bagian Kanan (Tombol Aksi) */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Tombol Edit */}
                <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 15 }}>
                    <Ionicons name="create-outline" size={22} color={theme.primary} />
                </TouchableOpacity>

                {/* Tombol Hapus (BARU) */}
                <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={22} color="#D32F2F" />
                </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={openAdd}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL (Sama seperti sebelumnya) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text, marginBottom: 15 }]}>
              {mode === 'ADD' ? 'Tambah Barang Baru' : 'Edit Barang'}
            </Text>
            
            <Text style={{color: theme.text, marginBottom: 5}}>Kode Barang</Text>
            <TextInput 
              placeholder="Cth: K001" 
              value={form.code} 
              onChangeText={t => setForm({...form, code: t})}
              style={[styles.input, { color: theme.text, borderColor: 'gray' }]}
            />
            
            <Text style={{color: theme.text, marginBottom: 5}}>Nama Barang</Text>
            <TextInput 
              placeholder="Cth: Arabika Gayo" 
              value={form.name} 
              onChangeText={t => setForm({...form, name: t})}
              style={[styles.input, { color: theme.text, borderColor: 'gray' }]}
            />

            {mode === 'ADD' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={{color: theme.text, marginBottom: 5}}>Satuan</Text>
                  <TextInput 
                    placeholder="Cth: Kg" 
                    value={form.unit} 
                    onChangeText={t => setForm({...form, unit: t})}
                    style={[styles.input, { color: theme.text, borderColor: 'gray' }]}
                  />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={{color: theme.text, marginBottom: 5}}>Min. Stok</Text>
                  <TextInput 
                    placeholder="10" 
                    keyboardType="numeric"
                    value={form.minStock} 
                    onChangeText={t => setForm({...form, minStock: t})}
                    style={[styles.input, { color: theme.text, borderColor: 'gray' }]}
                  />
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10, marginRight: 10 }}>
                <Text style={{ color: 'gray' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={{ backgroundColor: theme.primary, padding: 10, borderRadius: 5 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {mode === 'ADD' ? 'Buat Barang' : 'Simpan Perubahan'}
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
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold' },
  // Card layout diubah jadi row
  card: { padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { padding: 20, borderRadius: 10, elevation: 5 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  fab: {
    position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  }
});