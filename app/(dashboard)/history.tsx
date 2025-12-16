import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useController } from '../../src/controllers/AppController';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HistoryLog {
  id: string;
  date: string;
  type: 'IN' | 'OUT' | 'DELETE';
  itemName: string;
  qty: number;
  unit: string;
  actor: string;
  location?: string;
}

export default function HistoryScreen() {
  const { history, theme, clearHistory, user } = useController(); 
  const router = useRouter();

  const logs = (history || []) as HistoryLog[];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            Riwayat Transaksi
        </Text>

        <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
            {user?.role === 'owner' && (
                <TouchableOpacity onPress={() => clearHistory()} style={styles.iconBtn}>
                    <Ionicons name="trash-bin-outline" size={24} color={theme.danger} />
                </TouchableOpacity>
            )}
        </View>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="time-outline" size={50} color="gray" />
                <Text style={{ textAlign: 'center', marginTop: 10, color: 'gray' }}>
                    Belum ada riwayat transaksi.
                </Text>
            </View>
        }
        renderItem={({ item }) => {
          const isIn = item.type === 'IN';
          const isDelete = item.type === 'DELETE';
          
          // CEK APAKAH BARANG RUSAK? (Ada tag [RUSAK] di lokasi)
          const isWaste = item.location?.includes('[RUSAK]');

          let iconName: any = "arrow-up";
          let iconColor = "#D32F2F"; 
          let bgColor = "#FFEBEE";   
          
          if (isIn) {
            iconName = "arrow-down";
            iconColor = "#4CAF50"; 
            bgColor = "#E8F5E9";
          } else if (isDelete) {
            iconName = "trash";    
            iconColor = "#B00020"; 
            bgColor = "#FCE4EC";   
          } else if (isWaste) {
            // TAMPILAN KHUSUS BARANG RUSAK (Oranye)
            iconName = "warning";
            iconColor = "#FF9800"; // Oranye
            bgColor = "#FFF3E0";
          }

          return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                    <Ionicons name={iconName} size={24} color={iconColor} />
                </View>

                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: isDelete ? iconColor : theme.text }}>
                        {item.itemName} {isDelete && "(DIHAPUS)"}
                        {isWaste && <Text style={{ color: '#FF9800' }}> (RUSAK)</Text>}
                    </Text>
                    
                    <Text style={{ color: theme.text, fontSize: 13, marginTop: 2 }}>
                        {isDelete 
                          ? <Text style={{ color: '#B00020', fontWeight: 'bold' }}>DATA DIHAPUS PERMANEN</Text> 
                          : <>
                              {isIn ? 'Dari: ' : (isWaste ? 'Penyebab: ' : 'Ke: ')} 
                              <Text style={{ fontWeight: isWaste ? 'bold' : 'normal', color: isWaste ? theme.danger : theme.text }}>
                                  {/* Hapus tag [RUSAK] biar teksnya bersih saat ditampilkan */}
                                  {item.location?.replace('[RUSAK] ', '') || '-'}
                              </Text>
                            </>
                        }
                    </Text>

                    <Text style={{ color: 'gray', fontSize: 11, marginTop: 4 }}>
                        {item.date} • Oleh: {item.actor}
                    </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ 
                        fontSize: 18, 
                        fontWeight: 'bold', 
                        color: iconColor 
                    }}>
                        {isDelete ? 'X' : (isIn ? '+' : '-')}{item.qty}
                    </Text>
                    <Text style={{ color: 'gray', fontSize: 12 }}>{item.unit}</Text>
                </View>
            </View>
          );
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 15,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10
  },
  headerSide: { width: 40 },
  title: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  iconBtn: { padding: 5 },
  card: { flexDirection: 'row', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1, alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});