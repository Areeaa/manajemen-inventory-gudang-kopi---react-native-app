import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import { useController } from '../../src/controllers/AppController';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 1. DEFINISI TIPE DATA USER (Agar TypeScript Kenal)
interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: string;
}

export default function ManageUsersScreen() {
  const { theme, users, addUser } = useController();
  
  // 2. CASTING DATA (Memberitahu TypeScript bahwa 'users' adalah sekumpulan 'User')
  const typedUsers = (users || []) as User[];

  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });

  // 3. FILTER DATA (Sekarang 'u' sudah dikenali sebagai User, error hilang)
  const employeeList = typedUsers.filter(u => u.role !== 'owner');

  const handleAdd = () => {
    addUser(form, () => {
      setModalVisible(false);
      setForm({ name: '', username: '', password: '' }); 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Kelola Karyawan</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List Karyawan */}
      <FlatList
        data={employeeList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="people-outline" size={50} color="gray" />
            <Text style={{ color: 'gray', marginTop: 10 }}>Belum ada karyawan.</Text>
          </View>
        }
        // 4. DEFINISI TIPE DI RENDER ITEM
        renderItem={({ item }: { item: User }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                <Text style={{ color: 'gray' }}>Username: {item.username}</Text>
                <Text style={{ color: theme.primary, fontSize: 12 }}>Password: {item.password}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* FAB (Tombol Tambah) */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal Tambah Karyawan */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text, marginBottom: 15 }]}>Tambah Karyawan Baru</Text>

            <Text style={{ color: theme.text, marginBottom: 5 }}>Nama Lengkap</Text>
            <TextInput 
              placeholder="Cth: Budi Santoso"
              placeholderTextColor="gray"
              style={[styles.input, { color: theme.text, borderColor: 'gray' }]} 
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />

            <Text style={{ color: theme.text, marginBottom: 5 }}>Username (untuk Login)</Text>
            <TextInput 
              placeholder="Cth: budi"
              placeholderTextColor="gray"
              style={[styles.input, { color: theme.text, borderColor: 'gray' }]} 
              value={form.username}
              autoCapitalize="none"
              onChangeText={(t) => setForm({ ...form, username: t })}
            />

            <Text style={{ color: theme.text, marginBottom: 5 }}>Password</Text>
            <TextInput 
              placeholder="***"
              placeholderTextColor="gray"
              style={[styles.input, { color: theme.text, borderColor: 'gray' }]} 
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10, marginRight: 10 }}>
                <Text style={{ color: 'gray' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: theme.primary, padding: 10, borderRadius: 5 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Simpan</Text>
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
  card: { padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { padding: 20, borderRadius: 10, elevation: 5 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8
  }
});